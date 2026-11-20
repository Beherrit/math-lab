// Measuring to the nearest half and quarter inch, and showing measurements on a line plot.
import { rnd, pick, shuffle, b, frText, way, num, frac, choice } from '../../util.js';
import { ruler, lengthPlot } from './rulerpic.js';
import { cnt } from './words.js';
import { mark } from './kit.js';

const word = sub => (sub === 2 ? 'half' : 'quarter');
const THINGS = [['pencils', 'pencil'], ['ribbons', 'ribbon'], ['seed pods', 'seed pod'], ['carrots', 'carrot'], ['feathers', 'feather'], ['leaves', 'leaf']];
const inch = (q, sub) => `${frText(q, sub)} ${q <= sub ? 'inch' : 'inches'}`;
const partOf = (q, sub) => ({ w: Math.floor(q / sub), r: q % sub });

// Reading a ruler. With `off`, the end of the strip is a little before or past a mark, so the answer is the nearest mark.
function rulerQ(q, sub, off) {
  const { w, r } = partOf(q, sub), len = q / sub, nearest = off !== 0, at = frText(r, sub), pic = ruler(len, { sub, max: 5, off });
  return { ask: mark(nearest ? `How long is the strip to the nearest ${word(sub)} inch?` : `How long is the strip? The ruler is marked in ${word(sub)} inches.`, q, sub, off), visual: pic, answer: frac(q, sub), suffix: 'inches', _t: { f: 'ruler', pic: true },
    hint: `Find the last whole inch before the end of the strip. Then count the ${word(sub)}-inch marks after it.`,
    ways: [way('Whole inches, then marks', [pic, `The strip ends after the ${w} inch mark${nearest ? `, and a tiny bit ${off > 0 ? 'past' : 'before'} a ${word(sub)}-inch mark. Use the mark it is closest to` : ''}.`, `After ${w} there ${r === 1 ? 'is 1 mark' : `are ${r} marks`} of ${word(sub)} inches: ${r}/${sub}${at !== `${r}/${sub}` ? `, which is ${at}` : ''}.`, `The length is ${b(frText(q, sub))} inches.`]),
      way('Count every mark from 0', [`Count the ${word(sub)}-inch marks from 0 to the end of the strip: ${q}.`, `${q} ${sub === 2 ? 'halves' : 'quarters'} is ${w} inches and ${r}/${sub}, so the strip is ${b(frText(q, sub))} inches.`])] };
}
// Number to picture: how many marks from 0?
function marksQ(q, sub) {
  const { w, r } = partOf(q, sub);
  return { ask: `A ruler is marked every ${word(sub)} inch. A strip is ${inch(q, sub)} long. How many ${word(sub)}-inch marks from 0 does its end reach?`, answer: num(q), _t: { f: 'qmarks', sub: word(sub) }, hint: `How many ${word(sub)}-inch marks make one whole inch?`,
    ways: [way('Count the marks', [`One inch has ${sub} ${word(sub)}-inch marks, so ${w} inches has ${w} × ${sub} = ${w * sub}.`, `The extra part is ${r} more marks: ${w * sub} + ${r} = ${b(q)}.`]), way('Count up on the ruler', [`Count ${word(sub)}-inch marks from 0: ${Array.from({ length: q }, (_, i) => i + 1).join(', ')}.`, `The end is at mark ${b(q)}.`])] };
}
// Which is the longest? The choices are on a ruler of halves and quarters.
function longestQ(sub) {
  const qs = shuffle(Array.from({ length: 6 * sub - 2 }, (_, i) => i + 2)).slice(0, 3), top = Math.max(...qs), right = inch(top, sub), sorted = qs.slice().sort((p, q) => q - p);
  return { ask: 'Which strip is the longest?', answer: choice(right, qs.filter(x => x !== top).map(x => inch(x, sub))), choiceBig: true, _t: { f: 'longest' }, hint: `Count each length in ${word(sub)} inches, so you can compare them.`,
    ways: [way('Count the marks', [...qs.map(x => `${inch(x, sub)} is ${x} ${sub === 2 ? 'halves' : 'quarters'}.`), `${sorted[0]} is the most, so ${b(right)} is the longest.`]), way('Order them', [`From shortest to longest: ${sorted.slice().reverse().map(x => inch(x, sub)).join(', ')}.`, `The last one is ${b(right)}.`])] };
}
// Measurements as a line plot: `data` counts per mark, `list` the individual lengths in marks.
function plotData(sub, max, short = false) {
  const marks = shuffle(Array.from({ length: (max - 1) * sub - 1 }, (_, i) => sub + 1 + i)).slice(0, short ? 4 : rnd(4, 5)), data = {}, list = [];
  for (const m of marks) { const c = rnd(1, short ? 2 : 3); data[m] = c; for (let i = 0; i < c; i++) list.push(m); }
  return { data, list: shuffle(list), marks: marks.sort((a, c) => a - c) };
}
function readPlotQ(sub, max) {
  const { data, marks } = plotData(sub, max), [things] = pick(THINGS), q = pick(marks), n = marks.reduce((s, m) => s + data[m], 0), pic = lengthPlot(data, sub, max, `${n} ${things}`);
  return { ask: mark(`How many of the ${things} are ${inch(q, sub)} long?`, q, n), visual: pic, answer: num(data[q]), _t: { f: 'plotat', pic: true }, hint: 'Find the mark on the number line. Count the circles stacked above it.',
    ways: [way('Count the circles', [pic, `Find ${inch(q, sub)} on the number line, then count the circles above it.`, `There ${data[q] === 1 ? 'is' : 'are'} ${b(data[q])}.`]), way('Read the line plot like a tally', [`Each circle is one of the ${things}. The stack above ${frText(q, sub)} is the number that long.`, `That stack has ${b(data[q])}.`])] };
}
function comparePlotQ(sub, max) {
  const { data, marks } = plotData(sub, max), [things] = pick(THINGS), q = pick(marks.slice(1, -1).length ? marks.slice(1, -1) : marks), longer = Math.random() < 0.5, n = marks.reduce((s, m) => s + data[m], 0);
  const hit = marks.filter(m => (longer ? m > q : m < q)), tot = hit.reduce((s, m) => s + data[m], 0), pic = lengthPlot(data, sub, max, `${n} ${things}`);
  return { ask: mark(`How many of the ${things} are ${longer ? 'longer' : 'shorter'} than ${inch(q, sub)}?`, q, longer), visual: pic, answer: num(tot), _t: { f: 'plotcmp', pic: true }, hint: `Find ${frText(q, sub)} on the line. Count the circles on the ${longer ? 'right' : 'left'} of it, not on it.`,
    ways: [way('Count the circles on that side', [pic, `${longer ? 'Longer' : 'Shorter'} means ${longer ? 'to the right of' : 'to the left of'} ${frText(q, sub)}. The circle stacks there: ${hit.length ? hit.map(m => data[m]).join(' + ') : '0'}.`, `The total is ${b(tot)}.`]), way('Count all, then take away', [`All the circles: ${n}. The stack at ${frText(q, sub)} itself is ${data[q]}, and the ${longer ? 'shorter' : 'longer'} side has ${n - data[q] - tot}.`, `${n} − ${data[q]} − ${n - data[q] - tot} = ${b(tot)}.`])] };
}
function diffPlotQ(sub, max) {
  let p; do { p = plotData(sub, max); } while ((p.marks[p.marks.length - 1] - p.marks[0]) % sub === 0);
  const [things] = pick(THINGS), lo = p.marks[0], hi = p.marks[p.marks.length - 1], n = p.list.length, pic = lengthPlot(p.data, sub, max, `${n} ${things}`);
  return { ask: mark(`How much longer is the longest of the ${things} than the shortest?`, lo, hi), visual: pic, answer: frac(hi - lo, sub), suffix: 'inches', _t: { f: 'plotdiff', pic: true }, hint: 'Find the shortest and the longest on the line. Count the jumps between them.',
    ways: [way('Count the jumps', [pic, `The shortest is ${inch(lo, sub)} and the longest is ${inch(hi, sub)}.`, `${hi - lo} jumps of ${frText(1, sub)} inch is ${b(frText(hi - lo, sub))} inches.`]), way('Subtract', [`${frText(hi, sub)} − ${frText(lo, sub)}: in ${sub === 2 ? 'halves' : 'quarters'}, ${hi} − ${lo} = ${hi - lo}.`, `${hi - lo} ${sub === 2 ? 'halves' : 'quarters'} is ${b(frText(hi - lo, sub))} inches.`])] };
}
// Picture to build: how many circles go above a mark, from a list of lengths.
function buildPlotQ(sub, max) {
  const { list, marks } = plotData(sub, max, true), q = pick(marks), c = list.filter(x => x === q).length, shown = list.map(x => frText(x, sub)).join(', ');
  return { ask: `A line plot is made from these lengths in inches: ${shown}. How many circles go above the ${frText(q, sub)} inch mark?`, answer: num(c), _t: { f: 'plotbuild' }, hint: `Go through the list and count how many are exactly ${frText(q, sub)}.`,
    ways: [way('Tally the list', [`Go along the list and make a tally mark each time you see ${frText(q, sub)}.`, `There ${c === 1 ? 'is' : 'are'} ${cnt(c, 'tally mark')}, so ${b(c)} ${c === 1 ? 'circle goes' : 'circles go'} above ${frText(q, sub)}.`]),
      way('Sort the list first', [`In order: ${list.slice().sort((x, y) => x - y).map(x => frText(x, sub)).join(', ')}.`, `The ${frText(q, sub)}s sit together: ${b(c)}.`])] };
}
const frac1 = (sub, lo) => { let q; do { q = rnd(lo * sub + 1, 5 * sub - 1); } while (q % sub === 0); return q; };
export function genMeasure(L) {
  const sub = L === 1 ? 2 : 4, max = L === 1 ? 4 : 4, off = pick([-1, 1]) * 0.06;
  if (L === 1) return pick([() => rulerQ(frac1(2, 1), 2, 0), () => rulerQ(frac1(2, 1), 2, 0), () => marksQ(frac1(2, 1), 2), () => longestQ(2), () => readPlotQ(2, max)])();
  if (L === 2) return pick([() => rulerQ(frac1(4, 1), 4, 0), () => rulerQ(frac1(2, 1), 2, 0), () => marksQ(frac1(4, 1), 4), () => longestQ(4), () => readPlotQ(sub, max), () => comparePlotQ(sub, max), () => buildPlotQ(sub, max)])();
  return pick([() => rulerQ(frac1(4, 1), 4, off), () => rulerQ(frac1(2, 1), 2, off), () => diffPlotQ(sub, max), () => comparePlotQ(sub, max), () => buildPlotQ(sub, max), () => longestQ(4)])();
}
