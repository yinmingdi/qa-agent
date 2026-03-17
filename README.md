# LangGraph Multi-Agent FAQ / 客服路由系统

基于 pnpm + monorepo + Node.js + TypeScript + LangGraph + Vue 3 (TSX) 的多智能体 FAQ/客服路由系统 MVP。

- `apps/api`: Node.js + TypeScript + LangGraph 的多智能体 FAQ 路由服务
- `apps/web`: Vue 3 + TSX 前端，调用 API 完成问答
- `packages/agents`: 复用的多智能体逻辑与类型（如有需要可抽离到此目录）

使用步骤（后续完善）：

1. 安装依赖：`pnpm install`
2. 启动开发环境：`pnpm dev`

