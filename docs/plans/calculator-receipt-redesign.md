# Cost calculator redesign — the answer is a receipt

> **Partly superseded (July 2026):** the 10-session defaults and session stepper described below were replaced by a single-session framing — see `calculator-single-session.md`.

## Context

Third autonomous pick; user suggested improving the frontend design of the cost calculator ("be creative"). Current state (verified in browser + code): the calculator still wears the site's *old* design idiom — white card + shadow, cool-grey borders, `font-bold` headings — while the pathway page moved to the newer flat paper-cream/sage/ink-green language. Worse, the answer to the user's actual question ("what will I pay?") is one of four identical grey stat tiles, bottom-right, below the fold, and only appears after clicking "Calculate My Costs".

**Design thesis:** the page's one job is producing a number for an anxious person. The signature element is the results panel rebuilt as a **paper receipt** — a tally with dotted leaders where "Medicare pays back −$989.50" is a visible green subtraction (the subtraction IS the site's core lesson), a hairline rule, and a big Switzer "You pay" total. Calculation goes live (no submit button; fee prefilled with the practitioner's typical mid value), and the receipt sits beside the form on desktop, always visible. Everything else stays quiet: same controls (recent radio-cards/stepper/pills work is kept), same maths, same data.

## Changes

### 1. `src/components/CostCalculator.astro` — restructure

- **Shell** (line 10): `bg-white rounded-xl shadow-sm p-8 md:p-10` → `bg-paper-cream border border-ink-green/16 rounded-[14px] p-6 sm:p-8 md:p-10` (PathwayQuiz.astro:49 family). Inside: `grid gap-8 md:grid-cols-[1fr_minmax(280px,0.85fr)] md:gap-10` — form left, receipt right in `md:sticky md:top-24 md:self-start`; stacks on mobile (form first in source).
- **Frontmatter**: drop the Button import; add SSR defaults (`defaultPrac` = first practitioner, `defaultFee` = its `mid` (220), 10 sessions, bulk-billed) and an en-AU currency formatter so the receipt renders real figures server-side (no-JS fallback + no flash).
- **Practitioner radio cards**: inside the existing `optionCard` span, wrap content in a block and add a meta line: `Rebate $X per session` in `mt-0.5 block text-[13px] font-normal leading-snug text-meta-sage` (data: `practitionerTypes[].rebatePerSession`).
- **Fee input**: add `value={defaultFee}`; SSR the fee hint text ("Typical range: $150–$300").
- **Stepper + bulk-billed pills**: unchanged.
- **Delete** the submit `<Button>` and the whole hidden results block (lines 96–125).
- **Receipt panel** (new, right column): white slip `bg-white border border-ink-green/12 rounded-[10px] p-5 sm:p-6` containing:
  - Eyebrow: `text-[11.5px] font-semibold uppercase tracking-[0.08em] text-meta-sage` — "Your estimate"
  - Three tally rows (`flex items-baseline gap-2`, `text-[15px]`): label (`text-body`), dotted leader (`min-w-4 flex-1 border-b border-dotted border-ink-green/25` `aria-hidden`, baseline-aligned via flex baseline synthesis from border-box), amount (`font-medium tabular-nums`): "{n} sessions × $fee" / "Medicare pays back" with amount `−$X` in `text-primary` / "GP visits × {1|2} (referral | plan | plan + review)".
  - Total: `border-t border-hairline pt-4`, row with `aria-live="polite" aria-atomic="true"` — "You pay" + `font-display font-semibold text-[34px] leading-none tracking-[-0.02em] text-heading tabular-nums`.
  - Per-session note `text-[13px] text-meta-sage`: "That's $X per session after the rebate." (hidden when gap = 0; doubles as the "Enter a session fee…" prompt in the empty state).
  - Existing disclaimer + Services Australia fine print moves below the slip, classes unchanged.
- **Script tag** becomes `<script> import '../scripts/cost-calculator.ts'; </script>` (pattern: PathwayQuiz.astro:151, PractitionerBubbleMap.astro:134 — also fixes the inline-script HMR pain in CLAUDE.md).

### 2. New `src/scripts/cost-calculator.ts`

- Imports `../data/calculator-costs.json` directly (same source the frontmatter uses; repo pattern per pathway-quiz.ts — no serialization layer).
- Ports the existing maths **verbatim** (current inline script lines 173–219): `totalFees = fee×n`; `totalRebate = rebate×n`; `gpVisits = requiresMHCP && n>6 ? 2 : 1`; `gpCost = bulkBilled ? 0 : 40×visits`; `outOfPocket = max(0, fees−rebate+gp)`; `gapPerSession = max(0, fee−rebate)`. Sessions clamp 1–10 with stepper disabled states (existing logic kept).
- Live render on form `input`/`change`; radio change re-prefills fee **unless** the user edited it (dirty flag; empty field always re-prefills); `focus` on fee selects all; form `submit` preventDefault (Enter key guard).
- Empty/invalid fee (≤0/NaN) → all amounts show `—` (em dash), note says "Enter a session fee to see your estimate.", never NaN.
- `Intl.NumberFormat('en-AU', currency)` for all figures (thousands separators for big fees).

### 3. `src/pages/calculator.astro` — page idiom

- Hero: add kicker `text-[13px] font-semibold uppercase tracking-[0.13em] text-primary` ("Costs & rebates"); h1 → `font-display font-semibold text-[32px] md:text-[40px] tracking-[-0.02em] text-heading`.
- Calculator section: **remove `bg-paper-cream`** (body is `bg-page-sage` per BaseLayout.astro:62 — cream card floats on sage like pathway); container `max-w-xl` → `max-w-4xl`.
- "How Medicare Rebates Work" h2 and "Next steps" h2 → `font-display font-semibold` + `tracking-[-0.02em]` (24–28px / 22–24px).
- "Next steps" secondary link → flat pathway secondary style: `rounded-[10px] border border-ink-green/16 bg-transparent hover:bg-row-hover px-6 py-[13px] font-semibold text-heading min-h-11` (PathwayQuiz.astro:109 vocabulary). Primary `Button` CTA untouched.

### 4. No global.css changes

`tabular-nums` is stock Tailwind v4; all colours are existing tokens (`ink-green/12|16|25`, `hairline`, `meta-sage`, `paper-cream`, `row-hover`, `primary`, `heading`, `body`).

## Verified constraints

- All four `rebatePerSession` values > 0; both psychiatrist entries `requiresMHCP: false` (never 2 GP visits); mids 220/260/600/300; `gpCostPrivate` 40 — from calculator-costs.json.
- Maths and calculator-costs.json untouched; no health-claim copy changes beyond receipt labels ("GP visits × 2 (plan + review)" mirrors existing breakdown copy "2 (MHCP + review)").
- Vanilla TS only; crisis banner untouched.

## Verification

1. `npx astro check` clean; dev server, `/calculator/`.
2. Default receipt on load: fee prefilled 220, total $1,210.50, no hidden state.
3. Cycle practitioners with untouched fee → prefills 220/260/600/300, rebate meta correct on each card, receipt updates live. Edit fee then switch → fee stays (dirty). Clear fee then switch → re-prefills.
4. Stepper bounds (disabled at 1 and 10; typed 50 clamps); sessions 6→7 with psychologist flips GP line to "× 2 (plan + review)" ($80 when not bulk-billed); psychiatrists stay × 1.
5. Bulk-billed toggle: $0.00 ↔ $40/$80; total updates. Clear fee: em-dashes, prompt, no NaN.
6. Mobile 390px (browser device emulation if window resize is refused): single column, receipt below form, no overflow with $10,000.00 totals; md+: two columns, receipt sticky under header.
7. Screenshots before/after to `docs/` per repo convention; `npm run build` + preview pass.
8. Commit(s), no push (deploy is user's call).

## Files

- `src/components/CostCalculator.astro` (restructure)
- `src/scripts/cost-calculator.ts` (new)
- `src/pages/calculator.astro` (idiom + layout)
- References: `src/components/PathwayQuiz.astro`, `src/components/WayRow.astro`, `src/data/calculator-costs.json` (read-only)
