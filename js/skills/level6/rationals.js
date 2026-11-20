// Operations with negative decimals and negative fractions: the integer sign rules still hold.
import { R, rnd, pick, chance, gcd, lcm, fmt, fixed, fr, b, k, way, frac } from '../../util.js';
import { par, size, signName, snum, tag, plural } from './helpers.js';
import { hopLine } from './visuals-lines.js';

const neg = v => (chance(0.5) ? -v : v);
const tenths = (lo, hi) => rnd(lo, hi) / 10;
const parF = (n, d, o) => (n < 0 ? `(${fr(n, d, o)})` : fr(n, d, o));
const dec2 = (n, d) => fmt(+fixed(n / d, 2));
// A proper fraction in lowest terms with a random sign: [numerator, denominator].
function someFrac(dens) {
  for (;;) { const d = pick(dens), n = rnd(1, d - 1); if (gcd(n, d) === 1) return [neg(n), d]; }
}
const sameSign = (a, c) => ((a < 0) === (c < 0) ? 'The signs are the same, so the answer is positive.' : 'The signs are different, so the answer is negative.');

function decAddSub(m, sub) {
  let a, c;
  do { a = neg(tenths(1, m)); c = neg(tenths(1, m)); } while (a > 0 && c > 0 && (!sub || a >= c));
  const move = sub ? -c : c, r = R(a + move), A = Math.round(a * 10), Mv = Math.round(move * 10);
  const ways = [
    way('Number line', [`Start at ${b(fmt(a))}.`, sub ? `Subtracting ${par(c)} is the same as adding ${par(move)}.` : `You are adding ${par(c)}.`,
      `Move ${b(`${size(move)} to the ${move < 0 ? 'left' : 'right'}`)}.`, hopLine(a, r), `You land on ${b(fmt(r))}.`]),
    way('Think in tenths', [`Tenths behave just like whole numbers. ${fmt(a)} is ${plural(A, 'tenth')} and ${fmt(move)} is ${plural(Mv, 'tenth')}.`,
      `${fmt(A)} + ${par(Mv)} = ${plural(A + Mv, 'tenth')}.`, `${plural(A + Mv, 'tenth')} = ${b(fmt(r))}`]),
  ];
  return tag({ ask: sub ? 'Subtract.' : 'Add.', expr: `${fmt(a)} ${sub ? '−' : '+'} ${par(c)}`, answer: snum(r), ways,
    hint: sub ? `Rewrite it as adding the opposite: ${fmt(a)} + ${par(move)}.` : 'Same signs: add the sizes. Different signs: find the gap between the sizes.' }, { kind: 'sum', xs: [a, move] });
}
function fracAddWays(n1, d1, n2, d2, sub) {
  const L = lcm(d1, d2), m1 = n1 * L / d1, c2 = (sub ? -n2 : n2), m2 = c2 * L / d2, s = m1 + m2;
  const steps = [];
  if (sub) steps.push(`Subtracting is adding the opposite: ${fr(n1, d1)} − ${parF(n2, d2)} = ${fr(n1, d1)} + ${parF(c2, d2)}`);
  steps.push(d1 === d2 ? `The pieces are the same size (${d1 === 4 ? 'quarters' : 'parts of ' + d1}), so only the tops change.`
    : `Make the pieces the same size. Both ${d1} and ${d2} go into ${b(L)}: ${fr(n1, d1)} = ${fr(m1, L, { simplify: false })} and ${fr(c2, d2)} = ${fr(m2, L, { simplify: false })}.`);
  steps.push(`Add the tops like integers: ${fmt(m1)} + ${par(m2)} = ${b(fmt(s))}.`);
  steps.push(`That is ${fmt(s)} over ${L}${gcd(s, L) > 1 && s !== 0 ? ', which simplifies' : ''}: ${b(fr(s, L))}`);
  return [way('Same-size pieces', steps),
    way('Estimate with decimals', [`${fr(n1, d1)} is about ${dec2(n1, d1)} and ${fr(n2, d2)} is about ${dec2(n2, d2)}.`,
      `${dec2(n1, d1)} ${sub ? '−' : '+'} ${par(+fixed(n2 / d2, 2))} is about ${fmt(+fixed(n1 / d1 + c2 / d2, 2))}.`, `${fr(s, L)} is about ${dec2(s, L)}, so the exact answer fits.`])];
}
function fracAddSub(dens, same) {
  const sub = chance(0.5); let [n1, d1] = someFrac(dens), [n2, d2] = same ? [neg(rnd(1, d1 - 1)), d1] : someFrac(dens);
  if (gcd(n2, d2) !== 1 || (!same && d1 === d2) || (n1 > 0 && n2 > 0)) return fracAddSub(dens, same);
  const s = n1 * d2 + (sub ? -n2 : n2) * d1;
  if (s === 0) return fracAddSub(dens, same);
  return tag({ ask: sub ? 'Subtract. Give a fraction.' : 'Add. Give a fraction.', expr: `${fr(n1, d1)} ${sub ? '−' : '+'} ${parF(n2, d2)}`,
    answer: frac(s, d1 * d2, { signed: true }), ways: fracAddWays(n1, d1, n2, d2, sub),
    hint: same ? 'The bottoms match, so work with the tops as integers.' : 'First rewrite both fractions with the same bottom number.' }, { kind: 'fsum', a: [n1, d1], c: [sub ? -n2 : n2, d2] });
}
function decMul() {
  const a = neg(tenths(2, 25)), c = chance(0.6) ? neg(rnd(2, 9)) : neg(tenths(2, 9));
  if ((a > 0 && c > 0) || Number.isInteger(a)) return decMul();
  const A = Math.round(Math.abs(a) * 10), whole = Number.isInteger(c), C = whole ? Math.abs(c) : Math.round(Math.abs(c) * 10), r = R(a * c);
  return tag({ ask: 'Multiply.', expr: `${par(a)} × ${par(c)}`, answer: snum(r),
    ways: [way('Sizes first, then the sign', [`Leave out the signs and decimal points for a moment: ${A} × ${C} = ${fmt(A * C)}.`,
      `The factors have ${whole ? '1 decimal place' : '2 decimal places'} between them, so the size is ${size(r)}.`, sameSign(a, c), `Answer: ${b(fmt(r))}`]),
      way('Think in tenths', [whole ? `${size(a)} is ${plural(A, 'tenth')}. ${plural(C, 'group')} of ${plural(A, 'tenth')} is ${plural(A * C, 'tenth')}, which is ${size(r)}.`
        : `${size(a)} is ${plural(A, 'tenth')} and ${size(c)} is ${plural(C, 'tenth')}. Tenths times tenths makes hundredths: ${A} × ${C} = ${plural(A * C, 'hundredth')}, which is ${size(r)}.`,
        `${sameSign(a, c)} Answer: ${b(fmt(r))}`])],
    hint: 'Multiply as if they were positive, place the decimal point, then choose the sign.' }, { kind: 'prod', xs: [a, c] });
}
function decDiv() {
  const d = neg(pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 2, 3, 4, 5])), q = neg(chance(0.5) ? rnd(2, 12) : tenths(11, 49)), t = R(q * d);
  if ((t > 0 && d > 0) || Number.isInteger(q) === Number.isInteger(d) && Number.isInteger(d)) return decDiv();
  const whole = Number.isInteger(d);
  return tag({ ask: 'Divide.', expr: `${fmt(t)} ÷ ${par(d)}`, answer: snum(q),
    ways: [way('Sizes first, then the sign', [
      whole ? `Divide the sizes: ${size(t)} ÷ ${size(d)} = ${size(q)}.` : `Make the divisor a whole number by multiplying both numbers by 10: ${size(t)} ÷ ${size(d)} = ${fmt(R(Math.abs(t) * 10))} ÷ ${fmt(R(Math.abs(d) * 10))} = ${size(q)}.`,
      sameSign(t, d), `Answer: ${b(fmt(q))}`]),
      way('Check by multiplying back', [`If the answer is right, then ${par(q)} × ${par(d)} gives ${fmt(t)}.`, `${size(q)} × ${size(d)} = ${size(t)}, and the signs give a ${signName(t)} result. It checks out.`])],
    hint: 'Divide the sizes, then use the same sign rule as multiplying.' }, { kind: 'quot', a: t, c: d });
}
function fracMulDiv(div) {
  const [n1, d1] = someFrac([2, 3, 4, 5, 6, 8]), [n2, d2] = someFrac([2, 3, 4, 5, 6]);
  if (n1 > 0 && n2 > 0) return fracMulDiv(div);
  const sg = Math.sign(n2), [tn, td] = div ? [n1 * d2 * sg, d1 * n2 * sg] : [n1 * n2, d1 * d2];
  const flip = parF(d2 * sg, Math.abs(n2), { mixed: false });
  const ways = div ? [
    way('Multiply by the flip', [`Dividing by a fraction is the same as multiplying by its flip (its reciprocal), because ${fr(Math.abs(n2), d2, { mixed: false })} × ${fr(d2, Math.abs(n2), { mixed: false })} = 1.`,
      `${fr(n1, d1)} ÷ ${parF(n2, d2)} = ${fr(n1, d1)} × ${flip}`, `Tops: ${size(n1)} × ${d2} = ${Math.abs(n1) * d2}. Bottoms: ${d1} × ${size(n2)} = ${d1 * Math.abs(n2)}.`,
      sameSign(n1, n2), `Answer: ${b(fr(tn, td))}`]),
    way('Check by multiplying back', [`The answer times ${parF(n2, d2)} should give ${fr(n1, d1)}.`, `${parF(tn, td)} × ${parF(n2, d2)} = ${fr(tn * n2, td * d2)}, so it checks out.`])]
    : [way('Tops, bottoms, then the sign', [`Multiply the tops: ${size(n1)} × ${size(n2)} = ${Math.abs(n1 * n2)}.`, `Multiply the bottoms: ${d1} × ${d2} = ${d1 * d2}.`, sameSign(n1, n2), `Answer: ${b(fr(tn, td))}`]),
      way('Estimate with decimals', [`${fr(n1, d1)} is about ${dec2(n1, d1)} and ${fr(n2, d2)} is about ${dec2(n2, d2)}.`, `Their product is about ${fmt(+fixed(n1 * n2 / (d1 * d2), 2))}, which matches ${fr(tn, td)}.`])];
  return tag({ ask: `${div ? 'Divide' : 'Multiply'}. Give a fraction or a mixed number.`, expr: `${fr(n1, d1)} ${div ? '÷' : '×'} ${parF(n2, d2)}`, answer: frac(tn, td, { signed: true }), ways,
    hint: div ? 'Flip the second fraction and multiply. Then choose the sign.' : 'Tops times tops, bottoms times bottoms, then choose the sign.' }, { kind: div ? 'fquot' : 'fprod', a: [n1, d1], c: [n2, d2] });
}
function mixedForms() {
  const [n, d] = someFrac([2, 4, 5, 10]), a = neg(tenths(5, 45)), fd = n / d, r = R(a + fd);
  if (a > 0 && n > 0) return mixedForms();
  return tag({ ask: 'Add. Give your answer as a decimal.', expr: `${fmt(a)} + ${parF(n, d)}`, answer: snum(r),
    ways: [way('Turn the fraction into a decimal', [`${fr(n, d)} = ${fmt(n)} ÷ ${d} = ${b(fmt(fd))}`, `Now add: ${fmt(a)} + ${par(fd)} = ${b(fmt(r))}`]),
      way('Number line', [`Start at ${fmt(a)} and move ${size(fd)} to the ${fd < 0 ? 'left' : 'right'}.`, hopLine(a, r), `You land on ${b(fmt(r))}.`])],
    hint: 'Change the fraction to a decimal first, so both numbers are the same kind.' }, { kind: 'sum', xs: [a, fd] });
}
const RAT_CTX = [
  { thing: 'The temperature in a freezer', unit: '°C', per: 'hour', what: 'temperature' }, { thing: 'The water level in a tank', unit: ' cm', per: 'day', what: 'water level' },
  { thing: 'The height of a hot-air balloon', unit: ' m', per: 'second', what: 'height' },
];
export function ratWord() {
  const c = pick(RAT_CTX), rate = -(rnd(1, 4) + pick([0.5, 0.25, 0.2, 0.75])), n = pick([2, 4, 6, 8]), total = R(rate * n);
  return tag({ story: `${c.thing} changes by ${k(fmt(rate) + c.unit)} every ${c.per}, for ${k(n + ' ' + c.per + 's')}.`, ask: `What is the total change in ${c.what}? Use a negative number for a drop.`,
    answer: snum(total), op: 'mul',
    ways: [way('Sizes first, then the sign', [`${n} × ${size(rate)} = ${size(total)}.`, `A positive times a negative is negative: ${b(fmt(total))}`]),
      way('Break the decimal apart', [`${size(rate)} = ${Math.floor(-rate)} + ${fmt(R(-rate - Math.floor(-rate)))}.`, `${n} × ${Math.floor(-rate)} = ${n * Math.floor(-rate)} and ${n} × ${fmt(R(-rate - Math.floor(-rate)))} = ${fmt(R(n * (-rate - Math.floor(-rate))))}.`, `Together ${size(total)}, and it is a drop: ${b(fmt(total))}`])],
    read: { find: `The total change in ${c.what}, as a signed number.`, know: [`${fmt(rate)}${c.unit} each ${c.per}`, `${n} ${c.per}s`], clue: `"Every ${c.per}" means equal groups, so multiply.`, plan: `${n} × ${par(rate)}` },
    hint: 'Multiply the sizes, then remember the change is a drop.' }, { kind: 'prod', xs: [n, rate] });
}
export function genRat(L) {
  const r = Math.random();
  if (L === 1) return r < 0.6 ? decAddSub(60, chance(0.5)) : fracAddSub([4, 5, 6, 8, 10], true);
  if (L === 2) return r < 0.3 ? decMul() : r < 0.5 ? decDiv() : r < 0.8 ? fracAddSub([2, 3, 4, 5, 6, 8], false) : fracMulDiv(false);
  return r < 0.35 ? fracMulDiv(true) : r < 0.6 ? mixedForms() : r < 0.8 ? decAddSub(250, true) : ratWord();
}
