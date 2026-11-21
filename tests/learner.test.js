import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { freshState, migrate, KEY_V3 } from '../js/core/state.js';
import { loadSaved, setState, save } from '../js/core/store.js';
import { applySetup, setGrade, helloName, gradeById } from '../js/core/learner.js';

const v2 = () => JSON.parse(readFileSync(new URL('./fixtures/v2-state.json', import.meta.url), 'utf8'));
function fakeStorage(init = {}) {
  const m = { ...init };
  return { m, getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } };
}

test('first run can skip the name and the year', () => {
  const s = applySetup(freshState('x', '2026-11-21'), { name: '   ', grade: '' });
  assert.equal(s.name, '');
  assert.equal(s.grade, null);
  assert.equal(s.placed, false);
  assert.equal(helloName(s), '');
});

test('Kindergarten setup starts at Early Start with read-aloud and keeps the name', () => {
  const s = applySetup(freshState('', '2026-11-21'), { name: '  Ada ', grade: 'K' });
  assert.equal(s.name, 'Ada');
  assert.equal(s.grade, 'K');
  assert.equal(s.level, 0);
  assert.equal(s.early, true);
  assert.equal(s.placed, true);
  assert.equal(s.settings.speak, true);
  assert.equal(gradeById('K').level, 0);
});

test('a later year sets that level and does not turn on Early Start', () => {
  const s = applySetup(freshState('', '2026-11-21'), { name: 'Bo', grade: '3' });
  assert.equal(s.grade, '3');
  assert.equal(s.level, 2);
  assert.equal(s.placed, true);
  assert.equal(s.early, false);
});

test('an older save keeps its progress and gains an empty year', () => {
  const old = migrate(v2());
  assert.equal(old.grade, null);
  assert.equal(old.stars, 210);
  assert.equal(old.level, 5);
  assert.ok(old.skills.oa);
  const again = migrate({ ...old, grade: 'nope' });
  assert.equal(again.grade, null);
  assert.equal(again.stars, 210);
  assert.equal(again.skills.oa.rev.due, old.skills.oa.rev.due);
});

test('changing the year does not erase skills or stars', () => {
  const s = applySetup(freshState('Ada', '2026-11-21'), { name: 'Ada', grade: 'K' });
  s.stars = 9;
  s.skills.l0count = { n: 5, c: 4, mastered: false };
  setGrade(s, '4');
  assert.equal(s.grade, '4');
  assert.equal(s.level, 3);
  assert.equal(s.stars, 9);
  assert.equal(s.skills.l0count.n, 5);
  setGrade(s, '');
  assert.equal(s.grade, null);
  assert.equal(s.level, 3);
  assert.equal(s.skills.l0count.c, 4);
});

test('first-run setup survives a reload', () => {
  const st = fakeStorage();
  globalThis.localStorage = st;
  const s = applySetup(freshState('', '2026-11-21'), { name: 'Ada', grade: 'K' });
  s.stars = 4;
  s.skills.l0shapes = { n: 2, c: 2 };
  setState(s);
  save();
  const again = loadSaved();
  assert.equal(again.name, 'Ada');
  assert.equal(again.grade, 'K');
  assert.equal(again.level, 0);
  assert.equal(again.early, true);
  assert.equal(again.stars, 4);
  assert.equal(again.skills.l0shapes.n, 2);
  assert.equal(JSON.parse(st.m[KEY_V3]).grade, 'K');
  delete globalThis.localStorage;
});
