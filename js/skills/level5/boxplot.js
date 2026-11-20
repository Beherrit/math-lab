// Box plots and the five-number summary: reading a box plot, finding quartiles from data, the interquartile range.
import { rnd, pick, shuffle, fmt, b, way, num, choice } from '../../util.js';
import { T, sorted, list } from './helpers.js';
import { boxPlot } from './draw.js';

const NAMES = ['least value', 'first quartile', 'median', 'third quartile', 'greatest value'];
const CTX = ['minutes of practice', 'points scored in a game', 'height of a plant in cm', 'songs on a playlist', 'minutes to get to school'];
const mid = a => { const n = a.length; return n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2; };
// Five-number summary: least, Q1, median, Q3, greatest. The median is left out of both halves when there is an odd number of values.
const five = xs => { const s = sorted(xs), n = s.length, h = Math.floor(n / 2); return [s[0], mid(s.slice(0, h)), mid(s), mid(s.slice(n - h)), s[n - 1]]; };
// Five whole-number stats on a friendly scale: ticks every u.
function stats(u) {
  const base = rnd(1, u === 1 ? 4 : 3), g = () => rnd(1, u === 1 ? 3 : 2) * u, n = [base * u]; for (let i = 0; i < 4; i++) n.push(n[i] + g());
  return { nums: n, lo: Math.max(0, n[0] - u * 2), hi: n[4] + u * 2, step: u };
}
const unitFor = L => (L === 3 ? 5 : pick(L === 1 ? [1] : [1, 5]));

function read(L) {
  const s = stats(unitFor(L)), i = rnd(0, 4), want = NAMES[i], title = pick(CTX);
  return T({ ask: `The box plot shows ${title}. What is the ${b(want)}?`, visual: boxPlot(s.nums, { lo: s.lo, hi: s.hi, step: s.step, title }), answer: num(s.nums[i]),
    ways: [way('Know the five parts', [`A box plot has five marks: the least value (left end), the first quartile (left side of the box), the median (the line in the box), the third quartile (right side of the box) and the greatest value (right end).`, `The ${want} is the ${['left end of the line', 'left side of the box', 'line inside the box', 'right side of the box', 'right end of the line'][i]}. Read the number under it: ${b(fmt(s.nums[i]))}.`]),
      way('Drop straight down', [`Find the mark for the ${want}, then drop straight down to the number line.`, `It lands on ${b(fmt(s.nums[i]))}.`])],
    hint: 'First find which mark on the picture is the one asked for. Then read the number straight below it.' }, 'bpRead', { nums: s.nums, i });
}
function spreadPlot(kind) {
  const s = stats(unitFor(2)), [mn, q1, , q3, mx] = s.nums, ans = kind === 'iqr' ? q3 - q1 : mx - mn, title = pick(CTX);
  const text = kind === 'iqr' ? ['interquartile range (IQR)', 'the width of the box'] : ['range', 'the whole width from end to end'];
  return T({ ask: `The box plot shows ${title}. What is the ${b(text[0])}?`, visual: boxPlot(s.nums, { lo: s.lo, hi: s.hi, step: s.step, title }), answer: num(ans),
    ways: [way('Subtract the end marks', [kind === 'iqr' ? `The IQR is the third quartile minus the first quartile. Read both sides of the box: ${fmt(q1)} and ${fmt(q3)}.` : `The range is the greatest value minus the least value. Read both ends: ${fmt(mn)} and ${fmt(mx)}.`, kind === 'iqr' ? `${fmt(q3)} − ${fmt(q1)} = ${b(fmt(ans))}` : `${fmt(mx)} − ${fmt(mn)} = ${b(fmt(ans))}`]),
      way('Measure the width', [`This is ${text[1]} on the number line.`, `Count the steps from one end to the other: ${b(fmt(ans))}.`])],
    hint: kind === 'iqr' ? 'The IQR is the length of the box. Read where the box starts and where it ends.' : 'The range is the length of the whole picture. Read the two ends.' }, kind === 'iqr' ? 'bpIqr' : 'bpRange', { nums: s.nums });
}
const REGION = { 'between the first and third quartiles (inside the box)': 0.5, 'between the least value and the first quartile': 0.25, 'above the median': 0.5, 'between the first quartile and the greatest value': 0.75, 'below the third quartile': 0.75, 'between the median and the third quartile': 0.25 };
function percent() {
  const s = stats(1), region = pick(Object.keys(REGION)), p = REGION[region] * 100;
  return T({ ask: `In a box plot, what percent of the values are ${b(region)}?`, visual: boxPlot(s.nums, { lo: s.lo, hi: s.hi, step: 1, title: pick(CTX) }), answer: num(p), suffix: '%',
    ways: [way('Four equal parts', [`The five marks cut the data into four parts, and each part holds one quarter, or 25%, of the values.`, `“${region}” covers ${p / 25} of the four parts: ${p / 25} × 25 = ${b(p)}%.`]),
      way('Count the sections', [`Count the sections of the picture that “${region}” covers. Each section is 25%.`, `That is ${p / 25} sections, so ${b(p)}%.`])],
    hint: 'The marks split the data into four parts with the same number of values in each.' }, 'bpPercent', { region });
}
function count() {
  const n = pick([12, 16, 20, 24, 40]), region = pick(Object.keys(REGION)), ans = n * REGION[region];
  return T({ ask: `A box plot shows ${b(n)} values. How many of them are ${b(region)}?`, answer: num(ans),
    ways: [way('Quarters of the data', [`Each quarter of a box plot holds the same number of values: ${n} ÷ 4 = ${n / 4}.`, `“${region}” covers ${REGION[region] * 4} quarters: ${REGION[region] * 4} × ${n / 4} = ${b(ans)}.`]),
      way('Use percents', [`“${region}” is ${REGION[region] * 100}% of the values.`, `${REGION[region] * 100}% of ${n} is ${b(ans)}.`])],
    hint: 'Each of the four parts of a box plot holds the same number of values. How many is that?' }, 'bpCount', { n, region });
}
function data(L) {
  const n = L === 3 ? pick([8, 10, 12]) : pick([7, 9, 11]), xs = shuffle(Array.from({ length: n }, () => rnd(4, 40))), i = pick([1, 2, 3]), f = five(xs), s = sorted(xs), h = Math.floor(n / 2), half = i === 1 ? s.slice(0, h) : s.slice(n - h);
  const ans = f[i], where = i === 1 ? 'lower' : 'upper';
  const steps = i === 2 ? [`In order: ${list(s)}.`, `There are ${n} values, so the median is ${n % 2 ? `the middle one` : 'halfway between the two middle ones'}: ${b(fmt(ans))}.`]
    : [`In order: ${list(s)}. The median is ${fmt(f[2])}.`, `The ${where} half (${n % 2 ? 'not counting the median' : 'the half below the middle'}) is ${list(half)}.`, `The ${NAMES[i]} is the median of that half: ${b(fmt(ans))}.`];
  return T({ ask: `What is the ${b(NAMES[i])} of this data?`, expr: list(xs), exprSmall: true, answer: num(ans),
    ways: [way('Order, then split', steps), way('Cross off from the ends', [`Put the values in order: ${list(i === 2 ? s : half)}.`, `Cross off one value from each end, again and again, until the middle is left.`, `The middle is ${b(fmt(ans))}.`])],
    hint: i === 2 ? 'Put the values in order first. The median is the middle.' : 'Order the values. Split them into a lower and an upper half. The quartile is the median of one half.' }, 'bpSummary', { xs, i });
}
function fiveNumbers() {
  const n = pick([7, 9, 8, 10]), xs = shuffle(Array.from({ length: n }, () => rnd(4, 40))), f = five(xs), s = sorted(xs), text = a => a.map(fmt).join(', ');
  const mean = Math.round(xs.reduce((a, x) => a + x, 0) / n), wrongMedian = [...f.slice(0, 2), mean, ...f.slice(3)], swapped = [f[0], f[2], f[1], f[3], f[4]], unordered = [xs[0], ...f.slice(1, 4), xs[1]];
  return T({ ask: `Which is the five-number summary (least, first quartile, median, third quartile, greatest) of this data?`, expr: list(xs), exprSmall: true, answer: choice(text(f), [text(wrongMedian), text(swapped), text(unordered)]), choiceBig: true,
    ways: [way('Order, then find each mark', [`In order: ${list(s)}.`, `Least ${fmt(f[0])}, median ${fmt(f[2])}, greatest ${fmt(f[4])}. The quartiles are the medians of the lower and upper halves: ${fmt(f[1])} and ${fmt(f[3])}.`, `Five numbers: ${b(text(f))}.`]),
      way('Rule out wrong choices', [`The five numbers must be in order, with the least first and the greatest last, and the median is the middle value, not the mean.`, `Only ${b(text(f))} fits every rule.`])],
    hint: 'Put the data in order first. The least and greatest are the ends, and the median splits the data in two.' }, 'bpFive', { xs });
}
function compare() {
  const A = stats(5), B = stats(5), want = pick(['iqr', 'range']), ma = want === 'iqr' ? A.nums[3] - A.nums[1] : A.nums[4] - A.nums[0], mb = want === 'iqr' ? B.nums[3] - B.nums[1] : B.nums[4] - B.nums[0];
  if (ma === mb) return compare();
  const lo = Math.min(A.lo, B.lo), hi = Math.max(A.hi, B.hi), win = ma > mb ? 'Team A' : 'Team B', word = want === 'iqr' ? 'interquartile range' : 'range';
  return T({ ask: `The box plots show the points scored by two teams. Which team has the greater ${b(word)}?`, visual: boxPlot(A.nums, { lo, hi, step: 5, title: 'Team A', name: 'Team A' }) + boxPlot(B.nums, { lo, hi, step: 5, title: 'Team B', name: 'Team B' }), answer: choice(win, [], { all: ['Team A', 'Team B'] }), choiceBig: true,
    ways: [way('Work out both', [`Team A: ${want === 'iqr' ? `${A.nums[3]} − ${A.nums[1]}` : `${A.nums[4]} − ${A.nums[0]}`} = ${ma}. Team B: ${want === 'iqr' ? `${B.nums[3]} − ${B.nums[1]}` : `${B.nums[4]} − ${B.nums[0]}`} = ${mb}.`, `${Math.max(ma, mb)} is greater than ${Math.min(ma, mb)}, so ${b(win)} has the greater ${word}.`]),
      way('Compare the widths', [`The ${word} is the width of ${want === 'iqr' ? 'the box' : 'the whole plot'}.`, `${b(win)} is wider, so it has the greater ${word}.`])],
    hint: want === 'iqr' ? 'The IQR is the width of the box. Which box is wider?' : 'The range is the width of the whole plot, whisker to whisker. Which is wider?' }, 'bpTwo', { a: A.nums, b: B.nums, want });
}
const SHAPES = { 1: [() => read(1), () => spreadPlot('range'), percent, count], 2: [() => read(2), () => spreadPlot('iqr'), () => data(2), fiveNumbers, percent], 3: [() => data(3), () => spreadPlot('iqr'), fiveNumbers, compare, count, () => read(3)] };
export const genBoxPlot = L => pick(SHAPES[L])();
