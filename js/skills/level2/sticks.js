// Japanese line multiplication: crossings in each place are that place's part of the product.
import { rnd } from '../../util.js';
import { ask, problem, attempt } from '../methods/pack.js';
import { stickPic, areaPic } from '../methods/pics.js';

const FRAMES = [
  'Each crossing is one. What is {a} × {b}?',
  'Count the crossings by place. Find {a} × {b}.',
  'The lines show {a} and {b}. What is the product?',
  'Use the line picture to find {a} times {b}.',
];
const SLIP = 'Count crossings by place. Ones with ones are ones, not hundreds.';
const HINT = 'Count the crossings in each place, then add those places.';

function factors(L) {
  if (L === 1) { const a = rnd(2, 5), b = rnd(2, 5); return { a, b, ht: 0, ho: a, vt: 0, vo: b }; }
  if (L === 2) { const ht = rnd(1, 2), ho = rnd(1, 4), b = rnd(2, 4); return { a: ht * 10 + ho, b, ht, ho, vt: 0, vo: b }; }
  const ht = rnd(1, 2), ho = rnd(1, 3), vt = rnd(1, 2), vo = rnd(1, 3);
  return { a: ht * 10 + ho, b: vt * 10 + vo, ht, ho, vt, vo };
}
const groups = (t, o) => (t ? [t, o] : [o]);

function places(ht, ho, vt, vo) {
  const o = ho * vo, t = ht * vo + ho * vt, h = ht * vt;
  const ones = o % 10, t2 = t + Math.floor(o / 10), tens = t2 % 10, hundreds = h + Math.floor(t2 / 10);
  return { o, t, h, product: hundreds * 100 + tens * 10 + ones };
}

export function genSticks(L) {
  return attempt(() => {
    const f = factors(L);
    const got = places(f.ht, f.ho, f.vt, f.vo);
    if (got.product !== f.a * f.b) return null;
    const pic = stickPic(groups(f.ht, f.ho), groups(f.vt, f.vo));
    const story = f.ht === 0 && f.vt === 0
      ? `There are ${f.a} lines one way and ${f.b} the other. Each pair crosses once.`
      : `Ones crossings: ${got.o}. Tens crossings: ${got.t}. Hundreds crossings: ${got.h}. Carry when a place is 10 or more.`;
    const parts = f.ht ? [`${f.ht * 10}×${f.b}`, `${f.ho}×${f.b}`] : [`${f.a} rows`, `${f.b} each`];
    return problem({
      ask: ask(FRAMES, f), expr: `${f.a} × ${f.b}`, visual: pic, value: got.product, hint: HINT, slip: SLIP,
      t: { f: 'mul', a: f.a, b: f.b },
      methods: [
        { title: 'Line crossings', steps: [pic, story] },
        { title: 'Area model', steps: [areaPic(parts), 'The same product is a rectangle split into the tens part and the ones part.'] },
        { title: 'Why a crossing counts', steps: [pic, 'A crossing of two ones lines is one. A tens line crossed with a ones line is ten. Tens crossed with tens is a hundred.'] },
      ],
    });
  });
}

export const l2sticks = {
  id: 'l2sticks', level: 2, strand: 'Multiplying and dividing', std: '4.NBT.5', title: 'Line multiplication',
  sub: 'Japanese line crossings', gen: genSticks, school: true,
  learn: {
    big: 'Draw lines for each digit and count the crossings. A crossing is one of that place: ones, tens or hundreds.',
    tips: ['One group of lines stands for the tens digit, the next group for the ones.', 'Ones lines crossing ones lines are ones. A tens line in either group makes tens. Two tens lines make a hundred.', 'If a place has 10 or more crossings, carry to the next place.', 'Keep the digits small in the picture so the crossings can be counted.'],
    words: [['crossing', 'the point where two lines meet, worth one of that place'], ['place', 'ones, tens or hundreds']],
    card: { title: 'Why the lines work', why: 'Each crossing is one of that place, so ones crossed with ones make ones, tens crossed with ones make tens, and tens crossed with tens make hundreds.' },
  },
};
