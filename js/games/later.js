// A start time plus some minutes, or the minutes between two times.
import { clockFace } from '../skills/level1/clock.js';
import { four } from './pack.js';

export const laterMeta = {
  id: 'later',
  title: 'How much later',
  blurb: 'Count the minutes on.',
  skill: 'l2clock',
  levels: [1, 2],
};

const pad = m => String(m).padStart(2, '0');
export const stamp = (h, m) => `${h}:${pad(m)}`;

export function ahead(h, m, add) {
  const mins = (h % 12) * 60 + m + add;
  const hour = Math.floor(mins / 60) % 12;
  return { h: hour === 0 ? 12 : hour, m: mins % 60 };
}

function timeChoice(t) {
  const id = stamp(t.h, t.m);
  return { id, label: id, html: `<span class="gnum">${id}</span>` };
}

function minuteChoice(n) {
  return { id: String(n), label: `${n} minutes`, html: `<span class="gnum word">${n} minutes</span>` };
}

export function makeLater(rng, level = 1) {
  const h = rng.int(1, 12);
  const m = level <= 1 ? rng.pick([0, 30]) : rng.int(0, 11) * 5;
  const add = level <= 1 ? rng.pick([30, 60]) : rng.pick([10, 15, 20, 25, 35, 40, 45, 50]);
  const end = ahead(h, m, add);
  const ask = rng.int(0, 1) ? 'end' : 'gap';
  const start = stamp(h, m);
  const finish = stamp(end.h, end.m);
  if (ask === 'gap') {
    const slips = [add + 30, add + 60, Math.abs(add - 15), 60].filter(n => n > 0 && n !== add);
    const why = `From ${start} to ${finish} is ${add} minutes. Count on from the start. When the count passes 60 minutes, that is one hour, and the extra minutes are what is left.`;
    return {
      prompt: `How many minutes from ${start} to ${finish}?`,
      say: `How many minutes pass from ${start} to ${finish}?`,
      visual: `<div class="clocks">${clockFace(h, m)}${clockFace(end.h, end.m)}</div>`,
      choices: four(rng, [add, ...slips].map(minuteChoice)),
      answer: String(add),
      why,
      facts: { h, m, add, ask },
    };
  }
  const slips = [ahead(h, m, 0), ahead(h, m, add + 60), ahead(h % 12 + 1, m, 0), ahead(h, m, Math.max(5, add - 10))];
  const why = `Start at ${start}. ${add} minutes later is ${finish}. Add the minutes to ${m}. If that reaches 60, the hour goes up by 1 and the leftover minutes stay.`;
  return {
    prompt: `It is ${start}. What time is it ${add} minutes later?`,
    say: `It is ${start}. What time is it ${add} minutes later?`,
    visual: clockFace(h, m),
    choices: four(rng, [timeChoice(end), ...slips.map(timeChoice)]),
    answer: finish,
    why,
    facts: { h, m, add, ask },
  };
}
