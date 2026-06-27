# Task 3: 搜索热度数据

**Goal:** 创建搜索热度数据文件和抓取模块，用于为 Top 10 排行提供搜索热度维度。

## 要求

### 1. 创建 `scripts/search-scores.json`

手动维护的搜索热度原始分数（0-100），基于 Google Trends 近期趋势估算：

```json
{
  "chatgpt": 100,
  "claude": 72,
  "gemini": 78,
  "midjourney": 82,
  "dalle": 68,
  "github-copilot": 62,
  "cursor": 58,
  "perplexity": 55,
  "runway": 48,
  "elevenlabs": 42,
  "notion-ai": 45,
  "canva-ai": 50,
  "capcut": 55,
  "stable-diffusion": 40,
  "deepseek": 70,
  "kimi": 65,
  "doubao": 60,
  "ernie-bot": 55,
  "tongyi-qianwen": 52,
  "xinghuo": 38,
  "yuanbao": 35,
  "chatglm": 33,
  "baichuan": 30,
  "tabnine": 35,
  "codeium": 32,
  "replit-ai": 30,
  "cody": 28,
  "grammarly-ai": 58,
  "quillbot": 40,
  "jasper": 45,
  "copy-ai": 38,
  "writesonic": 32,
  "rytr": 28,
  "surfer-seo": 25,
  "notion-ai-enhanced": 42,
  "jasper-enhanced": 40,
  "copy-ai-workflows": 35,
  "uizard": 22,
  "framer-ai": 28,
  "figma-ai": 45,
  "gamma": 32,
  "tome": 28,
  "play-ht": 25,
  "murf-ai": 22,
  "descript": 35,
  "otter-ai": 28,
  "fireflies-ai": 22,
  "synthesia": 30,
  "heygen": 32,
  "pika": 35,
  "luma-ai": 30,
  "pictory": 25,
  "mem": 18,
  "adobe-firefly": 42,
  "leonardo-ai": 35,
  "ideogram": 28,
  "magnific-ai": 20,
  "amazon-q": 22,
  "d-id": 20
}
```

### 2. 创建 `scripts/fetch-trends.ts`

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';

export function fetchSearchScores(): Map<string, number> {
  const scores = new Map<string, number>();
  const data = JSON.parse(readFileSync(join(import.meta.dirname, 'search-scores.json'), 'utf-8'));
  for (const [key, value] of Object.entries(data)) {
    scores.set(key, value as number);
  }
  return scores;
}

export function normalizeSearchScores(scores: Map<string, number>): Map<string, number> {
  // 归一化到 0-100
  const values = Array.from(scores.values());
  if (values.length === 0) return new Map();
  const max = Math.max(...values);
  if (max === 0) return new Map();
  
  const normalized = new Map<string, number>();
  for (const [key, value] of scores) {
    normalized.set(key, Math.round((value / max) * 100));
  }
  return normalized;
}
```

## Context
- 工作目录: D:\\Project\\ai-tool-scout-main
- `scripts/update-popularity.ts` 已创建（Task 2），需要集成此模块
- `import.meta.dirname` 在 tsx 下可用

## Files
- Create: `scripts/search-scores.json`
- Create: `scripts/fetch-trends.ts`

## Do NOT
- 不要修改 update-popularity.ts（Task 5 会整合）
- 不要运行脚本
- 不要 commit
