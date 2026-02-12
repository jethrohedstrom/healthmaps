# HealthMaps — Claude Code Instructions

## Project Overview
HealthMaps helps Australians navigate the mental health system. It explains how to access Medicare-funded psychology sessions via a GP and Mental Health Care Plan (MHCP).

## Current Status
- **All 6 build phases complete** — foundation, pathway, practitioners, calculator, stories/tips, homepage/404
- **12 pages built**, 0 errors, 0 warnings from `astro check`
- **Live at healthmaps.com.au** — deployed via Netlify
- **Health content needs review** — all AI-drafted health claims are marked with `<!-- REVIEW -->` comments

## Next Steps
1. Review all `<!-- REVIEW -->` comments in `src/content/` Markdown files for health accuracy
2. Replace fictional user stories with real ones (or verify they're clearly marked as illustrative)
3. Lighthouse audit (target 95+ all categories)

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

### Colours (defined in global.css @theme)
- Heading: `#0f172a` (--color-heading / text-heading) — all headings
- Body text: `#64748b` (--color-body / text-body) — paragraph text
- Primary green: `#44EE70` (--color-primary / text-primary) — buttons, links, interactive elements (dark text on green buttons for contrast)
- Icon background: `#f0fdf4` (--color-icon-bg / bg-icon-bg) — green-tint square behind icons
- Light background: `#f8fafc` (--color-bg-light / bg-bg-light)
- Border: `#e5e7eb` (--color-border / border-border)
- Orange: `#D97706` (brand-orange) — functional labels only (e.g. "Required")
- Backward-compatible aliases still work: brand-blue (`#0f172a`), brand-green (`#44EE70`), brand-green-light (`#f0fdf4`)

### Typography
- Font: Inter (locally bundled via @fontsource)
- Body: 16px, line-height 1.625, antialiased
- Hero heading: 56px, font-bold, tracking -0.025em, text-heading
- Section headings (h2): 36–40px, font-bold
- Card headings (h3): 24px (text-2xl), font-bold, text-heading
- Small/meta text: 14px, text-gray-500

### Spacing
- Hero: pt-20 pb-12 md:pt-32 md:pb-16 (homepage), py-16 md:py-20 (inner pages)
- Explore Tools (below hero): pt-4 pb-24 md:pt-8 md:pb-32
- Section-to-section: py-24 md:py-32 (homepage), py-16 md:py-20 (inner pages)
- No `<hr>` dividers on homepage (removed)
- Body text max-width: 720px
- Card grid max-width: 960px
- Page container: 1280px (max-w-6xl)
- Feature card padding: p-12 (48px)
- Feature card grid gap: gap-12 (48px)
- Icon-to-heading gap: mb-8 (32px)

### Components
- Buttons: rounded-xl, bg-primary for primary (homepage), bg-brand-green on inner pages
- Feature cards (homepage): bg-white rounded-xl p-12 shadow-sm text-left, no border, FAQ-style question headings
- Feature card icons: w-16 h-16 rounded-xl bg-icon-bg with text-primary SVG
- Card hover: subtle shadow only (no lift) via .card-hover class
- Header: opaque white, no bottom border, wider padding (px-4 sm:px-8 lg:px-20 py-8)
- Accordions: native `<details>`/`<summary>`, CSS chevron rotation, .accordion-item class

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
