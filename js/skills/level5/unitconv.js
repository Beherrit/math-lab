// Converting units with ratios: ratio tables, double number lines, speeds and prices.
import { R, rnd, pick, chance, fmt, money, b, k, way, num, choice, table } from '../../util.js';
import { T, pl } from './helpers.js';
import { doubleLine } from './draw.js';

const U = { m: ['meter', 'meters'], cm: ['centimeter', 'centimeters'], km: ['kilometer', 'kilometers'], g: ['gram', 'grams'], kg: ['kilogram', 'kilograms'], L: ['liter', 'liters'], mL: ['milliliter', 'milliliters'],
  h: ['hour', 'hours'], min: ['minute', 'minutes'], s: ['second', 'seconds'], ft: ['foot', 'feet'], in: ['inch', 'inches'], yd: ['yard', 'yards'], lb: ['pound', 'pounds'], oz: ['ounce', 'ounces'], gal: ['gallon', 'gallons'], qt: ['quart', 'quarts'], cup: ['cup', 'cups'] };
const word = (n, u) => pl(n, ...U[u]), many = u => U[u][1];
// a big unit and a small one, f small units in one big one; lo..hi is a believable amount of the big unit; s says it in a sentence.
const CONV = [
  { a: 'm', b: 'cm', f: 100, lo: 2, hi: 9, s: u => `A ribbon is ${k(u)} long.` }, { a: 'km', b: 'm', f: 1000, lo: 2, hi: 9, s: u => `A bike trail is ${k(u)} long.` },
  { a: 'kg', b: 'g', f: 1000, lo: 2, hi: 6, s: u => `A bag of flour weighs ${k(u)}.` }, { a: 'L', b: 'mL', f: 1000, lo: 2, hi: 5, s: u => `A water jug holds ${k(u)}.` },
  { a: 'h', b: 'min', f: 60, lo: 2, hi: 4, s: u => `A movie lasts ${k(u)}.` }, { a: 'min', b: 's', f: 60, lo: 2, hi: 6, s: u => `A song is ${k(u)} long.` },
  { a: 'ft', b: 'in', f: 12, lo: 2, hi: 9, s: u => `A bookshelf is ${k(u)} long.` }, { a: 'yd', b: 'ft', f: 3, lo: 5, hi: 30, s: u => `A garden path is ${k(u)} long.` },
  { a: 'lb', b: 'oz', f: 16, lo: 2, hi: 8, s: u => `A bag of dog food weighs ${k(u)}.` }, { a: 'gal', b: 'qt', f: 4, lo: 2, hi: 10, s: u => `A fish tank holds ${k(u)} of water.` },
];
// The amount of the big unit: whole in step 1, halves in step 2, quarters in step 3.
const amount = (c, L) => rnd(c.lo * (L === 1 ? 1 : L === 2 ? 2 : 4), c.hi * (L === 1 ? 1 : L === 2 ? 2 : 4)) / (L === 1 ? 1 : L === 2 ? 2 : 4);
const read = (find, know, clue, plan) => ({ find, know, clue, plan });

function tableProblem() {
  const c = pick(CONV), x = rnd(3, 9), ans = x * c.f;
  return T({ ask: `${b('1 ' + c.a)} is ${b(fmt(c.f) + ' ' + c.b)}. What number goes in the blank?`, visual: table([many(c.a), many(c.b)], [[1, fmt(c.f)], [2, fmt(2 * c.f)], [x, b('?')]]), answer: num(ans),
    ways: [way('Multiply across', [`Every row has the same ratio: 1 to ${fmt(c.f)}.`, `The blank row has ${x} ${many(c.a)}, which is ${x} times the first row. Do the same to the other column.`, `${fmt(c.f)} × ${x} = ${b(fmt(ans))}`]),
      way('Add one more each time', [`Each row adds another ${fmt(c.f)} ${many(c.b)}: ${Array.from({ length: x }, (_, i) => fmt(c.f * (i + 1))).join(', ')}.`, `The ${x}th number is ${b(fmt(ans))}.`])],
    hint: 'How many times bigger than the first row is the blank row? Do the same to the other number.' }, 'ucTable', { f: c.f, x });
}
function doubleProblem() {
  const c = pick(CONV), toSmall = chance(0.5), f = c.f;
  const top = ['0', '1', '2', toSmall ? '3' : '?'], bottom = ['0', fmt(f), fmt(2 * f), toSmall ? '?' : fmt(3 * f)], ans = toSmall ? 3 * f : 3;
  return T({ ask: `The two lines show the same lengths, ${many(c.a)} on top and ${many(c.b)} underneath. What number belongs at the ?`, visual: doubleLine(top, bottom, many(c.a), many(c.b)), answer: num(ans),
    ways: [way('Move together', [`Each step on the top line is 1 ${U[c.a][0]}. Each step on the bottom line is ${fmt(f)} ${many(c.b)}.`, toSmall ? `3 steps along the top line is 3 ${many(c.a)}, so on the bottom line it is 3 × ${fmt(f)} = ${b(fmt(ans))}.` : `${fmt(3 * f)} is ${3} steps of ${fmt(f)}, so on the top line it is ${b(3)} ${many(c.a)}.`]),
      way('Use the ratio', [`The ratio is 1 to ${fmt(f)}, and it never changes along the lines.`, toSmall ? `Top 3 means 3 times as much, so the bottom is ${fmt(f)} × 3 = ${b(fmt(ans))}.` : `${fmt(3 * f)} ÷ ${fmt(f)} = ${b(3)}`])],
    hint: 'Both lines have the same number of steps. How big is one step on each?' }, 'ucDouble', { f, toSmall });
}
// Break the amount into two pieces, change each, and add them.
function splitWay(n, c) {
  const w = Math.floor(n), part = R(n - w), p1 = part ? w : Math.floor(w / 2), p2 = part || w - p1, big = R(p1 * c.f), small = R(p2 * c.f);
  return way('Split it into two easy pieces', [`${fmt(n)} ${many(c.a)} is ${fmt(p1)} ${part ? 'and' : '+'} ${fmt(p2)}: change each piece on its own.`, `${fmt(p1)} × ${fmt(c.f)} = ${fmt(big)} and ${fmt(p2)} × ${fmt(c.f)} = ${fmt(small)}`, `${fmt(big)} + ${fmt(small)} = ${b(fmt(R(big + small)))}`]);
}
function toSmaller(L) {
  const c = pick(CONV), n = amount(c, L), ans = R(n * c.f);
  return T({ story: c.s(word(n, c.a)), ask: `How many ${many(c.b)} is that?`, answer: num(ans), op: 'mul',
    ways: [way('Ratio table', [`1 ${U[c.a][0]} is ${fmt(c.f)} ${many(c.b)}.`, table([many(c.a), many(c.b)], [[1, fmt(c.f)], [b(fmt(n)), b(fmt(ans))]]), `Multiply both columns by ${fmt(n)}: ${fmt(c.f)} × ${fmt(n)} = ${b(fmt(ans))}`]),
      splitWay(n, c)],
    read: read(`The same amount in ${many(c.b)}.`, [`${fmt(n)} ${many(c.a)}`, `1 ${U[c.a][0]} = ${fmt(c.f)} ${many(c.b)}`], 'Smaller units mean more of them, so the number gets bigger.', `${fmt(n)} × ${fmt(c.f)}`),
    hint: `One ${U[c.a][0]} is ${fmt(c.f)} ${many(c.b)}. The new unit is smaller, so will the number be bigger or smaller?` }, 'ucMul', { n, f: c.f });
}
function toBigger(L) {
  const c = pick(CONV), n = amount(c, L), total = R(n * c.f);
  if (n === c.f) return toBigger(L);
  return T({ story: c.s(word(total, c.b)), ask: `How many ${many(c.a)} is that?`, answer: num(n), op: 'div',
    ways: [way('Ratio table', [`${fmt(c.f)} ${many(c.b)} make 1 ${U[c.a][0]}.`, table([many(c.b), many(c.a)], [[fmt(c.f), 1], [b(fmt(total)), b(fmt(n))]]), `Divide both columns by ${fmt(c.f)}: ${fmt(total)} ÷ ${fmt(c.f)} = ${b(fmt(n))}`]),
      way('Check by going back', [`A ${U[c.a][0]} is bigger than a ${U[c.b][0]}, so there are fewer of them. Divide.`, `${fmt(total)} ÷ ${fmt(c.f)} = ${b(fmt(n))}`, `Check: ${fmt(n)} × ${fmt(c.f)} = ${fmt(total)}`])],
    read: read(`The same amount in ${many(c.a)}.`, [`${fmt(total)} ${many(c.b)}`, `${fmt(c.f)} ${many(c.b)} = 1 ${U[c.a][0]}`], 'Bigger units mean fewer of them, so the number gets smaller.', `${fmt(total)} ÷ ${fmt(c.f)}`),
    hint: `${fmt(c.f)} ${many(c.b)} make 1 ${U[c.a][0]}. How many groups of ${fmt(c.f)} are in the amount?` }, 'ucDiv', { n: total, f: c.f });
}
function whichOp(L) {
  const c = pick(CONV), toBig = chance(0.5), n = rnd(2, L === 1 ? 9 : 20) * (toBig ? c.f : 1), [from, to] = toBig ? [c.b, c.a] : [c.a, c.b];
  const good = toBig ? `Divide by ${fmt(c.f)}` : `Multiply by ${fmt(c.f)}`;
  return T({ ask: `${b('1 ' + c.a)} = ${b(fmt(c.f) + ' ' + c.b)}. To change ${b(fmt(n) + ' ' + from)} into ${many(to)}, what do you do?`, answer: choice(good, [toBig ? `Multiply by ${fmt(c.f)}` : `Divide by ${fmt(c.f)}`, `Add ${fmt(c.f)}`, `Subtract ${fmt(c.f)}`]), choiceBig: true,
    ways: [way('Which unit is bigger?', [`A ${U[c.a][0]} is bigger than a ${U[c.b][0]}. You need more small units to make the same length.`, toBig ? `You are going from the small unit to the big one, so the number gets smaller. You ${b(good.toLowerCase())}.` : `You are going from the big unit to the small one, so the number gets bigger. You ${b(good.toLowerCase())}.`]),
      way('Test with 1', [`1 ${from} changed into ${many(to)} should give ${toBig ? 'a small piece' : fmt(c.f)}.`, toBig ? `1 ÷ ${fmt(c.f)} is a small piece, so it must be that you ${b(good.toLowerCase())}.` : `1 × ${fmt(c.f)} = ${fmt(c.f)}, so you ${b(good.toLowerCase())}.`])],
    hint: 'Is the unit you are changing into bigger or smaller than the one you start with?' }, 'ucWhich', { n, f: c.f, toBig });
}
// Rates in one unit of time, changed to another. up: multiply (per second to per minute), else divide.
const SPEED = [
  { up: true, f: 60, lo: 20, hi: 30, s: r => `A cheetah sprints ${k(r + ' meters')} every second.`, ask: 'How many meters is that in one minute?' },
  { up: true, f: 60, lo: 5, hi: 12, s: r => `A garden snail crawls ${k(r + ' centimeters')} every minute.`, ask: 'How many centimeters is that in one hour?' },
  { up: true, f: 60, lo: 8, hi: 30, s: r => `A printer prints ${k(r + ' pages')} every minute.`, ask: 'How many pages is that in one hour?' },
  { up: true, f: 60, lo: 5, hi: 25, s: r => `A phone downloads ${k(r + ' MB')} every second.`, ask: 'How many MB is that in one minute?' },
  { up: false, f: 60, lo: 60, hi: 180, step: 30, s: r => `A train travels ${k(r + ' km')} every hour.`, ask: 'How many km is that in one minute?' },
  { up: false, f: 60, lo: 60, hi: 300, step: 60, s: r => `A phone downloads ${k(r + ' MB')} every minute.`, ask: 'How many MB is that in one second?' },
];
function speed() {
  const c = pick(SPEED), r = c.step ? rnd(c.lo / c.step, c.hi / c.step) * c.step : rnd(c.lo, c.hi), ans = c.up ? r * c.f : r / c.f;
  return T({ story: c.s(fmt(r)), ask: c.ask, answer: num(ans), op: 'mul',
    ways: [way('Use the conversion ratio', [`1 hour is ${c.f} minutes, and 1 minute is ${c.f} seconds: the ratio is always 1 to ${c.f}.`, c.up ? `A longer time covers more, so multiply: ${fmt(r)} × ${c.f} = ${b(fmt(ans))}` : `A shorter time covers less, so divide: ${fmt(r)} ÷ ${c.f} = ${b(fmt(ans))}`]),
      way('Ratio table', [table(c.up ? ['short time', 'long time'] : ['long time', 'short time'], [[1, c.f], [b(fmt(c.up ? r : ans)), b(fmt(c.up ? ans : r))]]), c.up ? `Multiply by ${c.f}: ${b(fmt(ans))}` : `Divide by ${c.f}: ${b(fmt(ans))}`])],
    read: read(c.ask.replace(/\?$/, '.'), [`${fmt(r)} each time unit`, `the ratio is 1 to ${c.f}`], c.up ? 'A longer time covers more.' : 'A shorter time covers less.', c.up ? `${fmt(r)} × ${c.f}` : `${fmt(r)} ÷ ${c.f}`),
    hint: c.up ? 'The time you are changing to is longer. Will the amount be more or less?' : 'The time you are changing to is shorter. Will the amount be more or less?' }, 'ucSpeed', { r, f: c.f, up: c.up });
}
// Price per big unit, bought in small units: [item, big, small, price range, amounts in the small unit].
const BUY = [['Cheese', 'kg', 'g', 6, 18, [250, 500, 750]], ['Orange juice', 'L', 'mL', 2, 6, [250, 500, 750]], ['Ribbon', 'm', 'cm', 2, 8, [25, 50, 75, 150, 250]], ['Trail mix', 'kg', 'g', 8, 16, [100, 250, 500]]];
function price() {
  const [item, a, bb, lo, hi, amts] = pick(BUY), p = rnd(lo, hi), n = pick(amts), f = a === 'm' ? 100 : 1000, cost = R(p * n / f);
  return T({ story: `${item} costs ${k('$' + p)} per ${U[a][0]}. ${pick(['Mia', 'Leo', 'Sam', 'Zoe'])} buys ${k(word(n, bb))}.`, ask: 'How much does that cost, in dollars?', answer: num(cost), op: 'multi',
    ways: [way('Change the amount first', [`${word(n, bb)} is ${fmt(n)} ÷ ${fmt(f)} = ${fmt(R(n / f))} ${many(a)}.`, `${fmt(R(n / f))} × $${p} = ${b(money(cost))}`]),
      way('Price of one small unit', [`1 ${U[a][0]} costs $${p}, which is ${fmt(p * 100)} cents, and it has ${fmt(f)} ${many(bb)}.`, `${fmt(p * 100)} ÷ ${fmt(f)} = ${fmt(R(p * 100 / f))} cents for 1 ${U[bb][0]}. ${fmt(R(p * 100 / f))} × ${fmt(n)} = ${fmt(R(p * n * 100 / f))} cents.`, `${fmt(R(p * n * 100 / f))} cents is ${b(money(cost))}.`])],
    read: read('The cost of that amount.', [`$${p} per ${U[a][0]}`, `${fmt(n)} ${many(bb)}`], 'The price is for the big unit, but the amount is in the small unit.', `${fmt(n)} ÷ ${fmt(f)}, then × ${p}`),
    hint: `The price is for 1 ${U[a][0]}. How much of a ${U[a][0]} is the amount bought?` }, 'ucPrice', { p, n, f });
}
const CHAIN = [
  { a: 'h', m: 'min', z: 's', f1: 60, f2: 60, lo: 2, hi: 5, s: u => `A flight lasts ${k(u)}.` }, { a: 'km', m: 'm', z: 'cm', f1: 1000, f2: 100, lo: 2, hi: 5, s: u => `A cycle race is ${k(u)} long.` },
  { a: 'yd', m: 'ft', z: 'in', f1: 3, f2: 12, lo: 3, hi: 20, s: u => `A fence is ${k(u)} long.` }, { a: 'gal', m: 'qt', z: 'cup', f1: 4, f2: 4, lo: 2, hi: 9, s: u => `A water cooler holds ${k(u)}.` },
];
function chain() {
  const c = pick(CHAIN), n = rnd(c.lo * 2, c.hi * 2) / 2, mid = R(n * c.f1), ans = R(mid * c.f2);
  return T({ story: c.s(word(n, c.a)), ask: `How many ${many(c.z)} is that?`, answer: num(ans), op: 'multi',
    ways: [way('One conversion at a time', [`${U[c.a][1]} to ${many(c.m)}: ${fmt(n)} × ${fmt(c.f1)} = ${fmt(mid)}.`, `${many(c.m)} to ${many(c.z)}: ${fmt(mid)} × ${fmt(c.f2)} = ${b(fmt(ans))}`]),
      way('Join the two ratios', [`1 ${U[c.a][0]} is ${fmt(c.f1)} ${many(c.m)}, and 1 ${U[c.m][0]} is ${fmt(c.f2)} ${many(c.z)}.`, `So 1 ${U[c.a][0]} is ${fmt(c.f1)} × ${fmt(c.f2)} = ${fmt(c.f1 * c.f2)} ${many(c.z)}.`, `${fmt(n)} × ${fmt(c.f1 * c.f2)} = ${b(fmt(ans))}`])],
    read: read(`The amount in ${many(c.z)}.`, [`${fmt(n)} ${many(c.a)}`, `1 ${U[c.a][0]} = ${fmt(c.f1)} ${many(c.m)}`, `1 ${U[c.m][0]} = ${fmt(c.f2)} ${many(c.z)}`], 'Change to the middle unit first, then to the last one.', `${fmt(n)} × ${fmt(c.f1)} × ${fmt(c.f2)}`),
    hint: `Go in two jumps: ${many(c.a)} to ${many(c.m)} first. Then ${many(c.m)} to ${many(c.z)}.` }, 'ucChain', { n, f1: c.f1, f2: c.f2 });
}
// Two packs priced in different units: change to the same unit to compare.
function bestBuy() {
  const rate = rnd(6, 16), n1 = pick([250, 500, 750]), p1 = R(rate * n1 / 1000), n2 = rnd(2, 4), gap = pick([-2, -1, 1, 2]), rate2 = rate + gap, p2 = rate2 * n2, win = rate < rate2 ? 'Store A' : 'Store B';
  return T({ ask: `Store A sells ${b(n1 + ' g')} of cheese for ${b(money(p1))}. Store B sells ${b(n2 + ' kg')} for ${b(money(p2))}. Which is the better buy?`, answer: choice(win, [], { all: ['Store A', 'Store B'] }), choiceBig: true,
    ways: [way('Price per kilogram', [`Store A: ${n1} g is ${fmt(n1 / 1000)} kg. ${money(p1)} ÷ ${fmt(n1 / 1000)} = ${money(rate)} per kg.`, `Store B: ${money(p2)} ÷ ${n2} = ${money(rate2)} per kg.`, `${money(Math.min(rate, rate2))} is less than ${money(Math.max(rate, rate2))}, so ${b(win)} is the better buy.`]),
      way('Same amount', [`Change Store B to grams: ${n2} kg = ${fmt(n2 * 1000)} g. Both are now priced in grams.`, `${fmt(n2 * 1000)} g for ${money(p2)} is ${money(rate2)} for each 1,000 g. Store A is ${money(rate)} for each 1,000 g.`, `The lower price for the same amount is ${b(win)}.`])],
    hint: 'The packs are in different units. Change them to the same unit, then compare the price of the same amount.' }, 'ucBest', { n1, p1, n2, p2 });
}
const SHAPES = { 1: [tableProblem, doubleProblem, () => toSmaller(1), () => whichOp(1)], 2: [() => toSmaller(2), () => toBigger(2), speed, price, () => whichOp(2), doubleProblem], 3: [chain, bestBuy, price, speed, () => toBigger(3), () => toSmaller(3)] };
export const genUnitConv = L => pick(SHAPES[L])();
export const convWord = () => pick([() => toSmaller(2), () => toBigger(2), speed, price, chain])();
