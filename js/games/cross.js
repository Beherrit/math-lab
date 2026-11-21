// The crossing of two lines is one point. An intercept is the slip.
import { twoLines } from '../skills/level8/pics.js';
import { rule } from '../skills/level8/ask.js';

export const crossMeta = {
  id: 'g9cross',
  title: 'Where they cross',
  blurb: 'The shared point, not an intercept.',
  skill: 'l8system',
};

const PAIRS = [[1, 3], [1, 4], [2, 5], [2, 6], [3, 6], [3, 7]];

function nums(rng, right, slips) {
  const seen = new Set([String(right)]);
  const decoys = [];
  for (const s of slips) {
    const id = String(s);
    if (!seen.has(id)) { seen.add(id); decoys.push(id); }
  }
  let extra = Number(right) + 1;
  while (decoys.length < 3) {
    const id = String(extra);
    if (!seen.has(id)) { seen.add(id); decoys.push(id); }
    extra += 1;
  }
  return rng.shuffle([String(right), ...decoys.slice(0, 3)]).map(id => ({
    id, label: id, html: `<span class="gnum">${id}</span>`,
  }));
}

export function makeCross(rng) {
  const [p, q] = rng.pick(PAIRS);
  const b1 = q - p;
  const b2 = q - 2 * p;
  const why = `The lines meet at (${p}, ${q}), so x is ${p}. The intercepts ${b1} and ${b2} are where a line meets an axis, not the crossing.`;
  return {
    prompt: `${rule(1, b1)} and ${rule(2, b2)} cross. What is x?`,
    say: `Two lines cross. What is the x of the shared point?`,
    visual: twoLines(1, b1, 2, b2, p + 3),
    choices: nums(rng, p, [q, b1, b2, 0]),
    answer: String(p),
    why,
    facts: { m1: 1, b1, m2: 2, b2, p, q },
  };
}
