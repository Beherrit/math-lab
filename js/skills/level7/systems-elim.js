// Systems solved by elimination, counting the solutions of a system, and the systems skill's step mix.
import { rnd, pick, chance, b, way, fmt, num, point } from '../../util.js';
import { eqn, lin, term, plusTerm, par, nz, fixedChoice, constThen } from './h.js';
import { grid } from './draw.js';
import { standard, pair, checkWay, stdCheck, fromLine, graphTap, checkPoint, subStandard, subEqual } from './systems.js';

const COUNT = ['One solution', 'No solution', 'Infinitely many solutions'];
// Each maker returns the two equations plus the worked steps for the main way and a second way.
const MAKERS = {
  // by and −by cancel when the equations are added.
  add(x, y) {
    const a1 = rnd(1, 5), a2 = rnd(1, 5), bb = rnd(1, 5), c1 = a1 * x + bb * y, c2 = a2 * x - bb * y;
    return { e1: [a1, bb, c1], e2: [a2, -bb, c2], first: 'x',
      main: [`The y terms are ${term(bb, 'y')} and ${term(-bb, 'y')}. Add the two equations and they cancel.`, `${term(a1)} + ${term(a2)} = ${c2 === 0 ? fmt(c1) : `${fmt(c1)} + ${par(c2)}`}, so ${term(a1 + a2)} = ${fmt(c1 + c2)}.`, `x = ${b(fmt(x))}`],
      other: [`From the first equation, ${term(bb, 'y')} = ${fmt(c1)} − ${term(a1)}.`, `The second equation takes away ${term(bb, 'y')}, so swap that in: ${term(a2)} − (${fmt(c1)} − ${term(a1)}) = ${fmt(c2)}`, `${lin(a1 + a2, -c1)} = ${fmt(c2)}, so x = ${b(fmt(x))}.`] };
  },
  // The x terms match, so subtracting removes them.
  sub(x, y) {
    const a = rnd(1, 5), b1 = nz(-5, 6), b2 = nz(-5, 6), c1 = a * x + b1 * y, c2 = a * x + b2 * y;
    if (b1 === b2) return null;
    return { e1: [a, b1, c1], e2: [a, b2, c2], first: 'y',
      main: [`Both equations have ${term(a)}. Subtract the second equation from the first and the x terms cancel.`, `${term(b1, 'y')} − ${b2 < 0 ? `(${term(b2, 'y')})` : term(b2, 'y')} = ${fmt(c1)} − ${par(c2)}, so ${term(b1 - b2, 'y')} = ${fmt(c1 - c2)}.`, `y = ${b(fmt(y))}`],
      other: [`From the second equation, ${term(a)} = ${constThen(c2, -b2, 'y')}.`, `Swap that in for ${term(a)} in the first equation: ${constThen(c2, -b2, 'y')} ${plusTerm(b1, 'y')} = ${fmt(c1)}`, `${term(b1 - b2, 'y')} = ${fmt(c1 - c2)}, so y = ${b(fmt(y))}.`] };
  },
  // One equation has to be multiplied first so that the y terms cancel.
  scale(x, y) {
    const k = rnd(2, 4), b1 = pick([-2, -1, 1, 2]), a2 = rnd(1, 5), c1 = x + b1 * y, c2 = a2 * x - k * b1 * y;
    return { e1: [1, b1, c1], e2: [a2, -k * b1, c2], first: 'x',
      main: [`Multiply every part of the first equation by ${k}: ${standard([k, k * b1, k * c1])}`, `Now the y terms are ${term(k * b1, 'y')} and ${term(-k * b1, 'y')}. Add the equations: ${term(k + a2)} = ${fmt(k * c1 + c2)}.`, `x = ${b(fmt(x))}`],
      other: [`The first equation gives x by itself: x = ${constThen(c1, -b1, 'y')}.`, `Swap that in for x in the second equation: ${a2 === 1 ? '' : a2}(${constThen(c1, -b1, 'y')}) ${plusTerm(-k * b1, 'y')} = ${fmt(c2)}`, `${term(-a2 * b1 - k * b1, 'y')} = ${fmt(c2 - a2 * c1)}, so y = ${b(fmt(y))}.`], otherFirst: 'y' };
  },
};
function eliminate() {
  const x = nz(-5, 8), y = nz(-5, 8), type = pick(['add', 'add', 'sub', 'scale']), m = MAKERS[type](x, y);
  if (!m || [m.e1[2], m.e2[2]].some(c => Math.abs(c) > 70)) return null;
  const tap = x >= 0 && y >= 0 && x <= 10 && y <= 10 && chance(0.35), want = tap ? 'pt' : pick(['x', 'y']);
  const rest = v => (v === 'x' ? `Put x = ${fmt(x)} into the first equation: ${fmt(m.e1[0] * x)} ${plusTerm(m.e1[1], 'y')} = ${fmt(m.e1[2])}, so y = ${b(fmt(y))}.` : `Put y = ${fmt(y)} into the first equation: ${term(m.e1[0])} + ${par(m.e1[1] * y)} = ${fmt(m.e1[2])}, so x = ${b(fmt(x))}.`);
  const core = { expr: pair(standard(m.e1), standard(m.e2)), exprSmall: true, hint: type === 'scale' ? 'Multiply one whole equation so that the y terms are opposites. Then add.' : type === 'add' ? 'Look at the y terms. What happens to them if you add the two equations?' : 'Both equations have the same x term. What happens if you subtract one equation from the other?',
    ways: [way('Eliminate one letter', [...m.main, rest(m.first)]), way('Substitute a whole chunk', [...m.other, rest(m.otherFirst || m.first)]), checkWay([stdCheck(m.e1, x, y), stdCheck(m.e2, x, y)], x, y)],
    _t: { k: 'sys', e1: m.e1, e2: m.e2, ask: want } };
  if (tap) return { ...core, ask: 'Solve the system, then tap the solution on the grid.', visual: grid({ interactive: true }), answer: point(x, y) };
  return { ...core, ask: `Solve the system. What is ${want}?`, answer: num(want === 'x' ? x : y, { signed: true }) };
}
const ROLE = { one: 0, none: 1, inf: 2 };
function howMany() {
  const kind = pick(['one', 'none', 'inf']), m = nz(-4, 5), k = rnd(-6, 8), s = rnd(2, 3);
  const m2 = kind === 'one' ? m + nz(-3, 3) : m, k2 = kind === 'none' ? k + nz(-6, 6) : kind === 'inf' ? k : rnd(-6, 8), scaled = kind === 'inf' || chance(0.3);
  if (m2 === 0) return null;
  const second = scaled ? `${s}y = ${lin(s * m2, s * k2)}` : eqn(m2, k2), e2 = scaled ? [-s * m2, s, s * k2] : fromLine(m2, k2);
  const tidy = scaled ? [`Divide the second equation by ${s}: ${eqn(m2, k2)}`] : [];
  const why = { one: `The slopes are different (${fmt(m)} and ${fmt(m2)}), so the lines cross exactly once.`, none: `Same slope (${fmt(m)}) but different y-intercepts (${fmt(k)} and ${fmt(k2)}): the lines are parallel and never meet.`, inf: 'Same slope and same y-intercept: it is the same line written twice, so every point on it is a solution.' }[kind];
  return { ask: 'How many solutions does this system have?', expr: pair(eqn(m, k), second), exprSmall: true, answer: fixedChoice(COUNT[ROLE[kind]], COUNT), hint: 'Write both equations as y = mx + b. Compare the slopes, then the y-intercepts.', _t: { k: 'syscount', e1: fromLine(m, k), e2 },
    ways: [way('Compare slope and intercept', [...tidy, why, `${b(COUNT[ROLE[kind]])}.`]),
      way('Try to solve it', [...tidy, `Set the right sides equal: ${lin(m, k)} = ${lin(m2, k2)}`, kind === 'one' ? `The x terms are different, so this has exactly one answer for x.` : `The x terms are the same, so they cancel: ${fmt(k)} = ${fmt(k2)}.`, kind === 'one' ? `${b('One solution')}.` : kind === 'none' ? `That is never true: ${b('no solution')}.` : `That is always true: ${b('infinitely many solutions')}.`])] };
}
export function genSys(L) {
  if (L === 1) return chance(0.7) ? graphTap() : checkPoint();
  if (L === 2) return pick([subStandard, subStandard, subEqual])();
  return pick([eliminate, eliminate, eliminate, howMany])();
}
