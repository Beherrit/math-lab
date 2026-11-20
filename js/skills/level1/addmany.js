// Adding up to four 2-digit numbers: tens and ones, adding in pairs, estimating first, missing numbers and a forgotten trade.
import { rnd, pick, chance, shuffle, b, way, nm, num, choice } from '../../util.js';
import { BLANK, cnt, sumOf } from './words.js';
import { tfQ } from './forms.js';

const ones = xs => sumOf(xs.map(x => x % 10)), tensOf = xs => sumOf(xs.map(x => x - x % 10)), r10 = x => Math.round(x / 10) * 10;
const plus = xs => xs.join(' + ');
// Make `count` numbers between lo and hi that pass `ok` (for example "the ones need no trade").
function nums(count, lo, hi, ok = () => true) {
  for (let i = 0; i < 200; i++) { const xs = Array.from({ length: count }, () => rnd(lo, hi)); if (ok(xs)) return xs; }
  return Array.from({ length: count }, () => lo);
}
const noTrade = xs => ones(xs) <= 9, needsTrade = xs => ones(xs) >= 10;
// Two worked ways for any total: tens then ones, and two at a time.
function sumWays(xs) {
  const t = sumOf(xs), pairs = xs.length === 4 ? [xs[0] + xs[1], xs[2] + xs[3]] : [xs[0] + xs[1], xs[2]];
  const head = xs.length === 2 ? `${xs[0]} + ${xs[1]} = ${b(t)}.` : xs.length === 4 ? `${xs[0]} + ${xs[1]} = ${pairs[0]}, and ${xs[2]} + ${xs[3]} = ${pairs[1]}.` : `${xs[0]} + ${xs[1]} = ${pairs[0]}.`;
  return [way('Tens, then ones', [`Tens: ${xs.map(x => x - x % 10).join(' + ')} = ${tensOf(xs)}. Ones: ${xs.map(x => x % 10).join(' + ')} = ${ones(xs)}.`, `${tensOf(xs)} + ${ones(xs)} = ${b(t)}.`]),
    way(xs.length === 4 ? 'Add in pairs' : xs.length === 2 ? 'Jump by tens, then ones' : 'Two at a time', xs.length === 2 ? ['Add the first number to the tens of the second, then its ones.', `${xs[0]} + ${xs[1] - xs[1] % 10} = ${xs[0] + xs[1] - xs[1] % 10}. Then + ${xs[1] % 10} = ${b(t)}.`]
      : [head, `${pairs[0]} + ${pairs[1]} = ${b(t)}.`])];
}
function sumQ(xs) {
  return { ask: 'Add all the numbers. Work with the tens and the ones.', expr: plus(xs), answer: num(sumOf(xs)), hint: 'Add the tens first, then the ones, then put the two parts together.', _t: { f: 'add', xs }, ways: sumWays(xs) };
}
function tensOnlyQ(xs) {
  const ts = xs.map(x => x - x % 10), s = tensOf(xs);
  return { ask: `Add just the tens of ${b(plus(xs))} first. What do the tens come to?`, answer: num(s), hint: 'Ignore the ones for now and add only the tens.', _t: { f: 'tensum', xs },
    ways: [way('Add the tens', [`The tens are ${ts.join(', ')}.`, `${ts.join(' + ')} = ${b(s)}.`]), way('Count tens', [`${xs.map(x => cnt(Math.floor(x / 10), 'ten')).join(', ')}.`, `${sumOf(xs.map(x => Math.floor(x / 10)))} tens is ${b(s)}.`])] };
}
function missingQ(xs, hide) {
  const total = sumOf(xs), others = xs.filter((_, i) => i !== hide), os = sumOf(others), ans = xs[hide];
  return { ask: 'What number is missing?', expr: `${xs.map((x, i) => (i === hide ? BLANK : x)).join(' + ')} = ${total}`, exprSmall: true, answer: num(ans), hint: 'Add the numbers you can see, then see how far that is from the total.', _t: { f: 'addmiss', total, others },
    ways: [way('Add what you know, then subtract', [`${plus(others)} = ${os}.`, `${total} − ${os} = ${b(ans)}.`]), way('Count up to the total', [`The numbers you can see make ${os}. The total is ${total}.`, `${os} + ${ans} = ${total}, so the missing number is ${b(ans)}.`])] };
}
function estQ(xs) {
  const rs = xs.map(r10), est = sumOf(rs), exact = sumOf(xs), far = [est + 50, est + 100, est >= 50 ? est - 50 : est + 150].map(String);
  return { ask: `Which is the best estimate for ${b(plus(xs))}? Round each number to the nearest ten first.`, answer: choice(String(est), far), choiceBig: true, hint: 'Round every number to the nearest ten, then add the rounded numbers.', _t: { f: 'estsum', xs },
    ways: [way('Round, then add', [xs.map((x, i) => `${x} is close to ${rs[i]}`).join(', ') + '.', `${plus(rs)} = ${b(est)}.`]), way('Check against the exact total', [`The exact total is ${exact}.`, `${exact} is close to ${b(est)}, so that estimate is sensible.`])] };
}
// A forgotten trade: the ones came to 10 or more but the tens were not increased.
function slipQ(xs) {
  const o = ones(xs), k = Math.floor(o / 10), total = sumOf(xs), wrong = total - 10 * k;
  return { ask: `${nm()} adds ${b(plus(xs))} and gets ${b(wrong)}. That has a slip in it. What is the correct total?`, expr: plus(xs), answer: num(total), hint: 'Look at the ones. What happens when they come to ten or more?', _t: { f: 'add', xs },
    ways: [way('Find the slip', [`The ones add to ${o}. That is ${cnt(k, 'ten')} and ${cnt(o % 10, 'one')}, and the tens must grow by ${k}.`, o % 10 === 0 ? `Tens ${tensOf(xs)} and ${10 * k} from the trade is ${b(total)}.` : `Tens ${tensOf(xs)} and ${10 * k} from the trade is ${tensOf(xs) + 10 * k}. ${tensOf(xs) + 10 * k} + ${o % 10} = ${b(total)}.`]), sumWays(xs)[1]] };
}
function tfSum(xs) {
  const t = sumOf(xs), ok = chance(0.5), shown = ok ? t : t + pick([10, -10, 1, -1]);
  return tfQ({ left: plus(xs), right: String(shown), ok, hint: 'Add the tens, then the ones, then compare with the number on the right.',
    why: [`${plus(xs)} = ${t}.`, ok ? `${t} matches, so it is ${b('true')}.` : `${shown} is not ${t}, so it is ${b('false')}.`], alt: sumWays(xs)[1] });
}

export function genAddMany(L) {
  if (L === 1) {
    const three = nums(3, 11, 39, noTrade), two = nums(2, 11, 49, noTrade), t = pick(['three', 'two', 'miss', 'tf', 'tens']);
    if (t === 'three') return sumQ(three);
    if (t === 'two') return sumQ(two);
    if (t === 'miss') return missingQ(three, rnd(0, 2));
    if (t === 'tens') return tensOnlyQ(pick([three, two]));
    return tfSum(pick([three, two]));
  }
  const four = L === 3, xs = four ? nums(4, 11, 99, needsTrade) : nums(3, 11, 65, needsTrade), t = pick(['sum', 'sum', 'miss', 'est', 'slip', 'tf', 'tens']);
  if (t === 'sum') return sumQ(xs);
  if (t === 'miss') return missingQ(xs, rnd(0, xs.length - 1));
  if (t === 'est') return estQ(shuffle(xs));
  if (t === 'slip') return slipQ(xs);
  if (t === 'tens') return tensOnlyQ(xs);
  return tfSum(xs);
}
