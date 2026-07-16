import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const host = '127.0.0.1';
const port = 4322;
const baseUrl = `http://${host}:${port}`;
const preview = spawn('npm', ['run', 'preview', '--', '--host', host, '--port', String(port)], {
  stdio: 'ignore',
});

async function waitForPreview() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (preview.exitCode !== null) throw new Error(`Astro preview exited with code ${preview.exitCode}`);
    try {
      const response = await fetch(`${baseUrl}/pathway/`);
      if (response.ok) return;
    } catch {
      // Preview is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Timed out waiting for Astro preview');
}

async function getOverlappingAnswerPoint(page) {
  return page.evaluate(() => {
    const buttons = (questionIndex) =>
      Array.from(document.querySelectorAll(`[data-question-index="${questionIndex}"] [data-quiz-answer]`));
    for (const first of buttons(0)) {
      const firstRect = first.getBoundingClientRect();
      for (const second of buttons(1)) {
        const secondRect = second.getBoundingClientRect();
        const left = Math.max(firstRect.left, secondRect.left);
        const right = Math.min(firstRect.right, secondRect.right);
        const top = Math.max(firstRect.top, secondRect.top);
        const bottom = Math.min(firstRect.bottom, secondRect.bottom);
        if (right > left && bottom > top) return { x: (left + right) / 2, y: (top + bottom) / 2 };
      }
    }
    return null;
  });
}

let browser;
try {
  await waitForPreview();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'no-preference',
  });

  await page.goto(`${baseUrl}/pathway/`);
  await page.locator('[data-quiz-start]').click();

  const overlap = await getOverlappingAnswerPoint(page);
  assert.ok(overlap, 'Expected Q1 and Q2 answer buttons to overlap');

  await page.mouse.click(overlap.x, overlap.y);
  await page.mouse.click(overlap.x, overlap.y);
  await page.waitForTimeout(400);

  const stateAfterDoubleTap = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem('healthmaps:pathway-quiz:v3') ?? 'null'),
  );
  assert.equal(stateAfterDoubleTap.questionIndex, 1, 'rapid second tap must not skip Q2');
  assert.equal(stateAfterDoubleTap.answers.length, 1, 'rapid second tap must record only one answer');

  await page.locator('[data-question-index="1"] [data-quiz-answer]').first().click();
  const stateAfterIntentionalTap = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem('healthmaps:pathway-quiz:v3') ?? 'null'),
  );
  assert.equal(stateAfterIntentionalTap.questionIndex, 2, 'Q2 must accept an answer after the transition');
  assert.equal(stateAfterIntentionalTap.answers.length, 2);

  await page.locator('[data-question-index="2"] [data-quiz-back]').click({ force: true });
  await page.locator('[data-question-index="1"] [data-quiz-answer]').first().click({ force: true });
  const stateAfterBack = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem('healthmaps:pathway-quiz:v3') ?? 'null'),
  );
  assert.equal(stateAfterBack.questionIndex, 2, 'Back must clear the transition lock');
  assert.equal(stateAfterBack.answers.length, 2);

  const reducedMotionPage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  await reducedMotionPage.goto(`${baseUrl}/pathway/`);
  await reducedMotionPage.locator('[data-quiz-start]').click();
  const reducedMotionState = await reducedMotionPage.evaluate(() => {
    const buttons = (questionIndex) =>
      Array.from(document.querySelectorAll(`[data-question-index="${questionIndex}"] [data-quiz-answer]`));
    for (const first of buttons(0)) {
      const firstRect = first.getBoundingClientRect();
      for (const second of buttons(1)) {
        const secondRect = second.getBoundingClientRect();
        const overlaps =
          Math.min(firstRect.right, secondRect.right) > Math.max(firstRect.left, secondRect.left) &&
          Math.min(firstRect.bottom, secondRect.bottom) > Math.max(firstRect.top, secondRect.top);
        if (!overlaps) continue;
        first.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        second.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        return JSON.parse(sessionStorage.getItem('healthmaps:pathway-quiz:v3') ?? 'null');
      }
    }
    return null;
  });
  assert.ok(reducedMotionState, 'Expected reduced-motion Q1 and Q2 answers to overlap');
  assert.equal(reducedMotionState.questionIndex, 1, 'reduced-motion double tap must not skip Q2');
  assert.equal(reducedMotionState.answers.length, 1);

  console.log('Pathway quiz transition regression test passed.');
} finally {
  await browser?.close();
  preview.kill('SIGTERM');
}
