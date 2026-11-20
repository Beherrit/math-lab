// Level 6: every generator, every step, 300 problems each. The stated answer is recomputed here from the raw
// operands the problem exposes in `_t`, with arithmetic written separately from the generators.
import test from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS, STORY_SOURCES } from '../js/skills/level6/index.js';
import { check, ANSWER_KINDS, fmt } from '../js/util.js';
import { plural } from '../js/skills/level6/helpers.js';
import { sum, prod, sorted, median, mean, holds, toNum, near } from './level6.maths.js';
import { RULES, LIMITS, NEW_IDS, STRANDS } from './level6.rules.js';
import { seeded, plain, storyMatchesOperands, countNamesEveryChoice, hintKeepsTheAnswer, firstWayEndsOnAnswer, noPluralOfOne, FACTS } from './level6.checks.js';

const N = 300;
// Evaluate a linear expression such as "−2(x − 4) + 3x" at a value of x.
function evalExpr(src, x) {
  const e = src.replace(/−/g, '-').replace(/\s+/g, '').replace(/(\d|\))(?=[x(])/g, '$1*');
  assert.match(e, /^[0-9x+\-*/().]+$/, `unexpected expression text: ${src}`);
  return Function('x', `return ${e};`)(x);
}
const XS = [-3, 0, 2, 7];
const sameExpr = (a, b) => XS.every(x => near(evalExpr(a, x), evalExpr(b, x)));
const lhs = (form, a, b, x) => (form === 'ax+b' ? a * x + b : form === 'x/a+b' ? x / a + b : a * (x + b));
const pairs = (A, B) => A.flatMap(a => B.map(b => [a, b]));
const EVENT = { even: v => v % 2 === 0, odd: v => v % 2 !== 0, gt: (v, a) => v > a, lt: (v, a) => v < a, mult: (v, a) => v % a === 0, prime: v => v > 1 && ![2, 3, 4, 5, 6, 7, 8, 9, 10].some(d => d < v && v % d === 0) };
const grid = Array.from({ length: 121 }, (_, i) => -30 + i / 2);

// Each entry returns { num }, { frac: [n, d] }, { label } or { ok }.
const RE = {
  ...RULES,
  fixed: (t, p) => ({ ok: FACTS[plain(p.ask)] === p.answer.options[p.answer.correct] }),
  sum: t => ({ num: sum(t.xs) }), diff: t => ({ num: t.a - t.c }), missadd: t => ({ num: t.c - t.a }),
  prod: t => ({ num: prod(t.xs) }), quot: t => ({ num: t.a / t.c }), prodquot: t => ({ num: t.a * t.c / t.d }),
  fsum: t => ({ frac: [t.a[0] * t.c[1] + t.c[0] * t.a[1], t.a[1] * t.c[1]] }), fprod: t => ({ frac: [t.a[0] * t.c[0], t.a[1] * t.c[1]] }), fquot: t => ({ frac: [t.a[0] * t.c[1], t.a[1] * t.c[0]] }),
  k: t => ({ num: t.ys[0] / t.xs[0], ok: t.xs.every((x, i) => near(t.ys[i] / x, t.ys[0] / t.xs[0])) }),
  isprop: t => ({ label: t.xs.every((x, i) => near(t.ys[i] * t.xs[0], t.ys[0] * x)) ? 'Yes' : 'No' }),
  eqk: (t, p) => ({ ok: p.answer.options.filter(o => t.xs.every((x, i) => near(evalExpr(o.replace('y = ', '').replace('÷', '/'), x), t.ys[i]))).join() === p.answer.options[p.answer.correct] }),
  kx: t => ({ num: t.ys[1] / t.xs[1] * t.x }), cmp: t => ({ label: t.ka > t.ys[0] / t.xs[0] ? 'Plan A' : 'Plan B' }),
  prop: t => ({ num: t.v[t.pos], ok: t.v[0] * t.v[3] === t.v[1] * t.v[2] }),
  pctamt: t => ({ num: t.price * t.p / 100 }), pctfinal: t => ({ num: t.price * (100 + t.dir * t.p) / 100 }), disctax: t => ({ num: t.price * (100 - t.d) / 100 * (100 + t.t) / 100 }),
  orig: t => ({ num: t.after * 100 / (100 + t.dir * t.p) }), whatpct: t => ({ num: t.part / t.whole * 100 }),
  pctchg: t => ({ num: Math.abs(t.neu - t.old) / t.old * 100 }), applychg: t => ({ num: t.old + t.dir * t.old * t.p / 100 }),
  updown: t => ({ num: t.start * (1 + t.p / 100) * (1 - t.p / 100) }), pcterr: t => ({ num: Math.abs(t.est - t.act) / t.act * 100 }),
  interest: t => { const I = t.P * t.r / 100 * t.t; return { num: { I, total: t.P + I, r: t.r, t: t.t }[t.want] }; },
  exprchoice: (t, p) => ({ ok: p.answer.options.every((o, i) => sameExpr(o, t.src) === (i === p.answer.correct)) }),
  exprblank: (t, p) => ({ ok: sameExpr(t.tmpl.replace('?', `(${p.answer.value})`), t.src) }),
  lineq: (t, p) => ({ ok: near(lhs(t.form, t.a, t.b, p.answer.value), t.c) }),
  eqchoice: (t, p) => { const x = (t.c - t.b) / t.a; return { ok: p.answer.options.every((o, i) => { const [l, r] = o.split(' = '); return near(evalExpr(l, x), evalExpr(r, x)) === (i === p.answer.correct); }) }; },
  ineq: (t, p) => {
    const A = p.answer, truth = x => holds(t.a * x + t.b, t.op, t.c);
    if (t.type === 'isSol') return { label: truth(t.v) ? 'Yes' : 'No' };
    if (t.type === 'which') return { ok: A.options.every((o, i) => truth(toNum(o)) === (i === A.correct)) };
    if (t.type === 'graph') return { label: `x ${t.op} ${fmt(t.v)}`, ok: p.visual.includes(/[>≥]/.test(t.op) ? 'x greater than' : 'x less than') && p.visual.includes('or equal to') === /[≤≥]/.test(t.op) };
    return { ok: A.options.every((o, i) => { const m = o.match(/^x ([<>≤≥]) (.+)$/); return grid.every(x => truth(x) === holds(x, m[1], toNum(m[2]))) === (i === A.correct); }) };
  },
  ineqword: t => { let best = null; for (let x = 0; x <= 200; x++) { const fits = t.most ? t.a * x + t.b <= t.c : t.a * x + t.b >= t.c; if (fits && (t.most || best === null)) best = x; } return { num: best }; },
  scalearea: t => ({ num: (t.w * t.k) * (t.h * t.k) }),
  circRD: t => ({ num: t.wantD ? t.r + t.r : t.r }), circC: t => ({ num: t.mode === 'pi' ? 2 * t.r : 2 * t.r * 3.14 }), circA: t => ({ num: t.r ** 2 * t.part * (t.mode === 'pi' ? 1 : 3.14) }),
  circFromC: t => ({ num: t.C / 3.14 / (t.wantR ? 2 : 1) }), circFromA: t => ({ num: Math.sqrt(t.A) * (t.wantC ? 2 : 1) }),
  angle: t => ({ num: t.total - sum(t.known) }), same: t => ({ num: t.v }),
  lshape: t => ({ num: t.W * (t.H - t.h) + (t.W - t.w) * t.h }), house: t => ({ num: t.w * t.h + 0.5 * t.w * t.t }),
  sa: t => ({ num: 2 * t.l * t.w + 2 * t.l * t.h + 2 * t.w * t.h }), triV: t => ({ num: 0.5 * t.a * t.b * t.len }),
  triSA: t => ({ num: t.a * t.b + t.a * t.len + t.b * t.len + t.c * t.len, ok: t.a ** 2 + t.b ** 2 === t.c ** 2 }),
  twobox: t => ({ num: prod(t.A) + prod(t.B) }), tank: t => ({ num: t.l * t.w * t.h / 1000 }),
  prob: t => ({ frac: [sum(t.fav), sum(t.all)] }), expect: t => ({ num: t.fav / t.total * t.trials }), missingcount: t => ({ num: t.red * t.d / t.n - t.red }),
  likely: t => ({ label: t.fav === 0 ? 'impossible' : t.fav === t.total ? 'certain' : t.fav < t.total / 2 ? 'unlikely' : 'likely' }),
  event: t => ({ frac: [Array.from({ length: t.n }, (_, i) => i + 1).filter(v => EVENT[t.ev](v, t.arg)).length, t.n] }),
  count: t => ({ num: prod(t.xs) }),
  both: t => ({ frac: [pairs(t.sets[0], t.sets[1]).filter(([a, b]) => t.fav[0].includes(a) && t.fav[1].includes(b)).length, t.sets[0].length * t.sets[1].length] }),
  cubes: t => { const d = [1, 2, 3, 4, 5, 6]; return { frac: [pairs(d, d).filter(([a, b]) => (t.pred === 'sumEq' ? a + b === t.arg : t.pred === 'sumGt' ? a + b > t.arg : a === b)).length, 36] }; },
  coins: t => { let fav = 0; for (let i = 0; i < 2 ** t.n; i++) { const h = i.toString(2).split('1').length - 1; if (t.atLeast ? h >= t.k : h === t.k) fav++; } return { frac: [fav, 2 ** t.n] }; },
  draw: t => { const c = { red: t.r, blue: t.bl }; return { frac: [c[t.first] * c[t.second], (t.r + t.bl) ** 2] }; },
  mean: t => ({ num: mean(t.xs) }), median: t => ({ num: median(t.xs) }), range: t => ({ num: Math.max(...t.xs) - Math.min(...t.xs) }),
  mad: t => ({ num: mean(t.xs.map(v => Math.abs(v - mean(t.xs)))) }), meandiff: t => ({ num: Math.abs(mean(t.A) - mean(t.B)) }),
  spread: t => ({ label: Math.max(...t.A) - Math.min(...t.A) > Math.max(...t.B) - Math.min(...t.B) ? 'Team A' : 'Team B' }),
  needmean: t => ({ num: t.m * (t.xs.length + 1) - sum(t.xs) }),
};
// The largest size any operand or answer may have at each step.
const LIMIT = { ...LIMITS, l6intadd: [20, 60, 120], l6intsub: [20, 60, 120], l6intmul: [81, 144, 225], l6rat: [12, 25, 50], l6prop: [150, 60, 1200], l6solveprop: [60, 70, 70], l6pct: [200, 150, 600],
  l6pctchg: [300, 900, 1000], l6interest: [1000, 10000, 16000], l6expr: [100, 100, 100], l6eq2: [70, 100, 250], l6ineq: [70, 95, 190], l6scale: [240, 400, 5400], l6circle: [320, 1300, 22000],
  l6angles: [180, 360, 180], l6solids: [140, 700, 1000], l6prob: [20, 200, 2000], l6compound: [50, 12, 300], l6data: [30, 30, 1000], l6story: [22000, 22000, 22000] };
const walk = (v, f) => { if (typeof v === 'number') f(v); else if (v && typeof v === 'object') Object.values(v).forEach(x => walk(x, f)); };
const right = a => (a.kind === 'num' ? String(a.value) : a.kind === 'frac' ? { w: '', n: String(Math.abs(a.n)), d: String(a.d), neg: a.n < 0 } : a.correct);
const wrong = a => (a.kind === 'num' ? String(a.value + 1) : a.kind === 'frac' ? { w: '', n: String(Math.abs(a.n) + 1), d: String(a.d), neg: a.n < 0 } : (a.correct + 1) % a.options.length);
const GLYPHS = /[←-⇿⌀-⏿①-✔✖-➿⬀-⯿\u{1F000}-\u{1FAFF}]/u;

function sanity(p, where, strict = false) {
  assert.ok(p, `${where}: no problem`);
  assert.ok(p.ask || p.expr, `${where}: needs ask or expr`);
  const { _t, ...shown } = p, text = JSON.stringify(shown);
  assert.doesNotMatch(text, /undefined|NaN|null|\b[Gg]rades?\b/, `${where}: bad text in ${text.slice(0, 300)}`);
  assert.doesNotMatch(text, GLYPHS, `${where}: icon glyph in text`);
  assert.ok(typeof p.hint === 'string' && p.hint.length > 10, `${where}: hint`);
  assert.ok(p.ways.length >= 2, `${where}: at least two ways`);
  for (const w of p.ways) assert.ok(w.t && w.s.length && w.s.every(s => typeof s === 'string' && s.length), `${where}: empty way`);
  const a = p.answer;
  assert.ok(ANSWER_KINDS.includes(a.kind), `${where}: answer kind`);
  if (a.kind === 'choice') {
    assert.ok(a.options.length >= 2 && a.options.length <= 4, `${where}: option count`);
    assert.equal(new Set(a.options).size, a.options.length, `${where}: duplicate options ${a.options}`);
    assert.ok(a.correct >= 0 && a.correct < a.options.length, `${where}: correct option missing from ${a.options}`);
  }
  assert.equal(check(a, right(a)).ok, true, `${where}: right answer rejected`);
  assert.equal(check(a, wrong(a)).ok, false, `${where}: wrong answer accepted`);
  assert.ok(_t && RE[_t.kind], `${where}: no recompute rule for ${_t?.kind}`);
  if (_t.kind === 'fixed') assert.ok(plain(p.ask) in FACTS, `${where}: no independent fact for "${p.ask}"`);
  hintKeepsTheAnswer(p, _t, where); firstWayEndsOnAnswer(p, where); noPluralOfOne(p, where);
  if (p.story || strict) storyMatchesOperands(p, _t, where);
  if (_t.kind === 'count') countNamesEveryChoice(p, _t, where);
  return _t;
}
function recheck(p, t, where) {
  const want = RE[t.kind](t, p), a = p.answer, info = `${where} [${t.kind}] ${JSON.stringify(t)} stated ${JSON.stringify(a)}`;
  if ('ok' in want) assert.equal(want.ok, true, `consistency: ${info}`);
  if ('num' in want) { assert.equal(a.kind, 'num', info); assert.ok(Math.abs(a.value - want.num) < 1e-6, `recomputed ${want.num}: ${info}`); }
  if ('frac' in want) { assert.equal(a.kind, 'frac', info); assert.equal(a.n * want.frac[1], want.frac[0] * a.d, `recomputed ${want.frac}: ${info}`); }
  if ('label' in want) { assert.equal(a.kind, 'choice', info); assert.equal(a.options[a.correct], want.label, info); }
}

test('level 6 skill list: unique prefixed ids, level 6, complete fields', () => {
  assert.equal(SKILLS.length, 34);
  assert.equal(new Set(SKILLS.map(s => s.id)).size, SKILLS.length);
  for (const s of SKILLS) {
    assert.match(s.id, /^l6[a-z0-9]+$/);
    assert.equal(s.level, 6);
    assert.equal(s.school, true);
    assert.ok(s.learn.big && s.learn.tips.length >= 3 && s.learn.words.length >= 2, s.id);
    assert.doesNotMatch(JSON.stringify([s.title, s.sub, s.learn]), /\bgrade\b|undefined/i);
    assert.doesNotMatch(JSON.stringify(s), GLYPHS);
    assert.ok(LIMIT[s.id], `no range limit for ${s.id}`);
    assert.ok(STRANDS.includes(s.strand), `${s.id}: strand "${s.strand}" is not one of the ten`);
  }
  assert.equal(SKILLS.filter(s => s.story).length, 1);
});
for (const s of SKILLS) for (const L of [1, 2, 3]) {
  test(`${s.id} step ${L}: ${N} problems recompute, stay in range and vary`, seeded(`${s.id}${L}`, () => {
    const keys = new Set(), kinds = new Set(), shapes = new Set();
    for (let i = 0; i < N; i++) {
      const p = s.gen(L), where = `${s.id} step ${L}`, t = sanity(p, where, NEW_IDS.has(s.id));
      recheck(p, t, where);
      const cap = LIMIT[s.id][L - 1], a = p.answer;
      walk(t, v => assert.ok(Math.abs(v) <= cap, `${where}: operand ${v} over ${cap} in ${JSON.stringify(t)}`));
      if (a.kind === 'num') assert.ok(Math.abs(a.value) <= cap && Number.isInteger(Math.round(a.value * 1000) / 10), `${where}: answer ${a.value} not clean or over ${cap}`);
      if (a.kind === 'frac') assert.ok(a.d > 0 && a.d <= 100 && Math.abs(a.n / a.d) <= cap, `${where}: fraction ${a.n}/${a.d}`);
      if (s.story) assert.ok(p.story && p.read.find && p.read.know.length && p.read.clue && p.read.plan && p.pre, `${where}: story fields`);
      keys.add((p.expr || '') + (p.story || '') + (p.ask || '')); kinds.add(t.kind); shapes.add(t.shape);
    }
    assert.ok(keys.size >= 40, `${s.id} step ${L}: only ${keys.size} different questions in ${N}`);
    if (NEW_IDS.has(s.id)) assert.ok(shapes.size >= 4, `${s.id} step ${L}: only ${shapes.size} question shapes: ${[...shapes]}`);
  }));
}
test('every story source gives a readable story problem at each step', seeded('sources', () => {
  for (const src of STORY_SOURCES) for (const L of [1, 2, 3]) for (let i = 0; i < 50; i++) {
    const p = src(L);
    assert.ok(p.story && p.ask && p.read && ['add', 'sub', 'mul', 'div', 'multi'].includes(p.op), `${src.name}: story shape`);
    recheck(p, sanity(p, src.name), src.name);
  }
}));
test('story problems get harder with the step: one operation, then standard, then several steps', seeded('tiers', () => {
  const story = SKILLS.find(s => s.story).gen;
  for (let i = 0; i < 400; i++) {
    const one = story(1), three = story(3), t1 = one._t;
    assert.notEqual(one.op, 'multi', `step 1 should be a single operation: ${one.story}`);
    walk(t1, v => assert.ok(Math.abs(v) <= 40, `step 1 story has a big number ${v}: ${one.story}`));
    assert.ok(Math.abs(one.answer.value) <= 40, `step 1 answer ${one.answer.value}: ${one.story}`);
    assert.equal(three.op, 'multi', `step 3 should take several steps: ${three.story}`);
  }
}));
test('the plural helper never says "1 points"', () => {
  assert.equal(plural(1, 'point'), '1 point');
  assert.equal(plural(2, 'point'), '2 points');
  assert.equal(plural(-1, 'dollar'), '−1 dollar');
  assert.equal(plural(0.5, 'hour'), '0.5 hours');
  assert.equal(plural(1, 'pair of shorts', 'pairs of shorts'), '1 pair of shorts');
  assert.equal(plural(3, 'branch', 'branches'), '3 branches');
});
