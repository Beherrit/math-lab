// Partial quotients, and splitting a fraction into pieces of the same whole.
import { rnd, way, num, F } from '../../util.js';
import { skill } from './skill-def.js';
import { svg, box, label } from '../methods/pics.js';

const BLANK = '<span class="blank">?</span>';

function quotPic(tens, ones) {
  const cell = (x, t) => `${box(x, 28, 72, 44)}${label(x + 36, 56, t)}`;
  return svg(280, 100, 'two partial quotients', `${cell(24, tens)}${label(112, 56, '+', 'lab')}${cell(140, ones)}${label(150, 18, 'partial quotients', 'lab')}`);
}
function splitPic(d, a) {
  const w = 22;
  let s = '';
  for (let i = 0; i < d; i++) s += box(8 + i * (w + 4), 28, w, 36, i < a ? 'box' : 'box2');
  return svg(16 + d * (w + 4), 78, 'a fraction split into two groups', s + label(8 + (a * (w + 4)) / 2, 18, String(a), 'lab'));
}

const QUOT_ASK = [
  n => `Divide ${n.n} by ${n.d} with partial quotients.`,
  n => `How many groups of ${n.d} are in ${n.n}?`,
  n => `${n.n} ÷ ${n.d}. Take out easy chunks.`,
  n => `What is ${n.n} divided by ${n.d}?`,
];
function quotRow(L) {
  const d = rnd(2, L === 1 ? 6 : 9);
  let q = rnd(L === 1 ? 12 : 22, L === 1 ? 29 : L === 2 ? 48 : 86);
  if (q % 10 === 0) q += 1;
  const tens = Math.floor(q / 10) * 10, ones = q - tens;
  return { d, q, n: d * q, tens, ones };
}

export function genPartial(L) {
  const r = quotRow(L);
  const pic = quotPic(r.tens, r.ones);
  const used = r.d * r.tens, left = r.n - used;
  return {
    ask: QUOT_ASK[rnd(0, 3)](r), expr: `${r.n} ÷ ${r.d}`, visual: pic,
    answer: num(r.q), hint: 'Take out an easy number of tens first, then the ones that are left.',
    why: 'Each partial quotient is a chunk of the dividend, so you add the chunks.',
    ways: [
      way('Partial quotients', [pic, `${r.d} × ${r.tens} = ${used}.`, `${r.n} − ${used} = ${left}.`, `${r.d} × ${r.ones} = ${left}.`, `${r.tens} + ${r.ones} = ${r.q}.`]),
      way('Multiply back', [pic, `${r.q} groups of ${r.d} use the whole ${r.n}.`, `${r.d} × ${r.q} = ${r.n}.`]),
    ],
    _t: { kind: 'pquot', n: r.n, d: r.d },
  };
}

const SPLIT_ASK = [
  r => `${F(r.n, r.d)} = ${F(r.a, r.d)} + ${BLANK}/${r.d}`,
  r => `Split ${F(r.n, r.d)}. One piece is ${F(r.a, r.d)}. What is the other top number?`,
  r => `${r.n} pieces out of ${r.d}, and ${r.a} are already counted. How many pieces are left?`,
  r => `What top number finishes ${F(r.n, r.d)} minus ${F(r.a, r.d)}?`,
];
function splitRow(L) {
  const d = rnd(4, L === 1 ? 8 : L === 2 ? 12 : 16);
  const n = rnd(3, d - 1);
  const a = rnd(1, n - 1);
  const b = n - a;
  if (b === a) return null;
  return { d, n, a, b };
}

export function genSplit(L) {
  for (let i = 0; i < 40; i++) {
    const r = splitRow(L);
    if (!r) continue;
    const pic = splitPic(r.d, r.a);
    return {
      ask: SPLIT_ASK[rnd(0, 3)](r), expr: `${r.n}/${r.d} − ${r.a}/${r.d}`, visual: pic,
      answer: num(r.b), hint: 'The bottoms match, so the missing top is what is left of the top you started with.',
      why: 'The pieces are the same whole, so they add back to the fraction you started with.',
      ways: [
        way('Subtract the tops', [pic, `The whole is ${r.n} pieces out of ${r.d}.`, `${r.a} of those pieces are already counted.`, `${r.n} − ${r.a} = ${r.b}.`]),
        way('Add the pieces back', [pic, `${r.a} + ${r.b} = ${r.n}, and the bottom stays ${r.d}.`, `The missing top is ${r.b}.`]),
      ],
      _t: { kind: 'fsplit', n: r.n, a: r.a, d: r.d },
    };
  }
  throw new Error('split');
}

const CARD = why => ({ title: 'Why it works', why });
export const l3partial = skill('l3partial', 'Multiplying and dividing', '4.NBT.6', 'Partial quotients', 'Divide by taking out easy chunks', genPartial, {
  big: 'You do not have to find the whole quotient at once. Take out an easy chunk, then another, and add the chunks.',
  tips: ['An easy first chunk is a ten: 10 groups, 20 groups, 40 groups.', 'Subtract what those groups used, then look at what is left.', 'The quotient is the chunks added together, not the last chunk alone.', 'Check by multiplying the quotient by the divisor.'],
  words: [['partial quotient', 'one chunk of the answer'], ['dividend', 'the number being divided'], ['quotient', 'the answer to a division']],
  card: CARD('Each partial quotient is a chunk of the dividend, so adding the chunks gives the same quotient as dividing all at once.'),
});
export const l3fsplit = skill('l3fsplit', 'Fractions and decimals', '4.NF.3', 'Splitting fractions', 'Break one fraction into two pieces', genSplit, {
  big: 'A fraction can be split into two fractions with the same bottom. The tops add back to the top you started with.',
  tips: ['The bottom stays the same, because the pieces are the same size.', 'The two tops add to the top you started with.', '5/6 is 2/6 plus 3/6, not 2/6 plus 3/5.', 'Splitting is how you take a piece away from a fraction.'],
  words: [['split', 'break one fraction into two that add back to it'], ['numerator', 'the top number, how many pieces'], ['denominator', 'the bottom number, the size of each piece']],
  card: CARD('The pieces are the same whole cut into equal parts, so they add back to the fraction you started with.'),
});
