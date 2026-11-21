// Polynomials, exponential growth beside a straight climb, and rational exponents.
import { rnd, pick, num, pow } from '../../util.js';
import { growChart, rootSquare, rightTri, termGroups, areaModel, powersRow } from './blocks.js';
import { numChoice, problem } from './ask.js';

const POLY = 'Adding polynomials adds the counts of matching powers. It does not add the powers themselves. The degree is the highest power, not how many terms there are.';
const GROW = 'Adding the same amount each time is a straight climb. Multiplying by the same number pulls away. Using 2 in both rules does not make them the same.';
const ROOT = 'A square root is the side of a square with that area. Half of the area is not the side. The root of a sum is not the sum of the roots.';
const SQUARES = [16, 36, 64];

export function genPoly(L) {
  if (L === 1) {
    const a = rnd(2, 6);
    const c = rnd(2, 6);
    const b = rnd(1, 4);
    const d = rnd(1, 4);
    return problem({
      ask: `Add ${a}x + ${b} and ${c}x + ${d}. How many x are there altogether?`,
      visual: termGroups(a, b, c, d), answer: num(a + c),
      hint: 'Add the x terms to each other. Add the plain numbers separately.', why: POLY,
      t1: 'Match the powers', steps: [`${a}x + ${c}x = ${a + c}x.`, `The plain numbers ${b} and ${d} stay out of that count.`],
      t2: 'Do not add the powers', steps2: [`Both terms are already x to the first power.`, `Adding them does not make x to a higher power.`],
    });
  }
  if (L === 2) {
    const a = rnd(2, 5);
    let b = rnd(2, 5);
    if (b === a) b = a === 5 ? 2 : a + 1;
    return problem({
      ask: `In (x + ${a})(x + ${b}), what is the plain number with no x?`,
      visual: areaModel(a, b), answer: num(a * b),
      hint: 'That number is the corner of the rectangle.', why: POLY,
      t1: 'Multiply the corners', steps: [`The last term is ${a} times ${b}.`, `${a} × ${b} = ${a * b}.`],
      t2: 'The middle is different', steps2: [`${a} + ${b} = ${a + b} is the number in front of x.`, `The plain number is the product.`],
    });
  }
  return problem({
    ask: `What is the degree of ${pow('5x', 4)} + 2x + 7?`,
    say: 'What is the degree of 5 x to the fourth plus 2 x plus 7?',
    visual: powersRow(), answer: numChoice(4, [3, 5, 2]),
    hint: 'The degree is the highest power you can see.', why: POLY,
    t1: 'Look at the highest power', steps: ['The powers are 4, 1 and 0.', 'The highest is 4.'],
    t2: 'Not the other counts', steps2: ['There are 3 terms, and 5 is the number in front.', 'Neither of those is the degree.'],
  });
}

export function genGrow(L) {
  const s = rnd(2, 4);
  const a = rnd(2, 4);
  const add = [0, 1, 2, 3].map(n => s + n * a);
  const mul = [0, 1, 2, 3].map(n => s * 2 ** n);
  const visual = growChart(add, mul);
  const ahead = s * 16 - (s + 4 * a);
  if (L === 1) {
    return problem({
      ask: 'At step 4, which list is larger?',
      visual, answer: numChoice('The multiplying list', ['The adding list', 'They are equal', 'The starting value']),
      hint: 'One list adds the same amount. The other multiplies by 2.', why: GROW,
      t1: 'Look one step past the picture', steps: [`The adding list grows by ${a} and reaches ${s + 4 * a}.`, `The multiplying list reaches ${s * 16}, which is larger.`],
      t2: 'Same 2, different rule', steps2: ['Adding 2 and multiplying by 2 are different rules.', 'Multiplying pulls away.'],
    });
  }
  if (L === 2) {
    return problem({
      ask: `The multiplying list starts at ${s} and doubles each step. What is step 4?`,
      visual, answer: num(s * 16),
      hint: 'Multiply by 2 four times. Do not add 2 four times.', why: GROW,
      t1: 'Keep doubling', steps: [`Step 3 on the picture is ${mul[3]}.`, `One more double is ${s * 16}.`],
      t2: 'Not the adding list', steps2: [`Adding ${a} four times ends at ${s + 4 * a}.`, `That is a different list.`],
    });
  }
  return problem({
    ask: 'At step 4, how much larger is the multiplying list than the adding list?',
    visual, answer: num(ahead),
    hint: 'Work out each list at step 4, then subtract.', why: GROW,
    t1: 'Subtract the two totals', steps: [`Multiplying ends at ${s * 16}. Adding ends at ${s + 4 * a}.`, `The gap is ${ahead}.`],
    t2: 'Why the gap opens', steps2: ['The adding list climbs in equal steps.', 'Doubling pulls further ahead each time.'],
  });
}

export function genRadical(L) {
  if (L === 3) {
    return problem({
      ask: 'A right triangle has legs 3 and 4. How long is the third side?',
      visual: rightTri(3, 4, '?'), answer: numChoice(5, [7, 25, 12]),
      hint: 'The third side is the root of the sum of the two squares, not the sum of the roots.', why: ROOT,
      t1: 'Add the areas, then take the root', steps: ['3² + 4² = 9 + 16 = 25.', 'The side is the square root of 25, which is 5.'],
      t2: 'Do not add the roots', steps2: ['The square root of 9 plus the square root of 16 is 3 + 4 = 7.', '7 is longer than the real side.'],
    });
  }
  const n = pick(SQUARES);
  const root = Math.round(Math.sqrt(n));
  if (L === 1) {
    return problem({
      ask: `A square has area ${n}. How long is one side?`,
      visual: rootSquare(n), answer: num(root),
      hint: 'Find the number that multiplies by itself to make the area.', why: ROOT,
      t1: 'What times itself', steps: [`${root} times ${root} is ${n}.`, `The side is ${root}.`],
      t2: 'Not half', steps2: [`Half of ${n} is ${n / 2}.`, 'Half the area is not the side of the square.'],
    });
  }
  return problem({
    ask: `What is ${n} to the power 1/2?`,
    visual: rootSquare(n), answer: numChoice(root, [n / 2, n, 1]),
    hint: 'A power of 1/2 means the square root, not half.', why: ROOT,
    t1: 'A half power is a root', steps: [`${n} to the power 1/2 means the side of a square with area ${n}.`, `That side is ${root}.`],
    t2: 'Half is a different question', steps2: [`Half of ${n} is ${n / 2}.`, `${root} times ${root} is the area, and half is not.`],
  });
}
