import test from 'node:test';
import assert from 'node:assert/strict';
import { KINDS } from './level4.kinds.js';
import { plain, rendered, numbers, has, count, badArithmetic } from './level4.render.js';

// Level 4 checks (used by tests/level4.test.js and level4.original.js). Random numbers come from a seeded generator:
// a failure prints the seed, and L4_SEED=<seed> repeats the run.
const SEED = Number(process.env.L4_SEED) || (Date.now() % 2147483647);
const mulberry32 = a => () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const hash = s => [...s].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261);
export const seeded = (name, fn) => test(name, () => {
  Math.random = mulberry32(SEED ^ hash(name));
  try { fn(); } catch (e) { const note = `level 4 seed ${SEED}: run again with L4_SEED=${SEED}`; console.error(note); e.message += `\n[${note}]`; throw e; }
});
export const N = 300;
const close = (x, y) => Math.abs(x - y) < 1e-9;
const decimals = v => { const s = String(+(+v).toPrecision(12)); return s.includes('.') ? s.length - s.indexOf('.') - 1 : 0; };
const BAD_ARROW = /[←-⇿]/, BAD_HIGH = /[☀-\u{10FFFF}]/u;
// Every string a child could see (everything except the raw operands). skipVisual leaves out pictures from shared code.
export function texts(p, skipVisual = false) {
  const out = []; const walk = v => { if (typeof v === 'string') out.push(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
  walk({ ...p, _t: null, visual: skipVisual ? null : p.visual, answer: p.answer.kind === 'choice' ? p.answer.options : null });
  return out;
}
const rawAngle = s => /<(?![a-zA-Z/!])/.test(s) || /[<>]/.test(s.replace(/<!--[\s\S]*?-->/g, '').replace(/<\/?[a-zA-Z][^<>]*>/g, ''));
export function checkWords(s, where, { angle = true } = {}) {
  const text = plain(s);
  assert.ok(!/undefined|NaN|null|Infinity|\[object/.test(text), `${where}: bad text "${text.slice(0, 90)}"`);
  assert.ok(!/\bgrades?\b/i.test(text), `${where}: says grade`);
  assert.ok(!/\p{Extended_Pictographic}|[✓-✘]/u.test(text), `${where}: emoji or icon glyph in "${text.slice(0, 60)}"`);
  assert.ok(!BAD_ARROW.test(s), `${where}: arrow glyph in "${text.slice(0, 80)}"`);
  assert.ok(!BAD_HIGH.test(s), `${where}: decorative symbol in "${text.slice(0, 80)}"`);
  if (angle) assert.ok(!rawAngle(s), `${where}: raw < or > in "${s.slice(0, 90)}"`);
}
export function checkText(p, where, opts) {
  texts(p, opts?.skipVisual).forEach(s => checkWords(s, where, opts));
  assert.ok(typeof p.hint === 'string' && p.hint.length > 10, `${where}: hint`);
  assert.ok(Array.isArray(p.ways) && p.ways.length >= 2, `${where}: needs at least two ways, has ${p.ways && p.ways.length}`);
  assert.ok(p.ways.every(w => w.t && w.s.length >= 1 && w.s.every(Boolean)), `${where}: ways`);
}
export function checkShape(a, where) {
  if (a.kind === 'num') { assert.ok(Number.isFinite(a.value) && Math.abs(a.value) < 1e6, `${where}: value`); assert.ok(decimals(a.value) <= 3, `${where}: ugly decimal ${a.value}`); assert.ok(a.value >= 0 || a.signed, `${where}: negative without sign key`); }
  if (a.kind === 'frac') assert.ok(Number.isInteger(a.n) && Number.isInteger(a.d) && a.d > 0 && a.d <= 1000 && a.n > 0, `${where}: fraction ${a.n}/${a.d}`);
  if (a.kind === 'choice') { assert.ok(a.options.length >= 2 && a.options.length <= 4, `${where}: option count`); assert.equal(new Set(a.options.map(plain)).size, a.options.length, `${where}: duplicate options`); assert.ok(a.correct >= 0 && a.correct < a.options.length, `${where}: correct index`); }
}
// Compare the stated answer with the independent recomputation from the raw operands.
export function checkAnswer(p, where) {
  const a = p.answer, k = KINDS[p._t.k];
  assert.ok(k, `${where}: no recomputation for kind ${p._t.k}`);
  const want = k.rec(p._t, p), opts = a.kind === 'choice' ? a.options.map(plain) : [];
  if (want && want.solve) { assert.ok(want.solve(a.value), `${where}: ${a.value} does not make the sentence true`); assert.ok(!want.solve(a.value + 1), `${where}: answer not unique`); return; }
  if (want && want.test) { const hits = opts.map((o, i) => (want.test(o) ? i : -1)).filter(i => i >= 0); assert.deepEqual(hits, [a.correct], `${where}: options passing the check ${hits}, marked ${a.correct} (${opts})`); return; }
  if (want && want.pick) return assert.equal(want.pick(opts), a.correct, `${where}: picked option differs (${opts})`);
  if (a.kind === 'point') return assert.deepEqual({ x: a.x, y: a.y }, want, `${where}: point`);
  if (a.kind === 'choice') return assert.equal(opts[a.correct], want, `${where}: choice`);
  const [n, d] = Array.isArray(want) ? want : [want, 1];
  if (a.kind === 'frac') return assert.ok(close(a.n * d, n * a.d), `${where}: stated ${a.n}/${a.d}, recomputed ${n}/${d}`);
  assert.ok(close(a.value, n / d), `${where}: stated ${a.value}, recomputed ${n / d}`);
}
// The operands the answer depends on must be readable in the question the child sees (question text, picture or answer buttons).
export function checkShown(p, where) {
  const k = KINDS[p._t.k], seen = rendered(p), lower = seen.toLowerCase(), nums = numbers(seen), opts = p.answer.kind === 'choice' ? numbers(p.answer.options.map(plain).join(' ; ')) : [];
  for (const x of k.show(p._t)) {
    if (typeof x === 'number') assert.ok(has(nums, x) || has(opts, x), `${where}: the question does not show ${x}; it shows ${nums.join(', ')}`);
    else assert.ok(lower.includes(String(x).toLowerCase()), `${where}: the question does not say "${x}": ${seen.slice(0, 120)}`);
  }
  if (k.custom) k.custom(p, p._t);
}
function states(step, a) {
  const text = plain(step), nums = numbers(text);
  if (a.kind === 'num') return has(nums, a.value);
  if (a.kind === 'frac') return has(nums, a.n / a.d);
  if (a.kind === 'point') return text.includes(`(${a.x}, ${a.y})`);
  return text.toLowerCase().replace(/\s+/g, ' ').includes(plain(a.options[a.correct]).toLowerCase().replace(/\s+/g, ' '));
}
export function checkWays(p, where) {
  const a = p.answer, ways = p.ways.filter(w => !/^Read it like a detective/.test(w.t)), first = ways[0].s;
  assert.ok(states(first[first.length - 1], a), `${where}: the last step of the first way does not state the answer: "${plain(first[first.length - 1]).slice(0, 110)}"`);
  for (const w of ways) {
    assert.ok(w.s.some(s => states(s, a)), `${where}: way "${w.t}" never states the answer`);
    for (const s of w.s) assert.equal(badArithmetic(plain(s)), null, `${where}: way "${w.t}" has a false sum: ${badArithmetic(plain(s))}`);
  }
}
// A hint may point at the first step but must not hand over the answer.
export function checkHint(p, where) {
  const a = p.answer, hint = plain(p.hint), seen = rendered(p), qn = numbers(seen);
  const hn = numbers(hint).filter(x => ![1, 2, 10, 100, 1000].includes(x));
  const leak = a.kind === 'num' ? has(hn, a.value) && !has(qn, a.value) : a.kind === 'frac' ? hint.includes(`${a.n}/${a.d}`) && !seen.includes(`${a.n}/${a.d}`)
    : a.kind === 'point' ? hint.includes(`(${a.x}, ${a.y})`) : plain(a.options[a.correct]).length > 3 && hint.includes(plain(a.options[a.correct])) && !seen.includes(plain(a.options[a.correct]));
  assert.ok(!leak, `${where}: the hint gives the answer away: "${hint}"`);
}
