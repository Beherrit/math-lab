// Rate of change and starting value of a linear function in context, and the function skill's step mix.
import { rnd, pick, b, way, F, fmt, num, table } from '../../util.js';
import { eqn, fixedChoice } from './h.js';
import { isFunction, ruleWords, evaluate, missingOutput, linearTable, linearEquation } from './functions.js';

const CTX = [
  { lead: 'A cyclist rides at a steady speed.', x: 'Hours', y: 'Kilometers', unit: 'kilometers per hour', m: [12, 24], start: false },
  { lead: 'Concert tickets cost the same each, plus one booking fee for the whole order.', x: 'Tickets', y: 'Total cost ($)', unit: 'dollars per ticket', m: [8, 25], start: 'the booking fee, in dollars' },
  { lead: 'A tank already holds some water and is filling at a steady rate.', x: 'Minutes', y: 'Liters', unit: 'liters per minute', m: [3, 12], start: 'the water in the tank at the start, in liters' },
  { lead: 'A streaming plan has a sign-up fee and then a fixed price each month.', x: 'Months', y: 'Total paid ($)', unit: 'dollars per month', m: [6, 15], start: 'the sign-up fee, in dollars' },
  { lead: 'A plant was measured on several days. It grows the same amount each day.', x: 'Days', y: 'Height (mm)', unit: 'millimeters per day', m: [2, 9], start: 'its height on day 0, in millimeters' },
];
function data(c) {
  const step = rnd(2, 5), m = rnd(...c.m), start = c.start ? rnd(2, 12) * (m > 10 ? 5 : 1) : 0, x0 = step * rnd(1, 2);
  const xs = [0, 1, 2, 3].map(i => x0 + i * step);
  return { step, m, start, xs, ys: xs.map(x => m * x + start) };
}
const show = (c, d) => table([c.x, c.y], d.xs.map((x, i) => [x, fmt(d.ys[i])]));
function rateTable() {
  const c = pick(CTX), d = data(c), dy = d.ys[1] - d.ys[0];
  return { ask: `${c.lead} What is the rate of change, in ${c.unit}?`, visual: show(c, d), answer: num(d.m), hint: `From one row to the next, ${c.y.toLowerCase()} changes by how much, and ${c.x.toLowerCase()} by how much?`, _t: { k: 'frate', xs: d.xs, ys: d.ys, ask: 'rate' },
    ways: [way('Change in y over change in x', [`From the first row to the second, ${c.x.toLowerCase()} goes up by ${d.step} and the other column goes up by ${fmt(dy)}.`, 'It asks for the change for ONE step of x, so divide by the size of the step.', `Rate of change = ${F(fmt(dy), d.step)} = ${b(fmt(d.m))} ${c.unit}.`]),
      way('Check with other rows', [`From the first row to the last: ${F(`${fmt(d.ys[3])} − ${fmt(d.ys[0])}`, `${d.xs[3]} − ${d.xs[0]}`)} = ${F(fmt(d.ys[3] - d.ys[0]), d.xs[3] - d.xs[0])} = ${b(fmt(d.m))}.`, 'Any two rows of a linear function give the same rate.'])] };
}
function startValue() {
  const c = pick(CTX.filter(x => x.start)), d = data(c);
  return { ask: `${c.lead} What is the starting value: ${c.start}?`, visual: show(c, d), answer: num(d.start), hint: 'Find the rate of change first. Then work backwards from the first row to x = 0.', _t: { k: 'frate', xs: d.xs, ys: d.ys, ask: 'start' },
    ways: [way('Work back to zero', [`Rate of change: ${F(fmt(d.ys[1] - d.ys[0]), d.step)} = ${fmt(d.m)} for each 1 of x.`, `The first row has x = ${d.xs[0]}. Going back to x = 0 takes away ${d.xs[0]} × ${fmt(d.m)} = ${fmt(d.xs[0] * d.m)}.`, `${fmt(d.ys[0])} − ${fmt(d.xs[0] * d.m)} = ${b(fmt(d.start))}`]),
      way('Write the rule', [`A linear function is y = mx + b. Here m = ${fmt(d.m)}.`, `Use the first row: ${fmt(d.ys[0])} = ${fmt(d.m)} × ${d.xs[0]} + b, so b = ${fmt(d.start)}.`, `The rule is ${eqn(d.m, d.start)}, and b is the starting value: ${b(fmt(d.start))}.`])] };
}
function compareRates() {
  const mA = rnd(2, 9), mB = pick([mA, mA + rnd(1, 3), Math.max(1, mA - rnd(1, 3))]), cA = rnd(1, 20), step = rnd(2, 4), cB = rnd(0, 15);
  const xs = [0, 1, 2, 3].map(i => i * step), ys = xs.map(x => mB * x + cB), all = ['Function A', 'Function B', 'They are the same'];
  const win = mA > mB ? all[0] : mB > mA ? all[1] : all[2];
  return { ask: `Function A is ${eqn(mA, cA)}. Function B is shown in the table. Which has the greater rate of change?`, visual: table(['x', 'y'], xs.map((x, i) => [x, ys[i]])), answer: fixedChoice(win, all), hint: 'The rate of change of A is the number multiplying x. For B, divide the change in y by the change in x.', _t: { k: 'fcmp', mA, xs, ys },
    ways: [way('Find each rate', [`Function A: in ${eqn(mA, cA)} the rate of change is the slope, ${mA}.`, `Function B: y goes up ${ys[1] - ys[0]} when x goes up ${step}, so its rate is ${ys[1] - ys[0]} ÷ ${step} = ${mB}.`, mA === mB ? `Both are ${mA}: ${b('they are the same')}.` : `${Math.max(mA, mB)} is greater than ${Math.min(mA, mB)}, so ${b(win)} changes faster.`]),
      way('Put A in a table too', [table(['x', 'y for A', 'y for B'], xs.map((x, i) => [x, mA * x + cA, ys[i]])), `Across each row step, A goes up ${mA * step} and B goes up ${mB * step}.`, 'The starting values do not matter here. Only how fast each one changes.'])] };
}
export function genFunc(L) {
  if (L === 1) return pick([() => isFunction(1), ruleWords])();
  if (L === 2) return pick([evaluate, missingOutput, () => isFunction(2), linearTable])();
  return pick([rateTable, rateTable, startValue, linearEquation, compareRates, linearTable])();
}
