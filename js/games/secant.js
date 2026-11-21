// A shorter secant is closer to the slope of the curve.
import { secantGraph } from '../skills/level8/pics.js';

export const secantMeta = {
  id: 'g9secant',
  title: 'Closer to the curve',
  blurb: 'A shorter step hugs the curve.',
  skill: 'l8secant',
};

const WORDS = [
  ['short', 'The shorter step'],
  ['long', 'The longer step'],
  ['same', 'They are the same'],
];

export function makeSecant(rng) {
  const h = rng.pick([2, 3]);
  const long = 2 + h;
  const choices = rng.shuffle(WORDS.map(([id, label]) => ({
    id, label, html: `<span class="gnum word">${label}</span>`,
  })));
  const why = `A step of 1 has slope 3. A step of ${h} has slope ${long}. The slope of the curve at that point is 2, so the shorter step is closer. The slope is not the average of the two heights.`;
  return {
    prompt: `On y = x², a step of ${h} has slope ${long} and a step of 1 has slope 3. Which is closer to the slope of the curve?`,
    say: `A longer step and a shorter step both cut the curve. Which slope is closer to the slope of the curve?`,
    visual: secantGraph(h),
    choices,
    answer: 'short',
    why,
    facts: { h },
  };
}
