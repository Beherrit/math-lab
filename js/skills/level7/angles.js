// Angles made by parallel lines and a transversal, the angle sum of a triangle, and exterior angles.
import { rnd, pick, chance, b, way, num, choice } from '../../util.js';
import { deg, lin } from './h.js';
import { parallels, extTri, tri3 } from './shapes.js';

// In the picture, angles 2, 3, 6 and 7 are the narrow ones and 1, 4, 5 and 8 the wide ones.
const NARROW = [2, 3, 6, 7];
const key = (i, j) => [i, j].sort((x, y) => x - y).join('-');
const PAIRS = {
  'vertical angles': ['1-4', '2-3', '5-8', '6-7'],
  'corresponding angles': ['1-5', '2-6', '3-7', '4-8'],
  'alternate interior angles': ['3-6', '4-5'],
  'alternate exterior angles': ['1-8', '2-7'],
  'same-side interior angles': ['3-5', '4-6'],
  'a straight-line pair': ['1-2', '1-3', '2-4', '3-4', '5-6', '5-7', '6-8', '7-8'],
};
const WHY = {
  'vertical angles': 'They sit opposite each other where two lines cross, so they are equal.',
  'corresponding angles': 'They sit in the same corner at each crossing. Slide one crossing along the transversal onto the other and they match, so they are equal.',
  'alternate interior angles': 'They are between the parallel lines, on opposite sides of the transversal. They are equal.',
  'alternate exterior angles': 'They are outside the parallel lines, on opposite sides of the transversal. They are equal.',
  'same-side interior angles': 'They are between the parallel lines, on the same side of the transversal. Together they make 180°.',
  'a straight-line pair': 'They sit side by side on a straight line, so together they make 180°.',
};
const relation = (i, j) => Object.keys(PAIRS).find(n => PAIRS[n].includes(key(i, j)));
const narrow = () => rnd(7, 17) * 5 + pick([0, 0, 2, 3]);
function findAngle(names) {
  const name = pick(names), [i, j] = pick(PAIRS[name]).split('-').map(Number), [from, to] = chance(0.5) ? [i, j] : [j, i];
  const a = narrow(), val = NARROW.includes(from) ? a : 180 - a, same = NARROW.includes(from) === NARROW.includes(to), ans = same ? val : 180 - val;
  return { ask: `The two lines with arrows are parallel. Angle ${from} is ${deg(val)}. How big is angle ${to}?`, visual: parallels({ [from]: deg(val), [to]: '?' }, [from, to]), answer: num(ans), suffix: '°', hint: same ? 'These two angles are in matching positions. Are they equal, or do they add to 180°?' : 'These two angles are not the same size. What do they add up to?', _t: { k: 'par', from, to, val },
    ways: [way('Name the pair', [`Angles ${from} and ${to} are ${b(name)}.`, WHY[name], same ? `So angle ${to} = ${b(deg(ans))}.` : `180° − ${deg(val)} = ${b(deg(ans))}`]),
      way('Only two sizes', [parallels({ [from]: deg(val) }), 'When a line crosses two parallel lines, all eight angles come in just two sizes: four narrow ones that are equal, and four wide ones that are equal. A narrow one and a wide one always add to 180°.',
        `Angle ${from} is ${NARROW.includes(from) ? 'narrow' : 'wide'} and angle ${to} is ${NARROW.includes(to) ? 'narrow' : 'wide'}, so angle ${to} is ${same ? 'the same' : `180° − ${deg(val)}`}: ${b(deg(ans))}.`])] };
}
function nameIt() {
  const names = Object.keys(PAIRS).slice(0, 5), name = pick(names), [i, j] = pick(PAIRS[name]).split('-').map(Number);
  return { ask: `The two lines with arrows are parallel. What are angles ${i} and ${j} called?`, visual: parallels({}, null), answer: choice(name, names.filter(n => n !== name)), hint: 'Are they at the same crossing? Between the parallel lines or outside? On the same side of the slanted line or opposite sides?', _t: { k: 'rel', i, j },
    ways: [way('Ask three questions', ['Same crossing, or one at each crossing? Inside the parallel lines (interior) or outside (exterior)? Same side of the transversal, or opposite sides (alternate)?', WHY[name].match(/^[^.]*\./)[0], `They are ${b(name)}.`]),
      way('Use what the words mean', ['Vertical: opposite each other at one crossing. Corresponding: the same corner at each crossing.', 'Alternate: on opposite sides of the transversal. Interior: between the parallel lines. Exterior: outside them.', `Angles ${i} and ${j} are ${b(name)}.`])] };
}
function triangleSum() {
  const a = rnd(25, 95), c = rnd(25, 140 - a), third = 180 - a - c;
  return { ask: 'Find the missing angle of the triangle.', visual: tri3(deg(a), '?', deg(c)), answer: num(third), suffix: '°', hint: 'The three angles of any triangle add up to 180°.', _t: { k: 'trisum', a, c },
    ways: [way('Use the angle sum', [`${deg(a)} + ${deg(c)} = ${deg(a + c)}`, `180° − ${deg(a + c)} = ${b(deg(third))}`]),
      way('Why 180°?', ['Draw a line through the top corner, parallel to the base.', 'The two bottom angles each have an equal alternate interior angle up at that line. Together with the top angle they fill a straight line, which is 180°.', `So ? = 180° − ${deg(a)} − ${deg(c)} = ${b(deg(third))}.`])] };
}
function exterior() {
  const a = rnd(25, 80), top = rnd(30, 150 - a), ext = a + top, wantExt = chance(0.6);
  const pic = wantExt ? extTri({ a: deg(a), b: deg(top), ext: '?' }) : extTri({ a: '?', b: deg(top), ext: deg(ext) });
  return { ask: wantExt ? 'One side of the triangle is extended. Find the outside angle marked ?.' : 'One side of the triangle is extended. Find the angle marked ?.', visual: pic, answer: num(wantExt ? ext : a), suffix: '°', hint: 'The outside angle equals the two inside angles that are far from it, added together.', _t: { k: 'ext', a, top, find: wantExt ? 'ext' : 'remote' },
    ways: [way('Use the exterior angle rule', ['An exterior angle of a triangle equals the sum of the two interior angles that do not touch it.', wantExt ? `${deg(a)} + ${deg(top)} = ${b(deg(ext))}` : `? + ${deg(top)} = ${deg(ext)}, so ? = ${deg(ext)} − ${deg(top)} = ${b(deg(a))}`]),
      way('Go through the third angle', [`The inside angle next to the outside one is on a straight line with it${wantExt ? `. First find it: 180° − ${deg(a)} − ${deg(top)} = ${deg(180 - ext)}` : `: 180° − ${deg(ext)} = ${deg(180 - ext)}`}.`,
        wantExt ? `Straight line: 180° − ${deg(180 - ext)} = ${b(deg(ext))}` : `Angle sum of the triangle: 180° − ${deg(180 - ext)} − ${deg(top)} = ${b(deg(a))}`, 'Both ways use 180° twice. That is why the rule works.'])] };
}
function withX() {
  const equal = chance(0.5), name = pick(equal ? ['corresponding angles', 'alternate interior angles', 'vertical angles'] : ['same-side interior angles', 'a straight-line pair']), [i, j] = pick(PAIRS[name]).split('-').map(Number);
  const x = rnd(8, 30), m1 = rnd(2, 5), m2 = equal ? m1 - 1 : rnd(1, 4), v1 = NARROW.includes(i) ? rnd(40, 85) : rnd(95, 140), c1 = v1 - m1 * x, c2 = (equal ? v1 : 180 - v1) - m2 * x;
  const e1 = `(${lin(m1, c1)})°`, e2 = `(${lin(m2, c2)})°`;
  return { ask: `The two lines with arrows are parallel. Find x.`, visual: parallels({ [i]: e1, [j]: e2 }, [i, j]), answer: num(x), hint: equal ? 'These angles are equal, so write an equation with one expression on each side.' : 'These angles add up to 180°, so add the two expressions and set the total equal to 180.', _t: { k: 'angx', equal, e1: [m1, c1], e2: [m2, c2] },
    ways: [way('Write the equation', [`Angles ${i} and ${j} are ${name}. ${WHY[name]}`, equal ? `${lin(m1, c1)} = ${lin(m2, c2)}` : `${lin(m1, c1)} + ${lin(m2, c2)} = 180, which is ${lin(m1 + m2, c1 + c2)} = 180`,
      equal ? `Take ${m2 === 1 ? 'x' : `${m2}x`} from both sides and tidy up: ${lin(m1 - m2, 0)} = ${c2 - c1}, so x = ${b(x)}.` : `${m1 + m2}x = ${180 - c1 - c2}, so x = ${b(x)}.`]),
    way('Check the angles', [`With x = ${x}: ${lin(m1, c1)} = ${deg(v1)} and ${lin(m2, c2)} = ${deg(m2 * x + c2)}.`, equal ? 'They are equal, as they should be.' : `${deg(v1)} + ${deg(180 - v1)} = 180°, as it should be.`])] };
}
export function genAngles(L) {
  if (L === 1) return findAngle(['vertical angles', 'a straight-line pair', 'corresponding angles']);
  if (L === 2) return pick([() => findAngle(Object.keys(PAIRS)), () => findAngle(Object.keys(PAIRS)), nameIt, triangleSum])();
  return pick([exterior, exterior, withX, withX, triangleSum, () => findAngle(['alternate interior angles', 'alternate exterior angles', 'same-side interior angles'])])();
}
