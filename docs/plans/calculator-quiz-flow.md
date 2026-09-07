# Cost calculator: build the one-question-at-a-time flow (mockup 2c)

**Status:** built 7 Sep 2026. Mockups: https://claude.ai/design/p/9cabf40b-6b70-42f4-8605-3f304657bb8d?file=Calculator+Disclosure+Options.dc.html (row 2c). Verification script: `node scripts/verify-calculator.mjs` with the dev server running; screenshots in `docs/screenshots/calculator-quiz-*.png`.

## Context

The calculator today shows everything at once: 7 practitioner radio cards, fee field with chips, GP bulk-billing question, and a sticky receipt. Open notes in `TASKS.md` say it's too wordy and AI-like, that people don't know general vs clinical psychologist, and that "bulk-billed" is jargon. Two rounds of Claude Design mockups (project `9cabf40b-…`, plan doc `docs/plans/calculator-progressive-disclosure.md`) led Jethro to pick **2c: a typeform-style mini quiz**, then decide (7 Sep 2026):

- The page opens **straight on question 1**. No default practitioner, no "Change" line.
- The fee and GP questions are **quiz steps too**, one question per screen. The receipt fills in as answers arrive.
- "Someone else" asks **which one** (social worker / OT / counsellor / psychotherapist), because the rebate differs.
- "Bulk-billed" is replaced by plain wording: "Do you pay anything to see your GP?"

Outcome: one decision per screen, the general vs clinical question only reached by people who said "psychologist" (with "Not sure" as a valid answer), plain-language GP question, a leaner receipt, and the same live numbers as today.

## Files

| File | Change |
|---|---|
| `src/components/CostCalculator.astro` | Rewrite the form column as stacked quiz screens; keep the receipt column with two rows removed |
| `src/scripts/cost-calculator.ts` | Add screen routing, history, state + sessionStorage; keep the receipt maths |
| `src/pages/calculator.astro` | Shorter hero lead; nothing else |
| `src/data/calculator-costs.json` | No change (all figures already there) |
| `docs/plans/calculator-quiz-flow.md` | Copy of this plan (CLAUDE.md "plan into a file") |
| `TASKS.md`, `~/obsidian-vault/HealthMaps tasks.md` | Tick / remove the clinical-vs-general item; note wordiness partly addressed |

No global.css changes. No new components. Vanilla TS only.

## The flow

| Screen id | Heading | Answers | Next |
|---|---|---|---|
| `who` | Who will you be seeing? | Psychologist · Psychiatrist · Someone else (sub-label: social worker, OT, counsellor, psychotherapist) · I don't know yet | Psychologist → `psych`; Psychiatrist → sets `psychiatrist`, → `fee`; Someone else → `other`; I don't know yet → sets `general-psychologist` + `assume: 'unknown'`, → `fee` |
| `psych` | Do you know if they're general or clinical? | General · Clinical · Not sure (sub-label: most are general) | General → `general-psychologist`; Clinical → `clinical-psychologist`; Not sure → `general-psychologist` + `assume: 'not-sure'`. All → `fee` |
| `other` | Which one? | Mental health social worker · Mental health occupational therapist · Counsellor · Psychotherapist | sets that id → `fee` |
| `fee` | What do they charge per session? (psychiatrist: What do they charge?) | Number input + Lower/Typical/Higher chips (existing behaviour). Psychiatrist: two fields, First appointment + Follow-up. One-line note when `assume` is set. **Next** button, disabled until the fee(s) are valid | `setup === null` → `done`, else → `gp` |
| `gp` | Do you pay anything to see your GP? | No, it's free · Yes, about $40 | → `done` |
| `done` | That's everything | Summary lines with Change links: practitioner → `who`; fee → `fee`; GP (if asked) → `gp`. "Start again" resets. | — |

Every screen after `who` has "← Back", which pops the **history stack** (previously visited screen), so branching is handled without special cases. Answer buttons advance on click; only the fee screen has a Next button because it holds typed input.

Progress label "Question N of M" comes from one helper, `pathFor(state): ScreenId[]`: `['who']` + (`psych` if branch is psychologist, `other` if someone else) + `['fee']` + (`gp` unless the type is known and `setup === null`). While the tail is undecided the longest path is assumed, so M only ever shrinks (psychiatrist: "1 of 4" → "2 of 3"). N = `path.indexOf(screen) + 1`. Counsellor / psychotherapist path is who → which one → fee = "3 of 3". The `done` screen shows "Your costs" instead of a count.

Assumption notes on the fee screen (one line, `text-meta-sage`):
- `assume: 'unknown'`: "Most people start with a general psychologist through a GP care plan. We'll use that. You can change it at the end."
- `assume: 'not-sure'`: "We'll use general. Most are, and their booking page will say 'clinical' if not."

## 1. `src/components/CostCalculator.astro`

Keep: shell div `#cost-calculator` and its classes (`:51`), the two-column grid (`:52`), the receipt column (`:118-206`) minus two rows, the class constants `fieldInput`, `feeChip`, receipt constants (`:15-43`), the `feeGroups` data (`:24-36`), the `<script>` import (`:211`).

Remove: the practitioner radio fieldset (`:55-71`) and `optionCard` constant usage for it, the psych hint (`:68-70`), the "Not sure? Try a typical fee:" line (`:89`), the GP radio fieldset (`:100-115`), the receipt card note (`:181-184`), the "Over 10 sessions" row (`:195-199`), and `data-receipt-setup`'s ten-row logic (the GP row stays, in its own block).

Add, inside the left column, replacing the form's contents:

```
<div data-calc-screens aria-label="Mental health cost calculator">
  <p class="sr-only" aria-live="polite" aria-atomic="true" data-calc-live></p>
  <noscript><p>This calculator needs JavaScript.</p></noscript>

  <section data-calc-screen="who" class="calc-screen">
    <div class="calc-step-row"><p data-calc-progress>Question 1 of 4</p><button type="button" data-calc-back hidden>← Back</button></div>
    <h2 tabindex="-1" data-calc-heading class="calc-heading">Who will you be seeing?</h2>
    <div class="grid gap-3" role="group" aria-label="Who will you be seeing?">
      <button type="button" class={answerCard} data-calc-answer data-next="psych">Psychologist</button>
      <button type="button" class={answerCard} data-calc-answer data-type="psychiatrist" data-next="fee">Psychiatrist</button>
      <button type="button" class={answerCard} data-calc-answer data-next="other">Someone else <span class="…sub">social worker, OT, counsellor, psychotherapist</span></button>
      <button type="button" class={answerCard} data-calc-answer data-type="general-psychologist" data-assume="unknown" data-next="fee">I don't know yet</button>
    </div>
  </section>
  … psych, other, fee, gp, done screens in the same shape …
</div>
```

No hidden inputs: the practitioner and GP answers live only in the JS `state` object (a hidden input would be a second copy). The fee inputs stay real inputs and remain the source of truth for fee values; state mirrors them for persistence. Buttons carry facts (`data-branch`, `data-type`, `data-assume`, `data-gp`), and one `nextAfter(screen, state)` function in TS decides the next screen, so the branch table lives in one place.

Screen mechanics (scoped `<style>` in this component, ~30 lines, copied from PathwayQuiz.astro:247-275 and 482-496):
- `[data-calc-quiz] { display: grid }`, `.calc-screen { grid-area: 1/1 }` so the card keeps the height of its tallest screen beside the sticky receipt.
- `.calc-screen--hidden { opacity:0; visibility:hidden; pointer-events:none }`. A **class**, never the `hidden` attribute (Tailwind preflight forces `[hidden]{display:none!important}` and would collapse the grid track).
- Cross-fade inside `@media (prefers-reduced-motion: no-preference)`: out 140ms, in 240ms after 110ms delay.
- SSR: every screen except `who` carries `calc-screen--hidden`; Back on `who` is `hidden`.

Typography: `.calc-heading` mirrors the pathway quiz heading (Switzer 600, 23px, tracking -0.012em, lh 1.375, text-heading). Step label 14px/500 text-primary; Back 14px/500 text-body.

New constant `answerCard` (Tailwind): `flex w-full min-h-14 flex-col items-start justify-center gap-0.5 rounded-[10px] border border-ink-green/16 bg-white px-4 py-3 text-left text-base leading-snug text-body transition-colors duration-150 hover:border-primary hover:bg-primary-light hover:text-heading focus-visible:outline-3 focus-visible:outline-primary focus-visible:outline-offset-3 disabled:cursor-wait disabled:opacity-70`. Sub-label span: `text-[13.5px] text-meta-sage`.

Fee screen: the only screen that is a `<form novalidate data-calc-screen="fee">`, containing `<p data-calc-assume-note hidden>` for the assumption note, both existing `feeGroups` blocks (`data-fee-group`, `hidden` toggled by `applyType`; `hidden` is right here because they sit inside one screen), `<p data-fee-error role="alert" hidden>Enter a fee to continue.</p>`, and `<button type="submit" data-calc-next>Next</button>` styled like the pathway quiz primary button. Enter in the number field submits the form; the submit handler calls `preventDefault()` then runs the same Next path. If a fee is missing, Next shows the error and focuses the first empty input instead of advancing (no `disabled` Next, so keyboard users get feedback).

GP screen: two `answerCard` buttons, `data-calc-answer data-gp="free"` / `data-gp="paid"`, both `data-next="done"`.

Done screen: heading "That's everything", a `<dl>`-style list of three rows each with a `Change` button (`data-calc-goto="who|fee|gp"`), the GP row `hidden` when not asked, and a `Start again` button (`data-calc-reset`). Receipt is complete beside/below it.

Receipt: keep `data-receipt-body` single + psychiatrist, the GP row block (`data-receipt-gp-part`, label "GP visit (care plan)" / "(referral)"), and `data-receipt-note`. Drop `data-receipt-card-note` and the ten-row. Rename the setup block eyebrow "One-off to get started" → keep (it still introduces the GP row).

## 2. `src/scripts/cost-calculator.ts`

Keep unchanged: types, `money`, `setChips`, `syncChips`, `setRebateText`, `fieldValue`, `field`, `renderSingle` / `renderPsychiatrist` maths, copy constants `CAP_NOTE`, `PSYCHIATRIST_NOTE`, `noRebateNote`, `EMPTY_NOTE*`.

Delete: `cardNote`, `moneyLabel`, `audWhole`, `TEN_LABEL*`, `showTotals`' ten/card branches (fold into a simpler `showTotals(note)`), the `hintEl`/`gpQuestion` hooks, the `change` handler for radios.

Add:

```ts
type ScreenId = 'who' | 'psych' | 'other' | 'fee' | 'gp' | 'done';
type Branch = 'psychologist' | 'psychiatrist' | 'other' | 'unknown';
type Assume = 'unknown' | 'not-sure' | null;
interface CalcState {
  version: 1;
  screen: ScreenId;
  history: ScreenId[];        // visited screens, for Back (max 12)
  branch: Branch | null;      // drives pathFor() before a type is known
  typeId: string | null;      // matches calculator-costs.json ids
  assume: Assume;
  fee: number | null; firstFee: number | null; followFee: number | null;
  gpFree: boolean | null;     // null = not asked yet
}
```

- `STORAGE_KEY = 'healthmaps:cost-calculator:v1'`, `readState()` / `writeState()` / `clearState()` in try/catch (same shape as `pathway-quiz.ts:42-98`). `isCalcState()` is structural: version, screen/history ∈ ScreenId, branch/typeId in known sets or null, fees `null | finite > 0`, gpFree `boolean | null`. `clampScreen(s)` is semantic and walks back rather than discarding: no typeId but screen past its branch question → `who`; `fee`/`gp`/`done` without complete fees → `fee`; `gp` when `setup === null` → `fee`; `done` with `setup !== null && gpFree === null` → `gp`. Never a blank card.
- `currentType(): PractitionerType | null` from `state.typeId` (null before Q1 is answered → receipt renders its empty state).
- `pathFor(state)` (progress + the canonical path) and `nextAfter(screen, state)` (the branch table). On arriving at `done`, set `history = pathFor(state).slice(0, -1)` so repeated Change loops don't accumulate.
- `showScreen(id, { focus = true })`: toggles `calc-screen--hidden` on all screens, disables buttons on outgoing, enables on incoming, updates progress label, Back visibility (`hidden` only on `who`), assumption note (fee screen), done-screen summary text; `focus` → `requestAnimationFrame(() => heading.focus({ preventScroll: true }))` + `announce("Question 2 of 4.")`. `focus=false` on initial render (restore) so nothing scrolls on load.
- `go(next)`: pushes current screen onto `history`, sets `screen`, `writeState`, `showScreen`.
- `back()`: pops history, `showScreen`. On `who` it's hidden anyway.
- `handleAnswer(button)`: reads `data-branch`, `data-type`, `data-assume`, `data-gp`; `setType(id, assume)` clears all three fees and inputs only when the id actually changes (Back-then-same-answer is lossless; a $250 psychologist fee never leaks onto a counsellor), then `applyType(t)`, `render()`, `go(nextAfter(screen, state))`. The GP skip lives in `nextAfter('fee')`: `t.setup === null ? 'done' : 'gp'`.
- `goto(id)` for Change links: pushes `done` onto history so Back from the revisited screen returns to `done`; after re-answering, the normal `data-next` chain runs again (re-answering `who` will re-ask fee and GP; that's fine and simplest).
- `reset()`: `clearState()`, fresh state, clear inputs, `applyType(types[0])`, `render()`, `showScreen('who')`.
- `updateProgress()`: computes M per the rule above from `state.typeId` / the screen.
- `render()`: `t = currentType()`. If null: single body, all em-dashes, `syncChips(single, null)`, GP block hidden, note "Answer a few questions to see what you'll pay." Else: `gpCost = t.setup === null ? 0 : state.gpFree ? 0 : GP_COST_PRIVATE`; GP row hidden when `setup === null`, amount em-dash until `gpFree !== null`; body toggle by `Boolean(t.firstVisit)`; `renderSingle(t)` / `renderPsychiatrist(t, t.firstVisit)` (they lose the `gpCost` param and call `setNote(...)` instead of `showTotals`). Then `renderSummary(t)` fills the done screen's rows and `updateProgress()`.
- Event wiring: one delegated `click` listener on the root for `[data-calc-answer]`, `[data-calc-back]`, `[data-calc-goto]`, `[data-calc-reset]`; the fee form's `submit` → `preventDefault()`, validate, `go(nextAfter('fee'))`; the fee form's `input` → mirror fees into state, `writeState`, `render()`; chip clicks and focus→select unchanged (`:283-291`).
- Init: `state = clampScreen(readState()) ?? fresh()`; `applyType(t)` if any, `syncInputsFromState()`, `render()`, `showScreen(state.screen, { focus: false })`. No focus, no `select()`, no scrolling on init.
- No JS-driven motion at all: the fade is CSS-only inside `prefers-reduced-motion: no-preference`, and nothing scrolls. On mobile the receipt sits directly under the card, so reaching `done` leaves it one thumb-scroll away; if that proves too hidden in testing, a follow-up can add a reduced-motion-aware `scrollIntoView` on `done` only (never on restore).

## 3. `src/pages/calculator.astro`

- Hero lead (`:20-22`) → "What a session really costs you after the Medicare rebate."
- `description` prop: keep.
- Nothing else. The "How Medicare Rebates Work" paragraphs already cover paying on the day (debit-card rebate) and the 10-session cap, so the dropped receipt rows lose no information.

## 4. Docs and tasks

- Write `docs/plans/calculator-quiz-flow.md` (this plan, with the mockup link) and append a "Built" line to `docs/plans/calculator-progressive-disclosure.md`.
- `TASKS.md`: tick "Clinical vs general psychologist" (solved by the branch + Not sure); leave "Too wordy" open but note the calculator part is done; leave "First green line" and "Gamified price input" open.
- Obsidian `HealthMaps tasks.md`: remove the clinical/general line only (certain); ask before removing the wordy line.
- Commit on `main` in two commits (component + script; page + docs). **Don't push.**

## Out of scope

- Slider / gamified fee input (separate round).
- Extracting shared quiz helpers into a module used by the pathway quiz (copy the four small helpers instead; no changes to `pathway-quiz.ts`).
- Analytics events (Clarity autocapture only, as today).
- Sourcing the placeholder chip ranges flagged in `calculator-costs.json:8`.

## Verification

1. `npx astro check` → 0 errors, 0 warnings. `npm run build` succeeds.
2. Dev server (`npm run dev` in a separate tab). Walk every path and check the receipt:

| Path | Fee(s) | GP | Expected receipt |
|---|---|---|---|
| Psychologist → General | 250 | free | 250.00 · −101.55 · **148.45** · GP $0.00 |
| Psychologist → Clinical | 280 | paid | 280.00 · −149.05 · **130.95** · GP $40.00 |
| Psychologist → Not sure | 250 | free | same as General; note shown on fee screen |
| I don't know yet | 200 | free | 200.00 · −101.55 · **98.45**; note shown |
| Psychiatrist | 600 / 300 | free | first 331.10, follow-up **210.70**; label "GP visit (referral)" |
| Someone else → Social worker | 200 | paid | 200.00 · −89.50 · **110.50** · GP $40.00 |
| Someone else → OT | 220 | paid | 220.00 · −89.50 · **130.50** · GP $40.00; "Question 3 of 4" on fee |
| Someone else → Counsellor | 140 | (not asked) | 140.00 · No rebate · **140.00**; no GP row; footer no-rebate note; "Question 3 of 3" on fee |
| Someone else → Psychotherapist | 180 | (not asked) | **180.00**, same shape as counsellor |
| Chips on General path | 200 / 330 | free | 98.45 / 228.45; tapped chip has `aria-pressed="true"` |

3. Back: from `gp` → `fee` (values kept); from `fee` → `psych`/`other`/`who` as visited; from `done` via Change → the right screen and Back returns to `done`.
4. Change practitioner from `done` to a different type: fee input cleared, chips relabelled, receipt em-dashes until a new fee.
5. Keyboard: Tab reaches answers, Enter/Space activates, focus lands on the new heading each screen, Enter in the fee field advances only when valid.
6. Reload mid-flow: same screen and values restored, **page does not scroll**. Reload after Start again: back on `who`.
7. `prefers-reduced-motion: reduce` (DevTools rendering panel): screens swap instantly.
8. JS disabled: `who` renders with the receipt in its empty state; nothing broken, nothing interactive (acceptable, same as the pathway quiz).
9. Playwright script `scripts/verify-calculator.mjs` (same conventions as `scripts/screenshot-pathway-page.mjs`: dev server at localhost:4321, chromium, viewports 1280×800 and 375×812). For each path in the table: click answers by text, fill the fee, click Next, assert `[data-calc-progress]`, `[data-receipt-total]`, `[data-receipt-gp]`, `[data-receipt-note]`, and that `document.activeElement` is the new heading after each answer. Then `page.reload()` and assert the same screen and `scrollY === 0`; one run with `emulateMedia({ reducedMotion: 'reduce' })`; keyboard: focus the fee input, press Enter, assert it advanced. Screenshots of `who`, `fee`, `done` at both widths into `docs/screenshots/calculator-quiz-*.png`. Mobile: no horizontal overflow, buttons ≥ 44px tall.
10. Lighthouse-sensitive checks: no layout shift on load (screens stacked SSR-side), no console errors.

Estimate: about 3 hours of build, 1 hour of verification.
