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
async function methodShot(page, grade, subject, title, file) {
  await page.getByRole('button', { name: grade, exact: true }).click();
  await page.getByRole('heading', { name: grade, exact: true }).waitFor();
  await page.getByRole('button', { name: subject, exact: true }).click();
  await page.getByRole('heading', { name: subject, exact: true, level: 1 }).waitFor();
  const card = page.locator('article.path-card', { has: page.getByRole('heading', { name: title, exact: true }) });
  await card.scrollIntoViewIfNeeded();
  const peek = card.getByRole('button', { name: 'Peek' });
  if (await peek.count()) {
    await peek.click();
    await page.getByRole('heading', { name: 'Why it works', exact: true }).waitFor();
    await page.getByRole('heading', { name: 'Why it works', exact: true }).evaluate(el => el.scrollIntoView({ block: 'start' }));
    await shot(page, `${file}-card`);
    await page.getByRole('button', { name: 'Practice', exact: true }).click();
  } else await card.getByRole('button', { name: 'Practice', exact: true }).click();
  const pic = page.locator('.qcard .visual svg').first();
  await pic.waitFor();
  await pic.evaluate(el => el.scrollIntoView({ block: 'center' }));
  await shot(page, `${file}-question`);
  await page.getByRole('button', { name: 'Why it works', exact: true }).click();
  await page.getByRole('dialog', { name: 'Why it works' }).waitFor();
  await shot(page, `${file}-why`);
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.locator('.pbar .btn', { hasText: 'Finish' }).click();
  await page.getByRole('button', { name: 'Back home', exact: true }).click();
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
  await page.getByRole('button', { name: 'Year 12', exact: true }).scrollIntoViewIfNeeded();
  await shot(page, 'phone-welcome-years');
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
  await page.getByText('Up next', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Peek', exact: true }).first().waitFor();
  await shot(page, 'phone-subject-numbers');
  await page.getByRole('button', { name: 'Peek', exact: true }).first().click();
  await page.getByText('further along the path').waitFor();
  await shot(page, 'phone-path-peek');
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('heading', { name: 'Numbers', exact: true }).waitFor();
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
  await page.getByRole('button', { name: 'Multiplying', exact: true }).click();
  await page.getByRole('heading', { name: 'Multiplying', exact: true }).waitFor();
  await page.getByText('Up next', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Peek', exact: true }).first().waitFor();
  await shot(page, 'phone-path-grade3');
  await page.getByRole('button', { name: 'Back' }).click();
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

  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('heading', { name: 'Puzzles', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('button', { name: 'Grade 1', exact: true }).click();
  await page.getByRole('heading', { name: 'Grade 1', exact: true }).waitFor();
  await shot(page, 'phone-grade1-home');

  await page.getByRole('button', { name: 'Adding', exact: true }).click();
  await page.getByRole('heading', { name: 'Adding', exact: true }).waitFor();
  await page.getByRole('heading', { name: 'Number line jumps', exact: true }).scrollIntoViewIfNeeded();
  await shot(page, 'phone-grade1-adding');
  await page.getByRole('button', { name: 'Jump to a ten', exact: true }).click();
  await page.locator('.game-choice').first().click();
  await page.locator('.why-card').waitFor();
  const jumpWhy = await page.locator('.why-card p').innerText();
  if (!/ten/i.test(jumpWhy)) throw new Error(`jump explanation was: ${jumpWhy}`);
  await page.locator('.why-card').scrollIntoViewIfNeeded();
  await shot(page, 'phone-grade1-jump');

  await page.getByRole('button', { name: 'See Number line jumps', exact: true }).click();
  await page.getByRole('heading', { name: 'Number line jumps', exact: true }).waitFor();
  await page.locator('.example .viz, .example .nline, .example svg').first().waitFor();
  await page.locator('.example').scrollIntoViewIfNeeded();
  await shot(page, 'phone-grade1-jump-skill');
  await page.getByRole('button', { name: 'Practice', exact: true }).click();
  await page.locator('.key[data-k="0"]').click();
  await page.locator('.key.check').click();
  await page.getByText('Not quite').waitFor();
  await page.locator('.key[data-k="0"]').click();
  await page.locator('.key.check').click();
  await page.getByText('Here is why').waitFor();
  const close = page.getByRole('button', { name: 'Close', exact: true });
  if (await close.count()) await close.click();
  await shot(page, 'phone-grade1-jump-why');
  await page.locator('.pbar .btn', { hasText: 'Finish' }).click();
  await page.getByRole('button', { name: 'Back home', exact: true }).click();

  await page.getByRole('button', { name: 'Measuring', exact: true }).click();
  await page.getByRole('button', { name: 'Read the clock', exact: true }).click();
  await page.locator('.game-choice').first().click();
  await page.locator('.why-card').waitFor();
  const clockWhy = await page.locator('.why-card p').innerText();
  if (!/hand|minute/i.test(clockWhy)) throw new Error(`clock explanation was: ${clockWhy}`);
  await page.locator('.why-card').scrollIntoViewIfNeeded();
  await shot(page, 'phone-grade1-clock');
  await page.getByRole('button', { name: 'Back', exact: true }).click();

  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('button', { name: 'Shapes', exact: true }).click();
  await page.getByRole('button', { name: 'Pieces together', exact: true }).click();
  await page.locator('.gvisual').waitFor();
  await shot(page, 'phone-grade1-shape');
  await page.locator('.game-choice').first().click();
  await page.locator('.why-card').waitFor();
  const shapeWhy = await page.locator('.why-card p').innerText();
  if (!/side/i.test(shapeWhy)) throw new Error(`shape explanation was: ${shapeWhy}`);
  await page.locator('.why-card').scrollIntoViewIfNeeded();
  await shot(page, 'phone-grade1-shape-why');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();

  await page.getByRole('button', { name: 'Grade 3', exact: true }).click();
  await page.getByRole('heading', { name: 'Grade 3', exact: true }).waitFor();
  await shot(page, 'phone-grade3-home');
  await page.getByRole('button', { name: 'Multiplying', exact: true }).click();
  await page.getByRole('button', { name: 'Split the rectangle', exact: true }).click();
  await page.locator('.gvisual').waitFor();
  await shot(page, 'phone-grade3-split');
  await page.locator('.game-choice').first().click();
  await page.locator('.why-card').waitFor();
  const splitWhy = await page.locator('.why-card p').innerText();
  if (!/multipl/i.test(splitWhy)) throw new Error(`split explanation was: ${splitWhy}`);
  await page.locator('.why-card').scrollIntoViewIfNeeded();
  await shot(page, 'phone-grade3-split-why');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();

  await page.getByRole('button', { name: 'Grade 4', exact: true }).click();
  await page.getByRole('heading', { name: 'Grade 4', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Fractions', exact: true }).click();
  await page.getByRole('button', { name: 'Which is greater', exact: true }).click();
  await page.locator('.gvisual').waitFor();
  await page.locator('.game-choice').first().click();
  await page.locator('.why-card').waitFor();
  const barWhy = await page.locator('.why-card p').innerText();
  if (!/piece/i.test(barWhy)) throw new Error(`fraction explanation was: ${barWhy}`);
  await page.locator('.gvisual').scrollIntoViewIfNeeded();
  await shot(page, 'phone-grade4-bars');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();

  await page.getByRole('button', { name: 'Grade 5', exact: true }).click();
  await page.getByRole('heading', { name: 'Grade 5', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Algebra', exact: true }).click();
  await page.getByRole('button', { name: 'What comes first', exact: true }).click();
  await page.locator('.gvisual').waitFor();
  await shot(page, 'phone-grade5-order');
  await page.locator('.game-choice').first().click();
  await page.locator('.why-card').waitFor();
  const orderWhy = await page.locator('.why-card p').innerText();
  if (!/multiply/i.test(orderWhy)) throw new Error(`order explanation was: ${orderWhy}`);
  await page.locator('.why-card').scrollIntoViewIfNeeded();
  await shot(page, 'phone-grade5-order-why');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();

  await page.getByRole('button', { name: 'Grade 6', exact: true }).click();
  await page.getByRole('heading', { name: 'Grade 6', exact: true }).waitFor();
  await shot(page, 'phone-grade6-home');
  await page.getByRole('button', { name: 'Ratios', exact: true }).click();
  await page.getByRole('button', { name: 'Same mix', exact: true }).click();
  await page.locator('.gvisual').waitFor();
  await shot(page, 'phone-grade6-mix');
  await page.locator('.game-choice').first().click();
  await page.locator('.why-card').waitFor();
  const mixWhy = await page.locator('.why-card p').innerText();
  if (!/mix/i.test(mixWhy)) throw new Error(`mix explanation was: ${mixWhy}`);
  await page.locator('.why-card').scrollIntoViewIfNeeded();
  await shot(page, 'phone-grade6-mix-why');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('button', { name: 'Algebra', exact: true }).click();
  await page.getByRole('button', { name: 'Keep it balanced', exact: true }).click();
  await page.locator('.gvisual').waitFor();
  await page.locator('.game-choice').first().click();
  await page.locator('.why-card').waitFor();
  const balWhy = await page.locator('.why-card p').innerText();
  if (!/both sides/i.test(balWhy)) throw new Error(`balance explanation was: ${balWhy}`);
  await page.locator('.gvisual').scrollIntoViewIfNeeded();
  await shot(page, 'phone-grade6-balance');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();

  await page.getByRole('button', { name: 'Grade 7', exact: true }).click();
  await page.getByRole('heading', { name: 'Grade 7', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Multiplying', exact: true }).click();
  await page.getByRole('button', { name: 'Two negatives', exact: true }).click();
  await page.locator('.gvisual').waitFor();
  await shot(page, 'phone-grade7-signs');
  await page.locator('.game-choice').first().click();
  await page.locator('.why-card').waitFor();
  const signWhy = await page.locator('.why-card p').innerText();
  if (!/positive/i.test(signWhy)) throw new Error(`sign explanation was: ${signWhy}`);
  await page.locator('.why-card').scrollIntoViewIfNeeded();
  await shot(page, 'phone-grade7-signs-why');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();

  await page.getByRole('button', { name: 'Grade 8', exact: true }).click();
  await page.getByRole('heading', { name: 'Grade 8', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Shapes', exact: true }).click();
  await page.getByRole('button', { name: 'Squares on the sides', exact: true }).click();
  await page.locator('.gvisual').waitFor();
  await shot(page, 'phone-grade8-squares');
  await page.locator('.game-choice').first().click();
  await page.locator('.why-card').waitFor();
  const sqWhy = await page.locator('.why-card p').innerText();
  if (!/square/i.test(sqWhy)) throw new Error(`squares explanation was: ${sqWhy}`);
  await page.locator('.why-card').scrollIntoViewIfNeeded();
  await shot(page, 'phone-grade8-squares-why');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();

  await page.getByRole('button', { name: 'Grade 9', exact: true }).scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Grade 9', exact: true }).click();
  await page.getByRole('heading', { name: 'Grade 9', exact: true }).waitFor();
  await page.getByRole('heading', { name: 'Grade 9', exact: true }).evaluate(el => el.scrollIntoView({ block: 'start' }));
  await shot(page, 'phone-grade9-home');
  const grade9 = await page.evaluate(() => JSON.parse(localStorage.getItem('mathlab.v3')));
  if (grade9.grade !== '9' || grade9.level !== 8 || grade9.name !== 'Ada') {
    throw new Error(`grade 9 did not stick: ${grade9.grade} ${grade9.level}`);
  }
  await page.getByRole('button', { name: 'Algebra', exact: true }).click();
  await page.getByRole('heading', { name: 'Straight lines', exact: true }).scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Practice', exact: true }).first().click();
  await page.locator('.visual').first().waitFor();
  await page.locator('.visual').first().scrollIntoViewIfNeeded();
  await shot(page, 'phone-grade9-line');
  await page.locator('.pbar .btn', { hasText: 'Finish' }).click();
  await page.getByRole('button', { name: 'Back home', exact: true }).click();

  await page.getByRole('button', { name: 'Puzzles', exact: true }).click();
  await page.getByRole('heading', { name: 'Puzzles', exact: true }).waitFor();
  await page.getByRole('button', { name: /Where they cross/ }).click();
  await page.locator('.gvisual').waitFor();
  await shot(page, 'phone-grade9-cross');
  await page.locator('.game-choice').first().click();
  await page.locator('.why-card').waitFor();
  const crossWhy = await page.locator('.why-card p').innerText();
  if (!/intercept/i.test(crossWhy)) throw new Error(`cross explanation was: ${crossWhy}`);
  await page.locator('.why-card').scrollIntoViewIfNeeded();
  await shot(page, 'phone-grade9-cross-why');
  await page.getByRole('button', { name: 'Back', exact: true }).click();

  await page.getByRole('button', { name: /The corner/ }).click();
  await page.locator('.gvisual').waitFor();
  await shot(page, 'phone-grade9-corner');
  await page.locator('.game-choice').first().click();
  await page.locator('.why-card').waitFor();
  const cornerWhy = await page.locator('.why-card p').innerText();
  if (!/corner/i.test(cornerWhy)) throw new Error(`corner explanation was: ${cornerWhy}`);
  await page.locator('.why-card').scrollIntoViewIfNeeded();
  await shot(page, 'phone-grade9-corner-why');
  await page.getByRole('button', { name: 'Back', exact: true }).click();

  await page.getByRole('button', { name: /Which grows faster/ }).click();
  await page.locator('.gvisual').waitFor();
  await shot(page, 'phone-grade9-growth');
  await page.locator('.game-choice').first().click();
  await page.locator('.why-card').waitFor();
  const growWhy = await page.locator('.why-card p').innerText();
  if (!/multiplying/i.test(growWhy)) throw new Error(`growth explanation was: ${growWhy}`);
  await page.locator('.why-card').scrollIntoViewIfNeeded();
  await shot(page, 'phone-grade9-growth-why');
  await page.getByRole('button', { name: 'Back', exact: true }).click();

  await page.getByRole('button', { name: /Closer to the curve/ }).click();
  await page.locator('.gvisual').waitFor();
  await shot(page, 'phone-grade9-secant');
  await page.locator('.game-choice').first().click();
  await page.locator('.why-card').waitFor();
  const secWhy = await page.locator('.why-card p').innerText();
  if (!/shorter/i.test(secWhy)) throw new Error(`secant explanation was: ${secWhy}`);
  await page.locator('.why-card').scrollIntoViewIfNeeded();
  await shot(page, 'phone-grade9-secant-why');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();

  await page.getByRole('button', { name: 'Grade 12', exact: true }).scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Grade 12', exact: true }).click();
  await page.getByRole('heading', { name: 'Grade 12', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Algebra', exact: true }).waitFor();
  await page.getByRole('heading', { name: 'Grade 12', exact: true }).evaluate(el => el.scrollIntoView({ block: 'start' }));
  await shot(page, 'phone-grade12-home');

  await methodShot(page, 'Grade 1', 'Adding', 'Number bonds', 'phone-bonds');
  await methodShot(page, 'Grade 3', 'Adding', 'Equal additions', 'phone-equal');
  await methodShot(page, 'Grade 3', 'Multiplying', 'Line multiplication', 'phone-lines');
  await methodShot(page, 'Grade 3', 'Multiplying', 'Lattice multiplication', 'phone-lattice');
  await methodShot(page, 'Kindergarten', 'Numbers', 'Five frames', 'phone-five');
  await methodShot(page, 'Kindergarten', 'Adding', 'Counting on', 'phone-counton');
  await methodShot(page, 'Grade 2', 'Adding', 'Compensation', 'phone-comp');
  await methodShot(page, 'Grade 2', 'Adding', 'Open number line', 'phone-open');
  await methodShot(page, 'Grade 4', 'Multiplying', 'Partial quotients', 'phone-partial');
  await methodShot(page, 'Grade 4', 'Fractions', 'Splitting fractions', 'phone-split');
  await methodShot(page, 'Grade 5', 'Numbers', 'Decimal shifts', 'phone-shift');
  await methodShot(page, 'Grade 6', 'Ratios', 'Cross multiplication', 'phone-cross');
  await methodShot(page, 'Grade 6', 'Ratios', 'The percent swap', 'phone-pct');
  await methodShot(page, 'Grade 9', 'Algebra', 'The AC method', 'phone-ac');
  await methodShot(page, 'Grade 9', 'Algebra', 'Difference of squares', 'phone-diff');

  await page.getByRole('button', { name: 'Kindergarten', exact: true }).click();

  const still = await page.evaluate(() => JSON.parse(localStorage.getItem('mathlab.v3')));
  if (still.grade !== 'K' || still.name !== 'Ada') throw new Error('progress was not kept');
  console.log('phone check ok');
} finally {
  await browser?.close();
  server.kill();
}
