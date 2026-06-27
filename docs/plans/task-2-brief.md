# Task 2: OpenRouter API 调用量抓取模块

**Goal:** 创建 OpenRouter API 调用量抓取模块，用于从 OpenRouter datasets API 获取模型使用量数据。

## 要求

### 1. 创建 `scripts/fetch-openrouter.ts`

```typescript
// 从 OpenRouter /datasets/rankings-daily 获取最近 7 天的模型 token 使用量
// API: GET https://openrouter.ai/api/v1/datasets/rankings-daily?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
// Headers: Authorization: Bearer <OPENROUTER_API_KEY>
// Rate limit: 30 req/min, 500 req/day

// 返回 Map<model_permaslug, total_tokens>
// 归一化到 0-100 分的辅助函数
```

需要导出：
- `fetchOpenRouterRankings()` → `Promise<Map<string, number>>` — 原始 token 使用量
- `normalizeScores(usageMap)` → `Map<string, number>` — 归一化到 0-100

### 2. 创建 `scripts/tool-model-mapping.ts`

维护工具 slug 到 OpenRouter model slug 前缀的映射表：

```typescript
export const TOOL_MODEL_MAP: Record<string, string[]> = {
  'chatgpt': ['openai/gpt-4o', 'openai/gpt-4o-mini', 'openai/gpt-4-turbo', 'openai/o1', 'openai/o3'],
  'claude': ['anthropic/claude-sonnet-4', 'anthropic/claude-3.5-sonnet', 'anthropic/claude-3-opus', 'anthropic/claude-3-haiku'],
  'gemini': ['google/gemini-2.5-pro', 'google/gemini-2.0-flash', 'google/gemini-pro'],
  'deepseek': ['deepseek/deepseek-chat', 'deepseek/deepseek-r1', 'deepseek/deepseek-coder'],
  'perplexity': ['perplexity/sonar-pro', 'perplexity/sonar-small-chat', 'perplexity/r1-1776'],
  'doubao': ['bytedance/doubao'],
  'kimi': ['moonshot/kimi'],
  'yuanbao': ['tencent/hunyuan'],
  'chatglm': ['zhipu/glm-4', 'zhipu/glm-4-flash'],
  'baichuan': ['baichuan/baichuan4'],
  'xinghuo': ['spark/spark-pro', 'spark/spark-max'],
  'ernie-bot': ['baidu/ernie-4', 'baidu/ernie-3.5'],
  'tongyi-qianwen': ['qwen/qwen-2.5-72b-instruct', 'qwen/qwen-max', 'qwen/qwen-plus'],
  // 不在 OpenRouter 上的工具映射为空数组
  'midjourney': [],
  'notion-ai': [],
  'canva-ai': [],
  // ... 其他工具
};
```

映射规则：匹配 OpenRouter model slug 以映射前缀开头的模型。不在 OpenRouter 上的工具映射为空数组。

### 3. 创建 `scripts/update-popularity.ts`（主更新脚本骨架）

```typescript
// 读取 src/data/popularity.json
// 调用各数据源更新函数（目前只实现 OpenRouter）
// 计算排名
// 写回文件
```

## Context
- 工作目录: D:\\Project\\ai-tool-scout-main
- 已有 `src/data/popularity.json` (Task 1 创建)
- OpenRouter API Key 在 `process.env.OPENROUTER_API_KEY`
- 需要安装 `tsx` 作为 dev dependency 来运行 TypeScript 脚本
- 在 `package.json` 中添加 script: `"update-popularity": "npx tsx scripts/update-popularity.ts"`
- 用 Node.js 内置 `fetch` 即可，不需要额外 HTTP 库

## Files
- Create: `scripts/fetch-openrouter.ts`
- Create: `scripts/tool-model-mapping.ts`
- Create: `scripts/update-popularity.ts`
- Modify: `package.json` (添加 script + tsx devDependency)

## Do NOT
- 不要运行脚本（需要真实 API key）
- 不要修改 popularity.json
- 不要 commit

## Deliverable
- 创建上述 3 个脚本文件
- 修改 package.json 添加 script 和 tsx 依赖
