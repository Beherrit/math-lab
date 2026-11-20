// Rules every level 7 problem must obey whatever its skill: wording, hints, the first worked way, and operands on screen.
import assert from 'node:assert/strict';
import { text, ans, nums, has, seenText } from './level7.text.js';

export const BAD = /undefined|NaN|null|\[object|Infinity/;
// The word is fine when it talks about a slope; anywhere else it would be a leaked JavaScript value.
export const leaks = s => BAD.test(text(s).replace(/slope (?:is|are) undefined|undefined slope/gi, ''));
export const SYMBOLS = /[☀-➿\u{1F000}-\u{1FAFF}]/u; // emoji, dingbats, check marks (U+2600 and up)
const ARROWS = /[←-⇿]/u;
// The only arrow allowed is the mapping arrow inside a coordinate rule such as "(x, y) → (−x, y)".
export const arrowsOutsideRules = s => ARROWS.test(s.replace(/\(x, y\) → \(/g, '('));
// Terms the equation does not have: "+ 0", "0 ×", "+ -3", "0x", "1x".
const INVENTED = [/ \+ 0(?![\d.])/, /(?<![×\d.\w] )(?<![\d.\w])0 × /, /(?<![×\d.\w] )(?<![\d.\w])0 \+ \d*[a-z]/, / \+ -/, /(^|[^\d.\w])0[xy]\b/, /(^|[^\d.\w])1[xy]\b/,
  // a count of one with a plural noun: "1 hours", "1 steps"
  /(?<![\d.\w/])1 (?:hours|weeks|minutes|steps|days|months|kilometers|meters|years|games|rows|times|tickets|copies|cups)\b/];
export function inventedTerm(str) { const t = text(str); return INVENTED.find(r => r.test(t)) ? t : null; }

const DETECTIVE = 'Read it like a detective';
// Operands the answer depends on, per kind of recomputation, that a child must be able to read in the question.
const OPERANDS = {
  exp: t => (t.miss ? [] : [t.m, t.n, t.p ?? 0]),
  sciop: t => [t.a, t.m, t.c, t.n],
  lineq: t => [...t.L[0].slice(1), ...t.R[0].slice(1)],
  line: t => [t.m, t.c, t.ask === 'y' ? t.x : t.y].filter(v => v !== undefined),
  sys: t => [t.e1[2], ...t.e2],
  pyth: t => (t.find === 'hyp' ? [t.a, t.c] : t.find === 'leg' ? [t.a, t.h] : []),
  vol: t => [t.r, t.h],
  rootperim: t => [t.N],
  slope: t => (t.rows ? [] : [...t.p, ...t.q]),
  slopemiss: t => [t.n / t.d, ...t.p, t.x2],
  scpred: t => [t.m, t.c, t.x],
};
// Zero and one are often written by leaving a term out ("y = 5x"), so they are not required to appear.
export function operandsShown(p) {
  const need = OPERANDS[p._t.k]?.(p._t);
  if (!need || (p.visual && /<svg/.test(p.visual))) return;
  const seen = nums(seenText(p));
  for (const v of need.filter(x => Math.abs(x) > 1)) assert.ok(has(seen, v), `operand ${v} is not in the question: ${text(seenText(p)).slice(0, 160)}`);
}
// The hint must help without giving the answer away. A number that is also in the question is an operand, not a leak.
export function hintKeepsAnswer(p) {
  const a = p.answer, hint = text(p.hint), asked = nums(seenText(p));
  if (a.kind === 'num' || a.kind === 'frac') {
    const v = a.kind === 'num' ? Math.abs(a.value) : Math.abs(a.n / a.d);
    if (v > 1 && !has(asked, v)) assert.ok(!has(nums(p.hint), v), `the hint gives the answer ${v}: ${hint}`);
  } else if (a.kind === 'choice') {
    const right = text(a.options[a.correct]).toLowerCase();
    if (right.length > 3) assert.ok(!hint.toLowerCase().includes(right), `the hint gives the answer "${right}": ${hint}`);
  } else assert.ok(!hint.includes(`(${a.x}, ${a.y})`), `the hint gives the point: ${hint}`);
}
// For a number answer the first worked way finishes on that number (stories skip the read-it-first way).
export function firstWayEnds(p) {
  if (p.answer.kind !== 'num' && p.answer.kind !== 'frac') return;
  const way = p.ways.find(w => w.t !== DETECTIVE), last = way.s[way.s.length - 1], v = Math.abs(ans(p));
  assert.ok(has(nums(last), v), `the first way does not end on ${v}: ${text(last).slice(0, 140)}`);
}
