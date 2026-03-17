import { describe, expect, it } from "vitest";
import { buildHistoryContext } from "./llm.client.js";

describe("buildHistoryContext", () => {
  it("returns first-round message when history empty", () => {
    expect(buildHistoryContext([])).toContain("第一轮对话");
  });

  it("formats recent turns and caps to last 6", () => {
    const history = Array.from({ length: 8 }).map((_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      text: `t${i}`,
    }));

    const ctx = buildHistoryContext(history);
    expect(ctx).toContain("以下是之前的对话片段");
    expect(ctx).not.toContain("t0");
    expect(ctx).not.toContain("t1");
    expect(ctx).toContain("用户: t2");
    expect(ctx).toContain("客服: t3");
    expect(ctx).toContain("客服: t7");
  });
});

