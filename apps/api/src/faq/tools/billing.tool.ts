import type { FaqState, BillingInfo } from "../state/faq.types";
import { extractPossibleOrderId } from "./common.tool";

export function billingTool(state: FaqState): FaqState {
  const orderId = extractPossibleOrderId(state.question);
  const info: BillingInfo = {
    orderId,
    amount: orderId ? 199 : undefined,
    currency: orderId ? "CNY" : undefined,
    status: orderId ? "refunding" : "unknown",
    lastUpdate: new Date().toISOString(),
  };
  return { ...state, billingInfo: info };
}

