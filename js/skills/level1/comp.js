// Compensation: round one addend to a ten, then give the extra back.
import { rnd } from '../../util.js';
import { ask, problem, attempt } from '../methods/pack.js';
import { svg, box, label } from '../methods/pics.js';

const FRAMES = [
  'Add {a} and {b} by rounding {a} up to {ten}.',
  '{a} + {b}. Round {a} up, then give the extra back.',
  'Use compensation to add {a} + {b}.',
  'What is {a} + {b} if you first make {a} into {ten}?',
];
const HINT = 'Round up to the next ten, then take that extra off the other number.';
const SLIP = 'Rounding without putting the extra back changes the total, so the friendly sum is not the answer until you adjust.';

function compPic(a, up, b) {
  const ten = a + up, rest = b - up;
  const cell = (x, y, t, tone) => `${box(x, y, 58, 36, tone)}${label(x + 29, y + 24, t)}`;
  return svg(220, 110, 'rounding then adjusting', [
    cell(8, 8, a), label(80, 32, `+${up}`, 'lab'), cell(108, 8, ten, 'box2'),
    cell(8, 58, b), label(80, 82, `−${up}`, 'lab'), cell(108, 58, rest, 'box2'),
  ].join(''));
}

function row(L) {
  const a = L === 1 ? rnd(6, 9) : L === 2 ? rnd(22, 68) : rnd(31, 86);
  const up = (10 - (a % 10)) % 10;
  if (!up) return null;
  const bMax = (L === 1 ? 20 : L === 2 ? 99 : 160) - a;
  const b = rnd(up + 1, Math.max(up + 1, bMax));
  const value = a + b;
  if (value > (L === 1 ? 20 : L === 2 ? 120 : 200)) return null;
  return { a, b, up, value, ten: a + up, rest: b - up };
}

export function genComp(L) {
  return attempt(() => {
    const r = row(L);
    if (!r) return null;
    const pic = compPic(r.a, r.up, r.b);
    return problem({
      ask: ask(FRAMES, r), expr: `${r.a} + ${r.b}`, visual: pic, value: r.value, hint: HINT, slip: SLIP,
      t: { f: 'add', xs: [r.a, r.b] },
      methods: [
        { title: 'Round, then adjust', steps: [pic, `${r.a} + ${r.up} = ${r.ten}.`, `${r.b} − ${r.up} = ${r.rest}.`, `${r.ten} + ${r.rest} = ${r.value}.`] },
        { title: 'Give the extra back', steps: [pic, `You added ${r.up} to make ${r.ten}, so take ${r.up} off ${r.b}.`, `${r.ten} + ${r.rest} = ${r.value}.`] },
      ],
    });
  });
}

export const l1comp = {
  id: 'l1comp', level: 1, strand: 'Adding and subtracting', std: '2.NBT.5', title: 'Compensation',
  sub: 'Round, then give the extra back', gen: genComp, school: true,
  learn: {
    big: 'A ten is easier to add than a number just below it. Round up, then take that extra off the other addend so the total stays the same.',
    tips: ['47 + 29 is 50 + 26, because you moved 3 across.', 'You must give the extra back. 47 + 30 is one more than 47 + 29.', 'The same idea works for subtraction: 63 − 18 is 63 − 20, then put 2 back.', 'Check by adding the parts the long way once in a while.'],
    words: [['compensation', 'changing both numbers so the total stays the same'], ['round up', 'move to the next ten'], ['adjust', 'give back what you added extra']],
    card: { title: 'Why compensation works', why: 'You only borrowed a friendly number, so you must give that extra back, and the total stays the same.' },
  },
};
