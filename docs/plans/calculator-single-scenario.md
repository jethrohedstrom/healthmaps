# Simplify the cost calculator to one scenario

## Context

The calculator currently offers four practitioner types (general / clinical psychologist, psychiatrist initial / follow-up). The user wants it reduced to the single most common scenario: GP mental health treatment plan → general psychologist (MBS item 80110). At the same time, apply the 1 July 2026 indexation (2.6%): rebate $98.95 → **$101.55**, and bump the "last checked" label to September 2026. Add one "Over 10 sessions" line to the estimate panel. **No restyling.**

Out of scope (flag to user afterwards, don't touch): `$98.95` / `$145.25` also appear in `src/content/practitioners/psychologist.md`, `mental-health-social-worker.md`, `mental-health-occupational-therapist.md`, `src/content/tips/reduce-costs.md`, and `src/scripts/practitioner-bubble-map.ts:47,59,75`. The "How Medicare Rebates Work" copy in `calculator.astro` contains **no** dollar figures, so nothing to correct there.

## Files to change

### 1. `src/data/calculator-costs.json`
Flatten to a single scenario. Keep the shape simple so the component and script read one rebate:
```json
{
  "lastUpdated": "2026-09-03",
  "note": "...unchanged...",
  "reviewNotes": [
    "General psychologist rebate = MBS item 80110, $101.55 from 1 Jul 2026 (2.6% indexation; was $98.95 from 1 Jul 2025). Verified 2026-09-03.",
    "Calculator simplified to one scenario (GP MHTP → general psychologist) Sep 2026. Clinical psychologist / psychiatrist figures removed — see git history before this change if they're needed again.",
    "Next indexation expected 1 Jul 2027 — re-check after that date."
  ],
  "rebatePerSession": 101.55,
  "mbsItem": "80110",
  "sessionFeeRange": { "low": 150, "mid": 220, "high": 300 },
  "maxMedicareSessions": 10,
  "gpCostBulkBilled": 0,
  "gpCostPrivate": 40
}
```
Drop `practitionerTypes` and `sessionFeeRanges` (the bubble-map comments cite this file as a "source" for psychiatrist figures; those comments still hold via git history — leave them).

### 2. `src/components/CostCalculator.astro`
- Frontmatter: replace `practitionerTypes` / `feeRanges` / `defaultPrac` / `defaultRange` with `const rebate = costsData.rebatePerSession;` and `const range = costsData.sessionFeeRange;`. Keep `optionCard`, `receiptRow`, `receiptLeader`, `aud`, `ssrGpCost` as-is.
- Delete the whole `<!-- Practitioner type -->` fieldset (lines 27–53). Session fee input and GP bulk-billed fieldset stay byte-for-byte (placeholder/hint now read from `range`).
- Receipt panel: add one line for the 10-session total. Place it inside the existing "One-off to get started" block, directly under the GP visit row, as a `receiptRow` (same classes, no new styles):
  ```html
  <div class={`mt-2.5 ${receiptRow}`} data-receipt-ten-row hidden>
    <span class="text-body">Over 10 sessions</span>
    <span class={receiptLeader} aria-hidden="true"></span>
    <span class="font-medium text-heading tabular-nums" data-receipt-ten>&mdash;</span>
  </div>
  ```
  Rendered text reads "Over 10 sessions ……… $1,210.00" — matches the receipt idiom. Hidden until a fee is entered (same pattern as `data-receipt-card-note`). *Note: `hidden` on a `flex` div — Tailwind preflight sets `[hidden]{display:none!important}` so it wins; the quiz memory issue was about toggling, not the attribute itself. Verify in browser; if it doesn't hide, toggle a `hidden` class instead.*
- Bottom disclaimer stays; `Last updated: {costsData.lastUpdated}` now shows 2026-09-03.

### 3. `src/scripts/cost-calculator.ts`
- Remove `PractitionerType` interface, `practitionerTypes`, `feeRanges`, `getSelected()`, `updateFeeHint()`, `gpVisitLabel()`.
- Add `const REBATE = costsData.rebatePerSession;` and `const SESSIONS = costsData.maxMedicareSessions;`.
- GP label is now constant "GP visit (care plan)" — it's already the SSR text, so drop `gpLabelEl` and the label write.
- Add `tenRowEl`/`tenEl` queries (`[data-receipt-ten-row]`, `[data-receipt-ten]`) to the guard list.
- In `render()`:
  - no fee → hide `tenRowEl`, set `tenEl` to em-dash (alongside existing resets).
  - fee → `perSession = max(0, fee − REBATE)`; `tenTotal = perSession * SESSIONS + gpCost`; `tenEl.textContent = money(tenTotal)`; unhide row.
- `feeHint` element + `#fee-hint` stay in HTML (static now); remove the `feeHint` query from the script since nothing updates it.

### 4. `src/pages/calculator.astro`
- No code change needed — `lastVerified` derives "September 2026" from `lastUpdated`.
- "How Medicare Rebates Work" copy: unchanged (no figures present).

### 5. Plan copy for the repo
Per CLAUDE.md, copy this plan to `docs/plans/calculator-single-scenario.md` as the first implementation step.

## Verification

1. `npx astro check` → 0 errors, 0 warnings.
2. Dev server is **not** currently running. Start it in a separate terminal tab (`npm run dev`) or, for this session, `npm run build && npm run preview` in the background.
3. Chrome (desktop width): open `http://localhost:4321/calculator/`, screenshot. Type fee 220 → expect: Session fee $220.00, Medicare pays back −$101.55, You pay per session $118.45, GP visit $0.00, Over 10 sessions $1,184.50. Toggle GP to "No" → GP $40.00, Over 10 sessions $1,224.50. Clear fee → dashes, 10-session row hidden. Fee 90 (below rebate) → $0.00 / $0.00 (or $40.00 with gap).
4. Mobile width (390×844): Chrome windows can't be resized on this machine (tiling WM, see memory). Use the repo's Playwright headlessly from a scratchpad `.mjs` script against the running server; save screenshots to `docs/calculator-single-scenario-{desktop,mobile-390}.png`.
5. Confirm "Rebate figures last checked: September 2026" under the calculator.
6. Commit (no push): "Simplify cost calculator to GP plan → general psychologist; rebate $101.55 (1 Jul 2026)".

## After implementation — flag to user (separate question)
The old $98.95/$145.25 figures still appear in practitioner content, the reduce-costs tip, and the bubble map. Offer to update those in a follow-up (clinical psychologist item 80010 would need its own indexed figure).
