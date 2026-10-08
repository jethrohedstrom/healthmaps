# Calculator: one question per screen

**Date:** 8 October 2026
**Status:** Built and verified 8 Oct 2026. Screenshots in `docs/screenshots/calc-one-q-*`.
**Builds on:** `calculator-receipt-after-answers.md` (receipt hidden until results, shipped same day).

## Why

The psychiatrist fee screen asks three things at once (first fee,
follow-up fee, follow-up length) plus a "use common fees" shortcut.
Clarity shows overload on this screen. Jethro wants every screen to be
one decision, Typeform style: a row of buttons, or one input box.

## Decisions (agreed 8 Oct)

- "Do you know what they charge?" becomes its own yes/no screen.
  "No" fills the typical fee(s) and skips straight past the fee screens.
- Psychiatrist fees split into three screens: first fee, follow-up fee,
  follow-up length (length as three answer cards, tap to advance).
- Progress: thin green bar, no numbers. Screen readers still hear
  "Question 3 of 6" via the live region.
- Lower / Typical / Higher chips stay as quick-fills under each input.

## New screen order

| Branch | Screens |
|---|---|
| Psychologist | who, psych, knowfee, fee, gp, done |
| Psychiatrist | who, knowfee, first, follow, length, gp, done |
| Other (rebate type) | who, other, knowfee, fee, gp, done |
| Other (no rebate) | who, other, knowfee, fee, done |
| Don't know yet | who, knowfee, fee, gp, done |

"No" on knowfee jumps to gp (or done for no-rebate types).

## Changes

### `src/components/CostCalculator.astro`
1. Replace the `fee` form with five screens: `knowfee` (two answer
   cards), `fee` (one input + chips + Next), `first`, `follow` (same
   shape), `length` (three answer cards).
2. Move the "I don't know yet / not sure" assume note to `knowfee`.
3. Replace the "Question X of Y" text with a progress bar:
   `<div class="calc-progress"><span data-calc-bar></span></div>`.
   Height 3px, `bg-primary-light` track, `bg-primary` fill, width set
   by the script. Keep `data-calc-progress` only as an sr-only label.
4. Results screen: "Session fee" Change link goes to `knowfee`.

### `src/scripts/cost-calculator.ts`
1. `SCREENS` gains `knowfee`, `first`, `follow`, `length`.
2. `pathFor` / `nextAfter` / `clampScreen` updated per the table above.
3. `handleTypical` becomes the "No" answer on `knowfee`.
4. `handleFeeNext` validates only the one field on the current screen.
5. Follow-up length answer cards set `state.followLength` and advance.
6. `progressLabel` returns `{ n, of }`; the bar width is `n / of`.
7. Bump `STORAGE_KEY` to `v3` so old saved sessions start fresh.

### Not changing
- Receipt rendering, rebate maths, `calculator-costs.json`.
- GP screen.
- Card stable-height trick (screens stacked in one grid cell). The
  tallest screen gets shorter, so the card gets shorter on mobile.

## Verify
- Walk all five branches on desktop and 375px. Back works on every
  screen. Change links land on the right screen.
- "No" on knowfee gives the same total as today's shortcut.
- Reload mid-quiz restores the right screen; old v2 storage is ignored.
- Reduced motion, keyboard-only pass, `npx astro check` clean.
- Before/after screenshots into `docs/screenshots/calc-one-q-*`.

## Estimate
About half a day: 3 hours build, 1 hour verification.
