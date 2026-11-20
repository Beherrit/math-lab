// Mixed numbers and improper fractions: the same amount written two ways.
import { rnd, pick, F, M, b, k, way, nm, num, choice, fracBar } from '../../util.js';
import { BLANK, signChoice, signOf, sg, oneOf } from './helpers.js';
import { dth } from './frac-util.js';

const SIZE = [{ d: [2, 6], w: [1, 3] }, { d: [2, 10], w: [1, 9] }, { d: [3, 12], w: [2, 12] }];
// [wholes, extra pieces, bottom, all pieces]
function parts(L) { const s = SIZE[L - 1], d = rnd(...s.d), w = rnd(...s.w), n = rnd(1, d - 1); return [w, n, d, w * d + n]; }
const picture = (N, d) => (N <= 5 * d && d <= 10 ? [fracBar(N, d)] : []);

// tail is the last line of every way: it says what the question asked for.
function toMixedWays(N, d, tail) {
  const w = Math.floor(N / d), r = N % d, pic = picture(N, d), takes = [];
  for (let left = N; left >= d && takes.length < 5; left -= d) takes.push(`${left} − ${d} = ${left - d}`);
  const ways = [way('Divide', [`Every ${d} ${dth(d)} make 1 whole. How many groups of ${d} are in ${N}?`, `${N} ÷ ${d} = ${w} with ${r} left over.`, `That is ${w} whole${w > 1 ? 's' : ''}, with ${r} of the ${dth(d)} left over: ${F(N, d)} = ${b(M(w, r, d))}`])];
  if (pic.length) ways.unshift(way('Fill whole bars', [`Each bar is 1 whole cut into ${dth(d)}. Shade ${N} of them.`, ...pic, `${w} bar${w > 1 ? 's are' : ' is'} full, and ${r} more ${r > 1 ? 'pieces are' : 'piece is'} shaded: ${b(M(w, r, d))}`]));
  else if (w <= 5) ways.push(way('Take out one whole at a time', [`Each whole uses up ${d} pieces.`, ...takes, `You took out ${w} whole${w > 1 ? 's' : ''} and ${r} piece${r > 1 ? 's are' : ' is'} left: ${b(M(w, r, d))}`]));
  else ways.push(way('Check by building it back', [`${w} wholes are ${w} × ${d} = ${w * d} ${dth(d)}.`, `${w * d} + ${r} = ${N}, which matches ${F(N, d)}.`]));
  return tail ? ways.map(x => ({ ...x, s: [...x.s, tail] })) : ways;
}
function toImproperWays(w, n, d) {
  const N = w * d + n;
  return [way('Count the pieces', [...picture(N, d), `Each whole is ${d} ${dth(d)}, so ${w} whole${w > 1 ? 's are' : ' is'} ${w} × ${d} = ${w * d} ${dth(d)}.`, `Add the ${n} extra: ${w * d} + ${n} = ${N} ${dth(d)}.`, `${M(w, n, d)} = ${b(F(N, d))}`]),
    way('Write the wholes as a fraction', [`1 whole = ${F(d, d)}, so ${w} = ${F(w * d, d)}.`, `${F(w * d, d)} + ${F(n, d)} = ${b(F(N, d))}`])];
}

function wholes(L) {
  const [w, , d, N] = parts(L);
  return { ask: `How many whole ones are in ${F(N, d)}?`, visual: L === 1 ? fracBar(N, d) : undefined, answer: num(w), _t: { kind: 'wholes', n: N, d }, ways: toMixedWays(N, d, `The number of whole ones is ${b(w)}.`), hint: `It takes ${d} ${dth(d)} to make a whole.` };
}
function leftover(L) {
  const [w, n, d, N] = parts(L);
  return { ask: 'Write the fraction as a mixed number. Find the missing top number.', expr: `${F(N, d)} = ${M(w, BLANK, d)}`, answer: num(n), _t: { kind: 'left', n: N, d }, ways: toMixedWays(N, d, `The missing top number is ${b(n)}.`),
    hint: `${w} whole${w > 1 ? 's use' : ' uses'} up ${w} × ${d} pieces. How many are left?` };
}
function toImproper(L) {
  const [w, n, d, N] = parts(L);
  return { ask: 'Write the mixed number as one fraction. Find the missing top number.', expr: `${M(w, n, d)} = ${F(BLANK, d)}`, visual: L === 1 ? fracBar(N, d) : undefined, answer: num(N),
    _t: { kind: 'toimp', w, n, d }, ways: toImproperWays(w, n, d), hint: `How many ${dth(d)} are in ${w} whole${w > 1 ? 's' : ''}? Then add the extra ones.` };
}
// Wrong choices are [wholes, top] pairs built from real slips; anything equal to the right amount is thrown out.
function whichMixed(L) {
  const [w, n, d, N] = parts(L);
  const slips = [[n, w], [w + 1, n], [Math.floor(N / 10), N % 10], [w, n === d - 1 ? n - 1 : n + 1], [w - 1, n]].filter(([x, y]) => x > 0 && y > 0 && x * d + y !== N);
  const bad = [...new Set(slips.map(([x, y]) => M(x, y, d)))].slice(0, 3);
  if (bad.length < 3) return null;
  return { ask: `Which mixed number is equal to ${F(N, d)}?`, answer: choice(M(w, n, d), bad), _t: { kind: 'whichmixed', n: N, d }, ways: toMixedWays(N, d, `So ${F(N, d)} = ${b(M(w, n, d))}.`), hint: `How many full groups of ${d} fit in ${N}? What is left?` };
}
function whichImproper(L) {
  const [w, n, d, N] = parts(L), tops = [...new Set([w + n, w * n, w * n + d, w * d, N + d])].filter(x => x !== N).slice(0, 3);
  if (tops.length < 3) return null;
  return { ask: `Which fraction is equal to ${M(w, n, d)}?`, answer: choice(F(N, d), tops.map(x => F(x, d))), _t: { kind: 'whichimp', w, n, d }, ways: toImproperWays(w, n, d),
    hint: `Each whole is ${d} ${dth(d)}. Multiply the wholes by ${d}, then add the top.` };
}
function between(L) {
  const [w, , d, N] = parts(L), all = [w - 1, w, w + 1].map(x => `${x} and ${x + 1}`);
  return { ask: `${F(N, d)} is between which two whole numbers?`, answer: choice(all[1], [], { all }), _t: { kind: 'between', n: N, d }, ways: toMixedWays(N, d, `So ${F(N, d)} is between ${b(w)} and ${b(w + 1)}.`), hint: 'Turn it into a mixed number first. The whole-number part tells you where it sits.' };
}
function compare(L) {
  const [w, n, d, N] = parts(L), X = N + pick([-2, -1, 0, 0, 1, 2]), s = signOf(N - X);
  return { ask: 'Which sign makes it true?', expr: `${M(w, n, d)} ${BLANK} ${F(X, d)}`, answer: signChoice(N - X), choiceBig: true, _t: { kind: 'mcmp', w, n, d, x: X }, hint: 'Write both the same way first: both as fractions, or both as mixed numbers.',
    ways: [way('Make both into fractions', [`${M(w, n, d)}: ${w} × ${d} + ${n} = ${N}, so it is ${F(N, d)}.`, `Same size pieces, so compare the tops: ${N} ${sg(s)} ${X}.`, `${M(w, n, d)} ${b(sg(s))} ${F(X, d)}`]),
      way('Make both into mixed numbers', [`${F(X, d)}: ${X} ÷ ${d} = ${Math.floor(X / d)} with ${X % d} left over, so it is ${X % d ? M(Math.floor(X / d), X % d, d) : X / d}.`,
        `Compare the wholes first, then the extra pieces. ${M(w, n, d)} ${b(sg(s))} ${F(X, d)}`])] };
}

const CTX = [
  [[4, 6, 8], (N, d) => [`A cafe cuts each pizza into ${k(d + ' equal slices')}. Today it sold ${k(N + ' slices')}.`, 'How many complete pizzas is that?', [`${d} slices make one pizza`, `${N} slices sold`], `Every ${d} slices make 1 whole pizza.`]],
  [[2, 4, 5, 8], (N, d, n) => [`One lap of the track is ${k(F(1, d) + ' mile')}. ${n} ran ${k(N + ' laps')}.`, `How many full miles did ${n} finish?`, [`each lap is ${F(1, d)} mile`, `${N} laps`], `Every ${d} laps make 1 whole mile.`]],
  [[2, 3, 4], (N, d, n) => [`A drum lesson lasts ${k(F(1, d) + ' hour')}. This term ${n} had ${k(N + ' lessons')}.`, 'How many full hours of lessons is that?', [`each lesson is ${F(1, d)} hour`, `${N} lessons`], `Every ${d} lessons make 1 whole hour.`]],
];
export function mixedWord() {
  const [ds, mk] = pick(CTX), d = pick(ds), w = rnd(2, 9), N = w * d + rnd(1, d - 1), [story, ask, know, clue] = mk(N, d, nm());
  return { story, ask, answer: num(w), op: 'div', _t: { kind: 'wholes', n: N, d }, ways: toMixedWays(N, d, `The question asks only for the complete ones, so the answer is ${b(w)}.`), hint: `How many groups of ${d} are in ${N}?`,
    read: { find: 'Only the complete wholes. The extra pieces do not count.', know, clue: clue + ' Finding how many groups fit is dividing.', plan: `${N} ÷ ${d}, keep the whole-number part` } };
}

const MAKERS = [[wholes, wholes, toImproper, toImproper], [leftover, leftover, toImproper, whichMixed, wholes], [whichMixed, whichImproper, between, compare, compare, toImproper, mixedWord]];
export const genMixed = L => oneOf(MAKERS[L - 1], L);
