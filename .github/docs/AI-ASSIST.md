# AI Assist 使用说明

本仓库有两个 AI 相关 workflow：

- **AI Assist**：在 PR 上输出 **可行性/风险分析**、**CI 优化建议**（仅评论，不参与 pass/fail 门禁）。
- **AI Test PR**：在 **CI 通过且 PR 带 `ai:tests` label** 时，自动为该项目 PR 生成一个**只含测试的独立 PR**（方案三）；也可手动 Run workflow 填 PR 号触发。

## 启用条件

1. **Secrets**（仓库 Settings → Secrets and variables → Actions）：
   - `LLM_API_KEY`：必填。OpenAI 或兼容 API 的 Key（如 laozhang 等）。

2. **Variables**（可选）：
   - `LLM_API_URL`：默认 `https://api.openai.com/v1`，可改为自建或第三方兼容地址。
   - `LLM_MODEL`：默认 `gpt-4o-mini`，可按需改为其他模型。

## 触发方式

### AI Assist

| 能力 | 自动触发 | 手动触发 |
|------|----------|----------|
| **可行性/风险分析** | 每次 PR 的 push / 新开 PR | Actions → AI Assist → Run workflow，选 `feasibility`，可选填 PR 号 |
| **CI 优化建议** | CI 跑完后（main 分支） | Run workflow，选 `optimize`，可选填 PR 号 |

手动运行时若填写 **PR number**，结果会发到该 PR 评论区；不填则优化建议只写在当前 Run 的 Summary 里。

### AI Test PR（单测自动生成独立 PR）

| 方式 | 说明 |
|------|------|
| **自动** | CI 跑成功后，若该次运行关联的 PR 带有 **`ai:tests`** label，则自动为该 PR 生成一个只含测试改动的独立 PR，供你 review 后合并。 |
| **手动** | Actions → AI Test PR → Run workflow，在 **pr_number** 中填入业务 PR 编号，即可为该 PR 生成测试 PR。 |

## 行为说明

- 所有 AI 相关 job 均设置 `continue-on-error: true`，失败不会让流水线变红。
- 评论会按「同一类只保留一条」的方式更新（通过 marker 识别并 replace）。
- Diff 会做长度截断（约 12 万字符）以控制 token 用量。

## 最佳实践

- 用 **label** 控制单测生成，避免每个 PR 都调 LLM。
- 密钥只放 `LLM_API_KEY`，不要将业务数据或内部配置写进 prompt。
- 若使用自建/代理 API，确保返回格式与 OpenAI `chat/completions` 一致。
