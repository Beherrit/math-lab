// The lesson as the app runs it (session layer, with a stub document): answers must not feed progress.
import test from 'node:test';
import assert from 'node:assert/strict';
const el = () => ({ innerHTML: '', hidden: false, offsetHeight: 0, style: {}, dataset: {}, classList: { add() { }, remove() { }, contains: () => false }, scrollIntoView() { }, closest: () => null, addEventListener() { }, querySelector: () => null, querySelectorAll: () => [] });
const app = el();
globalThis.document = { getElementById: () => app, querySelector: () => el(), querySelectorAll: () => [] };
globalThis.requestAnimationFrame = f => f();
const { freshState } = await import('../js/core/state.js');
const { setState } = await import('../js/core/store.js');
const { skillsOf, generate } = await import('../js/skills/registry.js');
const { lessonActions, lessonState } = await import('../js/session/lesson-run.js');
const { submit } = await import('../js/session/answer.js');
const { inp } = await import('../js/session/state.js');
const numSkill = () => skillsOf(1).find(s => !s.story && Array.from({ length: 6 }, () => generate(s.id, 1)?.answer.kind).every(k => k === 'num'));
test('answers given in a lesson, right or wrong, never change mastery, stars, streak or the day log', async () => {
  const st = freshState('T', '2026-11-19'); st.placed = true; st.level = 1; setState(st);
  const { S: live } = await import('../js/core/store.js');
  const strip = ({ learned, ...rest }) => JSON.stringify(rest);
  const before = strip(live);
  const sk = numSkill(); assert.ok(sk, 'a level-1 skill with typed answers');
  lessonActions.learn({ dataset: { id: sk.id } }); lessonActions.lnext();
  for (let i = 0; i < 40; i++) lessonActions.lstep();
  lessonActions.lnext();
  const l = lessonState().lesson; assert.equal(l.stage, 'together');
  for (let turn = 0; turn < 3; turn++) {
    inp.val = '99999'; submit();
    assert.equal(l.task.solved, false, 'a wrong answer does not solve it'); assert.ok(l.task.hint);
    assert.equal(strip(live), before);
    inp.val = String(l.task.p.answer.value); submit();
    assert.equal(l.task.solved, true); assert.equal(strip(live), before);
    lessonActions.lnext();
  }
  assert.equal(l.stage, 'done'); assert.equal(strip(live), before);
  assert.ok(live.learned[sk.id], 'finishing records learned');
  assert.equal(live.stars, 0); assert.deepEqual(live.skills, {}); assert.deepEqual(live.days, {});
});
