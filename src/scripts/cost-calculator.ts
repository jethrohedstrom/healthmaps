// Live cost-calculator receipt. Reads the same JSON the component renders
// its SSR defaults from, so the first client render matches the server HTML.
// One scenario only: GP mental health treatment plan → general psychologist
// (MBS item 80110).
import costsData from '../data/calculator-costs.json';

const REBATE = costsData.rebatePerSession;
const SESSIONS = costsData.maxMedicareSessions;
const GP_COST_PRIVATE = costsData.gpCostPrivate;

const EM_DASH = '—';
const MINUS = '−';

const YEAR_NOTE = `Medicare covers up to ${SESSIONS} sessions like this each calendar year.`;
// Must match the SSR empty-state note in CostCalculator.astro.
const EMPTY_NOTE = "Enter a session fee to see what you'll pay.";

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

function initCostCalculator(): void {
  const root = document.getElementById('cost-calculator');
  if (!root) return;

  const form = root.querySelector<HTMLFormElement>('#calc-form');
  const feeInput = root.querySelector<HTMLInputElement>('#session-fee');
  const feeChips = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-fee-chip]'));

  const feesEl = root.querySelector<HTMLElement>('[data-receipt-fees]');
  const rebateEl = root.querySelector<HTMLElement>('[data-receipt-rebate]');
  const gpEl = root.querySelector<HTMLElement>('[data-receipt-gp]');
  const tenRowEl = root.querySelector<HTMLElement>('[data-receipt-ten-row]');
  const tenEl = root.querySelector<HTMLElement>('[data-receipt-ten]');
  const totalEl = root.querySelector<HTMLElement>('[data-receipt-total]');
  const cardNoteEl = root.querySelector<HTMLElement>('[data-receipt-card-note]');
  const noteEl = root.querySelector<HTMLElement>('[data-receipt-note]');

  if (
    !form || !feeInput ||
    !feesEl || !rebateEl || !gpEl || !tenRowEl || !tenEl || !totalEl || !cardNoteEl || !noteEl
  ) return;

  function getFee(): number | null {
    const v = parseFloat(feeInput!.value);
    if (isNaN(v) || v <= 0) return null;
    return v;
  }

  // Highlight the chip whose value matches the fee exactly; a typed custom
  // fee (or an empty field) clears every highlight.
  function syncChips(fee: number | null): void {
    for (const chip of feeChips) {
      const pressed = fee !== null && Number(chip.dataset.feeChip) === fee;
      chip.setAttribute('aria-pressed', String(pressed));
    }
  }

  function render(): void {
    const gpBulkBilled =
      (form!.elements.namedItem('gpBilling') as RadioNodeList).value === 'yes';
    const fee = getFee();
    syncChips(fee);

    // The GP care-plan appointment is a one-off setup cost, shown separately —
    // it isn't part of the per-session total, but it is part of the 10-session total.
    const gpCost = gpBulkBilled ? 0 : GP_COST_PRIVATE;
    gpEl!.textContent = money(gpCost);

    if (fee === null) {
      feesEl!.textContent = EM_DASH;
      rebateEl!.textContent = EM_DASH;
      totalEl!.textContent = EM_DASH;
      tenEl!.textContent = EM_DASH;
      tenRowEl!.hidden = true;
      cardNoteEl!.hidden = true;
      noteEl!.textContent = EMPTY_NOTE;
      return;
    }

    const perSession = Math.max(0, fee - REBATE);
    const tenSessions = perSession * SESSIONS + gpCost;

    feesEl!.textContent = money(fee);
    rebateEl!.textContent = `${MINUS}${money(REBATE)}`;
    totalEl!.textContent = money(perSession);
    tenEl!.textContent = money(tenSessions);
    tenRowEl!.hidden = false;
    cardNoteEl!.textContent = cardNote(fee);
    cardNoteEl!.hidden = false;
    noteEl!.textContent = YEAR_NOTE;
  }

  // No submit button exists; guard the Enter key's implicit submission.
  form.addEventListener('submit', (e) => e.preventDefault());

  form.addEventListener('input', render);
  form.addEventListener('change', render);

  feeInput.addEventListener('focus', () => feeInput.select());

  // Chips fill the field without moving focus into it (that would pop the
  // keyboard on mobile). render() isn't triggered by a programmatic value set.
  for (const chip of feeChips) {
    chip.addEventListener('click', () => {
      feeInput.value = chip.dataset.feeChip ?? '';
      render();
    });
  }

  render();
}

initCostCalculator();
