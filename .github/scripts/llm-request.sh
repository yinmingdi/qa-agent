#!/usr/bin/env bash
# Call OpenAI-compatible API and output assistant content to stdout.
# Usage: LLM_API_KEY=xxx [LLM_API_URL=https://...] [LLM_MODEL=gpt-4o-mini] ./llm-request.sh "system prompt" "user message"
# Or: echo "user message" | ./llm-request.sh "system prompt"
set -euo pipefail
SYSTEM_PROMPT="${1:-}"
USER_PROMPT="${2:-$(cat)}"
API_URL="${LLM_API_URL:-https://api.openai.com/v1}"
MODEL="${LLM_MODEL:-gpt-4o-mini}"
if [[ -z "${LLM_API_KEY:-}" ]]; then
  echo "::error::LLM_API_KEY is not set. Add it to repo Secrets to enable AI assist."
  exit 1
fi
PAYLOAD=$(jq -n \
  --arg sys "$SYSTEM_PROMPT" \
  --arg user "$USER_PROMPT" \
  --arg model "$MODEL" \
  '{model: $model, messages: [{role: "system", content: $sys}, {role: "user", content: $user}], max_tokens: 4000}')
RESP=$(curl -sS -X POST "$API_URL/chat/completions" \
  -H "Authorization: Bearer $LLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")
if ! echo "$RESP" | jq -e '.choices[0].message.content' >/dev/null 2>&1; then
  echo "::error::LLM API error or unexpected response"
  echo "$RESP" | jq -r '.error.message // .' 2>/dev/null || echo "$RESP"
  exit 1
fi
echo "$RESP" | jq -r '.choices[0].message.content'
