// Why the slope is the same everywhere on a line: similar slope triangles, and where y = mx and y = mx + b come from.
import { rnd, pick, chance, b, way, fmt, num, choice, gcd } from '../../util.js';
import { eqn, eqnF, pt, par, sl, yesNo, plus, count } from './h.js';
import { grid, stairs } from './draw.js';

const WHY = ['The triangles have the same shape, so their sides are in the same ratio', 'The triangles are always the same size', 'The line always goes through the origin', 'The rise and the run are always equal'];
const WHY_B = ['The line starts at height b, and the rise m times x is added on top of it', 'The b is multiplied by x, just like m', 'The b is the run of the slope triangle', 'The b is the slope of the line'];
const picture = (m, c, pts, segs = []) => grid({ lines: [{ m, c }], pts: pts.map(p => ({ r: 5, ...p })), segs });
// Two slope triangles on one line: the small one is drawn, the big one is in the words.
function triangles(want) {
  const m = rnd(1, 3), a = rnd(1, 3), s = m * a, k = rnd(2, 4), x0 = rnd(0, 2), y0 = rnd(0, 1), small = [x0, y0], far = [x0 + a, y0 + s];
  const pic = picture(m, y0 - m * x0, [{ x: x0, y: y0 }], stairs(small, far)), rise = want === 'rise', given = rise ? a * k : s * k, ans = rise ? s * k : a * k;
  const lead = `The picture shows a small slope triangle on a line: run ${a}, rise ${s}. A bigger slope triangle sits on the same line.`;
  return { ask: `${lead} Its ${rise ? 'run' : 'rise'} is ${given}. What is its ${rise ? 'rise' : 'run'}?`, visual: pic, answer: num(ans), hint: 'Rise ÷ run has the same value for every slope triangle on one line.',
    _t: { k: 'slopewhy', shape: rise ? 'tri-rise' : 'tri-run', small: [a, s], given, ask: want, start: small },
    ways: [way('Same rise ÷ run', ['Both triangles sit on one straight line, so rise ÷ run is the same number for both.', `Small triangle: ${s} ÷ ${a} = ${m}.`, rise ? `Big triangle: rise ÷ ${given} = ${m}, so the rise is ${m} × ${given} = ${b(ans)}.` : `Big triangle: ${given} ÷ run = ${m}, so the run is ${given} ÷ ${m} = ${b(ans)}.`]),
      way('Scale the small triangle', [`The big ${rise ? 'run' : 'rise'} ${given} is ${k} times the small one, ${rise ? a : s}.`, 'The triangles have the same shape, so every side is scaled by the same number.', `${k} × ${rise ? s : a} = ${b(ans)}.`])] };
}
function perStep() {
  const m = rnd(2, 9), a = rnd(2, 4), s = m * a;
  return { ask: `A slope triangle on a line has a run of ${a} and a rise of ${s}. How much does the line rise for each 1 step across?`, answer: num(m), hint: 'Share the rise equally over the steps of the run.', _t: { k: 'slopewhy', shape: 'tri-ratio', small: [a, s] },
    ways: [way('Share it out', [`Over ${a} steps across the line rises ${s}, and every step is alike on a straight line.`, `${s} ÷ ${a} = ${b(m)} for each 1 across.`]), way('A triangle with run 1', [`A triangle with a run of 1 has the same shape as this one, scaled down ${a} times.`, `Its rise is ${s} ÷ ${a} = ${b(m)}.`])] };
}
function sameLine() {
  const a = rnd(2, 4), m = rnd(2, 4), k = rnd(2, 3), yes = chance(0.5), a2 = a * k, s2 = m * a2 + (yes ? 0 : pick([-1, 1]));
  return { ask: `Slope triangle 1 has a run of ${a} and a rise of ${m * a}. Slope triangle 2 has a run of ${a2} and a rise of ${s2}. Could both triangles sit on the same straight line?`, answer: yesNo(yes), hint: 'On one line, rise ÷ run is the same number for every triangle.',
    _t: { k: 'slopewhy', shape: 'same-line', t1: [a, m * a], t2: [a2, s2] },
    ways: [way('Compare rise ÷ run', [`Triangle 1: ${m * a} ÷ ${a} = ${m}.`, `Triangle 2: ${s2} ÷ ${a2} = ${sl(s2, a2)}.`, yes ? `They match, so ${b('yes')}: both fit on one line.` : `They are different, so ${b('no')}: the triangles would lie on different lines.`]),
      way('Scale triangle 1', [`Triangle 2 has ${k} times the run, so a triangle on the same line would have ${k} × ${m * a} = ${m * a2} as its rise.`, yes ? `That is ${s2}, so ${b('yes')}.` : `But the rise is ${s2}, so ${b('no')}.`])] };
}
const slopeEqs = (m, p) => [eqn(m, 0), eqnF(1, m, 0), eqn(p[0], 0), eqn(p[1], 0)];
function originY() {
  const m = rnd(2, 6), x1 = rnd(2, 4), k = rnd(2, 4), p = [x1, m * x1], x2 = k * x1, y2 = m * x2;
  return { ask: `A straight line goes through the origin and the point ${pt(...p)}. What is y on this line when x = ${x2}?`, answer: num(y2), hint: 'The slope triangle from the origin to each point has the same rise ÷ run.', _t: { k: 'slopewhy', shape: 'orig-y', p, x2 },
    ways: [way('Same ratio', [`From the origin to ${pt(...p)}: rise ÷ run = ${p[1]} ÷ ${x1} = ${m}.`, `At x = ${x2} the triangle has the same ratio: y ÷ ${x2} = ${m}.`, `y = ${m} × ${x2} = ${b(y2)}.`]), way('Scale the point', [`${x2} is ${k} times ${x1}, and the triangles are similar, so y is ${k} times as big too.`, `${k} × ${p[1]} = ${b(y2)}.`])] };
}
function originEq() {
  const m = rnd(2, 6), x1 = rnd(2, 5), p = [x1, m * x1], right = eqn(m, 0);
  return { ask: `A straight line goes through the origin and the point ${pt(...p)}. Which equation describes it?`, answer: choice(right, slopeEqs(m, p).slice(1)), hint: 'Find rise ÷ run for the triangle from the origin to the point. That is m.',
    _t: { k: 'slopewhy', shape: 'orig-eq', p },
    ways: [way('Slope triangle from the origin', [`Run ${x1}, rise ${p[1]}: m = ${p[1]} ÷ ${x1} = ${m}.`, `For any point (x, y) on the line, y ÷ x = ${m}, which gives y = ${m}x.`, `The equation is ${b(right)}.`]),
      way('Test the point', [`Put x = ${x1} into ${right}: y = ${m} × ${x1} = ${p[1]}. It matches the point.`, 'A slope that is 1 divided by m, or a slope equal to x or y, would miss the point.'])] };
}
function fromIntercept(want) {
  const m = rnd(1, 3), x = rnd(2, 3), c = rnd(1, 4), y = c + m * x;
  if (y > 10) return null;
  const rise = want === 'rise', lead = `A line crosses the y-axis at A ${pt(0, c)} and passes through B ${pt(x, y)}. The slope triangle from A to B has a run of ${x}.`;
  return { ask: `${lead} ${rise ? 'How far does it rise?' : 'What is the slope of the line?'}`, visual: picture(m, c, [{ x: 0, y: c, label: 'A' }, { x, y, label: 'B' }]), answer: num(rise ? y - c : m),
    hint: rise ? 'The rise is how far up B is from A.' : 'The slope is the rise of that triangle divided by its run.', _t: { k: 'slopewhy', shape: rise ? 'int-rise' : 'int-m', c, p: [x, y] },
    ways: [way('Use the triangle', [`B is ${y} high and A is ${c} high, so the rise is ${y} − ${c} = ${y - c}.`, rise ? `The rise is ${b(y - c)}.` : `The slope is rise ÷ run = ${y - c} ÷ ${x} = ${b(m)}.`]),
      way('Count the squares', [`Start at A ${pt(0, c)}. Go ${x} across to x = ${x}.`, `The line is at ${y} there, which is ${y - c} higher than A.`, rise ? `Rise = ${b(y - c)}.` : `${y - c} up for ${x} across: ${b(m)} per step.`])] };
}
const WHY_WAYS = [[way('Compare the triangles', ['Two slope triangles on one line have the same angles, so one is a scaled copy of the other.', 'Scaling changes the rise and the run by the same number, so rise ÷ run stays the same.', `So: ${b(WHY[0])}.`]),
  way('Test with numbers', ['Take a triangle with run 2 and rise 6, and one with run 4 and rise 12.', 'Both give 3, because the second is the first scaled up by 2. A same-size or equal-sides story would not do that.'])],
[way('Start at the y-axis', ['On the y-axis x is 0, so the line is at height b there. That is where every slope triangle starts.', 'From the start the triangle climbs the rise, which is m times x.', `So y = mx + b: ${b(WHY_B[0])}.`]), way('Try x = 0', ['Put x = 0 into y = mx + b. The mx part is 0, so y = b.', 'That is the starting height. For every step of x, the line adds m on top of it.'])]];
const why = (pool, q, shape, ways) => ({ ask: q, answer: choice(pool[0], pool.slice(1)), hint: 'Think about the shapes of the two slope triangles, and what is added or multiplied.', _t: { k: 'slopewhy', shape }, ways });
function deriveEq() {
  const d = pick([1, 1, 2, 3]), n = pick([-3, -2, -1, 1, 2, 3, 4]), c = pick([-3, -2, -1, 1, 2, 3, 4]), kk = rnd(1, 2), x = d * kk, y = c + n * kk;
  if (Math.abs(y) > 12) return null;
  const right = eqnF(n, d, c);
  return { ask: `A line crosses the y-axis at ${pt(0, c)} and passes through ${pt(x, y)}. Which equation describes it?`, answer: choice(right, [eqnF(n, d, y), eqnF(y, x, c), eqnF(-n, d, c), eqnF(n, d, -c)].filter(e => e.includes('x'))), hint: 'The rise of the slope triangle is y minus the starting height.',
    _t: { k: 'slopewhy', shape: 'derive-eq', c, p: [x, y] },
    ways: [way('Slope triangle, then shift', [`Rise: ${fmt(y)} − ${par(c)} = ${fmt(y - c)}. Run: ${x}. So m = ${fmt(y - c)} ÷ ${x} = ${sl(y - c, x)}.`, `For any point (x, y) on the line, (y − ${par(c)}) ÷ x = ${sl(n, d)}, so ${right}.`, `The equation is ${b(right)}.`]),
      way('Test the point', [`Put x = ${x} into ${right}.`, `y = ${sl(n, d)} × ${x} ${plus(c)} = ${fmt(n * kk)} ${plus(c)} = ${fmt(y)}. It matches.`, 'The other choices give a different y or a different starting height.'])] };
}
function ratioM() {
  const m = pick([-4, -3, -2, 2, 3, 4, 5]), c = rnd(-5, 6), x = rnd(2, 5), y = c + m * x;
  return { ask: `A line crosses the y-axis at ${pt(0, c)} and passes through ${pt(x, y)}. The slope triangle between them has a run of ${x}. What is the slope m?`, answer: num(m), hint: 'First work out the rise: how far y changed from the starting height.', _t: { k: 'slopewhy', shape: 'ratio-m', c, p: [x, y] },
    ways: [way('Rise over run', [`Rise: ${fmt(y)} − ${par(c)} = ${fmt(y - c)}.`, `m = rise ÷ run = ${fmt(y - c)} ÷ ${x} = ${b(fmt(m))}.`]), way('Undo the equation', [`The line is y = mx ${plus(c)}. Put in x = ${x} and y = ${fmt(y)}: ${fmt(y)} = ${x}m ${plus(c)}.`, `${x}m = ${fmt(y - c)}, so m = ${b(fmt(m))}.`])] };
}
function upTheTriangle() {
  const d = pick([2, 3, 4]), n = pick([-3, -2, 1, 2, 3, 5]), c = rnd(-4, 8), x = d * rnd(1, 3), y = c + n * x / d;
  if (gcd(n, d) !== 1) return null;
  return { ask: `A line has slope ${sl(n, d)} and crosses the y-axis at ${pt(0, c)}. A slope triangle runs from the intercept to x = ${x}. What is y there?`, answer: num(y), hint: 'The rise of the triangle is the slope times the run. Then add it to the starting height.', _t: { k: 'slopewhy', shape: 'y-tri', n, d, c, x },
    ways: [way('Rise, then add', [`Rise = slope × run = ${sl(n, d)} × ${x} = ${fmt(n * x / d)}.`, `Start at ${fmt(c)} and add the rise: ${fmt(c)} ${plus(n * x / d)} = ${b(fmt(y))}.`]), way('Step by step', [`Every ${d} across, the line goes ${n > 0 ? 'up' : 'down'} ${Math.abs(n)}. Going ${x} across is ${count(x / d, 'step')} like that.`, `${x / d} × ${par(n)} = ${fmt(n * x / d)}, and ${fmt(c)} ${plus(n * x / d)} = ${b(fmt(y))}.`])] };
}
function shifted() {
  const m = rnd(2, 6), x = rnd(2, 6), c = pick([-4, -3, -2, 2, 3, 4, 5]), up = c > 0;
  return { ask: `Every point of the line y = ${m}x is moved ${up ? 'up' : 'down'} ${Math.abs(c)}. The point ${pt(x, m * x)} moves to (${x}, ?). What is the new y?`, answer: num(m * x + c), hint: 'Moving up adds to y. Moving down takes away from y.', _t: { k: 'slopewhy', shape: 'shift', m, x, c },
    ways: [way('Move the point', [`The old y is ${m} × ${x} = ${m * x}.`, `Every point moves the same way, so the new line is y = ${m}x ${plus(c)}.`, `${up ? 'Up' : 'Down'} ${Math.abs(c)} means ${m * x} ${plus(c)} = ${b(fmt(m * x + c))}.`]), way('Use the new equation', [`The shifted line is y = ${m}x ${plus(c)}.`, `At x = ${x}: ${m} × ${x} ${plus(c)} = ${b(fmt(m * x + c))}.`])] };
}
export function genSlopeWhy(L) {
  if (L === 1) return pick([() => triangles('rise'), () => triangles('run'), perStep, sameLine])();
  if (L === 2) return pick([originY, originEq, () => fromIntercept('rise'), () => fromIntercept('m'), () => why(WHY, 'Two slope triangles, one small and one big, are drawn on the same straight line. Why is rise ÷ run the same for both?', 'why', WHY_WAYS[0])])();
  return pick([deriveEq, ratioM, upTheTriangle, shifted, () => why(WHY_B, 'Why does y = mx + b have the number b added at the end?', 'why-b', WHY_WAYS[1])])();
}
