// Independent recomputation for the shape skills: pictures are read back (corners of every triangle), then the answer is worked out again.
import assert from 'node:assert/strict';
import { text, ans } from './level7.text.js';
import { decode, close } from './level7.svg.js';
import { mustShow } from './level7.lines.js';

const near = (x, y, msg) => assert.ok(Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y)) + 1e-9, `${msg || ''} got ${x}, expected ${y}`);
const opts = p => p.answer.options.map(text);
// The moves, written the way a child reads them. Each returns the new point. 0 - y keeps -0 out.
const MOVES = [[/^reflect across the x-axis$/i, () => ([x, y]) => [x, 0 - y]], [/^reflect across the y-axis$/i, () => ([x, y]) => [0 - x, y]], [/^rotate 90° counter-clockwise about the origin$/i, () => ([x, y]) => [0 - y, x]],
  [/^rotate 180° about the origin$/i, () => ([x, y]) => [0 - x, 0 - y]], [/^rotate 90° clockwise about the origin$/i, () => ([x, y]) => [y, 0 - x]],
  [/^slide (?:(\d+) (right|left))?(?: and )?(?:(\d+) (up|down))?$/i, m => ([x, y]) => [x + (m[1] ? (m[2] === 'right' ? 1 : -1) * Number(m[1]) : 0), y + (m[3] ? (m[4] === 'up' ? 1 : -1) * Number(m[3]) : 0)]]];
export function parseMove(s) { for (const [re, f] of MOVES) { const m = re.exec(s.trim()); if (m) return f(m); } return assert.fail(`not a move: ${s}`); }
export const parseSeq = s => s.split(', then ').map(parseMove);
const runSeq = (fs, p) => fs.reduce((q, f) => f(q), p);
const eqPts = (a, c) => a.length === c.length && a.every((p, i) => close(p[0], c[i][0], 0.05) && close(p[1], c[i][1], 0.05));
const sides = poly => poly.map((p, i) => Math.hypot(p[0] - poly[(i + 1) % poly.length][0], p[1] - poly[(i + 1) % poly.length][1])).sort((a, c) => a - c);
const congruent = (a, c) => sides(a).every((v, i) => close(v, sides(c)[i], 0.05));
// Corners of the triangles drawn with side labels, in pixels (the ratio of sides is all that matters).
export const rawTriangles = html => (String(html).match(/<polygon points="[^"]*" class="body"\/>/g) || []).map(t => /points="([^"]*)"/.exec(t)[1].split(' ').map(q => q.split(',').map(Number)));

const NAME = { rx: 'Reflect across the x-axis', ry: 'Reflect across the y-axis', r90: 'Rotate 90° counter-clockwise about the origin', r180: 'Rotate 180° about the origin', r270: 'Rotate 90° clockwise about the origin' };
const slideText = st => `Slide ${[st.dx ? `${Math.abs(st.dx)} ${st.dx > 0 ? 'right' : 'left'}` : '', st.dy ? `${Math.abs(st.dy)} ${st.dy > 0 ? 'up' : 'down'}` : ''].filter(Boolean).join(' and ')}`;
const stepMove = st => parseMove(st.type === 'tr' ? slideText(st) : NAME[st.type]);

const GEO_BASE = {
  cong(t, p) {
    if (t.shape.endsWith('-stays') || t.shape === 'stays-measure') { mustShow(p, [t.v]); return near(ans(p), t.v); }
    if (t.shape === 'stays-true') return assert.equal(ans(p), 'Every side keeps its length and every angle keeps its size');
    if (t.shape === 'order') {
      const [f, s] = t.steps.map(stepMove), a = t.tri.map(q => s(f(q))), c = t.tri.map(q => f(s(q)));
      return assert.equal(ans(p), eqPts(a, c) ? 'Yes' : 'No');
    }
    const [tri, img] = decode(p.visual).polys;
    assert.ok(tri && img && tri.length === 3, 'two triangles are drawn');
    switch (t.shape) {
      case 'congruent-yn': return assert.equal(ans(p), congruent(tri, img) ? 'Yes' : 'No');
      case 'seq-pick': {
        const hit = opts(p).map(parseSeq).map(fs => eqPts(tri.map(q => runSeq(fs, q)), img));
        assert.equal(hit.filter(Boolean).length, 1, 'exactly one sequence takes ABC onto A′B′C′'); return assert.equal(hit.indexOf(true), p.answer.correct);
      }
      case 'slide-amount': {
        const mid = tri.map(q => stepMove(t.first)(q)), d = [img[0][0] - mid[0][0], img[0][1] - mid[0][1]];
        assert.ok(eqPts(mid.map(q => [q[0] + d[0], q[1] + d[1]]), img), 'the second move is a slide'); assert.ok(close(d[0], 0, 0.05) || close(d[1], 0, 0.05));
        return near(ans(p), Math.round(Math.abs(d[0]) + Math.abs(d[1])));
      }
      case 'one-move': {
        const d = [img[0][0] - tri[0][0], img[0][1] - tri[0][1]], slide = eqPts(tri.map(q => [q[0] + d[0], q[1] + d[1]]), img);
        const any = Object.values(NAME).some(n => eqPts(tri.map(q => parseMove(n)(q)), img));
        return assert.equal(ans(p), slide || any ? 'Yes' : 'No');
      }
      default: assert.fail(`unknown cong shape ${t.shape}`);
    }
  },
};

// Side lengths of the two drawn triangles, shortest first, scaled so the longest side is 1.
const shapeOf = poly => { const sd = sides(poly); return sd.map(v => v / sd[2]); };
// The labels printed on the triangles (the "Not drawn to scale" note is not one of them).
const labelsOf = html => [...String(html).matchAll(/class="lbl">([^<]*)<\/text>/g)].map(m => m[1]).filter(x => x !== 'Not drawn to scale');
const KINDS = { 'Congruent': 0, 'Similar but not congruent': 1, 'Neither': 2 };
function checkPicture(t, p) {
  const [left, right] = rawTriangles(p.visual), want = [t.s1, t.s2];
  assert.ok(left && right, 'two triangles are drawn');
  [left, right].forEach((poly, i) => shapeOf(poly).forEach((v, j) => assert.ok(close(v, want[i].slice().sort((u, w) => u - w)[j] / Math.max(...want[i]), 0.03), `triangle ${i + 1} is not drawn with its sides`)));
  const shown = want.map((sd, i) => sd.slice().sort((u, w) => u - w).map((v, j) => (t.hide === j && (i === 1) === t.inBig ? '?' : String(v))));
  assert.deepEqual(labelsOf(p.visual).sort(), shown.flat().sort(), 'the labels on the triangles are the sides in the question');
}
export const SIM = {
  sim(t, p) {
    const ratio = (a, c) => a / c, a = ans(p);
    switch (t.shape) {
      case 'scale-factor': case 'scale-frac': case 'scale-down': {
        checkPicture(t, p); const k = t.s2.map((v, i) => ratio(v, t.s1[i])); assert.ok(k.every(v => close(v, k[0], 1e-9)), 'the triangles are not similar');
        return near(a, t.dir === 'down' ? 1 / k[0] : k[0]);
      }
      case 'missing-side': {
        checkPicture(t, p); const known = t.known, k = t.s2[known] / t.s1[known]; assert.ok(known !== t.hide);
        return near(a, t.inBig ? t.s1[t.hide] * k : t.s2[t.hide] / k);
      }
      case 'sim-yn': { checkPicture(t, p); const k = t.s2[0] / t.s1[0]; return assert.equal(a, t.s2.every((v, i) => close(v, t.s1[i] * k, 1e-9)) ? 'Yes' : 'No'); }
      case 'dilate-coord': { mustShow(p, [...t.p, t.factor]); return near(a, t.factor * (t.axis === 'x' ? t.p[0] : t.p[1])); }
      case 'aa-yn': {
        const set = ([x, y]) => [x, y, 180 - x - y].sort((u, w) => u - w).join(); mustShow(p, [...t.t1, ...t.t2]);
        return assert.equal(a, set(t.t1) === set(t.t2) ? 'Yes' : 'No');
      }
      case 'shadow': mustShow(p, [t.p, t.s, t.S]); return near(a, t.p * t.S / t.s);
      case 'dilate-slide': { mustShow(p, [...t.p, t.factor, ...t.slide]); const i = t.axis === 'x' ? 0 : 1; return near(a, t.factor * t.p[i] + t.slide[i]); }
      case 'perimeter': mustShow(p, [...t.s1, t.match]); return near(a, (t.s1[0] + t.s1[1] + t.s1[2]) * t.match / t.s1[0]);
      case 'sim-seq': {
        const say = text(p.ask), ks = [...say.matchAll(/scale factor (\d+)/g)].map(m => Number(m[1])), stretch = /\((\d)x, (\d)y\)/.exec(say);
        const want = stretch && stretch[1] !== stretch[2] ? 'Neither' : ks.some(k => k !== 1) ? 'Similar but not congruent' : 'Congruent';
        assert.ok(a in KINDS); return assert.equal(a, want);
      }
      default: assert.fail(`unknown sim shape ${t.shape}`);
    }
  },
};

const roundTo = (v, p) => Math.round(v * 10 ** p) / 10 ** p;
const places = q => (/nearest whole number/.test(q) ? 0 : /nearest tenth/.test(q) ? 1 : assert.fail('the question does not say how to round'));
const boxLabels = html => [...String(html).matchAll(/class="lbl">([^<]*)<\/text>/g)].map(m => m[1]).filter(x => x !== 'Not drawn to scale').map(x => Number(x.replace(/\D/g, '')));
export const PYTH = {
  pythreal(t, p) {
    const a = ans(p), say = text(p.ask), hyp = (x, y) => Math.hypot(x, y);
    switch (t.shape) {
      case 'rect-diag': mustShow(p, [t.a, t.c]); return near(a, hyp(t.a, t.c));
      case 'ladder': mustShow(p, [t.a, t.h]); return near(a, Math.sqrt(t.h ** 2 - t.a ** 2));
      case 'corner-check': case 'conv-yn': {
        const [x, y, z] = t.sides.slice().sort((u, w) => u - w); mustShow(p, t.sides);
        return assert.equal(a, x * x + y * y === z * z ? 'Yes' : 'No');
      }
      case 'which-hyp': mustShow(p, t.sides); return assert.equal(Number(a), Math.max(...t.sides));
      case 'diag-round': return (mustShow(p, [t.a, t.c]), near(a, roundTo(hyp(t.a, t.c), places(say))), assert.equal(places(say), t.places));
      case 'leg-round': return (mustShow(p, [t.a, t.c]), near(a, roundTo(Math.sqrt(t.c ** 2 - t.a ** 2), places(say))), assert.equal(places(say), t.places));
      case 'fit-yn': mustShow(p, [t.a, t.c, t.stick]); return assert.equal(a, t.stick < hyp(t.a, t.c) ? 'Yes' : 'No');
      case 'box-3d': case 'box-floor': {
        assert.deepEqual(boxLabels(p.visual).sort(), t.dims.slice().sort(), 'the labels on the box are its sides'); mustShow(p, t.dims);
        return t.shape === 'box-3d' ? near(a, Math.sqrt(t.dims.reduce((s, v) => s + v * v, 0))) : near(a, roundTo(hyp(t.dims[0], t.dims[1]), 1));
      }
      case 'box-fit': mustShow(p, [...t.dims, t.stick]); return assert.equal(a, t.stick < Math.sqrt(t.dims.reduce((s, v) => s + v * v, 0)) ? 'Yes' : 'No');
      case 'rect-hidden': mustShow(p, [t.a, t.h]); return near(a, t.a * Math.sqrt(t.h ** 2 - t.a ** 2));
      case 'sq-diag': mustShow(p, [t.s]); return near(a, roundTo(t.s * Math.SQRT2, 1));
      default: assert.fail(`unknown pythreal shape ${t.shape}`);
    }
  },
};
export const GEO = { ...GEO_BASE, ...SIM, ...PYTH };
