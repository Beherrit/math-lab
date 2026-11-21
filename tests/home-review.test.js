import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState } from '../js/core/state.js';
import { INTERVALS, startReview } from '../js/core/review.js';
import { reviewQuestions, applyQuietReview, REVIEW_MIN, REVIEW_MAX } from '../js/core/home-review.js';

const mastered = due => ({ L: 3, run: 0, miss: 0, hist: [], n: 9, c: 9, last: '2026-11-01', mastered: true, rev: { stage: 1, due, miss: 0 } });

function learner() {
  const S = freshState('Ada', '2026-11-01');
  S.placed = true;
  S.level = 0;
  S.stars = 12;
  return S;
}

test('the saved schedule still grows, and a miss shortens it', () => {
  assert.deepEqual(INTERVALS, [2, 5, 10, 21, 45]);
  const S = learner();
  S.skills.l0shapes = mastered('2026-11-10');
  assert.equal(startReview('2026-11-01').due, '2026-11-03');
  applyQuietReview(S, 'l0shapes', 'right', '2026-11-10');
  assert.equal(S.skills.l0shapes.rev.stage, 2);
  assert.equal(S.skills.l0shapes.rev.due, '2026-11-20');
  applyQuietReview(S, 'l0shapes', 'wrong', '2026-11-20');
  assert.equal(S.skills.l0shapes.rev.stage, 1);
  assert.equal(S.skills.l0shapes.rev.due, '2026-11-25');
  assert.equal(S.stars, 12);
});

test('home review asks three to five due skills and leaves stars alone', () => {
  const S = learner();
  assert.deepEqual(reviewQuestions(S, '2026-11-21'), []);
  S.skills.one = mastered('2026-11-01');
  assert.deepEqual(reviewQuestions(S, '2026-11-21'), ['one', 'one', 'one']);
  for (const id of ['a', 'b', 'c', 'd', 'e', 'f']) S.skills[id] = mastered(`2026-11-0${id.charCodeAt(0) % 7 + 1}`);
  const many = reviewQuestions(S, '2026-11-21');
  assert.equal(many.length, REVIEW_MAX);
  assert.ok(many.length >= REVIEW_MIN && many.length <= REVIEW_MAX);
  const before = S.stars;
  applyQuietReview(S, many[0], 'wrong', '2026-11-21');
  applyQuietReview(S, many[0], 'wrong', '2026-11-21');
  assert.equal(S.stars, before);
});
