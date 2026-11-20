// Recomputation (rec), operands the child must see (show) and believable ranges per step (range) for the number skills:
// powers of 10, thousandths, long division, money and groups. Written again from the maths, not from the generators.
import { close, ev, parseMixed, sum } from './level4.math.js';

const digitAt = (x, dp, pos) => x.toFixed(dp).replace('.', '')[pos];
const pickIdx = (opts, f, best) => { const vs = opts.map(f); return vs.indexOf(best(...vs)); };
const innermost = s => (s.match(/\(([^()]*)\)/) || [])[1];
const nums = o => o.split(',').map(Number);
const sorted = (xs, up) => xs.every((x, i) => !i || (up ? xs[i - 1] <= x : xs[i - 1] >= x));
// Words for the expression questions, worked out from each template's own numbers.
const WORD_VALUE = { 0: t => t.c * (t.a + t.b) - t.d, 1: t => (t.a - t.c) / t.b, 2: t => (t.a * t.b + t.c) / t.d, 3: t => (t.a + t.b) * (t.c - t.d), 4: t => t.a * (t.b + t.c * t.d), 5: t => (t.a + t.b) / t.c + t.d, 6: t => 3 * (t.a + t.b) - t.c,
  S0: t => t.A - (t.p * t.q + t.r * t.s), S1: t => (t.p * t.q + t.r) / t.s, S2: t => (t.p * t.q - t.r) / t.s };
const moneyCents = (x, d = 100) => x / d;

export const NUM_KINDS = {
  pval: { rec: t => 10 ** t.e, show: t => [t.e] },
  pexp: { rec: t => t.e, show: t => [10 ** t.e] },
  pmul: { rec: t => t.x * 10 ** t.e, show: t => [t.x, t.e], range: (t, L) => (L === 1 ? Number.isInteger(t.x) && t.x <= 99 && t.e <= 3 : t.e <= 4) },
  pdiv: { rec: t => t.x / 10 ** t.e, show: t => [t.x, t.e], range: (t, L) => (L === 1 ? Number.isInteger(t.x / 10 ** t.e) : true) },
  pchoice: { rec: t => ({ test: o => close(ev(o), 10 ** t.e) }), show: t => [t.e] },
  pmiss: { rec: t => ({ solve: v => close(t.mult ? t.x * 10 ** v : t.x / 10 ** v, t.y) }), show: t => [t.x, t.y] },
  pratio: { rec: t => t.A / t.B, show: t => [t.A, t.B, t.d] },
  pstory: { rec: t => (t.mult ? t.x * 10 ** t.e : t.x), show: t => (t.mult ? [t.x, t.e] : [t.x * 10 ** t.e, t.e]) },
  psum: { rec: t => sum(t.es.map((e, i) => t.ds[i] * 10 ** e)) + t.tail, show: t => [...t.ds, ...t.es] },
  pcmp: { rec: t => ({ pick: o => pickIdx(o, ev, t.most ? Math.max : Math.min) }), show: () => [] },
  ptwo: { rec: t => t.x * 10 ** t.a / 10 ** t.c, show: t => [t.x, t.a, t.c] },
  psolve: { rec: t => (t.mult ? t.y / 10 ** t.e : t.y * 10 ** t.e), show: t => [t.y, t.e] },

  tdig: { rec: t => Number(digitAt(t.x, t.dp, t.pos)), show: t => [t.x] },
  tval: { rec: t => t.d / 10 ** t.pos, show: t => [t.x, t.d] },
  texp: { rec: t => ({ test: o => close(ev(o), t.x) }), show: t => [t.x] },
  twrite: { rec: t => sum(t.es.map((e, i) => t.ds[i] * 10 ** e)), show: t => t.ds },
  tread: { rec: t => Math.round(t.x * 10 ** t.u), show: t => [t.x] },
  tcmp: { rec: t => (t.x > t.y ? '>' : t.x < t.y ? '<' : '='), show: t => [t.x, t.y] },
  tbetween: { rec: t => ({ test: o => Number(o) > t.lo && Number(o) < t.hi }), show: t => [t.lo, t.hi] },
  texpr: { rec: t => sum(t.es.map((e, i) => t.ds[i] * 10 ** e)), show: t => t.ds },
  tstep: { rec: t => t.x + (t.more ? t.u : -t.u), show: t => [t.x, t.u] },
  tratio: { rec: t => t.A / t.B, show: t => [t.A, t.B] },
  torder: { rec: t => ({ test: o => { const xs = nums(o); return sorted(xs, t.up) && [...xs].sort().join() === [...t.vals].sort().join(); } }), show: t => t.vals },
  tdig2: { rec: t => { const val = d => t.whole + t.X.map((x, i) => (i === t.pos ? d : x) / 10 ** (i + 1)).reduce((s, v) => s + v, 0), bound = t.whole + t.B.map((x, i) => x / 10 ** (i + 1)).reduce((s, v) => s + v, 0), ok = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => (t.gt ? val(d) > bound + 1e-9 : val(d) < bound - 1e-9)); return t.gt ? ok[0] : ok[ok.length - 1]; }, show: () => [] },
  tnear: { rec: t => ({ pick: o => pickIdx(o, x => Math.abs(Number(x) - t.t), Math.min) }), show: t => [t.t] },

  ldQ: { rec: t => Math.floor(t.t / t.d), show: t => [t.t, t.d], range: (t, L) => t.d >= 11 && t.t <= 9999 && (L > 1 || t.t < 300) },
  ldRem: { rec: t => t.t % t.d, show: t => [t.t, t.d], range: (t, L) => t.d >= 11 && (L > 1 || t.t < 300) },
  ldEst: { rec: t => ({ pick: o => pickIdx(o, x => Math.abs(Number(x.replace(/,/g, '')) - t.t / t.d), Math.min) }), show: t => [t.t, t.d] },
  ldDigits: { rec: t => String(Math.floor(t.t / t.d)).length, show: t => [t.t, t.d] },
  ldCheck: { rec: t => ({ test: o => ev(o) === t.full }), show: t => [t.q, t.d, ...(t.rem ? [t.r] : [])] },
  ldMiss: { rec: t => t.q * t.d + t.r, show: t => [t.d, t.q, t.r] },
  ldStory: { rec: t => (t.mode === 'up' ? Math.floor(t.t / t.d) + 1 : t.mode === 'down' ? Math.floor(t.t / t.d) : t.t % t.d), show: t => [t.t, t.d] },
  ldFrac: { rec: t => [t.t, t.d], show: t => [t.t, t.d] },
  ldFindDiv: { rec: t => t.t / t.q, show: t => [t.t, t.q] },

  mnTotal: { rec: t => sum(t.cs) / 100, show: t => t.cs.map(c => c / 100), range: t => t.cs.every(c => c >= 200 && c < 3000) },
  mnChange: { rec: t => t.B - t.n * t.p / 100, show: t => [t.p / 100, t.B, ...(t.n > 1 ? [t.n] : [])], range: t => t.n * t.p < t.B * 100 && t.p >= 200 },
  mnTimes: { rec: t => t.n * t.p / 100, show: t => [t.p / 100, t.n] },
  mnSplit: { rec: t => t.total / t.n / 100, show: t => [t.total / 100, t.n], range: t => t.n >= 2 && t.n <= 6 && t.total / t.n < 2000 },
  mnUnit: { rec: t => t.total / t.n / 100, show: t => [t.total / 100, t.n], range: t => t.total / t.n >= 10 && t.total / t.n <= 140 },
  mnBuy: { rec: t => Math.floor(t.B * 100 / t.p), show: t => [t.B, t.p / 100] },
  mnBetter: { rec: t => (t.t1 / t.n1 < t.t2 / t.n2 ? 'Pack A' : 'Pack B'), show: t => [t.n1, t.n2, t.t1 / 100, t.t2 / 100] },
  mnGap: { rec: t => moneyCents(Math.abs(t.t1 / t.n1 - t.t2 / t.n2)), show: t => [t.n1, t.n2, t.t1 / 100, t.t2 / 100] },
  mnLeft: { rec: t => t.B - (t.n * t.p + t.q) / 100, show: t => [t.B, t.p / 100, t.q / 100, t.n] },
  mnShare: { rec: t => (t.a + t.c - t.coupon) / t.n / 100, show: t => [t.a / 100, t.c / 100, t.coupon / 100, t.n] },

  grFirst: { rec: t => ({ test: o => o === innermost(t.s) }), show: () => [] },
  grFix: { rec: t => ({ test: o => ev(o) === t.target }), show: t => [t.a, t.c, t.d, t.target] },
  grMissing: { rec: (t, p) => ({ solve: v => close(ev(plain2(p.expr).split(' = ')[0].replace('?', v)), ev(plain2(p.expr).split(' = ')[1])) }), show: () => [] },
  grOp: { rec: t => ({ test: o => ev(`${t.a} ${o} (${t.c} + ${t.d})`) === t.target }), show: t => [t.a, t.c, t.d, t.target] },
  grBig: { rec: t => ({ pick: o => pickIdx(o, ev, t.most ? Math.max : Math.min) }), show: () => [] },
  grSame: { rec: t => (ev(t.x) === ev(t.y) ? 'Same value' : 'Different values'), show: () => [] },
  grWrite: { rec: t => ({ test: o => close(ev(o), WORD_VALUE[t.tpl](t)) }), show: () => [] },
  grStory: { rec: t => ({ test: o => close(ev(o), WORD_VALUE[t.tpl](t)) }), show: t => [t.p, t.q, t.s].filter(Boolean) },
};
function plain2(h) { return String(h).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
