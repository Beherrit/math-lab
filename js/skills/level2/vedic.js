// Vedic shortcuts: multiply a two-digit number by 11, and square a number ending in 5.
import { rnd } from '../../util.js';
import { ask, problem, attempt } from '../methods/pack.js';
import { elevenPic, squarePic, areaPic } from '../methods/pics.js';

const BY11 = [
  'Use the neighbor sum. What is {n} × 11?',
  'What is 11 times {n}?',
  'Multiply {n} by 11 with the digits side by side.',
  'Find {n} × 11 without eleven jumps.',
];
const SQUARE = [
  'What is {n} squared?',
  'Find {n} × {n}. The number ends in 5.',
  'Square {n}. The ending is 25. What is the front?',
  '{n} times itself. What is the product?',
];
const HINT11 = '11 is 10 + 1. Shift the number one place and add it again, or add each pair of neighbors.';
const HINT5 = 'Multiply the tens digit by one more than itself, then write 25 on the end.';

function by11(L) {
  if (L === 1) { const d = rnd(2, 9); return { n: d, a: 0, b: d, mid: '?', value: 11 * d }; }
  const a = rnd(1, 8);
  const b = L === 2 ? rnd(1, 9 - a) : rnd(Math.max(1, 10 - a), 9);
  if (L === 3 && a + b < 10) return null;
  return { n: 10 * a + b, a, b, mid: `${a}+${b}`, value: (10 * a + b) * 11 };
}

export function genEleven(L) {
  return attempt(() => {
    const row = by11(L);
    if (!row) return null;
    const parts = row.a ? [row.a, row.mid, row.b] : [row.b, '?'];
    const pic = elevenPic(parts);
    const neighbor = row.a
      ? `The outside digits stay ${row.a} and ${row.b}. The middle is ${row.a} + ${row.b}. If that sum is 10 or more, carry 1 to the first digit.`
      : `Write ${row.b} twice, because 11 times a one-digit number is that digit in both places.`;
    return problem({
      ask: ask(BY11, row), expr: `${row.n} × 11`, visual: pic, value: row.value, hint: HINT11,
      slip: 'The middle digit is the sum of the neighbors, not the whole answer.',
      t: { f: 'mul', a: row.n, b: 11 },
      methods: [
        { title: 'Neighbor sum', steps: [pic, neighbor] },
        { title: 'Shift and add', steps: [areaPic([row.n, `${row.n}0`]), 'Times 10 shifts the number, times 1 keeps it, and 11 is those two added.'] },
        { title: 'Why the neighbors add', steps: [pic, 'The shifted copy sits one place to the left, so each middle column is a digit from each copy.'] },
      ],
    });
  });
}

export function genFive(L) {
  return attempt(() => {
    const t = rnd(L === 1 ? 1 : L === 2 ? 4 : 7, L === 1 ? 3 : L === 2 ? 6 : 9);
    const n = 10 * t + 5;
    const value = 100 * t * (t + 1) + 25;
    const pic = squarePic(t);
    return problem({
      ask: ask(SQUARE, { n }), expr: `${n} × ${n}`, visual: pic, value, hint: HINT5,
      slip: 'The front is the tens digit times one more, not the tens digit squared.',
      t: { f: 'mul', a: n, b: n },
      methods: [
        { title: 'Ends in 5', steps: [pic, `${t} times ${t + 1} is the front. Write 25 after it.`] },
        { title: 'Area model', steps: [areaPic([`${t * 10}×${t * 10}`, '25']), `${n} is ${t * 10} + 5. The corner 5 × 5 is 25, and the front lands on hundreds.`] },
        { title: 'Why the ending is 25', steps: [pic, '5 times 5 is 25, and every other part of the square is a whole number of hundreds, so the last two digits stay 25.'] },
      ],
    });
  });
}

const card11 = { title: 'Why times 11 works', why: '11 is 10 + 1, so the number shifted one place plus itself lines the digits up. Each middle digit is the sum of its neighbors, and a sum of 10 or more carries one to the next place.' };
const card5 = { title: 'Why the square trick works', why: 'A number ending in 5 is ten times its tens digit, plus 5, so its square is 100 times that digit times one more, plus 25. The front is that product and the ending is always 25.' };

export const l2eleven = {
  id: 'l2eleven', level: 2, strand: 'Multiplying and dividing', std: '3.NBT.3', title: 'Multiply by 11',
  sub: 'The neighbor-sum trick', gen: genEleven, school: true,
  learn: {
    big: '11 is 10 + 1. The digits of the number stay on the outside, and each middle digit is the sum of its two neighbors.',
    tips: ['For a one-digit number, write the digit twice: 4 × 11 = 44.', 'For two digits, the middle is the sum of the two digits.', 'If the neighbors add to 10 or more, write the ones digit and carry 1 to the front.', 'The same product is the number plus the number shifted one place.'],
    words: [['neighbor sum', 'the two digits next to each other, added for the middle place'], ['carry', 'the extra ten moved to the next place']],
    card: card11,
  },
};

export const l2five = {
  id: 'l2five', level: 2, strand: 'Multiplying and dividing', std: '4.NBT.5', title: 'Squares ending in 5',
  sub: 'Tens digit times one more, then 25', gen: genFive, school: true,
  learn: {
    big: 'To square a number ending in 5, multiply the tens digit by one more than itself, then write 25 on the end.',
    tips: ['15 squared: 1 × 2 is 2, then 25, so 225.', '25 squared: 2 × 3 is 6, then 25, so 625.', 'The ending is always 25, because 5 × 5 = 25.', 'The front is not the tens digit squared. It is the tens digit times the next whole number.'],
    words: [['square', 'a number times itself'], ['tens digit', 'the digit in the tens place']],
    card: card5,
  },
};
