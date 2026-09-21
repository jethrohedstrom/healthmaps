# Calculator: question-first again, with copy that says what it is

**Status: built (September 2026). Supersedes `calculator-answer-first.md`.**

## Why this reversal

Harry's user test (17 Sep 2026, iPhone, see `~/obsidian-vault/user testing/user testing.md`)
found two misreads: the fee input read as "what's your budget?" (a number he doesn't
have), and he thought he was being directed to a provider. `calculator-answer-first.md`
(commit `dc55e7b`) responded by opening on a pre-filled answer screen. Decision now:
go back to **question-first** — the quiz opens on Question 1 — and fix Harry's
confusion with **wording** instead:

- The page hero plainly says what the tool does before anything is asked.
- The fee step offers "use the most common fee" as a first-class path, so nobody
  needs to know a number.

Values this serves (vault): plain non-jargony language for low health literacy;
not wordy or "AI vibey"; independent and trustworthy, not a business pitch;
quizzes must not feel long-winded.

## What changed

**`src/pages/calculator.astro`** — hero subheading is now a plain description:
"A few quick questions, then what you'd pay out of pocket after the Medicare
rebate. If you don't know what sessions cost, we'll use the most common fees."
The "guide, not a clinic" line stays.

**`src/components/CostCalculator.astro`**
- `who` is the SSR-visible screen again; `done` is hidden until reached.
- Fee screen: the no-number path comes first — an answer-card button
  "No — use the most common fee ($250)" above the input — then
  "Or, if you know their fee:" and the input relabelled "Their fee per session ($)"
  (psychiatrist: "Their first appointment fee ($)" / "Their follow-up fee ($)").
  The hint line moved below the input.
- SSR receipt is empty (em-dashes, GP part hidden, note = START_NOTE) to match
  the script's `renderEmpty()` on first paint. Done-screen summary SSRs em-dashes.

**`src/scripts/cost-calculator.ts`**
- `defaultState()` deleted; init falls back to `blankState()` (screen `who`).
- `STORAGE_KEY` bumped to `v2` so old pre-filled `done` sessions don't resume.
- Typical-fee button copy: "No — use the most common fee ($X)" / "No — use the
  most common fees" (psychiatrist), set in `applyType()`.

**`scripts/verify-calculator.mjs`**
- Un-staled: asserts fresh load starts on `who` with an empty receipt; done has
  no Back button (Change links cover revisiting); GP receipt line shows
  "Free to $40" before the GP answer.
- New `runMostCommon` path: "I don't know yet" → most-common-fee button → done
  at $148.45 without typing anything.
- Fixed a test artifact: `window.scrollTo(0, 0)` before the reload check now uses
  `behavior: 'instant'` + waits for `scrollY === 0`. The site's
  `html:focus-within { scroll-behavior: smooth }` rule animates a plain scrollTo
  while the done heading holds focus, and Chrome recorded a mid-animation
  position to restore.

## Verified

- `npx astro check`: 0 errors, 0 warnings.
- `node scripts/verify-calculator.mjs`: all checks pass, desktop + 375px mobile,
  all nine branch paths, change/chips/reset, most-common-fee path, reduced motion.
- Manual pass in browser: hero copy, Question 1 landing, fee screen layout.

## Open follow-ups

- Retest with Harry (or another tester) on the live question-first version —
  his test predates all of this wording.
- Fee adjustment could be "satisfying/gamified" (slider/scroll) — tasks note idea,
  not attempted here.
