// How many due reviews may reach the child, so they never crowd out the rest: a few a day, and a share of each
// stretch of questions (at most one Mix-up question in three, one keep-going question in four).
export const MAX_REVIEWS_PER_DAY = 4;
export const MIX_SHARE = 3;
export const EXTRA_SHARE = 4;
export const reviewsToday = (S, day) => S.days?.[day]?.rv || 0;
// gate = { n: questions asked so far in this stretch, revs: reviews among them, share }. No gate: only the daily limit applies.
export function reviewAllowed(S, day, gate) {
if (reviewsToday(S, day) >= MAX_REVIEWS_PER_DAY) return false;
return !gate || (gate.revs + 1) * gate.share <= gate.n + 1;
}
