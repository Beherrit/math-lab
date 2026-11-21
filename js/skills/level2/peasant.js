// Russian peasant multiplication: halve one factor, double the other, keep the odd rows.
import { rnd } from '../../util.js';
import { ask, problem, attempt } from '../methods/pack.js';
import { peasantPic, areaPic } from '../methods/pics.js';

const FRAMES = [
  'Keep the odd rows. What is {a} × {b}?',
  'Double and halve to find {a} × {b}.',
  'Cross out the even rows. What do the kept doubles add up to for {a} × {b}?',
  'Use the halving table to find {a} times {b}.',
];
const HINT = 'Halve the first number and double the second. Cross out a row when the halved number is even, then add the doubles you kept.';
const SLIP = 'Skip the even rows. They are already inside the next row.';

function chain(a, b) {
  const rows = [];
  let x = a, y = b;
  while (x >= 1) { rows.push({ left: x, right: y, keep: x % 2 === 1 }); x = Math.floor(x / 2); y *= 2; }
  return rows;
}
function usable(rows) {
  const kept = rows.filter(r => r.keep);
  return kept.length >= 2 && rows.some(r => !r.keep);
}

export function genPeasant(L) {
  return attempt(() => {
    const a = L === 1 ? rnd(5, 9) : L === 2 ? rnd(11, 19) : rnd(21, 31);
    const b = L === 1 ? rnd(3, 9) : L === 2 ? rnd(4, 12) : rnd(6, 15);
    const rows = chain(a, b);
    if (!usable(rows)) return null;
    const value = rows.filter(r => r.keep).reduce((s, r) => s + r.right, 0);
    if (value !== a * b) return null;
    const pic = peasantPic(rows);
    const kept = rows.filter(r => r.keep).map(r => r.right).join(' + ');
    return problem({
      ask: ask(FRAMES, { a, b }), expr: `${a} × ${b}`, visual: pic, value, hint: HINT, slip: SLIP,
      t: { f: 'mul', a, b },
      methods: [
        { title: 'Double and halve', steps: [pic, `Keep the rows marked keep: ${kept}.`] },
        { title: 'Area model', steps: [areaPic([`${a} by ${b}`]), 'The rectangle is the same product. The table only slices that rectangle into doubles.'] },
        { title: 'Why the even rows go', steps: [pic, 'Halving one factor and doubling the other keeps the product. An even row is already inside the next odd row, so you add it only once.'] },
      ],
    });
  });
}

export const l2peasant = {
  id: 'l2peasant', level: 2, strand: 'Multiplying and dividing', std: '4.NBT.5', title: 'Double and halve',
  sub: 'Russian peasant multiplication', gen: genPeasant, school: true,
  learn: {
    big: 'Halve one factor and double the other, row by row. Cross out every even row, then add the doubles you kept.',
    tips: ['Write the first number in a column and keep halving. Drop the remainder when it is odd.', 'Double the second number on every row.', 'Cross out a row when the halved number is even.', 'Add the doubles that are left. That sum is the product.'],
    words: [['halve', 'take half, dropping a remainder'], ['double', 'multiply by 2'], ['keep', 'an odd row, whose double is part of the product']],
    card: { title: 'Why double and halve works', why: 'Halving one factor and doubling the other keeps the same product, so the crossed-out even rows are already inside the next row. The odd rows are the pieces of the first factor, and their doubles add to the product.' },
  },
};
