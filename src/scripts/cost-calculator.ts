// Cost calculator: a short branching quiz that picks the practitioner, asks
// the fee and the GP cost one screen at a time, and fills in the receipt
// beside it as answers arrive. Reads the same JSON the component renders
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
  /** General and clinical psychologists share the "general or clinical?" question. */
  psychologist?: boolean;
  /** Psychiatrists: the first appointment has its own rebate and fee range. */
  firstVisit?: FirstVisit;
}

const types = costsData.practitionerTypes as PractitionerType[];
const SESSIONS = costsData.maxMedicareSessions;
const GP_COST_PRIVATE = costsData.gpCostPrivate;

// Fallback for the "most common fee" button before a practitioner is chosen:
// a general psychologist at the typical fee. Matches the SSR button text.
const DEFAULT_TYPE_ID = 'general-psychologist';
const DEFAULT_FEE = (types.find((t) => t.id === DEFAULT_TYPE_ID) ?? types[0]).chips[1];

const EM_DASH = '—';
const MINUS = '−';
const NO_REBATE = 'No rebate';

// Copy that also appears in the SSR markup of CostCalculator.astro must match
// (the SSR receipt note is START_NOTE — the page opens on the first question).
const START_NOTE = "Answer a few questions to see what you'll pay.";
const EMPTY_NOTE = "Enter a session fee to see what you'll pay.";
const EMPTY_NOTE_TWO_FEES = "Enter both fees to see what you'll pay.";
const CAP_NOTE = `Medicare covers up to ${SESSIONS} sessions like this each calendar year.`;
const PSYCHIATRIST_NOTE =
  'Follow-up rebate shown is for a 15–30 minute appointment. Longer follow-ups get more back. No Medicare cap on psychiatrist sessions.';
const noRebateNote = (label: string) =>
  `${label}s aren't covered by Medicare, so there's no plan or referral to organise. Some private health extras cover part of the fee.`;

// How a practitioner reads mid-sentence ("Seeing a …"). Labels that don't
// need reshaping just lowercase.
const SENTENCE_LABELS: Record<string, string> = {
  'general-psychologist': 'general psychologist',
};
const sentenceLabel = (t: PractitionerType): string => SENTENCE_LABELS[t.id] ?? t.label.toLowerCase();

// One-line notes on the fee screen when the practitioner was assumed.
const ASSUME_NOTES: Record<Assume & string, string> = {
  unknown: "Most people start with a general psychologist through a GP care plan. We'll use that — you can change it at the end.",
  'not-sure': "We'll use general. Most are, and their booking page will say “clinical” if not.",
};

const aud = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });
const audWhole = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const money = (n: number) => aud.format(n);
// Fees people type are usually whole dollars; keep the summary clean.
const moneyShort = (n: number) => (Number.isInteger(n) ? audWhole.format(n) : aud.format(n));
// "About" figures in the answer sentence round to whole dollars.
const moneyAbout = (n: number) => audWhole.format(Math.round(n));

// What the GP visit shows before that question is answered. Must match the
// SSR markup in CostCalculator.astro.
const GP_RANGE = `Free to ${audWhole.format(GP_COST_PRIVATE)}`;

// ── Flow ──────────────────────────────────────────────────────────────────

const SCREENS = ['who', 'psych', 'other', 'fee', 'gp', 'done'] as const;
type ScreenId = (typeof SCREENS)[number];
const BRANCHES = ['psychologist', 'psychiatrist', 'other', 'unknown'] as const;
type Branch = (typeof BRANCHES)[number];
type Assume = 'unknown' | 'not-sure' | null;

interface CalcState {
  version: 1;
  screen: ScreenId;
  /** Screens visited on the way here, newest last — the Back stack. */
  history: ScreenId[];
  branch: Branch | null;
  typeId: string | null;
  assume: Assume;
  fee: number | null;
  firstFee: number | null;
  followFee: number | null;
  /** null = not asked yet. */
  gpFree: boolean | null;
  /** A typed GP amount when they pay something other than the usual. null = the usual. */
  gpCustom: number | null;
}

const STORAGE_KEY = 'healthmaps:cost-calculator:v2';
const MAX_HISTORY = 12;

/** An unanswered quiz at the first question: the landing state, and Start again. */
const blankState = (): CalcState => ({
  version: 1,
  screen: 'who',
  history: [],
  branch: null,
  typeId: null,
  assume: null,
  fee: null,
  firstFee: null,
  followFee: null,
  gpFree: null,
  gpCustom: null,
});

const typeById = (id: string | null): PractitionerType | null =>
  id === null ? null : (types.find((t) => t.id === id) ?? null);

const isScreen = (v: unknown): v is ScreenId => typeof v === 'string' && (SCREENS as readonly string[]).includes(v);
const isFee = (v: unknown): v is number | null => v === null || (typeof v === 'number' && Number.isFinite(v) && v > 0);

function isCalcState(v: unknown): v is CalcState {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  return (
    s.version === 1 &&
    isScreen(s.screen) &&
    Array.isArray(s.history) && s.history.length <= MAX_HISTORY && s.history.every(isScreen) &&
    (s.branch === null || (BRANCHES as readonly string[]).includes(s.branch as string)) &&
    (s.typeId === null || typeById(s.typeId as string) !== null) &&
    (s.assume === null || s.assume === 'unknown' || s.assume === 'not-sure') &&
    isFee(s.fee) && isFee(s.firstFee) && isFee(s.followFee) &&
    (s.gpFree === null || typeof s.gpFree === 'boolean') &&
    // Sessions saved before the custom GP amount existed have no gpCustom.
    (s.gpCustom === undefined || isFee(s.gpCustom))
  );
}

function readState(): CalcState | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isCalcState(parsed) ? { ...parsed, gpCustom: parsed.gpCustom ?? null } : null;
  } catch {
    return null;
  }
}

function writeState(state: CalcState): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable: the flow still works for this page view.
  }
}

function clearState(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do.
  }
}

const feesComplete = (t: PractitionerType, s: CalcState): boolean =>
  t.firstVisit ? s.firstFee !== null && s.followFee !== null : s.fee !== null;

/** The canonical path for this state. Undecided tails assume the longest path. */
function pathFor(s: CalcState): ScreenId[] {
  const t = typeById(s.typeId);
  const path: ScreenId[] = ['who'];
  if (s.branch === 'psychologist') path.push('psych');
  else if (s.branch === 'other') path.push('other');
  else if (s.branch === null) path.push('psych');
  path.push('fee');
  if (!(t && t.setup === null)) path.push('gp');
  return path;
}

/** Where an answer on `screen` leads. The whole branch table lives here. */
function nextAfter(screen: ScreenId, s: CalcState): ScreenId {
  const t = typeById(s.typeId);
  switch (screen) {
    case 'who':
      if (s.branch === 'psychologist') return 'psych';
      if (s.branch === 'other') return 'other';
      return 'fee';
    case 'psych':
    case 'other':
      return 'fee';
    case 'fee':
      return t && t.setup === null ? 'done' : 'gp';
    case 'gp':
      return 'done';
    default:
      return 'done';
  }
}

/** A restored state may be ahead of its answers; walk it back to solid ground. */
function clampScreen(s: CalcState): CalcState {
  const t = typeById(s.typeId);
  let screen = s.screen;
  if (!t && screen !== 'who' && screen !== 'psych' && screen !== 'other') screen = 'who';
  if (!t && ((screen === 'psych' && s.branch !== 'psychologist') || (screen === 'other' && s.branch !== 'other'))) screen = 'who';
  if (t && (screen === 'gp' || screen === 'done') && !feesComplete(t, s)) screen = 'fee';
  if (t && screen === 'gp' && t.setup === null) screen = 'fee';
  // 'done' with the GP question unanswered is fine: the default scenario
  // starts there, and the GP row shows a range until it's answered.
  if (screen === s.screen) return s;
  const path = pathFor(s);
  return { ...s, screen, history: path.slice(0, Math.max(0, path.indexOf(screen))) };
}

function progressLabel(s: CalcState): string {
  if (s.screen === 'done') return 'Your costs';
  const path = pathFor(s);
  const n = Math.max(1, path.indexOf(s.screen) + 1);
  return `Question ${n} of ${path.length}`;
}

/** A fee input plus its quick-pick chips, wrapped in [data-fee-field]. */
interface FeeField {
  input: HTMLInputElement;
  chips: HTMLButtonElement[];
}

function initCostCalculator(): void {
  const root = document.getElementById('cost-calculator');
  if (!root) return;

  const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel);

  const screensEl = q('[data-calc-screens]');
  const liveEl = q('[data-calc-live]');
  const feeForm = q<HTMLFormElement>('form[data-calc-screen="fee"]');
  const gpForm = q<HTMLFormElement>('form[data-calc-screen="gp"]');
  const gpOtherBtn = q<HTMLButtonElement>('[data-calc-gp-other]');
  const gpCustomWrap = q('[data-gp-custom]');
  const gpInput = q<HTMLInputElement>('#gp-fee');
  const gpError = q('[data-gp-error]');
  const feeHeading = q('[data-calc-fee-heading]');
  const assumeNote = q('[data-calc-assume-note]');
  const feeError = q('[data-fee-error]');
  const singleGroup = q('[data-fee-group="single"]');
  const psychGroup = q('[data-fee-group="psychiatrist"]');
  const typicalBtn = q('[data-calc-typical]');
  const answerLine = q('[data-calc-answer-line]');

  const summaryType = q('[data-summary-type]');
  const summaryFeeLabel = q('[data-summary-fee-label]');
  const summaryFee = q('[data-summary-fee]');
  const summaryGpRow = q('[data-summary-gp-row]');
  const summaryGp = q('[data-summary-gp]');

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
  const gpPart = q('[data-receipt-gp-part]');
  const gpLabelEl = q('[data-receipt-gp-label]');
  const gpEl = q('[data-receipt-gp]');
  const noteEl = q('[data-receipt-note]');

  if (
    !screensEl || !liveEl || !feeForm || !feeHeading ||
    !gpForm || !gpOtherBtn || !gpCustomWrap || !gpInput || !gpError || !assumeNote || !feeError ||
    !singleGroup || !psychGroup || !typicalBtn || !answerLine ||
    !summaryType || !summaryFeeLabel || !summaryFee || !summaryGpRow || !summaryGp ||
    !bodySingle || !bodyPsych || !feesEl || !rebateEl || !totalEl ||
    !firstFeeEl || !firstRebateEl || !firstTotalEl ||
    !followFeeEl || !followRebateEl || !followTotalEl ||
    !gpPart || !gpLabelEl || !gpEl || !noteEl
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

  const screens = Array.from(root.querySelectorAll<HTMLElement>('[data-calc-screen]'));
  const screenEl = (id: ScreenId) => screens.find((el) => el.dataset.calcScreen === id) ?? null;

  let state: CalcState = clampScreen(readState() ?? blankState());

  const currentType = (): PractitionerType | null => typeById(state.typeId);

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

  // Swap the fee screen's furniture for the selected practitioner: which
  // fee field(s) show, their chips, the heading and the assumption note.
  function applyType(t: PractitionerType | null): void {
    const twoFees = Boolean(t?.firstVisit);
    singleGroup!.hidden = twoFees;
    psychGroup!.hidden = !twoFees;
    if (t?.firstVisit) {
      setChips(first!, t.firstVisit.chips);
      setChips(follow!, t.chips);
    } else if (t) {
      setChips(single!, t.chips);
    }
    feeHeading!.textContent = twoFees ? 'Do you know what they charge?' : 'Do you know what they charge per session?';
    typicalBtn!.textContent = t?.firstVisit
      ? 'No — use the most common fees'
      : `No — use the most common fee ($${t?.chips[1] ?? DEFAULT_FEE})`;
    const note = state.assume ? ASSUME_NOTES[state.assume] : '';
    assumeNote!.textContent = note;
    assumeNote!.hidden = !note;
  }

  function syncInputsFromState(): void {
    single!.input.value = state.fee === null ? '' : String(state.fee);
    first!.input.value = state.firstFee === null ? '' : String(state.firstFee);
    follow!.input.value = state.followFee === null ? '' : String(state.followFee);
  }

  function syncStateFromInputs(): void {
    state.fee = fieldValue(single!);
    state.firstFee = fieldValue(first!);
    state.followFee = fieldValue(follow!);
  }

  // ── Receipt ─────────────────────────────────────────────────────────────

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

  function renderSingle(t: PractitionerType): void {
    const fee = fieldValue(single!);
    syncChips(single!, fee);
    feesEl!.textContent = fee === null ? EM_DASH : money(fee);
    setRebateText(rebateEl!, t.rebate, fee);
    if (fee === null) {
      totalEl!.textContent = EM_DASH;
      noteEl!.textContent = EMPTY_NOTE;
      return;
    }
    totalEl!.textContent = money(Math.max(0, fee - t.rebate));
    noteEl!.textContent = t.rebate > 0 ? CAP_NOTE : noRebateNote(t.label);
  }

  function renderPsychiatrist(t: PractitionerType, fv: FirstVisit): void {
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

    noteEl!.textContent = f1 === null || f2 === null ? EMPTY_NOTE_TWO_FEES : PSYCHIATRIST_NOTE;
  }

  function renderEmpty(): void {
    bodySingle!.hidden = false;
    bodyPsych!.hidden = true;
    syncChips(single!, null);
    feesEl!.textContent = EM_DASH;
    rebateEl!.textContent = EM_DASH;
    totalEl!.textContent = EM_DASH;
    gpPart!.hidden = true;
    noteEl!.textContent = START_NOTE;
  }

  // The one-sentence answer on the final screen. Psychiatrists have two fees
  // and are left to the receipt. SSR default text must match what this writes
  // for the default state.
  function renderAnswerLine(t: PractitionerType | null): void {
    if (!t || t.firstVisit || state.fee === null) {
      answerLine!.hidden = true;
      return;
    }
    const usual = state.fee === t.chips[1] ? 'usually costs about' : 'costs';
    const opening = `Seeing a ${sentenceLabel(t)}${t.setup === 'plan' ? ' with a care plan' : ''} ${usual} ${moneyShort(state.fee)} a session.`;
    answerLine!.textContent =
      t.rebate > 0
        ? `${opening} Medicare gives back ${money(t.rebate)}. You pay about ${moneyAbout(state.fee - t.rebate)}.`
        : `${opening} There's no Medicare rebate — you pay the full fee.`;
    answerLine!.hidden = false;
  }

  function renderSummary(t: PractitionerType | null): void {
    summaryType!.textContent = t ? t.label : EM_DASH;
    if (t?.firstVisit) {
      summaryFeeLabel!.textContent = 'Fees';
      summaryFee!.textContent =
        state.firstFee !== null && state.followFee !== null
          ? `${moneyShort(state.firstFee)} first, then ${moneyShort(state.followFee)}`
          : EM_DASH;
    } else {
      summaryFeeLabel!.textContent = 'Session fee';
      summaryFee!.textContent = state.fee === null ? EM_DASH : moneyShort(state.fee);
    }
    const askedGp = Boolean(t && t.setup !== null);
    summaryGpRow!.hidden = !askedGp;
    summaryGp!.textContent =
      state.gpFree === null
        ? GP_RANGE
        : state.gpFree
          ? 'Free'
          : state.gpCustom !== null
            ? moneyShort(state.gpCustom)
            : `About ${moneyShort(GP_COST_PRIVATE)}`;
  }

  function render(): void {
    const t = currentType();
    if (!t) {
      renderEmpty();
      renderAnswerLine(null);
      renderSummary(null);
      return;
    }

    // The GP appointment (care plan or referral) is a one-off setup cost,
    // shown separately from the per-session figure. Not needed at all for
    // no-rebate types, and unknown until the GP question is answered.
    const gpCost = t.setup === null || state.gpFree ? 0 : (state.gpCustom ?? GP_COST_PRIVATE);
    gpPart!.hidden = t.setup === null;
    gpLabelEl!.textContent = t.setup === 'referral' ? 'GP visit (referral)' : 'GP visit (care plan)';
    gpEl!.textContent = state.gpFree === null ? GP_RANGE : money(gpCost);

    bodySingle!.hidden = Boolean(t.firstVisit);
    bodyPsych!.hidden = !t.firstVisit;
    if (t.firstVisit) renderPsychiatrist(t, t.firstVisit);
    else renderSingle(t);

    renderAnswerLine(t);
    renderSummary(t);
  }

  // ── Screens ─────────────────────────────────────────────────────────────

  function setButtonsDisabled(screen: HTMLElement, disabled: boolean): void {
    screen.querySelectorAll<HTMLButtonElement>('button').forEach((b) => {
      b.disabled = disabled;
    });
  }

  function announce(message: string): void {
    liveEl!.textContent = message;
  }

  function showScreen(id: ScreenId, focus: boolean): void {
    const active = screenEl(id);
    if (!active) return;
    for (const el of screens) {
      const isActive = el === active;
      el.classList.toggle('calc-screen--hidden', !isActive);
      setButtonsDisabled(el, !isActive);
      const progress = el.querySelector<HTMLElement>('[data-calc-progress]');
      if (isActive && progress) progress.textContent = progressLabel(state);
    }
    feeError!.hidden = true;
    gpError!.hidden = true;
    // The GP amount box stays open when a typed amount is the current answer.
    if (id === 'gp') setGpCustomOpen(state.gpFree === false && state.gpCustom !== null);
    if (!focus) return;
    announce(id === 'done' ? 'Your costs.' : `${progressLabel(state)}.`);
    const heading = active.querySelector<HTMLElement>('[data-calc-heading]');
    requestAnimationFrame(() => heading?.focus({ preventScroll: true }));
  }

  function go(next: ScreenId): void {
    state.history = [...state.history.slice(-(MAX_HISTORY - 1)), state.screen];
    state.screen = next;
    // Arriving at the end normalises the stack so Change/Back loops don't pile up.
    if (next === 'done') state.history = pathFor(state);
    writeState(state);
    showScreen(next, true);
  }

  function back(): void {
    const prev = state.history.pop();
    if (!prev) return;
    state.screen = prev;
    writeState(state);
    showScreen(prev, true);
  }

  function goto(id: ScreenId): void {
    state.history = [...state.history, state.screen];
    state.screen = id;
    writeState(state);
    showScreen(id, true);
  }

  function reset(): void {
    clearState();
    state = blankState();
    syncInputsFromState();
    applyType(null);
    render();
    showScreen('who', true);
  }

  function setType(id: string, assume: Assume): void {
    if (id !== state.typeId) {
      // A fee typed for one practitioner is misleading for another.
      state.fee = state.firstFee = state.followFee = null;
      syncInputsFromState();
    }
    state.typeId = id;
    state.assume = assume;
  }

  function handleAnswer(button: HTMLElement): void {
    const { branch, type, assume, gp } = button.dataset;
    if (branch && (BRANCHES as readonly string[]).includes(branch)) {
      state.branch = branch as Branch;
      if (!type) state.typeId = null;
    }
    if (type) setType(type, assume === 'unknown' || assume === 'not-sure' ? assume : null);
    if (gp === 'free' || gp === 'paid') {
      state.gpFree = gp === 'free';
      state.gpCustom = null;
    }
    applyType(currentType());
    render();
    go(nextAfter(state.screen, state));
  }

  // "I'm just looking": fill the typical fee(s) and move on.
  function handleTypical(): void {
    const t = currentType();
    if (!t) return;
    if (t.firstVisit) {
      first!.input.value = String(t.firstVisit.chips[1]);
      follow!.input.value = String(t.chips[1]);
    } else {
      single!.input.value = String(t.chips[1]);
    }
    syncStateFromInputs();
    render();
    feeError!.hidden = true;
    go(nextAfter('fee', state));
  }

  function handleFeeNext(): void {
    const t = currentType();
    if (!t) return;
    syncStateFromInputs();
    if (!feesComplete(t, state)) {
      feeError!.hidden = false;
      const empty = (t.firstVisit ? [first!, follow!] : [single!]).find((f) => fieldValue(f) === null);
      empty?.input.focus();
      return;
    }
    feeError!.hidden = true;
    go(nextAfter('fee', state));
  }

  function setGpCustomOpen(open: boolean): void {
    gpCustomWrap!.hidden = !open;
    gpOtherBtn!.setAttribute('aria-expanded', String(open));
    gpInput!.value = open && state.gpCustom !== null ? String(state.gpCustom) : '';
  }

  function handleGpNext(): void {
    const v = parseFloat(gpInput!.value);
    if (isNaN(v) || v <= 0) {
      gpError!.hidden = false;
      gpInput!.focus();
      return;
    }
    gpError!.hidden = true;
    state.gpFree = false;
    state.gpCustom = v;
    render();
    go(nextAfter('gp', state));
  }

  // ── Events ──────────────────────────────────────────────────────────────

  root.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const answer = target.closest<HTMLElement>('[data-calc-answer]');
    if (answer && !(answer as HTMLButtonElement).disabled) return handleAnswer(answer);
    const typical = target.closest<HTMLButtonElement>('[data-calc-typical]');
    if (typical && !typical.disabled) return handleTypical();
    const gpOther = target.closest<HTMLButtonElement>('[data-calc-gp-other]');
    if (gpOther && !gpOther.disabled) {
      setGpCustomOpen(true);
      gpInput.focus();
      return;
    }
    if (target.closest('[data-calc-back]')) return back();
    const gotoEl = target.closest<HTMLElement>('[data-calc-goto]');
    if (gotoEl && isScreen(gotoEl.dataset.calcGoto)) return goto(gotoEl.dataset.calcGoto);
    if (target.closest('[data-calc-reset]')) return reset();
  });

  // Enter in a fee field submits the form; route it like the Next button.
  feeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFeeNext();
  });

  // Enter in the GP amount field, or its Next button.
  gpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleGpNext();
  });

  gpInput.addEventListener('input', () => {
    if (gpInput.value !== '') gpError.hidden = true;
  });

  feeForm.addEventListener('input', () => {
    syncStateFromInputs();
    writeState(state);
    render();
    const t = currentType();
    if (t && feesComplete(t, state)) feeError!.hidden = true;
  });

  for (const f of allFields) {
    f.input.addEventListener('focus', () => f.input.select());
    // Chips fill the field without moving focus into it (that would pop the
    // keyboard on mobile). render() isn't triggered by a programmatic value set.
    for (const chip of f.chips) {
      chip.addEventListener('click', () => {
        f.input.value = chip.dataset.feeChip ?? '';
        syncStateFromInputs();
        writeState(state);
        render();
        const t = currentType();
        if (t && feesComplete(t, state)) feeError!.hidden = true;
      });
    }
  }

  // Initial render reconciles the SSR markup with any restored session.
  // No focus and no scrolling on load.
  syncInputsFromState();
  applyType(currentType());
  render();
  showScreen(state.screen, false);
}

initCostCalculator();
