// A mark on a grid. Across is the first number, up is the second.
import { four } from './pack.js';

export const treasureMeta = {
  id: 'treasure',
  title: 'Treasure hunt',
  blurb: 'Across first, then up.',
  skill: 'coord',
  levels: [4, 5, 6, 7],
};

const INK = '#241c16';

export function point(x, y) {
  return `(${x}, ${y})`;
}

function grid(x, y, hi) {
  const cell = 32;
  const pad = 26;
  const w = pad + (hi + 1) * cell;
  let s = '';
  for (let i = 0; i <= hi; i++) {
    const gx = pad + i * cell;
    const gy = pad + (hi - i) * cell;
    s += `<line x1="${gx}" y1="${pad}" x2="${gx}" y2="${w - 4}" stroke="#d9cbb8" stroke-width="2"/>`;
    s += `<line x1="${pad}" y1="${gy}" x2="${w - 4}" y2="${gy}" stroke="#d9cbb8" stroke-width="2"/>`;
    s += `<text x="${gx}" y="16" text-anchor="middle" font-size="12" fill="${INK}">${i}</text>`;
    s += `<text x="12" y="${gy + 4}" text-anchor="middle" font-size="12" fill="${INK}">${i}</text>`;
  }
  const cx = pad + x * cell;
  const cy = pad + (hi - y) * cell;
  s += `<circle cx="${cx}" cy="${cy}" r="9" fill="#9a3412"/>`;
  return `<svg class="grow" viewBox="0 0 ${w} ${w}" role="img" aria-label="grid with a mark at ${x}, ${y}">${s}</svg>`;
}

function near(x, y, hi) {
  const spots = [[y, x], [Math.min(hi, x + 1), y], [x, Math.min(hi, y + 1)], [Math.max(0, x - 1), y], [x, Math.max(0, y - 1)]];
  return spots.filter(([a, b]) => a !== x || b !== y);
}

export function makeTreasure(rng, level = 4) {
  const hi = level >= 6 ? 8 : 5;
  const x = rng.int(0, hi);
  const y = rng.int(0, hi);
  const slips = [];
  for (const [a, b] of near(x, y, hi)) {
    const id = point(a, b);
    if (!slips.includes(id)) slips.push(id);
  }
  const choices = four(rng, [point(x, y), ...slips].map(id => ({
    id, label: id, html: `<span class="gnum">${id}</span>`,
  })));
  const why = `Across comes first, then up. The mark is ${x} across and ${y} up, so the point is ${point(x, y)}. Reading the up number first lands on a different point.`;
  return {
    prompt: 'Which point is the mark?',
    say: `The mark is ${x} across and ${y} up. Which point is that?`,
    visual: grid(x, y, hi),
    choices,
    answer: point(x, y),
    why,
    facts: { x, y },
  };
}
