import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState } from '../js/core/state.js';
import { skillsOf } from '../js/skills/registry.js';
import { levelComplete, levelProgress, checkLevelUp, unlockedLevel, workingLevel, reviewPool, requiredIn } from '../js/core/progression.js';
import { autoFocus } from '../js/core/focus.js';
import { phaseSplit } from '../js/core/daily.js';
import { recordSkill } from '../js/core/mastery.js';
const learner = level => { const s = freshState('T', '2026-11-19'); s.placed = true; s.level = level; return s; };
const master = (S, ids) => ids.forEach(id => { S.skills[id] = { L: 3, run: 0, miss: 0, hist: [], n: 9, c: 9, last: null, mastered: true }; });
test('level 4 is not complete until every enabled school skill is mastered', () => {
  const S = learner(4);
  const req = requiredIn(S, 4).map(s => s.id);
  master(S, req.slice(0, -1));
  assert.equal(levelComplete(S, 4), false);
  assert.equal(checkLevelUp(S), null);
  master(S, req.slice(-1));
  assert.equal(levelComplete(S, 4), true);
});
test('completing level 4 unlocks level 5 and makes it current, once', () => {
  const S = learner(4); master(S, requiredIn(S, 4).map(s => s.id));
  assert.deepEqual(checkLevelUp(S), { done: 4, next: 5 });
  assert.equal(S.level, 5); assert.deepEqual(S.levelsDone, [4]);
  assert.equal(unlockedLevel(S), 5);
  assert.equal(checkLevelUp(S), null);
});
test('switching a skill off removes it from the requirement', () => {
  const S = learner(4); const req = requiredIn(S, 4).map(s => s.id);
  master(S, req.slice(1)); assert.equal(levelComplete(S, 4), false);
  S.settings.off[req[0]] = true; assert.equal(levelComplete(S, 4), true);
});
test('non-school skills do not block completion', () => {
  const S = learner(4); const extra = skillsOf(4).filter(s => !s.school);
  assert.ok(extra.length > 0);
  master(S, requiredIn(S, 4).map(s => s.id));
  assert.ok(extra.every(s => !S.skills[s.id]));
  assert.equal(levelComplete(S, 4), true);
});
test('an empty level is never complete and never breaks progress or focus', () => {
  const S = learner(2);
  assert.deepEqual(levelProgress(S, 2), { done: 0, total: 0 });
  assert.equal(levelComplete(S, 2), false); assert.equal(checkLevelUp(S), null);
  assert.equal(workingLevel(S), 4);
  assert.ok(autoFocus(S));
  assert.deepEqual(reviewPool(S), []);
});
test('lower levels stay unlocked: a learner placed at 4 can see 1-4 but not 5', () => {
  const S = learner(4); assert.equal(unlockedLevel(S), 4);
});
test('the mix pool uses practiced skills only', () => {
  const S = learner(4); S.skills.oa = { L: 1, run: 0, miss: 0, hist: [], n: 3, c: 1, last: null, mastered: false };
  assert.deepEqual(reviewPool(S).map(s => s.id), ['oa']);
  assert.deepEqual(reviewPool(S, 'oa'), []);
});
test('facts phase shrinks to 15% once 90% of the 78 facts are solid', () => {
  const S = learner(4);
  assert.deepEqual(phaseSplit(S), { facts: 0.4, focus: 0.4, mix: 0.2 });
  const keys = []; for (let a = 1; a <= 12; a++) for (let c = a; c <= 12; c++) keys.push(`${a}x${c}`);
  keys.slice(0, 71).forEach(k => { S.facts[k] = { b: 4, n: 5, c: 5, t: 2000 }; });
  const p = phaseSplit(S);
  assert.equal(p.facts, 0.15); assert.ok(Math.abs(p.facts + p.focus + p.mix - 1) < 1e-9); assert.equal(p.mix, 0.2);
  S.facts[keys[70]].b = 0;
  assert.equal(phaseSplit(S).facts, 0.4);
});
test('mastery rules are unchanged: 4 right to step 2, 5 to step 3, 7 of 8 to master', () => {
  const S = learner(4);
  for (let i = 0; i < 4; i++) recordSkill(S, 'oa', 'right');
  assert.equal(S.skills.oa.L, 2);
  for (let i = 0; i < 5; i++) recordSkill(S, 'oa', 'right');
  assert.equal(S.skills.oa.L, 3);
  let out; for (let i = 0; i < 8; i++) out = recordSkill(S, 'oa', 'right');
  assert.equal(S.skills.oa.mastered, true); assert.ok(out.mastered || S.skills.oa.mastered);
});
