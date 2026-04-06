# HealthMaps — Claude Code Instructions

## Project Overview

HealthMaps helps Australians figure out where to start with mental health support, and understand how the system actually works. The core problem: people either don't know what to do first (decision paralysis), or they're already in the system but missing practical knowledge — like the fact that you can research and choose a specific psychologist before asking your GP for the referral. The site explains options, costs, and next steps in plain language.

## Workflow Process (added March 9th 2026)

- **Brainstorm before building.** For any new feature, ask me questions one at a time to clarify what we're doing before writing any code. Multiple choice where possible.
- **Small chunks only.** When describing designs or plans, keep each response to 200-300 words max, then check in with me before continuing.
- **Plan into a file.** Write implementation plans into docs/plans/ so a fresh session can pick them up cold.
- **Don't leap into code.** Planning and design must be agreed before any implementation starts. If I haven't said "go", don't start building.
- **/clear between task chunks.** After completing a group of tasks, /clear and start fresh rather than /compact. Stale context causes errors.
- **Code review framing.** If I paste external review feedback, treat the reviewer as a job candidate — evaluate whether their suggestions are correct before acting on them.

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
├── fonts/
│   ├── GeneralSans-Variable.woff2   General Sans — body (Fontshare)
│   └── Switzer-Variable.woff2       Switzer — headings (Fontshare)
└── styles/
    └── global.css             Tailwind v4 @theme tokens + font-faces
```

## Critical Rules

1. **Crisis numbers on every page** — CrisisBanner.astro must appear on all pages via BaseLayout. Never remove it.
2. **All health content must be flagged** — use `<!-- REVIEW -->` comments on any AI-drafted health claims.
3. **MHCPs cannot be "transferred"** — they must be updated/rewritten by a GP. This is a known LLM error.
4. **No JS frameworks** — vanilla JS only for interactivity.
5. **Australian context** — costs in AUD, Medicare/GP/MHCP terminology, Australian crisis numbers.

Design system tokens and rules: see `.claude/rules/design.md`

## Git & Deploy

- Commit after each meaningful change, push to `main`
- Netlify auto-deploys on push — no manual deploy step needed

## Commands

- `npm run dev` — start dev server at localhost:4321. **Run this in a separate terminal tab**, not as a Claude Code background task — background tasks die when you `/clear` or start a new session.
- `npm run build` — production build to `dist/`
- `npx astro check` — type/build error checking

**Known issue:** Vite HMR sometimes fails to pick up changes to inline `<script>` tags in `.astro` components. If edits don't take effect after a browser hard-refresh, restart the dev server (`Ctrl+C` then `npm run dev`). Verify by curling the compiled JS URL to confirm the server is serving updated code. The practitioner bubble map script is in `src/scripts/practitioner-bubble-map.ts` (imported from the component) so its logic hot-reloads with the normal JS pipeline.

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

## Obsidian Vault

Project research, design notes, user testing, meeting notes, and planning docs live in Obsidian:
`/Users/jethrohedstrom/Library/Mobile Documents/iCloud~md~obsidian/Documents/Healthcare Navigation Project /`

Read from this vault when you need background context on design decisions, target audience, information architecture, or project direction.

**Obsidian CLI** (`obsidian-cli`) — requires Obsidian to be running:
- `obsidian search query="mental health plan"` — search notes
- `obsidian read path="Design/tokens.md"` — read a specific note
- `obsidian daily` — open/create today's daily note
- `obsidian create` — create a new note

