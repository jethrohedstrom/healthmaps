// Drives the cost calculator's question-by-question flow at desktop and
// 375px mobile, asserts the receipt figures for every branch, and saves
// screenshots of the first, fee and final screens.
//
// Requires the dev server: npm run dev (localhost:4321).
// Usage: node scripts/verify-calculator.mjs

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const URL = 'http://localhost:4321/calculator/';
const OUT_DIR = resolve('docs/screenshots');
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile-375', width: 375, height: 812 },
];

// Each path: answers clicked by visible text, fees typed, and what the
// receipt must show. `progressOnFee` checks the label on the fee screen.
const PATHS = [
  { name: 'general', answers: ['Psychologist', 'General'], fees: { 'session-fee': 250 }, gp: "No, it's free", progressOnFee: 'Question 3 of 4', total: '$148.45', rebate: '−$101.55', gpAmount: '$0.00', gpLabel: 'GP visit (care plan)' },
  { name: 'clinical', answers: ['Psychologist', 'Clinical'], fees: { 'session-fee': 280 }, gp: 'Yes, about $40', progressOnFee: 'Question 3 of 4', total: '$130.95', rebate: '−$149.05', gpAmount: '$40.00' },
  { name: 'not-sure', answers: ['Psychologist', 'Not sure'], fees: { 'session-fee': 250 }, gp: "No, it's free", progressOnFee: 'Question 3 of 4', total: '$148.45', assumeNote: true },
  { name: 'unknown', answers: ["I don't know yet"], fees: { 'session-fee': 200 }, gp: "No, it's free", progressOnFee: 'Question 2 of 3', total: '$98.45', assumeNote: true },
  { name: 'psychiatrist', answers: ['Psychiatrist'], fees: { 'first-fee': 600, 'follow-up-fee': 300 }, gp: "No, it's free", progressOnFee: 'Question 2 of 3', firstTotal: '$331.10', followTotal: '$210.70', gpLabel: 'GP visit (referral)', gpAmount: '$0.00' },
  { name: 'social-worker', answers: ['Someone else', 'Mental health social worker'], fees: { 'session-fee': 200 }, gp: 'Yes, about $40', progressOnFee: 'Question 3 of 4', total: '$110.50', gpAmount: '$40.00' },
  { name: 'ot', answers: ['Someone else', 'Mental health occupational therapist'], fees: { 'session-fee': 220 }, gp: 'Yes, about $40', progressOnFee: 'Question 3 of 4', total: '$130.50', gpAmount: '$40.00' },
  { name: 'counsellor', answers: ['Someone else', 'Counsellor'], fees: { 'session-fee': 140 }, gp: null, progressOnFee: 'Question 3 of 3', total: '$140.00', rebate: 'No rebate', noGp: true },
  { name: 'psychotherapist', answers: ['Someone else', 'Psychotherapist'], fees: { 'session-fee': 180 }, gp: null, progressOnFee: 'Question 3 of 3', total: '$180.00', rebate: 'No rebate', noGp: true },
];

let failures = 0;
const check = (cond, msg) => {
  if (!cond) {
    failures += 1;
    console.error('  FAIL', msg);
  }
};

const activeScreen = (page) =>
  page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-calc-screen]')].find((s) => !s.classList.contains('calc-screen--hidden'));
    return el?.dataset.calcScreen ?? null;
  });
const text = (page, sel) => page.locator(sel).first().evaluate((el) => el.textContent.trim());
const progress = (page) =>
  page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-calc-screen]')].find((s) => !s.classList.contains('calc-screen--hidden'));
    return el?.querySelector('[data-calc-progress]')?.textContent.trim() ?? null;
  });
const focusedHeading = (page) => page.evaluate(() => document.activeElement?.hasAttribute('data-calc-heading') ?? false);

async function clickAnswer(page, label) {
  const screen = await activeScreen(page);
  await page.locator(`[data-calc-screen="${screen}"] [data-calc-answer]`, { hasText: label }).first().click();
  await page.waitForTimeout(450);
}

async function runPath(page, p, viewport) {
  await page.goto(URL, { waitUntil: 'load' });
  await page.evaluate(() => sessionStorage.clear());
  await page.reload({ waitUntil: 'load' });
  check((await activeScreen(page)) === 'who', `${p.name}: starts on who`);
  check((await progress(page)) === 'Question 1 of 4', `${p.name}: initial progress label`);
  check((await text(page, '[data-receipt-total]')) === '—', `${p.name}: receipt empty at start`);
  if (viewport.name === 'desktop' && p.name === 'general') await page.screenshot({ path: `${OUT_DIR}/calculator-quiz-who-${viewport.name}.png` });
  if (viewport.name !== 'desktop' && p.name === 'general') await page.screenshot({ path: `${OUT_DIR}/calculator-quiz-who-${viewport.name}.png` });

  for (const a of p.answers) {
    await clickAnswer(page, a);
    check(await focusedHeading(page), `${p.name}: focus on heading after "${a}"`);
  }
  check((await activeScreen(page)) === 'fee', `${p.name}: reached fee screen`);
  check((await progress(page)) === p.progressOnFee, `${p.name}: fee progress "${await progress(page)}" expected "${p.progressOnFee}"`);
  const noteHidden = await page.locator('[data-calc-assume-note]').evaluate((el) => el.hidden);
  check(noteHidden === !p.assumeNote, `${p.name}: assumption note ${p.assumeNote ? 'shown' : 'hidden'}`);

  // Next with an empty fee must not advance.
  await page.locator('[data-calc-next]').click();
  await page.waitForTimeout(200);
  check((await activeScreen(page)) === 'fee', `${p.name}: empty fee blocks Next`);
  check(!(await page.locator('[data-fee-error]').evaluate((el) => el.hidden)), `${p.name}: fee error shown`);

  for (const [id, value] of Object.entries(p.fees)) await page.fill(`#${id}`, String(value));
  check(await page.locator('[data-fee-error]').evaluate((el) => el.hidden), `${p.name}: fee error hides once a fee is entered`);
  if (p.name === 'general') await page.screenshot({ path: `${OUT_DIR}/calculator-quiz-fee-${viewport.name}.png` });
  // Enter in the fee field advances (keyboard path).
  await page.locator(`#${Object.keys(p.fees)[0]}`).press('Enter');
  await page.waitForTimeout(450);

  if (p.gp) {
    check((await activeScreen(page)) === 'gp', `${p.name}: reached gp screen`);
    check((await text(page, '[data-receipt-gp]')) === '—', `${p.name}: GP amount unknown before answering`);
    await clickAnswer(page, p.gp);
  }
  check((await activeScreen(page)) === 'done', `${p.name}: reached done`);
  check((await progress(page)) === 'Your costs', `${p.name}: done label`);

  if (p.total) check((await text(page, '[data-receipt-total]')) === p.total, `${p.name}: total ${await text(page, '[data-receipt-total]')} expected ${p.total}`);
  if (p.rebate) check((await text(page, '[data-receipt-rebate]')) === p.rebate, `${p.name}: rebate ${await text(page, '[data-receipt-rebate]')}`);
  if (p.firstTotal) check((await text(page, '[data-receipt-first-total]')) === p.firstTotal, `${p.name}: first total`);
  if (p.followTotal) check((await text(page, '[data-receipt-follow-total]')) === p.followTotal, `${p.name}: follow-up total`);
  if (p.gpAmount) check((await text(page, '[data-receipt-gp]')) === p.gpAmount, `${p.name}: GP amount ${await text(page, '[data-receipt-gp]')}`);
  if (p.gpLabel) check((await text(page, '[data-receipt-gp-label]')) === p.gpLabel, `${p.name}: GP label`);
  const gpHidden = await page.locator('[data-receipt-gp-part]').evaluate((el) => el.hidden);
  check(gpHidden === Boolean(p.noGp), `${p.name}: GP block ${p.noGp ? 'hidden' : 'shown'}`);
  const summaryGpHidden = await page.locator('[data-summary-gp-row]').evaluate((el) => el.hidden);
  check(summaryGpHidden === Boolean(p.noGp), `${p.name}: summary GP row`);
  if (p.name === 'general') await page.screenshot({ path: `${OUT_DIR}/calculator-quiz-done-${viewport.name}.png` });

  // Reload restores the same screen without scrolling.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200); // let the browser record the scroll position it will restore
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(300);
  check((await activeScreen(page)) === 'done', `${p.name}: reload restores done`);
  check((await page.evaluate(() => window.scrollY)) === 0, `${p.name}: no scroll on reload`);
  if (p.total) check((await text(page, '[data-receipt-total]')) === p.total, `${p.name}: total restored after reload`);

  // Back from done returns along the path; Change → Back returns to done.
  await page.locator('[data-calc-screen="done"] [data-calc-back]').click();
  await page.waitForTimeout(450);
  check((await activeScreen(page)) === (p.gp ? 'gp' : 'fee'), `${p.name}: Back from done`);
  await page.locator('[data-calc-screen="' + (p.gp ? 'gp' : 'fee') + '"] [data-calc-back]').click();
  await page.waitForTimeout(450);
  if (p.gp) {
    check((await activeScreen(page)) === 'fee', `${p.name}: Back to fee keeps values`);
    check((await page.inputValue(`#${Object.keys(p.fees)[0]}`)) === String(Object.values(p.fees)[0]), `${p.name}: fee kept after Back`);
  }
}

async function runChangeType(page) {
  // Done → Change practitioner → different type clears the fee.
  await page.goto(URL, { waitUntil: 'load' });
  await page.evaluate(() => sessionStorage.clear());
  await page.reload({ waitUntil: 'load' });
  await clickAnswer(page, 'Psychologist');
  await clickAnswer(page, 'General');
  await page.fill('#session-fee', '250');
  await page.locator('[data-calc-next]').click();
  await page.waitForTimeout(450);
  await clickAnswer(page, "No, it's free");
  check((await activeScreen(page)) === 'done', 'change: at done');
  await page.locator('[data-calc-goto="fee"]').click();
  await page.waitForTimeout(450);
  check((await activeScreen(page)) === 'fee', 'change: goto fee');
  await page.locator('[data-calc-screen="fee"] [data-calc-back]').click();
  await page.waitForTimeout(450);
  check((await activeScreen(page)) === 'done', 'change: Back returns to done');
  await page.locator('[data-calc-goto="who"]').click();
  await page.waitForTimeout(450);
  await clickAnswer(page, 'Someone else');
  await clickAnswer(page, 'Counsellor');
  check((await activeScreen(page)) === 'fee', 'change: new type goes to fee');
  check((await page.inputValue('#session-fee')) === '', 'change: fee cleared for new type');
  check((await text(page, '[data-receipt-total]')) === '—', 'change: receipt empty for new type');
  check((await text(page, '[data-fee-field="session-fee"] [data-fee-chip]')) === 'Lower $100', 'change: chips relabelled');
  // Chip tap fills and highlights.
  await page.locator('[data-fee-field="session-fee"] [data-fee-chip]').nth(1).click();
  await page.waitForTimeout(100);
  check((await page.inputValue('#session-fee')) === '140', 'chip: fills input');
  check((await page.locator('[data-fee-field="session-fee"] [data-fee-chip]').nth(1).getAttribute('aria-pressed')) === 'true', 'chip: aria-pressed');
  check((await text(page, '[data-receipt-total]')) === '$140.00', 'chip: receipt updates');
  // Start again.
  await page.locator('[data-calc-next]').click();
  await page.waitForTimeout(450);
  check((await activeScreen(page)) === 'done', 'counsellor skips gp');
  await page.locator('[data-calc-reset]').click();
  await page.waitForTimeout(450);
  check((await activeScreen(page)) === 'who', 'reset: back to who');
  check((await text(page, '[data-receipt-total]')) === '—', 'reset: receipt empty');
  await page.reload({ waitUntil: 'load' });
  check((await activeScreen(page)) === 'who', 'reset: reload stays on who');
}

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch();
for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  console.log(`\n== ${viewport.name} ==`);
  for (const p of PATHS) {
    console.log(`path: ${p.name}`);
    await runPath(page, p, viewport);
  }
  console.log('path: change-type / chips / reset');
  await runChangeType(page);
  if (viewport.name !== 'desktop') {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    check(!overflow, 'mobile: no horizontal overflow');
    await page.goto(URL, { waitUntil: 'load' });
    const short = await page.evaluate(() =>
      [...document.querySelectorAll('[data-calc-screen="who"] [data-calc-answer]')].filter((b) => b.getBoundingClientRect().height < 44).length,
    );
    check(short === 0, 'mobile: answer buttons ≥ 44px');
  }
  check(errors.length === 0, `console errors: ${errors.join(' | ')}`);
  await context.close();
}

// Reduced motion: screens still swap.
const rm = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
const page = await rm.newPage();
await page.goto(URL, { waitUntil: 'load' });
await page.evaluate(() => sessionStorage.clear());
await page.reload({ waitUntil: 'load' });
await page.locator('[data-calc-screen="who"] [data-calc-answer]', { hasText: 'Psychiatrist' }).click();
await page.waitForTimeout(50);
check((await activeScreen(page)) === 'fee', 'reduced motion: swaps instantly');
await rm.close();
await browser.close();

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
