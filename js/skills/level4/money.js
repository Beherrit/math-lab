// Skill l4money: money problems with decimals, totals, change, unit price, splitting a bill (5.NBT.7 in context). Also story sources.
import { R, rnd, pick, shuffle, lcm, fmt, column, b, k, way, nm, num, choice } from '../../util.js';
import { T, rd, pl } from './helpers.js';

// [phrase, singular, plural, cheapest, dearest] in whole dollars.
const ITEMS = [['a sandwich', 'sandwich', 'sandwiches', 3, 9], ['a phone charger', 'phone charger', 'phone chargers', 8, 24], ['a movie ticket', 'movie ticket', 'movie tickets', 8, 16], ['a set of guitar strings', 'set of guitar strings', 'sets of guitar strings', 6, 22],
  ['a bag of dog treats', 'bag of dog treats', 'bags of dog treats', 4, 15], ['a notebook', 'notebook', 'notebooks', 2, 7], ['a water bottle', 'water bottle', 'water bottles', 4, 18], ['a pack of batteries', 'pack of batteries', 'packs of batteries', 4, 12],
  ['a bike light', 'bike light', 'bike lights', 5, 20], ['a smoothie', 'smoothie', 'smoothies', 3, 8], ['a slice of pizza', 'slice of pizza', 'slices of pizza', 2, 5]];
// Things sold in packs: [singular, plural, cheapest, dearest] in cents for one.
const PACK_ITEMS = [['pencil', 'pencils', 20, 60], ['granola bar', 'granola bars', 50, 140], ['juice box', 'juice boxes', 60, 130], ['AA battery', 'AA batteries', 40, 120], ['trading card', 'trading cards', 30, 90], ['sticker', 'stickers', 10, 50]];
const PACK_PAIRS = [[4, 6], [6, 8], [4, 12], [8, 12], [6, 12], [12, 24], [8, 24], [10, 20], [5, 10], [6, 9]];
const ENDINGS = [0, 25, 49, 50, 75, 95, 99];
const priceC = (lo, hi) => rnd(lo, hi) * 100 + pick(ENDINGS);
const D = c => (c / 100).toFixed(2), M$ = c => '$' + D(c), val = c => R(c / 100);
const items = (n, L) => shuffle(ITEMS.filter(i => L > 1 || i[4] <= 9)).slice(0, n);
const list = xs => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const CLUE = { add: '“in all” and “total” mean add', sub: '“change” is what is left of the money you paid' };

export function moneyTotalWord(L = 1) {
  const its = items(L === 1 ? 2 : 3, L), cs = its.map(i => priceC(i[3], i[4])), total = cs.reduce((s, c) => s + c, 0), who = nm(), ds = cs.map(c => Math.floor(c / 100)), ct = cs.map(c => c % 100), sc = ct.reduce((s, c) => s + c, 0);
  return T({ story: `${who} buys ${list(its.map((i, j) => `${i[0]} for ${k(M$(cs[j]))}`))}.`, ask: 'How much is that in all, in dollars?', answer: num(val(total)), op: 'add',
    ways: [way('Line up the decimal points', [column(cs.map(D), '+', D(total)), `Points in one column means cents are added to cents and dollars to dollars: ${b(M$(total))}`]),
      way('Dollars and cents apart', [`Dollars: ${ds.join(' + ')} = ${ds.reduce((s, x) => s + x, 0)}`, `Cents: ${ct.join(' + ')} = ${sc}${sc >= 100 ? `, which is 1 dollar and ${sc - 100} cents` : ''}`, `Together: ${b(M$(total))}`])],
    read: rd('The total cost of everything.', cs.map(M$), CLUE.add, cs.map(D).join(' + ')), hint: 'Line up the decimal points before you add.' }, 'mnTotal', { cs });
}
export function moneyChangeWord(L = 1) {
  for (;;) {
    const [ph, one, many, lo, hi] = items(1, L)[0], n = L === 1 ? 1 : rnd(2, 5), p = priceC(lo, hi), total = n * p, B = [10, 20, 50, 100].find(v => v * 100 > total), who = nm();
    if (!B) continue;
    const change = B * 100 - total, up = Math.ceil(total / 100) * 100, bill = B * 100, parts = [up - total, bill - up].filter(x => x > 0);
    const count = [up > total ? `${D(total)} + ${D(up - total)} = ${D(up)}` : null, up < bill ? `${D(up)} + ${D(bill - up)} = ${D(bill)}` : null, parts.length === 2 ? `${D(parts[0])} + ${D(parts[1])} = ${D(change)}` : null, `Change: ${b(M$(change))}`].filter(Boolean);
    const first = [...(n === 1 ? [] : [`${n} × ${D(p)} = ${D(total)}`]), column([D(bill), D(total)], '−', D(change)), `Change: ${b(M$(change))}`];
    return T({ story: n === 1 ? `${who} buys ${ph} for ${k(M$(p))} and pays with a ${k('$' + B)} bill.` : `${who} buys ${k(pl(n, one, many))} at ${k(M$(p) + ' each')} and pays with a ${k('$' + B)} bill.`, ask: `How much change does ${who} get, in dollars?`, answer: num(val(change)), op: n === 1 ? 'sub' : 'multi',
      ways: [way(n === 1 ? 'Line up the decimal points' : 'Total first, then change', first),
        n === 1 ? way('Count up from the price', count) : way('Work in cents', [`${n} × ${p} = ${fmt(total)} cents`, `${fmt(bill)} − ${fmt(total)} = ${fmt(change)} cents`, `${fmt(change)} cents is ${b(M$(change))}`])],
      read: rd('The change that comes back.', n === 1 ? [`cost ${M$(p)}`, `paid $${B}`] : [`${n} items`, `${M$(p)} each`, `paid $${B}`], CLUE.sub, n === 1 ? `${B} − ${D(p)}` : `${B} − ${n} × ${D(p)}`), hint: n === 1 ? 'Write the bill with two decimal places and line up the points.' : 'Find the total cost first.' }, 'mnChange', { n, p, B });
  }
}
function mnTimes() {
  const [, one, many, lo, hi] = pick(ITEMS.filter(i => i[4] <= 9)), p = priceC(lo, hi), n = rnd(3, 6), total = n * p, who = nm(), d = Math.floor(p / 100), ct = p % 100;
  return T({ story: `One ${one} costs ${k(M$(p))}. ${who} buys ${k(pl(n, one, many))}.`, ask: 'How much does that cost, in dollars?', answer: num(val(total)), op: 'mul',
    ways: [way('Multiply, then place the point', [`In cents: ${n} × ${p} = ${fmt(total)} cents.`, `100 cents make a dollar, so the point goes two places in: ${b(M$(total))}`]),
      way('Dollars and cents apart', [`${n} × ${d} = ${n * d} dollars`, `${n} × ${ct} = ${n * ct} cents`, `${n * d} dollars and ${n * ct} cents is ${b(M$(total))}`])],
    read: rd('The cost of all of them.', [`${M$(p)} each`, `${n} of them`], '“each” and “how many” mean multiply', `${n} × ${D(p)}`), hint: 'Same price many times: multiply.' }, 'mnTimes', { n, p });
}
const BILLS = ['a pizza', 'bowling', 'a movie night', 'lunch at the park', 'a trip to the arcade'];
export function moneySplitWord(L = 1) {
  const n = rnd(2, L === 1 ? 5 : 6), each = rnd(L === 1 ? 300 : 450, L === 1 ? 900 : 1600) + pick([0, 5, 10, 25, 35, 40, 60, 75]), total = n * each, what = pick(BILLS);
  return T({ story: `${k(n + ' friends')} split the bill for ${what}, which is ${k(M$(total))}, equally.`, ask: 'How much does each friend pay, in dollars?', answer: num(val(each)), op: 'div',
    ways: [way('Divide', [`${D(total)} ÷ ${n} = ${b(D(each))}`, `Check: ${n} × ${D(each)} = ${D(total)}`]),
      way('Work in cents', [`In cents: ${fmt(total)} ÷ ${n} = ${fmt(each)} cents.`, `${fmt(each)} cents is ${b(M$(each))}`])],
    read: rd('What ONE friend pays.', [`bill ${M$(total)}`, `${n} friends`], '“split equally” means divide', `${D(total)} ÷ ${n}`), hint: 'Split the bill equally: divide the total by the number of friends.' }, 'mnSplit', { total, n });
}
function mnUnit() {
  const [one, many, lo, hi] = pick(PACK_ITEMS), each = rnd(lo / 5, hi / 5) * 5, n = rnd(6, 24), total = n * each, who = nm();
  return T({ story: `${who} sees a pack of ${k(n + ' ' + many)} for ${k(M$(total))}.`, ask: `How much does one ${one} cost, in dollars?`, answer: num(val(each)), op: 'div',
    ways: [way('Divide', [`${D(total)} ÷ ${n} = ${b(D(each))}`]), way('Check by multiplying', [`If one costs ${D(each)}: ${n} × ${D(each)} = ${D(total)}.`, `That matches the pack price, so one costs ${b(M$(each))}.`])],
    read: rd('The price of ONE.', [`${n} for ${M$(total)}`], '“how much for one” means share the price equally: divide', `${D(total)} ÷ ${n}`), hint: 'Divide the pack price by the number of items.' }, 'mnUnit', { total, n });
}
export function moneyBuyWord(L = 2) {
  for (;;) {
    const [, one, many, lo, hi] = pick(ITEMS), p = priceC(lo, Math.min(hi, L === 3 ? 12 : 8)), B = pick([20, 25, 30, 40, 50]), q = Math.floor(B * 100 / p), who = nm();
    if (q < 2 || q > 14 || (B * 100) % p === 0) continue;
    return T({ story: `${who} has ${k('$' + B)}. Each ${one} costs ${k(M$(p))}.`, ask: `How many ${many} can ${who} buy?`, answer: num(q), op: 'div',
      ways: [way('Count up', [`${q} × ${D(p)} = ${D(q * p)}, which is no more than ${B}.`, `${q + 1} × ${D(p)} = ${D((q + 1) * p)}, which is more than ${B}.`, `So ${who} can buy ${b(q)}.`]),
        way('Work in cents', [`${B} dollars is ${fmt(B * 100)} cents, and each costs ${p} cents.`, `${q} × ${p} = ${fmt(q * p)} cents fits, but ${q + 1} × ${p} = ${fmt((q + 1) * p)} cents is too much.`, `So the answer is ${b(q)}.`])],
      read: rd(`How many ${many} the money buys.`, [`$${B}`, `${M$(p)} each`], '“how many can buy” means how many prices fit in the money: divide, and only whole items count', `${B} ÷ ${D(p)}`), hint: 'How many prices fit into the money? Only whole items count.' }, 'mnBuy', { B, p });
  }
}
// Pack A and Pack B of the same thing: the price of one is exact cents in both and always differs.
function packs(L) {
  for (;;) {
    const [one, many, lo, hi] = pick(PACK_ITEMS), [n1, n2] = shuffle(pick(PACK_PAIRS)), u1 = rnd(lo, hi), u2 = u1 + pick([-1, 1]) * rnd(L === 3 ? 3 : 10, L === 3 ? 20 : 40);
    if (u2 < 10 || u2 === u1) continue;
    return { one, many, n1, n2, u1, u2, t1: n1 * u1, t2: n2 * u2 };
  }
}
function mnBetter(L) {
  const { many, n1, n2, u1, u2, t1, t2, one } = packs(L), win = u1 < u2 ? 'Pack A' : 'Pack B', l = lcm(n1, n2), c1 = (l / n1) * t1, c2 = (l / n2) * t2;
  return T({ ask: `Pack A has ${n1} ${many} for ${M$(t1)}. Pack B has ${n2} ${many} for ${M$(t2)}. Which is the better buy?`, answer: choice(win, [], { all: ['Pack A', 'Pack B'] }), choiceBig: true,
    ways: [way('Price for one', [`Pack A: ${D(t1)} ÷ ${n1} = ${D(u1)} for each ${one}`, `Pack B: ${D(t2)} ÷ ${n2} = ${D(u2)} for each ${one}`, `${win} is cheaper for each ${one}: ${b(win)}`]),
      way(`Same number of ${many}`, [`Compare the packs at ${l} ${many}.`, `Pack A: ${l / n1} × ${D(t1)} = ${D(c1)}`, `Pack B: ${l / n2} × ${D(t2)} = ${D(c2)}`, `${win} costs less for ${l} ${many}: ${b(win)}`])],
    hint: 'Find the price of one item in each pack, then compare.' }, 'mnBetter', { n1, n2, t1, t2 });
}
function mnGap() {
  const { one, many, n1, n2, u1, u2, t1, t2 } = packs(3), gap = Math.abs(u1 - u2), lo = Math.min(u1, u2), hi = Math.max(u1, u2);
  return T({ ask: `Pack A has ${n1} ${many} for ${M$(t1)}. Pack B has ${n2} ${many} for ${M$(t2)}. How much less does one ${one} cost in the better pack, in dollars?`, answer: num(val(gap)),
    ways: [way('Price for one, then subtract', [`Pack A: ${D(t1)} ÷ ${n1} = ${D(u1)}`, `Pack B: ${D(t2)} ÷ ${n2} = ${D(u2)}`, `${D(hi)} − ${D(lo)} = ${b(D(gap))}`]),
      way('Work in cents', [`${fmt(t1)} ÷ ${n1} = ${u1} cents and ${fmt(t2)} ÷ ${n2} = ${u2} cents.`, `${hi} − ${lo} = ${gap} cents, which is ${b(M$(gap))}.`])],
    hint: 'Find the price of one item in each pack first.' }, 'mnGap', { n1, n2, t1, t2 });
}
function mnLeft() {
  for (;;) {
    const [, one, many, lo, hi] = pick(ITEMS), p = priceC(lo, Math.min(hi, 9)), n = rnd(2, 4), q = priceC(5, 18), spent = n * p + q, B = pick([40, 50, 60, 80, 100]), who = nm();
    if (spent >= B * 100) continue;
    const left = B * 100 - spent;
    return T({ story: `${who} has ${k('$' + B)}. ${who} buys ${k(pl(n, one, many))} at ${k(M$(p) + ' each')} and one more thing for ${k(M$(q))}.`, ask: 'How much money is left, in dollars?', answer: num(val(left)), op: 'multi',
      ways: [way('Two steps', [`Spent: ${n} × ${D(p)} = ${D(n * p)}, and ${D(n * p)} + ${D(q)} = ${D(spent)}`, `Left: ${B} − ${D(spent)} = ${b(D(left))}`]),
        way('Take away one at a time', [`After the ${many}: ${B} − ${D(n * p)} = ${D(B * 100 - n * p)}`, `After the other thing: ${D(B * 100 - n * p)} − ${D(q)} = ${b(D(left))}`])],
      read: rd('The money left over.', [`$${B} to start`, `${n} at ${M$(p)} each`, `one more at ${M$(q)}`], '“buys” means spending: add up everything bought, then subtract from the starting money', `${B} − (${n} × ${D(p)} + ${D(q)})`), hint: 'Add up everything that was bought first.' }, 'mnLeft', { B, n, p, q });
  }
}
function mnShare() {
  const n = rnd(3, 6), each = rnd(500, 1400) + pick([0, 25, 50, 75]), coupon = pick([200, 300, 400, 500]), net = n * each, sum = net + coupon, a = Math.round(rnd(35, 70) / 100 * sum / 5) * 5, c = sum - a, who = nm();
  return T({ story: `${who} and friends, ${k(n + ' people')} in all, order food for ${k(M$(a))} and drinks for ${k(M$(c))}. They use a ${k(M$(coupon) + ' coupon')}, then split the rest equally.`, ask: 'How much does each person pay, in dollars?', answer: num(val(each)), op: 'multi',
    ways: [way('Add, take off, share', [`${D(a)} + ${D(c)} = ${D(sum)}`, `${D(sum)} − ${D(coupon)} = ${D(net)}`, `${D(net)} ÷ ${n} = ${b(D(each))}`]),
      way('Work in cents', [`${fmt(a)} + ${fmt(c)} − ${fmt(coupon)} = ${fmt(net)} cents.`, `${fmt(net)} ÷ ${n} = ${fmt(each)} cents, which is ${b(M$(each))}.`])],
    read: rd('What ONE person pays.', [M$(a), M$(c), `${M$(coupon)} coupon`, `${n} people`], 'Add the bills, take the coupon off, then “split equally” means divide.', `(${D(a)} + ${D(c)} − ${D(coupon)}) ÷ ${n}`), hint: 'Add the two bills, take off the coupon, then share what is left.' }, 'mnShare', { a, c, coupon, n });
}
export function genMoney(L) {
  if (L === 1) return pick([() => moneyTotalWord(1), () => moneyChangeWord(1), mnTimes, () => moneySplitWord(1)])();
  if (L === 2) return pick([() => moneyTotalWord(2), () => moneyChangeWord(2), mnUnit, () => moneyBuyWord(2), () => mnBetter(2)])();
  return pick([mnLeft, mnShare, mnGap, () => moneyBuyWord(3), () => mnBetter(3)])();
}
