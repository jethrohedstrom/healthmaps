# Lighthouse audit — July 2026 result

CLAUDE.md next step #2 ("Lighthouse audit, target 95+ all categories") completed 14 July 2026. **Target met on every page with no code changes required.**

## Scores

Lighthouse 13.4, headless Chrome. Categories: Performance / Accessibility / Best Practices / SEO (plus the new Agentic Browsing category, also 100 everywhere).

| Page | Local mobile | Local desktop | Live mobile (healthmaps.com.au) |
|---|---|---|---|
| Home | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Pathway | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Practitioners | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100* / 100 / 100 / 100 |
| Calculator | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |

\* First live run scored 98 (Speed Index 4.3s — the bubble-map entrance animation keeps the viewport visually changing, and the metric is sensitive to when it settles). A re-run scored 100 with Speed Index 1.1s, so this is run variance, not a defect.

Key metrics (live, mobile throttling): FCP 1.0–1.1s, LCP 1.1–1.5s, TBT 0ms on every page, CLS 0 on every page.

## Why nothing needed fixing

Suspected point-losers from the scoping pass all turned out fine under measurement:

- **JS weight (44KB bubble map, quiz scripts):** TBT is 0ms everywhere — Astro's deferred module scripts keep everything off the critical path.
- **Meta-text contrast:** fixed before the audit in `49601c5` (`--color-meta-sage` #6b7d74 → #5a6b62).
- **Calculator `is:inline` script:** not flagged; small enough not to matter.
- **SVG-only favicon, OG image width/height:** not scored by Lighthouse.

The only sub-perfect items anywhere are zero-weight informational insights (the stylesheet is "render-blocking", est. 100–150ms). Inlining critical CSS to chase that is not worth the maintenance cost at a score of 100.

## If scores regress later

- Raw reports from this run were in the session scratchpad (not committed). Re-run with:
  `npx lighthouse https://healthmaps.com.au/<page>/ --chrome-flags="--headless=new" --output=json --output-path=report.json`
- The most fragile metric is Speed Index on `/practitioners/` (animation-sensitive). If it degrades consistently, shorten the bubble entrance animation or start it only when the map scrolls into view.
- The next most likely regression source is new imagery: any raster images added to pages need explicit width/height, `loading="lazy"`, and compression.
