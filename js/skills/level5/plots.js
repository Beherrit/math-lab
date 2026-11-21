// Reading dot plots and histograms.
import { rnd, pick, chance, fmt, b, way, num, choice } from '../../util.js';
import { T, sum } from './helpers.js';
import { dotPlot, histogram } from './visuals.js';

export const DOTS = [['Goals in each match', 0], ['Hours of sleep', 5], ['Pets in each home', 0], ['Books read this month', 0], ['Free throws made out of 10', 3], ['Songs learned this term', 1]];
export const expand = (lo, counts) => counts.flatMap((c, i) => Array(c).fill(lo + i));
function makeDots(L, want) {
  for (;;) {
    const counts = Array.from({ length: 7 }, () => (chance(0.2) ? 0 : rnd(1, L === 1 ? 4 : 5))), total = sum(counts), top = Math.max(...counts);
    if (want === 'range') { counts.fill(0, 0, rnd(0, 2)); counts.fill(0, 7 - rnd(0, 2)); }
    else if (!counts[0] || !counts[6]) continue;
    if (sum(counts) < 7 || total > 16) continue;
    if (want === 'mode' && counts.filter(c => c === top).length > 1) continue;
    if (want === 'median' && total % 2 === 0) continue;
    if (want === 'mean' && sum(counts.map((c, i) => c * i)) % total) continue;
    return counts;
  }
}
const DOT_ASK = {
  total: () => 'How many data values does the dot plot show?', at: (v) => `How many times does the value ${b(v)} appear?`, mode: () => 'What is the mode (the most common value)?',
  range: () => 'What is the range of the data?', median: () => 'What is the median?', least: (v) => `How many values are ${b(v + ' or more')}?`, mean: () => 'What is the mean?',
};
function dotWays(want, lo, counts, arg, ans) {
  const data = expand(lo, counts), n = data.length, dLo = data[0], dHi = data[n - 1], tallest = lo + counts.indexOf(Math.max(...counts));
  const every = 'Each dot is one piece of data. The number under a stack says what the value is; the height says how many times it came up.';
  const steps = {
    total: [[`Count every dot, stack by stack: ${counts.filter(c => c).join(' + ')} = ${b(n)}`], [`Write the data out as a list: ${data.join(', ')}.`, `The list has ${b(n)} values.`]],
    at: [[`Find ${arg} on the line and count the dots above it: ${b(ans)}.`], [`As a list the data is ${data.join(', ')}.`, `${arg} appears ${b(ans)} time${ans === 1 ? '' : 's'}.`]],
    mode: [[`The mode is the value with the tallest stack.`, `The tallest stack is above ${b(tallest)} (${Math.max(...counts)} dots).`], [`Stack heights from left to right: ${counts.join(', ')}.`, `The biggest height belongs to the value ${b(tallest)}. The answer is the value, not the height.`]],
    range: [[`Smallest value with a dot: ${dLo}. Biggest value with a dot: ${dHi}.`, `Range = ${dHi} − ${dLo} = ${b(ans)}`], [`The range is how far the dots stretch along the line, from ${dLo} to ${dHi}: ${b(ans)} steps.`, 'It uses the values on the line, not how tall the stacks are.']],
    median: [[`There are ${n} dots, so the middle one is dot number ${(n + 1) / 2}.`, `Count dots from the left, stack by stack, until you reach number ${(n + 1) / 2}. It sits above ${b(ans)}.`], [`As an ordered list: ${data.join(', ')}.`, `Cross off one from each end until one is left: ${b(ans)}.`]],
    least: [[`“${arg} or more” means the stacks above ${arg} and everything to the right of it.`, `${counts.slice(arg - lo).join(' + ')} = ${b(ans)}`], [`There are ${n} dots in all. The stacks left of ${arg} hold ${n - ans}.`, `${n} − ${n - ans} = ${b(ans)}`]],
    mean: [[`Total of all the values: ${counts.map((c, i) => (c ? `${c} × ${lo + i}` : '')).filter(Boolean).join(' + ')} = ${sum(data)}`, `Number of dots: ${n}`, `Mean = ${sum(data)} ÷ ${n} = ${b(ans)}`], [`Write the data as a list: ${data.join(', ')}.`, `Add them (${sum(data)}) and share between ${n}: ${b(ans)}`]],
  }[want];
  return [way('Read the stacks', [every, ...steps[0]]), way('Turn it into a list', steps[1])];
}
// One hint per question kind, each pointing at the first step without giving the answer away.
const DOT_HINT = {
  total: 'Each dot is one data value. Count every dot, stack by stack.', at: 'Find that number on the line, then count only the dots stacked above it.',
  mode: 'Look for the tallest stack, then read the number under it.', range: 'Use the smallest and biggest values on the line that have dots.',
  median: 'Count all the dots to find which place is the middle one, then count along the line, stack by stack, until you reach it.',
  least: 'Take the stack above that number and every stack to the right of it. Count those dots.',
  mean: 'Add up all the values first (a stack of 3 dots above a 5 counts as 3 × 5), then share the total between the number of dots.',
};
function dotProblem(L) {
  const want = pick(L === 1 ? ['total', 'at', 'mode'] : L === 2 ? ['range', 'median', 'least', 'mode'] : ['mean', 'median', 'least']), [title, lo] = pick(DOTS), counts = makeDots(L, want), data = expand(lo, counts);
  const arg = want === 'at' ? lo + rnd(0, 6) : want === 'least' ? lo + rnd(2, 5) : null;
  const ans = { total: data.length, at: counts[arg - lo], mode: lo + counts.indexOf(Math.max(...counts)), range: data[data.length - 1] - data[0], median: data[(data.length - 1) / 2], least: sum(counts.slice(arg - lo)), mean: sum(data) / data.length }[want];
  return T({ ask: DOT_ASK[want](arg), visual: dotPlot(lo, counts, title), answer: num(ans), ways: dotWays(want, lo, counts, arg, ans),
    hint: DOT_HINT[want] }, 'dot', { lo, counts, want, arg });
}
const HISTS = [['Quiz scores', 50, 10], ['Minutes to get to school', 0, 10], ['Ages of people at a concert', 10, 10], ['Heights of plants (cm)', 0, 5], ['Daily steps (thousands)', 0, 2], ['Song lengths (seconds)', 120, 30]];
const HIST_HINT = {
  bin: 'Find the bar with that label and read how tall it is.', total: 'Each bar counts the values in its range. Add the heights of all the bars.',
  most: 'The tallest bar has the most values. Read the label under it.', least: 'Start at the bar that begins at that number and add the heights of every bar to its right.',
  under: 'Add the heights of the bars to the left of the bar that starts at that number.', percent: 'You need two numbers: how many in that bar, and how many altogether.',
};
function histProblem(L) {
  const [title, start, width] = pick(HISTS), want = pick(L === 2 ? ['bin', 'total', 'most'] : ['least', 'percent', 'under']);
  const total = want === 'percent' ? pick([10, 20, 25]) : 0, counts = Array.from({ length: 5 }, () => rnd(1, want === 'percent' ? Math.ceil(total / 3) : 9));
  if (total) { counts[4] = total - sum(counts.slice(0, 4)); if (counts[4] < 1 || counts[4] > 10) return histProblem(L); }
  if (want === 'most' && counts.filter(c => c === Math.max(...counts)).length > 1) return histProblem(L);
  const label = i => `${start + i * width}–${start + (i + 1) * width - 1}`, labels = counts.map((_, i) => label(i)), i = rnd(want === 'least' || want === 'under' ? 1 : 0, want === 'least' ? 3 : 4), n = sum(counts), edge = start + i * width;
  const top = counts.indexOf(Math.max(...counts));
  const read = 'Each bar covers a range of values. Its height tells how many data values fall in that range, but not exactly what they are.';
  const Q = {
    bin: [`How many values are in the range ${b(labels[i])}?`, num(counts[i]), [read, `Find the bar labelled ${labels[i]} and read its height on the scale: ${b(counts[i])}.`], [`Heights of the bars from left to right: ${counts.join(', ')}.`, `Bar number ${i + 1} is the one for ${labels[i]}: ${b(counts[i])}.`]],
    total: ['How many data values does the histogram show altogether?', num(n), [read, `Add the heights of all the bars: ${counts.join(' + ')} = ${b(n)}`], [`Group the bars to add faster: (${counts[0]} + ${counts[1]}) + (${counts[2]} + ${counts[3]}) + ${counts[4]} = ${counts[0] + counts[1]} + ${counts[2] + counts[3]} + ${counts[4]}`, `= ${b(n)}`]],
    most: ['Which range has the most values?', choice(labels[top], labels.filter((_, j) => j !== top)), [read, `The tallest bar is the one for ${b(labels[top])} (${counts[top]} values).`], [`Heights: ${labels.map((l, j) => `${l}: ${counts[j]}`).join(', ')}.`, `The biggest is ${counts[top]}, for ${b(labels[top])}. This is the most common range, but we cannot tell the single most common value.`]],
    least: [`How many values are ${b(edge + ' or more')}?`, num(sum(counts.slice(i))), [read, `“${edge} or more” starts at the bar ${labels[i]} and takes every bar to its right.`, `${counts.slice(i).join(' + ')} = ${b(sum(counts.slice(i)))}`], [`All the bars together: ${n}. The bars below ${edge}: ${counts.slice(0, i).join(' + ')} = ${sum(counts.slice(0, i))}.`, `${n} − ${sum(counts.slice(0, i))} = ${b(sum(counts.slice(i)))}`]],
    under: [`How many values are ${b('less than ' + edge)}?`, num(sum(counts.slice(0, i))), [read, `“Less than ${edge}” means every bar to the left of the bar that starts at ${edge}.`, `${counts.slice(0, i).join(' + ')} = ${b(sum(counts.slice(0, i)))}`], [`All the bars together: ${n}. The bars from ${edge} up: ${counts.slice(i).join(' + ')} = ${sum(counts.slice(i))}.`, `${n} − ${sum(counts.slice(i))} = ${b(sum(counts.slice(0, i)))}`]],
    percent: [`What percent of the values are in the range ${b(labels[i])}?`, num(counts[i] / n * 100), [`Total: ${counts.join(' + ')} = ${n}. In the range ${labels[i]}: ${counts[i]}.`, `${counts[i]} out of ${n}. Scale to “out of 100”: multiply both by ${100 / n}.`, `${counts[i] * 100 / n} out of 100 = ${b(fmt(counts[i] * 100 / n) + '%')}`], [`${counts[i]} ÷ ${n} = ${fmt(counts[i] / n)}`, `As a percent: ${b(fmt(counts[i] * 100 / n) + '%')}`]],
  }[want];
  return T({ ask: Q[0], visual: histogram(labels, counts, title), answer: Q[1], suffix: want === 'percent' ? '%' : '', ways: [way('Read the bars', Q[2]), way('Another way to see it', Q[3])],
    hint: HIST_HINT[want] }, 'hist', { start, width, counts, want, i });
}
export function genPlots(L) {
  if (L === 1) return dotProblem(1);
  return chance(L === 2 ? 0.5 : 0.4) ? dotProblem(L) : histProblem(L);
}
