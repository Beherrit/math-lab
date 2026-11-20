// Solving proportions: scale factor, unit rate and cross products (with the reason cross products work).
import { R, rnd, pick, chance, gcd, fmt, F, b, k, way, num, table } from '../../util.js';
import { tag } from './helpers.js';

// v = [a, b, c, d] stands for a/b = c/d. pos is the place of the unknown.
const cell = (v, pos, i) => (i === pos ? 'x' : fmt(v[i]));
const show = (v, pos) => `${F(cell(v, pos, 0), cell(v, pos, 1))} = ${F(cell(v, pos, 2), cell(v, pos, 3))}`;
// same: the known number in x's own fraction. opp: the number level with x in the other fraction. base: under/over opp.
const parts = (v, pos) => ({ x: v[pos], same: v[pos ^ 1], opp: v[(pos + 2) % 4], base: v[((pos ^ 1) + 2) % 4] });
function scaleWay(v, pos) {
  const { x, same, opp, base } = parts(v, pos), f = same / base, row = pos % 2 ? 'top' : 'bottom', other = pos % 2 ? 'bottom' : 'top';
  if (Number.isInteger(f) || Number.isInteger(1 / f)) {
    const op = Number.isInteger(f) ? `× ${fmt(f)}` : `÷ ${fmt(R(1 / f))}`;
    return way('Scale factor', [`Look at the ${row} numbers: ${fmt(base)} becomes ${fmt(same)}. That is ${b(op)}.`,
      `Equal ratios scale both numbers the same way, so do it to the ${other} number too: ${fmt(opp)} ${op} = ${b(fmt(x))}`]);
  }
  const g = gcd(opp, base), p = opp / g, q = base / g;
  if (g > 1 && same % q === 0) return way('Simplify, then scale', [
    `Make the full ratio simpler: divide ${fmt(opp)} and ${fmt(base)} by ${g} to get ${p} and ${q}.`,
    `Now the ${row} goes from ${q} to ${fmt(same)}: that is × ${same / q}.`, `Do the same to the ${other}: ${p} × ${same / q} = ${b(fmt(x))}`]);
  return way('Unit rate', [`Find how much goes with 1: ${fmt(opp)} ÷ ${fmt(base)} = ${fmt(R(opp / base))}.`,
    `There are ${fmt(same)} of them, so multiply: ${fmt(same)} × ${fmt(R(opp / base))} = ${b(fmt(x))}`]);
}
const crossWay = (v, pos) => {
  const { x, same, opp, base } = parts(v, pos);
  return way('Cross products', [
    `Multiply both sides by both bottom numbers. The fractions disappear and you are left with the two diagonal products: they must be equal.`,
    `x × ${fmt(base)} = ${fmt(same)} × ${fmt(opp)} = ${fmt(same * opp)}`, `x = ${fmt(same * opp)} ÷ ${fmt(base)} = ${b(fmt(x))}`]);
};
const tableWay = (v, pos) => way('Ratio table', [table(['', 'first', 'second'], [['top', cell(v, pos, 0), cell(v, pos, 2)], ['bottom', cell(v, pos, 1), cell(v, pos, 3)]]),
  'Both columns must show the same ratio. Whatever you multiply by to go across one row, you multiply by to go across the other.', `That makes x = ${b(fmt(v[pos]))}.`]);
function problem(v, pos, extraWay) {
  return tag({ ask: 'Find x.', expr: show(v, pos), answer: num(v[pos]), ways: [scaleWay(v, pos), extraWay ? tableWay(v, pos) : crossWay(v, pos)],
    hint: pos % 2 ? 'Look at the two top numbers. What do you multiply or divide by to get from one to the other?' : 'Look at the two bottom numbers. What do you multiply or divide by to get from one to the other?' },
  { kind: 'prop', v, pos });
}
function easy() {
  const a = rnd(1, 9), bb = rnd(2, 9), m = rnd(2, 6);
  if (a === bb) return easy();
  return problem([a, bb, a * m, bb * m], chance(0.75) ? pick([2, 3]) : pick([0, 1]), true);
}
// Two equal ratios p:q scaled by s and by t, where neither scale is a multiple of the other.
function standardValues() {
  for (;;) {
    const p = rnd(1, 7), q = rnd(2, 7), s = rnd(2, 9), t = rnd(2, 9);
    if (p !== q && gcd(p, q) === 1 && t % s && s % t) return [p * s, q * s, p * t, q * t];
  }
}
function decimalAnswer() {
  for (;;) {
    const bb = pick([2, 4, 5, 8]), a = rnd(1, 9), d = rnd(3, 15), x = a * d / bb;
    if (gcd(a, bb) === 1 && !Number.isInteger(x) && Number.isInteger(x * 10)) return problem(chance(0.5) ? [a, bb, x, d] : [x, d, a, bb], chance(0.5) ? 2 : 0);
  }
}
const WORD = [
  { max: 63, top: 'grams of cocoa', bot: 'grams of sugar', intro: (A, B) => `A hot chocolate mix uses ${A} with ${B}.` },
  { max: 63, top: 'pages', bot: 'seconds', intro: (A, B) => `A printer prints ${A} in ${B} at a steady speed.` },
  { max: 63, top: 'dollars', bot: 'notebooks', intro: (A, B) => `A shop sells ${B} for ${A}.` },
  { max: 63, top: 'millilitres of blue paint', bot: 'millilitres of white paint', intro: (A, B) => `A paint colour is mixed from ${A} and ${B}.` },
  { max: 63, top: 'megabytes', bot: 'photos', intro: (A, B) => `On a phone, ${B} take up ${A} of storage.` },
  { max: 40, top: 'centimetres on a map', bot: 'kilometres on the ground', intro: (A, B) => `On a map, ${A} stand for ${B}.` },
];
export function propWord() {
  const c = pick(WORD), pos = pick([2, 3]);
  let v = standardValues();
  while (Math.max(...v) > c.max) v = standardValues();
  const [a, bb] = v;
  const unk = pos === 2 ? c.top : c.bot, knownNoun = pos === 2 ? c.bot : c.top, known = v[pos === 2 ? 3 : 2];
  return tag({ story: `${c.intro(k(`${a} ${c.top}`), k(`${bb} ${c.bot}`))} The same ratio is kept for a different amount: ${k(`${known} ${knownNoun}`)}.`,
    ask: `How many ${unk} go with ${known} ${knownNoun}?`, expr: show(v, pos), answer: num(v[pos]), op: 'multi', ways: [scaleWay(v, pos), crossWay(v, pos)],
    read: { find: `The number of ${unk}.`, know: [`${a} ${c.top} for every ${bb} ${c.bot}`, `${known} ${knownNoun}`],
      clue: '"The same ratio" means two equal fractions. Keep the same thing on top in both.', plan: `${a}/${bb} = ${pos === 2 ? 'x/' + known : known + '/x'}` },
    hint: 'Write two fractions with the same kind of thing on top, and set them equal.' }, { kind: 'prop', v, pos });
}
export function genSolveProp(L) {
  if (L === 1) return easy();
  if (L === 2) return problem(standardValues(), rnd(0, 3), false);
  return chance(0.5) ? propWord() : decimalAnswer();
}
