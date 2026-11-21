// Graphing equivalent ratios: pairs from a ratio table are points, and they all sit on one straight line through (0, 0).
import { rnd, pick, fmt, b, way, num, choice, point, plane, table } from '../../util.js';
import { T, MIXES, coprime, ratio } from './helpers.js';
import { ratioPlane } from './draw.js';

const P = (x, y) => `(${x}, ${y})`;
// A ratio a:bb whose pairs stay on a 10 by 10 grid for at least `batches` batches.
function pair(batches, top = 5) {
  for (;;) { const [a, bb] = coprime(1, top); if (Math.max(a, bb) * batches <= 10) return [a, bb]; }
}
const maxBatch = (a, bb) => Math.floor(10 / Math.max(a, bb));
const intro = mx => `${mx.what}: on the grid, x counts the ${mx.a} and y counts the ${mx.b}.`;
const dots = (a, bb, js) => js.map(j => ({ x: j * a, y: j * bb }));
const step = (a, bb) => `Each step along the line is ${a} across and ${bb} up.`;

function tap(byY) {
  const mx = pick(MIXES), [a, bb] = pair(3), j = rnd(3, maxBatch(a, bb)), shown = byY ? j * bb : j * a;
  return T({ story: intro(mx), ask: `Tap the point for the row of the ratio table where ${b(byY ? 'y' : 'x')} is ${b(shown)}.`, visual: table(['x', 'y'], [[a, bb], [2 * a, 2 * bb]]) + plane({ interactive: true, pts: dots(a, bb, [1, 2]).map(p => ({ ...p, cls: 'given' })) }), answer: point(j * a, j * bb),
    ways: [way('Scale the row', [`The table rows are ${P(a, bb)} and ${P(2 * a, 2 * bb)}. They grow by the same factor.`, byY ? `y = ${shown} is ${j} times ${bb}, so x is ${j} times ${a}: ${a} × ${j} = ${a * j}.` : `x = ${shown} is ${j} times ${a}, so y is ${j} times ${bb}: ${bb} × ${j} = ${bb * j}.`, `Tap ${b(P(j * a, j * bb))}.`]),
      way('Follow the line', [`The grey points ${P(a, bb)} and ${P(2 * a, 2 * bb)} lie on a straight line from (0, 0).`, `${step(a, bb)} Keep stepping until ${byY ? 'y' : 'x'} is ${shown}.`, `You land on ${b(P(j * a, j * bb))}.`])],
    hint: byY ? 'How many times bigger is y than in the first row? x grows by the same factor.' : 'How many times bigger is x than in the first row? y grows by the same factor.' }, 'rgTap', { a, b: bb, j, byY });
}
// Read a value off the line. Step 1 plots every batch; later steps plot only the first and last, so the child reads the line.
function read(L, fromY) {
  const mx = pick(MIXES), [a, bb] = pair(3, L === 1 ? 3 : 5), m = maxBatch(a, bb), j = rnd(2, Math.max(2, L === 1 ? m : m - 1)), js = L === 1 ? Array.from({ length: m }, (_, i) => i + 1) : [1, m];
  const given = fromY ? j * bb : j * a, ans = fromY ? j * a : j * bb, [gl, al] = fromY ? ['y', 'x'] : ['x', 'y'];
  return T({ story: intro(mx), ask: `Use the line. What is ${b(al)} when ${b(gl)} is ${b(given)}?`, visual: ratioPlane({ lines: [{ x: m * a, y: m * bb }], pts: dots(a, bb, js) }), answer: num(ans),
    ways: [way('Read the graph', [`Find ${given} on the ${gl}-axis. Go ${fromY ? 'across' : 'up'} to the line, then ${fromY ? 'down' : 'across'} to the ${al}-axis.`, `You reach ${b(ans)}.`]),
      way('Use the ratio', [`Points on the line follow one pattern. ${step(a, bb)}`, `${given} is ${j} times ${fromY ? bb : a}, so ${al} is ${j} times ${fromY ? a : bb}: ${j} × ${fromY ? a : bb} = ${b(ans)}`])],
    hint: `Find ${given} on the ${gl}-axis, then follow the grid to the line.` }, fromY ? 'rgReadX' : 'rgRead', { a, b: bb, v: given });
}
function onLine() {
  const mx = pick(MIXES), [a, bb] = pair(3), m = maxBatch(a, bb), j = rnd(2, m + 3), good = P(j * a, j * bb);
  return T({ story: intro(mx), ask: 'Which point is also on the line?', visual: ratioPlane({ lines: [{ x: m * a, y: m * bb }], pts: dots(a, bb, [1]) }), answer: choice(good, [P(j * a, j * bb + 1), P(j * bb, j * a), P(j * a + 1, j * bb)]), choiceBig: true,
    ways: [way('Check the ratio', [`The dot shows ${P(a, bb)}, so y is always ${bb} for every ${a} of x.`, `${good}: ${j * a} is ${a} × ${j}, and ${j * bb} is ${bb} × ${j}. Both grow by ${j}, so ${b(good)} is on the line.`]),
      way('Test each point', [`A point is on the line when x and y grow by the same factor from ${P(a, bb)}.`, `The other choices change x and y by different amounts, or swap them, so they are off the line. Only ${b(good)} fits.`])],
    hint: 'Every point on the line has the same ratio as the dot. Multiply both numbers of the dot by the same number.' }, 'rgPairs', { a, b: bb });
}
function unit(frac) {
  const mx = pick(MIXES);
  for (;;) {
    const x = rnd(2, 5), rate = frac ? pick([0.5, 1.5, 2.5]) : rnd(2, 5), y = rate * x;
    if (!Number.isInteger(y) || y > 10) continue;
    return T({ story: intro(mx), ask: `The line passes through ${b(P(x, y))}. How many ${mx.b} go with each 1 of the ${mx.a}?`, visual: ratioPlane({ lines: [{ x, y }], pts: [{ x, y }] }), answer: num(rate),
      ways: [way('Divide', [`The dot says ${x} of x go with ${y} of y.`, `For 1 of x, share y equally: ${y} ÷ ${x} = ${b(fmt(rate))}`]),
        way('Shrink the ratio', [`${ratio(x, y)} means ${x} of x for ${y} of y. Divide both by ${x} to get 1 of x.`, `${ratio(1, fmt(rate))}, so each 1 of x goes with ${b(fmt(rate))} of y.`])],
      hint: 'Per 1 means divide both numbers of the dot by the x number.' }, 'rgUnit', { x, y });
  }
}
function compare(close) {
  const mx = pick(MIXES), pairs = [];
  while (pairs.length < 2) { const p = pair(2, 5), r = p[1] / p[0]; if (!pairs.some(q => Math.abs(q[1] / q[0] - r) < (close ? 0.12 : 0.3) || (q[0] === p[0] && q[1] === p[1]))) pairs.push(p); }
  const [[a1, b1], [a2, b2]] = pairs, win = b1 / a1 > b2 / a2 ? 'A' : 'B', ms = [maxBatch(a1, b1), maxBatch(a2, b2)];
  const lo = win === 'A' ? [a2, b2] : [a1, b1], hi = win === 'A' ? [a1, b1] : [a2, b2];
  return T({ story: intro(mx), ask: `Line A and line B show two mixes. Which mix uses more of the ${mx.b} for every 1 of the ${mx.a}?`, visual: ratioPlane({ lines: [{ x: ms[0] * a1, y: ms[0] * b1, label: 'A' }, { x: ms[1] * a2, y: ms[1] * b2, label: 'B' }] }), answer: choice(win, [], { all: ['A', 'B'] }), choiceBig: true,
    ways: [way('Compare at the same x', [`Pick one value of x and go up to both lines. The line that is higher has more y for that x.`, `The higher line is ${b(win)}: it climbs ${hi[1]} for every ${hi[0]}, while the other climbs ${lo[1]} for every ${lo[0]}.`]),
      way('Steeper means more', [`For each 1 across, a steeper line goes up further.`, `Line ${b(win)} is the steeper one, so it uses more of the ${mx.b} for each 1 of the ${mx.a}.`])],
    hint: 'Look at both lines above the same x value. Which one is higher?' }, 'rgCompare', { a1, b1, a2, b2 });
}
function rule(L) {
  const mx = pick(MIXES), [a, bb] = pair(2, 5), m = maxBatch(a, bb), j = rnd(2, m), x = j * a, y = j * bb;
  return T({ story: intro(mx), ask: `The line passes through ${b(P(x, y))}. What is the ratio of x to y in simplest form?`, visual: ratioPlane({ lines: [{ x: m * a, y: m * bb }], pts: [{ x, y }] }), answer: choice(ratio(a, bb), [ratio(bb, a), ratio(x, y), ratio(a, bb + 1)]), choiceBig: true,
    ways: [way('Simplify the point', [`The ratio of x to y is ${ratio(x, y)}.`, `Both numbers divide by ${j}: ${x} ÷ ${j} = ${a} and ${y} ÷ ${j} = ${bb}, so the simplest form is ${b(ratio(a, bb))}.`]),
      way('Find the smallest dot', [`The first dot on the line, one batch, is the one with the smallest whole numbers: ${P(a, bb)}.`, `x comes first, so the ratio is ${b(ratio(a, bb))}. The order matters: ${ratio(bb, a)} would be y to x.`])],
    hint: `A ratio of x to y puts x first. Divide both numbers by the largest number that goes into both.` }, 'rgRule', { x, y });
}
function batches() {
  const mx = pick(MIXES), [a, bb] = pair(3), m = maxBatch(a, bb), j = rnd(3, m);
  return T({ story: intro(mx), ask: `One batch is the point ${b(P(a, bb))}. How many batches is the point ${b(P(j * a, j * bb))}?`, visual: ratioPlane({ lines: [{ x: j * a, y: j * bb }], pts: [{ x: a, y: bb, cls: 'given' }, { x: j * a, y: j * bb }] }), answer: num(j),
    ways: [way('Divide x', [`One batch has ${a} of x. The new point has ${j * a}.`, `${j * a} ÷ ${a} = ${b(j)} batches`]),
      way('Divide y', [`One batch has ${bb} of y. The new point has ${j * bb}.`, `${j * bb} ÷ ${bb} = ${b(j)} batches, the same answer, because both numbers grow together.`])],
    hint: 'How many times does the x number of one batch go into the x number of the new point?' }, 'rgBatch', { a, b: bb, j });
}
const SHAPES = { 1: [() => tap(false), () => read(1, false), onLine, () => unit(false), batches], 2: [() => tap(false), () => read(2, false), () => read(2, true), () => compare(false), onLine, () => rule(2)], 3: [() => tap(true), () => read(3, true), () => compare(true), () => unit(true), () => rule(3), onLine] };
export const genRatioGraph = L => pick(SHAPES[L])();
