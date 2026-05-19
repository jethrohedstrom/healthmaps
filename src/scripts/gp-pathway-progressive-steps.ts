// GP card: progressive step reveal + progress bar (PathwayCardGPProgressive.astro).

(function () {
  const cardEl = document.getElementById('through-gp');
  if (!cardEl) return;

  /** Narrowed root for nested closures (astro check TS control-flow quirk). */
  const card: HTMLElement = cardEl;

  const ol = card.querySelector<HTMLOListElement>('[data-gp-step-reveal]');
  if (!ol) return;

  /** Narrowed root for closures (astro check TS control-flow quirk). */
  const stepListRoot: HTMLOListElement = ol;

  const total = Number(stepListRoot.dataset.stepTotal) || stepListRoot.querySelectorAll(':scope > li').length;
  if (!Number.isFinite(total) || total < 1) return;

  const label = card.querySelector<HTMLElement>('[data-gp-progress-label]');
  const live = card.querySelector<HTMLElement>('[data-gp-progress-live]');
  const progressbar = card.querySelector<HTMLElement>('[data-gp-progressbar]');
  const fill = card.querySelector<HTMLElement>('[data-gp-progress-fill]');

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

  function openGpCardForStep(stepNumber: number) {
    const l1 = card.querySelector<HTMLDetailsElement>('details.pathway-details-toggle:not(.pathway-details-toggle--nested)');
    if (l1) l1.open = true;

    const nested = card.querySelector<HTMLDetailsElement>('details.pathway-details-toggle--nested');
    if (nested) nested.open = true;

    for (let i = 1; i <= stepNumber; i++) {
      const li = stepListRoot.querySelector<HTMLLIElement>(`li[data-step-index="${i}"]`);
      if (li) li.removeAttribute('hidden');
    }

    refreshProgress(false);

    const target = document.getElementById(`step-${stepNumber}`);
    if (target) target.scrollIntoView({ block: 'start' });
  }

  function handleStepHash() {
    const match = location.hash.match(/^#step-(\d+)$/);
    if (!match) return;
    const stepNumber = Number(match[1]);
    if (!Number.isFinite(stepNumber) || stepNumber < 1) return;
    openGpCardForStep(stepNumber);
  }

  handleStepHash();
  window.addEventListener('hashchange', handleStepHash);

  card.querySelectorAll<HTMLDetailsElement>('.pathway-step-item').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      if (!(detail.closest('#through-gp') === card)) return;

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
})();
