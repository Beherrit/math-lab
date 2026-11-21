// Square numbers on the diagonal of the multiplication table.
import { pick, b, way, num, choice, fmt as f } from '../../util.js';
import { timesGrid } from './tablepic.js';
import { mark } from './kit.js';

const SQUARES = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144];
const isSquare = n => Number.isInteger(Math.sqrt(n));

// The grid with a ? in the diagonal box of row n: what number belongs there?
export function gridSquareQ(n) {
  const max = Math.max(n + 1, 6), sq = Array.from({ length: n - 1 }, (_, i) => (i + 1) ** 2).join(', ');
  return { ask: mark('Look at the multiplication table. What number belongs in the box with the question mark?', 'square', n), visual: timesGrid(max, { diag: true, hide: n }), answer: num(n * n), _t: { f: 'gridsq', n, pic: true },
    hint: 'Read the row number and the column number of the box. The box is where they meet.',
    ways: [way('Row times column', [timesGrid(max, { diag: true, hide: n }), `The box is in row ${n} and column ${n}, so it holds ${n} × ${n}.`, `${n} × ${n} = ${b(n * n)}.`]),
      way('Follow the diagonal', [`The bold boxes run down the diagonal. They hold the square numbers ${sq}, and so on.`, `The one in row ${n} comes after ${n - 1} others, so it is ${b(n * n)}.`])] };
}
// Which one of these is a square number?
export function squareChoiceQ() {
  const right = pick(SQUARES.slice(2)), root = Math.sqrt(right), wrong = new Set();
  while (wrong.size < 3) { const w = right + pick([-9, -7, -5, -3, -2, -1, 1, 2, 3, 4, 6, 8, 11]); if (w > 3 && !isSquare(w)) wrong.add(w); }
  const lines = [...wrong].map(w => `${w} is between ${Math.floor(Math.sqrt(w)) ** 2} and ${(Math.floor(Math.sqrt(w)) + 1) ** 2}, so it is not a square.`);
  return { ask: 'Which of these is a square number (a number you get by multiplying a number by itself)?', answer: choice(String(right), [...wrong].map(String)), choiceBig: true, _t: { f: 'sqchoice' },
    hint: 'Try multiplying a number by itself. Which of the choices can you reach?',
    ways: [way('Test the choice that looks closest', [`${root} × ${root} = ${right}.`, `Multiplying ${root} by itself gives ${b(right)}, so it is a square number.`]), way('Rule out the others', [...lines, `That leaves ${b(right)}.`])] };
}
// What is the next square number after n x n? Squares grow by the next odd number each time.
export function nextSquareQ(n) {
  return { ask: `${f(n * n)} is a square number. What is the next square number after it?`, answer: num((n + 1) ** 2), _t: { f: 'nextsq', n: n * n }, hint: `${f(n * n)} is ${n} × ${n}. Which number do you multiply by itself next?`,
    ways: [way('The next number times itself', [`${f(n * n)} = ${n} × ${n}.`, `The next square is ${n + 1} × ${n + 1} = ${b(f((n + 1) ** 2))}.`]), way('Add the next odd number', [`Squares grow by 3, then 5, then 7, then 9... The jump from ${n} × ${n} is ${2 * n + 1}.`, `${f(n * n)} + ${2 * n + 1} = ${b(f((n + 1) ** 2))}.`])] };
}
// Use the square to get its neighbour: n x n, then n x (n + 1) is one more group of n.
export function neighbourQ(n) {
  return { ask: `${n} × ${n} = ${n * n}. Use that fact to work out ${n} × ${n + 1}.`, expr: `${n} × ${n + 1}`, answer: num(n * (n + 1)), _t: { f: 'mul', a: n, b: n + 1 },
    hint: `${n} × ${n + 1} is one more group of ${n} than ${n} × ${n}.`,
    ways: [way('One more group', [`${n} × ${n + 1} is ${n} × ${n} with one more group of ${n}.`, `${n * n} + ${n} = ${b(n * (n + 1))}.`]),
      way('Come down from the next square', [`${n + 1} × ${n + 1} = ${(n + 1) ** 2}.`, `Take away one group of ${n + 1}: ${(n + 1) ** 2} − ${n + 1} = ${b(n * (n + 1))}.`])] };
}
