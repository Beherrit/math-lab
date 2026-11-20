// Patterns in the multiplication table: even and odd products, the 9s digits, doubling, squares and growing patterns.
import { rnd, pick, b, way, num, choice } from '../../util.js';
import { dots } from './pics.js';
import { seqQ, growingQ, multipleQ, alwaysEvenQ } from './sequences.js';
import { gridSquareQ, squareChoiceQ, nextSquareQ, neighbourQ } from './squares.js';

const kind = n => (n % 2 ? 'Odd' : 'Even');
const art = w => (w === 'odd' ? 'an odd' : 'an even');
const coin = () => Math.random() < 0.5;

function parityQ(a, c) {
  const p = a * c, ans = kind(p);
  const reason = a % 2 === 0 ? `${a} is an even number of groups, so the groups pair up with none left over.` : c % 2 === 0 ? `Each group of ${c} pairs up with none left over, so the whole total does too.`
    : `Each of the ${a} groups of ${c} has one left over after pairing. ${a} is odd, so one is still left alone.`;
  return { ask: `Will ${a} × ${c} be even or odd? Decide without working it out.`, answer: choice(ans, [], { all: ['Even', 'Odd'] }), choiceBig: true, _t: { f: 'parity', a, b: c },
    hint: 'Think about pairing things up. Is anything left over without a partner?',
    ways: [way('Pair them up', [...(p <= 60 ? [dots(a, c)] : []), reason, `The answer is ${b(ans)}.`]), way('Work it out', [`${a} × ${c} = ${p}.`, `${p} ends in ${p % 10}, which is ${ans.toLowerCase()}.`, `The answer is ${b(ans)}.`])] };
}
// The 9s table: the two digits of every 9s fact add up to 9. Each tens digit (and each ones digit) belongs to exactly one fact.
function nineQ(fromTens) {
  const n = rnd(2, 9), p = 9 * n, tens = Math.floor(p / 10), ones = p % 10, given = fromTens ? tens : ones, ans = fromTens ? ones : tens, eg = n === 6 ? 7 : 6;
  return { ask: `A fact in the 9s table has ${b(fromTens ? 'a tens digit of ' + given : 'a ones digit of ' + given)}. What is the ${fromTens ? 'ones' : 'tens'} digit?`, answer: num(ans), _t: { f: fromTens ? 'nine' : 'nineT', d: given },
    hint: 'The two digits of a 9s fact always add up to the same number. Which number?',
    ways: [way('The digits add to 9', [`Take 9 × ${eg} = ${9 * eg}: the digits add up, ${Math.floor(9 * eg / 10)} + ${9 * eg % 10} = 9. That happens in every 9s fact.`, `${given} + ? = 9, so the other digit is 9 − ${given} = ${b(ans)}.`]),
      way('Find it in the list', [`The 9s table: ${Array.from({ length: 8 }, (_, i) => 9 * (i + 2)).join(', ')}.`, `The one with ${fromTens ? 'a tens' : 'a ones'} digit of ${given} is ${p}, and its ${fromTens ? 'ones' : 'tens'} digit is ${b(ans)}.`])] };
}
// The 4s are double the 2s, the 6s double the 3s, the 8s double the 4s, the 10s double the 5s.
function doubleQ() {
  const k = pick([2, 3, 4, 5]), n = rnd(3, 9), tot = 2 * k * n;
  return { ask: `The ${2 * k}s table is double the ${k}s table. ${k} × ${n} = ${k * n}, so what is ${2 * k} × ${n}?`, expr: `${2 * k} × ${n}`, answer: num(tot), _t: { f: 'mul', a: 2 * k, b: n },
    hint: `Every fact in the ${2 * k}s table is double the matching fact in the ${k}s table.`,
    ways: [way('Double the fact', [`Double ${k * n} is ${k * n} + ${k * n}.`, `${k * n} + ${k * n} = ${b(tot)}.`]),
      way('Split the array in two', [dots(2 * k, n, { split: k }), `${2 * k} rows of ${n} is two halves, each with ${k} rows of ${n}.`, `${k} × ${n} = ${k * n} in each half, so ${k * n} + ${k * n} = ${b(tot)}.`])] };
}
// True or false about even and odd. The test tries every pair of numbers from 1 to 9 with those two kinds.
const SAYS = [['even', 'even', 'even'], ['even', 'odd', 'even'], ['odd', 'odd', 'odd'], ['odd', 'odd', 'even'], ['even', 'odd', 'odd'], ['even', 'even', 'odd']];
function parityRuleQ() {
  const [x, y, says] = pick(SAYS), real = x === 'odd' && y === 'odd' ? 'odd' : 'even', ok = says === real, [sx, sy] = [x === 'odd' ? 3 : 4, y === 'odd' ? 5 : 6];
  const verdict = ok ? `The sentence says ${says}, which matches, so it is ${b('True')}.` : `The sentence says ${says} but the product is ${real}, so it is ${b('False')}.`;
  return { ask: 'True or false?', expr: `${x} × ${y} = ${says}`, answer: choice(ok ? 'True' : 'False', [], { all: ['True', 'False'] }), choiceBig: true, _t: { f: 'prule', x, y, says }, hint: 'Try it with a few small numbers of each kind, such as 3 × 5 or 2 × 7.',
    ways: [way('Try some numbers', [`Pick ${art(x)} number and ${art(y)} number, like ${sx} and ${sy}: ${sx} × ${sy} = ${sx * sy}, which is ${real}.`, verdict]),
      way('Pair them up', [real === 'even' ? 'If either number is even, everything pairs up, so the product is even.' : 'Two odd numbers always leave one thing without a partner, so the product is odd.', verdict])] };
}
export function genPatterns(L) {
  const s = pick([2, 5, 10]), t = pick([3, 4, 6, 7, 8, 9]);
  const pool = L === 1 ? [() => parityQ(rnd(2, 9), rnd(2, 9)), () => parityQ(rnd(2, 9), rnd(2, 9)), () => nineQ(coin()), doubleQ, () => gridSquareQ(rnd(3, 6)), () => seqQ(s, s, 0, 4)]
    : L === 2 ? [() => parityQ(rnd(6, 12), rnd(6, 12)), () => multipleQ(pick([5, 9, 10, 2, 9])), alwaysEvenQ, squareChoiceQ, () => nineQ(coin()), () => seqQ(coin() ? t : rnd(2, 9), t, 0, 5), () => gridSquareQ(rnd(6, 9))]
      : [growingQ, growingQ, () => nextSquareQ(rnd(5, 11)), parityRuleQ, () => neighbourQ(rnd(5, 11)), () => multipleQ(pick([9, 9, 5])), alwaysEvenQ, squareChoiceQ];
  return pick(pool)();
}
