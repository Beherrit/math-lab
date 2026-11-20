// How many solutions does a linear equation have: one, none, or infinitely many?
import { rnd, pick, chance, b, way, fmt, num, table } from '../../util.js';
import { lin, term, nz, blank, fixedChoice } from './h.js';
import { expand, showSide, showEq } from './equations.js';

const NAMES = { one: 'One solution', none: 'No solution', inf: 'Infinitely many solutions' };
const ALL = Object.values(NAMES);
export const kindOf = (A, B, C, D) => (A !== C ? 'one' : B === D ? 'inf' : 'none');
const sideValue = (side, x) => side.reduce((s, [k, a, c]) => s + k * (a * x + c), 0);
function compareWay(L, R, A, B, C, D, kind) {
  const plain = L.length === 1 && R.length === 1 && L[0][0] === 1 && R[0][0] === 1;
  const steps = plain ? [] : [`Simplify each side: ${lin(A, B)} = ${lin(C, D)}`];
  if (kind === 'one') steps.push(`The x terms are different (${term(A)} and ${term(C)}), so the sides change at different speeds and meet exactly once.`, `That is ${b('one solution')}.`);
  else steps.push(`Both sides have the same x term, ${term(A)}. Take it away from both sides: ${fmt(B)} = ${fmt(D)}`,
    kind === 'inf' ? `That is always true, whatever x is. ${b('Infinitely many solutions')}.` : `That is never true, whatever x is. ${b('No solution')}.`);
  return way('Simplify and compare', steps);
}
function tableWay(L, R, kind) {
  const xs = [0, 1, 2, 3], rows = xs.map(x => [x, fmt(sideValue(L, x)), fmt(sideValue(R, x))]);
  const gap = sideValue(L, 0) - sideValue(R, 0);
  const note = kind === 'inf' ? 'The two sides are equal for every x you try.' : kind === 'none' ? `The left side is always ${fmt(Math.abs(gap))} ${gap > 0 ? 'more' : 'less'} than the right side. They never meet.`
    : 'The gap between the sides changes from row to row, so there is exactly one x where they are equal.';
  return way('Try some numbers', [table(['x', 'Left side', 'Right side'], rows), note]);
}
function build(L, R) {
  const [A, B] = expand(L), [C, D] = expand(R), kind = kindOf(A, B, C, D);
  return { ask: 'How many solutions does this equation have?', expr: showEq(L, R), exprSmall: true, answer: fixedChoice(NAMES[kind], ALL), ways: [compareWay(L, R, A, B, C, D, kind), tableWay(L, R, kind)],
    hint: 'Simplify both sides. Then compare the x terms, and after that the plain numbers.', _t: { k: 'eqcount', L, R } };
}
// Right-hand side that makes the wanted kind of equation with a left side that expands to Ax + B.
function partner(A, B, kind) {
  if (kind === 'inf') return [1, A, B];
  if (kind === 'none') return [1, A, B + nz(-9, 9)];
  let C = A; while (C === A) C = nz(-6, 9);
  return [1, C, rnd(-12, 12)];
}
const anyKind = () => pick(['one', 'none', 'inf']);
function plain() {
  const A = rnd(2, 9), B = rnd(1, 12), R = partner(A, B, anyKind());
  return build([[1, A, B]], [R[1] > 0 && R[2] !== 0 && chance(0.5) ? [...R, 'r'] : R]);
}
function bracket() {
  const k = rnd(2, 6), p = nz(-6, 6);
  return build([[k, 1, p]], [partner(k, k * p, anyKind())]);
}
function likeTerms() {
  const a = rnd(1, 6), c = rnd(1, 5), B = rnd(-9, 9);
  return build([[1, a, B], [1, c, 0]], [partner(a + c, B, anyKind())]);
}
function twoBrackets() {
  const k = rnd(2, 5), p = nz(-5, 5), kind = anyKind();
  if (kind === 'one') { const j = rnd(2, 6); return j === k ? null : build([[k, 1, p]], [[j, 1, nz(-5, 5)]]); }
  const target = k * p + (kind === 'inf' ? 0 : nz(-8, 8)); // the right side must expand to kx + target
  if (k % 2) return build([[k, 1, p]], [target ? [1, k, target, 'r'] : [1, k, 0]]);
  const inside = nz(-4, 4), e = target - 2 * inside;
  return build([[k, 1, p]], e ? [[2, k / 2, inside], [1, 0, e]] : [[2, k / 2, inside]]);
}
function missing() {
  const want = pick(['none', 'inf']), k = rnd(2, 6), p = nz(-6, 6), slot = want === 'none' ? 'x' : pick(['x', 'num']);
  const A = k, B = k * p, off = want === 'none' ? nz(-9, 9) : 0, left = [[k, 1, p]];
  const shownR = slot === 'x' ? `${blank}x ${B + off < 0 ? '−' : '+'} ${Math.abs(B + off)}` : `${term(A)} + ${blank}`;
  const ans = slot === 'x' ? A : B;
  if (B + off === 0) return null;
  return { ask: `What number in the blank gives this equation ${b(want === 'none' ? 'no solution' : 'infinitely many solutions')}?`, expr: `${showSide(left)} = ${shownR}`, exprSmall: true, answer: num(ans, { signed: true }),
    hint: want === 'none' ? 'No solution needs the same x term on both sides but different plain numbers.' : 'Infinitely many solutions needs both sides to be exactly the same once simplified.',
    ways: [way('Simplify the left side', [`${showSide(left)} = ${lin(A, B)}`, want === 'none' ? `For no solution, the x terms must match so they cancel, leaving a statement that is never true. The blank is ${b(fmt(ans))}.`
      : `For infinitely many solutions, the right side must be exactly ${lin(A, B)}. The blank is ${b(fmt(ans))}.`]),
    way('Check it', [`With ${fmt(ans)} in the blank the equation is ${lin(A, B)} = ${lin(A, B + off)}.`, want === 'none' ? `Take ${term(A)} from both sides: ${fmt(B)} = ${fmt(B + off)}. Never true, so no x works.` : 'Both sides are identical, so every x works.'])],
    _t: { k: 'eqmiss', want, L: left, R: slot === 'x' ? [[1, null, B + off]] : [[1, A, null]] } };
}
export function genEqCount(L) {
  if (L === 1) return plain();
  if (L === 2) return pick([bracket, bracket, likeTerms])();
  return pick([twoBrackets, twoBrackets, missing, missing, likeTerms])();
}
