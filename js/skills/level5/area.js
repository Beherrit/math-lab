// Area of parallelograms, triangles and trapezoids, built from rectangles.
import { R, rnd, pick, chance, fmt, b, k, way, nm, num } from '../../util.js';
import { T, longU } from './helpers.js';
import { parallelogram, triangle, trapezoid, house } from './shapes.js';

const U = () => pick(['cm', 'm', 'ft', 'in']);
const lab = (v, u) => `${fmt(v)} ${u}`;
const sqU = u => `square ${longU(u)}`;

function paraProblem(L) {
  const u = U(), bs = L === 3 ? rnd(4, 24) / 2 : rnd(3, L === 1 ? 10 : 15), h = rnd(2, L === 1 ? 8 : 12), side = L === 1 ? 0 : h + rnd(1, 3), A = R(bs * h);
  return T({ ask: `Find the area of the parallelogram.`, visual: parallelogram(lab(bs, u), lab(h, u), side ? lab(side, u) : ''), answer: num(A), suffix: sqU(u),
    ways: [way('Cut and slide', [`Cut the triangle off one end along the dashed height and slide it to the other end.`, `Now it is a rectangle ${fmt(bs)} long and ${h} high. Nothing was added or lost.`, `Area = ${fmt(bs)} × ${h} = ${b(fmt(A))} ${sqU(u)}`]),
      way('Base times height', [`Area of a parallelogram = base × height.`, `The height is the straight-up distance (dashed line), ${h}${side ? `, not the slanted side (${side})` : ''}.`, `${fmt(bs)} × ${h} = ${b(fmt(A))} ${sqU(u)}`])],
    hint: 'Imagine cutting off the slanted end and sliding it across to make a rectangle.' }, 'para', { b: bs, h });
}
function triProblem(L) {
  const u = U(), kind = L === 1 ? 'right' : pick(['acute', 'obtuse', 'right']); let bs = rnd(3, L === 1 ? 10 : 16), h = rnd(2, L === 1 ? 8 : 12);
  if (bs % 2 && h % 2) bs += 1;
  const A = bs * h / 2;
  return T({ ask: 'Find the area of the triangle.', visual: triangle(lab(bs, u), lab(h, u), kind), answer: num(A), suffix: sqU(u),
    ways: [way(kind === 'right' ? 'Half a rectangle' : 'Half a parallelogram', [kind === 'right' ? `Put two of these triangles together and they make a rectangle ${bs} by ${h}.` : `Turn a copy of the triangle upside down and join it on: together they make a parallelogram with base ${bs} and height ${h}.`, `That shape has area ${bs} × ${h} = ${bs * h}.`, `The triangle is half of it: ${bs * h} ÷ 2 = ${b(fmt(A))} ${sqU(u)}`]),
      way('Use the rule', [`Area of a triangle = ½ × base × height. The height meets the base at a right angle${kind === 'obtuse' ? ' (here it falls outside the triangle)' : ''}.`, bs % 2 === 0 ? `Halve the base first: ${bs} ÷ 2 = ${bs / 2}, then ${bs / 2} × ${h} = ${b(fmt(A))}` : `Halve the height first: ${h} ÷ 2 = ${h / 2}, then ${bs} × ${h / 2} = ${b(fmt(A))}`])],
    hint: 'Two copies of the triangle make a shape you already know. What is its area?' }, 'tri', { b: bs, h });
}
function trapProblem() {
  const u = U(), a = rnd(2, 9), c = a + rnd(2, 8); let h = rnd(2, 10); if ((a + c) % 2 && h % 2) h += 1;
  const A = (a + c) * h / 2;
  return T({ ask: 'Find the area of the trapezoid.', visual: trapezoid(lab(a, u), lab(c, u), lab(h, u)), answer: num(A), suffix: sqU(u),
    ways: [way('Two copies make a parallelogram', [`Turn a copy upside down and join it on. The new base is ${a} + ${c} = ${a + c}, and the height is still ${h}.`, `Parallelogram: ${a + c} × ${h} = ${(a + c) * h}`, `The trapezoid is half: ${(a + c) * h} ÷ 2 = ${b(fmt(A))} ${sqU(u)}`]),
      way('Split it into two triangles', [`Draw a line from corner to corner. One triangle has base ${a}, the other has base ${c}. Both have height ${h}.`, `½ × ${a} × ${h} = ${fmt(a * h / 2)} and ½ × ${c} × ${h} = ${fmt(c * h / 2)}`, `${fmt(a * h / 2)} + ${fmt(c * h / 2)} = ${b(fmt(A))} ${sqU(u)}`])],
    hint: 'Add the two parallel sides first. Two copies of the trapezoid make a parallelogram that long.' }, 'trap', { a, c, h });
}
function missingSide() {
  const u = U(), isTri = chance(0.6), bs = rnd(3, 12), h = rnd(2, 12) * (isTri ? 2 : 1), A = isTri ? bs * h / 2 : bs * h;
  return T({ ask: `The ${isTri ? 'triangle' : 'parallelogram'} has an area of ${b(A + ' ' + sqU(u))}. What is its height?`, visual: isTri ? triangle(lab(bs, u), '?', 'acute') : parallelogram(lab(bs, u), '?'), answer: num(h), suffix: u,
    ways: [way('Work backwards', isTri ? [`Two of these triangles make a parallelogram with double the area: ${A} × 2 = ${A * 2}.`, `Base × height = ${A * 2}, so height = ${A * 2} ÷ ${bs} = ${b(h)} ${u}`] : [`Base × height = area, so ${bs} × height = ${A}.`, `Height = ${A} ÷ ${bs} = ${b(h)} ${u}`]),
      way('Write an equation', [isTri ? `½ × ${bs} × h = ${A}` : `${bs} × h = ${A}`, isTri ? `½ × ${bs} = ${fmt(bs / 2)}, so ${fmt(bs / 2)} × h = ${A} and h = ${A} ÷ ${fmt(bs / 2)} = ${b(h)}` : `h = ${A} ÷ ${bs} = ${b(h)}`, `Check: ${isTri ? `½ × ${bs} × ${h}` : `${bs} × ${h}`} = ${A}`])],
    hint: isTri ? 'Double the area first. That is the area of the parallelogram two triangles make.' : 'Which number times the base gives the area?' }, isTri ? 'triH' : 'paraH', { A, b: bs });
}
function houseProblem() {
  const u = pick(['m', 'ft']), w = rnd(2, 8) * 2, h = rnd(3, 9), t = rnd(2, 6), A = w * h + w * t / 2;
  return T({ ask: 'Find the area of the whole shape.', visual: house(lab(w, u), lab(h, u), lab(t, u)), answer: num(A), suffix: sqU(u),
    ways: [way('Rectangle plus triangle', [`Rectangle: ${w} × ${h} = ${w * h}`, `Triangle on top: base ${w}, height ${t}. ½ × ${w} × ${t} = ${w * t / 2}`, `Together: ${w * h} + ${w * t / 2} = ${b(A)} ${sqU(u)}`]),
      way('Big rectangle minus the corners', [`Draw a rectangle round the whole shape: ${w} by ${h} + ${t} = ${h + t}. Area ${w} × ${h + t} = ${w * (h + t)}.`, `The two empty corners are triangles, each ${w / 2} by ${t}. Together they make one ${w / 2} by ${t} rectangle: ${w / 2 * t}.`, `${w * (h + t)} − ${w / 2 * t} = ${b(A)} ${sqU(u)}`])],
    hint: 'Split the shape along the dashed line into a rectangle and a triangle.' }, 'house', { w, h, t });
}
const AREA_CTX = [
  { s: (bs, h) => `A triangular sail is ${k(bs + ' m')} along the bottom and ${k(h + ' m')} tall.`, ask: 'How many square meters of cloth is the sail?', tri: true },
  { s: (bs, h) => `A skate ramp has a triangular side panel with a base of ${k(bs + ' ft')} and a height of ${k(h + ' ft')}.`, ask: 'What is the area of the panel, in square feet?', tri: true },
  { s: (bs, h) => `A parking space is a parallelogram with a base of ${k(bs + ' ft')} and a height of ${k(h + ' ft')}.`, ask: 'What is the area of the space, in square feet?', tri: false },
  { s: (bs, h, n) => `${n} paints a parallelogram on a wall. Its base is ${k(bs + ' m')} and its height is ${k(h + ' m')}.`, ask: 'How many square meters get painted?', tri: false },
  { s: (bs, h) => `A triangular garden bed has a base of ${k(bs + ' m')} and a height of ${k(h + ' m')}.`, ask: 'What is its area, in square meters?', tri: true },
];
export function areaWord() {
  const c = pick(AREA_CTX), bs = rnd(2, 9) * 2, h = rnd(3, 12), A = c.tri ? bs * h / 2 : bs * h;
  return T({ story: c.s(bs, h, nm()), ask: c.ask, answer: num(A), op: c.tri ? 'multi' : 'mul',
    ways: [way('Build it from a rectangle', c.tri ? [`Two of these triangles make a parallelogram, which has the same area as a ${bs} by ${h} rectangle: ${bs} × ${h} = ${bs * h}.`, `One triangle is half: ${bs * h} ÷ 2 = ${b(A)}`] : [`Cut off the slanted end and slide it across: a rectangle ${bs} by ${h}.`, `${bs} × ${h} = ${b(A)}`]),
      way('Use the rule', c.tri ? [`½ × base × height = ½ × ${bs} × ${h}`, `${bs / 2} × ${h} = ${b(A)}`] : [`base × height = ${bs} × ${h} = ${b(A)}`, 'Use the straight-up height, never the slanted side.'])],
    read: { find: 'The area (the flat space it covers).', know: [`base ${bs}`, `height ${h}`], clue: c.tri ? 'A triangle is half of a parallelogram with the same base and height.' : 'A parallelogram covers the same space as a rectangle with the same base and height.', plan: c.tri ? `${bs} × ${h} ÷ 2` : `${bs} × ${h}` },
    hint: c.tri ? 'Find base × height, then remember a triangle is only half of that.' : 'Area of a parallelogram = base × height.' }, c.tri ? 'tri' : 'para', { b: bs, h });
}
export function genArea(L) {
  if (L === 1) return chance(0.5) ? paraProblem(1) : triProblem(1);
  if (L === 2) return pick([() => triProblem(2), trapProblem, () => paraProblem(2), areaWord])();
  return pick([missingSide, houseProblem, trapProblem, () => paraProblem(3)])();
}
