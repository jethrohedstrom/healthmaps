// Pathway Tree — vanilla JS toggle for the GP sub-tier expand/collapse.
// Imported from src/components/PathwayTree.astro

(function () {
  const tree = document.querySelector<HTMLElement>('.pt-tree');
  if (!tree) return;

  const gpCard = tree.querySelector<HTMLElement>('.pt-card[data-branch="gp"]');
  const subRegion = tree.querySelector<HTMLElement>('.pt-sub');

  if (!gpCard || !subRegion) return;

  let open = false;

  function setOpen(next: boolean) {
    open = next;
    gpCard!.setAttribute('aria-expanded', String(open));
    subRegion!.setAttribute('aria-hidden', String(!open));
    if (open) {
      tree!.classList.add('pt-sub-open');
    } else {
      tree!.classList.remove('pt-sub-open');
    }
  }

  // Make the GP card behave like a toggle button instead of a navigation link.
  gpCard.setAttribute('role', 'button');
  gpCard.setAttribute('aria-expanded', 'false');
  gpCard.setAttribute('aria-controls', 'pt-sub-region');
  subRegion.setAttribute('id', 'pt-sub-region');
  subRegion.setAttribute('aria-hidden', 'true');

  gpCard.addEventListener('click', function (e) {
    e.preventDefault();
    setOpen(!open);
  });

  gpCard.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(!open);
    }
  });
})();
