// Square roots and cube roots: exact for perfect squares and cubes, estimated between whole numbers for the rest.
import { rnd, pick, chance, b, way, pow, F, fmt, num, frac, choice, numberLine } from '../../util.js';
import { sqrt, cbrt, blank, fixedChoice, count } from './h.js';
import { tiles } from './shapes.js';

const sq = n => n * n, cu = n => n * n * n;
const nearSquares = n => [n - 1, n, n + 1].filter(v => v >= 1).map(v => `${v} × ${v} = ${fmt(sq(v))}`).join(', ');
function exactSquare(n, form) {
  const N = sq(n), _t = { k: 'root', deg: 2, N, ask: 'exact' };
  const ways = [way('Think of a square', [...(n <= 10 ? [tiles(n)] : []), `A square with area ${fmt(N)} has the same number of rows as tiles in each row.`, `${count(n, 'row')} of ${n} make ${fmt(N)}, so the side is ${b(n)}.`]),
    way('Try some squares', [`Look for a number that times itself makes ${fmt(N)}: ${nearSquares(n)}.`, `${n} × ${n} = ${fmt(N)}, so ${sqrt(fmt(N))} = ${b(n)}.`])];
  const hint = `Which number times itself makes ${fmt(N)}?`;
  if (form === 'area') return { ask: `A square patio has an area of ${fmt(N)} square meters. How long is one side?`, answer: num(n), suffix: 'm', ways, hint, _t };
  if (form === 'eq') return { ask: `${pow('x', 2)} = ${fmt(N)}. What positive number is x?`, answer: num(n), ways, hint, _t };
  return { ask: 'Find the square root.', expr: `${sqrt(fmt(N))} = ${blank}`, answer: num(n), ways, hint, _t };
}
function exactCube(n, form) {
  const N = cu(n), _t = { k: 'root', deg: 3, N, ask: 'exact' };
  const ways = [way('Think of a cube', [`A cube with volume ${fmt(N)} has the same length, width and height.`, `${n} × ${n} × ${n} = ${sq(n)} × ${n} = ${fmt(N)}, so each edge is ${b(n)}.`]),
    way('Try some cubes', [[n - 1, n, n + 1].filter(v => v >= 1).map(v => `${pow(v, 3)} = ${fmt(cu(v))}`).join(', ') + '.', `${pow(n, 3)} = ${fmt(N)}, so ${cbrt(fmt(N))} = ${b(n)}.`])];
  const hint = `Which number, used as a factor three times, makes ${fmt(N)}?`;
  if (form === 'vol') return { ask: `A cube-shaped box has a volume of ${fmt(N)} cubic centimeters. How long is one edge?`, answer: num(n), suffix: 'cm', ways, hint, _t };
  if (form === 'neg') return { ask: `${pow('x', 3)} = ${fmt(-N)}. What is x?`, answer: num(-n, { signed: true }), hint: 'Three negatives multiplied give a negative.', _t: { ..._t, N: -N },
    ways: [way('Think about signs', [`${n} × ${n} × ${n} = ${fmt(N)}, which is positive, so x is not ${n}.`, `(${fmt(-n)}) × (${fmt(-n)}) = ${sq(n)}, and ${sq(n)} × (${fmt(-n)}) = ${fmt(-N)}.`, `So x = ${b(fmt(-n))}.`]),
      way('Why this works for cubes', ['A square can never be negative, but a cube can: three negative factors leave one minus sign over.', `${cbrt(fmt(-N))} = ${b(fmt(-n))}.`])] };
  return { ask: 'Find the cube root.', expr: `${cbrt(fmt(N))} = ${blank}`, answer: num(n), ways, hint, _t };
}
// A whole number N that is not a perfect power, with floor(root) = n.
function between(deg) {
  const n = deg === 2 ? rnd(1, 12) : rnd(1, 5), f = deg === 2 ? sq : cu;
  return { n, N: rnd(f(n) + 1, f(n + 1) - 1), f, sym: deg === 2 ? sqrt : cbrt };
}
const line = (n, N, deg, sym) => numberLine(n, n + 1, deg === 2 ? Math.sqrt(N) : Math.cbrt(N), { loL: n, hiL: n + 1, xL: sym(N) });
function squeeze(deg) {
  const { n, N, f, sym } = between(deg), pair = (a, c) => `${a} and ${c}`, half = Math.floor(N / deg);
  return { ask: `${sym(N)} is between which two whole numbers?`, answer: choice(pair(n, n + 1), [pair(n + 1, n + 2), pair(Math.max(n - 1, 0), n), pair(half, half + 1), pair(n + 2, n + 3)]), hint: `Which perfect ${deg === 2 ? 'squares' : 'cubes'} are just below and just above ${N}?`, _t: { k: 'root', deg, N, ask: 'between' },
    ways: [way(`Trap it between perfect ${deg === 2 ? 'squares' : 'cubes'}`, [`${pow(n, deg)} = ${fmt(f(n))} and ${pow(n + 1, deg)} = ${fmt(f(n + 1))}.`, `${N} is between ${fmt(f(n))} and ${fmt(f(n + 1))}, so ${sym(N)} is between ${b(pair(n, n + 1))}.`]),
      way('See it on a number line', [line(n, N, deg, sym), `${sym(fmt(f(n)))} = ${n} and ${sym(fmt(f(n + 1)))} = ${n + 1}. ${sym(N)} has to sit between them.`])] };
}
function nearest() {
  const { n, N } = between(2), near = N <= sq(n) + n ? n : n + 1, mid = sq(n) + n;
  return { ask: `Which whole number is ${sqrt(N)} closest to?`, answer: num(near), hint: `Find the two perfect squares around ${N}, then see which one ${N} is nearer to.`, _t: { k: 'root', deg: 2, N, ask: 'nearest' },
    ways: [way('Trap it, then compare the gaps', [`${pow(n, 2)} = ${sq(n)} and ${pow(n + 1, 2)} = ${sq(n + 1)}, so ${sqrt(N)} is between ${n} and ${n + 1}.`, `${N} is ${N - sq(n)} above ${sq(n)} and ${sq(n + 1) - N} below ${sq(n + 1)}.`, `It is nearer to ${sq(near)}, so ${sqrt(N)} is closest to ${b(near)}.`]),
      way('Test the halfway number', [`Halfway between ${n} and ${n + 1} is ${n}.5, and ${n}.5 × ${n}.5 = ${fmt(mid + 0.25)}.`, `${N} is ${N > mid ? 'more' : 'less'} than ${fmt(mid + 0.25)}, so ${sqrt(N)} is ${N > mid ? 'above' : 'below'} ${n}.5.`, `That rounds to ${b(near)}.`])] };
}
function compare() {
  const { n, N } = between(2), k = chance(0.5) ? n : n + 1, big = k === n ? sqrt(N) : String(k);
  return { ask: 'Which is greater?', answer: fixedChoice(big, [sqrt(N), String(k), 'They are equal']), hint: `Write ${k} as a square root: ${k} = ${sqrt(sq(k))}.`, _t: { k: 'root', deg: 2, N, ask: 'cmp', with: k },
    ways: [way('Make them both square roots', [`${k} = ${sqrt(sq(k))}, because ${k} × ${k} = ${sq(k)}.`, `Now compare what is under the root sign: ${N} and ${sq(k)}.`, `${Math.max(N, sq(k))} is bigger, so ${b(big)} is greater.`]),
      way('Square both', [`${sqrt(N)} squared is ${N}. ${k} squared is ${sq(k)}.`, `For positive numbers, the bigger square belongs to the bigger number: ${b(big)}.`])] };
}
function bothSigns() {
  const n = rnd(2, 12), N = sq(n), right = `${n} and ${fmt(-n)}`;
  return { ask: `Which shows every solution of ${pow('x', 2)} = ${N}?`, answer: choice(right, [`${n} only`, `${N / 2} and ${fmt(-N / 2)}`, `${fmt(-n)} only`]), hint: 'What happens when you multiply a negative number by itself?', _t: { k: 'root', deg: 2, N, ask: 'both' },
    ways: [way('Test both signs', [`${n} × ${n} = ${N}. That works.`, `(${fmt(-n)}) × (${fmt(-n)}) = ${N} too, because a negative times a negative is positive.`, `So there are two solutions: ${b(right)}.`]),
      way('Rule out halving', [`Squaring is not doubling, so undoing it is not halving: ${N / 2} × ${N / 2} = ${fmt(sq(N / 2))}, not ${N}.`, `The sign ${sqrt(N)} means only the positive root, ${n}. The equation asks for every number that works.`])] };
}
function fracRoot() {
  const a = rnd(1, 9), c = rnd(a + 1, 12);
  return { ask: 'Find the square root. Write it as a fraction.', expr: `√${F(sq(a), sq(c))} = ${blank}`, answer: frac(a, c), hint: 'Take the root of the top and the root of the bottom.', _t: { k: 'rootfrac', a: sq(a), c: sq(c) },
    ways: [way('Top and bottom separately', [`${sqrt(sq(a))} = ${a} and ${sqrt(sq(c))} = ${c}.`, `So the root is ${b(F(a, c))}.`]),
      way('Check by squaring', [`${F(a, c)} × ${F(a, c)} = ${F(`${a} × ${a}`, `${c} × ${c}`)} = ${F(sq(a), sq(c))}.`, 'It matches.'])] };
}
export function genRoots(L) {
  if (L === 1) return exactSquare(rnd(1, 12), pick(['plain', 'plain', 'area', 'eq']));
  if (L === 2) {
    const t = rnd(0, 3);
    if (t === 0) return exactCube(pick([1, 2, 3, 4, 5, 6, 10]), pick(['plain', 'plain', 'vol']));
    if (t === 1) return exactSquare(pick([13, 14, 15, 16, 20, 25, 30, 40, 50]), pick(['plain', 'area', 'eq']));
    return squeeze(2);
  }
  return pick([nearest, nearest, () => squeeze(3), compare, bothSigns, fracRoot, () => exactCube(rnd(2, 6), 'neg')])();
}
