# Cost calculator: progressive-disclosure mockups (Claude Design)

**Status:** mockups built 7 Sep 2026, awaiting Jethro's pick. No site code changed.

**Claude Design project:** https://claude.ai/design/p/9cabf40b-6b70-42f4-8605-3f304657bb8d?file=Calculator+Disclosure+Options.dc.html
(project id `9cabf40b-6b70-42f4-8605-3f304657bb8d`, bound to the HealthMaps Design System `a033db83-…`; design-system files copied under `_ds/healthmaps/`)

## Context

The calculator (`src/components/CostCalculator.astro`) shows 7 practitioner cards, a fee field with 3 chips, a GP bulk-billing question and a sticky receipt all at once. Open notes in `TASKS.md` say it is too wordy and AI-like, has too many stats, and people don't know clinical vs general psychologist. Jethro's direction (7 Sep 2026): make it **more parsable and less overwhelming** by **progressively disclosing the practitioner options**. He asked for all four approaches mocked up, desktop and mobile.

## What's on the canvas

One file, `Calculator Disclosure Options.dc.html`, four rows. Each row: desktop default, desktop revealed state, mobile default (1280 / 390 wide).

- **A. Default + "Change" link.** Opens on general psychologist with $250 prefilled and the receipt already showing $148.45. "Seeing a general psychologist · Change" reveals a 7-row list with rebates.
- **B. Three groups, then sub-choice.** Psychologist / Psychiatrist / Another therapist as three big cards. Picking Psychologist reveals "General or clinical?" with the one-sentence explainer.
- **C. Common types shown, rest folded.** General, Clinical, Psychiatrist as cards plus a "More practitioner types (4)" accordion.
- **D. One question per step.** Quiz-style wizard, 1 of 3 dots, receipt fills as you go; mobile has a pinned "You pay per session" bar.

Shared across all four: one-line hero, no eyebrow, no "Not sure? Try a typical fee" line, debit-card note and 10-session row dropped from the receipt body, GP question as two pills, clinical-vs-general explained in one sentence. Figures from `src/data/calculator-costs.json`.

## Next

1. Jethro reviews in the design window, picks a variant (or a mix), edits copy in place if wanted.
2. New plan for the build: changes to `CostCalculator.astro` + `src/scripts/cost-calculator.ts` for the chosen disclosure pattern.
3. Parked: gamified / slider price input (separate mockup round).
