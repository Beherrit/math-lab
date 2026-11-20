// Two digits times one digit with an area model: break apart, spot the slip, estimate, compare, and work backwards.
import { rnd, pick, chance, fmt, b, way, num, choice, areaModel, column } from '../../util.js';
import { areaBlank } from './pics.js';
import { BLANK, cnt } from './words.js';
import { tfQ, slipQ } from './forms.js';

const noZero = (lo, hi) => { let n; do { n = rnd(lo, hi); } while (n % 10 === 0); return n; };
const tensOf = n => n - n % 10;
const near10 = n => Math.round(n / 10) * 10;

// n (two digits) times m (one digit): the area model, the column, and round-up-then-take-away for a 8 or 9 on the end.
export function mul2Ways(n, m) {
  const parts = [tensOf(n), n % 10].filter(Boolean), prods = parts.map(v => v * m), o = n % 10, t = Math.floor(n / 10);
  const ways = [way('Area model (break it apart)', [`Break ${n} into ${parts.join(' + ')}.`, areaModel(parts, [m]), `Multiply each part by ${m}: ${parts.map((v, i) => `${m} × ${v} = ${prods[i]}`).join(', ')}.`, `Add the parts: ${prods.join(' + ')} = ${b(fmt(n * m))}.`])];
  const ones = m * o, carry = Math.floor(ones / 10);
  ways.push(way('Column method', [column([String(n), String(m)], '×', String(n * m)), `Ones: ${m} × ${o} = ${ones}.${carry ? ` Write ${ones % 10} and carry ${cnt(carry, 'ten')}.` : ''}`,
    `Tens: ${m} × ${t} = ${m * t}${carry ? `, plus the ${carry} carried makes ${m * t + carry}` : ''}.`, `Answer: ${b(fmt(n * m))}.`]));
  if (o >= 8) ways.push(way('Round up, then take away', [`${n} is ${10 - o} less than ${n + 10 - o}.`, `${m} × ${n + 10 - o} = ${m * (n + 10 - o)}.`, `That is ${10 - o} extra in each of the ${m} groups: take away ${m} × ${10 - o} = ${m * (10 - o)}.`, `${m * (n + 10 - o)} − ${m * (10 - o)} = ${b(fmt(n * m))}.`]));
  return ways;
}
function areaQ(n, m, L) {
  const t = tensOf(n);
  return { ask: L === 1 ? `Multiply. ${n} is ${t} and ${n % 10}: multiply each part by ${m}, then add.` : 'Multiply. Break the bigger number into tens and ones.', expr: `${n} × ${m}`, visual: L === 1 ? areaBlank([t, n % 10], [m]) : undefined,
    answer: num(n * m), ways: mul2Ways(n, m), _t: { f: 'mul', a: n, b: m }, hint: `What is ${m} × ${t}? That is the biggest part.` };
}
function areaPartQ(n, m) {
  const t = tensOf(n), o = n % 10, asksPart = chance(0.5);
  return { ask: asksPart ? `An area model breaks ${b(`${m} × ${n}`)} into two parts. One part is ${m * t}. What is the other part?` : 'What number is missing?', expr: asksPart ? `${m} × ${n} = ${m * t} + ${BLANK}` : `${m} × ${n} = ${m} × ${t} + ${m} × ${BLANK}`, exprSmall: true,
    visual: asksPart ? areaBlank([t, o], [m]) : undefined, answer: num(asksPart ? m * o : o), hint: `Split ${n} into tens and ones. Which part is already used?`, _t: asksPart ? { f: 'mul', a: m, b: o } : { f: 'sub', a: n, b: t },
    ways: [way('Break the number apart', [`${n} = ${t} + ${o}.`, areaModel([t, o], [m]), asksPart ? `The tens part is ${m} × ${t} = ${m * t}. The ones part is ${m} × ${o} = ${b(m * o)}.` : `So ${m} × ${n} = ${m} × ${t} + ${m} × ${b(o)}.`]),
      way('Check the total', [`${m * t} + ${m * o} = ${m * n}.`, `${m} × ${n} = ${m * n}. It fits, so the other part is ${b(asksPart ? m * o : o)}.`])] };
}
function splitTfQ(n, m) {
  const t = tensOf(n), o = n % 10, ok = chance(0.5), shown = ok ? `${t} × ${m} + ${o} × ${m}` : `${t} × ${m} + ${o}`, value = ok ? n * m : t * m + o;
  return tfQ({ expr: `${n} × ${m} = ${shown}`, ok, hint: 'Both parts of the number must be multiplied, not just the tens.',
    why: [`${n} × ${m} = ${n * m}.`, `${shown} = ${value}.`, ok ? `${n * m} matches, so it is ${b('true')}.` : `${value} is not ${n * m}, so it is ${b('false')}.`] });
}
// A slip with a carry: the ten carried from the ones product was never added to the tens.
function carrySlipQ() {
  let n, m;
  do { n = noZero(21, 99); m = rnd(3, 9); } while ((n % 10) * m < 10);
  const carry = Math.floor((n % 10) * m / 10);
  return slipQ({ expr: `${n} × ${m}`, wrong: n * m - carry * 10, answer: n * m, ways: mul2Ways(n, m), hint: 'Check the ones first. Was anything carried to the tens?', t: { f: 'mul', a: n, b: m },
    slip: `The ${cnt(carry, 'ten')} carried from the ones was never added to the tens.` });
}
function estimateQ(n, m) {
  const est = near10(n) * m;
  return { ask: `Which is the best estimate for ${b(`${n} × ${m}`)}? Round ${n} to the nearest ten first.`, answer: choice(String(est), [String(est * 10), String(est / 10), String(n + m)]), choiceBig: true, hint: `Round ${n}, then multiply by ${m}. Check how many digits your answer should have.`, _t: { f: 'est2', n, m },
    ways: [way('Round, then multiply', [`${n} is close to ${near10(n)}.`, `${near10(n)} × ${m} = ${b(est)}.`]), way('Check the size', [`The exact answer is ${n * m}, which is close to ${b(est)}.`, 'The other choices have the wrong number of digits.'])] };
}
// Two products side by side: which is greater?
function compareQ() {
  let a, c, x, y;
  do { a = noZero(21, 99); x = rnd(3, 9); c = noZero(21, 99); y = rnd(3, 9); } while (a * x === c * y || Math.abs(a * x - c * y) > 60 || x === y);
  const more = a * x > c * y, [r, rm] = more ? [`${a} × ${x}`, a * x] : [`${c} × ${y}`, c * y];
  return { ask: 'Which is greater?', answer: choice(r, [more ? `${c} × ${y}` : `${a} × ${x}`]), choiceBig: true, hint: 'Work out both. A rough estimate may not be close enough to tell.', _t: { f: 'bigger' },
    ways: [way('Work out each one', [`${a} × ${x} = ${a * x}.`, `${c} × ${y} = ${c * y}.`, `${rm} is the greater, so ${b(r)}.`]), way('Estimate, then check', [`${near10(a)} × ${x} = ${near10(a) * x} and ${near10(c)} × ${y} = ${near10(c) * y}.`, `They are close, so work out the exact answers: ${a * x} and ${c * y}.`, `${b(r)} is greater.`])] };
}
// Work backwards: ? × m = total.
function backwardsQ() {
  let n, m;
  do { n = noZero(21, 99); m = rnd(3, 9); } while (n * m < 100);
  const t = tensOf(n), o = n % 10, total = n * m;
  return { ask: 'What number is missing?', expr: `${BLANK} × ${m} = ${total}`, answer: num(n), hint: `Split ${total} into a part that is ${m} × some tens and a part that is left over.`, _t: { f: 'div', a: total, b: m },
    ways: [way('Tens first, then ones', [`${m} × ${t} = ${m * t}, which leaves ${total} − ${m * t} = ${m * o}.`, `${m * o} is ${m} × ${o}.`, `So the missing number is ${t} + ${o} = ${b(n)}.`]), way('Divide', [`The missing number is ${total} ÷ ${m}.`, `${total} ÷ ${m} = ${b(n)}.`])] };
}
export function genArea2(L) {
  if (L === 1) {
    const n = pick([rnd(11, 19), rnd(11, 19), rnd(21, 26)]), m = rnd(2, 5), t = pick(['calc', 'calc', 'part', 'tf']);
    return t === 'part' ? areaPartQ(n, m) : t === 'tf' ? splitTfQ(n, m) : areaQ(n, m, 1);
  }
  if (L === 2) {
    const n = noZero(21, 99), m = rnd(3, 9), t = pick(['calc', 'calc', 'slip', 'est', 'tf', 'part']);
    return t === 'slip' ? carrySlipQ() : t === 'est' ? estimateQ(n, m) : t === 'tf' ? splitTfQ(n, m) : t === 'part' ? areaPartQ(n, m) : areaQ(n, m, 2);
  }
  const t = pick(['big', 'big', 'back', 'cmp', 'slip', 'est']);
  if (t === 'back') return backwardsQ();
  if (t === 'cmp') return compareQ();
  if (t === 'slip') return carrySlipQ();
  let n, m; do { n = noZero(46, 99); m = rnd(6, 9); } while ((n % 10) * m < 10);
  return t === 'est' ? estimateQ(n, m) : areaQ(n, m, 3);
}
