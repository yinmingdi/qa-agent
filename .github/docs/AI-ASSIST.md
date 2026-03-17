# AI Assist 使用说明

本仓库通过 **AI Assist** workflow 在 PR 上提供：可行性/风险分析、单测建议、CI 优化建议。**仅输出评论，不参与 pass/fail 门禁。**

## 启用条件

1. **Secrets**（仓库 Settings → Secrets and variables → Actions）：
   - `LLM_API_KEY`：必填。OpenAI 或兼容 API 的 Key（如你已有的 laozhang 等）。

2. **Variables**（可选）：
   - `LLM_API_URL`：默认 `https://api.openai.com/v1`，可改为自建或第三方兼容地址。
   - `LLM_MODEL`：默认 `gpt-4o-mini`，可按需改为其他模型。

## 触发方式

| 能力 | 自动触发 | 手动触发 |
|------|----------|----------|
| **可行性/风险分析** | 每次 PR 的 push / 新开 PR | Actions → AI Assist → Run workflow，选 `feasibility`，可选填 PR 号 |
| **单测建议** | PR 打上 label `ai:tests` | Run workflow，选 `testgen`，可选填 PR 号 |
| **CI 优化建议** | CI 跑完后（main 分支） | Run workflow，选 `optimize`，可选填 PR 号 |

手动运行时若填写 **PR number**，结果会发到该 PR 评论区；不填则优化建议只写在当前 Run 的 Summary 里。

## 行为说明

- 所有 AI 相关 job 均设置 `continue-on-error: true`，失败不会让流水线变红。
- 评论会按「同一类只保留一条」的方式更新（通过 marker 识别并 replace）。
- Diff 会做长度截断（约 12 万字符）以控制 token 用量。

## 最佳实践

- 用 **label** 控制单测生成，避免每个 PR 都调 LLM。
- 密钥只放 `LLM_API_KEY`，不要将业务数据或内部配置写进 prompt。
- 若使用自建/代理 API，确保返回格式与 OpenAI `chat/completions` 一致。
