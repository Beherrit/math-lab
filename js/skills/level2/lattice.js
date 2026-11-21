// Lattice multiplication: each cell is a partial product, and each diagonal is one place.
import { rnd } from '../../util.js';
import { ask, problem, attempt } from '../methods/pack.js';
import { latticePic, areaPic } from '../methods/pics.js';

const FRAMES = [
  'Add the diagonals. What is {a} × {b}?',
  'The lattice shows {a} × {b}. What is the product?',
  'Read the diagonals to find {a} times {b}.',
  'Each cell is one partial product. Find {a} × {b}.',
];
const HINT = 'Add along each diagonal from the ones. Carry when a diagonal is 10 or more.';
const SLIP = 'Add along a diagonal, not across a row.';

function factors(L) {
  if (L === 1) return [10 + rnd(2, 4), rnd(2, 4)];
  if (L === 2) return [10 * rnd(1, 2) + rnd(2, 5), rnd(3, 6)];
  return [10 * rnd(2, 3) + rnd(1, 4), 10 + rnd(2, 4)];
}
const digits = n => String(n).split('').map(Number);
const cell = (p, q) => [Math.floor((p * q) / 10), (p * q) % 10];

function productOf(side, top, cells) {
  const sums = Array(side.length + top.length).fill(0);
  cells.forEach((row, r) => row.forEach((c, k) => {
    const place = (side.length - 1 - r) + (top.length - 1 - k);
    sums[place] += c[1];
    sums[place + 1] += c[0];
  }));
  let carry = 0;
  const out = [];
  for (const s of sums) { const v = s + carry; out.push(v % 10); carry = Math.floor(v / 10); }
  if (carry) out.push(carry);
  return out.reduce((p, d, i) => p + d * 10 ** i, 0);
}

export function genLattice(L) {
  return attempt(() => {
    const [a, b] = factors(L);
    const side = digits(a), top = digits(b);
    const cells = side.map(s => top.map(t => cell(s, t)));
    const value = productOf(side, top, cells);
    if (value !== a * b) return null;
    const pic = latticePic(top, side, cells);
    const pieces = [];
    side.forEach((s, r) => top.forEach((t, c) => pieces.push(`${s * 10 ** (side.length - 1 - r)}×${t * 10 ** (top.length - 1 - c)}`)));
    return problem({
      ask: ask(FRAMES, { a, b }), expr: `${a} × ${b}`, visual: pic, value, hint: HINT, slip: SLIP,
      t: { f: 'mul', a, b },
      methods: [
        { title: 'Lattice', steps: [pic, 'The tens digit of each cell sits above the diagonal and the ones digit below it. Add each diagonal, and carry.'] },
        { title: 'Area model', steps: [areaPic(pieces.slice(0, 3)), 'Each cell is one rectangle of the area model. Adding the rectangles gives the same product.'] },
        { title: 'Why the diagonal is a place', steps: [pic, 'A diagonal collects every digit of one place, so adding it is adding the ones, the tens or the hundreds.'] },
      ],
    });
  });
}

export const l2lattice = {
  id: 'l2lattice', level: 2, strand: 'Multiplying and dividing', std: '4.NBT.5', title: 'Lattice multiplication',
  sub: 'Partial products on the diagonals', gen: genLattice, school: true,
  learn: {
    big: 'A lattice gives each pair of digits its own cell. The diagonal splits that cell into tens and ones, and each diagonal is one place.',
    tips: ['Write one factor across the top and the other down the side.', 'In each cell, the tens digit goes above the diagonal and the ones digit below it.', 'Add the digits along each diagonal, starting from the ones.', 'Carry to the next diagonal when a sum is 10 or more.'],
    words: [['lattice', 'a grid with a diagonal in each cell'], ['partial product', 'the product of one digit from each factor'], ['diagonal', 'a slanted line that collects one place']],
    card: { title: 'Why the lattice works', why: 'Each cell is one partial product and each diagonal collects one place, so adding a diagonal is adding ones, tens or hundreds. It is the area model drawn on a slant.' },
  },
};
