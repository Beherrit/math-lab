// Slope-intercept form y = mx + b: read m and b, find points on the line, say what the numbers mean.
import { rnd, pick, chance, b, way, fmt, num, point, choice, table } from '../../util.js';
import { eqn, lin, term, plus, par, pt, nz, yesNo, count, subst, substChain, substSteps, startPlus } from './h.js';
import { grid } from './draw.js';
import { matchGraph, fromTwoPoints } from './line-graphs.js';

const coefs = L => (L === 1 ? [rnd(1, 9), rnd(1, 9)] : [nz(-9, 9), chance(0.15) ? 0 : nz(-9, 9)]);
const rowsFor = (m, c, xs) => xs.map(x => [fmt(x), fmt(m * x + c)]);
function readPart(L) {
  const [m, c] = coefs(L), wantM = chance(0.5), flip = m > 0 && c !== 0 && chance(0.3), shown = flip ? `y = ${fmt(c)} + ${term(m)}` : eqn(m, c);
  return { ask: wantM ? 'What is the slope of this line?' : 'What is the y-intercept of this line? (The y-value where it crosses the y-axis.)', expr: shown, answer: num(wantM ? m : c, { signed: L > 1 }),
    hint: wantM ? 'The slope is the number multiplying x.' : 'The y-intercept is the value of y when x is 0.', _t: { k: 'line', m, c, ask: wantM ? 'm' : 'b' },
    ways: [way('Match it to y = mx + b', [`In y = mx + b, m multiplies x and b stands alone. Here that is ${eqn(m, c)}${m === 1 || m === -1 ? `, and ${term(m)} means ${m === 1 ? 'one' : 'minus one'} x` : ''}.`, c === 0 && !wantM ? 'Nothing is added, so b is 0.' : `m = ${fmt(m)} and b = ${fmt(c)}.`, `The ${wantM ? 'slope' : 'y-intercept'} is ${b(fmt(wantM ? m : c))}.`]),
      way('See why with a table', [table(['x', 'y'], rowsFor(m, c, [0, 1, 2, 3])), `When x is 0 the mx part is 0, so y = ${fmt(c)}. That is where the line crosses the y-axis.`, `Each time x goes up by 1, y changes by ${fmt(m)}. That is the slope.`])] };
}
const subWay = (m, c, x) => way('Substitute', substSteps(m, c, x));
function stepWay(m, c, x) {
  if (x >= 1 && x <= 6) return way('Build a table', [table(['x', 'y'], rowsFor(m, c, Array.from({ length: x + 1 }, (_, i) => i))), `Start at y = ${fmt(c)} when x = 0. Each step right changes y by ${fmt(m)}.`, `At x = ${x}, y = ${b(fmt(m * x + c))}.`]);
  return way('Start at the intercept', [`At x = 0, y = ${fmt(c)}.`, x === 0 ? 'x is 0, so nothing is added.' : `Moving to x = ${fmt(x)} is ${count(Math.abs(x), 'step')} to the ${x > 0 ? 'right' : 'left'}, and each step ${x > 0 ? 'right' : 'left'} changes y by ${fmt(x > 0 ? m : -m)}.`, startPlus(c, m * x, m * x + c)]);
}
function evalY(L) {
  const [m, c] = L === 1 ? [rnd(1, 5), rnd(0, 9)] : coefs(L), x = L === 1 ? rnd(0, 6) : rnd(-5, 6);
  return { ask: `A line has this equation. What is y when x = ${fmt(x)}?`, expr: eqn(m, c), answer: num(m * x + c, { signed: L > 1 }), hint: `Replace x with ${fmt(x)}, multiply first, then add.`, _t: { k: 'line', m, c, x, ask: 'y' }, ways: [subWay(m, c, x), stepWay(m, c, x)] };
}
function tapPoint(L) {
  const m = L === 1 ? rnd(1, 3) : pick([-2, -1, 1, 2, 3]), x = rnd(1, 4), c = m > 0 ? rnd(0, 10 - m * x) : rnd(-m * x, 10), y = m * x + c;
  if (y < 0 || y > 10) return null;
  return { ask: `Tap the point on the line ${eqn(m, c)} where x = ${x}.`, visual: grid({ interactive: true }), answer: point(x, y), hint: `Work out y when x = ${x}. Then go ${x} across and that many up.`, _t: { k: 'line', m, c, x, ask: 'pt' },
    ways: [subWay(m, c, x), way('Walk along the line', [grid({ lines: [{ m, c }], pts: [{ x: 0, y: c, cls: 'given' }, { x, y }] }), `Start where the line crosses the y-axis, at ${pt(0, c)}.`, `Each step right, go ${m > 0 ? 'up' : 'down'} ${Math.abs(m)}. After ${count(x, 'step')} you are at ${b(pt(x, y))}.`])] };
}
function onLine() {
  const [m, c] = coefs(2), x = nz(-5, 5), yes = chance(0.5), y = m * x + c + (yes ? 0 : pick([-2, -1, 1, 2, m === 0 ? 3 : m]));
  return { ask: `Is the point ${pt(x, y)} on the line ${eqn(m, c)}?`, answer: yesNo(yes), hint: `Put x = ${fmt(x)} into the equation. Do you get y = ${fmt(y)}?`, _t: { k: 'line', m, c, x, y, ask: 'on' },
    ways: [way('Test the point', [`Put x = ${fmt(x)} into the equation: ${substChain(m, c, x)}.`, `The line has y = ${fmt(m * x + c)} there. The point has y = ${fmt(y)}.`, yes ? `They match, so ${b('yes')}, the point is on the line.` : `They are different, so ${b('no')}, the point is not on the line.`]),
      way('What "on the line" means', ['A line is every point whose x and y make its equation true.', `Here that asks: is ${fmt(y)} = ${subst(m, c, x)}? That is ${yes ? 'true' : 'false'}.`])] };
}
function findX() {
  const m = nz(-6, 6), c = rnd(-9, 9), x = nz(-6, 8), y = m * x + c;
  return { ask: `On the line ${eqn(m, c)}, what is x when y = ${fmt(y)}?`, answer: num(x, { signed: true }), hint: `Write ${fmt(y)} in place of y and solve the equation for x.`, _t: { k: 'line', m, c, y, ask: 'x' },
    ways: [way('Solve the equation', [`${fmt(y)} = ${lin(m, c)}`, ...(c === 0 ? [] : [`${c > 0 ? `Take ${c} from` : `Add ${-c} to`} both sides: ${fmt(y - c)} = ${term(m)}`]), ...(m === 1 ? [] : [`Divide both sides by ${fmt(m)}: x = ${b(fmt(x))}`]), ...(m === 1 ? [`So x = ${b(fmt(x))}.`] : [])]),
      way('Check it', [`Put x = ${fmt(x)} back in: ${substChain(m, c, x)}.`, 'That is the y we wanted.'])] };
}
const STORIES = [
  { say: (m, c) => `A taxi ride costs y dollars for x kilometers, where ${eqn(m, c)}.`, m: 'The cost of each extra kilometer', c: 'The fee before the taxi has moved', other: ['The total cost of the ride', 'The number of kilometers'] },
  { say: (m, c) => `A phone plan costs y dollars in a month with x gigabytes of data, where ${eqn(m, c)}.`, m: 'The cost of each gigabyte', c: 'The monthly fee with no data used', other: ['The total bill for the month', 'The number of gigabytes used'] },
  { say: (m, c) => `A savings jar holds y dollars after x weeks, where ${eqn(m, c)}.`, m: 'The dollars added each week', c: 'The dollars in the jar at the start', other: ['The dollars in the jar at the end', 'The number of weeks'] },
  { say: (m, c) => `A plant is y centimeters tall after x days, where ${eqn(m, c)}.`, m: 'The centimeters it grows each day', c: 'Its height on day 0', other: ['Its final height', 'The number of days'] },
];
function meaning() {
  const s = pick(STORIES), m = rnd(2, 9), c = rnd(m + 1, 30), wantM = chance(0.5), n = wantM ? m : c;
  return { ask: `${s.say(m, c)} What does the ${n} stand for?`, answer: choice(wantM ? s.m : s.c, [wantM ? s.c : s.m, ...s.other]), hint: wantM ? `What happens to y each time x goes up by 1?` : 'What is y when x is 0?', _t: { k: 'linemean' },
    ways: [way('Use what m and b do', [`${m} multiplies x, so it is the slope: y changes by ${m} for every 1 more x.`, `${c} is added once, so it is the value of y when x is 0: the starting amount.`, `So the ${n} is: ${b(wantM ? s.m : s.c)}.`]),
      way('Try two values', [`x = 0 gives y = ${c}. x = 1 gives y = ${m + c}. x = 2 gives y = ${2 * m + c}.`, `It starts at ${c} and goes up by ${m} each time.`])] };
}
export function genLine(L) {
  if (L === 1) return pick([readPart, readPart, evalY, evalY, tapPoint])(1);
  if (L === 2) return pick([() => readPart(2), () => evalY(2), () => tapPoint(2), onLine, () => matchGraph(2), () => matchGraph(2)])();
  return pick([() => matchGraph(3), fromTwoPoints, fromTwoPoints, findX, meaning, onLine])();
}
