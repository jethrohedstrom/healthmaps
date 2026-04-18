// Pathway Tree: vanilla JS toggle for the GP sub-tier expand/collapse.
// Imported from src/components/PathwayTree.astro

(function () {
  const tree = document.querySelector<HTMLElement>('.pt-tree');
  if (!tree) return;

  const gpBtn = tree.querySelector<HTMLButtonElement>('.pt-card-toggle');
  const subRegion = tree.querySelector<HTMLElement>('.pt-sub');

  if (!gpBtn || !subRegion) return;

  let open = false;

  function setOpen(next: boolean) {
    open = next;
    gpBtn!.setAttribute('aria-expanded', String(open));
    if (open) {
      tree!.classList.add('pt-sub-open');
      subRegion!.removeAttribute('inert');
    } else {
      tree!.classList.remove('pt-sub-open');
      subRegion!.setAttribute('inert', '');
    }
  }

  gpBtn.addEventListener('click', function () {
    setOpen(!open);
  });
})();
