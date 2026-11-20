import { R, rnd, pick, chance, shuffle, F, fr, b, k, way, nm, num, choice, point, plane } from '../../util.js';
const VOCAB = [
{ q: 'The point where the x-axis and y-axis cross is called the…', c: 'origin', d: ['center', 'x-axis', 'grid'], why: 'The origin is (0, 0), where both lines start.' },
{ q: 'In the ordered pair (4, 7), what does the 4 tell you?', c: 'Go 4 to the right', d: ['Go 4 up', 'Go 7 to the right', 'Go 4 down'], why: 'The first number is x: how far to go ACROSS (right).' },
{ q: 'In the ordered pair (2, 9), what does the 9 tell you?', c: 'Go 9 up', d: ['Go 9 to the right', 'Go 2 up', 'Go 9 down'], why: 'The second number is y: how far to go UP.' },
{ q: 'Which line goes left to right (across)?', c: 'x-axis', d: ['y-axis', 'origin', 'ordered pair'], why: 'The x-axis runs across. Think: “x is a cross.”' },
{ q: 'Which line goes straight up and down?', c: 'y-axis', d: ['x-axis', 'origin', 'ordered pair'], why: 'The y-axis goes up. Think: “y to the sky.”' },
{ q: 'What are the coordinates of the origin?', c: '(0, 0)', d: ['(1, 1)', '(0, 1)', '(1, 0)'], why: 'At the origin you haven’t moved at all: 0 across, 0 up.' },
];
const plotWays = (x, y) => [
way('Walk, then climb', [`Start at the origin (0, 0).`, `The first number is ${x}: walk ${b(x + ' to the right')} along the x-axis.`, `The second number is ${y}: climb ${b(y + ' up')}.`, `Put your point there: (${x}, ${y}).`]),
way('Ladder rule', ['You have to walk to the ladder before you can climb it.', 'So: across first (x), then up (y). Never the other way around!']),
];
export function genCoord(L) {
if (L === 1 && chance(0.35)) {
const v = pick(VOCAB);
return { ask: v.q, answer: choice(v.c, v.d), visual: plane({ pts: [] }), ways: [way('Remember', [v.why, 'x comes first (across), y comes second (up). Alphabetical order!']), way('Look at the grid', ['The bottom line with numbers going across is the x-axis.', 'The side line with numbers going up is the y-axis.', 'They meet at the corner, (0, 0): the origin.'])], hint: 'x is across, y is up.' };
}
const x = rnd(0, 10), y = rnd(0, 10);
if (x === 0 && y === 0) return genCoord(L);
if (L === 1 || (L === 2 && chance(0.4))) return { ask: `Tap the grid to plot the point (${x}, ${y}).`, visual: plane({ interactive: true }), answer: point(x, y), ways: plotWays(x, y), hint: 'First number: go right. Second number: go up.' };
if (L === 2) {
if (x === y) return genCoord(L);
const label = pick(['A', 'B', 'P', 'Q', 'M']);
return { ask: `What are the coordinates of point ${label}?`, visual: plane({ pts: [{ x, y, label }] }), answer: choice(`(${x}, ${y})`, [`(${y}, ${x})`, `(${x}, ${Math.min(10, y + 1)})`, `(${Math.max(0, x - 1)}, ${y})`]),
ways: [way('Across, then up', [`From the origin, count how far ACROSS to get under the point: ${b(x)}.`, `Then count how far UP: ${b(y)}.`, `Write across first: ${b(`(${x}, ${y})`)}`]), way('Watch out for the trap', [`(${y}, ${x}) has the numbers flipped. That's a totally different point!`])],
hint: 'How far across is it? Write that number first.' };
}
const t = pick(['move', 'move', 'dist']);
const n = nm();
if (t === 'move') {
const sx = rnd(0, 5), sy = rnd(0, 5), r = rnd(1, 10 - sx), u = rnd(1, 10 - sy);
return { story: `${n} is at the library at ${k(`(${sx}, ${sy})`)}. ${n} walks ${k(r + ' blocks east')} (right) and ${k(u + ' blocks north')} (up) to the park.`, ask: 'Tap where the park is.', visual: plane({ interactive: true, pts: [{ x: sx, y: sy, label: 'Library', cls: 'given' }] }), answer: point(sx + r, sy + u), op: 'add',
ways: [way('Add the moves', [`Moving right adds to x: ${sx} + ${r} = ${sx + r}`, `Moving up adds to y: ${sy} + ${u} = ${sy + u}`, `The park is at ${b(`(${sx + r}, ${sy + u})`)}`]), way('Count on the grid', [`Put your finger on the library. Count ${r} squares right, then ${u} squares up.`])],
read: { find: 'Where the park is.', know: [`start at (${sx}, ${sy})`, `${r} right`, `${u} up`], clue: 'East = right (x gets bigger). North = up (y gets bigger).', plan: `(${sx} + ${r}, ${sy} + ${u})` }, hint: 'Right changes the first number. Up changes the second.' };
}
const same = chance(0.5); const a = rnd(0, 10), p1 = rnd(0, 5), p2 = rnd(p1 + 2, 10);
const A = same ? { x: a, y: p1 } : { x: p1, y: a }, B2 = same ? { x: a, y: p2 } : { x: p2, y: a };
return { ask: `How many units apart are points A (${A.x}, ${A.y}) and B (${B2.x}, ${B2.y})?`, visual: plane({ pts: [{ ...A, label: 'A' }, { ...B2, label: 'B' }], path: [A, B2] }), answer: num(p2 - p1), suffix: 'units',
ways: [way('Find what changes', [same ? `Both have x = ${a}, so they're on the same up-and-down line.` : `Both have y = ${a}, so they're on the same across line.`, `Subtract the numbers that change: ${p2} − ${p1} = ${b(p2 - p1)}`]), way('Count on the grid', [`Count the squares from A to B: ${p2 - p1}.`])],
hint: 'Which number is the same in both points? Subtract the other ones.' };
}
const S3 = Math.sqrt(3);
const SHAPES = {
square: { pts: [[20, 20], [80, 20], [80, 80], [20, 80]], ticks: [1, 1, 1, 1], right: [0, 1, 2, 3] },
rectangle: { pts: [[8, 28], [92, 28], [92, 72], [8, 72]], ticks: [1, 2, 1, 2], right: [0, 1, 2, 3] },
rhombus: { pts: [[50, 8], [82, 50], [50, 92], [18, 50]], ticks: [1, 1, 1, 1], right: [] },
parallelogram: { pts: [[28, 25], [92, 25], [72, 75], [8, 75]], ticks: [1, 2, 1, 2], right: [] },
trapezoid: { pts: [[32, 25], [68, 25], [92, 75], [8, 75]], ticks: [0, 0, 0, 0], right: [] },
equilateral: { pts: [[50, 12], [90, 12 + 40 * S3], [10, 12 + 40 * S3]], ticks: [1, 1, 1], right: [] },
isosceles: { pts: [[50, 8], [76, 88], [24, 88]], ticks: [1, 0, 1], right: [] },
rightScalene: { pts: [[18, 12], [18, 88], [82, 88]], ticks: [0, 0, 0], right: [1] },
rightIso: { pts: [[15, 15], [15, 85], [85, 85]], ticks: [1, 1, 0], right: [1] },
obtuse: { pts: [[35, 55], [90, 80], [10, 80]], ticks: [0, 0, 0], right: [] },
acuteScalene: { pts: [[65, 12], [90, 85], [15, 85]], ticks: [0, 0, 0], right: [] },
};
function drawShape(key) {
const s = SHAPES[key]; const ang = pick([0, 0, 0, 180, 12, -12, 90, 20]);
const th = ang * Math.PI / 180;
const pts = s.pts.map(([x, y]) => [50 + (x - 50) * Math.cos(th) - (y - 50) * Math.sin(th), 50 + (x - 50) * Math.sin(th) + (y - 50) * Math.cos(th)]);
const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
const pad = 12, minX = Math.min(...xs) - pad, minY = Math.min(...ys) - pad, W = Math.max(...xs) - minX + pad, H = Math.max(...ys) - minY + pad;
let g = `<svg class="viz shape" viewBox="${minX.toFixed(1)} ${minY.toFixed(1)} ${W.toFixed(1)} ${H.toFixed(1)}" role="img" aria-label="shape" style="max-width:220px">`;
g += `<polygon points="${pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}" class="body"/>`;
const n = pts.length;
s.ticks.forEach((c, i) => {
if (!c) return; const P = pts[i], Q = pts[(i + 1) % n];
const len = Math.hypot(Q[0] - P[0], Q[1] - P[1]); const ux = (Q[0] - P[0]) / len, uy = (Q[1] - P[1]) / len; const nx = -uy, ny = ux;
const mx = (P[0] + Q[0]) / 2, my = (P[1] + Q[1]) / 2;
for (let j = 0; j < c; j++) { const o = (j - (c - 1) / 2) * 4; const cx = mx + ux * o, cy = my + uy * o; g += `<line x1="${(cx - nx * 5).toFixed(1)}" y1="${(cy - ny * 5).toFixed(1)}" x2="${(cx + nx * 5).toFixed(1)}" y2="${(cy + ny * 5).toFixed(1)}" class="mark"/>`; }
});
for (const i of s.right) {
const V = pts[i], A = pts[(i + n - 1) % n], B2 = pts[(i + 1) % n];
const ua = [(A[0] - V[0]) / Math.hypot(A[0] - V[0], A[1] - V[1]), (A[1] - V[1]) / Math.hypot(A[0] - V[0], A[1] - V[1])];
const ub = [(B2[0] - V[0]) / Math.hypot(B2[0] - V[0], B2[1] - V[1]), (B2[1] - V[1]) / Math.hypot(B2[0] - V[0], B2[1] - V[1])];
const z = 8; g += `<polyline points="${V[0] + ua[0] * z},${V[1] + ua[1] * z} ${V[0] + ua[0] * z + ub[0] * z},${V[1] + ua[1] * z + ub[1] * z} ${V[0] + ub[0] * z},${V[1] + ub[1] * z}" class="mark ra"/>`;
}
return g + '</svg>';
}
const TREE = `<div class="tree"><div>Quadrilateral <small>(4 sides)</small><div>Trapezoid <small>(a pair of parallel sides)</small></div><div>Parallelogram <small>(2 pairs of parallel sides)</small><div>Rectangle <small>(+ 4 right angles)</small><div>Square</div></div><div>Rhombus <small>(+ 4 equal sides)</small><div>Square</div></div></div></div></div>`;
const MARKS_WAY = way('Read the marks', ['Little tick marks on sides mean those sides are the same length.', 'A tiny square in a corner means a right angle (like the corner of a paper).']);
const QUAD = {
square: '4 equal sides AND 4 right angles. It is also a rectangle, a rhombus and a parallelogram, but “square” is the most exact name.',
rectangle: '4 right angles, but the sides are not all equal. Opposite sides match.',
rhombus: '4 equal sides, but no right angles. It leans like a diamond.',
parallelogram: 'Two pairs of parallel sides (opposite sides match), but no right angles and not all sides equal.',
trapezoid: 'Only one pair of sides is parallel (the top and bottom).',
};
const STATEMENTS = [
['Every square is a rectangle.', true, 'A rectangle needs 4 right angles. Squares have them, so every square counts as a rectangle.'],
['Every rectangle is a square.', false, 'A rectangle can have a long side and a short side. Then it’s not a square.'],
['Every square is a rhombus.', true, 'A rhombus needs 4 equal sides. Squares have that, so yes.'],
['Every rhombus is a square.', false, 'A rhombus can lean over with no right angles. Then it’s not a square.'],
['Every rectangle is a parallelogram.', true, 'Rectangles have 2 pairs of parallel sides, so they are parallelograms.'],
['Every parallelogram is a rectangle.', false, 'A parallelogram can lean with no right angles. Then it’s not a rectangle.'],
['Every rhombus is a parallelogram.', true, 'A rhombus has 2 pairs of parallel sides, so it is a parallelogram.'],
['A rectangle always has 4 right angles.', true, 'That’s what makes it a rectangle!'],
['A parallelogram always has 4 right angles.', false, 'Some parallelograms lean over, so their angles aren’t right angles.'],
['A triangle can have two right angles.', false, 'Two right angles would make the sides go straight up, side by side, so they could never meet to close the shape.'],
['A right triangle can also be isosceles.', true, 'A right triangle can have two equal sides around its right angle.'],
['Every equilateral triangle is also isosceles.', true, 'Isosceles means at least 2 equal sides. Equilateral has 3, so it counts.'],
['An obtuse triangle has one angle bigger than a right angle.', true, 'That’s what “obtuse” means: wider than a right angle.'],
['Every quadrilateral is a parallelogram.', false, 'A trapezoid is a quadrilateral but has only one pair of parallel sides.'],
];
const CLUES = [
['I have 4 equal sides and 4 right angles. What am I?', 'square', ['rectangle', 'rhombus', 'trapezoid']],
['I have 4 right angles, but my sides are not all equal. What am I?', 'rectangle', ['square', 'rhombus', 'trapezoid']],
['I have 4 equal sides but no right angles. What am I?', 'rhombus', ['square', 'rectangle', 'trapezoid']],
['I have exactly one pair of parallel sides. What am I?', 'trapezoid', ['parallelogram', 'rectangle', 'rhombus']],
['I have 3 equal sides. What am I?', 'equilateral triangle', ['isosceles triangle', 'scalene triangle', 'right triangle']],
['I have no equal sides. What triangle am I?', 'scalene triangle', ['isosceles triangle', 'equilateral triangle', 'square']],
['I have one angle that is wider than a right angle. What triangle am I?', 'obtuse triangle', ['acute triangle', 'right triangle', 'equilateral triangle']],
['All three of my angles are smaller than a right angle. What triangle am I?', 'acute triangle', ['obtuse triangle', 'right triangle', 'scalene triangle']],
['Which shape is NOT a parallelogram?', 'trapezoid', ['square', 'rectangle', 'rhombus']],
];
export function genShapes(L) {
if (L === 1) {
if (chance(0.5)) {
const key = pick(Object.keys(QUAD));
return { ask: 'What is the best (most exact) name for this shape?', visual: drawShape(key), answer: choice(key, shuffle(Object.keys(QUAD).filter(x => x !== key)).slice(0, 3)),
ways: [MARKS_WAY, way('Check the clues', [`What makes it a ${key}: ${QUAD[key]}`, `So the best name is ${b(key)}.`]), way('The shape family tree', [TREE, 'Shapes lower in the tree are special kinds of the ones above them.'])],
hint: 'Look for tick marks (equal sides) and little squares (right angles).' };
}
const byAngle = chance(0.5);
const key = pick(['equilateral', 'isosceles', 'rightScalene', 'rightIso', 'obtuse', 'acuteScalene']);
const ang = { equilateral: 'acute', isosceles: 'acute', rightScalene: 'right', rightIso: 'right', obtuse: 'obtuse', acuteScalene: 'acute' }[key];
const side = { equilateral: 'equilateral', isosceles: 'isosceles', rightScalene: 'scalene', rightIso: 'isosceles', obtuse: 'scalene', acuteScalene: 'scalene' }[key];
if (byAngle) return { ask: 'Name this triangle by its ANGLES.', visual: drawShape(key), answer: choice(ang, [], { all: ['acute', 'right', 'obtuse'] }), choiceBig: true,
ways: [way('Look at the corners', ['Right: one corner is a perfect square corner.', 'Obtuse: one corner is wider than a square corner.', 'Acute: every corner is narrower than a square corner.', `This one is ${b(ang)}.`]),
way('The paper corner test', ['Hold the corner of a sheet of paper inside each angle.', 'Fits exactly: right angle. Paper sticks out past the sides: that angle is wider (obtuse). Sides go past the paper: narrower (acute).'])], hint: 'Is any corner a square corner? Wider than one?' };
return { ask: 'Name this triangle by its SIDES.', visual: drawShape(key), answer: choice(side, [], { all: ['equilateral', 'isosceles', 'scalene'] }), choiceBig: true,
ways: [MARKS_WAY, way('Count the equal sides', ['Equilateral: all 3 sides equal.', 'Isosceles: 2 sides equal.', 'Scalene: no sides equal.', `This one is ${b(side)}.`])], hint: 'Count the sides with matching tick marks.' };
}
if (L === 2) {
const [s, t, why] = pick(STATEMENTS);
return { ask: 'True or false?', expr: `“${s}”`, exprSmall: true, answer: choice(t ? 'True' : 'False', [], { all: ['True', 'False'] }), choiceBig: true,
ways: [way('Think it through', [why]), way('The shape family tree', [TREE, 'Every shape is also everything ABOVE it in the tree, but not the other way around.'])], hint: 'Can you picture one that breaks the rule?' };
}
const [q, c, d] = pick(CLUES);
return { ask: q, answer: choice(c, d), ways: [way('Use the family tree', [TREE, `Answer: ${b(c)}.`]), way('Triangles', ['By sides: equilateral (3 equal), isosceles (2 equal), scalene (none equal).', 'By angles: right (one square corner), obtuse (one wide corner), acute (all narrow corners).'])], hint: 'Picture the shape. Does it match every clue?' };
}
