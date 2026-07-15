---
description: Design direction, tokens, typography, spacing, and component rules
globs: src/**/*
---

# Design System

## Design Direction

Health Maps should feel like a calm, credible friend who happens to know how the system works — unhurried, generous with space, never overwhelming. The design prioritises clarity above all else: deep forest green, clean sans-serif typography, and wide open whitespace that makes every option and next step immediately obvious. It's closer to a Scandinavian public health site than an Australian wellness startup.

Reference sites: nhn.no (NHN), app.oevra.com, getmosh.com.au. Screenshots in `design input/`.

## Design Tokens (defined in src/styles/global.css @theme)

### Colours — forest green palette, no warm accent

- Primary: `#1B6B4A` (--color-primary) — buttons, links, interactive elements (white text on green)
- Primary light: `#E8F5EE` (--color-primary-light) — light wash backgrounds, icon backgrounds
- Primary mid: `#3A8F68` (--color-primary-mid) — secondary green for subtle variation
- Heading: `#1e293b` (--color-heading) — all headings
- Body text: `#475569` (--color-body) — paragraph text
- Border: `#e5e7eb` (--color-border)
- Light background: `#f8fafc` (--color-bg-light)
- Amber: `#D97706` (--color-accent-amber) — functional labels only (e.g. "Required")
- **Never use raw hex values or default Tailwind colours (bg-blue-500 etc). Always use @theme tokens.**

### Typography

- **Headings:** Switzer (variable, locally bundled from Fontshare)
- **Body:** General Sans (variable, locally bundled from Fontshare)
- Headings use `font-family: var(--font-display)` (Switzer), body uses `font-family: var(--font-sans)` (General Sans)
- **Never use** Inter, Roboto, Arial, Open Sans, or Lato
- Body: 16px, line-height 1.625, antialiased
- Hero heading: 56px, font-bold, tracking -0.025em, text-heading
- Section headings (h2): 36–40px, font-bold
- Card headings (h3): 24px (text-2xl), font-bold, text-heading
- Section labels: spaced uppercase (tracking-widest, uppercase, text-sm)
- Small/meta text: 14px, text-gray-500
- **Tailwind v4** — CSS-first config via `@theme` directive in global.css. NOT tailwind.config.js.

### Spacing

- Generous whitespace is the #1 priority — this is what separates premium from generic
- Hero: pt-20 pb-8 md:pt-32 md:pb-12 (homepage), py-16 md:py-20 (inner pages)
- Section-to-section: py-24 md:py-32 (homepage), py-16 md:py-24 (inner pages)
- Body text max-width: 720px
- Card grid max-width: 960px
- Page container: 1280px (max-w-6xl)
- Feature card padding: p-12 (48px)
- Feature card grid gap: gap-12 (48px)

### Components

- Buttons: rounded-xl, bg-primary text-white, px-10 py-4, font-semibold, shadow-sm
- Feature cards: bg-white rounded-xl p-12 shadow-sm text-left, plus `border border-pencil`
- Inner page cards: bg-white rounded-xl p-8 md:p-12 shadow-sm, card-hover on `<a>` wrapper
- Pencil border rule (`border-pencil`, #3C5A4B): every standalone page-level box carries the pencil frame — header/footer rules, feature/tip cards, tool shells (pathway quiz, calculator), tinted callouts and asides (`bg-primary-light`, `bg-bg-light`, `bg-paper-cream`), accordions, the disclaimer crisis callout. Internal furniture inside those boxes (inputs, option cards, receipts, dividers, small buttons) uses the softer `ink-green/16`, `ink-green/12`, `hairline`, or `border-border` tokens — the dark frame vs light inner rules contrast is the hierarchy. Floating elements (modals, popovers, pills) are shadow-only, never pencil-bordered.
- Card hover: subtle shadow only (no lift) via .card-hover class
- Header: opaque white, no bottom border, wider padding (px-4 sm:px-8 lg:px-20 py-4)
- Accordions: native `<details>`/`<summary>`, CSS chevron rotation, .accordion-item class
- Icon containers: rounded-xl bg-primary-light with text-primary SVG
