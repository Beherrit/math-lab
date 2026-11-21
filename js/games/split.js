// A rectangle cut in two. Both parts are multiplied, not just the first.
import { twoRects } from '../skills/level2/rectpics.js';

export const splitMeta = {
  id: 'g3split',
  title: 'Split the rectangle',
  blurb: 'Both parts get multiplied.',
  skill: 'l2props',
};

const expr = (h, s, t) => `${h} × ${s} + ${h} × ${t}`;

export function makeSplit(rng) {
  const h = rng.int(2, 4);
  const s = rng.int(2, 5);
  const t = rng.int(2, 5);
  const right = expr(h, s, t);
  const slips = [`${h} × ${s} + ${t}`, `${h} + ${s} × ${t}`, `${h} × ${s} × ${t}`].filter(x => x !== right);
  const texts = rng.shuffle([right, ...slips]);
  const choices = texts.map(text => ({ id: text, label: text, html: `<span class="gnum expr">${text}</span>` }));
  const why = `The rectangle is ${h} tall, so there are ${h} rows. One part is ${s} wide and the other is ${t} wide. Each part is a full set of rows, so both widths are multiplied by ${h}: ${right}. Adding the second width on its own leaves those rows out.`;
  return {
    prompt: 'Which expression matches the rectangle?',
    say: `Which expression matches the rectangle? It is ${h} tall, split into ${s} and ${t}.`,
    visual: twoRects(s, t, h),
    choices,
    answer: right,
    why,
    facts: { h, s, t, right },
  };
}
