// Linear equations with the variable on both sides, with and without brackets.
import { rnd, pick, chance, simp, b, way, fmt, fr, num, frac } from '../../util.js';
import { lin, term, plus, plusTerm, nz } from './h.js';

// One side of an equation is a list of groups [k, a, c], each meaning k(ax + c). A fourth entry 'r' shows c first.
export const expand = side => side.reduce(([A, B], [k, a, c]) => [A + k * a, B + k * c], [0, 0]);
function first([k, a, c, flag]) {
  if (k !== 1) return `${fmt(k)}(${lin(a, c)})`;
  return flag === 'r' && a > 0 ? `${fmt(c)} + ${term(a)}` : lin(a, c);
}
function later([k, a, c]) {
  if (k !== 1) return `+ ${fmt(k)}(${lin(a, c)})`;
  return a === 0 ? plus(c) : c === 0 ? plusTerm(a) : `${plusTerm(a)} ${plus(c)}`;
}
export const showSide = side => [first(side[0]), ...side.slice(1).map(later)].join(' ');
export const showEq = (L, R) => `${showSide(L)} = ${showSide(R)}`;
const isPlain = side => side.length === 1 && side[0][0] === 1;
const xText = (r, q) => (r % q === 0 ? fmt(r / q) : fr(r, q));
const remove = (c, what) => (c > 0 ? `Take ${what(c)} away from both sides` : `Add ${what(-c)} to both sides`);
// Steps that collect x on the left (keepLeft) or on the right, starting from Ax + B = Cx + D.
function moveSteps(A, B, C, D, keepLeft) {
  const q = keepLeft ? A - C : C - A, r = keepLeft ? D - B : B - D, gone = keepLeft ? C : A, k0 = keepLeft ? B : D;
  const steps = [];
  if (gone !== 0) steps.push(`${remove(gone, term)}: ${keepLeft ? `${lin(q, B)} = ${fmt(D)}` : `${fmt(B)} = ${lin(q, D)}`}`);
  if (k0 !== 0) steps.push(`${remove(k0, fmt)}: ${keepLeft ? `${term(q)} = ${fmt(r)}` : `${fmt(r)} = ${term(q)}`}`);
  steps.push(q === 1 ? `So x = ${b(fmt(r))}.` : `Divide both sides by ${fmt(q)}: x = ${b(xText(r, q))}`);
  return steps;
}
const sideValue = (side, x) => side.reduce((s, [k, a, c]) => s + k * (a * x + c), 0);
function checkWay(L, R, x) {
  const put = side => showSide(side).replace(/(\d)x/g, `$1 × ${x < 0 ? `(${fmt(x)})` : x}`).replace(/x/g, x < 0 ? `(${fmt(x)})` : String(x));
  return way('Check it', [`Put x = ${fmt(x)} into the left side: ${put(L)} = ${fmt(sideValue(L, x))}`, `And into the right side: ${put(R)} = ${fmt(sideValue(R, x))}`, 'Both sides match, so the equation balances.']);
}
function balanceWay(A, B, C, D, x) {
  return way('Picture a balance', [`Think of x as a bag holding a hidden number of coins. Left pan: ${A} ${A === 1 ? 'bag' : 'bags'} and ${B} coins. Right pan: ${C} ${C === 1 ? 'bag' : 'bags'} and ${D} coins.`,
    `Take ${Math.min(A, C)} ${Math.min(A, C) === 1 ? 'bag' : 'bags'} off each pan. It still balances: ${A > C ? `${lin(A - C, B)} = ${D}` : `${B} = ${lin(C - A, D)}`}`,
    Math.min(B, D) ? `Take ${Math.min(B, D)} coins off each pan: ${A > C ? `${term(A - C)} = ${D - B}` : `${B - D} = ${term(C - A)}`}` : 'One pan now holds only bags and the other only coins.',
    `${Math.abs(A - C) === 1 ? 'One bag' : `${Math.abs(A - C)} bags`} hold ${Math.abs(D - B)} coins, so each bag holds ${b(x)}.`]);
}
// Builds the problem from two sides. The solution is worked out here from the expanded sides.
export function solveProblem(L, R, level) {
  const [A, B] = expand(L), [C, D] = expand(R), keepLeft = A > C;
  const q = keepLeft ? A - C : C - A, r = keepLeft ? D - B : B - D, whole = r % q === 0, x = r / q;
  const brackets = [...L, ...R].some(g => g[0] !== 1), plainSides = isPlain(L) && isPlain(R);
  const tidy = plainSides ? [] : [`${brackets ? 'Multiply out the brackets and collect like terms' : 'Collect the like terms'}, one side at a time: ${lin(A, B)} = ${lin(C, D)}`];
  const ways = [way('Keep it balanced', [...tidy, ...moveSteps(A, B, C, D, keepLeft)])];
  if (level === 1 && B >= 0 && D >= 0 && A > 0 && C > 0) ways.unshift(balanceWay(A, B, C, D, x));
  else ways.push(way('Move the x terms the other way', [...tidy, ...moveSteps(A, B, C, D, !keepLeft), 'Same answer. Either direction works, as long as you do the same thing to both sides.']));
  if (whole) ways.push(checkWay(L, R, x));
  const [n, d] = simp(r, q);
  return { ask: 'Solve for x.', expr: showEq(L, R), exprSmall: true, answer: whole ? num(x, { signed: level > 1 }) : frac(n, d, { signed: true }), ways,
    hint: brackets ? 'Multiply out the brackets first. Then get every x term onto one side.' : plainSides ? 'Get every x term onto one side by doing the same thing to both sides.' : 'Collect the like terms on each side first. Then get every x term onto one side.', _t: { k: 'lineq', L, R } };
}
function simple(L) {
  const x = L === 1 ? rnd(1, 9) : nz(-9, 9), A = L === 1 ? rnd(2, 9) : nz(-6, 9), C = L === 1 ? rnd(1, A - 1) : nz(-6, 9), B = L === 1 ? rnd(0, 12) : rnd(-12, 12);
  const D = (A - C) * x + B;
  if (A === C || Math.abs(D) > 60) return null;
  const left = [[1, A, B]], right = [[1, C, D]];
  return chance(0.3) ? solveProblem(right, left, L) : solveProblem(left, right, L);
}
function oneBracket(L, negative) {
  const x = nz(-9, 9), k = negative ? -rnd(2, 4) : rnd(2, 6), p = nz(-6, 6), C = nz(-5, 9), D = (k - C) * x + k * p;
  if (C === k || Math.abs(D) > 60) return null;
  return solveProblem([[k, 1, p]], [[1, C, D]], L);
}
function twoBrackets() {
  const x = nz(-8, 8), k = rnd(2, 6), j = rnd(2, 6), p = nz(-6, 6), q = nz(-6, 6), e = k * (x + p) - j * (x + q);
  if (k === j || Math.abs(e) > 40) return null;
  return solveProblem([[k, 1, p]], e ? [[j, 1, q], [1, 0, e]] : [[j, 1, q]], 3);
}
function likeTerms() {
  const x = nz(-8, 8), a = nz(-5, 8), c = rnd(2, 6), d = nz(-6, 9), bb = rnd(-10, 10), e = (a + c - d) * x + bb;
  if (a + c === d || Math.abs(e) > 60) return null;
  return solveProblem([[1, a, bb], [1, c, 0]], [[1, d, e]], 3);
}
function fraction() {
  const q = pick([2, 3, 4, 5]), r = nz(-15, 15), C = rnd(1, 6), B = rnd(-9, 9);
  return r % q === 0 ? null : solveProblem([[1, C + q, B]], [[1, C, B + r]], 3);
}
export function genEqBoth(L) {
  if (L === 1) return simple(1);
  if (L === 2) return chance(0.5) ? simple(2) : oneBracket(2, false);
  return pick([twoBrackets, twoBrackets, likeTerms, fraction, () => oneBracket(3, true)])();
}
