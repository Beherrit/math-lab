// Level 7 text helpers: signed numbers, linear expressions, points, roots, yes/no answers.
import { b, fmt, fr, rnd, choice } from '../../util.js';

export const par = x => (x < 0 ? `(${fmt(x)})` : fmt(x)); // a negative inside a product: (−3)
export const pt = (x, y) => `(${fmt(x + 0)}, ${fmt(y + 0)})`; // + 0 turns −0 into 0
export const term = (c, v = 'x') => (c === 0 ? '0' : c === 1 ? v : c === -1 ? `−${v}` : `${fmt(c)}${v}`);
export const plus = c => (c < 0 ? `− ${fmt(-c)}` : `+ ${fmt(c)}`);
export const plusTerm = (c, v = 'x') => (c < 0 ? `− ${term(-c, v)}` : `+ ${term(c, v)}`);
// "2x + 3", "−x − 4", "5x", "7"
export function lin(m, c, v = 'x') {
  if (m === 0) return fmt(c);
  return c === 0 ? term(m, v) : `${term(m, v)} ${plus(c)}`;
}
export const eqn = (m, c) => `y = ${lin(m, c)}`;
// Slope as text: whole number or a plain fraction (never a mixed number).
export const sl = (n, d = 1) => fr(n, d, { mixed: false });
// y = (n/d)x + c with a fraction slope.
export function eqnF(n, d, c) {
  if (n % d === 0) return eqn(n / d, c);
  return `y = ${sl(n, d)}x${c === 0 ? '' : ' ' + plus(c)}`;
}
export const nz = (lo, hi) => { let v = 0; while (v === 0) v = rnd(lo, hi); return v; };
export const sqrt = x => `√${x}`;
export const cbrt = x => `<sup>3</sup>√${x}`;
export const blank = '<span class="blank">?</span>';
export const bar = s => `<span style="text-decoration:overline">${s}</span>`;
export const deg = x => `${fmt(x)}°`;
export const copies = n => `${n} ${n === 1 ? 'copy' : 'copies'}`;
// A count with its noun, "1 hour" or "3 hours". Pass the plural when it is not just an added s.
export const count = (n, one, many = `${one}s`) => `${fmt(n)} ${n === 1 ? one : many}`;
// Putting x into y = mx + c. A zero slope or a zero constant is left out, never printed as "+ 0" or "0 ×".
export const subst = (m, c, x) => (m === 0 ? fmt(c) : `${fmt(m)} × ${par(x)}${c === 0 ? '' : ` ${plus(c)}`}`);
// The same substitution worked to the end: "2 × 5 + 3 = 10 + 3 = 13", or "2 × 5 = 10" when c is 0.
export const substChain = (m, c, x) => (m === 0 || c === 0 ? `${subst(m, c, x)}${m === 0 ? '' : ` = ${fmt(m * x)}`}` : `${subst(m, c, x)} = ${fmt(m * x)} ${plus(c)} = ${fmt(m * x + c)}`);
export function substSteps(m, c, x) {
  const y = m * x + c, put = `Put ${fmt(x)} in place of x: y = ${subst(m, c, x)}`;
  if (m === 0) return [`The equation is y = ${fmt(c)}, so y is ${b(fmt(c))} whatever x is.`];
  return c === 0 ? [put, `${fmt(m)} × ${par(x)} = ${b(fmt(y))}`] : [put, `${fmt(m)} × ${par(x)} = ${fmt(m * x)}`, `${fmt(m * x)} ${plus(c)} = ${b(fmt(y))}`];
}
// A constant followed by a term, "5 + 2y", with the constant left out when it is 0.
export const constThen = (c, m, v) => (c === 0 ? term(m, v) : `${fmt(c)} ${plusTerm(m, v)}`);
// "c + mx = y" for walking from the starting value; with no starting value it is just the product.
export const startPlus = (c, mx, y) => (c === 0 || mx === 0 ? b(fmt(y)) : `${fmt(c)} + ${par(mx)} = ${b(fmt(y))}`);
const YN = ['Yes', 'No'];
export const yesNo = yes => choice(yes ? 'Yes' : 'No', [], { all: YN });
// A choice whose buttons stay in the given order.
export const fixedChoice = (correct, all) => choice(correct, [], { all });
// A whole-number or fraction answer for a value n/d that may be negative.
export const isInt = (n, d) => n % d === 0;
