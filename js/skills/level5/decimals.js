// Multi-digit decimal operations in everyday contexts (money, lengths), plus whole-number long division.
import { R, rnd, pick, chance, fmt, plain, fixed, money, column, b, k, way, nm, num } from '../../util.js';
import { T } from './helpers.js';

// [name, cheapest, dearest] in whole dollars: every price in a story stays believable for the thing bought.
const ITEMS = [['a sandwich', 3, 12], ['a phone charger', 8, 30], ['a movie ticket', 8, 20], ['a set of guitar strings', 6, 25], ['a bag of dog treats', 4, 20], ['a notebook', 2, 8], ['a water bottle', 3, 20], ['a pack of batteries', 4, 15], ['a bus pass', 10, 45], ['a bike light', 5, 25]];
const price = (lo, hi) => rnd(lo * 20, hi * 20) * 5 / 100; // dollars, a multiple of 5 cents
const itemFor = L => pick(ITEMS.filter(i => L > 1 || i[1] <= 8));
const two = L => { const [x, y] = [itemFor(L), itemFor(L)]; return x === y ? two(L) : [x, y]; };
const itemPrice = (it, L) => price(it[1], L === 1 ? Math.min(it[2], 9) : it[2]);
const c = x => Math.round(x * 100);

export function addWord(L) {
  const [x, y] = two(L), a = itemPrice(x, L), bb = itemPrice(y, L), s = R(a + bb), n = nm();
  return T({ story: `${n} buys ${x[0]} for ${k(money(a))} and ${y[0]} for ${k(money(bb))}.`, ask: 'How much is that in all, in dollars?', answer: num(s), op: 'add',
    ways: [way('Line up the decimal points', [column([fixed(a, 2), fixed(bb, 2)], '+', fixed(s, 2)), `Points in one column means cents are added to cents and dollars to dollars: ${b(money(s))}`]),
      way('Dollars and cents apart', [`Dollars: ${Math.floor(a)} + ${Math.floor(bb)} = ${Math.floor(a) + Math.floor(bb)}`, `Cents: ${c(a) % 100} + ${c(bb) % 100} = ${c(a) % 100 + c(bb) % 100}${c(a) % 100 + c(bb) % 100 >= 100 ? ' (that is 1 dollar and ' + (c(a) % 100 + c(bb) % 100 - 100) + ' cents)' : ''}`, `Together: ${b(money(s))}`])],
    read: { find: 'The total cost.', know: [money(a), money(bb)], clue: '“In all” means put the amounts together.', plan: `${money(a)} + ${money(bb)}` }, hint: 'Line up the decimal points before you add.' }, 'dadd', { a, b: bb });
}
export function subWord(L) {
  const item = itemFor(L), cost = itemPrice(item, L), paid = [10, 20, 50].find(v => v > cost), d = R(paid - cost), up = Math.ceil(cost), n = nm();
  if (Number.isInteger(cost)) return subWord(L);
  return T({ story: `${n} buys ${item[0]} for ${k(money(cost))} and pays with a ${k('$' + paid + ' bill')}.`, ask: 'How much change does ' + n + ' get, in dollars?', answer: num(d), op: 'sub',
    ways: [way('Line up the decimal points', [`Write ${paid} as ${fixed(paid, 2)} so both numbers have two decimal places.`, column([fixed(paid, 2), fixed(cost, 2)], '−', fixed(d, 2)), `Change: ${b(money(d))}`]),
      way('Count up from the price', [`From ${money(cost)} up to ${money(up)} is ${money(up - cost)}.`, ...(up < paid ? [`From ${money(up)} up to ${money(paid)} is ${money(paid - up)}.`, `${money(up - cost)} + ${money(paid - up)} = ${b(money(d))}`] : [`So the change is ${b(money(d))}`])])],
    read: { find: 'The change (what comes back).', know: [`cost ${money(cost)}`, `paid $${paid}`], clue: 'Change is the difference between what you paid and the price.', plan: `${paid} − ${plain(cost)}` }, hint: `Write ${paid} as ${fixed(paid, 2)} and line up the points.` }, 'dsub', { a: paid, b: cost });
}
const SINGLES = [['concert poster', 5, 20], ['pizza slice', 2, 5], ['tube of tennis balls', 3, 8], ['pack of trading cards', 3, 9], ['smoothie', 4, 8]];
function timesCount() {
  const [what, lo, hi] = pick(SINGLES), n = rnd(3, 12), p = price(lo, hi), t = R(n * p), d = Math.floor(p), ct = c(p) % 100;
  if (!ct) return timesCount();
  return T({ story: `One ${what} costs ${k(money(p))}.`, ask: `How much do ${n} of them cost, in dollars?`, answer: num(t),
    ways: [way('Multiply as whole numbers, then place the point', [`Think in cents: ${money(p)} is ${c(p)} cents.`, `${c(p)} × ${n} = ${fmt(c(p) * n)} cents`, `100 cents make a dollar, so move the point two places: ${b(money(t))}`]),
      way('Dollars and cents apart', [`${n} × $${d} = $${n * d}`, `${n} × ${ct} cents = ${n * ct} cents = ${money(n * ct / 100)}`, `$${n * d} + ${money(n * ct / 100)} = ${b(money(t))}`])],
    hint: `Change ${money(p)} into cents, multiply, then change back.` }, 'dmul', { a: n, b: p });
}
// [food, verb, cheapest, dearest per kg, most kg bought]: the verb agrees with the food (rice costs, apples cost).
const BY_KG = [['cheese', 'costs', 8, 20, 3], ['rice', 'costs', 1, 4, 9], ['apples', 'cost', 2, 6, 6], ['coffee beans', 'cost', 15, 30, 2], ['trail mix', 'costs', 8, 16, 4]];
function timesWeight() {
  const [what, verb, lo, hi, most] = pick(BY_KG), w = rnd(1, most) + 0.5, p = R(rnd(lo * 5, hi * 5) * 0.2), t = R(w * p);
  return T({ story: `${what[0].toUpperCase() + what.slice(1)} ${verb} ${k(money(p) + ' per kg')}. ${nm()} buys ${k(plain(w) + ' kg')}.`, ask: 'What is the cost, in dollars?', answer: num(t),
    ways: [way('Split the weight', [`${Math.floor(w)} whole kg: ${Math.floor(w)} × ${money(p)} = ${money(Math.floor(w) * p)}`, `Half a kg costs half the price: ${money(p)} ÷ 2 = ${money(p / 2)}`, `${money(Math.floor(w) * p)} + ${money(p / 2)} = ${b(money(t))}`]),
      way('Multiply without the points', [`${plain(w)} × ${fixed(p, 1)}: drop the points and multiply ${plain(R(w * 10))} × ${plain(R(p * 10))} = ${fmt(R(w * p * 100))}`, `The two numbers had 2 decimal places in all, so put 2 back: ${b(fixed(t, 2))}`])],
    hint: `${plain(w)} kg is ${Math.floor(w)} kg and half a kg.` }, 'dmul', { a: w, b: R(p) });
}
const CUTS = [['rope', 'm', 100, 'cm'], ['ribbon', 'm', 100, 'cm'], ['wire', 'm', 100, 'cm'], ['juice', 'liters', 1000, 'mL'], ['fabric', 'm', 100, 'cm']];
function howManyFit() {
  const piece = pick([0.25, 0.4, 0.75, 1.5, 0.6, 1.25, 2.5, 0.8, 0.15, 0.35]), q = rnd(3, 24), total = R(piece * q), [what, unit, f, sm] = pick(CUTS), m = Number.isInteger(R(piece * 10)) ? 10 : 100;
  return T({ story: `There are ${k(plain(total) + ' ' + unit)} of ${what}. It is split into equal parts of ${k(plain(piece) + ' ' + unit)} each.`, ask: 'How many parts is that?', answer: num(q),
    ways: [way('Make the divisor a whole number', [`Multiply both numbers by ${m}. The answer does not change, because both get bigger by the same factor.`, `${plain(total)} ÷ ${plain(piece)} = ${fmt(R(total * m))} ÷ ${fmt(R(piece * m))}`, `${fmt(R(total * m))} ÷ ${fmt(R(piece * m))} = ${b(q)}`]),
      way('Use a smaller unit', [`1 ${unit === 'm' ? 'm' : 'liter'} = ${fmt(f)} ${sm}, so ${plain(total)} ${unit} = ${fmt(R(total * f))} ${sm} and ${plain(piece)} ${unit} = ${fmt(R(piece * f))} ${sm}.`, `${fmt(R(total * f))} ÷ ${fmt(R(piece * f))} = ${b(q)}`, `Check: ${q} × ${plain(piece)} = ${plain(total)}`])],
    hint: `Multiply both numbers by ${m} so you are dividing by a whole number.` }, 'ddiv', { a: total, b: piece });
}
const EACH = [['smoothies', 3, 7], ['movie snacks', 3, 8], ['bus tickets', 2, 5], ['phone cables', 4, 8], ['sketch pads', 3, 8]];
export function changeWord() {
  const [what, lo, hi] = pick(EACH), n = rnd(2, 6), p = price(lo, hi), cost = R(n * p), paid = [10, 20, 50].find(v => v > cost), d = R(paid - cost), who = nm();
  return T({ story: `${who} buys ${k(n + ' ' + what)} at ${k(money(p) + ' each')} and pays with a ${k('$' + paid + ' bill')}.`, ask: `How much change does ${who} get, in dollars?`, answer: num(d), op: 'multi',
    ways: [way('Total first, then change', [`Cost: ${n} × ${money(p)} = ${money(cost)}`, column([fixed(paid, 2), fixed(cost, 2)], '−', fixed(d, 2)), `Change: ${b(money(d))}`]),
      way('Work in cents', [`${n} × ${c(p)} cents = ${fmt(c(cost))} cents`, `$${paid} is ${fmt(paid * 100)} cents. ${fmt(paid * 100)} − ${fmt(c(cost))} = ${fmt(c(d))} cents`, `${fmt(c(d))} cents = ${b(money(d))}`])],
    read: { find: 'The change, after paying for all of them.', know: [`${n} items`, `${money(p)} each`, `paid $${paid}`], clue: '“Each” means multiply to get the total. “Change” means subtract it from what was paid.', plan: `${n} × ${plain(p)}, then ${paid} − that` }, hint: 'Find the total cost first.' }, 'change', { n, p, paid });
}
export function splitWord() {
  const n = rnd(2, 6), each = price(3, 15), total = R(each * n), a = price(2, Math.floor(total) - 1), bb = R(total - a), who = nm();
  return T({ story: `${who} and friends order food for ${k(money(a))} and drinks for ${k(money(bb))}. ${k(n + ' people')} share the bill equally.`, ask: 'How much does each person pay, in dollars?', answer: num(each), op: 'multi',
    ways: [way('Add, then share', [column([fixed(a, 2), fixed(bb, 2)], '+', fixed(total, 2)), `${money(total)} ÷ ${n} = ${b(money(each))}`, `Check: ${n} × ${money(each)} = ${money(total)}`]),
      way('Work in cents', [`${fmt(c(a))} + ${fmt(c(bb))} = ${fmt(c(total))} cents`, `${fmt(c(total))} ÷ ${n} = ${fmt(c(each))} cents = ${b(money(each))}`])],
    read: { find: 'One person’s share.', know: [money(a), money(bb), `${n} people`], clue: '“Share equally” means divide the whole bill.', plan: `(${plain(a)} + ${plain(bb)}) ÷ ${n}` }, hint: 'What is the whole bill?' }, 'split', { a, b: bb, n });
}
// Compatible numbers: a divisor ending in 0 or 5, and a dividend that is a whole number of those. Say honestly how close it lands.
function estimateSteps(t, d, q) {
  const dE = Math.max(10, Math.round(d / 5) * 5), raw = t / dE, step = raw < 50 ? 5 : 10, eq = Math.max(step, Math.round(raw / step) * step), tE = dE * eq, why = [];
  if (dE !== d) why.push(`${d} was rounded ${dE > d ? 'up' : 'down'} to ${dE}, which makes the estimate ${dE > d ? 'smaller' : 'bigger'}`);
  if (tE !== t) why.push(`${fmt(t)} was moved ${tE > t ? 'up' : 'down'} to ${fmt(tE)}, which makes the estimate ${tE > t ? 'bigger' : 'smaller'}`);
  return [`Pick friendly numbers that divide evenly: ${d} is close to ${dE}, and ${fmt(t)} is close to ${fmt(tE)} (${dE} × ${eq}).`, `${fmt(tE)} ÷ ${dE} = ${eq}`,
    Math.abs(eq - q) / q <= 0.15 ? `The estimate ${eq} is close, so the exact answer should be near ${eq}.` : `${eq} is a rough guide only: it comes out ${eq > q ? 'too high' : 'too low'} because ${why.join(' and ')}.`,
    `Check the exact answer by multiplying: ${q} × ${d} = ${fmt(t)}`];
}
function longDivide() {
  const d = rnd(12, 48), q = rnd(13, 98), t = d * q, tens = Math.floor(q / 10) * 10, ones = q % 10;
  return T({ story: `An arena has ${k(fmt(t) + ' seats')} set out in rows of ${k(d)}.`, ask: 'How many rows are there?', answer: num(q),
    ways: [way('Friendly chunks', [`${tens} rows use ${d} × ${tens} = ${fmt(d * tens)} seats. Left: ${fmt(t)} − ${fmt(d * tens)} = ${d * ones}`, ones ? `${d * ones} ÷ ${d} = ${ones} more rows.` : 'Nothing is left over.', `${tens} + ${ones} = ${b(q)} rows`]),
      way('Estimate, then check', estimateSteps(t, d, q))],
    hint: `How many ${d}s are in ${fmt(t)}? Try multiples of 10 rows first.` }, 'ddiv', { a: t, b: d });
}
export function genDecOps(L) {
  if (L === 1) return chance(0.5) ? addWord(1) : subWord(1);
  if (L === 2) return pick([timesCount, timesWeight, howManyFit, () => addWord(2), () => subWord(2)])();
  return pick([changeWord, splitWord, longDivide, howManyFit])();
}
