// Cost calculator: a short branching quiz, one question per screen. It picks
// the practitioner, takes one fee per screen (psychiatrists: first, follow-up
// length, follow-up), asks the GP cost, then shows the answer as one big
// number beside the receipt it has been filling in as the answers arrived.
// Each fee starts on the practitioner's most common fee and is changed with a
// slider (or by typing in the number), on its own screen and on the results. Reads the same JSON the component renders
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

/** A psychiatrist follow-up length and its MBS item. */
export interface FollowUpLength {
  id: string;
  label: string;
  item: number;
  rebate: number;
  /** Quick-pick follow-up fee chips for this length: lower / typical / higher. */
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
  /** Psychiatrists: follow-up lengths, each with its own rebate. The first is the default. */
  followUpLengths?: FollowUpLength[];
}

const types = costsData.practitionerTypes as PractitionerType[];
const SESSIONS = costsData.maxMedicareSessions;
const GP_COST_PRIVATE = costsData.gpCostPrivate;

const EM_DASH = '—';
const MINUS = '−';
const NO_REBATE = 'No rebate';

// Copy that also appears in the SSR markup of CostCalculator.astro must match
// (the SSR receipt note is START_NOTE — the page opens on the first question).
const START_NOTE = "Answer a few questions to see what you'll pay.";
const EMPTY_NOTE = "Enter a session fee to see what you'll pay.";
const EMPTY_NOTE_TWO_FEES = "Enter both fees to see what you'll pay.";
const CAP_NOTE = `Medicare covers up to ${SESSIONS} sessions like this each calendar year.`;
// REVIEW: the 50-session claim is AI-drafted health content; check against MBS.
const PSYCHIATRIST_NOTE =
  'Medicare pays back more for longer sessions. After 50 psychiatrist sessions in a calendar year, rebates roughly halve.';
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
  unknown: "We'll use a general psychologist, where most people start. You can change it at the end.",
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

// REVIEW: AI-drafted claim — Easyclaim at the clinic pays the rebate same day or overnight; app/myGov claims usually land in 1–3 business days (Services Australia says "usually within 7 days").
const dayNote = (fee: number, rebate: number) =>
  `Have ${moneyShort(fee)} on your card on the day. Medicare pays ${money(rebate)} back, usually within a few days.`;

// The one-off GP visit (care plan or referral), as a sentence on the results.
function gpLine(setup: Setup, gpFree: boolean | null, gpCustom: number | null): string {
  const visit = `The GP visit for your ${setup === 'referral' ? 'referral' : 'care plan'}`;
  if (gpFree === null) return `${visit} can be free, or cost about ${moneyShort(GP_COST_PRIVATE)}.`;
  if (gpFree) return `${visit} is free.`;
  return gpCustom !== null
    ? `${visit} costs ${moneyShort(gpCustom)}. You pay that once.`
    : `${visit} costs about ${moneyShort(GP_COST_PRIVATE)}. You pay that once.`;
}

// A fee slider runs from half the lower fee to 1.4 times the higher one.
// Must match feeRange() in CostCalculator.astro.
const feeRange = (fees: readonly number[]) => ({
  min: Math.floor(fees[0] / 2 / 10) * 10,
  max: Math.ceil((fees[2] * 1.4) / 10) * 10,
  typical: fees[1],
});

// ── Flow ──────────────────────────────────────────────────────────────────

const SCREENS = ['who', 'psych', 'other', 'fee', 'first', 'follow', 'length', 'gp', 'done'] as const;
/** Screens with a typed fee box. Which ones a path uses depends on the practitioner. */
const FEE_SCREENS: readonly ScreenId[] = ['fee', 'first', 'follow'];
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
  /** Psychiatrist follow-up length id. null = the default (shortest). */
  followLength: string | null;
}

const STORAGE_KEY = 'healthmaps:cost-calculator:v4';
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
  followLength: null,
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
    (s.gpCustom === undefined || isFee(s.gpCustom)) &&
    (s.followLength === undefined || s.followLength === null || typeof s.followLength === 'string')
  );
}

function readState(): CalcState | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isCalcState(parsed)
      ? { ...parsed, gpCustom: parsed.gpCustom ?? null, followLength: parsed.followLength ?? null }
      : null;
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

/** The fee screens this practitioner uses, in order. */
const feeScreensFor = (t: PractitionerType | null): ScreenId[] =>
  t?.firstVisit ? ['first', 'length', 'follow'] : ['fee'];

/** After the fees: the GP question, unless there's nothing to set up. */
const afterFees = (t: PractitionerType | null): ScreenId => (t && t.setup === null ? 'done' : 'gp');

/** The canonical path for this state. Undecided tails assume the longest path. */
function pathFor(s: CalcState): ScreenId[] {
  const t = typeById(s.typeId);
  const path: ScreenId[] = ['who'];
  if (s.branch === 'psychologist') path.push('psych');
  else if (s.branch === 'other') path.push('other');
  else if (s.branch === null) path.push('psych');
  path.push(...feeScreensFor(t));
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
      return feeScreensFor(t)[0];
    case 'psych':
    case 'other':
      return feeScreensFor(t)[0];
    case 'first':
      return 'length';
    case 'length':
      return 'follow';
    case 'fee':
    case 'follow':
      return afterFees(t);
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
  // A fee screen that belongs to a different practitioner shape.
  if (t && (FEE_SCREENS.includes(screen) || screen === 'length') && !feeScreensFor(t).includes(screen)) screen = feeScreensFor(t)[0];
  if (t && screen === 'follow' && s.firstFee === null) screen = 'first';
  if (t && screen === 'length' && s.firstFee === null) screen = 'first';
  if (t && (screen === 'gp' || screen === 'done') && !feesComplete(t, s)) screen = feeScreensFor(t)[0];
  if (t && screen === 'gp' && t.setup === null) screen = 'done';
  // 'done' with the GP question unanswered is fine: the default scenario
  // starts there, and the GP row shows a range until it's answered.
  if (screen === s.screen) return s;
  const path = pathFor(s);
  return { ...s, screen, history: path.slice(0, Math.max(0, path.indexOf(screen))) };
}

/** Where this screen sits on the path: 1-based step and total. */
function progress(s: CalcState): { n: number; of: number } {
  const path = pathFor(s);
  return { n: Math.max(1, path.indexOf(s.screen) + 1), of: path.length };
}

function progressLabel(s: CalcState): string {
  if (s.screen === 'done') return 'Your costs';
  const { n, of } = progress(s);
  return `Question ${n} of ${of}`;
}

/**
 * One fee: the big number (a text box, the source of truth) and its slider,
 * wrapped in [data-fee-field] inside its own form, plus the same fee's slider
 * and readout on the results screen.
 */
interface FeeField {
  screen: ScreenId;
  form: HTMLFormElement;
  input: HTMLInputElement;
  error: HTMLElement;
  slider: HTMLInputElement;
  note: HTMLElement;
  minEl: HTMLElement;
  maxEl: HTMLElement;
  resultWrap: HTMLElement;
  resultSlider: HTMLInputElement;
  resultFee: HTMLElement;
  /** The practitioner's most common fee for this box: where the slider starts. */
  typical: number;
}

function initCostCalculator(): void {
  const root = document.getElementById('cost-calculator');
  if (!root) return;

  const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel);

  const screensEl = q('[data-calc-screens]');
  const liveEl = q('[data-calc-live]');
  const barEl = q('[data-calc-bar]');
  const gpForm = q<HTMLFormElement>('form[data-calc-screen="gp"]');
  const gpOtherBtn = q<HTMLButtonElement>('[data-calc-gp-other]');
  const gpCustomWrap = q('[data-gp-custom]');
  const gpInput = q<HTMLInputElement>('#gp-fee');
  const gpError = q('[data-gp-error]');
  const assumeNotes = Array.from(root.querySelectorAll<HTMLElement>('[data-calc-assume-note]'));
  const answerLine = q('[data-calc-answer-line]');
  const resultLabel = q('[data-result-label]');
  const resultBig = q('[data-result-big]');

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
  const noteEl = q('[data-receipt-note]');
  const dayEl = q('[data-receipt-day]');
  const followLabelEl = q('[data-receipt-follow-label]');
  const lengthChips = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-follow-length]'));

  if (
    !screensEl || !liveEl || !barEl ||
    !gpForm || !gpOtherBtn || !gpCustomWrap || !gpInput || !gpError ||
    !answerLine || !resultLabel || !resultBig ||
    !bodySingle || !bodyPsych || !feesEl || !rebateEl || !totalEl ||
    !firstFeeEl || !firstRebateEl || !firstTotalEl ||
    !followFeeEl || !followRebateEl || !followTotalEl ||
    !gpPart || !noteEl || !dayEl || !followLabelEl
  ) return;

  function field(id: string): FeeField | null {
    const wrap = root!.querySelector<HTMLElement>(`[data-fee-field="${id}"]`);
    const input = wrap?.querySelector<HTMLInputElement>('input[type="text"]');
    const slider = wrap?.querySelector<HTMLInputElement>('[data-fee-slider]');
    const note = wrap?.querySelector<HTMLElement>('[data-fee-note]');
    const minEl = wrap?.querySelector<HTMLElement>('[data-fee-min]');
    const maxEl = wrap?.querySelector<HTMLElement>('[data-fee-max]');
    const form = wrap?.closest<HTMLFormElement>('form[data-calc-screen]');
    const error = form?.querySelector<HTMLElement>('[data-fee-error]');
    const screen = form?.dataset.calcScreen;
    const resultWrap = root!.querySelector<HTMLElement>(`[data-result-slider="${id}"]`);
    const resultSlider = resultWrap?.querySelector<HTMLInputElement>('input[type="range"]');
    const resultFee = resultWrap?.querySelector<HTMLElement>('[data-result-fee]');
    if (
      !wrap || !input || !slider || !note || !minEl || !maxEl || !form || !error || !isScreen(screen) ||
      !resultWrap || !resultSlider || !resultFee
    ) return null;
    return {
      screen, form, input, error, slider, note, minEl, maxEl, resultWrap, resultSlider, resultFee,
      typical: Number(slider.dataset.typical) || Number(slider.value),
    };
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
    // Text boxes accept anything; "$1,200" still means 1200.
    const v = parseFloat(f.input.value.replace(/[^0-9.]/g, ''));
    if (isNaN(v) || v <= 0) return null;
    return v;
  }

  // Retune a fee's sliders for the selected practitioner's fee range.
  function setRange(f: FeeField, fees: readonly number[]): void {
    const { min, max, typical } = feeRange(fees);
    f.typical = typical;
    for (const slider of [f.slider, f.resultSlider]) {
      slider.min = String(min);
      slider.max = String(max);
    }
    f.minEl.textContent = audWhole.format(min);
    f.maxEl.textContent = audWhole.format(max);
  }

  // Put a slider's handle and green fill at the fee. A typed fee outside the
  // range pins the handle to the nearest end; the typed number still counts.
  function setSlider(slider: HTMLInputElement, fee: number | null): void {
    const min = Number(slider.min);
    const max = Number(slider.max);
    if (fee !== null) slider.value = String(Math.min(max, Math.max(min, fee)));
    const p = max > min ? (Number(slider.value) - min) / (max - min) : 0;
    slider.closest<HTMLElement>('[data-slider]')?.style.setProperty('--p', p.toFixed(4));
  }

  // Bring everything that shows this fee into line with it: both sliders,
  // the note beside the big number, the number's width and the results readout.
  function syncFeeUi(f: FeeField, fee: number | null): void {
    setSlider(f.slider, fee);
    setSlider(f.resultSlider, fee);
    f.input.style.width = `${Math.max(1, f.input.value.length)}ch`;
    f.note.hidden = fee === null;
    f.note.textContent =
      fee === null ? '' : fee === f.typical ? 'most common' : fee < f.typical ? 'lower than most' : 'higher than most';
    f.resultFee.textContent = fee === null ? EM_DASH : moneyShort(fee);
  }

  // Retune the fee screens for the selected practitioner: the slider ranges,
  // which sliders the results screen shows, and the assumption note.
  function applyType(t: PractitionerType | null): void {
    if (t?.firstVisit) {
      setRange(first!, t.firstVisit.chips);
      // The follow-up range follows the chosen length, which is asked first.
      setRange(follow!, followLength(t)?.chips ?? t.chips);
    } else if (t) {
      setRange(single!, t.chips);
    }
    single!.resultWrap.hidden = !t || Boolean(t.firstVisit);
    first!.resultWrap.hidden = follow!.resultWrap.hidden = !t?.firstVisit;
    const note = state.assume ? ASSUME_NOTES[state.assume] : '';
    for (const el of assumeNotes) {
      el.textContent = note;
      el.hidden = !note;
    }
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
    syncFeeUi(single!, fee);
    feesEl!.textContent = fee === null ? EM_DASH : money(fee);
    setRebateText(rebateEl!, t.rebate, fee);
    resultLabel!.textContent = t.rebate > 0 ? 'Each session costs you about' : 'Each session costs you';
    if (fee === null) {
      totalEl!.textContent = EM_DASH;
      resultBig!.textContent = EM_DASH;
      dayEl!.hidden = true;
      noteEl!.textContent = EMPTY_NOTE;
      return;
    }
    const cost = Math.max(0, fee - t.rebate);
    totalEl!.textContent = money(cost);
    resultBig!.textContent = moneyAbout(cost);
    const showDay = t.rebate > 0 && fee > t.rebate;
    dayEl!.textContent = showDay ? dayNote(fee, t.rebate) : '';
    dayEl!.hidden = !showDay;
    noteEl!.textContent = t.rebate > 0 ? CAP_NOTE : noRebateNote(t.label);
  }

  // The chosen follow-up length, falling back to the first (shortest). An id
  // from an old session that no longer exists also falls back.
  function followLength(t: PractitionerType): FollowUpLength | null {
    const lengths = t.followUpLengths ?? [];
    return lengths.find((l) => l.id === state.followLength) ?? lengths[0] ?? null;
  }

  function renderPsychiatrist(t: PractitionerType, fv: FirstVisit): void {
    const f1 = fieldValue(first!);
    const f2 = fieldValue(follow!);
    syncFeeUi(first!, f1);
    syncFeeUi(follow!, f2);
    dayEl!.hidden = true;

    const length = followLength(t);
    const followRebate = length?.rebate ?? t.rebate;
    for (const chip of lengthChips) chip.setAttribute('aria-pressed', String(chip.dataset.followLength === length?.id));
    followLabelEl!.textContent = length ? `Follow-up, ${length.label}` : 'Follow-up';

    firstFeeEl!.textContent = f1 === null ? EM_DASH : money(f1);
    setRebateText(firstRebateEl!, fv.rebate, f1);
    firstTotalEl!.textContent = f1 === null ? EM_DASH : money(Math.max(0, f1 - fv.rebate));

    followFeeEl!.textContent = f2 === null ? EM_DASH : money(f2);
    setRebateText(followRebateEl!, followRebate, f2);
    followTotalEl!.textContent = f2 === null ? EM_DASH : money(Math.max(0, f2 - followRebate));
    // The big number is the cost that repeats: a follow-up.
    resultLabel!.textContent = 'Each follow-up costs you about';
    resultBig!.textContent = f2 === null ? EM_DASH : moneyAbout(Math.max(0, f2 - followRebate));

    noteEl!.textContent = f1 === null || f2 === null ? EMPTY_NOTE_TWO_FEES : PSYCHIATRIST_NOTE;
  }

  function renderEmpty(): void {
    bodySingle!.hidden = false;
    bodyPsych!.hidden = true;
    syncFeeUi(single!, null);
    feesEl!.textContent = EM_DASH;
    rebateEl!.textContent = EM_DASH;
    totalEl!.textContent = EM_DASH;
    resultLabel!.textContent = 'Each session costs you about';
    resultBig!.textContent = EM_DASH;
    dayEl!.hidden = true;
    gpPart!.hidden = true;
    noteEl!.textContent = START_NOTE;
  }

  // The line under the big number: who it's for and why it's that much.
  function renderAnswerLine(t: PractitionerType | null): void {
    if (!t) {
      answerLine!.hidden = true;
      return;
    }
    if (t.firstVisit) {
      const firstCost = state.firstFee === null ? null : Math.max(0, state.firstFee - t.firstVisit.rebate);
      answerLine!.textContent =
        `Seeing a ${sentenceLabel(t)}, after Medicare pays you back.` +
        (firstCost === null ? '' : ` Your first appointment costs about ${moneyAbout(firstCost)}.`);
      answerLine!.hidden = state.followFee === null;
      return;
    }
    const seeing = `Seeing a ${sentenceLabel(t)}${t.setup === 'plan' ? ' with a GP care plan' : ''}`;
    answerLine!.textContent =
      t.rebate > 0
        ? `${seeing}, after Medicare pays you back.`
        : `${seeing}. There's no Medicare rebate, so you pay the full fee.`;
    answerLine!.hidden = state.fee === null;
  }

  function render(): void {
    const t = currentType();
    if (!t) {
      renderEmpty();
      renderAnswerLine(null);
      return;
    }

    // The GP appointment (care plan or referral) is a one-off setup cost,
    // said in a sentence apart from the per-session figure. Not needed at all
    // for no-rebate types, and a range until the GP question is answered.
    gpPart!.hidden = t.setup === null;
    gpPart!.textContent = t.setup === null ? '' : gpLine(t.setup, state.gpFree, state.gpCustom);

    bodySingle!.hidden = Boolean(t.firstVisit);
    bodyPsych!.hidden = !t.firstVisit;
    if (t.firstVisit) renderPsychiatrist(t, t.firstVisit);
    else renderSingle(t);

    renderAnswerLine(t);
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

  // True while the script moves focus on a screen change, so a fee box
  // doesn't select (highlight) its contents the way it does on a click.
  let scriptFocus = false;

  function showScreen(id: ScreenId, focus: boolean): void {
    const active = screenEl(id);
    if (!active) return;
    // The receipt column only exists on the results screen (see the CSS).
    root!.dataset.calcPhase = id === 'done' ? 'done' : 'questions';
    for (const el of screens) {
      const isActive = el === active;
      el.classList.toggle('calc-screen--hidden', !isActive);
      setButtonsDisabled(el, !isActive);
      const progress = el.querySelector<HTMLElement>('[data-calc-progress]');
      if (isActive && progress) progress.textContent = progressLabel(state);
    }
    for (const f of allFields) f.error.hidden = true;
    gpError!.hidden = true;
    // A fee screen opens on the most common fee, stated, not as an empty box.
    const feeField = allFields.find((f) => f.screen === id);
    if (feeField && fieldValue(feeField) === null) {
      feeField.input.value = String(feeField.typical);
      syncStateFromInputs();
      writeState(state);
      render();
    }
    const { n, of } = progress(state);
    barEl!.style.width = `${Math.round((n / of) * 100)}%`;
    // The GP amount box stays open when a typed amount is the current answer.
    if (id === 'gp') setGpCustomOpen(state.gpFree === false && state.gpCustom !== null);
    if (!focus) return;
    const heading = active.querySelector<HTMLElement>('[data-calc-heading]');
    // Focus lands on the first answer (or the fee slider, which doesn't open
    // a phone keyboard) so Enter and the arrow keys work at once. The live
    // region carries the question, since the heading itself isn't focused.
    // The results screen focuses its heading.
    const question = heading?.textContent?.trim() ?? '';
    announce(id === 'done' ? 'Your costs.' : `${progressLabel(state)}. ${question}`);
    const target =
      id === 'done'
        ? heading
        : (active.querySelector<HTMLElement>('[data-fee-slider]') ??
          active.querySelector<HTMLElement>('input, [data-calc-answer]'));
    requestAnimationFrame(() => {
      scriptFocus = true;
      (target ?? heading)?.focus({ preventScroll: true });
      // Caret after any existing figure, nothing highlighted.
      if (target instanceof HTMLInputElement && target.type === 'text') {
        const end = target.value.length;
        target.setSelectionRange(end, end);
      }
      scriptFocus = false;
    });
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
      state.followLength = null;
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
    if (button.dataset.followLength) state.followLength = button.dataset.followLength;
    applyType(currentType());
    render();
    go(nextAfter(state.screen, state));
  }

  // Next on a fee screen: that screen's box must have a number.
  function handleFeeNext(f: FeeField): void {
    syncStateFromInputs();
    if (fieldValue(f) === null) {
      f.error.hidden = false;
      f.input.focus();
      return;
    }
    f.error.hidden = true;
    go(nextAfter(f.screen, state));
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

  // Arrow keys move between the answers on a screen: down or right to the
  // next, up or left to the previous, wrapping. Each set of answers is a
  // role="group"; sliders and number inputs keep their own arrow behaviour
  // because they aren't buttons.
  root.addEventListener('keydown', (e) => {
    const forward = e.key === 'ArrowDown' || e.key === 'ArrowRight';
    const backward = e.key === 'ArrowUp' || e.key === 'ArrowLeft';
    if (!forward && !backward) return;
    const target = e.target as HTMLElement | null;
    if (!target || target.tagName !== 'BUTTON') return;
    const group = target.closest<HTMLElement>('[role="group"]');
    if (!group || group === screensEl) return;
    const items = Array.from(group.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));
    const i = items.indexOf(target as HTMLButtonElement);
    if (i === -1 || items.length < 2) return;
    e.preventDefault();
    items[(i + (forward ? 1 : -1) + items.length) % items.length].focus();
  });

  root.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const answer = target.closest<HTMLElement>('[data-calc-answer]');
    if (answer && !(answer as HTMLButtonElement).disabled) return handleAnswer(answer);
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

  // Enter in a fee field submits its form; route it like the Next button.
  for (const f of allFields) {
    f.form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleFeeNext(f);
    });
    // Typing in the big number or dragging the slider under it. The number
    // is the source of truth, so a drag writes the slider's value into it.
    f.form.addEventListener('input', (e) => {
      if (e.target === f.slider) f.input.value = f.slider.value;
      syncStateFromInputs();
      writeState(state);
      render();
      if (fieldValue(f) !== null) f.error.hidden = true;
    });
    // The same fee's slider on the results screen.
    f.resultSlider.addEventListener('input', () => {
      f.input.value = f.resultSlider.value;
      syncStateFromInputs();
      writeState(state);
      render();
    });
  }

  // Enter in the GP amount field, or its Next button.
  gpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleGpNext();
  });

  gpInput.addEventListener('input', () => {
    if (gpInput.value !== '') gpError.hidden = true;
  });


  for (const f of allFields) {
    f.input.addEventListener('focus', () => {
      if (!scriptFocus) f.input.select();
    });
  }

  // Initial render reconciles the SSR markup with any restored session.
  // No focus and no scrolling on load.
  syncInputsFromState();
  applyType(currentType());
  render();
  showScreen(state.screen, false);
  // Opening screen (homepage): a session already under way skips it;
  // otherwise Start reveals question 1 and moves focus into it.
  if (root.hasAttribute('data-calc-intro')) {
    if (state.screen !== 'who' || state.branch !== null) root.removeAttribute('data-calc-intro');
    root.querySelector<HTMLElement>('[data-calc-start]')?.addEventListener('click', () => {
      root.removeAttribute('data-calc-intro');
      root.classList.add('calc-started');
      showScreen(state.screen, true);
    });
  }
  // Enable the receipt's fade only after the restored screen has painted.
  requestAnimationFrame(() => root.classList.add('calc-animate'));
}

initCostCalculator();
