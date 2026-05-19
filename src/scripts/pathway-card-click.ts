// Tap-anywhere-to-toggle for pathway cards (PathwayCardVisual + PathwayCardGPProgressive).

const INIT_KEY = '__pathwayCardClickInit';

function bindPathwayCardClicks() {
  const win = window as Window & { [INIT_KEY]?: boolean };
  if (win[INIT_KEY]) return;
  win[INIT_KEY] = true;

  document.querySelectorAll<HTMLElement>('[data-pathway-card]').forEach((card) => {
    if (card.dataset.pathwayClickBound === '1') return;
    card.dataset.pathwayClickBound = '1';

    card.addEventListener('click', (event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('.pathway-l1-body, a, button, summary, [role="button"], input, label, select, textarea')) return;
      const details = card.querySelector<HTMLDetailsElement>('details.pathway-details-toggle');
      if (!details) return;
      details.open = !details.open;
    });
  });
}

bindPathwayCardClicks();
