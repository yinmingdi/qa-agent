import { describe, expect, it, vi } from "vitest";
import type { FaqState } from "../state/faq.types.js";

vi.mock("../llm/llm.client.js", async () => {
  const actual = await vi.importActual<typeof import("../llm/llm.client.js")>(
    "../llm/llm.client.js",
  );

  return {
    ...actual,
    callLlmAsText: vi.fn(),
  };
});

import { callLlmAsText } from "../llm/llm.client.js";
import { routerAgent } from "./router.agent.js";
import { classifierAgent } from "./classifier.agent.js";
import { fallbackAgent } from "./fallback.agent.js";

function baseState(question: string): FaqState {
  return { question, history: [] };
}

describe("routerAgent", () => {
  it("routes to handoff when model output includes handoff", async () => {
    vi.mocked(callLlmAsText).mockResolvedValueOnce("handoff");
    const out = await routerAgent(baseState("我要投诉"));
    expect(out.route).toBe("handoff");
  });

  it("defaults to faq otherwise", async () => {
    vi.mocked(callLlmAsText).mockResolvedValueOnce("faq");
    const out = await routerAgent(baseState("我想查询订单"));
    expect(out.route).toBe("faq");
  });
});

describe("classifierAgent", () => {
  it("classifies billing/logistics/technical/other using fuzzy includes()", async () => {
    vi.mocked(callLlmAsText).mockResolvedValueOnce("Billing");
    expect((await classifierAgent(baseState("退款"))).category).toBe("billing");

    vi.mocked(callLlmAsText).mockResolvedValueOnce("logistics ");
    expect((await classifierAgent(baseState("快递到哪了"))).category).toBe("logistics");

    vi.mocked(callLlmAsText).mockResolvedValueOnce("TECHNICAL");
    expect((await classifierAgent(baseState("页面报错"))).category).toBe("technical");

    vi.mocked(callLlmAsText).mockResolvedValueOnce("other");
    expect((await classifierAgent(baseState("你好"))).category).toBe("other");
  });
});

describe("fallbackAgent", () => {
  it("returns a stable handoff answer", async () => {
    const out = fallbackAgent(baseState("???"));
    expect(out.answer).toContain("转人工");
  });
});

