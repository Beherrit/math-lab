// Day log, streak, and how a daily session is split between facts, focus and mix.
import { today, addDays } from './dates.js';
import { solidCount, ALL_KEYS } from './facts.js';
export function streakNow(S) { const s = S.streak; if (!s.last) return 0; return (s.last === today() || s.last === addDays(today(), -1)) ? s.n : 0; }
export const dayLog = S => S.days[today()] ||= { ms: 0, q: 0, c: 0, done: false };
// Fractions of the session. Once 90% of the 78 facts are solid, facts shrink to 15% and focus gets the difference.
export function phaseSplit(S) {
// Level 1 comes before multiplication is taught, so its daily page has no times tables warm-up.
if (S.level < 2) return { facts: 0, focus: 0.8, mix: 0.2 };
const strong = solidCount(S) / ALL_KEYS.length >= 0.9;
return strong ? { facts: 0.15, focus: 0.65, mix: 0.2 } : { facts: 0.4, focus: 0.4, mix: 0.2 };
}
// Marks today's page done and moves the streak. Returns true when the streak went up.
export function completeDay(S) {
const dl = dayLog(S); if (dl.done) return false;
dl.done = true;
if (S.streak.last === today()) return false;
S.streak.n = S.streak.last === addDays(today(), -1) ? S.streak.n + 1 : 1; S.streak.last = today();
return true;
}
