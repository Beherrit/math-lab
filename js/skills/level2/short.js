// Short division: the remainder of one digit becomes tens of the next digit.
import { rnd, pick } from '../../util.js';
import { ask, problem, attempt } from '../methods/pack.js';
import { shortPic, areaPic } from '../methods/pics.js';

const FRAMES = [
  'Divide each digit. What is {n} ÷ {d}?',
  'Use short division to find {n} ÷ {d}.',
  '{d} into {n}. Carry a remainder to the next digit. What is the quotient?',
  'What is {n} divided by {d}?',
];
const HINT = 'Divide one digit at a time. A remainder moves in front of the next digit, because it is worth tens there.';
const SLIP = 'A remainder is not dropped, and it is not part of the quotient.';

function exact(L) {
  if (L === 1) {
    const d = rnd(2, 5);
    const tens = pick([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(t => t % d === 0));
    const ones = pick([0, 2, 3, 4, 5, 6, 7, 8, 9].filter(o => o % d === 0));
    return { n: tens * 10 + ones, d };
  }
  const d = rnd(L === 2 ? 2 : 3, L === 2 ? 6 : 8);
  const q = rnd(L === 2 ? 12 : 24, L === 2 ? 24 : 70);
  const n = d * q;
  if (L === 2 && (n < 20 || n > 99)) return null;
  if (L === 3 && (n < 100 || n > 560)) return null;
  const first = Number(String(n)[0]);
  if (first % d === 0) return null;
  return { n, d };
}
function carryOf(n, d) {
  const digits = String(n).split('').map(Number);
  let rem = 0;
  for (let i = 0; i < digits.length - 1; i++) {
    rem = (rem * 10 + digits[i]) % d;
    if (rem) return { index: i + 1, value: rem };
  }
  return null;
}

export function genShort(L) {
  return attempt(() => {
    const row = exact(L);
    if (!row || row.n % row.d !== 0) return null;
    const value = row.n / row.d;
    const digits = String(row.n).split('').map(Number);
    const carry = L === 1 ? null : carryOf(row.n, row.d);
    if (L > 1 && !carry) return null;
    const pic = shortPic(row.d, digits, carry);
    const note = carry
      ? `The remainder ${carry.value} moves in front of the next digit.`
      : 'Each digit divides exactly, so nothing has to be carried.';
    return problem({
      ask: ask(FRAMES, row), expr: `${row.n} ÷ ${row.d}`, visual: pic, value, hint: HINT, slip: SLIP,
      t: { f: 'div', a: row.n, b: row.d },
      methods: [
        { title: 'Short division', steps: [pic, note] },
        { title: 'Missing factor', steps: [areaPic([`${row.d} × ?`, String(row.n)]), `${row.d} times the quotient gives ${row.n} back.`] },
        { title: 'Why the remainder moves', steps: [pic, 'A remainder is leftover ones of that place. The next place is worth ten of them, so they sit in front of the next digit.'] },
      ],
    });
  });
}

export const l2short = {
  id: 'l2short', level: 2, strand: 'Multiplying and dividing', std: '4.NBT.6', title: 'Short division',
  sub: 'Carry the remainder to the next digit', gen: genShort, school: true,
  learn: {
    big: 'Short division works one digit at a time. A remainder is leftover ones, and it becomes tens of the next digit.',
    tips: ['Start at the first digit. How many times does the divisor fit, and what is left over?', 'Write the leftover in front of the next digit, then divide that new number.', 'The remainder is always smaller than the divisor.', 'Check by multiplying the quotient by the divisor.'],
    words: [['remainder', 'what is left after the divisor fits as many times as it can'], ['quotient', 'the answer to a division'], ['carry', 'move a remainder in front of the next digit']],
    card: { title: 'Why the remainder moves', why: 'A remainder is leftover ones of that place, so it becomes tens of the next place. You carry it in front of the next digit because the next place is worth ten of those ones.' },
  },
};
