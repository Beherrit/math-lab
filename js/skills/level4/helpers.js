// Shared helpers for the Level 4 skills added in the second pass (files named after their topic, not the original six).
import { choice, rnd, fmt, fr, shuffle } from '../../util.js';

// Hidden marker so two problems that differ only in their picture still get different repeat-detection keys.
const mark = t => `<!--${JSON.stringify(t).replace(/null/g, '').replace(/[^\w.-]+/g, ' ').trim()}-->`;
// Attach the raw operands under _t so tests can recompute the answer on their own.
export const T = (p, k, t = {}) => ({ ...p, ask: p.visual ? p.ask + mark(t) : p.ask, _t: { k, ...t } });
export const BLANK = '<span class="blank">?</span>';
// Count next to its noun: pl(3, 'place') is "3 places", pl(1, 'place') is "1 place".
export const pl = (n, one, many = one + 's') => `${fmt(n)} ${n === 1 ? one : many}`;
export const rndNot = (a, b, bad = []) => { let v; do v = rnd(a, b); while (bad.includes(v)); return v; };
export const sum = xs => xs.reduce((a, x) => a + x, 0);
// A value with its unit: one whole or less is singular ("3/4 mile", "1 mile"), more is plural ("1 1/2 miles").
export const frUnit = (n, d, one, many = one + 's') => `${fr(n, d)} ${n <= d ? one : many}`;
// Choice whose options are all formatted the same way, so equal values can never show twice.
export const numChoice = (c, ds, f = fmt) => choice(f(c), ds.filter(d => d !== c && Number.isFinite(d)).map(f));
// Comparison signs inside HTML text must be written as entities.
export const sg = s => ({ '<': '&lt;', '>': '&gt;' }[s] ?? s);
// "Help me read it" block for story-shaped questions.
export const rd = (find, know, clue, plan) => ({ find, know, clue, plan });
export const cents = x => Math.round(x * 100);
// n different digits in random order; the first one is never 0 (it is the leading digit of a number).
export function distinctDigits(n) {
  const out = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, n + 1);
  if (out[0] === 0) [out[0], out[n]] = [out[n], out[0]];
  return out.slice(0, n);
}
