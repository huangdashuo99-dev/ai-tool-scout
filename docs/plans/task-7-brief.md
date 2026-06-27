# Task 7: 首页 Top 10 Tab 切换 UI

**Goal:** 在首页 Top 10 板块添加 Tab 切换，支持 4 种排序维度：API 调用量、免费优先、搜索热度、社区热度。

## 要求

### 1. 添加 i18n 翻译

**`src/i18n/en.json`** 的 `home` 中添加：
```json
"sortApiCalls": "API Usage",
"sortFree": "Free First",
"sortSearch": "Search Popularity",
"sortCommunity": "Community"
```

**`src/i18n/zh.json`** 的 `home` 中添加：
```json
"sortApiCalls": "API 调用量",
"sortFree": "免费优先",
"sortSearch": "搜索热度",
"sortCommunity": "社区热度"
```

### 2. 修改 `src/pages/index.astro` 的 Top 10 section

在 frontmatter 中导入 popularity 数据并生成多种排序列表：

```astro
---
import popularityData from '../data/popularity.json';

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
    if (a.popularity.isFree !== b.popularity.isFree) return a.popularity.isFree ? -1 : 1;
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
```

替换原来的 Top 10 section（第 57-70 行附近）为带 Tab 的版本：

```astro
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-2xl font-bold text-gray-900">🏆 {t(lang, 'home.topTools')}</h2>
    <a href={`${langPathPrefix(lang)}rankings`} class="text-primary-600 hover:text-primary-700 font-medium text-sm">{t(lang, 'home.viewAllRankings')}</a>
  </div>

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

  <div id="tab-api-calls" class="ranking-panel grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {topByApiCalls.map(({ tool }, i) => (
      <div class="relative">
        <span class="absolute -top-2 -left-2 z-10 w-7 h-7 flex items-center justify-center bg-primary-600 text-white text-xs font-bold rounded-full">{i + 1}</span>
        <ToolCard tool={tool} lang={lang} />
      </div>
    ))}
  </div>

  <div id="tab-free" class="ranking-panel hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {topByFree.map(({ tool }, i) => (
      <div class="relative">
        <span class="absolute -top-2 -left-2 z-10 w-7 h-7 flex items-center justify-center bg-primary-600 text-white text-xs font-bold rounded-full">{i + 1}</span>
        <ToolCard tool={tool} lang={lang} />
      </div>
    ))}
  </div>

  <div id="tab-search" class="ranking-panel hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {topBySearch.map(({ tool }, i) => (
      <div class="relative">
        <span class="absolute -top-2 -left-2 z-10 w-7 h-7 flex items-center justify-center bg-primary-600 text-white text-xs font-bold rounded-full">{i + 1}</span>
        <ToolCard tool={tool} lang={lang} />
      </div>
    ))}
  </div>

  <div id="tab-community" class="ranking-panel hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {topByCommunity.map(({ tool }, i) => (
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
        tabs.forEach(t => {
          t.classList.remove('bg-primary-600', 'text-white');
          t.classList.add('bg-gray-100', 'text-gray-700');
        });
        tab.classList.remove('bg-gray-100', 'text-gray-700');
        tab.classList.add('bg-primary-600', 'text-white');
        panels.forEach(p => p.classList.add('hidden'));
        const target = document.getElementById(targetId);
        if (target) target.classList.remove('hidden');
      });
    });
  }
  document.addEventListener('DOMContentLoaded', initRankingTabs);
</script>
```

### 3. 修改 `src/pages/zh/index.astro`

应用完全相同的修改（使用 `lang='zh'`）。

## Context
- 工作目录: D:\\Project\\ai-tool-scout-main
- 当前 `index.astro` 第 17-19 行有旧的 topTools 排序逻辑需要替换
- `zh/index.astro` 同样有
- ToolCard 组件已存在于 `src/components/ToolCard.astro`

## Files
- Modify: `src/i18n/en.json`
- Modify: `src/i18n/zh.json`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/zh/index.astro`

## Do NOT
- 不要修改 ToolCard 组件
- 不要 commit
