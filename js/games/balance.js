// A two-pan balance. Undo the add on both pans, not on one.
import { balance } from '../skills/level5/visuals.js';

export const balanceMeta = {
  id: 'g6balance',
  title: 'Keep it balanced',
  blurb: 'Undo the step on both pans.',
  skill: 'l5eq',
};

function pad(right, slips) {
  const out = [];
  const seen = new Set([String(right)]);
  for (const n of slips) {
    const s = String(n);
    if (!seen.has(s)) { seen.add(s); out.push(s); }
  }
  let extra = right + 1;
  while (out.length < 3) {
    const s = String(extra);
    if (!seen.has(s)) { seen.add(s); out.push(s); }
    extra += 1;
  }
  return out.slice(0, 3);
}

export function makeBalance(rng) {
  const a = rng.int(2, 9);
  const x = rng.int(2, 12);
  const c = x + a;
  const slips = pad(x, [c + a, c, a]);
  const nums = rng.shuffle([String(x), ...slips]);
  const choices = nums.map(n => ({ id: n, label: n, html: `<span class="gnum">${n}</span>` }));
  const why = `The scale holds x + ${a} on one side and ${c} on the other. Take ${a} off both sides: x = ${c} − ${a} = ${x}. Adding ${a} again, or taking it off one side only, tips the scale.`;
  return {
    prompt: 'What is x?',
    say: `What is x, if x plus ${a} equals ${c}? Take ${a} off both sides.`,
    visual: balance(`x + ${a}`, String(c)),
    choices,
    answer: String(x),
    why,
    facts: { a, c, x },
  };
}
