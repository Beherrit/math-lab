// Recomputation, shown operands and ranges for the fraction skills: mixed numbers, estimating, fraction as division, area.
import { close, ev, gcd, add, sub, mul, mixedOf, val, parseMixed } from './level4.math.js';
import { svgRects } from './level4.render.js';

const near = x => [0, 0.5, 1].reduce((b, c) => (Math.abs(x - c) < Math.abs(x - b) ? c : b));
const half = t => { const x = t.n / t.d; return t.w + near(x === 0.25 || x === 0.75 ? 0 : x); };
const termVal = t => t.w + t.n / t.d;
const shownTerm = t => [t.w, t.n, t.d];
const label = v => (v === 0 ? '0' : v === 0.5 ? '1/2' : '1');
const closestIdx = (opts, target) => { const ds = opts.map(o => Math.abs(parseMixed(o) - target)); return ds.indexOf(Math.min(...ds)); };
const fitsSide = (a, c) => (a[0] * c[0] === a[1] * c[1] ? 'Exactly 1' : a[0] * c[0] < a[1] * c[1] ? 'Less than 1' : 'More than 1');
const fracSum = ts => ts.map(mixedOf).reduce(add);
const shaded = p => svgRects(p.visual).filter(r => r.cls === 'on').length;

export const FRAC_KINDS = {
  mxadd: { rec: t => add(mixedOf(t.A), mixedOf(t.B)), show: t => [...shownTerm(t.A), ...shownTerm(t.B)] },
  mxsub: { rec: t => sub(mixedOf(t.A), mixedOf(t.B)), show: t => [...shownTerm(t.A), ...shownTerm(t.B)] },
  mxwhole: { rec: t => sub([t.A, 1], mixedOf(t.B)), show: t => [t.A, ...shownTerm(t.B)] },
  mxmiss: { rec: t => sub(mixedOf(t.A), mixedOf(t.B)), show: t => [...shownTerm(t.A), ...shownTerm(t.B)] },
  mxstory: { rec: t => (t.add ? add : sub)(mixedOf(t.A), mixedOf(t.B)), show: t => [...shownTerm(t.A), ...shownTerm(t.B)] },
  mxadd3: { rec: t => fracSum(t.terms), show: t => t.terms.flatMap(shownTerm) },
  mxsub2: { rec: t => sub(sub(mixedOf(t.terms[0]), mixedOf(t.terms[1])), mixedOf(t.terms[2])), show: t => t.terms.flatMap(shownTerm) },
  mxstory2: { rec: t => sub(sub(mixedOf(t.terms[0]), mixedOf(t.terms[1])), mixedOf(t.terms[2])), show: t => t.terms.flatMap(shownTerm) },
  mxdist: { rec: t => sub(mixedOf(t.B), mixedOf(t.A)), show: t => [...shownTerm(t.A), ...shownTerm(t.B)] },

  feBench: { rec: t => label(near(t.n / t.d)), show: t => [t.n, t.d] },
  feHalf: { rec: t => (2 * t.n === t.d ? 'Exactly 1/2' : 2 * t.n < t.d ? 'Less than 1/2' : 'More than 1/2'), show: t => [t.n, t.d] },
  feOne: { rec: t => (t.a[0] / t.a[1] + t.c[0] / t.c[1] > 1 ? 'More than 1' : 'Less than 1'), show: t => [...t.a, ...t.c] },
  feSum: { rec: t => [Math.round(2 * (near(t.a[0] / t.a[1]) + near(t.c[0] / t.c[1]))), 2], show: t => [...t.a, ...t.c] },
  feWhole: { rec: t => { const r = x => x.w + (x.n / x.d > 0.5 ? 1 : 0); return t.add ? r(t.A) + r(t.B) : r(t.A) - r(t.B); }, show: t => [...shownTerm(t.A), ...shownTerm(t.B)] },
  fePick: { rec: t => ({ pick: o => closestIdx(o, termVal(t.A) + (t.add ? 1 : -1) * termVal(t.B)) }), show: t => [...shownTerm(t.A), ...shownTerm(t.B)] },
  feUnreal: { rec: t => ({ test: o => Math.abs(parseMixed(o) - (t.a[0] / t.a[1] + t.c[0] / t.c[1])) > 0.5 }), show: t => [...t.a, ...t.c] },
  feHalfEst: { rec: t => [Math.round(2 * (half(t.A) + (t.add ? 1 : -1) * half(t.B))), 2], show: t => [...shownTerm(t.A), ...shownTerm(t.B)] },
  feFits: { rec: t => (termVal(t.A) + termVal(t.B) <= t.c ? 'Yes' : 'No'), show: t => [...shownTerm(t.A), ...shownTerm(t.B), t.c] },

  shShare: { rec: t => [t.a, t.d], show: t => [t.a, t.d] },
  shWrite: { rec: t => ({ test: o => close(ev(o), t.n / t.d) }), show: t => [t.n, t.d] },
  shRev: { rec: t => t.d, show: t => [t.n, t.d] },
  shDec: { rec: t => t.n / t.d, show: t => [t.n, t.d] },
  shBetween: { rec: t => ({ test: o => { const [a, b] = o.split(' and ').map(Number); return b === a + 1 && a < t.n / t.d && t.n / t.d < b; } }), show: t => [t.n, t.d] },
  shRem: { rec: t => [t.n, t.d], show: t => [t.n, t.d] },
  shCmp: { rec: t => { const c = t.a1 * t.d2 - t.a2 * t.d1; return c === 0 ? 'They get the same' : c > 0 ? 'Team A' : 'Team B'; }, show: t => [t.a1, t.d1, t.a2, t.d2] },
  shThen: { rec: t => [t.len * t.m, t.d], show: t => [t.len, t.d, t.m] },
  shTotal: { rec: t => [t.p * t.n, t.d], show: t => [t.p, t.n, t.d] },

  fmWF: { rec: t => [t.w * t.n, t.d], show: t => [t.w, t.n, t.d], custom: (p, t) => assertEq(shaded(p), t.w * t.n, 'shaded pieces drawn') },
  fmTiles: { rec: t => [t.r * t.c, t.q * t.q], show: t => [t.q, t.r, t.c] },
  fmPic: { rec: t => [t.a[0] * t.c[0], t.a[1] * t.c[1]], show: t => [t.a[0] / t.a[1], t.c[0] / t.c[1]], custom: (p, t) => assertEq(shaded(p), t.a[0] * t.c[0], 'shaded pieces drawn') },
  fmCmp1: { rec: t => fitsSide(t.a, t.c), show: t => [t.a[0] / t.a[1], t.c[0] / t.c[1]] },
  fmMix: { rec: t => mul(mixedOf(t.A), mixedOf(t.B)), show: t => [...shownTerm(t.A), ...shownTerm(t.B)] },
  fmRect: { rec: t => mul(mixedOf(t.A), mixedOf(t.B)), show: t => [...shownTerm(t.A), ...shownTerm(t.B)] },
  fmBox: { rec: t => [[0, 0], [t.A.n * t.B.w, t.A.d], [t.A.w * t.B.n, t.B.d], [t.A.n * t.B.n, t.A.d * t.B.d]][t.hide], show: t => [...shownTerm(t.A), ...shownTerm(t.B)] },
  fmL: { rec: t => mul(add(mixedOf(t.A), mixedOf(t.C)), mixedOf(t.W)), show: t => [...shownTerm(t.A), ...shownTerm(t.C), ...shownTerm(t.W)] },
  fmCost: { rec: t => t.P * val(mul(mixedOf(t.A), mixedOf(t.B))), show: t => [...shownTerm(t.A), ...shownTerm(t.B), t.P] },
};
import assert from 'node:assert/strict';
function assertEq(a, b, msg) { assert.equal(a, b, msg); }
void gcd;
