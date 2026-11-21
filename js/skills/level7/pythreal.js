// The Pythagorean theorem at work: screens, ladders, boxes in 3D, and using the converse to test a corner.
import { R, rnd, pick, chance, shuffle, b, way, pow, fmt, num, choice, gcd } from '../../util.js';
import { sqrt, yesNo, count } from './h.js';
import { rightTri } from './shapes.js';
import { boxDiagonal } from './figures.js';

const sq = n => n * n;
const TRIP = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20]];
// [thing, unit, the right triangles it can be built from, how many times they are scaled]
const RECTS = [['A phone screen', 'cm', [[3, 4, 5]], [2, 3]], ['A TV screen', 'inches', [[3, 4, 5]], [6, 10]], ['A picture frame', 'cm', [[3, 4, 5]], [4, 8]], ['A rectangular skate park', 'meters', [[3, 4, 5]], [5, 10]]];
const BOXES = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9], [2, 6, 9, 11], [6, 6, 7, 11], [3, 4, 12, 13], [2, 10, 11, 15]];
const inch = n => count(n, 'inch', 'inches');
const place = p => (p === 0 ? 'nearest whole number' : 'nearest tenth');
// A root that is not too close to a rounding boundary, so "to the nearest tenth" has one clear answer.
const clear = (v, p) => Math.abs(v * 10 ** p - Math.floor(v * 10 ** p) - 0.5) > 0.04;
const rounded = (v, p) => R(Math.round(v * 10 ** p) / 10 ** p);
function familyWay(t, find) {
  const g = gcd(t[0], gcd(t[1], t[2])), base = t.map(v => v / g);
  if (g > 1) return way('Spot the family', [`${t.join(', ')} is ${base.join(', ')} multiplied by ${g}.`, `${base.join(', ')} is a right triangle you may know, so the missing side is ${base[find]} × ${g} = ${b(t[find])}.`]);
  return way('Does it make sense?', find === 2 ? [`The longest side must be longer than each leg (${t[0]} and ${t[1]}) but shorter than both legs together (${t[0] + t[1]}).`, `${b(t[2])} fits.`] : [`A leg must be shorter than the longest side, ${t[2]}.`, `${pow(t[0], 2)} + ${pow(t[1], 2)} = ${fmt(sq(t[0]) + sq(t[1]))} = ${pow(t[2], 2)}, so ${b(t[find])} works.`]);
}
function rectDiag() {
  const [thing, unit, bases, [lo, hi]] = pick(RECTS), k = rnd(lo, hi), t = pick(bases).map(v => v * k), [a, c, h] = t;
  return { ask: `${thing} is ${a} ${unit} wide and ${c} ${unit} tall. How long is its diagonal, from one corner to the opposite corner?`, visual: rightTri(c, a, '?', { vr: c, hr: a }), answer: num(h), suffix: unit, hint: 'The width, the height and the diagonal make a right triangle. The diagonal is across from the right angle.', _t: { k: 'pythreal', shape: 'rect-diag', a, c },
    ways: [way('Square, add, square root', [`${pow(a, 2)} + ${pow(c, 2)} = ${fmt(sq(a))} + ${fmt(sq(c))} = ${fmt(sq(h))}`, `${sqrt(fmt(sq(h)))} = ${b(h)} ${unit}`]), familyWay(t, 2)] };
}
function ladder() {
  const t = pick(TRIP.slice(0, 5)), [a, c, h] = t, wall = pick(['wall', 'fence']);
  return { ask: `A ${h}-foot ladder leans against a ${wall}. Its foot is ${a} feet from the ${wall}. How high up does the top of the ladder reach?`, visual: rightTri('?', a, h, { vr: c, hr: a }), answer: num(c), suffix: 'feet', hint: 'The ladder is the longest side. Take away the square of the distance on the ground.', _t: { k: 'pythreal', shape: 'ladder', a, h },
    ways: [way('Take away the square you know', [`${pow('height', 2)} + ${pow(a, 2)} = ${pow(h, 2)}, so ${pow('height', 2)} = ${fmt(sq(h))} − ${fmt(sq(a))} = ${fmt(sq(c))}`, `${sqrt(fmt(sq(c)))} = ${b(c)} feet`]), familyWay([a, c, h], 1)] };
}
const OK = ['Yes', 'No'];
function cornerCheck(kind) {
  const t = pick(TRIP.slice(0, 5)), yes = chance(0.5), h = yes ? t[2] : t[2] + pick([-1, 1]), sides = kind === 'frame' ? shuffle([t[0], t[1], h]) : [t[0], t[1], h], [x, y, z] = sides.slice().sort((p, q) => p - q), right = sq(x) + sq(y) === sq(z);
  const thing = kind === 'frame' ? `A triangle frame has sides ${sides.join(' cm, ')} cm.` : `A builder checks a corner. One wall piece is ${t[0]} feet long, another is ${t[1]} feet long, and the gap across between their ends is ${h} feet.`;
  return { ask: `${thing} ${kind === 'frame' ? 'Is it a right triangle?' : 'Is the corner a right angle?'}`, answer: yesNo(right), hint: 'Square the two shorter sides and add. Does the total equal the square of the longest side?', _t: { k: 'pythreal', shape: kind === 'frame' ? 'conv-yn' : 'corner-check', sides },
    ways: [way('Test the squares', [`The shorter sides: ${pow(x, 2)} + ${pow(y, 2)} = ${fmt(sq(x))} + ${fmt(sq(y))} = ${fmt(sq(x) + sq(y))}.`, `The longest side: ${pow(z, 2)} = ${fmt(sq(z))}.`, right ? `They are equal, so ${b('yes')}: the converse of the Pythagorean theorem says it is a right angle.` : `They are different, so ${b('no')}: the angle is not a right angle.`]),
      way('Build it and compare', [`If the angle were exactly a right angle, the longest side would be ${sqrt(fmt(sq(x) + sq(y)))}.`, right ? `That is ${z}, which matches, so ${b('yes')}.` : `That is not ${z}, so the angle is ${z * z > sq(x) + sq(y) ? 'wider' : 'narrower'} than a right angle: ${b('no')}.`])] };
}
function whichHyp() {
  const t = pick(TRIP), s = shuffle(t);
  return { ask: `A right triangle has sides ${s.join(', ')}. Which side is the hypotenuse, across from the right angle?`, answer: choice(String(t[2]), [String(t[0]), String(t[1])]), hint: 'The hypotenuse is the longest side of a right triangle.', _t: { k: 'pythreal', shape: 'which-hyp', sides: s },
    ways: [way('Longest side', ['In a right triangle the side across from the right angle is always the longest.', `The longest of ${s.join(', ')} is ${b(t[2])}.`]), way('Test the squares', [`${pow(t[0], 2)} + ${pow(t[1], 2)} = ${fmt(sq(t[0]) + sq(t[1]))} and ${pow(t[2], 2)} = ${fmt(sq(t[2]))}.`, `The two smaller squares add to the square of ${b(t[2])}.`])] };
}
function roundedSide(find) {
  const p = chance(0.5) ? 0 : 1, a = rnd(4, 15), c = rnd(a + 1, 16), N = find === 'hyp' ? sq(a) + sq(c) : sq(c) - sq(a), v = Math.sqrt(N);
  if (!clear(v, p) || Number.isInteger(v)) return null;
  const ans = rounded(v, p), lo = Math.floor(v * 10 ** p) / 10 ** p, hi = R(lo + 10 ** -p), mid = R(lo + 0.5 * 10 ** -p), thing = find === 'hyp' ? `A rectangular garden is ${a} meters wide and ${c} meters long. A path goes straight across from one corner to the opposite corner.` : `A ladder ${c} feet long leans against a wall. Its foot is ${a} feet from the wall.`;
  const q = find === 'hyp' ? `How long is the path? Round to the ${place(p)}.` : `How high does it reach on the wall? Round to the ${place(p)}.`, ans2 = find === 'hyp' ? 'meters' : 'feet';
  return { ask: `${thing} ${q}`, answer: num(ans), suffix: ans2, hint: find === 'hyp' ? 'Add the squares of the two sides, then take the square root.' : 'Take the square of the distance on the ground away from the square of the ladder.', _t: { k: 'pythreal', shape: find === 'hyp' ? 'diag-round' : 'leg-round', a, c, places: p },
    ways: [way('Square, then root', [find === 'hyp' ? `${pow(a, 2)} + ${pow(c, 2)} = ${fmt(sq(a))} + ${fmt(sq(c))} = ${fmt(N)}` : `${pow(c, 2)} − ${pow(a, 2)} = ${fmt(sq(c))} − ${fmt(sq(a))} = ${fmt(N)}`, `${sqrt(fmt(N))} is about ${fmt(Math.round(v * 100) / 100)}, which rounds to ${b(fmt(ans))} (${place(p)}).`]),
      way('Squeeze it', [`${fmt(lo)} × ${fmt(lo)} = ${fmt(R(lo * lo))} is below ${fmt(N)}, and ${fmt(hi)} × ${fmt(hi)} = ${fmt(R(hi * hi))} is above it.`, `Halfway is ${fmt(mid)}, and ${fmt(mid)} × ${fmt(mid)} = ${fmt(R(mid * mid))}. ${fmt(N)} is ${N < mid * mid ? 'less' : 'more'} than that, so the root is closer to ${fmt(ans)}: ${b(fmt(ans))}.`])] };
}
function fitFlat() {
  const t = pick(TRIP.slice(0, 3)), k = pick([2, 4, 5]), [a, c, h] = t.map(v => v * k), longer = chance(0.5), stick = longer ? h + pick([2, 4]) : h - pick([2, 4]);
  return { ask: `A box has a floor ${a} cm by ${c} cm. Will a straight stick ${stick} cm long fit lying flat on the floor?`, answer: yesNo(!longer), hint: 'The longest straight line on a rectangular floor is its diagonal. How long is it?', _t: { k: 'pythreal', shape: 'fit-yn', a, c, stick },
    ways: [way('Find the diagonal', [`${pow(a, 2)} + ${pow(c, 2)} = ${fmt(sq(a))} + ${fmt(sq(c))} = ${fmt(sq(h))}, so the diagonal is ${h} cm.`, longer ? `${stick} is longer than ${h}, so it does not fit: ${b('no')}.` : `${stick} is shorter than ${h}, so it fits: ${b('yes')}.`]), way('Compare squares', [`The stick: ${pow(stick, 2)} = ${fmt(sq(stick))}. The floor: ${pow(a, 2)} + ${pow(c, 2)} = ${fmt(sq(a) + sq(c))}.`, longer ? `${fmt(sq(stick))} is more than ${fmt(sq(a) + sq(c))}, so ${b('no')}.` : `${fmt(sq(stick))} is less than ${fmt(sq(a) + sq(c))}, so ${b('yes')}.`])] };
}
const unitsOf = (l, w, h) => [`${l} in`, `${w} in`, `${h} in`];
function box3d(floor) {
  const [x, y, z, D] = pick(BOXES), dims = shuffle([x, y, z]), pic = boxDiagonal(unitsOf(...dims), { floor });
  if (!floor) return { ask: `A box is ${inch(dims[0])} long, ${inch(dims[1])} wide and ${inch(dims[2])} tall. How long is the longest straight line inside it, from a bottom corner to the opposite top corner?`, visual: pic, answer: num(D), suffix: 'inches', hint: 'First find the diagonal of the floor. That is one leg of a second right triangle.', _t: { k: 'pythreal', shape: 'box-3d', dims },
    ways: [way('Two right triangles', [`Floor diagonal: ${pow('d', 2)} = ${pow(dims[0], 2)} + ${pow(dims[1], 2)} = ${fmt(sq(dims[0]) + sq(dims[1]))}.`, `The space diagonal: ${pow('D', 2)} = ${fmt(sq(dims[0]) + sq(dims[1]))} + ${pow(dims[2], 2)} = ${fmt(sq(D))}, so D = ${b(D)} inches.`]), way('One step with three squares', [`${pow(dims[0], 2)} + ${pow(dims[1], 2)} + ${pow(dims[2], 2)} = ${dims.map(v => fmt(sq(v))).join(' + ')} = ${fmt(sq(D))}.`, `${sqrt(fmt(sq(D)))} = ${b(D)} inches.`])] };
  const N = sq(dims[0]) + sq(dims[1]), d = Math.sqrt(N);
  if (Number.isInteger(d) === false && !clear(d, 1)) return null;
  const ans = rounded(d, 1);
  return { ask: `A box is ${inch(dims[0])} long, ${inch(dims[1])} wide and ${inch(dims[2])} tall. How long is the diagonal across its floor? Round to the nearest tenth.`, visual: pic, answer: num(ans), suffix: 'inches', hint: 'The floor is a rectangle. Its diagonal is the longest side of a right triangle.', _t: { k: 'pythreal', shape: 'box-floor', dims },
    ways: [way('Square, add, root', [`${pow(dims[0], 2)} + ${pow(dims[1], 2)} = ${fmt(sq(dims[0]))} + ${fmt(sq(dims[1]))} = ${fmt(N)}`, `${sqrt(fmt(N))} is about ${fmt(Math.round(d * 100) / 100)}, which rounds to ${b(fmt(ans))} inches.`]), way('Ignore the height', ['The height of the box does not matter for the floor. Only the length and the width do.', `Length ${dims[0]} and width ${dims[1]} give a diagonal of about ${b(fmt(ans))} inches.`])] };
}
function boxFit() {
  const [x, y, z, D] = pick(BOXES), longer = chance(0.5), stick = longer ? D + rnd(1, 2) : D - rnd(1, 2);
  return { ask: `A box is ${inch(x)} by ${inch(y)} by ${inch(z)} inside. Will a straight ${stick}-inch straw fit inside it, resting corner to corner?`, answer: yesNo(!longer), hint: 'The longest straight line in a box goes from one bottom corner to the opposite top corner.', _t: { k: 'pythreal', shape: 'box-fit', dims: [x, y, z], stick },
    ways: [way('Find the longest line', [`${pow(x, 2)} + ${pow(y, 2)} + ${pow(z, 2)} = ${fmt(sq(x))} + ${fmt(sq(y))} + ${fmt(sq(z))} = ${fmt(sq(D))}, so the longest line is ${D} inches.`, longer ? `${stick} is longer than ${D}, so it does not fit: ${b('no')}.` : `${stick} is shorter than ${D}, so it fits: ${b('yes')}.`]), way('Compare squares', [`The straw: ${pow(stick, 2)} = ${fmt(sq(stick))}. The box: ${fmt(sq(D))}.`, longer ? `${fmt(sq(stick))} is more, so ${b('no')}.` : `${fmt(sq(stick))} is less, so ${b('yes')}.`])] };
}
function hiddenSide() {
  const t = pick(TRIP.slice(0, 6)), [a, c, h] = t;
  return { ask: `A rectangular flag has a diagonal of ${h} cm and one side of ${a} cm. What is its area, in square centimeters?`, answer: num(a * c), suffix: 'square cm', hint: 'First find the other side of the flag with the Pythagorean theorem. Then find the area.', _t: { k: 'pythreal', shape: 'rect-hidden', a, h },
    ways: [way('Other side, then area', [`${pow('side', 2)} = ${pow(h, 2)} − ${pow(a, 2)} = ${fmt(sq(h))} − ${fmt(sq(a))} = ${fmt(sq(c))}, so the other side is ${c} cm.`, `Area = ${a} × ${c} = ${b(a * c)} square cm.`]), way('Check the triple', [`${pow(a, 2)} + ${pow(c, 2)} = ${fmt(sq(a))} + ${fmt(sq(c))} = ${fmt(sq(h))} = ${pow(h, 2)}, so the sides ${a}, ${c} and the diagonal ${h} fit together.`, `Area = ${a} × ${c} = ${b(a * c)} square cm.`])] };
}
function squareDiag() {
  const s = rnd(5, 12), v = s * Math.SQRT2, ans = rounded(v, 1);
  if (!clear(v, 1) || rounded(s * 1.4142, 1) !== ans) return null;
  return { ask: `A square tile has sides ${s} cm long. How long is its diagonal? Round to the nearest tenth.`, answer: num(ans), suffix: 'cm', hint: 'The diagonal cuts the square into two right triangles. The two sides of the square are the legs.', _t: { k: 'pythreal', shape: 'sq-diag', s },
    ways: [way('Pythagorean theorem', [`${pow(s, 2)} + ${pow(s, 2)} = ${fmt(sq(s))} + ${fmt(sq(s))} = ${fmt(2 * sq(s))}`, `${sqrt(fmt(2 * sq(s)))} is about ${fmt(Math.round(v * 100) / 100)}, which rounds to ${b(fmt(ans))} cm.`]), way('Use the square root of 2', ['The diagonal of any square is about 1.4142 times its side.', `${s} × 1.4142 = ${fmt(Math.round(s * 1.4142 * 1000) / 1000)}, which rounds to ${b(fmt(ans))} cm.`])] };
}
export function genPythReal(L) {
  if (L === 1) return pick([rectDiag, ladder, () => cornerCheck('corner'), whichHyp])();
  if (L === 2) return pick([() => roundedSide('hyp'), () => roundedSide('leg'), fitFlat, () => cornerCheck('frame')])();
  return pick([() => box3d(false), () => box3d(true), boxFit, hiddenSide, squareDiag])();
}
