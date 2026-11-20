// Breaking fractions apart: into unit fractions and into other fractions with the same bottom, and mixed numbers into wholes plus a part.
import { rnd, pick, chance, shuffle, F, M, b, way, num, choice, fracBar } from '../../util.js';
import { BLANK, oneOf, plural, tagged } from './helpers.js';
import { bar, count } from './frac-util.js';

const DMAX = [8, 10, 12];
const denom = L => rnd(L === 1 ? 2 : 3, DMAX[L - 1]);
const sumOf = parts => parts.map(([n, d]) => F(n, d)).join(' + ');
// n split into k positive tops, in a random order.
function compose(n, k) {
  const tops = Array(k).fill(1);
  for (let left = n - k; left > 0; left--) tops[rnd(0, k - 1)]++;
  return tops;
}

function unitCount(L) {
  const d = denom(L), n = rnd(2, d - 1), pieces = Array(Math.min(n, 5)).fill(F(1, d)).join(' + ') + (n > 5 ? ' + …' : '');
  return { ask: `How many pieces of ${F(1, d)} make ${F(n, d)}?`, visual: L === 1 ? bar(n, d) : undefined, answer: num(n), _t: { kind: 'fpunit', n, d }, hint: 'The top number counts how many pieces of the same size there are.',
    ways: [way('Count the pieces', [bar(n, d), `${F(n, d)} is ${count(n, d)}. Each piece is ${F(1, d)}.`, `${F(n, d)} = ${pieces}`, `It takes ${b(n)} pieces.`]),
      way('Multiply the unit fraction', [`${F(n, d)} is the same as ${n} × ${F(1, d)}.`, `So ${b(n)} pieces of ${F(1, d)} make ${F(n, d)}.`])] };
}
// Picture only: how many unit pieces are shaded.
function shadedUnits(L) {
  const d = denom(Math.min(L, 2)), n = rnd(2, d - 1);
  return tagged({ ask: `Each piece of the bar is ${F(1, d)}. How many of these pieces are shaded?`, visual: fracBar(n, d), answer: num(n), _t: { kind: 'fpbar', n, d }, hint: 'Count the shaded pieces one by one.',
    ways: [way('Count them', [fracBar(n, d), `${n} pieces are shaded, so the shaded part is ${n} × ${F(1, d)} = ${F(n, d)}.`, `Answer: ${b(n)}`]), way('Count what is left', [`The bar has ${d} pieces in all. Count the pieces that are not shaded: ${d - n}.`, `${d} − ${d - n} = ${b(n)} pieces are shaded.`])] }, { n, d });
}
function mixParts(L) {
  const d = denom(L), w = rnd(1, L === 1 ? 3 : 5), n = rnd(1, d - 1), ones = w <= 3 && chance(0.5);
  return { ask: 'Find the missing top number.', expr: `${M(w, n, d)} = ${ones ? Array(w).fill(1).join(' + ') : w} + ${F(BLANK, d)}`, answer: num(n), _t: { kind: 'fpmix', w, n, d }, hint: 'A mixed number is whole numbers and a fraction side by side. What is the fraction part?',
    ways: [way('Read the mixed number', [`${M(w, n, d)} means ${plural(w, 'whole')} and ${count(n, d)}.`, `The fraction part is ${F(n, d)}, so the missing top number is ${b(n)}.`]), way('Take away the wholes', [`${M(w, n, d)} − ${w} = ${F(n, d)}`, `The blank is ${b(n)}.`])] };
}
function wholeParts() {
  const d = rnd(3, 10), w = rnd(1, 4), n = rnd(1, d - 1);
  return { ask: 'Find the missing top number.', expr: `${M(w, n, d)} = ${F(BLANK, d)} + ${F(n, d)}`, answer: num(w * d), _t: { kind: 'fpwhole', w, n, d }, hint: `One whole is ${F(d, d)}. How many pieces of ${F(1, d)} are in ${plural(w, 'whole')}?`,
    ways: [way('Turn the wholes into pieces', [`1 whole = ${F(d, d)}, because ${d} pieces of ${F(1, d)} make 1 whole.`, `${plural(w, 'whole')} = ${w} × ${d} = ${b(w * d)} pieces, so ${w} whole${w > 1 ? 's are' : ' is'} ${F(w * d, d)}.`]),
      way('Add it back', [`${F(w * d, d)} + ${F(n, d)} = ${F(w * d + n, d)}, which is ${M(w, n, d)}.`, `The blank is ${b(w * d)}.`])] };
}
function splitThree(L) {
  const d = rnd(5, DMAX[L - 1] + 1), n = rnd(5, d), [a, c, e] = compose(n, 3);
  return { ask: 'Find the missing top number.', expr: `${F(n, d)} = ${F(a, d)} + ${F(c, d)} + ${F(BLANK, d)}`, answer: num(e), _t: { kind: 'fpsplit3', n, a, b: c, d }, hint: `${n} pieces in all. Take away the pieces the other two parts use.`,
    ways: [way('Count the pieces', [`${F(n, d)} is ${n} pieces. The first two parts use ${a} + ${c} = ${a + c} pieces.`, `${n} − ${a + c} = ${b(e)} pieces are left for the blank.`]), way('Add up to the whole', [`${a} + ${c} + ? = ${n}`, `${a + c} + ${e} = ${n}, so the blank is ${b(e)}.`])] };
}

// Several ways to write n over d as a sum of fractions that all have d on the bottom.
function breakups(n, d, k) { return compose(n, k).map(t => [t, d]); }
const wayText = parts => sumOf(parts);
function whichWay(L) {
  const d = rnd(4, DMAX[L - 1]), n = rnd(3, d), k = L === 1 ? 2 : pick([2, 3]), parts = breakups(n, d, Math.min(k, n)), good = wayText(parts);
  const off = compose(n + pick([-1, 1]), Math.min(k, n - 1)).map(t => [t, d]), mixed = parts.map(([t], i) => [t, i ? d + 1 : d]), other = breakups(n, d + 1, Math.min(k, n));
  const answer = choice(good, [wayText(off), wayText(mixed), wayText(other)].filter(x => x !== good));
  return { ask: `Which is a way to break up ${F(n, d)}?`, answer, _t: { kind: 'fpway', n, d }, hint: 'The pieces must all be the same size as the original, and the pieces together must be as many as the original.',
    ways: [way('Check the pieces', [`${F(n, d)} is ${n} pieces of ${F(1, d)}.`, `${parts.map(([t]) => t).join(' + ')} = ${n}, and every bottom number is ${d}.`, `So ${b(good)} works.`]),
      way('Rule out the others', ['A sum with a different bottom number mixes different piece sizes.', 'A sum whose tops do not add to ' + n + ' has too many or too few pieces.', `Only ${b(good)} keeps the bottom ${d} and the tops add to ${n}.`])] };
}
function notWay() {
  const d = rnd(5, 12), n = rnd(4, d), goodSet = new Set();
  while (goodSet.size < 3) goodSet.add(wayText(breakups(n, d, pick([2, 3]))));
  const bad = wayText(compose(n + pick([-1, 1]), 2).map(t => [t, d]));
  return { ask: `Which is NOT a way to break up ${F(n, d)}?`, answer: choice(bad, [...goodSet]), _t: { kind: 'fpnot', n, d }, hint: 'Add the tops of each sum. Which one does not come to the top of the original?',
    ways: [way('Add the tops', [`${F(n, d)} has ${n} pieces. Add the tops in each sum.`, `Only ${b(bad)} does not add up to ${n} pieces.`]), way('Check the sizes', [`Every sum has ${d} on the bottom, so each one only needs its tops to add to ${n}.`, `${b(bad)} is the one that does not.`])] };
}
const show = parts => parts.map(p => (Array.isArray(p) ? F(p[0], p[1]) : p)).join(' + ');
function mixSum(L) {
  const d = rnd(3, 10), w = rnd(2, 4), n = rnd(1, d - 1), fr = [n, d], whole = [w * d, d];
  const forms = [[w, fr], [whole, fr]].concat(L === 3 ? [[...Array(w).fill(1), fr], [...Array(w).fill([d, d]), fr]] : []), good = show(pick(forms));
  const bad = shuffle([show([w + 1, fr]), show([w, [n + 1, d]]), show([w, [n, d + 1]]), show([whole, [n + d, d]]), show([w - 1, fr])]).filter(x => x !== good);
  return { ask: `Which sum equals ${M(w, n, d)}?`, answer: choice(good, bad), _t: { kind: 'fpmixsum', w, n, d }, hint: `${M(w, n, d)} is ${w} wholes and a fraction. Which sum has the same wholes and the same fraction?`,
    ways: [way('Wholes plus a part', [`${M(w, n, d)} is ${w} wholes plus ${F(n, d)}.`, `${w} wholes can be written as ${w}, as ${F(w * d, d)}, or as ${Array(w).fill(1).join(' + ')}.`, `The sum that matches is ${b(good)}.`]),
      way('Turn it into pieces', [`${M(w, n, d)} = ${F(w * d + n, d)}, which is ${w * d + n} pieces of ${F(1, d)}.`, `Add up the pieces in each choice. Only ${b(good)} has ${w * d + n} pieces.`])] };
}
function countUnits(L) {
  const d = rnd(3, DMAX[L - 1]), w = rnd(1, 5), n = rnd(1, d - 1);
  return { ask: `How many pieces of ${F(1, d)} are in ${M(w, n, d)}?`, answer: num(w * d + n), _t: { kind: 'fpcount', w, n, d }, hint: `Each whole is ${d} pieces of ${F(1, d)}. How many pieces are in the wholes?`,
    ways: [way('Wholes, then the part', [`Each whole has ${d} pieces: ${w} × ${d} = ${w * d} pieces.`, `Add the ${n} pieces from the fraction: ${w * d} + ${n} = ${b(w * d + n)}`]), way('Turn it into one fraction', [`${M(w, n, d)} = ${F(w * d + n, d)}.`, `${F(w * d + n, d)} is ${b(w * d + n)} pieces of ${F(1, d)}.`])] };
}
function mixSplit() {
  const d = rnd(4, 12), w = rnd(1, 6), n = rnd(3, d - 1), a = rnd(1, n - 2 > 0 ? n - 2 : 1), e = n - a;
  return { ask: 'Find the missing top number.', expr: `${M(w, n, d)} = ${M(w, a, d)} + ${F(BLANK, d)}`, answer: num(e), _t: { kind: 'fpmixsplit', w, n, a, d }, hint: 'Both sides have the same wholes. Compare the fraction parts.',
    ways: [way('Compare the fraction parts', [`Both sides have ${plural(w, 'whole')}, so the fractions must match: ${F(n, d)} = ${F(a, d)} + ${F(BLANK, d)}.`, `${n} − ${a} = ${b(e)}`]), way('Add it back', [`${M(w, a, d)} + ${F(e, d)}: the fractions are ${a} + ${e} = ${n} pieces.`, `So the blank is ${b(e)}.`])] };
}

const MAKERS = [[unitCount, shadedUnits, mixParts, whichWay, mixParts], [whichWay, splitThree, mixParts, wholeParts, countUnits, mixSum], [notWay, whichWay, mixSum, mixSplit, countUnits, wholeParts, splitThree]];
export const genFparts = L => oneOf(MAKERS[L - 1], L);
