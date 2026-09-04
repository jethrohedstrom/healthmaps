import { emphasisSegments, resultContent, scoredPathwayIds, type ScoredPathwayId } from '../data/pathway-quiz-results';

const QUIZ_ROOT_SELECTOR = '[data-pathway-quiz]';
const STORAGE_KEY = 'healthmaps:pathway-quiz:v3';
const STATE_VERSION = 3;
const TOTAL_QUESTIONS = 4;
const COMPACT_CLASS = 'pathway-quiz--compact';
const HEIGHT_ANIM_CLASS = 'pathway-quiz--height-anim';
// Must match the .pathway-quiz--height-anim transition duration in PathwayQuiz.astro.
const HEIGHT_ANIM_MS = 300;

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

// One cleanup per root: clears the inline height, transition class, listeners
// and timeout so a mid-tween retarget (or reduced-motion snap) starts clean.
const heightAnimCleanups = new WeakMap<HTMLElement, () => void>();

function cancelHeightAnimation(root: HTMLElement) {
  heightAnimCleanups.get(root)?.();
}

// Toggles the slim-intro state on the shell. In compact state the non-intro
// screens and the sizer sit out of the grid's height calculation (see
// PathwayQuiz.astro styles), so the card is a bar sized by the intro alone.
// The FLIP tween pins the rendered height, toggles the class, then transitions
// to the new natural height — no inline styles survive, so the expanded card's
// fixed-height grid behaviour is untouched between questions and results.
function setCompactMode(root: HTMLElement, compact: boolean, animate: boolean) {
  if (root.classList.contains(COMPACT_CLASS) === compact) return;

  if (!animate || prefersReducedMotion()) {
    cancelHeightAnimation(root);
    root.classList.toggle(COMPACT_CLASS, compact);
    return;
  }

  const startHeight = root.offsetHeight;
  cancelHeightAnimation(root);
  root.classList.toggle(COMPACT_CLASS, compact);
  const endHeight = root.offsetHeight;
  if (startHeight === endHeight) return;

  const finish = () => {
    root.removeEventListener('transitionend', onTransitionEnd);
    window.clearTimeout(timeoutId);
    heightAnimCleanups.delete(root);
    root.classList.remove(HEIGHT_ANIM_CLASS);
    root.style.height = '';
  };
  const onTransitionEnd = (event: TransitionEvent) => {
    if (event.target === root && event.propertyName === 'height') finish();
  };

  root.style.height = `${startHeight}px`;
  // Force a reflow so the transition has a committed start value.
  void root.offsetHeight;
  root.classList.add(HEIGHT_ANIM_CLASS);
  root.style.height = `${endHeight}px`;
  root.addEventListener('transitionend', onTransitionEnd);
  const timeoutId = window.setTimeout(finish, HEIGHT_ANIM_MS + 100);
  heightAnimCleanups.set(root, finish);
}

function showScreen(root: HTMLElement, state: QuizState, shouldFocus = true) {
  root.querySelectorAll<HTMLElement>('[data-quiz-screen]').forEach((screen) => {
    screen.classList.add('pathway-quiz-screen--hidden');
  });

  const activeScreen = getScreen(root, state.mode, state.questionIndex);
  if (!activeScreen) return;

  activeScreen.classList.remove('pathway-quiz-screen--hidden');
  setScreenButtonsDisabled(activeScreen, false);

  // shouldFocus is false only on the initial render — exactly the case that
  // must snap (a restored mid-quiz session expands instantly, no tween).
  setCompactMode(root, state.mode === 'intro', shouldFocus);

  if (state.mode === 'result') renderResult(root, state);
  else setBadgeVisible(root, false);
  if (shouldFocus) focusScreenHeading(activeScreen);
}

// The station-label badge sits outside the quiz shell (a sibling in the
// wrapper) so it can overhang the card's overflow-hidden border.
function setBadgeVisible(root: HTMLElement, visible: boolean) {
  const badge = root.parentElement?.querySelector<HTMLElement>('[data-result-badge]');
  if (!badge) return;
  badge.classList.toggle('hidden', !visible);
  badge.classList.toggle('flex', visible);
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
  const runnerDetails = root.querySelector<HTMLDetailsElement>('[data-runner-details]');
  const runnerTitle = root.querySelector<HTMLElement>('[data-runner-title]');
  const runnerSummary = root.querySelector<HTMLElement>('[data-runner-summary]');
  const runnerLink = root.querySelector<HTMLAnchorElement>('[data-runner-link]');
  const link = root.querySelector<HTMLAnchorElement>('[data-result-link]');

  if (title) title.textContent = primaryContent.title;
  if (summary) {
    summary.replaceChildren(
      ...primaryContent.summaryPoints.map((point) => {
        const li = document.createElement('li');
        li.replaceChildren(
          ...emphasisSegments(point).map((segment) => {
            if (!segment.em) return document.createTextNode(segment.text);
            const em = document.createElement('em');
            em.textContent = segment.text;
            return em;
          }),
        );
        return li;
      }),
    );
  }
  if (runnerTitle) runnerTitle.textContent = runnerUpContent.title;
  if (runnerSummary) runnerSummary.textContent = runnerUpContent.secondarySummary;
  if (runnerLink) runnerLink.href = runnerUpContent.href;
  // Collapse on every fresh render so each result starts with only the
  // suggestion visible (Back-and-forward, Start over, restored state).
  if (runnerDetails) runnerDetails.open = false;
  if (link) link.href = primaryContent.href;
  setBadgeVisible(root, primary === 'through-gp');
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
// with behavior: 'instant' so the html:focus-within { scroll-behavior: smooth }
// rule in global.css doesn't fight each step.
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
  announce(root, isFinalQuestion ? 'Showing our suggestion.' : `Question ${nextState.questionIndex + 1} of ${TOTAL_QUESTIONS}.`);
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

  root.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

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
      // Defer until the card has expanded so the nearest-scroll math measures
      // the final rect; grow-then-settle is calmer than concurrent tweens.
      window.setTimeout(() => scrollQuizIntoView(root), prefersReducedMotion() ? 0 : HEIGHT_ANIM_MS + 20);
      return;
    }

    const backButton = target.closest<HTMLButtonElement>('[data-quiz-back]');
    if (backButton) {
      state = handleBack(root, state);
      return;
    }

    const resetButton = target.closest<HTMLButtonElement>('[data-quiz-reset]');
    if (resetButton) {
      // Return to the slim intro bar (same collapse path as Back from Q1).
      // The card shrinks in place — its top edge doesn't move — so no scroll.
      clearState();
      state = initialState();
      announce(root, 'Back to the start.');
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
