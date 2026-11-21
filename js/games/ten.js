// How many more fill the ten frame. The empty boxes are the answer.
import { tenFrame } from './draw.js';

export const tenMeta = {
  id: 'kten',
  title: 'Make ten',
  blurb: 'How many more fill the frame?',
  skill: 'l0pairs',
};

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

function nearby(need, rng) {
  const pool = [];
  for (let d = 1; d <= 4; d++) {
    if (need - d >= 0) pool.push(need - d);
    if (need + d <= 10) pool.push(need + d);
  }
  return rng.shuffle(pool).slice(0, 2);
}

export function makeTen(rng) {
  const filled = rng.int(1, 9);
  const need = 10 - filled;
  const nums = rng.shuffle([need, ...nearby(need, rng)]);
  const choices = nums.map(n => ({ id: String(n), label: WORDS[n], html: `<span class="gnum">${n}</span>` }));
  const why = `A ten frame holds ten. ${filled} ${filled === 1 ? 'box is' : 'boxes are'} full, so ${need} ${need === 1 ? 'box is' : 'boxes are'} empty. ${filled} and ${need} make ten.`;
  return {
    prompt: 'How many more make ten?',
    say: `How many more make ten? ${filled} are filled.`,
    visual: tenFrame(filled),
    choices,
    answer: String(need),
    why,
    facts: { filled, need },
  };
}
