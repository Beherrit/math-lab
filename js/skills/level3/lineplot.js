// Line plots with a scale in halves, quarters or eighths: read a count, total, compare, and use the lengths.
import { rnd, pick, chance, shuffle, gcd, F, fr, b, way, num, frac, choice } from '../../util.js';
import { oneOf, plural, tagged } from './helpers.js';
import { fracPlot } from './visuals-measure.js';

const THINGS = [['seashell', 'seashells', 'inches'], ['pencil', 'pencils', 'inches'], ['leaf', 'leaves', 'inches'], ['ribbon', 'ribbons', 'feet'], ['carrot', 'carrots', 'inches'], ['rope', 'ropes', 'feet']];
const DENS = [[2, 4], [4, 4, 8], [8, 8, 4]];
const sum = xs => xs.reduce((a, x) => a + x, 0);

// A data set: a scale, and how many X marks sit on each tick. Always at least three different lengths.
function dataSet(L, small = false) {
  const den = pick(DENS[L - 1]), span = den === 8 ? 1 : 2, lo = rnd(1, 3), n = span * den, cap = small ? 8 : L === 1 ? 10 : 14;
  const counts = Array.from({ length: n + 1 }, () => (chance(0.45) ? 0 : rnd(1, L === 1 ? 3 : 4)));
  const total = sum(counts), at = counts.filter(c => c > 0).length;
  if (total > cap || total < 5 || at < 3 || (small && total > 8)) return null;
  const [one, many, unit] = pick(THINGS);
  return { den, span, lo, counts, one, many, unit, top: i => lo * den + i, plot: () => fracPlot({ den, lo, span, counts, unit: `Length of each ${one} (${unit})` }) };
}
// A length written as the plot's labels write it: simplified, as a whole, fraction or mixed number.
function shape(top, den) {
  const g = gcd(top, den), tn = top / g, td = den / g, w = Math.floor(tn / td), n = tn % td;
  return { w, n, d: n ? td : 0, html: fr(top, den), text: n ? `${w ? w + ' ' : ''}${n}/${td}` : `${w}` };
}
const intro = D => `The line plot shows how long each ${D.one} is, in ${D.unit}. Each X is one ${D.one}.`;
const mark = (D, i) => `Find ${shape(D.top(i), D.den).html} on the scale and look at the X marks above it.`;
const ticksWith = (D, f = c => c > 0) => D.counts.map((c, i) => (f(c) ? i : -1)).filter(i => i >= 0);

function readAt(L) {
  const D = dataSet(L);
  if (!D) return null;
  const i = pick(chance(0.8) ? ticksWith(D) : D.counts.map((_, j) => j)), s = shape(D.top(i), D.den), c = D.counts[i];
  return { ask: `${intro(D)} How many ${D.many} are ${s.html} ${D.unit} long?`, visual: D.plot(), answer: num(c), _t: { kind: 'lpAt', v: [s.w, s.n, s.d], den: D.den, lo: D.lo, counts: D.counts },
    hint: 'Find that length on the scale. Count the X marks straight above it.',
    ways: [way('Read the plot', [D.plot(), mark(D, i), `${plural(c, 'X mark')}, so the answer is ${b(c)}.`]), way('Count every mark', [`Go along the scale from the left. Marks on each length: ${D.counts.map((x, j) => `${shape(D.top(j), D.den).text}: ${x}`).join(', ')}.`, `At ${s.text} there ${c === 1 ? 'is' : 'are'} ${b(c)}.`])] };
}
function total(L) {
  const D = dataSet(L);
  if (!D) return null;
  const T = sum(D.counts), parts = D.counts.filter(c => c > 0);
  return { ask: `${intro(D)} How many ${D.many} are in the plot altogether?`, visual: D.plot(), answer: num(T), _t: { kind: 'lpTotal', den: D.den, lo: D.lo, counts: D.counts }, hint: 'Count every X mark, one length at a time.',
    ways: [way('Add the columns', [D.plot(), `The columns of X marks hold ${parts.join(' + ')}.`, `${parts.join(' + ')} = ${b(T)}`]), way('Count in pairs', [`Count the X marks column by column, keeping a running total: ${parts.reduce((acc, c) => [...acc, (acc.at(-1) || 0) + c], []).join(', ')}.`, `The last total is ${b(T)}.`])] };
}
function beyond(L) {
  const D = dataSet(L);
  if (!D) return null;
  const longer = chance(0.6), pool = ticksWith(D).slice(1, -1), i = pool.length ? pick(pool) : null;
  if (i === null) return null;
  const s = shape(D.top(i), D.den), sel = D.counts.map((c, j) => (longer ? j > i : j < i) ? c : 0), R = sum(sel);
  return { ask: `${intro(D)} How many ${D.many} are ${longer ? 'longer' : 'shorter'} than ${s.html} ${D.unit}?`, visual: D.plot(), answer: num(R), _t: { kind: 'lpMore', v: [s.w, s.n, s.d], den: D.den, lo: D.lo, counts: D.counts, longer },
    hint: `Find ${s.text} on the scale. Only count the marks ${longer ? 'to its right' : 'to its left'}, not the ones at ${s.text}.`,
    ways: [way('Add what is on that side', [D.plot(), `${longer ? 'Longer' : 'Shorter'} means ${longer ? 'to the right of' : 'to the left of'} ${s.text}.`, `${sel.filter(c => c > 0).join(' + ') || 0} = ${b(R)}`]),
      way('Take away the rest', [`All the ${D.many}: ${sum(D.counts)}.`, `Not counted: the ${D.counts[i]} at ${s.text} and the ${sum(D.counts) - R - D.counts[i]} on the other side.`, `${sum(D.counts)} − ${D.counts[i]} − ${sum(D.counts) - R - D.counts[i]} = ${b(R)}`])] };
}
function range(L) {
  const D = dataSet(L), ticks = D && ticksWith(D);
  if (!D) return null;
  const lo = ticks[0], hi = ticks.at(-1), g = hi - lo, [short, long] = [shape(D.top(lo), D.den), shape(D.top(hi), D.den)];
  return { ask: `${intro(D)} How much longer is the longest ${D.one} than the shortest? Answer in ${D.unit}.`, visual: D.plot(), answer: frac(g, D.den), _t: { kind: 'lpDiff', den: D.den, lo: D.lo, counts: D.counts }, hint: 'Find the leftmost X and the rightmost X. How far apart are they on the scale?',
    ways: [way('Subtract the lengths', [D.plot(), `The shortest is ${short.html} and the longest is ${long.html}.`, `${long.html} − ${short.html} = ${b(fr(g, D.den))}`]),
      way('Count the steps', [`Each step on the scale is ${F(1, D.den)}. From the shortest to the longest is ${g} steps.`, `${g} × ${F(1, D.den)} = ${F(g, D.den)}${gcd(g, D.den) > 1 ? `, which is ${b(fr(g, D.den))}` : ''}. The difference is ${b(fr(g, D.den))}.`])] };
}
function most(L) {
  const D = dataSet(L);
  if (!D) return null;
  const mx = Math.max(...D.counts), top = ticksWith(D, c => c === mx);
  if (top.length !== 1) return null;
  const others = shuffle(D.counts.map((_, j) => j).filter(j => j !== top[0])).slice(0, 3), html = j => shape(D.top(j), D.den).html;
  return { ask: `${intro(D)} Which length has the most ${D.many}?`, visual: D.plot(), answer: choice(html(top[0]), others.map(html)), _t: { kind: 'lpMost', den: D.den, lo: D.lo, counts: D.counts }, hint: 'Look for the tallest column of X marks. Which length is it above?',
    ways: [way('Find the tallest column', [D.plot(), `The tallest column has ${mx} X marks.`, `It is above ${b(html(top[0]))}.`]), way('Compare the counts', [D.counts.map((c, j) => `${shape(D.top(j), D.den).text}: ${c}`).join(', '), `The biggest count is ${mx}, at ${b(html(top[0]))}.`])] };
}
function compareTwo(L) {
  const D = dataSet(L), ticks = D && ticksWith(D);
  if (!D || ticks.length < 3) return null;
  const [i, j] = shuffle(ticks).slice(0, 2), a = D.counts[i], c = D.counts[j];
  if (a === c) return null;
  const hi = a > c ? i : j, lo = a > c ? j : i, sh = shape(D.top(hi), D.den), sl = shape(D.top(lo), D.den);
  return { ask: `${intro(D)} How many more ${D.many} are ${sh.html} ${D.unit} long than ${sl.html} ${D.unit} long?`, visual: D.plot(), answer: num(Math.abs(a - c)), _t: { kind: 'lpCmp', hi: [sh.w, sh.n, sh.d], lo: [sl.w, sl.n, sl.d], den: D.den, base: D.lo, counts: D.counts },
    hint: 'Count the X marks at each of the two lengths. Then find the difference.',
    ways: [way('Count both columns', [D.plot(), `At ${sh.text}: ${Math.max(a, c)} marks. At ${sl.text}: ${Math.min(a, c)} marks.`, `${Math.max(a, c)} − ${Math.min(a, c)} = ${b(Math.abs(a - c))}`]), way('Match them up', [`Pair each X at ${sl.text} with one at ${sh.text}. ${Math.min(a, c)} pairs use up the shorter column.`, `${Math.max(a, c) - Math.min(a, c)} marks at ${sh.text} have no partner: ${b(Math.abs(a - c))}.`])] };
}
// All the lengths laid end to end: fractions added up from the plot.
function endToEnd() {
  const D = dataSet(3, true);
  if (!D) return null;
  const R = sum(D.counts.map((c, i) => c * D.top(i))), items = D.counts.map((c, i) => (c ? `${c} × ${shape(D.top(i), D.den).html}` : null)).filter(Boolean);
  return { ask: `${intro(D)} If all the ${D.many} are laid end to end, how long is the line in ${D.unit}?`, visual: D.plot(), answer: frac(R, D.den), _t: { kind: 'lpSum', den: D.den, lo: D.lo, counts: D.counts }, hint: 'Each X is one length. Multiply each length by how many X marks it has, then add.',
    ways: [way('Group by length', [D.plot(), `${items.join(' + ')}`, `Adding all of these gives ${b(fr(R, D.den))} ${D.unit}.`]), way('Work in pieces', [`Each step on the scale is ${F(1, D.den)}.`, `Counting every X in ${F(1, D.den)} pieces gives ${R} pieces in all.`, `${F(R, D.den)} is ${b(fr(R, D.den))} ${D.unit}.`])] };
}

const MAKERS = [[readAt, total, most, beyond], [readAt, total, beyond, range, most, compareTwo], [range, endToEnd, beyond, compareTwo, readAt, range]];
// The plot is the question, so its numbers go into the hidden marker the app's repeat check reads.
export function genLinePlot(L) {
  const p = oneOf(MAKERS[L - 1], L);
  return p && tagged(p, { plot: [p._t.den, p._t.lo ?? p._t.base, ...p._t.counts].join(',') });
}
