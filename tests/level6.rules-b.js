// Recompute rules for the new level 6 skills, part B: rewriting expressions, real-world problems, equations, geometry, data and chance.
import { near, evalVars, holds } from './level6.maths.js';
import { plain } from './level6.checks.js';

// Exactly one option has the target value at every sample, and it is the option the problem marks correct.
const oneMatches = (p, value) => { const o = p.answer.options, hit = s => [10, 7].every(x => near(value(s, x), value(null, x)));
  return o.filter(s => hit(s)).length === 1 && hit(o[p.answer.correct]); };
// What each situation in "which expression shows the total" really costs, written here from the story.
const SAME = { pens: (k, v) => k * (v.p + v.n), taxi: (k, v) => v.f + v.r * v.d, rect: (k, v) => 2 * (v.w + v.w + k), team: (k, v) => k * v.g + v.a };
const SAMPLES = [{ p: 2, n: 3, f: 5, r: 2, d: 3, w: 3, g: 2, a: 3 }, { p: 5, n: 7, f: 4, r: 3, d: 6, w: 8, g: 4, a: 1 }];

const firstWhere = (ok, from = 0) => { for (let x = from; x <= 300; x++) if (ok(x)) return x; return NaN; };
const lastWhere = ok => { let best = NaN; for (let x = 0; x <= 300; x++) if (ok(x)) best = x; return best; };
const unique = (o, correct, fits) => o.filter(fits).length === 1 && fits(o[correct]);

const valid3 = ts => { const [x, y, z] = ts.slice().sort((p, q) => p - q); return x + y > z; };
const numsIn = s => (String(s).match(/\d+(?:\.\d+)?/g) || []).map(Number);
const ONE = 'Exactly one triangle', MANY = 'More than one different triangle', NONE = 'No triangle at all';
// How many triangles a set of measurements allows, written from geometry rather than from the generator.
const COUNT = { sss: t => (valid3(t.s) ? ONE : NONE), aaa: t => (t.g[0] + t.g[1] + t.g[2] === 180 ? MANY : NONE), sas: () => ONE, asa: t => (t.g[0] + t.g[1] < 180 ? ONE : NONE), two: () => MANY, one: () => MANY };

// What a cut makes, from the solid's own geometry (area of the cut surface, and its name).
const CUT_AREA = { top: m => m.l * m.d, front: m => m.l * m.h, side: m => m.d * m.h };
const area = t => (t.solid === 'cube' || t.solid === 'box' ? CUT_AREA[t.cut](t) : t.solid === 'pyramid' ? (t.cut === 'apex' ? t.s * t.h / 2 : (t.s / 2) ** 2) : { ends: t.w * t.h / 2, floor: t.w / 2 * t.d, tall: t.h * t.d }[t.cut]);
const NAME = t => (t.solid === 'cube' ? 'square' : t.solid === 'box' ? 'rectangle' : t.solid === 'pyramid' ? (t.cut === 'apex' ? 'triangle' : 'square') : t.cut === 'ends' ? 'triangle' : 'rectangle');

export const RULES_B = {
  rwchoice: (t, p) => { const m = 1 + t.dir * t.p / 100; return { ok: oneMatches(p, (s, x) => (s === null ? m * x : evalVars(s, { [t.v]: x }))) }; },
  rwexpr: (t, p) => ({ ok: oneMatches(p, (s, x) => evalVars(s === null ? plain(p.expr) : s, { [t.v]: x })) }),
  rwblank: t => ({ num: 1 + t.dir * t.r }), rwpct: t => ({ num: Math.abs(t.m - 1) * 100, ok: (t.m > 1) === (t.dir > 0) }),
  rwval: t => ({ num: t.v * t.m, ok: near(t.m, 1 + t.dir * t.p / 100) }), rwtwo: t => ({ num: (1 + t.d1 * t.p1 / 100) * (1 + t.d2 * t.p2 / 100) }),
  budget: t => ({ num: t.have - t.price * (100 - t.d) / 100 * (100 + t.t) / 100 }), debt: t => ({ num: -(t.owe * (1 - t.n / t.d) + t.more) }),
  tankmix: t => ({ num: t.cap * t.n / t.d * (1 - t.p / 100) + t.add }),
  estimate: (t, p) => { const exact = t.price * (100 - t.d) / 100 * (100 + t.t) / 100, o = p.answer.options.map(s => Number(s.slice(1))), best = o.indexOf(o.slice().sort((a, c) => Math.abs(a - exact) - Math.abs(c - exact))[0]);
    return { ok: best === p.answer.correct && Math.abs(o[best] - exact) <= 0.5 && o.every((v, i) => i === best || Math.abs(v - exact) / exact >= 0.2) }; },
  reasonable: t => { const exact = t.whole * t.p / 100; return { label: near(t.claim, exact) ? 'Reasonable' : t.claim > exact ? 'Much too big' : 'Much too small' }; },
  eqchoice2: (t, p) => { const x = t.form === 'ax+b' ? (t.c - t.b) / t.a : t.c / t.a - t.b;
    return { ok: unique(p.answer.options, p.answer.correct, s => { const [l, r] = s.split(' = ').map(side => evalVars(side, { x }));
      return near(l, r); }) }; },
  graphtext: (t, p) => { const v = (t.c - t.b) / t.a, closed = /[≤≥]/.test(t.op), right = /[>≥]/.test(t.op);
    return { ok: unique(p.answer.options, p.answer.correct, s => { const m = s.match(/^(Open|Closed) circle at (-?[\d.]+), shaded to the (left|right)$/); return !!m && (m[1] === 'Closed') === closed && near(Number(m[2]), v) && (m[3] === 'right') === right; }) }; },
  ineqchoice: (t, p) => { const key = (a, b, op, c) => Array.from({ length: 61 }, (_, x) => holds(a * x + b, op, c)).join();
    return { ok: unique(p.answer.options, p.answer.correct, s => { const m = s.match(/^(\d+)x \+ (\d+) ([<>≤≥]) (\d+)$/); return key(+m[1], +m[2], m[3], +m[4]) === key(t.a, t.b, t.op, t.c); }) }; },
  ineqparen: t => ({ num: t.most ? lastWhere(x => t.a * (x + t.b) <= t.c) : firstWhere(x => t.a * (x + t.b) >= t.c) }),
  drain: t => ({ num: lastWhere(x => holds(t.tank - t.rate * x, t.strict ? '>' : '≥', t.keep)) }),
  countsol: t => ({ num: Array.from({ length: 301 }, (_, x) => x).filter(x => holds(t.a * x + t.b, t.op, t.c)).length }),
  tri: t => ({ label: valid3(t.s) ? 'Yes' : 'No' }), triangles: t => ({ label: t.g[0] + t.g[1] + t.g[2] === 180 ? 'Yes' : 'No' }), twoangles: t => ({ label: t.g[0] + t.g[1] < 180 ? 'Yes' : 'No' }),
  trithird: (t, p) => ({ ok: unique(p.answer.options, p.answer.correct, s => { const v = numsIn(s)[0]; return v > Math.abs(t.a - t.c) && v < t.a + t.c; }) }),
  trirange: t => ({ num: t.want === 'longest' ? t.a + t.c - 1 : Math.abs(t.a - t.c) + 1 }),
  triperim: t => ({ num: t.a + t.c + (t.most ? t.a + t.c - 1 : Math.abs(t.a - t.c) + 1) }),
  trihow: t => ({ num: Array.from({ length: 80 }, (_, v) => v).filter(v => valid3([t.a, t.c, v]) && v > 0).length }),
  triset: (t, p) => ({ ok: unique(p.answer.options, p.answer.correct, s => valid3(numsIn(s))) }),
  triunique: t => ({ label: COUNT[t.cond](t) }),
  slicename: (t, p) => ({ label: NAME(t), ok: p.answer.options.filter(o => o === NAME(t) || (NAME(t) === 'square' && o === 'rectangle') || (NAME(t) === 'rectangle' && o === 'square')).length === 1 }),
  slicearea: t => ({ num: area(t) }), pyrcut: t => ({ num: (t.s * (t.h - t.y) / t.h) ** 2 }),
  sliceperim: t => { const sides = t.solid === 'box' ? { top: [t.l, t.d], front: [t.l, t.h], side: [t.d, t.h] }[t.cut] : t.cut === 'floor' ? [t.w / 2, t.d] : [t.h, t.d]; return { num: 2 * (sides[0] + sides[1]) }; },
  slicecmp: (t, p) => ({ label: area({ ...t, solid: 'box', cut: t.cuts[0] }) > area({ ...t, solid: 'box', cut: t.cuts[1] }) ? 'Cut A' : 'Cut B', ok: area({ ...t, solid: 'box', cut: t.cuts[0] }) !== area({ ...t, solid: 'box', cut: t.cuts[1] }) }),
  rwsame: (t, p) => { const o = p.answer.options, fits = s => SAMPLES.every(v => near(evalVars(s, v), SAME[t.item](t.k, v)));
    return { ok: o.filter(fits).length === 1 && fits(o[p.answer.correct]) }; },
};
