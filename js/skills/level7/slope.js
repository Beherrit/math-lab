// Slope as rise over run: from a graph, from a table and from two points. Positive, negative and zero slopes.
import { rnd, pick, chance, b, way, F, fmt, num, frac, choice, table, nm } from '../../util.js';
import { pt, par, sl, nz, blank, count } from './h.js';
import { grid, quad, stairs } from './draw.js';

const slopeAns = (n, d, L) => (n % d === 0 ? num(n / d, { signed: L > 1 }) : frac(n, d, { signed: true }));
const moved = (v, pos, negv) => (v === 0 ? 'does not move' : `goes ${v > 0 ? pos : negv} ${Math.abs(v)}`);
const meaning = (dy, dx) => (dy === 0 ? 'The line is flat: it never rises, so its slope is 0.' : `A ${dy > 0 ? 'positive' : 'negative'} slope means the line goes ${dy > 0 ? 'up' : 'down'} as you move to the right.`);
function riseRun(p, q, pic) {
  const dx = q[0] - p[0], dy = q[1] - p[1];
  return way('Rise over run', [...(pic ? [pic] : []), `Go from ${pt(...p)} to ${pt(...q)}. The run is how far right: ${dx}.`, `The rise is how far up. Here the line ${moved(dy, 'up', 'down')}, so the rise is ${fmt(dy)}.`,
    meaning(dy, dx), `Slope = rise ÷ run = ${F(fmt(dy), dx)}${dy % dx === 0 && dx === 1 ? '' : ` = ${b(sl(dy, dx))}`}`]);
}
function formula(p, q) {
  const dx = q[0] - p[0], dy = q[1] - p[1];
  return way('Use the formula', ['Slope = change in y ÷ change in x. Subtract in the same order, top and bottom.', `${F(`${fmt(q[1])} − ${par(p[1])}`, `${fmt(q[0])} − ${par(p[0])}`)} = ${F(fmt(dy), fmt(dx))} = ${b(sl(dy, dx))}`]);
}
// Two points with whole-number coordinates inside lo..hi. Step 1 keeps the slope a positive whole number.
function twoPoints(L, lo, hi) {
  const run = rnd(1, L === 1 ? 3 : 4), rise = L === 1 ? run * rnd(1, Math.floor(8 / run)) : rnd(-6, 6);
  const x = rnd(lo, hi - run), y = rnd(Math.max(lo, lo - rise), Math.min(hi, hi - rise));
  return [[x, y], [x + run, y + rise]];
}
function fromGraph(L) {
  const four = L === 3, [p, q] = twoPoints(L, four ? -6 : 0, four ? 6 : 10), dx = q[0] - p[0], dy = q[1] - p[1], m = dy / dx;
  const draw = four ? quad : grid, layer = { lines: [{ m, c: p[1] - m * p[0] }], pts: [{ x: p[0], y: p[1], label: 'A' }, { x: q[0], y: q[1], label: 'B' }] };
  return { ask: 'What is the slope of the line?', visual: draw(layer), answer: slopeAns(dy, dx, L), hint: 'Count how far up or down, and how far right, to get from A to B.', _t: { k: 'slope', p, q },
    ways: [riseRun(p, q, draw({ ...layer, segs: stairs(p, q) })), formula(p, q)] };
}
function fromTable(L) {
  const step = L === 1 ? 1 : rnd(1, L === 2 ? 3 : 4), dy = L === 1 ? rnd(1, 5) : L === 2 ? step * rnd(-5, 5) : nz(-7, 7);
  const x0 = L === 1 ? rnd(0, 3) : rnd(-4, 4), y0 = rnd(L === 1 ? 0 : -10, 10);
  const rows = [0, 1, 2, 3].map(i => [x0 + i * step, y0 + i * dy]), p = rows[0], q = rows[1];
  return { ask: 'The table shows points on a line. What is the slope?', visual: table(['x', 'y'], rows.map(r => r.map(fmt))), answer: slopeAns(dy, step, L), hint: 'From one row to the next, how much does y change, and how much does x change?', _t: { k: 'slope', p, q: rows[3], rows },
    ways: [way('Compare two rows', [`From ${pt(...p)} to ${pt(...q)}, x goes up by ${step} and y ${dy === 0 ? 'stays the same' : `changes by ${fmt(dy)}`}.`, 'Any two rows give the same slope. That is what makes it a line.', `Slope = change in y ÷ change in x = ${F(fmt(dy), step)}${step === 1 ? '' : ` = ${b(sl(dy, step))}`}`]),
      formula(rows[1], rows[3])] };
}
function fromPoints(L) {
  const [p, q] = twoPoints(L, L === 3 ? -9 : 0, L === 3 ? 9 : 12), dx = q[0] - p[0], dy = q[1] - p[1];
  return { ask: `What is the slope of the line through ${pt(...p)} and ${pt(...q)}?`, answer: slopeAns(dy, dx, L), hint: 'Find the change in y and the change in x. Keep the same order for both.', _t: { k: 'slope', p, q },
    ways: [formula(p, q), riseRun(p, q, null)] };
}
function missingY() {
  const d = pick([1, 1, 2, 3]), n = nz(-4, 4), run = d * rnd(1, 3), p = [rnd(-5, 5), rnd(-6, 6)], x2 = p[0] + run, y2 = p[1] + n * run / d;
  return { ask: `A line with slope ${sl(n, d)} passes through ${pt(...p)} and (${fmt(x2)}, ${blank}). What is the missing y?`, answer: num(y2, { signed: true }), hint: `How far right is it from x = ${fmt(p[0])} to x = ${fmt(x2)}? The slope tells you the rise for that run.`, _t: { k: 'slopemiss', p, x2, n, d },
    ways: [way('Run, then rise', [`The run is ${fmt(x2)} − ${par(p[0])} = ${run}.`, `Slope = rise ÷ run, so rise = slope × run = ${sl(n, d)} × ${run} = ${fmt(n * run / d)}.`, `Start at y = ${fmt(p[1])} and change by ${fmt(n * run / d)}: ${b(fmt(y2))}.`]),
      way('Step along the line', [`A slope of ${sl(n, d)} means: every ${d} to the right, y changes by ${fmt(n)}.`, `Going ${run} to the right is ${run / d} of those steps, so y changes by ${run / d} × ${par(n)} = ${fmt(n * run / d)}.`, `${fmt(p[1])} + ${par(n * run / d)} = ${b(fmt(y2))}`])] };
}
const RATES = [
  { say: (w, a, c) => `A candle is ${a[1]} cm tall after ${count(a[0], 'hour')} of burning and ${c[1]} cm tall after ${count(c[0], 'hour')}.`, unit: 'cm per hour', sign: -1, base: [28, 40] },
  { say: (w, a, c) => `${w} has $${a[1]} saved after ${count(a[0], 'week')} and $${c[1]} after ${count(c[0], 'week')}.`, unit: 'dollars per week', sign: 1, base: [10, 40] },
  { say: (w, a, c) => `A phone battery shows ${a[1]}% after ${count(a[0], 'hour')} of use and ${c[1]}% after ${count(c[0], 'hour')}.`, unit: 'percent per hour', sign: -1, base: [80, 96] },
  { say: (w, a, c) => `A climber is at ${a[1]} meters after ${count(a[0], 'minute')} and at ${c[1]} meters after ${count(c[0], 'minute')}.`, unit: 'meters per minute', sign: 1, base: [20, 60] },
];
function inContext() {
  const r = pick(RATES), t1 = rnd(1, 3), t2 = t1 + rnd(2, 4), m = r.sign * rnd(2, 6), y1 = rnd(...r.base), p = [t1, y1], q = [t2, y1 + m * (t2 - t1)];
  return { ask: `${r.say(nm(), p, q)} What is the slope, in ${r.unit}?`, answer: num(m, { signed: true }), hint: 'Slope is the change in the amount divided by the change in time.', _t: { k: 'slope', p, q },
    ways: [formula(p, q), way('Say what it means', [`In ${count(t2 - t1, 'time step')} the amount changed by ${fmt(q[1] - p[1])}.`, `That is ${fmt(q[1] - p[1])} ÷ ${t2 - t1} = ${b(fmt(m))} ${r.unit}.`, m < 0 ? 'The slope is negative because the amount is going down.' : 'The slope is positive because the amount is going up.'])] };
}
const UNDEF = 'Undefined: you cannot divide by 0';
// An upright line has run 0 (slope undefined). A flat line has rise 0 (slope 0). The wrong numbers are the real slips.
function special() {
  const vertical = chance(0.5), fixed = vertical ? nz(-5, 5) : rnd(-5, 5), lo = rnd(-5, 1), hi = rnd(2, 5), flip = chance(0.5);
  const p = vertical ? [fixed, flip ? hi : lo] : [flip ? hi : lo, fixed], q = vertical ? [fixed, flip ? lo : hi] : [flip ? lo : hi, fixed];
  const dx = q[0] - p[0], dy = q[1] - p[1], diff = vertical ? dy : dx;
  const ends = vertical ? [[fixed, -6], [fixed, 6]] : [[-6, fixed], [6, fixed]];
  return { ask: `What is the slope of the ${vertical ? 'straight up-and-down' : 'flat'} line through ${pt(...p)} and ${pt(...q)}?`,
    visual: quad({ segs: [{ a: ends[0], b: ends[1], dash: false, color: 'var(--grape)' }], pts: [{ x: p[0], y: p[1] }, { x: q[0], y: q[1] }] }),
    answer: choice(vertical ? UNDEF : '0', [vertical ? '0' : UNDEF, fmt(diff), fmt(-diff)]), hint: 'Work out the rise and the run. Which one is 0, and is it on the top or the bottom?', _t: { k: 'slopespec', p, q },
    ways: [way('Try rise over run', [`The rise is ${fmt(q[1])} − ${par(p[1])} = ${fmt(dy)}. The run is ${fmt(q[0])} − ${par(p[0])} = ${fmt(dx)}.`,
      vertical ? `${fmt(dy)} ÷ 0 has no answer, so the slope is ${b('undefined')}: you cannot divide by 0.` : `0 ÷ ${fmt(dx)} = 0, so the slope is ${b('0')}.`]),
      way('Compare the two kinds of line', ['A flat line has rise 0, so its slope is 0 ÷ run = 0.', 'An upright line has run 0. Dividing by 0 is not possible, so its slope is undefined.', `This line is ${vertical ? 'upright' : 'flat'}, so ${vertical ? 'its slope is undefined' : 'its slope is 0'}.`])] };
}
export function genSlope(L) {
  if (L === 1) return chance(0.6) ? fromGraph(1) : fromTable(1);
  if (L === 2) return pick([fromGraph, fromTable, fromPoints, fromPoints])(2);
  return pick([() => fromGraph(3), () => fromTable(3), () => fromPoints(3), missingY, missingY, inContext, inContext, special])();
}
