# Practitioner comparison tool — as built (June 2026)

Lets a visitor pick 2–3 professionals on the practitioners-page bubble map and see
their cost / rebate / referral / best-for / registration / wait side by side.

## How it fits together

```
content/practitioners/*.md ──(getCollection, build time)──▶ PractitionerCompare.astro
   bubbleKey frontmatter            JSON data island (#pc-data)        │
                                                                       ▼
practitioner-bubble-map.ts ──'bubble-selection-change' {keys}──▶ practitioner-compare.ts
   selectedKeys (max 3)    ◀──'bm-compare-remove' {key}───────── renders the table,
   = single source of truth                                      reads bubble colours
                                                                 from the SVG fill=
```

## Pieces

- **Schema** (`src/content.config.ts`): practitioners gained `bubbleKey` (maps a
  markdown file to its `data-prof` bubble) and `referralNote` (nuance string).
  `referralRequired` now strictly means "can't book at all without one" — true only
  for psychiatrist and MH nurse; psychologist/SW/OT are `false` +
  `referralNote: "GP referral needed for Medicare rebate"`.
- **Content**: all 8 bubbles have a collection file (`peer-support-worker.md` was
  created for the `peer` bubble, flagged `<!-- REVIEW -->`). `psychotherapist.md`
  has no bubble and no `bubbleKey`, so it's not comparable — intended.
- **Selection** (`src/scripts/practitioner-bubble-map.ts`): explicit
  "＋ Add to compare" button inside the existing popover/bottom sheet (tap-equals-
  select was rejected: on mobile every tap opens a 60vh sheet). Max 3; a 4th add
  shows "Compare list full" on the button for ~2s. Selected blobs get the
  `.bm-blob-active` ring; everything else dims via `.bm-has-selection`/`.bm-sel`.
  Collapsing "Show fewer" prunes selections that just got hidden
  (`social-worker`, `ot`, `mh-nurse`, `peer`) and re-dispatches.
- **Table** (`src/components/PractitionerCompare.astro` +
  `src/scripts/practitioner-compare.ts`): hidden under 2 selections (a one-line
  prompt shows instead). Header per column: colour dot (read live from the SVG
  blob's `fill`) + name + × (dispatches `bm-compare-remove`; the map script is the
  only thing that mutates the selection). Separate `.ts` file on purpose — inline
  `<script>` edits don't HMR reliably (see CLAUDE.md known issue).
- **Styling**: `@theme` tokens only; fonts inherited. The five `badge-*` colour
  classes moved from the bubble map's scoped styles to `global.css` (with
  `--color-badge-*` tokens) so both components share them; `.badge-pill` is the
  standalone shape class for use outside the popover. Mobile (<768px): the label
  column drops out and each label spans the full row above its value cells —
  no horizontal scroll.
- **Page** (`src/pages/practitioners.astro`): new section between the bubble-map
  hero and the "Does it actually matter?" accordion. Nothing was removed.

## Manual QA checklist (needs a real browser)

- Add/remove via popover button on desktop + mobile sheet; button label flips.
- 4th add is a no-op with the "full" message.
- × in a table column removes that practitioner and undims its bubble.
- "Show fewer" while a hidden-bubble practitioner is selected: pruned from table.
- Escape / backdrop / swipe-dismiss of the sheet unaffected.
- 375px: table stacks labels, no horizontal scroll.
