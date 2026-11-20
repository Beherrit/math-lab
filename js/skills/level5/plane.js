// The coordinate plane in four quadrants: reading points, quadrants, reflections, distances along a line.
import { rnd, pick, chance, shuffle, fmt, b, way, num, choice } from '../../util.js';
import { T, rndNot } from './helpers.js';
import { plane4 } from './visuals.js';

const P = (x, y) => `(${fmt(x)}, ${fmt(y)})`;
const quadOf = (x, y) => 'Quadrant ' + (x > 0 ? (y > 0 ? 'I' : 'IV') : (y > 0 ? 'II' : 'III'));
const QUADS = ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'];
const xy = (far = 6) => { const x = rndNot(-far, far, [0]), y = rndNot(-far, far, [0]); return x > 0 && y > 0 && chance(0.8) ? xy(far) : [x, y]; };
const walk = (x, y) => [`Start at the origin (0, 0), where the axes cross.`, `The first number is x: go ${b(Math.abs(x) + (x < 0 ? ' left' : ' right'))}${x < 0 ? ' (negative x means left)' : ''}.`, `The second number is y: go ${b(Math.abs(y) + (y < 0 ? ' down' : ' up'))}${y < 0 ? ' (negative y means down)' : ''}.`];
const signWay = (x, y) => way('Check the signs', [plane4({ quads: true, pts: [{ x, y, label: 'P' }] }), `Right of the y-axis x is positive, left of it x is negative. Above the x-axis y is positive, below it y is negative.`, `Here x is ${x < 0 ? 'negative' : 'positive'} and y is ${y < 0 ? 'negative' : 'positive'}: that is ${b(quadOf(x, y))}, and the point is ${b(P(x, y))}.`]);

function readPoint() {
  const [x, y] = xy(), label = pick(['A', 'B', 'P', 'Q', 'M']);
  return T({ ask: `What are the coordinates of point ${label}?`, visual: plane4({ pts: [{ x, y, label }] }), answer: choice(P(x, y), shuffle([P(y, x), P(-x, y), P(x, -y), P(-x, -y)])),
    ways: [way('Across, then up or down', [...walk(x, y), `So ${label} is at ${b(P(x, y))}.`]), signWay(x, y)],
    hint: 'Go across first (left is negative), then up or down (down is negative).' }, 'coordRead', { x, y });
}
function whichQuadrant(shown) {
  const [x, y] = xy(9);
  return T({ ask: `In which quadrant is the point ${b(P(x, y))}?`, visual: shown ? plane4({ quads: true, r: 9 }) : '', answer: choice(quadOf(x, y), [], { all: QUADS }),
    ways: [way('Walk to the point', [...walk(x, y), `You end up in the ${y > 0 ? 'top' : 'bottom'} ${x > 0 ? 'right' : 'left'} part: ${b(quadOf(x, y))}.`]),
      way('Use the sign pattern', ['The quadrants are numbered I to IV, starting top right and going round to the left (anticlockwise).', 'I is (+, +), II is (−, +), III is (−, −), IV is (+, −).', `${P(x, y)} is (${x < 0 ? '−' : '+'}, ${y < 0 ? '−' : '+'}): ${b(quadOf(x, y))}`])],
    hint: 'Is x left or right of the y-axis? Is y above or below the x-axis?' }, 'quad', { x, y });
}
function whichPoint() {
  const x = rnd(1, 6) * pick([-1, 1]), y = rndNot(1, 6, [Math.abs(x)]) * pick([-1, 1]);
  const spots = shuffle([[x, y], [-x, y], [x, -y], [y, x]]), names = ['A', 'B', 'C', 'D'], pts = {}; spots.forEach((s, i) => { pts[names[i]] = s; });
  const [tx, ty] = pick(spots.filter(s => s[0] < 0 || s[1] < 0)), win = names[spots.findIndex(s => s[0] === tx && s[1] === ty)];
  return T({ ask: `Which point is at ${b(P(tx, ty))}?`, visual: plane4({ pts: spots.map((s, i) => ({ x: s[0], y: s[1], label: names[i] })) }), answer: choice(win, [], { all: names }),
    ways: [way('Across, then up or down', [...walk(tx, ty), `That is point ${b(win)}.`]),
      way('Rule points out', [`x = ${fmt(tx)} means the point is ${Math.abs(tx)} to the ${tx < 0 ? 'left' : 'right'} of the y-axis. Cross out any point that is not.`, `y = ${fmt(ty)} means it is ${Math.abs(ty)} ${ty < 0 ? 'below' : 'above'} the x-axis. Only ${b(win)} is left.`])],
    hint: 'The first number tells you left or right. The second tells you up or down.' }, 'which', { pts, x: tx, y: ty });
}
function reflect() {
  const [x, y] = xy(), ax = pick(['x', 'y']), rx = ax === 'x' ? x : -x, ry = ax === 'x' ? -y : y;
  const steps = [`A reflection is a flip over the ${ax}-axis, like folding the grid along it.`, ax === 'x' ? `The point stays ${Math.abs(x)} ${x < 0 ? 'left' : 'right'} of the y-axis, so x does not change. It goes from ${Math.abs(y)} ${y < 0 ? 'below' : 'above'} the x-axis to ${Math.abs(y)} ${y < 0 ? 'above' : 'below'} it.` : `The point stays ${Math.abs(y)} ${y < 0 ? 'below' : 'above'} the x-axis, so y does not change. It goes from ${Math.abs(x)} ${x < 0 ? 'left' : 'right'} of the y-axis to ${Math.abs(x)} ${x < 0 ? 'right' : 'left'} of it.`, `It lands at ${b(P(rx, ry))}.`];
  const rule = way('Use the sign rule', [`Flipping over the ${ax}-axis changes only the sign of ${ax === 'x' ? 'y' : 'x'}.`, `${P(x, y)} moves to ${b(P(rx, ry))}`, 'Check: both points are the same distance from the axis, on opposite sides.']);
  // The tap-the-point grid is shared and shows only positive x and y, so it cannot show a start point with a negative coordinate: always draw all four quadrants and pick the landing spot.
  return T({ ask: `Point P is at ${b(P(x, y))}. It is reflected (flipped) over the ${b(ax + '-axis')}. Where does it land?`, visual: plane4({ pts: [{ x, y, label: 'P' }] }), answer: choice(P(rx, ry), shuffle([P(-rx, -ry), P(x === y ? -x : y, x === y ? -y : x), P(-x, -y)])),
    ways: [way('Fold the grid', steps), rule], hint: `Only one of the two numbers changes sign. Which one stays the same when you flip over the ${ax}-axis?` }, 'reflect', { x, y, ax });
}
function lineDistance() {
  const horiz = chance(0.5), fixed = rndNot(-5, 5), p = -rnd(1, 6), q = chance(0.75) ? rnd(1, 6) : -rnd(1, 6);
  if (p === q) return lineDistance();
  const A = horiz ? { x: p, y: fixed } : { x: fixed, y: p }, B = horiz ? { x: q, y: fixed } : { x: fixed, y: q }, d = Math.abs(p - q), cross = q > 0;
  return T({ ask: `How many units apart are A ${P(A.x, A.y)} and B ${P(B.x, B.y)}?`, visual: plane4({ pts: [{ ...A, label: 'A' }, { ...B, label: 'B' }], path: [A, B] }), answer: num(d), suffix: 'units',
    ways: [way(cross ? 'Go through the axis' : 'Compare distances from the axis', [`Both points have ${horiz ? 'y' : 'x'} = ${fmt(fixed)}, so they are on the same ${horiz ? 'across' : 'up-and-down'} line. Only ${horiz ? 'x' : 'y'} changes.`, cross ? `They are on opposite sides of the ${horiz ? 'y' : 'x'}-axis: ${Math.abs(p)} on one side and ${Math.abs(q)} on the other. Add: ${Math.abs(p)} + ${Math.abs(q)} = ${b(d)}` : `They are on the same side of the ${horiz ? 'y' : 'x'}-axis, ${Math.abs(p)} and ${Math.abs(q)} away from it. Subtract: ${Math.max(-p, -q)} − ${Math.min(-p, -q)} = ${b(d)}`]),
      way('Count on the grid', [`Count the squares along the dashed line from A to B: ${b(d)}.`, `Check with subtraction: ${fmt(Math.max(p, q))} − (${fmt(Math.min(p, q))}) = ${d}`])],
    hint: `Which coordinate is the same in both points? Look at how far the other one is from 0 for each point.` }, 'pdist', { x1: A.x, y1: A.y, x2: B.x, y2: B.y });
}
function rectangle() {
  const x1 = -rnd(1, 5), x2 = rnd(1, 5), y1 = rnd(1, 5), y2 = -rnd(1, 5), w = x2 - x1, h = y1 - y2, want = pick(['perimeter', 'area', 'corner']);
  const cs = [{ x: x1, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }, { x: x1, y: y2 }], sides = [`Width: from x = ${fmt(x1)} to x = ${x2} is ${-x1} + ${x2} = ${b(w)} units.`, `Height: from y = ${fmt(y2)} to y = ${y1} is ${-y2} + ${y1} = ${b(h)} units.`];
  if (want === 'corner') return T({ ask: `Three corners of a rectangle are at ${cs.slice(0, 3).map(c => P(c.x, c.y)).join(', ')}. Where is the fourth corner?`, visual: plane4({ pts: cs.slice(0, 3), path: cs.slice(0, 3) }), answer: choice(P(x1, y2), [P(y2, x1), P(-x1, y2), P(x1, -y2), P(x1 + 1, y2), P(x1, y2 + 1)].filter(s => s !== P(x2, y2) && s !== P(x1, y1))),
    ways: [way('Match the sides', [`The missing corner is straight below ${P(x1, y1)}, so it has the same x: ${fmt(x1)}.`, `It is straight across from ${P(x2, y2)}, so it has the same y: ${fmt(y2)}.`, `Fourth corner: ${b(P(x1, y2))}`]), way('Look for the pattern', [`A rectangle with sides along the grid uses only two x values (${fmt(x1)} and ${x2}) and two y values (${y1} and ${fmt(y2)}).`, `Every mix appears once. The one still missing is ${b(P(x1, y2))}.`])],
    hint: 'Opposite sides of a rectangle line up: the missing corner shares its x with one corner and its y with another.' }, 'corner', { x1, y1, x2, y2 });
  const ans = want === 'area' ? w * h : 2 * (w + h);
  return T({ ask: `A rectangle has corners at ${cs.map(c => P(c.x, c.y)).join(', ')}. What is its ${b(want)}?`, visual: plane4({ pts: cs, path: [...cs, cs[0]] }), answer: num(ans), suffix: want === 'area' ? 'square units' : 'units',
    ways: [way('Find the side lengths', [...sides, want === 'area' ? `Area = ${w} × ${h} = ${b(ans)} square units` : `Perimeter = ${w} + ${h} + ${w} + ${h} = ${b(ans)} units`]),
      way('Count on the grid', [`Count squares along the top side: ${w}. Count along the right side: ${h}.`, want === 'area' ? `${h} rows of ${w} squares: ${b(ans)} squares inside.` : `All the way round: 2 × (${w} + ${h}) = ${b(ans)}`])],
    hint: 'How long is the top side? It crosses the y-axis, so add the two distances from the axis.' }, 'rect', { x1, y1, x2, y2, want });
}
export function genPlane(L) {
  if (L === 1) return pick([readPoint, readPoint, () => whichQuadrant(true)])();
  if (L === 2) return pick([whichPoint, reflect, () => whichQuadrant(false)])();
  return pick([lineDistance, rectangle, reflect])();
}
