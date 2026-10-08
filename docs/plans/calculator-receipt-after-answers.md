# Calculator: show the receipt only after the questions

**Date:** 8 October 2026
**Status:** Built and verified 8 Oct 2026. Screenshots in `docs/screenshots/calc-receipt-*`.

## Why

Clarity recordings show eyes drifting to the "What you'll pay" receipt
while people are still answering questions. Jethro wants the questions
on their own, and the receipt to appear only once the answers are in.

## Decisions (agreed 8 Oct)

- Receipt stays in the right column. It is hidden during questions and
  fades in on the `done` screen (right on desktop, below on mobile).
- While answering, the quiz column fills the full card width. The card
  goes back to two columns on the results screen.
- Going back to a question via a "Change" link or "Start again" hides
  the receipt again (same rule: receipt only on `done`).

## Changes

1. `src/components/CostCalculator.astro`
   - Add a `data-calc-phase` attribute on `#cost-calculator`, set by the
     script to `questions` or `done`.
   - Grid wrapper: only apply `md:grid-cols-[1fr_minmax(280px,0.85fr)]`
     when the phase is `done` (CSS rule keyed on the attribute).
   - Receipt wrapper: hidden (opacity 0, visibility hidden) unless phase
     is `done`. Fade in using the existing screen transition timings;
     reduced motion gets the instant swap.
   - Mark the receipt `aria-hidden` while hidden so screen readers do
     not read dashes during questions.
2. `src/scripts/cost-calculator.ts`
   - In `showScreen`, set the phase attribute from the screen id.
   - No change to `render()`: it keeps filling the receipt on every
     answer, so the figures are already correct when it appears.
3. Restored state: on page load the script restores the saved screen.
   If that screen is `done`, the receipt shows immediately with no fade.

## Verify

- Dev server, desktop and 375px mobile: no receipt on questions 1 to 4,
  receipt on results, hidden again after "Change" and "Start again".
- Reduced motion: instant swap, no transition.
- `npx astro check` clean.
- Before/after screenshots into `docs/screenshots/`.

## Estimate

About 30 minutes including verification.
