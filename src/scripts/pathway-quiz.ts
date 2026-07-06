import { resultContent, scoredPathwayIds, type ScoredPathwayId } from '../data/pathway-quiz-results';

const QUIZ_ROOT_SELECTOR = '[data-pathway-quiz]';
const STORAGE_KEY = 'healthmaps:pathway-quiz:v3';
const STATE_VERSION = 3;
const TOTAL_QUESTIONS = 4;

type QuizMode = 'intro' | 'question' | 'result';

type Scores = Record<ScoredPathwayId, number>;

interface QuizState {
  version: typeof STATE_VERSION;
  mode: QuizMode;
  questionIndex: number;
  // Chosen answer index per answered question; scores are derived from these
  // so Back can un-ask a question. Length: questionIndex in question mode,
  // TOTAL_QUESTIONS in result mode.
  answers: number[];
}

const scoreDatasetKeys: Record<ScoredPathwayId, string> = {
  'through-gp': 'scoreThroughGp',
  private: 'scorePrivate',
  'low-cost': 'scoreLowCost',
  'self-guided': 'scoreSelfGuided',
};

function initialScores(): Scores {
  return {
    'through-gp': 0,
    private: 0,
    'low-cost': 0,
    'self-guided': 0,
  };
}

function initialState(): QuizState {
  return {
    version: STATE_VERSION,
    mode: 'intro',
    questionIndex: 0,
    answers: [],
  };
}

function isScoredPathwayId(value: string): value is ScoredPathwayId {
  return scoredPathwayIds.includes(value as ScoredPathwayId);
}

function isQuizState(value: unknown): value is QuizState {
  if (!value || typeof value !== 'object') return false;
  const maybeState = value as Record<string, unknown>;
  if (
    maybeState.version !== STATE_VERSION ||
    (maybeState.mode !== 'intro' && maybeState.mode !== 'question' && maybeState.mode !== 'result') ||
    typeof maybeState.questionIndex !== 'number' ||
    maybeState.questionIndex < 0 ||
    maybeState.questionIndex >= TOTAL_QUESTIONS ||
    !Array.isArray(maybeState.answers) ||
    !maybeState.answers.every((answer) => Number.isFinite(answer))
  ) {
    return false;
  }
  const expectedAnswers = maybeState.mode === 'result' ? TOTAL_QUESTIONS : maybeState.questionIndex;
  return maybeState.answers.length === expectedAnswers;
}

function readState(): QuizState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as unknown;
    return isQuizState(parsed) ? parsed : initialState();
  } catch {
    return initialState();
  }
}

function writeState(state: QuizState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The quiz intentionally has no fallback persistence.
  }
}

function clearState() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing else should persist this state.
  }
}

function getScreen(root: HTMLElement, name: QuizMode, questionIndex?: number): HTMLElement | null {
  if (name !== 'question') {
    return root.querySelector<HTMLElement>(`[data-quiz-screen="${name}"]`);
  }
  return root.querySelector<HTMLElement>(`[data-quiz-screen="question"][data-question-index="${questionIndex ?? 0}"]`);
}

function setScreenButtonsDisabled(screen: HTMLElement, disabled: boolean) {
  screen.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
    button.disabled = disabled;
  });
}

function focusScreenHeading(screen: HTMLElement) {
  const heading = screen.querySelector<HTMLElement>('[data-quiz-heading]');
  if (!heading) return;
  requestAnimationFrame(() => {
    heading.focus({ preventScroll: true });
  });
}

function announce(root: HTMLElement, message: string) {
  const live = root.querySelector<HTMLElement>('[data-quiz-live]');
  if (live) live.textContent = message;
}

function showScreen(root: HTMLElement, state: QuizState, shouldFocus = true) {
  root.querySelectorAll<HTMLElement>('[data-quiz-screen]').forEach((screen) => {
    screen.classList.add('pathway-quiz-screen--hidden');
  });

  const activeScreen = getScreen(root, state.mode, state.questionIndex);
  if (!activeScreen) return;

  activeScreen.classList.remove('pathway-quiz-screen--hidden');
  setScreenButtonsDisabled(activeScreen, false);

  if (state.mode === 'result') renderResult(root, state);
  if (shouldFocus) focusScreenHeading(activeScreen);
}

function getWeights(button: HTMLButtonElement): Scores {
  const weights = initialScores();

  scoredPathwayIds.forEach((id) => {
    const raw = button.dataset[scoreDatasetKeys[id]];
    if (!raw) return;
    const value = Number(raw);
    if (Number.isFinite(value)) weights[id] = value;
  });

  return weights;
}

function addScores(current: Scores, weights: Scores): Scores {
  return scoredPathwayIds.reduce<Scores>((nextScores, id) => {
    nextScores[id] = current[id] + weights[id];
    return nextScores;
  }, initialScores());
}

function getAnswerButtons(root: HTMLElement, questionIndex: number): HTMLButtonElement[] {
  const screen = getScreen(root, 'question', questionIndex);
  if (!screen) return [];
  return Array.from(screen.querySelectorAll<HTMLButtonElement>('[data-quiz-answer]'));
}

function computeScores(root: HTMLElement, answers: number[]): Scores {
  return answers.reduce<Scores>((scores, answerIndex, questionIndex) => {
    const button = getAnswerButtons(root, questionIndex)[answerIndex];
    return button ? addScores(scores, getWeights(button)) : scores;
  }, initialScores());
}

function chooseResults(scores: Scores): [ScoredPathwayId, ScoredPathwayId] {
  const ranked = [...scoredPathwayIds].sort((a, b) => scores[b] - scores[a]);
  const primary = ranked[0] ?? 'through-gp';
  const runnerUp = ranked.find((id) => id !== primary) ?? 'low-cost';
  return [primary, runnerUp];
}

function renderResult(root: HTMLElement, state: QuizState) {
  const [primary, runnerUp] = chooseResults(computeScores(root, state.answers));
  const primaryContent = resultContent[primary];
  const runnerUpContent = resultContent[runnerUp];

  const title = root.querySelector<HTMLElement>('[data-result-title]');
  const summary = root.querySelector<HTMLElement>('[data-result-summary]');
  const runnerUpEl = root.querySelector<HTMLElement>('[data-runner-up]');
  const link = root.querySelector<HTMLAnchorElement>('[data-result-link]');

  if (title) title.textContent = primaryContent.title;
  if (summary) summary.textContent = primaryContent.summary;
  if (runnerUpEl) runnerUpEl.textContent = `${runnerUpContent.title}: ${runnerUpContent.secondarySummary}`;
  if (link) link.href = primaryContent.href;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function focusHashTarget(target: HTMLElement) {
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  requestAnimationFrame(() => {
    target.focus({ preventScroll: true });
  });
}

function jumpToHash(hash: string) {
  const id = hash.replace(/^#/, '');
  const target = document.getElementById(id);
  if (!target) {
    window.location.hash = hash;
    return;
  }

  history.pushState(null, '', hash);
  // pushState doesn't fire hashchange; dispatch it so the pathway card's
  // hash handler (pathway-progressive-steps.ts) can auto-open the card.
  window.dispatchEvent(new HashChangeEvent('hashchange'));
  target.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  focusHashTarget(target);
}

function easeInOutCubic(progress: number) {
  return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
}

// Replicates scrollIntoView({ block: 'nearest' }) semantics, honouring the
// root's scroll-margin. Returns null when no scrolling is needed.
function computeNearestScrollTarget(root: HTMLElement): number | null {
  const rect = root.getBoundingClientRect();
  const styles = getComputedStyle(root);
  const marginTop = Number.parseFloat(styles.scrollMarginTop) || 0;
  const marginBottom = Number.parseFloat(styles.scrollMarginBottom) || 0;

  const top = rect.top - marginTop;
  const bottom = rect.bottom + marginBottom;
  if (top >= 0 && bottom <= window.innerHeight) return null;

  if (bottom - top > window.innerHeight || top < 0) return window.scrollY + top;
  return window.scrollY + bottom - window.innerHeight;
}

// A gentler scroll than the browser's native smooth behaviour. Frames scroll
// with behavior: 'instant' so the html { scroll-behavior: smooth } rule in
// global.css doesn't fight each step.
function animateScrollTo(target: number) {
  const start = window.scrollY;
  const distance = target - start;
  const duration = Math.min(800, Math.max(500, Math.abs(distance)));
  const startTime = performance.now();
  let frame = 0;

  const stopListening = () => {
    window.removeEventListener('wheel', cancel);
    window.removeEventListener('touchstart', cancel);
  };
  const cancel = () => {
    cancelAnimationFrame(frame);
    stopListening();
  };
  window.addEventListener('wheel', cancel, { passive: true });
  window.addEventListener('touchstart', cancel, { passive: true });

  const step = (now: number) => {
    const progress = Math.min(1, (now - startTime) / duration);
    window.scrollTo({ top: start + distance * easeInOutCubic(progress), behavior: 'instant' });
    if (progress < 1) {
      frame = requestAnimationFrame(step);
    } else {
      stopListening();
    }
  };
  frame = requestAnimationFrame(step);
}

function scrollQuizIntoView(root: HTMLElement) {
  const target = computeNearestScrollTarget(root);
  if (target === null) return;
  if (prefersReducedMotion()) {
    window.scrollTo({ top: target, behavior: 'instant' });
    return;
  }
  animateScrollTo(target);
}

function waitForFontsReady(): Promise<unknown> {
  return document.fonts?.ready ?? Promise.resolve();
}

function goToCrisis(root?: HTMLElement) {
  clearState();
  if (root) showScreen(root, initialState(), false);
  jumpToHash('#crisis');
}

function handleAnswer(root: HTMLElement, button: HTMLButtonElement, state: QuizState): QuizState {
  const currentScreen = button.closest<HTMLElement>('[data-quiz-screen]');
  if (currentScreen) setScreenButtonsDisabled(currentScreen, true);

  const answerIndex = getAnswerButtons(root, state.questionIndex).indexOf(button);
  const isFinalQuestion = state.questionIndex >= TOTAL_QUESTIONS - 1;
  const nextState: QuizState = {
    version: STATE_VERSION,
    mode: isFinalQuestion ? 'result' : 'question',
    questionIndex: isFinalQuestion ? state.questionIndex : state.questionIndex + 1,
    answers: [...state.answers.slice(0, state.questionIndex), answerIndex],
  };

  writeState(nextState);
  announce(root, isFinalQuestion ? 'Showing your suggested starting point.' : `Question ${nextState.questionIndex + 1} of ${TOTAL_QUESTIONS}.`);
  showScreen(root, nextState);
  return nextState;
}

function handleBack(root: HTMLElement, state: QuizState): QuizState {
  if (state.mode === 'intro') return state;

  if (state.mode === 'question' && state.questionIndex === 0) {
    clearState();
    const nextState = initialState();
    announce(root, 'Back to the start.');
    showScreen(root, nextState);
    return nextState;
  }

  const previousIndex = state.mode === 'result' ? TOTAL_QUESTIONS - 1 : state.questionIndex - 1;
  const nextState: QuizState = {
    version: STATE_VERSION,
    mode: 'question',
    questionIndex: previousIndex,
    answers: state.answers.slice(0, previousIndex),
  };

  writeState(nextState);
  announce(root, `Question ${previousIndex + 1} of ${TOTAL_QUESTIONS}.`);
  showScreen(root, nextState);
  return nextState;
}

function initPathwayQuiz(root: HTMLElement) {
  if (root.dataset.quizInit === '1') return;
  root.dataset.quizInit = '1';

  let state = readState();
  showScreen(root, state, false);

  // Homepage CTAs link to /pathway/?scroll=quiz so arriving there eases the
  // quiz into view (no auto-start — the intro screen stays put).
  if (new URLSearchParams(window.location.search).get('scroll') === 'quiz') {
    // Strip the param so a reload or shared link doesn't re-trigger the scroll.
    history.replaceState(null, '', window.location.pathname + window.location.hash);
    // Wait for the web fonts: the card's measured position decides whether a
    // scroll is needed, and fallback-font metrics can make it look in view
    // when the final layout isn't.
    waitForFontsReady().then(() => requestAnimationFrame(() => scrollQuizIntoView(root)));
  }

  root.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const crisisLink = target.closest<HTMLAnchorElement>('[data-quiz-crisis-link]');
    if (crisisLink) {
      event.preventDefault();
      goToCrisis(root);
      announce(root, 'Opening crisis support.');
      state = initialState();
      return;
    }

    const startButton = target.closest<HTMLButtonElement>('[data-quiz-start]');
    if (startButton) {
      state = {
        version: STATE_VERSION,
        mode: 'question',
        questionIndex: 0,
        answers: [],
      };
      writeState(state);
      announce(root, `Question 1 of ${TOTAL_QUESTIONS}.`);
      showScreen(root, state);
      scrollQuizIntoView(root);
      return;
    }

    const backButton = target.closest<HTMLButtonElement>('[data-quiz-back]');
    if (backButton) {
      state = handleBack(root, state);
      return;
    }

    const resetButton = target.closest<HTMLButtonElement>('[data-quiz-reset]');
    if (resetButton) {
      clearState();
      state = initialState();
      announce(root, 'Quiz reset.');
      showScreen(root, state);
      return;
    }

    const answerButton = target.closest<HTMLButtonElement>('[data-quiz-answer]');
    if (answerButton) {
      state = handleAnswer(root, answerButton, state);
      return;
    }

    const resultLink = target.closest<HTMLAnchorElement>('[data-result-link]');
    if (resultLink) {
      const hash = new URL(resultLink.href).hash;
      if (!hash) return;
      const id = hash.replace(/^#/, '');
      if (!isScoredPathwayId(id)) return;
      event.preventDefault();
      jumpToHash(hash);
    }
  });
}

document.querySelectorAll<HTMLElement>(QUIZ_ROOT_SELECTOR).forEach(initPathwayQuiz);
