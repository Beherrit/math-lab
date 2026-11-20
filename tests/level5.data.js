// Level 5 test rules for the data and measurement skills added later: statistical questions, box plots, spread and fraction volumes.
import assert from 'node:assert/strict';
import { svgTexts, svgCircles } from './level5.render.js';
import { boxRead } from './level5.new.read.js';

const L = (...xs) => xs;
const vol = x => x.ns[0] * x.ns[1] * x.ns[2] / x.d ** 3;
const sum = xs => xs.reduce((a, x) => a + x, 0);
const mean = xs => sum(xs) / xs.length;
const mad = xs => sum(xs.map(x => Math.abs(x - mean(xs)))) / xs.length;
const median = xs => { const s = [...xs].sort((p, q) => p - q), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const MEANING = ['how far the values are from the mean, on average', 'the values are all close to the mean'];
const mid = a => { const n = a.length; return n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2; };
const quart = xs => { const s = [...xs].sort((p, q) => p - q), n = s.length, h = Math.floor(n / 2); return [s[0], mid(s.slice(0, h)), mid(s), mid(s.slice(n - h)), s[n - 1]]; };
const FRAC = { 'between the first and third quartiles (inside the box)': 0.5, 'between the least value and the first quartile': 0.25, 'above the median': 0.5, 'between the first quartile and the greatest value': 0.75, 'below the third quartile': 0.75, 'between the median and the third quartile': 0.25 };
const NAMES = ['least value', 'first quartile', 'median', 'third quartile', 'greatest value'];
const metric = (n, want) => (want === 'iqr' ? n[3] - n[1] : n[4] - n[0]);
const drawn = (p, t) => assert.deepEqual(boxRead(p.visual)[0], t.nums, 'five numbers drawn in the box plot');
const STAT_RE = /\b(students|players|classmates|riders|kids|families)\b/i;
const rangeOf = c => c.length - 1 - [...c].reverse().findIndex(x => x > 0) - c.findIndex(x => x > 0);
const peaks = c => c.filter((x, i) => x > (c[i - 1] ?? 0) && x > (c[i + 1] ?? 0)).length;
const windowText = (lo, c) => { const sums = c.slice(0, -2).map((_, i) => c[i] + c[i + 1] + c[i + 2]), i = sums.indexOf(Math.max(...sums)); return `${lo + i} to ${lo + i + 2}`; };
// Dot plots in a picture (one or more svgs): the first value on the line and how many dots sit above each value.
export function dotsRead(svgs) {
  return String(svgs).split('<svg').slice(1).map(svg => {
    const ticks = svgTexts(svg).filter(x => x.cls === 'tk'), cs = svgCircles(svg).filter(c => /grape/.test(c.style || ''));
    return { lo: Number(ticks[0].s), counts: ticks.map(x => cs.filter(c => c.cx === x.x).length) };
  });
}
const sameDots = (p, t) => { const [d] = dotsRead(p.visual); assert.equal(d.lo, t.lo, 'first value on the line'); assert.deepEqual(d.counts, t.counts, 'dots drawn above each value'); };

export const REC_DATA = {
  fvUnit: ({ d }) => [1, d ** 3], fvCount: ({ d }) => d ** 3, fvLayerCount: ({ n, d }) => (n / d) / (1 / d), fvLayer: ({ p, q, r, d }) => [p * q * r, d ** 3],
  fvMissing: ({ a, b, c, d }) => [a * b * c * d * d, d ** 3 * a * b], fvBase: ({ n1, d1, n2, d2 }) => [n1 * n2, d1 * d2], fvWater: ({ l, w, x, d }) => [l * w * x, d ** 3],
  fvCompare: ({ A, B }) => (vol(A) > vol(B) ? 'Box A' : 'Box B'),
  madGiven: ({ xs }) => mad(xs), madFull: ({ xs }) => mad(xs), madCompare: ({ A, B }) => (mad(A) > mad(B) ? 'Set A' : 'Set B'), madConsistent: ({ a, b }) => (a < b ? 'Team A' : 'Team B'),
  madMeaning: ({ v }) => MEANING[v], madMeanNew: ({ xs, add }) => mean([...xs, add]), madMedianNew: ({ xs, add }) => median([...xs, add]), madFit: ({ xs }) => (Math.max(...xs) > 2 * median(xs) ? 'median' : 'mean'),
  bpRead: ({ nums, i }) => nums[i], bpRange: ({ nums }) => nums[4] - nums[0], bpIqr: ({ nums }) => nums[3] - nums[1], bpPercent: ({ region }) => FRAC[region] * 100, bpCount: ({ n, region }) => n * FRAC[region],
  bpSummary: ({ xs, i }) => quart(xs)[i], bpFive: ({ xs }) => ({ test: o => { const v = o.split(', ').map(Number), f = quart(xs); return v.length === 5 && v.every((x, k) => x === f[k]); } }),
  bpTwo: ({ a, b, want }) => (metric(a, want) > metric(b, want) ? 'Team A' : 'Team B'),
  sqWhich: ({ good }) => good, sqYesNo: ({ q }) => (STAT_RE.test(q) ? 'Yes' : 'No'),
  sqAnswers: () => ({ test: o => { const xs = o.split(', '); return xs.length >= 3 && xs.every(x => /^\d+$/.test(x)) && new Set(xs).size >= 3; } }),
  sqGap: ({ lo, counts }) => lo + counts.findIndex((c, i) => i > 0 && i < counts.length - 1 && c === 0), sqPeak: ({ counts }) => peaks(counts), sqCluster: ({ lo, counts }) => windowText(lo, counts),
  sqSpread: ({ cA, cB }) => (rangeOf(cA) > rangeOf(cB) ? 'Class A' : 'Class B'),
};
export const SHOWN_DATA = {
  fvUnit: t => L(t.d), fvCount: t => L(t.d), fvLayerCount: t => L(t.n / t.d, t.d), fvLayer: t => L(t.p, t.q, t.r, t.d), fvMissing: t => L(t.a / t.d, t.b / t.d, t.a * t.b * t.c / t.d ** 3),
  fvBase: t => L(t.n1 / t.d1, t.n2 / t.d2), fvWater: t => L(t.l / t.d, t.w / t.d, t.x / t.d, t.hh / t.d), fvCompare: t => [...t.A.ns.map(n => n / t.A.d), ...t.B.ns.map(n => n / t.B.d)],
  madGiven: t => [...t.xs, t.mean], madFull: t => t.xs, madCompare: t => [...t.A, ...t.B], madConsistent: t => L(t.a, t.b), madMeaning: () => L(), madMeanNew: t => [...t.xs, t.add], madMedianNew: t => [...t.xs, t.add], madFit: t => t.xs,
  bpRead: t => [NAMES[t.i]], bpRange: () => L(), bpIqr: () => L(), bpPercent: t => [t.region], bpCount: t => [t.n, t.region], bpSummary: t => [...t.xs, NAMES[t.i]], bpFive: t => t.xs, bpTwo: () => L(),
  sqWhich: () => L(), sqYesNo: t => [t.q.toLowerCase()], sqAnswers: t => [t.q.toLowerCase()], sqGap: () => L(), sqPeak: () => L(), sqCluster: () => L(), sqSpread: () => L(),
};
export const CUSTOM_DATA = {
  madGiven: (p, t) => assert.equal(mean(t.xs), t.mean, 'the mean given is the real mean'),
  bpRead: drawn, bpRange: drawn, bpIqr: drawn, bpPercent: (p, t) => assert.equal(boxRead(p.visual).length, 1, 'one box plot'),
  bpTwo: (p, t) => { const [a, b] = boxRead(p.visual); assert.deepEqual([a, b], [t.a, t.b], 'both box plots drawn'); },
  sqWhich: (p, t) => { assert.ok(STAT_RE.test(t.good), 'the right choice names a group'); assert.ok(t.others.every(o => !STAT_RE.test(o)), 'the other choices have one answer'); },
  sqGap: sameDots, sqPeak: sameDots, sqCluster: sameDots,
  sqSpread: (p, t) => { const [a, b] = dotsRead(p.visual); assert.deepEqual([a.counts, b.counts], [t.cA, t.cB], 'both plots drawn'); },
};
export const RANGE_DATA = {};
