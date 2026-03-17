import type { FaqState } from "../state/faq.types.js";
import { buildHistoryContext, callLlmAsText } from "../llm/llm.client.js";

export async function logisticsAgent(state: FaqState): Promise<FaqState> {
  const historyText = buildHistoryContext(state.history);
  const toolSummary =
    state.logisticsInfo != null
      ? `\n\n【物流工具返回数据】\n订单号: ${state.logisticsInfo.orderId ?? "未知"}\n承运方: ${
          state.logisticsInfo.carrier ?? "未知"
        }\n运单号: ${state.logisticsInfo.trackingNumber ?? "未知"}\n物流状态: ${
          state.logisticsInfo.status
        }\n最后位置: ${state.logisticsInfo.lastLocation ?? "未知"}\n预计送达: ${
          state.logisticsInfo.eta ?? "未知"
        }\n`
      : "\n\n【物流工具返回数据】当前没有可用数据。\n";

  const answer = await callLlmAsText(
    [
      "你是电商平台的资深客服，专门处理【物流/配送】相关问题。",
      "你会收到一个来自物流查询工具的结构化数据，请严格基于这些数据进行说明，不要编造不存在的物流节点。",
      "请用简洁的中文回答用户的问题，可以说明常见的发货/运输时效，并提示用户提供订单号以便进一步排查。",
      "回答中不要提到你是 AI 或模型。",
      historyText,
      toolSummary,
    ].join("\n"),
    state.question,
  );

  return { ...state, answer };
}

