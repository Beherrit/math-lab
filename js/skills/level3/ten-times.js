// A digit is worth ten times the place to its right; multiplying and dividing whole numbers by 10, 100 and 1,000.
import { rnd, pick, chance, fmt, b, way, num, pvChart, placeName } from '../../util.js';
import { BLANK, oneOf, plural } from './helpers.js';

const zeros = f => Math.log10(f);
const ZERO_WORD = { 1: 'one zero', 2: 'two zeros', 3: 'three zeros' };
const chart = (x, hl) => pvChart([{ x, label: '', hl }]);
const MOVE = { 1: 'one place', 2: 'two places', 3: 'three places' };

// A number where the same digit sits in two places that are gap apart, so the two copies can be compared.
function twin(L) {
  const gap = L === 1 ? 1 : L === 2 ? rnd(1, 2) : rnd(2, 3), lo = rnd(0, L === 1 ? 2 : 3), hi = lo + gap, d = rnd(1, 9), top = Math.min(6, hi + rnd(0, L === 3 ? 2 : 1));
  let n = 0;
  for (let p = top; p >= 0; p--) n = n * 10 + (p === hi || p === lo ? d : rnd(p === top ? 1 : 0, 9));
  return { n, d, hi, lo, gap };
}
function tenfold(L) {
  const { n, d, hi, lo, gap } = twin(L), ratio = 10 ** gap, hv = d * 10 ** hi, lv = d * 10 ** lo;
  const chain = Array.from({ length: gap }, (_, i) => `${fmt(d * 10 ** (lo + i))} × 10 = ${fmt(d * 10 ** (lo + i + 1))}`);
  return { ask: `In ${fmt(n)}, the ${d} in the ${placeName(hi)} place is worth how many times as much as the ${d} in the ${placeName(lo)} place?`, answer: num(ratio), _t: { kind: 'tenfold', n, hiP: hi, loP: lo },
    hint: 'Work out what each of the two digits is really worth, then compare them.',
    ways: [way('Compare their values', [chart(n, hi), `The ${d} in the ${placeName(hi)} place is worth ${fmt(hv)}.`, `The ${d} in the ${placeName(lo)} place is worth ${fmt(lv)}.`, `${fmt(hv)} ÷ ${fmt(lv)} = ${b(fmt(ratio))}`]),
      way('Climb the places', ['Each place is worth 10 times the place to its right.', `Start at ${fmt(lv)} and move up ${gap} ${gap === 1 ? 'place' : 'places'}: ${chain.join(', then ')}.`, `That is ${gap} ${gap === 1 ? 'step' : 'steps'} of × 10, so the ${d} is worth ${b(fmt(ratio))} times as much.`])] };
}

function mulWays(a, f, prod) {
  const z = zeros(f);
  return [way('Move the digits', [pvChart([{ x: a, label: 'start' }, { x: prod, label: `× ${fmt(f)}` }]), `Multiplying by ${fmt(f)} moves every digit ${MOVE[z]} to the left. The empty places are filled with 0.`, `${fmt(a)} × ${fmt(f)} = ${b(fmt(prod))}`]),
    way('Think in tens', [`${fmt(f)} is 1 followed by ${ZERO_WORD[z]}. Each × 10 puts one 0 on the end of a whole number.`, `${fmt(a)} with ${ZERO_WORD[z]} on the end is ${b(fmt(prod))}.`])];
}
function divWays(n, f, q) {
  const z = zeros(f);
  return [way('Move the digits back', [pvChart([{ x: n, label: 'start' }, { x: q, label: `÷ ${fmt(f)}` }]), `Dividing by ${fmt(f)} moves every digit ${MOVE[z]} to the right.`, `${fmt(n)} ÷ ${fmt(f)} = ${b(fmt(q))}`]),
    way('Undo a multiplication', [`${fmt(n)} ends in at least ${ZERO_WORD[z]}. Take off ${ZERO_WORD[z]}: ${fmt(q)}.`, `Check: ${fmt(q)} × ${fmt(f)} = ${fmt(n)}, so the answer is ${b(fmt(q))}.`])];
}
const FACT = L => (L === 1 ? pick([10, 10, 100]) : pick([10, 100, 1000]));
const ARANGE = { 1: [2, 99], 2: [2, 999], 3: [11, 9999] };
function pickA(L, f) { const [lo, hi] = ARANGE[L]; return L === 1 && f === 100 ? rnd(2, 9) : rnd(lo, f === 1000 && L > 1 ? Math.min(hi, 999) : hi); }

function multiply(L) {
  const f = FACT(L), a = pickA(L, f), prod = a * f, flip = chance(0.3);
  return { ask: 'Multiply.', expr: flip ? `${fmt(f)} × ${fmt(a)}` : `${fmt(a)} × ${fmt(f)}`, answer: num(prod), _t: { kind: 'tenmul', a, f }, hint: `${fmt(f)} is 1 followed by ${ZERO_WORD[zeros(f)]}. What does each digit become?`, ways: mulWays(a, f, prod) };
}
function divide(L) {
  const f = L === 2 ? pick([10, 100]) : pick([10, 100, 1000]), q = L === 2 ? rnd(2, 99) : rnd(11, f === 1000 ? 999 : 9999), n = q * f;
  return { ask: 'Divide.', expr: `${fmt(n)} ÷ ${fmt(f)}`, answer: num(q), _t: { kind: 'tendiv', n, f }, hint: `Dividing by ${fmt(f)} moves each digit the other way. How many places?`, ways: divWays(n, f, q) };
}
function places(L) {
  const f = pick(L === 1 ? [10, 100, 100] : [100, 1000]), z = zeros(f), left = chance(0.6);
  return { ask: `When you ${left ? 'multiply' : 'divide'} a whole number by ${fmt(f)}, each digit moves how many places to the ${left ? 'left' : 'right'}?`, answer: num(z), _t: { kind: 'tenplaces', f },
    hint: 'Pick a small whole number and try it. How many places does its digit move?',
    ways: [way('Try an example', left ? [`3 × ${fmt(f)} = ${fmt(3 * f)}. The 3 was in the ones place and is now ${z} places up.`, `Each digit moves ${b(z)} ${z === 1 ? 'place' : 'places'} to the left.`] : [`${fmt(3 * f)} ÷ ${fmt(f)} = 3. The 3 was ${z} places up and is now in the ones place.`, `Each digit moves ${b(z)} ${z === 1 ? 'place' : 'places'} to the right.`]),
      way('Count the zeros', [`${fmt(f)} has ${ZERO_WORD[z]}.`, `The number of zeros is the number of places: ${b(z)}.`])] };
}
function missingFactor(L) {
  const f = FACT(L), a = pickA(L, f), prod = a * f;
  return { ask: 'Find the missing number.', expr: chance(0.5) ? `${fmt(a)} × ${BLANK} = ${fmt(prod)}` : `${BLANK} × ${fmt(a)} = ${fmt(prod)}`, answer: num(f), _t: { kind: 'tenfactor', a, prod },
    hint: `Compare ${fmt(a)} with ${fmt(prod)}. How many places did the digits move?`,
    ways: [way('Compare the digits', [`${fmt(a)} became ${fmt(prod)}, so the digits moved ${MOVE[zeros(f)]} to the left.`, `That is the same as multiplying by 1 followed by ${ZERO_WORD[zeros(f)]}: ${b(fmt(f))}.`]), way('Divide', [`${fmt(prod)} ÷ ${fmt(a)} = ${b(fmt(f))}`])] };
}
function missingDivisor() {
  const f = pick([10, 100, 1000]), q = rnd(11, 999), n = q * f;
  return { ask: 'Find the missing number.', expr: `${fmt(n)} ÷ ${BLANK} = ${fmt(q)}`, answer: num(f), _t: { kind: 'tendivisor', n, q }, hint: `How many places did the digits of ${fmt(n)} move to get to ${fmt(q)}?`,
    ways: [way('Compare the digits', [`${fmt(n)} became ${fmt(q)}, so the digits moved ${MOVE[zeros(f)]} to the right.`, `That is dividing by 1 followed by ${ZERO_WORD[zeros(f)]}: ${b(fmt(f))}.`]), way('Divide the other way', [`${fmt(n)} ÷ ${fmt(q)} = ${b(fmt(f))}`])] };
}
function ratio(L) {
  const lo = pick([3, 5, 20, 40, 60, 300, 700, 4000].filter(v => v < (L === 2 ? 100 : 5000))), f = pick(L === 2 ? [10, 100] : [10, 100, 1000]), hi = lo * f;
  if (hi > 900000) return null;
  return { ask: `${fmt(hi)} is how many times as much as ${fmt(lo)}?`, answer: num(f), _t: { kind: 'tenratio', hi, lo }, hint: `Think of ${fmt(lo)} moving to the left until it becomes ${fmt(hi)}. How many places?`,
    ways: [way('Divide', [`${fmt(hi)} ÷ ${fmt(lo)} = ${b(fmt(f))}`]), way('Count the places', [`${fmt(lo)} becomes ${fmt(hi)} when each digit moves ${MOVE[zeros(f)]} to the left.`, `That is × 1 followed by ${ZERO_WORD[zeros(f)]}, so ${fmt(hi)} is ${b(fmt(f))} times as much.`])] };
}
const THINGS = ['pencils', 'beads', 'stickers', 'screws', 'trading cards', 'paper clips'];
function word(L) {
  const f = pick(L === 2 ? [10, 100] : [10, 100, 1000]), a = rnd(2, L === 2 ? 99 : 400), thing = pick(THINGS);
  if (chance(0.5)) return { ask: `A box holds ${fmt(f)} ${thing}. A shop has ${plural(a, 'box', 'boxes')}. How many ${thing} is that?`, answer: num(a * f), _t: { kind: 'tenmul', a, f }, hint: `Each box holds ${fmt(f)}, so think of ${fmt(a)} groups of ${fmt(f)}.`, ways: mulWays(a, f, a * f) };
  const n = a * f;
  return { ask: `A factory has ${fmt(n)} ${thing}. It packs them ${fmt(f)} to a box. How many boxes can it fill?`, answer: num(a), _t: { kind: 'tendiv', n, f }, hint: `How many groups of ${fmt(f)} are in ${fmt(n)}?`, ways: divWays(n, f, a) };
}

const MAKERS = [[tenfold, multiply, multiply, places, missingFactor], [tenfold, multiply, divide, missingFactor, ratio, word, places], [tenfold, multiply, divide, divide, missingDivisor, ratio, word]];
export const genTen = L => oneOf(MAKERS[L - 1], L);
