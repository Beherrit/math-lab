// Comparing and ordering integers and other signed numbers.
import { rnd, pick, chance, shuffle, fmt, b, way, num, choice, signedLine, table } from '../../util.js';
import { T, rndNot, sorted, sg } from './helpers.js';

const BLANK = '<span class="blank">?</span>';
const list = xs => xs.map(fmt).join(', ');
const pickSign = (correct, eq = false) => choice(sg(correct), [], { all: (eq ? ['<', '=', '>'] : ['<', '>']).map(sg) });
const RULE = 'On a number line, numbers get smaller as you move left. So among negatives, the one further from 0 is the smaller one.';

function compareTwo() {
  let a, c; do { a = rndNot(-12, 12); c = rndNot(-12, 12); } while (a === c || Math.min(a, c) >= 0);
  const s = a < c ? '<' : '>', lo = Math.min(a, c), hi = Math.max(a, c);
  return T({ ask: 'Which sign makes this true?', expr: `${fmt(a)} ${BLANK} ${fmt(c)}`, answer: pickSign(s), choiceBig: true,
    ways: [way('Put both on a number line', [signedLine(-12, 12, { points: [{ v: a, label: fmt(a) }, { v: c, label: fmt(c), cls: 'good' }], step: 4 }), `${fmt(lo)} is to the left of ${fmt(hi)}, and left means smaller.`, `${fmt(a)} ${b(sg(s))} ${fmt(c)}`]),
      way('Think of temperatures', [lo < 0 && hi < 0 ? `${fmt(lo)}° is colder than ${fmt(hi)}°: it is ${-lo} below zero instead of ${-hi}.` : `${fmt(lo)}° is below freezing and ${fmt(hi)}° is not, so ${fmt(lo)}° is colder.`, `Colder means smaller: ${fmt(lo)} &lt; ${fmt(hi)}, so ${fmt(a)} ${b(sg(s))} ${fmt(c)}`, 'The open side of the sign always faces the bigger number.'])],
    hint: 'Which of the two is further to the left on a number line?' }, 'cmp', { a, b: c });
}
function compareDecimals() {
  const w = rnd(0, 9), [t1, t2] = shuffle([0.5, 0.05, 0.45, 0.4, 0.25, 0.3, 0.75, 0.8, 0.08, 0.6, 0.65]), a = -(w + t1), c = -(w + t2), s = a < c ? '<' : '>';
  return T({ ask: 'Which sign makes this true?', expr: `${fmt(a)} ${BLANK} ${fmt(c)}`, answer: pickSign(s), choiceBig: true,
    ways: [way('Compare the distances from zero first', [`Without the signs: ${fmt(-a)} and ${fmt(-c)}. Give them the same number of places: ${(-a).toFixed(2)} and ${(-c).toFixed(2)}.`, `${fmt(Math.max(-a, -c))} is the bigger distance, so ${fmt(Math.min(a, c))} is further left of 0.`, `Further left means smaller: ${fmt(a)} ${b(sg(s))} ${fmt(c)}`]),
      way('Flip the positive order', [`For the positive numbers: ${fmt(-a)} ${sg(-a < -c ? '<' : '>')} ${fmt(-c)}.`, `Taking opposites mirrors the number line, so the order flips: ${fmt(a)} ${b(sg(s))} ${fmt(c)}`])],
    hint: 'Both are negative. The one further from zero is the smaller one.' }, 'cmp', { a, b: c });
}
function compareAbs() {
  const a = -rnd(2, 15), both = chance(0.4), c = both ? (chance(0.4) ? -a : rndNot(-15, 15, [0, a])) : rnd(2, 15);
  const L = Math.abs(a), Rv = both ? Math.abs(c) : c, s = L < Rv ? '<' : L > Rv ? '>' : '=';
  return T({ ask: 'Which sign makes this true?', expr: `|${fmt(a)}| ${BLANK} ${both ? `|${fmt(c)}|` : fmt(c)}`, answer: pickSign(s, true), choiceBig: true,
    ways: [way('Work out the absolute values first', [`|${fmt(a)}| is the distance from ${fmt(a)} to 0: ${L}.`, both ? `|${fmt(c)}| is the distance from ${fmt(c)} to 0: ${Rv}.` : `The other side is just ${fmt(c)}.`, `${L} ${b(sg(s))} ${Rv}`]),
      way('See it as distances', [signedLine(-16, 16, { points: [{ v: a, label: fmt(a) }, { v: c, label: fmt(c), cls: 'good' }], step: 4 }), both ? `Compare how far each dot is from 0, not where it sits: ${L} and ${Rv}.` : `${fmt(a)} is ${L} away from 0. Compare that distance with the number ${c}.`, `${L} ${b(sg(s))} ${Rv}`])],
    hint: 'Replace each absolute value with a distance from zero, then compare.' }, 'cmpAbs', { a, b: c, both });
}
function orderList(L) {
  const n = L === 2 ? 4 : 5, xs = [];
  while (xs.length < n) { const v = L === 2 ? rndNot(-15, 15) : rndNot(-19, 19) / 2; if (!xs.some(x => Math.abs(x) === Math.abs(v))) xs.push(v); }
  if (xs.filter(x => x < 0).length < 2 || xs.every(x => x < 0)) return orderList(L);
  const up = L === 2 || chance(0.4), asc = sorted(xs), right = up ? asc : asc.slice().reverse();
  const byAbs = xs.slice().sort((p, q) => Math.abs(p) - Math.abs(q)), negFlip = [...asc.filter(x => x < 0).reverse(), ...asc.filter(x => x >= 0)];
  const wrongs = [up ? asc.slice().reverse() : asc, up ? byAbs : byAbs.slice().reverse(), up ? negFlip : negFlip.slice().reverse()];
  return T({ ask: `Put these in order from ${b(up ? 'least to greatest' : 'greatest to least')}: ${list(shuffle(xs))}`, answer: choice(list(right), wrongs.map(list)),
    ways: [way('Negatives, zero, positives', [`Sort into two piles. Negatives: ${list(asc.filter(x => x < 0))}. Positives: ${list(asc.filter(x => x > 0))}.`, `Every negative is less than every positive.`, `Among the negatives, the one furthest from 0 is the least: ${fmt(asc[0])} comes ${up ? 'first' : 'last'}.`, `In order: ${b(list(right))}`]),
      way('Place them on a number line', [RULE, `Reading the line from ${up ? 'left to right' : 'right to left'}: ${b(list(right))}`])],
    hint: 'Start with the negatives. Which one is furthest from zero?' }, 'order', { xs, up });
}
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
function extreme() {
  const xs = []; while (xs.length < 5) { const v = rnd(-18, 6); if (!xs.includes(v)) xs.push(v); }
  if (xs.filter(x => x < 0).length < 3) return extreme();
  const cold = chance(0.5), ans = cold ? Math.min(...xs) : Math.max(...xs);
  return T({ story: 'The table shows the lowest temperature on five winter days.', ask: `What was the ${b(cold ? 'coldest' : 'warmest')} of these temperatures, in °C?`, visual: table(DAYS, [xs.map(x => fmt(x) + '°')]), answer: num(ans, { signed: true }),
    ways: [way('Order them', [`From coldest to warmest: ${list(sorted(xs))}`, `${cold ? 'Coldest is the first' : 'Warmest is the last'}: ${b(fmt(ans))}`]),
      way('Think about zero', [RULE, cold ? `The coldest is the negative number furthest from 0: ${b(fmt(ans))}` : `The warmest is ${ans >= 0 ? 'the largest number at or above 0' : 'the negative number closest to 0'}: ${b(fmt(ans))}`])],
    hint: cold ? 'Colder means further below zero.' : 'Warmer means further right on the number line.' }, 'extreme', { xs, want: cold ? 'min' : 'max' });
}
function countBelow() {
  const v = -rnd(2, 6), xs = []; while (xs.length < 6) { const x = rnd(-12, 8); if (!xs.includes(x) && x !== v) xs.push(x); }
  const less = chance(0.5), hit = xs.filter(x => (less ? x < v : x > v));
  if (hit.length === 0) return countBelow();
  return T({ ask: `How many of these numbers are ${b((less ? 'less than ' : 'greater than ') + fmt(v))}?`, expr: list(xs), exprSmall: true, answer: num(hit.length),
    ways: [way('Use a number line', [signedLine(-12, 8, { points: [{ v, label: fmt(v) }], step: 4 }), `${less ? 'Less than' : 'Greater than'} ${fmt(v)} means to the ${less ? 'left' : 'right'} of ${fmt(v)}.`, `Those are: ${list(sorted(hit))}. That is ${b(hit.length)} number${hit.length > 1 ? 's' : ''}.`]),
      way('Check them one at a time', [RULE, ...sorted(xs).map(x => `${fmt(x)} ${sg(x < v ? '<' : '>')} ${fmt(v)}`).slice(0, 6), `Count the ones that fit: ${b(hit.length)}`])],
    hint: `Is ${fmt(v - 1)} less than or greater than ${fmt(v)}? Picture the number line.` }, 'countCmp', { xs, v, less });
}
export function genOrder(L) {
  if (L === 1) return chance(0.75) ? compareTwo() : extreme();
  if (L === 2) return pick([() => orderList(2), () => orderList(2), extreme, compareAbs])();
  return pick([compareDecimals, () => orderList(3), countBelow, compareAbs])();
}
