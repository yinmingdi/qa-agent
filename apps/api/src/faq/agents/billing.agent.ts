import type { FaqState } from "../state/faq.types.js";
import { buildHistoryContext, callLlmAsText } from "../llm/llm.client.js";

export async function billingAgent(state: FaqState): Promise<FaqState> {
  const historyText = buildHistoryContext(state.history);
  console.log(historyText)
  const toolSummary =
    state.billingInfo != null
      ? `\n\n【账单工具返回数据】\n订单号: ${state.billingInfo.orderId+ ?? "未知"}\n金额: ${
          state.billingInfo.amount != null ? `${state.billingInfo.amount} ${state.billingInfo.currency ?? ""}` : "未知"
        }\n状态: ${state.billingInfo.status}\n最后更新时间: ${state.billingInfo.lastUpdate}\n`
      : "\n\n【账单工具返回数据】当前没有可用数据。\n";

  const answer = await callLlmAsText(
    [
      "你是电商平台的资深客服，专门处理【账单/支付】相关问题。",
      "你会收到一个来自账单工具的结构化数据，请严格基于这些数据进行说明，不要编造不存在的信息。",
      "请用简洁的中文回答用户的问题，语气专业、友好，适当提示可能需要的订单号或支付信息。",
      "回答中不要提到你是 AI 或模型。",
      historyText,
      toolSummary,
    ].join("\n"),
    state.question,
  );

  return { ...state, answer };
}

