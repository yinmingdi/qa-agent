import type { FaqState } from "../state/faq.types.js";
import { buildHistoryContext, callLlmAsText } from "../llm/llm.client.js";

export async function technicalAgent(state: FaqState): Promise<FaqState> {
  const historyText = buildHistoryContext(state.history);
  const toolSummary =
    state.technicalContext != null
      ? `\n\n【技术上下文工具数据】\n平台: ${
          state.technicalContext.platform ?? "unknown"
        }\n最近操作: ${state.technicalContext.lastAction ?? "未知"}\n建议步骤:\n- ${state.technicalContext
          .suggestionSteps.join("\n- ")}\n`
      : "\n\n【技术上下文工具数据】当前没有可用数据。\n";

  const answer = await callLlmAsText(
    [
      "你是电商平台的技术支持工程师，负责解答用户遇到的【技术/系统】问题。",
      "你会收到一个基于用户问题推断出的排查步骤列表，请在回答中合理引用这些步骤，可以按序号列出。",
      "根据用户的描述，给出排查思路和可操作的解决步骤（例如：刷新、清理缓存、尝试不同网络/浏览器、提供报错截图等）。",
      "回答中不要提到你是 AI 或模型。",
      historyText,
      toolSummary,
    ].join("\n"),
    state.question,
  );

  return { ...state, answer };
}

