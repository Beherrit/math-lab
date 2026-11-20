// Area and perimeter of rectangles, including finding a missing side and two-step problems.
import { rnd, pick, fmt, b, k, way, nm, num } from '../../util.js';
import { oneOf } from './helpers.js';
import { rectSVG, arraySVG } from './visuals.js';

const UNITS = ['cm', 'm', 'ft', 'in'];
const DIM = [() => [rnd(3, 12), rnd(2, 9)], () => [rnd(4, 15), rnd(2, 12)], () => [rnd(5, 25), rnd(3, 15)]];
function dims(L) { for (;;) { const [l, w] = DIM[L - 1](); if (l !== w) return [Math.max(l, w), Math.min(l, w), pick(UNITS)]; } }
const draw = (l, w, u, o = {}) => rectSVG(l, w, { lL: o.l ?? `${l} ${u}`, wL: o.w ?? `${w} ${u}`, inside: o.inside ?? '' });
const sq = u => `square ${u}`;

const areaSteps = (l, w, u) => [`Area = length × width, because the rectangle is ${w} rows of ${l} unit squares.`, `${l} × ${w} = ${b(fmt(l * w))} ${sq(u)}`];
const perimSteps = (l, w, u) => [`Perimeter is the distance all the way round: two lengths and two widths.`, `${l} + ${w} + ${l} + ${w} = ${b(fmt(2 * (l + w)))} ${u}`];
const halfSteps = (P, l, u) => [`Half the perimeter is one length plus one width: ${P} ÷ 2 = ${P / 2}`, `Take away the length: ${P / 2} − ${l} = ${b(P / 2 - l)} ${u}`];

function basic(L) {
  const [l, w, u] = dims(L), area = pick([true, false]);
  if (area) return { ask: `Find the area of a rectangle that is ${l} ${u} long and ${w} ${u} wide.`, visual: draw(l, w, u), answer: num(l * w), suffix: sq(u), _t: { kind: 'area', l, w }, hint: 'Area is the space inside. How many unit squares fit in one row, and how many rows are there?',
    ways: [way('Rows of squares', [...(l <= 12 ? [arraySVG(w, l)] : []), `Tile the rectangle with unit squares: ${w} rows with ${l} in each row.`, `${w} rows of ${l} is ${l} × ${w} = ${b(fmt(l * w))} ${sq(u)}`]), way('Use the formula', areaSteps(l, w, u))] };
  return { ask: `Find the perimeter of a rectangle that is ${l} ${u} long and ${w} ${u} wide.`, visual: draw(l, w, u), answer: num(2 * (l + w)), suffix: u, _t: { kind: 'perim', l, w }, hint: 'Perimeter is the distance around the edge. A rectangle has four sides, in two matching pairs.',
    ways: [way('Walk around the edge', perimSteps(l, w, u)), way('Double it', [`One length and one width: ${l} + ${w} = ${l + w}`, `There are two of each, so double it: 2 × ${l + w} = ${b(fmt(2 * (l + w)))} ${u}`])] };
}
function square() {
  const s = rnd(2, 12), u = pick(UNITS), area = pick([true, false]);
  return { ask: `A square has sides of ${s} ${u}. Find its ${area ? 'area' : 'perimeter'}.`, visual: draw(s, s, u), answer: num(area ? s * s : 4 * s), suffix: area ? sq(u) : u, _t: { kind: area ? 'area' : 'perim', l: s, w: s },
    hint: area ? 'Area is rows of squares: side × side.' : 'All four sides of a square are the same length.',
    ways: area ? [way('Rows of squares', [arraySVG(s, s), `${s} rows of ${s}: ${s} × ${s} = ${b(s * s)} ${sq(u)}`]), way('Use the formula', areaSteps(s, s, u))]
      : [way('Four equal sides', [`4 × ${s} = ${b(4 * s)} ${u}`]), way('Walk around the edge', perimSteps(s, s, u))] };
}

function widthFromArea(L) {
  const [l, w, u] = dims(L), A = l * w;
  return { ask: `A rectangle has an area of ${fmt(A)} ${sq(u)}. One side is ${l} ${u}. Find the missing side.`, visual: draw(l, w, u, { w: '?', inside: `${fmt(A)} ${sq(u)}` }), answer: num(w), suffix: u, _t: { kind: 'wFromA', A, l }, hint: `Area = length × width, so ${l} × ? = ${fmt(A)}.`,
    ways: [way('Undo the multiplication', [`Area = length × width, so ${l} × ? = ${fmt(A)}.`, `Dividing undoes multiplying: ${fmt(A)} ÷ ${l} = ${b(w)} ${u}`, `Check: ${l} × ${w} = ${fmt(A)}.`]),
      way('Build it row by row', [`Each row holds ${l} squares. Count by ${l}s until you reach ${fmt(A)}.`, Array.from({ length: w }, (_, i) => fmt(l * (i + 1))).join(', '), `That took ${b(w)} rows, so the missing side is ${w} ${u}.`])] };
}
function widthFromPerim(L) {
  const [l, w, u] = dims(L), P = 2 * (l + w);
  return { ask: `A rectangle has a perimeter of ${P} ${u}. One side is ${l} ${u}. Find the missing side.`, visual: draw(l, w, u, { w: '?' }), answer: num(w), suffix: u, _t: { kind: 'wFromP', P, l }, hint: 'Two lengths and two widths make the perimeter. Take away what you know.',
    ways: [way('Half the perimeter', halfSteps(P, l, u)), way('Take away both lengths', [`The two lengths use up 2 × ${l} = ${2 * l} ${u}.`, `That leaves ${P} − ${2 * l} = ${P - 2 * l} ${u} for the two widths.`, `One width is half of that: ${P - 2 * l} ÷ 2 = ${b(w)} ${u}`])] };
}
function areaFromPerim(L) {
  const [l, w, u] = dims(L), P = 2 * (l + w);
  return { ask: `A rectangle has a perimeter of ${P} ${u}. One side is ${l} ${u}. Find the area.`, visual: draw(l, w, u, { w: '?' }), answer: num(l * w), suffix: sq(u), _t: { kind: 'areaFromP', P, l }, hint: 'You need the missing side first. Use the perimeter to find it.',
    ways: [way('Find the side, then the area', [...halfSteps(P, l, u), `Now area = ${l} × ${w} = ${b(fmt(l * w))} ${sq(u)}`]),
      way('Check both facts', [draw(l, w, u), `Perimeter: ${l} + ${w} + ${l} + ${w} = ${P}. That matches.`, `Area: ${w} rows of ${l} = ${b(fmt(l * w))} ${sq(u)}`])] };
}
function perimFromArea(L) {
  const [l, w, u] = dims(L), A = l * w;
  return { ask: `A rectangle has an area of ${fmt(A)} ${sq(u)}. One side is ${l} ${u}. Find the perimeter.`, visual: draw(l, w, u, { w: '?', inside: `${fmt(A)} ${sq(u)}` }), answer: num(2 * (l + w)), suffix: u, _t: { kind: 'perimFromA', A, l }, hint: 'You need the missing side first. Use the area to find it.',
    ways: [way('Find the side, then the perimeter', [`${l} × ? = ${fmt(A)}, so the missing side is ${fmt(A)} ÷ ${l} = ${w} ${u}.`, ...perimSteps(l, w, u).slice(1)]),
      way('Check both facts', [draw(l, w, u), `Area: ${l} × ${w} = ${fmt(A)}. That matches.`, `Perimeter: 2 × (${l} + ${w}) = 2 × ${l + w} = ${b(fmt(2 * (l + w)))} ${u}`])] };
}
function squareFromPerim() {
  const s = rnd(3, 12), u = pick(UNITS), P = 4 * s;
  return { ask: `A square has a perimeter of ${P} ${u}. What is its area?`, answer: num(s * s), suffix: sq(u), _t: { kind: 'sqArea', P }, hint: 'A square has four equal sides. Find one side first.',
    ways: [way('Side first, then area', [`Four equal sides share the perimeter: ${P} ÷ 4 = ${s} ${u} each.`, `Area = ${s} × ${s} = ${b(s * s)} ${sq(u)}`]), way('Picture it', [draw(s, s, u), `Each side is ${s} ${u}, so the square is ${s} rows of ${s}: ${b(s * s)} ${sq(u)}.`])] };
}

const STORIES = [
  (l, w, r, n) => ({ kind: 'fence', price: [5, 12], ans: 2 * (l + w) * r, story: `${n} is fencing a rectangular garden that is ${k(l + ' m')} long and ${k(w + ' m')} wide. Fencing costs ${k('$' + r)} for each meter.`, ask: 'How much does the fence cost?', find: 'The cost of fencing all the way round.', know: [`${l} m long`, `${w} m wide`, `$${r} for each meter`],
    clue: 'A fence goes around the edge, so you need the perimeter first. Then “for each meter” means multiply.', plan: `perimeter = ${l} + ${w} + ${l} + ${w}, then × ${r}`,
    steps: [`A fence goes round the edge: perimeter = ${l} + ${w} + ${l} + ${w} = ${2 * (l + w)} m`, `Each meter costs $${r}: ${2 * (l + w)} × ${r} = ${b('$' + fmt(2 * (l + w) * r))}`] }),
  (l, w, r, n) => ({ kind: 'floor', price: [8, 25], ans: l * w * r, story: `A rectangular hall is ${k(l + ' m')} long and ${k(w + ' m')} wide. Flooring costs ${k('$' + r)} for each square meter.`, ask: 'How much does it cost to cover the whole floor?', find: 'The cost of covering the inside of the room.', know: [`${l} m long`, `${w} m wide`, `$${r} for each square meter`],
    clue: 'Covering a floor fills the inside, so you need the area first. Then “for each square meter” means multiply.', plan: `area = ${l} × ${w}, then × ${r}`,
    steps: [`Flooring covers the inside: area = ${l} × ${w} = ${fmt(l * w)} square m`, `Each square meter costs $${r}: ${fmt(l * w)} × ${r} = ${b('$' + fmt(l * w * r))}`] }),
  (l, w, r, n) => ({ kind: 'laps', price: [2, 9], ans: 2 * (l + w) * r, story: `A rectangular sports field is ${k(l + ' m')} long and ${k(w + ' m')} wide. ${n} jogs around the edge ${k(r + ' times')}.`, ask: `How far does ${n} jog?`, find: 'The distance for all the laps.', know: [`${l} m long`, `${w} m wide`, `${r} laps`],
    clue: '“Around the edge” is the perimeter. Doing it several times means multiply.', plan: `perimeter = ${l} + ${w} + ${l} + ${w}, then × ${r}`,
    steps: [`One lap is the perimeter: ${l} + ${w} + ${l} + ${w} = ${2 * (l + w)} m`, `${r} laps: ${2 * (l + w)} × ${r} = ${b(fmt(2 * (l + w) * r))} m`] }),
];
export function areaWord(L = 3) {
  const [l, w] = dims(L), mk = pick(STORIES), [lo, hi] = mk(0, 0, 0, '').price, r = rnd(lo, L === 1 ? lo + 3 : hi), s = mk(l, w, r, nm()), money = s.kind !== 'laps';
  return { story: s.story, ask: money ? s.ask + ' Answer in dollars.' : s.ask, answer: num(s.ans), suffix: money ? 'dollars' : 'm', op: 'multi', _t: { kind: s.kind, l, w, r }, hint: s.kind === 'floor' ? 'Is this about the inside or the edge? Find that first.' : 'Is this about the edge or the inside? Find that first.',
    ways: [way('Two steps', s.steps), way('Draw it', [draw(l, w, 'm'), s.kind === 'floor' ? `The inside is ${w} rows of ${l} squares: ${fmt(l * w)} square m.` : `Going round the edge: ${l} + ${w} + ${l} + ${w} = ${2 * (l + w)} m.`, `Multiply by ${r}: ${b((money ? '$' : '') + fmt(s.ans))}${money ? '' : ' m'}`])],
    read: { find: s.find, know: s.know, clue: s.clue, plan: s.plan } };
}

const MAKERS = [[basic, basic, basic, square], [widthFromArea, widthFromArea, widthFromPerim, widthFromPerim, basic], [areaFromPerim, perimFromArea, squareFromPerim, areaWord, areaWord, widthFromPerim]];
export const genArea = L => oneOf(MAKERS[L - 1], L);
