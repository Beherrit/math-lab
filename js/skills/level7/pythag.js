// The Pythagorean theorem: hypotenuse, leg, checking for a right angle, and distance on the grid.
import { rnd, pick, chance, b, way, pow, fmt, num, choice } from '../../util.js';
import { sqrt, pt, par, yesNo } from './h.js';
import { rightTri, sideSquares } from './shapes.js';
import { grid, quad } from './draw.js';

const BASE = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]];
const scaled = ([a, c, h], k) => [a * k, c * k, h * k];
export const SMALL = [BASE[0], scaled(BASE[0], 2), BASE[1], scaled(BASE[0], 3), BASE[2], scaled(BASE[0], 4)];
export const TRIPLES = [...SMALL, BASE[3], scaled(BASE[1], 2), scaled(BASE[0], 5), BASE[4], scaled(BASE[0], 6), scaled(BASE[2], 2), scaled(BASE[0], 10)];
const family = ([a, c, h]) => { const base = BASE.find(t => a % t[0] === 0 && c === t[1] * (a / t[0]) && h === t[2] * (a / t[0])); return base ? [base, a / base[0]] : null; };
const sq = n => n * n;
// t gives the true leg lengths (shorter first) so the picture has the right proportions; v, h and hyp are the labels.
const draw = (t, v, h, hyp) => rightTri(v, h, hyp, { vr: t[0], hr: t[1] });
function familyWay(t, find) {
  const f = family(t);
  if (f && f[1] > 1) return way('Spot the family', [`${f[0].join('-')} is a right triangle you may know. Multiply each side by ${f[1]}: ${t.join('-')}.`, `So the missing side is ${f[0][find]} × ${f[1]} = ${b(t[find])}.`]);
  return way('Does it make sense?', find === 2 ? [`The longest side has to be longer than each leg (${t[0]} and ${t[1]}) but shorter than both legs together (${t[0] + t[1]}).`, `${b(t[2])} fits.`] : [`A leg has to be shorter than the longest side, ${t[2]}.`, `${b(t[find])} fits, and ${pow(t[0], 2)} + ${pow(t[1], 2)} = ${fmt(sq(t[0]) + sq(t[1]))} = ${pow(t[2], 2)}.`]);
}
function hypotenuse(set) {
  const t = pick(set), [a, c, h] = t;
  return { ask: `The legs of a right triangle are ${a} and ${c}. Find the length of the longest side (the hypotenuse).`, visual: draw(t, a, c, '?') + sideSquares(`${a}²`, `${c}²`), answer: num(h),
    why: `Add the squares on the legs, not the legs themselves. ${a} + ${c} is the path around the corner, and that path is longer than the straight side.`,
    hint: 'Square each leg, then add the two squares.', _t: { k: 'pyth', find: 'hyp', a, c },
    ways: [way('Squares on the sides', ['In a right triangle, the squares on the two legs together have the same area as the square on the longest side.', `${pow(a, 2)} + ${pow(c, 2)} = ${fmt(sq(a))} + ${fmt(sq(c))} = ${fmt(sq(h))}`, `The longest side is the side of a square with area ${fmt(sq(h))}: ${sqrt(fmt(sq(h)))} = ${b(h)}.`]), familyWay(t, 2)] };
}
function squareAreas(set) {
  const wantSide = chance(0.5), t = pick(wantSide ? set : set.filter(x => x[2] <= 13)), [a, c, h] = t; // the area answer stays within 169
  return { ask: `Squares are drawn on the two legs of a right triangle. Their areas are ${sq(a)} and ${sq(c)} square units. ${wantSide ? 'How long is the longest side of the triangle?' : 'What is the area of the square on the longest side?'}`, visual: draw(t, a, c, '?'), answer: num(wantSide ? h : sq(h)), hint: 'The two smaller squares together have the same area as the biggest square.', _t: { k: 'pyth', find: wantSide ? 'hyp' : 'sqsum', a, c },
    ways: [way('Add the areas', [`The squares on the legs fit exactly into the square on the longest side: ${sq(a)} + ${sq(c)} = ${b(fmt(sq(h)))} square units.`, ...(wantSide ? [`A square with area ${fmt(sq(h))} has side ${sqrt(fmt(sq(h)))} = ${b(h)}.`] : [])]),
      way('Start from the side lengths', [`A square with area ${sq(a)} has side ${a}, and one with area ${sq(c)} has side ${c}. Those are the legs.`, `${pow(a, 2)} + ${pow(c, 2)} = ${fmt(sq(h))}${wantSide ? `, and ${sqrt(fmt(sq(h)))} = ${b(h)}` : ''}.`])] };
}
// Step 1 idea builder: any two legs, no square root needed yet.
function bigSquare() {
  const a = rnd(1, 9), c = rnd(a, 10), sum = sq(a) + sq(c);
  return { ask: `The legs of a right triangle are ${a} and ${c}. What is the area of the square drawn on its longest side?`, visual: draw([a, c], a, c, '') + sideSquares(`${a}²`, `${c}²`), answer: num(sum), suffix: 'square units',
    why: `The two smaller squares fill the big one. Adding the legs, ${a} + ${c}, measures a path, not an area.`,
    hint: 'Find the area of the square on each leg, then add them.', _t: { k: 'pyth', find: 'sqsum', a, c },
    ways: [way('Add the two smaller squares', [`Square on the first leg: ${a} × ${a} = ${sq(a)}. Square on the second leg: ${c} × ${c} = ${sq(c)}.`, `In a right triangle these two together have the same area as the square on the longest side: ${sq(a)} + ${sq(c)} = ${b(sum)}`]),
      way('Write it with exponents', [`${pow(a, 2)} + ${pow(c, 2)} = ${pow('c', 2)}, where c is the longest side.`, `${sq(a)} + ${sq(c)} = ${b(sum)}. That is the area of the big square. (Its side would be ${sqrt(sum)}.)`])] };
}
function leg(set) {
  const t = pick(set), i = rnd(0, 1), known = t[1 - i], miss = t[i], h = t[2];
  return { ask: `A right triangle has a leg of ${known} and a longest side of ${h}. Find the length of the other leg.`, visual: draw(t, i === 0 ? '?' : known, i === 0 ? known : '?', h), answer: num(miss), hint: 'The square on the longest side is the total. Take away the square you know.', _t: { k: 'pyth', find: 'leg', a: known, h },
    ways: [way('Take away the square you know', [`leg² + ${pow(known, 2)} = ${pow(h, 2)}, which is leg² + ${fmt(sq(known))} = ${fmt(sq(h))}.`, `leg² = ${fmt(sq(h))} − ${fmt(sq(known))} = ${fmt(sq(miss))}`, `leg = ${sqrt(fmt(sq(miss)))} = ${b(miss)}`]), familyWay(t, i)] };
}
function isRight() {
  const t = pick(TRIPLES.slice(0, 11)), yes = chance(0.5), h = yes ? t[2] : t[2] + pick([-1, 1, 2]), [a, c] = t, sum = sq(a) + sq(c);
  return { ask: `A triangle has sides ${a}, ${c} and ${h}. Is it a right triangle?`, answer: yesNo(yes), hint: 'Square the two shorter sides and add. Compare with the square of the longest side.', _t: { k: 'pyth', find: 'check', a, c, h },
    ways: [way('Test the squares', [`Shorter sides: ${pow(a, 2)} + ${pow(c, 2)} = ${fmt(sq(a))} + ${fmt(sq(c))} = ${fmt(sum)}.`, `Longest side: ${pow(h, 2)} = ${fmt(sq(h))}.`, yes ? `They are equal, so ${b('yes')}, it has a right angle.` : `${fmt(sum)} is not ${fmt(sq(h))}, so ${b('no')}, there is no right angle.`]),
      way('What the test tells you', [`If the angle between the short sides were exactly a right angle, the third side would be ${sqrt(fmt(sum))} = ${t[2]}.`, yes ? 'It is, so the corner is square.' : `${h} is ${h > t[2] ? 'longer, so that angle is wider than a right angle' : 'shorter, so that angle is narrower than a right angle'}.`])] };
}
function distance() {
  const t = pick([SMALL[0], SMALL[1], SMALL[2]]), [dx, dy] = chance(0.5) ? [t[0], t[1]] : [t[1], t[0]], four = chance(0.5) || dx > 9 || dy > 9, r = 7;
  const p = four ? [rnd(-r, r - dx), rnd(-r, r - dy)] : [rnd(0, 10 - dx), rnd(0, 10 - dy)], up = chance(0.5), a = up ? p : [p[0], p[1] + dy], q = up ? [p[0] + dx, p[1] + dy] : [p[0] + dx, p[1]];
  const corner = [q[0], a[1]], layer = { pts: [{ x: a[0], y: a[1], label: 'A' }, { x: q[0], y: q[1], label: 'B' }] }, draw2 = four ? l => quad({ r, ...l }) : grid;
  return { ask: `How far apart are A ${pt(...a)} and B ${pt(...q)}, in a straight line?`, visual: draw2({ ...layer, segs: [{ a, b: q, dash: false, color: 'var(--grape)' }] }), answer: num(t[2]), suffix: 'units', hint: 'Draw a right triangle with AB as its longest side. How long are the flat side and the upright side?', _t: { k: 'pyth', find: 'dist', p: a, q },
    ways: [way('Build a right triangle', [draw2({ ...layer, segs: [{ a, b: q, dash: false, color: 'var(--grape)' }, { a, b: corner }, { a: corner, b: q }] }), `Go across from A, then up or down to B. The flat side is ${dx} long and the upright side is ${dy} long.`, `${pow(dx, 2)} + ${pow(dy, 2)} = ${sq(dx)} + ${sq(dy)} = ${sq(t[2])}`, `${sqrt(sq(t[2]))} = ${b(t[2])}`]),
      way('Use the distance formula', ['Distance = √( (change in x)² + (change in y)² ). It is the Pythagorean theorem written with coordinates.', `Change in x: ${fmt(q[0])} − ${par(a[0])} = ${fmt(q[0] - a[0])}. Change in y: ${fmt(q[1])} − ${par(a[1])} = ${fmt(q[1] - a[1])}.`, `√(${sq(dx)} + ${sq(dy)}) = ${sqrt(sq(t[2]))} = ${b(t[2])}`])] };
}
function notWhole() {
  const a = rnd(2, 9), c = rnd(2, 9), sum = sq(a) + sq(c), n = Math.floor(Math.sqrt(sum)), both = (x, y) => `${x} and ${y}`;
  if (n * n === sum) return null;
  return { ask: `The legs of a right triangle are ${a} and ${c}. The longest side is between which two whole numbers?`, visual: draw([Math.min(a, c), Math.max(a, c)], Math.min(a, c), Math.max(a, c), '?'), answer: choice(both(n, n + 1), [both(n - 1, n), both(n + 1, n + 2), both(a + c - 1, a + c), both(sum - 1, sum)]), hint: `Find ${pow(a, 2)} + ${pow(c, 2)} first. The side is the square root of that.`, _t: { k: 'pyth', find: 'between', a, c },
    ways: [way('Square, add, then trap the root', [`${pow(a, 2)} + ${pow(c, 2)} = ${sq(a)} + ${sq(c)} = ${sum}, so the side is ${sqrt(sum)}.`, `${pow(n, 2)} = ${sq(n)} and ${pow(n + 1, 2)} = ${sq(n + 1)}. ${sum} is between them.`, `So the side is between ${b(both(n, n + 1))}.`]),
      way('Rule out adding the legs', [`The side is not ${a} + ${c} = ${a + c}. The straight path across is shorter than going along both legs.`, `It is also longer than the longer leg, ${Math.max(a, c)}. ${both(n, n + 1)} fits both facts.`])] };
}
export function genPyth(L) {
  if (L === 1) return pick([() => hypotenuse(SMALL), () => hypotenuse(SMALL), () => squareAreas(SMALL), bigSquare, bigSquare])();
  if (L === 2) return pick([() => leg(TRIPLES), () => leg(TRIPLES), () => hypotenuse(TRIPLES.slice(4)), isRight])();
  return pick([distance, distance, notWhole, isRight, () => leg(TRIPLES.slice(6))])();
}
