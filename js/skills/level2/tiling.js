// Area by tiling and splitting: unit squares, an L-shape cut into rectangles, joined rectangles, and the same perimeter with different areas.
import { rnd, pick, shuffle, b, way, nm, num, choice } from '../../util.js';
import { rect } from './pics.js';
import { twoRects, lShape } from './rectpics.js';
import { areaWays, perimWays } from './shapes.js';
import { mark } from './kit.js';

const diff = (lo, hi) => { const w = rnd(lo, hi); let h = rnd(lo, hi); while (h === w) h = rnd(lo, hi); return [w, h]; };
function countQ(w, h) {
  return { ask: mark('How many unit squares cover the rectangle? That number is its area.', w, h), visual: rect(w, h, { grid: true }), answer: num(w * h), suffix: 'squares', _t: { f: 'tiles', pic: true },
    hint: 'Count the squares in one row. How many rows are there?', ways: areaWays(w, h, 'units') };
}
// An L-shape with all six sides labelled: cut it into two rectangles in two different ways, or take the missing corner from a big rectangle.
function lShapeQ(W, H, w, h, u) {
  const area = W * H - w * h, pic = cut => lShape(W, H, w, h, { cut });
  return { ask: mark(`The L-shape has sides in ${u}. What is its area?`, W, H, w, h), visual: pic(''), answer: num(area), suffix: `square ${u}`, _t: { f: 'lshape', pic: true }, hint: 'Cut the L into two rectangles. Work out each area, then put them together.',
    ways: [way('Cut it upright', [pic('v'), `Left part: ${W - w} × ${H} = ${(W - w) * H}. Right part: ${w} × ${H - h} = ${w * (H - h)}.`, `${(W - w) * H} + ${w * (H - h)} = ${b(area)} square ${u}.`]),
      way('Cut it across', [pic('h'), `Top part: ${W - w} × ${h} = ${(W - w) * h}. Bottom part: ${W} × ${H - h} = ${W * (H - h)}.`, `${(W - w) * h} + ${W * (H - h)} = ${b(area)} square ${u}.`]),
      way('Fill in the missing corner', [`A full ${W} by ${H} rectangle has ${W} × ${H} = ${W * H} squares. The missing corner is ${w} × ${h} = ${w * h}.`, `${W * H} − ${w * h} = ${b(area)} square ${u}.`])] };
}
function joinedQ(a, s, t) {
  const n = s + t, pic = twoRects(s, t, a);
  return { ask: mark('The rectangle is made of two rectangles joined side by side. What is the area of the whole rectangle?', a, s, t), visual: pic, answer: num(a * n), suffix: 'squares', _t: { f: 'joined', pic: true }, hint: 'You can find the area of each part and add them, or find the whole width first.',
    ways: [way('Add the two parts', [pic, `First part: ${a} × ${s} = ${a * s}. Second part: ${a} × ${t} = ${a * t}.`, `${a * s} + ${a * t} = ${b(a * n)}.`]), way('Use the whole width', [`The whole width is ${s} + ${t} = ${n}.`, `${a} × ${n} = ${b(a * n)}. It is the same, because ${a} × (${s} + ${t}) = ${a} × ${s} + ${a} × ${t}.`])] };
}
const TILES = [(w, h) => [`A kitchen floor is ${w} tiles wide and ${h} tiles long.`, 'How many tiles cover the floor?'], (w, h) => [`A climbing wall has ${h} rows of ${w} panels.`, 'How many panels is that?'],
  (w, h, m) => [`${m} lays a mat made of ${h} rows with ${w} square tiles in each row.`, 'How many square tiles are in the mat?']];
function tileStoryQ(w, h) {
  const [story, ask] = pick(TILES)(w, h, nm());
  return { story, ask, answer: num(w * h), suffix: 'tiles', _t: { f: 'mul', a: w, b: h }, hint: 'Picture rows of tiles. How many in each row, and how many rows?', ways: areaWays(w, h, 'units') };
}
// Same perimeter: which has the biggest (or smallest) area? Same area: which has the longest (or shortest) way round?
const PAIRS = { perim: { 12: [[1, 5], [2, 4], [3, 3]], 16: [[1, 7], [2, 6], [3, 5], [4, 4]], 20: [[1, 9], [2, 8], [4, 6], [5, 5], [3, 7]] }, area: { 12: [[1, 12], [2, 6], [3, 4]], 16: [[1, 16], [2, 8], [4, 4]], 18: [[1, 18], [2, 9], [3, 6]], 24: [[1, 24], [2, 12], [3, 8], [4, 6]] } };
function sameQ(fixed, most) {
  const key = Number(pick(Object.keys(PAIRS[fixed]))), opts = shuffle(PAIRS[fixed][key]).slice(0, 4), score = ([x, y]) => (fixed === 'perim' ? x * y : 2 * (x + y)), sorted = opts.slice().sort((p, q) => score(q) - score(p)), right = most ? sorted[0] : sorted[sorted.length - 1];
  const name = ([x, y]) => `${x} by ${y}`, what = fixed === 'perim' ? 'area' : 'perimeter', has = fixed === 'perim' ? `a perimeter of ${key}` : `an area of ${key}`;
  return { ask: `All of these rectangles have ${has}. Which one has the ${most ? (fixed === 'perim' ? 'biggest' : 'longest') : (fixed === 'perim' ? 'smallest' : 'shortest')} ${what}?`, answer: choice(name(right), opts.filter(o => o !== right).map(name)), choiceBig: true,
    _t: { f: 'rectpick', fixed, most, key }, hint: `Work out the ${what} of each one. Do not trust how they look.`,
    ways: [way('Work out each one', [...opts.map(o => `${name(o)}: ${fixed === 'perim' ? `${o[0]} × ${o[1]} = ${o[0] * o[1]}` : `${o[0]} + ${o[1]} + ${o[0]} + ${o[1]} = ${2 * (o[0] + o[1])}`}.`), `The ${most ? 'greatest' : 'least'} is ${b(name(right))}.`]),
      way('Think about the shape', [fixed === 'perim' ? 'With the same distance around, a rectangle closer to a square has more space inside.' : 'With the same space inside, a long thin rectangle has the longest way round.', `That points to ${b(name(right))}.`])] };
}
// "Max says the perimeter of a 5 by 4 rectangle is 20." (he found the area)
function slipQuestion(w, h, area) {
  if (2 * (w + h) === w * h) return countQ(w, h);
  const p = 2 * (w + h), wrong = area ? p : w * h, pic = rect(w, h, { wl: `${w} cm`, hl: `${h} cm` });
  return { ask: `${nm()} says that the ${area ? 'area' : 'perimeter'} of this rectangle is ${wrong}. That has a slip in it. What is the correct ${area ? 'area' : 'perimeter'}?`, visual: pic, answer: num(area ? w * h : p), suffix: area ? 'square cm' : 'cm', _t: area ? { f: 'mul', a: w, b: h } : { f: 'perim', a: w, b: h },
    hint: area ? 'Area is the space inside, counted in squares.' : 'Perimeter is the distance all the way around the edge.',
    ways: [way('Find the slip', [`${wrong} is ${area ? `${w} + ${h} + ${w} + ${h}, the way around the edge. That is the perimeter.` : `${w} × ${h}, the squares inside. That is the area.`}`, area ? `Area is rows of squares: ${h} × ${w} = ${b(w * h)} square cm.` : `Perimeter adds all four sides: ${w} + ${h} + ${w} + ${h} = ${b(p)} cm.`]), ...(area ? areaWays(w, h, 'cm') : perimWays(w, h, 'cm'))] };
}
// Area and one side are known: find the other side, then the way round.
function perimFromAreaQ(w, o) {
  const area = w * o, p = 2 * (w + o);
  return { ask: `A rectangle has an area of ${area} square cm and one side of ${w} cm. What is its perimeter?`, answer: num(p), suffix: 'cm', _t: { f: 'perimarea', area, w }, hint: 'Find the other side first. What times that side makes the area?',
    ways: [way('Find the other side', [`${w} × ? = ${area}, so the other side is ${area} ÷ ${w} = ${o}.`, `${w} + ${o} + ${w} + ${o} = ${b(p)} cm.`]), way('Half the way round, then double', [`The other side is ${o}. One long side and one short side: ${w} + ${o} = ${w + o}.`, `Double it: ${w + o} × 2 = ${b(p)} cm.`])] };
}
export function genTiling(L) {
  const [w, h] = diff(2, L === 1 ? 6 : 9), W = rnd(L === 2 ? 5 : 7, L === 2 ? 9 : 12), H = rnd(L === 2 ? 4 : 6, L === 2 ? 7 : 10), nw = rnd(2, W - 2), nh = rnd(1, H - 2), u = pick(['m', 'cm', 'ft']);
  const pool = L === 1 ? [() => countQ(w, h), () => joinedQ(rnd(2, 5), 3, rnd(2, 4)), () => tileStoryQ(w, h), () => sameQ('perim', true), () => slipQuestion(w, h, Math.random() < 0.5)]
    : L === 2 ? [() => lShapeQ(W, H, nw, nh, u), () => joinedQ(rnd(3, 9), pick([5, 10]), rnd(2, 4)), () => sameQ('perim', Math.random() < 0.5), () => slipQuestion(w, h, Math.random() < 0.5), () => tileStoryQ(w, h)]
      : [() => lShapeQ(W, H, nw, nh, u), () => perimFromAreaQ(...diff(3, 9)), () => sameQ('area', Math.random() < 0.5), () => joinedQ(rnd(6, 9), 10, rnd(3, 5)), () => slipQuestion(w, h, Math.random() < 0.5), () => sameQ('perim', Math.random() < 0.5)];
  return pick(pool)();
}
