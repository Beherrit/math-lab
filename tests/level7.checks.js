// Independent recomputation of level 7 answers from the raw operands each problem exposes under "_t".
// Nothing here imports the level 7 generators: every answer is worked out again in a different way.
import assert from 'node:assert/strict';

import { text, ans } from './level7.text.js';
import { FACTS } from './level7.facts.js';
import { LINES } from './level7.lines.js';
import { GRAPHS } from './level7.graphs.js';
import { SYSTEMS } from './level7.systems.js';
import { GEO } from './level7.geo.js';
import { IRR, TWOWAY, FITL, EQF, SCIU } from './level7.nums.js';
import { eqText } from './level7.eq.js';
export { text, ans };
const near = (x, y, msg) => assert.ok(Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y)), `${msg || ''} got ${x}, expected ${y}`);
const same = (x, y, msg) => assert.deepEqual(x, y, msg);
const sciParts = v => { const [c, e] = v.toExponential(10).split('e'); return [Number(c), Number(e)]; };
const sciText = s => { const m = /^(-?[\d.]+) × 10\^(-?\d+)$/.exec(s); assert.ok(m, `not scientific notation: ${s}`); return [Number(m[1]), Number(m[2])]; };
const expand = side => side.reduce(([A, B], [k, a, c]) => [A + k * a, B + k * c], [0, 0]);
const solve2 = ([a1, b1, c1], [a2, b2, c2]) => { const det = a1 * b2 - a2 * b1; return det === 0 ? null : [(c1 * b2 - c2 * b1) / det, (a1 * c2 - a2 * c1) / det]; };
const slopeOf = (p, q) => (q[1] - p[1]) / (q[0] - p[0]);
function corr(pts) {
  const n = pts.length, sx = pts.reduce((s, p) => s + p[0], 0), sy = pts.reduce((s, p) => s + p[1], 0);
  const sxy = pts.reduce((s, p) => s + p[0] * p[1], 0), sxx = pts.reduce((s, p) => s + p[0] * p[0], 0), syy = pts.reduce((s, p) => s + p[1] * p[1], 0);
  return (n * sxy - sx * sy) / Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy));
}
// Transformations as complex-number arithmetic: (re, im) = (x, y).
const MOVE = { tr: ([x, y], s) => [x + s.dx, y + s.dy], rx: ([x, y]) => [x, 0 - y], ry: ([x, y]) => [0 - x, y], r90: ([x, y]) => [0 * x - 1 * y, 1 * x + 0 * y], r270: ([x, y]) => [0 * x + 1 * y, 0 * y - 1 * x], r180: ([x, y]) => [-1 * x, -1 * y], dil: ([x, y], s) => [s.k * x, s.k * y] };
const clean = p => p.map(v => v + 0);
const eqPts = (a, b) => a.every((p, i) => p[0] === b[i][0] && p[1] === b[i][1]);
function families(tri, img) {
  const out = [], d0 = [img[0][0] - tri[0][0], img[0][1] - tri[0][1]];
  if (tri.every((p, i) => img[i][0] - p[0] === d0[0] && img[i][1] - p[1] === d0[1])) out.push('A translation');
  if (['rx', 'ry'].some(k => eqPts(tri.map(p => clean(MOVE[k](p))), img))) out.push('A reflection');
  if (['r90', 'r270', 'r180'].some(k => eqPts(tri.map(p => clean(MOVE[k](p))), img))) out.push('A rotation');
  const k = img[0][0] / tri[0][0];
  if (k !== 1 && k > 0 && tri.every((p, i) => img[i][0] === k * p[0] && img[i][1] === k * p[1])) out.push('A dilation');
  return out;
}
const RULE = { rx: '(x, y) → (x, -y)', ry: '(x, y) → (-x, y)', r90: '(x, y) → (-y, x)', r270: '(x, y) → (y, -x)', r180: '(x, y) → (-x, -y)' };
const NARROW = new Set([2, 3, 6, 7]);
const REL = [['vertical angles', '1-4 2-3 5-8 6-7'], ['corresponding angles', '1-5 2-6 3-7 4-8'], ['alternate interior angles', '3-6 4-5'], ['alternate exterior angles', '1-8 2-7'], ['same-side interior angles', '3-5 4-6']];
const COEF = { cyl: (r, h) => r * r * h, cone: (r, h) => r * r * h / 3, sphere: r => 4 * r * r * r / 3 };
const pow2 = e => 2n ** BigInt(e);
const EXP = { prod: t => pow2(t.m) * pow2(t.n), quot: t => pow2(t.m) / pow2(t.n), pow: t => pow2(t.m) ** BigInt(t.n), pp: t => pow2(t.m) * pow2(t.n) / pow2(t.p), pw: t => pow2(t.m) ** BigInt(t.n) * pow2(t.p), pq: t => pow2(t.m) ** BigInt(t.n) / pow2(t.p) };
const ZN = { prod: (m, n) => 2 ** m * 2 ** n, quot: (m, n) => 2 ** m / 2 ** n, pow: (m, n) => (2 ** m) ** n };
const kindOf = (L, R) => { const [A, B] = expand(L), [C, D] = expand(R); return A !== C ? 'One solution' : B === D ? 'Infinitely many solutions' : 'No solution'; };

// The exponent a child gets by using the wrong law (add for multiply, multiply for add, divide for subtract).
const WRONG_LAW = { prod: t => t.m * t.n, pow: t => t.m + t.n, quot: t => t.m / t.n, pp: t => t.m * t.n - t.p, pw: t => t.m + t.n + t.p, pq: t => t.m + t.n - t.p };
export const CHECKS = {
  ...FACTS,
  ...LINES,
  ...GRAPHS,
  ...SYSTEMS,
  ...GEO,
  ...IRR,
  ...TWOWAY,
  ...FITL,
  ...EQF,
  ...SCIU,
  exp(t, p, L) {
    const v = EXP[t.op](t), e = v.toString(2).length - 1;
    assert.notEqual(WRONG_LAW[t.op](t), e, `the wrong law gives the same exponent ${e}: ${text(p.expr)}`);
    assert.equal(v, pow2(e)); assert.ok(e >= 1 && e <= (L === 1 ? 8 : 36), `exponent ${e} out of range`);
    if (t.miss) return same(ans(p), t.m);
    if (p.answer.kind === 'choice') return same(Number(/\^(\d+)$/.exec(ans(p))[1]), e);
    same(ans(p), e);
  },
  expslip(t, p) {
    const e = EXP[t.op](t).toString(2).length - 1;
    assert.notEqual(t.shown, e);
    assert.match(ans(p), { prod: /added, not multiplied/, pow: /multiplied, not added/, quot: /subtracted, not divided/ }[t.op]);
  },
  znval(t, p) {
    const v = Math.pow(t.a, t.e); assert.ok(t.e <= 0 && 1 / v <= 1000);
    if (t.pick) { const [n, d] = ans(p).split('/').map(Number); return near(n / d, v); }
    near(ans(p), v);
  },
  znexp(t, p) { near(ans(p), Math.log2(ZN[t.op](t.m, t.n))); assert.equal(p.answer.signed, true); },
  znquot(t, p) { near(ans(p), t.a ** t.m / t.a ** t.n); },
  sci(t, p, L) {
    const v = Number(`${t.d}e${t.e - t.p}`), c = Number(`${t.d}e${-t.p}`);
    assert.ok(c >= 1 && c < 10, 'front number must be from 1 up to 10'); if (L === 1) assert.ok(t.e >= 2 && t.e <= 6);
    if (t.ask === 'std') return near(ans(p), v);
    if (t.ask === 'exp') return same(ans(p), t.e);
    if (t.ask === 'coef') return near(ans(p), c);
    if (t.ask === 'pick') return near(Number(ans(p)), v);
    const [fc, fe] = sciText(ans(p)); assert.ok(fc >= 1 && fc < 10); near(fc * 10 ** fe, v);
  },
  scicmp(t, p) {
    const vals = t.items.map(([d, q, e]) => Number(`${d}e${e - q}`)), best = t.want === 'max' ? Math.max(...vals) : Math.min(...vals);
    assert.equal(vals.filter(v => v === best).length, 1); same(p.answer.correct, vals.indexOf(best));
  },
  sciop(t, p) {
    const x = Number(`${t.a}e${t.m}`), y = Number(`${t.c}e${t.n}`), [c, e] = sciParts(t.op === 'mul' ? x * y : x / y);
    assert.ok(t.a >= 1 && t.a < 10 && t.c >= 1 && t.c < 10);
    if (t.ask === 'exp') return same(ans(p), e);
    if (t.ask === 'coef') return near(ans(p), c);
    const [fc, fe] = sciText(ans(p)); near(fc, c); same(fe, e);
  },
  root(t, p, L) {
    const r = t.deg === 2 ? Math.sqrt(t.N) : Math.cbrt(t.N), a = ans(p);
    if (L === 1) assert.ok(t.deg === 2 && t.N <= 144);
    if (t.ask === 'exact') return near(a ** t.deg, t.N);
    if (t.ask === 'nearest') return assert.ok(Number.isInteger(a) && Math.abs(a - r) < 0.5, `${a} is not nearest to root of ${t.N}`);
    if (t.ask === 'between') { const [lo, hi] = a.split(' and ').map(Number); return assert.ok(hi === lo + 1 && lo < r && r < hi, `${a} does not trap root of ${t.N}`); }
    if (t.ask === 'cmp') return same(a, r > t.with ? `√${t.N}` : String(t.with));
    const [x, y] = a.split(' and ').map(Number); assert.ok(x * x === t.N && y === -x);
  },
  rootfrac(t, p) { near(ans(p) ** 2, t.a / t.c); },
  rootperim(t, p) { near(ans(p), 4 * Math.sqrt(t.N)); },
  ratl(t, p) {
    const rational = 'sqrt' in t ? Number.isInteger(Math.sqrt(t.sqrt)) : t.is, a = ans(p);
    if (a === 'Rational' || a === 'Irrational') return same(a, rational ? 'Rational' : 'Irrational');
    assert.equal(rational, false, 'the odd one out must be irrational');
  },
  rep(t, p) { near(ans(p), Number(`${t.w}.${t.pre}${t.rep.repeat(30)}`)); },
  lineq(t, p, L) {
    const [A, B] = expand(t.L), [C, D] = expand(t.R), x = (D - B) / (A - C);
    near(ans(p), x); if (L === 1 && p.skill === 'l7eqboth') assert.ok(Number.isInteger(x) && x >= 1 && x <= 9);
  },
  eqcount(t, p) { same(ans(p), kindOf(t.L, t.R)); },
  eqmiss(t, p) {
    const fill = side => side.map(g => g.map(v => (v === null ? ans(p) : v)));
    same(kindOf(fill(t.L), fill(t.R)), t.want === 'none' ? 'No solution' : 'Infinitely many solutions');
  },
  slope(t, p, L) {
    const m = slopeOf(t.p, t.q); near(ans(p), m);
    if (t.rows) for (const r of t.rows.slice(1)) near(slopeOf(t.rows[0], r), m, 'table rows are not on one line');
    if (L === 1 && p.skill === 'l7slope') assert.ok(Number.isInteger(m) && m >= 1 && m <= 8);
  },
  slopemiss(t, p) { near(slopeOf(t.p, [t.x2, ans(p)]), t.n / t.d); },
  line(t, p) {
    const m = 'n' in t ? t.n / t.d : t.m, a = ans(p);
    if (t.ask === 'm') return same(a, m);
    if (t.ask === 'b') return same(a, t.c);
    if (t.ask === 'y') return same(a, m * t.x + t.c);
    if (t.ask === 'pt') return same(a, [t.x, m * t.x + t.c]);
    if (t.ask === 'on') return same(a, t.y === m * t.x + t.c ? 'Yes' : 'No');
    if (t.ask === 'x') return near(m * a + t.c, t.y);
    const [em, ec] = eqText(a); near(em, m); same(ec, t.c);
  },
  line2(t, p) { const [m, c] = eqText(ans(p)); near(m * t.p[0] + c, t.p[1]); near(m * t.q[0] + c, t.q[1]); },
  isfunc(t, p) {
    const seen = new Map(); let ok = true;
    for (const [x, y] of t.pairs) { if (seen.has(x) && seen.get(x) !== y) ok = false; seen.set(x, y); }
    same(ans(p), ok ? 'Yes' : 'No');
  },
  frule(t, p) { same(ans(p), [t.m * t.x + t.c, t.m * (t.x + t.c), t.m * t.x - t.c][t.i]); },
  feval(t, p) { same(ans(p), t.m * t.x + t.c); },
  ftable(t, p) { near(ans(p), t.ys[0] + slopeOf([t.xs[0], t.ys[0]], [t.xs[1], t.ys[1]]) * (t.xs[t.i] - t.xs[0])); },
  flin(t, p) {
    const d = t.ys.slice(1).map((y, i) => (y - t.ys[i]) / (t.xs[i + 1] - t.xs[i]));
    same(ans(p), d.every(v => v === d[0]) ? 'Linear' : 'Not linear');
  },
  frate(t, p) {
    const m = slopeOf([t.xs[0], t.ys[0]], [t.xs[3], t.ys[3]]);
    near(ans(p), t.ask === 'rate' ? m : t.ys[1] - m * t.xs[1]);
  },
  fcmp(t, p) { const mB = slopeOf([t.xs[0], t.ys[0]], [t.xs[2], t.ys[2]]); same(ans(p), t.mA > mB ? 'Function A' : mB > t.mA ? 'Function B' : 'They are the same'); },
  sys(t, p) {
    const s = solve2(t.e1, t.e2), a = ans(p); assert.ok(s, 'system has no single solution');
    if (t.ask === 'x') return near(a, s[0]);
    if (t.ask === 'y') return near(a, s[1]);
    if (t.ask === 'pt') return same(a, clean(s));
    same(a, t.cand[0] === s[0] && t.cand[1] === s[1] ? 'Yes' : 'No');
  },
  syscount(t, p) {
    const [a1, b1, c1] = t.e1, [a2, b2, c2] = t.e2, det = a1 * b2 - a2 * b1;
    same(ans(p), det !== 0 ? 'One solution' : a1 * c2 === a2 * c1 && b1 * c2 === b2 * c1 ? 'Infinitely many solutions' : 'No solution');
  },
  pyth(t, p) {
    const a = ans(p);
    if (t.find === 'hyp') return near(a, Math.hypot(t.a, t.c));
    if (t.find === 'sqsum') return same(a, t.a ** 2 + t.c ** 2);
    if (t.find === 'leg') return near(a, Math.sqrt(t.h ** 2 - t.a ** 2));
    if (t.find === 'check') return same(a, t.a ** 2 + t.c ** 2 === t.h ** 2 ? 'Yes' : 'No');
    if (t.find === 'dist') return near(a, Math.hypot(t.q[0] - t.p[0], t.q[1] - t.p[1]));
    const [lo, hi] = a.split(' and ').map(Number), h = Math.hypot(t.a, t.c); assert.ok(hi === lo + 1 && lo < h && h < hi);
  },
  tr(t, p) {
    const end = clean(t.steps.reduce((pt, s) => MOVE[s.type](pt, s), t.p));
    same(ans(p), p.answer.kind === 'point' ? end : `(${end[0]}, ${end[1]})`);
  },
  trid(t, p) { const f = families(t.tri, t.img); same(f.length, 1, `ambiguous move: ${f.join(' / ')}`); assert.ok(ans(p).startsWith(f[0])); },
  trrule(t, p) { same(ans(p), RULE[t.type]); },
  par(t, p) { assert.ok(t.val > 0 && t.val < 180 && NARROW.has(t.from) === t.val < 90); same(ans(p), NARROW.has(t.from) === NARROW.has(t.to) ? t.val : 180 - t.val); },
  rel(t, p) { const key = [t.i, t.j].sort((x, y) => x - y).join('-'); same(ans(p), REL.find(r => r[1].split(' ').includes(key))[0]); },
  trisum(t, p) { same(ans(p), 180 - t.a - t.c); assert.ok(ans(p) > 0); },
  ext(t, p) { same(ans(p), t.find === 'ext' ? 180 - (180 - t.a - t.top) : t.a); assert.ok(t.a + t.top < 180); },
  angx(t, p) {
    const [m1, c1] = t.e1, [m2, c2] = t.e2, x = t.equal ? (c2 - c1) / (m1 - m2) : (180 - c1 - c2) / (m1 + m2);
    same(ans(p), x); assert.ok(m1 * x + c1 > 0 && m2 * x + c2 > 0 && m1 * x + c1 < 180);
  },
  vol(t, p) {
    const k = COEF[t.shape](t.r, t.h), a = ans(p);
    if (t.pi === 'pi') return near(a, k);
    near(a, 3.14 * k); near(Math.round(a * 100), a * 100, 'more than two decimal places');
  },
  volh(t, p) { near(ans(p), (t.shape === 'cone' ? 3 : 1) * t.vol / t.r ** 2); },
  volcc(t, p) { near(ans(p), t.toCone ? t.big / 3 : t.big); },
  volsilo(t, p) { near(ans(p), t.r ** 2 * t.h + (4 * t.r ** 3 / 3) / 2); },
  scdir(t, p) {
    const r = corr(t.pts), a = ans(p);
    if (t.want === 'dir') return same(a, r > 0.9 ? 'Positive association' : r < -0.9 ? 'Negative association' : Math.abs(r) < 0.25 ? 'No association' : `unclear plot, r = ${r}`);
    const size = Math.abs(r) >= 0.9 ? 'Strong' : Math.abs(r) >= 0.4 && Math.abs(r) <= 0.8 ? 'Weak' : `unclear (r = ${r})`;
    same(a, `${size} ${r > 0 ? 'positive' : 'negative'}`);
  },
  scread(t, p) { same(ans(p), t.pts.find(q => q[0] === t.x)[1]); },
  scpred(t, p) { near(ans(p), t.m * t.x + t.c); },
  scout(t, p) {
    const gain = t.idx.map(i => Math.abs(corr(t.pts.filter((_, j) => j !== i))));
    same(ans(p), 'ABCD'[gain.indexOf(Math.max(...gain))]);
  },
  scline(t, p) {
    const n = t.pts.length, mx = t.pts.reduce((s, q) => s + q[0], 0) / n, my = t.pts.reduce((s, q) => s + q[1], 0) / n;
    const m = t.pts.reduce((s, q) => s + (q[0] - mx) * (q[1] - my), 0) / t.pts.reduce((s, q) => s + (q[0] - mx) ** 2, 0), [em, ec] = eqText(ans(p));
    assert.ok(Math.abs(m - em) < 0.35 && Math.abs(my - m * mx - ec) < 2, `chosen line ${ans(p)} is not close to the fitted line`);
  },
};
