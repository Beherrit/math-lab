// Multiplying and dividing integers: where the sign rules come from, then using them.
import { rnd, pick, chance, fmt, b, k, way } from '../../util.js';
import { par, size, signName, snum, tag, plural } from './helpers.js';
import { signPattern } from './visuals-lines.js';

const neg = v => (chance(0.5) ? -v : v);
// Two factors with sizes from lo to hi, at least one negative.
function factors(lo, hi) {
  for (;;) { const a = neg(rnd(lo, hi)), c = neg(rnd(lo, hi)); if (a < 0 || c < 0) return [a, c]; }
}
const signLine = (a, c) => ((a < 0) === (c < 0)
  ? `The signs are the same (both ${signName(a)}), so the answer is ${b('positive')}.`
  : `The signs are different (one positive, one negative), so the answer is ${b('negative')}.`);
function whyWay(a, c) {
  if (a < 0 && c < 0) {
    const rows = [2, 1, 0, -1, -2].map(m => `${par(m)} × ${par(c)} = ${fmt(m * c)}`);
    return way('Follow the pattern', [`Look at what happens as the first factor counts down:`, rows.join('<br>'),
      `Each answer goes ${b(`up by ${size(c)}`)}. The pattern has to keep going past zero, so negative times negative comes out positive.`,
      `Keep counting down to ${par(a)}: ${par(a)} × ${par(c)} = ${b(fmt(a * c))}.`]);
  }
  const groups = a > 0 ? a : c, each = a > 0 ? c : a;
  const list = groups <= 5 ? `${Array(groups).fill(par(each)).join(' + ')} = ${fmt(a * c)}` : `adding ${par(each)} again and again, ${groups} times, gives ${fmt(a * c)}`;
  return way('Equal groups', [`Multiplying can be done in either order, so read it as ${b(`${groups} groups of ${par(each)}`)}.`, `${list}.`,
    `Adding negatives keeps going down, so positive times negative is negative: ${b(fmt(a * c))}.`]);
}
const mulWays = (a, c) => [whyWay(a, c), way('Sizes first, then the sign', [`Multiply the sizes: ${size(a)} × ${size(c)} = ${size(a * c)}.`, signLine(a, c), `Answer: ${b(fmt(a * c))}`])];
function divWays(t, d) {
  const q = t / d;
  return [
    way('Ask the multiplication question', [`${fmt(t)} ÷ ${par(d)} asks: what number times ${par(d)} gives ${fmt(t)}?`,
      `The sizes: ${size(d)} × ${size(q)} = ${size(t)}, so the answer has size ${size(q)}.`,
      `The sign: ${par(q)} × ${par(d)} = ${fmt(t)}, which matches. So the answer is ${b(fmt(q))}.`]),
    way('Sizes first, then the sign', [`Divide the sizes: ${size(t)} ÷ ${size(d)} = ${size(q)}.`, signLine(t, d),
      `Division uses the same sign rule as multiplication, because dividing undoes multiplying. Answer: ${b(fmt(q))}`]),
  ];
}
function mulProblem(lo, hi) {
  const [a, c] = factors(lo, hi);
  const both = a < 0 && c < 0 && Math.abs(a) >= 3 && Math.abs(c) >= 3;
  const why = a < 0 && c < 0
    ? `Same signs give a positive product. Counting down with ${par(c)} makes each product rise, so past zero the products are positive. Treating two negatives as still negative flips the sign.`
    : `Different signs give a negative product. The size is ${size(a)} times ${size(c)}. Keeping that size positive forgets that one negative flips the sign.`;
  return tag({ ask: 'Multiply.', expr: `${par(a)} × ${par(c)}`, visual: both ? signPattern(c) : undefined, answer: snum(a * c), ways: mulWays(a, c), why,
    hint: 'Multiply the sizes first. Then decide: same signs or different signs?' }, { kind: 'prod', xs: [a, c] });
}
function divProblem(lo, hi) {
  const [q, d] = factors(lo, hi), t = q * d;
  return tag({ ask: 'Divide.', expr: `${fmt(t)} ÷ ${par(d)}`, answer: snum(q), ways: divWays(t, d),
    hint: `What number times ${par(d)} makes ${fmt(t)}? Think about the sign too.` }, { kind: 'quot', a: t, c: d });
}
function threeFactors() {
  const xs = [neg(rnd(2, 6)), neg(rnd(2, 6)), neg(rnd(2, 5))];
  if (xs.every(v => v > 0)) xs[rnd(0, 2)] *= -1;
  const [a, c, d] = xs, n = xs.filter(v => v < 0).length, p = a * c * d;
  return tag({ ask: 'Multiply.', expr: xs.map(par).join(' × '), answer: snum(p),
    ways: [way('Two at a time', [`First two: ${par(a)} × ${par(c)} = ${b(fmt(a * c))}.`, `Then: ${par(a * c)} × ${par(d)} = ${b(fmt(p))}.`]),
      way('Count the negative signs', [`Multiply the sizes: ${size(a)} × ${size(c)} × ${size(d)} = ${size(p)}.`,
        `Every negative factor flips the sign once. There ${n === 1 ? 'is 1 negative factor' : `are ${n} negative factors`}: ${n % 2 ? 'an odd number of flips ends on negative' : 'an even number of flips ends back on positive'}.`,
        `Answer: ${b(fmt(p))}`])],
    hint: 'Multiply the first two, then multiply that answer by the third.' }, { kind: 'prod', xs });
}
function mulThenDiv() {
  const d = neg(rnd(2, 6)), a = d * neg(rnd(1, 4)), c = neg(rnd(2, 9));
  if (a > 0 && c > 0 && d > 0) return mulThenDiv();
  const r = a * c / d;
  return tag({ ask: 'Work it out.', expr: `${par(a)} × ${par(c)} ÷ ${par(d)}`, answer: snum(r),
    ways: [way('Left to right', [`Multiply first: ${par(a)} × ${par(c)} = ${b(fmt(a * c))}.`, `Then divide: ${fmt(a * c)} ÷ ${par(d)} = ${b(fmt(r))}.`]),
      way('Divide early to keep the numbers small', [`${par(a)} ÷ ${par(d)} = ${fmt(a / d)}, and the order of multiplying and dividing here can be swapped.`, `Then ${par(a / d)} × ${par(c)} = ${b(fmt(r))}.`])],
    hint: 'Go left to right: multiply, then divide. Track the sign at each step.' }, { kind: 'prodquot', a, c, d });
}
// rate: the biggest drop each time, n: the most times it can go on, so the total stays believable.
const RATE_CTX = [
  { thing: 'The temperature', chg: 'The temperature', verb: 'falls', unit: '°C', per: 'hour', pers: 'hours', what: 'change in temperature', rate: 5, n: 8 },
  { thing: 'A diver', chg: 'The height of a diver', verb: 'goes down', unit: ' m', per: 'minute', pers: 'minutes', what: 'change in height', rate: 6, n: 6 },
  { thing: 'A phone battery', chg: 'The battery level of a phone', verb: 'drops', unit: ' percentage points', per: 'hour', pers: 'hours', what: 'change in battery level', rate: 10, n: 6 },
  { thing: 'A savings account', chg: 'The balance of a savings account', verb: 'goes down', unit: ' dollars', per: 'week', pers: 'weeks', what: 'change in the balance', rate: 12, n: 12 },
];
export function mulWord(L) {
  const c = pick(RATE_CTX), step = L >= 3 ? 1 : L === 2 ? 0.75 : 0.5;
  const rate = -rnd(2, Math.max(2, Math.round(c.rate * step))), n = rnd(3, Math.max(3, Math.round(c.n * step))), total = rate * n;
  if (chance(0.5)) return tag({
    story: `${c.thing} ${c.verb} by ${k(size(rate) + c.unit)} every ${c.per}. This goes on for ${k(plural(n, c.per, c.pers))}.`,
    ask: `What is the total ${c.what}? Use a negative number for a drop.`, answer: snum(total), op: 'mul', ways: mulWays(n, rate),
    read: { find: `The total ${c.what}, as a signed number.`, know: [`${fmt(rate)}${c.unit} each ${c.per}`, plural(n, c.per, c.pers)], clue: `"Every ${c.per}" means equal groups, so multiply. Going down is a negative change.`, plan: `${n} × ${par(rate)}` },
    hint: `Write the change each ${c.per} as a negative number, then multiply.` }, { kind: 'prod', xs: [n, rate] });
  return tag({
    story: `${c.chg} changes by ${k(fmt(total) + c.unit)} in total over ${k(plural(n, c.per, c.pers))}, by the same amount every ${c.per}.`,
    ask: `What is the change each ${c.per}? Use a negative number for a drop.`, answer: snum(rate), op: 'div', ways: divWays(total, n),
    read: { find: `The change in one ${c.per}, as a signed number.`, know: [`total change: ${fmt(total)}${c.unit}`, plural(n, c.per, c.pers)], clue: `"The same amount every ${c.per}" means the total is split equally, so divide.`, plan: `${fmt(total)} ÷ ${n}` },
    hint: `Split the total change into ${n} equal parts.` }, { kind: 'quot', a: total, c: n });
}
export function genIntMul(L) {
  if (L === 1) return mulProblem(2, 9);
  if (L === 2) { const r = Math.random(); return r < 0.4 ? mulProblem(3, 12) : r < 0.8 ? divProblem(2, 12) : mulWord(L); }
  const r = Math.random();
  return r < 0.35 ? threeFactors() : r < 0.6 ? mulThenDiv() : r < 0.8 ? divProblem(6, 15) : mulWord(L);
}
