// Level 3 content: every skill, every step, 300 problems each. The stated answer is recomputed here from the
// problem's raw numbers (p._t) with code that shares nothing with the generators.
import test from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS, STORY_SOURCES } from '../js/skills/level3/index.js';
import { check, ANSWER_KINDS } from '../js/util.js';
import { SEED, appKey, operandsShown, regroups, checkWays, checkHint } from './level3-checks.js';
import { EXPECT_NEW } from './level3-new-expect.js';
import { LIMITS_NEW } from './level3-new-limits.js';
import { checkPicture } from './level3-pictures.js';

const N = 300;
const add = xs => xs.reduce((a, x) => a + x, 0);
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const divisors = n => { let c = 0; for (let i = 1; i <= n; i++) if (n % i === 0) c++; return c; };
const prime = n => n > 1 && divisors(n) === 2;
const sign = d => (d < 0 ? '<' : d > 0 ? '>' : '=');
const yes = v => (v ? 'Yes' : 'No');
const plainText = s => String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const numOf = s => Number(plainText(s).replace(/,/g, ''));
const nearest = (n, to) => { const lo = n - (n % to); return n - lo >= to / 2 ? lo + to : lo; };
const angleName = d => (d < 90 ? 'acute' : d === 90 ? 'right' : d < 180 ? 'obtuse' : 'straight');

// Reads a fraction or mixed number out of the option HTML as [top, bottom] of one improper fraction.
function fracOf(html) {
  const m = /^\s*(\d+)?(?:<span class="mxs"><\/span>)?<span class="fr"><span class="n">(\d+)<\/span><span class="d">(\d+)<\/span><\/span>\s*$/.exec(html);
  assert.ok(m, `not a fraction option: ${html}`);
  return [Number(m[1] || 0) * Number(m[3]) + Number(m[2]), Number(m[3])];
}
const sameFrac = (a, c) => a[0] * c[1] === c[0] * a[1];
const SMALL = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
// Turns "three hundred four thousand, sixty-one" back into 304061.
function wordsToNumber(text) {
  let total = 0, group = 0;
  for (const w of text.toLowerCase().replace(/[“”,]/g, ' ').replace(/-/g, ' ').split(/\s+/).filter(Boolean)) {
    if (w === 'hundred') group *= 100;
    else if (w === 'thousand') { total += group * 1000; group = 0; }
    else if (w === 'million') { total += group * 1000000; group = 0; }
    else { assert.ok(w in SMALL, `unknown number word: ${w}`); group += SMALL[w]; }
  }
  return total + group;
}
const top = ([w, n, d]) => w * d + n;
const best = (which, all, value) => o => { const vs = all.map(value); return value(o) === (which === 'greatest' ? Math.max(...vs) : Math.min(...vs)); };

// kind -> expected answer. A number or {n, d} is compared with the answer; a string is the text of the right choice;
// a function is a test that exactly one choice (the marked one) must pass.
const EXPECT = {
  digit: t => (Math.floor(t.n / 10 ** t.p) % 10) * 10 ** t.p, expand: t => t.n - add(t.shown), word: t => wordsToNumber(t.text), std: t => add(t.parts),
  say: t => o => wordsToNumber(o) === t.n, cmp: t => sign(t.a - t.c), shift: t => t.v * 10, times: t => (t.hi / t.lo).toLocaleString('en-US'), extreme: (t, p) => best(t.which, p.answer.options, numOf),
  round: t => nearest(t.n, t.to), which: t => o => nearest(numOf(o), t.to) === t.target, est: t => (t.op === '+' ? nearest(t.a, t.to) + nearest(t.c, t.to) : nearest(t.a, t.to) - nearest(t.c, t.to)),
  add: t => t.a + t.c, sub: t => t.a - t.c, addAll: t => add(t.xs), missAdd: t => t.total - t.known, missSub: t => t.a - t.res, missStart: t => t.res + t.c,
  isfactor: t => yes(t.n % t.a === 0), nth: t => t.i * t.m, pair: t => t.n / t.a, npairs: t => Math.ceil(divisors(t.n) / 2), nfactors: t => divisors(t.n),
  notfactor: t => o => t.n % numOf(o) !== 0, multipleof: t => o => t.ms.every(m => numOf(o) % m === 0), factorof: t => o => t.n % numOf(o) === 0,
  firstcommon: t => { let x = 1; while (x % t.a || x % t.c) x++; return x; },
  pc: t => (prime(t.n) ? 'Prime' : 'Composite'), whichprime: () => o => prime(numOf(o)), whichcomposite: () => o => numOf(o) > 1 && !prime(numOf(o)),
  countprimes: t => { let c = 0; for (let x = t.lo + 1; x < t.hi; x++) if (prime(x)) c++; return c; }, smallfactor: t => { let x = 2; while (t.n % x) x++; return x; },
  mul: t => t.a * t.c, box: t => { assert.equal(t.x * t.y, t.a * t.c - add(t.shown), 'box does not match the other three'); return t.x * t.y; },
  div: t => { const q = Math.trunc(t.n / t.d), r = t.n - q * t.d; return { q, r, up: r ? q + 1 : q, qr: `${q.toLocaleString('en-US')} R${r}` }[t.want]; }, dividend: t => t.q * t.d + t.r,
  equiv: t => ('bot' in t ? t.a[0] * t.bot / t.a[1] : t.a[1] * t.top / t.a[0]), whicheq: t => o => sameFrac(fracOf(o), [t.n, t.d]) !== t.not,
  issimple: t => yes(gcd(t.n, t.d) === 1), gcf: t => gcd(t.n, t.d), simplest: t => o => sameFrac(fracOf(o), [t.n, t.d]) && gcd(...fracOf(o)) === 1, coprime: () => o => gcd(...fracOf(o)) === 1,
  fcmp: t => sign(t.a[0] * t.c[1] - t.c[0] * t.a[1]), fextreme: (t, p) => best(t.which, p.answer.options, o => { const [n, d] = fracOf(o); return n / d; }),
  fwho: (t, p) => p.answer.options[t.a[0] * t.c[1] > t.c[0] * t.a[1] ? 0 : 1],
  fsum: t => ({ n: t.op === '+' ? top(t.a) + top(t.c) : top(t.a) - top(t.c), d: t.a[2] }), split: t => t.n - t.a,
  wholes: t => Math.floor(t.n / t.d), left: t => t.n % t.d, toimp: t => t.w * t.d + t.n, whichmixed: t => o => sameFrac(fracOf(o), [t.n, t.d]), whichimp: t => o => sameFrac(fracOf(o), [t.w * t.d + t.n, t.d]),
  between: t => o => { const [lo, hi] = o.split(' and ').map(Number); return lo * t.d < t.n && t.n < hi * t.d; }, mcmp: t => sign(t.w * t.d + t.n - t.x),
  fmul: t => ({ n: t.w * t.n, d: t.d }), units: t => t.w * t.n, fbetween: t => o => { const [lo, hi] = o.split(' and ').map(Number); return lo * t.d < t.w * t.n && t.w * t.n < hi * t.d; },
  f2d: t => t.w + t.n / t.d, d2f: t => Math.round(t.x * t.d), dot: t => t.lo + t.i * t.step, tenhund: t => (t.dec ? (10 * t.t + t.h) / 100 : 10 * t.t + t.h),
  dcmp: t => sign(Math.round(Number(t.a) * 100) - Math.round(Number(t.c) * 100)), dextreme: (t, p) => best(t.which, p.answer.options, numOf),
  atype: t => angleName(t.deg), turn: t => 360 * t.n / t.d, apart: t => t.total - add(t.known), asum: t => add(t.parts), asumtype: t => angleName(add(t.parts)), clock: t => t.h * 30,
  area: t => t.l * t.w, perim: t => 2 * t.l + 2 * t.w, wFromA: t => t.A / t.l, wFromP: t => t.P / 2 - t.l, areaFromP: t => t.l * (t.P / 2 - t.l), perimFromA: t => 2 * (t.l + t.A / t.l), sqArea: t => (t.P / 4) ** 2,
  fence: t => (t.l + t.w + t.l + t.w) * t.r, laps: t => (t.l + t.w + t.l + t.w) * t.r, floor: t => t.l * t.w * t.r,
  shop: t => (t.bill ? t.bill - (t.q * t.p + t.x) : t.q * t.p + t.x), seats: t => t.r * t.s - t.e, bags: t => (t.wantLeft ? (t.a + t.c) % t.d : Math.floor((t.a + t.c) / t.d)),
  saving: t => t.cost - t.w * t.weeks, trip: t => t.total - t.perDay * t.days, sharing: t => (t.a + t.c) / t.d, compare: t => Math.abs(t.g * t.per - t.other),
  ...EXPECT_NEW,
};

function checkAnswer(p, where) {
  const t = p._t, a = p.answer;
  assert.ok(t && EXPECT[t.kind], `${where}: no recompute rule for kind ${t?.kind}`);
  const want = EXPECT[t.kind](t, p);
  if (typeof want === 'function') {
    assert.equal(a.kind, 'choice', where);
    const pass = a.options.map((o, i) => (want(o) ? i : -1)).filter(i => i >= 0);
    assert.deepEqual(pass, [a.correct], `${where}: choices ${a.options.map(plainText).join(' | ')} for ${JSON.stringify(t)}`);
  } else if (typeof want === 'string') {
    assert.equal(a.kind, 'choice', where);
    assert.equal(plainText(a.options[a.correct]), want, `${where}: ${JSON.stringify(t)}`);
  } else if (typeof want === 'object') {
    assert.equal(a.kind, 'frac', where);
    assert.equal(a.n * want.d, want.n * a.d, `${where}: ${a.n}/${a.d} for ${JSON.stringify(t)}`);
  } else {
    assert.equal(a.kind, 'num', where);
    assert.ok(Math.abs(a.value - want) < 1e-9, `${where}: stated ${a.value}, recomputed ${want} for ${JSON.stringify(t)}`);
  }
}

// Numbers must stay inside what each step is meant to practise. Returns the numbers to check and their [low, high].
const within = (v, lo, hi) => Number.isFinite(v) && v >= lo && v <= hi;
const LIMITS = {
  l3pv: (t, L, p) => p.answer.kind !== 'num' || within(p.answer.value, 1, [99999, 999999, 9999999][L - 1]),
  l3round: (t, L) => within(t.n ?? t.a ?? t.target, 11, [10000, 999999, 9999999][L - 1] * (t.kind === 'which' ? 10 : 1)),
  l3addsub: (t, L) => [t.a, t.c, t.total, t.known, t.res, ...(t.xs || [])].filter(v => v !== undefined).every(v => within(v, 1, [999, 100009, 1000009][L - 1])) && (L > 1 || !['add', 'sub'].includes(t.kind) || regroups(t.a, t.c, t.kind === 'add' ? '+' : '−') <= 1),
  l3mul1: (t, L) => within(t.c, 2, 9) && within(t.a, ...[[11, 900], [102, 999], [1002, 9999]][L - 1]),
  l3mul2: t => within(t.a, 11, 99) && within(t.c, 11, 99),
  l3div: (t, L) => within(t.d, 2, 9) && within(t.n ?? t.q * t.d + t.r, ...[[20, 99], [100, 999], [100, 9999]][L - 1]),
  l3equiv: t => (t.a ? t.a[1] : t.d) <= 144, l3simplify: t => (t.a ? t.a[1] : t.d ?? 0) <= 120,
  l3compare: t => (t.kind === 'fextreme' ? true : within(t.a[1], 2, 24) && within(t.c[1], 2, 24)),
  l3fadd: t => (t.kind === 'split' ? t.d <= 12 : t.a[2] <= 12 && (t.op === '+' || top(t.a) > top(t.c))),
  l3mixed: t => within(t.d, 2, 12), l3fmul: t => t.kind === 'units' || (within(t.d, 2, 12) && within(t.w, 2, 12)),
  l3dec: t => (t.kind === 'f2d' || t.kind === 'd2f' ? t.d === 10 || t.d === 100 : true),
  l3angles: t => [t.deg, t.total, ...(t.known || []), ...(t.parts || [])].filter(v => v !== undefined).every(v => within(v, 1, 360)),
  l3area: (t, L) => (t.l === undefined ? true : within(t.l, 2, [12, 15, 25][L - 1])) && (t.w === undefined || within(t.w, 2, 15)),
  ...LIMITS_NEW,
};

const BAD_TEXT = /undefined|NaN|\bnull\b|\[object|Infinity/;
const BAD_GLYPH = /[\u2190-\u21ff\u2022\u{2600}-\u{10FFFF}]/u; // arrows, bullets, and everything from U+2600 up (symbols, dingbats, emoji)
const STRAY_LT = /<(?![a-zA-Z/])/;
function strings(v, out = []) {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach(x => strings(x, out));
  else if (v && typeof v === 'object') Object.entries(v).forEach(([key, x]) => key !== '_t' && strings(x, out));
  return out;
}
function checkText(p, where) {
  for (const s of strings(p)) {
    assert.ok(!BAD_TEXT.test(s), `${where}: broken text: ${s}`);
    assert.ok(!BAD_GLYPH.test(s), `${where}: decorative symbol in: ${s}`);
    assert.ok(!/\bgrade/i.test(s), `${where}: the word grade in: ${s}`);
  }
  for (const s of strings([p.ask, p.story, p.hint, p.ways, p.read]).map(x => x.replace(/<!--.*?-->/g, ''))) assert.ok(!STRAY_LT.test(s), `${where}: raw < in text: ${s}`);
}
function checkShape(p, where) {
  assert.ok(p.ask || p.expr, `${where}: needs ask or expr`);
  assert.ok(ANSWER_KINDS.includes(p.answer?.kind), `${where}: answer kind`);
  assert.ok(typeof p.hint === 'string' && p.hint.length > 10, `${where}: hint`);
  assert.ok(Array.isArray(p.ways) && p.ways.length >= 2, `${where}: needs at least two ways`);
  for (const w of p.ways) assert.ok(w.t && Array.isArray(w.s) && w.s.length > 0 && w.s.every(x => typeof x === 'string' && x), `${where}: empty way ${w.t}`);
  if (p.answer.kind === 'choice') {
    const o = p.answer.options;
    assert.ok(o.length >= 2 && o.length <= 4, `${where}: ${o.length} choices`);
    assert.equal(new Set(o).size, o.length, `${where}: repeated choice in ${o.map(plainText).join(' | ')}`);
    assert.ok(Number.isInteger(p.answer.correct) && p.answer.correct >= 0 && p.answer.correct < o.length, `${where}: correct index`);
    assert.equal(check(p.answer, p.answer.correct).ok, true, where);
  } else if (p.answer.kind === 'num') {
    assert.ok(Number.isFinite(p.answer.value) && p.answer.value >= 0, `${where}: answer ${p.answer.value}`);
    assert.ok(Math.abs(p.answer.value * 100 - Math.round(p.answer.value * 100)) < 1e-6, `${where}: answer ${p.answer.value} has more than two decimal places`);
    assert.equal(check(p.answer, String(p.answer.value)).ok, true, where);
  } else {
    assert.ok(p.answer.n > 0 && p.answer.d > 0, `${where}: fraction answer ${p.answer.n}/${p.answer.d}`);
  }
  if (p.story) for (const f of ['find', 'clue', 'plan']) assert.ok(p.read?.[f] && Array.isArray(p.read.know), `${where}: story needs read.${f}`);
}
function sample(gen, L) { for (let t = 0; t < 50; t++) { const p = gen(L); if (p) return p; } return null; }

const STRANDS = ['Numbers', 'Adding and subtracting', 'Multiplying and dividing', 'Fractions and decimals', 'Ratios and percents', 'Algebra', 'Measurement', 'Shapes and space', 'Data and chance', 'Stories'];
const NEW_IDS = ['l3times', 'l3pattern', 'l3shift', 'l3fparts', 'l3mixadd', 'l3tenhund', 'l3decorder', 'l3convert', 'l3lineplot', 'l3protractor', 'l3lines', 'l3symmetry', 'l3estimate'];

test('level 3 has its 31 skills with unique, prefixed ids, each with a valid strand', () => {
  assert.equal(SKILLS.length, 31);
  assert.equal(new Set(SKILLS.map(s => s.id)).size, 31);
  for (const id of NEW_IDS) assert.ok(SKILLS.some(s => s.id === id), `${id} is missing`);
  for (const s of SKILLS) {
    assert.match(s.id, /^l3[a-z0-9]+$/);
    assert.equal(s.level, 3);
    assert.equal(s.school, true);
    assert.match(s.std, /^4\./);
    assert.ok(STRANDS.includes(s.strand), `${s.id}: strand ${s.strand}`);
    checkText({ learn: s.learn, title: s.title, sub: s.sub }, s.id);
    assert.ok(s.learn.big.length > 20 && s.learn.tips.length >= 3 && s.learn.words.length >= 2, `${s.id}: learn text`);
  }
  assert.equal(SKILLS.filter(s => s.story).length, 1);
  assert.equal(SKILLS.at(-1).strand, 'Stories', 'the story skill comes last');
});

for (const s of SKILLS) {
  for (const L of [1, 2, 3]) {
    test(`${s.id} step ${L}: ${N} problems recomputed and checked`, () => {
      const keys = new Set(), kinds = new Set();
      for (let i = 0; i < N; i++) {
        const p = sample(s.gen, L), where = `${s.id} step ${L} (seed ${SEED})`;
        assert.ok(p, `${where}: no problem`);
        checkShape(p, where);
        checkText(p, where);
        checkAnswer(p, where);
        operandsShown(p, where);
        checkWays(p, where);
        checkHint(p, where);
        checkPicture(p, where);
        if (LIMITS[s.id]) assert.ok(LIMITS[s.id](p._t, L, p), `${where}: numbers out of range ${JSON.stringify(p._t)}`);
        keys.add(appKey(p));
        kinds.add(p._t.kind);
      }
      assert.ok(!NEW_IDS.includes(s.id) || kinds.size >= 4, `${s.id} step ${L}: only ${kinds.size} question shapes (${[...kinds]})`);
      assert.ok(keys.size >= 30, `${s.id} step ${L}: only ${keys.size} different problems in ${N}`);
    });
  }
}

test('every story source gives a readable story problem at each step', () => {
  assert.ok(STORY_SOURCES.length >= 10);
  for (const src of new Set(STORY_SOURCES)) for (const L of [1, 2, 3]) for (let i = 0; i < 100; i++) {
    const p = sample(src, L), where = `story source ${src.name} step ${L} (seed ${SEED})`;
    assert.ok(p && p.story && p.ask, `${where}: no story`);
    checkAnswer(p, where);
    checkText(p, where);
    operandsShown(p, where);
    checkWays(p, where);
    checkHint(p, where);
    for (const f of ['find', 'clue', 'plan']) assert.ok(p.read[f], `${where}: read.${f}`);
    assert.ok(p.read.know.length >= 2, `${where}: read.know`);
  }
});
