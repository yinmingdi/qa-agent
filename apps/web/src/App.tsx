import { defineComponent, onMounted, ref } from "vue";

type Message = {
  id: number;
  from: "user" | "bot";
  text: string;
  meta?: string;
};

type SseMetaEvent = {
  event: "meta";
  sessionId?: string | null;
  category?: string;
  route?: string;
};

type SseChunkEvent = {
  event: "chunk";
  text?: string;
};

type SseDoneEvent = {
  event: "done";
};

type SseEvent = SseMetaEvent | SseChunkEvent | SseDoneEvent;

function isSseEvent(value: unknown): value is SseEvent {
  if (typeof value !== "object" || value == null) return false;
  const v = value as Record<string, unknown>;
  return v.event === "meta" || v.event === "chunk" || v.event === "done";
}

const SESSION_STORAGE_KEY = "faq_session_id";

function getInitialSessionId(): string | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
  return stored || null;
}

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export default defineComponent(() => {
  const input = ref("");
  const loading = ref(false);
  const sessionId = ref<string | null>(getInitialSessionId());
  const messages = ref<Message[]>([
    {
      id: 1,
      from: "bot",
      text: "你好，我是多智能体 FAQ 客服助手，可以帮你解答账单、物流、技术等常见问题。",
    },
  ]);
  let idCounter = 2;

  onMounted(() => {
    if (!sessionId.value) {
      const id = createSessionId();
      sessionId.value = id;
      window.localStorage.setItem(SESSION_STORAGE_KEY, id);
    }
  });

  const send = async () => {
    const content = input.value.trim();
    if (!content || loading.value) return;

    messages.value.push({
      id: idCounter++,
      from: "user",
      text: content,
    });
    input.value = "";
    loading.value = true;

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, sessionId: sessionId.value }),
      });
      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      let meta = "（等待回复…）";
      const botMessageId = idCounter++;
      messages.value.push({
        id: botMessageId,
        from: "bot",
        text: "",
        meta,
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let sessionIdFromStream: string | null = null;
      let category: string | undefined;
      let route: string | undefined;
      let fullAnswer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const dataLine = line.trim().replace(/^data:\s*/, "");
          if (!dataLine) continue;
          try {
            const parsed: unknown = JSON.parse(dataLine);
            if (!isSseEvent(parsed)) continue;

            if (parsed.event === "meta") {
              sessionIdFromStream = parsed.sessionId ?? null;
              category = parsed.category;
              route = parsed.route;
              meta =
                category === "billing"
                  ? "（路由到：账单/支付 Agent）"
                  : category === "logistics"
                  ? "（路由到：物流/配送 Agent）"
                  : category === "technical"
                  ? "（路由到：技术支持 Agent）"
                  : route === "handoff"
                  ? "（Router 决策：转人工/兜底 Agent）"
                  : "（Router 决策：其他 FAQ Agent）";
            } else if (parsed.event === "chunk" && parsed.text) {
              fullAnswer += parsed.text;
              const msg = messages.value.find((m) => m.id === botMessageId);
              if (msg) {
                msg.text = fullAnswer;
                msg.meta = meta;
              }
            } else if (parsed.event === "done") {
              // 流结束，最终文案已在上面更新
            }
          } catch {
            // 忽略单条解析失败
          }
        }
      }

      if (sessionIdFromStream && sessionIdFromStream !== sessionId.value) {
        sessionId.value = sessionIdFromStream;
        window.localStorage.setItem(SESSION_STORAGE_KEY, sessionIdFromStream);
      }

      const finalMsg = messages.value.find((m) => m.id === botMessageId);
      if (finalMsg) {
        finalMsg.text = fullAnswer || "抱歉，我暂时无法回答这个问题。";
        finalMsg.meta = meta;
      }
    } catch (e) {
      console.error(e);
      messages.value.push({
        id: idCounter++,
        from: "bot",
        text: "服务暂时不可用，请稍后重试。",
      });
    } finally {
      loading.value = false;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return () => (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top, #f5f7ff 0, #f0f4ff 40%, #e9f0ff 100%)",
        fontFamily:
          "-apple-system,BlinkMacSystemFont,Segoe UI,system-ui,Roboto,sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
          padding: "24px 24px 18px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              多智能体 FAQ 客服 Demo
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginTop: "4px",
              }}
            >
              LangGraph + 多 Agent：分类 Agent → 专家 Agent → 汇总
            </div>
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#22c55e",
              background: "rgba(34,197,94,0.08)",
              padding: "4px 10px",
              borderRadius: "999px",
            }}
          >
            ● 在线
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: "320px",
            maxHeight: "480px",
            overflowY: "auto",
            padding: "12px 8px",
            borderRadius: "12px",
            background: "#f8fafc",
          }}
        >
          {messages.value.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: m.from === "user" ? "flex-end" : "flex-start",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  padding: "8px 12px",
                  borderRadius:
                    m.from === "user"
                      ? "16px 4px 16px 16px"
                      : "4px 16px 16px 16px",
                  background:
                    m.from === "user"
                      ? "linear-gradient(135deg,#4f46e5,#6366f1)"
                      : "white",
                  color: m.from === "user" ? "white" : "#0f172a",
                  fontSize: "14px",
                  lineHeight: 1.5,
                  boxShadow:
                    m.from === "user"
                      ? "0 8px 20px rgba(79,70,229,0.25)"
                      : "0 6px 16px rgba(15,23,42,0.06)",
                }}
              >
                <div>{m.text}</div>
                {m.meta && (
                  <div
                    style={{
                      fontSize: "11px",
                      opacity: 0.8,
                      marginTop: "4px",
                    }}
                  >
                    {m.meta}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading.value && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                }}
              >
                正在思考路由到哪个 Agent…
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            paddingTop: "4px",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <textarea
            value={input.value}
            onInput={(e) => (input.value = (e.target as HTMLTextAreaElement).value)}
            onKeydown={handleKeyDown}
            placeholder="试试问：我想查询一下退款进度 / 我快递到哪了 / 打不开页面 怎么办？"
            style={{
              flex: 1,
              resize: "none",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "8px 10px",
              fontSize: "14px",
              outline: "none",
              minHeight: "42px",
              maxHeight: "80px",
            }}
          />
          <button
            onClick={() => void send()}
            disabled={loading.value || !input.value.trim()}
            style={{
              borderRadius: "999px",
              padding: "8px 18px",
              border: "none",
              cursor: loading.value ? "default" : "pointer",
              background: loading.value
                ? "#cbd5f5"
                : "linear-gradient(135deg,#4f46e5,#6366f1)",
              color: "white",
              fontWeight: 500,
              fontSize: "14px",
              boxShadow: "0 10px 22px rgba(79,70,229,0.35)",
              opacity: loading.value ? 0.7 : 1,
              transition: "transform 0.08s ease, box-shadow 0.08s ease",
            }}
          >
            {loading.value ? "发送中…" : "发送"}
          </button>
        </div>
      </div>
    </div>
  );
});

