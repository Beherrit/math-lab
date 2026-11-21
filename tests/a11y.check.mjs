// Accessibility check at phone size. Fails on serious or critical axe findings.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';

const PORT = 8773;
const base = `http://127.0.0.1:${PORT}/`;
const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { stdio: 'ignore' });

async function ready() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(base);
      if (res.ok) return;
    } catch { /* still booting */ }
    await wait(100);
  }
  throw new Error('static server did not start');
}

function report(name, results) {
  const bad = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
  if (!bad.length) {
    console.log(`${name}: no serious or critical issues`);
    return;
  }
  const lines = bad.flatMap(v => [`${v.id} (${v.impact})`, ...v.nodes.slice(0, 4).map(n => `  ${n.html} :: ${n.failureSummary}`)]);
  throw new Error(`${name}\n${lines.join('\n')}`);
}

let browser;
try {
  await ready();
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(base);
  await page.getByRole('heading', { name: 'Math Lab' }).waitFor();
  report('welcome', await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze());

  await page.locator('#nm').fill('Ada');
  await page.getByRole('button', { name: 'Kindergarten', exact: true }).click();
  await page.getByRole('button', { name: /Let.s go/ }).click();
  await page.getByRole('heading', { name: 'Hi, Ada!' }).waitFor();
  report('home', await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze());

  await page.emulateMedia({ colorScheme: 'dark' });
  report('home dark', await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze());
  await page.emulateMedia({ colorScheme: 'light' });

  await page.getByRole('button', { name: 'Shapes', exact: true }).click();
  await page.getByRole('heading', { name: 'Shapes', exact: true, level: 1 }).waitFor();
  report('shapes', await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze());

  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('button', { name: 'Puzzles', exact: true }).click();
  await page.getByRole('heading', { name: 'Puzzles', exact: true }).waitFor();
  report('puzzles', await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze());
  console.log('axe check ok');
} finally {
  await browser?.close();
  server.kill();
}
