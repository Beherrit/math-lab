// A fair spinner, the count you expect, and a real set of spins beside it.
import { four } from './pack.js';

export const spinMeta = {
  id: 'spin',
  title: 'Fair spins',
  blurb: 'Compare the guess and the spins.',
  skill: 'l6prob',
  levels: [5, 6, 7, 8],
};

const RED = '#9f1239';
const BLUE = '#1e40af';
const INK = '#241c16';

function wedge(i, total, on) {
  const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / total;
  const a1 = a0 + (2 * Math.PI) / total;
  const x0 = 70 + 58 * Math.cos(a0);
  const y0 = 70 + 58 * Math.sin(a0);
  const x1 = 70 + 58 * Math.cos(a1);
  const y1 = 70 + 58 * Math.sin(a1);
  const fill = on ? RED : BLUE;
  return `<path d="M70 70 L${x0.toFixed(1)} ${y0.toFixed(1)} A58 58 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${fill}" stroke="${INK}" stroke-width="2"/>`;
}

function picture(red, total, actual, spins) {
  let wheel = '';
  for (let i = 0; i < total; i++) wheel += wedge(i, total, i < red);
  const dots = Array.from({ length: spins }, (_, i) => {
    const x = 16 + (i % 8) * 22;
    const y = 168 + Math.floor(i / 8) * 22;
    return `<circle cx="${x}" cy="${y}" r="8" fill="${i < actual ? RED : BLUE}" stroke="${INK}"/>`;
  }).join('');
  return `<svg class="grow" viewBox="0 0 190 210" role="img" aria-label="spinner with ${red} red parts out of ${total}, and ${actual} red spins out of ${spins}"><g>${wheel}</g><circle cx="70" cy="70" r="6" fill="${INK}"/>${dots}</svg>`;
}

function setup(rng, level) {
  const mixes = level >= 7 ? [[1, 2], [1, 4], [3, 4], [1, 3], [2, 3]] : [[1, 2], [1, 4], [3, 4]];
  const [red, total] = rng.pick(mixes);
  const spins = total * rng.pick([3, 4]);
  const expect = spins * red / total;
  const shift = rng.pick([-2, -1, 1, 2]);
  let actual = expect + shift;
  if (actual < 0 || actual > spins || actual === expect) actual = expect === spins ? expect - 1 : expect + 1;
  return { red, total, spins, expect, actual };
}

export function makeSpin(rng, level = 5) {
  const fact = setup(rng, level);
  const slips = [fact.actual, fact.expect + 1, fact.expect - 1, fact.spins, 0]
    .filter(n => n >= 0 && n <= fact.spins && n !== fact.expect);
  const choices = four(rng, [fact.expect, ...slips].map(n => ({
    id: String(n),
    label: `${n} red`,
    html: `<span class="gnum">${n}</span>`,
  })));
  const why = `Red covers ${fact.red} of ${fact.total} equal parts, so you expect ${fact.expect} red spins out of ${fact.spins}. The spins shown landed on ${fact.actual} red. A fair experiment lands near that count. It does not have to match exactly.`;
  return {
    prompt: `About how many of ${fact.spins} spins should be red?`,
    say: `The spinner has ${fact.red} red parts out of ${fact.total}. About how many of ${fact.spins} spins should be red?`,
    visual: picture(fact.red, fact.total, fact.actual, fact.spins),
    choices,
    answer: String(fact.expect),
    why,
    facts: fact,
  };
}
