// Negative times negative. The pattern climbs past zero, so the product is positive.
import { fmt } from '../util.js';
import { signPattern } from '../skills/level6/visuals-lines.js';

export const signsMeta = {
  id: 'g7signs',
  title: 'Two negatives',
  blurb: 'The product climbs past zero.',
  skill: 'l6intmul',
};

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

export function makeSigns(rng) {
  const a = -rng.int(3, 6);
  const c = -rng.int(3, 6);
  const right = a * c;
  const slips = pad(right, [-right, a + c, Math.abs(a) + Math.abs(c)]);
  const nums = rng.shuffle([right, ...slips]);
  const choices = nums.map(n => ({ id: String(n), label: String(n), html: `<span class="gnum">${fmt(n)}</span>` }));
  const why = `Count down with ${fmt(c)}. Each product rises by ${Math.abs(c)}, so after zero the products are positive. ${fmt(a)} times ${fmt(c)} is ${right}. The negative answer ${fmt(-right)} is what you get if two minuses are treated as still negative.`;
  return {
    prompt: `What is ${fmt(a)} × ${fmt(c)}?`,
    say: `What is ${fmt(a)} times ${fmt(c)}? Two negatives make a positive.`,
    visual: signPattern(c),
    choices,
    answer: String(right),
    why,
    facts: { a, c, right },
  };
}
