// Circles working backwards (radius from area, area from circumference) and shapes made of rectangles and circle parts. Always pi = 3.14.
import { R, rnd, chance, fmt, b, way, num } from '../../util.js';
import { tag } from './helpers.js';
import { circleCompositeFig } from './visuals-circles.js';

const PI = 3.14, USE = 'Use 3.14 for π.', sq = v => R(v * v);
const base = (shape, kind, p, t) => tag(p, { kind, shape, pi: PI, ...t });

function radiusFromArea(L) {
  const r = rnd(2, L === 1 ? 6 : 12), A = R(PI * r * r), wantD = chance(0.4);
  return base('rfroma', 'cbFromA', { story: `A circular rug has an area of ${fmt(A)} square feet.`, ask: `What is its ${wantD ? 'diameter' : 'radius'}, in feet? ${USE}`, answer: num(wantD ? 2 * r : r), suffix: 'ft',
    ways: [way('Undo the formula', [`Area = 3.14 × r × r, so r × r = ${fmt(A)} ÷ 3.14 = ${sq(r)}.`, `${r} × ${r} = ${sq(r)}, so the radius is ${r} feet.`, wantD ? `The diameter is twice the radius: 2 × ${r} = ${b(2 * r)}` : `Radius = ${b(r)}`]),
      way('Guess and check', [`Try r = ${r + 1}: 3.14 × ${r + 1} × ${r + 1} = ${fmt(R(PI * (r + 1) ** 2))}, too big.`, `Try r = ${r}: 3.14 × ${r} × ${r} = ${fmt(A)}. That is the area, so the radius is ${r} feet${wantD ? `, and the diameter is ${b(2 * r)}` : `: ${b(r)}`}.`])],
    hint: 'Area is 3.14 × r × r. Divide the area by 3.14, then find the number that times itself gives that.' }, { A, wantD });
}
function areaFromCircumference(L) {
  const r = rnd(2, L === 1 ? 6 : 12), C = R(2 * PI * r), A = R(PI * r * r);
  return base('afromc', 'cbAfromC', { story: `A round pond has a circumference of ${fmt(C)} metres.`, ask: `What is the area of the pond, in square metres? ${USE}`, answer: num(A), suffix: 'm²', op: 'multi',
    ways: [way('Radius first, then area', [`Circumference = 2 × 3.14 × r = 6.28 × r, so r = ${fmt(C)} ÷ 6.28 = ${r}.`, `Area = 3.14 × ${r} × ${r} = ${b(fmt(A))}`]),
      way('Diameter first', [`Circumference = 3.14 × diameter, so the diameter is ${fmt(C)} ÷ 3.14 = ${2 * r}, and the radius is half: ${r}.`, `Area = 3.14 × ${r} × ${r} = ${b(fmt(A))}`])],
    read: { find: 'The area of the pond.', know: [`circumference: ${fmt(C)} m`, 'pi: 3.14'], clue: 'The circumference gives the radius. The area needs the radius.', plan: 'C ÷ 6.28 = r, then 3.14 × r × r' },
    hint: 'You cannot get the area straight from the circumference. Find the radius first.' }, { C });
}
function circumferenceFromArea() {
  const r = rnd(2, 6), A = R(PI * r * r), C = R(2 * PI * r);
  return base('cfroma', 'cbCfromA', { story: `A circular patio has an area of ${fmt(A)} square metres.`, ask: `How long is the edge all the way round, in metres? ${USE}`, answer: num(C), suffix: 'm', op: 'multi',
    ways: [way('Radius first, then circumference', [`r × r = ${fmt(A)} ÷ 3.14 = ${r * r}, so r = ${r}.`, `Circumference = 2 × 3.14 × ${r} = ${b(fmt(C))}`]), way('Check by estimating', [`r is ${r}, so the distance round is about 6 × ${r} = ${6 * r}.`, `${fmt(C)} is a little more than that, as it should be: ${b(fmt(C))}.`])],
    hint: 'Use the area to find the radius first. Then use the radius for the distance round.' }, { A });
}
function semiRect(L) {
  const d = 2 * rnd(2, 6), w = rnd(3, L === 1 ? 10 : 14), r = d / 2, A = R(w * d + 0.5 * PI * r * r);
  return base('semirect', 'semirect', { story: `A garden bed is a rectangle ${w} m long and ${d} m wide, with a half circle added to one short end. The half circle has a diameter of ${d} m.`, ask: `What is the area of the bed, in square metres? ${USE}`, visual: circleCompositeFig('semirect'), answer: num(A), suffix: 'm²', op: 'multi',
    ways: [way('Rectangle plus half circle', [`Rectangle: ${w} × ${d} = ${w * d}.`, `Radius = ${d} ÷ 2 = ${r}. Half circle: 3.14 × ${r} × ${r} ÷ 2 = ${fmt(R(0.5 * PI * r * r))}.`, `${w * d} + ${fmt(R(0.5 * PI * r * r))} = ${b(fmt(A))}`]), way('Check by estimating', [`The half circle is about half of 3 × ${r} × ${r} = ${1.5 * r * r}.`, `So the area is about ${w * d} + ${1.5 * r * r} = ${w * d + 1.5 * r * r}, close to ${b(fmt(A))}.`])],
    hint: 'Split the shape into a rectangle and a half circle. The radius is half of the diameter.' }, { w, d });
}
function squareHole() {
  const s = rnd(6, 16), r = rnd(2, Math.floor(s / 2) - 1), A = R(s * s - PI * r * r);
  return base('hole', 'hole', { story: `A square sheet of metal is ${s} cm on each side. A round hole with a radius of ${r} cm is cut out of it.`, ask: `What is the area of the metal that is left, in square centimetres? ${USE}`, visual: circleCompositeFig('hole'), answer: num(A), suffix: 'cm²', op: 'multi',
    ways: [way('Whole minus hole', [`Square: ${s} × ${s} = ${s * s}. Hole: 3.14 × ${r} × ${r} = ${fmt(R(PI * r * r))}.`, `${s * s} − ${fmt(R(PI * r * r))} = ${b(fmt(A))}`]), way('Estimate to check', [`The hole is about 3 × ${r} × ${r} = ${3 * r * r}.`, `${s * s} − ${3 * r * r} = ${s * s - 3 * r * r}, close to ${b(fmt(A))}.`])],
    hint: 'Find the area of the whole square and the area of the circle. Take the circle away.' }, { s, r });
}
function stadium(perimeter) {
  const d = 2 * rnd(3, 8), w = rnd(4, 14), r = d / 2, A = R(w * d + PI * r * r), P = R(2 * w + PI * d);
  const where = perimeter ? 'How far is it once around the track, in metres?' : 'What is the area of the field, in square metres?';
  return base(perimeter ? 'trackperim' : 'stadium', perimeter ? 'trackperim' : 'stadium', { story: `A running track is a rectangle ${w} m long and ${d} m wide with a half circle at each end. The half circles have a diameter of ${d} m.`, ask: `${where} ${USE}`, visual: circleCompositeFig('stadium'), answer: num(perimeter ? P : A), suffix: perimeter ? 'm' : 'm²', op: 'multi',
    ways: perimeter ? [way('Straights plus one full circle', [`The two straight sides: 2 × ${w} = ${2 * w}.`, `The two half circles make one whole circle with diameter ${d}: 3.14 × ${d} = ${fmt(R(PI * d))}.`, `${2 * w} + ${fmt(R(PI * d))} = ${b(fmt(P))}`]), way('Estimate to check', [`3 × ${d} = ${3 * d}, so the curves are about ${3 * d} m.`, `${2 * w} + ${3 * d} = ${2 * w + 3 * d}, close to ${b(fmt(P))}.`])]
      : [way('Rectangle plus one full circle', [`Rectangle: ${w} × ${d} = ${w * d}.`, `The two half circles make one circle with radius ${r}: 3.14 × ${r} × ${r} = ${fmt(R(PI * r * r))}.`, `${w * d} + ${fmt(R(PI * r * r))} = ${b(fmt(A))}`]), way('Estimate to check', [`The circle is about 3 × ${r} × ${r} = ${3 * r * r}.`, `${w * d} + ${3 * r * r} = ${w * d + 3 * r * r}, close to ${b(fmt(A))}.`])],
    hint: perimeter ? 'Only the outside edge counts. Put the two half circles together to make one circle.' : 'Put the two half circles together to make a whole circle. Add it to the rectangle.' }, { w, d });
}
function ring() {
  const Rr = rnd(5, 12), r = rnd(2, Rr - 2), A = R(PI * (Rr * Rr - r * r));
  return base('ring', 'ring', { story: `A round flower bed has a radius of ${Rr} m. A round pond with a radius of ${r} m sits in the middle of it.`, ask: `What is the area of the grass between the pond and the edge, in square metres? ${USE}`, visual: circleCompositeFig('ring'), answer: num(A), suffix: 'm²', op: 'multi',
    ways: [way('Big circle minus small circle', [`Big: 3.14 × ${Rr} × ${Rr} = ${fmt(R(PI * Rr * Rr))}. Small: 3.14 × ${r} × ${r} = ${fmt(R(PI * r * r))}.`, `${fmt(R(PI * Rr * Rr))} − ${fmt(R(PI * r * r))} = ${b(fmt(A))}`]), way('Take out 3.14 first', [`${Rr} × ${Rr} − ${r} × ${r} = ${Rr * Rr - r * r}.`, `3.14 × ${Rr * Rr - r * r} = ${b(fmt(A))}`])],
    hint: 'Find the area of the big circle and of the small one. The grass is the difference.' }, { Rr, r });
}
function windowPerimeter() {
  const w = 2 * rnd(2, 6), h = rnd(3, 10), P = R(2 * h + PI * w / 2);
  return base('windowperim', 'winperim', { story: `A window is a rectangle ${w} feet wide and ${h} feet tall, with a half circle on top. The half circle has a diameter of ${w} feet. A strip of trim goes round the outside edge, but not along the bottom.`, ask: `How much trim is needed, in feet? ${USE}`, visual: circleCompositeFig('window'), answer: num(P), suffix: 'ft', op: 'multi',
    ways: [way('Add the sides and the curve', [`The two tall sides: 2 × ${h} = ${2 * h}.`, `The curve is half of a circle: 3.14 × ${w} ÷ 2 = ${fmt(R(PI * w / 2))}.`, `${2 * h} + ${fmt(R(PI * w / 2))} = ${b(fmt(P))}`]), way('Estimate to check', [`The curve is about 1.5 × ${w} = ${1.5 * w}.`, `${2 * h} + ${1.5 * w} = ${2 * h + 1.5 * w}, close to ${b(fmt(P))}.`])],
    hint: 'The bottom has no trim. Add the two tall sides and the curved top, which is half of a full circle.' }, { w, h });
}
export function genCircleBack(L) {
  const r = Math.random();
  if (L === 1) return r < 0.3 ? radiusFromArea(1) : r < 0.55 ? areaFromCircumference(1) : r < 0.8 ? circumferenceFromArea() : semiRect(1);
  if (L === 2) return r < 0.3 ? semiRect(2) : r < 0.55 ? squareHole() : r < 0.8 ? radiusFromArea(2) : areaFromCircumference(2);
  return r < 0.25 ? stadium(false) : r < 0.5 ? stadium(true) : r < 0.75 ? ring() : windowPerimeter();
}
