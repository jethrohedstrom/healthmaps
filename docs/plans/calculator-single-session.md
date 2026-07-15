# Calculator reframe: one session, not a course of ten

## Context

The cost calculator currently defaults to 10 sessions everywhere — the SSR receipt shows "10 sessions × $220 … You pay $1,210.50", the stepper starts at the Medicare cap, and the helper copy talks about the yearly limit. That matches how a finance-tracker thinks, but most visitors are just wondering "what does one session cost me?" — and a four-figure "course of treatment" total can feel prohibitive, the opposite of the site's purpose. Reframe the calculator around a single session.

Decisions made with Jethro:
- **Remove the session-count stepper entirely** — the calculator becomes purely per-session.
- **GP visit stays, as a one-off line** — clearly separated below the total, driven by the existing bulk-billed toggle. Not summed into the headline number.
- **"You pay per session" = fee − rebate** — the headline number people compare and remember.
- The "up to 10 sessions per calendar year" rule stays as education in the explainer section below the calculator (and site-wide copy is untouched).

## Files to change

### 1. `src/components/CostCalculator.astro`
- **SSR frontmatter:** drop `defaultSessions` / `maxMedicareSessions` usage. New SSR values: `ssrFee = defaultRange.mid` (220), `ssrRebate = defaultPrac.rebatePerSession` (98.95), `ssrPerSession = max(0, fee − rebate)` (121.05), `ssrGpCost = 0` (bulk-billed default). No more `> 6 → 2 GP visits` logic.
- **Form:** delete the whole "Number of sessions" stepper block (`#sessions-minus` / `#num-sessions` / `#sessions-plus`) and its "Medicare rebates cover up to 10 sessions per calendar year" helper line. Practitioner radios, session-fee input, and GP bulk-billed pills stay as-is.
- **Receipt:** restructure to:
  - `Session fee ……… $220.00` (label no longer "10 sessions × $220"; keep `data-receipt-fees` hooks)
  - `Medicare pays back ……… −$98.95` (unchanged, green)
  - hairline rule, then big total labelled **"You pay per session"** (`data-receipt-total`, keep `aria-live="polite"`)
  - below the total, a visually separated one-off block: small label like "One-off to get started:" then `GP visit (care plan) ……… $0.00` (reusing `data-receipt-gp-label` / `data-receipt-gp`). Label says "(care plan)" for MHCP practitioners, "(referral)" for psychiatrist options — same distinction `gpVisitLabel()` makes today, minus the ×2 review case.
  - The old note "That's $X per session after the rebate" is now redundant — replace `data-receipt-note` with a small-print context line: "Medicare covers up to 10 sessions like this each calendar year." (educates without course framing). The empty-fee state still swaps it for "Enter a session fee to see your estimate."
- Disclaimer + Services Australia link + lastUpdated line unchanged.

### 2. `src/scripts/cost-calculator.ts`
- Remove `MIN_SESSIONS` / `MAX_SESSIONS`, `getSessions()` / `setSessions()`, stepper element refs and their listeners.
- `render()` simplifies to: `gpCost = gpBulkBilled ? 0 : 40` (one visit, always), `perSession = max(0, fee − rebate)`; write fee row, rebate row, total, GP one-off amount + label. Keep `feeDirty` / `prefillFee()` / `updateFeeHint()` behaviour and the null-fee `—` state exactly as they are.
- `gpVisitLabel()` shrinks to the care-plan/referral distinction (no `sessions > 6` branch).

### 3. `src/pages/calculator.astro`
- Hero sub-copy: singular framing, e.g. "Estimate what you'll pay out-of-pocket for a mental health session after the Medicare rebate."
- "How Medicare Rebates Work" section **stays as-is** — the 10-per-year and 6-session-review facts remain as education below the tool.

### 4. `src/data/calculator-costs.json`
- No change. Rebates are already per-session. `maxMedicareSessions` becomes unused by the code but stays (documented Medicare fact, referenced by reviewNotes).

Also: save this plan into `docs/plans/calculator-single-session.md` at implementation start (per CLAUDE.md), and note the redesign plan `docs/plans/calculator-receipt-redesign.md` describes the superseded 10-session defaults.

## Not in scope
- Site-wide "10 sessions" copy (pathway cards, MHCPInline, content markdown) — those describe Medicare rules, not calculator framing.
- Homepage calculator-card copy already reads per-session ("common session types") — fine as-is.

## Verification
1. `npx astro check` — 0 errors/warnings.
2. Dev server (user's terminal tab): load `/calculator/`.
   - Default receipt: Session fee $220.00, Medicare pays back −$98.95, **You pay per session $121.05**, one-off GP visit $0.00.
   - Switch GP toggle to "No" → GP one-off becomes $40.00; headline total does **not** change.
   - Switch to Clinical psychologist → fee prefills 260, rebate 145.25, total $114.75, GP label still "(care plan)".
   - Switch to Psychiatrist (initial) → fee 600, rebate 262.10, total $337.90, GP label "(referral)".
   - Type a custom fee → total updates live; clear the fee → all amounts show "—" and note reads "Enter a session fee to see your estimate."
   - No JS: view-source/SSR output already shows the correct default receipt.
3. Mobile 390px: receipt stacks under the form, one-off block reads clearly.
4. Grep `src/` for `num-sessions|sessions-minus|sessions-plus|MAX_SESSIONS` → no live references remain.

## Addendum (July 2026): card note

Follow-up shipped after the reframe: a small-print note under the "You pay per session" total — "Have $220 on your card on the day — you can pay with any card, but the rebate can only go back onto a debit card" (amount tracks the fee input; hidden in the empty-fee state, hook `data-receipt-card-note`). A matching "on the day" paragraph was added to the How Medicare Rebates Work explainer covering both rebate paths (on-the-spot Easyclaim → eftpos debit card only; Medicare app/myGov → registered bank account, ~1–2 days). Both claims carry `<!-- REVIEW -->` flags. Verified against Services Australia Easyclaim pages and Tyro Health's eligible-cards article, July 2026.
