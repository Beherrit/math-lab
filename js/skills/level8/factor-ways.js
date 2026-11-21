// The AC method, and a difference of squares drawn as a square with a piece removed.
import { rnd, num } from '../../util.js';
import { problem } from './ask.js';
import { svg, box, label } from '../methods/pics.js';

const AC_WHY = 'The pair multiplies to a times c and adds to the middle. Adding the pair is not the same as multiplying them.';
const DIFF_WHY = 'The middle terms cancel, so a square minus a square is not the square of the difference.';

function acPic(prod, sum) {
  const cell = (x, t, cap, tone) => `${box(x, 36, 72, 48, tone)}${label(x + 36, 66, t)}${label(x + 36, 24, cap, 'lab')}`;
  return svg(280, 110, 'a box for the AC method', `${cell(16, prod, 'product')}${cell(104, sum, 'sum', 'box2')}${cell(192, '?', 'pair')}`);
}
function diffPic(square) {
  return svg(250, 132, 'a square with a smaller square removed', [
    box(12, 8, 104, 104), label(64, 66, 'x²'),
    box(140, 20, 88, 88, 'box2'), label(184, 70, String(square)),
    label(184, 14, 'removed', 'lab'),
  ].join(''));
}

function acRow(L) {
  const p = rnd(2, 7);
  const q = rnd(p + 1, p + 6);
  const a = L === 1 ? 1 : rnd(2, 3);
  if ((p * q) % a) return null;
  const c = (p * q) / a, b = p + q, ans = L === 3 ? q : p;
  if ([a, b, c, p * q].includes(ans)) return null;
  return { a, b, c, p, q, ans };
}

export function genAc(L) {
  for (let i = 0; i < 50; i++) {
    const r = acRow(L);
    if (!r) continue;
    const pic = acPic(r.a * r.c, r.b);
    const which = L === 3 ? 'larger' : 'smaller';
    const poly = r.a === 1 ? `x squared + ${r.b}x + ${r.c}` : `${r.a}x squared + ${r.b}x + ${r.c}`;
    const ask = L === 1
      ? `Two numbers multiply to ${r.c} and add to ${r.b}. What is the smaller number?`
      : `For ${poly}, the AC product is ${r.a * r.c}. What is the ${which} of the two numbers that multiply to ${r.a * r.c} and add to ${r.b}?`;
    const pair = `${r.p} and ${r.q} multiply to ${r.p * r.q} and add to ${r.b}.`;
    return problem({
      ask, visual: pic, answer: num(r.ans), hint: 'Find two numbers with that product and that sum. Then pick the one the question asks for.',
      why: AC_WHY, t1: 'Find the pair', t2: 'Do not add the pair',
      steps: [pic, pair, `The ${which} number is ${r.ans}.`],
      steps2: [pic, `${r.p} + ${r.q} = ${r.b} is the sum, and ${r.p} × ${r.q} = ${r.p * r.q} is the product.`, `The ${which} number is ${r.ans}.`],
    });
  }
  throw new Error('ac');
}

export function genDiff(L) {
  const n = rnd(L === 1 ? 2 : L === 2 ? 4 : 6, L === 1 ? 8 : L === 2 ? 12 : 15);
  const square = n * n;
  const pic = diffPic(square);
  return problem({
    ask: `x squared minus ${square} equals (x minus ?) times (x plus ?). What number replaces the question mark?`,
    visual: pic, answer: num(n), hint: 'The removed piece is a square. What number times itself makes that area?',
    why: DIFF_WHY, t1: 'See the square', t2: 'Factor',
    steps: [pic, `${n} × ${n} = ${square}.`, `The missing number is ${n}.`],
    steps2: [pic, `x squared minus ${square} is (x minus ${n}) times (x plus ${n}).`, `The missing number is ${n}.`],
  });
}
