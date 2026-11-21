// Straight lines and a system drawn as two graphs. Substitution is the second way.
import { rnd, pick, num } from '../../util.js';
import { lineGraph, twoLines } from './pics.js';
import { numChoice, problem, rule } from './ask.js';

const LINE = 'Slope is the rise over the run. The intercept is where the line crosses the upright axis, so it is not the slope and it is not the height at every x.';
const SYSTEM = 'The solution is the point on both lines. An intercept is where one line meets an axis. Substituting puts one rule inside the other instead of stopping at that intercept.';
const PAIRS = [[1, 3], [1, 4], [2, 5], [2, 6], [3, 6], [3, 7]];

export function genLine(L) {
  const m = rnd(1, 3);
  const b = rnd(0, 3);
  const text = rule(m, b);
  if (L === 1) {
    return problem({
      ask: `The line is ${text}. What is the slope?`,
      visual: lineGraph(m, b), answer: numChoice(m, [b, m + b, 0, 1]),
      hint: 'From one grid step to the next, count how far the line rises.', why: LINE,
      t1: 'Read the rule', steps: [`In y = mx + b, m is the slope and b is the intercept.`, `The slope here is ${m}.`],
      t2: 'Count on the grid', steps2: [`The line rises ${m} for every 1 step right.`, `Rise over run is ${m}, not the intercept ${b}.`],
    });
  }
  if (L === 2) {
    const x = rnd(2, 4);
    const y = m * x + b;
    return problem({
      ask: `The line is ${text}. What is y when x is ${x}?`,
      visual: lineGraph(m, b, Math.max(5, x)), answer: num(y),
      hint: 'Multiply the slope by x, then add the intercept.', why: LINE,
      t1: 'Use the rule', steps: [`${m} times ${x} is ${m * x}.`, `Add the intercept ${b}: y is ${y}.`],
      t2: 'Walk the graph', steps2: [`Start at height ${b} when x is 0.`, `${x} steps of rise ${m} land on ${y}.`],
    });
  }
  const run = rnd(2, 3);
  const y1 = m + b;
  const y2 = m * (1 + run) + b;
  return problem({
    ask: `A line passes through (1, ${y1}) and (${1 + run}, ${y2}). What is the slope?`,
    visual: lineGraph(m, b, 1 + run), answer: num(m),
    hint: 'Divide the change in y by the change in x.', why: LINE,
    t1: 'Rise over run', steps: [`The rise is ${y2} − ${y1} = ${y2 - y1}.`, `The run is ${run}. ${y2 - y1} / ${run} = ${m}.`],
    t2: 'Do not use the intercept', steps2: [`These points sit on ${text}.`, `The intercept is ${b}. The slope is ${m}.`],
  });
}

export function genSystem(L) {
  const [p, q] = pick(PAIRS);
  const b1 = q - p;
  const b2 = q - 2 * p;
  const visual = twoLines(1, b1, 2, b2, p + 3);
  const pair = `${rule(1, b1)} and ${rule(2, b2)}`;
  if (L === 1) {
    return problem({
      ask: `The lines are ${pair}. What is the x of the point where they cross?`,
      visual, answer: numChoice(p, [q, b1, b2, 0]),
      hint: 'The crossing is one point on both lines. An intercept is a different point.', why: SYSTEM,
      t1: 'Read the crossing', steps: [`Both lines pass through (${p}, ${q}).`, `The x there is ${p}.`],
      t2: 'Substitute', steps2: [`Set ${rule(1, b1)} equal to ${rule(2, b2)}.`, `Solving gives x = ${p}, not an intercept.`],
    });
  }
  if (L === 2) {
    return problem({
      ask: `The lines are ${pair}. What is the y of the point where they cross?`,
      visual, answer: num(q),
      hint: 'Find the shared point, then read its height.', why: SYSTEM,
      t1: 'Use either rule', steps: [`The lines meet at x = ${p}.`, `${rule(1, b1)} gives y = ${q}.`],
      t2: 'Check the other line', steps2: [`${rule(2, b2)} at x = ${p} is also ${q}.`, `The intercepts ${b1} and ${b2} are not that height.`],
    });
  }
  return problem({
    ask: `Substitute to solve ${pair}. What is x?`,
    visual, answer: num(p),
    hint: 'Replace y in the second rule with the first rule.', why: SYSTEM,
    t1: 'Put one rule inside the other', steps: [`From the first rule, y is x + ${b1}.`, `Then x + ${b1} = 2x + ${b2}, so x = ${p}.`],
    t2: 'See it on the graph', steps2: [`The marked point is the solution.`, `Its x is ${p}. Its y is ${q}.`],
  });
}
