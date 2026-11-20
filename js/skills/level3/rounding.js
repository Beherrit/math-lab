// Rounding whole numbers to any place up to the millions, and using rounding to estimate.
import { rnd, pick, chance, fmt, b, way, num, choice, numberLine, placeName } from '../../util.js';
import { digit, roundTo, oneOf } from './helpers.js';

const NAME = { 10: 'ten', 100: 'hundred', 1000: 'thousand', 10000: 'ten thousand', 100000: 'hundred thousand', 1000000: 'million' };
const TO = [[10, 100], [100, 1000, 10000], [1000, 10000, 100000, 1000000]];
const MAX = [9999, 999999, 9999999];

function lineWay(n, to, title = 'Number line') {
  const lo = Math.floor(n / to) * to, hi = lo + to, mid = lo + to / 2, r = roundTo(n, to);
  const where = n === mid ? `${fmt(n)} is exactly halfway. The rule for halfway is to round up.` : `${fmt(n)} is ${n < mid ? 'before' : 'past'} the halfway mark, so it is closer to ${fmt(r)}.`;
  return way(title, [`${fmt(n)} sits between ${fmt(lo)} and ${fmt(hi)}. Those are the two nearest ${NAME[to]}s.`,
    numberLine(lo, hi, n, { loL: fmt(lo), hiL: fmt(hi), xL: fmt(n), midL: fmt(mid) }), `Halfway between them is ${fmt(mid)}.`, where, `Rounded to the nearest ${NAME[to]}: ${b(fmt(r))}`]);
}
function digitWay(n, to) {
  const p = Math.log10(to), d = digit(n, p), next = digit(n, p - 1), up = next >= 5, r = roundTo(n, to);
  const move = !up ? `${next} is 4 or less, so the ${d} stays the same.` : d === 9 ? `${next} is 5 or more, so the 9 goes up by one. That makes 10, so a 1 carries into the next place to the left.`
    : `${next} is 5 or more, so the ${d} goes up to ${d + 1}.`;
  return way('Look at the digit next door', [`Find the ${placeName(p)} digit in ${fmt(n)}: it is ${b(d)}.`, `Look at the digit just to its right: ${b(next)}. It tells you which half of the gap the number is in.`,
    move, `Every digit to the right becomes 0: ${b(fmt(r))}`]);
}

function pickNum(L) {
  const to = pick(TO[L - 1]), p = Math.log10(to);
  let n = rnd(to + 1, Math.min(MAX[L - 1], to * (L === 1 ? 100 : 1000)));
  if (L === 3 && chance(0.35)) n += (9 - digit(n, p)) * to + (digit(n, p - 1) < 5 ? 5 * to / 10 : 0);
  return n % to === 0 || n > MAX[L - 1] ? null : [n, to];
}
function plain(L) {
  const nt = pickNum(L);
  if (!nt) return null;
  const [n, to] = nt;
  return { ask: `Round to the nearest ${NAME[to]}.`, expr: fmt(n), answer: num(roundTo(n, to)), _t: { kind: 'round', n, to }, ways: [lineWay(n, to), digitWay(n, to)],
    hint: `Which two ${NAME[to]}s is the number between? Then find the halfway mark.` };
}

// One number that rounds to the target, and three that look close but land somewhere else.
function which(L) {
  const to = pick(TO[L - 1].slice(0, 3)), target = to * rnd(2, 98), half = to / 2;
  const good = target + pick([rnd(-half, -1), rnd(1, half - 1)]);
  const bad = [target + half, target - half - rnd(1, to / 10), target + half + rnd(1, half - 1)];
  const why = x => `${fmt(x)} rounds to ${fmt(roundTo(x, to))}.`;
  return { ask: `Which number rounds to ${fmt(target)} when you round to the nearest ${NAME[to]}?`, answer: choice(fmt(good), bad.map(fmt)), _t: { kind: 'which', target, to },
    hint: `Find the halfway marks just below and just above ${fmt(target)}.`,
    ways: [way('Find the range', [`Half of one ${NAME[to]} is ${fmt(half)}.`, `Numbers from ${fmt(target - half)} up to just under ${fmt(target + half)} round to ${fmt(target)}.`,
      `${fmt(target + half)} itself is exactly halfway to the next one, so it rounds up and does not count.`, `Only ${b(fmt(good))} is inside that range.`]),
    way('Round each choice', [why(good), ...bad.map(why), `So the answer is ${b(fmt(good))}.`])] };
}

function estimate(L) {
  const to = pick(L === 2 ? [100, 1000] : [1000, 10000]), op = pick(['+', '−']);
  let a = rnd(to * 2, to * 90), c = rnd(to + 1, to * 60);
  if (a < c) [a, c] = [c, a];
  const ra = roundTo(a, to), rc = roundTo(c, to), est = op === '+' ? ra + rc : ra - rc;
  if (a % to === 0 || c % to === 0 || est <= 0) return null;
  return { ask: `Estimate: round each number to the nearest ${NAME[to]}, then ${op === '+' ? 'add' : 'subtract'}.`, expr: `${fmt(a)} ${op} ${fmt(c)}`, answer: num(est),
    _t: { kind: 'est', a, c, to, op }, hint: `Round both numbers first. Only then ${op === '+' ? 'add' : 'subtract'}.`,
    ways: [way('Round, then work it out', [`${fmt(a)} rounds to ${b(fmt(ra))}.`, `${fmt(c)} rounds to ${b(fmt(rc))}.`, `For comparison, the exact answer is ${fmt(op === '+' ? a + c : a - c)}.`,
      `${fmt(ra)} ${op} ${fmt(rc)} = ${b(fmt(est))}. The estimate is close to the exact answer, and much quicker.`]), lineWay(a, to, `Number line for ${fmt(a)}`), lineWay(c, to, `Number line for ${fmt(c)}`)] };
}

const MAKERS = [[plain], [plain, plain, plain, which, estimate], [plain, plain, which, estimate]];
export const genRound = L => oneOf(MAKERS[L - 1], L);
