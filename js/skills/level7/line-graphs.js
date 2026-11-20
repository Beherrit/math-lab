// Matching a graph, or two points, to its equation y = mx + b.
import { rnd, pick, b, way, F, fmt, choice } from '../../util.js';
import { eqn, eqnF, pt, par, sl, nz, term, subst } from './h.js';
import { quad, stairs } from './draw.js';

const FRACS = [[1, 2], [-1, 2], [3, 2], [-3, 2], [2, 3], [-2, 3], [1, 3], [-1, 3]];
// Graph on the four-quadrant grid. Step 2 uses whole-number slopes, step 3 uses fraction slopes.
export function matchGraph(L) {
  const [n, d] = L === 2 ? [nz(-3, 3), 1] : pick(FRACS), c = rnd(-3, 3), p = [0, c], q = [d, c + n];
  if (Math.abs(q[1]) > 6) return null;
  const right = eqnF(n, d, c), layer = { lines: [{ m: n / d, c }], pts: [{ x: 0, y: c }, { x: q[0], y: q[1] }] };
  const wrong = d === 1 ? [eqn(c, n), eqn(-n, c), eqn(n, -c), eqn(n, c + 1)] : [eqnF(d, n, c), eqnF(-n, d, c), eqnF(n, d, -c), eqnF(n * d, 1, c)];
  return { ask: 'Which equation matches this line?', visual: quad(layer), answer: choice(right, wrong), hint: 'Find where the line crosses the y-axis first. Then count rise over run between the two dots.', _t: { k: 'line', n, d, c, ask: 'eq' },
    ways: [way('Read b, then m', [quad({ ...layer, segs: stairs(p, q) }), `The line crosses the y-axis at ${pt(0, c)}, so b = ${fmt(c)}.`, `From ${pt(...p)} to ${pt(...q)}: run ${d}, rise ${fmt(n)}. Slope m = ${d === 1 ? fmt(n) : F(fmt(n), d)}.`, `Put them into y = mx + b: ${b(right)}`]),
      way('Test a point', [`The dot at ${pt(...q)} is on the line, so its numbers must make the equation true.`, `In ${right}: ${sl(n, d)} × ${d}${c === 0 ? '' : ` ${c < 0 ? '−' : '+'} ${Math.abs(c)}`} = ${fmt(q[1])}. That works.`, 'Try the same point in the other choices and they give a different y.'])] };
}
export function fromTwoPoints() {
  const m = nz(-4, 4), c = nz(-6, 6), x1 = nz(-4, 3), x2 = x1 + rnd(1, 3), p = [x1, m * x1 + c], q = [x2, m * x2 + c];
  if (x2 === 0) return null;
  const right = eqn(m, c);
  return { ask: `Which equation is the line through ${pt(...p)} and ${pt(...q)}?`, answer: choice(right, [eqn(m, p[1]), eqn(-m, c), eqn(m, -c), eqn(c, m)]), hint: 'Find the slope from the two points first. Then use one point to find b.', _t: { k: 'line2', p, q },
    ways: [way('Slope first, then b', [`Slope: ${F(`${fmt(q[1])} − ${par(p[1])}`, `${fmt(q[0])} − ${par(p[0])}`)} = ${F(fmt(q[1] - p[1]), q[0] - p[0])} = ${fmt(m)}.`, `So y = ${term(m)} + b. Use ${pt(...p)}: ${fmt(p[1])} = ${fmt(m)} × ${par(p[0])} + b, which is ${fmt(p[1])} = ${fmt(m * p[0])} + b.`, `b = ${fmt(p[1])} − ${par(m * p[0])} = ${fmt(c)}. The equation is ${b(right)}.`]),
      way('Test the choices', [`A correct equation must be true for both points.`, `${right} at x = ${fmt(p[0])}: y = ${fmt(p[1])}. At x = ${fmt(q[0])}: y = ${fmt(q[1])}. Both match.`, 'Each other choice misses at least one of the two points.'])] };
}
