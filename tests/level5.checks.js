import test from 'node:test';
import assert from 'node:assert/strict';
import { neg } from './level5.recompute.js';
import { EXACT } from './level5.shown.js';
import { REC, SHOWN, CUSTOM, RANGE as RANGE_ALL } from './level5.groups.js';
import { plain, rendered, numbers, has, count, badArithmetic } from './level5.render.js';

// Level 5 checks (used by tests/level5.test.js). For every skill and step it generates many problems and checks, on what the child would see:
// the answer against an independent recomputation (level5.recompute.js), the operands against the rendered question
// (level5.shown.js), the worked steps against the answer and their own arithmetic, the hints, and the text itself.
// Random numbers come from a seeded generator: a failure prints the seed, and L5_SEED=<seed> repeats the run.
// The older kinds and the kinds added with the newer skills live in separate files (level5.groups.js merges them).
export const RANGE = RANGE_ALL;
const SEED = Number(process.env.L5_SEED) || (Date.now() % 2147483647);
const mulberry32 = a => () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const hash = s => [...s].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261);
export const seeded = (name, fn) => test(name, () => {
  Math.random = mulberry32(SEED ^ hash(name));
  try { fn(); } catch (e) { const note = `level 5 seed ${SEED}: run again with L5_SEED=${SEED}`; console.error(note); e.message += `\n[${note}]`; throw e; }
});

export const N = 300;
const strip = plain;
const close = (x, y) => Math.abs(x - y) < 1e-9;
const decimals = v => { const s = String(+(+v).toPrecision(12)); return s.includes('.') ? s.length - s.indexOf('.') - 1 : 0; };
const BAD_ARROW = /[←-⇿]/;
const BAD_HIGH = /[☀-\u{10FFFF}]/u;
const RULE_ARROW = /\(x, y\) → \(/g; // the one place an arrow is standard notation
// Every string a child could see (everything except the raw operands).
export function texts(p) {
  const out = []; const walk = v => { if (typeof v === 'string') out.push(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
  walk({ ...p, _t: null, answer: p.answer.kind === 'choice' ? p.answer.options : null });
  return out;
}
// A bare < or > in text would be read as markup: they must be written &lt; and &gt;.
const rawAngle = s => /<(?![a-zA-Z/!])/.test(s) || /[<>]/.test(s.replace(/<!--[\s\S]*?-->/g, '').replace(/<\/?[a-zA-Z][^<>]*>/g, ''));
export function checkWords(s, where) {
  const text = plain(s), loose = s.replace(RULE_ARROW, '');
  assert.ok(!/undefined|NaN|null|Infinity|\[object/.test(text), `${where}: bad text "${text.slice(0, 90)}"`);
  assert.ok(!/\bgrades?\b/i.test(text), `${where}: says grade`);
  assert.ok(!/\p{Extended_Pictographic}|[✓-✘]/u.test(text), `${where}: emoji or icon glyph in "${text.slice(0, 60)}"`);
  assert.ok(!BAD_ARROW.test(loose), `${where}: arrow glyph in "${text.slice(0, 80)}"`);
  assert.ok(!BAD_HIGH.test(loose), `${where}: decorative symbol in "${text.slice(0, 80)}"`);
  assert.ok(!rawAngle(s), `${where}: raw < or > in "${s.slice(0, 90)}"`);
}
export function checkText(p, where) {
  texts(p).forEach(s => checkWords(s, where));
  assert.ok(typeof p.hint === 'string' && p.hint.length > 10, `${where}: hint`);
  assert.ok(Array.isArray(p.ways) && p.ways.length >= 2, `${where}: every problem needs at least two ways, has ${p.ways && p.ways.length}`);
  assert.ok(p.ways.every(w => w.t && w.s.length >= 1 && w.s.every(Boolean)), `${where}: ways`);
}
export function checkShape(a, where) {
  if (a.kind === 'num') { assert.ok(Number.isFinite(a.value) && Math.abs(a.value) < 1e6, `${where}: value`); assert.ok(decimals(a.value) <= 3, `${where}: ugly decimal ${a.value}`); assert.ok(a.value >= 0 || a.signed, `${where}: negative without sign key`); }
  if (a.kind === 'frac') assert.ok(Number.isInteger(a.n) && Number.isInteger(a.d) && a.d > 0 && a.d <= 1000 && a.n > 0, `${where}: fraction ${a.n}/${a.d}`);
  if (a.kind === 'choice') { assert.ok(a.options.length >= 2 && a.options.length <= 4, `${where}: option count`); assert.equal(new Set(a.options.map(strip)).size, a.options.length, `${where}: duplicate options ${a.options.map(strip)}`); assert.ok(a.correct >= 0 && a.correct < a.options.length, `${where}: correct index`); }
}
// Compare the stated answer with the recomputed one.
export function checkAnswer(p, where) {
  const a = p.answer, rec = REC[p._t.k];
  assert.ok(rec, `${where}: no recomputation for kind ${p._t.k}`);
  const want = rec(p._t);
  if (want && want.solve) { assert.ok(want.solve(a.value), `${where}: ${a.value} does not make the identity true`); assert.ok(!want.solve(a.value + 1), `${where}: answer not unique`); return; }
  if (want && want.test) { const hits = a.options.map((o, i) => (want.test(strip(o).includes(':') || /^[−\d., ]+$/.test(strip(o)) ? strip(o) : o) ? i : -1)).filter(i => i >= 0); assert.deepEqual(hits, [a.correct], `${where}: options passing the check ${hits}, marked ${a.correct} (${a.options.map(strip)})`); return; }
  if (a.kind === 'point') return assert.deepEqual({ x: a.x, y: a.y }, want, `${where}: point`);
  if (a.kind === 'choice') return assert.equal(strip(a.options[a.correct]), strip(typeof want === 'object' ? `(${neg(want.x)}, ${neg(want.y)})` : want), `${where}: choice`);
  const [n, d] = Array.isArray(want) ? want : [want, 1];
  if (a.kind === 'frac') return assert.ok(close(a.n * d, n * a.d), `${where}: stated ${a.n}/${a.d}, recomputed ${n}/${d}`);
  assert.ok(close(a.value, n / d), `${where}: stated ${a.value}, recomputed ${n / d}`);
}
// The operands the answer depends on must be readable in the question the child sees (not just stored in _t).
export function checkShown(p, where) {
  const k = p._t.k, rule = SHOWN[k];
  assert.ok(rule, `${where}: no displayed-operand rule for kind ${k}`);
  const asked = plain([p.story, p.ask, p.expr].filter(Boolean).join(' ')), text = rendered(p), lower = text.toLowerCase(), nums = numbers(text), opts = p.answer.kind === 'choice' ? numbers(p.answer.options.map(plain).join(' ; ')) : [];
  const need = rule(p._t), wanted = need.filter(x => typeof x === 'number'), shownIn = [...nums, ...opts];
  for (const x of need) {
    if (typeof x === 'number') assert.ok(count(nums, x) >= wanted.filter(w => close(w, x)).length, `${where}: the question does not show ${x} (needed by the answer); it shows ${nums.join(', ')}`);
    else if (x && typeof x === 'object' && !Array.isArray(x)) assert.ok(has(shownIn, typeof x.o === 'number' ? x.o : NaN) || lower.includes(String(x.o).toLowerCase()) || p.answer.options.some(o => plain(o) === plain(x.o)), `${where}: ${x.o} is not on screen`);
    else if (Array.isArray(x)) assert.ok(x.some(w => lower.includes(w)), `${where}: none of ${x} in the question`);
    else assert.ok(lower.includes(String(x).toLowerCase()), `${where}: the question does not say "${x}": ${text.slice(0, 120)}`);
  }
  if (EXACT.has(k) && !p.story) for (const n of numbers(asked)) assert.ok(wanted.some(w => close(w, n)), `${where}: the question shows ${n}, which the answer does not use (uses ${wanted.join(', ')})`);
  if (CUSTOM[k]) CUSTOM[k](p, p._t);
}
// Does a worked step state the answer?
function states(step, a) {
  const text = plain(step), nums = numbers(text);
  if (a.kind === 'num') return has(nums, a.value);
  if (a.kind === 'frac') return has(nums, a.n / a.d);
  if (a.kind === 'point') return text.includes(`(${neg(a.x)}, ${neg(a.y)})`);
  return text.toLowerCase().replace(/\s+/g, ' ').includes(plain(a.options[a.correct]).toLowerCase().replace(/\s+/g, ' '));
}
export function checkWays(p, where) {
  // The story skill puts a reading way (no sums) in front of the solving ways.
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
  // 1, 2, 10, 100 and 1000 turn up in hints as plain method words ("divide by 10"); a figure followed by % is a percent, not the answer.
  const hn = numbers(hint.replace(/\d[\d,.]*%/g, a.suffix === '%' ? '$&' : ' ')).filter(x => ![1, 2, 10, 100, 1000].includes(x));
  const leak = a.kind === 'num' ? has(hn, a.value) && !has(qn, a.value) : a.kind === 'frac' ? hint.includes(`${a.n}/${a.d}`) && !seen.includes(`${a.n}/${a.d}`)
    : a.kind === 'point' ? hint.includes(`(${neg(a.x)}, ${neg(a.y)})`) : plain(a.options[a.correct]).length > 3 && hint.includes(plain(a.options[a.correct])) && !seen.includes(plain(a.options[a.correct]));
  assert.ok(!leak, `${where}: the hint gives the answer away: "${hint}"`);
}
