// Two-step inequalities: solving, testing values, reading graphs, and why dividing by a negative flips the sign.
import { rnd, pick, chance, shuffle, fmt, b, k, way, nm, num, choice } from '../../util.js';
import { nz, par, size, xTerm, lin, plusMinus, yesNo, tag } from './helpers.js';
import { rayLine } from './visuals-lines.js';

const FLIP = { '<': '>', '>': '<', '≤': '≥', '≥': '≤' };
const WORDS = { '<': 'less than', '>': 'greater than', '≤': 'less than or equal to', '≥': 'greater than or equal to' };
const holds = (l, op, r) => (op === '<' ? l < r : op === '>' ? l > r : op === '≤' ? l <= r : l >= r);
const sol = (op, v) => `x ${op} ${fmt(v)}`;
const graphOf = (op, v) => rayLine(v, op === '>' || op === '≥' ? 1 : -1, op === '≤' || op === '≥');
// a·x + b (op) c with a whole-number boundary. Returns the solved form too.
function make(aLo, aHi, ops) {
  for (;;) {
    const a = nz(aLo, aHi), bound = nz(-9, 9), bb = nz(-12, 12), op = pick(ops);
    if (Math.abs(a) > 1) return { a, bb, c: a * bound + bb, op, bound, out: a < 0 ? FLIP[op] : op };
  }
}
function solveWays({ a, bb, c, op, bound, out }) {
  const mid = c - bb, src = `${lin(a, bb)} ${op} ${fmt(c)}`;
  const steps = [`Treat it like an equation. ${bb < 0 ? 'Add' : 'Subtract'} ${size(bb)} on both sides: ${xTerm(a)} ${op} ${fmt(mid)}.`];
  if (a > 0) steps.push(`Divide both sides by ${a}. Dividing by a positive number keeps the sign pointing the same way: ${b(sol(out, bound))}`);
  else steps.push(`Divide both sides by ${fmt(a)}. Dividing by a NEGATIVE number flips the sign: ${op} becomes ${out}.`, `${b(sol(out, bound))}`);
  const ways = [way('Solve step by step', [...steps, graphOf(out, bound)])];
  if (a < 0) ways.push(way('Why the sign flips', ['2 < 5 is true. Multiply both by −1 and you get −2 and −5. Now −2 is the bigger one: −2 > −5.',
    'Multiplying or dividing by a negative mirrors every number to the other side of zero, so the order swaps.',
    `You can also avoid it: add ${xTerm(-a)} to both sides, so ${fmt(bb)} ${op} ${fmt(c)} + ${xTerm(-a)}. Then ${fmt(bb - c)} ${op} ${xTerm(-a)}, so ${fmt(bound)} ${op} x, which says the same as ${b(sol(out, bound))}.`]));
  const t = bound + (out === '<' || out === '≤' ? -1 : 1);
  ways.push(way('Test a number', [`Pick a number the answer allows, like x = ${fmt(t)}.`, `${par(a)} × ${par(t)} ${plusMinus(bb)} = ${fmt(a * t + bb)}, and ${fmt(a * t + bb)} ${op} ${fmt(c)} is true. The answer ${sol(out, bound)} holds up.`,
    `A number on the other side, like x = ${fmt(2 * bound - t)}, gives ${fmt(a * (2 * bound - t) + bb)}, which fails.`]));
  return { src, ways };
}
function solveProblem(aLo, aHi, ops) {
  const m = make(aLo, aHi, ops), { src, ways } = solveWays(m), mid = m.c - m.bb;
  const wrong = m.a < 0 ? [sol(m.op, m.bound), sol(m.out, -m.bound), sol(m.op, -m.bound)] : [sol(FLIP[m.out], m.bound), sol(m.out, mid), sol(m.out, m.c + m.bb)];
  return tag({ ask: 'Solve the inequality.', expr: src, answer: choice(sol(m.out, m.bound), wrong), ways,
    hint: m.a < 0 ? 'Solve it like an equation. What happens to the sign when you divide by a negative?' : 'Solve it like an equation: undo the adding or subtracting first, then the multiplying.' },
  { kind: 'ineq', type: 'solve', a: m.a, b: m.bb, c: m.c, op: m.op });
}
function isSolution(aLo, aHi) {
  const m = make(aLo, aHi, ['<', '>', '≤', '≥']), v = m.bound + pick([-2, -1, 0, 0, 1, 2]), val = m.a * v + m.bb, yes = holds(val, m.op, m.c);
  return tag({ ask: `Is x = ${fmt(v)} a solution of this inequality?`, expr: `${lin(m.a, m.bb)} ${m.op} ${fmt(m.c)}`, answer: yesNo(yes), choiceBig: true,
    ways: [way('Put the number in', [`${par(m.a)} × ${par(v)} ${plusMinus(m.bb)} = ${b(fmt(val))}`,
      `Is ${fmt(val)} ${WORDS[m.op]} ${fmt(m.c)}? ${yes ? 'Yes' : 'No'}${val === m.c ? `. They are equal, and ${m.op} ${m.op === '≤' || m.op === '≥' ? 'allows' : 'does not allow'} equal` : ''}.`, `So the answer is ${b(yes ? 'yes' : 'no')}.`]),
      way('Solve first, then look', [...solveWays(m).ways[0].s.slice(0, -1), `${fmt(v)} is ${holds(v, m.out, m.bound) ? '' : 'not '}in that set, so ${b(yes ? 'yes' : 'no')}.`])],
    hint: `Replace x with ${fmt(v)} and work out the left side. Then compare it with ${fmt(m.c)}.` }, { kind: 'ineq', type: 'isSol', a: m.a, b: m.bb, c: m.c, op: m.op, v });
}
function readGraph() {
  const op = pick(['<', '>', '≤', '≥']), v = rnd(-8, 8);
  return tag({ ask: 'Which inequality does this graph show?', visual: graphOf(op, v), answer: choice(sol(op, v), [sol(FLIP[op], v), sol({ '<': '≤', '≤': '<', '>': '≥', '≥': '>' }[op], v), sol(op, -v || 1)]),
    ways: [way('Read the circle and the ray', [`The circle sits on ${b(fmt(v))}. That is the boundary.`,
      op === '≤' || op === '≥' ? 'The circle is filled in, so the boundary itself counts: "or equal to".' : 'The circle is open (empty), so the boundary itself does not count.',
      `The ray covers the numbers to the ${op === '>' || op === '≥' ? 'right, which are greater' : 'left, which are less'}. So it shows ${b(sol(op, v))}.`]),
      way('Test a number on the ray', [`${fmt(v + (op === '>' || op === '≥' ? 2 : -2))} is on the ray. It must make the inequality true: ${fmt(v + (op === '>' || op === '≥' ? 2 : -2))} ${op} ${fmt(v)} is true.`])],
    hint: 'Is the circle open or filled? Which way does the ray point?' }, { kind: 'ineq', type: 'graph', op, v });
}
function whichNumber() {
  const m = make(-6, 6, ['<', '>', '≤', '≥']), good = m.bound + (m.out === '<' || m.out === '≤' ? -rnd(1, 3) : rnd(1, 3));
  const dir = m.out === '<' || m.out === '≤' ? 1 : -1, strict = m.out === '<' || m.out === '>';
  const bad = shuffle([strict ? m.bound : m.bound + dir, m.bound + dir * 2, m.bound + dir * 4, m.bound + dir * 5]).slice(0, 3);
  return tag({ ask: 'Which of these numbers is a solution?', expr: `${lin(m.a, m.bb)} ${m.op} ${fmt(m.c)}`, answer: choice(fmt(good), bad.map(fmt)),
    ways: [solveWays(m).ways[0], way('Test each number', [good, ...bad].sort((p, q) => p - q).map(v => `x = ${fmt(v)}: ${par(m.a)} × ${par(v)} ${plusMinus(m.bb)} = ${fmt(m.a * v + m.bb)}, ${holds(m.a * v + m.bb, m.op, m.c) ? b('true') : 'false'}`))],
    hint: 'Solve the inequality first, or test the numbers one by one.' }, { kind: 'ineq', type: 'which', a: m.a, b: m.bb, c: m.c, op: m.op });
}
export function ineqWord() {
  const most = chance(0.5), a = rnd(3, 12), bb = rnd(5, 30), x = rnd(3, 12), extra = rnd(1, a - 1), n = nm();
  const c = most ? a * x + bb + extra : a * x + bb - extra, raw = fmt(+((c - bb) / a).toFixed(2));
  const story = most ? `${n} has ${k('$' + c)} to spend at a fair. Getting in costs ${k('$' + bb)} and each ride costs ${k('$' + a)}.` : `${n} needs at least ${k('$' + c)} for a trip. ${n} already has ${k('$' + bb)} and earns ${k('$' + a + ' an hour')}.`;
  return tag({ story, ask: most ? 'What is the greatest number of rides that fits the budget?' : 'What is the smallest whole number of hours that earns enough?', answer: num(x), op: 'multi',
    ways: [way('Write an inequality', [`Let x be the number of ${most ? 'rides' : 'hours'}: ${b(`${a}x + ${bb} ${most ? '≤' : '≥'} ${c}`)}`, `Subtract ${bb}: ${a}x ${most ? '≤' : '≥'} ${c - bb}.`,
      `Divide by ${a}: x ${most ? '≤' : '≥'} ${raw}${Number.isInteger((c - bb) / a * 100) ? '' : ' (rounded)'}.`, most ? `Part of a ride is not possible, so go DOWN to ${b(x)}.` : `${Math.floor((c - bb) / a)} hours is not quite enough, so go UP to ${b(x)}.`]),
      way('Check the neighbours', [`${x}: ${a} × ${x} + ${bb} = ${a * x + bb}, which ${most ? 'fits within' : 'reaches'} ${c}.`,
        most ? `${x + 1}: ${a} × ${x + 1} + ${bb} = ${a * (x + 1) + bb}, which is over ${c}.` : `${x - 1}: ${a} × ${x - 1} + ${bb} = ${a * (x - 1) + bb}, which is short of ${c}.`, `So ${b(x)} is the ${most ? 'most' : 'fewest'}.`])],
    read: { find: most ? 'The most rides that still fit the money.' : 'The fewest whole hours that earn enough.', know: [most ? `budget: $${c}` : `needs at least: $${c}`, most ? `entry: $${bb}` : `has: $${bb}`, `$${a} for each ${most ? 'ride' : 'hour'}`],
      clue: most ? '"Has ... to spend" means the total must be less than or equal to it.' : '"At least" means greater than or equal to.', plan: `${a}x + ${bb} ${most ? '≤' : '≥'} ${c}` },
    hint: most ? `Take away the $${bb} first. How many whole $${a} rides fit in what is left?` : `How much more is needed after the $${bb}? How many whole hours cover it?` },
  { kind: 'ineqword', a, b: bb, c, most });
}
export function genIneq(L) {
  const r = Math.random();
  if (L === 1) return r < 0.4 ? isSolution(2, 6) : r < 0.75 ? solveProblem(2, 6, ['<', '>']) : readGraph();
  if (L === 2) return r < 0.6 ? solveProblem(-9, -2, ['<', '>', '≤', '≥']) : r < 0.8 ? isSolution(-6, -2) : solveProblem(2, 9, ['≤', '≥']);
  return r < 0.3 ? ineqWord() : r < 0.6 ? whichNumber() : solveProblem(-12, 12, ['<', '>', '≤', '≥']);
}
