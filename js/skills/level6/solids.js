// Area of composite shapes, and surface area and volume of prisms.
import { rnd, pick, chance, fmt, b, k, way, num, prism } from '../../util.js';
import { tag } from './helpers.js';
import { lFig, houseFig, triPrismFig } from './visuals-shapes.js';

const U = () => pick(['cm', 'm']);
function lShape() {
  const W = rnd(6, 12), H = rnd(5, 10), w = rnd(2, W - 3), h = rnd(2, H - 2), u = U(), area = W * H - w * h;
  return tag({ ask: `Find the area of this L-shape. Its longest sides are ${W} ${u} and ${H} ${u}, and all the corners are right angles.`, visual: lFig(W, H, w, h, u), answer: num(area), suffix: `${u}²`,
    ways: [way('Cut it into two rectangles', [`Slice across at the step. The bottom rectangle is ${W} by ${H} − ${h} = ${H - h}: area ${W} × ${H - h} = ${b(W * (H - h))}.`,
      `The top rectangle is ${W} − ${w} = ${W - w} wide and ${h} tall: area ${W - w} × ${h} = ${b((W - w) * h)}.`, `Add them: ${W * (H - h)} + ${(W - w) * h} = ${b(area + ' ' + u + '²')}`]),
      way('Whole rectangle minus the missing corner', [`Imagine the corner filled in. The full rectangle is ${W} × ${H} = ${b(W * H)}.`, `The missing corner is ${w} × ${h} = ${b(w * h)}.`, `${W * H} − ${w * h} = ${b(area + ' ' + u + '²')}`])],
    hint: 'Split the shape into two rectangles, or picture the full rectangle with a corner cut out.' }, { kind: 'lshape', W, H, w, h });
}
function house() {
  const w = rnd(2, 6) * 2, h = rnd(3, 8), t = rnd(2, 6), u = U(), area = w * h + w * t / 2;
  return tag({ ask: `This shape is a ${w} ${u} by ${h} ${u} rectangle with a triangle ${t} ${u} tall on top. Find its total area.`, visual: houseFig(w, h, t, u), answer: num(area), suffix: `${u}²`,
    ways: [way('Rectangle plus triangle', [`Rectangle: ${w} × ${h} = ${b(w * h)}.`, `Triangle: half of base × height, because a triangle is half of the rectangle around it: ${w} × ${t} ÷ 2 = ${b(w * t / 2)}.`, `Total: ${w * h} + ${w * t / 2} = ${b(area + ' ' + u + '²')}`]),
      way('Box it in, then cut the corners off', [`Draw a rectangle around the whole shape: ${w} wide and ${h} + ${t} = ${h + t} tall. Area ${w} × ${h + t} = ${w * (h + t)}.`,
        `The two empty corners beside the roof fit together into a ${w / 2} by ${t} rectangle: area ${w / 2 * t}.`, `${w * (h + t)} − ${w / 2 * t} = ${b(area + ' ' + u + '²')}`])],
    hint: 'Find the area of the rectangle and of the triangle separately.' }, { kind: 'house', w, h, t });
}
function boxSurface(story) {
  const l = rnd(3, 9), w = rnd(2, 7), h = rnd(2, 8), u = story ? 'cm' : U(), sa = 2 * (l * w + l * h + w * h);
  const p = { ask: `Find the total surface area of this ${l} by ${w} by ${h} box (all six faces).`, visual: prism(l, w, h, { unit: u }), answer: num(sa), suffix: `${u}²`,
    ways: [way('Three pairs of faces', ['A box has 6 faces in 3 matching pairs: top and bottom, front and back, left and right.',
      `Top and bottom: 2 × ${l} × ${w} = ${2 * l * w}. Front and back: 2 × ${l} × ${h} = ${2 * l * h}. Sides: 2 × ${w} × ${h} = ${2 * w * h}.`, `${2 * l * w} + ${2 * l * h} + ${2 * w * h} = ${b(sa + ' ' + u + '²')}`]),
      way('Unfold it like a label on a tin', [`The four upright faces unroll into one long strip. Its length is the distance around the base: ${l} + ${w} + ${l} + ${w} = ${2 * (l + w)}. Its height is ${h}.`,
        `Strip: ${2 * (l + w)} × ${h} = ${2 * (l + w) * h}. Top and bottom: 2 × ${l * w} = ${2 * l * w}.`, `${2 * (l + w) * h} + ${2 * l * w} = ${b(sa + ' ' + u + '²')}`])],
    hint: 'Find the area of the three different faces. Each one appears twice.' };
  if (story) Object.assign(p, { story: `A gift box is ${k(l + ' cm')} long, ${k(w + ' cm')} wide and ${k(h + ' cm')} tall. It is covered in paper with no overlap.`, ask: 'How many square centimetres of paper are needed?', op: 'multi',
    read: { find: 'The area of paper that covers the outside.', know: [`${l} cm long`, `${w} cm wide`, `${h} cm tall`], clue: '"Covered" means the outside faces: surface area, not volume.', plan: 'area of all six faces, added' } });
  return tag(p, { kind: 'sa', l, w, h });
}
function triVolume() {
  const a = rnd(2, 6) * 2, bb = rnd(3, 9), len = rnd(4, 12), u = U(), V = a * bb / 2 * len;
  return tag({ ask: `The ends of this prism are right triangles with legs of ${a} ${u} and ${bb} ${u}. The prism is ${len} ${u} long. Find its volume.`, visual: triPrismFig([`${a} ${u}`, `${bb} ${u}`, '', `${len} ${u}`]), answer: num(V), suffix: `${u}³`,
    ways: [way('Area of the end × length', [`The volume of any prism is the area of its end face times how far that face is stretched back.`, `End triangle: ${a} × ${bb} ÷ 2 = ${b(a * bb / 2)} ${u}².`, `Volume: ${a * bb / 2} × ${len} = ${b(fmt(V) + ' ' + u + '³')}`]),
      way('Half of a box', [`Two of these prisms fit together into a box ${a} by ${bb} by ${len}.`, `Box: ${a} × ${bb} × ${len} = ${fmt(a * bb * len)}. Half of it: ${b(fmt(V) + ' ' + u + '³')}`])],
    hint: 'Find the area of the triangle at the end first.' }, { kind: 'triV', a, b: bb, len });
}
function triSurface() {
  const [a, bb, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]]), len = rnd(4, 12), u = U(), tri = a * bb / 2, sa = 2 * tri + (a + bb + c) * len;
  return tag({ ask: `The ends of this prism are right triangles with sides ${a}, ${bb} and ${c} ${u}. The prism is ${len} ${u} long. Find its total surface area.`, visual: triPrismFig([`${a} ${u}`, `${bb} ${u}`, `${c} ${u}`, `${len} ${u}`]), answer: num(sa), suffix: `${u}²`,
    ways: [way('Face by face', [`Two triangle ends: each is ${a} × ${bb} ÷ 2 = ${tri}, so together ${b(2 * tri)}.`,
      `Three rectangles, each ${len} long: ${a} × ${len} = ${a * len}, ${bb} × ${len} = ${bb * len}, ${c} × ${len} = ${c * len}.`, `Total: ${2 * tri} + ${a * len} + ${bb * len} + ${c * len} = ${b(fmt(sa) + ' ' + u + '²')}`]),
      way('Unwrap the three rectangles as one strip', [`The three rectangles unroll into one strip. Its width is the distance around the triangle: ${a} + ${bb} + ${c} = ${a + bb + c}.`,
        `Strip: ${a + bb + c} × ${len} = ${(a + bb + c) * len}. Add the two ends: ${(a + bb + c) * len} + ${2 * tri} = ${b(fmt(sa) + ' ' + u + '²')}`])],
    hint: 'Count the faces: 2 triangles and 3 rectangles. Find each area.' }, { kind: 'triSA', a, b: bb, c, len });
}
function twoBoxes() {
  const A = [rnd(4, 9), rnd(2, 6), rnd(2, 5)], B = [rnd(2, 5), rnd(2, 6), rnd(2, 5)], u = U(), va = A[0] * A[1] * A[2], vb = B[0] * B[1] * B[2];
  return tag({ ask: `A solid is made by joining two boxes. One is ${A.join(' by ')} ${u} and the other is ${B.join(' by ')} ${u}. What is the total volume?`, answer: num(va + vb), suffix: `${u}³`,
    ways: [way('One box at a time', [`First box: ${A.join(' × ')} = ${b(va)}.`, `Second box: ${B.join(' × ')} = ${b(vb)}.`, `Joining them does not change how much space each fills: ${va} + ${vb} = ${b(va + vb + ' ' + u + '³')}`]),
      way('Layers', [`First box: one layer is ${A[0]} × ${A[1]} = ${A[0] * A[1]} cubes, and there are ${A[2]} layers: ${va}.`, `Second box: ${B[0]} × ${B[1]} = ${B[0] * B[1]} in a layer, ${B[2]} layers: ${vb}.`, `Together: ${b(va + vb)}`])],
    hint: 'Find the volume of each box, then add.' }, { kind: 'twobox', A, B });
}
function missingHeight() {
  const l = rnd(3, 10), w = rnd(2, 8), h = rnd(2, 12), u = U();
  return tag({ ask: `A box has a volume of ${fmt(l * w * h)} ${u}³. Its base is ${l} ${u} by ${w} ${u}. How tall is it?`, answer: num(h), suffix: u,
    ways: [way('Undo the multiplying', [`Volume = area of the base × height. The base is ${l} × ${w} = ${l * w} ${u}².`, `${l * w} × height = ${fmt(l * w * h)}, so height = ${fmt(l * w * h)} ÷ ${l * w} = ${b(h + ' ' + u)}`]),
      way('Think in layers', [`One layer 1 ${u} thick holds ${l * w} cubes.`, `${fmt(l * w * h)} cubes make ${fmt(l * w * h)} ÷ ${l * w} = ${b(h)} layers, so the box is ${h} ${u} tall.`])],
    hint: 'Find the area of the base. How many of those layers make the volume?' }, { kind: 'quot', a: l * w * h, c: l * w });
}
export function tankWord() {
  const l = rnd(3, 8) * 10, w = rnd(2, 5) * 10, h = rnd(2, 5) * 10, V = l * w * h;
  return tag({ story: `A fish tank has a base of ${k(l + ' cm')} by ${k(w + ' cm')}. It is filled with water to a depth of ${k(h + ' cm')}. One litre is 1,000 cm³.`, ask: 'How many litres of water are in the tank?', answer: num(V / 1000), suffix: 'L', op: 'multi',
    ways: [way('Volume, then litres', [`Volume of water: ${l} × ${w} × ${h} = ${b(fmt(V) + ' cm³')}.`, `Every 1,000 cm³ is a litre: ${fmt(V)} ÷ 1,000 = ${b(V / 1000 + ' L')}`]),
      way('Work in tens', [`10 cm × 10 cm × 10 cm is exactly 1 litre. The tank is ${l / 10} by ${w / 10} by ${h / 10} of those blocks.`, `${l / 10} × ${w / 10} × ${h / 10} = ${b(V / 1000)} litres`])],
    read: { find: 'The amount of water in LITRES.', know: [`base ${l} cm by ${w} cm`, `depth ${h} cm`, '1 L = 1,000 cm³'], clue: 'Water fills space, so this is volume. Then change the units.', plan: `${l} × ${w} × ${h}, then ÷ 1,000` },
    hint: 'Find the volume in cm³ first.' }, { kind: 'tank', l, w, h });
}
export const wrapWord = () => boxSurface(true);
export function genSolid(L) {
  const r = Math.random();
  if (L === 1) return chance(0.55) ? lShape() : house();
  if (L === 2) return r < 0.5 ? boxSurface(false) : r < 0.85 ? triVolume() : boxSurface(true);
  return r < 0.3 ? triSurface() : r < 0.5 ? twoBoxes() : r < 0.7 ? missingHeight() : r < 0.85 ? tankWord() : wrapWord();
}
