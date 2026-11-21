import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState, newSkillState } from '../js/core/state.js';
import { setState, save, loadSaved } from '../js/core/store.js';
import { recordSkill } from '../js/core/mastery.js';
import { extraNext } from '../js/core/extra.js';
import { buildChallenge } from '../js/core/challenge.js';
import { pathNodes, suggestNext, dueOnPath } from '../js/core/path.js';
import { applySetup } from '../js/core/learner.js';
import { SKILL, skillsOf } from '../js/skills/registry.js';
import { withFakeSkills, fake } from './fixtures/fake-skills.js';

const learner = () => { const S = freshState('T', '2026-11-01'); S.placed = true; S.level = 1; return S; };
const skill = (extra = {}) => ({ ...newSkillState(), ...extra });
const list = () => [fake('a', { strand: 'Numbers' }), fake('b', { strand: 'Numbers' }), fake('c', { strand: 'Numbers' })];
const ctx = { now: '2026-11-21', rand: () => 0.9, pick: a => a[0] };

test('the first node is up next and later nodes stay locked until the one before is mastered', () => {
  withFakeSkills(list(), () => {
    const S = learner();
    const fresh = pathNodes(S, list());
    assert.equal(fresh[0].state, 'now');
    assert.ok(fresh.slice(1).every(n => n.state === 'locked'));
    S.skills.a = skill({ n: 6, L: 2 });
    const practiced = pathNodes(S, list());
    assert.equal(practiced[0].state, 'now');
    assert.equal(practiced[1].state, 'locked');
    S.skills.a = skill({ mastered: true, n: 9, c: 9, L: 3 });
    const done = pathNodes(S, list(), '2026-11-21');
    assert.equal(done[0].state, 'mastered');
    assert.equal(done[1].state, 'now');
    assert.equal(done[2].state, 'locked');
  });
});

test('mastery is the threshold that unlocks the next node, not a run of right answers before it', () => {
  withFakeSkills(list(), () => {
    const S = learner();
    let unlocked = false;
    for (let i = 0; i < 40 && !unlocked; i++) {
      const before = pathNodes(S, list())[1].state;
      const res = recordSkill(S, 'a', 'right');
      const after = pathNodes(S, list())[1].state;
      if (!res.mastered) assert.equal(after, 'locked');
      else { assert.equal(before, 'locked'); assert.equal(after, 'now'); unlocked = true; }
    }
    assert.equal(unlocked, true);
    assert.equal(suggestNext(S), 'b');
  });
});

test('keep going and the daily challenge follow the path, not a later skill that was only started', () => {
  withFakeSkills(list(), () => {
    const S = learner();
    S.skills.a = skill({ mastered: true, n: 9, c: 9, L: 3, rev: { stage: 0, due: '2026-11-01', miss: 0 } });
    S.skills.c = skill({ n: 2 });
    assert.equal(suggestNext(S), 'b');
    const ex = { n: 0, focus: 'a' };
    assert.equal(extraNext(S, ex, ctx).id, 'b');
    assert.equal(ex.focus, 'b');
    assert.deepEqual(dueOnPath(S, 1, '2026-11-21'), ['a']);
    assert.equal(pathNodes(S, list(), '2026-11-21')[0].due, true);
    const set = buildChallenge(S, '2026-11-21');
    assert.equal(set.items.find(it => it.kind === 'review').skill, 'a');
    assert.equal(set.items.find(it => it.kind === 'stretch').skill, 'b');
  });
});

test('the unlocked node is still unlocked after the save is loaded again', () => {
  withFakeSkills(list(), () => {
    const S = learner();
    S.skills.a = skill({ mastered: true, n: 9, c: 9, L: 3 });
    const st = { m: {}, getItem: k => (k in st.m ? st.m[k] : null), setItem: (k, v) => { st.m[k] = String(v); }, removeItem: k => { delete st.m[k]; } };
    globalThis.localStorage = st;
    setState(S); save();
    const loaded = loadSaved();
    assert.equal(pathNodes(loaded, list())[0].state, 'mastered');
    assert.equal(pathNodes(loaded, list())[1].state, 'now');
    delete globalThis.localStorage;
  });
});

test('a real grade path suggests a skill from that grade, and the next node on a subject stays locked', () => {
  const S = applySetup(freshState('Bo', '2026-11-01'), { name: 'Bo', grade: '3' });
  const id = suggestNext(S);
  assert.equal(SKILL[id].level, 2);
  const mult = skillsOf(2).filter(s => s.strand === 'Multiplying and dividing' && !s.story);
  const nodes = pathNodes(S, mult);
  assert.ok(nodes.length > 1);
  assert.equal(nodes[0].state, 'now');
  assert.ok(nodes.slice(1).every(n => n.state === 'locked'));
  const k = applySetup(freshState('Ada', '2026-11-01'), { name: 'Ada', grade: 'K' });
  const numbers = pathNodes(k, skillsOf(0).filter(s => s.strand === 'Numbers'));
  assert.equal(numbers[0].id, 'l0count');
  assert.equal(numbers[1].state, 'locked');
});
