import type { FaqState, LogisticsInfo } from "../state/faq.types";
import { extractPossibleOrderId } from "./common.tool";

export function logisticsTool(state: FaqState): FaqState {
  const orderId = extractPossibleOrderId(state.question);
  const info: LogisticsInfo = {
    orderId,
    carrier: orderId ? "顺丰速运" : undefined,
    trackingNumber: orderId ? `SF${orderId}` : undefined,
    status: orderId ? "in_transit" : "unknown",
    lastLocation: orderId ? "杭州转运中心" : undefined,
    eta: orderId ? "预计 1-2 天送达" : undefined,
  };
  return { ...state, logisticsInfo: info };
}

