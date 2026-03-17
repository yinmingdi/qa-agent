import { describe, expect, it } from "vitest";
import { FaqService } from "./faq.service";

describe("FaqService", () => {
  it("chunkAnswer splits by size and preserves order", () => {
    const s = new FaqService();
    const chunks = s.chunkAnswer("abcdefghij", 4);
    expect(chunks).toEqual(["abcd", "efgh", "ij"]);
  });

  it("chunkAnswer returns [text] when empty string", () => {
    const s = new FaqService();
    expect(s.chunkAnswer("", 10)).toEqual([""]);
  });

  it("health returns ok", () => {
    const s = new FaqService();
    expect(s.health()).toEqual({ status: "ok" });
  });
});

