# Calculator: Medicare rebates FAQ

Status: built 26 Oct 2026 (session with Jethro).

## Simple version

- **What:** the "How Medicare rebates work" section under the calculator was 6 paragraphs in no clear order. It's now 6 questions you click to open.
- **Where:** `src/pages/calculator.astro` only. The questions and answers are a list at the top of the file (`faqs`), so you can edit the wording there.
- **The numbers** (10 sessions, psychiatrist rebates) are read from `src/data/calculator-costs.json`, so updating that file updates the FAQ too.
- **Health claims** still carry `REVIEW` comments next to each question.

## Full plan

## Context

The "How Medicare Rebates Work" section under the calculator (`src/pages/calculator.astro:44-80`) is 6 paragraphs in no clear order, and it reads as random. We agreed to turn it into FAQ accordions, one per question people have after seeing their number. You asked to keep the psychiatrist follow-up/session-length detail as its own FAQ.

The current psychiatrist paragraph is also out of date. It says the calculator "uses the shorter follow-up rebate", but the calculator now has session-length chips (15–30 / 30–45 / 45–75 min).

## Questions and answers (6)

Section heading stays "How Medicare rebates work" (sentence case).

1. **Why do I still have to pay something?**
   Medicare pays back a fixed amount for each session, called the rebate. Most practitioners charge more than that. The difference is your out-of-pocket cost, sometimes called the gap. That's the number the calculator shows.

2. **Do I need to see a GP first?** <!-- REVIEW -->
   - Psychologist, mental health social worker or OT: yes. A GP writes a [Mental Health Care Plan](/pathway/#through-gp) and a referral. Without them there's no rebate.
   - Psychiatrist: yes, but a standard GP referral is enough. You don't need a plan.
   - Counsellor or psychotherapist: no. Medicare doesn't cover them, so you pay the full fee. Some private health extras policies cover part of it.

3. **How many sessions does Medicare cover?** <!-- REVIEW -->
   Up to {maxMedicareSessions} sessions per calendar year (January to December) with a psychologist, social worker or OT. After the first 6, you go back to the GP for a short review before sessions 7–10. Psychiatrists have no yearly cap.

4. **How do I get the money back?** <!-- REVIEW -->
   You pay the full fee on the day, and any card works. If the clinic claims the rebate for you, Medicare can only pay it onto a debit card, not a credit card. Otherwise you claim in the Medicare app, and the money goes to the bank account you've registered, usually within a day or two.

5. **Can I pay nothing at all?**
   Yes, if the practitioner bulk-bills. They charge only the rebate, so you pay $0. Bulk-billing practitioners often have longer waits.

6. **Why do psychiatrist rebates change?** <!-- REVIEW -->
   The first appointment has the biggest rebate (about ${firstVisit}). After that, the rebate depends on how long the appointment runs: about ${302} for 15–30 minutes, ${304} for 30–45, and ${306} for 45–75. That's why the calculator asks how long your sessions are.

## Implementation

**File:** `src/pages/calculator.astro` only.

1. In the frontmatter, pull the numbers from `costs` (already imported). That's `maxMedicareSessions`, plus the psychiatrist `firstVisit.rebate` and `followUpLengths[].rebate`, rounded to whole dollars. That way the FAQ can't drift from the calculator. Same idea as the existing `lastVerified`.
2. Put the questions in a `faqs` array in the frontmatter (question + HTML answer) and map them to the markup. Q2 and Q4 need a list or a link, so the answers are HTML strings rendered with `set:html`.
3. Replace the `<div class="space-y-5 text-body">` paragraphs with a single box:
   - Outer: `bg-white border border-pencil rounded-xl px-6 md:px-10` (pencil frame for a standalone page box, per design.md).
   - Each item: `<details class="accordion-item">` with a `border-t border-border` divider between items (inner furniture uses the softer token), and `<summary class="summary-chevron">`.
   - Reuse the existing `.accordion-item`, `.accordion-content` and `.summary-chevron` CSS (`src/styles/global.css:210-255`). No new CSS expected.
   - All closed by default.
4. Keep `<!-- REVIEW -->` comments on Q2, Q3, Q4 and Q6 (carried over from the current flags).
5. Save a copy of this plan to `docs/plans/calculator-medicare-faq.md` (CLAUDE.md rule).

## Verification

- `npx astro check`: 0 errors.
- Dev server is already open in the browser pane at `/calculator/`. Open each accordion and check that the chevron rotates, the dollar amounts render ($269, $89, $137, $190; 10 sessions), and the MHCP link goes to `/pathway/#through-gp`.
- Screenshot at desktop and at mobile 375 (headless Playwright, per memory) to check spacing.
- Keyboard: Tab to each summary, Enter toggles.
- Commit, don't push.
