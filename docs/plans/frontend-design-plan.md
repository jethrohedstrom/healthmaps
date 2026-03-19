# Health Maps — Front-End Design Implementation Plan

A flexible roadmap for getting designer-grade output from Claude Code, combining insights from multiple research sources. Not a rigid checklist — more like a trail map with phases you can move through at your own pace.

---

## Phase 0: Gather the design direction (do this first)

Before touching any code or config, nail down what Health Maps should actually *look* and *feel* like.

- Review Bec's reference URLs together (with Claude or in conversation with Bec)
- For each reference, note what specifically works: colour palette? typography? spacing and whitespace? layout patterns? tone/personality?
- Decide on an "aesthetic extreme" — the frontend-design skill works best when you commit to a strong direction (e.g., "editorial and restrained" or "clinical but warm") rather than "clean and modern"
- Collect 3–5 screenshots that represent the target vibe
- Write a short plain-English design brief: 2–3 sentences describing what Health Maps should feel like to a first-time visitor

This phase is design thinking, not engineering. It's the most important phase.

### Phase 0 findings (19 March 2026)

**References reviewed:**
- nhn.no (Norsk Helsenett) — Norwegian national health network. Scandinavian government design. Forest green + mint on white, generous whitespace, custom SVG illustrations, clean typography hierarchy.
- getmosh.com.au (MOSH) — Australian men's health telehealth. Deep green full-screen backgrounds for guided flows, warm serif heading font, terracotta CTA accent, dead-simple one-question-at-a-time UI pattern.
- cmedical.no (CMedical) — Scandinavian private clinic. Split-screen hero layouts, warm earthy tones, serif typography, editorial/magazine feel.
- app.oevra.com (Oevra) — Creative practice app. Ultra-light heading weight, spaced uppercase section labels, soft sage green washes, extremely generous spacing, minimal card treatments.

**Design direction — what we're taking forward:**

Colour: 3-colour max palette. One deep/calm green (PRIMARY — current green is too harsh/bright, needs to be deeper and more sophisticated, closer to NHN's forest green). One light green for subtle backgrounds/washes. One warm accent (experimenting with terracotta/burnt orange — LOW CONFIDENCE, may change). White for main backgrounds. No gradients, no competing greys.

Typography: Serif font for headings (HIGH CONFIDENCE). Clean sans-serif for body text. Strong weight contrast between headings and body. Spaced uppercase for section labels (the Oevra pattern). Avoid Inter, Roboto, and other generic defaults.

Spacing: Dramatically generous — this is the #1 differentiator between "AI-looking" and these references. Every reference site looks premium primarily because of whitespace. Hero sections: content in left half, right half open. Section padding: minimum py-16 md:py-24.

Tone: Credible, calm, unhurried. Not corporate, not wellness. One humanising touch per section. Copy/tone is Health Maps-specific and needs its own attention — don't just lift from references.

UI patterns to adopt: NHN-style shortcut cards (icon + title + description, minimal treatment). MOSH-style full-screen guided flows for future questionnaire/matching tool (dark green background = "you're in a guided flow now"). Oevra-style section labels and staggered text layout.

**Confidence levels:**
- HIGH: Generous whitespace as priority, serif headings, restrained palette, overall tone
- MEDIUM: The green needs to be deeper/calmer — exploring options
- LOW: Warm accent colour — trying terracotta but not committed

### Phase 0 decisions locked (19 March 2026)

**Fonts:** Fraunces (serif) for headings, Satoshi (sans-serif, Fontshare) for body text.

**Palette:** Green-only, no warm accent.
- Primary: `#1B6B4A` (forest green)
- Light wash: `#E8F5EE`
- Mid green: `#3A8F68`
- Surface: `#FFFFFF`
- Heading: `#1e293b`
- Body text: `#64748b`

**Design brief:**
Health Maps should feel like a calm, credible friend who happens to know how the system works — unhurried, generous with space, never overwhelming. The design prioritises clarity above all else: deep forest green, serif headings, and wide open whitespace that makes every option and next step immediately obvious. It's closer to a Scandinavian public health site than an Australian wellness startup.

**Reference screenshots:** saved in `design input/` (NHN x3, Oevra x2, MOSH x1).

---

## Phase 1: Lock in the design token system

This is the technical foundation that prevents Claude Code from inventing random styles. Everything else builds on this.

### 1a. Define your colour palette in OKLCH

OKLCH is a colour format where "lightness" actually looks uniform to the human eye (unlike hex, where two colours at the same lightness can look totally different). Tailwind v4 supports it natively.

Pull exact colour values from Bec's references (use a browser colour picker extension like ColorZilla), then convert to OKLCH and define them in your global CSS file using Tailwind v4's `@theme` directive.

What you're creating: a single CSS file that is the "source of truth" for every colour, font, and spacing value on the site.

```css
/* Example structure — actual values come from Bec's references */
@import "tailwindcss";

@theme {
  /* Colours in OKLCH for perceptual uniformity */
  --color-primary: oklch(59% 0.15 160);      /* your main green */
  --color-primary-light: oklch(72% 0.12 160);
  --color-primary-dark: oklch(45% 0.15 160);
  --color-accent: oklch(72% 0.18 45);
  --color-surface: #FFFFFF;
  --color-surface-alt: #F9FAFB;
  --color-foreground: #111827;
  --color-muted: #6B7280;
  --color-border: #E5E7EB;

  /* Typography */
  --font-display: "Your Display Font", sans-serif;
  --font-sans: "Your Body Font", sans-serif;

  /* Spacing scale (optional but useful) */
  --spacing-section: 6rem;
  --spacing-section-md: 4rem;
}
```

Once this exists, you tell Claude Code: "ONLY use colours and fonts from @theme. Never use raw hex values or default Tailwind colours like bg-blue-500."

### 1b. Choose and install fonts

Pick a display font (headings) and a body font (everything else) based on Bec's references. The frontend-design skill explicitly bans Inter, Roboto, Arial, Open Sans, and Lato — so choose something with more character.

Good free options to consider: Satoshi, Clash Display, General Sans, Cabinet Grotesk, Crimson Pro, Space Grotesk. Google Fonts and Fontshare are the main sources.

### 1c. Verify your Tailwind v4 setup

You're on Astro v5 — make sure you're using the Tailwind v4 Vite plugin (not the old @astrojs/tailwind integration). This matters because Tailwind v4 uses `@theme` in CSS rather than a JavaScript config file. Claude Code's training data is heavily biased toward Tailwind v3 patterns, so you need to explicitly tell it which version you're on.

---

## Phase 2: Configure Claude Code's design memory

Three layers, from most persistent to most detailed.

### 2a. Update CLAUDE.md (keep it under 150 design-related lines)

Add a concise design section covering:
- The aesthetic direction in plain English (from Phase 0)
- Which fonts to use and which to never use
- That all colours must come from @theme tokens (never raw hex or default Tailwind)
- That the project uses Tailwind v4 (CSS-first, @theme directive — NOT tailwind.config.js)
- Where to find the design tokens file
- Reference to any existing component patterns to reuse

### 2b. Set up path-scoped rules in .claude/rules/

This is a more granular approach than putting everything in CLAUDE.md. Create topic-specific rule files that only load when Claude is editing relevant files:

```
.claude/rules/
  typography.md      → scoped to src/**/*
  color-system.md    → scoped to src/styles/*.css
  spacing.md         → scoped to src/components/*.astro
  components.md      → scoped to src/components/**/*
```

Each file contains focused instructions for that domain. This keeps context lean — Claude only loads the typography rules when it's actually working on typography-related files.

### 2c. Create a detailed design skill (optional but powerful)

If your design system has more detail than fits in rules files — full brand guidelines, component patterns, animation preferences — create a skill at `.claude/skills/design-system/SKILL.md`. Skills use progressive disclosure (only loaded when Claude determines they're relevant), so they don't eat into your context budget on non-design tasks.

---

## Phase 3: Set up the visual feedback loop

Claude Code is blind — it writes code but can't see the rendered result. You need a way to close this gap.

### Option A: Claude in Chrome extension (recommended for you)

Start Claude Code with `claude --chrome`. This lets Claude Code open your localhost dev server in Chrome, take screenshots, compare to references, and iterate. This is probably the simplest path for your workflow.

### Option B: Playwright MCP server

Install with `claude mcp add playwright npx @playwright/mcp@latest`. More powerful but more setup. Useful if Option A doesn't work smoothly.

### Option C: Manual screenshot paste (always works)

Build a component → open in browser → screenshot → paste into Claude Code terminal (Ctrl+V) with "Compare to this reference and improve." Works with any setup, just slower.

The workflow regardless of option: paste Bec's reference screenshot → ask Claude Code to implement → screenshot the result → compare → iterate until it matches.

---

## Phase 4: Install supporting MCP tools

In priority order:

1. **Frontend-design skill** — already installed
2. **Claude in Chrome** — for the visual feedback loop (Phase 3)
3. **TailwindCSS MCP server** — helps Claude use correct utility classes and avoids hallucinating non-existent ones. Install: `npx -y tailwindcss-mcp-server`
4. **Astro Docs MCP server** — gives Claude real-time access to current Astro v5 docs, preventing outdated patterns
5. **Context7 MCP** — serves version-specific library documentation. Install: `npx -y @upstash/context7-mcp@latest`

Don't install everything at once. Start with #2 and #3, add more if you find you need them.

---

## Phase 5: Implementation workflow (page by page)

Once the foundation is set, this is the repeating cycle for each page or section:

1. **Paste the reference** — screenshot of Bec's reference or the target website section
2. **Describe the intent** — "Match this hero section's typography hierarchy and spacing ratios, using our Health Maps design tokens"
3. **Let Claude Code build** — it should now be constrained to your token system
4. **Screenshot the result** — via Chrome extension or manually
5. **Compare and iterate** — "The heading needs more weight contrast. The spacing between the subtitle and CTA is too tight compared to the reference"
6. **Commit when happy** — then `/clear` before moving to the next section

Work section by section (header, hero, content blocks, footer) rather than asking for a whole page at once. This produces much better results because Claude can focus its context on one visual problem at a time.

### The variant technique (for when you're stuck)

If Claude keeps producing generic output for a section, ask for "5 completely different aesthetic variants of this section — not tweaks, completely different visual personalities." Pick the closest one, then refine from there. This sidesteps the convergence problem.

---

## Phase 6: Polish with Cursor

After Claude Code has built the structure and applied the design system, switch to Cursor for fine-tuning:
- Visual tweaks (2px margin adjustments, colour shade refinements)
- Responsive breakpoint polish
- Hover states and micro-interactions
- Anything where seeing the code inline next to a live preview helps

Both tools read the same CLAUDE.md, so your design system stays consistent.

---

## Important cautions

- **Security:** 36% of community skills contain prompt injection (Snyk research). Only install official Anthropic skills and well-known community sources. Always review skill file contents before installing.
- **Context degradation:** Output quality drops as Claude Code's context fills up. Use `/clear` between major design tasks. Don't try to redesign the whole site in one session.
- **Tailwind version confusion:** Claude defaults to v3 patterns. Explicitly state "Tailwind v4, CSS-first, @theme directive" in CLAUDE.md and at the start of sessions.
- **Don't overbuild without validation:** After each major section, open it on a real device and show it to someone who hasn't seen it before.
- **Short sessions:** Your productive window is 8am–1pm. Plan for one phase per session, not three.

---

## Rough session plan (flexible)

| Session | Focus |
|---------|-------|
| 1 | Phase 0: Review Bec's references, define aesthetic direction |
| 2 | Phase 1: Set up design tokens, choose fonts, verify Tailwind v4 config |
| 3 | Phase 2: Update CLAUDE.md, create rules files |
| 4 | Phase 3 + 4: Set up Chrome extension, install MCP tools |
| 5+ | Phase 5: Start implementing page by page, section by section |

These could be spread across multiple build days. No rush — getting the foundation right (Phases 0-2) before touching page code is the whole point.
