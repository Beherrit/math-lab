// Break-apart addition: move part of the second number to make a ten, or split off the tens.
import { rnd } from '../../util.js';
import { ask, problem, attempt } from '../methods/pack.js';
import { splitPic, areaPic } from '../methods/pics.js';

const FRAMES = [
  'Add {a} and {b} by breaking the second number apart.',
  'Make a friendlier pair. What is {a} + {b}?',
  '{a} plus {b}. Split one number, then add.',
  'Find {a} + {b} without counting every one.',
];
const SLIP = 'The pieces of the split are still the same total.';
const HINT = 'Move part of the second number onto the first until you make a ten, then add what is left.';

function pickAdd(L) {
  if (L === 1) {
    const a = rnd(6, 9), b = rnd(11 - a, 9);
    return { a, b, take: 10 - a, rest: b - (10 - a), how: 'ten' };
  }
  if (L === 2) {
    const a = rnd(21, 89), take = 10 - (a % 10);
    if (take < 1 || take > 8) return null;
    const rest = rnd(1, 9 - take);
    return { a, b: take + rest, take, rest, how: 'ten' };
  }
  const a = rnd(16, 70), tens = rnd(1, 3) * 10, ones = rnd(1, 9);
  return { a, b: tens + ones, take: tens, rest: ones, how: 'tens' };
}

export function genBreak(L) {
  return attempt(() => {
    const row = pickAdd(L);
    if (!row || row.rest < 1 || row.take < 1) return null;
    const { a, b, take, rest, how } = row;
    const value = a + b;
    if (value > (L === 1 ? 18 : 120)) return null;
    const q = ask(FRAMES, { a, b });
    const pic = splitPic(a, take, rest);
    const hint = how === 'ten' ? HINT : 'Split the second number into tens and ones, add the tens, then add the ones.';
    const made = how === 'ten' ? a + take : a + take;
    const step = how === 'ten'
      ? `${b} splits into ${take} and ${rest}. ${a} + ${take} makes ${made}, then ${rest} more.`
      : `${b} splits into ${take} and ${rest}. ${a} + ${take} is ${made}, then add ${rest}.`;
    return problem({
      ask: q, expr: `${a} + ${b}`, visual: pic, value, hint, slip: SLIP, t: { f: 'add', xs: [a, b] },
      methods: [
        { title: 'Break apart', steps: [pic, step] },
        { title: 'Area of the parts', steps: [areaPic([`${a}+${take}`, `+${rest}`]), 'Each piece is added once, so the total does not change.'] },
        { title: 'Why the total stays', steps: [pic, 'You only moved part of the second number onto the first. Nothing was created or lost.'] },
      ],
    });
  });
}

export const l1break = {
  id: 'l1break', level: 1, strand: 'Adding and subtracting', std: '1.OA.6, 2.NBT.5', title: 'Break apart to add',
  sub: 'Make a ten, or split off the tens', gen: genBreak, school: true,
  learn: {
    big: 'You can split one addend into two pieces and add the pieces one at a time. The total stays the same.',
    tips: ['To make a ten, split off just enough to fill the first number up to a ten.', 'Add that piece first, then add what is left of the second number.', 'A two-digit number can split into its tens and its ones.', 'Do not add a piece twice. It has already been used.'],
    words: [['break apart', 'split a number into two pieces that add back to it'], ['make a ten', 'fill one number up to a ten with part of the other']],
    card: { title: 'Why breaking apart works', why: 'You only moved some of the second number onto the first, so the total stays the same. Making a ten is a friendlier way to see that same total.' },
  },
};
