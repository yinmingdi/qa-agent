import type { FaqState, FaqCategory } from "../state/faq.types.js";
import { buildHistoryContext, callLlmAsText } from "../llm/llm.client.js";

export async function classifierAgent(state: FaqState): Promise<FaqState> {
  const historyText = buildHistoryContext(state.history);
  const output = await callLlmAsText(
    [
      "你是一个客服问题分类助手。",
      "请根据用户问题，将其严格分类为以下四类之一：",
      "- billing: 账单、价格、支付、退款、发票等相关问题",
      "- logistics: 发货时间、快递进度、收货地址、配送异常等相关问题",
      "- technical: 登录失败、页面报错、功能无法使用、兼容性等技术问题",
      "- other: 其他无法归类到以上三类的问题",
      "",
      historyText,
      "",
      "只输出其中一个单词：billing 或 logistics 或 technical 或 other，禁止输出其它内容。",
    ].join("\n"),
    state.question,
  );

  const normalized = output.toLowerCase().trim();
  let category: FaqCategory = "other";
  if (normalized.includes("billing")) category = "billing";
  else if (normalized.includes("logistics")) category = "logistics";
  else if (normalized.includes("technical")) category = "technical";
  else if (normalized === "other") category = "other";

  return { ...state, category };
}

