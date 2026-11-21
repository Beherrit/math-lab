// Telling time on a clock face: the short hand is the hour, the long hand counts by fives.
import { rnd, pick, b, way, num, choice } from '../../util.js';
import { clockFace } from './clock.js';

const pad = m => String(m).padStart(2, '0');
const hour12 = h => ((h + 11) % 12) + 1;
const shown = (h, m, d = 0) => {
  const t = h * 60 + m + d;
  return `${Math.floor(t / 60)}:${pad(t % 60)}`;
};
const real = t => /^(1[0-2]|[1-9]):[0-5]\d$/.test(t);
const hand = m => (m === 0 ? 12 : m / 5);

function wrongs(right, list) {
  const bad = [...new Set(list.filter(t => t !== right && real(t)))];
  for (let h = 1; bad.length < 2 && h <= 12; h++) {
    const t = `${h}:00`;
    if (t !== right && !bad.includes(t)) bad.push(t);
  }
  return bad.slice(0, 3);
}
function readWays(h, m, right) {
  const face = clockFace(h, m);
  return [
    way('Hour hand, then minute hand', [face, `The short hand is on the ${h}, so the hour is ${h}.`, `The long hand points at ${hand(m)}. Each number is 5 minutes, so that is ${m} minutes.`, `The time is ${b(right)}.`]),
    way('Count by fives from the 12', [`Start at the 12 and count 5 for each number the long hand has passed.`, m ? `You count to ${m}.` : 'The long hand is still on the 12, so no minutes have passed.', `The time is ${b(right)}.`]),
  ];
}
function readQ(h, m) {
  const right = shown(h, m);
  const bad = wrongs(right, [shown(h, m === 0 ? 5 : m / 5), shown(hour12(h + 1), m), shown(hour12(h - 1), m), shown(h, (m + 10) % 60)]);
  return {
    ask: 'What time does the clock show?', visual: clockFace(h, m), answer: choice(right, bad), choiceBig: true,
    hint: 'The short thick hand is the hour. The long hand counts minutes by fives.',
    why: `The long hand on ${hand(m)} means ${m} minutes, not ${m === 0 ? 12 : m / 5} minutes. Each number on the clock is 5 minutes, so the time is ${right}.`,
    _t: { f: 'clock', h, m, d: 0 }, ways: readWays(h, m, right),
  };
}
function minutesQ(h, m) {
  return {
    ask: 'How many minutes past the hour is the long hand showing?', visual: clockFace(h, m), answer: num(m),
    hint: 'Count by fives from the 12. The number the hand points at is not the minutes.',
    why: `The long hand points at ${hand(m)}. Reading that number as the minutes is the usual slip. Each number is 5 minutes, so it is ${m} minutes past ${h}.`,
    _t: { f: 'mul', a: m / 5, b: 5 },
    ways: [
      way('Count by fives', [clockFace(h, m), `The long hand points at ${hand(m)}.`, `${hand(m)} × 5 = ${b(m)}.`]),
      way('Multiply', [`Every number on the clock is worth 5 minutes.`, `${hand(m)} × 5 = ${b(m)}.`]),
    ],
  };
}
function untilQ(h, m) {
  const left = 60 - m;
  return {
    ask: 'How many minutes until the next hour?', visual: clockFace(h, m), answer: num(left),
    hint: 'An hour is 60 minutes. Take away the minutes that have already passed.',
    why: `The long hand has gone ${m} minutes. The minutes left are 60 minus ${m}, not the number ${hand(m)} that the hand points at.`,
    _t: { f: 'sub', a: 60, b: m },
    ways: [
      way('Take it from 60', [clockFace(h, m), `${m} minutes of the hour have gone.`, `60 − ${m} = ${b(left)}.`]),
      way('Count on to the 12', [`From ${m}, count on by fives until 60.`, `You count on ${b(left)} minutes.`]),
    ],
  };
}
function slipRead(h, m) {
  const right = shown(h, m);
  const said = shown(h, m === 0 ? 5 : m / 5);
  const bad = wrongs(right, [said, shown(hour12(h + 1), m), shown(hour12(h - 1), m)]);
  return {
    ask: 'The long hand was read as the minutes. What time is it really?', visual: clockFace(h, m),
    answer: choice(right, bad), choiceBig: true,
    hint: 'The number the long hand points at is a count of fives, not the minutes.',
    why: `The long hand on ${hand(m)} was read as ${m === 0 ? 5 : m / 5} minutes. Each number is 5 minutes, so the time is ${right}, not ${said}.`,
    _t: { f: 'clock', h, m, d: 0 }, ways: readWays(h, m, right),
  };
}
function laterQ(h, m, d, cross) {
  const right = shown(h, m, d);
  const bad = wrongs(right, [shown(h, (m + d) % 60), shown(hour12(h + 1), (m + d) % 60), shown(h, m, d + 10), shown(h, m, Math.max(0, d - 10))]);
  const ask = cross ? 'The minutes go past the hour. What time will it be in these minutes?' : 'What time will it be in these minutes?';
  return {
    ask: `${ask} ${d} minutes from now.`, visual: clockFace(h, m), answer: choice(right, bad), choiceBig: true,
    hint: cross ? 'Add the minutes. When they pass 60, the hour goes up by one.' : 'Add the minutes. The hour stays the same if the total is under 60.',
    why: cross
      ? `The minutes pass 60, so the hour moves from ${h} to ${h + 1}. Keeping the hour at ${h} is the usual slip. The time is ${right}.`
      : `The minutes stay under 60, so the hour stays ${h}. Adding a whole hour as well lands on the wrong hour. The time is ${right}.`,
    _t: { f: 'clock', h, m, d },
    ways: [
      way('Add the minutes', [clockFace(h, m), `Now it is ${shown(h, m)}.`, `${m} + ${d} = ${m + d}${cross ? `, which is 60 and ${m + d - 60} more.` : '.'}`, `The time is ${b(right)}.`]),
      way('Count on in fives', [`Start at ${shown(h, m)} and count on ${d} minutes.`, `You reach ${b(right)}.`]),
    ],
  };
}

function crossLater() {
  const h = rnd(1, 11), m = rnd(7, 11) * 5;
  const d = rnd(Math.ceil((60 - m) / 5), 11) * 5;
  if (m + d < 60) return crossLater();
  return laterQ(h, m, d, true);
}
export function genClock(L) {
  const h = rnd(1, 12);
  if (L === 1) {
    const m = pick([0, 30, 30]);
    const kind = pick(['read', 'minutes', 'until', 'slip']);
    if (kind === 'minutes') return minutesQ(h, 30);
    if (kind === 'until') return untilQ(h, 30);
    if (kind === 'slip') return slipRead(h, m);
    return readQ(h, m);
  }
  if (L === 2) {
    const m = rnd(1, 11) * 5;
    const kind = pick(['read', 'minutes', 'until', 'later']);
    if (kind === 'minutes') return minutesQ(h, m);
    if (kind === 'until') return untilQ(h, m);
    if (kind === 'later') return laterQ(rnd(1, 12), rnd(0, 6) * 5, rnd(1, 4) * 5, false);
    return readQ(h, m);
  }
  const kind = pick(['cross', 'same', 'minutes', 'until']);
  if (kind === 'minutes') return minutesQ(rnd(1, 11), rnd(1, 11) * 5);
  if (kind === 'until') return untilQ(rnd(1, 11), rnd(1, 11) * 5);
  if (kind === 'same') return laterQ(rnd(1, 12), rnd(0, 4) * 5, rnd(1, 3) * 5, false);
  return crossLater();
}
