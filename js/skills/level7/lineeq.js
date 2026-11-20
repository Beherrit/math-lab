// Writing the equation of a line: from a graph, a slope and a point, two points, a table or a story.
import { rnd, pick, chance, b, way, fmt, num, frac, choice, table, gcd } from '../../util.js';
import { eqn, eqnF, pt, par, sl, nz, blank, term, plus } from './h.js';
import { grid, quad, stairs } from './draw.js';
import { SITUATIONS } from './line-stories.js';

const slopeAns = (n, d) => (n % d === 0 ? num(n / d) : frac(n, d, { signed: true }));
// "y = 2x + b" and "y = −x + b": the line with the number b still unknown.
const withB = (n, d = 1) => `${eqnF(n, d, 0)} + b`;
// y at x for the line n/d x + c, worked out: "2 × 5 + 3 = 13", or "2 × 5 = 10" when c is 0.
const at = (n, d, c, x) => `${sl(n, d)} × ${par(x)}${c === 0 ? '' : ` ${plus(c)}`} = ${fmt(n * x / d + c)}`;
const cleanEqs = (right, list) => list.filter(e => e.includes('x') && e !== right);
// "y = ?x + 3" or "y = 2x + ?": the equation with one number left out.
const gap = (m, c, want) => (want === 'm' ? `y = ${blank}x + ${c}` : `y = ${term(m)} + ${blank}`);
function fromGraph(want) {
  const m = rnd(1, 3), c = rnd(1, 4), p = [0, c], q = [2, c + 2 * m];
  const pic = grid({ lines: [{ m, c }], pts: [{ x: p[0], y: p[1], r: 5 }, { x: q[0], y: q[1], r: 5 }] }), ans = want === 'm' ? m : c;
  return { ask: 'The line is drawn. What number goes where the ? is, so that the equation matches?', expr: gap(m, c, want), visual: pic, answer: num(ans), hint: want === 'm' ? 'How far up does the line go for each step across?' : 'Where does the line cross the y-axis?',
    _t: { k: 'leq', shape: `g-${want}`, ask: want, p, q, graph: true },
    ways: want === 'm' ? [way('Rise over run', [`The dots are at ${pt(...p)} and ${pt(...q)}. From one to the other the line goes across 2 and up ${2 * m}.`, `Slope = ${2 * m} ÷ 2 = ${b(m)}.`]), way('Take one step', [`Start at ${pt(...p)} and go 1 across.`, `The line is ${m} higher there, so the slope is ${b(m)}.`])]
      : [way('Where it crosses the y-axis', [`The line crosses the y-axis at ${pt(...p)}, where x is 0.`, `So b is ${b(c)}.`]), way('Use the other dot', [`The dot ${pt(...q)} is on the line, so ${q[1]} = ${m} × ${q[0]} + b.`, `${q[1]} = ${m * 2} + b, so b = ${q[1]} − ${m * 2} = ${b(c)}.`])] };
}
function fromTable(want) {
  const m = rnd(1, 6), c = rnd(1, 9), rows = [0, 1, 2, 3].map(x => [x, m * x + c]);
  return { ask: 'The table shows points on a line. What number goes where the ? is, so that the equation matches?', expr: gap(m, c, want), visual: table(['x', 'y'], rows.map(r => r.map(fmt))), answer: num(want === 'm' ? m : c), hint: want === 'm' ? 'How much does y change when x goes up by 1?' : 'Which row has x = 0?',
    _t: { k: 'leq', shape: `t-${want}`, ask: want, p: rows[0], q: rows[1], rows },
    ways: want === 'm' ? [way('Change in y for one step', [`From the first row to the next, x goes up 1 and y goes from ${rows[0][1]} to ${rows[1][1]}.`, `y changes by ${b(m)} each step, so m = ${m}.`]), way('Use the last row', [`From ${pt(...rows[0])} to ${pt(...rows[3])}: y goes up ${rows[3][1] - rows[0][1]} while x goes up 3.`, `${rows[3][1] - rows[0][1]} ÷ 3 = ${b(m)}.`])]
      : [way('The row with x = 0', [`When x is 0, the mx part is 0, so y = b.`, `The row ${pt(...rows[0])} gives b = ${b(c)}.`]), way('Work back from x = 1', [`At x = 1, y is ${rows[1][1]}, and each step adds ${m}.`, `One step back, at x = 0: ${rows[1][1]} − ${m} = ${b(c)}.`])] };
}
const ends = (m, c, x, y) => [`Walk to x = 0: that is ${Math.abs(x)} ${Math.abs(x) === 1 ? 'step' : 'steps'} to the ${x > 0 ? 'left' : 'right'}.`, `Each step to the ${x > 0 ? 'left' : 'right'} changes y by ${fmt(x > 0 ? -m : m)}, so ${Math.abs(x)} of them change y by ${fmt(-m * x)}.`, `${fmt(y)} ${plus(-m * x)} = ${b(fmt(c))}, so b = ${fmt(c)}.`];
function slopePoint(asEq) {
  const m = nz(-5, 5), x1 = rnd(1, 6), c = rnd(-9, 12), y1 = m * x1 + c, right = eqn(m, c);
  const core = { ask: `A line has slope ${fmt(m)} and passes through ${pt(x1, y1)}. ${asEq ? 'Which equation describes it?' : 'In y = mx + b, what is b?'}`, hint: 'Put the slope and the point into y = mx + b. Only b is left to find.', _t: { k: 'leq', shape: asEq ? 'sp-eq' : 'sp-b', ask: asEq ? 'eq' : 'b', p: [x1, y1], m } };
  const put = [`Put m = ${fmt(m)}, x = ${x1} and y = ${fmt(y1)} into y = mx + b: ${fmt(y1)} = ${fmt(m)} × ${x1} + b.`, `${fmt(y1)} = ${fmt(m * x1)} + b, so b = ${fmt(y1)} − ${par(m * x1)} = ${b(fmt(c))}.`];
  if (!asEq) return { ...core, answer: num(c), ways: [way('Put the point in', put), way('Walk back to x = 0', ends(m, c, x1, y1))] };
  return { ...core, answer: choice(right, cleanEqs(right, [eqn(m, y1), eqn(m, -c), eqn(-m, c), eqn(c, m)])),
    ways: [way('Find b, then write it', [...put, `The equation is ${b(right)}.`]), way('Test the choices', [`The right equation gives y = ${fmt(y1)} when x = ${x1}.`, `${right}: ${at(m, 1, c, x1)}. It works.`, 'Putting the whole y in as b, or the wrong sign, gives a different y.'])] };
}
function twoPointsB() {
  const m = nz(-4, 4), c = rnd(-8, 10), x1 = nz(-3, 3), x2 = x1 + rnd(1, 3), p = [x1, m * x1 + c], q = [x2, m * x2 + c];
  if (x2 === 0) return null;
  return { ask: `A line passes through ${pt(...p)} and ${pt(...q)}. In y = mx + b, what is b?`, answer: num(c), hint: 'Find the slope first. Then use one of the points to find b.', _t: { k: 'leq', shape: 'tp-b', ask: 'b', p, q },
    ways: [way('Slope, then b', [`Slope: (${fmt(q[1])} − ${par(p[1])}) ÷ (${fmt(x2)} − ${par(x1)}) = ${fmt(q[1] - p[1])} ÷ ${x2 - x1} = ${fmt(m)}.`, `Put ${pt(...p)} into ${withB(m)}: ${fmt(p[1])} = ${fmt(m)} × ${par(x1)} + b.`, `b = ${fmt(p[1])} − ${par(m * x1)} = ${b(fmt(c))}.`]), way('Walk back to x = 0', [`The slope is ${fmt(m)}, because y changes by ${fmt(q[1] - p[1])} while x changes by ${x2 - x1}.`, ...ends(m, c, x1, p[1])])] };
}
function tableEq() {
  const m = nz(-4, 5), c = rnd(-8, 10), step = pick([2, 3]), x0 = step * rnd(1, 2), rows = [0, 1, 2, 3].map(i => [x0 + i * step, m * (x0 + i * step) + c]), right = eqn(m, c);
  return { ask: 'The table shows points on a line. Which equation describes it?', visual: table(['x', 'y'], rows.map(r => r.map(fmt))), answer: choice(right, cleanEqs(right, [eqn(m * step, c), eqn(m, rows[0][1]), eqn(-m, c), eqn(m, -c)])), hint: 'First find how much y changes for each 1 step of x. Then use a row to find b.',
    _t: { k: 'leq', shape: 'tab-eq', ask: 'eq', p: rows[0], q: rows[1], rows },
    ways: [way('Slope, then b', [`x goes up ${step} from row to row and y changes by ${fmt(m * step)}, so m = ${fmt(m * step)} ÷ ${step} = ${fmt(m)}.`, `First row: ${fmt(rows[0][1])} = ${fmt(m)} × ${x0} + b, so b = ${fmt(c)}.`, `The equation is ${b(right)}.`]),
      way('Test the choices', [`Try the first row ${pt(...rows[0])} in ${right}: ${at(m, 1, c, x0)}. It works.`, 'The other choices miss this row, or give the wrong change per step.'])] };
}
function storyB() {
  const s = pick(SITUATIONS), m = rnd(2, 9), x = rnd(2, 6), c = s.down ? rnd(60, 100) : rnd(5, 40), k = s.down ? -m : m, y = k * x + c;
  return { ask: `${s.rate(m)} ${s.at(x, y)} ${s.start}`, answer: num(c), hint: 'How much did the steady rate add or take away over that time? Undo it.', _t: { k: 'leq', shape: 'story-b', ask: 'b', p: [x, y], m: k },
    ways: [way('Write the equation', [`Let y = mx + b with m = ${fmt(k)} per step.`, `Put in x = ${x} and y = ${y}: ${y} = ${par(k)} × ${x} + b, so ${y} = ${fmt(k * x)} + b.`, `b = ${y} − ${par(k * x)} = ${b(c)}.`]), way('Undo the steady change', [`${x} steps at ${fmt(k)} each changed the amount by ${fmt(k * x)}.`, `Take that off: ${y} ${plus(-k * x)} = ${b(c)}.`])] };
}
function fracPoints(kind) {
  const d = pick([1, 2, 3]), n = nz(-3, 4), c = rnd(-5, 6), k1 = nz(-3, 2), k2 = k1 + rnd(1, 2);
  if (gcd(n, d) !== 1) return null;
  const p = [d * k1, c + n * k1], q = [d * k2, c + n * k2], right = eqnF(n, d, c), flip = [n < 0 ? -d : d, Math.abs(n)];
  const rise = q[1] - p[1], run = q[0] - p[0];
  const steps = [`Slope: (${fmt(q[1])} − ${par(p[1])}) ÷ (${fmt(q[0])} − ${par(p[0])}) = ${fmt(rise)} ÷ ${run} = ${sl(n, d)}.`];
  if (kind === 'm') return { ask: `A line passes through ${pt(...p)} and ${pt(...q)}. What is the slope m in y = mx + b?`, answer: slopeAns(n, d), hint: 'Rise over run: subtract the y values and the x values in the same order.', _t: { k: 'leq', shape: 'tp-m', ask: 'm', p, q },
    ways: [way('Change in y over change in x', [...steps.slice(0, 1), `So m = ${b(sl(n, d))}.`]), way('Walk along the line', [`From ${pt(...p)} to ${pt(...q)} the line goes across ${run} and ${rise < 0 ? 'down' : 'up'} ${Math.abs(rise)}.`, `${fmt(rise)} ÷ ${run} = ${b(sl(n, d))}.`])] };
  return { ask: `Which equation is the line through ${pt(...p)} and ${pt(...q)}?`, answer: choice(right, cleanEqs(right, [eqnF(flip[0], flip[1], c), eqnF(-n, d, c), eqnF(n, d, p[1]), eqnF(n, d, -c)])), hint: 'Find the slope first. Then use one point to find b.', _t: { k: 'leq', shape: 'tp-eq', ask: 'eq', p, q },
    ways: [way('Slope, then b', [...steps, `Put ${pt(...p)} in ${withB(n, d)}: ${fmt(p[1])} = ${sl(n, d)} × ${par(p[0])} + b = ${fmt(n * p[0] / d)} + b, so b = ${fmt(c)}.`, `The equation is ${b(right)}.`]), way('Test the choices', [`The right equation must give y = ${fmt(p[1])} at x = ${fmt(p[0])} and y = ${fmt(q[1])} at x = ${fmt(q[0])}.`, `${right} does: ${at(n, d, c, q[0])}.`, 'A flipped slope, a wrong sign or a wrong b misses at least one point.'])] };
}
function graphEq() {
  const d = pick([1, 2]), n = nz(-3, 3), c = rnd(-4, 4), k1 = rnd(-2, 0), k2 = k1 + rnd(1, 2), p = [d * k1, c + n * k1], q = [d * k2, c + n * k2];
  if (gcd(n, d) !== 1 || p[0] === 0 || q[0] === 0 || [...p, ...q].some(v => Math.abs(v) > 6)) return null;
  const right = eqnF(n, d, c), layer = { lines: [{ m: n / d, c }], pts: [{ x: p[0], y: p[1], label: 'A', r: 5 }, { x: q[0], y: q[1], label: 'B', r: 5 }] };
  return { ask: 'Which equation matches this line?', visual: quad(layer), answer: choice(right, cleanEqs(right, [eqnF(-n, d, c), eqnF(d, n, c), eqnF(n, d, -c), eqnF(n, d, p[1])])), hint: 'Use the two labelled dots for the slope. Then use one of them to find where the line crosses the y-axis.',
    _t: { k: 'leq', shape: 'graph-eq', ask: 'eq', p, q, graph: true },
    ways: [way('Slope from the dots, then b', [quad({ ...layer, segs: stairs(p, q) }), `From A ${pt(...p)} to B ${pt(...q)}: across ${q[0] - p[0]}, ${q[1] - p[1] < 0 ? 'down' : 'up'} ${Math.abs(q[1] - p[1])}. Slope ${sl(q[1] - p[1], q[0] - p[0])}.`, `Put A in ${withB(n, d)}: b = ${fmt(p[1])} − ${par(n * p[0] / d)} = ${fmt(c)}. The equation is ${b(right)}.`]),
      way('Test the choices', [`The dot B ${pt(...q)} must be on the line.`, `${right} at x = ${fmt(q[0])}: ${at(n, d, c, q[0])}. It works.`, 'The others miss B or have the wrong direction.'])] };
}
function storyTwo(asEq) {
  const s = pick(SITUATIONS), m = rnd(2, 9), k = s.down ? -m : m, c = s.down ? rnd(60, 100) : rnd(5, 40), x1 = rnd(1, 4), x2 = x1 + rnd(2, 4), y1 = k * x1 + c, y2 = k * x2 + c, right = eqn(k, c);
  if (y2 < 0) return null;
  const lead = s.two(x1, y1, x2, y2), core = { _t: { k: 'leq', shape: asEq ? 'story-eq' : 'story-two', ask: asEq ? 'eq' : 'b', p: [x1, y1], q: [x2, y2] }, hint: 'The rate is the change in the amount divided by the change in time. Then go back to the start.' };
  const slope = `The amount changes by ${fmt(y2 - y1)} in ${x2 - x1} steps, so m = ${fmt(y2 - y1)} ÷ ${x2 - x1} = ${fmt(k)}.`, back = `Put in the first measurement: ${fmt(y1)} = ${par(k)} × ${x1} + b, so b = ${fmt(y1)} − ${par(k * x1)} = ${fmt(c)}.`;
  if (asEq) return { ...core, ask: `${lead} (${s.vars}.) Which equation describes it?`, answer: choice(right, cleanEqs(right, [eqn(k, y1), eqn(-k, c), eqn(k, -c), eqn(c, k)])), ways: [way('Rate, then start', [slope, back, `The equation is ${b(right)}.`]), way('Test the choices', [`The right equation gives ${fmt(y1)} at x = ${x1} and ${fmt(y2)} at x = ${x2}.`, `${right}: ${at(k, 1, c, x2)}. It works.`, 'The other choices miss one of the two measurements.'])] };
  return { ...core, ask: `${lead} ${s.start}`, answer: num(c), ways: [way('Rate, then go back', [slope, back.replace(/, so b = .*$/, '.'), `b = ${fmt(y1)} − ${par(k * x1)} = ${b(fmt(c))}.`]),
    way('Subtract the two equations', [`y = mx + b gives ${fmt(y1)} = ${x1}m + b and ${fmt(y2)} = ${x2}m + b.`, `Subtract: ${fmt(y2 - y1)} = ${x2 - x1}m, so m = ${fmt(k)}.`, `Then b = ${fmt(y1)} − ${par(k * x1)} = ${b(fmt(c))}.`])] };
}
export function genLineEq(L) {
  if (L === 1) return pick([() => fromGraph('m'), () => fromGraph('b'), () => fromTable('m'), () => fromTable('b')])();
  if (L === 2) return pick([() => slopePoint(false), () => slopePoint(true), twoPointsB, tableEq, storyB])();
  return pick([() => fracPoints('eq'), () => fracPoints('m'), graphEq, () => storyTwo(false), () => storyTwo(true)])();
}
