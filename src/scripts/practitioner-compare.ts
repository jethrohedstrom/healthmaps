interface CompareRow {
  key: string;
  title: string;
  cost: string;
  rebate: string;
  referralRequired: boolean;
  referralNote: string | null;
  bestFor: string | null;
  registrationStatus: string | null;
  waitTime: string | null;
}

(function () {
  const root = document.getElementById('practitioner-compare');
  const dataEl = document.getElementById('pc-data');
  const tableEl = document.getElementById('pc-table');
  const promptEl = document.getElementById('pc-prompt');
  if (!root || !dataEl || !tableEl || !promptEl) return;

  const rows: CompareRow[] = JSON.parse(dataEl.textContent || '[]');
  const byKey = new Map<string, CompareRow>(rows.map((r) => [r.key, r]));

  function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Bubble colours live on the SVG blobs — read them rather than duplicating
  function blobColor(key: string): string {
    const blob = document.querySelector('.bm-blob[data-prof="' + key + '"]');
    return blob?.getAttribute('fill') || 'var(--color-primary)';
  }

  function registrationBadgeClass(status: string): string | null {
    const s = status.toLowerCase();
    if (s.includes('ahpra')) return 'badge-registered';
    if (s.includes('aasw')) return 'badge-voluntary';
    if (s.includes('unregulated') || s.includes('not regulated')) return 'badge-unregulated';
    return null;
  }

  function cell(value: string, note?: string | null): string {
    return (
      '<div class="pc-cell">' +
      value +
      (note ? '<span class="pc-cell-note">' + esc(note) + '</span>' : '') +
      '</div>'
    );
  }

  function render(keys: string[]) {
    const selected = keys.map((k) => byKey.get(k)).filter((r): r is CompareRow => Boolean(r));

    if (selected.length < 2) {
      tableEl!.hidden = true;
      tableEl!.innerHTML = '';
      if (selected.length === 1) {
        promptEl!.textContent =
          selected[0].title + ' added — pick one or two more bubbles to compare.';
      } else {
        promptEl!.textContent =
          'Curious how they stack up? Add two or three to compare them side by side.';
      }
      promptEl!.hidden = false;
      return;
    }

    const headers = selected
      .map(
        (r) =>
          '<div class="pc-head">' +
          '<span class="pc-head-name">' +
          '<span class="pc-head-dot" style="background:' + blobColor(r.key) + '"></span>' +
          esc(r.title) +
          '</span>' +
          '<button type="button" class="pc-remove" data-key="' + esc(r.key) + '" aria-label="Remove ' +
          esc(r.title) + ' from comparison">&times;</button>' +
          '</div>'
      )
      .join('');

    const sections: Array<{ label: string; cells: string }> = [
      { label: 'Cost', cells: selected.map((r) => cell(esc(r.cost))).join('') },
      { label: 'Medicare rebate', cells: selected.map((r) => cell(esc(r.rebate))).join('') },
      {
        label: 'Referral',
        cells: selected
          .map((r) => cell(r.referralRequired ? 'Required' : 'Not needed to book', r.referralNote))
          .join(''),
      },
      { label: 'Best for', cells: selected.map((r) => cell(esc(r.bestFor || '—'))).join('') },
      {
        label: 'Registration',
        cells: selected
          .map((r) => {
            if (!r.registrationStatus) return cell('—');
            const badge = registrationBadgeClass(r.registrationStatus);
            return cell(
              badge
                ? '<span class="badge-pill ' + badge + '">' + esc(r.registrationStatus) + '</span>'
                : esc(r.registrationStatus)
            );
          })
          .join(''),
      },
      { label: 'Typical wait', cells: selected.map((r) => cell(esc(r.waitTime || 'Varies'))).join('') },
    ];

    tableEl!.innerHTML =
      '<div class="pc-grid" style="--pc-cols:' + selected.length + '" role="group" aria-label="Practitioner comparison">' +
      '<div class="pc-corner" aria-hidden="true"></div>' +
      headers +
      sections.map((s) => '<div class="pc-label">' + s.label + '</div>' + s.cells).join('') +
      '</div>';
    tableEl!.hidden = false;
    promptEl!.hidden = true;

    tableEl!.querySelectorAll('.pc-remove').forEach((btn) => {
      btn.addEventListener('click', function () {
        const key = btn.getAttribute('data-key');
        if (!key) return;
        // The bubble map owns the selection; it answers with bubble-selection-change
        document.dispatchEvent(new CustomEvent('bm-compare-remove', { detail: { key } }));
      });
    });
  }

  document.addEventListener('bubble-selection-change', function (e) {
    const keys = (e as CustomEvent).detail?.keys;
    if (Array.isArray(keys)) render(keys);
  });

  render([]);
})();
