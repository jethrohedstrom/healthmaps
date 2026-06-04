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
  const nestedDetails = card.querySelector<HTMLDetailsElement>('details.pathway-details-toggle--nested');

  // Set while a hash deep-link drives the L1/L2 open, so its scroll-to-step wins.
  // Consumed (cleared) by the matching toggle handler below.
  let suppressL1Scroll = false;
  let suppressNestedScroll = false;

  // Smoothly bring `anchor`'s top just under the sticky header on accordion open.
  // Down-only: never yanks the page up when the anchor already sits at/above the
  // target. Uses ease-in-out so the scroll ramps gently up and down (no jolt at
  // click time), with a distance-scaled duration; honours reduced-motion.
  function scrollAnchorUnderHeader(anchor: HTMLElement) {
    const header = document.querySelector<HTMLElement>('header');
    const offset = (header?.offsetHeight ?? 0) + 16;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    requestAnimationFrame(() => {
      const startY = window.scrollY;
      const targetY = Math.max(0, anchor.getBoundingClientRect().top + startY - offset);

      if (reduceMotion) {
        if (targetY > startY + 8) window.scrollTo({ top: targetY, behavior: 'auto' });
        return;
      }
      if (targetY <= startY + 8) return;

      // Scale the glide to the distance travelled: short hops stay snappy, longer
      // jumps get more time to ease rather than rushing.
      const distance = targetY - startY;
      const duration = Math.min(720, Math.max(420, distance * 0.6));
      const easeInOut = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const t0 = performance.now();

      const step = () => {
        const t = Math.min(1, (performance.now() - t0) / duration);
        const y = startY + distance * easeInOut(t);
        window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  if (l1Details) {
    l1Details.addEventListener('toggle', () => {
      if (!l1Details.open) return;
      if (suppressL1Scroll) {
        suppressL1Scroll = false;
        return;
      }
      // Anchor to the whole card: brings icon/title + revealed body into view and
      // also settles the desktop full-width grid reflow that L1-open triggers.
      scrollAnchorUnderHeader(card);
    });
  }

  if (nestedDetails) {
    nestedDetails.addEventListener('toggle', () => {
      if (!nestedDetails.open) return;
      if (suppressNestedScroll) {
        suppressNestedScroll = false;
        return;
      }
      const nestedSummary = nestedDetails.querySelector<HTMLElement>(':scope > summary');
      scrollAnchorUnderHeader(nestedSummary ?? nestedDetails);
    });
  }

  function openCardForStep(stepNumber: number) {
    if (l1Details && !l1Details.open) {
      suppressL1Scroll = true;
      l1Details.open = true;
    }

    const nested = card.querySelector<HTMLDetailsElement>('details.pathway-details-toggle--nested');
    if (nested && !nested.open) {
      suppressNestedScroll = true;
      nested.open = true;
    }

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

      // Settle the opened step under the header so its detail (and the next
      // revealed step) are visible. Runs on every open, including re-opens.
      const stepSummary = detail.querySelector<HTMLElement>(':scope > summary');
      scrollAnchorUnderHeader(stepSummary ?? detail);

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
