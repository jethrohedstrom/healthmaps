# Psychiatrist follow-up fees by session length: research

Status: research done 26 Oct 2026. Chip values not yet agreed or built.

## Problem

The calculator's psychiatrist follow-up length chips (15–30 / 30–45 / 45–75 min) change the Medicare rebate, but the fee chips stay at $250 / $300 / $400 for every length.

## Main source: Medical Costs Finder (Australian Government)

National Medicare claims data, 2023–24, out-of-hospital, specialty = Psychiatry. Figures are for the patients who had an out-of-pocket cost. The site doesn't say how it defines low and high.

| Item | Length | Paid a gap | Medicare paid | Out of pocket: low / typical / high | Fee = Medicare + gap: low / typical / high |
|---|---|---|---|---|---|
| 302 | 15–30 min | 80% | $82 | $63 / $133 / $193 | $145 / $215 / $275 |
| 304 | 30–45 min | 81% | $126 | $74 / $164 / $234 | $200 / $290 / $360 |
| 306 | 45–75 min | 77% | $174 | $70 / $196 / $301 | $244 / $370 / $475 |

Links:
- https://medicalcostsfinder.health.gov.au/service/?id=Q302&mode=OH&specialtyname=Psychiatry&specialty=023101
- https://medicalcostsfinder.health.gov.au/service/?id=Q304&mode=OH&specialtyname=Psychiatry&specialty=023101
- https://medicalcostsfinder.health.gov.au/service/?id=Q306&mode=OH&specialtyname=Psychiatry&specialty=023101

**Bringing it up to 2026:** Medicare rebates rose about 9% between 2023–24 and 1 Jul 2026 ($82→$89.30, $126→$137.45, $174→$189.70). Scaling the fees by the same 1.09:

| Length | Lower | Typical | Higher |
|---|---|---|---|
| 15–30 min | $160 | $235 | $300 |
| 30–45 min | $220 | $315 | $390 |
| 45–75 min | $265 | $405 | $520 |

The 1.09 scaling is an assumption: it treats fees as rising in step with rebates.

## Cross-check: published clinic fees (2026)

| Clinic | 15–30 | 30–45 | 45–75 |
|---|---|---|---|
| Telepsychiatrist.online (1 Jul 2026) | $185 (20 min) | $323 (40 min) | – |
| MyMind (1 Jan 2026) | $220 | $300 | $360 |
| Tranquil Wave (telehealth) | $220 | $350 | $470 |
| Clarity Healthcare (VIC/TAS) | $285 (30 min) | – | – |
| Life Point (1 Jul 2026) | $330 | $480 | $700 |
| Meta Psychiatry (QLD/VIC) | $345 | – | $690 (longer) |
| PsycheTel (telehealth) | $350 | $450 | $500 |
| Mindscape | ~$400 | – | $680 |
| Mind Oasis, cheapest tier (1 Jul 2026) | $440 | $660 | $880 |

Clinics that publish their fees online come in above the national data, often well above. Treat the claims data as typical and these as the high end.

## Other

- Woon et al. 2024, *Australasian Psychiatry*, doi:10.1177/10398562241237128. It uses the same Medical Costs Finder data (2021–22) but only publishes ranges across all items, so it's not usable per length.
- Rebates are confirmed on MBS Online: 302 $89.30, 304 $137.45, 306 $189.70 (1 Jul 2026).

## Build plan (agreed 26 Oct 2026)

**Decisions**
- Use the Medical Costs Finder values, scaled to 2026 (table above).
- Ask the length **before** the follow-up fee: first fee → how long are follow-ups? → follow-up fee. The follow-up fee buttons then show the prices for that length.
- "No, use the most common fees" still skips the length and fee screens. It assumes 15–30 min and $235.

**Simple version:** each appointment length gets its own 3 price buttons, and the length question moves up one screen so the right buttons show.

**Changes**
1. `src/data/calculator-costs.json`
   - Give each `followUpLengths` entry its own `chips`: 15–30 `[160, 235, 300]`, 30–45 `[220, 315, 390]`, 45–75 `[265, 405, 520]`.
   - Set the psychiatrist's top-level `chips` to `[160, 235, 300]`, matching the default (shortest) length.
   - Replace the "REVIEW: source typical fees for longer follow-ups" note with the source (Medical Costs Finder 2023–24 × 1.09).
2. `src/scripts/cost-calculator.ts`
   - Add `chips` to the `FollowUpLength` type.
   - Change `feeScreensFor` to `['first', 'length', 'follow']`.
   - Change `nextAfter` so first → length → follow → GP.
   - Fix the `clampScreen` guards: `length` needs `firstFee`, and `follow` needs `firstFee`.
   - Retune the follow-up chips from the chosen length (`followLength(t).chips`) when the type is applied and when a length is picked.
   - `handleTypical` takes the default length's typical fee.
3. `src/components/CostCalculator.astro`
   - The follow-up screen's server-rendered chips come from the default length.
   - Reorder the header comment.
   - The length hint stays: "Not sure? Pick the shortest."

**Not changing:** a fee someone has already typed stays put if they go back and change the length. Only the button highlight updates.

**Verify**
- Run `npx astro check`.
- In the browser, go through Psychiatrist → Yes, I know → first fee → each length. Check the follow-up buttons show the right prices.
- Back from the follow-up fee lands on length.
- "Most common fees" shows a $235 follow-up for 15–30 min on the receipt.
- A mobile 375 screenshot.
