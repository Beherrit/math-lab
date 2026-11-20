// Level 1 picture checks: read the numbers back out of the SVG a child sees and compare them with what the generator holds.
import assert from 'node:assert/strict';
import { barPpu } from '../js/skills/level1/chartpics.js';
import { rulerScale } from '../js/skills/level1/ruler.js';
import { strip, numsIn, attrNums } from './level1.util.js';
import { FLAT_T } from './level1.new.js';

const distinct = xs => [...new Set(xs)];
const nums = (svg, tag, attr) => [...svg.matchAll(new RegExp(`<${tag} class="[^"]*"[^>]*? ${attr}="([\\d.]+)"`, 'g'))].map(m => +m[1]);
// Counters: how many rows and columns are drawn, counting any covered rows.
export function dotGrid(svg) {
  const cy = distinct(nums(svg, 'circle', 'cy')), cx = distinct(nums(svg, 'circle', 'cx')), hidden = +(attrNums(svg, 'data-hidden')[0] || 0);
  return { rows: cy.length + hidden, cols: cx.length, dots: nums(svg, 'circle', 'cx').length, hidden };
}
// Bars on a ruler: [{from, to}] measured from the 0 mark.
export function rulerBars(svg) {
  const { U, X0 } = rulerScale(attrNums(svg, 'data-unit')[0]);
  return [...svg.matchAll(/<rect class="obj" x="([\d.]+)"[^>]*? width="([\d.]+)"/g)].map(m => ({ from: Math.round((+m[1] - X0) / U), to: Math.round((+m[1] + +m[2] - X0) / U) }));
}
// Graph: read the names and values back from a bar graph (bar heights) or a picture graph (circles times the key).
export function readChart(svg) {
  const out = {};
  if (svg.includes('data-step')) {
    const ppu = barPpu(+attrNums(svg, 'data-step')[0]);
    for (const m of svg.matchAll(/<rect class="bar" data-cat="([^"]+)"[^>]*? height="([\d.]+)"/g)) out[m[1]] = Math.round(+m[2] / ppu);
  } else {
    const per = +attrNums(svg, 'data-per')[0];
    for (const m of svg.matchAll(/<circle class="mk" data-cat="([^"]+)"/g)) out[m[1]] = (out[m[1]] || 0) + per;
  }
  return out;
}
// Shares: every svg in the picture, with its parts, kind and where it is cut. Equal when every share is the same size.
export function shareFigs(html) {
  return [...html.matchAll(/<svg[^>]*data-kind="([^"]+)" data-parts="(\d+)" data-cuts="([^"]*)"/g)].map(m => {
    const parts = +m[2], cuts = m[3] ? m[3].split(',').map(Number) : [], sizes = cuts.slice(1).map((c, i) => c - cuts[i]);
    return { kind: m[1], parts, equal: m[1] === 'diag' || m[1] === 'grid' || (sizes.length === parts && sizes.every(s => Math.abs(s - 1 / parts) < 0.011)) };
  });
}
const polygonSides = svg => (svg.match(/<polygon points="([^"]+)"/)?.[1] || '').trim().split(/\s+/).filter(Boolean).map(p => p.split(',').map(Number));
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);

function checkShape(p, t, where) {
  const shape = attrNums(p.visual, 'data-shape')[0];
  if (t.f === 'name') assert.equal(shape, t.shape, `${where}: picture shows ${shape}, answer is ${t.shape}`);
  if (!FLAT_T[shape]) return;
  const pts = polygonSides(p.visual);
  assert.equal(pts.length, FLAT_T[shape].sides, `${where}: ${shape} drawn with ${pts.length} corners`);
  if (!pts.length) return assert.ok(p.visual.includes('<circle'), `${where}: a circle must be drawn as a circle`);
  const lens = pts.map((q, i) => dist(q, pts[(i + 1) % pts.length]));
  if (shape === 'square') assert.ok(lens.every(l => Math.abs(l - lens[0]) < 1), `${where}: the square must have 4 equal sides`);
  if (shape === 'rectangle') assert.ok(Math.abs(lens[0] - lens[1]) > 10 && Math.abs(lens[0] - lens[2]) < 1, `${where}: the rectangle must have two long and two short sides`);
}
function checkShares(p, t, where) {
  const figs = shareFigs(p.visual);
  assert.ok(figs.length >= 1, `${where}: no share picture`);
  if (['parts', 'sharename', 'shaded'].includes(t.f)) { assert.equal(figs[0].parts, t.parts, `${where}: picture parts`); assert.ok(figs[0].equal, `${where}: shares must be equal here`); }
  if (t.f === 'shaded') assert.equal((p.visual.match(/class="on"/g) || []).length, t.k, `${where}: shaded parts`);
  if (t.f === 'bigger') assert.deepEqual(figs.map(f => f.parts), [t.a, t.c].map(n => ({ halves: 2, thirds: 3, quarters: 4 })[n]), `${where}: the two pictures must match the two names`);
}
function checkChart(p, t, where) {
  const got = readChart(p.visual);
  assert.deepEqual(t.names.map(n => got[n]), t.vals, `${where}: the graph shows ${JSON.stringify(got)} but the generator holds ${JSON.stringify(t.vals)}`);
}
function checkArray(p, t, where) {
  const g = dotGrid(p.visual);
  if (t.f === 'mul') { assert.equal(g.rows, t.a, `${where}: rows drawn`); assert.equal(g.cols, t.b, `${where}: columns drawn`); assert.equal(g.dots, (g.rows - g.hidden) * g.cols, `${where}: dots drawn`); }
  if (t.f === 'arrcount') { assert.equal(g.rows, t.r, `${where}: rows drawn`); assert.equal(g.cols, t.c, `${where}: columns drawn`); }
}
function checkRuler(p, t, where) {
  const bars = rulerBars(p.visual);
  if (t.f === 'len') assert.deepEqual(bars, [{ from: t.from, to: t.to }], `${where}: the bar on the ruler`);
  if (t.f === 'sub') {
    assert.equal(bars.length, 2, `${where}: two bars`);
    const [x, y] = strip(p.ask).match(/bar ([AB]) than bar ([AB])/).slice(1), len = l => bars['AB'.indexOf(l)].to;
    assert.deepEqual([len(x), len(y)], [t.a, t.b], `${where}: bar ${x} must be ${t.a} and bar ${y} must be ${t.b}`);
  }
}
// The picture a story shows may only carry numbers the story also gives, with exactly one question mark.
function checkStoryBars(p, where) {
  const labels = [...p.visual.matchAll(/>([^<>]+)<\/text>/g)].map(m => m[1]).filter(s => /^[\d?]+$/.test(s)), told = numsIn([p.story, p.ask].join(' '));
  assert.equal(labels.filter(s => s === '?').length, 1, `${where}: the bar picture must hide exactly one number`);
  for (const s of labels.filter(s => s !== '?')) assert.ok(told.includes(+s), `${where}: the picture shows ${s}, which the story does not give`);
}

// Every opened tag is closed in order (so the picture can be drawn at all).
export function wellFormed(html, where) {
  const stack = [];
  for (const [, close, tag, self] of html.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)[^>]*?(\/?)>/g)) {
    if (self) continue;
    if (close) assert.equal(stack.pop(), tag, `${where}: </${tag}> does not match the tag that was opened`); else stack.push(tag);
  }
  assert.equal(stack.length, 0, `${where}: not closed: ${stack.join(', ')}`);
}

export function checkVisual(p, where) {
  for (const w of p.ways || []) for (const step of w.s) if (step.includes('<svg') || step.includes('<div')) wellFormed(step, `${where} (way ${w.t})`);
  if (!p.visual) return;
  wellFormed(p.visual, where);
  const t = p._t, v = p.visual;
  if (p.story) return checkStoryBars(p, where);
  if (/data-shape=/.test(v) && (t.f === 'name' || t.f === 'shapefact')) checkShape(p, t, where);
  if (/data-kind=/.test(v)) checkShares(p, t, where);
  if (/class="(bar|mk)"/.test(v)) checkChart(p, t, where);
  if (/class="dot" cx=/.test(v) && ['mul', 'arrcount'].includes(t.f)) checkArray(p, t, where);
  if (/data-unit=/.test(v)) checkRuler(p, t, where);
  if (/class="dot" cx=/.test(v) && ['parity', 'rem'].includes(t.f)) assert.equal(dotGrid(v).dots, t.xs ? t.xs[0] : t.a, `${where}: counters drawn`);
}
