// Skill l4fmix: multiplying mixed numbers and the area of rectangles with fraction sides (5.NF.4b, 5.NF.6).
import { R, rnd, pick, chance, gcd, lcm, F, fr, b, k, way, nm, num, frac, choice } from '../../util.js';
import { T, rd } from './helpers.js';
import { term, imp, mix } from './fracs.js';
import { sideGrid, areaTable } from './visuals.js';

// Ways to multiply two mixed numbers: as fractions, or with the four boxes of an area model.
function mixWays(A, B) {
  const iA = imp(A), iB = imp(B), top = iA * iB, bot = A.d * B.d, boxes = [A.w * B.w * bot, A.n * B.w * B.d, A.w * B.n * A.d, A.n * B.n];
  return { top, bot, ways: [
    way('Turn them into fractions', [`${mix(A)} = ${F(iA, A.d)} and ${mix(B)} = ${F(iB, B.d)}.`, `Multiply the tops: ${iA} × ${iB} = ${top}. Multiply the bottoms: ${A.d} × ${B.d} = ${bot}.`, `${F(top, bot)} = ${b(fr(top, bot))}`]),
    way('Area model', [areaTable(A, B), `Write each box with the bottom ${bot}, then add the tops: ${boxes.join(' + ')} = ${top}.`, `${F(top, bot)} = ${b(fr(top, bot))}`])] };
}
function fmWF() {
  const w = rnd(2, 5), d = pick([2, 3, 4, 5]), n = rnd(1, d - 1);
  return T({ ask: 'What is the area of this rectangle, in square units?', visual: sideGrid([w, 1], [n, d]), answer: frac(w * n, d),
    ways: [way('Count the small pieces', [`Each unit square is cut into ${d} equal strips, so every small piece is ${F(1, d)} of a square unit.`, `The rectangle covers ${w} × ${n} = ${w * n} pieces.`, `${w * n} pieces of ${F(1, d)} make ${b(fr(w * n, d))}`]),
      way('Multiply the sides', [`${w} × ${F(n, d)} = ${F(w * n, d)} = ${b(fr(w * n, d))}`])],
    hint: 'How many equal small pieces does the rectangle cover, and how big is each piece?' }, 'fmWF', { w, n, d });
}
function fmTiles(L) {
  const q = rnd(2, L === 3 ? 6 : 4), r = rnd(2, 2 * q), c = rnd(2, 2 * q);
  return T({ ask: `A rectangle is covered with small squares in ${r} rows of ${c}. Each small square has sides of ${F(1, q)} unit. What is the area of the rectangle, in square units?`, answer: frac(r * c, q * q),
    ways: [way('One small square first', [`One small square: ${F(1, q)} × ${F(1, q)} = ${F(1, q * q)} of a square unit.`, `${r} × ${c} = ${r * c} small squares.`, `${r * c} × ${F(1, q * q)} = ${b(fr(r * c, q * q))}`]),
      way('Use the side lengths', [`The rectangle is ${F(c, q)} unit long and ${F(r, q)} unit wide.`, `${F(c, q)} × ${F(r, q)} = ${F(r * c, q * q)} = ${b(fr(r * c, q * q))}`])],
    hint: 'Find the area of one small square first. Then count the squares.' }, 'fmTiles', { q, r, c });
}
function fmPic(L) {
  const proper = () => { const d = rnd(2, 4); return [rnd(1, d - 1), d]; }, side = () => { const x = term(rnd(1, 2), rnd(2, 4)); return [imp(x), x.d]; };
  const [a, c] = L === 1 ? [proper(), proper()] : [side(), side()], top = a[0] * c[0], bot = a[1] * c[1];
  return T({ ask: 'What is the area of the shaded rectangle, in square units?', visual: sideGrid(a, c), answer: frac(top, bot),
    ways: [way('Count the small pieces', [`Each unit square is cut into ${a[1]} columns and ${c[1]} rows, so ${bot} equal pieces.`, `The shaded part is ${a[0]} columns by ${c[0]} rows: ${a[0]} × ${c[0]} = ${top} pieces.`, `${top} pieces out of ${bot} is ${F(top, bot)} = ${b(fr(top, bot))}`]),
      way('Multiply the sides', [`${fr(a[0], a[1])} × ${fr(c[0], c[1])} = ${F(top, bot)} = ${b(fr(top, bot))}`])],
    hint: 'Count the small pieces that are shaded, and how many small pieces make one unit square.' }, 'fmPic', { a, c });
}
function fmCmp1() {
  const side = () => { const d = rnd(2, 9), n = chance(0.5) ? rnd(1, d - 1) : rnd(d + 1, 2 * d); return gcd(n, d) === 1 ? [n, d] : side(); };
  let a = side(), c = side();
  if (chance(0.15)) c = [a[1], a[0]];
  const top = a[0] * c[0], bot = a[1] * c[1], lab = top === bot ? 'Exactly 1' : top < bot ? 'Less than 1' : 'More than 1', rel = x => (x[0] < x[1] ? 'less than' : 'more than');
  return T({ ask: `A rectangle is ${fr(a[0], a[1])} by ${fr(c[0], c[1])} units. Is its area less than 1, exactly 1, or more than 1 square unit?`, answer: choice(lab, [], { all: ['Less than 1', 'Exactly 1', 'More than 1'] }), choiceBig: true,
    ways: [way('Multiply', [`${F(a[0], a[1])} × ${F(c[0], c[1])} = ${F(top, bot)}.`, `${top} is ${top === bot ? 'the same as' : top < bot ? 'less than' : 'more than'} ${bot}, so the area is ${b(lab.toLowerCase())}.`]),
      way('Compare with a unit square', [`A unit square has sides 1 and 1. Here one side is ${rel(a)} 1 and the other is ${rel(c)} 1.`, `The area ${F(top, bot)} compared with 1 gives ${b(lab.toLowerCase())}.`])],
    hint: 'Multiply the sides, then compare the top and bottom of the answer.' }, 'fmCmp1', { a, c });
}
function fmMix(L) {
  const A = term(rnd(1, L === 3 ? 5 : 3), rnd(2, L === 3 ? 6 : 4)), B = term(rnd(1, L === 3 ? 4 : 3), rnd(2, L === 3 ? 6 : 4)), { top, bot, ways } = mixWays(A, B);
  return T({ ask: 'Multiply.', expr: `${mix(A)} × ${mix(B)}`, answer: frac(top, bot), ways, hint: 'Turn each mixed number into a fraction, or split each into a whole and a part.' }, 'fmMix', { A, B });
}
const THINGS = [['A garden bed', 'feet', 'square feet'], ['A rug', 'feet', 'square feet'], ['A poster', 'feet', 'square feet'], ['A phone screen', 'inches', 'square inches'], ['A skate ramp surface', 'meters', 'square meters']];
export function areaWord(L = 2) {
  const lv = Math.min(3, Math.max(1, L)), [what, unit, sq] = pick(THINGS), A = term(rnd(1, 4), rnd(2, lv === 3 ? 6 : 4)), B = term(rnd(1, 3), rnd(2, lv === 3 ? 6 : 4)), { top, bot, ways } = mixWays(A, B);
  return T({ story: `${what} is ${k(mix(A) + ' ' + unit)} long and ${k(mix(B) + ' ' + unit)} wide.`, ask: `What is its area, in ${sq}?`, answer: frac(top, bot), ways, op: 'mul',
    read: rd(`The area, in ${sq}.`, [`${mix(A)} ${unit} long`, `${mix(B)} ${unit} wide`], '“area” of a rectangle means length × width', `${mix(A)} × ${mix(B)}`), hint: 'Area is length times width. Turn the mixed numbers into fractions first.' }, 'fmRect', { A, B });
}
function fmBox() {
  const A = term(rnd(1, 4), rnd(2, 5)), B = term(rnd(1, 3), rnd(2, 5)), hide = rnd(1, 3);
  const cell = [null, [A.n * B.w, A.d], [A.w * B.n, B.d], [A.n * B.n, A.d * B.d]][hide], what = [null, `${F(A.n, A.d)} × ${B.w}`, `${A.w} × ${F(B.n, B.d)}`, `${F(A.n, A.d)} × ${F(B.n, B.d)}`][hide];
  return T({ ask: `This area model is for ${mix(A)} × ${mix(B)}. What number goes in the box with the question mark?`, visual: areaTable(A, B, hide), answer: frac(cell[0], cell[1]),
    ways: [way('Multiply the two sides of the box', [`The box sits under ${hide === 2 ? A.w : F(A.n, A.d)} and beside ${hide === 1 ? B.w : F(B.n, B.d)}.`, `${what} = ${F(cell[0], cell[1])} = ${b(fr(cell[0], cell[1]))}`]),
      way('Read the picture', ['Each box is the area of a rectangle. Its two sides are the numbers at the top and on the left of that box.', `For this box: ${what}, which is ${b(fr(cell[0], cell[1]))}.`])],
    hint: 'Each box is its column number times its row number.' }, 'fmBox', { A, B, hide });
}
function fmL() {
  const A = term(rnd(1, 4), pick([2, 3, 4])), C = term(rnd(1, 3), pick([2, 3, 4])), W = term(rnd(1, 3), pick([2, 3, 4])), l = lcm(A.d, C.d), s = imp(A) * (l / A.d) + imp(C) * (l / C.d);
  const p1 = [imp(A) * imp(W), A.d * W.d], p2 = [imp(C) * imp(W), C.d * W.d], total = [s * imp(W), l * W.d], tt = [p1[0] * p2[1] + p2[0] * p1[1], p1[1] * p2[1]];
  return T({ story: `An L-shaped garden path is made of two rectangles with the same width, ${k(mix(W) + ' meters')}. One is ${k(mix(A) + ' meters')} long and the other is ${k(mix(C) + ' meters')} long.`, ask: 'What is the area of the path, in square meters?', answer: frac(total[0], total[1]), op: 'multi',
    ways: [way('Find each area, then add', [`${mix(A)} × ${mix(W)} = ${fr(p1[0], p1[1])} and ${mix(C)} × ${mix(W)} = ${fr(p2[0], p2[1])}.`, `${fr(p1[0], p1[1])} + ${fr(p2[0], p2[1])} = ${b(fr(tt[0], tt[1]))}`]),
      way('Join the rectangles', [`Both have the width ${mix(W)}, so they join into one rectangle ${mix(A)} + ${mix(C)} = ${fr(s, l)} long.`, `${fr(s, l)} × ${mix(W)} = ${b(fr(total[0], total[1]))}`])],
    read: rd('The area of the whole path.', [`width ${mix(W)} m`, `lengths ${mix(A)} m and ${mix(C)} m`], 'Two rectangles with the same width: find each area and add, or add the lengths first.', `${mix(A)} × ${mix(W)} + ${mix(C)} × ${mix(W)}`), hint: 'Find the area of each rectangle first, or join them into one big rectangle.' }, 'fmL', { A, C, W });
}
function fmCost() {
  for (;;) {
    const A = term(rnd(2, 5), pick([2, 4])), B = term(rnd(1, 4), pick([2, 4])), P = pick([4, 6, 8, 10, 12, 16, 20, 24]), top = imp(A) * imp(B), bot = A.d * B.d;
    if ((top * P) % bot) continue;
    return T({ story: `Paint costs ${k('$' + P)} for each square meter. A wall is ${k(mix(A) + ' meters')} high and ${k(mix(B) + ' meters')} wide.`, ask: 'How much does it cost to paint the wall, in dollars?', answer: num(top * P / bot), op: 'multi',
      ways: [way('Area first', [`Area: ${mix(A)} × ${mix(B)} = ${F(top, bot)} = ${fr(top, bot)} square meters.`, `Cost: ${F(top, bot)} × ${P} = ${b(top * P / bot)} dollars.`]),
        way('Estimate to check', [`The area is about ${Math.round(top / bot)} square meters, and ${Math.round(top / bot)} × ${P} = ${Math.round(top / bot) * P}.`, `That is close to the exact cost, ${b(top * P / bot)} dollars.`])],
      read: rd('The total cost of the paint.', [`$${P} per square meter`, `${mix(A)} m by ${mix(B)} m`], 'Find the area first (length × width), then multiply by the price for each square meter.', `${mix(A)} × ${mix(B)} × ${P}`), hint: 'Find the area of the wall first.' }, 'fmCost', { A, B, P });
  }
}
export function genFracArea(L) {
  if (L === 1) return pick([fmWF, () => fmTiles(1), () => fmPic(1), fmCmp1])();
  if (L === 2) return pick([() => fmMix(2), () => areaWord(2), fmBox, () => fmPic(2)])();
  return pick([() => fmMix(3), fmL, fmCost, () => fmTiles(3), fmBox])();
}
