---
description: Colour system rules for stylesheets
globs: src/styles/*.css
---

# Colour System Rules

- ALL colours must come from `@theme` tokens defined in `src/styles/global.css`
- NEVER use raw hex values outside of the `@theme` block
- NEVER use default Tailwind colour classes (bg-blue-500, text-green-600, etc)
- Use semantic token names: `bg-primary`, `text-primary`, `bg-primary-light`, `text-heading`, `text-body`, `border-border`
- The palette is green-only — no warm accent colours, no gradients
- Primary green (`#1B6B4A`) uses white text for contrast, not dark text
- When adding new colours, add them as tokens in `@theme` first
