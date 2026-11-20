// Slicing solids: the flat shape a cut makes through a box, a square pyramid or a triangular prism, and its size.
import { rnd, pick, chance, shuffle, fmt, b, way, num, choice } from '../../util.js';
import { tag } from './helpers.js';
import { sliceFig } from './visuals-slices.js';

const NAMES = ['triangle', 'square', 'rectangle', 'circle', 'pentagon', 'hexagon'];
// Each cut: its words, the face or edges it meets, and what it makes. m holds the solid's measurements.
const CUTS = {
  box: {
    top: { words: 'parallel to the top face', meets: 'the four upright edges', dims: m => [m.l, m.d] }, front: { words: 'parallel to the front face', meets: 'the four edges that run front to back', dims: m => [m.l, m.h] },
    side: { words: 'parallel to the end face', meets: 'the four edges that run left to right', dims: m => [m.d, m.h] },
  },
  pyramid: { base: { words: 'parallel to the base', meets: 'the four sloping edges' }, apex: { words: 'straight down through the top point, parallel to a base edge', meets: 'the top point and two edges of the base' } },
  prism: { ends: { words: 'parallel to the triangular ends', meets: 'the three edges that run along the prism' }, floor: { words: 'parallel to the bottom, halfway up', meets: 'the four sloping edges of the sides' }, tall: { words: 'straight down through the top edge', meets: 'the top edge, the bottom edge and the two ends' } },
};
const KIND = { cube: 'box', box: 'box', pyramid: 'pyramid', prism: 'prism' };
// The shape of the cut and its size, from the solid's measurements.
function made(solid, cut, m) {
  if (KIND[solid] === 'box') { const [x, y] = CUTS.box[cut].dims(m); return { name: x === y ? 'square' : 'rectangle', area: x * y, perim: 2 * (x + y), sides: [x, y] }; }
  if (solid === 'pyramid') return cut === 'apex' ? { name: 'triangle', area: m.s * m.h / 2 } : { name: 'square', area: (m.s * (m.h - m.y) / m.h) ** 2, perim: 4 * m.s * (m.h - m.y) / m.h, side: m.s * (m.h - m.y) / m.h };
  return { ends: { name: 'triangle', area: m.w * m.h / 2 }, floor: { name: 'rectangle', area: m.w / 2 * m.d, perim: 2 * (m.w / 2 + m.d) }, tall: { name: 'rectangle', area: m.h * m.d, perim: 2 * (m.h + m.d) } }[cut];
}
function measures(solid, tight = false) {
  if (solid === 'cube') { const e = rnd(3, 9); return { l: e, h: e, d: e }; }
  if (solid === 'box') { for (;;) { const l = rnd(3, 9), h = rnd(3, 9), d = rnd(3, 9); if (l !== h && h !== d && l !== d) return { l, h, d }; } }
  if (solid === 'pyramid') return { s: 2 * rnd(2, 6), h: tight ? pick([6, 8, 9, 12]) : rnd(4, 12), y: 0 };
  for (;;) { const w = 2 * rnd(2, 6), h = rnd(3, 9), d = rnd(5, 12); if (w / 2 !== d && h !== d) return { w, h, d }; }
}
const saying = (solid, m) => ({ cube: `A cube has edges of ${m.l} cm.`, box: `A box is ${m.l} cm long, ${m.d} cm wide and ${m.h} cm high.`, pyramid: `A square pyramid has a base ${m.s} cm by ${m.s} cm and a height of ${m.h} cm.`,
  prism: `A triangular prism has triangle ends ${m.w} cm wide and ${m.h} cm high. It is ${m.d} cm long.` })[solid];
const figure = (solid, m, cut, f) => (KIND[solid] === 'box' ? sliceFig('box', m.l, m.h, m.d, cut) : solid === 'pyramid' ? sliceFig('pyramid', m.s, m.h, m.s, cut, f) : sliceFig('prism', m.w, m.h, m.d, cut));
const solidWords = { cube: 'cube', box: 'box', pyramid: 'square pyramid', prism: 'triangular prism' };
const pickCut = solid => pick(Object.keys(CUTS[KIND[solid]]));
const cutWords = (solid, cut, m) => (solid === 'pyramid' && cut === 'base' && m.y ? `parallel to the base, ${m.y} cm above it` : solid === 'pyramid' && cut === 'base' ? 'parallel to the base, halfway up' : CUTS[KIND[solid]][cut].words);

function nameShape(solid) {
  const m = measures(solid), cut = pickCut(solid), r = made(solid, cut, m), skip = r.name === 'square' ? 'rectangle' : r.name === 'rectangle' ? 'square' : '';
  const wrong = shuffle(NAMES.filter(n => n !== r.name && n !== skip)).slice(0, 3);
  const t = solid === 'pyramid' ? { s: m.s, h: m.h } : m;
  return tag({ story: `${saying(solid, m)} It is sliced by a flat cut ${cutWords(solid, cut, m)}.`, ask: 'What shape is the cut surface?', visual: figure(solid, m, cut, 0.5), answer: choice(r.name, wrong), choiceBig: true,
    ways: [way('Think about the faces', [solid === 'pyramid' && cut === 'apex' ? 'A cut straight down through the top point slices the pyramid into two matching halves. Each cut face has the top point as a corner and the base as its bottom edge: a triangle.' : `A cut ${cutWords(solid, cut, m)} looks like the face it is parallel to, or like a copy of one of the solid's cross-sections.`, `So the cut surface is a ${b(r.name)}.`]),
      way('Where does the cut meet the edges?', [`The flat cut crosses ${CUTS[KIND[solid]][cut].meets}. Join those points in order.`, `${r.name === 'triangle' ? 'There are 3 corner points' : 'There are 4 corner points'}, so the shape is a ${b(r.name)}${r.name === 'square' ? ' (4 equal sides)' : r.name === 'rectangle' ? ' (opposite sides equal, and the sides are not all equal)' : ''}.`])],
    hint: 'Count the corners of the cut surface by checking which edges the cut crosses. Which shape has that many corners?' }, { kind: 'slicename', shape: `${solid}cut`, solid, cut, ...t });
}
const areaWays = (solid, cut, m, r) => {
  const second = solid === 'pyramid' && cut === 'apex' ? ['Picture the triangle: its bottom edge is the base of the pyramid.', `Its base is ${m.s} and its height is the pyramid's height ${m.h}, so area = ${m.s} × ${m.h} ÷ 2 = ${b(fmt(r.area))}`]
    : solid === 'pyramid' ? [`The pyramid is ${m.h} high and the cut is halfway, so the top half is a smaller pyramid exactly half as wide.`, `Side of the cut square: ${m.s} ÷ 2 = ${m.s / 2}, so area = ${m.s / 2} × ${m.s / 2} = ${b(fmt(r.area))}`]
      : KIND[solid] === 'box' ? [`Slices of a box are all the same size. Volume ÷ the length the cut runs along gives the slice area.`, `${m.l} × ${m.h} × ${m.d} = ${m.l * m.h * m.d}, and ${m.l * m.h * m.d} ÷ ${m.l * m.h * m.d / r.area} = ${b(fmt(r.area))}`]
        : cut === 'ends' ? ['Every slice parallel to the ends is a copy of the end triangle.', `Triangle area = ${m.w} × ${m.h} ÷ 2 = ${b(fmt(r.area))}`] : [cut === 'floor' ? `Halfway up, the triangle is half as wide: ${m.w} ÷ 2 = ${m.w / 2}. The cut runs the whole length of ${m.d}.` : `The cut runs from the top edge (${m.h} high) the whole length of ${m.d}.`, `${cut === 'floor' ? `${m.w / 2} × ${m.d}` : `${m.h} × ${m.d}`} = ${b(fmt(r.area))}`];
  const first = solid === 'pyramid' && cut === 'apex' ? ['The cut is a triangle.', `Its base is the pyramid's base, ${m.s}, and its height is the pyramid's height, ${m.h}.`, `Area = ${m.s} × ${m.h} ÷ 2 = ${b(fmt(r.area))}`] : solid === 'pyramid' ? [`The cut is a square. Halfway up, its side is half the base: ${m.s} ÷ 2 = ${m.s / 2}.`, `Area = ${m.s / 2} × ${m.s / 2} = ${b(fmt(r.area))}`]
    : cut === 'ends' ? ['The cut is a triangle, a copy of the end.', `Area = ${m.w} × ${m.h} ÷ 2 = ${b(fmt(r.area))}`] : KIND[solid] === 'box' ? [`The cut is a rectangle ${r.sides[0]} by ${r.sides[1]}.`, `Area = ${r.sides[0]} × ${r.sides[1]} = ${b(fmt(r.area))}`]
      : [`The cut is a rectangle. ${cut === 'floor' ? `Halfway up, its width is ${m.w} ÷ 2 = ${m.w / 2}` : `Its height is the triangle's height, ${m.h}`}, and its length is ${m.d}.`, `Area = ${cut === 'floor' ? `${m.w / 2} × ${m.d}` : `${m.h} × ${m.d}`} = ${b(fmt(r.area))}`];
  return [way('Find the shape, then its sides', first), way('Another route', second)];
};
function area(solid, cut) {
  const m = measures(solid), r = made(solid, cut, solid === 'pyramid' ? { ...m, y: m.h / 2 } : m), t = solid === 'pyramid' ? { s: m.s, h: m.h } : m;
  return tag({ story: `${saying(solid, m)} It is sliced by a flat cut ${cutWords(solid, cut, m)}.`, ask: 'What is the area of the cut surface, in square centimetres?', visual: figure(solid, m, cut, 0.5), answer: num(r.area), suffix: 'cm²', ways: areaWays(solid, cut, m, r),
    hint: 'Work out the shape of the cut and its sides first. The sides come from the solid, and they may be halved if the cut is halfway.' }, { kind: 'slicearea', shape: solid === 'pyramid' ? `pyramid${cut}` : `${solid}area`, solid, cut, ...t });
}
function perimeter() {
  const solid = pick(['box', 'prism']), cut = solid === 'box' ? pickCut('box') : pick(['floor', 'tall']), m = measures(solid), r = made(solid, cut, m), [x, y] = solid === 'box' ? r.sides : cut === 'floor' ? [m.w / 2, m.d] : [m.h, m.d];
  return tag({ story: `${saying(solid, m)} It is sliced by a flat cut ${cutWords(solid, cut, m)}.`, ask: 'What is the perimeter of the cut surface, in centimetres?', visual: figure(solid, m, cut, 0.5), answer: num(r.perim), suffix: 'cm', op: 'multi',
    ways: [way('Sides, then add them up', [`The cut is a rectangle ${fmt(x)} cm by ${fmt(y)} cm.`, `Perimeter = ${fmt(x)} + ${fmt(y)} + ${fmt(x)} + ${fmt(y)} = ${b(fmt(r.perim))}`]), way('Double the half-way round', [`Half the way round is ${fmt(x)} + ${fmt(y)} = ${fmt(x + y)}.`, `Double it: ${b(fmt(r.perim))}`])],
    hint: 'First find the two side lengths of the cut rectangle. Then add all four sides.' }, { kind: 'sliceperim', shape: 'perimeter', solid, cut, ...m });
}
function pyramidCut() {
  for (;;) {
    const s = 3 * rnd(2, 5), h = pick([6, 9, 12]), y = rnd(1, h - 1), side = s * (h - y) / h;
    if (!Number.isInteger(side) || h === s) continue;
    return tag({ story: `A square pyramid has a base ${s} cm by ${s} cm and a height of ${h} cm. A flat cut parallel to the base is made ${y} cm above the base.`, ask: 'What is the area of the square cut surface, in square centimetres?', visual: sliceFig('pyramid', s, h, s, 'base', y / h), answer: num(side * side), suffix: 'cm²', op: 'multi',
      ways: [way('The small pyramid on top', [`Above the cut there is a small pyramid ${h} − ${y} = ${h - y} cm high. It is the same shape as the whole pyramid, so its base is ${h - y} ÷ ${h} of the whole base.`, `Side of the cut = ${s} × ${h - y} ÷ ${h} = ${side}, so area = ${side} × ${side} = ${b(side * side)}`]),
        way('Match the ratios', [`(height above the cut) : (whole height) = (side of the cut) : (side of the base), that is ${h - y} : ${h} = ? : ${s}.`, `? = ${s} × ${h - y} ÷ ${h} = ${side}. Area = ${side} × ${side} = ${b(side * side)}`])],
      hint: 'The part of the pyramid above the cut is a smaller copy of the whole pyramid. How tall is it compared with the whole?' }, { kind: 'pyrcut', shape: 'pyramidcut', s, h, y });
  }
}
function compare() {
  const m = measures('box'), [c1, c2] = shuffle(['top', 'front', 'side']).slice(0, 2), a1 = made('box', c1, m), a2 = made('box', c2, m), face = c => `${c === 'side' ? 'end' : c} face`;
  if (a1.area === a2.area) return compare();
  const win = a1.area > a2.area ? 'Cut A' : 'Cut B';
  return tag({ story: saying('box', m), ask: `Cut A is a flat cut parallel to the ${face(c1)}. Cut B is a flat cut parallel to the ${face(c2)}. Which cut surface has the greater area?`, answer: choice(win, [], { all: ['Cut A', 'Cut B'] }), choiceBig: true,
    ways: [way('Find both areas', [`Cut A: ${a1.sides.join(' × ')} = ${b(a1.area)}.`, `Cut B: ${a2.sides.join(' × ')} = ${b(a2.area)}.`, `The bigger area belongs to ${b(win)}.`]), way('Compare the faces', [`Each cut is a copy of the face it is parallel to: the ${face(c1)} and the ${face(c2)}.`, `${win} copies the face with the bigger area, so ${b(win)} wins.`])],
    hint: 'Each cut is a copy of one face of the box. Work out the area of each of those two faces.' }, { kind: 'slicecmp', shape: 'compare', ...m, cuts: [c1, c2] });
}
const WHICH = [
  { ask: 'Which cut of a square pyramid makes a triangle?', right: 'A straight cut down through the top point', wrong: ['A cut parallel to the base, halfway up', 'A cut parallel to the base, near the top', 'A cut parallel to the base, near the bottom'], solid: 'pyramid', cut: 'apex' },
  { ask: 'Which cut of a triangular prism makes a triangle?', right: 'A cut parallel to the triangular ends', wrong: ['A cut parallel to the bottom, halfway up', 'A straight cut down through the top edge', 'A cut parallel to the bottom, near the top'], solid: 'prism', cut: 'ends' },
  { ask: 'Which cut of a square pyramid makes a square?', right: 'A cut parallel to the base, halfway up', wrong: ['A straight cut down through the top point', 'A straight cut from the top point to one corner of the base'], solid: 'pyramid', cut: 'base' },
];
function whichCut() {
  const w = pick(WHICH), m = measures(w.solid);
  return tag({ ask: w.ask, answer: choice(w.right, w.wrong), choiceBig: true,
    ways: [way('Where do the corners come from?', [`${w.right} crosses ${CUTS[w.solid][w.cut].meets}.`, `That gives ${w.cut === 'apex' || w.cut === 'ends' ? '3 corners, a triangle' : '4 corners, a square'}. The other cuts give a different shape.`]), way('Picture it', [figure(w.solid, m, w.cut, 0.5), `The shaded surface is made by ${w.right.toLowerCase()}.`])],
    hint: 'Picture each cut. Count the corners of the surface it makes, and decide which choice matches the shape asked for.' }, { kind: 'fixed', shape: 'whichcut' });
}
export function genSlices(L) {
  const r = Math.random();
  if (L === 1) return r < 0.25 ? nameShape('cube') : r < 0.5 ? nameShape('box') : r < 0.75 ? nameShape('pyramid') : nameShape('prism');
  if (L === 2) return r < 0.3 ? area('box', pickCut('box')) : r < 0.55 ? area('pyramid', 'apex') : r < 0.75 ? area('pyramid', 'base') : area('prism', pickCut('prism'));
  return r < 0.25 ? whichCut() : r < 0.5 ? pyramidCut() : r < 0.75 ? perimeter() : compare();
}
