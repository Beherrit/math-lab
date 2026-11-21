// Spaced review of mastered skills. Pure: every function takes the date as a string, so tests can inject it.
import { addDays, daysBetween } from './dates.js';
import { SKILL } from '../skills/registry.js';
export const INTERVALS = [2, 5, 10, 21, 45];
const TOP = INTERVALS.length - 1;
// rev = { stage, due, miss }: `stage` picks the gap used after the last review, `due` is the next review day.
export const startReview = now => ({ stage: 0, due: addDays(now, INTERVALS[0]), miss: 0 });
export const isDue = (sk, now) => !!sk?.mastered && typeof sk.rev?.due === 'string' && sk.rev.due <= now;
// Ids of mastered, enabled skills the app still knows whose review day has come, oldest due first.
// Ids saved by an older or newer version are ignored here, never dropped from the saved state.
export function dueReviews(S, now) {
return Object.entries(S.skills)
.filter(([id, sk]) => SKILL[id] && isDue(sk, now) && !S.settings.off[id])
.sort((a, b) => a[1].rev.due.localeCompare(b[1].rev.due) || a[0].localeCompare(b[0]))
.map(([id]) => id);
}
export const dueCount = (S, now) => dueReviews(S, now).length;
// Right on the first try, without help, is the only pass ('right'); anything else is a miss ('wrong').
// Two misses in a row take the skill off the mastered list, back to step 3. Returns { slipped }.
export function recordReview(sk, res, now) {
const r = sk.rev ||= startReview(now);
if (res === 'right') { r.stage = Math.min(TOP, r.stage + 1); r.miss = 0; }
else { r.stage = Math.max(0, r.stage - 1); r.miss++; }
r.due = addDays(now, INTERVALS[r.stage]);
if (r.miss < 2) return { slipped: false };
sk.mastered = false; sk.L = 3; sk.run = 0; sk.miss = 0; sk.hist = []; sk.rev = null;
return { slipped: true };
}
// A skill mastered before schedules existed. The longer ago it was last practiced, the later its stage; when that
// first review day is already past, it is spread over the next SPREAD_DAYS days (the same day for the same skill id),
// so a learner with many old skills does not meet them all at once.
export const SPREAD_DAYS = 21;
const STAGE_AFTER = [0, 7, 21, 45]; // days since last practice at which each stage starts
const spread = id => [...id].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7) % SPREAD_DAYS;
export function migratedReview(id, from, now) {
const age = Math.max(0, daysBetween(from, now));
const stage = STAGE_AFTER.filter(d => age >= d).length - 1;
const natural = addDays(from, INTERVALS[stage]);
return { stage, due: natural > now ? natural : addDays(now, 1 + spread(id)), miss: 0 };
}
