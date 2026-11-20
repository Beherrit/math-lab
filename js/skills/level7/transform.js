// Transformations on the coordinate plane: where does a point or a corner of a triangle land?
import { rnd, pick, chance, shuffle, b, way, fmt, point, choice } from '../../util.js';
import { pt, nz, plus } from './h.js';
import { grid, quad } from './draw.js';

const slide = (d, pos, negv) => (d === 0 ? '' : `${Math.abs(d)} ${d > 0 ? pos : negv}`);
const slideText = ({ dx, dy }) => [slide(dx, 'right', 'left'), slide(dy, 'up', 'down')].filter(Boolean).join(' and ');
const moved = (v, d) => (d === 0 ? v : `${v} ${plus(d)}`);
const half = k => (k === 0.5 ? '½' : fmt(k));
// Every transformation: how it moves a point, how to say it, its coordinate rule, and why the rule works.
export const T = {
  tr: { f: ([x, y], o) => [x + o.dx, y + o.dy], say: o => `translated ${slideText(o)}`, rule: o => `(x, y) → (${moved('x', o.dx)}, ${moved('y', o.dy)})`,
    why: o => `A translation slides every point the same way. Right or left changes x by ${fmt(o.dx)}. Up or down changes y by ${fmt(o.dy)}.`, name: 'A translation (slide)' },
  rx: { f: ([x, y]) => [x, -y], say: () => 'reflected across the x-axis', rule: () => '(x, y) → (x, −y)',
    why: () => 'The x-axis is the mirror. The point stays the same distance left or right, and flips to the same distance on the other side of the axis: y changes sign.', name: 'A reflection (flip)' },
  ry: { f: ([x, y]) => [-x, y], say: () => 'reflected across the y-axis', rule: () => '(x, y) → (−x, y)',
    why: () => 'The y-axis is the mirror. The point keeps its height, and flips to the same distance on the other side of the axis: x changes sign.', name: 'A reflection (flip)' },
  r90: { f: ([x, y]) => [-y, x], say: () => 'rotated 90° counter-clockwise about the origin', rule: () => '(x, y) → (−y, x)',
    why: () => 'A quarter turn counter-clockwise swings the across-distance into an up-distance, and the up-distance into a leftward one: swap the numbers, then change the sign of the new first one.', name: 'A rotation (turn)' },
  r270: { f: ([x, y]) => [y, -x], say: () => 'rotated 90° clockwise about the origin', rule: () => '(x, y) → (y, −x)',
    why: () => 'A quarter turn clockwise swings the up-distance into an across-distance, and the across-distance into a downward one: swap the numbers, then change the sign of the new second one.', name: 'A rotation (turn)' },
  r180: { f: ([x, y]) => [-x, -y], say: () => 'rotated 180° about the origin', rule: () => '(x, y) → (−x, −y)',
    why: () => 'A half turn sends every point straight through the origin to the opposite side, the same distance away: both signs change.', name: 'A rotation (turn)' },
  dil: { f: ([x, y], o) => [x * o.k, y * o.k], say: o => `dilated from the origin with scale factor ${half(o.k)}`, rule: o => `(x, y) → (${half(o.k)}x, ${half(o.k)}y)`,
    why: o => `A dilation from the origin multiplies every distance from the origin by ${half(o.k)}, so both coordinates are multiplied by ${half(o.k)}.`, name: 'A dilation (resize)' },
};
export const apply = (step, p) => T[step.type].f(p, step).map(v => v + 0); // + 0 turns −0 into 0
const inside = (p, r) => Math.abs(p[0]) <= r && Math.abs(p[1]) <= r;
const offAxis = r => { const x = nz(-r, r), y = nz(-r, r); return Math.abs(x) === Math.abs(y) ? offAxis(r) : [x, y]; };
// Wrong answers that come from using a different transformation, or mixing up x and y.
export function slips(p, q, step) {
  const [x, y] = p, others = Object.keys(T).filter(k => k !== 'tr' && k !== 'dil').map(k => T[k].f(p));
  if (step.type === 'tr') others.push([x + step.dy, y + step.dx], [x - step.dx, y - step.dy], [x + step.dx, y - step.dy], [x - step.dx, y + step.dy]);
  if (step.type === 'dil') others.push([x + step.k, y + step.k], [x * step.k, y], [x, y * step.k]);
  others.push([q[1], q[0]]);
  return shuffle(others).map(o => pt(...o)).filter(s => s !== pt(...q));
}
export function ways(step, p, q, pic) {
  const t = T[step.type];
  return [way('See it on the grid', [pic, t.why(step), `${pt(...p)} lands on ${b(pt(...q))}.`]),
    way('Use the coordinate rule', [`Rule: ${t.rule(step)}`, `Put in x = ${fmt(p[0])} and y = ${fmt(p[1])}: ${b(pt(...q))}`])];
}
const HINT = { tr: 'Left and right change x. Up and down change y.', rx: 'The x-axis is the mirror, so the point keeps its x.', ry: 'The y-axis is the mirror, so the point keeps its y.',
  r90: 'A quarter turn counter-clockwise (to the left). The point stays the same distance from the origin.', r270: 'A quarter turn clockwise. The point stays the same distance from the origin.', r180: 'A half turn puts the point on the opposite side of the origin.', dil: 'Multiply both coordinates by the scale factor.' };
// A step of the given type that keeps p on a grid of half-width r.
export function makeStep(type, p, r) {
  if (type === 'tr') { const s = { type, dx: nz(-5, 5), dy: chance(0.2) ? 0 : nz(-5, 5) }; return inside(apply(s, p), r) ? s : makeStep(type, p, r); }
  if (type === 'dil') return { type, k: p.every(v => v % 2 === 0) && chance(0.5) ? 0.5 : pick([2, 3]) };
  return { type };
}
// One point P and its image, answered by choice on the four-quadrant grid.
export function imagePoint(type) {
  const r = 6, p = type === 'dil' ? offAxis(4) : offAxis(5), step = makeStep(type, p, r), q = apply(step, p);
  if (!inside(q, r)) return null;
  const pic = quad({ r, pts: [{ x: p[0], y: p[1], label: 'P', cls: 'given' }, { x: q[0], y: q[1], label: 'P′' }], segs: [{ a: p, b: q }] });
  return { ask: `Point P ${pt(...p)} is ${T[type].say(step)}. Where is its image P′?`, visual: quad({ r, pts: [{ x: p[0], y: p[1], label: 'P' }] }), answer: choice(pt(...q), slips(p, q, step)), hint: HINT[type], ways: ways(step, p, q, pic), _t: { k: 'tr', steps: [step], p } };
}
// The same idea in the first quadrant, answered by tapping the grid.
export function tapImage(type) {
  const step = type === 'tr' ? { type, dx: nz(-4, 5), dy: nz(-4, 5) } : { type, k: pick([2, 2, 3]) };
  const p = type === 'tr' ? [rnd(Math.max(0, -step.dx), Math.min(10, 10 - step.dx)), rnd(Math.max(0, -step.dy), Math.min(10, 10 - step.dy))] : [rnd(1, Math.floor(10 / step.k)), rnd(1, Math.floor(10 / step.k))];
  const q = apply(step, p), given = [{ x: p[0], y: p[1], label: 'P', cls: 'given' }];
  return { ask: `Point P ${pt(...p)} is ${T[type].say(step)}. Tap its image P′.`, visual: grid({ interactive: true, pts: given }), answer: point(...q), hint: HINT[type], _t: { k: 'tr', steps: [step], p },
    ways: ways(step, p, q, grid({ pts: [...given, { x: q[0], y: q[1], label: 'P′' }], segs: type === 'dil' ? [{ a: [0, 0], b: q }] : [{ a: p, b: [q[0], p[1]] }, { a: [q[0], p[1]], b: q }] })) };
}
