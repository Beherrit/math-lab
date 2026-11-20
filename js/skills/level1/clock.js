// Reading an analogue clock face (to 5 minutes): the picture, and questions that read it.
import { rnd, pick, b, way, num, choice } from '../../util.js';

const pad = m => String(m).padStart(2, '0');
const time = (h, m) => `${h}:${pad(m)}`;
const hour12 = h => ((h + 11) % 12) + 1;
const at = x => time(hour12(Math.floor(x / 60)), x % 60);
const xy = (deg, len) => [80 + len * Math.sin(deg * Math.PI / 180), 80 - len * Math.cos(deg * Math.PI / 180)];

// A clean clock face: 60 small ticks, 12 numbers, a short thick hour hand and a long thin minute hand.
export function clockFace(h, m) {
  let g = `<svg class="viz fbar" viewBox="0 0 160 160" role="img" aria-label="clock face showing ${time(h, m)}" style="max-width:170px">`;
  g += '<circle cx="80" cy="80" r="74" style="fill:var(--card);stroke:var(--ink);stroke-width:3"/>';
  for (let i = 0; i < 60; i++) {
    const big = i % 5 === 0, [x1, y1] = xy(i * 6, big ? 62 : 67), [x2, y2] = xy(i * 6, 71);
    g += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:var(--ink);stroke-width:${big ? 2.5 : 1}"/>`;
  }
  for (let n = 1; n <= 12; n++) { const [x, y] = xy(n * 30, 50); g += `<text x="${x}" y="${y + 5}" text-anchor="middle" class="lbl">${n}</text>`; }
  const [hx, hy] = xy((h % 12) * 30 + m * 0.5, 34), [mx, my] = xy(m * 6, 58);
  g += `<line x1="80" y1="80" x2="${hx}" y2="${hy}" style="stroke:var(--ink);stroke-width:5;stroke-linecap:round"/>`;
  g += `<line x1="80" y1="80" x2="${mx}" y2="${my}" style="stroke:var(--grape);stroke-width:3;stroke-linecap:round"/>`;
  return g + '<circle cx="80" cy="80" r="4" style="fill:var(--ink)"/></svg>';
}

// What a hurried reader says: the number the minute hand points at read as minutes, the hands swapped, an hour out.
const mistakes = (h, m) => [time(h, m / 5), at((m / 5 || 12) * 60 + h * 5), time(hour12(h + 1), m), time(hour12(h - 1), m)];
// A quick reading is at most "quarter past", "half past" and so on at step 1, any five minutes at step 2.
function readQ(h, m) {
  const words = m === 0 ? `${h} o'clock` : m === 30 ? `half past ${h}` : m === 15 ? `quarter past ${h}` : null;
  return { ask: 'What time does the clock show?', visual: clockFace(h, m), answer: choice(time(h, m), mistakes(h, m).filter(t => t !== time(h, m))), choiceBig: true,
    hint: 'The short hand tells the hour. The long hand tells the minutes: each number is 5 minutes.', _t: { f: 'clock', h, m, d: 0 },
    ways: [way('Hour hand, then minute hand', [clockFace(h, m), `The short hand is just past the ${h}, so the hour is ${h}.`, `The long hand points at ${m / 5}. Each number is 5 minutes: ${m / 5} × 5 = ${m}.`, `The time is ${b(time(h, m))}${words ? `, which is ${words}` : ''}.`]),
      way('Count by fives round the face', [`Start at the 12 and count by 5s for each number the long hand passes: ${m ? Array.from({ length: m / 5 }, (_, i) => (i + 1) * 5).join(', ') : 'it has not moved'}.`, `That is ${m} minutes past ${h}: ${b(time(h, m))}.`])] };
}
function minutesQ(h, m) {
  const n = m / 5;
  return { ask: `The long hand points at the ${b(n)}. How many minutes past the hour is that?`, answer: num(m), hint: 'Count round the face from the 12 in equal steps. How many minutes is each number worth?', _t: { f: 'mul', a: n, b: 5 },
    ways: [way('Count by fives', [`Counting by 5s round the face: ${Array.from({ length: n }, (_, i) => (i + 1) * 5).join(', ')}.`, `The ${n} is ${b(m)} minutes past.`]), way('Multiply', [`Every number is 5 minutes, so ${n} × 5 = ${b(m)}.`])] };
}
// A clock plus "what time will it be in d minutes?" The wrong times are real clock times from real slips.
function laterQ(h, m, d) {
  const start = h * 60 + m, right = at(start + d);
  return { ask: `The clock shows the time now. What time will it be ${b(d + ' minutes')} later?`, visual: clockFace(h, m), choiceBig: true,
    answer: choice(right, [at(start + d - 60), at(start + d + 60), at(start - d), at(start + d + 10)].filter(t => t !== right)),
    hint: 'Read the clock first. Then add the minutes, and watch for the hour changing.', _t: { f: 'clock', h, m, d },
    ways: [way('Read it, then add', [`The clock shows ${time(h, m)}.`, `${m} + ${d} = ${m + d} minutes${m + d >= 60 ? `, which is 60 and ${m + d - 60} more: the hour goes up by 1.` : ', still less than 60, so the hour stays.'}`, `The time is ${b(right)}.`]),
      way('Count on in fives', [`Start at ${time(h, m)} and count on ${d} minutes in jumps of 5.`, `You reach ${b(right)}.`])] };
}
function untilQ(h, m) {
  return { ask: 'The clock shows the time now. How many minutes is it until the next full hour?', visual: clockFace(h, m), answer: num(60 - m), hint: 'The long hand has to go all the way round to the 12. How far has it gone?', _t: { f: 'sub', a: 60, b: m },
    ways: [way('Take it from 60', [`The long hand points at ${m / 5}, so ${m} minutes of the hour have gone.`, `An hour is 60 minutes: 60 − ${m} = ${b(60 - m)}.`]), way('Count on to the 12', [`From ${m} count on by 5s to 60.`, `You count on ${b(60 - m)} minutes.`])] };
}
export function genClockRead(L) {
  const h = rnd(1, 12);
  if (L === 1) return readQ(h, pick([0, 0, 15, 30, 30, 45]));
  if (L === 2) return pick([() => readQ(h, rnd(1, 11) * 5), () => readQ(h, rnd(1, 11) * 5), () => minutesQ(h, rnd(1, 11) * 5)])();
  const m = rnd(1, 11) * 5;
  return pick([() => laterQ(Math.min(h, 11), m, rnd(2, 11) * 5), () => laterQ(Math.min(h, 11), m, rnd(2, 11) * 5), () => untilQ(h, m)])();
}
