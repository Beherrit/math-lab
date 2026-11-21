// Polygons on the coordinate plane: side lengths from coordinates, perimeter and area, and finding a missing corner.
import { rnd, pick, chance, fmt, b, k, way, num, point, plane } from '../../util.js';
import { T } from './helpers.js';
import { plane4 } from './visuals.js';

const LET = 'ABCDEF';
const P = (x, y) => `(${fmt(x)}, ${fmt(y)})`;
const named = vs => vs.map((v, i) => `${LET[i]}${P(...v)}`).join(', ');
const picture = (vs, closed = true) => plane4({ r: 6, pts: vs.map((v, i) => ({ x: v[0], y: v[1], label: LET[i] })), path: (closed ? [...vs, vs[0]] : vs).map(([x, y]) => ({ x, y })) });
// How far apart two values are on one axis, written as a true sum.
function span(axis, a, c) {
  const lo = Math.min(a, c), hi = Math.max(a, c), d = hi - lo;
  return `From ${axis} = ${fmt(lo)} to ${axis} = ${fmt(hi)}: ${lo < 0 && hi > 0 ? `${-lo} + ${hi}` : `${Math.max(Math.abs(lo), Math.abs(hi))} − ${Math.min(Math.abs(lo), Math.abs(hi))}`} = ${b(d)}`;
}
const dist = (p, q) => Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]);
// A rectangle (corners in order A B C D) and a right triangle (right angle at A). Step 1 stays in the top right quarter.
function box(L) {
  const x1 = L === 1 ? rnd(0, 3) : -rnd(1, 5), y1 = L === 1 ? rnd(0, 3) : -rnd(1, 5), x2 = L === 1 ? x1 + rnd(2, 3) : rnd(1, 5), y2 = L === 1 ? y1 + rnd(2, 3) : rnd(1, 5);
  return { rect: [[x1, y1], [x2, y1], [x2, y2], [x1, y2]], tri: [[x1, y1], [x2, y1], [x1, y2]], w: x2 - x1, h: y2 - y1 };
}
function side(L) {
  const bx = box(L), isRect = chance(0.5), vs = isRect ? bx.rect : bx.tri, i = isRect ? rnd(0, 3) : pick([0, 2]), j = isRect ? (i + 1) % 4 : i === 0 ? 1 : 0, d = dist(vs[i], vs[j]), horiz = vs[i][1] === vs[j][1];
  const [p, q] = [LET[i], LET[j]];
  return T({ ask: `${isRect ? 'Rectangle ABCD' : 'Right triangle ABC'} has corners ${named(vs)}. How long is side ${b(p + q)}?`, visual: picture(vs), answer: num(d), suffix: 'units',
    ways: [way('Use the shared coordinate', [`${p} and ${q} have the same ${horiz ? 'y' : 'x'}-coordinate (${fmt(horiz ? vs[i][1] : vs[i][0])}), so the side runs straight ${horiz ? 'across' : 'up and down'}. Only ${horiz ? 'x' : 'y'} changes.`, horiz ? span('x', vs[i][0], vs[j][0]) : span('y', vs[i][1], vs[j][1])]),
      way('Count squares', [`Count the squares along ${p + q} in the picture, from ${p} to ${q}.`, `You count ${b(d)} units. The coordinates agree: the side is ${d} long.`])],
    hint: 'Look for the coordinate the two corners share. The length is how far apart the other coordinates are.' }, 'ppSide', { vs, i, j });
}
function triArea(L) {
  const bx = box(L), vs = bx.tri, area = bx.w * bx.h / 2;
  return T({ ask: `Right triangle ABC has corners ${named(vs)}. What is its area?`, visual: picture(vs), answer: num(area), suffix: 'square units',
    ways: [way('Legs are base and height', [`The right angle is at A. The legs are AB (${bx.w} units) and AC (${bx.h} units).`, `Area = ½ × ${bx.w} × ${bx.h} = ${b(fmt(area))} square units`]),
      way('Half of a rectangle', [`Two copies of the triangle make a rectangle ${bx.w} by ${bx.h}: ${bx.w} × ${bx.h} = ${bx.w * bx.h}.`, `The triangle is half: ${bx.w * bx.h} ÷ 2 = ${b(fmt(area))} square units`])],
    hint: 'The two sides at the right angle are the base and the height. Find how long each is from the coordinates.' }, 'ppTri', { vs });
}
// An L-shape: a big rectangle with a notch cut from its top right corner. Six corners, counterclockwise.
function lShape() {
  const x1 = rnd(-5, 0), y1 = rnd(-5, 0), w = rnd(4, Math.min(8, 6 - x1)), h = rnd(4, Math.min(8, 6 - y1)), nw = rnd(1, w - 2), nh = rnd(1, h - 2), x2 = x1 + w, y2 = y1 + h;
  return { vs: [[x1, y1], [x2, y1], [x2, y2 - nh], [x2 - nw, y2 - nh], [x2 - nw, y2], [x1, y2]], w, h, nw, nh };
}
function lPerimeter() {
  const s = lShape(), edges = s.vs.map((v, i) => dist(v, s.vs[(i + 1) % 6])), total = edges.reduce((a, x) => a + x, 0);
  return T({ ask: `A shape has corners ${named(s.vs)}, joined in order. What is its perimeter?`, visual: picture(s.vs), answer: num(total), suffix: 'units',
    ways: [way('Add every side', [`Each side runs straight across or up and down, so its length is how far apart the coordinates are.`, `The sides in order: ${edges.join(', ')}.`, `${edges.join(' + ')} = ${b(total)} units`]),
      way('Slide the notch out', [`Sliding the notched sides out makes a plain rectangle ${s.w} by ${s.h}. The perimeter does not change.`, `${s.w} + ${s.h} + ${s.w} + ${s.h} = ${b(total)} units`])],
    hint: 'Find the length of each side from the coordinates, then add all of them. There are six.' }, 'ppPerim', { vs: s.vs });
}
function lArea() {
  const s = lShape(), area = s.w * s.h - s.nw * s.nh, low = s.h - s.nh;
  return T({ ask: `A shape has corners ${named(s.vs)}, joined in order. What is its area?`, visual: picture(s.vs), answer: num(area), suffix: 'square units',
    ways: [way('Big rectangle minus the notch', [`The whole rectangle is ${s.w} by ${s.h}: ${s.w} × ${s.h} = ${s.w * s.h}.`, `The missing corner is ${s.nw} by ${s.nh}: ${s.nw} × ${s.nh} = ${s.nw * s.nh}.`, `${s.w * s.h} − ${s.nw * s.nh} = ${b(area)} square units`]),
      way('Cut into two rectangles', [`Cut the shape with one straight line into a bottom rectangle ${s.w} by ${low} and a top one ${s.w - s.nw} by ${s.nh}.`, `${s.w} × ${low} = ${s.w * low} and ${s.w - s.nw} × ${s.nh} = ${(s.w - s.nw) * s.nh}.`, `${s.w * low} + ${(s.w - s.nw) * s.nh} = ${b(area)} square units`])],
    hint: 'Find the width and height of the big rectangle around the shape, then take away the part that is cut out.' }, 'ppArea', { vs: s.vs });
}
// Three corners of a rectangle are given (in order); the child finds one coordinate of the fourth.
function missing(L) {
  const bx = box(L), [A, B, C, D] = bx.rect, want = pick(['x', 'y']), at = want === 'x' ? 0 : 1, ans = D[at], vals = [A[at], B[at], C[at]];
  return T({ ask: `Three corners of a rectangle are ${named([A, B, C])}. The fourth corner is D. What is the ${b(want + '-coordinate')} of D?`, visual: picture([A, B, C], false), answer: num(ans),
    ways: [way('Line it up with a neighbour', [want === 'x' ? 'D is straight above or below A, so D has the same x as A.' : 'D is straight across from C, so D has the same y as C.', `The ${want}-coordinate of ${want === 'x' ? 'A' : 'C'} is ${b(fmt(ans))}, so D is ${b(P(...D))}.`]),
      way('Only two values', [`A rectangle with sides along the grid uses just two ${want}-values, and each one belongs to two corners.`, `The ${want}-values so far are ${vals.map(fmt).join(', ')}. ${fmt(vals.filter(v => v !== ans)[0])} is already used twice, so D takes the other one: ${b(fmt(ans))}.`])],
    hint: 'Opposite sides of a rectangle are straight across or straight up and down. Which given corner does D line up with?' }, 'ppMissing', { vs: [A, B, C], want });
}
function tap() {
  const x1 = rnd(1, 4), y1 = rnd(1, 4), x2 = x1 + rnd(2, 5), y2 = y1 + rnd(2, 5), A = [x1, y1], B = [x2, y1], C = [x2, y2], pts = [A, B, C].map((v, i) => ({ x: v[0], y: v[1], label: LET[i], cls: 'given' }));
  return T({ ask: `Three corners of a rectangle are ${named([A, B, C])}. Tap the fourth corner, D.`, visual: plane({ interactive: true, pts, path: [A, B, C].map(([x, y]) => ({ x, y })) }), answer: point(x1, y2),
    ways: [way('Line it up', [`D is straight above A, so it has the same x as A: ${x1}.`, `D is straight across from C, so it has the same y as C: ${y2}.`, `Tap ${b(`(${x1}, ${y2})`)}.`]),
      way('Count the sides', [`AB is ${x2 - x1} long, so the side DC across the top is also ${x2 - x1} long. BC is ${y2 - y1} long, so AD is ${y2 - y1} long.`, `From A go up ${y2 - y1}: you reach ${b(`(${x1}, ${y2})`)}.`])],
    hint: 'Find which given corner is straight above or below D, and which is straight across from it.' }, 'ppTap', { vs: [A, B, C] });
}
const PLANS = ['A garden plan', 'A skate park plan', 'A school yard plan'];
function scaled() {
  const bx = box(2), vs = bx.rect, s = pick([2, 3, 5, 10]), want = pick(['area', 'perimeter']), ans = want === 'area' ? bx.w * bx.h * s * s : 2 * (bx.w + bx.h) * s;
  return T({ story: `${pick(PLANS)} is drawn on a grid. Each square is ${k(s + ' meters')} wide. The plan is a rectangle with corners ${named(vs)}.`, ask: `What is the ${b(want)} of the real rectangle?`, visual: picture(vs), answer: num(ans), suffix: want === 'area' ? 'square meters' : 'meters', op: 'multi',
    ways: [want === 'area' ? way('Squares first, then scale', [`On the grid the sides are ${bx.w} and ${bx.h} squares: ${bx.w} × ${bx.h} = ${bx.w * bx.h} squares.`, `Each square is ${s} m by ${s} m, which is ${s * s} square meters. ${bx.w * bx.h} × ${s * s} = ${b(ans)} square meters`]) : way('Squares first, then scale', [`On the grid the sides are ${bx.w} and ${bx.h} squares: ${bx.w} + ${bx.h} + ${bx.w} + ${bx.h} = ${2 * (bx.w + bx.h)} squares.`, `Each square is ${s} meters: ${2 * (bx.w + bx.h)} × ${s} = ${b(ans)} meters`]),
      want === 'area' ? way('Real sides first', [`The real sides are ${bx.w} × ${s} = ${bx.w * s} m and ${bx.h} × ${s} = ${bx.h * s} m.`, `${bx.w * s} × ${bx.h * s} = ${b(ans)} square meters`]) : way('Real sides first', [`The real sides are ${bx.w} × ${s} = ${bx.w * s} m and ${bx.h} × ${s} = ${bx.h * s} m.`, `${bx.w * s} + ${bx.h * s} + ${bx.w * s} + ${bx.h * s} = ${b(ans)} meters`])],
    read: { find: `The ${want} in real meters.`, know: [`corners ${named(vs)}`, `each square is ${s} m`], clue: 'The grid counts squares, but the question asks for real meters.', plan: want === 'area' ? `squares × ${s * s}` : `squares × ${s}` },
    hint: 'First work out the sides in grid squares from the coordinates. Then think about what each square is worth.' }, 'ppScale', { vs, s, want });
}
function findY() {
  const x1 = -rnd(1, 4), x2 = x1 + 2 * rnd(2, 4), y1 = rnd(-3, 2), w = x2 - x1, h = rnd(2, 6), area = w * h / 2, y = y1 + h;
  return T({ ask: `Triangle ABC has a right angle at A. A is ${b(P(x1, y1))} and B is ${b(P(x2, y1))}. Its area is ${b(area)} square units and C is above A. What is the y-coordinate of C?`, visual: picture([[x1, y1], [x2, y1]], false), answer: num(y),
    ways: [way('Work back from the area', [`Area = ½ × base × height, so base × height = 2 × ${area} = ${2 * area}.`, `The base AB is ${w} long, so the height is ${2 * area} ÷ ${w} = ${h}.`, `C is ${h} above A, so start at ${fmt(y1)} and go up ${h}: ${b(fmt(y))}`]),
      way('Test a height', [`The base is ${w}. Try height ${h}: ½ × ${w} × ${h} = ${area}. That matches the area.`, `Going up ${h} from ${fmt(y1)} gives y = ${b(fmt(y))}.`])],
    hint: 'The area is half of base times height. Find the base from the coordinates, then work out the height.' }, 'ppFindY', { x1, y1, x2, area });
}
const SHAPES = { 1: [() => side(1), () => triArea(1), () => missing(1), tap], 2: [() => side(2), () => triArea(2), () => missing(2), scaled, lPerimeter, tap], 3: [lArea, lPerimeter, scaled, findY, () => missing(3), () => triArea(3)] };
export const genPolyPlane = L => pick(SHAPES[L])();
export const polyWord = scaled;
