// The short review on the home screen. It uses the saved schedule and never changes stars.
import { dueReviews, recordReview } from './review.js';

export const REVIEW_MIN = 3;
export const REVIEW_MAX = 5;

// Three to five questions. A single due skill is asked more than once so the set still has three.
export function reviewQuestions(S, now) {
  const due = dueReviews(S, now);
  if (!due.length) return [];
  const n = Math.min(REVIEW_MAX, Math.max(REVIEW_MIN, due.length));
  return Array.from({ length: n }, (_, i) => due[i % due.length]);
}

// Records the review and puts the star count back, so a miss cannot lower it.
export function applyQuietReview(S, id, res, now) {
  const stars = S.stars;
  const out = recordReview(S.skills[id], res, now);
  S.stars = stars;
  return out;
}
