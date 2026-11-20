import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState } from '../js/core/state.js';
import { autoFocus, getFocus, logFocus, MAX_STARTED } from '../js/core/focus.js';
import { today } from '../js/core/dates.js';
import { withFakeSkills, fake } from './fixtures/fake-skills.js';
const ids = 'abcdefgh'.split('');
const skills = () => ids.map(i => fake(i));
const learner = () => { const S = freshState('T', '2026-11-01'); S.placed = true; S.level = 1; return S; };
const st = (S, id, extra = {}) => { S.skills[id] = { L: 1, run: 0, miss: 0, hist: [], n: 3, c: 2, last: null, mastered: false, rev: null, ...extra }; };
test('a new learner starts at the first skill of the path', () => {
  withFakeSkills(skills(), () => assert.equal(autoFocus(learner()), 'a'));
});
test('the path follows array order and skips mastered skills', () => {
  withFakeSkills(skills(), () => { const S = learner(); st(S, 'a', { mastered: true }); st(S, 'b', { mastered: true }); assert.equal(autoFocus(S), 'c'); });
});
test('a started skill beats an earlier skill that was never started', () => {
  withFakeSkills(skills(), () => { const S = learner(); st(S, 'c'); assert.equal(autoFocus(S), 'c'); st(S, 'b'); assert.equal(autoFocus(S), 'b'); });
});
test('three days on the same skill moves along the path: to a new one when few are started', () => {
  withFakeSkills(skills(), () => {
    const S = learner(); st(S, 'a'); S.focusLog = ['2026-11-01', '2026-11-02', '2026-11-03'].map(d => ({ d, id: 'a' }));
    assert.equal(autoFocus(S), 'b');
  });
});
test('with more than three started skills the rotation stays among them, never jumps to a new one', () => {
  withFakeSkills(skills(), () => {
    const S = learner(); ['a', 'b', 'c', 'd'].forEach(i => st(S, i)); assert.ok(MAX_STARTED < 4);
    S.focusLog = ['2026-11-01', '2026-11-02', '2026-11-03'].map(d => ({ d, id: 'a' }));
    assert.equal(autoFocus(S), 'b');
    S.skills.b.mastered = true; S.skills.c.mastered = true; S.skills.d.mastered = true; // only a started: new skill allowed
    assert.equal(autoFocus(S), 'e');
  });
});
test('the manual choice wins, for the day, even over the path', () => {
  withFakeSkills(skills(), () => {
    const S = learner(); S.todayFocus = { d: today(), id: 'f' }; assert.equal(getFocus(S), 'f');
    S.todayFocus = { d: '2020-01-01', id: 'f' }; assert.equal(getFocus(S), 'a');
    S.settings.focus = 'g'; assert.equal(getFocus(S), 'g');
  });
});
test('starting a daily page fixes the automatic pick for the day, until it is mastered', () => {
  withFakeSkills(skills(), () => {
    const S = learner(); logFocus(S, 'a'); st(S, 'x'); assert.equal(getFocus(S), 'a');
    st(S, 'b'); assert.equal(getFocus(S), 'a');
    S.skills.a = { ...S.skills.b, mastered: true }; assert.equal(getFocus(S), 'b');
  });
});
