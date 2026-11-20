// Angle relationships: complementary, supplementary, vertical, adjacent, around a point, and inside a triangle.
import { rnd, pick, chance, b, way, num, choice } from '../../util.js';
import { lin, xTerm, tag } from './helpers.js';
import { raysFig, triFig } from './visuals-shapes.js';

const dg = v => `${v}°`;
const TOTALS = {
  90: 'A right angle is a quarter turn: 90°. Two angles that fill it are called complementary.',
  180: 'A straight line is a half turn: 180°. Angles that fill it are called supplementary.',
  360: 'All the way round a point is a full turn: 360°.',
};
const TRI_WHY = 'Tear the three corners off any paper triangle and push them together. They always make a straight line, so the angles of a triangle add to 180°.';
// Find the angle that completes a total, given the others.
function missing(total, known, visual, ask, why = TOTALS[total]) {
  const sum = known.reduce((s, v) => s + v, 0), x = total - sum;
  const told = known.length === 1 ? `One angle is ${dg(known[0])}.` : `The other angles are ${known.slice(0, -1).map(dg).join(', ')} and ${dg(known[known.length - 1])}.`;
  return tag({ ask: ask.replace('Find', `${told} Find`), visual, answer: num(x), suffix: '°',
    ways: [way('Total minus what you know', [why, ...(known.length > 1 ? [`The angles you know: ${known.map(dg).join(' + ')} = ${dg(sum)}.`] : []), `${dg(total)} − ${dg(sum)} = ${b(dg(x))}`]),
      way('Count up to the total', [`${dg(sum)} + ? = ${dg(total)}.`, `From ${sum} up to ${total} is ${b(x)}, so the missing angle is ${b(dg(x))}.`, `Check: ${[...known, x].map(dg).join(' + ')} = ${dg(total)}.`])],
    hint: `All the angles together make ${dg(total)}. How much is already used?` }, { kind: 'angle', total, known });
}
function compSupp(total) {
  const a = total === 90 ? rnd(2, 16) * 5 + pick([0, 0, 2, 3]) : rnd(4, 32) * 5 + pick([0, 0, 1, 4]), first = chance(0.5);
  const labels = first ? [dg(a), '?'] : ['?', dg(a)], dirs = [0, first ? a : total - a, total];
  return missing(total, [a], raysFig(dirs, labels), total === 90 ? 'The two angles together make a right angle. Find the missing angle.' : 'The two angles sit on a straight line. Find the missing angle.');
}
const VOCAB = [
  ['Two angles add up to 90°. What are they called?', 'complementary', ['supplementary', 'vertical', 'adjacent']],
  ['Two angles add up to 180°. What are they called?', 'supplementary', ['complementary', 'vertical', 'adjacent']],
  ['Two straight lines cross. What are the angles opposite each other called?', 'vertical angles', ['complementary angles', 'adjacent angles', 'right angles']],
  ['Two angles share a corner point and one side, and do not overlap. What are they called?', 'adjacent', ['vertical', 'complementary', 'opposite']],
];
function vocab() {
  const [q, c, d] = pick(VOCAB);
  return tag({ ask: q, answer: choice(c, d), ways: [way('The four words', ['Complementary: add to 90° (a right angle).', 'Supplementary: add to 180° (a straight line).', 'Vertical: opposite each other where two lines cross. They are equal.', 'Adjacent: next to each other, sharing a side.']),
    way('A way to remember', ['C comes before S in the alphabet, and 90 comes before 180. Complementary goes with 90, supplementary goes with 180.'])], hint: 'Think about which total, 90° or 180°, or where the angles sit.' }, { kind: 'fixed' });
}
function crossing() {
  const a = rnd(5, 31) * 5 + pick([0, 2]), t = rnd(0, 30), dirs = [t, t + a, t + 180, t + 180 + a], vert = chance(0.6);
  if (a === 90) return crossing();
  const labels = vert ? [dg(a), '', '?', ''] : [dg(a), '?', '', ''];
  if (!vert) return missing(180, [a], raysFig(dirs, labels), 'Two straight lines cross. Find the missing angle next to the one you know.', 'The two angles are adjacent and sit on a straight line, so together they make 180°.');
  return tag({ ask: `Two straight lines cross. One angle is ${dg(a)}. Find the angle opposite it.`, visual: raysFig(dirs, labels), answer: num(a), suffix: '°',
    ways: [way('Vertical angles are equal', ['Angles opposite each other where two lines cross are called vertical angles. They are always equal.', `So the missing angle is ${b(dg(a))}.`]),
      way('Why they are equal', [`The angle between them is next to BOTH. With the ${dg(a)} angle it makes a straight line, so it is 180° − ${dg(a)} = ${dg(180 - a)}.`, `With the missing angle it also makes a straight line: 180° − ${dg(180 - a)} = ${b(dg(a))}.`])],
    hint: 'The missing angle is directly opposite the one you know.' }, { kind: 'same', v: a });
}
function triangle() {
  const a = rnd(5, 18) * 5, c = rnd(4, Math.floor((170 - a) / 5)) * 5 + pick([0, 0, 3]), x = 180 - a - c;
  if (x < 15) return triangle();
  return missing(180, [a, c], triFig([dg(a), dg(c), '?']), 'Find the missing angle of the triangle.', TRI_WHY);
}
function aroundPoint() {
  const n = pick([3, 4]), known = [], dirs = [0]; let left = 360;
  for (let i = 0; i < n - 1; i++) { const v = rnd(8, n === 3 ? 28 : 20) * 5; known.push(v); left -= v; dirs.push(360 - left); }
  if (left < 40 || left > 170) return aroundPoint();
  return missing(360, known, raysFig(dirs, [...known.map(dg), '?']), 'These angles go all the way round a point. Find the missing angle.');
}
function onLine() {
  const a = rnd(5, 12) * 5, c = rnd(5, 12) * 5 + pick([0, 2]);
  return missing(180, [a, c], raysFig([0, a, a + c, 180], [dg(a), dg(c), '?']), 'Three angles sit on a straight line. Find the missing angle.');
}
// Angles written with x that must add to a total: (m·x + c) + (n·x) = total.
function algebra() {
  const total = pick([90, 180, 180]), m = rnd(1, 4), n = rnd(1, 3), x = rnd(2, Math.floor((total - 20) / (m + n) / 5)) * 5, c = total - (m + n) * x;
  if (c <= 0 || c > 80) return algebra();
  const A = `(${lin(m, c)})°`, B = `${xTerm(n)}°`;
  return tag({ ask: `Two angles, ${A} and ${B}, ${total === 90 ? 'make a right angle' : 'sit on a straight line'}. Find x.`, visual: raysFig([0, m * x + c, total], [A, B]), answer: num(x),
    ways: [way('Write an equation', [`${TOTALS[total]}`, `(${lin(m, c)}) + ${xTerm(n)} = ${total}`, `Combine the x terms: ${lin(m + n, c)} = ${total}.`, `Subtract ${c}: ${xTerm(m + n)} = ${total - c}. Divide by ${m + n}: x = ${b(x)}`]),
      way('Check the angles', [`With x = ${x}: ${lin(m, c)} = ${dg(m * x + c)} and ${xTerm(n)} = ${dg(n * x)}.`, `${dg(m * x + c)} + ${dg(n * x)} = ${dg(total)}, so it works.`])],
    hint: `Add the two angles and set the sum equal to ${total}.` }, { kind: 'lineq', form: 'ax+b', a: m + n, b: c, c: total });
}
function triangleX() {
  const [p, q, r] = pick([[1, 2, 3], [1, 1, 2], [2, 3, 4], [1, 2, 2], [1, 3, 5], [2, 3, 5], [1, 4, 4], [3, 3, 4]]), x = 180 / (p + q + r), big = chance(0.4);
  return tag({ ask: `The angles of a triangle are ${xTerm(p)}°, ${xTerm(q)}° and ${xTerm(r)}°. ${big ? 'Find the size of the LARGEST angle, in degrees.' : 'Find x.'}`, visual: triFig([`${xTerm(p)}°`, `${xTerm(q)}°`, `${xTerm(r)}°`]), answer: num(big ? r * x : x), suffix: big ? '°' : '',
    ways: [way('Write an equation', [TRI_WHY, `${xTerm(p)} + ${xTerm(q)} + ${xTerm(r)} = 180, so ${p + q + r}x = 180.`, `x = 180 ÷ ${p + q + r} = ${b(x)}`, ...(big ? [`The largest angle is ${xTerm(r)} = ${r} × ${x} = ${b(dg(r * x))}`] : [])]),
      way('Check the angles', [`The angles are ${[p, q, r].map(v => dg(v * x)).join(', ')}.`, `${[p, q, r].map(v => v * x).join(' + ')} = 180, so it works.`])],
    hint: 'The three angles add to 180. How many x are there altogether?' }, big ? { kind: 'prodquot', a: 180, c: r, d: p + q + r } : { kind: 'quot', a: 180, c: p + q + r });
}
function isosceles() {
  const base = rnd(5, 16) * 5 + pick([0, 0, 2, 4]), apex = 180 - 2 * base, wantBase = chance(0.5);
  if (wantBase) return tag({ ask: `This triangle is isosceles: the two angles at the bottom are equal. The top angle is ${dg(apex)}. Find one of the bottom angles.`, visual: triFig(['?', '?', dg(apex)]), answer: num(base), suffix: '°',
    ways: [way('Take away, then share', [TRI_WHY, `Without the top angle there is 180° − ${dg(apex)} = ${dg(180 - apex)} left.`, `The two bottom angles are equal, so each is ${180 - apex} ÷ 2 = ${b(dg(base))}`]),
      way('Check it', [`${dg(base)} + ${dg(base)} + ${dg(apex)} = 180°, so it works.`])], hint: 'First find how much is left for the two equal angles together.' }, { kind: 'prodquot', a: 180 - apex, c: 1, d: 2 });
  return missing(180, [base, base], triFig([dg(base), dg(base), '?']), 'This triangle is isosceles: the two angles at the bottom are equal. Find the top angle.', TRI_WHY);
}
function exterior() {
  const a = rnd(6, 14) * 5, c = rnd(6, 14) * 5 + pick([0, 3]), inner = 180 - a - c;
  return tag({ ask: `One side of the triangle is extended. Two of the inside angles are ${dg(a)} and ${dg(c)}. Find the outside angle marked ?.`, visual: triFig([dg(a), '', dg(c)], '?'), answer: num(a + c), suffix: '°',
    ways: [way('Two steps', [`The third inside angle is 180° − ${dg(a)} − ${dg(c)} = ${dg(inner)}.`, `It sits on a straight line with the outside angle: 180° − ${dg(inner)} = ${b(dg(a + c))}`]),
      way('The shortcut, and why it works', [`The inside angle and the outside angle make 180°. The inside angle and the other two inside angles also make 180°.`, `So the outside angle equals the two far inside angles added together: ${dg(a)} + ${dg(c)} = ${b(dg(a + c))}`])],
    hint: 'Find the third angle inside the triangle first. It is on a straight line with the ?.' }, { kind: 'sum', xs: [a, c] });
}
export function genAngles(L) {
  const r = Math.random();
  if (L === 1) return r < 0.42 ? compSupp(90) : r < 0.85 ? compSupp(180) : vocab();
  if (L === 2) return r < 0.3 ? crossing() : r < 0.6 ? triangle() : r < 0.8 ? aroundPoint() : onLine();
  return r < 0.3 ? algebra() : r < 0.5 ? triangleX() : r < 0.75 ? isosceles() : exterior();
}
