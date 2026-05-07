// Screenshots the GP pathway card with its L1 details panel expanded
// (chips + wait-time bar graphic visible, but L2 step accordion still closed).
//
// Usage: node scripts/screenshot-gp-card-l1.mjs
// Outputs:
//   docs/gp-card-l1-after-desktop.png      (1280x900)
//   docs/gp-card-l1-after-mobile-375.png   (375x812)
//
// Requires the dev server to be running on http://localhost:4321/

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const URL = 'http://localhost:4321/pathway/';
const CARD_SELECTOR = '#through-gp';
const L1_DETAILS_SELECTOR = '#through-gp > details.pathway-details-toggle';
const OUT_DIR = resolve('docs');

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile-375', width: 375, height: 812 },
];

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
try {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });

    await page.locator(CARD_SELECTOR).waitFor({ state: 'visible' });

    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute('open', '');
    }, L1_DETAILS_SELECTOR);

    await page.waitForTimeout(150);

    const card = page.locator(CARD_SELECTOR);
    await card.scrollIntoViewIfNeeded();

    const outPath = resolve(OUT_DIR, `gp-card-l1-after-${vp.name}.png`);
    await card.screenshot({ path: outPath });
    console.log(`Saved ${outPath}`);

    await context.close();
  }
} finally {
  await browser.close();
}
