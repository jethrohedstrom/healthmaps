# Calculator: answer first, questions second

## The idea in one line

The calculator currently opens with a question ("Who will you be seeing?"). Harry's user test showed that reads like a booking form asking for your budget. Flip it: **open with the answer already filled in** — the most common scenario — and let people change the bits that don't fit them.

## What the visitor sees after this change

1. **Page opens on the answer.** The card shows, immediately:
   - "Seeing a psychologist with a care plan usually costs about $250 a session. Medicare gives back $101.55. You pay about $148."
   - The receipt beside it, already filled in with those numbers.
   - The summary rows: Seeing / Session fee / GP visit — each with a **Change** link.
2. **GP visit shows "Free to $40"** until they answer that question (nothing assumed).
3. **The quiz still exists** — it's just what "Change" opens. Same 4 screens, untouched flow.
4. **The fee question acknowledges "just looking".** It becomes "Do you know what they charge per session?" with a new option: "I'm just looking — use a typical fee ($250)", plus the existing chips and input.
5. **One new line under the page heading:** "Health Maps is a guide, not a clinic — we don't book or refer." (fixes Harry thinking he was being directed to a provider)

## How (3 files)

### `src/scripts/cost-calculator.ts`
- `freshState()` becomes the pre-answered state: screen `done`, general psychologist, fee 250 (the typical chip from the JSON), GP unanswered, history pre-filled so Back walks the questions in reverse.
- Loosen `clampScreen()` so `done` is allowed with the GP question unanswered.
- GP row when unanswered: show "Free to $40" (receipt + summary) instead of a dash.
- New answer sentence on the done screen, computed per practitioner: care-plan types get the sentence above; no-rebate types get "…there's no Medicare rebate, you pay the full fee"; psychiatrists hide it (their receipt has two totals and explains itself).
- "Just looking" button on the fee screen: fills the typical fee and continues.
- "Start again" keeps working — it now returns to this default answer state's Q1 via the existing reset, starting the quiz from "Who will you be seeing?".

### `src/components/CostCalculator.astro`
- The **done screen is the one visible on load** (swap which screen has `calc-screen--hidden`); heading becomes "What a session costs" with the answer sentence under it.
- SSR the default numbers into the receipt and summary ($250 / −$101.55 / $148.45 / "Free to $40") so the answer is the first paint, before JS — and no-JS visitors now see a useful default instead of dashes.
- Add the "just looking" option to the fee screen.

### `src/pages/calculator.astro`
- Add the "guide, not a clinic" line under the hero paragraph.

No changes to the costs JSON, routing table, or receipt maths. Restored sessions (someone mid-quiz who refreshes) keep working unchanged.

## Verify

1. Fresh visit (clear sessionStorage): page opens on the filled answer, receipt shows $148.45, GP row "Free to $40".
2. Change → fee screen shows "Do you know what they charge?" + "just looking" option; picking it returns with $250 kept.
3. Full quiz run (Change → Seeing → psychiatrist path) still works; GP answer replaces "Free to $40".
4. Disable JS (or curl the HTML): default numbers present in the markup.
5. Mobile width: answer sentence is the first thing in the card.
6. `npx astro check` → 0 errors. Screenshots desktop + mobile for Jethro. Commit, no push.
7. Copy this plan to `docs/plans/calculator-answer-first.md` per CLAUDE.md.
