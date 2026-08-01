// Screenshot each expanded pathway card (steps open) at desktop + 380px widths.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const URL = 'http://localhost:4321/pathway/';
const OUT_DIR = resolve('docs/screenshots');

const CARDS = ['through-gp', 'private', 'low-cost', 'self-guided'];
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile-380', width: 380, height: 844 },
];

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
try {
  for (const vp of VIEWPORTS) {
    for (const id of CARDS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();
      await page.goto(URL, { waitUntil: 'networkidle' });

      await page.$eval(`#${id} > details > summary`, (el) => el.click());
      await page.waitForTimeout(300);
      await page.$eval(`#${id} .pathway-details-toggle--nested > summary`, (el) => el.click());
      await page.waitForTimeout(400);

      const outPath = resolve(OUT_DIR, `pathway-card-${id}-${vp.name}.png`);
      await page.locator(`#${id}`).screenshot({ path: outPath });
      console.log(`Saved ${outPath}`);
      await context.close();
    }
  }
} finally {
  await browser.close();
}
