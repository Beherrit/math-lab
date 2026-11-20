// Counting a handful of coins and notes: cents first, then a dollar bill, then bigger bills.
import { rnd, pick, b, way, num, choice } from '../../util.js';
import { cnt } from './words.js';

// [singular, plural, value]. Cents for the coins and the one dollar bill, dollars for the bigger bills.
const COIN = [['penny', 'pennies', 1], ['nickel', 'nickels', 5], ['dime', 'dimes', 10], ['quarter', 'quarters', 25]];
const BILL = [['one-dollar bill', 'one-dollar bills', 1], ['five-dollar bill', 'five-dollar bills', 5], ['ten-dollar bill', 'ten-dollar bills', 10], ['twenty-dollar bill', 'twenty-dollar bills', 20]];
const MAX = { penny: 4, nickel: 4, dime: 4, quarter: 3 };

const phrase = parts => { const xs = parts.map(([n, [one, many]]) => cnt(n, one, many)); return xs.length > 1 ? xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1] : xs[0]; };
const worth = parts => parts.reduce((s, [n, [, , v]]) => s + n * v, 0);
const byValue = kinds => kinds.slice().sort((p, q) => q[2] - p[2]);

// 2 or 3 kinds out of `list`, biggest first.
function someKinds(list) {
  for (;;) {
    const kinds = byValue(list.filter(() => Math.random() < 0.7)).slice(0, 3);
    if (kinds.length >= 2) return kinds;
  }
}
// A handful of coins adding to at most `cap` cents.
function coinSet(cap) {
  for (;;) {
    const parts = someKinds(COIN).map(k => [rnd(1, MAX[k[0]]), k]);
    if (worth(parts) <= cap) return parts;
  }
}
function countWays(parts, unit) {
  let run = 0;
  const lines = parts.map(([n, [one, many, v]]) => { run += n * v; return `${cnt(n, one, many)} is ${n * v} ${unit}. Running total: ${run}.`; });
  return [way('Biggest first, keep a running total', ['Start with the biggest coins.', ...lines, `Together: ${b(run)} ${unit}.`]),
    way('Add the groups', [parts.map(([n, [, , v]]) => n * v).join(' + ') + ` = ${b(run)}.`])];
}
function countQ(parts, unit, extra = '') {
  const total = worth(parts);
  return { ask: `How many ${unit} is this altogether?${extra}`, expr: phrase(parts), exprSmall: true, answer: num(total), hint: 'Count the biggest coins first, and keep a running total.',
    ways: countWays(parts, unit), _t: { f: 'add', xs: parts.map(([n, [, , v]]) => n * v) } };
}
// A choice of four sets of coins: only one is worth the target. The others differ in exactly one count.
function setQ(parts) {
  const total = worth(parts), tweak = i => parts.map(([n, k], j) => [j === i ? n + pick([-1, 1, 2]) : n, k]).filter(([n]) => n > 0);
  const wrong = parts.map((_, i) => phrase(tweak(i))).filter(s => s !== phrase(parts));
  return { ask: `Which set of coins is worth ${b(total + ' cents')}?`, answer: choice(phrase(parts), wrong), choiceBig: true, hint: 'Work out what each set is worth. Only one comes to the right amount.', _t: { f: 'coinset', total },
    ways: [way('Add up the right set', countWays(parts, 'cents')[0].s.slice(1)), way('Check the others', ['Each other set has one more or one fewer coin of some kind.', 'That changes its total, so none of them can be the same amount.'])] };
}
function howManyQ(kind, target) {
  const [one, many, v] = kind, n = target / v;
  return { ask: `How many ${many} make ${b(target + ' cents')}?`, answer: num(n), hint: `Count up to ${target} cents, one ${one} at a time. How many did it take?`, _t: { f: 'div', a: target, b: v },
    ways: [way('Skip count', [`Count by ${v}s: ${Array.from({ length: n }, (_, i) => (i + 1) * v).join(', ')}.`, `You say ${b(n)} numbers, so ${b(cnt(n, one, many))}.`]), way('Divide', [`${target} ÷ ${v} = ${b(n)}.`])] };
}
const billSet = () => countQ(someKinds(BILL).map(k => [rnd(1, 3), k]), 'dollars');
function quartersQ() {
  const k = rnd(2, 9), n = 4 * k;
  return { ask: `${b(n + ' quarters')} are worth how many dollars?`, answer: num(k), hint: 'Four quarters make one dollar.', _t: { f: 'div', a: n, b: 4 },
    ways: [way('Groups of four', ['4 quarters make 1 dollar, so make groups of 4.', `${n} ÷ 4 = ${b(k)} dollars.`]), way('Count the cents', [`${n} × 25 = ${n * 25} cents.`, `100 cents make 1 dollar, so ${n * 25} ÷ 100 = ${b(k)} dollars.`])] };
}
const BILL1 = [1, ['dollar bill', 'dollar bills', 100]];
export function genCoins(L) {
  if (L === 1) {
    const t = pick(['count', 'count', 'set', 'many']);
    if (t === 'set') return setQ(coinSet(100));
    if (t === 'many') { const k = pick(COIN.slice(1)); return howManyQ(k, pick(k[2] === 25 ? [50, 75, 100] : [30, 40, 50, 100].filter(v => v % k[2] === 0))); }
    return countQ(coinSet(100), 'cents');
  }
  if (L === 2) {
    const t = pick(['count', 'count', 'set']), parts = [BILL1, ...coinSet(25).slice(0, 2)];
    return t === 'set' ? setQ(parts) : countQ(parts, 'cents', ' A dollar bill is worth 100 cents.');
  }
  return pick([billSet, billSet, quartersQ])();
}
