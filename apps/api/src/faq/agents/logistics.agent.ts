import type { FaqState } from "../state/faq.types.js";
import { buildHistoryContext, callLlmAsText } from "../llm/llm.client.js";

export async function logisticsAgent(state: FaqState): Promise<FaqState> {
  const historyText = buildHistoryContext(state.history);

  const { logisticsInfo } = state;
  const toolSummary =
    logisticsInfo != null
      ? [
          "",
          "",
          "【物流工具返回数据】",
          `订单号: ${logisticsInfo.orderId ?? "未知"}`,
          `承运方: ${logisticsInfo.carrier ?? "未知"}`,
          `运单号: ${logisticsInfo.trackingNumber ?? "未知"}`,
          `物流状态: ${logisticsInfo.status}`,
          `最后位置: ${logisticsInfo.lastLocation ?? "未知"}`,
          `预计送达: ${logisticsInfo.eta ?? "未知"}`,
          "",
        ].join("\n")
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

