---
description: Typography rules for all source files
globs: src/**/*
---

# Typography Rules

- Headings (h1, h2, h3) MUST use `font-family: var(--font-display)` (Switzer)
- Body text uses `font-family: var(--font-sans)` (Switzer) — this is the default on `<body>`
- Both `--font-display` and `--font-sans` resolve to Switzer — one font for the whole site
- Section labels use spaced uppercase: `uppercase tracking-widest text-sm text-primary`
- NEVER use Inter, Roboto, Arial, Open Sans, or Lato
- NEVER hardcode font-family values — always reference the CSS custom properties
- This project uses Tailwind CSS v4 with CSS-first `@theme` config in `src/styles/global.css` — NOT a tailwind.config.js file
