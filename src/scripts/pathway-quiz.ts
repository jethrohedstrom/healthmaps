const QUIZ_ROOT_SELECTOR = '[data-pathway-quiz]';
const STORAGE_KEY = 'healthmaps:pathway-quiz:v2';
const STATE_VERSION = 2;
const TOTAL_QUESTIONS = 4;

const scoredPathwayIds = ['through-gp', 'private', 'low-cost', 'self-guided'] as const;
type ScoredPathwayId = (typeof scoredPathwayIds)[number];
type QuizMode = 'intro' | 'question' | 'result';

type Scores = Record<ScoredPathwayId, number>;

interface QuizState {
  version: typeof STATE_VERSION;
  mode: QuizMode;
  questionIndex: number;
  scores: Scores;
}

interface ResultContent {
  title: string;
  summary: string;
  secondarySummary: string;
  href: `#${ScoredPathwayId}`;
}

const resultContent: Record<ScoredPathwayId, ResultContent> = {
  'through-gp': {
    title: 'Start with a GP',
    summary: 'A good first step for you is starting with a GP. This fits when you want professional guidance and a pathway to Medicare-rebated sessions.',
    secondarySummary: 'Useful if you want professional guidance and a pathway to Medicare-rebated sessions.',
    href: '#through-gp',
  },
  private: {
    title: 'Go straight to a private practitioner',
    summary: 'A good first step for you is going straight to a private practitioner. This fits when you want to start quickly and are comfortable paying out of pocket.',
    secondarySummary: 'Useful if you want to start quickly and are comfortable paying out of pocket.',
    href: '#private',
  },
  'low-cost': {
    title: 'Try free or community services',
    summary: 'A good first step for you is free or community support. This fits when cost, local access, or walk-in services matter most.',
    secondarySummary: 'Useful if cost, local access, or walk-in services matter most.',
    href: '#low-cost',
  },
  'self-guided': {
    title: 'Start with self-guided online tools',
    summary: 'A good first step for you is self-guided online support. This fits when you want something private, low-pressure, and available right now.',
    secondarySummary: 'Useful if you want something private, low-pressure, and available right now.',
    href: '#self-guided',
  },
};

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
    scores: initialScores(),
  };
}

function isScoredPathwayId(value: string): value is ScoredPathwayId {
  return scoredPathwayIds.includes(value as ScoredPathwayId);
}

function isScores(value: unknown): value is Scores {
  if (!value || typeof value !== 'object') return false;
  const maybeScores = value as Record<string, unknown>;
  return scoredPathwayIds.every((id) => typeof maybeScores[id] === 'number');
}

function isQuizState(value: unknown): value is QuizState {
  if (!value || typeof value !== 'object') return false;
  const maybeState = value as Record<string, unknown>;
  return (
    maybeState.version === STATE_VERSION &&
    (maybeState.mode === 'intro' || maybeState.mode === 'question' || maybeState.mode === 'result') &&
    typeof maybeState.questionIndex === 'number' &&
    maybeState.questionIndex >= 0 &&
    maybeState.questionIndex < TOTAL_QUESTIONS &&
    isScores(maybeState.scores)
  );
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
    screen.hidden = true;
  });

  const activeScreen = getScreen(root, state.mode, state.questionIndex);
  if (!activeScreen) return;

  activeScreen.hidden = false;
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

function chooseResults(scores: Scores): [ScoredPathwayId, ScoredPathwayId] {
  const ranked = [...scoredPathwayIds].sort((a, b) => scores[b] - scores[a]);
  const primary = ranked[0] ?? 'through-gp';
  const runnerUp = ranked.find((id) => id !== primary) ?? 'low-cost';
  return [primary, runnerUp];
}

function renderResult(root: HTMLElement, state: QuizState) {
  const [primary, runnerUp] = chooseResults(state.scores);
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

function goToCrisis(root?: HTMLElement) {
  clearState();
  if (root) showScreen(root, initialState(), false);
  jumpToHash('#crisis');
}

function handleAnswer(root: HTMLElement, button: HTMLButtonElement, state: QuizState): QuizState {
  const currentScreen = button.closest<HTMLElement>('[data-quiz-screen]');
  if (currentScreen) setScreenButtonsDisabled(currentScreen, true);

  const nextScores = addScores(state.scores, getWeights(button));
  const isFinalQuestion = state.questionIndex >= TOTAL_QUESTIONS - 1;
  const nextState: QuizState = {
    version: STATE_VERSION,
    mode: isFinalQuestion ? 'result' : 'question',
    questionIndex: isFinalQuestion ? state.questionIndex : state.questionIndex + 1,
    scores: nextScores,
  };

  writeState(nextState);
  announce(root, isFinalQuestion ? 'Showing your suggested starting point.' : `Question ${nextState.questionIndex + 1} of ${TOTAL_QUESTIONS}.`);
  showScreen(root, nextState);
  return nextState;
}

function initPathwayQuiz(root: HTMLElement) {
  if (root.dataset.quizInit === '1') return;
  root.dataset.quizInit = '1';

  let state = readState();
  showScreen(root, state, false);

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
        scores: initialScores(),
      };
      writeState(state);
      announce(root, `Question 1 of ${TOTAL_QUESTIONS}.`);
      showScreen(root, state);
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
