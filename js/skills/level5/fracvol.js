// Volume of boxes with fraction edges, by packing unit-fraction cubes in layers and by the formula.
import { rnd, pick, lcm, fmt, F, fr, frText, b, k, way, num, frac, choice } from '../../util.js';
import { T } from './helpers.js';

const UN = { ft: 'feet', in: 'inches', m: 'meters', cm: 'centimeters' };
const unit = () => pick(Object.keys(UN));
const cu = u => `cubic ${UN[u]}`;
const cube = d => d ** 3;
// Fractions of a unit that are not whole numbers.
const part = d => { let n; do n = rnd(1, 3 * d); while (n % d === 0); return n; };

function unitCube() {
  const d = pick([2, 3, 4]), u = unit();
  return T({ ask: `A small cube has edges of ${F(1, d)} ${u}. What fraction of 1 ${cu(u)} is the volume of the small cube?`, answer: frac(1, cube(d)),
    ways: [way('Fill a whole cube', [`A cube that is 1 ${u} on each edge holds ${d} small cubes along each edge: ${d} × ${d} × ${d} = ${cube(d)} small cubes.`, `${cube(d)} equal small cubes make 1 ${cu(u)}, so each one is ${b(F(1, cube(d)))} of it.`]),
      way('Multiply the edges', [`Volume = length × width × height = ${F(1, d)} × ${F(1, d)} × ${F(1, d)}.`, `Multiply the tops and the bottoms: ${F(1, cube(d))} ${cu(u)}`])],
    hint: 'How many of these small cubes fit along one edge of a cube that is 1 unit long?' }, 'fvUnit', { d });
}
function howManyCubes() {
  const d = pick([2, 3, 4, 5]), u = unit();
  return T({ ask: `How many cubes with edges of ${F(1, d)} ${u} fit exactly inside a cube that is 1 ${u} on each edge?`, answer: num(cube(d)),
    ways: [way('Layers of cubes', [`Along each edge ${d} small cubes fit. One layer is ${d} × ${d} = ${d * d} cubes.`, `There are ${d} layers: ${d * d} × ${d} = ${b(cube(d))} cubes`]),
      way('Use the volumes', [`The big cube is 1 ${cu(u)}. Each small cube is ${F(1, cube(d))} of that.`, `1 ÷ ${F(1, cube(d))}: how many ${F(1, cube(d))}s make 1? ${b(cube(d))}`])],
    hint: 'First count how many small cubes fit along one edge. Then think of one layer, and then the layers.' }, 'fvCount', { d });
}
function layerCount() {
  const d = pick([2, 3, 4, 5]), n = part(d), u = unit(), who = pick(['A shoebox', 'A storage bin', 'A toolbox']);
  return T({ ask: `${who} is ${b(fr(n, d))} ${u} tall. It is packed with layers of cubes whose edges are ${F(1, d)} ${u}. How many layers fit?`, answer: num(n), suffix: 'layers',
    ways: [way('How many fit in the height', [`Each layer is ${F(1, d)} ${u} tall. How many of those make ${frText(n, d)}?`, `${frText(n, d)} is ${n} pieces of ${F(1, d)}, so there are ${b(n)} layers.`]),
      way('Count the pieces', [`${frText(n, d)} means ${n} pieces of size ${F(1, d)}.`, `Each piece is one layer, so there are ${b(n)} layers.`])],
    hint: 'The height is a fraction made of equal pieces. Each piece is the height of one layer.' }, 'fvLayerCount', { n, d });
}
function layers(L) {
  const d = pick([2, 3, 4]), p = rnd(2, 3 * d), q = rnd(2, 3 * d), r = rnd(2, L === 1 ? d + 1 : 2 * d), u = unit(), total = p * q * r;
  if (total % cube(d) === 0) return layers(L);
  return T({ ask: `A box is packed with cubes whose edges are ${F(1, d)} ${u}. The bottom layer is ${b(p)} cubes long and ${b(q)} cubes wide, and there are ${b(r)} layers. What is the volume of the box?`, answer: frac(total, cube(d)), suffix: cu(u),
    ways: [way('Count the cubes, then size them', [`One layer holds ${p} × ${q} = ${p * q} cubes. ${r} layers hold ${p * q} × ${r} = ${total} cubes.`, `Each cube is ${F(1, cube(d))} ${cu(u)} (${d} × ${d} × ${d} = ${cube(d)} fit in 1 ${cu(u)}).`, `${total} × ${F(1, cube(d))} = ${b(fr(total, cube(d)))} ${cu(u)}`]),
      way('Use the formula', [`Length = ${p} × ${F(1, d)} = ${frText(p, d)}, width = ${frText(q, d)}, height = ${frText(r, d)}.`, `Volume = length × width × height: ${total}/${cube(d)} = ${b(fr(total, cube(d)))} ${cu(u)}`])],
    hint: 'Count all the small cubes first. Then decide what fraction of 1 cubic unit each small cube is.' }, 'fvLayer', { p, q, r, d });
}
function missingEdge() {
  const d = pick([2, 3, 4]), a = part(d), bb = part(d), c = part(d), u = unit(), top = a * bb * c;
  return T({ ask: `A box has volume ${b(fr(top, cube(d)))} ${cu(u)}. Its length is ${b(fr(a, d))} ${u} and its width is ${b(fr(bb, d))} ${u}. What is its height, in ${UN[u]}?`, answer: frac(c, d), suffix: UN[u],
    ways: [way('Undo the multiplying', [`Volume = length × width × height, so height = volume ÷ (length × width).`, `Base: ${frText(a, d)} × ${frText(bb, d)} = ${frText(a * bb, d * d)}. Then ${frText(top, cube(d))} ÷ ${frText(a * bb, d * d)}.`, `Dividing by a fraction multiplies by its flip: the height is ${b(fr(c, d))} ${u}.`]),
      way('Count cubes of size ' + frText(1, d), [`Cubes of edge ${F(1, d)} ${u}: the volume is ${top} of them (${top}/${cube(d)}), the base layer is ${a} × ${bb} = ${a * bb} cubes.`, `${top} ÷ ${a * bb} = ${c} layers, and ${c} layers are ${b(fr(c, d))} ${u} tall.`])],
    hint: 'Volume is length times width times height. Work backwards: what do you divide the volume by to get the height?' }, 'fvMissing', { a, b: bb, c, d });
}
const BASES = [[3, 4], [2, 3], [5, 6], [1, 2], [3, 5], [7, 8], [5, 8]], HEIGHTS = [[1, 2], [3, 4], [2, 5], [1, 3], [2, 3], [3, 8]];
function baseTimesHeight() {
  const [n1, d1] = pick(BASES), [n2, d2] = pick(HEIGHTS), u = unit(), who = pick(['A planter', 'A fish tank', 'A sandbox']);
  return T({ ask: `${who} has a base with area ${b(fr(n1, d1))} square ${UN[u]} and is ${b(fr(n2, d2))} ${u} tall. What is its volume?`, answer: frac(n1 * n2, d1 * d2), suffix: cu(u),
    ways: [way('Base times height', [`Volume = area of the base × height.`, `${frText(n1, d1)} × ${frText(n2, d2)}: tops ${n1} × ${n2} = ${n1 * n2}, bottoms ${d1} × ${d2} = ${d1 * d2}.`, `${b(fr(n1 * n2, d1 * d2))} ${cu(u)}`]),
      way('Part of a taller stack', [`If the box were 1 ${u} tall it would hold ${frText(n1, d1)} ${cu(u)}.`, `Its height is only ${frText(n2, d2)} of that, so take ${frText(n2, d2)} of ${frText(n1, d1)}: ${b(fr(n1 * n2, d1 * d2))} ${cu(u)}.`])],
    hint: 'The base area already includes length and width. What is left to multiply by?' }, 'fvBase', { n1, d1, n2, d2 });
}
const dims = () => { const d = pick([2, 3, 4]); return { d, ns: [part(d), part(d), part(d)] }; };
const volOf = x => x.ns[0] * x.ns[1] * x.ns[2] / cube(x.d);
function compareBoxes() {
  const A = dims(), B = dims(), u = unit();
  if (Math.abs(volOf(A) - volOf(B)) < 1e-9) return compareBoxes();
  const win = volOf(A) > volOf(B) ? 'Box A' : 'Box B', big = lcm(A.d, B.d), cnt = x => x.ns.map(n => n * big / x.d), ca = cnt(A), cb = cnt(B), size = c => c[0] * c[1] * c[2], text = x => x.ns.map(n => frText(n, x.d)).join(' × ');
  return T({ ask: `Box A is ${b(text(A))} ${u}. Box B is ${b(text(B))} ${u}. Which box holds more?`, answer: choice(win, [], { all: ['Box A', 'Box B'] }), choiceBig: true,
    ways: [way('Find both volumes', [`Box A: ${A.ns.join(' × ')} = ${size(A.ns)} on top and ${cube(A.d)} on the bottom: ${frText(size(A.ns), cube(A.d))} ${cu(u)}.`, `Box B: ${B.ns.join(' × ')} = ${size(B.ns)} on top and ${cube(B.d)} on the bottom: ${frText(size(B.ns), cube(B.d))} ${cu(u)}.`, `The bigger volume is ${b(win)}.`]),
      way('Count the same small cubes', [`Use cubes with edges of ${frText(1, big)} ${u} for both boxes, so the counts can be compared.`, `Box A: ${ca.join(' × ')} = ${size(ca)} cubes. Box B: ${cb.join(' × ')} = ${size(cb)} cubes.`, `${fmt(Math.max(size(ca), size(cb)))} is more than ${fmt(Math.min(size(ca), size(cb)))}, so ${b(win)} holds more.`])],
    hint: 'Find the volume of each box, or count how many of the same small cube each one holds. Then compare.' }, 'fvCompare', { A, B });
}
function water() {
  const d = pick([2, 3, 4]), l = part(d), w = part(d), hh = rnd(2, 4) * d, x = rnd(1, hh - 1), u = pick(['ft', 'm']), total = l * w * x;
  if (total % cube(d) === 0) return water();
  return T({ story: `A tank is ${k(frText(l, d))} ${u} long, ${k(frText(w, d))} ${u} wide and ${k(frText(hh, d))} ${u} tall. It is filled with water to a depth of ${k(frText(x, d))} ${u}.`, ask: `What is the volume of the water, in ${cu(u)}?`, answer: frac(total, cube(d)), op: 'mul',
    ways: [way('Use the depth of the water', [`The water fills a box as long and wide as the tank, but only as deep as the water: ${frText(l, d)} × ${frText(w, d)} × ${frText(x, d)}.`, `Tops: ${l} × ${w} × ${x} = ${total}. Bottoms: ${d} × ${d} × ${d} = ${cube(d)}. Volume ${b(fr(total, cube(d)))} ${cu(u)}`]),
      way('Count small cubes', [`Cubes of edge ${F(1, d)} ${u}: ${l} along, ${w} across and ${x} layers of water.`, `${l} × ${w} × ${x} = ${total} cubes, each ${F(1, cube(d))} ${cu(u)}: ${b(fr(total, cube(d)))} ${cu(u)}`])],
    read: { find: 'The volume of the water, not of the whole tank.', know: [`length ${frText(l, d)}`, `width ${frText(w, d)}`, `water depth ${frText(x, d)}`], clue: 'The water only fills part of the height, so use its depth, not the tank height.', plan: `${frText(l, d)} × ${frText(w, d)} × ${frText(x, d)}` },
    hint: 'Which height matters: the height of the tank, or the depth of the water?' }, 'fvWater', { l, w, x, hh, d });
}
const SHAPES = { 1: [unitCube, howManyCubes, layerCount, () => layers(1)], 2: [() => layers(2), baseTimesHeight, missingEdge, compareBoxes, layerCount], 3: [missingEdge, water, compareBoxes, baseTimesHeight, () => layers(2)] };
export const genFracVol = L => pick(SHAPES[L])();
export const fracVolWord = water;
