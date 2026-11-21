// Equivalent fractions (halves, fourths, eighths, thirds, sixths) with bars and number lines, and whole numbers written as fractions.
import { rnd, pick, chance, shuffle, b, F, way, num, choice, fracBar } from '../../util.js';
import { fracLine } from './pics.js';
import { BLANK } from './words.js';
import { MANY } from './fractions.js';
import { yesNo, mark } from './kit.js';

const FAMILIES = { easy: [[2, 4], [4, 8], [4, 2]], more: [[2, 4], [4, 8], [2, 8], [3, 6], [8, 4], [4, 2], [6, 3], [8, 2]] };
// n/d = m/e: d and e come from the same family, so one is a whole-number multiple of the other.
function pairOf(fam) {
  const [d, e] = pick(FAMILIES[fam]);
  if (e > d) { const n = rnd(1, d - 1); return { n, d, m: n * (e / d), e, k: e / d, up: true }; }
  const k = d / e, m = rnd(1, e - 1);
  return { n: m * k, d, m, e, k, up: false };
}
const scale = ({ up, k }) => (up ? `× ${k}` : `÷ ${k}`);
function equivWays(p, find) {
  const { n, d, m, e, k, up } = p, bars = [fracBar(n, d), fracBar(m, e)];
  const parts = up ? `Every part of the first bar is cut into ${k} equal pieces, so ${d} parts become ${d} × ${k} = ${e} parts.` : `${k} small parts are joined into one bigger part, so ${d} parts become ${d} ÷ ${k} = ${e} parts.`;
  const same = 'Both bars are the same length and the same amount is shaded.';
  return find === 'top'
    ? [way('Do the same to the top and bottom', [`The bottom number went from ${d} to ${e}. That is ${d} ${scale(p)} = ${e}.`, `Do the same to the top: ${n} ${scale(p)} = ${b(m)}.`]),
      way('Compare two bars', [...bars, `${same} ${parts}`, `The shaded parts change the same way: ${n} ${scale(p)} = ${b(m)}.`])]
    : [way('Do the same to the top and bottom', [`The top number went from ${n} to ${m}. That is ${n} ${scale(p)} = ${m}.`, `Do the same to the bottom: ${d} ${scale(p)} = ${b(e)}.`]),
      way('Compare two bars', [...bars, `${same} ${parts}`, `So the bottom number of the second fraction is ${b(e)}.`])];
}
function equivQ(p, find) {
  const { n, d, m, e } = p;
  return { ask: `Fill in the missing number so the two fractions are equal: ${F(n, d)} = ${find === 'top' ? F(BLANK, e) : F(m, BLANK)}`, answer: num(find === 'top' ? m : e), _t: find === 'top' ? { f: 'equivn', n, d, e } : { f: 'equivd', n, d, m },
    hint: find === 'top' ? 'How did the bottom number change? Do the same to the top number.' : 'How did the top number change? Do the same to the bottom number.', ways: equivWays(p, find),
    ...(find === 'top' && d <= 4 ? { visual: fracBar(n, d) + fracBar(0, e) } : {}) };
}
// Bars of the same length: the top one shows n/d, the bottom one is cut into e parts. How many to shade to match?
function barQ(p) {
  const { n, d, m, e } = p;
  return { ask: mark('The two bars are the same length, and the same amount is shaded in both. How many parts of the bottom bar are shaded?', n, d, e), visual: fracBar(n, d) + fracBar(0, e), answer: num(m), _t: { f: 'barparts', pic: true },
    hint: 'Compare how many parts each bar is cut into. How does the number of parts change?', ways: equivWays(p, 'top') };
}
// Two number lines from 0 to 1: the dot is at the same place on both.
function lineQ(p) {
  const { n, d, m, e } = p;
  return { ask: mark('Both number lines go from 0 to 1, and the dot is at the same place on both. How many jumps from 0 is the dot on the bottom line?', n, d, e), visual: fracLine(d, n, { labels: true }) + fracLine(e, m), answer: num(m), _t: { f: 'linemark', pic: true },
    hint: 'Look at where the dot is on the top line. Find the same place on the bottom line and count the jumps.',
    ways: [way('Read the top line, then count the bottom', [fracLine(e, m, { labels: true }), `On the top line the dot is ${n} of ${d} equal jumps from 0.`, `The same place on the bottom line is ${m} of ${e} jumps, so the answer is ${b(m)}.`]),
      way('Do the same to the top and bottom', [`The bottom number went from ${d} to ${e}: ${d} ${scale(p)} = ${e}.`, `${n} ${scale(p)} = ${b(m)} jumps.`])] };
}
// A whole number as a fraction: 3 = 3/1 = 6/2.
const unit = d => (d === 1 ? 'one whole' : `${d} ${MANY[d]}`);
const WHOLE = {
  top: (w, d) => ({ ask: `Write the whole number ${w} as a fraction: ${w} = ${F(BLANK, d)}`, ans: w * d, t: { f: 'wholen', w, d }, hint: d === 1 ? 'A fraction with 1 on the bottom counts whole ones.' : `One whole is ${d} out of ${d} parts. How many parts are in ${w} wholes?`,
    ways: [way('Count the parts', [`One whole is ${unit(d)}.`, `${w} wholes is ${w} × ${d} = ${b(w * d)} parts.`]), way('Make the bottom number match', [`${w} = ${F(w, 1)}. To get ${d} on the bottom, multiply the bottom by ${d}.`, `Do the same to the top: ${w} × ${d} = ${b(w * d)}.`])] }),
  value: (w, d) => ({ ask: `What whole number is equal to ${F(w * d, d)}?`, ans: w, t: { f: 'wholev', n: w * d, d }, hint: 'Some parts make one whole. How many groups of that size are in the top number?',
    ways: [way('Group the parts', [`${F(d, d)} is one whole, so ${d} parts make 1.`, `${w * d} ÷ ${d} = ${b(w)} wholes.`]), way('Count up on a number line', [`Count by ${F(1, d)} until you get to ${F(w * d, d)}: that is ${w * d} jumps.`, `Every ${d} jumps reach the next whole number, so you reach ${b(w)}.`])] }),
  bottom: (w, d) => ({ ask: `Fill in the missing bottom number: ${F(w * d, BLANK)} = ${w}`, ans: d, t: { f: 'wholed', w, n: w * d }, hint: 'The top number is how many parts. How many parts make one whole?',
    ways: [way('How many parts make one whole?', [`${w} wholes has ${w * d} parts, so each whole has ${w * d} ÷ ${w} parts.`, `${w * d} ÷ ${w} = ${b(d)}.`]), way('Try it', [`Try ${d} on the bottom: ${F(w * d, d)} means ${w * d} ÷ ${d} = ${w}. It works.`, `The missing number is ${b(d)}.`])] }),
};
function wholeQ(kind, w, d) { const x = WHOLE[kind](w, d); return { ask: x.ask, answer: num(x.ans), _t: x.t, hint: x.hint, ways: x.ways }; }
// Which fraction is equal? The slips: the same top, adding the same number to top and bottom, the old bottom, off by one.
function chooseQ(p) {
  const { n, d, m, e } = p, right = F(m, e), tries = [[n, e], [n + e - d, e], [m, d], [m + 1, e]].filter(([x, y]) => x > 0 && y > 0 && x * d !== n * y);
  return { ask: `Which fraction is equal to ${F(n, d)}?`, answer: choice(right, shuffle(tries.map(([x, y]) => F(x, y)))), choiceBig: true, _t: { f: 'eqchoice', n, d },
    hint: 'Equal fractions have the same amount shaded. Look at how the bottom number changed.',
    ways: [way('Do the same to the top and bottom', [`${d} ${scale(p)} = ${e} on the bottom, so ${n} ${scale(p)} = ${m} on the top.`, `${F(n, d)} = ${b(right)}.`]), way('Check each choice', [`Work out whether each choice keeps the same amount as ${F(n, d)}.`, `Only ${b(right)} does.`])] };
}
// Which one is NOT equal to 1/2 (or to 1)?
function oddOneQ() {
  const half = chance(0.5), same = half ? [[1, 2], [2, 4], [3, 6], [4, 8]] : [[2, 2], [4, 4], [6, 6], [8, 8]];
  const off = half ? pick([[3, 8], [2, 6], [3, 4], [5, 8], [1, 4]]) : pick([[1, 2], [7, 8], [5, 6], [3, 4], [2, 3]]), keep = shuffle(same).slice(0, 3), base = half ? F(1, 2) : '1';
  const test = ([x, y]) => (half ? `${F(x, y)} is a half: ${x} is half of ${y}.` : `${F(x, y)} is one whole: all ${y} parts.`);
  return { ask: `Which one is ${b('not')} equal to ${base}?`, answer: choice(F(...off), keep.map(([x, y]) => F(x, y))), choiceBig: true, _t: { f: 'eqodd', n: 1, d: half ? 2 : 1 }, hint: half ? 'A half has a top number that is half of the bottom number.' : 'One whole has the same top and bottom.',
    ways: [way('Check each one', [...keep.map(test), `${b(F(...off))} is not equal to ${base}.`]), way('Look at the odd one', [half ? `${F(...off)}: half of ${off[1]} is ${off[1] / 2}, but the top is ${off[0]}.` : `${F(...off)}: the top ${off[0]} is not the same as the bottom ${off[1]}.`, `So ${b(F(...off))} is the one that is not equal.`])] };
}
// "A friend says 3/4 = 5/6 because 2 was added to the top and the bottom." True or false? Multiplying top and bottom keeps it equal; adding does not.
function slipQuestion() {
  const d = pick([2, 3, 4]), n = rnd(1, d - 1), ok = chance(0.5), a = ok ? 2 : rnd(1, 2), [n2, d2] = ok ? [n * 2, d * 2] : [n + a, d + a];
  const how = ok ? 'the top and the bottom were both multiplied by 2' : `${a} was added to the top and ${a} was added to the bottom`;
  return { ask: `A friend says ${F(n, d)} = ${F(n2, d2)}, because ${how}. True or false?`, answer: yesNo(ok), choiceBig: true, _t: { f: 'ftf', fs: [[n, d], [n2, d2]], rel: '=', ok },
    hint: 'Equal fractions come from multiplying or dividing the top and bottom by the same number, not from adding.',
    ways: [way('Compare the amounts', [fracBar(n, d), fracBar(n2, d2), `The bars show ${n} of ${d} and ${n2} of ${d2}. They are ${ok ? 'the same amount' : 'not the same amount'}.`, `The sentence is ${b(ok ? 'True' : 'False')}.`]),
      way('Cross-check with multiplying', [`${n} × ${d2} = ${n * d2} and ${n2} × ${d} = ${n2 * d}.`, ok ? `They match, so the sentence is ${b('True')}.` : `They are different, so the sentence is ${b('False')}.`])] };
}
export function genEquivalent(L) {
  const p = pairOf(L === 1 ? 'easy' : 'more'), w = rnd(2, L === 1 ? 4 : 6), d = pick(L === 1 ? [1, 2, 3] : [2, 3, 4, 6, 8]);
  const pool = L === 1 ? [() => barQ(p), () => lineQ(p), () => equivQ(p, 'top'), () => wholeQ('top', w, pick([1, 2, 4])), () => chooseQ(p)]
    : L === 2 ? [() => equivQ(p, 'top'), () => equivQ(p, 'bottom'), () => chooseQ(p), () => lineQ(p), () => barQ(p), () => wholeQ(pick(['top', 'value']), w, d)]
      : [() => equivQ(p, 'bottom'), () => chooseQ(p), oddOneQ, slipQuestion, () => wholeQ(pick(['bottom', 'value', 'top']), w, d), () => equivQ(p, 'top')];
  return pick(pool)();
}
