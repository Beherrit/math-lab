// Comparing fractions: same bottom number, same top number, against one whole, and which unit fraction is greatest.
import { rnd, pick, chance, F, b, way, num, choice, fracBar } from '../../util.js';
import { BLANK, LT, GT, cnt } from './words.js';
import { MANY, DENS } from './fractions.js';

function cmpWays(n1, d1, n2, d2) {
  const v1 = n1 / d1, v2 = n2 / d2, big = v1 > v2 ? F(n1, d1) : F(n2, d2), bars = [fracBar(n1, d1), fracBar(n2, d2)];
  if (d1 === d2) return [way('Same size pieces', [...bars, `Both are cut into ${MANY[d1]}, so the pieces are the same size.`, `More pieces means more: ${cnt(Math.max(n1, n2), 'piece')} beat ${cnt(Math.min(n1, n2), 'piece')}.`, `${b(big)} is greater.`]),
    way('On a number line', [`Count jumps of ${F(1, d1)} from 0.`, `${big} is ${Math.abs(n1 - n2)} ${Math.abs(n1 - n2) === 1 ? 'jump' : 'jumps'} further along, so ${b(big)} is greater.`])];
  const lo = Math.min(d1, d2), hi = Math.max(d1, d2);
  return [way('Same number of pieces, different sizes', [...bars, `Both have ${cnt(n1, 'piece')}. What differs is the size of a piece.`, `Cutting a whole into more parts makes each part smaller, so ${MANY[hi]} are smaller than ${MANY[lo]}.`, `${b(big)} is greater.`]),
    way('Think of sharing', [`Share one pizza among ${lo} people or among ${hi} people.`, `With only ${lo} people, each slice is bigger. So ${F(1, lo)} is more than ${F(1, hi)}.`, `${n1 > 1 ? `Take ${n1} slices each time: ` : ''}${b(big)} is greater.`])];
}
function fracPair(sameDen) {
  if (sameDen) { const d = pick(DENS.slice(1)), n1 = rnd(1, d - 1); let n2 = rnd(1, d - 1); while (n2 === n1) n2 = rnd(1, d - 1); return [n1, d, n2, d]; }
  const d1 = pick(DENS); let d2 = pick(DENS); while (d2 === d1) d2 = pick(DENS);
  const n = chance(0.6) ? 1 : rnd(1, Math.min(d1, d2) - 1);
  return [n, d1, n, d2];
}
function pickQ(pair) {
  const [n1, d1, n2, d2] = pair, most = chance(0.6), first = n1 / d1 > n2 / d2, want = first === most ? F(n1, d1) : F(n2, d2), other = first === most ? F(n2, d2) : F(n1, d1);
  return { ask: `Which fraction is ${b(most ? 'greater' : 'less')}?`, expr: `${F(n1, d1)} &nbsp;or&nbsp; ${F(n2, d2)}`, answer: choice(want, [other]), choiceBig: true, ways: cmpWays(n1, d1, n2, d2).map(w => (most ? w : way(w.t, [...w.s, `So ${b(want)} is the smaller one.`]))), _t: { f: most ? 'fmax' : 'fmin', fs: [[n1, d1], [n2, d2]] },
    hint: d1 === d2 ? 'The pieces are the same size. Which fraction has more of them?' : 'The number of pieces is the same. Which pieces are bigger?' };
}
function signQ(pair) {
  const [n1, d1, n2, d2] = pair, v1 = n1 / d1, v2 = n2 / d2, sign = v1 < v2 ? LT : v1 > v2 ? GT : '=';
  const show = (n, d) => (d === 1 ? String(n) : F(n, d));
  return { ask: 'Pick the sign that makes this true.', expr: `${show(n1, d1)} ${BLANK} ${show(n2, d2)}`, answer: choice(sign, [], { all: [LT, GT, '='] }), choiceBig: true, _t: { f: 'fsign', a: [n1, d1], b: [n2, d2] },
    hint: d2 === 1 ? 'One whole has the same number on the top and the bottom.' : d1 === d2 ? 'Same size pieces: compare how many.' : 'Same number of pieces: compare how big the pieces are.',
    ways: d2 === 1 ? [way('Compare with the whole', [fracBar(n1, d1), `One whole is ${F(d1, d1)}.`, n1 === d1 ? `${F(n1, d1)} is all the parts, so it ${b('equals')} 1.` : `${F(n1, d1)} is ${d1 - n1} ${d1 - n1 === 1 ? 'part' : 'parts'} short of the whole, so it is ${b('less than')} 1.`]),
      way('Look at top and bottom', ['When the top is smaller than the bottom, the fraction is less than 1. When they match, it is exactly 1.', `${show(n1, d1)} ${b(sign)} 1`])]
      : [...cmpWays(n1, d1, n2, d2), way('Write the sign', ['The open side of the sign faces the greater fraction.', `${F(n1, d1)} ${b(sign)} ${F(n2, d2)}`])] };
}
function smallestQ() {
  const ds = DENS.slice().sort(() => Math.random() - 0.5).slice(0, 3), most = chance(0.5), want = most ? Math.min(...ds) : Math.max(...ds);
  return { ask: `Which is the ${b(most ? 'greatest' : 'smallest')}?`, expr: ds.map(d => F(1, d)).join(' &nbsp; '), answer: choice(F(1, want), ds.filter(d => d !== want).map(d => F(1, d))), choiceBig: true, _t: { f: most ? 'umax' : 'umin', ds },
    hint: 'Each is one piece. The more pieces a whole is cut into, the smaller each piece.',
    ways: [way('Think of sharing', [`One piece each time. A whole cut into ${Math.max(...ds)} parts has the smallest pieces, and a whole cut into ${Math.min(...ds)} parts has the biggest.`, `The ${most ? 'greatest' : 'smallest'} is ${b(F(1, want))}.`]),
      way('See the bars', [...ds.slice().sort((p, q) => p - q).map(d => fracBar(1, d)), `From biggest piece to smallest: ${ds.slice().sort((p, q) => p - q).map(d => F(1, d)).join(', ')}.`])] };
}
const TF = { all: ['True', 'False'] };
// "True or false?" about two fractions, such as 3/8 > 2/8. The sentence is judged by cross-multiplying.
function tfFracQ(pair) {
  const [n1, d1, n2, d2] = pair, real = n1 * d2 < n2 * d1 ? LT : n1 * d2 > n2 * d1 ? GT : '=';
  const ok = chance(0.5), shown = ok ? real : pick([LT, GT, '='].filter(x => x !== real));
  return { ask: 'True or false?', expr: `${F(n1, d1)} ${shown} ${F(n2, d2)}`, answer: choice(ok ? 'True' : 'False', [], TF), choiceBig: true, _t: { f: 'ftf', fs: [[n1, d1], [n2, d2]], rel: shown, ok },
    hint: d1 === d2 ? 'The pieces are the same size. Compare how many there are.' : 'The number of pieces is the same. Compare how big each piece is.',
    ways: [...cmpWays(n1, d1, n2, d2).slice(0, 1), way('Say it in words', [`Comparing ${F(n1, d1)} with ${F(n2, d2)}, the true sign is ${b(real)}.`, ok ? `The sentence uses ${real}, so it is true.` : `The sentence uses ${shown}, so it is false.`])] };
}
// Same bottom number: the smallest top number that keeps the sentence true.
function topQ() {
  const d = pick(DENS.slice(2)), n = rnd(1, d - 2);
  return { ask: 'What is the smallest whole number that makes this true?', expr: `${F(n, d)} ${LT} ${F(BLANK, d)}`, answer: num(n + 1), hint: 'The pieces are the same size, so the fraction on the right needs more of them.', _t: { f: 'add', xs: [n, 1] },
    ways: [way('Same size pieces', [`Both are ${MANY[d]}, so the fraction with more pieces is greater.`, `${cnt(n, 'piece')} would only match ${F(n, d)}. One more piece is greater: ${b(n + 1)}.`]), way('Count up', [`Count up the ${MANY[d]}: ${Array.from({ length: n + 1 }, (_, i) => F(i + 1, d)).join(', ')}.`, `The first one past ${F(n, d)} is the one with ${b(n + 1)} on top.`])] };
}
// Same top number: the largest bottom number that keeps the sentence true (smaller bottoms mean bigger pieces).
function bottomQ() {
  const d = rnd(4, 10);
  return { ask: 'What is the largest whole number that makes this true?', expr: `${F(1, BLANK)} ${GT} ${F(1, d)}`, answer: num(d - 1), hint: 'The fraction on the left must have bigger pieces. Does a bigger bottom number mean bigger or smaller pieces?', _t: { f: 'sub', a: d, b: 1 },
    ways: [way('Bigger pieces', [`${F(1, d)} is one piece of a whole cut into ${d}. To have a bigger piece, cut the whole into fewer parts.`, `The largest number of parts that still gives bigger pieces is one fewer: ${d} − 1 = ${b(d - 1)}.`]), way('Test it', [`${F(1, d - 1)} is bigger than ${F(1, d)}, because ${d - 1} parts are fewer than ${d} parts.`, `${F(1, d)} would be equal, not greater. So the answer is ${b(d - 1)}.`])] };
}
export function genFracCmp(L) {
  if (L === 1) {
    const t = pick(['pick', 'pick', 'sign', 'tf', 'top']);
    return t === 'sign' ? signQ(fracPair(true)) : t === 'tf' ? tfFracQ(fracPair(true)) : t === 'top' ? topQ() : pickQ(fracPair(true));
  }
  if (L === 2) {
    const t = pick(['pick', 'pick', 'sign', 'tf', 'bottom']);
    return t === 'sign' ? signQ(fracPair(false)) : t === 'tf' ? tfFracQ(fracPair(false)) : t === 'bottom' ? bottomQ() : pickQ(fracPair(false));
  }
  const t = pick(['sign', 'sign', 'one', 'three', 'tf']);
  if (t === 'three') return smallestQ();
  if (t === 'tf') return tfFracQ(fracPair(chance(0.5)));
  if (t === 'one') { const d = pick(DENS); return signQ([chance(0.4) ? d : rnd(1, d - 1), d, 1, 1]); }
  return signQ(fracPair(chance(0.5)));
}
