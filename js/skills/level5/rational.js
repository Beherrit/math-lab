// Rational numbers on the number line: reading and placing negative decimals and fractions, zero in context, opposites.
import { R, rnd, pick, chance, shuffle, fmt, money, fr, frText, b, k, way, num, choice } from '../../util.js';
import { T } from './helpers.js';
import { ratLine } from './draw.js';

// A number written as a decimal (d = 0) or as a fraction over d. v is its value; html is the stacked form, text the plain one.
export const frItem = (n, d) => ({ v: R(n / d), d });
export const decItem = v => ({ v, d: 0 });
export const html = it => (it.d ? fr(Math.round(it.v * it.d), it.d) : fmt(it.v));
export const text = it => (it.d ? frText(Math.round(it.v * it.d), it.d) : fmt(it.v));
export const shownValue = it => (it.d ? Math.abs(it.v) : it.v);
const LETTERS = ['A', 'B', 'C', 'D'];

// A dot on a number line with ticks every `step`: say which small tick it is.
const SPEC = { 1: { lo: -3, hi: 3, step: 0.5 }, 2: { lo: -2, hi: 2, step: 0.25 }, 3: { lo: -1, hi: 1, step: 0.1 } };
export function readDecimal(L) {
  const { lo, hi, step } = SPEC[L]; let v;
  do v = R(rnd(Math.round(lo / step), Math.round(hi / step)) * step); while (Number.isInteger(v));
  const floor = Math.floor(v), ticks = Math.round((v - floor) / step), per = Math.round(1 / step);
  return T({ ask: 'What number is at the dot? Give it as a decimal.', visual: ratLine(lo, hi, { step, points: [{ v }] }), answer: num(v, { signed: true }),
    ways: [way('Count the small steps', [`The dot sits between ${fmt(floor)} and ${fmt(floor + 1)}. That gap is cut into ${per} equal steps, each worth ${fmt(step)}.`, `From ${fmt(floor)}, count ${ticks} step${ticks > 1 ? 's' : ''} to the right. Moving right makes the number bigger, so the dot is at ${b(fmt(v))}.`]),
      way('Count from zero', [`${v < 0 ? 'The dot is left of 0, so the number is negative.' : 'The dot is right of 0, so the number is positive.'}`, `It is ${Math.round(Math.abs(v) / step)} steps of ${fmt(step)} from 0: ${Math.round(Math.abs(v) / step)} × ${fmt(step)} = ${fmt(Math.abs(v))}.`, `So the dot is at ${b(fmt(v))}.`])],
    hint: 'First find the two whole numbers on either side of the dot. How many equal steps are between them?' }, 'rnReadDec', { v, step });
}
export function readFraction() {
  let v; do v = R(rnd(-8, 8) / 4); while (Number.isInteger(v));
  const it = frItem(Math.round(v * 4), 4), floor = Math.floor(v), ticks = Math.round((v - floor) * 4), q = x => text(frItem(Math.round(x * 4), 4));
  return T({ ask: 'Which fraction is at the dot?', visual: ratLine(-2, 2, { step: 0.25, points: [{ v }] }), answer: choice(text(it), [q(-v), q(v + 0.25), q(v - 0.25)]), choiceBig: true,
    ways: [way('Count the quarter steps', [`Each whole is cut into 4 equal steps, so each step is 1/4.`, `The dot is ${ticks} step${ticks > 1 ? 's' : ''} to the right of ${fmt(floor)}. That is ${fmt(floor)} + ${ticks}/4, which is ${b(text(it))}.`]),
      way('Check the sign and size', [v < 0 ? 'The dot is left of 0, so the number is negative.' : 'The dot is right of 0, so the number is positive.', `It is ${Math.abs(Math.round(v * 4))} quarter steps away from 0, so its size is ${text(frItem(Math.abs(Math.round(v * 4)), 4))}. The number is ${b(text(it))}.`])],
    hint: 'Count how many equal steps each whole number is cut into. Then count from a whole number to the dot.' }, 'rnReadFrac', { v });
}
export function placeLetter(L) {
  const { lo, hi, step } = L === 3 ? { lo: -2, hi: 2, step: 0.25 } : { lo: -3, hi: 3, step: 0.5 }, grid = [];
  for (let v = lo + step; v < hi - 1e-9; v = R(v + step)) if (!Number.isInteger(v)) grid.push(v);
  const vals = shuffle(grid).slice(0, 4), v = vals[0], pts = {}, asFrac = L === 3 && chance(0.6), item = asFrac ? frItem(Math.round(v * 4), 4) : decItem(v);
  const order = shuffle(vals); order.forEach((x, i) => { pts[LETTERS[i]] = x; });
  const win = LETTERS.find(l => pts[l] === v);
  return T({ ask: `Which point shows ${asFrac ? html(item) : b(fmt(v))}?`, visual: ratLine(lo, hi, { step, points: LETTERS.map(l => ({ v: pts[l], label: l })) }), answer: choice(win, [], { all: LETTERS }), choiceBig: true,
    ways: [way('Side of zero, then size', [`${text(item)} is ${v < 0 ? 'negative' : 'positive'}, so it is ${v < 0 ? 'left' : 'right'} of 0.`, `It is ${fmt(Math.abs(v))} from 0, which is ${Math.round(Math.abs(v) / step)} small step${Math.round(Math.abs(v) / step) > 1 ? 's' : ''} of ${fmt(step)}.`, `Only point ${b(win)} is there.`]),
      way('Between whole numbers', [`${text(item)} lies between ${fmt(Math.floor(v))} and ${fmt(Math.floor(v) + 1)}.`, `Look for the point in that gap, at the right step: point ${b(win)}.`])],
    hint: 'Is the number left or right of 0? Then find how far from 0, in small steps.' }, 'rnPlace', { v, pts, asFrac });
}
const TO_ZERO = [
  (v, a) => [`A diver is at ${k(fmt(v) + ' meters')}, where 0 is the water surface.`, 'How many meters must the diver rise to reach the surface?'], (v, a) => [`The temperature is ${k(fmt(v) + '°C')}.`, 'By how many degrees must it rise to reach freezing, 0°C?'],
  (v, a) => [`A bank account is at ${k('−' + money(a))}. That means ${money(a)} is owed.`, 'How many dollars must be paid in to reach $0?'], (v, a) => [`A submarine is at ${k(fmt(v) + ' meters')} compared with sea level.`, 'How many meters up is sea level?'],
];
export function toZero() {
  const a = rnd(3, 39) / 2, v = -a, [story, ask] = pick(TO_ZERO)(v, a);
  return T({ story, ask, answer: num(a), op: 'add',
    ways: [way('Distance from zero', [`0 is the point where nothing is above or below. The number ${fmt(v)} is ${fmt(a)} below it.`, `To get back to 0, move up ${b(fmt(a))}.`]),
      way('Add to make zero', [`A number plus its opposite is 0. What must be added to ${fmt(v)}?`, `${fmt(v)} + ${fmt(a)} = 0, so ${b(fmt(a))}.`])],
    read: { find: 'The distance back up to 0.', know: [fmt(v)], clue: 'A negative number is below zero. Zero is the starting level.', plan: `the distance from ${fmt(v)} to 0` },
    hint: 'How far is the number from 0? Moving back to 0 covers that same distance.' }, 'rnToZero', { v });
}
// What 0 means in each situation: one sentence per context, written with a negative number in it.
const ZERO = [
  { s: v => `A diver is at ${k(fmt(v) + ' meters')}.`, zero: 'the water surface' }, { s: v => `The temperature is ${k(fmt(v) + '°C')}.`, zero: 'the freezing point of water' },
  { s: v => `A bank balance shows ${k('−' + money(-v))}.`, zero: 'owing nothing and having nothing' }, { s: v => `A team lost ${k(fmt(-v) + ' yards')}, so the play counts as ${k(fmt(v))}.`, zero: 'no gain and no loss' },
  { s: v => `A rocket countdown shows ${k(fmt(v) + ' seconds')}.`, zero: 'the moment of liftoff' }, { s: v => `A golfer is at ${k(fmt(v))} compared with par.`, zero: 'exactly par' },
  { s: v => `A parking garage level is ${k(fmt(v))}.`, zero: 'street level' },
];
export function zeroMeaning() {
  const c = pick(ZERO), v = -(rnd(2, 30) / 2 + 0.5), others = shuffle(ZERO.filter(z => z !== c)).slice(0, 3).map(z => z.zero);
  return T({ story: c.s(v), ask: 'In this situation, what does 0 mean?', answer: choice(c.zero, others), choiceBig: true,
    ways: [way('Where do the numbers start?', [`Zero is the starting point. Numbers above it are positive and numbers below it are negative.`, `Here ${fmt(v)} is below 0, so 0 is ${b(c.zero)}.`]),
      way('Rule out the others', [`Each situation has its own zero, and the other choices belong to different stories.`, `Only one fits this story: ${b(c.zero)}.`])],
    hint: 'Zero is where positive and negative meet. What is the middle point of this story?' }, 'rnZero', { v, zero: c.zero });
}
export function opposite(L) {
  const asFrac = L > 1 && chance(0.5), n = rnd(1, 7) * pick([-1, 1]), d = pick([2, 4, 5, 8]);
  const x = asFrac ? frItem(n, d) : decItem(R(rnd(1, 40) / (L === 1 ? 2 : 10) * pick([-1, 1])));
  if (x.v === 0 || Number.isInteger(x.v)) return opposite(L);
  const op = { ...x, v: R(-x.v) }, mag = frText(d, Math.abs(n));
  return T({ ask: `What is the opposite of ${b(html(x))}?`, answer: asFrac ? choice(text(op), [frText(n, d), mag, '−' + mag]) : num(op.v, { signed: true }), choiceBig: asFrac,
    ways: [way('Mirror it across zero', [`Opposites are the same distance from 0 on opposite sides.`, `${text(x)} is ${text({ ...x, v: Math.abs(x.v) })} from 0 on the ${x.v < 0 ? 'left' : 'right'}, so its opposite is on the ${x.v < 0 ? 'right' : 'left'}: ${b(text(op))}`]),
      way('Change the sign', [`The opposite changes the sign and keeps the size.`, `${text(x)} becomes ${b(text(op))}. Check: ${text(x)} + ${text(op)} = 0.`])],
    hint: 'The opposite is the same distance from zero, on the other side.' }, asFrac ? 'rnOppFrac' : 'rnOpp', { v: x.v, d: x.d });
}
export function nested(L) {
  const c = L === 2 ? 2 : pick([2, 3, 4]), x = R(rnd(1, 40) / 10 * pick([-1, 1])), ans = x * (c % 2 ? -1 : 1);
  if (Number.isInteger(x)) return nested(L);
  const expr = '−('.repeat(c) + fmt(x) + ')'.repeat(c), steps = Array.from({ length: c }, (_, i) => fmt(R(x * (i % 2 === 0 ? -1 : 1))));
  return T({ ask: 'What is the value?', expr, answer: num(ans, { signed: true }),
    ways: [way('Mirror, one sign at a time', [`Each − in front takes the opposite. Work from the inside out, starting with ${fmt(x)}.`, `After each step: ${steps.join(', then ')}.`, `The value is ${b(fmt(ans))}.`]),
      way('Count the minus signs', [`There are ${c} minus signs in front. Two of them cancel out and bring the number back.`, c % 2 ? `${c} is odd, so one flip is left over: ${fmt(x)} becomes ${b(fmt(ans))}.` : `${c} is even, so they all cancel in pairs: the value stays ${b(fmt(ans))}.`])],
    hint: 'Start with the inside. What is the opposite of the number? Then take the opposite again.' }, 'rnOpp3', { x, c });
}
