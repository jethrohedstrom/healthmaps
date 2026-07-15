// Live cost-calculator receipt. Reads the same JSON the component renders
// its SSR defaults from, so the first client render matches the server HTML.
import costsData from '../data/calculator-costs.json';

interface PractitionerType {
  id: string;
  label: string;
  rebatePerSession: number;
  requiresMHCP: boolean;
}

interface FeeRange {
  low: number;
  mid: number;
  high: number;
}

const practitionerTypes = costsData.practitionerTypes as PractitionerType[];
const feeRanges = costsData.sessionFeeRanges as Record<string, FeeRange>;

const GP_COST_PRIVATE = costsData.gpCostPrivate;

const EM_DASH = '—';
const MINUS = '−';

// Must match the SSR note text in CostCalculator.astro.
const YEAR_NOTE = 'Medicare covers up to 10 sessions like this each calendar year.';

const aud = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

const money = (n: number) => aud.format(n);

function initCostCalculator(): void {
  const root = document.getElementById('cost-calculator');
  if (!root) return;

  const form = root.querySelector<HTMLFormElement>('#calc-form');
  const feeInput = root.querySelector<HTMLInputElement>('#session-fee');
  const feeHint = root.querySelector<HTMLParagraphElement>('#fee-hint');

  const feesEl = root.querySelector<HTMLElement>('[data-receipt-fees]');
  const rebateEl = root.querySelector<HTMLElement>('[data-receipt-rebate]');
  const gpLabelEl = root.querySelector<HTMLElement>('[data-receipt-gp-label]');
  const gpEl = root.querySelector<HTMLElement>('[data-receipt-gp]');
  const totalEl = root.querySelector<HTMLElement>('[data-receipt-total]');
  const noteEl = root.querySelector<HTMLElement>('[data-receipt-note]');

  if (
    !form || !feeInput || !feeHint ||
    !feesEl || !rebateEl || !gpLabelEl || !gpEl || !totalEl || !noteEl
  ) return;

  // Once the user has typed a fee, switching practitioner stops overwriting it.
  let feeDirty = false;

  function getSelected(): PractitionerType {
    const value = (form!.elements.namedItem('practitionerType') as RadioNodeList).value;
    return practitionerTypes.find((p) => p.id === value) ?? practitionerTypes[0];
  }

  function getFee(): number | null {
    const v = parseFloat(feeInput!.value);
    if (isNaN(v) || v <= 0) return null;
    return v;
  }

  function updateFeeHint(prac: PractitionerType): void {
    const range = feeRanges[prac.id];
    if (!range) return;
    feeHint!.textContent = `Typical range: $${range.low}–$${range.high}`;
    feeInput!.placeholder = `e.g. ${range.mid}`;
  }

  function prefillFee(prac: PractitionerType): void {
    if (feeDirty && feeInput!.value.trim() !== '') return;
    const range = feeRanges[prac.id];
    if (!range) return;
    feeInput!.value = String(range.mid);
    feeDirty = false;
  }

  function gpVisitLabel(requiresMHCP: boolean): string {
    return requiresMHCP ? 'GP visit (care plan)' : 'GP visit (referral)';
  }

  function render(): void {
    const prac = getSelected();
    const gpBulkBilled =
      (form!.elements.namedItem('gpBilling') as RadioNodeList).value === 'yes';
    const fee = getFee();

    updateFeeHint(prac);

    // The GP appointment (care plan or referral) is a one-off setup cost,
    // shown separately — it isn't part of the per-session total.
    const gpCost = gpBulkBilled ? 0 : GP_COST_PRIVATE;
    gpLabelEl!.textContent = gpVisitLabel(prac.requiresMHCP);
    gpEl!.textContent = money(gpCost);

    if (fee === null) {
      feesEl!.textContent = EM_DASH;
      rebateEl!.textContent = EM_DASH;
      totalEl!.textContent = EM_DASH;
      noteEl!.textContent = 'Enter a session fee to see your estimate.';
      return;
    }

    const rebate = prac.rebatePerSession;
    const perSession = Math.max(0, fee - rebate);

    feesEl!.textContent = money(fee);
    rebateEl!.textContent = `${MINUS}${money(rebate)}`;
    totalEl!.textContent = money(perSession);
    noteEl!.textContent = YEAR_NOTE;
  }

  // No submit button exists; guard the Enter key's implicit submission.
  form.addEventListener('submit', (e) => e.preventDefault());

  form.addEventListener('input', render);
  form.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    if (target.name === 'practitionerType') prefillFee(getSelected());
    render();
  });

  feeInput.addEventListener('input', () => {
    feeDirty = true;
  });
  feeInput.addEventListener('focus', () => feeInput.select());

  render();
}

initCostCalculator();
