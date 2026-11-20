import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, MIN_LEVEL, MAX_LEVEL, levelInfo, clampLevel, levelTitle, nextLevel, levelName, levelFull } from '../js/levels.js';
import { freshState } from '../js/core/state.js';
import { skillsOf, storySources, storySkillOf, isEarlySkill } from '../js/skills/registry.js';
import * as P from '../js/core/progression.js';
import { phaseSplit } from '../js/core/daily.js';
import { mixChoice } from '../js/core/mix.js';
import { autoFocus } from '../js/core/focus.js';
import { startPlacement, answerPlacement } from '../js/placement.js';
import { setCurrentLevel, startFromBeginning, applyPlacement } from '../js/core/entry.js';
import { withFakeSkills, fake } from './fixtures/fake-skills.js';
const learner = level => { const s = freshState('T', '2026-11-19'); s.placed = true; s.level = level; return s; };
const master = (S, ids) => ids.forEach(id => { S.skills[id] = { L: 3, run: 0, miss: 0, hist: [], n: 9, c: 9, last: null, mastered: true, rev: null }; });
test('level 0 is the first rung, titled Early Start, with a grade range for grown-ups only', () => {
  assert.equal(LEVELS[0].n, 0); assert.equal(MIN_LEVEL, 0); assert.equal(MAX_LEVEL, 7);
  assert.equal(levelInfo(0).title, 'Early Start'); assert.equal(levelInfo(0).grades, 'K to 1');
  assert.equal(levelName(0), 'Early Start'); assert.equal(levelFull(0), 'Early Start');
  assert.equal(levelName(3), 'Level 3'); assert.equal(levelFull(3), `Level 3: ${levelTitle(3)}`);
  assert.equal(nextLevel(0), 1); assert.equal(nextLevel(7), null); assert.equal(nextLevel(99), null);
});
test('clampLevel keeps 0 and does not turn it into 1; garbage becomes 1', () => {
  assert.equal(clampLevel(0), 0); assert.equal(clampLevel('0'), 0); assert.equal(clampLevel(-3), 0); assert.equal(clampLevel(99), 7);
  assert.equal(clampLevel(NaN), 1); assert.equal(clampLevel('x'), 1); assert.equal(clampLevel(undefined), 1);
});
test('every exported function that takes a level copes with 0', () => {
  const S = learner(0); S.early = true;
  const table = {
    levelInfo: () => levelInfo(0), clampLevel: () => clampLevel(0), levelTitle: () => levelTitle(0), nextLevel: () => nextLevel(0),
    levelName: () => levelName(0), levelFull: () => levelFull(0), skillsOf: () => skillsOf(0), storySources: () => storySources(0),
    storySkillOf: () => storySkillOf(0), hasSkills: () => P.hasSkills(0), enabledIn: () => P.enabledIn(S, 0), requiredIn: () => P.requiredIn(S, 0),
    levelProgress: () => P.levelProgress(S, 0), levelComplete: () => P.levelComplete(S, 0), unlockedLevel: () => P.unlockedLevel(S),
    workingLevel: () => P.workingLevel(S), reviewPool: () => P.reviewPool(S), phaseSplit: () => phaseSplit(S), autoFocus: () => autoFocus(S),
    setCurrentLevel: () => setCurrentLevel(learner(3), 0),
  };
  for (const [name, fn] of Object.entries(table)) assert.doesNotThrow(fn, name);
  assert.equal(table.levelInfo().n, 0); assert.equal(table.clampLevel(), 0); assert.equal(table.levelTitle(), 'Early Start');
  assert.ok(Array.isArray(table.skillsOf()) && table.skillsOf().every(s => s.level === 0));
  assert.ok(table.skillsOf().length > 0 ? table.hasSkills() : !table.hasSkills());
  assert.equal(table.workingLevel(), table.hasSkills() ? 0 : 1);
  assert.equal(table.unlockedLevel(), 0); assert.equal(table.setCurrentLevel(), 0);
  const p = table.levelProgress(); assert.equal(p.done, 0); assert.equal(p.total, table.requiredIn().length);
  assert.equal(table.levelComplete(), false); assert.deepEqual(table.storySources(), table.storySources());
});
test('finishing Early Start unlocks Level 1 and makes it current, once', () => {
  withFakeSkills([fake('e1', { level: 0 }), fake('e2', { level: 0 }), fake('n1', { level: 1 })], () => {
    const S = learner(0); S.early = true;
    assert.equal(P.unlockedLevel(S), 0); master(S, ['e1']);
    assert.deepEqual(P.levelProgress(S, 0), { done: 1, total: 2 }); assert.equal(P.checkLevelUp(S), null);
    master(S, ['e2']);
    assert.equal(P.levelComplete(S, 0), true);
    assert.deepEqual(P.checkLevelUp(S), { done: 0, next: 1 });
    assert.equal(S.level, 1); assert.deepEqual(S.levelsDone, [0]); assert.equal(P.unlockedLevel(S), 1);
    assert.equal(P.checkLevelUp(S), null);
  });
});
test('the real Early Start skills can all be mastered to finish the level', () => {
  const S = learner(0); S.early = true; const req = P.requiredIn(S, 0);
  assert.ok(req.length > 0); master(S, req.map(s => s.id));
  assert.deepEqual(P.checkLevelUp(S), { done: 0, next: 1 });
});
test('only early learners practice Early Start skills from a higher level', () => {
  withFakeSkills([fake('e1', { level: 0 }), fake('n1', { level: 1 })], () => {
    const a = learner(1); a.skills.e1 = { n: 4 }; a.skills.n1 = { n: 4 };
    assert.deepEqual(P.reviewPool(a).map(s => s.id), ['n1']);
    const b = learner(1); b.early = true; b.skills.e1 = { n: 4 }; b.skills.n1 = { n: 4 };
    assert.deepEqual(P.reviewPool(b).map(s => s.id).sort(), ['e1', 'n1']);
    const empty = learner(1); withFakeSkills([fake('e1', { level: 0 })], () => assert.equal(P.workingLevel(empty), 1));
  });
});
test('daily split at level 0 has no times tables warm-up; level 2 still does', () => {
  assert.deepEqual(phaseSplit(learner(0)), { facts: 0, focus: 0.8, mix: 0.2 });
  assert.equal(phaseSplit(learner(2)).facts, 0.4);
});
test('the Mix-up phase never asks times tables at Early Start', () => {
  withFakeSkills([fake('e1', { level: 0 }), fake('e2', { level: 0 })], () => {
    const S = learner(0); S.early = true; S.skills.e1 = { n: 3 }; S.skills.e2 = { n: 3 };
    for (const r of [0, 0.05, 0.1, 0.14, 0.2, 0.5, 0.9]) assert.notEqual(mixChoice(S, { focus: 'e1', now: '2026-11-19', rand: () => r }).id, 'facts');
  });
});
// Feeds every right/miss sequence (a skip is a miss) up to the question limit.
function everySequence(available) {
  const seen = [];
  for (let len = 1; len <= 14; len++) for (let bits = 0; bits < 2 ** len; bits++) {
    const p = startPlacement(available);
    for (let i = 0; i < len; i++) { const r = answerPlacement(p, !!((bits >> i) & 1)); if (r !== null) { seen.push(r); break; } }
    if (p.result !== null) seen.push(p.result);
  }
  return seen;
}
test('placement never returns 0, for every answer sequence including all misses, with Early Start in the list', () => {
  for (const avail of [[0, 1, 2, 3, 4, 5, 6, 7], [0, 1], [0, 2, 3], [0], [0, 1, 2]]) {
    const out = everySequence(avail);
    assert.ok(out.length > 0); assert.ok(out.every(n => n >= 1), `a 0 came out for ${avail}`);
  }
  const p = startPlacement([0, 1, 2]); assert.equal(answerPlacement(p, false), null); assert.equal(answerPlacement(p, false), 1);
  assert.equal(startPlacement([0, 1]).level, 1); assert.equal(applyPlacement(learner(1), 0).level, 1);
});
