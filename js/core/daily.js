// Day log, streak, and how a daily session is split between facts, focus and mix.
import { today, addDays } from './dates.js';
import { solidCount, ALL_KEYS } from './facts.js';
import { factsAllowed } from './progression.js';
export function streakNow(S) { const s = S.streak; if (!s.last) return 0; return (s.last === today() || s.last === addDays(today(), -1)) ? s.n : 0; }
// The log of one day (default today); `rv` counts the reviews asked that day.
export const dayLog = (S, day = today()) => S.days[day] ||= { ms: 0, q: 0, c: 0, done: false };
export function countReview(S, day) { const dl = dayLog(S, day); dl.rv = (dl.rv || 0) + 1; }
// Fractions of the session. Once 90% of the 78 facts are solid, facts shrink to 15% and focus gets the difference.
export function phaseSplit(S) {
// Levels 0 and 1 come before multiplication is taught, so their daily page has no times tables warm-up.
if (!factsAllowed(S)) return { facts: 0, focus: 0.8, mix: 0.2 };
const strong = solidCount(S) / ALL_KEYS.length >= 0.9;
return strong ? { facts: 0.15, focus: 0.65, mix: 0.2 } : { facts: 0.4, focus: 0.4, mix: 0.2 };
}
// Active time only: one question's time from when it appeared to its answer, never more than this.
export const MAX_QUESTION_MS = 3 * 60000;
// Adds a question's time to the log of `day` (extra practice after the page is done counts too). Never touches the streak.
export function addTime(S, ms, day = today()) { dayLog(S, day).ms += Math.max(0, Math.min(ms, MAX_QUESTION_MS)); }
// Marks the page that was started on `day` done and moves the streak. Returns true when the streak went up.
export function completeDay(S, day = today()) {
const dl = dayLog(S, day); if (dl.done) return false;
dl.done = true;
if (S.streak.last === day) return false;
S.streak.n = S.streak.last === addDays(day, -1) ? S.streak.n + 1 : 1; S.streak.last = day;
return true;
}
