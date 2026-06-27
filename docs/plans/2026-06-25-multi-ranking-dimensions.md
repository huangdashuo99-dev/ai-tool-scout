# Multi-Dimension Ranking Implementation Plan

**Goal:** 实现 Top 10 板块的多维度排序（API 调用量、免费优先、搜索热度、社区热度），每 6 小时自动更新热度数据。

**Architecture:** 构建时从 JSON 数据文件读取热度分数，前端用 Tab 切换排序维度。后台脚本定时从 OpenRouter API、GitHub API、Google Trends 抓取数据，写入 `src/data/popularity.json`。

**Tech Stack:** Astro (SSG)、TypeScript、Node.js fetch、GitHub Actions (cron)

## Global Constraints

- 静态站点，所有热度数据必须在构建时可用
- OpenRouter API: 30 req/min, 500 req/day — 脚本需控制频率
- GitHub API: 未认证 60 req/hour — 免费额度足够
- 需支持 en/zh 双语

---

## Task 1: 创建热度数据结构

**Files:**
- Create: `src/data/popularity.json`

**Interfaces:**
- Produces: Task 2, 3, 4, 5 依赖此数据结构

- [ ] **Step 1: 创建数据文件**

```json
{
  "updatedAt": "2026-06-25T00:00:00Z",
  "tools": {
    "chatgpt": {
      "apiCalls": 1000000,
      "apiCallsRank": 1,
      "searchScore": 95,
      "searchRank": 1,
      "communityScore": 88,
      "communityRank": 1,
      "isFree": true
    }
  }
}
```

字段说明：
- `apiCalls`: OpenRouter 平台 token 使用量（归一化 0-100）
- `apiCallsRank`: API 调用量排名
- `searchScore`: 搜索热度分数（0-100）
- `searchRank`: 搜索热度排名
- `communityScore`: 社区热度分数（0-100）
- `communityRank`: 社区热度排名
- `isFree`: 是否免费（从 tool frontmatter 的 pricing 字段派生）

- [ ] **Step 2: 为所有工具创建初始空数据**

遍历 `src/content/tools/*.md`，为每个工具创建空条目：
```json
{
  "apiCalls": 0,
  "apiCallsRank": 0,
  "searchScore": 0,
  "searchRank": 0,
  "communityScore": 0,
  "communityRank": 0,
  "isFree": false
}
```

- [ ] **Step 3: Commit**

```bash
git add src/data/popularity.json
git commit -m "feat: add popularity data structure for multi-dimension ranking"
```

---

## Task 2: OpenRouter API 调用量抓取脚本

**Files:**
- Create: `scripts/update-popularity.ts`
- Create: `scripts/fetch-openrouter.ts`
- Modify: `package.json:5` (添加 script)

**Interfaces:**
- Consumes: `src/data/popularity.json`
- Produces: 更新 `popularity.json` 中的 `apiCalls` 和 `apiCallsRank` 字段

**前置条件:** 需要用户在 `.env` 中设置 `OPENROUTER_API_KEY`

- [ ] **Step 1: 创建 OpenRouter 抓取模块**

```typescript
// scripts/fetch-openrouter.ts
const API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_URL = 'https://openrouter.ai/api/v1';

interface RankingsDailyResponse {
  data: Array<{
    date: string;
    model_permaslug: string;
    total_tokens: number;
  }>;
}

export async function fetchOpenRouterRankings(): Promise<Map<string, number>> {
  const usageMap = new Map<string, number>();

  // 获取最近 7 天的数据
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  try {
    const response = await fetch(
      `${BASE_URL}/datasets/rankings-daily?start_date=${startStr}&end_date=${endStr}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`OpenRouter API error: ${response.status}`);
      return usageMap;
    }

    const result: RankingsDailyResponse = await response.json();

    // 按模型汇总 token 使用量
    for (const item of result.data) {
      if (item.model_permaslug === 'other') continue;
      const current = usageMap.get(item.model_permaslug) || 0;
      usageMap.set(item.model_permaslug, current + item.total_tokens);
    }
  } catch (error) {
    console.error('Failed to fetch OpenRouter rankings:', error);
  }

  return usageMap;
}

// 归一化到 0-100 分
export function normalizeScores(usageMap: Map<string, number>): Map<string, number> {
  const scores = new Map<string, number>();
  const values = Array.from(usageMap.values());
  if (values.length === 0) return scores;

  const max = Math.max(...values);
  if (max === 0) return scores;

  for (const [key, value] of usageMap) {
    scores.set(key, Math.round((value / max) * 100));
  }

  return scores;
}
```

- [ ] **Step 2: 创建工具 slug 到 OpenRouter model ID 的映射**

需要在每个工具的 frontmatter 中添加 `openrouterModels` 字段，或者在脚本中维护一个映射表。

```typescript
// scripts/tool-model-mapping.ts
// 工具 slug → OpenRouter model slug 前缀
export const TOOL_MODEL_MAP: Record<string, string[]> = {
  'chatgpt': ['openai/gpt-4o', 'openai/gpt-4o-mini', 'openai/gpt-4-turbo'],
  'claude': ['anthropic/claude-3.5-sonnet', 'anthropic/claude-3-opus'],
  'gemini': ['google/gemini-2.0-flash', 'google/gemini-pro'],
  'deepseek': ['deepseek/deepseek-chat', 'deepseek/deepseek-coder'],
  'perplexity': ['perplexity/sonar-pro', 'perplexity/sonar-small'],
  // ... 其他工具
};
```

- [ ] **Step 3: 编写主更新脚本骨架**

```typescript
// scripts/update-popularity.ts
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fetchOpenRouterRankings, normalizeScores } from './fetch-openrouter';
import { TOOL_MODEL_MAP } from './tool-model-mapping';

const DATA_PATH = join(import.meta.dirname, '..', 'src', 'data', 'popularity.json');

interface ToolPopularity {
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
  tools: Record<string, ToolPopularity>;
}

async function main() {
  console.log('Starting popularity data update...');

  const data: PopularityData = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));

  // 1. OpenRouter API 调用量
  await updateApiCalls(data);

  // 2. 搜索热度 (Task 3)
  // await updateSearchScores(data);

  // 3. 社区热度 (Task 4)
  // await updateCommunityScores(data);

  // 4. 计算排名
  calculateRanks(data);

  // 5. 更新时间戳
  data.updatedAt = new Date().toISOString();

  // 6. 写入文件
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  console.log(`Updated popularity data at ${data.updatedAt}`);
}

async function updateApiCalls(data: PopularityData) {
  console.log('Fetching OpenRouter rankings...');
  const rawScores = await fetchOpenRouterRankings();
  const normalizedScores = normalizeScores(rawScores);

  for (const [toolSlug, models] of Object.entries(TOOL_MODEL_MAP)) {
    if (!data.tools[toolSlug]) continue;

    let maxScore = 0;
    for (const model of models) {
      // 模糊匹配：检查 model 是否以 key 开头
      for (const [modelSlug, score] of normalizedScores) {
        if (modelSlug.startsWith(model) && score > maxScore) {
          maxScore = score;
        }
      }
    }
    data.tools[toolSlug].apiCalls = maxScore;
  }
}

function calculateRanks(data: PopularityData) {
  const tools = Object.entries(data.tools);

  // API 调用量排名
  const apiSorted = [...tools].sort((a, b) => b[1].apiCalls - a[1].apiCalls);
  apiSorted.forEach(([slug], i) => { data.tools[slug].apiCallsRank = i + 1; });

  // 搜索热度排名
  const searchSorted = [...tools].sort((a, b) => b[1].searchScore - a[1].searchScore);
  searchSorted.forEach(([slug], i) => { data.tools[slug].searchRank = i + 1; });

  // 社区热度排名
  const communitySorted = [...tools].sort((a, b) => b[1].communityScore - a[1].communityScore);
  communitySorted.forEach(([slug], i) => { data.tools[slug].communityRank = i + 1; });
}

main().catch(console.error);
```

- [ ] **Step 4: 添加 npm script**

在 `package.json` 中添加：
```json
"scripts": {
  "update-popularity": "npx tsx scripts/update-popularity.ts"
}
```

- [ ] **Step 5: 安装 tsx 依赖**

```bash
npm install -D tsx
```

- [ ] **Step 6: Commit**

```bash
git add scripts/fetch-openrouter.ts scripts/tool-model-mapping.ts scripts/update-popularity.ts package.json package-lock.json
git commit -m "feat: add OpenRouter API call volume fetcher for popularity ranking"
```

---

## Task 3: Google Trends 搜索热度抓取

**Files:**
- Create: `scripts/fetch-trends.ts`
- Modify: `scripts/update-popularity.ts` (调用 trends fetcher)

**Interfaces:**
- Consumes: `src/data/popularity.json`
- Produces: 更新 `popularity.json` 中的 `searchScore` 和 `searchRank` 字段

- [ ] **Step 1: 创建 Trends 抓取模块**

由于 Google Trends 无官方 API，使用手动维护的搜索热度数据。
创建 `scripts/search-scores.json` 作为手动维护的搜索热度数据源：

```json
{
  "chatgpt": 100,
  "claude": 75,
  "gemini": 80,
  "midjourney": 85,
  "dalle": 70,
  "copilot": 65,
  "cursor": 60,
  "perplexity": 55,
  "runway": 50,
  "elevenlabs": 45,
  "notion-ai": 48,
  "canva-ai": 52,
  "capcut": 58,
  "stable-diffusion": 42,
  "deepseek": 72,
  "kimi": 68,
  "doubao": 62,
  "ernie-bot": 58,
  "tongyi-qianwen": 55,
  "xinghuo": 40,
  "yuanbao": 38,
  "chatglm": 36,
  "baichuan": 34
}
```

```typescript
// scripts/fetch-trends.ts
import { readFileSync } from 'fs';
import { join } from 'path';

export function fetchSearchScores(): Map<string, number> {
  const scores = new Map<string, number>();
  try {
    const data = JSON.parse(
      readFileSync(join(import.meta.dirname, 'search-scores.json'), 'utf-8')
    );
    for (const [key, value] of Object.entries(data)) {
      scores.set(key, value as number);
    }
  } catch (error) {
    console.error('Failed to load search scores:', error);
  }
  return scores;
}

export function normalizeSearchScores(scores: Map<string, number>): Map<string, number> {
  const normalized = new Map<string, number>();
  const values = Array.from(scores.values());
  if (values.length === 0) return normalized;

  const max = Math.max(...values);
  if (max === 0) return normalized;

  for (const [key, value] of scores) {
    normalized.set(key, Math.round((value / max) * 100));
  }

  return normalized;
}
```

- [ ] **Step 2: 集成到主更新脚本**

在 `update-popularity.ts` 中取消注释并实现：
```typescript
async function updateSearchScores(data: PopularityData) {
  console.log('Loading search scores...');
  const rawScores = fetchSearchScores();
  const normalizedScores = normalizeSearchScores(rawScores);

  for (const [toolSlug, score] of normalizedScores) {
    if (data.tools[toolSlug]) {
      data.tools[toolSlug].searchScore = score;
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add scripts/fetch-trends.ts scripts/search-scores.json scripts/update-popularity.ts
git commit -m "feat: add search popularity scores for ranking"
```

---

## Task 4: GitHub Stars 社区热度抓取

**Files:**
- Create: `scripts/fetch-github.ts`
- Modify: `scripts/update-popularity.ts` (调用 github fetcher)

**Interfaces:**
- Consumes: `src/data/popularity.json`
- Produces: 更新 `popularity.json` 中的 `communityScore` 和 `communityRank` 字段

- [ ] **Step 1: 创建 GitHub 抓取模块**

```typescript
// scripts/fetch-github.ts

// 工具 slug → GitHub repo (owner/name)
export const TOOL_GITHUB_MAP: Record<string, string> = {
  'stable-diffusion': 'Stability-AI/stablediffusion',
  'codeium': 'Exafunction/codeium.vim',
  'cursor': 'getcursor/cursor',
  'replit-ai': 'replit/replit',
  'cody': 'sourcegraph/cody',
  'tabnine': 'codota/tabnine-vscode',
  'perplexity': '',  // 无公开 repo
  'chatgpt': '',     // 无公开 repo
  'claude': '',      // 无公开 repo
  // ... 其他工具
};

interface GitHubStars {
  repo: string;
  stars: number;
}

export async function fetchGitHubStars(): Promise<Map<string, number>> {
  const starsMap = new Map<string, number>();

  for (const [toolSlug, repo] of Object.entries(TOOL_GITHUB_MAP)) {
    if (!repo) {
      starsMap.set(toolSlug, 0);
      continue;
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'ai-tool-scout',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        starsMap.set(toolSlug, data.stargazers_count || 0);
      } else {
        console.warn(`GitHub API error for ${repo}: ${response.status}`);
        starsMap.set(toolSlug, 0);
      }
    } catch (error) {
      console.warn(`Failed to fetch GitHub stars for ${repo}:`, error);
      starsMap.set(toolSlug, 0);
    }
  }

  return starsMap;
}

export function normalizeGitHubStars(starsMap: Map<string, number>): Map<string, number> {
  const normalized = new Map<string, number>();
  const values = Array.from(starsMap.values());
  if (values.length === 0) return normalized;

  const max = Math.max(...values);
  if (max === 0) return normalized;

  for (const [key, value] of starsMap) {
    normalized.set(key, Math.round((value / max) * 100));
  }

  return normalized;
}
```

- [ ] **Step 2: 集成到主更新脚本**

在 `update-popularity.ts` 中取消注释并实现：
```typescript
async function updateCommunityScores(data: PopularityData) {
  console.log('Fetching GitHub stars...');
  const rawScores = await fetchGitHubStars();
  const normalizedScores = normalizeGitHubStars(rawScores);

  for (const [toolSlug, score] of normalizedScores) {
    if (data.tools[toolSlug]) {
      data.tools[toolSlug].communityScore = score;
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add scripts/fetch-github.ts scripts/update-popularity.ts
git commit -m "feat: add GitHub stars community popularity fetcher"
```

---

## Task 5: 添加 isFree 字段到数据

**Files:**
- Modify: `scripts/update-popularity.ts`

**Interfaces:**
- Consumes: Astro content collection `tools`
- Produces: 更新 `popularity.json` 中的 `isFree` 字段

- [ ] **Step 1: 从 tool frontmatter 提取 pricing 信息**

```typescript
async function updateIsFree(data: PopularityData) {
  // 读取所有工具的 frontmatter
  const toolsDir = join(import.meta.dirname, '..', 'src', 'content', 'tools');
  const files = readdirSync(toolsDir).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const slug = file.replace('.md', '');
    const content = readFileSync(join(toolsDir, file), 'utf-8');

    // 提取 frontmatter
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) continue;

    const frontmatter = match[1];
    const pricingMatch = frontmatter.match(/pricing:\s*["']?(\w+)["']?/);

    if (pricingMatch && data.tools[slug]) {
      data.tools[slug].isFree = pricingMatch[1] === 'free';
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/update-popularity.ts
git commit -m "feat: add isFree field population from tool frontmatter"
```

---

## Task 6: GitHub Actions 定时任务

**Files:**
- Create: `.github/workflows/update-popularity.yml`

**Interfaces:**
- Consumes: 所有 fetch 脚本
- Produces: 自动提交更新后的 `popularity.json`

- [ ] **Step 1: 创建 GitHub Actions workflow**

```yaml
# .github/workflows/update-popularity.yml
name: Update Popularity Data

on:
  schedule:
    # 每 6 小时执行一次
    - cron: '0 */6 * * *'
  workflow_dispatch:  # 允许手动触发

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run popularity update
        env:
          OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
        run: npx tsx scripts/update-popularity.ts

      - name: Commit changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add src/data/popularity.json
          if git diff --cached --quiet; then
            echo "No changes to commit"
          else
            git commit -m "chore: update popularity data [skip ci]"
            git push
          fi
```

- [ ] **Step 2: 在 GitHub repo settings 中添加 secret**

需要在 GitHub repo → Settings → Secrets and variables → Actions 中添加：
- `OPENROUTER_API_KEY`: 你的 OpenRouter API Key

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/update-popularity.yml
git commit -m "ci: add GitHub Actions workflow for popularity data updates"
```

---

## Task 7: 首页 Top 10 Tab 切换 UI

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/zh/index.astro`
- Modify: `src/i18n/en.json`
- Modify: `src/i18n/zh.json`

**Interfaces:**
- Consumes: `src/data/popularity.json`
- Produces: 首页 Top 10 板块支持 4 种排序 Tab

- [ ] **Step 1: 添加 i18n 翻译**

在 `en.json` 的 `home` 中添加：
```json
"topTools": "Top 10 AI Tools",
"sortApiCalls": "API Usage",
"sortFree": "Free First",
"sortSearch": "Search Popularity",
"sortCommunity": "Community"
```

在 `zh.json` 的 `home` 中添加：
```json
"topTools": "Top 10 AI 工具",
"sortApiCalls": "API 调用量",
"sortFree": "免费优先",
"sortSearch": "搜索热度",
"sortCommunity": "社区热度"
```

- [ ] **Step 2: 修改首页 Top 10 板块**

替换 `index.astro` 中的 Top 10 section（第 57-70 行）：

```astro
---
import popularityData from '../data/popularity.json';

// 为每种排序维度生成排序后的工具列表
const toolsWithPopularity = allTools.map(tool => ({
  tool,
  popularity: popularityData.tools[tool.slug] || {
    apiCalls: 0, apiCallsRank: 999,
    searchScore: 0, searchRank: 999,
    communityScore: 0, communityRank: 999,
    isFree: false,
  },
}));

const topByApiCalls = [...toolsWithPopularity]
  .sort((a, b) => b.popularity.apiCalls - a.popularity.apiCalls)
  .slice(0, 10);

const topByFree = [...toolsWithPopularity]
  .sort((a, b) => {
    if (a.popularity.isFree !== b.popularity.isFree) {
      return a.popularity.isFree ? -1 : 1;
    }
    return b.popularity.apiCalls - a.popularity.apiCalls;
  })
  .slice(0, 10);

const topBySearch = [...toolsWithPopularity]
  .sort((a, b) => b.popularity.searchScore - a.popularity.searchScore)
  .slice(0, 10);

const topByCommunity = [...toolsWithPopularity]
  .sort((a, b) => b.popularity.communityScore - a.popularity.communityScore)
  .slice(0, 10);
---

<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-2xl font-bold text-gray-900">🏆 {t(lang, 'home.topTools')}</h2>
    <a href={`${langPathPrefix(lang)}rankings`} class="text-primary-600 hover:text-primary-700 font-medium text-sm">{t(lang, 'home.viewAllRankings')}</a>
  </div>

  <!-- Tab buttons -->
  <div class="flex flex-wrap gap-2 mb-6" id="ranking-tabs">
    <button data-tab="api-calls" class="ranking-tab px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors">
      🔥 {t(lang, 'home.sortApiCalls')}
    </button>
    <button data-tab="free" class="ranking-tab px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
      💰 {t(lang, 'home.sortFree')}
    </button>
    <button data-tab="search" class="ranking-tab px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
      🔍 {t(lang, 'home.sortSearch')}
    </button>
    <button data-tab="community" class="ranking-tab px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
      👥 {t(lang, 'home.sortCommunity')}
    </button>
  </div>

  <!-- API Calls ranking -->
  <div id="tab-api-calls" class="ranking-panel grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {topByApiCalls.map(({ tool, popularity }, i) => (
      <div class="relative">
        <span class="absolute -top-2 -left-2 z-10 w-7 h-7 flex items-center justify-center bg-primary-600 text-white text-xs font-bold rounded-full">{i + 1}</span>
        <ToolCard tool={tool} lang={lang} />
      </div>
    ))}
  </div>

  <!-- Free ranking -->
  <div id="tab-free" class="ranking-panel hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {topByFree.map(({ tool, popularity }, i) => (
      <div class="relative">
        <span class="absolute -top-2 -left-2 z-10 w-7 h-7 flex items-center justify-center bg-primary-600 text-white text-xs font-bold rounded-full">{i + 1}</span>
        <ToolCard tool={tool} lang={lang} />
      </div>
    ))}
  </div>

  <!-- Search ranking -->
  <div id="tab-search" class="ranking-panel hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {topBySearch.map(({ tool, popularity }, i) => (
      <div class="relative">
        <span class="absolute -top-2 -left-2 z-10 w-7 h-7 flex items-center justify-center bg-primary-600 text-white text-xs font-bold rounded-full">{i + 1}</span>
        <ToolCard tool={tool} lang={lang} />
      </div>
    ))}
  </div>

  <!-- Community ranking -->
  <div id="tab-community" class="ranking-panel hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {topByCommunity.map(({ tool, popularity }, i) => (
      <div class="relative">
        <span class="absolute -top-2 -left-2 z-10 w-7 h-7 flex items-center justify-center bg-primary-600 text-white text-xs font-bold rounded-full">{i + 1}</span>
        <ToolCard tool={tool} lang={lang} />
      </div>
    ))}
  </div>
</section>

<script>
  function initRankingTabs() {
    const tabs = document.querySelectorAll('.ranking-tab');
    const panels = document.querySelectorAll('.ranking-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = `tab-${(tab as HTMLElement).dataset.tab}`;

        // Update tab styles
        tabs.forEach(t => {
          t.classList.remove('bg-primary-600', 'text-white');
          t.classList.add('bg-gray-100', 'text-gray-700');
        });
        tab.classList.remove('bg-gray-100', 'text-gray-700');
        tab.classList.add('bg-primary-600', 'text-white');

        // Show/hide panels
        panels.forEach(p => p.classList.add('hidden'));
        const target = document.getElementById(targetId);
        if (target) target.classList.remove('hidden');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initRankingTabs);
</script>
```

- [ ] **Step 3: 修改中文首页**

在 `zh/index.astro` 中应用相同的修改（使用 `lang='zh'`）。

- [ ] **Step 4: 本地测试**

```bash
npm run dev
```

验证：
1. 首页 Top 10 板块显示 4 个 Tab
2. 点击 Tab 切换不同的排序列表
3. 中文页面翻译正确

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro src/pages/zh/index.astro src/i18n/en.json src/i18n/zh.json
git commit -m "feat: add multi-dimension ranking tabs to homepage Top 10"
```

---

## Task 8: 初始化热度数据并首次运行

**Files:**
- Modify: `src/data/popularity.json`

**Interfaces:**
- Consumes: 所有 Task 1-5 的脚本
- Produces: 完整的热度数据

- [ ] **Step 1: 设置 OpenRouter API Key**

在 `.env` 文件中添加：
```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx
```

- [ ] **Step 2: 首次运行更新脚本**

```bash
npx tsx scripts/update-popularity.ts
```

- [ ] **Step 3: 验证数据**

检查 `src/data/popularity.json` 是否包含所有工具的热度数据。

- [ ] **Step 4: 构建测试**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/data/popularity.json
git commit -m "chore: initialize popularity data for all tools"
```

---

## Execution Order

1. Task 1: 数据结构
2. Task 2: OpenRouter 抓取
3. Task 3: 搜索热度
4. Task 4: GitHub Stars
5. Task 5: isFree 字段
6. Task 7: 前端 UI
7. Task 8: 初始化数据
8. Task 6: GitHub Actions（最后配置，因为需要 API Key）

## 执行方式选择

1. **Subagent-Driven (推荐)** - 每个 Task 一个 subagent，Task 之间有 review checkpoint
2. **Inline Execution** - 在当前 session 中逐个执行

需要我开始执行吗？
