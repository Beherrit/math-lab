// Level 5 test rules for the data and measurement skills added later: statistical questions, box plots, spread and fraction volumes.
import assert from 'node:assert/strict';
import { svgTexts, svgCircles } from './level5.render.js';

const L = (...xs) => xs;
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
  sqWhich: ({ good }) => good, sqYesNo: ({ q }) => (STAT_RE.test(q) ? 'Yes' : 'No'),
  sqAnswers: () => ({ test: o => { const xs = o.split(', '); return xs.length >= 3 && xs.every(x => /^\d+$/.test(x)) && new Set(xs).size >= 3; } }),
  sqGap: ({ lo, counts }) => lo + counts.findIndex((c, i) => i > 0 && i < counts.length - 1 && c === 0), sqPeak: ({ counts }) => peaks(counts), sqCluster: ({ lo, counts }) => windowText(lo, counts),
  sqSpread: ({ cA, cB }) => (rangeOf(cA) > rangeOf(cB) ? 'Class A' : 'Class B'),
};
export const SHOWN_DATA = {
  sqWhich: () => L(), sqYesNo: t => [t.q.toLowerCase()], sqAnswers: t => [t.q.toLowerCase()], sqGap: () => L(), sqPeak: () => L(), sqCluster: () => L(), sqSpread: () => L(),
};
export const CUSTOM_DATA = {
  sqWhich: (p, t) => { assert.ok(STAT_RE.test(t.good), 'the right choice names a group'); assert.ok(t.others.every(o => !STAT_RE.test(o)), 'the other choices have one answer'); },
  sqGap: sameDots, sqPeak: sameDots, sqCluster: sameDots,
  sqSpread: (p, t) => { const [a, b] = dotsRead(p.visual); assert.deepEqual([a.counts, b.counts], [t.cA, t.cB], 'both plots drawn'); },
};
export const RANGE_DATA = {};
