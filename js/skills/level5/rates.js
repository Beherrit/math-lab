// Unit rates and best-buy comparisons.
import { R, rnd, pick, chance, lcm, fmt, money, b, k, way, num, choice, table } from '../../util.js';
import { T } from './helpers.js';
import { doubleLine } from './draw.js';

// [things, one of them, cheapest, dearest price for one, in cents]: every price stays believable for the item.
const GOODS = [['bottles of water', 'bottle', 100, 300], ['notebooks', 'notebook', 150, 500], ['guitar picks', 'pick', 50, 150], ['game tokens', 'token', 25, 100], ['bus tickets', 'ticket', 150, 400], ['tennis balls', 'ball', 100, 350], ['cans of cat food', 'can', 75, 200], ['muffins', 'muffin', 150, 400]];
// Steady rates: s(total, n) tells it, per is the "for each 1" word, unit names the thing counted.
const STEADY = [
  { s: (t, n) => `A cyclist rides ${k(t + ' km')} in ${k(n + ' hours')} at a steady speed.`, unit: 'km', per: 'hour', pers: 'hours', lo: 9, hi: 30, top: 5 },
  { s: (t, n) => `A printer prints ${k(t + ' pages')} in ${k(n + ' minutes')}.`, unit: 'pages', per: 'minute', pers: 'minutes', lo: 6, hi: 40 },
  { s: (t, n) => `A pump fills a tank with ${k(t + ' liters')} of water in ${k(n + ' minutes')}.`, unit: 'liters', per: 'minute', pers: 'minutes', lo: 12, hi: 60 },
  { s: (t, n) => `A phone downloads ${k(t + ' MB')} in ${k(n + ' seconds')}.`, unit: 'MB', per: 'second', pers: 'seconds', lo: 4, hi: 25 },
  { s: (t, n) => `A drummer plays ${k(t + ' beats')} in ${k(n + ' minutes')} at a steady tempo.`, unit: 'beats', per: 'minute', pers: 'minutes', lo: 60, hi: 140 },
  { s: (t, n) => `A train travels ${k(t + ' km')} in ${k(n + ' hours')} without stopping.`, unit: 'km', per: 'hour', pers: 'hours', lo: 60, hi: 130 },
  { s: (t, n) => `A baker shapes ${k(t + ' rolls')} in ${k(n + ' minutes')}.`, unit: 'rolls', per: 'minute', pers: 'minutes', lo: 3, hi: 12 },
];
const rateTable = (h1, h2, rows) => table([h1, h2], rows);
const WHY = '“Per” means “for each 1”. Sharing the total equally over every 1 keeps the rate the same.';

function steadyRate(L) {
  const c = pick(L === 1 ? STEADY.filter(x => x.lo <= 12) : STEADY), u = rnd(c.lo, L === 1 ? Math.min(c.hi, 15) : c.hi), n = rnd(2, Math.min(c.top ?? 9, L === 1 ? 6 : 9)), t = u * n;
  return T({ story: c.s(fmt(t), n), ask: `How many ${c.unit} is that per ${c.per}?`, answer: num(u), suffix: `${c.unit} per ${c.per}`,
    visual: doubleLine(['0', '?', fmt(t)], ['0', '1', String(n)], c.unit, c.pers),
    why: `Per ${c.per} means for 1 ${c.per}. Share ${fmt(t)} equally over the ${n} ${c.pers}. Multiplying the total by ${n} makes a bigger amount, which is not the amount for one.`,
    ways: [way('Share it out equally', [WHY, `${fmt(t)} ${c.unit} spread over ${n} ${c.pers}: ${fmt(t)} ÷ ${n} = ${b(u)}`, `Check: ${u} × ${n} = ${fmt(t)}`]),
      way('Ratio table', [rateTable(c.unit, c.pers, [[fmt(t), n], [b(u), 1]]), `Divide both columns by ${n} to get down to 1 ${c.per}.`])],
    hint: `Per ${c.per} means for 1 ${c.per}. What do you divide by to get from ${n} ${c.pers} to 1?` }, 'rate', { total: t, n });
}
function priceRate(L) {
  const [things, one, lo, hi] = pick(GOODS), n = rnd(2, L === 1 ? 6 : 12);
  const cents = L === 1 ? rnd(Math.ceil(lo / 100), Math.floor(hi / 100)) * 100 : rnd(lo / 5, hi / 5) * 5, u = cents / 100, t = R(u * n);
  if (L > 1 && cents % 100 === 0) return priceRate(L);
  return T({ story: `${k(n + ' ' + things)} cost ${k(money(t))} in total.`, ask: `What is the price of 1 ${one}, in dollars?`, answer: num(u),
    why: `The cost is shared equally, so divide by ${n}. Multiplying the price by ${n} rebuilds the total, which is not the price of one.`,
    ways: [way('Share the cost equally', [WHY, `${money(t)} ÷ ${n} = ${b(money(u))}`, `Check: ${n} × ${money(u)} = ${money(t)}`]),
      way('Work in cents', [`${money(t)} is ${fmt(R(t * 100))} cents.`, `${fmt(R(t * 100))} ÷ ${n} = ${fmt(cents)} cents for one.`, `${fmt(cents)} cents = ${b(money(u))}`])],
    hint: `The cost is shared equally over ${n} ${things}.` }, 'rate', { total: t, n });
}
// Find the unit rate, then use it for a different amount.
export function rateWord(L) {
  if (chance(0.5)) {
    const c = pick(STEADY), top = c.top ?? 9, u = rnd(c.lo, c.hi), n = rnd(2, Math.min(6, top)); let m = rnd(2, top); while (m === n) m = rnd(2, top);
    const t = u * n;
    return T({ story: c.s(fmt(t), n), ask: `At the same rate, how many ${c.unit} in ${m} ${c.pers}?`, answer: num(u * m), suffix: c.unit, op: 'multi',
      ways: [way('Find 1 first', [`For 1 ${c.per}: ${fmt(t)} ÷ ${n} = ${b(u)} ${c.unit}.`, `For ${m} ${c.pers}: ${u} × ${m} = ${b(fmt(u * m))} ${c.unit}`]),
        way('Ratio table', [rateTable(c.unit, c.pers, [[fmt(t), n], [u, 1], [b(fmt(u * m)), m]]), `Divide by ${n} to reach 1, then multiply by ${m}.`])],
      read: { find: `The ${c.unit} in ${m} ${c.pers}.`, know: [`${fmt(t)} ${c.unit} in ${n} ${c.pers}`, 'the rate stays the same'], clue: '“At the same rate” means every single one is worth the same amount.', plan: `${fmt(t)} ÷ ${n}, then × ${m}` },
      hint: `First find the ${c.unit} for just 1 ${c.per}.` }, 'rateUse', { total: t, n, m });
  }
  const [things, one, lo, hi] = pick(GOODS), n = rnd(2, 8), cents = rnd(lo / 5, hi / 5) * 5, u = cents / 100, t = R(u * n); let m = rnd(2, 12); while (m === n) m = rnd(2, 12);
  const ans = R(u * m);
  return T({ story: `${k(n + ' ' + things)} cost ${k(money(t))}. Every ${one} costs the same.`, ask: `How much do ${m} ${things} cost, in dollars?`, answer: num(ans), op: 'multi',
    ways: [way('Find 1 first', [`Price of 1 ${one}: ${money(t)} ÷ ${n} = ${b(money(u))}.`, `Price of ${m}: ${m} × ${money(u)} = ${b(money(ans))}`]),
      way('Ratio table', [rateTable(things, 'cost', [[n, money(t)], [1, money(u)], [m, b(money(ans))]]), `Divide by ${n} to reach 1, then multiply by ${m}.`])],
    read: { find: `The cost of ${m} ${things}.`, know: [`${n} cost ${money(t)}`, 'each one costs the same'], clue: 'Find the price of one, then build up to the amount you want.', plan: `${money(t)} ÷ ${n}, then × ${m}` },
    hint: `What does 1 ${one} cost?` }, 'rateUse', { total: t, n, m });
}
function bestBuy() {
  const [things, one, lo, hi] = pick(GOODS), [n1, n2] = pick([[4, 6], [3, 5], [6, 8], [2, 5], [5, 10], [4, 10], [6, 9], [8, 12], [3, 4], [6, 10]]);
  const c1 = rnd(lo / 5, hi / 5) * 5; let c2 = c1 + pick([-3, -2, -1, 1, 2, 3]) * 5; if (c2 < lo || c2 > hi) c2 = c1 + (c1 + 10 <= hi ? 10 : -10);
  const p1 = R(c1 * n1 / 100), p2 = R(c2 * n2 / 100), u1 = c1 / 100, u2 = c2 / 100, best = c1 < c2 ? 'Pack A' : 'Pack B', L = lcm(n1, n2);
  const base = { story: `Pack A: ${k(n1 + ' ' + things)} for ${k(money(p1))}. Pack B: ${k(n2 + ' ' + things)} for ${k(money(p2))}.`,
    ways: [way('Price of 1 in each pack', [`Pack A: ${money(p1)} ÷ ${n1} = ${b(money(u1))} for one ${one}.`, `Pack B: ${money(p2)} ÷ ${n2} = ${b(money(u2))} for one ${one}.`, `${best} is cheaper for each ${one}, by ${money(Math.abs(u1 - u2))}.`]),
      way('Compare the same amount', [`Both ${n1} and ${n2} go into ${L}, so price ${L} ${things} each way.`, `Pack A × ${L / n1}: ${money(p1)} × ${L / n1} = ${money(R(p1 * L / n1))}`, `Pack B × ${L / n2}: ${money(p2)} × ${L / n2} = ${money(R(p2 * L / n2))}`, `Same amount, lower price: ${b(best)}.`])] };
  if (chance(0.5)) return T({ ...base, ask: 'Which pack is the better buy (the lower price for each one)?', answer: choice(best, [], { all: ['Pack A', 'Pack B'] }), choiceBig: true,
    hint: `A bigger pack is not always cheaper. Find the price of 1 ${one} in each pack.` }, 'best', { p1, n1, p2, n2 });
  const gap = R(Math.abs(u1 - u2)), tot = R(Math.abs(p1 * L / n1 - p2 * L / n2));
  base.ways[1].s.push(`The packs differ by ${money(tot)} over ${L} ${things}, so for one ${one}: ${money(tot)} ÷ ${L} = ${b(money(gap))}.`);
  return T({ ...base, ask: `How much less does 1 ${one} cost in the better buy? Answer in dollars.`, answer: num(gap),
    hint: `Find the price of 1 ${one} in each pack, then subtract.` }, 'bestDiff', { p1, n1, p2, n2 });
}
export function genRate(L) {
  if (L === 1) return chance(0.5) ? steadyRate(1) : priceRate(1);
  if (L === 2) return pick([steadyRate, priceRate, rateWord])(2);
  return chance(0.65) ? bestBuy() : rateWord(3);
}
