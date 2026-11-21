// Read a clock. The long hand's number is a count of fives, not the minutes.
import { clockFace } from '../skills/level1/clock.js';

export const clockMeta = {
  id: 'g1clock',
  title: 'Read the clock',
  blurb: 'Short hand, then long hand.',
  skill: 'l1clock',
};

const pad = m => String(m).padStart(2, '0');
const hour12 = h => ((h + 11) % 12) + 1;
const time = (h, m) => `${h}:${pad(m)}`;

export function makeClock(rng) {
  const h = rng.int(1, 12);
  const m = rng.int(0, 11) * 5;
  const right = time(h, m);
  const said = time(h, m === 0 ? 5 : m / 5);
  const pool = [right, said, time(hour12(h + 1), m), time(hour12(h - 1), m), time(h, (m + 10) % 60)];
  const times = rng.shuffle([...new Set(pool)]).slice(0, 4);
  if (!times.includes(right)) times[0] = right;
  const choices = times.map(t => ({ id: t, label: t, html: `<span class="gnum">${t}</span>` }));
  const pointed = m === 0 ? 12 : m / 5;
  const why = `The short hand is on ${h}, so the hour is ${h}. The long hand points at ${pointed}, and each number is 5 minutes, so that is ${m} minutes. Reading ${pointed} as ${m === 0 ? 5 : pointed} minutes is the usual slip. The time is ${right}.`;
  return {
    prompt: 'What time does the clock show?',
    say: 'What time does the clock show? The short hand is the hour.',
    visual: clockFace(h, m),
    choices,
    answer: right,
    why,
    facts: { h, m, right },
  };
}
