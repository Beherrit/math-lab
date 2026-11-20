// Hundreds, tens and ones up to 1000: reading blocks, what a digit is worth, trading and counting in tens.
import { rnd, pick, chance, shuffle, splitPV, b, way, num, pvChart } from '../../util.js';
import { blocks } from './pics.js';
import { BLANK, cnt, digits, PLACES } from './words.js';

const UNITS = ['hundred', 'ten', 'one'];
const inWords = (parts) => parts.map((v, i) => (v ? cnt(v, UNITS[i]) : '')).filter(Boolean);
const joinAnd = xs => (xs.length > 1 ? xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1] : xs[0]);
// A number with three different non-zero digits (two digits at step 1).
function distinct(L) {
  const [h, t, o] = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  return L === 1 ? t * 10 + o : h * 100 + t * 10 + o;
}
function partsWay(n) {
  const d = digits(n), vals = d.map((v, i) => v * [100, 10, 1][i]);
  const lines = d.map((v, i) => (v ? `${cnt(v, UNITS[i])} is ${vals[i]}.` : '')).filter(Boolean);
  return way('Count each kind of block', [...lines, `Put them together: ${vals.filter(Boolean).join(' + ')} = ${b(n)}.`]);
}
const chartWay = (n, hl) => way('Place value chart', [pvChart([{ x: n, hl }], { maxP: n > 99 ? 2 : 1 }), `Each digit has its own place. ${n} = ${splitPV(n).join(' + ')}.`]);

function blocksQ(n) {
  const [h, t, o] = digits(n);
  return { ask: `What number do the blocks show?<!--${h} ${t} ${o}-->`, visual: blocks(h, t, o), answer: num(n), hint: 'Count the biggest blocks first.', _t: { f: 'pvnum', h, t, o },
    ways: [partsWay(n), chartWay(n)] };
}
function buildQ(n) {
  const [h, t, o] = digits(n);
  return { ask: 'What number is this?', expr: joinAnd(inWords([h, t, o])), exprSmall: true, answer: num(n), _t: { f: 'pvnum', h, t, o },
    hint: t && o ? 'Write one digit for each place, biggest place first.' : 'A place with nothing in it still needs a 0 to hold the spot.', ways: [partsWay(n), chartWay(n)] };
}
function worthQ(n) {
  const d = digits(n), i = pick(n > 99 ? [0, 1, 2] : [1, 2]), v = d[i] * [100, 10, 1][i];
  return { ask: `In ${b(n)}, what is the digit ${b(d[i])} worth?`, answer: num(v), hint: `Which place is the ${d[i]} sitting in?`, _t: { f: 'worth', n, p: 2 - i },
    ways: [way('Think of blocks', [`The ${d[i]} is in the ${PLACES[i]} place, so it means ${cnt(d[i], UNITS[i])}.`, `${cnt(d[i], UNITS[i])} is worth ${b(v)}.`]), chartWay(n, 2 - i)] };
}
function expandQ(n) {
  const parts = splitPV(n), i = rnd(0, parts.length - 1), d = digits(n);
  const shown = parts.map((p, j) => (j === i ? BLANK : p)).join(' + ');
  const p = String(parts[i]).length - 1;
  return { ask: 'What number is missing?', expr: `${n} = ${shown}`, exprSmall: true, answer: num(parts[i]), hint: 'Which place is not written out yet?', _t: { f: 'worth', n, p },
    ways: [way('Break the number apart', [`${n} is ${joinAnd(inWords(d))}.`, `Written as values: ${parts.join(' + ')}.`, `The missing part is ${b(parts[i])}.`]), chartWay(n, p)] };
}
function regroupQ() {
  const h = rnd(1, 7), t = rnd(10, 19), o = rnd(0, 9), n = h * 100 + t * 10 + o;
  return { ask: 'What number is this?', expr: joinAnd(inWords([h, t, o])), exprSmall: true, answer: num(n), hint: '10 tens can be traded for 1 hundred.', _t: { f: 'pvnum', h, t, o },
    ways: [way('Trade ten tens', [`${t} tens is too many for one place. Trade 10 of them for 1 hundred.`, `Now there are ${cnt(h + 1, 'hundred')}, ${cnt(t - 10, 'ten')} and ${cnt(o, 'one')}.`, `That is ${b(n)}.`]),
      way('Add the values', [`${cnt(h, 'hundred')} is ${h * 100}. ${t} tens is ${t * 10}.${o ? ` ${cnt(o, 'one')} is ${o}.` : ''}`, `${h * 100} + ${t * 10}${o ? ' + ' + o : ''} = ${b(n)}.`])] };
}
function tensInQ() {
  const h = rnd(1, 9), t = rnd(0, 9), n = h * 100 + t * 10;
  return { ask: `How many tens make ${b(n)}?`, answer: num(n / 10), hint: 'How many tens are in one hundred?', _t: { f: 'div', a: n, b: 10 },
    ways: [way('Trade the hundreds', [`1 hundred is 10 tens, so ${cnt(h, 'hundred')} is ${h * 10} tens.`, t ? `Add the ${cnt(t, 'ten')} already there: ${h * 10} + ${t} = ${b(n / 10)} tens.` : `There are no extra tens, so the answer is ${b(n / 10)}.`]),
      way('Count by tens', ['Count by tens: 10, 20, 30 and so on. It takes 10 counts to reach each new hundred, so 100 is 10 tens and 200 is 20 tens.', `${n} is ${b(n / 10)} tens. Check: ${n / 10} tens is ${n}.`])] };
}
function moreQ() {
  const d = pick([10, -10, 100, -100]), h = rnd(2, 8), o = rnd(0, 9);
  const n = d === 10 ? h * 100 + 90 + o : d === -10 ? h * 100 + o : h * 100 + rnd(0, 9) * 10 + o, r = n + d, big = Math.abs(d);
  const place = big === 10 ? 'tens' : 'hundreds', seq = [n - d, n, r];
  return { ask: `What is ${big} ${d > 0 ? 'more' : 'less'} than ${b(n)}?`, answer: num(r), hint: `Only the ${place} change, unless there are none left to change.`, _t: { f: 'add', xs: [n, d] },
    ways: [way(`Count by ${big}s`, [`Keep counting ${d > 0 ? 'up' : 'down'} by ${big}: ${seq.join(', ')}.`, `The answer is ${b(r)}.`]),
      way('Think of place value', [big === 100 ? `${big} ${d > 0 ? 'more' : 'less'} changes the hundreds digit by 1. The tens and ones stay.`
        : d > 0 ? `${n} has 9 tens. One more ten makes 10 tens, and that is a new hundred.` : `${n} has 0 tens, so trade 1 hundred for 10 tens, then take 1 ten away. 9 tens are left.`, `${n} ${d > 0 ? '+' : '−'} ${big} = ${b(r)}.`])] };
}
export function genPV(L) {
  if (L === 1) { const n = distinct(1); return pick([blocksQ, blocksQ, buildQ, worthQ, expandQ])(n); }
  if (L === 2) {
    const n = chance(0.3) ? rnd(1, 9) * 100 + (chance(0.5) ? rnd(1, 9) : rnd(1, 9) * 10) : distinct(2);
    return pick(digits(n).includes(0) ? [blocksQ, buildQ] : [blocksQ, buildQ, worthQ, expandQ])(n);
  }
  return pick([regroupQ, regroupQ, tensInQ, moreQ, moreQ])();
}
