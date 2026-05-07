// Full-page screenshots of /pathway/ at desktop and 375px mobile.
// Used to verify that nothing outside the GP card shifted after a copy edit.
//
// Usage: node scripts/screenshot-pathway-page.mjs <label>
//   <label> is "before" or "after".

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const label = process.argv[2];
if (!label || !['before', 'after'].includes(label)) {
  console.error('Usage: node scripts/screenshot-pathway-page.mjs <before|after>');
  process.exit(1);
}

const URL = 'http://localhost:4321/pathway/';
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
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });

    const outPath = resolve(OUT_DIR, `pathway-page-${label}-${vp.name}.png`);
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`Saved ${outPath}`);

    await context.close();
  }
} finally {
  await browser.close();
}
