// Comparing fractions: same-size pieces, the one-half benchmark, then a common denominator.
import { rnd, pick, chance, shuffle, lcm, F, b, k, way, nm, choice } from '../../util.js';
import { BLANK, signChoice, signOf, signWord, sg, oneOf, listed } from './helpers.js';
import { properTop, bar, dth } from './frac-util.js';

const diff = (a, c) => a[0] * c[1] - c[0] * a[1];
const f = a => F(a[0], a[1]);

function commonWay(a, c) {
  const L = lcm(a[1], c[1]), A = a[0] * L / a[1], C = c[0] * L / c[1], s = signOf(A - C);
  const re = ([n, d], N) => (d === L ? `${F(n, d)} already has ${L} on the bottom.` : `${F(n, d)} = ${F(N, L)} (top and bottom × ${L / d})`);
  return way('Common denominator', [`Pieces can only be compared fairly when they are the same size. Both ${a[1]} and ${c[1]} go into ${b(L)}.`, re(a, A), re(c, C),
    `Now the pieces match, so compare the tops: ${A} ${sg(s)} ${C}. That means ${f(a)} ${b(sg(s))} ${f(c)}.`]);
}
function barsWay(a, c) {
  const s = signOf(diff(a, c));
  return way('Picture it', ['Both bars are the same whole. See how far the shading reaches.', bar(...a), bar(...c),
    s === '=' ? `The shading reaches the same place, so ${f(a)} ${b('=')} ${f(c)}.` : `The shading for ${s === '>' ? f(a) : f(c)} reaches further, so ${f(a)} ${b(sg(s))} ${f(c)}.`]);
}
const half = ([n, d]) => (2 * n === d ? 'exactly' : 2 * n > d ? 'more than' : 'less than');
function halfWay(a, c) {
  const line = ([n, d]) => `Half of ${d} is ${d / 2}. ${n} is ${half([n, d])} that, so ${F(n, d)} is ${half([n, d])} ${F(1, 2)}.`;
  const s = signOf(diff(a, c)), steps = c[1] === 2 && c[0] === 1 ? [line(a)] : [line(a), line(c)];
  return way('Use one half', [...steps, `So ${f(a)} ${b(sg(s))} ${f(c)}.`]);
}
function problem(a, c, ways, hint) {
  return { ask: 'Which sign makes it true?', expr: `${f(a)} ${BLANK} ${f(c)}`, answer: signChoice(diff(a, c)), choiceBig: true, _t: { kind: 'fcmp', a, c }, ways, hint };
}

function sameBottom() {
  const d = rnd(3, 12), n1 = rnd(1, d - 1), n2 = rnd(1, d - 1), a = [n1, d], c = [n2, d];
  if (n1 === n2) return null;
  return problem(a, c, [way('Same size pieces', [`Both fractions are cut into ${dth(d)}, so every piece is the same size.`, `${n1} against ${n2}: more pieces is more.`, `${f(a)} ${b(sg(signOf(n1 - n2)))} ${f(c)}`]), barsWay(a, c)],
    'The bottoms match, so the pieces are the same size. Which has more pieces?');
}
function sameTop() {
  const d1 = rnd(3, 12), d2 = rnd(3, 12), n = rnd(1, Math.min(d1, d2, 6) - 1), a = [n, d1], c = [n, d2];
  if (d1 === d2) return null;
  const big = Math.min(d1, d2), small = Math.max(d1, d2);
  return problem(a, c, [way('Same number of pieces', [`Both have ${n} piece${n > 1 ? 's' : ''}, but the pieces are different sizes.`,
    `Cutting a whole into ${small} parts makes smaller pieces than cutting it into ${big}. So ${F(1, big)} is bigger than ${F(1, small)}.`, `${n} of the bigger pieces is more: ${f(a)} ${b(sg(signOf(d2 - d1)))} ${f(c)}`]), barsWay(a, c), commonWay(a, c)],
  'The tops match. Which fraction has the bigger pieces?');
}
function againstHalf() {
  const d = rnd(3, 12), n = rnd(1, d - 1), a = [n, d], c = [1, 2];
  return problem(a, c, [halfWay(a, c), barsWay(a, c), commonWay(a, c)], `What is half of ${d}? Is the top more or less than that?`);
}
function benchmark() {
  const d1 = rnd(3, 12), d2 = rnd(3, 12), lo = [rnd(1, Math.ceil(d1 / 2) - 1), d1], hi = [rnd(Math.floor(d2 / 2) + 1, d2 - 1), d2];
  if (d1 === d2 || lcm(d1, d2) > 72) return null;
  const [a, c] = shuffle([lo, hi]);
  return problem(a, c, [halfWay(a, c), commonWay(a, c), barsWay(a, c)], 'Compare each fraction with one half first.');
}
function multipleBottoms() {
  const d1 = rnd(2, 6), kk = rnd(2, 4), d2 = d1 * kk, n1 = properTop(d1), same = chance(0.15), n2 = same ? n1 * kk : rnd(1, d2 - 1);
  const [a, c] = shuffle([[n1, d1], [n2, d2]]);
  return problem(a, c, [commonWay(a, c), barsWay(a, c)], `${d1} goes into ${d2}. Rename the fraction with ${d1} on the bottom so both have ${d2}.`);
}
function nearOneWay(a, c) {
  const s = signOf(diff(a, c));
  return way('How far from 1?', [`${f(a)} is ${F(1, a[1])} short of 1 whole. ${f(c)} is ${F(1, c[1])} short of 1 whole.`,
    `${F(1, Math.max(a[1], c[1]))} is the smaller piece, so ${F(Math.max(a[1], c[1]) - 1, Math.max(a[1], c[1]))} is closer to 1.`, `${f(a)} ${b(sg(s))} ${f(c)}`]);
}
function unlike() {
  const d1 = rnd(3, 12), d2 = rnd(3, 12), near = chance(0.25), a = [near ? d1 - 1 : properTop(d1), d1], c = [near ? d2 - 1 : properTop(d2), d2];
  if (d1 % d2 === 0 || d2 % d1 === 0 || lcm(d1, d2) > 72) return null;
  const ways = [commonWay(a, c), ...(near ? [nearOneWay(a, c)] : []), barsWay(a, c)];
  return problem(a, c, ways, 'Find a number both bottoms go into, and rename both fractions.');
}

const FAMILY = [[2, 3, 4, 6, 12], [2, 4, 8], [2, 5, 10], [3, 4, 6, 12], [2, 3, 6, 9]];
function extreme() {
  const ds = shuffle(pick(FAMILY)).slice(0, 3), list = ds.map(d => [properTop(d), d]), L = ds.reduce(lcm), which = pick(['greatest', 'least']);
  const val = x => x[0] * L / x[1], sorted = list.slice().sort((x, y) => val(y) - val(x)), best = which === 'greatest' ? sorted[0] : sorted[2];
  if (new Set(list.map(val)).size < 3) return null;
  const answer = choice(f(best), list.filter(x => x !== best).map(f));
  return { ask: `Which fraction is the ${which}: ${listed(answer)}?`, answer, _t: { kind: 'fextreme', which }, hint: 'Rename all three with the same bottom number.',
    ways: [way('Common denominator', [`All three bottoms go into ${b(L)}.`, ...list.map(x => `${f(x)} = ${F(val(x), L)}`), `Compare the tops. The ${which} is ${b(f(best))}.`]),
      way('Picture it', ['All three bars are the same whole. See how far the shading reaches.', ...list.map(x => bar(...x)), `The ${which === 'greatest' ? 'longest' : 'shortest'} shading belongs to ${b(f(best))}.`])] };
}
const TALES = [['are reading the same book', 'has read', 'of it', 'Who has read more?'], ['are running the same trail', 'has run', 'of it', 'Who has run further?'],
  ['are playing the same game', 'has finished', 'of it', 'Who has finished more?'], ['are each saving up for the same phone', 'has saved', 'of the price', 'Who has saved more?']];
export function compareWord() {
  const p = unlike();
  if (!p) return null;
  const { a, c } = p._t, [n1, n2] = shuffle(['Ava', 'Leo', 'Maya', 'Sam', 'Zoe', 'Eli', 'Nora', 'Jay']).slice(0, 2), [intro, verb, of, ask] = pick(TALES), s = signOf(diff(a, c));
  const winner = s === '>' ? n1 : n2;
  return { story: `${n1} and ${n2} ${intro}. ${n1} ${verb} ${k(f(a))} ${of}. ${n2} ${verb} ${k(f(c))} ${of}.`, ask, answer: choice(winner, [], { all: [n1, n2] }), choiceBig: true, _t: { kind: 'fwho', a, c },
    ways: p.ways.map(w => ({ ...w, s: [...w.s, `${f(a)} ${signWord(s)} ${f(c)}, so the answer is ${b(winner)}.`] })), hint: 'The bottoms are different, so the pieces are different sizes. Make them match first.',
    read: { find: 'Which of the two fractions is bigger.', know: [`${n1}: ${f(a)}`, `${n2}: ${f(c)}`], clue: '“Who has … more” asks you to compare two amounts. Nothing is added or taken away.', plan: `Compare ${f(a)} and ${f(c)} using a common denominator` } };
}

const MAKERS = [[sameBottom, sameTop, againstHalf, againstHalf], [multipleBottoms, multipleBottoms, benchmark, benchmark, sameTop, againstHalf], [unlike, unlike, unlike, extreme, extreme, compareWord, benchmark]];
export const genCompare = L => oneOf(MAKERS[L - 1], L);
