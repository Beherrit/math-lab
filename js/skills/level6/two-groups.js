// Comparing two groups: how far apart the centres are, measured in spreads (mean absolute deviations), and overlapping dot plots.
import { R, rnd, pick, shuffle, fmt, b, way, num, choice, table } from '../../util.js';
import { tag, plural } from './helpers.js';
import { dotPlots } from './visuals-dots.js';

// Patterns of distances from the centre that add to zero and have a whole-number or half mean absolute deviation.
const PATTERNS = { 4: [[-3, -1, 1, 3], [-2, -1, 1, 2], [-4, -2, 2, 4]], 6: [[-3, -2, -1, 1, 2, 3], [-2, -1, 0, 0, 1, 2], [-4, -3, -2, 2, 3, 4]], 8: [[-3, -2, -2, -1, 1, 2, 2, 3], [-2, -2, -1, -1, 1, 1, 2, 2]], 10: [[-4, -3, -2, -1, 0, 0, 1, 2, 3, 4]] };
const sum = xs => xs.reduce((s, v) => s + v, 0), madOf = xs => sum(xs.map(v => Math.abs(v - sum(xs) / xs.length))) / xs.length;
const WHAT = ['quiz scores', 'practice times in minutes', 'game scores', 'lap counts'];
const LABEL = { lot: 'The groups overlap a lot', some: 'The groups overlap somewhat', barely: 'The groups barely overlap' };
const verdictFor = r => (r <= 1 ? 'lot' : r >= 3 ? 'barely' : 'some');

// Two data sets with the same spread: the same pattern around two different centres. k is the gap measured in spreads.
function pair(n, ks) {
  for (;;) {
    const pat = pick(PATTERNS[n]), md = madOf(pat), k = pick(ks), mA = rnd(12, 30), gap = R(k * md);
    if (!Number.isInteger(gap)) continue;
    return { A: pat.map(v => mA + v), B: shuffle(pat).map(v => mA + gap + v), mad: md, mA, mB: mA + gap, k, gap };
  }
}
const dataTable = (d, label) => table(['Group A', ...d.A], [['Group B', ...d.B]]);
const plotRange = d => { const lo = Math.floor(Math.min(...d.A, ...d.B) / 4) * 4, hi = Math.ceil(Math.max(...d.A, ...d.B) / 4) * 4 + 2; return [lo, hi]; };
const fig = d => dotPlots(d.A, d.B, ...plotRange(d));

function gapMad(n, ks, withPlot) {
  const d = pair(n, ks), what = pick(WHAT);
  return tag({ story: `The table shows ${what} for two groups. Both groups have a mean absolute deviation of ${fmt(d.mad)}.`, ask: 'The difference between the two means is how many times the mean absolute deviation?', visual: dataTable(d) + (withPlot ? fig(d) : ''), answer: num(d.k),
    ways: [way('Means, difference, then divide', [`Group A: ${sum(d.A)} ÷ ${n} = ${d.mA}. Group B: ${sum(d.B)} ÷ ${n} = ${fmt(d.mB)}.`, `Difference: ${fmt(d.mB)} − ${d.mA} = ${fmt(d.gap)}.`, `${fmt(d.gap)} ÷ ${fmt(d.mad)} = ${b(fmt(d.k))}`]),
      way('See the shift', [fig(d), `Group B has the same pattern as group A, moved ${fmt(d.gap)} to the right.`, `One typical distance from the centre is ${fmt(d.mad)}, so the groups are ${b(fmt(d.k))} of those apart.`])],
    hint: 'Find the mean of each group. Then see how many mean absolute deviations fit into the difference.' }, { kind: 'groupgap', shape: 'gapmad', A: d.A, B: d.B, mad: d.mad });
}
function overlap(three) {
  const d = pair(pick([6, 8]), three ? [0.5, 1, 1.5, 2, 2.5, 3, 4] : [0.5, 1, 3, 4]), r = R(d.gap / d.mad), v = verdictFor(r), what = pick(WHAT), options = three ? [LABEL.lot, LABEL.some, LABEL.barely] : [LABEL.lot, LABEL.barely];
  return tag({ story: `Two groups have ${what}. Group A has a mean of ${d.mA}. Group B has a mean of ${fmt(d.mB)}. Both have a mean absolute deviation of ${fmt(d.mad)}. The dot plots show the data.`, ask: 'How much do the two sets of data overlap?', visual: fig(d), answer: choice(LABEL[v], [], { all: options }), choiceBig: true,
    ways: [way('Gap compared with the spread', [`Difference of the means: ${fmt(d.mB)} − ${d.mA} = ${fmt(d.gap)}.`, `${fmt(d.gap)} ÷ ${fmt(d.mad)} = ${plural(r, 'spread')} apart.`, v === 'lot' ? `One spread or less: the middle parts sit on top of each other. ${b(LABEL.lot)}.` : v === 'barely' ? `Three spreads or more: the dots form two separate piles. ${b(LABEL.barely)}.` : `Between one and three spreads: the piles share an edge. ${b(LABEL.some)}.`]),
      way('Look at the dots', ['Check whether the two rows of dots share the same part of the number line.', `${v === 'lot' ? 'They mostly sit over the same numbers' : v === 'barely' ? 'They sit over almost completely different numbers' : 'They share only their edges'}: ${b(LABEL[v])}.`])],
    hint: 'Work out how many mean absolute deviations apart the means are. A small number means a lot of overlap.' }, { kind: 'groupoverlap', shape: three ? 'overlap3' : 'overlap', mA: d.mA, mB: d.mB, mad: d.mad });
}
function higherMean() {
  const d = pair(4, [1, 2, 3]), win = d.mB > d.mA ? 'Group B' : 'Group A';
  return tag({ story: 'The table shows the points two groups scored.', ask: 'Which group has the greater mean?', visual: dataTable(d), answer: choice('Group B', [], { all: ['Group A', 'Group B'] }), choiceBig: true,
    ways: [way('Find each mean', [`Group A: ${sum(d.A)} ÷ 4 = ${d.mA}. Group B: ${sum(d.B)} ÷ 4 = ${fmt(d.mB)}.`, `${fmt(d.mB)} is more than ${d.mA}: ${b('Group B')}.`]), way('Compare the totals', [`Both groups have 4 values, so compare the totals: ${sum(d.A)} and ${sum(d.B)}.`, `The bigger total means the bigger mean: ${b('Group B')}.`])],
    hint: 'Add up each group and share equally. Compare the two means.' }, { kind: 'groupmean', shape: 'highermean', A: d.A, B: d.B, win });
}
function madOnly(n) {
  const pat = pick(PATTERNS[n]), m = rnd(10, 30), xs = shuffle(pat).map(v => m + v), md = madOf(pat);
  return tag({ story: `A group has these ${n} ${pick(WHAT)}: ${xs.join(', ')}.`, ask: 'What is the mean absolute deviation? It is the average distance of the values from the mean.', answer: num(md),
    ways: [way('Mean, distances, average', [`Mean: ${sum(xs)} ÷ ${n} = ${m}.`, `Distances from ${m}: ${xs.map(v => Math.abs(v - m)).join(', ')}.`, `Average distance: ${sum(xs.map(v => Math.abs(v - m)))} ÷ ${n} = ${b(fmt(md))}`]), way('Use the pattern', [`The values are ${m} plus or minus: ${pat.join(', ')}.`, `Ignoring signs, the distances add to ${sum(pat.map(Math.abs))}, and ${sum(pat.map(Math.abs))} ÷ ${n} = ${b(fmt(md))}.`])],
    hint: 'Find the mean first. Then find how far each value is from it, ignoring the sign, and average those distances.' }, { kind: 'mad', shape: 'madonly', xs, n });
}
function missingMean() {
  const mad = pick([2, 3, 4, 5]), k = pick([1.5, 2, 2.5, 3, 4]), mA = rnd(15, 40), gap = R(k * mad);
  if (!Number.isInteger(gap)) return missingMean();
  return tag({ story: `Two groups have the same mean absolute deviation of ${mad}. Group A has a mean of ${mA}. The mean of group B is ${fmt(k)} mean absolute deviations above the mean of group A.`, ask: 'What is the mean of group B?', answer: num(mA + gap), op: 'multi',
    ways: [way('Spreads to a distance', [`${fmt(k)} spreads of ${mad}: ${fmt(k)} × ${mad} = ${fmt(gap)}.`, `${mA} + ${fmt(gap)} = ${b(fmt(mA + gap))}`]), way('Step up one spread at a time', [`Each spread is ${mad}. Going up ${fmt(k)} of them from ${mA} adds ${fmt(gap)}.`, `${mA} + ${fmt(gap)} = ${b(fmt(mA + gap))}`])],
    hint: 'Turn the number of spreads into a distance first. Then add it to the mean of group A.' }, { kind: 'groupb', shape: 'missingmean', mA, mad, k });
}
function verdict() {
  for (;;) {
    const mad = pick([2, 3, 4, 5]), mA = rnd(15, 40), gap = pick([1, 2, 3, 4, 6, 8, 10, 12, 15]), r = gap / mad;
    if (r > 1 && r < 2) continue;
    const opts = ['The difference is large compared with the spread', 'The difference is small compared with the spread'], right = r >= 2 ? opts[0] : opts[1];
    return tag({ story: `Two groups have the same mean absolute deviation of ${mad}. Their means are ${mA} and ${mA + gap}.`, ask: 'Which statement is true?', answer: choice(right, [], { all: opts }), choiceBig: true,
      ways: [way('Gap in spreads', [`The means differ by ${gap}. ${gap} ÷ ${mad} = ${plural(R(r), 'spread')}.`, r >= 2 ? `Two spreads or more is a big gap: ${b(right)}.` : `One spread or less is a small gap: ${b(right)}.`]), way('Compare the sizes', [`Typical values are about ${mad} from their mean. The centres are ${gap} apart.`, `${gap} is ${r >= 2 ? 'much more' : 'not more'} than ${mad}: ${b(right)}.`])],
      hint: 'Divide the difference of the means by the mean absolute deviation. Is the answer big or small?' }, { kind: 'groupverdict', shape: 'verdict', mA, gap, mad });
  }
}
function madFromGap() {
  const mad = pick([2, 3, 4, 5, 6]), k = pick([2, 3, 4]), gap = mad * k;
  return tag({ story: `Two groups have the same mean absolute deviation. Their means differ by ${gap}, which is ${k} times the mean absolute deviation.`, ask: 'What is the mean absolute deviation?', answer: num(mad),
    ways: [way('Undo the multiplying', [`gap = ${k} × (spread), so spread = ${gap} ÷ ${k}.`, `${gap} ÷ ${k} = ${b(mad)}`]), way('Check it', [`Try ${mad}: ${k} × ${mad} = ${gap}, which is the gap in the story.`, `So the mean absolute deviation is ${b(mad)}.`])],
    hint: 'The gap is the spread multiplied by a number. Divide to go back.' }, { kind: 'quot', shape: 'madfromgap', a: gap, c: k });
}
export function genGroups(L) {
  const r = Math.random();
  if (L === 1) return r < 0.3 ? gapMad(4, [1, 2, 3], false) : r < 0.55 ? overlap(false) : r < 0.8 ? higherMean() : madOnly(4);
  if (L === 2) return r < 0.3 ? gapMad(6, [1.5, 2, 2.5, 3], false) : r < 0.55 ? overlap(true) : r < 0.8 ? madOnly(6) : missingMean();
  return r < 0.3 ? gapMad(pick([8, 10]), [1.5, 2, 2.5, 3, 4], true) : r < 0.55 ? missingMean() : r < 0.8 ? verdict() : madFromGap();
}
