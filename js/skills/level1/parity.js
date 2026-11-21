// Even and odd: pairing up, the last digit rule, what is left over, and whether a sum is even or odd.
import { rnd, pick, shuffle, b, way, nm, num, choice } from '../../util.js';
import { pairDots } from './counters.js';
import { cnt, mark, evenOdd, uniq, countList } from './words.js';

const EO = ['Even', 'Odd'], low = n => evenOdd(n).toLowerCase();
const lastDigit = n => `The last digit of ${n} is ${n % 10}. ${n % 2 ? 'Odd numbers end in 1, 3, 5, 7 or 9.' : 'Even numbers end in 0, 2, 4, 6 or 8.'}`;
const pairWay = n => way('Make pairs', [`Share ${n} counters into pairs: ${cnt(Math.floor(n / 2), 'pair')}, and ${n % 2 ? 'one counter has no partner' : 'none are left over'}.`, `${n} is ${b(low(n))}.`]);
const digitWay = n => way('Look at the last digit', [lastDigit(n), `So ${n} is ${b(low(n))}.`]);

function classQ(n, pic) {
  return { ask: pic ? `Are these counters even or odd?${mark(n)}` : `Is ${b(n)} even or odd?`, visual: pic ? pairDots(n) : undefined, answer: choice(evenOdd(n), [], { all: EO }), choiceBig: true,
    hint: pic ? 'Is there a counter left without a partner?' : 'Look at the last digit, or think about making pairs.', _t: { f: 'parity', xs: [n] }, ways: [pairWay(n), digitWay(n)] };
}
function leftoverQ(n) {
  const left = n % 2;
  return { ask: `How many counters have no partner?${mark(n)}`, visual: pairDots(n), answer: num(left), hint: 'Look for a counter with no frame round it.', _t: { f: 'rem', a: n, b: 2 },
    ways: [way('Look for a lone counter', [`Every counter inside a frame has a partner.`, `The counters with no frame: ${b(left)}.`]),
      way('Think odd or even', [`An even number has none left over and an odd number has one left over.`, `${n} is ${low(n)}, so the number with no partner is ${b(left)}.`])] };
}
function pairsQ(n) {
  const k = n / 2;
  return { ask: `How many pairs can you make from ${b(n)} counters?`, answer: num(k), hint: 'Each pair uses two counters. How many twos fit in the number?', _t: { f: 'div', a: n, b: 2 },
    ways: [way('Count in twos', [`Count by twos until you reach ${n}: ${countList(0, k, 1, 2)}.`, `That took ${k} counts, so there are ${b(k)} pairs.`]), way('Halve it', [`Pairs use 2 at a time, so halve the number.`, `${n} ÷ 2 = ${b(k)}.`])] };
}
function whichQ(want, lo, hi) {
  const right = want === 'Even' ? 0 : 1, pool = uniq(8, lo, hi), mine = pool.find(v => v % 2 === right), others = pool.filter(v => v % 2 !== right).slice(0, 3);
  if (mine === undefined || others.length < 3) return whichQ(want, lo, hi);
  const opts = shuffle([mine, ...others]);
  return { ask: `Which of these numbers is ${want.toLowerCase()}?`, answer: choice(String(mine), others.map(String)), choiceBig: true, hint: 'Look at the last digit of each number.', _t: { f: 'which', want },
    ways: [way('Check the last digits', [`${opts.map(v => `${v} ends in ${v % 10}`).join(', ')}.`, `${want} numbers end in ${want === 'Even' ? '0, 2, 4, 6 or 8' : '1, 3, 5, 7 or 9'}, so ${b(mine)} is the one.`]),
      way('Try making pairs', [`Pair up the counters for ${mine}: ${mine % 2 ? 'one counter would be left over' : 'every counter gets a partner'}.`, `So ${b(mine)} is ${want.toLowerCase()}.`])] };
}
// Which sum is even/odd? The options are sums, judged without adding them all up.
function whichSumQ(want) {
  const right = want === 'Even' ? 0 : 1, make = r => { const a = rnd(11, 80), c = rnd(11, 80); return (a + c) % 2 === r ? [a, c] : make(r); };
  const opts = [make(right), ...[1, 2, 3].map(() => make(1 - right))], sums = opts.map(([a, c]) => a + c);
  if (new Set(sums).size < 4) return whichSumQ(want);
  const text = opts.map(([a, c]) => `${a} + ${c}`), mine = text[0];
  return { ask: `Which sum is ${want.toLowerCase()}? You do not need to add them all.`, answer: choice(mine, text.slice(1)), choiceBig: true, hint: 'Is each number even or odd? Think about what happens to the partners left over.', _t: { f: 'which', want },
    ways: [way('Use the pairing rule', opts.map(([a, c]) => `${a} is ${low(a)} and ${c} is ${low(c)}, so ${a} + ${c} is ${low(a + c)}.`).concat([`So ${b(mine)} is the ${want.toLowerCase()} sum.`])),
      way('Add them and check the last digit', [`${text.map((t, i) => `${t} = ${sums[i]}`).join(', ')}.`, `Only ${sums[0]} is ${want.toLowerCase()}, so ${b(mine)} is the one.`])] };
}
function sumQ(xs) {
  const s = xs.reduce((p, q) => p + q, 0), w = low(s), text = xs.join(' + '), k = xs.filter(x => x % 2).length;
  return { ask: `Is the sum ${b(text)} even or odd?`, answer: choice(evenOdd(s), [], { all: EO }), choiceBig: true, hint: 'Is each number even or odd? Count how many odd ones there are.', _t: { f: 'parity', xs },
    ways: [way('Use the pairing rule', [`${xs.map(x => `${x} is ${low(x)}`).join(', ')}.`, `Each odd number leaves one counter without a partner. Here the left-over counters number ${k}.`, `${k % 2 ? 'They cannot all pair up' : 'They all pair up'}, so the sum is ${b(w)}.`]),
      way('Add, then look at the last digit', [`${text} = ${s}.`, `${s} ends in ${s % 10}, so it is ${b(w)}.`])] };
}
function ruleQ(p, q) {
  const [x, y] = [p === 'odd' ? 7 : 4, q === 'odd' ? 3 : 2], odds = [p, q].filter(v => v === 'odd').length, w = odds === 1 ? 'odd' : 'even';
  const pairs = ['No counters are left over, so everything pairs up.', 'One counter is left over with no partner.', 'Two counters are left over, and they pair up with each other.'][odds];
  return { ask: `An ${b(p)} number plus an ${b(q)} number is always...`, answer: choice(w === 'odd' ? 'Odd' : 'Even', [], { all: EO }), choiceBig: true, hint: 'Try it with two small numbers of your own.', _t: { f: 'rule', p: [p, q] },
    ways: [way('Try it with numbers', [`${x} is ${p} and ${y} is ${q}.`, `${x} + ${y} = ${x + y}, which is ${low(x + y)}. Other numbers work the same way, so it is always ${b(w)}.`]), way('Think of counters', [`An even number has none left over. An odd number has one left over.`, `${pairs} The answer is always ${b(w)}.`])] };
}
function claimQ(n) {
  const w = low(n), claim = w === 'even' ? 'odd' : 'even', first = +String(n)[0];
  return { ask: `${nm()} says ${b(n)} is ${claim} because its first digit, ${first}, is ${claim}. What kind of number is ${b(n)} really?`, answer: choice(evenOdd(n), [], { all: EO }), choiceBig: true,
    hint: 'Only one digit decides. Which one?', _t: { f: 'parity', xs: [n] },
    ways: [digitWay(n), way('Split off the tens', [`Every ten pairs up with none left over, so ${n - n % 10} is fine.`, `That leaves ${n % 10}, which is ${low(n % 10)}. So ${n} is ${b(w)}.`])] };
}
function nextQ(n, want) {
  const d = n % 2 === (want === 'even' ? 0 : 1) ? 2 : 1, r = n + d;
  return { ask: `What is the next ${want} number after ${b(n)}?`, answer: num(r), hint: 'Even and odd numbers take turns.', _t: { f: 'add', xs: [n, d] },
    ways: [way('Count on and check', [`Count on from ${n}: ${countList(n, d)}.`, `The first ${want} number is ${b(r)}.`]), way('Use the turns', [`${n} is ${low(n)}, so the number after it is ${low(n + 1)}.`, `${n} + ${d} = ${b(r)}.`])] };
}
function shareQ(n) {
  const [item, who] = pick([['cards', 'two players'], ['stickers', 'two friends'], ['marbles', 'two cousins'], ['tickets', 'two teammates']]), left = n % 2;
  return { ask: `${n} ${item} are shared equally between ${who}. How many are left over?`, answer: num(left), hint: 'Deal them out two at a time. What is left at the end?', _t: { f: 'rem', a: n, b: 2 },
    ways: [way('Pair them up', [`Deal them out two at a time, one for each. ${Math.floor(n / 2)} each, and ${left ? 'one is left over' : 'none are left over'}.`, `The number left over is ${b(left)}.`]),
      way('Even or odd?', [lastDigit(n), `${n} is ${low(n)}, so the number left over is ${b(left)}.`])] };
}
// A number whose first digit is not the same kind as the whole number.
function oddlyStarted(lo, hi) { let n; do n = rnd(lo, hi); while ((+String(n)[0]) % 2 === n % 2); return n; }

export function genParity(L) {
  if (L === 1) {
    const t = pick(['pic', 'plain', 'left', 'which', 'next', 'pairs']);
    if (t === 'pic') return classQ(rnd(3, 19), true);
    if (t === 'plain') return classQ(rnd(1, 20), false);
    if (t === 'left') return leftoverQ(rnd(3, 19));
    if (t === 'which') return whichQ(pick(['Even', 'Odd']), 1, 20);
    if (t === 'next') return nextQ(rnd(1, 18), pick(['even', 'odd']));
    return pairsQ(2 * rnd(2, 10));
  }
  if (L === 2) {
    const t = pick(['plain', 'claim', 'sum', 'which', 'next', 'rule', 'share']);
    if (t === 'plain') return classQ(rnd(21, 99), false);
    if (t === 'claim') return claimQ(oddlyStarted(21, 99));
    if (t === 'sum') return sumQ([rnd(11, 45), rnd(11, 45)]);
    if (t === 'which') return whichQ(pick(['Even', 'Odd']), 21, 99);
    if (t === 'next') return nextQ(rnd(21, 98), pick(['even', 'odd']));
    if (t === 'rule') return ruleQ(pick(['even', 'odd']), pick(['even', 'odd']));
    return shareQ(rnd(11, 59));
  }
  const t = pick(['plain', 'claim', 'sum3', 'which', 'whichSum', 'rule', 'share']);
  if (t === 'plain') return classQ(rnd(101, 999), false);
  if (t === 'claim') return claimQ(oddlyStarted(101, 999));
  if (t === 'sum3') return sumQ([rnd(20, 300), rnd(20, 300), rnd(20, 300)]);
  if (t === 'which') return whichQ(pick(['Even', 'Odd']), 101, 999);
  if (t === 'whichSum') return whichSumQ(pick(['Even', 'Odd']));
  if (t === 'rule') return ruleQ(pick(['even', 'odd']), pick(['even', 'odd']));
  return shareQ(rnd(101, 399));
}
