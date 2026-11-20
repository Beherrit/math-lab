// Small shared helpers for the level 6 generators: signed-number text, linear expressions, choices, test tags.
import { R, rnd, fmt, num, choice } from '../../util.js';

// A random whole number from lo to hi that is never zero.
export const nz = (lo, hi) => { let v = 0; while (v === 0) v = rnd(lo, hi); return v; };
// A negative number wears parentheses when it follows an operation sign: 4 + (−3).
export const par = v => (v < 0 ? `(${fmt(v)})` : fmt(v));
// The size of a number without its sign (its distance from zero).
export const size = v => fmt(Math.abs(v));
export const signName = v => (v < 0 ? 'negative' : 'positive');
// "3x", "x", "−x", "−2.5x"
export const xTerm = (c, v = 'x') => (c === 1 ? v : c === -1 ? '−' + v : fmt(c) + v);
// "3x − 4", "−x + 2", "5x", "7"
export function lin(a, c, v = 'x') {
  if (a === 0) return fmt(c);
  if (c === 0) return xTerm(a, v);
  return `${xTerm(a, v)} ${c < 0 ? '−' : '+'} ${size(c)}`;
}
// "+ 5" or "− 5", for building an expression one term at a time.
export const plusMinus = (v, text = size(v)) => `${v < 0 ? '−' : '+'} ${text}`;
// Attach the raw operands so the tests can recompute the answer on their own. The app ignores this field.
export const tag = (p, t) => { p._t = t; return p; };
// A typed answer that always shows the plus/minus key, so the key never gives the sign away.
export const snum = v => num(v, { signed: true });
// Number choices: the right value, wrong values that come from real mistakes, padded so there are always 4 buttons.
export function numChoice(correct, wrongs, show = fmt) {
  const seen = new Set([R(correct)]); const out = [];
  for (const w of [...wrongs, correct + 1, correct - 1, correct + 2, correct + 10]) {
    const v = R(w);
    if (Number.isFinite(v) && !seen.has(v)) { seen.add(v); out.push(show(v)); }
  }
  return choice(show(correct), out.slice(0, 3));
}
export const yesNo = yes => choice(yes ? 'Yes' : 'No', [], { all: ['Yes', 'No'] });
// A count with its noun: "1 point", "2 points", "-1 point". Pass `many` for a noun that does not just add s.
export const plural = (n, word, many = word + 's') => `${fmt(n)} ${Math.abs(n) === 1 ? word : many}`;
