// Reads the coordinates and counts back out of the pictures of the newer level 3 skills, so a test can check what a picture
// shows against what the question says, with code that shares nothing with the generators.
import assert from 'node:assert/strict';

const nums = (s, re) => [...s.matchAll(re)].map(m => m.slice(1).map(Number));
const LINE = /<line[^>]*?x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)"/g;
const deg = r => r * 180 / Math.PI;
const near = (a, c, tol = 0.6) => Math.abs(a - c) <= tol;

// Readings of the rays of a protractor picture on its own scale (0 at the right end, or at the left when flipped).
export function protractorReadings(svg) {
  const flip = /data-flip="1"/.test(svg), rays = [...svg.matchAll(/<line class="ray" x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)"/g)].map(m => m.slice(1).map(Number));
  return rays.map(([x1, y1, x2, y2]) => { const t = deg(Math.atan2(y1 - y2, x2 - x1)); return Math.round(flip ? 180 - t : t); });
}
// The angle of the last ray of the plain angle picture, which starts at (120, 118).
export const angleOfPicture = svg => { const ls = nums(svg, LINE).filter(l => l[0] === 120 && l[1] === 118), [, , x, y] = ls.at(-1); return deg(Math.atan2(118 - y, x - 120)); };

export function lineRelation(svg) {
  const [a, c] = [...svg.matchAll(/<line class="ln" x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)"/g)].map(m => m.slice(1).map(Number));
  const u = [a[2] - a[0], a[3] - a[1]], v = [c[2] - c[0], c[3] - c[1]], len = Math.hypot(...u) * Math.hypot(...v);
  const cross = Math.abs(u[0] * v[1] - u[1] * v[0]) / len, dot = Math.abs(u[0] * v[0] + u[1] * v[1]) / len;
  return cross < 0.03 ? 'Parallel' : dot < 0.03 ? 'Perpendicular' : 'Neither';
}
export const polygon = svg => /<polygon class="body" points="([^"]+)"/.exec(svg)[1].split(' ').map(p => p.split(',').map(Number));
const angleAt = (p, i) => { const a = p[(i + p.length - 1) % p.length], b = p[i], c = p[(i + 1) % p.length]; return deg(Math.acos(((a[0] - b[0]) * (c[0] - b[0]) + (a[1] - b[1]) * (c[1] - b[1])) / (Math.hypot(a[0] - b[0], a[1] - b[1]) * Math.hypot(c[0] - b[0], c[1] - b[1])))); };
export function triangleKind(svg) {
  const m = Math.max(...polygon(svg).map((_, i, p) => angleAt(p, i)));
  return m > 95 ? 'Obtuse' : m > 85 ? 'Right' : 'Acute';
}
// How many pairs of opposite sides of a four-sided shape are parallel.
export function parallelPairs(svg) {
  const p = polygon(svg), side = i => [p[(i + 1) % 4][0] - p[i][0], p[(i + 1) % 4][1] - p[i][1]];
  return [0, 1].filter(i => { const u = side(i), v = side(i + 2); return Math.abs(u[0] * v[1] - u[1] * v[0]) / (Math.hypot(...u) * Math.hypot(...v)) < 0.02; }).length;
}
// Lines of symmetry of a polygon, found by trying every line from the centre to a corner or to a side's middle.
export function symmetryLines(svg) {
  const p = polygon(svg), c = [p.reduce((a, q) => a + q[0], 0) / p.length, p.reduce((a, q) => a + q[1], 0) / p.length], tol = 0.35;
  const mids = p.map((q, i) => [(q[0] + p[(i + 1) % p.length][0]) / 2, (q[1] + p[(i + 1) % p.length][1]) / 2]), angles = [];
  for (const q of [...p, ...mids]) { const t = ((deg(Math.atan2(q[1] - c[1], q[0] - c[0])) % 180) + 180) % 180; if (!angles.some(a => Math.abs(a - t) < 1 || Math.abs(a - t) > 179)) angles.push(t); }
  const reflect = (q, t) => { const r = 2 * t * Math.PI / 180, dx = q[0] - c[0], dy = q[1] - c[1]; return [c[0] + dx * Math.cos(r) + dy * Math.sin(r), c[1] + dx * Math.sin(r) - dy * Math.cos(r)]; };
  return angles.filter(t => p.every(q => { const r = reflect(q, t); return p.some(s => Math.hypot(s[0] - r[0], s[1] - r[1]) < tol); })).length;
}
export const letterOf = svg => />([A-Z])<\/text>/.exec(svg)?.[1];
// Marks of a line plot: how many sit on each tick, and the first tick label.
export function plotCounts(svg) {
  const counts = [], marks = [...svg.matchAll(/class="xm" data-i="(\d+)"/g)].map(m => Number(m[1]));
  for (const i of marks) counts[i] = (counts[i] || 0) + 1;
  return Array.from({ length: Math.max(0, ...marks) + 1 }, (_, i) => counts[i] || 0);
}
export const plotFirstLabel = svg => />([^<]+)<\/text>/.exec(svg.slice(svg.indexOf('class="tick"')))?.[1];
export function ariaShaded(svg) { return [...svg.matchAll(/aria-label="(\d+) of (\d+)(?: equal parts| squares) shaded"/g)].map(m => [Number(m[1]), Number(m[2])]); }
// Position of the dot on a number line in tenths of the way along: 0 to 10.
export const dotTenths = svg => { const cx = Number(/<circle cx="([\d.]+)"[^>]*class="dot"/.exec(svg)[1]); return Math.round((cx - 26) / 248 * 10); };
// The shaded cells of a mirror grid picture, as "row,col" strings.
export const gridCells = svg => new Set([...svg.matchAll(/data-r="(\d+)" data-c="(\d+)"/g)].map(m => `${m[1]},${m[2]}`));
export const gridCols = svg => Number(/data-cols="(\d+)"/.exec(svg)[1]);

// Checks the picture of a problem against the numbers its recompute rule uses.
export function checkPicture(p, where) {
  const t = p._t, v = p.visual || '';
  const same = (xs, ys, msg) => assert.deepEqual(xs, ys, `${where}: ${msg} ${JSON.stringify(t)}`);
  if (t.kind === 'prread') same(protractorReadings(v), [0, t.deg], 'protractor rays');
  if (t.kind === 'prdiff') same(protractorReadings(v), [t.r1, t.r2], 'protractor rays');
  if (t.kind === 'prsplit') same(protractorReadings(v), [0, t.part, t.total], 'protractor rays');
  if (t.kind === 'prest') assert.ok(near(angleOfPicture(v), t.deg, 1.5), `${where}: angle picture is ${angleOfPicture(v)}, not ${t.deg}`);
  if (t.kind === 'fpbar') same(ariaShaded(v), [[t.n, t.d]], 'bar shading');
  if (t.kind === 'mxpic') same(ariaShaded(v), [[t.w * t.d + t.n, t.d]], 'bar shading');
  if (t.kind === 'dogrid') same(ariaShaded(v).map(a => a[0]), [t.a, t.c], 'grid shading');
  if (t.kind === 'docloser') assert.equal(dotTenths(v), t.i, `${where}: dot position`);
  if (t.kind === 'patshape') assert.equal((v.match(/class="on"/g) || []).length, t.terms.reduce((a, x) => a + x, 0), `${where}: tiles drawn`);
  if (/^lp/.test(t.kind)) {
    const drawn = plotCounts(v);
    same(drawn, t.counts.slice(0, drawn.length), 'plot marks');
    assert.ok(t.counts.slice(drawn.length).every(c => c === 0), `${where}: plot is missing marks`);
    assert.equal(plotFirstLabel(v), String(t.kind === 'lpCmp' ? t.base : t.lo), `${where}: first label`);
  }
}
