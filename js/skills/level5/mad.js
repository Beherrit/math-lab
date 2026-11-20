// Mean absolute deviation, and choosing between the mean and the median.
import { rnd, pick, chance, shuffle, fmt, b, way, num, choice } from '../../util.js';
import { T, sum, sorted, list } from './helpers.js';

const meanOf = xs => sum(xs) / xs.length;
const madOf = xs => { const m = meanOf(xs); return sum(xs.map(x => Math.abs(x - m))) / xs.length; };
const medOf = xs => { const s = sorted(xs), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const CTX = [['Points scored in', 'games'], ['Minutes of practice on', 'days'], ['Dollars spent at a snack bar by', 'players'], ['Pages read on', 'nights']];
// A data set with a whole-number mean and a MAD that is a multiple of 0.25.
function dataSet(n, lo, hi) {
  for (;;) {
    const xs = Array.from({ length: n }, () => rnd(lo, hi)), m = meanOf(xs);
    if (Number.isInteger(m) && Number.isInteger(madOf(xs) * 4) && madOf(xs) > 0) return xs;
  }
}
const distRows = (xs, m) => xs.map(x => `${fmt(x)} is ${fmt(Math.abs(x - m))} ${x >= m ? 'above' : 'below'} ${fmt(m)}`);
function madWays(xs) {
  const m = meanOf(xs), d = xs.map(x => Math.abs(x - m)), tot = sum(d), above = sum(xs.filter(x => x > m).map(x => x - m));
  return [way('Distances from the mean', [`The mean is ${fmt(sum(xs))} ÷ ${xs.length} = ${fmt(m)}.`, `How far is each value from ${fmt(m)}? ${d.map(fmt).join(', ')}.`, `Add the distances: ${d.map(fmt).join(' + ')} = ${fmt(tot)}. Share them out: ${fmt(tot)} ÷ ${xs.length} = ${b(fmt(tot / xs.length))}`]),
    way('Check the balance', [`The mean is the balance point: the distances above it and the distances below it add to the same total. Above: ${fmt(above)}.`, `So the total distance is ${fmt(above)} + ${fmt(above)} = ${fmt(2 * above)}.`, `${fmt(2 * above)} ÷ ${xs.length} = ${b(fmt(2 * above / xs.length))}`])];
}
function given() {
  const xs = dataSet(4, 2, 14), m = meanOf(xs), [what, unit] = pick(CTX);
  return T({ ask: `${what} 4 ${unit}: ${b(list(xs))}. The mean is ${b(m)}. What is the mean absolute deviation (MAD)?`, answer: num(madOf(xs)), ways: madWays(xs),
    hint: 'Find how far each value is from the mean, ignoring above or below. Then find the mean of those distances.' }, 'madGiven', { xs, mean: m });
}
function full(L) {
  const n = L === 2 ? rnd(4, 5) : rnd(5, 6), xs = dataSet(n, 3, L === 2 ? 15 : 30), [what, unit] = pick(CTX);
  return T({ ask: `${what} ${n} ${unit}: ${b(list(xs))}. What is the mean absolute deviation (MAD)?`, answer: num(madOf(xs)), ways: madWays(xs),
    hint: 'First find the mean. Then find the distance of each value from it, and take the mean of those distances.' }, 'madFull', { xs });
}
function compare(L) {
  for (;;) {
    const A = dataSet(4, 2, 14), B = dataSet(4, 2, 14);
    if ((L === 2 && sum(A) !== sum(B)) || Math.abs(madOf(A) - madOf(B)) < 1) continue;
    const win = madOf(A) > madOf(B) ? 'Set A' : 'Set B', ma = madOf(A), mb = madOf(B);
    return T({ ask: `${b('Set A')}: ${list(A)}. ${b('Set B')}: ${list(B)}. Which set is more spread out from its own mean? Work out the MAD of each.`, answer: choice(win, [], { all: ['Set A', 'Set B'] }), choiceBig: true,
      ways: [way('Work out both MADs', [`Set A: mean ${fmt(meanOf(A))}, distances ${A.map(x => fmt(Math.abs(x - meanOf(A)))).join(', ')}, MAD ${fmt(ma)}.`, `Set B: mean ${fmt(meanOf(B))}, distances ${B.map(x => fmt(Math.abs(x - meanOf(B)))).join(', ')}, MAD ${fmt(mb)}.`, `${fmt(Math.max(ma, mb))} is greater than ${fmt(Math.min(ma, mb))}, so ${b(win)} is more spread out.`]),
        way('Compare total distance', [`Both sets have 4 values, so the set with the bigger total distance from its mean has the bigger MAD.`, `Total distances: ${fmt(4 * ma)} for A and ${fmt(4 * mb)} for B, so ${b(win)}.`])],
      hint: 'A bigger MAD means the values are further from their mean on average. Find the MAD of each set.' }, 'madCompare', { A, B });
  }
}
function consistent() {
  const a = pick([1, 1.5, 2, 2.5, 3, 4]), c = pick([5, 6, 7.5, 9, 10]), swap = chance(0.5), [x, y] = swap ? [c, a] : [a, c], win = x < y ? 'Team A' : 'Team B';
  return T({ ask: `Two teams scored a mean of 60 points. Team A has a MAD of ${b(x)} and Team B has a MAD of ${b(y)}. Which team is more consistent?`, answer: choice(win, [], { all: ['Team A', 'Team B'] }), choiceBig: true,
    ways: [way('Small MAD, steady scores', [`The MAD is how far the scores are from the mean on average. A small MAD means the scores stay close to the mean.`, `${fmt(Math.min(x, y))} is less than ${fmt(Math.max(x, y))}, so ${b(win)} is more consistent.`]),
      way('Picture the scores', [`With a MAD of ${fmt(Math.min(x, y))}, scores are usually within about ${fmt(Math.min(x, y))} points of 60. With ${fmt(Math.max(x, y))}, they swing much further.`, `Staying close means consistent: ${b(win)}.`])],
    hint: 'A small MAD means the data stays close to its mean. Which team has the smaller one?' }, 'madConsistent', { a: x, b: y });
}
const MEANING = [['What does the mean absolute deviation tell you?', 'how far the values are from the mean, on average', ['which value appears most often', 'the middle value when the data is in order', 'the total of all the values']],
  ['A data set has a very small MAD. What does that tell you?', 'the values are all close to the mean', ['the values are far from the mean', 'the mean is a small number', 'there are only a few values']]];
function meaning() {
  const [ask, good, bad] = pick(MEANING), v = MEANING.findIndex(m => m[1] === good);
  return T({ ask, answer: choice(good, bad), choiceBig: true,
    ways: [way('Say what MAD measures', ['MAD stands for mean absolute deviation. Deviation means distance from the mean. Absolute means we ignore above or below.', `So the MAD is the average distance from the mean. That means ${b(good)}.`]),
      way('Rule out the others', ['The mode is the most common value and the median is the middle value. The sum is the total. None of those is a distance.', `Only ${b(good)} describes the distance from the mean.`])],
    hint: 'Break the name apart: mean, absolute (no minus signs) and deviation (distance from the mean).' }, 'madMeaning', { v });
}
// One extra, very big value arrives: how far does the mean move, and how far does the median?
function outlier(wantMedian) {
  for (;;) {
    const xs = Array.from({ length: 5 }, () => rnd(8, 16)), add = rnd(3, 6) * 10;
    if (!wantMedian && (sum(xs) % 5 || (sum(xs) + add) % 6)) continue;
    const all = [...xs, add], ans = wantMedian ? medOf(all) : meanOf(all), old = wantMedian ? medOf(xs) : meanOf(xs);
    return T({ ask: `${b(list(xs))} is the data. A new value, ${b(add)}, is added. What is the new ${b(wantMedian ? 'median' : 'mean')}?`, answer: num(ans),
      ways: wantMedian ? [way('Order the six values', [`In order: ${list(sorted(all))}.`, `Six values: the median is halfway between the 3rd and 4th: (${sorted(all)[2]} + ${sorted(all)[3]}) ÷ 2 = ${b(fmt(ans))}`]), way('Compare with before', [`Before, the median was ${fmt(old)}, the middle of the five values.`, `The new big value goes at the end, so the middle moves just one place: ${b(fmt(ans))}. The median hardly moved.`])]
        : [way('Add, then share', [`New total: ${fmt(sum(xs))} + ${add} = ${fmt(sum(all))}.`, `Six values: ${fmt(sum(all))} ÷ 6 = ${b(fmt(ans))}`]), way('How far it moves', [`Before, the mean was ${fmt(sum(xs))} ÷ 5 = ${fmt(old)}.`, `The new value is ${add - old} above that, and it is shared among 6: ${add - old} ÷ 6 = ${fmt(ans - old)}. ${fmt(old)} + ${fmt(ans - old)} = ${b(fmt(ans))}`])],
      hint: wantMedian ? 'Put all six values in order. With six values, the median is halfway between the middle two.' : 'Find the new total, then share it between the new number of values.' }, wantMedian ? 'madMedianNew' : 'madMeanNew', { xs, add });
  }
}
const FIT = [[[5, 6, 4, 5, 6, 5], 'minutes late the bus arrived'], [[4, 5, 3, 48, 5, 4], 'dollars each player spent at a snack bar'], [[22, 24, 21, 23, 25, 22], 'points a player scored'], [[12, 14, 13, 90, 12, 15], 'minutes each student took to finish a puzzle']];
function fit() {
  const [base, what] = pick(FIT), xs = shuffle(base.map(v => (v < 40 ? v + rnd(0, 1) : v + rnd(-3, 3)))), good = Math.max(...xs) > 2 * medOf(xs) ? 'median' : 'mean';
  return T({ ask: `These are ${what}: ${b(list(xs))}. Which gives a better picture of a typical value: the mean or the median?`, answer: choice(good, [], { all: ['mean', 'median'] }), choiceBig: true,
    ways: [way('Check for an outlier', [`Look for a value far from the rest. ${good === 'median' ? `${fmt(Math.max(...xs))} is far bigger than the others: an outlier.` : 'There is no value far from the rest.'}`, good === 'median' ? `An outlier drags the mean towards it, but hardly moves the median. The ${b('median')} is the better picture.` : `With no outlier the mean uses every value fairly. The ${b('mean')} is a good picture, and it is easy to find.`]),
      way('Work out both', [`Mean: ${fmt(sum(xs))} ÷ ${xs.length} = ${fmt(meanOf(xs))}. Median: ${fmt(medOf(xs))}.`, good === 'median' ? `Most values are close to ${fmt(medOf(xs))}, not ${fmt(meanOf(xs))}. The ${b('median')} is typical.` : `The two are close together, and the mean uses every value. The ${b('mean')} works well.`])],
    hint: 'Is there one value very far from the rest? The mean gets pulled by it, but the median does not.' }, 'madFit', { xs });
}
const SHAPES = { 1: [given, consistent, meaning, fit], 2: [() => full(2), () => compare(2), () => outlier(false), fit, consistent], 3: [() => full(3), () => compare(3), () => outlier(true), () => outlier(false), fit, meaning] };
export const genMad = L => pick(SHAPES[L])();
