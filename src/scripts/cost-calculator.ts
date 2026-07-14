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

const MIN_SESSIONS = 1;
const MAX_SESSIONS = costsData.maxMedicareSessions;
const GP_COST_PRIVATE = costsData.gpCostPrivate;

const EM_DASH = '—';
const MINUS = '−';

const aud = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });
// Fees people type are usually whole dollars; keep the "10 sessions × $220"
// label clean while amounts stay at two decimals.
const audWhole = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const money = (n: number) => aud.format(n);
const moneyLabel = (n: number) => (Number.isInteger(n) ? audWhole.format(n) : aud.format(n));

function initCostCalculator(): void {
  const root = document.getElementById('cost-calculator');
  if (!root) return;

  const form = root.querySelector<HTMLFormElement>('#calc-form');
  const feeInput = root.querySelector<HTMLInputElement>('#session-fee');
  const feeHint = root.querySelector<HTMLParagraphElement>('#fee-hint');
  const sessionsInput = root.querySelector<HTMLInputElement>('#num-sessions');
  const minusBtn = root.querySelector<HTMLButtonElement>('#sessions-minus');
  const plusBtn = root.querySelector<HTMLButtonElement>('#sessions-plus');

  const feesLabelEl = root.querySelector<HTMLElement>('[data-receipt-fees-label]');
  const feesEl = root.querySelector<HTMLElement>('[data-receipt-fees]');
  const rebateEl = root.querySelector<HTMLElement>('[data-receipt-rebate]');
  const gpLabelEl = root.querySelector<HTMLElement>('[data-receipt-gp-label]');
  const gpEl = root.querySelector<HTMLElement>('[data-receipt-gp]');
  const totalEl = root.querySelector<HTMLElement>('[data-receipt-total]');
  const noteEl = root.querySelector<HTMLElement>('[data-receipt-note]');

  if (
    !form || !feeInput || !feeHint || !sessionsInput || !minusBtn || !plusBtn ||
    !feesLabelEl || !feesEl || !rebateEl || !gpLabelEl || !gpEl || !totalEl || !noteEl
  ) return;

  // Once the user has typed a fee, switching practitioner stops overwriting it.
  let feeDirty = false;

  function getSessions(): number {
    const v = parseInt(sessionsInput!.value, 10);
    if (isNaN(v)) return MAX_SESSIONS;
    return Math.min(MAX_SESSIONS, Math.max(MIN_SESSIONS, v));
  }

  function setSessions(v: number): void {
    sessionsInput!.value = String(v);
    minusBtn!.disabled = v <= MIN_SESSIONS;
    plusBtn!.disabled = v >= MAX_SESSIONS;
  }

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

  function gpVisitLabel(visits: number, requiresMHCP: boolean): string {
    if (!requiresMHCP) return 'GP visit × 1 (referral)';
    if (visits === 2) return 'GP visits × 2 (care plan + review)';
    return 'GP visit × 1 (care plan)';
  }

  function render(): void {
    const prac = getSelected();
    const sessions = getSessions();
    const gpBulkBilled =
      (form!.elements.namedItem('gpBilling') as RadioNodeList).value === 'yes';
    const fee = getFee();

    updateFeeHint(prac);

    // GP costs: initial MHCP/referral appointment, plus the after-6-sessions
    // review — but only MHCP pathways have that review (psychiatrists don't).
    const gpVisits = prac.requiresMHCP && sessions > 6 ? 2 : 1;
    const gpCostPerVisit = gpBulkBilled ? 0 : GP_COST_PRIVATE;
    const totalGpCost = gpVisits * gpCostPerVisit;
    gpLabelEl!.textContent = gpVisitLabel(gpVisits, prac.requiresMHCP);

    if (fee === null) {
      feesLabelEl!.textContent = `${sessions} session${sessions === 1 ? '' : 's'}`;
      feesEl!.textContent = EM_DASH;
      rebateEl!.textContent = EM_DASH;
      gpEl!.textContent = EM_DASH;
      totalEl!.textContent = EM_DASH;
      noteEl!.textContent = 'Enter a session fee to see your estimate.';
      noteEl!.hidden = false;
      return;
    }

    const totalFees = fee * sessions;
    const totalRebate = prac.rebatePerSession * sessions;
    const outOfPocket = Math.max(0, totalFees - totalRebate + totalGpCost);
    const gapPerSession = Math.max(0, fee - prac.rebatePerSession);

    feesLabelEl!.textContent =
      `${sessions} session${sessions === 1 ? '' : 's'} × ${moneyLabel(fee)}`;
    feesEl!.textContent = money(totalFees);
    rebateEl!.textContent = `${MINUS}${money(totalRebate)}`;
    gpEl!.textContent = money(totalGpCost);
    totalEl!.textContent = money(outOfPocket);

    if (gapPerSession > 0) {
      noteEl!.textContent =
        `That’s ${money(gapPerSession)} per session after the rebate.`;
      noteEl!.hidden = false;
    } else {
      noteEl!.textContent = '';
      noteEl!.hidden = true;
    }
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

  // Keep directly typed values in the supported Medicare range before the
  // form-level input handler renders the receipt.
  sessionsInput.addEventListener('input', () => {
    setSessions(getSessions());
  });

  minusBtn.addEventListener('click', () => {
    setSessions(Math.max(MIN_SESSIONS, getSessions() - 1));
    render();
  });
  plusBtn.addEventListener('click', () => {
    setSessions(Math.min(MAX_SESSIONS, getSessions() + 1));
    render();
  });
  sessionsInput.addEventListener('change', () => {
    setSessions(getSessions());
    render();
  });

  setSessions(getSessions());
  render();
}

initCostCalculator();
