import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState } from '../js/core/state.js';
import { INTERVALS, startReview, recordReview, dueReviews, dueCount } from '../js/core/review.js';
import { skillsOf } from '../js/skills/registry.js';
import { mixChoice } from '../js/core/mix.js';
import { recordSkill } from '../js/core/mastery.js';
const mastered = (due, stage = 0) => ({ L: 3, run: 0, miss: 0, hist: [], n: 9, c: 9, last: '2026-11-01', mastered: true, rev: { stage, due, miss: 0 } });
const learner = () => { const S = freshState('T', '2026-11-01'); S.placed = true; S.level = 1; return S; };
test('the schedule is 2, 5, 10, 21, 45 days and stays at 45', () => {
  assert.deepEqual(INTERVALS, [2, 5, 10, 21, 45]);
  const sk = mastered('2026-11-03'); let day = '2026-11-03'; const gaps = [];
  assert.deepEqual(startReview('2026-11-01'), { stage: 0, due: '2026-11-03', miss: 0 });
  for (let i = 0; i < 6; i++) { recordReview(sk, 'right', day); gaps.push(sk.rev.due); day = sk.rev.due; }
  assert.deepEqual(gaps, ['2026-11-08', '2026-11-18', '2026-12-09', '2027-01-23', '2027-03-09', '2027-04-23']);
});
test('a miss moves back one stage; two misses in a row put the skill back to step 3 in practice', () => {
  const sk = mastered('2026-11-10', 3);
  assert.deepEqual(recordReview(sk, 'wrong', '2026-11-10'), { slipped: false });
  assert.equal(sk.rev.stage, 2); assert.equal(sk.rev.due, '2026-11-20'); assert.equal(sk.mastered, true);
  const out = recordReview(sk, 'wrong', '2026-11-20');
  assert.equal(out.slipped, true); assert.equal(sk.mastered, false); assert.equal(sk.L, 3); assert.equal(sk.rev, null); assert.deepEqual(sk.hist, []);
});
test('a right answer between two misses resets the miss count', () => {
  const sk = mastered('2026-11-10', 2);
  recordReview(sk, 'wrong', '2026-11-10'); recordReview(sk, 'right', '2026-11-15'); recordReview(sk, 'wrong', '2026-11-20');
  assert.equal(sk.mastered, true);
});
test('a half answer (right after help) keeps the stage and asks again later', () => {
  const sk = mastered('2026-11-10', 2); recordReview(sk, 'half', '2026-11-10');
  assert.equal(sk.rev.stage, 2); assert.equal(sk.rev.due, '2026-11-20');
});
test('mastering a skill starts its schedule', () => {
  const S = learner(); S.skills.s = { L: 3, run: 0, miss: 0, hist: Array(7).fill(true), n: 20, c: 20, last: null, mastered: false, rev: null };
  recordSkill(S, 's', 'right'); assert.equal(S.skills.s.mastered, true); assert.equal(S.skills.s.rev.stage, 0);
});
test('due reviews are those mastered, enabled and due, oldest first', () => {
  const S = learner();
  S.skills.a = mastered('2026-11-05'); S.skills.b = mastered('2026-11-02'); S.skills.c = mastered('2026-11-20'); S.skills.d = mastered('2026-11-01');
  S.settings.off.d = true; S.skills.e = { ...mastered('2026-11-01'), mastered: false };
  assert.deepEqual(dueReviews(S, '2026-11-10'), ['b', 'a']); assert.equal(dueCount(S, '2026-11-10'), 2);
  assert.equal(dueCount(S, '2026-10-01'), 0);
});
test('the mix draws due reviews first, then its normal mix', () => {
  const [A, B] = skillsOf(1).filter(k => !k.story).map(k => k.id);
  const S = learner(); S.skills[A] = mastered('2026-11-05'); S.skills[B] = mastered('2026-11-02');
  const rand = () => 0.01; const at = r => mixChoice(S, { focus: 'x', now: '2026-11-10', rand: r || rand, pick: l => l[0] });
  assert.deepEqual(at(), { id: B, review: true });
  recordReview(S.skills[B], 'right', '2026-11-10');
  assert.deepEqual(at(), { id: A, review: true });
  recordReview(S.skills[A], 'right', '2026-11-10');
  assert.deepEqual(at(), { id: 'facts', review: false });
  const p = at(() => 0.9);
  assert.equal(p.review, false); assert.ok([A, B].includes(p.id));
});
