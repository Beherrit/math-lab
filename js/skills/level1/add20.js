// Adding within 20: make a ten, doubles, missing numbers, balance sentences and three numbers at once.
import { rnd, pick, chance, shuffle, b, way, num } from '../../util.js';
import { tenBar } from './pics.js';
import { BLANK } from './words.js';
import { addWays, countUpWay } from './facts.js';
import { noRepeat, nearMiss, errorQ, tfQ } from './forms.js';

const sortedKey = p => p.slice().sort((x, y) => x - y).join();
const nextPair = noRepeat(8);
const addQ = (a, c, ask, hint, visual) => ({ ask, expr: `${a} + ${c}`, visual, answer: num(a + c), ways: addWays(a, c), hint, _t: { f: 'add', xs: [a, c] } });

function missingAddend(a, sum, ask, hint, visual) {
  const d = sum - a;
  return { ask, expr: `${a} + ${BLANK} = ${sum}`, answer: num(d), hint, visual, _t: { f: 'sub', a: sum, b: a },
    ways: [countUpWay(a, sum), way('Use subtraction', [`The missing part is what is left when you take ${a} away from ${sum}.`, `${sum} − ${a} = ${b(d)}.`, `Check: ${a} + ${d} = ${sum}.`])] };
}
function threeAddends() {
  const x = rnd(1, 9), z = rnd(2, 9), xs = shuffle([x, 10 - x, z]), s = 10 + z;
  return { ask: 'Add all three. Look for two numbers that make 10.', expr: xs.join(' + '), answer: num(s), hint: 'Two of these numbers make exactly 10. Find them first.', _t: { f: 'add', xs },
    ways: [way('Find the ten first', [`${x} and ${10 - x} make 10. You can add in any order, so pair them up.`, `10 + ${z} = ${b(s)}.`]),
      way('Left to right', [`${xs[0]} + ${xs[1]} = ${xs[0] + xs[1]}.`, `${xs[0] + xs[1]} + ${xs[2]} = ${b(s)}.`])] };
}
// a + c = ? + e : both sides must come to the same number.
function balanceQ() {
  let a, c, s, e;
  do { a = rnd(4, 9); c = rnd(4, 9); s = a + c; e = rnd(Math.max(3, s - 9), Math.min(9, s - 2)); } while (e === a || e === c);
  const more = a - e;
  return { ask: 'Both sides must come to the same number. What number is missing?', expr: `${a} + ${c} = ${BLANK} + ${e}`, answer: num(s - e), hint: 'Work out the side with no gap first.', _t: { f: 'sub', a: s, b: e },
    ways: [way('Work out the whole side', [`${a} + ${c} = ${s}.`, `The other side must also be ${s}: ${BLANK} + ${e} = ${s}.`, `${s} − ${e} = ${b(s - e)}.`]),
      way('Compare the numbers', [`${e} is ${Math.abs(more)} ${more > 0 ? 'less' : 'more'} than ${a}.`, `So the missing number has to be ${Math.abs(more)} ${more > 0 ? 'more' : 'less'} than ${c}: ${b(c + more)}.`])] };
}
function tfBalance() {
  const a = rnd(4, 9), c = rnd(4, 9), s = a + c, d = rnd(Math.max(2, s - 9), Math.min(9, s - 2)), ok = chance(0.5), e = ok ? s - d : nearMiss(s - d, 9);
  return tfQ({ left: `${a} + ${c}`, right: `${d} + ${e}`, ok, hint: 'Work out both sides before you decide.',
    why: [`Left side: ${a} + ${c} = ${s}.`, `Right side: ${d} + ${e} = ${d + e}.`, d + e === s ? `${s} and ${d + e} match, so it is ${b('true')}.` : `${s} and ${d + e} do not match, so it is ${b('false')}.`] });
}
const tfSum = (a, c) => {
  const s = a + c, ok = chance(0.5), r = ok ? s : nearMiss(s);
  return tfQ({ left: `${a} + ${c}`, right: String(r), ok, hint: 'Work out the left side first, then compare.', why: [`${a} + ${c} = ${s}.`, ok ? `${s} matches, so it is ${b('true')}.` : `${r} is not ${s}, so it is ${b('false')}.`] });
};
function slipQ(a, c) {
  const s = a + c, wrong = s + (s >= 20 || chance(0.5) ? -1 : 1);
  return errorQ({ a, c, op: 'add', wrong, hint: 'Count on again, one step at a time.', ways: addWays(a, c),
    slip: wrong > s ? 'The count on went one step too far.' : 'The count on stopped one step short.' });
}
const plainPair = () => nextPair(() => (chance(0.2) ? (a => [a, rnd(2, 19 - a)])(rnd(11, 15)) : (a => [a, rnd(Math.max(2, 11 - a), 9)])(rnd(3, 9))), sortedKey);

export function genAdd(L) {
  if (L === 1) {
    const t = pick(['ten', 'dbl', 'dbl', 'make', 'make', 'tf']);
    if (t === 'ten') { const a = rnd(1, 9); return missingAddend(a, 10, 'What goes with it to make 10?', `Count up from ${a} until you reach 10.`, tenBar(a)); }
    if (t === 'dbl') { const n = rnd(2, 9), c = n + pick([0, 0, 1]); return addQ(n, c, 'Add. Use a double you know.', c === n ? 'Both numbers are the same. What is the double?' : `Think of the double ${n} + ${n} first.`); }
    if (t === 'tf') return tfSum(rnd(3, 9), rnd(2, 8));
    const a = rnd(7, 9), c = rnd(11 - a, 6), [p, q] = chance(0.5) ? [a, c] : [c, a];
    return addQ(p, q, 'Add. Make a ten first.', `How many more does ${a} need to make 10?`, tenBar(p, q));
  }
  if (L === 2) {
    const t = pick(['plain', 'plain', 'miss', 'tf', 'slip']);
    if (t === 'miss') { const x = rnd(4, 9); return missingAddend(x, rnd(11, x + 7), 'What number is missing?', 'Count up, or take the part you know away from the total.'); }
    const [a, c] = plainPair();
    if (t === 'tf') return tfSum(a, c);
    if (t === 'slip') return slipQ(a, c);
    return addQ(a, c, 'Add.', a > 10 ? `${a} is 10 and ${a - 10}. Add the ones.` : 'Make a ten first, or use a double you know.');
  }
  const t = pick(['three', 'three', 'balance', 'balance', 'miss', 'tfbal']);
  if (t === 'three') return threeAddends();
  if (t === 'balance') return balanceQ();
  if (t === 'tfbal') return tfBalance();
  const x = rnd(6, 9);
  return missingAddend(x, rnd(Math.max(14, x + 6), 20), 'What number is missing?', 'Count up through ten, or subtract the part you know.');
}
