// Spaced review of mastered skills. Pure: every function takes the date as a string, so tests can inject it.
import { addDays } from './dates.js';
export const INTERVALS = [2, 5, 10, 21, 45];
const TOP = INTERVALS.length - 1;
// rev = { stage, due, miss }: `stage` picks the gap used after the last review, `due` is the next review day.
export const startReview = now => ({ stage: 0, due: addDays(now, INTERVALS[0]), miss: 0 });
export const isDue = (sk, now) => !!sk?.mastered && !!sk.rev && sk.rev.due <= now;
// Ids of mastered, enabled skills whose review day has come, oldest due first.
export function dueReviews(S, now) {
return Object.entries(S.skills)
.filter(([id, sk]) => isDue(sk, now) && !S.settings.off[id])
.sort((a, b) => a[1].rev.due.localeCompare(b[1].rev.due) || a[0].localeCompare(b[0]))
.map(([id]) => id);
}
export const dueCount = (S, now) => dueReviews(S, now).length;
// res: 'right' (first try), 'half' (right after help: same stage, asked again later), 'wrong'.
// Two wrong reviews in a row take the skill off the mastered list, back to step 3. Returns { slipped }.
export function recordReview(sk, res, now) {
const r = sk.rev ||= startReview(now);
if (res === 'right') { r.stage = Math.min(TOP, r.stage + 1); r.miss = 0; }
else if (res === 'wrong') { r.stage = Math.max(0, r.stage - 1); r.miss++; }
r.due = addDays(now, INTERVALS[r.stage]);
if (r.miss < 2) return { slipped: false };
sk.mastered = false; sk.L = 3; sk.run = 0; sk.miss = 0; sk.hist = []; sk.rev = null;
return { slipped: true };
}
