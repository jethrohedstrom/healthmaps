# Health content review — June 2026

Verification pass over every `<!-- REVIEW -->` / `// REVIEW` marker, done 13 June 2026.
Method: claims checked by web search against official sources (MBS Online, Services
Australia, health.gov.au) and corroborating professional/provider sources. Direct page
fetches weren't possible from the work environment, so "source" below means the figure
was confirmed via search results quoting those pages — every figure required at least
two independent corroborations. Flags were removed **only** for verified claims;
everything else keeps its flag and is listed under "Kept flagged" or "Needs your input".

**Indexation note:** MBS rebates were last indexed 1 July 2025. The next indexation
(1 July 2026) is ~2.5 weeks away — worth a re-check of the dollar figures after that date.

## Verdict summary

| Status | Count |
|---|---|
| Verified, unchanged | 18 claims/sections |
| Verified, corrected | 11 claims |
| Kept flagged (couldn't verify) | 0 |
| Needs your input (personal/legal) | 9 items |

## Corrections made

| Location | Was | Now | Source | Confidence |
|---|---|---|---|---|
| `calculator-costs.json` psychiatrist initial rebate | $214.40 | **$262.10** (MBS item 291, referred assessment 45+ min, from 1 Jul 2025; was $254.95 before indexation) | MBS item 291; RANZCP item-291 guidance; two clinic fee pages listing $262.10 | High |
| `calculator-costs.json` psychiatrist follow-up rebate | $108.85 | **$87.05** (MBS item 302, 15–30 min; fee $102.40, benefit 85%). Conservative choice — longer follow-ups (items 304/306) rebate up to ~$134, so estimates won't understate costs | MBS item 302 (figure + effective date 01-Jul-2025 quoted in search result) | High |
| `calculator-costs.json` psychiatrist fee ranges | $300–600 initial / $200–500 follow-up | $400–800 / $200–400 (aligned with bubble map, matches current market fee listings) | Clinic fee pages, Call To Mind cost guide | Medium (market ranges vary) |
| `CostCalculator.astro` GP-visit logic | Always added a "review" GP visit above 6 sessions, labelled "MHCP" for all practitioner types | Review visit (and MHCP label) now only for MHCP pathways; psychiatrists get "referral", no review visit | Better Access review rules (Services Australia) | High |
| Bubble map psychiatrist follow-up out-of-pocket | "$66 – $266" | "$66 – $313" (true range: $200−$134 to $400−$87.05) | Arithmetic on verified figures | High |
| Bubble map + nurse popover: "Chronic Disease Management plan" | legacy name | "GP chronic condition management plan" (renamed 1 July 2025) | Services Australia CDM→GPCCMP pages | High |
| `pathway-cards.ts` step 6 | "You'll need a new Mental Health Care Plan from your GP to start the next year's sessions" | **Plan doesn't expire** — you need a new *referral* each calendar year; GP may review the plan. (This was the draft's one outright error — same family as the "transfer" myth.) | Services Australia "Allied health referrals for mental health treatment services"; GP practice explainers | High |
| `pathway/02` referral-validity tip | "Referral is usually valid for 12 months" | Referral covers a course of up to 6 sessions and has no fixed expiry; clinics often want a fresh one each calendar year | Services Australia (as above) | High |
| `pathway-cards.ts` psychiatrist referral validity | "3–12 months" | "12 months by default" (GP→specialist referrals; specialist→specialist is 3 months) | Services Australia referral rules | High |
| `tips/reduce-costs.md` rebates | "~$93 vs ~$149" | "$98.95 vs $145.25" (matches everywhere else on the site) | MBS items 80110 / 80010 | High |
| University clinic costs (tips: "$20–$50"; pathway-cards: "$10–$80") | inconsistent | harmonised to "$10–$50, some free" | USyd clinic ($10–$20), UQ clinic ($25–$40) fee pages | Medium (varies by university) |
| Practitioner frontmatter costs (psychiatrist, SW, OT, MH-nurse, GP) | drifted from bubble-map figures | aligned to the verified bubble-map figures (SW $150–250, OT $170–260, nurse $100–180/often free, psychiatrist split initial/follow-up, GP "Free (bulk-billed) – $100+") | as above + market fee listings | Medium |
| `mental-health-nurse.md` Medicare section | vague ("may be covered under specific GP-arranged care plans") | concrete: not in Better Access; $61.80 rebate under GP chronic condition management plan, 5 shared allied-health sessions/yr; usually free via public services | ACMHN private-practice MBS guidance; Services Australia CDM pages | High |
| `pathway/01` + `pathway/02` | (missing) | Added the **November 2025 rule**: MHCPs/referrals must come from your usual GP or a MyMedicare-registered practice. This also confirms the previously-flagged MyMedicare line in `pathway-cards.ts` step 1 was correct. | MBS Online "Changes to Better Access from 1 Nov 2025" factsheet; PHN summaries | High |

## Verified unchanged (flags removed)

- **Better Access core mechanics** (everywhere): 10 individual sessions per calendar year, courses of 6 then GP review unlocks 4 more, resets each January; still current in 2026 — the Nov 2025 reforms changed referral rules, not session counts. *(High)*
- **Psychologist rebates** $98.95 general / $145.25 clinical (items 80110/80010, fee $116.40/$204.85 — verified 10 June, re-corroborated). *(High)*
- **SW/OT rebate ~$87.25** (items 80160/80135; one source says $87.24 — within rounding; kept "~"). *(High, ±1c)*
- **Psychiatrist**: medical doctor, prescribes, no MHCP needed (standard specialist referral), no Better Access-style session cap. *(High)*
- **Counsellor/psychotherapist**: no Medicare rebate, unregulated titles, ACA/PACFA/ARCAP guidance, "no benefit to a GP referral" (financially true — counsellors sit entirely outside Medicare). *(High)*
- **Crisis numbers** (`alternatives/crisis.md`): Lifeline 13 11 14, Beyond Blue 1300 22 4636, Suicide Call Back 1300 659 467, Kids Helpline 1800 55 1800, MensLine 1300 78 99 78, 13YARN 13 92 76, QLife 1800 184 527, 1800RESPECT 1800 737 732 — all current. Note: the 24/7 claim applies only to the first table, which is accurate; QLife (second table, no hours claimed) actually runs 3pm–midnight. *(High)*
- **Medicare Mental Health Centres**: free, walk-in, no referral, 1800 595 212 — network of 61 centres, full rollout due mid-2026. *(High)*
- **EAP**: typically 3–6 free confidential sessions/yr; counsellors not employer-reported. *(High)*
- **headspace** ages 12–25; **K10/PHQ-9** GP screening; long appointment 20–40 min; MHCP appointment bulk-billed or gap fee; claiming via clinic/myGov; intake-session description; cancellation-policy norms; "sessions carry over when you switch psychologists". *(High)*
- `pathway-cards.ts` live cards: GP-pathway gap $50–$200/session; private pathway $80–$330+ (widened from $120 to include counsellors); psychiatrists effectively need a GP referral even privately. *(Medium-High)*

## Needs your input (flags kept — can't be resolved autonomously)

1. `about.astro:58` — commit to a real review cadence (e.g. "every 6 months") and state it.
2. `about.astro:73-76` — "[YOUR NAME], based in [LOCATION]" bio placeholders. Only you can write this.
3. `about.astro:78-80` — funding transparency line ("self-funded / funded by…").
4. `about.astro:100` — consider hello@healthmaps.com.au instead of your personal Gmail (it's also on the disclaimer page).
5. `privacy.astro:22,25` — confirm every claim matches reality (no cookies, no tracking scripts, server-log analytics).
6. `privacy.astro:62` — confirm Netlify Analytics is what you actually pay for; simplify if not.
7. `disclaimer.astro:22` — AI-drafted legal copy; worth a legal once-over before you rely on it.
8. `disclaimer.astro:81` — mirror the review cadence from About once you've picked one.
9. **Stories**: both are flagged as fictional composites and the site already says so visibly (index + story pages). Decide eventually whether to collect real, consented stories.

## Heads-up: two content collections are currently unrendered

The static audit found that `getCollection('pathway')` and `getCollection('alternatives')`
are referenced **nowhere** — the live pathway page renders entirely from
`src/data/pathway-cards.ts`. The markdown in `src/content/pathway/` and
`src/content/alternatives/` was still verified and corrected (it's the natural source if
those sections come back), but right now it ships nothing to the site, and CLAUDE.md's
project-structure description is stale on this point. Worth deciding whether to wire them
back in or remove them.

## Still flagged in code (intentionally)

- `pathway-cards.ts` draft digital cards (`digital-free`, `digital-paid`) — parked, hidden from the live page, unverified placeholders.
- Calculator session dropdown labels "10 (max Medicare)" — slightly off for psychiatrist mode (no 10-session cap), cosmetic only.

_Note: the practitioner comparison tool was removed after this review (June 2026). The `peer-support-worker.md` file it introduced was deleted with it; the health-content corrections to the other practitioner files remain._
