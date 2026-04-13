(function () {
  const root = document.querySelector('.metro-map-root');
  if (!root) return;

  const groups = Array.from(root.querySelectorAll('[data-route]'));
  const resetBtn = root.querySelector('.metro-reset');
  let active = null;

  function apply(next) {
    active = next;
    root.classList.toggle('has-selection', next !== null);
    if (resetBtn) resetBtn.hidden = next === null;
    groups.forEach((g) => {
      const id = g.getAttribute('data-route');
      g.classList.toggle('is-active', id === next);
      g.classList.toggle('is-dimmed', next !== null && id !== next);
      g.setAttribute('aria-pressed', id === next ? 'true' : 'false');
    });
  }

  groups.forEach((g) => {
    g.setAttribute('aria-pressed', 'false');
    g.addEventListener('click', () => {
      const id = g.getAttribute('data-route');
      apply(active === id ? null : id);
    });
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const id = g.getAttribute('data-route');
        apply(active === id ? null : id);
      } else if (e.key === 'Escape' && active !== null) {
        e.preventDefault();
        apply(null);
      }
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => apply(null));
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && active !== null) apply(null);
  });
})();
