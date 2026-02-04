# HealthMaps — Claude Code Instructions

## Project Overview
HealthMaps helps Australians navigate the mental health system. It explains how to access Medicare-funded psychology sessions via a GP and Mental Health Care Plan (MHCP).

## Current Status
- **All 6 build phases complete** — foundation, pathway, practitioners, calculator, stories/tips, homepage/404
- **12 pages built**, 0 errors, 0 warnings from `astro check`
- **Not yet deployed** — needs to be pushed to GitHub and connected to Netlify
- **Health content needs review** — all AI-drafted health claims are marked with `<!-- REVIEW -->` comments

## Next Steps
1. Push to GitHub (`git add -A && git commit -m "Initial build" && gh repo create healthmaps --public --source=. --remote=origin --push`)
2. Connect repo to Netlify (app.netlify.com > Add new site > Import from GitHub)
3. Review all `<!-- REVIEW -->` comments in `src/content/` Markdown files for health accuracy
4. Replace fictional user stories with real ones (or verify they're clearly marked as illustrative)
5. Lighthouse audit once deployed (target 95+ all categories)

## Tech Stack
- **Astro v5** — static site generator (file-based routing, Markdown content)
- **Tailwind CSS v4** — utility-first styling via `@tailwindcss/vite`
- **Vanilla JS only** — no React/Vue/Svelte. Interactive features use plain `<script>` tags.
- **Deployment** — Netlify (auto-deploy on push). Config in `netlify.toml`.

## Project Structure
```
src/
├── content/                   ← ALL CONTENT TO EDIT
│   ├── pathway/               4 step-by-step walkthrough files
│   ├── alternatives/          EAP, private counsellor, crisis
│   ├── practitioners/         Psychologist, psychiatrist, counsellor, psychotherapist
│   ├── stories/               User stories (2 sample)
│   └── tips/                  Practical tips (3 articles)
├── data/
│   └── calculator-costs.json  ← Calculator costs to edit
├── components/
│   ├── CrisisBanner.astro     Crisis numbers (on every page)
│   ├── Header.astro           Nav with mobile menu
│   ├── Footer.astro
│   ├── PathwayStep.astro      Expandable step component
│   └── CostCalculator.astro   Vanilla JS calculator
├── layouts/
│   └── BaseLayout.astro       Base template (SEO, OG, crisis banner)
├── pages/
│   ├── index.astro            Homepage
│   ├── pathway.astro          Getting Started guide
│   ├── practitioners.astro    Compare practitioners
│   ├── calculator.astro       Cost calculator
│   ├── stories/               Story index + dynamic pages
│   ├── tips/                  Tips index + dynamic pages
│   └── 404.astro
└── styles/
    └── global.css             Tailwind + Inter font + design tokens
```

## Critical Rules
1. **Crisis numbers on every page** — CrisisBanner.astro must appear on all pages via BaseLayout. Never remove it.
2. **All health content must be flagged** — use `<!-- REVIEW -->` comments on any AI-drafted health claims.
3. **MHCPs cannot be "transferred"** — they must be updated/rewritten by a GP. This is a known LLM error.
4. **No JS frameworks** — vanilla JS only for interactivity.
5. **Australian context** — costs in AUD, Medicare/GP/MHCP terminology, Australian crisis numbers.

## Design Tokens
- Primary blue: `#1E3A5F` (brand-blue)
- Green: `#059669` (brand-green)
- Orange: `#D97706` (brand-orange)
- Light background: `#F9FAFB` (brand-light)
- Font: Inter (locally bundled via @fontsource)

## Commands
- `npm run dev` — start dev server at localhost:4321
- `npm run build` — production build to `dist/`
- `npx astro check` — type/build error checking

## Content Editing
To add a new story: create `src/content/stories/my-story.md` with YAML frontmatter:
```yaml
---
title: "Story title"
name: "First name"
age: "28"
location: "City"
summary: "One-line summary"
publishedDate: "2025-01-15"
---
```

To add a new tip: create `src/content/tips/my-tip.md` with YAML frontmatter:
```yaml
---
title: "Tip title"
summary: "One-line summary"
category: "Getting Started"
publishedDate: "2025-01-10"
---
```

To update calculator costs: edit `src/data/calculator-costs.json`.

## Content Collections (defined in src/content.config.ts)
- `pathway` — step, title, summary
- `alternatives` — title, summary, order
- `practitioners` — title, cost, rebate, referralRequired, waitTime, order
- `stories` — title, name, age, location, summary, publishedDate
- `tips` — title, summary, category, publishedDate
