# AI Tool Scout

A static AI tool navigation and review site built with Astro, Tailwind CSS, and Pagefind.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:4321` in your browser.

## Adding a New Tool

1. Create `src/content/tools/your-tool.md` with frontmatter:

```yaml
---
title: "Tool Name"
slug: "tool-name"
description: "One-line description"
category: "writing"  # writing | image | coding | video | productivity
tags: ["tag1", "tag2"]
pricing: "freemium"  # free | freemium | paid
priceFrom: "$0"
rating: 4.0
affiliateUrl: "https://..."
affiliateNetwork: "direct"  # direct | impact | shareasale
officialUrl: "https://..."
logo: "/logos/placeholder.svg"
screenshots: ["/screenshots/placeholder.svg"]
isFeatured: false
isNew: true
dateAdded: 2026-06-17
alternatives: ["other-tool-slug"]
faq:
  - question: "Question?"
    answer: "Answer."
---
```

2. Write the review body in Markdown below the frontmatter.
3. Add the tool logo to `public/logos/`.
4. `git push` to deploy.

## Deploy

Push to the main branch — Vercel auto-deploys.

## Tech Stack

- **Astro** — Static site framework
- **Tailwind CSS** — Utility-first CSS
- **Pagefind** — Static search
- **Vercel** — Hosting

## Project Structure

- `src/content/tools/` — Tool reviews (one .md per tool)
- `src/content/categories/` — Category definitions
- `src/content/scenarios/` — Scenario-based recommendations
- `src/components/` — Reusable UI components
- `src/layouts/` — Page layouts
- `src/pages/` — Route pages
