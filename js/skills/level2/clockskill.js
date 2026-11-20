// Telling time to the minute on an analogue clock, and elapsed time: how long between two times, and finding a start or an end time.
import { rnd, pick, shuffle, b, way, num, choice } from '../../util.js';
import { cnt } from './words.js';
import { clockText as T, atMinutes, mark } from './kit.js';
import { clockFace, timeLine, stops } from './clockpic.js';

const mins = (h, m) => h * 60 + m;               // minutes on the clock face, hour 1 to 12 (12:40 is 760)
const hour12 = h => ((h + 11) % 12) + 1;
const SHORT = [(a, e, m) => [`The bus leaves at ${a} and arrives at ${e}.`, 'How many minutes is the trip?'], (a, e, m) => [`${m}'s band practice starts at ${a} and finishes at ${e}.`, 'How many minutes is practice?'],
  (a, e) => [`A swim lesson starts at ${a} and ends at ${e}.`, 'How many minutes is the lesson?'], (a, e) => [`A phone is plugged in to charge at ${a} and unplugged at ${e}.`, 'How many minutes does it charge?']];
const LONG = [(a, e) => [`A movie starts at ${a} and ends at ${e}.`, 'How many minutes long is the movie?'], (a, e) => [`A football match kicks off at ${a} and ends at ${e}.`, 'How many minutes does the match take?'],
  (a, e, m) => [`${m} starts a road trip at ${a} and gets there at ${e}.`, 'How many minutes does the trip take?'], (a, e) => [`A concert starts at ${a} and finishes at ${e}.`, 'How many minutes is the concert?']];
// A start time and a length for each step: step 1 stays in one hour, step 2 crosses an hour, step 3 is longer.
function span(L) {
  if (L === 1) { const h = rnd(1, 11), m = 5 * rnd(0, 8), d = 5 * rnd(2, (55 - m) / 5); return { h, m, d }; }
  if (L === 2) { const h = rnd(1, 10), m = rnd(10, 55), d = rnd(66 - m, 75); return { h, m, d }; }
  return { h: rnd(1, 8), m: rnd(1, 58), d: rnd(100, 230) };
}
const event = d => pick(d > 100 ? ['A film', 'A match', 'A road trip', 'A concert'] : ['A lesson', 'A bus ride', 'A band practice', 'A game level']);
const endOf = ({ h, m, d }) => mins(h, m) + d;
const timeOf = x => atMinutes(x);
const hm = x => [Math.floor(x / 60), x % 60];

// The ways to find the minutes between two times: jumps along a time line, and converting both to minutes.
function elapsedWays(s) {
  const a = mins(s.h, s.m), e = endOf(s), st = stops(a, e), parts = st.slice(1).map((t, i) => t - st[i]);
  return [way('Jump along a time line', [timeLine(a, e, true), ...st.slice(1).map((t, i) => `${timeOf(st[i])} to ${timeOf(t)} is ${t - st[i]} minutes.`), `${parts.join(' + ')} = ${b(s.d)} minutes.`]),
    way('Turn both times into minutes', [`${timeOf(e)}: ${hm(e)[0]} × 60 + ${hm(e)[1]} = ${e} minutes.`, `${timeOf(a)}: ${s.h} × 60 + ${s.m} = ${a} minutes.`, `${e} − ${a} = ${b(s.d)} minutes.`])];
}
function elapsedQ(s, ctx, withLine) {
  const a = T(s.h, s.m), e = timeOf(endOf(s)), [story, ask] = pick(ctx)(a, e, pick(['Sam', 'Ava', 'Leo', 'Maya']));
  const base = { answer: num(s.d), suffix: 'minutes', _t: { f: 'elapsed', h1: s.h, m1: s.m, h2: hm(endOf(s))[0] > 12 ? hm(endOf(s))[0] - 12 : hm(endOf(s))[0], m2: hm(endOf(s))[1] }, ways: elapsedWays(s), hint: 'Count on to the next hour first. Then count the whole hours, then the last minutes.' };
  return withLine ? { ...base, ask: mark('The line shows two times. How many minutes pass between them?', a, e), visual: timeLine(mins(s.h, s.m), endOf(s), false) } : { ...base, story, ask };
}
// "What time does it end?" and "when did it start?": the wrong times are an hour out or ten minutes out.
function addWays(s) {
  const a = mins(s.h, s.m), e = endOf(s), H = Math.floor(s.d / 60), r = s.d % 60, mid = a + H * 60;
  return [way('Jump along a time line', [timeLine(a, e, true), `Start at ${timeOf(a)} and count on ${cnt(s.d, 'minute')} in jumps.`, `You land on ${b(timeOf(e))}.`]),
    way('Add the hours, then the minutes', [H ? `${cnt(s.d, 'minute')} is ${cnt(H, 'hour')}${r ? ` and ${r} minutes` : ''}. ${timeOf(a)} + ${cnt(H, 'hour')} = ${timeOf(mid)}.` : `${cnt(s.d, 'minute')} is less than an hour.`,
      r ? `${timeOf(mid)} + ${r} minutes: ${hm(mid)[1]} + ${r} = ${hm(mid)[1] + r}${hm(mid)[1] + r >= 60 ? ', which is over 60, so the hour goes up by one' : ''}.` : 'No minutes are left to add.', `It ends at ${b(timeOf(e))}.`])];
}
function endTimeQ(s) {
  const a = mins(s.h, s.m), e = endOf(s), right = timeOf(e), bad = [e + 60, e - 60, e + 10, e - 10, a - s.d].map(timeOf).filter(t => t !== right);
  return { ask: `${event(s.d)} starts at ${T(s.h, s.m)} and lasts ${cnt(s.d, 'minute')}. What time does it end?`, answer: choice(right, shuffle(bad)), choiceBig: true, _t: { f: 'endtime', h: s.h, m: s.m, d: s.d },
    hint: 'Count on to the next hour first. How many minutes is that, and how many are left?', ways: addWays(s) };
}
function startTimeQ(s) {
  const a = mins(s.h, s.m), e = endOf(s), right = timeOf(a), bad = [a + 60, a - 60, a + 10, a - 10, e + s.d].map(timeOf).filter(t => t !== right), H = Math.floor(s.d / 60), r = s.d % 60, mid = e - H * 60;
  return { ask: `${event(s.d)} ends at ${timeOf(e)} and lasted ${cnt(s.d, 'minute')}. What time did it start?`, answer: choice(right, shuffle(bad)), choiceBig: true, _t: { f: 'starttime', h: hm(e)[0] > 12 ? hm(e)[0] - 12 : hm(e)[0], m: hm(e)[1], d: s.d },
    hint: 'Count back from the end time. Go back to the hour first.',
    ways: [way('Jump back along a time line', [timeLine(a, e, true), `Start at ${timeOf(e)} and count back ${cnt(s.d, 'minute')} in jumps.`, `You land on ${b(right)}.`]),
      way('Take away the hours, then the minutes', [H ? `${cnt(s.d, 'minute')} is ${cnt(H, 'hour')}${r ? ` and ${r} minutes` : ''}. ${timeOf(e)} − ${cnt(H, 'hour')} = ${timeOf(mid)}.` : `${cnt(s.d, 'minute')} is less than an hour.`,
        r ? `${timeOf(mid)} − ${r} minutes: ${hm(mid)[1]} − ${r}${hm(mid)[1] >= r ? ` = ${hm(mid)[1] - r}` : ` is below 0, so go back one hour and use ${60 + hm(mid)[1] - r}`}.` : 'No minutes are left to take away.', `It started at ${b(right)}.`])] };
}
// Read the clock: the wrong times are the hour hand misread, the minutes taken from the wrong side, or one minute out.
function readQ(h, m) {
  const right = T(h, m), bad = [T(hour12(h + 1), m), T(hour12(h - 1), m), T(h, 60 - m), T(h, (m + 1) % 60), T(h, (m + 59) % 60)].filter(t => t !== right);
  return { ask: mark('What time does the clock show?', h, m), visual: clockFace(h, m), answer: choice(right, shuffle(bad)), choiceBig: true, _t: { f: 'clockread', pic: true }, hint: 'The short hand gives the hour. The long hand gives the minutes: each small mark is one minute.',
    ways: [way('Hour hand, then minute hand', [clockFace(h, m), `The short hand has passed the ${h} and has not reached the ${hour12(h + 1)}, so the hour is ${h}.`, `The long hand is ${m} small marks round from the 12, so it is ${m} minutes past.`, `The time is ${b(right)}.`]),
      way('Count the minutes in fives', [`The long hand is past ${Math.floor(m / 5) * 5 ? `the ${Math.floor(m / 5)} (${Math.floor(m / 5) * 5} minutes)` : 'the 12'}${m % 5 ? `, then ${m % 5} more small marks` : ''}.`, `${h} hours and ${m} minutes is ${b(right)}.`])] };
}
function minutesQ(h, m, until) {
  return { ask: mark(until ? 'How many minutes is it until the next full hour?' : 'How many minutes past the hour does the clock show?', h, m), visual: clockFace(h, m), answer: num(until ? 60 - m : m), _t: { f: until ? 'clockuntil' : 'clockmin', pic: true },
    hint: until ? 'The long hand has to go all the way round to the 12. How far has it already gone?' : 'Count the small marks from the 12 round to the long hand.',
    ways: until ? [way('Take it from 60', [clockFace(h, m), `The long hand is ${m} minutes past the hour. An hour is 60 minutes.`, `60 − ${m} = ${b(60 - m)}.`]), way('Count on to the 12', [`Count on from ${m} to 60 in jumps of 5 and 1.`, `The jumps add up to ${b(60 - m)} minutes.`])]
      : [way('Count the marks', [clockFace(h, m), `Count in fives from the 12, then count the small marks left over.`, `The long hand shows ${b(m)} minutes past.`]), way('Use the numbers', [`Each number on the clock is 5 minutes.`, `${Math.floor(m / 5)} × 5 = ${Math.floor(m / 5) * 5}${m % 5 ? `, and ${m % 5} more small marks makes ${m}` : ''}. The answer is ${b(m)}.`])] };
}
function slipQuestion() {
  let s, e;
  do { s = span(3); e = endOf(s); } while (hm(e)[1] >= s.m);
  const a = mins(s.h, s.m), [h2, m2] = hm(e), wrong = (h2 - s.h) * 60 + Math.abs(m2 - s.m), st = stops(a, e);
  return { ask: `${pick(['Zoe', 'Max', 'Ivy'])} says that going from ${T(s.h, s.m)} to ${timeOf(e)} takes ${wrong} minutes. That has a slip in it. What is the correct number of minutes?`, answer: num(s.d), suffix: 'minutes',
    _t: { f: 'elapsed', h1: s.h, m1: s.m, h2, m2 }, hint: 'Check what happens to the hour when the minutes go past 60.',
    ways: [way('Find the slip', [`The minutes ${s.m} and ${m2} were taken away from each other as if the hour had not changed in between.`, `Jump along instead: ${st.slice(1).map((t, i) => t - st[i]).join(' + ')} = ${b(s.d)} minutes.`]), ...elapsedWays(s)] };
}
export function genClock(L) {
  const s = span(L), h = rnd(1, 12), m = L === 1 ? 5 * rnd(1, 11) : rnd(1, 59);
  const ctx = L === 3 ? LONG : SHORT;
  const pool = L === 1 ? [() => readQ(h, m), () => minutesQ(h, m, false), () => elapsedQ(s, SHORT, false), () => endTimeQ(s), () => elapsedQ(s, SHORT, true)]
    : L === 2 ? [() => readQ(h, m), () => minutesQ(h, m, rnd(0, 1) === 1), () => elapsedQ(s, ctx, false), () => elapsedQ(s, ctx, true), () => endTimeQ(s), () => startTimeQ(s)]
      : [() => elapsedQ(s, ctx, false), () => endTimeQ(s), () => startTimeQ(s), slipQuestion, () => elapsedQ(s, ctx, true), () => readQ(h, m)];
  return pick(pool)();
}
