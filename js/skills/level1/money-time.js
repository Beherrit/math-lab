// Money and time amounts in simple story form (whole dollars, cents, minutes and clock times).
import { rnd, pick, chance, b, k, way, nm, choice } from '../../util.js';
import { tell, plusWays, minusWays } from './stories.js';
import { genCoins } from './coins.js';
import { genClockRead } from './clock.js';

const ITEMS = ['a phone case', 'a basketball', 'a book', 'a T-shirt', 'a board game', 'a bike light', 'a cinema ticket', 'a pizza', 'a set of guitar strings', 'a water bottle'];
const twoItems = () => { const x = pick(ITEMS); let y = pick(ITEMS); while (y === x) y = pick(ITEMS); return [x, y]; };
const D = { suffix: 'dollars' }, C = { suffix: 'cents' };

function moneyTotal(a, c, n) {
  const [x, y] = twoItems();
  return tell([`${n} buys ${x} for ${k('$' + a)} and ${y} for ${k('$' + c)}.`, 'How many dollars is that altogether?', 'The cost of both things together.', [`${x}: $${a}`, `${y}: $${c}`], '"Altogether" means both prices joined, so add.'],
    'add', a + c, plusWays(a, c), `${a} + ${c}`, { f: 'add', xs: [a, c] }, { ...D, hint: 'Two prices are being joined.' });
}
function moneyLeft(a, c, n, cents) {
  const row = cents
    ? [`A sticker for a skateboard costs ${k(c + ' cents')}. ${n} pays with a 1 dollar coin, which is ${k('100 cents')}.`, 'How many cents does the shop give back?', 'The change, in cents.', ['paid: 100 cents', `price: ${c} cents`], 'Change is what is left of the money you handed over, so subtract.']
    : [`${n} has ${k('$' + a)} and spends ${k('$' + c)} on ${pick(ITEMS)}.`, `How many dollars does ${n} have left?`, 'The money left after buying.', [`has: $${a}`, `spends: $${c}`], 'Spending takes money away and "left" asks what remains, so subtract.'];
  return tell(row, 'sub', a - c, minusWays(a, c), `${a} − ${c}`, { f: 'sub', a, b: c }, { ...(cents ? C : D), hint: cents ? 'Start with the money handed over, then take the price away.' : 'Start with the money there was, then take away what was spent.' });
}
function moneyCents(n) {
  const a = rnd(2, 10) * 5, c = rnd(2, (100 - a) / 5) * 5;
  return tell([`${n} has ${k(a + ' cents')} in one pocket and ${k(c + ' cents')} in the other.`, `How many cents does ${n} have?`, 'All the cents together.', [`one pocket: ${a} cents`, `other pocket: ${c} cents`], 'Both pockets together means add.'],
    'add', a + c, plusWays(a, c), `${a} + ${c}`, { f: 'add', xs: [a, c] }, { ...C, hint: 'Join the two amounts. Counting by fives or tens helps.' });
}
function moneyNeed(n) {
  const a = rnd(12, 48) * 10 + pick([0, 5, 9]), c = rnd(8, Math.floor(a / 10) - 3) * 10 + rnd(1, 9);
  return tell([`A bike costs ${k('$' + a)}. ${n} has saved ${k('$' + c)}.`, `How many more dollars does ${n} need?`, 'The money still missing.', [`price: $${a}`, `saved: $${c}`], '"How many more ... need" is the gap from the savings up to the price, so subtract.'],
    'sub', a - c, minusWays(a, c), `${a} − ${c}`, { f: 'sub', a, b: c }, { ...D, hint: 'Find the gap between the savings and the price.' });
}
function moneyTwoStep(n) {
  const [x, y] = twoItems(), pay = pick([50, 100]), a = rnd(12, pay / 2 - 6), c = rnd(8, pay / 2 - 8), sum = a + c;
  return tell([`${n} buys ${x} for ${k('$' + a)} and ${y} for ${k('$' + c)}, and pays with a ${k('$' + pay + ' bill')}.`, 'How many dollars of change does ' + n + ' get?', 'The change after paying for both.', [`${x}: $${a}`, `${y}: $${c}`, `paid: $${pay}`], 'First join the two prices (add). Then take the total from the money paid (subtract).'],
    'multi', pay - sum, [way('Total first, then change', [`Cost of both: ${a} + ${c} = ${sum}.`, `Change: ${pay} − ${sum} = ${b(pay - sum)} dollars.`]),
      way('Pay for one thing at a time', [`After the first: ${pay} − ${a} = ${pay - a}.`, `After the second: ${pay - a} − ${c} = ${b(pay - sum)} dollars.`])],
    `${a} + ${c}, then ${pay} − the total`, { f: 'add', xs: [pay, -a, -c] }, { ...D, hint: 'Find what both things cost together first.' });
}
export function moneyWord(L) {
  const n = nm(), t = rnd(1, 3);
  if (L === 1) { const a = rnd(4, 12); return t === 1 ? moneyTotal(a, rnd(3, 20 - a), n) : t === 2 ? moneyCents(n) : moneyLeft(rnd(11, 20), rnd(3, 9), n); }
  if (L === 2) {
    if (t === 1) return moneyTotal(rnd(16, 48), rnd(13, 49), n);
    if (t === 2) return moneyLeft(100, rnd(4, 18) * 5, n, true);
    return moneyLeft(pick([20, 50]), rnd(3, 18), n);
  }
  return chance(0.6) ? moneyTwoStep(n) : moneyNeed(n);
}

const clock = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
// A real clock time from minutes since 12:00 (the hour stays between 1 and 12).
const at = x => clock(((Math.floor(x / 60) + 11) % 12) + 1, x % 60);
const ACTS = ['guitar practice', 'football training', 'a swimming lesson', 'a dance class', 'band rehearsal', 'a bike ride', 'a video call'];
function minutesSum(n) {
  const a = rnd(2, 8) * 5, c = rnd(2, (60 - a) / 5) * 5, [x, y] = [pick(['homework', 'reading']), pick(['guitar practice', 'a workout', 'drawing'])];
  return tell([`${n} spends ${k(a + ' minutes')} on ${x} and then ${k(c + ' minutes')} on ${y}.`, 'How many minutes is that in all?', 'The minutes for both together.', [`${x}: ${a} minutes`, `${y}: ${c} minutes`], '"In all" means both times joined, so add.'],
    'add', a + c, plusWays(a, c), `${a} + ${c}`, { f: 'add', xs: [a, c] }, { suffix: 'minutes', hint: 'Join the two times.' });
}
function filmMinutes() {
  const m = rnd(3, 9) * 5, a = 60 + m;
  return tell([`A film lasts ${k('1 hour and ' + m + ' minutes')}.`, 'How many minutes is that?', 'The whole film in minutes.', ['1 hour = 60 minutes', `plus ${m} minutes`], 'One hour is 60 minutes. Swap the hour for 60, then add the extra minutes.'],
    'add', a, [way('Swap the hour for minutes', ['1 hour = 60 minutes.', `60 + ${m} = ${b(a)} minutes.`]), way('Count on from 60', [`Start at 60 and count on ${m} in fives or tens.`, `You reach ${b(a)}.`])], `60 + ${m}`, { f: 'add', xs: [60, m] }, { suffix: 'minutes', hint: 'How many minutes are in one hour?' });
}
function minutesLeft(n) {
  const a = rnd(6, 12) * 5, c = rnd(2, a / 5 - 1) * 5;
  return tell([`A lesson lasts ${k(a + ' minutes')}. ${n} has been there for ${k(c + ' minutes')}.`, 'How many minutes are left?', 'The minutes still to go.', [`whole lesson: ${a} minutes`, `done: ${c} minutes`], '"Left" asks for the part still to come, so subtract.'],
    'sub', a - c, minusWays(a, c), `${a} − ${c}`, { f: 'sub', a, b: c }, { suffix: 'minutes', hint: 'Take the time already done away from the whole lesson.' });
}
function elapsed(n, cross) {
  const h = rnd(1, 11), m1 = cross ? rnd(6, 11) * 5 : rnd(0, 6) * 5, m2 = cross ? rnd(1, m1 / 5 - 1) * 5 : m1 + rnd(2, (55 - m1) / 5) * 5, h2 = cross ? h + 1 : h;
  const act = pick(ACTS), d = (h2 - h) * 60 + m2 - m1;
  const ways = cross ? [way('Stop at the hour', [`From ${clock(h, m1)} to ${clock(h2, 0)} is ${60 - m1} minutes.`, `From ${clock(h2, 0)} to ${clock(h2, m2)} is ${m2} minutes.`, `${60 - m1} + ${m2} = ${b(d)} minutes.`]),
    way('A whole hour, then back', [`From ${clock(h, m1)} to ${clock(h2, m1)} would be a whole hour: 60 minutes.`, `${clock(h2, m2)} is ${m1 - m2} minutes earlier than that.`, `60 − ${m1 - m2} = ${b(d)} minutes.`])]
    : [way('Same hour, so compare the minutes', [`Both times are in the ${h} o'clock hour.`, `${m2} − ${m1} = ${b(d)} minutes.`]), way('Count up in fives or tens', [`Start at ${clock(h, m1)} and count up to ${clock(h, m2)}.`, `That takes ${b(d)} minutes.`])];
  return tell([`${n}'s ${act.replace(/^a /, '')} starts at ${k(clock(h, m1))} and ends at ${k(clock(h2, m2))}.`, 'How many minutes does it last?', 'The time from the start to the end.', [`starts: ${clock(h, m1)}`, `ends: ${clock(h2, m2)}`], cross ? 'The times are in different hours, so count up to the hour first and then past it.' : 'How long something lasts is the gap between the two times, so subtract the minutes.'],
    'sub', d, ways, `${clock(h, m1)} up to ${clock(h2, m2)}`, { f: 'elapsed', h1: h, m1, h2, m2 }, { suffix: 'minutes', hint: cross ? `How many minutes from ${clock(h, m1)} to ${clock(h2, 0)}?` : 'The hour is the same. Look at the minutes.' });
}
function endTime(n, cross) {
  const h = rnd(1, 11), m = cross ? rnd(7, 11) * 5 : rnd(0, 6) * 5, d = cross ? rnd(Math.max(4, 13 - m / 5), 11) * 5 : rnd(2, (55 - m) / 5) * 5;
  const tot = m + d, right = clock(h + Math.floor(tot / 60), tot % 60), act = pick(ACTS);
  // Real mistakes, each a proper clock time: forgot the hour changed, added an hour too many, subtracted instead of added, slipped by 10.
  const start = h * 60 + m, wrong = cross ? [at(start + d - 60), at(start + d + 60), at(start - d), at(start + d + 10)] : [at(start + d + 60), at(start - d), at(start + d + 10), at(start + d - 10)];
  const p = tell([`${n} starts ${act} at ${k(clock(h, m))}. It lasts ${k(d + ' minutes')}.`, 'What time does it end?', 'The clock time when it ends.', [`starts: ${clock(h, m)}`, `lasts: ${d} minutes`], 'Time moves forward, so add the minutes to the start time.'],
    'add', 0, cross ? [way('Fill the hour first', [`From ${clock(h, m)} to ${clock(h + 1, 0)} takes ${60 - m} minutes.`, `That leaves ${d} − ${60 - m} = ${tot - 60} more minutes.`, `${clock(h + 1, 0)} and ${tot - 60} minutes is ${b(right)}.`]),
      way('Add, then trade 60 minutes for an hour', [`${m} + ${d} = ${tot} minutes past ${h}.`, `A clock never shows ${tot} minutes: 60 of them make the next hour.`, `${tot} − 60 = ${tot - 60}, so the time is ${b(right)}.`])]
      : [way('Add the minutes', [`The hour stays ${h}, because ${m} + ${d} is less than 60.`, `${m} + ${d} = ${tot}, so the time is ${b(right)}.`]), way('Count on in fives or tens', [`Start at ${clock(h, m)} and count on ${d} minutes.`, `You reach ${b(right)}.`])],
    `${clock(h, m)} and ${d} minutes more`, { f: 'clock', h, m, d }, { hint: cross ? 'How many minutes until the next full hour?' : 'Add the minutes. Does the hour change?' });
  p.answer = choice(right, wrong);
  return p;
}
export function timeWord(L) {
  const n = nm(), t = rnd(1, 3);
  if (L === 1) return t === 1 ? minutesLeft(n) : minutesSum(n);
  if (L === 2) return t === 1 ? elapsed(n, false) : t === 2 ? endTime(n, false) : filmMinutes();
  return t === 1 ? endTime(n, true) : elapsed(n, true);
}
// Money and time questions: stories, counting coins, reading a clock face.
export function genMoney(L) {
  const t = Math.random();
  if (t < 0.28) return moneyWord(L);
  if (t < 0.5) return timeWord(L);
  return t < 0.75 ? genCoins(L) : genClockRead(L);
}
