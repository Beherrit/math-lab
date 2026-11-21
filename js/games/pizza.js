// Shade equal pieces of a pizza or a bar until the picture matches the fraction.
import { four } from './pack.js';

export const pizzaMeta = {
  id: 'pizza',
  title: 'Build the fraction',
  blurb: 'Shade the right pieces.',
  skill: 'l1shares',
  levels: [1, 2, 3, 4],
};

const INK = '#241c16';
const ON = '#e07a3d';
const OFF = '#fffdf9';

function dens(level) {
  if (level <= 1) return [4];
  if (level === 2) return [3, 6];
  if (level === 3) return [5, 8];
  return [6, 8, 10];
}

function pie(n, d) {
  let s = '';
  for (let i = 0; i < d; i++) {
    const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / d;
    const a1 = a0 + (2 * Math.PI) / d;
    const x0 = 60 + 52 * Math.cos(a0);
    const y0 = 60 + 52 * Math.sin(a0);
    const x1 = 60 + 52 * Math.cos(a1);
    const y1 = 60 + 52 * Math.sin(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const fill = i < n ? ON : OFF;
    s += `<path d="M60 60 L${x0.toFixed(1)} ${y0.toFixed(1)} A52 52 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${fill}" stroke="${INK}" stroke-width="2"/>`;
  }
  return `<svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="${n} of ${d} pizza pieces shaded">${s}</svg>`;
}

function bar(n, d) {
  const w = 22;
  let s = '';
  for (let i = 0; i < d; i++) {
    s += `<rect x="${i * w + 2}" y="8" width="${w - 4}" height="40" rx="4" fill="${i < n ? ON : OFF}" stroke="${INK}" stroke-width="2"/>`;
  }
  return `<svg viewBox="0 0 ${d * w + 2} 56" width="${Math.min(220, d * w)}" height="56" role="img" aria-label="${n} of ${d} bar pieces shaded">${s}</svg>`;
}

export function makePizza(rng, level = 1) {
  const d = rng.pick(dens(level));
  const n = rng.int(1, d - 1);
  const draw = level >= 3 ? bar : pie;
  const pool = [];
  for (let k = 1; k <= d; k++) if (k !== n) pool.push(k);
  const counts = [n, ...rng.shuffle(pool).slice(0, 3)];
  const choices = four(rng, counts.map(k => ({
    id: `${k}/${d}`,
    label: `${k} of ${d}`,
    html: draw(k, d),
  })));
  const why = `The whole is cut into ${d} equal pieces. Shading ${n} of them builds ${n}/${d}. A different number of shaded pieces is a different fraction.`;
  return {
    prompt: `Which picture shows ${n} of ${d}?`,
    say: `Which picture shows ${n} of ${d} equal pieces shaded?`,
    visual: draw(0, d),
    choices,
    answer: `${n}/${d}`,
    why,
    facts: { n, d },
  };
}
