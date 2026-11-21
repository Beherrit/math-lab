// Using what makes a relationship proportional: a missing table entry, which list fits, which deal has no fee, the same line again.
import { R, rnd, pick, chance, shuffle, fmt, money, b, way, nm, num, choice, table } from '../../util.js';
import { tag, plural } from './helpers.js';
import { SHOPS, xsFrom, costTable, ratioLines } from './prop-common.js';

// A table with one blank cell in the cost row (or the number row). The relationship is proportional.
function missing(L) {
  for (;;) {
    const i = rnd(0, SHOPS.length - 1), k = pick(L === 2 ? [2, 3, 4, 5, 6, 1.5, 2.5] : [0.5, 1.5, 2.5, 0.75, 1.25, 3.5]), xs = xsFrom(L === 2 ? [2, 3, 4, 5, 6, 8, 10] : [4, 6, 8, 10, 12, 20], 4), ys = xs.map(x => R(k * x));
    const pos = rnd(1, 3), j = 0, row = L === 3 && chance(0.5) ? 'x' : 'y', f = row === 'y' ? xs[pos] / xs[j] : ys[pos] / ys[j];
    if (!Number.isInteger(R(f * 100)) || ys.some(y => !Number.isInteger(R(y * 100)))) continue;
    const hideX = xs.map((x, c) => (row === 'x' && c === pos ? '?' : fmt(x))), hideY = ys.map((y, c) => (row === 'y' && c === pos ? '?' : fmt(y)));
    const ans = row === 'y' ? ys[pos] : xs[pos], unit = fmt(k);
    return tag({ story: `The cost of ${SHOPS[i]} is proportional to the number bought. The table has one blank.`, ask: `What number goes where the question mark is?`, visual: table([SHOPS[i], ...hideX], [['cost ($)', ...hideY]]), answer: num(ans),
      ways: [way('Find the cost of one first', [`${fmt(ys[j])} ÷ ${fmt(xs[j])} = ${unit}, so the cost of one is ${unit}.`, row === 'y' ? `${fmt(xs[pos])} × ${unit} = ${b(fmt(ans))}` : `${fmt(ys[pos])} ÷ ${unit} = ${b(fmt(ans))}`]),
        way('Scale a column', [`Compare with the first column: ${row === 'y' ? `${fmt(xs[pos])} ÷ ${fmt(xs[j])}` : `${fmt(ys[pos])} ÷ ${fmt(ys[j])}`} = ${fmt(f)}.`,
          `The other row must scale by ${fmt(f)} too: ${row === 'y' ? `${fmt(ys[j])} × ${fmt(f)}` : `${fmt(xs[j])} × ${fmt(f)}`} = ${b(fmt(ans))}`])],
      hint: 'Use a column that has both numbers. Find what one costs, or how many times bigger the other column is.' }, { kind: 'misprop', shape: 'missing', xs, ys, pos, row, j });
  }
}
const pairs = (xs, ys) => xs.map((x, i) => `(${x}, ${fmt(ys[i])})`).join(', ');
function whichList() {
  const k = rnd(2, 9), a = rnd(2, 6), f = rnd(1, 5), m = pick([2, 3, 4].filter(v => v !== k)), xs = pick([[1, 2, 3], [2, 4, 6], [1, 2, 4]]);
  const good = xs.map(x => k * x), add = xs.map(x => x + a), fee = xs.map(x => m * x + f), inv = xs.map(x => 12 / x);
  const lists = [good, add, fee, inv].map(ys => pairs(xs, ys));
  if (new Set(lists).size < 4 || !xs.every(x => Number.isInteger(12 / x))) return whichList();
  return tag({ ask: 'Which list of (x, y) pairs shows a proportional relationship?', answer: choice(lists[0], lists.slice(1)),
    ways: [way('Divide y by x in each pair', [`The right list: ${ratioLines(xs, good)}`, `Every answer is ${k}, so it is proportional.`, `In "${lists[1]}" the answers are ${xs.map((x, i) => fmt(R(add[i] / x))).join(', ')}: they change, so it is not.`]),
      way('Double x and watch y', [`In a proportional list, doubling x doubles y.`, `${b(lists[0])}: when x doubles, y doubles. Check the others: ${[add, fee].map((ys, c) => `"${lists[c + 1]}" does not double`).join(' and ')}, and in "${lists[3]}" y goes down as x goes up.`])],
    hint: 'Divide y by x for each pair. The proportional list gives the same answer every time.' }, { kind: 'whichlist', shape: 'whichlist' });
}
const DEALS = [['ride', 'entry fee'], ['song', 'sign-up fee'], ['photo print', 'set-up fee'], ['game', 'membership fee']];
function situations() {
  const [unit, fee] = pick(DEALS), ks = shuffle([2, 3, 4, 5, 6, 8, 9]).slice(0, 4), fs = shuffle([2, 3, 4, 5, 6, 7, 9]).slice(0, 3), order = shuffle([0, fs[0], fs[1], fs[2]]);
  const text = (k, f) => (f === 0 ? `$${k} for each ${unit} and nothing else` : `$${k} for each ${unit}, plus a $${f} ${fee}`), opts = order.map((f, i) => text(ks[i], f)), right = opts[order.indexOf(0)];
  return tag({ ask: `Which deal makes the total cost proportional to the number of ${unit}s?`, answer: choice(right, [], { all: opts }), choiceBig: true,
    ways: [way('Look for an extra fee', ['In a proportional relationship the total is just the rate times the number. A fee is a fixed extra charge that does not grow with the number.', `Only "${right}" has no fee.`]),
      way('Buy none', [`If you buy none, a proportional deal costs $0: the graph starts at (0, 0).`, `The deals with a fee would still charge it for none. "${right}" charges $0.`])],
    hint: 'What happens to the total if you buy none? A proportional deal should cost nothing then.' }, { kind: 'situ', shape: 'situations', fees: order.join(',') });
}
const BUYS = [['muffin', 'muffins'], ['sticker', 'stickers'], ['song', 'songs'], ['bus ticket', 'bus tickets'], ['paintbrush', 'paintbrushes']];
function propAt() {
  for (;;) {
    const [one, many] = pick(BUYS), k = pick([0.75, 1.5, 2.5, 3, 4.5, 6]), x0 = pick([4, 6, 8]), X = pick([10, 12, 15, 20]), y0 = R(k * x0), y = R(k * X), n = nm();
    if (!Number.isInteger(R(y0 * 100)) || !Number.isInteger(R(y * 100)) || x0 === X) continue;
    return tag({ story: `${n} buys ${plural(x0, one, many)} for ${money(y0)}. The cost is proportional to the number bought.`, ask: `At the same price each, how many dollars do ${plural(X, one, many)} cost?`, answer: num(y), suffix: 'dollars',
      ways: [way('Cost of one, then multiply', [`${money(y0)} ÷ ${x0} = ${money(k)} for one.`, `${X} × ${money(k)} = ${b(money(y))}`]), way('Scale up the amount', [`${X} ÷ ${x0} = ${fmt(R(X / x0))} times as many.`, `The cost grows by the same factor: ${fmt(y0)} × ${fmt(R(X / x0))} = ${b(fmt(y))}`])],
      hint: 'Proportional means the same price for each. Find the price of one first.' }, { kind: 'propat', shape: 'propat', x0, y0, x: X });
  }
}
function samePoint() {
  for (;;) {
    const x0 = pick([2, 3, 4, 5, 6]), k = pick([2, 3, 2.5, 1.5, 4]), y0 = R(k * x0), m = pick([2, 3]), good = [m * x0, R(m * y0)];
    const bad = [[m * x0, R(y0 + (m - 1) * x0)], [m * x0, R(m * y0 + 1)], [y0, x0]], show = p => `(${fmt(p[0])}, ${fmt(p[1])})`;
    if (!Number.isInteger(y0) || new Set([good, ...bad].map(show)).size < 4 || bad.some(p => R(p[1] * x0) === R(y0 * p[0]))) continue;
    return tag({ ask: `A proportional graph passes through (${x0}, ${y0}). Which other point must be on the same line?`, answer: choice(show(good), bad.map(show)),
      ways: [way('Same constant everywhere', [`${y0} ÷ ${x0} = ${fmt(k)}. Every point must have y ÷ x = ${fmt(k)}.`, `${b(show(good))}: ${fmt(good[1])} ÷ ${fmt(good[0])} = ${fmt(k)}. The others give a different number.`]),
        way('Scale both numbers', [`Multiply x by ${m}: ${x0} × ${m} = ${m * x0}. A proportional y scales by the same factor.`, `${y0} × ${m} = ${fmt(good[1])}, so the point is ${b(show(good))}. Adding to y instead of multiplying breaks the line.`])],
      hint: 'On a proportional graph, y divided by x is the same at every point. Test each choice.' }, { kind: 'samept', shape: 'samepoint', x0, y0 });
  }
}
export function genPropUse(L) {
  const r = Math.random();
  if (L === 2) return r < 0.5 ? missing(2) : whichList();
  return r < 0.3 ? missing(3) : r < 0.55 ? situations() : r < 0.8 ? propAt() : samePoint();
}
