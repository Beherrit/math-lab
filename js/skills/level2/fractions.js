// Fractions as equal parts of a whole and as points on a number line.
import { rnd, pick, chance, gcd, F, b, way, num, frac, choice, fracBar } from '../../util.js';
import { fracLine } from './pics.js';
import { cnt, isAre } from './words.js';

export const ONE = { 2: 'half', 3: 'third', 4: 'fourth', 5: 'fifth', 6: 'sixth', 8: 'eighth', 10: 'tenth' };
export const MANY = { ...Object.fromEntries(Object.entries(ONE).map(([d, w]) => [d, w + 's'])), 2: 'halves' };
export const DENS = [2, 3, 4, 5, 6, 8, 10];
const coprime = d => { let n; do { n = rnd(1, d - 1); } while (gcd(n, d) !== 1); return n; };
const countUp = (n, d) => Array.from({ length: n }, (_, i) => F(i + 1, d)).join(', ');

function partsWays(n, d, shaded = 'shaded') {
  return [way('Count the equal parts', [fracBar(n, d), `The whole is cut into ${b(d)} equal parts, so each part is one ${ONE[d]}. That number goes on the bottom.`,
    `${b(n)} of the parts ${n === 1 ? 'is' : 'are'} ${shaded}. That number goes on top.`, `The fraction is ${b(F(n, d))}.`]),
  n === 1 ? way('Why the bottom number matters', [`It takes ${d} of these parts to make the whole.`, `So one part is 1 out of ${d}: ${b(F(1, d))}.`])
    : way('Count one part at a time', [`One part is ${F(1, d)}.`, `Count the ${shaded} parts: ${countUp(n, d)}.`, `That is ${b(F(n, d))}.`])];
}
function lineWays(n, d, max) {
  const w = Math.floor(n / d), r = n % d;
  return [way('Count the jumps', [fracLine(d, n, { max, labels: true }), `Each whole is cut into ${d} equal jumps, so one jump is ${F(1, d)}.`, `The dot is ${cnt(n, 'jump')} from 0: ${b(F(n, d))}.`,
    ...(n > d ? [`That is past 1. ${F(n, d)} is the same as ${cnt(w, 'whole')} and ${F(r, d)}.`] : [])]),
  way('Think of a bar laid flat', [fracBar(n, d), `A number line is like a fraction bar: each whole is cut into ${MANY[d]}.`, `${n} of them ${isAre(n)} filled up to the dot: ${b(F(n, d))}.`])];
}
function barQ(n, d, notShaded) {
  const m = notShaded ? d - n : n;
  return { ask: `What fraction of the bar is ${notShaded ? b('not') + ' shaded' : 'shaded'}?<!--${n} of ${d}-->`, expr: `${d} equal parts`, exprSmall: true, visual: fracBar(n, d), answer: frac(m, d), fracInput: true,
    hint: 'Bottom number: how many equal parts in the whole. Top number: how many parts you are counting.', _t: { f: 'frac', n: m, d, shown: n },
    ways: notShaded ? [way('Count the white parts', [fracBar(n, d), `There are ${d} equal parts. ${n} ${n === 1 ? 'is' : 'are'} shaded, so ${d} − ${n} = ${m} ${m === 1 ? 'is' : 'are'} not.`, `Not shaded: ${b(F(m, d))}.`]),
      way('Shaded and not shaded make the whole', [`Shaded: ${F(n, d)}. The whole bar is ${F(d, d)}.`, `${F(n, d)} and ${b(F(m, d))} together make ${F(d, d)}, the whole bar.`])] : partsWays(n, d) };
}
const THINGS = [['pizza', 'slices', 'slice'], ['chocolate bar', 'pieces', 'piece'], ['pie', 'slices', 'slice'], ['loaf of bread', 'slices', 'slice'], ['sheet of paper', 'strips', 'strip']];
function sliceQ(d, eaten) {
  const [thing, parts, part] = pick(THINGS), left = d - eaten;
  if (!eaten) return { ask: `A ${thing} is cut into ${b(d + ' equal ' + parts)}. What fraction of the ${thing} is ${b('one')} of them?`, answer: frac(1, d), fracInput: true, hint: 'One part goes on top. The number of equal parts goes on the bottom.', ways: partsWays(1, d, 'taken'), _t: { f: 'frac', n: 1, d } };
  return { ask: `A ${thing} is cut into ${b(d + ' equal ' + parts)}. ${b(eaten)} of them ${eaten === 1 ? 'is' : 'are'} used up. What fraction of the ${thing} is left?`, answer: frac(left, d), fracInput: true, hint: `How many ${parts} are left? That goes on top.`, _t: { f: 'frac', n: left, d },
    ways: [way('Count what is left', [`${d} − ${eaten} = ${left}, so ${cnt(left, part, parts)} ${left === 1 ? 'is' : 'are'} left.`, `Each one is ${F(1, d)} of the ${thing}, so ${b(F(left, d))} is left.`]), ...partsWays(left, d, 'left').slice(0, 1)] };
}
function lineQ(d, n, max) {
  return { ask: `What fraction is the dot at?<!--${n} of ${d}-->`, expr: `0 to ${max}. Each whole is cut into ${d} equal parts.`, exprSmall: true, visual: fracLine(d, n, { max }), answer: frac(n, d), fracInput: true, ways: lineWays(n, d, max), _t: { f: 'frac', n, d },
    hint: `Count the equal jumps from 0 to 1. That is the bottom number.` };
}
function unitsQ(d, wholes) {
  const n = wholes ? wholes * d : rnd(2, d - 1), target = wholes ? cnt(wholes, 'whole') : F(n, d);
  return { ask: `How many ${F(1, d)} pieces make ${b(target)}?`, answer: num(n), hint: wholes ? `How many ${MANY[d]} are in one whole?` : `The top number counts the pieces.`, _t: wholes ? { f: 'mul', a: wholes, b: d } : { f: 'first', a: n, b: d },
    ways: [way('Count the pieces', wholes ? [`One whole is ${d} ${MANY[d]}.`, `${cnt(wholes, 'whole')}: ${Array(wholes).fill(d).join(' + ')} = ${b(n)} pieces.`] : [fracBar(n, d), `Count by ${F(1, d)}: ${countUp(n, d)}.`, `That took ${b(n)} pieces.`]),
      way('Read the fraction', wholes ? [`${F(d, d)} is one whole, so ${cnt(wholes, 'whole')} is ${F(n, d)}.`, `The top number says how many pieces: ${b(n)}.`] : [`In ${F(n, d)} the bottom says the pieces are ${MANY[d]}.`, `The top says how many of them: ${b(n)}.`])] };
}
function wholeQ(d) {
  return { ask: 'Which fraction is equal to one whole?', expr: `${MANY[d]}`, exprSmall: true, answer: choice(F(d, d), [F(1, d), F(d, 1), F(d - 1, d)]), choiceBig: true, hint: 'One whole means every one of the equal parts.', _t: { f: 'whole', d },
    ways: [way('All the parts', [fracBar(d, d), `Cut a whole into ${d} equal parts and take all ${d}: ${b(F(d, d))}.`, 'When the top and the bottom are the same, you have the whole thing.']),
      way('Rule out the others', [`${F(1, d)} is just one small part.`, `${F(d - 1, d)} is one part short of the whole.`, `${F(d, 1)} means ${d} wholes, which is far more than one.`])] };
}
export function genFrac(L) {
  const d = pick(DENS);
  if (L === 1) return chance(0.25) ? sliceQ(d, 0) : barQ(chance(0.5) ? 1 : coprime(d), d, false);
  if (L === 2) { const t = pick(['line', 'line', 'not', 'units', 'left']), dd = d === 2 ? 4 : d; return t === 'line' ? lineQ(d, coprime(d), 1) : t === 'not' ? barQ(coprime(dd), dd, true) : t === 'left' ? sliceQ(dd, coprime(dd)) : unitsQ(dd, 0); }
  const t = pick(['line2', 'line2', 'whole', 'left', 'wholes']), e = pick([2, 3, 4, 5, 6]);
  return t === 'line2' ? lineQ(e, e + coprime(e), 2) : t === 'whole' ? wholeQ(d) : t === 'left' ? sliceQ(d, coprime(d)) : unitsQ(d, rnd(2, 3));
}
