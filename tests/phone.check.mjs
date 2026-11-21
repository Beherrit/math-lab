// Phone-size check (390x844): first run, home, a Kindergarten lesson, and the three puzzles.
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
  await page.getByRole('button', { name: /Puzzles/ }).waitFor();
  await page.getByText('Tap Start to practice, or Puzzles to play.').waitFor();
  await shot(page, 'phone-home');

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mathlab.v3')));
  if (saved.name !== 'Ada' || saved.grade !== 'K' || saved.level !== 0 || saved.early !== true) {
    throw new Error(`saved learner was ${JSON.stringify({ name: saved.name, grade: saved.grade, level: saved.level })}`);
  }

  await page.locator('[data-id="l0count"]').click();
  await page.getByRole('button', { name: 'Learn it' }).click();
  await page.getByText('Counting means touching each thing once').waitFor();
  await page.getByRole('button', { name: 'Watch one' }).click();
  await page.getByRole('button', { name: 'Next step' }).click();
  await page.getByRole('button', { name: 'Next step' }).click();
  await page.getByText(/last number/i).waitFor();
  await page.locator('.visual').first().waitFor();
  await shot(page, 'phone-k-lesson');

  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('button', { name: /Puzzles/ }).click();
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
