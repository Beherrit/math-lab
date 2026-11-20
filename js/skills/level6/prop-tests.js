// Is it proportional? Testing a table, a graph and an equation, and what (0, 0) and (1, r) mean on the graph.
import { R, rnd, pick, chance, shuffle, fmt, b, way, nm, choice, table, plane } from '../../util.js';
import { tag, yesNo } from './helpers.js';
import { genPropUse } from './prop-use.js';
import { SHOPS, xsFrom, costTable, ratioLines } from './prop-common.js';

function tableTest(L) {
  const i = rnd(0, SHOPS.length - 1), yes = chance(0.5), k = pick(L === 1 ? [2, 3, 4, 5] : [1.5, 2.5, 3, 4, 6, 0.5]), f = rnd(1, 5), zero = L > 1 && chance(0.3);
  const xs = zero ? [0, ...xsFrom([1, 2, 3, 4, 5, 6], 3)] : xsFrom(L === 1 ? [1, 2, 3, 4, 5] : [2, 3, 4, 5, 6, 8, 10]), ys = xs.map(x => R(k * x + (yes ? 0 : f)));
  const [a, c2] = zero ? [1, 2] : [0, 1], cross = [ys[a] * xs[c2], ys[c2] * xs[a]];
  return tag({ story: `A shop charges for ${SHOPS[i]}. The table shows how many are bought and what the total cost is.`, ask: 'Is the cost proportional to the number bought?',
    visual: costTable(SHOPS[i], xs, ys), answer: yesNo(yes), choiceBig: true,
    ways: [way('Divide cost by number in every column', zero ? [ratioLines(xs.slice(1), ys.slice(1)), `The column with 0 shows y = ${fmt(ys[0])} when x = 0. A proportional relationship needs y = 0 there.`, yes ? `The answers match and (0, 0) fits: ${b('yes')}.` : `${b('no')}: the answers differ, and zero bought still costs ${fmt(ys[0])}.`]
      : [ratioLines(xs, ys), yes ? `The answer is ${fmt(k)} every time, so ${b('yes')}: cost = ${fmt(k)} × number.` : `The answers are not all the same, so ${b('no')}.`]),
      way('Cross-multiply two columns', [`Columns (${fmt(xs[a])}, ${fmt(ys[a])}) and (${fmt(xs[c2])}, ${fmt(ys[c2])}): ${fmt(ys[a])} × ${fmt(xs[c2])} = ${fmt(R(cross[0]))} and ${fmt(ys[c2])} × ${fmt(xs[a])} = ${fmt(R(cross[1]))}.`,
        yes ? `They are equal, so the two ratios match: ${b('yes')}.` : `They are different, so the ratios do not match: ${b('no')}.`])],
    hint: 'Divide each cost by its number. Do you get the same answer every time?' }, { kind: 'isprop', shape: 'tabletest', xs, ys });
}
function unitPoint() {
  const i = rnd(0, SHOPS.length - 1), r = rnd(2, 9), xs = xsFrom([2, 3, 4, 5, 6], 3), ys = xs.map(x => r * x), n = nm();
  const pts = [`(1, ${r})`, `(${r}, 1)`, `(0, ${r})`, `(${r}, ${r})`];
  return tag({ story: `${n} buys ${SHOPS[i]}. The cost is proportional to the number bought. The table shows some prices.`, ask: `Which point on the graph shows the cost of ONE of them?`, visual: costTable(SHOPS[i], xs, ys),
    answer: choice(pts[0], pts.slice(1)),
    ways: [way('Find the cost of one', [`${fmt(ys[0])} ÷ ${fmt(xs[0])} = ${b(r)}, so one costs $${r}.`, `A point is (number bought, cost). The number is 1 and the cost is ${r}: ${b(pts[0])}.`]),
      way('Test each point', [`Every point on the graph must follow the table: cost = ${r} × number.`, `(1, ${r}) fits: ${r} × 1 = ${r}. (${r}, 1) does not: ${r} × ${r} is ${r * r}, not 1.`, `(0, ${r}) does not fit either: buying none costs nothing in a proportional relationship.`])],
    hint: 'Points are written (number bought, cost). What is the cost when only one is bought?' }, { kind: 'unitpt', shape: 'unitpoint', xs, ys });
}
// A straight line through two labelled points; proportional lines start at (0, 0), the others cross the y-axis higher up.
function graphTest(L) {
  for (;;) {
    const yes = chance(0.5), m = pick(L === 1 ? [1, 2, 3] : [0.5, 1, 1.5, 2, 2.5, 3]), c = yes ? 0 : rnd(1, 4), xs = [];
    for (let x = 1; x <= 10; x++) if (Number.isInteger(R(m * x + c)) && m * x + c <= 10) xs.push(x);
    if (xs.length < 2) continue;
    const [x1, x2] = shuffle(xs).slice(0, 2).sort((p, q) => p - q), end = xs[xs.length - 1], at = x => R(m * x + c);
    const P = { x: x1, y: at(x1), label: `(${x1}, ${at(x1)})` }, Q = { x: x2, y: at(x2), label: `(${x2}, ${at(x2)})` };
    return tag({ ask: 'The graph is a straight line through the two labelled points. Is the relationship it shows proportional?', visual: plane({ pts: [P, Q], path: [{ x: 0, y: c }, { x: end, y: at(end) }] }),
      answer: yesNo(yes), choiceBig: true,
      ways: [way('Where does the line start?', ['A proportional graph is a straight line that goes through (0, 0). Follow the line back to the y-axis.',
        yes ? `The line reaches the axis at (0, 0): ${b('yes')}.` : `The line reaches the y-axis at height ${c}, not 0: ${b('no')}. Zero of x would still give ${c} of y.`]),
        way('Divide y by x at both points', [`${P.y} ÷ ${P.x} = ${fmt(R(P.y / P.x))} and ${Q.y} ÷ ${Q.x} = ${fmt(R(Q.y / Q.x))}.`, yes ? `The same number both times: ${b('yes')}.` : `Different numbers: ${b('no')}.`])],
      hint: 'Does the line pass through the corner where the two axes meet, (0, 0)?' }, { kind: 'graphprop', shape: 'graph', p: [P.x, P.y], q: [Q.x, Q.y] });
  }
}
const EQ = {
  kx: (k) => ({ text: `y = ${fmt(k)}x`, f: x => k * x, say: `y is ${fmt(k)} times x` }), 'kx+c': (k, c) => ({ text: `y = ${fmt(k)}x + ${c}`, f: x => k * x + c, say: `${fmt(k)} times x, plus ${c}` }),
  'x+c': (k, c) => ({ text: `y = x + ${c}`, f: x => x + c, say: `x plus ${c}` }), 'x/k': k => ({ text: `y = x ÷ ${k}`, f: x => x / k, say: `x divided by ${k}` }),
  'k/x': k => ({ text: `y = ${k} ÷ x`, f: x => k / x, say: `${k} divided by x` }), 'kx-c': (k, c) => ({ text: `y = ${fmt(k)}x − ${c}`, f: x => k * x - c, say: `${fmt(k)} times x, minus ${c}` }),
};
function eqTest(L) {
  const form = pick(L === 1 ? ['kx', 'kx+c', 'x+c'] : ['kx', 'kx+c', 'x+c', 'x/k', 'k/x', 'kx-c']), k = form === 'x/k' ? pick([2, 4, 5]) : form === 'k/x' ? pick([12, 24, 60]) : pick(L === 1 ? [2, 3, 4, 5] : [1.5, 2.5, 3, 4, 6, 8]), c = rnd(1, 9);
  const e = EQ[form](k, c), yes = form === 'kx' || form === 'x/k', xs = [1, 2, 3, 4], ys = xs.map(x => R(e.f(x)));
  return tag({ ask: 'Is y proportional to x in this equation?', expr: e.text, answer: yesNo(yes), choiceBig: true,
    ways: [way('Make a table and divide', [table(['x', ...xs], [['y', ...ys.map(fmt)]]), ratioLines(xs, ys), yes ? `y ÷ x is ${fmt(R(ys[0]))} every time: ${b('yes')}.` : `y ÷ x changes from column to column: ${b('no')}.`]),
      way('Try x = 0 and the look of the rule', [form === 'k/x' ? 'x = 0 is not even allowed here (no dividing by 0), and y gets smaller as x gets bigger. A proportional y grows with x.' : form === 'x/k' || form === 'kx' ? `The rule (${e.text}) means ${e.say}. Zero gives zero, and the rule only multiplies or divides: ${b('proportional')}.`
        : `The rule (${e.text}) means ${e.say}. When x = 0, y = ${fmt(R(e.f(0)))}, not 0. The line misses (0, 0): ${b('not proportional')}.`])],
    hint: 'Try x = 1, 2, 3. Is y divided by x the same every time? Or ask: does x = 0 give y = 0?' }, { kind: 'eqprop', shape: 'eqtest', form, k: form === 'x+c' ? undefined : k, c: form.includes('c') ? c : undefined });
}
export function genIsProp(L) {
  const r = Math.random();
  if (L === 1) return r < 0.3 ? tableTest(1) : r < 0.55 ? unitPoint() : r < 0.8 ? graphTest(1) : eqTest(1);
  if (L === 2) return r < 0.25 ? tableTest(2) : r < 0.45 ? graphTest(2) : r < 0.65 ? eqTest(2) : genPropUse(2);
  return genPropUse(3);
}
