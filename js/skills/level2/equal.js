// Subtraction by equal additions: add the same amount to both numbers so the gap stays put.
import { rnd } from '../../util.js';
import { ask, problem, attempt } from '../methods/pack.js';
import { equalPic, gapPic } from '../methods/pics.js';

const FRAMES = [
  'What is {a} − {b}? Add the same amount to both.',
  'Find the difference {a} − {b} by sliding both numbers up.',
  '{a} minus {b}. Make the smaller number end in zero.',
  'The gap between {a} and {b} is the difference. What is it?',
];
const SLIP = 'Adding to only one number changes the gap.';
const HINT = 'Add the same amount to both numbers so the smaller one ends in zero. The difference stays the same.';

function pair(L) {
  const b = L === 1 ? rnd(3, 9) : L === 2 ? rnd(12, 70) : rnd(24, 240);
  if (b % 10 === 0) return null;
  const add = 10 - (b % 10);
  const a = b + (L === 1 ? rnd(2, 9) : L === 2 ? rnd(3, 28) : rnd(5, 80));
  return { a, b, add };
}

export function genEqual(L) {
  return attempt(() => {
    const row = pair(L);
    if (!row) return null;
    const { a, b, add } = row;
    const value = a - b;
    if (value <= 0 || a + add === value || b + add === value || add === value) return null;
    if (L === 1 && a > 30) return null;
    if (L === 2 && a > 99) return null;
    if (L === 3 && a > 400) return null;
    const pic = equalPic(a, b, add);
    return problem({
      ask: ask(FRAMES, row), expr: `${a} − ${b}`, visual: pic, value, hint: HINT, slip: SLIP,
      t: { f: 'sub', a, b },
      methods: [
        { title: 'Equal additions', steps: [pic, `Add ${add} to both. ${a + add} − ${b + add} is the same gap.`] },
        { title: 'Count up', steps: [gapPic(b, a), `Count from ${b} up to ${a}. That count is the difference.`] },
        { title: 'Why the gap stays', steps: [pic, 'Both numbers slide up by the same amount, so the space between them does not change.'] },
      ],
    });
  });
}

export const l2equal = {
  id: 'l2equal', level: 2, strand: 'Adding and subtracting', std: '3.NBT.2', title: 'Equal additions',
  sub: 'Add the same amount to both numbers', gen: genEqual, school: true,
  learn: {
    big: 'If you add the same amount to both numbers, the difference does not change. Choose the amount that makes the smaller number end in zero.',
    tips: ['Look at the ones of the smaller number. Add enough to reach the next ten.', 'Add that same amount to the bigger number too.', 'Subtract the two new numbers. The gap is the answer.', 'Adding to only one number changes the gap. Both must move.'],
    words: [['equal additions', 'adding the same amount to both numbers in a subtraction'], ['difference', 'the gap between two numbers']],
    card: { title: 'Why equal additions work', why: 'Adding the same amount to both numbers slides them together, so the gap between them stays the same. The difference does not change.' },
  },
};
