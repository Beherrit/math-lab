// Phone-size check (390x844): first run, subject and grade browsing, a Kindergarten lesson, and puzzles.
// Run with a static server: npm run test:phone
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { setTimeout as wait } from 'node:timers/promises';

const PORT = 8765;
const base = `http://127.0.0.1:${PORT}/`;
const out = '/opt/cursor/artifacts';
mkdirSync(out, { recursive: true });

function serve() {
  return spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { stdio: 'ignore' });
}
async function ready() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(base);
      if (res.ok) return;
    } catch { /* server still booting */ }
    await wait(100);
  }
  throw new Error('static server did not start');
}
async function shot(page, name) {
  await page.screenshot({ path: `${out}/${name}.png` });
}

const server = serve();
let browser;
try {
  await ready();
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await page.goto(base);
  await page.getByRole('heading', { name: 'Math Lab' }).waitFor();
  await page.locator('#nm').fill('Ada');
  await page.getByRole('button', { name: 'Kindergarten', exact: true }).click();
  await shot(page, 'phone-welcome');
  await page.getByRole('button', { name: /Let.s go/ }).click();
  await page.getByRole('heading', { name: 'Hi, Ada!' }).waitFor();
  await page.getByRole('button', { name: 'Start', exact: true }).waitFor();
  await page.getByRole('heading', { name: 'Kindergarten', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Hear it', exact: true }).waitFor();
  for (const name of ['Numbers', 'Adding', 'Shapes', 'Colors', 'Letters', 'Puzzles']) {
    await page.getByRole('button', { name, exact: true }).waitFor();
  }
  await shot(page, 'phone-home');
  await page.locator('.grade-row').evaluate(el => el.scrollIntoView({ block: 'start' }));
  await shot(page, 'phone-home-grades');

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mathlab.v3')));
  if (saved.name !== 'Ada' || saved.grade !== 'K' || saved.level !== 0 || saved.early !== true) {
    throw new Error(`saved learner was ${JSON.stringify({ name: saved.name, grade: saved.grade, level: saved.level })}`);
  }

  await page.getByRole('button', { name: "Play today's challenge", exact: true }).click();
  await page.getByRole('heading', { name: "Today's challenge", exact: true }).waitFor();
  await page.getByRole('grid', { name: /November/ }).waitFor();
  await shot(page, 'phone-challenge');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  for (let i = 0; i < 4; i++) {
    const done = await page.getByText('Done for today').count();
    if (done) break;
    const choice = page.locator('.choice').first();
    if (await choice.count()) await choice.click();
    else {
      await page.getByRole('button', { name: '1', exact: true }).click();
      await page.getByRole('button', { name: 'Check', exact: true }).click();
    }
    await page.locator('.why-card').waitFor();
    if (i === 0) {
      await page.locator('.why-card').scrollIntoViewIfNeeded();
      await shot(page, 'phone-challenge-why');
    }
    const why = await page.locator('.why-card p').innerText();
    if (!why.trim()) throw new Error('challenge item had no explanation');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await page.getByText('1 day in a row.').waitFor();
  await shot(page, 'phone-challenge-done');
  const chal = await page.evaluate(() => JSON.parse(localStorage.getItem('mathlab.v3')).challenge);
  if (chal.streak.n !== 1 || !Object.values(chal.done).includes(true)) {
    throw new Error(`challenge was not saved: ${JSON.stringify(chal.streak)} ${JSON.stringify(chal.done)}`);
  }
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('heading', { name: 'Hi, Ada!' }).waitFor();

  await page.getByRole('button', { name: 'Numbers', exact: true }).click();
  await page.getByRole('heading', { name: 'Numbers', exact: true }).waitFor();
  await page.locator('[data-act="learn"][data-id="l0count"]').waitFor();
  await shot(page, 'phone-subject-numbers');
  await page.locator('[data-act="learn"][data-id="l0count"]').click();
  await page.getByText('Counting means touching each thing once').waitFor();
  await page.getByRole('button', { name: 'Watch one' }).click();
  // Step 1 sometimes asks for a group with no picture on the watch screen. Open again until the dots show.
  for (let i = 0; i < 8 && !(await page.locator('.visual').count()); i++) {
    await page.getByRole('button', { name: 'Close' }).click();
    await page.locator('[data-act="learn"][data-id="l0count"]').click();
    await page.getByRole('button', { name: 'Watch one' }).click();
  }
  if (!(await page.locator('.visual').count())) throw new Error('counting lesson never showed a picture');
  await page.getByRole('button', { name: 'Next step' }).click();
  await page.getByRole('button', { name: 'Next step' }).click();
  await page.getByText(/last number/i).waitFor();
  await page.locator('.lsteps li.newest').scrollIntoViewIfNeeded();
  await shot(page, 'phone-k-lesson');

  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('heading', { name: 'Numbers', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('button', { name: 'Shapes', exact: true }).click();
  await page.getByRole('heading', { name: 'Shapes', exact: true }).waitFor();
  await page.getByRole('button', { name: 'What comes next' }).waitFor();
  await page.getByRole('button', { name: 'Which piece fits' }).waitFor();
  await shot(page, 'phone-subject-shapes');
  await page.getByRole('button', { name: 'Back' }).click();

  await page.getByRole('button', { name: 'Grade 3', exact: true }).click();
  await page.getByRole('heading', { name: 'Grade 3', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Multiplying', exact: true }).scrollIntoViewIfNeeded();
  await shot(page, 'phone-grade-3');
  const mid = await page.evaluate(() => JSON.parse(localStorage.getItem('mathlab.v3')));
  if (mid.grade !== '3' || mid.level !== 2 || mid.name !== 'Ada') throw new Error(`grade switch lost progress: ${mid.grade} ${mid.level}`);
  await page.getByRole('button', { name: 'Kindergarten', exact: true }).click();
  await page.getByRole('button', { name: 'Colors', exact: true }).waitFor();

  await page.getByRole('button', { name: 'Puzzles', exact: true }).click();
  await page.getByRole('heading', { name: 'Puzzles' }).waitFor();

  async function openGame(name, file) {
    await page.getByRole('button', { name: new RegExp(name) }).click();
    await page.getByRole('heading', { name: new RegExp(name) }).waitFor();
    await shot(page, file);
  }
  await openGame('What comes next', 'phone-game-pattern');
  await page.locator('.game-choice').first().click();
  await page.locator('.why-card').waitFor();
  const why = await page.locator('.why-card p').innerText();
  if (!/repeat/i.test(why)) throw new Error(`pattern explanation was: ${why}`);
  await page.locator('.why-card').scrollIntoViewIfNeeded();
  await shot(page, 'phone-game-pattern-why');
  await page.getByRole('button', { name: 'Back' }).click();

  await openGame('Which piece fits', 'phone-game-fit');
  await page.locator('.game-choice').first().click();
  await page.locator('.why-card').waitFor();
  const fitWhy = await page.locator('.why-card p').innerText();
  if (!/space/i.test(fitWhy)) throw new Error(`fit explanation was: ${fitWhy}`);
  await page.getByRole('button', { name: 'Back' }).click();

  await openGame('Make ten', 'phone-game-ten');
  await page.locator('.game-choice').first().click();
  await page.locator('.why-card').waitFor();
  const tenWhy = await page.locator('.why-card p').innerText();
  if (!/ten/i.test(tenWhy)) throw new Error(`ten explanation was: ${tenWhy}`);
  await page.locator('.why-card').scrollIntoViewIfNeeded();
  await shot(page, 'phone-game-ten-why');

  const still = await page.evaluate(() => JSON.parse(localStorage.getItem('mathlab.v3')));
  if (still.grade !== 'K' || still.name !== 'Ada') throw new Error('progress was not kept');
  console.log('phone check ok');
} finally {
  await browser?.close();
  server.kill();
}
