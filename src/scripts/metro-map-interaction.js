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
      const isActive = id === next;
      g.classList.toggle('is-active', isActive);
      g.classList.toggle('is-dimmed', next !== null && !isActive);
      if (isActive) g.setAttribute('aria-current', 'true');
      else g.removeAttribute('aria-current');
    });
  }

  function toggle(g) {
    const id = g.getAttribute('data-route');
    apply(active === id ? null : id);
  }

  groups.forEach((g) => {
    g.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      toggle(g);
    });
    g.addEventListener('keydown', (e) => {
      if (e.target !== g) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(g);
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
