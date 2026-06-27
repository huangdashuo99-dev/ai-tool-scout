# Task 4: GitHub Stars 社区热度抓取

**Goal:** 创建 GitHub Stars 社区热度抓取模块，用于从 GitHub API 获取开源工具的 star 数量作为社区热度指标。

## 要求

### 1. 创建 `scripts/fetch-github.ts`

维护工具 slug 到 GitHub repo (owner/name) 的映射，并提供抓取函数：

```typescript
// 工具 slug → GitHub repo (仅开源工具有值，SaaS 产品为空字符串)
export const TOOL_GITHUB_MAP: Record<string, string> = {
  'stable-diffusion': 'Stability-AI/stablediffusion',
  'codeium': 'Exafunction/codeium.vim',
  'cursor': 'getcursor/cursor',
  'replit-ai': 'replit/replit',
  'cody': 'sourcegraph/cody',
  'tabnine': 'codota/tabnine-vscode',
  'midjourney': '',        // SaaS, no public repo
  'chatgpt': '',           // SaaS
  'claude': '',            // SaaS
  'gemini': '',            // SaaS
  'deepseek': '',          // 模型非开源工具
  'perplexity': '',
  'doubao': '',
  'kimi': '',
  'yuanbao': '',
  'chatglm': 'THUDM/ChatGLM-6B',
  'baichuan': '',
  'xinghuo': '',
  'ernie-bot': '',
  'tongyi-qianwen': '',
  // ... 其他工具全部映射为空字符串
};

export async function fetchGitHubStars(): Promise<Map<string, number>> {
  // 遍历 TOOL_GITHUB_MAP
  // 有 repo 的通过 GitHub API 获取 stargazers_count
  // 没有 repo 的设为 0
  // 返回 Map<toolSlug, stars>
}

export function normalizeGitHubStars(starsMap: Map<string, number>): Map<string, number> {
  // 归一化到 0-100
}
```

### API 调用方式
```
GET https://api.github.com/repos/{owner}/{repo}
Headers: Accept: application/vnd.github.v3+json, User-Agent: ai-tool-scout
Response: { stargazers_count: number, ... }
```

无需认证（未认证 60 req/hour，足够用）。仅少数工具是开源的，大部分映射为空。

## Context
- 工作目录: D:\\Project\\ai-tool-scout-main
- `import.meta.dirname` 在 tsx 下可用

## Files
- Create: `scripts/fetch-github.ts`

## Do NOT
- 不要修改 update-popularity.ts
- 不要运行脚本
- 不要 commit
