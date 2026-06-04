// Reusable progressive step reveal + progress bar for pathway cards.
// Applies to any card root marked with [data-progressive-card]
// (PathwayCardGPProgressive.astro, PathwayCardVisual.astro in progressive mode).

function initProgressiveCard(card: HTMLElement) {
  const ol = card.querySelector<HTMLOListElement>('[data-step-reveal]');
  if (!ol) return;

  /** Narrowed root for closures (astro check TS control-flow quirk). */
  const stepListRoot: HTMLOListElement = ol;

  const total = Number(stepListRoot.dataset.stepTotal) || stepListRoot.querySelectorAll(':scope > li').length;
  if (!Number.isFinite(total) || total < 1) return;

  const label = card.querySelector<HTMLElement>('[data-progress-label]');
  const live = card.querySelector<HTMLElement>('[data-progress-live]');
  const progressbar = card.querySelector<HTMLElement>('[data-progressbar]');
  const fill = card.querySelector<HTMLElement>('[data-progress-fill]');

  const cardId = card.id;
  const acceptsLegacyHash = card.hasAttribute('data-legacy-step-hash');

  function revealCount(list: HTMLOListElement): number {
    return list.querySelectorAll(':scope > li:not([hidden])').length;
  }

  function refreshProgress(announce: boolean) {
    const n = revealCount(stepListRoot);
    const pct = (n / total) * 100;

    if (label) label.textContent = `Step ${n} of ${total}`;
    if (progressbar) {
      progressbar.setAttribute('aria-valuenow', String(n));
      progressbar.setAttribute('aria-valuemax', String(total));
    }
    if (fill) fill.style.width = `${pct}%`;
    if (announce && live) live.textContent = `Step ${n} of ${total}`;
  }

  refreshProgress(false);

  const l1Details = card.querySelector<HTMLDetailsElement>(
    'details.pathway-details-toggle:not(.pathway-details-toggle--nested)'
  );

  // Opt-in: only cards that ask for it scroll themselves into view on L1 expand
  // (the GP hero card, which otherwise pushes its content below the fold).
  const scrollIntoViewOnExpand = card.hasAttribute('data-scroll-into-view-on-expand');

  // Set while a hash deep-link drives the L1 open, so its scroll-to-step wins.
  // Consumed (cleared) by the L1 toggle handler below.
  let suppressL1Scroll = false;

  function scrollCardUnderHeader() {
    const header = document.querySelector<HTMLElement>('header');
    const offset = (header?.offsetHeight ?? 0) + 16;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    requestAnimationFrame(() => {
      const startY = window.scrollY;
      const targetY = Math.max(0, card.getBoundingClientRect().top + startY - offset);

      if (reduceMotion) {
        if (targetY > startY + 8) window.scrollTo({ top: targetY, behavior: 'auto' });
        return;
      }
      if (targetY <= startY + 8) return;

      const revealMs = l1Details
        ? (parseFloat(getComputedStyle(l1Details, '::details-content').transitionDuration) || 0) * 1000
        : 0;
      const duration = revealMs > 0 ? revealMs : 300;
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      const t0 = performance.now();

      const step = () => {
        const t = Math.min(1, (performance.now() - t0) / duration);
        const y = startY + (targetY - startY) * easeOut(t);
        window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  if (l1Details && scrollIntoViewOnExpand) {
    l1Details.addEventListener('toggle', () => {
      if (!l1Details.open) return;
      if (suppressL1Scroll) {
        suppressL1Scroll = false;
        return;
      }
      scrollCardUnderHeader();
    });
  }

  function openCardForStep(stepNumber: number) {
    if (l1Details && !l1Details.open) {
      suppressL1Scroll = true;
      l1Details.open = true;
    }

    const nested = card.querySelector<HTMLDetailsElement>('details.pathway-details-toggle--nested');
    if (nested) nested.open = true;

    for (let i = 1; i <= stepNumber; i++) {
      const li = stepListRoot.querySelector<HTMLLIElement>(`li[data-step-index="${i}"]`);
      if (li) li.removeAttribute('hidden');
    }

    refreshProgress(false);

    const target = document.getElementById(`${cardId}-step-${stepNumber}`) ?? (acceptsLegacyHash ? document.getElementById(`step-${stepNumber}`) : null);
    if (target) target.scrollIntoView({ block: 'start' });
  }

  function matchStepHash(): number | null {
    const scoped = location.hash.match(new RegExp(`^#${cardId}-step-(\\d+)$`));
    if (scoped) return Number(scoped[1]);
    if (acceptsLegacyHash) {
      const legacy = location.hash.match(/^#step-(\d+)$/);
      if (legacy) return Number(legacy[1]);
    }
    return null;
  }

  function handleStepHash() {
    const stepNumber = matchStepHash();
    if (stepNumber === null || !Number.isFinite(stepNumber) || stepNumber < 1) return;
    openCardForStep(stepNumber);
  }

  handleStepHash();
  window.addEventListener('hashchange', handleStepHash);

  card.querySelectorAll<HTMLDetailsElement>('.pathway-step-item').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      if (detail.closest('[data-progressive-card]') !== card) return;

      const li = detail.closest('li');
      if (!li || !stepListRoot.contains(li)) return;

      const stepIndex = Number(li.dataset.stepIndex);
      if (Number.isNaN(stepIndex) || stepIndex >= total) return;

      const nextLi = stepListRoot.querySelector<HTMLLIElement>(`li[data-step-index="${stepIndex + 1}"]`);
      if (!nextLi || !nextLi.hasAttribute('hidden')) return;

      nextLi.removeAttribute('hidden');
      refreshProgress(true);

      const nextSummary = nextLi.querySelector<HTMLElement>('summary.pathway-step-summary');
      if (!nextSummary) return;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          nextSummary.focus({ preventScroll: true });
        });
      });
    });
  });
}

document.querySelectorAll<HTMLElement>('[data-progressive-card]').forEach((card) => {
  if (card.dataset.progressiveInit === '1') return;
  card.dataset.progressiveInit = '1';
  initProgressiveCard(card);
});
