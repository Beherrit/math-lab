// Number bonds: the missing part of a whole. The picture shows the whole and one part.
import { rnd } from '../../util.js';
import { ask, problem, attempt } from '../methods/pack.js';
import { bondPic } from '../methods/pics.js';

const FRAMES = [
  'What is the other part of {w}?',
  '{p} and what make {w}?',
  'The bond shows {w}. One part is {p}. Find the missing part.',
  'Split {w}. You already have {p}. What is left?',
];
const SLIP = 'The missing part is what is left of the whole.';
const HINT = 'The two parts add up to the whole. Take the part you can see away from the whole.';

function band(L) {
  if (L === 1) return [10, rnd(1, 9)];
  if (L === 2) { const w = rnd(11, 20); return [w, rnd(1, w - 1)]; }
  const w = rnd(21, 80); return [w, rnd(1, w - 1)];
}

export function genBonds(L) {
  return attempt(() => {
    const [w, p] = band(L);
    const value = w - p;
    const q = ask(FRAMES, { w, p });
    const pic = bondPic(w, p);
    return problem({
      ask: q, expr: `${w} − ${p}`, visual: pic, value, hint: HINT, slip: SLIP, t: { f: 'sub', a: w, b: p },
      methods: [
        { title: 'Number bond', steps: [pic, `The whole is ${w} and one part is ${p}. The other part is what is left.`] },
        { title: 'Count up', steps: [bondPic(w, p), `Start at ${p} and count up to ${w}. The count is the missing part.`] },
        { title: 'Take it away', steps: [pic, `${w} minus ${p} is the missing part, because the parts are the same whole.`] },
      ],
    });
  });
}

export const l1bonds = {
  id: 'l1bonds', level: 1, strand: 'Adding and subtracting', std: '1.OA.6', title: 'Number bonds',
  sub: 'The missing part of a whole', gen: genBonds, school: true,
  learn: {
    big: 'A number bond splits one whole into two parts. If you know the whole and one part, the other part is what is left.',
    tips: ['The two parts add back to the whole.', 'Cover one part and ask what is missing.', 'The missing part is the whole minus the part you can see.', 'A bond for 10 is the make-a-ten pair.'],
    words: [['number bond', 'a picture of a whole split into parts'], ['part', 'one piece of the whole'], ['whole', 'the full amount the parts make']],
    card: { title: 'Why the bond works', why: 'The two parts are one split of the same whole, so the missing part is what is left, not a new number beside the one you can see.' },
  },
};
