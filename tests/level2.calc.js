// Independent recomputation for the newer level 2 skills: each entry rebuilds the answer from the operands in p._t (never from the generator's own code).
import assert from 'node:assert/strict';

export const STRANDS = ['Numbers', 'Adding and subtracting', 'Multiplying and dividing', 'Fractions and decimals', 'Ratios and percents', 'Algebra', 'Measurement', 'Shapes and space', 'Data and chance', 'Stories'];
export const NEW_IDS = new Set(['l2add1000', 'l2patterns', 'l2props', 'l2divfacts', 'l2twostep', 'l2equiv', 'l2clock', 'l2massvol', 'l2graphs', 'l2measure', 'l2tiling', 'l2quads']);
// The two-step story kinds: a "more than one step" story must be one of these.
export const TWO_STEP = ['mulsub', 'muladd', 'subdiv', 'addmul', 'adddiv', 'divadd', 'divsub', 'addsub'];
const even = (a, b) => { assert.equal(a % b, 0, `${a} ÷ ${b} must come out even`); return a / b; };
const round = (n, p) => Math.round(n / p) * p;
const clock = x => `${((Math.floor(x / 60) + 11) % 12) + 1}:${String(x % 60).padStart(2, '0')}`;
const FIRST = { muladd: t => t.g * t.n, mulsub: t => t.g * t.n, subdiv: t => t.t - t.e, addmul: t => t.a + t.b, adddiv: t => t.a + t.b, divadd: t => t.t / t.d, divsub: t => t.t / t.d, addsub: t => t.a + t.b };

export const CALC_NEW = {
  near: t => round(t.n, t.p),
  est: t => (t.op === 'add' ? round(t.a, t.p) + round(t.b, t.p) : round(t.a, t.p) - round(t.b, t.p)),
  parity: t => ((t.a * t.b) % 2 ? 'Odd' : 'Even'),
  nine: t => { for (let n = 1; n <= 9; n++) if (Math.floor(9 * n / 10) === t.d) return 9 * n % 10; throw new Error(`no 9s fact has tens digit ${t.d}`); },
  nineT: t => { for (let n = 1; n <= 9; n++) if (9 * n % 10 === t.d && n > 1) return Math.floor(9 * n / 10); throw new Error(`no 9s fact has ones digit ${t.d}`); },
  seq: t => { const d = t.xs.slice(1).map((x, i) => x - t.xs[i]), d2 = d.slice(1).map((x, i) => x - d[i]); assert.ok(d2.every(x => x === d2[0]), 'second gaps must be steady'); return t.xs[t.xs.length - 1] + d[d.length - 1] + (d2[0] || 0); },
  nextsq: t => { const r = Math.sqrt(t.n); assert.ok(Number.isInteger(r), `${t.n} must be square`); return (r + 1) ** 2; },
  third: t => t.xs[2],
  addmul: t => (t.a + t.b) * t.g, adddiv: t => even(t.a + t.b, t.d), divadd: t => even(t.t, t.d) + t.e, divsub: t => even(t.t, t.d) - t.e, addsub: t => t.a + t.b - t.c,
  step1: t => FIRST[t.type](t),
  equivn: t => even(t.n * t.e, t.d), equivd: t => even(t.m * t.d, t.n), wholen: t => t.w * t.d, wholev: t => even(t.n, t.d), wholed: t => even(t.n, t.w),
  elapsed: t => ((t.h2 * 60 + t.m2) - (t.h1 * 60 + t.m1) + 720) % 720,
  endtime: t => clock(t.h * 60 + t.m + t.d), starttime: t => clock(t.h * 60 + t.m - t.d),
  perimarea: t => 2 * (t.w + even(t.area, t.w)),
};
// The largest number a learner should meet at each step (operands and answer).
export const LIMIT_NEW = { l2add1000: [900, 1000, 1000], l2patterns: [100, 150, 150], l2props: [100, 300, 500], l2divfacts: [45, 81, 144], l2twostep: [90, 300, 500], l2equiv: [16, 16, 16],
  l2clock: [60, 99, 240], l2massvol: [1000, 3000, 6000], l2graphs: [40, 200, 200], l2measure: [30, 30, 30], l2tiling: [40, 100, 150], l2quads: [4, 4, 4] };

// Reference facts the question checks use (typed here, not imported from the generators).
export const HAS = { square: ['equal', 'square', 'two'], rectangle: ['unequal', 'square', 'two'], rhombus: ['equal', 'none', 'two'], parallelogram: ['unequal', 'none', 'two'], trapezoid: ['unequal', 'none', 'one'] };
export const SIDES = { square: 4, rectangle: 4, rhombus: 4, parallelogram: 4, trapezoid: 4, kite: 4, triangle: 3, pentagon: 5, hexagon: 6 };
// "Every X is a Y": which of these are always true. Nothing here depends on how a trapezoid is defined.
export const RELS = { square: ['rectangle', 'rhombus', 'parallelogram', 'quadrilateral'], rectangle: ['parallelogram', 'quadrilateral'], rhombus: ['parallelogram', 'quadrilateral'], parallelogram: ['quadrilateral'], trapezoid: ['quadrilateral'], kite: ['quadrilateral'], quadrilateral: [] };
export const PROPS = { sides4: s => s.n === 4, right: s => s.rights > 0, par2: s => s.pairs === 2, eq4: s => s.n === 4 && s.equal };
