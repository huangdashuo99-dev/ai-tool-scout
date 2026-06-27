# Task 1: 创建热度数据结构

**Goal:** 创建 `src/data/popularity.json`，包含所有 59 个工具的热度数据初始结构。

**Context:** 这是多维度排行系统的基础数据文件。后续 Task 2-5 会填充真实数据，Task 7 会读取此文件渲染 UI。

## 要求

1. 创建 `src/data/popularity.json`
2. 遍历 `src/content/tools/*.md` 中的所有工具，提取 slug 和 pricing 字段
3. 为每个工具创建如下结构：

```json
{
  "updatedAt": "2026-06-26T00:00:00Z",
  "tools": {
    "<slug>": {
      "apiCalls": 0,
      "apiCallsRank": 0,
      "searchScore": 0,
      "searchRank": 0,
      "communityScore": 0,
      "communityRank": 0,
      "isFree": <true if pricing === "free", else false>
    }
  }
}
```

4. `isFree` 字段从每个工具 markdown 文件的 frontmatter `pricing` 字段提取（`pricing: "free"` → true，其他 → false）
5. 确保所有 59 个工具都包含在内

## Files
- Create: `src/data/popularity.json`

## 验证
- 文件包含所有 59 个工具
- 每个工具都有完整的字段结构
- `isFree` 正确反映 pricing 字段
