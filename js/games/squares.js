// The squares on the legs fill the square on the longest side. Adding the legs is the slip.
import { sideSquares } from '../skills/level7/shapes.js';

export const squaresMeta = {
  id: 'g8squares',
  title: 'Squares on the sides',
  blurb: 'Add the squares, not the sides.',
  skill: 'l7pyth',
};

const TRIPLES = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15]];

function pad(right, slips) {
  const out = [];
  const seen = new Set([right]);
  for (const n of slips) if (!seen.has(n)) { seen.add(n); out.push(n); }
  let extra = right + 1;
  while (out.length < 3) {
    if (!seen.has(extra)) { seen.add(extra); out.push(extra); }
    extra += 1;
  }
  return out.slice(0, 3);
}

export function makeSquares(rng) {
  const [a, c] = rng.pick(TRIPLES);
  const right = a * a + c * c;
  const slips = pad(right, [a + c, a * c, c * c, a * a]);
  const nums = rng.shuffle([right, ...slips]);
  const choices = nums.map(n => ({ id: String(n), label: String(n), html: `<span class="gnum">${n}</span>` }));
  const why = `The squares on the legs fill the square on the longest side: ${a} times ${a} plus ${c} times ${c} is ${right}. Adding the legs, ${a} + ${c}, is the path around the corner, not the area.`;
  return {
    prompt: `The legs are ${a} and ${c}. What is the area of the square on the longest side?`,
    say: `The legs are ${a} and ${c}. What is the area of the square on the longest side? Add the squares, not the sides.`,
    visual: sideSquares(`${a}²`, `${c}²`),
    choices,
    answer: String(right),
    why,
    facts: { a, c, right },
  };
}
