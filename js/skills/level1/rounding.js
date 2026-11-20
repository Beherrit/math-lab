// Rounding to the nearest 10 and 100: the number line, the deciding digit, and the halfway rule.
import { rnd, pick, chance, fmt, b, way, num, choice, numberLine } from '../../util.js';

const NAME = { 10: 'ten', 100: 'hundred' };
const notEnd = (lo, hi, bad) => { let d; do { d = rnd(lo, hi); } while (bad.includes(d)); return d; };
const bounds = (n, to) => { const lo = Math.floor(n / to) * to; return [lo, lo + to, lo + to / 2]; };
const roundOf = (n, to) => { const [lo, hi, mid] = bounds(n, to); return n >= mid ? hi : lo; };
const TF = { all: ['True', 'False'] };

function roundWays(n, to) {
  const [lo, hi, mid] = bounds(n, to), ans = roundOf(n, to);
  const digit = Math.floor(n / (to / 10)) % 10, place = to === 10 ? 'ones' : 'tens';
  const where = n === mid ? `${n} is exactly halfway. Everyone agrees on the same rule for a tie: halfway rounds up.`
    : `${n} is ${n - lo} away from ${fmt(lo)} and ${hi - n} away from ${fmt(hi)}, so it is closer to ${fmt(ans)}.`;
  return [way('On a number line', [numberLine(lo, hi, n, { loL: fmt(lo), hiL: fmt(hi), xL: n, midL: mid }),
    `${n} sits between the ${NAME[to]}s ${fmt(lo)} and ${fmt(hi)}. Halfway is ${mid}.`, where, `Rounded to the nearest ${NAME[to]}: ${b(fmt(ans))}.`]),
  way('Look at one digit', [`To round to the nearest ${NAME[to]}, look at the ${place} digit. Here it is ${b(digit)}.`,
    digit >= 5 ? `5 or more means halfway or past it, so go up to ${fmt(hi)}.` : `4 or less means not yet halfway, so stay at ${fmt(lo)}.`,
    `Rounded to the nearest ${NAME[to]}: ${b(fmt(ans))}.`])];
}
// `half` marks the one case where the number sits exactly on the halfway mark: the rule is said out loud.
function roundQ(n, to, picture, half = false) {
  const [lo, hi] = bounds(n, to);
  return { ask: `Round ${b(n)} to the nearest ${b(NAME[to])}.${half ? ` It sits exactly halfway between two ${NAME[to]}s, and the rule is that halfway rounds up.` : ''}`, answer: num(roundOf(n, to)), ways: roundWays(n, to), _t: { f: 'round', n, to },
    visual: picture || half ? numberLine(lo, hi, n, { loL: fmt(lo), hiL: fmt(hi), xL: n }) : undefined,
    hint: half ? 'Halfway is a tie, and a tie has a rule. Which way does it round?' : `Which two ${NAME[to]}s is ${n} between? Which one is closer?` };
}
function betweenQ(n, to) {
  const [lo, hi] = bounds(n, to), pair = (x, y) => `${fmt(x)} and ${fmt(y)}`;
  return { ask: `${b(n)} is between which two ${NAME[to]}s?`, answer: choice(pair(lo, hi), [pair(lo - to, lo), pair(hi, hi + to), pair(hi + to, hi + 2 * to)]), choiceBig: true,
    hint: `Count up in ${NAME[to]}s until you pass ${n}.`, _t: { f: 'between', n, to },
    ways: [way('Count up in steps', [`Count in ${NAME[to]}s: ..., ${fmt(lo)}, ${fmt(hi)}, ...`, `${fmt(lo)} is just below ${n} and ${fmt(hi)} is just above it: ${b(pair(lo, hi))}.`]),
      way('Use the digits', [`Keep the ${to === 10 ? 'tens' : 'hundreds'} and make everything after them 0 to get the lower one.`, `That is ${fmt(lo)}. One ${NAME[to]} more is ${fmt(hi)}, so ${b(pair(lo, hi))}.`])] };
}
function digitQ(n, to) {
  const p = to === 10 ? 0 : 1, d = Math.floor(n / 10 ** p) % 10, place = to === 10 ? 'ones' : 'tens';
  return { ask: `To round ${b(n)} to the nearest ${b(NAME[to])}, you look at one digit. Which digit is it?`, answer: num(d), hint: `Look at the digit right next door to the ${to === 10 ? 'tens' : 'hundreds'} place.`, _t: { f: 'digit', n, p },
    ways: [way('The deciding digit', [`For the nearest ${NAME[to]}, the digit to the right of the ${to === 10 ? 'tens' : 'hundreds'} place decides.`, `In ${n} that is the ${place} digit: ${b(d)}.`]),
      way('Why it decides', [`The ${place} digit says how far ${n} is past ${fmt(bounds(n, to)[0])}.`, `5 or more is halfway or past it, 4 or less is not yet. The digit is ${b(d)}.`])] };
}
function trueQ(n, to) {
  const ans = roundOf(n, to), [lo, hi] = bounds(n, to), ok = chance(0.5), claim = ok ? ans : (ans === lo ? hi : lo);
  return { ask: `True or false: ${b(n)} rounds to ${b(fmt(claim))} when rounded to the nearest ${NAME[to]}.`, answer: choice(ok ? 'True' : 'False', [], TF), choiceBig: true,
    hint: `Which of ${fmt(lo)} and ${fmt(hi)} is closer to ${n}?`, _t: { f: 'tf', ok, round: { n, to, claim } },
    ways: [way(`Find the closer ${NAME[to]}`, [`${n} is between ${fmt(lo)} and ${fmt(hi)}.`, `It is closer to ${fmt(ans)}, so it rounds to ${fmt(ans)}.`, ok ? `The sentence says ${fmt(claim)}, so it is ${b('true')}.` : `The sentence says ${fmt(claim)}, so it is ${b('false')}.`]),
      way('Use the digit', [`Look at the ${to === 10 ? 'ones' : 'tens'} digit: ${Math.floor(n / (to / 10)) % 10}.`, 'Below 5 stays down, 5 or more goes up.', `${n} rounds to ${fmt(ans)}.`])] };
}
function edgeQ() {
  const to = pick([10, 100]), t = rnd(2, 9) * to, least = chance(0.5), ans = least ? t - to / 2 : t + to / 2 - 1;
  return { ask: `A whole number rounds to ${b(t)} (nearest ${NAME[to]}). What is the ${b(least ? 'smallest' : 'greatest')} number it could be?`, answer: num(ans),
    hint: `Find the halfway mark ${least ? 'below' : 'above'} ${t}. Which way does halfway round?`, _t: { f: least ? 'roundlo' : 'roundhi', t, to },
    ways: [way('Use the halfway marks', least
      ? [`Below ${t}, the halfway mark is ${t - to / 2}.`, `Halfway rounds up, so ${t - to / 2} already rounds to ${t}.`, `Anything smaller rounds down to ${t - to}. The smallest is ${b(ans)}.`]
      : [`Above ${t}, the halfway mark is ${t + to / 2}.`, `Halfway rounds up, so ${t + to / 2} rounds to ${fmt(t + to)}, not ${t}.`, `The greatest number that still rounds to ${t} is one less: ${b(ans)}.`]),
    way('Try the neighbours', [`${ans} rounds to ${t}.`, least ? `${ans - 1} rounds to ${t - to}, so it does not work.` : `${ans + 1} rounds to ${fmt(t + to)}, so it does not work.`, `So the answer is ${b(ans)}.`])] };
}
// Numbers to round whose deciding digit is never 5, so the tie rule does not come up by accident.
const plainTen = three => (three ? rnd(1, 9) * 100 + rnd(0, 8) * 10 : rnd(1, 8) * 10) + notEnd(1, 9, [5]);
const plainHundred = () => rnd(1, 8) * 100 + notEnd(0, 9, [5]) * 10 + rnd(1, 9);
// A number exactly halfway between two tens (or two hundreds), with the size of the rounding.
const halfway = () => (chance(0.4) ? [rnd(1, 8) * 100 + 50, 100] : [(chance(0.5) ? rnd(1, 9) * 100 : 0) + rnd(1, 8) * 10 + 5, 10]);

export function genRound(L) {
  if (L === 1) {
    const n = plainTen(false), t = pick(['round', 'round', 'between', 'digit', 'tf']);
    return t === 'between' ? betweenQ(n, 10) : t === 'digit' ? digitQ(n, 10) : t === 'tf' ? trueQ(n, 10) : roundQ(n, 10, true);
  }
  if (L === 2) {
    if (chance(0.25)) { const [n, to] = halfway(); return roundQ(n, to, true, true); }
    const t = pick(['two', 'ten', 'hundred', 'hundred', 'between', 'digit', 'tf']);
    if (t === 'two') return roundQ(plainTen(false), 10, chance(0.5));
    if (t === 'ten') return roundQ(plainTen(true), 10, chance(0.5));
    if (t === 'between') return betweenQ(plainHundred(), 100);
    if (t === 'digit') return digitQ(plainHundred(), 100);
    if (t === 'tf') return trueQ(plainHundred(), 100);
    return roundQ(plainHundred(), 100, chance(0.5));
  }
  const t = pick(['edge', 'edge', 'near100', 'cross', 'half', 'top']);
  if (t === 'edge') return edgeQ();
  if (t === 'near100') return roundQ(rnd(95, 99), 10, false);
  if (t === 'cross') return roundQ(rnd(1, 9) * 100 + 90 + rnd(5, 9), 10, false);
  if (t === 'half') return roundQ(rnd(1, 8) * 100 + 50 + rnd(0, 9), 100, false);
  return roundQ(rnd(950, 999), 100, false);
}
