// Secant slopes crowding a curve, and rectangle estimates of area underneath.
import { rnd, pick, num } from '../../util.js';
import { secantGraph, underBars, lineGraph } from './pics.js';
import { wordChoice, problem } from './ask.js';

const SECANT = 'A secant slope uses two points on the curve. As the step shrinks, that slope moves toward the slope of the curve. It is not the average of the two heights.';
const AREA = 'A left rectangle uses the height at the left edge, so on a rising line it is short of the real area. A right rectangle is tall. The triangle sits between them.';

export function genSecant(L) {
  const h = L === 2 ? rnd(2, 3) : rnd(1, 3);
  const slope = 2 + h;
  const visual = secantGraph(h);
  if (L === 1) {
    return problem({
      ask: `The curve is y = x². What is the slope of the line from x = 1 to x = ${1 + h}?`,
      say: `The curve is y equals x squared. What is the slope of the line from x = 1 to x = ${1 + h}?`,
      visual, answer: num(slope),
      hint: 'Slope is the change in y divided by the step.', why: SECANT,
      t1: 'Rise over the step', steps: [`At x = 1, y = 1. At x = ${1 + h}, y = ${(1 + h) ** 2}.`, `The rise is ${(1 + h) ** 2 - 1} and the step is ${h}, so the slope is ${slope}.`],
      t2: 'Not the average height', steps2: [`The two heights are 1 and ${(1 + h) ** 2}.`, 'Their average is not the slope. The slope is the rise divided by the step.'],
    });
  }
  if (L === 2) {
    return problem({
      ask: `One secant uses a step of ${h} (slope ${slope}). Another uses a step of 1 (slope 3). Which is closer to the slope of the curve at x = 1?`,
      visual, answer: wordChoice('the shorter step', ['the longer step', 'they are the same', 'the higher point']),
      hint: 'The slope of the curve is what the secant approaches as the step shrinks.', why: SECANT,
      t1: 'The smaller step wins', steps: ['At x = 1 the curve itself has slope 2.', `Slope 3 is closer to 2 than slope ${slope} is.`],
      t2: 'Shorter means closer', steps2: [`The step of 1 is shorter than the step of ${h}.`, 'Shrinking the step moves the secant toward the curve.'],
    });
  }
  return problem({
    ask: `Steps of ${h} and 1 give secant slopes ${slope} and 3 on y = x² at x = 1. What number are those slopes moving toward?`,
    say: `Secant slopes ${slope} and 3 are moving toward the slope of y equals x squared at x = 1. What number is that?`,
    visual, answer: num(2),
    hint: 'Shrink the step all the way. The slopes are heading for the slope of the curve.', why: SECANT,
    t1: 'The limit of the secants', steps: ['Slope 3 comes from a step of 1. A still smaller step gets closer to 2.', 'The slopes move toward 2.'],
    t2: 'Not the average of the heights', steps2: ['Averaging the y values does not give this number.', '2 is the slope of the curve at that point.'],
  });
}

export function genArea(L) {
  const n = pick([2, 4]);
  const left = n * (n - 1) / 2;
  const right = n * (n + 1) / 2;
  const exact = n * n / 2;
  if (L === 1) {
    return problem({
      ask: `The line is y = x from 0 to ${n}. The rectangles use the height at the left edge. What is their total area?`,
      visual: underBars(n, 'left'), answer: num(left),
      hint: 'Add the left heights. The first one has height 0.', why: AREA,
      t1: 'Add the left heights', steps: [`The left heights are 0 through ${n - 1}.`, `Their sum is ${left}. Each rectangle is 1 wide.`],
      t2: 'Why it is short', steps2: ['Each left rectangle sits under the rising line.', `The triangle’s area is ${exact}, which is more than ${left}.`],
    });
  }
  if (L === 2) {
    return problem({
      ask: `The line is y = x from 0 to ${n}. The rectangles use the height at the right edge. What is their total area?`,
      visual: underBars(n, 'right'), answer: num(right),
      hint: 'Add the right heights. Each one is 1 taller than the left height.', why: AREA,
      t1: 'Add the right heights', steps: [`The right heights are 1 through ${n}.`, `Their sum is ${right}.`],
      t2: 'Why it is tall', steps2: ['Each right rectangle sticks out above the line.', `The triangle’s area is ${exact}, which is less than ${right}.`],
    });
  }
  return problem({
    ask: `The line is y = x from 0 to ${n}. What is the exact area of the triangle under it?`,
    visual: lineGraph(1, 0, n), answer: num(exact),
    hint: 'The triangle’s area is half of base times height.', why: AREA,
    t1: 'Half the square', steps: [`The base and the height are both ${n}.`, `${n} × ${n} ÷ 2 = ${exact}.`],
    t2: 'Between the rectangles', steps2: [`The left estimate is ${left} and the right estimate is ${right}.`, `The exact area ${exact} sits between them.`],
  });
}
