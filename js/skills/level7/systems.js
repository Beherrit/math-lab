// Systems of two linear equations: the crossing point on a graph, checking a point, and substitution.
import { rnd, pick, chance, b, way, fmt, num, point, table } from '../../util.js';
import { eqn, lin, term, plusTerm, par, pt, nz, yesNo, subst } from './h.js';
import { grid, clip, COLORS } from './draw.js';

// An equation is [a, b, c], meaning ax + by = c. A line y = mx + k is [−m, 1, k].
export const fromLine = (m, k) => [-m, 1, k];
export const standard = ([a, bb, c]) => `${term(a)} ${plusTerm(bb, 'y')} = ${fmt(c)}`;
export const pair = (one, two) => `${one}<br>${two}`;
const tint = (s, i) => `<span style="color:${COLORS[i]}">${s}</span>`;
export const checkWay = (lines, x, y) => way('Check in both equations', [...lines.map(([text, value, target]) => `${text}: ${value} = ${fmt(target)}. True.`), `${pt(x, y)} makes both equations true, so it is the solution.`]);
const lineCheck = (m, k, x, y) => [eqn(m, k), subst(m, k, x), y];
export const stdCheck = ([a, bb, c], x, y) => [standard([a, bb, c]), `${fmt(a)} × ${par(x)} + ${par(bb)} × ${par(y)}`, c];
// Two different lines through a whole-number point, both clearly visible on the 0..10 grid.
function crossing() {
  for (let t = 0; t < 60; t++) {
    const x = rnd(1, 8), y = rnd(1, 8), m1 = pick([-2, -1, 0, 1, 2, 3]), m2 = pick([-2, -1, 1, 2, 3]);
    const k1 = y - m1 * x, k2 = y - m2 * x, ends = [clip(m1, k1, 0, 10), clip(m2, k2, 0, 10)];
    if (m1 !== m2 && ends.every(e => e && e[1][0] - e[0][0] >= 3)) return { x, y, m1, k1, m2, k2 };
  }
  return { x: 3, y: 5, m1: 1, k1: 2, m2: -1, k2: 8 };
}
const drawn = (s, interactive, pts = []) => grid({ interactive, lines: [{ m: s.m1, c: s.k1 }, { m: s.m2, c: s.k2 }], pts });
const shown = s => pair(tint(eqn(s.m1, s.k1), 0), tint(eqn(s.m2, s.k2), 1));
function graphTap() {
  const s = crossing();
  return { ask: 'Tap the solution of this system: the point where the two lines cross.', expr: shown(s), exprSmall: true, visual: drawn(s, true), answer: point(s.x, s.y), hint: 'The solution is the one point that is on both lines.', _t: { k: 'sys', e1: fromLine(s.m1, s.k1), e2: fromLine(s.m2, s.k2), ask: 'pt' },
    ways: [way('Read the crossing', [drawn(s, false, [{ x: s.x, y: s.y }]), `Every point on a line makes that line's equation true. The crossing point is on both lines, so it makes both true.`, `The lines cross at ${b(pt(s.x, s.y))}.`]),
      checkWay([lineCheck(s.m1, s.k1, s.x, s.y), lineCheck(s.m2, s.k2, s.x, s.y)], s.x, s.y)] };
}
function checkPoint() {
  const s = crossing(), yes = chance(0.5), x = yes ? s.x : s.x + pick([-1, 1]), y = s.m1 * x + s.k1, y2 = s.m2 * x + s.k2;
  return { ask: `Is ${pt(x, y)} a solution of this system?`, expr: pair(eqn(s.m1, s.k1), eqn(s.m2, s.k2)), exprSmall: true, answer: yesNo(yes), hint: 'A solution has to make both equations true, not just one.', _t: { k: 'sys', e1: fromLine(s.m1, s.k1), e2: fromLine(s.m2, s.k2), ask: 'check', cand: [x, y] },
    ways: [way('Test it in both equations', [`First equation: ${subst(s.m1, s.k1, x)} = ${fmt(y)}. True.`, `Second equation: ${subst(s.m2, s.k2, x)} = ${fmt(y2)}. ${yes ? 'True.' : `But the point has y = ${fmt(y)}, so this one is false.`}`, yes ? `Both are true: ${b('yes')}.` : `It only works in one equation: ${b('no')}.`]),
      way('Picture the lines', [drawn(s, false, x >= 0 && x <= 10 && y >= 0 && y <= 10 ? [{ x, y }] : []), yes ? 'The point sits where the two lines cross.' : 'The point is on the first line only. A solution has to be on both.'])] };
}
const askFor = (s, want) => ({ ask: `Solve the system. What is ${want}?`, answer: num(want === 'x' ? s.x : s.y, { signed: true }) });
function tableWay(s, head, rowOf, note) {
  return way('Make a table', [table(head, [s.x - 1, s.x, s.x + 1].map(rowOf)), note, `That happens at x = ${fmt(s.x)}, where y = ${fmt(s.y)}.`]);
}
// y = mx + k together with ax + by = c.
function subStandard() {
  const x = nz(-5, 7), y = nz(-6, 9), m = nz(-3, 4), k = y - m * x, a = rnd(1, 5), bb = nz(-4, 4), c = a * x + bb * y, q = a + bb * m, s = { x, y };
  if (q === 0 || Math.abs(k) > 15) return null;
  const want = pick(['x', 'y']), e2 = [a, bb, c];
  return { ...askFor(s, want), expr: pair(eqn(m, k), standard(e2)), exprSmall: true, hint: `The first equation says what y is equal to. Put that in place of y in the second equation.`, _t: { k: 'sys', e1: fromLine(m, k), e2, ask: want },
    ways: [way('Substitute', [`y is the same as ${lin(m, k)}, so swap it in: ${term(a)} ${bb < 0 ? '−' : '+'} ${Math.abs(bb) === 1 ? '' : Math.abs(bb)}(${lin(m, k)}) = ${fmt(c)}`, `Multiply out and collect: ${lin(q, bb * k)} = ${fmt(c)}`, `Solve: ${term(q)} = ${fmt(c - bb * k)}, so x = ${b(fmt(x))}.`, `Put x back into the first equation: y = ${subst(m, k, x)} = ${b(fmt(y))}.`]),
      tableWay(s, ['x', `y = ${lin(m, k)}`, standard(e2).split(' = ')[0]], v => [fmt(v), fmt(m * v + k), fmt(a * v + bb * (m * v + k))], `Use the first equation to get y, then look for the row where the last column is ${fmt(c)}.`)] };
}
// Two lines given as y = ..., solved by setting the right-hand sides equal.
function subEqual() {
  const x = nz(-6, 6), y = rnd(-9, 9), m1 = nz(-4, 5), m2 = nz(-4, 5), k1 = y - m1 * x, k2 = y - m2 * x, s = { x, y };
  if (m1 === m2 || Math.abs(k1) > 20 || Math.abs(k2) > 20) return null;
  const want = pick(['x', 'y']), [A, C] = m1 > m2 ? [m1, m2] : [m2, m1], [B, D] = m1 > m2 ? [k1, k2] : [k2, k1];
  return { ...askFor(s, want), expr: pair(eqn(m1, k1), eqn(m2, k2)), exprSmall: true, hint: 'Both right-hand sides are equal to y, so they are equal to each other.', _t: { k: 'sys', e1: fromLine(m1, k1), e2: fromLine(m2, k2), ask: want },
    ways: [way('Set them equal', [`Both expressions equal y, so ${lin(A, B)} = ${lin(C, D)}`, `Get x on one side: ${lin(A - C, B)} = ${fmt(D)}, then ${term(A - C)} = ${fmt(D - B)}.`, `x = ${b(fmt(x))}`, `Put x into either equation: y = ${subst(m1, k1, x)} = ${b(fmt(y))}.`]),
      tableWay(s, ['x', eqn(m1, k1), eqn(m2, k2)], v => [fmt(v), fmt(m1 * v + k1), fmt(m2 * v + k2)], 'Look for the row where both equations give the same y.')] };
}
export { graphTap, checkPoint, subStandard, subEqual };
