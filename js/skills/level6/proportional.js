// Proportional relationships: the constant of proportionality in tables, graphs and equations.
import { R, rnd, pick, chance, shuffle, fmt, b, way, num, choice, table, plane } from '../../util.js';
import { tag, yesNo, plural } from './helpers.js';

const CTX = [
  { x: 'tickets', y: 'cost ($)', one: 'ticket' }, { x: 'hours', y: 'kilometres', one: 'hour' }, { x: 'songs', y: 'megabytes', one: 'song' },
  { x: 'batches', y: 'cups of flour', one: 'batch' }, { x: 'laps', y: 'minutes', one: 'lap' }, { x: 'bags', y: 'kilograms', one: 'bag' },
  { x: 'games', y: 'points', one: 'game' }, { x: 'litres of paint', y: 'square metres', one: 'litre' },
];
const xsOf = (pool, n = 4) => shuffle(pool).slice(0, n).sort((p, q) => p - q);
const tbl = (c, xs, ys) => table([c.x, ...xs.map(fmt)], [[c.y, ...ys.map(fmt)]]);
const xyTbl = (xs, ys) => table(['x', ...xs.map(fmt)], [['y', ...ys.map(fmt)]]);
const kWays = (xs, ys, k, one) => [
  way('Divide y by x', [`In a proportional relationship, y ÷ x gives the same number in every column.`,
    xs.map((x, i) => `${fmt(ys[i])} ÷ ${fmt(x)} = ${fmt(k)}`).join('<br>'), `That number is the constant of proportionality: ${b(fmt(k))}`]),
  way('Find the amount for 1', [`The constant is what y is when x is 1${one ? ` (the amount for one ${one})` : ''}.`,
    xs[0] === 1 ? `The table already shows it: 1 goes with ${b(fmt(k))}.` : `${fmt(xs[0])} goes with ${fmt(ys[0])}, so 1 goes with ${fmt(ys[0])} ÷ ${fmt(xs[0])} = ${b(fmt(k))}.`, `Check another column: ${fmt(xs[1])} × ${fmt(k)} = ${fmt(ys[1])}.`]),
];
function findK(ks, pool) {
  const c = pick(CTX), k = pick(ks), xs = xsOf(pool), ys = xs.map(x => R(k * x));
  return tag({ ask: `The table shows a proportional relationship between ${c.x} and ${c.y}. Its first column pairs ${fmt(xs[0])} with ${fmt(ys[0])}. What is the constant of proportionality?`, visual: tbl(c, xs, ys),
    answer: num(k), ways: kWays(xs, ys, k, c.one), hint: 'Pick any column and divide the bottom number by the top number.' }, { kind: 'k', xs, ys });
}
function useEquation() {
  const k = rnd(2, 12), x = rnd(3, 12);
  return tag({ ask: `A relationship follows the rule y = ${k}x. What is y when x = ${x}?`, expr: `y = ${k}x`, answer: num(k * x),
    ways: [way('Put the number in for x', [`${k}x means ${k} times x.`, `y = ${k} × ${x} = ${b(fmt(k * x))}`]),
      way('Build a table', [xyTbl([1, 2, x], [k, 2 * k, k * x]), `Every y is ${k} times its x. The ${k} is the constant of proportionality.`])],
    hint: `The rule says: multiply x by ${k}.` }, { kind: 'prod', xs: [k, x] });
}
function isProportional() {
  const yes = chance(0.5), k = pick([2, 3, 4, 5, 1.5, 2.5]), xs = xsOf([2, 4, 6, 8, 10]), add = rnd(1, 5);
  const ys = xs.map(x => R(k * x) + (yes ? 0 : add)), rs = xs.map((x, i) => fmt(R(ys[i] / x)));
  const ratios = xs.map((x, i) => `${fmt(ys[i])} ÷ ${fmt(x)} ${Number.isInteger(R(ys[i] / x * 100)) ? '=' : '≈'} ${fmt(+(ys[i] / x).toFixed(2))}`).join('<br>');
  return tag({ ask: `Look at the table. When x is ${xs[0]}, y is ${fmt(ys[0])}. Is y proportional to x for the whole table?`, visual: xyTbl(xs, ys), answer: yesNo(yes), choiceBig: true,
    ways: [way('Check y ÷ x in every column', [ratios, yes ? `The answer is ${rs[0]} every time, so ${b('yes')}: y = ${fmt(k)}x.` : `The answers are not all the same, so ${b('no')}.`]),
      way('Double x and watch y', [`When x goes from ${xs[0]} to ${xs[0] * 2}, a proportional y must double too.`,
        yes ? `${fmt(ys[0])} doubled is ${fmt(ys[0] * 2)}, and that is what the rule y = ${fmt(k)}x gives. ${b('Yes')}.`
          : `${fmt(ys[0])} doubled is ${fmt(ys[0] * 2)}, but this rule (multiply by ${fmt(k)}, then add ${add}) gives ${fmt(R(k * xs[0] * 2) + add)}. The added ${add} breaks it: ${b('no')}.`])],
    hint: 'Divide each y by its x. Do you always get the same number?' }, { kind: 'isprop', xs, ys });
}
function graphPoints(k) {
  const pts = []; for (let x = 1; x <= 10; x++) if (Number.isInteger(k * x) && k * x <= 10) pts.push({ x, y: k * x });
  return pts;
}
function fromGraph() {
  const k = pick([0.5, 1.5, 2, 2.5, 3, 4, 5]), pts = graphPoints(k), end = pts[pts.length - 1], p = pick(pts.slice(0, 3));
  return tag({ ask: `The graph shows a proportional relationship. The line passes through (${p.x}, ${p.y}). What is the constant of proportionality?`,
    visual: plane({ pts: pts.slice(0, 3), path: [{ x: 0, y: 0 }, end] }), answer: num(k),
    ways: [way('Pick a point and divide', [`The line passes through (${p.x}, ${p.y}). Any point on the line gives the same answer: that is what makes it proportional.`, `y ÷ x = ${p.y} ÷ ${p.x} = ${b(fmt(k))}`]),
      way('Read the height above x = 1', [`A proportional graph is a straight line through (0, 0).`, `Above x = 1 the line is at height ${fmt(k)}, so y is ${b(fmt(k))} for every 1 of x.`])],
    hint: 'Read one point on the line, then divide its y by its x.' }, { kind: 'k', xs: pts.map(q => q.x), ys: pts.map(q => q.y) });
}
function pickEquation() {
  const k = rnd(2, 9), xs = xsOf([1, 2, 3, 4, 5, 6]), ys = xs.map(x => k * x), j = xs.findIndex(x => x + k !== k * x);
  return tag({ ask: `In this table, x = ${xs[0]} goes with y = ${ys[0]}, and the other columns follow the same rule. Which equation matches the table?`, visual: xyTbl(xs, ys), answer: choice(`y = ${k}x`, [`y = x + ${k}`, `y = x ÷ ${k}`, `y = ${k}x + 1`]),
    ways: [way('Find the constant, then write y = kx', [`${ys[0]} ÷ ${xs[0]} = ${k}, and every column gives ${k}.`, `So y is always ${k} times x: ${b(`y = ${k}x`)}`]),
      way('Test each equation with a column', [`Use x = ${xs[j]}: the table says y = ${ys[j]}.`, `y = x + ${k} gives ${xs[j] + k}. y = ${k}x gives ${ys[j]}.`, `Only ${b(`y = ${k}x`)} fits.`])],
    hint: 'What do you multiply each x by to get its y?' }, { kind: 'eqk', xs, ys });
}
function extend() {
  const c = pick(CTX), k = pick([1.5, 2.5, 3, 4, 6, 7, 12]), xs = xsOf([2, 4, 6, 8]), ys = xs.map(x => R(k * x)), X = pick([20, 30, 50, 100]);
  return tag({ ask: `The table shows a proportional relationship. Following the same pattern, what number would go under ${X} ${c.x}?`, visual: tbl(c, xs, ys), answer: num(k * X),
    ways: [way('Find the constant, then multiply', [`${fmt(ys[0])} ÷ ${xs[0]} = ${fmt(k)} for each ${c.one}.`, `${X} × ${fmt(k)} = ${b(fmt(k * X))}`]),
      way('Scale up a column', [`The column for ${xs[0]} shows ${fmt(ys[0])}.`, `${X} is ${fmt(X / xs[0])} times ${xs[0]}, so multiply ${fmt(ys[0])} by ${fmt(X / xs[0])} as well: ${b(fmt(k * X))}`])],
    hint: `First find the amount for 1 ${c.one}.` }, { kind: 'kx', xs, ys, x: X });
}
function unitFromPoint() {
  const k = pick([0.5, 1.5, 2.5, 3.5, 0.75, 1.25, 4, 6]), x = pick([4, 8, 12, 20]), y = R(k * x);
  return tag({ ask: `The graph of a proportional relationship is a straight line through (0, 0) and (${x}, ${fmt(y)}). What is y when x = 1?`, answer: num(k),
    ways: [way('Divide to find the amount for 1', [`y ÷ x is the same everywhere on the line: ${fmt(y)} ÷ ${x} = ${b(fmt(k))}`, `So the point (1, ${fmt(k)}) is on the line. Its y is the constant of proportionality.`]),
      way('Shrink the point', [`Divide both numbers of (${x}, ${fmt(y)}) by ${x} to get to x = 1.`, `(${x} ÷ ${x}, ${fmt(y)} ÷ ${x}) = (1, ${b(fmt(k))})`])],
    hint: `Divide ${fmt(y)} by ${x}.` }, { kind: 'k', xs: [x], ys: [y] });
}
function compare() {
  const ka = rnd(2, 9), kb = ka + pick([-1, 1]), xs = xsOf([2, 3, 4, 5, 6], 3), ys = xs.map(x => kb * x), win = ka > kb ? 'Plan A' : 'Plan B';
  return tag({ ask: 'Two phone plans charge by the gigabyte (x gigabytes cost y dollars). Plan A follows y = ' + ka + 'x. Plan B is in the table. Which plan charges more for each gigabyte?',
    visual: xyTbl(xs, ys), answer: choice(win, [], { all: ['Plan A', 'Plan B'] }), choiceBig: true,
    ways: [way('Compare the constants', [`Plan A: in y = ${ka}x the constant is ${b(plural(ka, 'dollar'))} for each gigabyte.`, `Plan B: ${ys[0]} ÷ ${xs[0]} = ${b(plural(kb, 'dollar'))} for each gigabyte.`, `${Math.max(ka, kb)} is more than ${Math.min(ka, kb)}, so ${b(win)} charges more.`]),
      way('Compare the same amount', [`Take ${plural(xs[0], 'gigabyte')}. Plan A: ${ka} × ${xs[0]} = ${plural(ka * xs[0], 'dollar')}. Plan B: ${plural(ys[0], 'dollar')}.`, `${b(win)} costs more for the same amount.`])],
    hint: 'Find the cost of 1 gigabyte on each plan.' }, { kind: 'cmp', ka, xs, ys });
}
export function genProp(L) {
  const r = Math.random();
  if (L === 1) return r < 0.65 ? findK([2, 3, 4, 5, 6, 7, 8, 9, 10, 12], [1, 2, 3, 4, 5, 6]) : useEquation();
  if (L === 2) return r < 0.35 ? isProportional() : r < 0.7 ? fromGraph() : findK([0.5, 1.5, 2.5, 0.25, 0.75, 3.5], [2, 4, 6, 8, 10, 12]);
  return r < 0.25 ? pickEquation() : r < 0.5 ? extend() : r < 0.75 ? unitFromPoint() : compare();
}
