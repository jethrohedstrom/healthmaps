// One-shot Playwright script to screenshot the GP/Medicare pathway card
// in its default collapsed state at desktop and 375px mobile viewports.
//
// Usage: node scripts/screenshot-gp-card.mjs <label>
//   <label> is "before" or "after" — controls output filename suffix.
//
// Requires the dev server to be running on http://localhost:4321/

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const label = process.argv[2];
if (!label || !['before', 'after'].includes(label)) {
  console.error('Usage: node scripts/screenshot-gp-card.mjs <before|after>');
  process.exit(1);
}

const URL = 'http://localhost:4321/pathway/';
const SELECTOR = '#through-gp';
const OUT_DIR = resolve('docs');

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
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

    const card = page.locator(SELECTOR);
    await card.waitFor({ state: 'visible' });
    await card.scrollIntoViewIfNeeded();

    const outPath = resolve(OUT_DIR, `gp-card-${label}-${vp.name}.png`);
    await card.screenshot({ path: outPath });
    console.log(`Saved ${outPath}`);

    await context.close();
  }
} finally {
  await browser.close();
}
