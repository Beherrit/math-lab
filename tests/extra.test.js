import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState } from '../js/core/state.js';
import { extraNext } from '../js/core/extra.js';
import { pathPick } from '../js/core/focus.js';
import { checkLevelUp } from '../js/core/progression.js';
import { completeDay, addTime, dayLog } from '../js/core/daily.js';
import { withFakeSkills, fake } from './fixtures/fake-skills.js';
const skills = () => [fake('a'), fake('b'), fake('c', { level: 2 })];
const learner = () => { const S = freshState('T', '2026-11-01'); S.placed = true; S.level = 1; return S; };
const sk = (extra = {}) => ({ L: 1, run: 0, miss: 0, hist: [], n: 3, c: 2, last: null, mastered: false, rev: null, ...extra });
const ctx = { now: '2026-11-10', rand: () => 0.9, pick: l => l[0] };
const run = (S, ex, n) => Array.from({ length: n }, () => extraNext(S, ex, ctx).id);
test('keep going alternates the focus skill and the mix', () => {
  withFakeSkills(skills(), () => {
    const S = learner(); S.skills.a = sk(); S.skills.b = sk();
    assert.deepEqual(run(S, { n: 0, focus: 'a' }, 6), ['a', 'b', 'a', 'b', 'a', 'b']);
  });
});
test('due reviews come first in the mix turns', () => {
  withFakeSkills(skills(), () => {
    const S = learner(); S.skills.a = sk(); S.skills.b = sk({ mastered: true, rev: { stage: 0, due: '2026-11-05', miss: 0 } });
    const ex = { n: 0, focus: 'a' };
    assert.deepEqual([extraNext(S, ex, ctx), extraNext(S, ex, ctx)], [{ id: 'a', review: false }, { id: 'b', review: true }]);
  });
});
test('when the focus skill is mastered it moves to the next skill on the path', () => {
  withFakeSkills(skills(), () => {
    const S = learner(); S.skills.a = sk({ mastered: true });
    const ex = { n: 0, focus: 'a' }; assert.equal(extraNext(S, ex, ctx).id, 'b'); assert.equal(ex.focus, 'b');
  });
});
test('keep going carries on across a level-up into the next level', () => {
  withFakeSkills(skills(), () => {
    const S = learner(); S.skills.a = sk({ mastered: true }); S.skills.b = sk({ mastered: true });
    assert.deepEqual(checkLevelUp(S), { done: 1, next: 2 });
    const ex = { n: 0, focus: 'b' }; assert.equal(extraNext(S, ex, ctx).id, 'c'); assert.equal(pathPick(S), 'c');
  });
});
test('with every skill mastered it still keeps going (facts), never ending', () => {
  withFakeSkills([fake('a')], () => {
    const S = learner(); S.skills.a = sk({ mastered: true });
    const ids = run(S, { n: 0, focus: 'a' }, 4); assert.equal(ids.length, 4); assert.ok(ids.every(Boolean));
  });
});
test('extra time adds to the day log without moving the streak again', () => {
  const S = learner();
  assert.equal(completeDay(S), true); assert.equal(S.streak.n, 1); addTime(S, 10 * 60000);
  assert.equal(completeDay(S), false); addTime(S, 5 * 60000);
  assert.equal(S.streak.n, 1); assert.equal(dayLog(S).ms, 15 * 60000); assert.equal(dayLog(S).done, true);
  addTime(S, 5 * 3600000); assert.equal(dayLog(S).ms, 15 * 60000 + 60 * 60000); // one idle gap is capped
});
