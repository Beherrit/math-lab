// Surface area from nets, and volume of boxes with fraction edge lengths.
import { rnd, pick, chance, gcd, fmt, F, fr, frText, b, k, way, nm, num, frac, prism } from '../../util.js';
import { T, longU } from './helpers.js';
import { boxNet, pyramidNet } from './shapes.js';

function boxSA(L) {
  const cube = L === 1 && chance(0.5), l = rnd(2, L === 1 ? 6 : 10), w = cube ? l : rnd(2, L === 1 ? 5 : 8), h = cube ? l : rnd(1, L === 1 ? 4 : 6), u = pick(['cm', 'in', 'ft']);
  if (!cube && (l === w && w === h)) return boxSA(L);
  const A = [l * w, l * h, w * h], S = 2 * (A[0] + A[1] + A[2]);
  return T({ ask: `This net folds into a ${cube ? 'cube' : 'box'}. Each face shows its side lengths in ${longU(u)}. What is the surface area?`, visual: boxNet(l, w, h, u), answer: num(S), suffix: `square ${longU(u)}`,
    ways: [way('Add up the faces of the net', cube ? [`A cube has 6 faces that are all the same square: ${l} × ${l} = ${l * l}.`, `6 × ${l * l} = ${b(S)} square ${longU(u)}`] : [`Surface area is the total area of every face, as if you were wrapping the box.`, `The four faces down the middle: ${A[1]} + ${A[0]} + ${A[1]} + ${A[0]} = ${2 * (A[0] + A[1])}`, `The two side faces: ${A[2]} + ${A[2]} = ${2 * A[2]}`, `Total: ${2 * (A[0] + A[1])} + ${2 * A[2]} = ${b(S)} square ${longU(u)}`]),
      way('Three matching pairs', [`Opposite faces of a box are the same, so there are 3 pairs: ${l} × ${w} = ${A[0]}, ${l} × ${h} = ${A[1]}, ${w} × ${h} = ${A[2]}.`, `One of each: ${A[0]} + ${A[1]} + ${A[2]} = ${A[0] + A[1] + A[2]}`, `Double it: 2 × ${A[0] + A[1] + A[2]} = ${b(S)} square ${longU(u)}`])],
    hint: 'Find the area of each face of the net, then add them all. Matching faces come in pairs.' }, 'saBox', { l, w, h });
}
function pyramidSA() {
  const s = rnd(2, 6) * 2, t = rnd(3, 10), u = pick(['cm', 'in']), tri = s * t / 2, S = s * s + 4 * tri;
  return T({ ask: `This net folds into a pyramid with a square base. The base is ${s} ${longU(u)} on each side and each triangle is ${t} ${longU(u)} tall. What is the surface area?`, visual: pyramidNet(s, t), answer: num(S), suffix: `square ${longU(u)}`,
    ways: [way('Add up the faces of the net', [`Square base: ${s} × ${s} = ${s * s}`, `One triangle: ½ × ${s} × ${t} = ${tri}. There are 4 of them: 4 × ${tri} = ${4 * tri}`, `Total: ${s * s} + ${4 * tri} = ${b(S)} square ${longU(u)}`]),
      way('Pair up the triangles', [`Two of the triangles fit together into a ${s} by ${t} rectangle (area ${s * t}).`, `Four triangles make two of those rectangles: 2 × ${s * t} = ${2 * s * t}`, `Add the base: ${2 * s * t} + ${s * s} = ${b(S)} square ${longU(u)}`])],
    hint: 'The net has one square and four matching triangles. Find each kind of area.' }, 'saPyr', { s, t });
}
// Edges are ns[i] / d (for example halves): at least one edge is not a whole number.
function fracEdges(L) {
  const d = L === 1 ? 2 : pick([2, 2, 3, 4]), count = L === 1 ? 1 : rnd(2, 3), ns = [0, 1, 2].map(i => (i < count ? rnd(1, 3 * d) : d * rnd(1, 5)));
  return ns.slice(0, count).some(n => n % d === 0) ? fracEdges(L) : { d, ns: ns.sort(() => Math.random() - 0.5) };
}
function volWays(ns, d, u) {
  const top = ns[0] * ns[1] * ns[2], den = d ** 3, g = gcd(top, den);
  return [way('Multiply the three edges', [`Volume = length × width × height, even when an edge is a fraction.`, `Write each edge over ${d}: ${ns.map(n => F(n, d)).join(' × ')}`, `Tops: ${ns.join(' × ')} = ${fmt(top)}. Bottoms: ${d} × ${d} × ${d} = ${den}.`, `${g > 1 || top > den ? `${F(fmt(top), den)} = ${b(fr(top, den))}` : b(F(top, den))} cubic ${longU(u)}`]),
    way('Pack it with small cubes', [`Use little cubes with edges of ${F(1, d)} ${u}. Along the edges you fit ${ns.join(', ')} of them.`, `That is ${ns.join(' × ')} = ${fmt(top)} little cubes.`, `${den} little cubes fill one whole cubic ${longU(u)} (${d} × ${d} × ${d}), so each is ${F(1, den)} of a cubic ${longU(u)}.`, `${fmt(top)} × ${F(1, den)} = ${b(fr(top, den))} cubic ${longU(u)}`])];
}
const edgeText = (ns, d) => ns.map(n => frText(n, d));
function fracVolume(L) {
  const { d, ns } = fracEdges(L), u = pick(['ft', 'm', 'in', 'cm']);
  return T({ ask: `Find the volume of the box. Give a fraction or mixed number.`, visual: prism(ns[0] / d, ns[1] / d, ns[2] / d, { labels: edgeText(ns, d).map(s => `${s} ${u}`) }), answer: frac(ns[0] * ns[1] * ns[2], d ** 3), suffix: `cubic ${longU(u)}`,
    ways: volWays(ns, d, u), hint: 'Change any mixed numbers to fractions, then multiply all three edges.' }, 'volFrac', { ns, d });
}
function smallCubes() {
  const d = pick([2, 2, 3]), ns = [rnd(2, 4 * d), rnd(2, 3 * d), rnd(1, 2 * d)], u = pick(['in', 'cm', 'ft']), count = ns[0] * ns[1] * ns[2];
  if (ns.every(n => n % d === 0)) return smallCubes();
  return T({ ask: `How many small cubes with edges of ${F(1, d)} ${u} are needed to fill this box completely?`, visual: prism(ns[0] / d, ns[1] / d, ns[2] / d, { labels: edgeText(ns, d).map(s => `${s} ${u}`) }), answer: num(count), suffix: 'cubes',
    ways: [way('Count along each edge', [`How many ${F(1, d)}s fit along each edge? Multiply each length by ${d}: ${ns.join(', ')}.`, `Cubes in the box: ${ns.join(' × ')} = ${b(fmt(count))}`]),
      way('Use the volume', [`Volume of the box: ${ns.map(n => F(n, d)).join(' × ')} = ${F(fmt(count), d ** 3)} cubic ${longU(u)}.`, `Each small cube is ${F(1, d)} × ${F(1, d)} × ${F(1, d)} = ${F(1, d ** 3)} cubic ${longU(u)}.`, `${F(fmt(count), d ** 3)} ÷ ${F(1, d ** 3)} = ${b(fmt(count))} cubes`])],
    hint: `How many pieces of length ${F(1, d)} fit along each edge of the box?` }, 'cubes', { ns, d });
}
// [thing, covering, unit, smallest edge, biggest edge]: the edges stay believable for the thing.
const WRAP = [['a gift box', 'wrapping paper', 'in', 3, 12], ['a storage crate', 'paint', 'ft', 2, 5], ['a speaker cabinet', 'vinyl wrap', 'in', 8, 24], ['a shipping carton', 'cardboard', 'cm', 20, 60]];
export function boxWord() {
  if (chance(0.5)) {
    const [what, stuff, u, lo, hi] = pick(WRAP), l = rnd(lo, hi), w = rnd(lo, hi), h = rnd(lo, hi), A = [l * w, l * h, w * h], S = 2 * (A[0] + A[1] + A[2]);
    return T({ story: `${nm()} wants to cover every face of ${what} that is ${k(`${l} ${longU(u)} long`)}, ${k(`${w} ${longU(u)} wide`)} and ${k(`${h} ${longU(u)} high`)} with ${stuff}.`, ask: `How many square ${longU(u)} need covering?`, answer: num(S), op: 'multi',
      ways: [way('Three matching pairs of faces', [`Top and bottom: ${l} × ${w} = ${A[0]} each. Front and back: ${l} × ${h} = ${A[1]} each. Two ends: ${w} × ${h} = ${A[2]} each.`, `One of each: ${A[0]} + ${A[1]} + ${A[2]} = ${A[0] + A[1] + A[2]}`, `Double it: ${b(S)} square ${longU(u)}`]), way('Unfold it', [boxNet(l, w, h, u), `Add the six faces of the net: ${[A[1], A[0], A[1], A[0], A[2], A[2]].join(' + ')} = ${b(S)}`])],
      read: { find: 'The total area of all six faces (the surface area).', know: [`${l} long`, `${w} wide`, `${h} high`], clue: '“Cover every face” means area on the outside, not the space inside.', plan: `2 × (${l}×${w} + ${l}×${h} + ${w}×${h})` }, hint: 'A box has 6 faces in 3 matching pairs.' }, 'saBox', { l, w, h });
  }
  const { d, ns } = fracEdges(2), u = 'ft', e = ns.map(n => fr(n, d));
  return T({ story: `A shipping crate is ${k(e[0] + ' ' + u)} long, ${k(e[1] + ' ' + u)} wide and ${k(e[2] + ' ' + u)} high.`, ask: `How much space does it take up, in cubic ${longU(u)}?`, answer: frac(ns[0] * ns[1] * ns[2], d ** 3), op: 'mul', ways: volWays(ns, d, u),
    read: { find: 'The space inside (the volume).', know: e, clue: '“How much space” means volume: multiply the three edges.', plan: e.join(' × ') }, hint: 'Change any mixed numbers to fractions, then multiply all three edges.' }, 'volFrac', { ns, d });
}
export function genSolid(L) {
  if (L === 1) return chance(0.55) ? boxSA(1) : fracVolume(1);
  if (L === 2) return pick([() => boxSA(2), () => fracVolume(2), boxWord])();
  return pick([pyramidSA, smallCubes, () => fracVolume(3), boxWord])();
}
