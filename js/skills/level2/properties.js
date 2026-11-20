// Properties that make multiplying easier: grouping three factors, the distributive property (split one factor), and any order.
import { rnd, pick, b, way, nm, num, choice, shuffle } from '../../util.js';
import { dots } from './pics.js';
import { twoRects } from './rectpics.js';
import { BLANK } from './words.js';
import { tfQ } from './forms.js';
import { mark } from './kit.js';

const PAIRS = [[2, 5], [4, 5], [5, 6]], BIG = [...PAIRS, [5, 8]];
const join = xs => xs.join(' × ');
// Three factors arranged so a friendly pair (making 10, 20, 30...) sits first and last, with the other factor between them.
function arrange(r, [p, q]) { return pick([[p, r, q], [q, r, p]]); }
function threeQ(r, pair, ask) {
  const [x, y, z] = arrange(r, pair), tot = x * y * z, fr = x * z;
  return { ask, expr: join([x, y, z]), answer: num(tot), _t: { f: 'prod', xs: [x, y, z] }, hint: 'Look for two numbers that make an easy product, like 10 or 20, and multiply those first.',
    ways: [way('Group the friendly pair', [`${x} × ${z} = ${fr} is easy, and you can multiply in any order.`, `${fr} × ${y} = ${b(tot)}.`]), way('Left to right', [`${x} × ${y} = ${x * y}.`, `${x * y} × ${z} = ${b(tot)}.`])] };
}
// Side by side rectangles: a x n = a x s + a x t.
function splitQ(a, s, t) {
  const n = s + t;
  return { ask: mark('The rectangle is cut into two parts. What number is missing?', a, s, t), visual: twoRects(s, t, a), expr: `${a} × ${n} = ${a} × ${s} + ${a} × ${BLANK}`, exprSmall: true, answer: num(t), _t: { f: 'sub', a: n, b: s },
    hint: 'The two parts together are as wide as the whole rectangle.',
    ways: [way('Use the widths', [`The whole rectangle is ${n} wide and one part is ${s} wide.`, `${n} − ${s} = ${b(t)}, so the other part is ${t} wide.`]),
      way('Use the areas', [`The whole rectangle: ${a} × ${n} = ${a * n}. The first part: ${a} × ${s} = ${a * s}.`, `What is left, ${a * n} − ${a * s} = ${a * t}, is ${a} × ${b(t)}.`])] };
}
function missingFactorQ(r, pair) {
  const [x, y, z] = arrange(r, pair);
  return { ask: 'Grouping the numbers differently does not change the answer. Find the missing number.', expr: `(${x} × ${y}) × ${z} = ${x} × (${y} × ${BLANK})`, answer: num(z), _t: { f: 'third', xs: [x, y, z] }, hint: 'Both sides multiply the same three numbers.',
    ways: [way('Same three numbers', [`The left side multiplies ${x}, ${y} and ${z}.`, `The right side must multiply the same three, and ${x} and ${y} are already there, so the missing number is ${b(z)}.`]), way('Work out the left side', [`(${x} × ${y}) × ${z} = ${x * y} × ${z} = ${x * y * z}.`, `${x} × (${y} × ?) = ${x * y * z} needs ${y} × ? = ${y * z}, so ? is ${b(z)}.`])] };
}
// A correct way to split a x n: one choice splits n into two parts that add up to n, the others are the usual slips.
function chooseQ(a, n) {
  const s = n > 10 ? 10 : n > 5 ? 5 : 2, t = n - s, right = `${a} × ${s} + ${a} × ${t}`;
  const slips = [[`${a} × ${s} + ${t}`, a * s + t], [`${a} + ${s} × ${t}`, a + s * t], [`${a} × ${s} × ${t}`, a * s * t], [`${s} × ${t} + ${a}`, s * t + a]].filter(([, v]) => v !== a * n).map(([x]) => x);
  return { ask: `Which is a correct way to work out ${a} × ${n}?`, answer: choice(right, shuffle(slips)), _t: { f: 'mul', a, b: n, evalOptions: true }, hint: `${n} is ${s} and ${t} together. Each part needs all ${a} groups.`,
    ways: [way('Check that every part is multiplied', [`${n} = ${s} + ${t}, and each part must be multiplied by ${a}.`, `${a} × ${s} = ${a * s} and ${a} × ${t} = ${a * t}, together ${a * s + a * t}, which is ${a} × ${n}.`, `So ${b(right)} is the one.`]),
      way('Work out each choice', [`${a} × ${n} = ${a * n}.`, `${right} = ${a * s} + ${a * t} = ${a * n}. It matches.`, 'The other choices give different totals.'])] };
}
function truthQ(a, c, d, ok) {
  const kinds = [[`${a} × ${c} = ${c} × ${a}`, a * c, c * a], [`(${a} × ${c}) × ${d} = ${a} × (${c} × ${d})`, a * c * d, a * c * d], [`${a} × (${c} + ${d}) = ${a} × ${c} + ${a} × ${d}`, a * (c + d), a * c + a * d],
    [`${a} × (${c} + ${d}) = ${a} × ${c} + ${d}`, a * (c + d), a * c + d], [`(${a} × ${c}) × ${d} = ${a} × ${c} + ${d}`, a * c * d, a * c + d], [`${a} × ${c} = ${c} + ${a}`, a * c, c + a]];
  const fits = kinds.filter(([, l, r]) => (l === r) === ok), [expr, l, r] = fits.length ? pick(fits) : kinds[0];
  return tfQ({ expr, ok: l === r, hint: 'Work out both sides. Does every group get multiplied?', why: [`Left side: ${l}. Right side: ${r}.`, l === r ? `${l} matches ${r}, so it is ${b('true')}.` : `${l} is not ${r}, so it is ${b('false')}.`] });
}
// "Zoe splits 6 x 8 into 6 x 5 + 3" - the part that is not multiplied.
function slipQuestion(a, n) {
  const s = n > 5 ? 5 : 2, t = n - s, wrong = a * s + t;
  return { ask: `${nm()} splits ${a} × ${n} into ${a} × ${s} + ${t} and gets ${wrong}. What is the correct answer to ${a} × ${n}?`, expr: `${a} × ${n}`, answer: num(a * n), _t: { f: 'mul', a, b: n }, hint: 'The second part of the split also needs to be multiplied by every group.',
    ways: [way('Find the slip', [`${a} × ${s} = ${a * s} is right. But the other ${t} was also ${a} groups: ${a} × ${t} = ${a * t}, not just ${t}.`, `${a * s} + ${a * t} = ${b(a * n)}.`]), way('Count all the groups', [dots(a, n, { split: s }), `The array has ${a} rows of ${n}. Count it in two parts: ${a * s} and ${a * t}.`, `${a * s} + ${a * t} = ${b(a * n)}.`])] };
}
const CTX = [(x, y, z) => [`A theater has ${x} sections. Each section has ${y} rows of ${z} seats.`, 'How many seats does the theater have?', 'seats'], (x, y, z) => [`A bakery fills ${x} trays. Each tray holds ${y} rows of ${z} muffins.`, 'How many muffins is that?', 'muffins'],
  (x, y, z) => [`A shop sells ${x} boxes of cards. Each box has ${y} packs with ${z} cards in each pack.`, 'How many cards is that?', 'cards'], (x, y, z) => [`A band plays ${x} shows. Each show has ${y} songs and each song is ${z} minutes long.`, 'How many minutes do they play altogether?', 'minutes'],
  (x, y, z) => [`A gym has ${x} rooms. Each room has ${y} racks that hold ${z} weights.`, 'How many weights fit in the gym?', 'weights']];
function storyQ(r, pair) {
  const [x, y, z] = arrange(r, pair), [story, ask, suffix] = pick(CTX)(x, y, z), tot = x * y * z;
  return { story, ask, answer: num(tot), suffix, _t: { f: 'prod', xs: [x, y, z] }, hint: 'Three numbers are multiplied. Which two make an easy product?',
    ways: [way('Group the friendly pair', [`${x} × ${z} = ${x * z} is easy, and the order does not matter.`, `${x * z} × ${y} = ${b(tot)}.`]), way('One step at a time', [`${x} × ${y} = ${x * y}.`, `${x * y} × ${z} = ${b(tot)}.`])] };
}
function turnQ(a, c) {  // the third number of a trio is ignored
  return { ask: 'The order of the numbers does not change a product. What number is missing?', expr: `${a} × ${c} = ${c} × ${BLANK}`, answer: num(a), _t: { f: 'first', a, b: c }, hint: 'Turn the array on its side. Which number is the number of rows now?',
    ways: [way('Turn the array', [dots(a, c), `${a} rows of ${c} turned on its side is ${c} rows of ${a}.`, `So the missing number is ${b(a)}.`]), way('Work out both', [`${a} × ${c} = ${a * c}.`, `${c} × ? = ${a * c} when ? is ${b(a)}.`])] };
}
function splitCalcQ(a, n) {
  const t = n % 10, p = a * 10, bits = [5, 2].filter(v => a > v)[0] ?? 1, rest = a - bits;
  return { ask: `Split ${n} into 10 and ${t} to work out ${a} × ${n}.`, expr: `${a} × ${n}`, answer: num(a * n), _t: { f: 'mul', a, b: n }, hint: `${a} × ${n} is ${a} × 10 plus ${a} × ${t}.`,
    ways: [way('Split the second number', [`${a} × 10 = ${p} and ${a} × ${t} = ${a * t}.`, `${p} + ${a * t} = ${b(a * n)}.`]), way('Split the first number', [`${a} = ${bits} + ${rest}, so ${a} × ${n} is ${bits} × ${n} plus ${rest} × ${n}.`, `${bits * n} + ${rest * n} = ${b(a * n)}.`])] };
}
const trio = (lo, hi) => { const v = [rnd(lo, hi), rnd(lo, hi), rnd(lo, hi)]; return new Set(v).size === 3 ? v : trio(lo, hi); };
const isPair = () => pick(PAIRS), isBig = () => pick(BIG);
export function genProps(L) {
  const r = L === 1 ? rnd(2, 9) : L === 2 ? rnd(3, 9) : rnd(6, 12);
  const pool = L === 1 ? [() => threeQ(r, [2, 5], 'Multiply. Make a friendly pair first.'), () => turnQ(...trio(3, 9)), () => splitQ(rnd(3, 6), 5, rnd(2, 4)), () => storyQ(r, [2, 5]), () => truthQ(...trio(2, 6), true)]
    : L === 2 ? [() => threeQ(r, isPair(), 'Group two numbers that make an easy product, then multiply.'), () => missingFactorQ(r, isPair()), () => splitQ(rnd(3, 9), pick([5, 10]), rnd(2, 4)), () => chooseQ(rnd(3, 9), rnd(6, 9)), () => truthQ(...trio(2, 9), pick([true, false])), () => storyQ(r, isPair()), () => slipQuestion(rnd(3, 9), rnd(6, 9))]
      : [() => threeQ(r, isBig(), 'Work this out by grouping. Which two numbers go together?'), () => splitCalcQ(rnd(3, 9), rnd(12, 19)), () => chooseQ(rnd(3, 9), rnd(12, 19)), () => truthQ(...trio(3, 9), pick([true, false])), () => slipQuestion(rnd(6, 9), rnd(7, 9)), () => storyQ(r, isBig()), () => missingFactorQ(r, isBig())];
  return pick(pool)();
}
