import type { FaqState } from "../state/faq.types.js";
import { buildHistoryContext, callLlmAsText } from "../llm/llm.client.js";

export async function routerAgent(state: FaqState): Promise<FaqState> {
  const historyText = buildHistoryContext(state.history);
  const output = await callLlmAsText(
    [
      "你是一个对话路由助手，负责判断当前问题是否适合由 FAQ 机器人继续回答，还是需要转给人工客服。",
      "",
      historyText,
      "",
      "根据历史和当前用户问题，做出一个决策：",
      "- 如果是常见的账单、物流、技术问题，且机器人可以给出有帮助的回答：输出 faq",
      "- 如果问题非常复杂、涉及隐私安全、投诉升级、强烈情绪，或机器人无法安全准确处理：输出 handoff",
      "",
      "只输出一个单词：faq 或 handoff，不要输出其他内容。",
    ].join("\n"),
    state.question,
  );

  const norm = output.toLowerCase().trim();
  const route = norm.includes("handoff") ? "handoff" : "faq";
  return { ...state, route };
}

