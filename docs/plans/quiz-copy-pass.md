# Quiz copy pass + meta-text contrast fix

## Context

Asked to pick a task autonomously. The Obsidian tasks note (`~/obsidian-vault/HealthMaps tasks.md`) has an unchecked item: **"check over the copy of the questions. optimise them."** Exploration confirmed real problems in the pathway quiz copy. The result summaries are formulaic (all four open "A good first step for you is…"), which is exactly the "AI vibe" the tasks note complains about.

User feedback on the first draft of this plan: Q4 ("Do you have a regular GP you can see?") *asks* about a GP relationship rather than assuming one — leave it unchanged. Q2 also stays unchanged.

Folded in one objective finding from a Lighthouse scoping pass (CLAUDE.md next step #2, target 95+): the `--color-meta-sage: #6b7d74` meta-text token computes to ~4.2:1 contrast on the cream/sage backgrounds — below the 4.5:1 AA threshold, and used in 10 places of small text. Plus `text-gray-500` in calculator.astro, which both fails borderline contrast and violates the project's "no default Tailwind colours" rule.

## Constraints (verified in code)

- Scoring is positional: `data-score-*` weights live on answer objects in `PathwayQuiz.astro:10-45`. **Only `label`/`question` strings change** — same 4 questions, same 4/3/4/3 answers, weights byte-identical.
- No storage bump needed: `pathway-quiz.ts` stores answers as indices in sessionStorage (`data-answer-label` is never read). Positions unchanged → `STORAGE_KEY`/`STATE_VERSION` stay at v3/3.
- The invisible sizer (`PathwayQuiz.astro:120-147`) renders all result variants from `pathway-quiz-results.ts`, so result-copy edits keep card height honest automatically. New copy is length-comparable to old.
- Result titles should match the "All the ways" row titles they link to (`pathway.astro:12-39`): `Start with a GP`, `Go straight to a practitioner`, `Community & public services`, `Try something self-guided`.
- Don't rename pathway ids, hrefs, or `scoredPathwayIds`. Never imply MHCPs can be "transferred".

## Changes

### 1. `src/components/PathwayQuiz.astro` — question/answer labels only

**Q1** (question unchanged: "What matters most to you right now?")
- Pos 3: `Finding the right kind of person` → `Finding someone who's the right fit`
- Others unchanged.

**Q2** — unchanged (per user feedback).

**Q3** (question unchanged: "How would you prefer to start?")
- Pos 1: `With a doctor who can point me in the right direction` → `By getting a GP's advice first` (removes assumed doctor access)
- Others unchanged.

**Q4** — unchanged (per user feedback: it asks about a GP relationship, doesn't assume one).

### 2. `src/data/pathway-quiz-results.ts` — de-templatize results

All four summaries currently share the skeleton "A good first step for you is X. This fits when…" / "Useful if…". Replace (titles align to row titles):

- **through-gp** — title unchanged (`Start with a GP`)
  - summary: `A GP visit unlocks Medicare rebates for therapy sessions, and gives you professional guidance on what suits you. You don't need a regular GP to start.`
  - secondarySummary: `Worth it if you'd like a doctor's guidance and Medicare rebates on sessions.`
- **private** — title: `Go straight to a private practitioner` → `Go straight to a practitioner` (exact row-title match, drops jargon)
  - summary: `Booking directly with a psychologist or counsellor is usually the fastest way in. No referral, no paperwork; you pay the full fee yourself.`
  - secondarySummary: `The quickest route in, if paying the full fee yourself is manageable.`
- **low-cost** — title: `Try free or community services` → `Try a community or public service` (closer to row title)
  - summary: `Community and public services cost little or nothing, and many take walk-ins with no referral.`
  - secondarySummary: `Free or close to it, often walk-in, no referral needed.`
- **self-guided** — title unchanged (`Start with self-guided online tools`)
  - summary: `Online programs and apps let you start today, privately and at your own pace. Many of the good ones are free.`
  - secondarySummary: `Private and low-pressure, and you can start today.`

Add `// REVIEW:` comments on summaries carrying health/Medicare claims (through-gp, low-cost), per CLAUDE.md rule 2. Check each new secondarySummary reads naturally after `"{title}: "` (runner-up render format).

### 3. `src/data/pathway-cards.ts` — through-gp step 1 only (inclusive language)

- title: `Book a long appointment with your GP` → `Book a long appointment with a GP`
- detail: `Ask for a longer appointment (at least 30 minutes) so there's enough time to talk properly. This needs to be at your usual GP or a MyMedicare-registered practice.` →
  `Ask for a longer appointment (at least 30 minutes) so there's enough time to talk properly. It needs to be with your usual GP if you have one, or any MyMedicare-registered practice. If you don't have a GP yet, a practice taking new patients is fine.`
- Add a `// REVIEW:` comment (touches a Medicare eligibility claim verified June 2026).
- Leave "your GP" in steps 2–6 alone: by then the relationship is established in-flow.

### 4. Contrast fix — `src/styles/global.css` + `src/pages/calculator.astro`

- `--color-meta-sage: #6b7d74` → `#5a6b62` (computed: ~5.4:1 on paper-cream `#FBFAF6`, ~5.1:1 on page-sage `#EEF4EF` — passes AA; still reads as muted sage). All 10 `text-meta-sage` usages inherit the fix.
- `calculator.astro:30`: `text-gray-500` → `text-meta-sage` (fixes borderline contrast AND the "no default Tailwind colours" rule violation — the only such class in the codebase).

### 5. Housekeeping

- Copy this plan to `docs/plans/quiz-copy-pass.md` (CLAUDE.md: plans live in docs/plans/).
- Tick the "check over the copy of the questions" item in the Obsidian tasks note is left to the user (their note, their checklist) — mention it in the summary instead.
- Commits (no push, per CLAUDE.md): one for the quiz/cards copy pass, one for the contrast/token fix.

## Verification

1. `npx astro check` — 0 errors/warnings.
2. Dev server + browser (Claude in Chrome), walk each result class end-to-end and confirm the mapping is unchanged:
   - through-gp: Q1-4, Q2-1, Q3-1, Q4-1 → "Start with a GP"
   - private: Q1-1, Q2-2, Q3-2, Q4-3 → "Go straight to a practitioner"
   - low-cost: Q1-2, Q2-3, Q3-4, Q4-3 → "Try a community or public service"
   - self-guided: Q1-1, Q2-3, Q3-3, Q4-3 → "Start with self-guided online tools"
3. On each result: runner-up line reads naturally, "Go to this pathway" jumps to and auto-opens the right card, card height doesn't jump between screens (sizer), Back/Start over work. Check at mobile (390px) and desktop widths.
4. Mid-quiz reload: answer two questions, reload, quiz resumes on Q3 with new labels.
5. `git diff -U0 | grep -E 'data-score|href|id:'` — confirm no scoring/id/href strings changed.
6. Visual check of the darker meta-sage text on /pathway (quiz meta line, way-row fact labels, "Also worth knowing" label) and /calculator — should look slightly darker, not different in character.

## Files

- `src/components/PathwayQuiz.astro` (labels only)
- `src/data/pathway-quiz-results.ts`
- `src/data/pathway-cards.ts` (through-gp step 1)
- `src/styles/global.css` (one token value)
- `src/pages/calculator.astro` (one class)
