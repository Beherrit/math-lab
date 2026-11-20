import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { migrate, freshState, KEY_V1, KEY_V2 } from '../js/core/state.js';
import { loadSaved, parseBackup, exportJSON, setState, save, clearSaved } from '../js/core/store.js';
const v1 = () => JSON.parse(readFileSync(new URL('./fixtures/v1-state.json', import.meta.url), 'utf8'));
function fakeStorage(init = {}) {
  const m = { ...init };
  return { m, getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } };
}
test('v1 migrates to v2 at level 4, placed, with all progress intact', () => {
  const old = v1(); const s = migrate(old);
  assert.equal(s.v, 2); assert.equal(s.level, 4); assert.equal(s.placed, true); assert.deepEqual(s.levelsDone, []);
  for (const f of ['name', 'created', 'facts', 'unlocked', 'skills', 'days', 'stars', 'streak', 'badges', 'focusLog', 'counters', 'todayFocus', 'settings']) {
    assert.deepEqual(s[f], v1()[f], `${f} changed`);
  }
});
test('a fresh state is v2, unplaced, with defaults', () => {
  const s = freshState('Sam', '2026-11-19');
  assert.equal(s.v, 2); assert.equal(s.placed, false); assert.equal(s.name, 'Sam');
  assert.deepEqual(s.unlocked, [1, 2, 5, 10]); assert.equal(s.settings.minutes, 10);
});
test('garbage and unknown versions do not migrate', () => {
  assert.equal(migrate(null), null); assert.equal(migrate({ v: 9 }), null); assert.equal(migrate('x'), null);
});
test('loadSaved reads the v1 key, writes v2, and leaves v1 untouched', () => {
  const raw = JSON.stringify(v1());
  const st = fakeStorage({ [KEY_V1]: raw }); globalThis.localStorage = st;
  const s = loadSaved();
  assert.equal(s.level, 4); assert.equal(s.stars, 143);
  assert.equal(st.m[KEY_V1], raw);
  assert.equal(JSON.parse(st.m[KEY_V2]).v, 2);
});
test('v2 wins over v1 once it exists, and save() writes only v2', () => {
  const st = fakeStorage({ [KEY_V1]: JSON.stringify(v1()) }); globalThis.localStorage = st;
  const s = loadSaved(); s.stars = 999; setState(s); save();
  assert.equal(loadSaved().stars, 999);
  assert.equal(JSON.parse(st.m[KEY_V1]).stars, 143);
});
test('clearSaved removes both keys; no storage means no crash', () => {
  const st = fakeStorage({ [KEY_V1]: '{}', [KEY_V2]: '{}' }); globalThis.localStorage = st;
  clearSaved(); assert.deepEqual(st.m, {});
  delete globalThis.localStorage;
  assert.equal(loadSaved(), null);
});
test('backups: v1 files restore (migrated), export writes v2', () => {
  const restored = parseBackup(JSON.stringify(v1()));
  assert.equal(restored.v, 2); assert.equal(restored.level, 4); assert.equal(restored.placed, true);
  const out = JSON.parse(exportJSON(restored));
  assert.equal(out.v, 2); assert.equal(out.level, 4);
  assert.equal(parseBackup('not json'), null);
  assert.equal(parseBackup(JSON.stringify({ v: 3 })), null);
});
