import test from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS, STORY_SOURCES } from '../js/skills/level7/index.js';
import { FITS } from '../js/skills/level7/scatter-lines.js';
import { check, ANSWER_KINDS } from '../js/util.js';
import { CHECKS, text } from './level7.checks.js';
import { COVER } from './level7.facts.js';
import { CAP_NEW, NEW_IDS, STRANDS } from './level7.new.js';
import { leaks, SYMBOLS, arrowsOutsideRules, inventedTerm, operandsShown, hintKeepsAnswer, firstWayEnds } from './level7.rules.js';

// A seeded random source, so a failing run can be repeated: LEVEL7_SEED=1234 node --test tests/level7.test.js
const SEED = Number(process.env.LEVEL7_SEED) || Math.floor(Math.random() * 2 ** 31);
let state = SEED;
Math.random = () => { state = (state + 0x6D2B79F5) | 0; let t = Math.imul(state ^ (state >>> 15), 1 | state); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
console.log(`level 7 test seed ${SEED}`);
process.on('exit', code => { if (code) console.error(`level 7 test failed with seed ${SEED}: rerun with LEVEL7_SEED=${SEED}`); });

const N = 300;
// The biggest prediction a step 3 line of best fit can make: every corner of the slope, start and x ranges.
const corners = f => [f.m[0], f.m[1]].flatMap(m => [f.c[0], f.c[1]].flatMap(c => [f.xs[0], f.xs[1]].map(x => Math.abs(m * x + c))));
const SCATTER_MAX = Math.max(...FITS.flatMap(corners));
// Largest size a typed number answer may have at each step (keeps every step in its intended range).
const CAP = { l7explaw: [8, 36, 36], l7expneg: [1, 16, 30], l7sci: [9.9e6, 9.9e7, 9.9e7], l7sciops: [14, 16, 20], l7roots: [12, 50, 20], l7rational: [0, 0, 0], l7eqboth: [9, 9, 9], l7eqcount: [0, 0, 60],
  l7slope: [8, 6, 30], l7line: [60, 65, 30], l7func: [70, 80, 400], l7sys: [0, 9, 10], l7pyth: [181, 50, 50], l7trans: [0, 0, 0], l7angles: [180, 180, 180], l7vol: [250, 500, 1400], l7scatter: [10, 10, SCATTER_MAX], l7story: [310, 1400, 3800], ...CAP_NEW };
function strings(o, out = []) {
  if (typeof o === 'string') out.push(o);
  else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) if (k !== '_t') strings(v, out);
  return out;
}
const right = a => (a.kind === 'num' ? String(a.value) : a.kind === 'frac' ? { w: '', n: String(Math.abs(a.n)), d: String(a.d), neg: a.n < 0 } : a.kind === 'choice' ? a.correct : { x: a.x, y: a.y });
const wrong = a => (a.kind === 'num' ? String(a.value + 1) : a.kind === 'frac' ? { w: '', n: String(Math.abs(a.n) + 1), d: String(a.d), neg: a.n < 0 } : a.kind === 'choice' ? (a.correct + 1) % a.options.length : { x: a.x + 1, y: a.y });
function sane(p, s, L) {
  const where = `${s.id} step ${L}: ${text(p.expr || p.ask)}`;
  assert.ok(p.ask || p.expr, 'needs ask or expr');
  assert.ok(ANSWER_KINDS.includes(p.answer.kind), where);
  assert.equal(check(p.answer, right(p.answer)).ok, true, `right answer rejected, ${where}`);
  assert.equal(check(p.answer, wrong(p.answer)).ok, false, `wrong answer accepted, ${where}`);
  assert.ok(typeof p.hint === 'string' && p.hint.length > 10, `hint missing, ${where}`);
  assert.ok(Array.isArray(p.ways) && p.ways.length >= 2, `needs two ways, ${where}`);
  for (const w of p.ways) assert.ok(w.t && Array.isArray(w.s) && w.s.length >= 1 && w.s.every(x => typeof x === 'string' && x.length > 0), `empty way, ${where}`);
  for (const str of strings(p)) {
    assert.ok(!leaks(str), `bad text "${str.slice(0, 120)}", ${where}`);
    assert.ok(!SYMBOLS.test(str), `decorative symbol in "${str.slice(0, 120)}", ${where}`);
    assert.ok(!arrowsOutsideRules(str), `an arrow outside a coordinate rule in "${str.slice(0, 120)}", ${where}`);
    assert.ok(!/\bgrade\b/i.test(str), `the word grade, ${where}`);
    assert.equal(inventedTerm(str), null, `a term the equation does not have in "${str.slice(0, 120)}", ${where}`);
  }
  hintKeepsAnswer(p); firstWayEnds(p);
  if (p.answer.kind === 'choice') {
    const opts = p.answer.options.map(text);
    assert.ok(opts.length >= 2 && opts.length <= 4, `2 to 4 options, ${where}`);
    assert.equal(new Set(opts).size, opts.length, `duplicate options ${opts.join(' | ')}, ${where}`);
    assert.ok(p.answer.correct >= 0 && p.answer.correct < opts.length, `no correct option, ${where}`);
  }
  if (p.answer.kind === 'num') assert.ok(Math.abs(p.answer.value) <= CAP[s.id][L - 1], `answer ${p.answer.value} is outside the range for this step, ${where}`);
  if (p.answer.kind === 'point') assert.ok([p.answer.x, p.answer.y].every(v => Number.isInteger(v) && v >= 0 && v <= 10) && /class="viz plane tap"/.test(p.visual), `point answer needs a tappable 0 to 10 grid, ${where}`);
  if (p.answer.kind === 'frac') assert.ok(p.answer.d > 1 && p.answer.d <= 1000, `fraction answer ${p.answer.n}/${p.answer.d}, ${where}`);
}
test('level 7 skills: ids, fields and wording', () => {
  assert.ok(SKILLS.length >= 17);
  assert.equal(new Set(SKILLS.map(s => s.id)).size, SKILLS.length);
  for (const s of SKILLS) {
    assert.match(s.id, /^l7[a-z]+$/); assert.equal(s.level, 7); assert.equal(s.school, true);
    assert.ok(s.std && s.title && s.sub && typeof s.gen === 'function');
    assert.ok(s.learn && s.learn.big && s.learn.tips.length >= 3 && s.learn.words.length >= 2, `learn card for ${s.id}`);
    for (const str of strings([s.title, s.sub, s.learn])) assert.ok(!leaks(str) && !SYMBOLS.test(str) && !arrowsOutsideRules(str) &&!/\bgrade\b/i.test(str), `${s.id}: ${str}`);
    assert.ok(CAP[s.id], `no range set for ${s.id}`);
    assert.ok(STRANDS.includes(s.strand), `${s.id} has strand ${s.strand}`);
  }
  assert.equal(SKILLS.filter(s => s.story).length, 1);
});
const seen = {}, shapes = {};
for (const s of SKILLS) for (const L of [1, 2, 3]) {
  test(`${s.id} step ${L}: ${N} problems are sane and match an independent recomputation`, () => {
    const keys = new Set();
    for (let i = 0; i < N; i++) {
      const p = s.gen(L);
      assert.ok(p, 'no problem generated');
      Object.assign(p, { skill: s.id, level: L });
      sane(p, s, L);
      assert.ok(p._t && CHECKS[p._t.k], `no recomputation for ${s.id} step ${L}: ${text(p.ask)}`);
      CHECKS[p._t.k](p._t, p, L);
      operandsShown(p);
      (seen[s.id] ??= new Set()).add(p._t.k);
      if (p._t.shape) ((shapes[s.id] ??= {})[L] ??= new Set()).add(p._t.shape);
      keys.add((p.expr || '') + (p.story || '') + (p.ask || ''));
    }
    assert.ok(keys.size >= 30, `only ${keys.size} different questions in ${N}`);
    if (NEW_IDS.includes(s.id)) assert.ok(shapes[s.id][L].size >= 4, `${s.id} step ${L} has only ${shapes[s.id][L].size} question shapes: ${[...shapes[s.id][L]].join(', ')}`);
  });
}
test('story problems carry everything the story screen needs', () => {
  assert.ok(STORY_SOURCES.length >= 13);
  const story = SKILLS.find(s => s.story);
  for (let i = 0; i < N; i++) {
    const p = story.gen(1 + (i % 3));
    assert.ok(p.story && p.ask && p.read && p.read.find && p.read.clue && p.read.plan && p.read.know.length >= 2);
    assert.ok(['add', 'sub', 'mul', 'div', 'multi'].includes(p.op) && p.pre && p.pre.options.includes(p.pre.correct));
    assert.equal(p.ways[0].t, 'Read it like a detective');
  }
});
test('story problems get harder with the step', () => {
  const story = SKILLS.find(s => s.story), kinds = L => Array.from({ length: 600 }, () => story.gen(L)._t).map(t => (t.k === 'vol' ? `vol-${t.shape}` : t.k === 'line' ? `line-${t.ask}` : t.k));
  const one = new Set(kinds(1)), three = new Set(kinds(3));
  for (const k of one) assert.ok(['pyth', 'slope', 'scpred', 'line-y', 'propcmp'].includes(k), `step 1 story of kind ${k} is not a single-idea problem`);
  for (const k of ['lineq', 'sys', 'vol-cone', 'rootperim', 'sciop', 'line-x']) assert.ok(three.has(k), `step 3 never asks ${k}`);
  for (const k of ['lineq', 'sys', 'vol-cone']) assert.ok(!new Set(kinds(2)).has(k), `step 2 story of kind ${k} belongs to step 3`);
});
test('both upright and flat lines are asked about, and both special answers are offered', () => {
  assert.ok(COVER.upright >= 5 && COVER.flat >= 5, `upright ${COVER.upright}, flat ${COVER.flat}`);
});
test('the step 3 prediction cap is the true maximum of the generator ranges', () => {
  let top = 0;
  for (const f of FITS) for (let m = f.m[0]; m <= f.m[1]; m++) for (let c = f.c[0]; c <= f.c[1]; c++) for (let x = f.xs[0]; x <= f.xs[1]; x++) top = Math.max(top, Math.abs(m * x + c));
  assert.equal(SCATTER_MAX, top);
});
test('every kind of recomputation was exercised', () => {
  const used = new Set(Object.values(seen).flatMap(k => [...k]));
  for (const k of Object.keys(CHECKS)) assert.ok(used.has(k), `check "${k}" never ran`);
});
test('the level reads as a learning path: every new skill is present and the story skill is last', () => {
  assert.equal(NEW_IDS.length, 14);
  for (const id of NEW_IDS) assert.ok(SKILLS.some(s => s.id === id), `${id} is missing`);
  assert.equal(SKILLS[SKILLS.length - 1].story, true);
  assert.equal(SKILLS.length, 32);
});
