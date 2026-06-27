# Task 5: 整合所有数据源到主更新脚本

**Goal:** 将搜索热度和社区热度模块集成到 `scripts/update-popularity.ts`，使其能一次运行更新所有维度的数据。

## 背景

当前 `update-popularity.ts` 只集成了 OpenRouter API 调用量。需要添加：
- 搜索热度（来自 `scripts/fetch-trends.ts`）
- 社区热度/GitHub Stars（来自 `scripts/fetch-github.ts`）
- 计算排名

## 数据结构不匹配问题

当前 `popularity.json` 结构（Task 1 创建）：
```json
{
  "updatedAt": "...",
  "tools": {
    "chatgpt": { "apiCalls": 0, "apiCallsRank": 0, "searchScore": 0, ... }
  }
}
```

但 `update-popularity.ts` 中的 TypeScript 接口定义了不同的结构（数组 + ToolPopularity）。需要统一为 popularity.json 的实际结构。

## 要求

### 重写 `scripts/update-popularity.ts`

```typescript
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fetchOpenRouterRankings, normalizeScores } from './fetch-openrouter.js';
import { matchToolToScore } from './tool-model-mapping.js';
import { fetchSearchScores, normalizeSearchScores } from './fetch-trends.js';
import { fetchGitHubStars, normalizeGitHubStars } from './fetch-github.js';

const DATA_PATH = join(import.meta.dirname, '..', 'src', 'data', 'popularity.json');

interface ToolPopularityData {
  apiCalls: number;
  apiCallsRank: number;
  searchScore: number;
  searchRank: number;
  communityScore: number;
  communityRank: number;
  isFree: boolean;
}

interface PopularityData {
  updatedAt: string;
  tools: Record<string, ToolPopularityData>;
}

async function updateApiCalls(data: PopularityData) {
  const rawUsage = await fetchOpenRouterRankings();
  const normalized = normalizeScores(rawUsage);
  for (const [slug, _] of Object.entries(data.tools)) {
    data.tools[slug].apiCalls = matchToolToScore(slug, normalized);
  }
}

async function updateSearchScores(data: PopularityData) {
  const rawScores = fetchSearchScores();
  const normalized = normalizeSearchScores(rawScores);
  for (const [slug, _] of Object.entries(data.tools)) {
    const score = normalized.get(slug) ?? 0;
    data.tools[slug].searchScore = score;
  }
}

async function updateCommunityScores(data: PopularityData) {
  const rawScores = await fetchGitHubStars();
  const normalized = normalizeGitHubStars(rawScores);
  for (const [slug, _] of Object.entries(data.tools)) {
    const score = normalized.get(slug) ?? 0;
    data.tools[slug].communityScore = score;
  }
}

function calculateRanks(data: PopularityData) {
  const slugs = Object.keys(data.tools);

  // API calls rank
  const apiSorted = [...slugs].sort((a, b) => data.tools[b].apiCalls - data.tools[a].apiCalls);
  apiSorted.forEach((slug, i) => { data.tools[slug].apiCallsRank = i + 1; });

  // Search score rank
  const searchSorted = [...slugs].sort((a, b) => data.tools[b].searchScore - data.tools[a].searchScore);
  searchSorted.forEach((slug, i) => { data.tools[slug].searchRank = i + 1; });

  // Community score rank
  const communitySorted = [...slugs].sort((a, b) => data.tools[b].communityScore - data.tools[a].communityScore);
  communitySorted.forEach((slug, i) => { data.tools[slug].communityRank = i + 1; });
}

async function main() {
  console.log('Starting popularity data update...');
  const raw = readFileSync(DATA_PATH, 'utf-8');
  const data: PopularityData = JSON.parse(raw);
  console.log(`Loaded ${Object.keys(data.tools).length} tools`);

  await updateApiCalls(data);
  await updateSearchScores(data);
  await updateCommunityScores(data);
  calculateRanks(data);

  data.updatedAt = new Date().toISOString();
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`Updated popularity data at ${data.updatedAt}`);
}

main().catch((err) => {
  console.error('update-popularity failed:', err);
  process.exit(1);
});
```

## Context
- 工作目录: D:\\Project\\ai-tool-scout-main
- 已有文件: `scripts/fetch-openrouter.ts`, `scripts/tool-model-mapping.ts`, `scripts/fetch-trends.ts`, `scripts/fetch-github.ts`
- 数据文件: `src/data/popularity.json`（结构是 `{ updatedAt, tools: { [slug]: {...} } }`）

## Files
- Rewrite: `scripts/update-popularity.ts`

## Do NOT
- 不要修改其他脚本文件
- 不要运行脚本
- 不要 commit
