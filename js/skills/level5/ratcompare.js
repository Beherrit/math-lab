// Rational numbers: comparing, ordering and finding numbers between others, then the whole skill's step mix.
import { R, rnd, pick, chance, shuffle, fmt, b, k, way, choice } from '../../util.js';
import { T, sg, sorted } from './helpers.js';
import { ratLine } from './draw.js';
import { frItem, decItem, html, text, readDecimal, readFraction, placeLetter, toZero, zeroMeaning, opposite, nested } from './rational.js';

const BLANK = '<span class="blank">?</span>';
const list = xs => xs.map(text).join(', ');
// Two different values to compare: step 1 decimals, step 2 a fraction and a decimal, step 3 values that are very close.
function pairFor(L) {
  if (L === 1) { const a = rnd(-8, 8) / 2, c = rnd(-8, 8) / 2; return a === c || Math.min(a, c) >= 0 ? pairFor(L) : [decItem(a), decItem(c)]; }
  const n = rnd(1, L === 2 ? 7 : 9) * -1, d = pick(L === 2 ? [2, 4, 5] : [4, 5, 8]), f = frItem(n, d);
  const x = R(f.v + (L === 2 ? pick([-0.3, -0.2, 0.2, 0.3, 0.4, -0.4]) : pick([-0.05, 0.05, -0.03, 0.04, -0.07])));
  if (Math.abs(f.v) < 0.2 || Number.isInteger(f.v) || x === f.v || x === 0) return pairFor(L);
  return chance(0.5) ? [f, decItem(x)] : [decItem(x), f];
}
function compare(L) {
  const [a, c] = pairFor(L), sym = a.v < c.v ? '<' : '>', lo = a.v < c.v ? a : c, hi = a.v < c.v ? c : a, dec = it => (it.d ? `${text(it)} = ${fmt(it.v)}` : fmt(it.v)), m = Math.ceil(Math.max(Math.abs(a.v), Math.abs(c.v))) + 1;
  return T({ ask: 'Which sign makes this true?', expr: `${html(a)} ${BLANK} ${html(c)}`, answer: choice(sg(sym), [], { all: ['<', '>'].map(sg) }), choiceBig: true,
    ways: [way('Same form, then compare', [`Change both to decimals: ${dec(a)} and ${dec(c)}.`, `Between two negatives, the one further from 0 is smaller. ${fmt(lo.v)} is further left than ${fmt(hi.v)}.`, `${text(a)} ${b(sg(sym))} ${text(c)}`]),
      way('Number line', [ratLine(-m, m, { step: 0.5, points: [{ v: lo.v, label: 'a' }, { v: hi.v, label: 'b' }] }), `Point a is ${text(lo)} and point b is ${text(hi)}. Left means smaller, so ${text(lo)} ${sg('<')} ${text(hi)}.`, `The sign for ${text(a)} and ${text(c)} is ${b(sg(sym))}.`])],
    hint: 'Write both numbers the same way, as decimals. Then picture them on a number line: which is further left?' }, 'rnCompare', { xs: [a.v, c.v], fr: [!!a.d, !!c.d] });
}
// A number between two whole numbers: the wrong choices sit just outside them.
function between(L) {
  const lo = -rnd(2, 6), hi = lo + 1, asFrac = L === 3, step = asFrac ? pick([1, 3]) / 4 : pick([0.5, 0.25, 0.75, 0.4, 0.6]), good = R(lo + step);
  const item = v => (asFrac ? frItem(Math.round(v * 4), 4) : decItem(v)), wrong = [R(lo - 0.5), R(hi + 0.5), R(lo - step), R(hi + step)];
  return T({ ask: `Which number is between ${b(fmt(lo))} and ${b(fmt(hi))}?`, answer: choice(text(item(good)), wrong.map(v => text(item(v)))), choiceBig: true,
    ways: [way('Number line', [ratLine(lo - 1, hi + 1, { step: 0.5 }), `${fmt(lo)} and ${fmt(hi)} are neighbours. A number between them is to the right of ${fmt(lo)} and to the left of ${fmt(hi)}.`, `${fmt(lo)} ${sg('<')} ${text(item(good))} ${sg('<')} ${fmt(hi)}, so the answer is ${b(text(item(good)))}.`]),
      way('Check each choice', [`The number must be bigger than ${fmt(lo)} and smaller than ${fmt(hi)}.`, `The other choices are either left of ${fmt(lo)} or right of ${fmt(hi)}, so they are not between.`, `Only ${b(text(item(good)))} fits.`])],
    hint: 'Between means bigger than the first number and smaller than the second. Picture the gap on the number line.' }, 'rnBetween', { lo, hi });
}
function order() {
  const grid = []; for (let v = -2; v <= 1; v = R(v + 0.25)) grid.push(v);
  const xs = shuffle(grid).slice(0, 4), items = xs.map(v => (!Number.isInteger(v) && chance(0.5) ? frItem(Math.round(v * 4), 4) : decItem(v)));
  if (items.filter(i => i.v < 0).length < 2) return order();
  const asc = sorted(xs).map(v => items.find(i => i.v === v)), byAbs = items.slice().sort((p, q) => Math.abs(p.v) - Math.abs(q.v)), swap = asc.slice(); [swap[0], swap[1]] = [swap[1], swap[0]];
  return T({ ask: `Put these in order from ${b('least to greatest')}: ${items.map(html).join(', ')}`, answer: choice(list(asc), [list(asc.slice().reverse()), list(byAbs), list(swap)]), choiceBig: true,
    ways: [way('Decimals on a line', [`Change every number to a decimal: ${items.map(i => fmt(i.v)).join(', ')}.`, `Negatives come first, and the one furthest from 0 is the least. In order: ${b(list(asc))}.`]),
      way('Negatives, zero, positives', [`Sort into two piles. Negatives: ${list(asc.filter(i => i.v < 0)) || 'none'}. Not negative: ${list(asc.filter(i => i.v >= 0)) || 'none'}.`, `Every negative is less than every number that is not negative. Among negatives, further from 0 means smaller.`, `Least to greatest: ${b(list(asc))}`])],
    hint: 'Turn every number into a decimal first. Negatives are less than positives, and a negative further from 0 is smaller.' }, 'rnOrder', { xs, fr: items.map(i => !!i.d) });
}
const CMP = [
  { low: true, s: (a, c) => `At dawn the temperature in one town was ${k(fmt(a) + '°C')} and in another it was ${k(fmt(c) + '°C')}.`, ask: 'Which temperature is colder?' },
  { low: true, s: (a, c) => `Two divers are at ${k(fmt(a) + ' meters')} and ${k(fmt(c) + ' meters')} compared with the water surface.`, ask: 'Which diver is deeper?' },
  { low: true, s: (a, c) => `Two game accounts show ${k(fmt(a) + ' coins')} and ${k(fmt(c) + ' coins')}.`, ask: 'Which account owes more?' },
  { low: false, s: (a, c) => `Two caves are at ${k(fmt(a) + ' meters')} and ${k(fmt(c) + ' meters')} compared with sea level.`, ask: 'Which cave is higher up?' },
];
function storyCompare(L) {
  const w = rnd(1, 9), [p, q] = L === 2 ? pick([[0.5, 0.25], [0.75, 0.5], [0.25, 0.75], [0.5, 0.75]]) : pick([[0.6, 0.55], [0.4, 0.45], [0.3, 0.35], [0.75, 0.7]]), a = -R(w + p), c = -R(w + q), cx = pick(CMP), win = cx.low ? Math.min(a, c) : Math.max(a, c), other = win === a ? c : a;
  return T({ story: cx.s(a, c), ask: cx.ask, answer: choice(fmt(win), [fmt(other)]), choiceBig: true,
    ways: [way('Think about distance from zero', [`Both numbers are negative, so both are below 0. The one with the bigger size, ${fmt(Math.abs(Math.min(a, c)))}, is further below.`, cx.low ? `Further below is lower, so the answer is ${b(fmt(win))}.` : `The one closer to 0 is higher, so the answer is ${b(fmt(win))}.`]),
      way('Number line', [`On a number line, left is lower and right is higher. ${fmt(Math.min(a, c))} is left of ${fmt(Math.max(a, c))}.`, `The ${cx.low ? 'left' : 'right'} one on the number line is ${b(fmt(win))}.`])],
    hint: 'Both numbers are negative. Which one is further from zero, and does that make it lower or higher?' }, 'rnCmpStory', { xs: [a, c], low: cx.low });
}
const SHAPES = {
  1: [() => readDecimal(1), () => placeLetter(1), toZero, zeroMeaning, () => compare(1)],
  2: [() => readDecimal(2), readFraction, () => opposite(2), () => between(2), () => storyCompare(2), () => compare(2)],
  3: [() => readDecimal(3), () => placeLetter(3), () => nested(3), () => between(3), order, () => storyCompare(3), () => compare(3), () => opposite(3)],
};
export const genRatNum = L => pick(SHAPES[L])();
