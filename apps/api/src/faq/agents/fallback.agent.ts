import type { FaqState } from "../state/faq.types.js";

export function fallbackAgent(state: FaqState): FaqState {
  return {
    ...state,
    answer: "目前我还不能完全理解你的问题，已经为你转人工客服，请稍后稍等。",
  };
}

