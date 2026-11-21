// The corner of the area model is a product. Adding the sides is the slip.
import { areaModel } from '../skills/level8/blocks.js';

export const cornerMeta = {
  id: 'g9corner',
  title: 'The corner',
  blurb: 'Multiply the sides. Do not add them.',
  skill: 'l8factor',
};

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

export function makeCorner(rng) {
  let a = rng.int(2, 5);
  let b = rng.int(2, 5);
  if (b === a) b = a === 5 ? 2 : a + 1;
  const right = a * b;
  const why = `The corner is ${a} times ${b}, which is ${right}. Adding the side numbers gives ${a + b}, and that sum is the middle strips, not the corner.`;
  return {
    prompt: `The rectangle is (x + ${a}) by (x + ${b}). What number belongs in the corner?`,
    say: `The rectangle is x plus ${a} by x plus ${b}. What number belongs in the corner?`,
    visual: areaModel(a, b),
    choices: nums(rng, right, [a + b, a, b]),
    answer: String(right),
    why,
    facts: { a, b },
  };
}
