import { ChatOpenAI } from "@langchain/openai";
import type { ConversationTurn } from "../state/faq.types.js";

const LLM_MODEL = process.env.LLM_MODEL ?? "chatgpt-4o-latest";
const LLM_API_URL = process.env.LLM_API_URL ?? "https://api.laozhang.ai/v1";

export function createBaseLlm() {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    // 这里仍然抛错，让调用方在上层统一处理 500
    // 避免静默失败
    // eslint-disable-next-line no-console
    console.warn("[FAQ Graph] LLM_API_KEY is not set, LLM agents will fail when invoked.");
    throw new Error("LLM_API_KEY is not set");
  }

  return new ChatOpenAI({
    modelName: LLM_MODEL,
    openAIApiKey: apiKey,
    configuration: {
      baseURL: LLM_API_URL,
    },
    temperature: 0.2,
  });
}

export async function callLlmAsText(systemPrompt: string, userContent: string): Promise<string> {
  const baseLlm = createBaseLlm();
  const combined = `${systemPrompt}\n\n用户问题：${userContent}`;
  const resp = await baseLlm.invoke(combined);

  const content = resp.content;
  if (typeof content === "string") return content.trim();

  if (Array.isArray(content)) {
    return content
      .map((c: any) => (typeof c?.text === "string" ? c.text : ""))
      .join("\n")
      .trim();
  }

  return String(content ?? "").trim();
}

export function buildHistoryContext(history: ConversationTurn[]): string {
  if (!history.length) return "（当前是与用户的第一轮对话。）";
  const recent = history.slice(-6);
  const lines = recent.map((t) => `${t.role === "user" ? "用户" : "客服"}: ${t.text}`);
  return ["以下是之前的对话片段（从旧到新）：", ...lines].join("\n");
}

