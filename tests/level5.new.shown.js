// What each new Level 5 kind must SHOW the child, and the checks that read a picture (see level5.shown.js for the rules).
import assert from 'node:assert/strict';
import { plain, numbers, svgTexts, svgRects, planePoints } from './level5.render.js';
import { doubleRead, gridRead, lineValue, dotsOn } from './level5.new.read.js';

const L = (...xs) => xs;
const fmt0 = v => String(v).replace('-', '−');
export const SHOWN_NEW = {
  ldQuot: t => L(t.n, t.d), ldRem: t => L(t.n, t.d), ldDown: t => L(t.n, t.d), ldUp: t => L(t.n, t.d), ldFirst: t => L(t.n, t.d), ldEstimate: t => L(t.n, t.d), ldZero: t => L(t.n, t.d),
  ucTable: t => L(t.f, t.x), ucDouble: t => (t.toSmall ? L(t.f, 3) : L(t.f, 3 * t.f)), ucMul: t => L(t.n), ucDiv: t => L(t.n), ucWhich: t => L(t.n, t.f), ucSpeed: t => L(t.r), ucPrice: t => L(t.p, t.n), ucChain: t => L(t.n),
  ucBest: t => L(t.n1, t.p1, t.n2, t.p2),
  rgTap: t => L(t.a, t.b, t.byY ? t.j * t.b : t.j * t.a), rgRead: t => L(t.v), rgReadX: t => L(t.v), rgPairs: () => L(), rgUnit: t => L(t.x, t.y), rgBatch: t => L(t.a, t.b, t.j * t.a, t.j * t.b),
  wpOutOf: t => L(t.part, t.whole), wpBar: () => L(), wpTwo: t => L(t.a, t.b), wpPick: t => L(t.part, t.whole), wpOver: t => L(t.part, t.whole), wpUnder: t => L(t.part, t.whole), wpCompare: t => L(t.a1, t.w1, t.a2, t.w2),
  rnReadDec: () => L(), rnReadFrac: () => L(), rnPlace: t => L(t.asFrac ? Math.abs(t.v) : t.v), rnToZero: t => [[fmt0(t.v), '−$' + (-t.v).toFixed(2)]], rnZero: t => [[fmt0(t.v), '−$' + (-t.v).toFixed(2)]],
  rnOpp: t => L(t.v), rnOppFrac: t => L(Math.abs(t.v)), rnOpp3: t => L(t.x), rnCompare: t => t.xs.map((v, i) => (t.fr[i] ? Math.abs(v) : v)), rnBetween: t => L(t.lo, t.hi),
  rnOrder: t => [...t.xs.map((v, i) => (t.fr[i] ? Math.abs(v) : v)), 'least to greatest'], rnCmpStory: t => L(...t.xs),
  ppSide: t => t.vs.flat(), ppTri: t => t.vs.flat(), ppPerim: t => t.vs.flat(), ppArea: t => t.vs.flat(), ppMissing: t => t.vs.flat(), ppTap: t => t.vs.flat(), ppScale: t => [...t.vs.flat(), t.s],
  ppFindY: t => L(t.x1, t.y1, t.x2, t.area),
  rgCompare: () => L(), rgRule: t => L(t.x, t.y),
};
const onLine = (p, a, b) => Math.abs(p.y * a - p.x * b) < 1e-6;
const slope = seg => seg[1].y / seg[1].x;
const near = (x, y, msg) => assert.ok(Math.abs(x - y) < 1e-6, `${msg}: ${x} vs ${y}`);
const drawn = (p, t, n = t.vs.length) => { const got = planePoints(p.visual); assert.deepEqual(got.map(q => [q.x, q.y]), t.vs.slice(0, n), 'corners drawn'); assert.deepEqual(got.map(q => q.name), [...'ABCDEF'].slice(0, n), 'corners labelled'); };
export const CUSTOM_NEW = {
  ppSide: drawn, ppTri: drawn, ppPerim: drawn, ppArea: drawn, ppMissing: drawn, ppScale: drawn,
  ppTap: (p, t) => { const g = gridRead(p.visual); assert.deepEqual(g.pts.map(q => [q.x, q.y]), t.vs, 'given corners drawn'); },
  ppFindY: (p, t) => assert.deepEqual(planePoints(p.visual).map(q => [q.x, q.y]), [[t.x1, t.y1], [t.x2, t.y1]], 'base drawn'),
  rnReadDec: (p, t) => { const dots = dotsOn(p.visual); assert.equal(dots.length, 1, 'one dot'); near(lineValue(p.visual)(dots[0].cx), p.answer.value, 'value read from the picture'); },
  rnReadFrac: (p, t) => { const dots = dotsOn(p.visual); assert.equal(dots.length, 1, 'one dot'); near(lineValue(p.visual)(dots[0].cx), t.v, 'dot position'); },
  rnPlace: (p, t) => {
    const at = lineValue(p.visual), dots = dotsOn(p.visual), labels = svgTexts(p.visual).filter(x => /^[A-D]$/.test(x.s));
    assert.equal(labels.length, 4, 'four labelled points');
    for (const l of labels) { assert.ok(dots.some(d => Math.abs(d.cx - l.x) < 1e-6), 'label sits over its dot'); near(at(l.x), t.pts[l.s], `point ${l.s}`); }
    near(at(labels.find(l => l.s === p.answer.options[p.answer.correct]).x), t.v, 'the answer point is at the asked number');
  },
  rnOpp3: (p, t) => {
    const m = plain(p.expr).match(/^((?:−\()+)(.+?)\)+$/); assert.ok(m, 'shape of the expression'); const c = m[1].length / 2, x = Number(m[2].replace('−', '-'));
    near(x * (c % 2 ? -1 : 1), p.answer.value, 'the displayed expression');
  },
  wpBar: (p, t) => { const rs = svgRects(p.visual); assert.equal(rs.length, t.parts, 'pieces drawn'); near(100 * rs.filter(r => r.cls === 'on').length / rs.length, p.answer.value, 'percent shaded in the picture'); },
  rgTap: (p, t) => {
    const { pts } = gridRead(p.visual); assert.deepEqual(pts.map(q => [q.x, q.y]), [[t.a, t.b], [2 * t.a, 2 * t.b]], 'given points drawn');
    assert.ok(onLine(p.answer, t.a, t.b), 'the answer is on the line of the table'); assert.ok(p.answer.x <= 10 && p.answer.y <= 10, 'on the grid');
  },
  rgRead: (p, t) => { const g = gridRead(p.visual); assert.ok(g.pts.every(q => onLine(q, t.a, t.b)), 'dots on the line'); near(t.v * slope(g.segs[0]), p.answer.value, 'y read from the drawn line'); },
  rgReadX: (p, t) => { const g = gridRead(p.visual); assert.ok(g.pts.every(q => onLine(q, t.a, t.b)), 'dots on the line'); near(t.v / slope(g.segs[0]), p.answer.value, 'x read from the drawn line'); },
  rgPairs: (p, t) => { const g = gridRead(p.visual); assert.ok(onLine(g.segs[0][1], t.a, t.b), 'the drawn line has the ratio'); assert.ok(g.pts.every(q => onLine(q, t.a, t.b)), 'dot on the line'); },
  rgUnit: (p, t) => { const g = gridRead(p.visual); assert.deepEqual(g.pts.map(q => [q.x, q.y]), [[t.x, t.y]], 'dot drawn'); near(slope(g.segs[0]), p.answer.value, 'unit rate from the drawn line'); },
  rgRule: (p, t) => { const g = gridRead(p.visual); assert.deepEqual(g.pts.map(q => [q.x, q.y]), [[t.x, t.y]], 'dot drawn'); near(slope(g.segs[0]), t.y / t.x, 'line goes through the dot'); },
  rgBatch: (p, t) => { const g = gridRead(p.visual); assert.deepEqual(g.pts.map(q => [q.x, q.y]), [[t.a, t.b], [t.j * t.a, t.j * t.b]], 'both dots drawn'); },
  rgCompare: (p, t) => {
    const g = gridRead(p.visual), labels = svgTexts(p.visual).filter(x => x.cls === 'ptl').map(x => x.s), steeper = labels[slope(g.segs[0]) > slope(g.segs[1]) ? 0 : 1];
    assert.deepEqual(labels, ['A', 'B'], 'lines labelled'); assert.equal(p.answer.options[p.answer.correct], steeper, 'the steeper line is the answer');
    near(slope(g.segs[0]), t.b1 / t.a1, 'line A'); near(slope(g.segs[1]), t.b2 / t.a2, 'line B');
  },
  ucDouble: (p, t) => {
    const { top, bottom } = doubleRead(p.visual); assert.equal(top.length, 4, 'four ticks on the top line'); assert.equal(bottom.length, 4, 'four ticks on the bottom line');
    top.forEach((x, i) => { if (x !== '?' && bottom[i] !== '?') assert.equal(Number(bottom[i].replace(/,/g, '')), Number(x) * t.f, `tick ${i} on the two lines`); });
    const q = top.indexOf('?') >= 0 ? top.indexOf('?') : bottom.indexOf('?'); assert.equal(q, 3, 'the question mark is on the last tick');
  },
};
