// Turning a multiplication around (same array, other way), and what multiplying by 0 and 1 does.
import { rnd, pick, chance, b, way, num, choice } from '../../util.js';
import { dots } from './pics.js';
import { BLANK, rep, skips } from './words.js';
import { tfQ } from './forms.js';

function turnWays(a, c) {
  const p = a * c, small = a <= 9 && c <= 12;
  return [way('Turn the array', [...(small ? [dots(a, c), dots(c, a)] : []), `${a} rows of ${c}, turned on its side, is ${c} rows of ${a}.`, 'Turning it does not add or remove a single dot.', `So ${c} × ${a} = ${a} × ${c} = ${b(p)}.`]),
    way('Count it both ways', [a <= 12 ? `${a} groups of ${c}: ${skips(a, c)}.` : `${a} groups of ${c} is ${p}.`, c <= 12 ? `${c} groups of ${a}: ${skips(c, a)}.` : `${c} groups of ${a} is ${p}.`, `Both end on ${b(p)}.`])];
}
// An array is shown. Turned on its side, which fact describes it?
function turnPicQ(a, c) {
  return { ask: `This array has ${b(a + ' rows')} of ${b(c)}. Turn it on its side. Which fact describes the turned array?`, visual: dots(a, c), answer: choice(`${c} × ${a}`, [`${a} × ${a}`, `${c} × ${c}`, `${a} + ${c}`, `${c} × ${a + 1}`]), choiceBig: true,
    hint: 'Turning an array on its side swaps the rows and the columns.', ways: turnWays(a, c), _t: { f: 'swap', a, b: c } };
}
function rowsQ(a, c) {
  return { ask: `An array has ${b(a + ' rows')} of ${b(c)} dots. Turn it on its side. How many rows does it have now?`, visual: dots(a, c), answer: num(c), hint: 'Rows and columns swap places when you turn the array.', _t: { f: 'second', a, b: c },
    ways: [way('Turn the array', [dots(c, a), `${a} rows of ${c} turned on its side is ${c} rows of ${a}.`, `Rows and columns swap, so the new number of rows is ${b(c)}.`]), way('Count the columns', [`Each row has ${c} dots, so there are ${c} columns.`, `Turning it makes the columns into rows: ${b(c)} rows.`])] };
}
function fillQ(a, c) {
  return { ask: 'What number makes this true?', expr: `${a} × ${c} = ${c} × ${BLANK}`, answer: num(a), hint: 'The same two numbers are on both sides, in a different order.', _t: { f: 'first', a, b: c },
    ways: [way('Match the numbers', [`The left side multiplies ${a} and ${c}.`, `The right side already has ${c}, so the missing number is ${b(a)}.`]), turnWays(a, c)[0]] };
}
function sameQ(a, c) {
  return { ask: `Which is equal to ${b(`${a} × ${c}`)}?`, answer: choice(`${c} × ${a}`, [`${a} + ${c}`, `${c} × ${a + 1}`, `${a + 1} × ${c - 1}`]), hint: 'Which one has the same two numbers being multiplied?', ways: turnWays(a, c), _t: { f: 'swap', a, b: c } };
}
function tfTurnQ(a, c) {
  const ok = chance(0.5), other = pick([`${c} × ${a + 1}`, `${a} × ${c + 1}`, `${c} + ${a}`]);
  return tfQ({ expr: `${a} × ${c} = ${ok ? `${c} × ${a}` : other}`, ok, hint: 'Picture the array turned on its side. Does it keep the same number of dots?',
    why: [`${a} × ${c} = ${a * c}.`, ok ? `${c} × ${a} = ${a * c} as well. Turning an array keeps every dot, so it is ${b('true')}.` : `The right side comes to ${evalSide(other)}, not ${a * c}, so it is ${b('false')}.`] });
}
const evalSide = s => { const [x, op, y] = s.split(' '); return op === '+' ? +x + +y : +x * +y; };
// "12 × 7 means 12 jumps of 7. Turn it around to make fewer jumps."
function fewerJumpsQ(a, c) {
  return { ask: `${b(`${a} × ${c}`)} means ${a} jumps of ${c}. Turn it around to make fewer jumps. How big is each jump now?`, answer: num(a), hint: 'Swap the two numbers. Which one tells you how many jumps?', _t: { f: 'first', a, b: c },
    ways: [way('Swap the order', [`${a} × ${c} = ${c} × ${a}: the answer stays the same.`, `${c} × ${a} is only ${c} jumps, each one of size ${b(a)}.`]), way('Count the jumps', [`${a} jumps of ${c} is ${a} counts. ${c} jumps of ${a} is only ${c} counts.`, `Same total (${a * c}), fewer jumps, so each jump is ${b(a)}.`])] };
}
// n × 1, 1 × n, n × 0 and 0 × n, explained from what the groups look like.
function unitQ(n, z, first) {
  const expr = first ? `${z} × ${n}` : `${n} × ${z}`, ans = z * n;
  const why = z === 1
    ? (first ? [`1 × ${n} is one group of ${n}.`, `One group of ${n} is just ${b(n)}.`] : [`${n} × 1 is ${n} groups with 1 in each.`, `${n <= 12 ? rep(n, 1) + ' = ' : `Counting ${n} ones gives `}${b(n)}.`])
    : (first ? [`0 × ${n} is zero groups of ${n}.`, `No groups at all means nothing: ${b(0)}.`] : [`${n} × 0 is ${n} groups with nothing in each.`, `${n <= 12 ? rep(n, 0) + ' = ' : 'Adding nothing again and again is still '}${b(0)}.`]);
  return { ask: 'Multiply. Picture the groups.', expr, answer: num(ans), hint: z === 1 ? 'How many groups are there, and how many in each?' : 'Picture it: are there any groups, and is anything in them?', _t: { f: 'mul', a: z, b: n },
    ways: [way('Picture the groups', why), way('Turn it around', [`The order does not matter, so ${n} × ${z} and ${z} × ${n} are the same.`, z === 1 ? `Any number times 1 stays the same: ${b(n)}.` : `Any number times 0 is ${b(0)}.`])] };
}
function threeQ() {
  const n = rnd(3, 9), [x, y] = pick([[2, 5], [5, 2]]), z = pick([0, 1, 10, 10, 10]);
  if (z < 10) {
    const m = rnd(2, 9), xs = z ? [n, 1, m] : pick([[n, m, 0], [n, 0, m]]);
    return { ask: 'Multiply all three.', expr: xs.join(' × '), answer: num(z * n * m), hint: z ? 'What does multiplying by 1 do?' : 'Look for a 0 before you do any work.', _t: { f: 'prod', xs },
      ways: [way(z ? 'Spot the 1' : 'Spot the 0', z ? ['Multiplying by 1 changes nothing, so the 1 can be left out.', `${n} × ${m} = ${b(n * m)}.`] : ['Anything times 0 is 0.', `It does not matter what the other numbers are: the answer is ${b(0)}.`]),
        way('Left to right', [`${xs[0]} × ${xs[1]} = ${xs[0] * xs[1]}.`, `${xs[0] * xs[1]} × ${xs[2]} = ${b(z * n * m)}.`])] };
  }
  return { ask: 'Multiply all three. You may change the order to make it easy.', expr: `${x} × ${n} × ${y}`, answer: num(10 * n), hint: 'Two of these numbers multiply to make 10.', _t: { f: 'prod', xs: [x, n, y] },
    ways: [way('Make a ten first', [`You can multiply in any order. ${x} × ${y} = 10.`, `10 × ${n} = ${b(10 * n)}.`]), way('Left to right', [`${x} × ${n} = ${x * n}.`, `${x * n} × ${y} = ${b(10 * n)}.`])] };
}
function whichQ() {
  const n = rnd(2, 99), z = pick([0, 1]);
  return { ask: 'What number makes this true?', expr: `${n} × ${BLANK} = ${z ? n : 0}`, answer: num(z), hint: z ? 'The answer is the same as the starting number. What leaves it unchanged?' : 'How many groups make nothing at all?', _t: { f: 'div', a: z * n, b: n },
    ways: [way('Picture the groups', z ? [`${n} groups that add up to ${n}: ${n} × 1 = ${n} works.`, `So each group holds just ${b(1)}.`] : [`${n} groups that add up to 0: every group must be empty.`, `${n} × ${b(0)} = 0.`]),
      way('Try a number', z ? [`${n} × 2 would be ${2 * n}. Too big.`, `${n} × 1 = ${n}. That works, so the answer is ${b(1)}.`] : [`${n} × 1 would be ${n}. Too big.`, `${n} × 0 = 0. That works, so the answer is ${b(0)}.`])] };
}
const two = (lo, hi, lo2, hi2) => { const a = rnd(lo, hi); let c = rnd(lo2, hi2); while (c === a) c = rnd(lo2, hi2); return [a, c]; };
const BIG = [[25, 4], [12, 5], [15, 4], [20, 6], [50, 3], [11, 8], [12, 7]];

export function genOrder(L) {
  if (L === 1) {
    const [a, c] = two(2, 5, 2, 6), t = pick(['pic', 'rows', 'fill', 'tf', 'unit', 'unit']);
    if (t === 'unit') return unitQ(rnd(2, 9), pick([0, 1]), chance(0.5));
    return t === 'pic' ? turnPicQ(a, c) : t === 'rows' ? rowsQ(a, c) : t === 'fill' ? fillQ(a, c) : tfTurnQ(a, c);
  }
  if (L === 2) {
    const t = pick(['pic', 'fill', 'same', 'tf', 'unit', 'jumps']), [a, c] = two(6, 9, 3, 9);
    if (t === 'unit') return unitQ(rnd(12, 99), pick([0, 1]), chance(0.5));
    if (t === 'jumps') return fewerJumpsQ(rnd(8, 12), rnd(3, 6));
    return (t === 'pic' ? turnPicQ : t === 'fill' ? fillQ : t === 'same' ? sameQ : tfTurnQ)(a, c);
  }
  const t = pick(['three', 'three', 'which', 'jumps', 'fill', 'tf']), [a, c] = pick(BIG);
  if (t === 'three') return threeQ();
  if (t === 'which') return whichQ();
  return t === 'jumps' ? fewerJumpsQ(a, c) : t === 'fill' ? fillQ(a, c) : tfTurnQ(a, c);
}
