// Area and perimeter of rectangles.
import { rnd, pick, chance, shuffle, b, k, way, nm, num, choice } from '../../util.js';
import { rect } from './pics.js';
import { rep, tell } from './words.js';

const UNITS = ['cm', 'm', 'ft'];
const sides = (w, h, u) => ({ wl: `${w} ${u}`, hl: `${h} ${u}` });
export function areaWays(w, h, u) {
  const sq = u === 'units' ? 'square units' : `square ${u}`;
  return [way('Count the rows of squares', [rect(w, h, { grid: true }), `Cover the rectangle with squares that are 1 ${u === 'units' ? 'unit' : u} on each side. There are ${h} rows with ${w} squares in each.`,
    h <= 6 ? `${rep(h, w)} = ${b(w * h)} squares.` : `${h} rows of ${w} is ${b(w * h)} squares.`]),
  way('Multiply', ['Rows of equal size are what multiplying is for: the number of rows times the number of squares in each row.', `${h} × ${w} = ${b(w * h)} ${sq}. (This is the same as length × width, because the order does not matter.)`])];
}
export function perimWays(w, h, u) {
  const unit = u === 'units' ? 'units' : u;
  return [way('Walk around the edge', [rect(w, h, sides(w, h, u === 'units' ? '' : u)), 'Perimeter is the distance all the way around. Add all four sides.', `${w} + ${h} + ${w} + ${h} = ${b(2 * (w + h))} ${unit}.`]),
    way('Two pairs of equal sides', [`Opposite sides of a rectangle are equal: two sides of ${w} and two sides of ${h}.`, `One of each: ${w} + ${h} = ${w + h}.`, `Double it: ${b(2 * (w + h))} ${unit}.`])];
}
function areaQ(w, h, u, grid) {
  return { ask: grid ? 'How many squares cover the rectangle? That number is its area.' : `What is the ${b('area')} of the rectangle?`, expr: grid ? `${h} rows of ${w}` : `${w} ${u} by ${h} ${u}`, exprSmall: true,
    visual: grid ? rect(w, h, { grid: true }) : rect(w, h, sides(w, h, u)), answer: num(w * h), suffix: grid ? 'squares' : `square ${u}`, ways: areaWays(w, h, grid ? 'units' : u), _t: { f: 'mul', a: w, b: h },
    hint: grid ? 'Count the squares in one row. How many rows are there?' : 'Area is the space inside. Picture rows of squares.' };
}
function perimQ(w, h, u) {
  return { ask: `What is the ${b('perimeter')} of the rectangle (the distance all the way around)?`, expr: `${w} ${u} by ${h} ${u}`, exprSmall: true, visual: rect(w, h, sides(w, h, u)), answer: num(2 * (w + h)), suffix: u,
    ways: perimWays(w, h, u), _t: { f: 'perim', a: w, b: h }, hint: 'A rectangle has four sides. Two of them are not labelled, but you know how long they are.' };
}
function sideFromAreaQ(w, h, u) {
  return { ask: `A rectangle has an area of ${b(w * h + ' square ' + u)}. One side is ${b(w + ' ' + u)}. How long is the other side?`, visual: rect(w, h, { wl: `${w} ${u}`, hl: '?' }), answer: num(h), suffix: u,
    hint: `${w} times what makes ${w * h}?`, _t: { f: 'div', a: w * h, b: w },
    ways: [way('Think multiplication', [`Area = length × width, so ${w} × ? = ${w * h}.`, `${w} × ${h} = ${w * h}, so the other side is ${b(h)} ${u}.`]), way('Divide the area', [`${w * h} squares in rows of ${w}: ${w * h} ÷ ${w} = ${b(h)} rows.`, `The other side is ${b(h)} ${u}.`])] };
}
function sideFromPerimQ(w, h, u) {
  const p = 2 * (w + h);
  return { ask: `A rectangle has a perimeter of ${b(p + ' ' + u)}. One side is ${b(w + ' ' + u)}. How long is the side next to it?`, visual: rect(w, h, { wl: `${w} ${u}`, hl: '?' }), answer: num(h), suffix: u,
    hint: `Two of the four sides are ${w} ${u} long. How much of the ${p} is left for the other two?`, _t: { f: 'pside', p, a: w },
    ways: [way('Take away the sides you know', [`Two sides are ${w}: that uses ${w} + ${w} = ${2 * w}.`, `${p} − ${2 * w} = ${2 * h} is left for the other two sides.`, `They are equal, so each is half of ${2 * h}: ${b(h)} ${u}.`]),
      way('Halve the perimeter first', [`Half way around is one long side and one short side: half of ${p} is ${w + h}.`, `${w + h} − ${w} = ${b(h)} ${u}.`])] };
}
const WHICH = [['the length of fence needed to go around a garden', 0], ['how much carpet is needed to cover a floor', 1], ['the length of tape needed to go around the edge of a poster', 0], ['how much paint is needed to cover a wall', 1],
  ['how many tiles are needed to cover a patio', 1], ['how far you run going once around a sports field', 0], ['the length of a frame around a photo', 0], ['how much grass seed is needed for a lawn', 1]];
function whichQ() {
  const [what, isArea] = pick(WHICH);
  return { ask: `What do you need to find: ${b(what)}?`, answer: choice(isArea ? 'Area' : 'Perimeter', [], { all: ['Area', 'Perimeter'] }), choiceBig: true, hint: 'Is it about going around the edge, or about covering the inside?', _t: { f: 'pick', i: isArea },
    ways: [way('Edge or inside?', ['Perimeter is the distance around the edge. Area is the space inside.', isArea ? `This is about covering the whole inside, so it is ${b('area')}.` : `This is about going along the edge, so it is ${b('perimeter')}.`]),
      way('Think of the units', [isArea ? 'Covering is measured in squares, like square meters. Squares measure area.' : 'A length along an edge is measured in plain meters or centimeters. That is perimeter.', `The answer is ${b(isArea ? 'area' : 'perimeter')}.`])] };
}
const diff = (lo, hi) => { const w = rnd(lo, hi); let h = rnd(lo, hi); while (h === w) h = rnd(lo, hi); return [Math.max(w, h), Math.min(w, h)]; };
// The pre-question for a measurement story: there is one measurement that fits, so there is one defensible answer.
const measure = (answer, why) => ({ q: 'Which measurement does this problem need?', options: shuffle(['Perimeter', 'Area']), correct: answer, why });
export function areaWord(L) {
  const [w, h] = L === 1 ? diff(2, 6) : diff(3, 12), n = nm(), area = L === 1 || chance(0.5);
  const row = area ? [`${n} is laying square tiles on a floor that is ${k(w + ' m')} long and ${k(h + ' m')} wide. Each tile covers 1 square meter.`, 'How many tiles are needed?', 'The number of square tiles that cover the floor.', [`${w} m long`, `${h} m wide`], 'Covering the inside is area: rows of tiles, so multiply.']
    : [`${n} is putting a fence around a garden that is ${k(w + ' m')} long and ${k(h + ' m')} wide.`, 'How many meters of fence are needed?', 'The distance all the way around the garden.', [`${w} m long`, `${h} m wide`], '"Around" means perimeter: add all four sides.'];
  if (area) return tell(row, 'area', num(w * h), areaWays(w, h, 'm'), `${h} × ${w}`, { f: 'mul', a: w, b: h }, { suffix: 'tiles', hint: 'Picture rows of tiles.', pre: measure('Area', row[4]) });
  return tell(row, 'perim', num(2 * (w + h)), perimWays(w, h, 'm'), `${w} + ${h} + ${w} + ${h}`, { f: 'perim', a: w, b: h }, { suffix: 'm', hint: 'The fence runs along all four sides.', pre: measure('Perimeter', row[4]) });
}
export function genArea(L) {
  if (L === 1) return chance(0.6) ? areaQ(rnd(2, 6), rnd(2, 5), 'units', true) : perimQ(...diff(2, 9), pick(UNITS));
  const u = pick(UNITS), [w, h] = chance(0.15) ? Array(2).fill(rnd(3, 10)) : diff(3, 12);
  if (L === 2) return chance(0.5) ? areaQ(w, h, u, false) : perimQ(w, h, u);
  const t = pick(['area', 'perim', 'which', 'word']);
  if (t === 'which') return whichQ();
  if (t === 'word') return areaWord(3);
  return t === 'area' ? sideFromAreaQ(w, h, u) : sideFromPerimQ(w, h, u);
}
