// Quadratics: the area model for a product, and the turning point of a parabola.
import { rnd, num } from '../../util.js';
import { parabola } from './pics.js';
import { areaModel, cornerGap } from './blocks.js';
import { numChoice, wordChoice, problem } from './ask.js';

const FACTOR = 'The corner of the rectangle is the product of the two side numbers. Adding those numbers builds the middle strips, not the corner.';
const VERTEX = 'The turning point of y = (x − h)² + k is (h, k). The number inside moves the curve sideways. Completing the square fills a corner that is h times h, not 2h.';

function pair() {
  const a = rnd(2, 5);
  let b = rnd(2, 5);
  if (b === a) b = a === 5 ? 2 : a + 1;
  return [a, b];
}

export function genFactor(L) {
  const [a, b] = pair();
  const visual = areaModel(a, b);
  if (L === 1) {
    return problem({
      ask: `The rectangle is (x + ${a}) by (x + ${b}). What number is the corner?`,
      visual, answer: num(a * b),
      hint: 'The corner is the product of the two side numbers.', why: FACTOR,
      t1: 'Multiply the sides', steps: [`The corner is ${a} times ${b}.`, `${a} × ${b} = ${a * b}.`],
      t2: 'Do not add', steps2: [`${a} + ${b} = ${a + b} is the middle strips added together.`, `The corner is the product ${a * b}.`],
    });
  }
  if (L === 2) {
    return problem({
      ask: `In (x + ${a})(x + ${b}), what is the number in front of x?`,
      visual, answer: num(a + b),
      hint: 'Add the two strips that have an x in them.', why: FACTOR,
      t1: 'Add the strips', steps: [`One strip is ${a}x and the other is ${b}x.`, `Together that is ${a + b}x.`],
      t2: 'Keep the corner separate', steps2: [`The corner ${a * b} has no x.`, `It is not the number in front of x.`],
    });
  }
  const right = `(x + ${a})(x + ${b})`;
  return problem({
    ask: `Which product matches the rectangle?`,
    visual, answer: wordChoice(right, [`(x + ${a + b})(x + 1)`, `(x + ${a * b})`, `x² + ${a + b}`]),
    hint: 'Each side of the rectangle is x plus one of the numbers.', why: FACTOR,
    t1: 'Read the sides', steps: [`One side is x + ${a}. The other is x + ${b}.`, `The product is ${right}.`],
    t2: 'The corner checks it', steps2: [`The corner is ${a} × ${b} = ${a * b}.`, `That is the last term when you multiply.`],
  });
}

export function genVertex(L) {
  const h = rnd(1, 3);
  let k = rnd(0, 4);
  if (k === h) k = (h + 2) % 5;
  const shown = `y = (x − ${h})² + ${k}`;
  if (L === 1) {
    return problem({
      ask: `For ${shown}, what is the x of the turning point?`,
      visual: parabola(h, k), answer: numChoice(h, [k, `−${h}`, 0]),
      hint: 'The number subtracted inside the parentheses is the sideways move.', why: VERTEX,
      t1: 'Read h', steps: [`The rule is (x − h)² + k with h = ${h} and k = ${k}.`, `The turning point has x = ${h}.`],
      t2: 'Not the height', steps2: [`${k} is the height of the turning point.`, `It does not move the curve sideways.`],
    });
  }
  if (L === 2) {
    return problem({
      ask: `For ${shown}, what is the height of the turning point?`,
      visual: parabola(h, k), answer: num(k),
      hint: 'The number added outside the parentheses is the height.', why: VERTEX,
      t1: 'Read k', steps: [`Outside the parentheses, the rule adds ${k}.`, `The turning point is (${h}, ${k}).`],
      t2: 'Not the sideways move', steps2: [`${h} moves the curve sideways.`, `The height is ${k}.`],
    });
  }
  return problem({
    ask: `What number fills the missing corner of x² + ${2 * h}x?`,
    say: `What number fills the missing corner of x squared plus ${2 * h} x?`,
    visual: cornerGap(h), answer: num(h * h),
    hint: 'The missing corner is a square whose side is half of the middle number.', why: VERTEX,
    t1: 'Half the middle, then square it', steps: [`Half of ${2 * h} is ${h}.`, `${h} times ${h} is ${h * h}.`],
    t2: 'See the square', steps2: [`The picture is a square of side x + ${h}, with the corner missing.`, `That corner is ${h * h}, so x² + ${2 * h}x + ${h * h} = (x + ${h})².`],
  });
}
