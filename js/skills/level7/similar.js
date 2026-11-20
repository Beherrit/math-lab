// Similarity and dilations: scale factors, missing sides of similar triangles, angle-angle, and dilation followed by moves.
import { rnd, pick, chance, shuffle, b, way, F, fmt, num, frac, choice } from '../../util.js';
import { pt, sl, yesNo, fixedChoice, count } from './h.js';
import { triPair } from './figures.js';

const BASES = [[2, 3, 4], [3, 4, 5], [4, 5, 6], [5, 6, 7], [3, 5, 7], [4, 6, 9], [5, 7, 9], [6, 7, 8], [5, 12, 13]];
const lab = (lens, hide = -1) => lens.map((len, i) => ({ len, say: i === hide ? '?' : String(len) }));
const times = (a, k) => a.map(v => v * k);
const joint = a => a.join(', ');
// Matching sides: the shortest with the shortest, and so on. Small triangle q times the base, big triangle p times it.
function pair(L) {
  const base = pick(BASES), [q, p] = L === 1 ? [1, rnd(2, 4)] : pick([[2, 3], [2, 5], [3, 4], [3, 5], [1, 2], [1, 3]]);
  return { base, q, p, s1: times(base, q), s2: times(base, p) };
}
const info = (shape, g, extra = {}) => ({ k: 'sim', shape, s1: g.s1, s2: g.s2, ...extra });
function scaleFactor(g, down) {
  const [from, to] = down ? [g.s2, g.s1] : [g.s1, g.s2], k = down ? [g.q, g.p] : [g.p, g.q];
  const picture = triPair(lab(g.s1), lab(g.s2)), ratio = sl(k[0], k[1]), pairs = from.map((v, i) => `${v} and ${to[i]}`);
  const ask = `The two triangles are similar. What is the scale factor from the ${down ? 'big' : 'small'} triangle to the ${down ? 'small' : 'big'} one?`, hint = 'Divide a side of the new triangle by the matching side of the old one.';
  const ways = [way('Divide matching sides', [`The shortest sides match: ${from[0]} and ${to[0]}.`, `Scale factor = ${to[0]} ÷ ${from[0]} = ${b(ratio)}.`]), way('Check every pair', [`The matching sides are ${pairs.join('; ')}.`, `Every pair gives ${to[0]} ÷ ${from[0]} = ${b(ratio)}, so the same scale factor works for all three sides.`])];
  const answer = k[1] === 1 ? num(k[0]) : frac(k[0], k[1]);
  return { ask, visual: picture, answer, hint, ways, _t: info(down ? 'scale-down' : g.q === 1 ? 'scale-factor' : 'scale-frac', g, { dir: down ? 'down' : 'up' }) };
}
function missingSide(g) {
  const inBig = chance(0.6), hide = rnd(0, 2), known = [0, 1, 2].filter(i => i !== hide)[rnd(0, 1)];
  const [from, to] = inBig ? [g.s1, g.s2] : [g.s2, g.s1], factor = inBig ? [g.p, g.q] : [g.q, g.p], ans = to[hide];
  const left = lab(g.s1, inBig ? -1 : hide), right = lab(g.s2, inBig ? hide : -1);
  return { ask: 'The two triangles are similar. What is the missing side?', visual: triPair(left, right), answer: num(ans), hint: 'Find two matching sides that you know. Their ratio is the scale factor.', _t: info('missing-side', g, { hide, inBig, known }),
    ways: [way('Scale factor, then multiply', [`The matching sides ${from[known]} and ${to[known]} are known, so the scale factor is ${to[known]} ÷ ${from[known]} = ${sl(...factor)}.`, `The missing side matches ${from[hide]}: ${from[hide]} × ${sl(...factor)} = ${b(ans)}.`]),
      way('Equal ratios', [`Matching sides are in the same ratio: ${F(to[known], from[known])} = ${F('?', from[hide])}.`, `? = ${from[hide]} × ${to[known]} ÷ ${from[known]} = ${b(ans)}.`])] };
}
function similarYn(L) {
  const g = pair(L), yes = chance(0.5), big = g.s2.slice();
  if (!yes) big[rnd(0, 2)] += pick([-1, 1]);
  const t = big.slice().sort((u, v) => u - v);
  if (t[0] + t[1] <= t[2]) return null;
  const ratios = t.map((v, i) => sl(v, g.s1[i])), matches = t.every((v, i) => v * g.s1[0] === g.s1[i] * t[0]);
  return { ask: 'Are these two triangles similar?', visual: triPair(lab(g.s1), lab(t)), answer: yesNo(matches), hint: 'Divide each side of the second triangle by the matching side of the first. Are all three answers the same?', _t: info('sim-yn', { ...g, s2: t }),
    ways: [way('Compare the ratios', [`Shortest to shortest: ${t[0]} ÷ ${g.s1[0]} = ${ratios[0]}. Middle to middle: ${t[1]} ÷ ${g.s1[1]} = ${ratios[1]}. Longest to longest: ${t[2]} ÷ ${g.s1[2]} = ${ratios[2]}.`, matches ? `All three are the same, so ${b('yes')}: the triangles are similar.` : `They are not all the same, so ${b('no')}: one is not a scaled copy of the other.`]),
      way('Scale one side and test', [`Use the shortest sides: ${g.s1[0]} becomes ${t[0]}, so the scale factor would be ${ratios[0]}.`, `The other sides of the first triangle would become ${g.s1[1]} × ${ratios[0]} and ${g.s1[2]} × ${ratios[0]}. ${matches ? `That is ${t[1]} and ${t[2]}, which matches.` : `That does not give ${t[1]} and ${t[2]}.`}`, matches ? `So ${b('yes')}.` : `So ${b('no')}.`])] };
}
function dilateCoord() {
  const x = rnd(1, 6), y = rnd(1, 6), k = rnd(2, 4), axis = pick(['x', 'y']), v = axis === 'x' ? x : y;
  return { ask: `Point P ${pt(x, y)} is dilated from the origin with scale factor ${k}. What is the ${axis}-coordinate of its image P′?`, answer: num(k * v), hint: 'A dilation from the origin multiplies both coordinates by the scale factor.', _t: { k: 'sim', shape: 'dilate-coord', p: [x, y], factor: k, axis },
    ways: [way('Multiply the coordinate', [`The image has both coordinates multiplied by ${k}: P′ = ${pt(k * x, k * y)}.`, `The ${axis}-coordinate is ${k} × ${v} = ${b(k * v)}.`]), way('Distance from the origin', [`P′ is on the same line through the origin as P, but ${k} times as far away.`, `So its ${axis}-coordinate is ${k} times as big: ${k} × ${v} = ${b(k * v)}.`])] };
}
function sameAngles() {
  const a = rnd(30, 80), c = rnd(30, 80), third = 180 - a - c, yes = chance(0.5), pickTwo = shuffle([a, c, third]).slice(0, 2), x = pickTwo[0], y = yes ? pickTwo[1] : pickTwo[1] + pick([-10, -5, 5, 10]);
  if (third < 20 || y <= 10 || x + y >= 170) return null;
  const set1 = [a, c, third].sort((u, v) => u - v).join(), set2 = [x, y, 180 - x - y].sort((u, v) => u - v).join(), same = set1 === set2;
  return { ask: `Triangle 1 has angles of ${a}° and ${c}°. Triangle 2 has angles of ${x}° and ${y}°. Are the two triangles similar?`, answer: yesNo(same), hint: 'Find the third angle of each triangle. Similar triangles have the same three angles.', _t: { k: 'sim', shape: 'aa-yn', t1: [a, c], t2: [x, y] },
    ways: [way('Find the third angles', [`Triangle 1: 180 − ${a} − ${c} = ${third}, so its angles are ${a}°, ${c}° and ${third}°.`, `Triangle 2: 180 − ${x} − ${y} = ${180 - x - y}, so its angles are ${x}°, ${y}° and ${180 - x - y}°.`, same ? `Both have the same three angles, so ${b('yes')}.` : `The angles are different, so ${b('no')}.`]), way('Look for two matching angles', ['Two triangles with two equal angles must have a third equal angle too, so they are similar.', same ? `Triangle 2 shares two angles with triangle 1, so ${b('yes')}.` : `The angles ${a}° and ${c}° of triangle 1 do not both appear in triangle 2, so ${b('no')}.`])] };
}
function shadow(L) {
  const p = rnd(2, 5), s = rnd(2, 4), k = rnd(2, L === 3 ? 12 : 8), tall = p * k, S = s * k, thing = pick(['tree', 'flagpole', 'lamp post', 'building']);
  return { ask: `At noon a ${p} meter pole casts a shadow ${s} meters long. At the same time a ${thing} casts a shadow ${S} meters long. How tall is the ${thing}, in meters?`, answer: num(tall), hint: 'The sun makes similar triangles: pole and shadow, and building and shadow. Their sides match.', _t: { k: 'sim', shape: 'shadow', p, s, S },
    ways: [way('Scale factor of the shadows', [`The shadows are ${s} m and ${S} m, so the scale factor is ${S} ÷ ${s} = ${k}.`, `The ${thing} is ${k} times as tall as the pole: ${p} × ${k} = ${b(tall)}.`]), way('Equal ratios', [`height ÷ shadow is the same for both: ${F(p, s)} = ${F('?', S)}.`, `? = ${p} × ${S} ÷ ${s} = ${b(tall)}.`])] };
}
const slideWords = (dx, dy) => [dx ? `${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'}` : '', dy ? `${Math.abs(dy)} ${dy > 0 ? 'up' : 'down'}` : ''].filter(Boolean).join(' and ');
function dilateSlide() {
  const x = pick([-4, -3, -2, -1, 1, 2, 3, 4]), y = pick([-4, -3, -2, -1, 1, 2, 3, 4]), k = pick([2, 3]), dx = pick([-3, -2, 2, 3, 4]), dy = pick([-3, -2, 2, 3, 4]), axis = pick(['x', 'y']);
  const mid = axis === 'x' ? k * x : k * y, d = axis === 'x' ? dx : dy, end = mid + d;
  return { ask: `Point P ${pt(x, y)} is dilated from the origin with scale factor ${k}, and then slid ${slideWords(dx, dy)}. What is the ${axis}-coordinate of its final image?`, answer: num(end), hint: 'Do the dilation first. Then slide the new point.', _t: { k: 'sim', shape: 'dilate-slide', p: [x, y], factor: k, slide: [dx, dy], axis },
    ways: [way('One move at a time', [`Dilation: ${pt(x, y)} becomes ${pt(k * x, k * y)}.`, `Slide ${slideWords(dx, dy)}: ${pt(k * x + dx, k * y + dy)}.`, `The ${axis}-coordinate is ${b(fmt(end))}.`]), way('Just the ' + axis + '-coordinate', [`Start with ${fmt(axis === 'x' ? x : y)} and multiply by ${k}: ${fmt(mid)}.`, `The slide changes the ${axis}-coordinate by ${fmt(d)}: ${fmt(mid)} ${d < 0 ? '−' : '+'} ${Math.abs(d)} = ${b(fmt(end))}.`])] };
}
const KINDS = ['Congruent', 'Similar but not congruent', 'Neither'];
function similarSequence() {
  const kind = pick(KINDS), k = pick([2, 3]), s = pick([['reflected across the y-axis', 'slid 3 right'], ['rotated 180° about the origin', 'slid 2 up'], ['reflected across the x-axis', 'slid 4 left']]);
  const how = kind === 'Congruent' ? `Triangle B comes from triangle A by being ${s[0]} and then ${s[1]}.` : kind === 'Similar but not congruent' ? `Triangle B comes from triangle A by being dilated from the origin with scale factor ${k}, and then ${s[0]}.` : `Every point (x, y) of triangle A is moved to the point (${k}x, ${k + 1}y) to make triangle B.`;
  const why = kind === 'Congruent' ? 'Reflections, rotations and slides keep every length and angle, so B is congruent to A. Congruent triangles are also similar.' : kind === 'Similar but not congruent' ? `The dilation multiplies every length by ${k}, so B has the same shape but a different size. The reflection or turn after it does not change that.` : `The x-coordinates are multiplied by ${k} and the y-coordinates by ${k + 1}, so the shape is stretched one way more than the other. That is not a dilation.`;
  return { ask: `${how} How are triangle A and triangle B related?`, answer: fixedChoice(kind, KINDS), hint: 'Only slides, flips and turns keep the size. A dilation changes the size but keeps the shape. What does each step do?', _t: { k: 'sim', shape: 'sim-seq' },
    ways: [way('Check each step', [why, `So the triangles are ${b(kind.toLowerCase())}.`]), way('Compare a side and an angle', [kind === 'Neither' ? 'A side that was horizontal gets longer by a different factor from a side that was vertical, so the triangle is squashed, not resized evenly.' : kind === 'Congruent' ? 'Every side and angle of B matches A exactly.' : `Every side of B is ${k} times the matching side of A, and every angle matches.`, `So the triangles are ${b(kind.toLowerCase())}.`])] };
}
function perimeter() {
  let g = pair(2);
  while (g.base[2] > 9) g = pair(2);
  const per = g.s1[0] + g.s1[1] + g.s1[2], ans = per * g.s2[0] / g.s1[0];
  return { ask: `Triangle 1 has sides ${joint(g.s1)}. Triangle 2 is similar to it, and the side of triangle 2 that matches the ${g.s1[0]} is ${g.s2[0]}. What is the perimeter of triangle 2?`, answer: num(ans), hint: 'Find the scale factor, then think about how the perimeter scales.', _t: { k: 'sim', shape: 'perimeter', s1: g.s1, match: g.s2[0] },
    ways: [way('Scale the perimeter', [`Scale factor: ${g.s2[0]} ÷ ${g.s1[0]} = ${sl(g.s2[0], g.s1[0])}. Perimeter of triangle 1: ${g.s1[0]} + ${g.s1[1]} + ${g.s1[2]} = ${per}.`, `Every side is scaled by the same number, so the perimeter is too: ${per} × ${sl(g.s2[0], g.s1[0])} = ${b(ans)}.`]), way('Scale each side', [`The sides of triangle 2 are ${g.s1.map(v => `${v} × ${sl(g.s2[0], g.s1[0])} = ${v * g.s2[0] / g.s1[0]}`).join(', ')}.`, `Add them: ${g.s2.join(' + ')} = ${b(ans)}.`])] };
}
export function genSimilar(L) {
  if (L === 1) { const g = pair(1); return pick([() => scaleFactor(g, false), () => missingSide(g), () => similarYn(1), dilateCoord])(); }
  if (L === 2) { const g = pair(2); return pick([() => missingSide(g), () => similarYn(2), sameAngles, () => shadow(2), () => scaleFactor(g, false)])(); }
  const g = pair(2); return pick([dilateSlide, similarSequence, perimeter, () => scaleFactor(g, true), () => shadow(3)])();
}
