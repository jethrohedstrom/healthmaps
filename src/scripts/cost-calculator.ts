// Live cost-calculator receipt. Reads the same JSON the component renders
// its SSR defaults from, so the first client render matches the server HTML.
//
// Seven practitioner types. Most have one fee and one rebate; psychiatrists
// have a first appointment (its own rebate and fee range) plus follow-ups.
// Counsellors and psychotherapists have no rebate and nothing to set up.
import costsData from '../data/calculator-costs.json';

/** What you need before the first session. */
export type Setup = 'plan' | 'referral' | null;

export interface FirstVisit {
  rebate: number;
  chips: [number, number, number];
}

export interface PractitionerType {
  id: string;
  label: string;
  /** Medicare rebate per session. For psychiatrists this is the follow-up rebate. */
  rebate: number;
  /** Quick-pick fee chips: lower / typical / higher. */
  chips: [number, number, number];
  setup: Setup;
  /** Shows the "not sure which psychologist?" hint. */
  psychologist?: boolean;
  /** Psychiatrists: the first appointment has its own rebate and fee range. */
  firstVisit?: FirstVisit;
}

const types = costsData.practitionerTypes as PractitionerType[];
const SESSIONS = costsData.maxMedicareSessions;
const GP_COST_PRIVATE = costsData.gpCostPrivate;

const EM_DASH = '—';
const MINUS = '−';
const NO_REBATE = 'No rebate';

// Copy that also appears in the SSR markup of CostCalculator.astro must match.
const EMPTY_NOTE = "Enter a session fee to see what you'll pay.";
const EMPTY_NOTE_TWO_FEES = "Enter both fees to see what you'll pay.";
const CAP_NOTE = `Medicare covers up to ${SESSIONS} sessions like this each calendar year.`;
const PSYCHIATRIST_NOTE =
  'Follow-up rebate shown is for a 15–30 minute appointment. Longer follow-ups get more back. No Medicare cap on psychiatrist sessions.';
const noRebateNote = (label: string) =>
  `${label}s aren't covered by Medicare, so there's no plan or referral to organise. Some private health extras cover part of the fee.`;

const TEN_LABEL = `Over ${SESSIONS} sessions`;
const TEN_LABEL_PSYCHIATRIST = `First appointment + ${SESSIONS - 1} follow-ups`;

const aud = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });
// Fees people type are usually whole dollars; keep the card note clean
// while receipt amounts stay at two decimals.
const audWhole = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const money = (n: number) => aud.format(n);
const moneyLabel = (n: number) => (Number.isInteger(n) ? audWhole.format(n) : aud.format(n));

// Must match the SSR card note in CostCalculator.astro.
const cardNote = (fee: number) =>
  `Have ${moneyLabel(fee)} on your card on the day — you can pay with any card, but the rebate can only go back onto a debit card.`;

/** A fee input plus its quick-pick chips, wrapped in [data-fee-field]. */
interface FeeField {
  input: HTMLInputElement;
  chips: HTMLButtonElement[];
}

function initCostCalculator(): void {
  const root = document.getElementById('cost-calculator');
  if (!root) return;

  const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel);

  const form = q<HTMLFormElement>('#calc-form');
  const hintEl = q('[data-psych-hint]');
  const gpQuestion = q('[data-gp-question]');
  const singleGroup = q('[data-fee-group="single"]');
  const psychGroup = q('[data-fee-group="psychiatrist"]');

  const bodySingle = q('[data-receipt-body="single"]');
  const bodyPsych = q('[data-receipt-body="psychiatrist"]');
  const feesEl = q('[data-receipt-fees]');
  const rebateEl = q('[data-receipt-rebate]');
  const totalEl = q('[data-receipt-total]');
  const firstFeeEl = q('[data-receipt-first-fee]');
  const firstRebateEl = q('[data-receipt-first-rebate]');
  const firstTotalEl = q('[data-receipt-first-total]');
  const followFeeEl = q('[data-receipt-follow-fee]');
  const followRebateEl = q('[data-receipt-follow-rebate]');
  const followTotalEl = q('[data-receipt-follow-total]');
  const cardNoteEl = q('[data-receipt-card-note]');
  const setupBlock = q('[data-receipt-setup]');
  const gpPart = q('[data-receipt-gp-part]');
  const gpLabelEl = q('[data-receipt-gp-label]');
  const gpEl = q('[data-receipt-gp]');
  const tenRowEl = q('[data-receipt-ten-row]');
  const tenLabelEl = q('[data-receipt-ten-label]');
  const tenEl = q('[data-receipt-ten]');
  const noteEl = q('[data-receipt-note]');

  if (
    !form || !hintEl || !gpQuestion || !singleGroup || !psychGroup ||
    !bodySingle || !bodyPsych || !feesEl || !rebateEl || !totalEl ||
    !firstFeeEl || !firstRebateEl || !firstTotalEl ||
    !followFeeEl || !followRebateEl || !followTotalEl ||
    !cardNoteEl || !setupBlock || !gpPart || !gpLabelEl || !gpEl ||
    !tenRowEl || !tenLabelEl || !tenEl || !noteEl
  ) return;

  function field(id: string): FeeField | null {
    const wrap = root!.querySelector<HTMLElement>(`[data-fee-field="${id}"]`);
    const input = wrap?.querySelector<HTMLInputElement>('input[type="number"]');
    if (!wrap || !input) return null;
    return { input, chips: Array.from(wrap.querySelectorAll<HTMLButtonElement>('[data-fee-chip]')) };
  }

  const single = field('session-fee');
  const first = field('first-fee');
  const follow = field('follow-up-fee');
  if (!single || !first || !follow) return;
  const allFields = [single, first, follow];

  function selectedType(): PractitionerType {
    const value = (form!.elements.namedItem('practitionerType') as RadioNodeList).value;
    return types.find((t) => t.id === value) ?? types[0];
  }

  function fieldValue(f: FeeField): number | null {
    const v = parseFloat(f.input.value);
    if (isNaN(v) || v <= 0) return null;
    return v;
  }

  // Re-label the chips for the selected practitioner's typical fee range.
  function setChips(f: FeeField, values: [number, number, number]): void {
    f.chips.forEach((chip, i) => {
      chip.dataset.feeChip = String(values[i]);
      chip.textContent = `${chip.dataset.chipLabel} $${values[i]}`;
    });
    f.input.placeholder = `e.g. ${values[1]}`;
  }

  // Highlight the chip whose value matches the fee exactly; a typed custom
  // fee (or an empty field) clears every highlight.
  function syncChips(f: FeeField, fee: number | null): void {
    for (const chip of f.chips) {
      const pressed = fee !== null && Number(chip.dataset.feeChip) === fee;
      chip.setAttribute('aria-pressed', String(pressed));
    }
  }

  // Swap the form furniture for the selected practitioner: which fee
  // field(s) show, their chips, the psychologist hint and the GP question.
  function applyType(t: PractitionerType): void {
    const twoFees = Boolean(t.firstVisit);
    singleGroup!.hidden = twoFees;
    psychGroup!.hidden = !twoFees;
    if (t.firstVisit) {
      setChips(first!, t.firstVisit.chips);
      setChips(follow!, t.chips);
    } else {
      setChips(single!, t.chips);
    }
    hintEl!.hidden = !t.psychologist;
    gpQuestion!.hidden = t.setup === null;
  }

  function setRebateText(el: HTMLElement, rebate: number, fee: number | null): void {
    if (fee === null) {
      el.textContent = EM_DASH;
      return;
    }
    const has = rebate > 0;
    el.textContent = has ? `${MINUS}${money(rebate)}` : NO_REBATE;
    el.classList.toggle('text-primary', has);
    el.classList.toggle('text-meta-sage', !has);
  }

  function showEmpty(note: string): void {
    tenRowEl!.hidden = true;
    cardNoteEl!.hidden = true;
    noteEl!.textContent = note;
  }

  function showTotals(tenLabel: string, tenTotal: number, dayFee: number, note: string): void {
    tenLabelEl!.textContent = tenLabel;
    tenEl!.textContent = money(tenTotal);
    tenRowEl!.hidden = false;
    cardNoteEl!.textContent = cardNote(dayFee);
    cardNoteEl!.hidden = false;
    noteEl!.textContent = note;
  }

  function renderSingle(t: PractitionerType, gpCost: number): void {
    const fee = fieldValue(single!);
    syncChips(single!, fee);
    feesEl!.textContent = fee === null ? EM_DASH : money(fee);
    setRebateText(rebateEl!, t.rebate, fee);
    if (fee === null) {
      totalEl!.textContent = EM_DASH;
      showEmpty(EMPTY_NOTE);
      return;
    }
    const perSession = Math.max(0, fee - t.rebate);
    totalEl!.textContent = money(perSession);
    showTotals(
      TEN_LABEL,
      perSession * SESSIONS + gpCost,
      fee,
      t.rebate > 0 ? CAP_NOTE : noRebateNote(t.label),
    );
  }

  function renderPsychiatrist(t: PractitionerType, fv: FirstVisit, gpCost: number): void {
    const f1 = fieldValue(first!);
    const f2 = fieldValue(follow!);
    syncChips(first!, f1);
    syncChips(follow!, f2);

    firstFeeEl!.textContent = f1 === null ? EM_DASH : money(f1);
    setRebateText(firstRebateEl!, fv.rebate, f1);
    firstTotalEl!.textContent = f1 === null ? EM_DASH : money(Math.max(0, f1 - fv.rebate));

    followFeeEl!.textContent = f2 === null ? EM_DASH : money(f2);
    setRebateText(followRebateEl!, t.rebate, f2);
    followTotalEl!.textContent = f2 === null ? EM_DASH : money(Math.max(0, f2 - t.rebate));

    if (f1 === null || f2 === null) {
      showEmpty(EMPTY_NOTE_TWO_FEES);
      return;
    }
    const firstPay = Math.max(0, f1 - fv.rebate);
    const followPay = Math.max(0, f2 - t.rebate);
    showTotals(
      TEN_LABEL_PSYCHIATRIST,
      firstPay + followPay * (SESSIONS - 1) + gpCost,
      f1,
      PSYCHIATRIST_NOTE,
    );
  }

  function render(): void {
    const t = selectedType();
    const gpBulkBilled =
      (form!.elements.namedItem('gpBilling') as RadioNodeList).value === 'yes';

    // The GP appointment (care plan or referral) is a one-off setup cost,
    // shown separately — it isn't part of the per-session total, but it is
    // part of the 10-session total. Not needed at all for no-rebate types.
    const gpCost = t.setup === null ? 0 : gpBulkBilled ? 0 : GP_COST_PRIVATE;
    gpPart!.hidden = t.setup === null;
    gpLabelEl!.textContent = t.setup === 'referral' ? 'GP visit (referral)' : 'GP visit (care plan)';
    gpEl!.textContent = money(gpCost);

    bodySingle!.hidden = Boolean(t.firstVisit);
    bodyPsych!.hidden = !t.firstVisit;

    if (t.firstVisit) renderPsychiatrist(t, t.firstVisit, gpCost);
    else renderSingle(t, gpCost);

    // The block holds the GP row and the 10-session row; drop it entirely
    // when neither has anything to say.
    setupBlock!.hidden = gpPart!.hidden && tenRowEl!.hidden;
  }

  // No submit button exists; guard the Enter key's implicit submission.
  form.addEventListener('submit', (e) => e.preventDefault());

  form.addEventListener('input', render);
  form.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement | null;
    if (target?.name === 'practitionerType') applyType(selectedType());
    render();
  });

  for (const f of allFields) {
    f.input.addEventListener('focus', () => f.input.select());
    // Chips fill the field without moving focus into it (that would pop the
    // keyboard on mobile). render() isn't triggered by a programmatic value set.
    for (const chip of f.chips) {
      chip.addEventListener('click', () => {
        f.input.value = chip.dataset.feeChip ?? '';
        render();
      });
    }
  }

  applyType(selectedType());
  render();
}

initCostCalculator();
