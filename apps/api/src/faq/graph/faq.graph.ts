import { StateGraph, END } from "@langchain/langgraph";
import type { ConversationTurn, FaqState } from "../state/faq.types.js";
import { routerAgent, classifierAgent, billingAgent, logisticsAgent, technicalAgent, fallbackAgent } from "../agents/index.js";
import { billingTool } from "../tools/billing.tool.js";
import { logisticsTool } from "../tools/logistics.tool.js";
import { technicalTool } from "../tools/technical.tool.js";

const buildInitialState = (question: string, history: ConversationTurn[]): FaqState => ({
  question,
  history,
});

export function createFaqGraph() {
  const workflow = new StateGraph<FaqState>({
    channels: {
      question: null,
      category: null,
      answer: null,
      route: null,
      history: null,
      billingInfo: null,
      logisticsInfo: null,
      technicalContext: null,
    },
  })
    // 决策 & 分类
    .addNode("router", routerAgent)
    .addNode("classifier", classifierAgent)
    // 工具节点：只负责丰富结构化 state，不直接回答
    .addNode("billingTool", billingTool)
    .addNode("logisticsTool", logisticsTool)
    .addNode("technicalTool", technicalTool)
    // 专家 Agent 节点：真正产出 answer
    .addNode("billing", billingAgent)
    .addNode("logistics", logisticsAgent)
    .addNode("technical", technicalAgent)
    .addNode("fallback", fallbackAgent)
    // 路由：先判断是否需要转人工，再进入分类
    .addConditionalEdges("router", (state) => {
      return state.route === "handoff" ? END : "classifier";
    })
    // 分类后根据类别进入对应工具 / 回退
    .addConditionalEdges("classifier", (state) => {
      switch (state.category) {
        case "billing":
          return "billingTool";
        case "logistics":
          return "logisticsTool";
        case "technical":
          return "technicalTool";
        default:
          return "fallback";
      }
    })
    // 工具 -> 专家
    .addEdge("billingTool", "billing")
    .addEdge("logisticsTool", "logistics")
    .addEdge("technicalTool", "technical")
    // 专家 / 回退 -> 结束
    .addEdge("billing", END)
    .addEdge("logistics", END)
    .addEdge("technical", END)
    .addEdge("fallback", END)
    // 起点
    .addEdge("__start__", "router");

  const app = workflow.compile();

  async function run(question: string, history: ConversationTurn[]): Promise<FaqState> {
    const state = buildInitialState(question, history);
    const result = (await app.invoke(state)) as FaqState;
    return result;
  }

  return { app, run };
}

