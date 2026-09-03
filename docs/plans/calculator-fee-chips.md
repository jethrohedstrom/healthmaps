# Calculator: quick-pick fee chips

## Context

The cost calculator's session-fee field starts empty (commit `1d44386`), so a visitor who doesn't know their psychologist's fee sees a receipt full of em-dashes and nothing to do. Many visitors are just curious. Research on currency inputs (uxpatterns.dev, HMRC, Mobiscroll) says the strongest pattern is a free-text field plus preset "quick-pick" buttons underneath. Decisions agreed in brainstorm (3 Sep 2026):

- Chips under the field, field stays empty by default.
- Three tiers, no bulk-billed chip (it raises more questions than it answers).
- Values **$200 / $250 / $330** (top = APS recommended 2026-27 rate; middle near the 2026 Help Link median of $245).
- Row reads: lead-in "Not sure? Try a typical fee:" then chips **Lower $200 · Typical $250 · Higher $330**. Replaces the current "Typical range: $150–$300" hint.

## Files

1. `src/data/calculator-costs.json`
2. `src/components/CostCalculator.astro`
3. `src/scripts/cost-calculator.ts`
4. `docs/plans/calculator-fee-chips.md` (copy of this plan, per CLAUDE.md "plan into a file")

## Steps

### 1. Data — `calculator-costs.json`
- `sessionFeeRange` → `{ "low": 200, "mid": 250, "high": 330 }`.
- Append a `reviewNotes` entry: source (Help Link 2026 network data: median $245, avg $237, range $0–$360; APS recommended 2026-27 = $330), verified 2026-09-03.
- `placeholder={`e.g. ${range.mid}`}` in the component picks up $250 automatically.

### 2. Markup — `CostCalculator.astro`
Replace the `#fee-hint` paragraph (line 40) with a chip row inside the same fee `<div>`:

```html
<p class="text-xs text-body mt-2">Not sure? Try a typical fee:</p>
<div class="mt-1.5 flex flex-wrap gap-2" role="group" aria-label="Typical session fees">
  <button type="button" class={feeChip} data-fee-chip={range.low}  aria-pressed="false">Lower ${range.low}</button>
  <button type="button" class={feeChip} data-fee-chip={range.mid}  aria-pressed="false">Typical ${range.mid}</button>
  <button type="button" class={feeChip} data-fee-chip={range.high} aria-pressed="false">Higher ${range.high}</button>
</div>
```

- New frontmatter const `feeChip`, a compact sibling of the existing `optionCard` (same tokens, smaller):
  `inline-flex min-h-9 items-center rounded-[10px] border border-ink-green/16 bg-white px-3 py-1.5 text-sm font-semibold text-heading transition-colors duration-150 hover:border-primary hover:bg-primary-light aria-pressed:border-primary aria-pressed:bg-primary-light aria-pressed:ring-1 aria-pressed:ring-primary cursor-pointer`
  (Tailwind v4 has a native `aria-pressed:` variant, so no CSS added; inner-furniture border per design.md.)
- `type="button"` so the existing Enter-key submit guard is unaffected.
- Keep the `Session fee ($)` label and number input as they are.

### 3. Behaviour — `cost-calculator.ts`
- Query `root.querySelectorAll<HTMLButtonElement>('[data-fee-chip]')`.
- On chip click: `feeInput.value = chip.dataset.feeChip`, then `render()`. Do **not** move focus to the input (would pop the keyboard on mobile).
- New `syncChips()` called at the end of `render()`: set `aria-pressed="true"` only on the chip whose value equals the current fee exactly, `"false"` on the rest. Typing a custom fee therefore clears the highlight; clearing the field clears all.
- `render()` already runs on `input`/`change`, so a chip click needs just the one explicit `render()` call.

### 4. Plan copy
Write `docs/plans/calculator-fee-chips.md` (this file, trimmed) so a fresh session can pick it up.

## Out of scope
- Slider, range receipt, bulk-billed chip — all considered and rejected.
- TASKS.md "too wordy" item stays open; the lead-in is one short line, and the old hint line is removed, so net word count is roughly flat.

## Verification
1. `npx astro check` and `npm run build` — 0 errors, 0 warnings.
2. Dev server (`npm run dev` in a separate tab), open `/calculator`:
   - Empty field: receipt shows dashes, no chip highlighted.
   - Click "Typical $250": field shows 250, receipt shows $250 / −$101.55 / **$148.45**, chip highlighted.
   - Type 260: highlight clears. Clear field: dashes return.
   - Keyboard: Tab reaches chips, Space/Enter activates, no form submit.
   - Enter key in the number field still does nothing.
3. Mobile 375px via headless Playwright (per `project_browser_testing_setup` memory; pattern in `scripts/screenshot-*.mjs`): chips wrap to two lines cleanly, no horizontal scroll. Save before/after PNGs to `docs/`.
4. Commit; don't push (deploy decision is the user's).

Estimate: ~30 min including screenshots.
