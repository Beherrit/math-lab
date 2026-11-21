import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { migrate, freshState, KEY_V1, KEY_V2, KEY_V3 } from '../js/core/state.js';
import { loadSaved, parseBackup, exportJSON, setState, save, clearSaved } from '../js/core/store.js';
const v1 = () => JSON.parse(readFileSync(new URL('./fixtures/v1-state.json', import.meta.url), 'utf8'));
const v2 = () => JSON.parse(readFileSync(new URL('./fixtures/v2-state.json', import.meta.url), 'utf8'));
const noRev = skills => Object.fromEntries(Object.entries(skills).map(([k, { rev, ...rest }]) => [k, rest]));
function fakeStorage(init = {}) {
  const m = { ...init };
  return { m, getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } };
}
test('v1 migrates to v3 at level 4, placed, with all progress intact', () => {
  const old = v1(); const s = migrate(old);
  assert.equal(s.v, 3); assert.equal(s.level, 4); assert.equal(s.placed, true); assert.deepEqual(s.levelsDone, []);
  for (const f of ['name', 'created', 'facts', 'unlocked', 'skills', 'days', 'stars', 'streak', 'badges', 'focusLog', 'counters', 'todayFocus', 'settings']) {
    const expect = f === 'settings' ? { ...v1().settings, sound: false, letters: false, theme: 'system' } : v1()[f];
    assert.deepEqual(f === 'skills' ? noRev(s[f]) : s[f], expect, `${f} changed`);
  }
  assert.deepEqual(s.learned, {});
  assert.deepEqual(s.skills.oa.rev, { stage: 0, due: '2026-11-12', miss: 0 }); // mastered: the schedule starts from the last practice
  assert.equal(s.skills.pv.rev, null);
});
test('v2 migrates to v3 with every field intact and the new fields defaulted', () => {
  const s = migrate(v2()); const o = v2();
  assert.equal(s.v, 3); assert.deepEqual(s.learned, {}); assert.equal(s.level, 5); assert.deepEqual(s.levelsDone, [4]);
  for (const f of ['name', 'created', 'facts', 'unlocked', 'days', 'stars', 'streak', 'badges', 'focusLog', 'counters', 'todayFocus', 'settings', 'placed']) {
    const expect = f === 'settings' ? { ...o.settings, sound: false, letters: false, theme: 'system' } : o[f];
    assert.deepEqual(s[f], expect, `${f} changed`);
  }
  assert.deepEqual(noRev(s.skills), o.skills);
  assert.deepEqual(s.skills.oa.rev, { stage: 0, due: '2026-11-14', miss: 0 });
  assert.deepEqual(s.skills.old.rev, { stage: 0, due: '2026-10-22', miss: 0 }); // never dated: counted from the day it was created
  assert.equal(s.skills.pv.rev, null);
});
test('a v3 state keeps its learned and review data through migrate', () => {
  const s = migrate(JSON.parse(JSON.stringify({ ...migrate(v2()), learned: { oa: '2026-11-01' } })));
  assert.deepEqual(s.learned, { oa: '2026-11-01' }); assert.equal(s.skills.oa.rev.due, '2026-11-14');
});
test('a fresh state is v3, unplaced, with defaults and the new fields', () => {
  const s = freshState('Sam', '2026-11-19');
  assert.equal(s.v, 3); assert.deepEqual(s.learned, {}); assert.equal(s.placed, false); assert.equal(s.name, 'Sam');
  assert.deepEqual(s.unlocked, [1, 2, 5, 10]); assert.equal(s.settings.minutes, 10);
});
test('garbage and unknown versions do not migrate', () => {
  assert.equal(migrate(null), null); assert.equal(migrate({ v: 9 }), null); assert.equal(migrate({ v: 4 }), null); assert.equal(migrate('x'), null);
});
test('loadSaved reads the v1 key, writes v3, and leaves v1 untouched', () => {
  const raw = JSON.stringify(v1());
  const st = fakeStorage({ [KEY_V1]: raw }); globalThis.localStorage = st;
  const s = loadSaved();
  assert.equal(s.level, 4); assert.equal(s.stars, 143);
  assert.equal(st.m[KEY_V1], raw);
  assert.equal(JSON.parse(st.m[KEY_V3]).v, 3); assert.equal(KEY_V2 in st.m, false);
});
test('loadSaved reads the v2 key, writes v3, and leaves v2 untouched', () => {
  const raw = JSON.stringify(v2());
  const st = fakeStorage({ [KEY_V2]: raw }); globalThis.localStorage = st;
  const s = loadSaved();
  assert.equal(s.stars, 210); assert.equal(st.m[KEY_V2], raw);
  assert.equal(JSON.parse(st.m[KEY_V3]).v, 3); assert.deepEqual(JSON.parse(st.m[KEY_V3]).learned, {});
});
test('v3 wins over v2 and v1, and save() writes only v3', () => {
  const st = fakeStorage({ [KEY_V1]: JSON.stringify(v1()), [KEY_V2]: JSON.stringify(v2()) }); globalThis.localStorage = st;
  const first = loadSaved(); assert.equal(first.name, 'Noor');
  first.stars = 999; setState(first); save();
  assert.equal(loadSaved().stars, 999);
  assert.equal(JSON.parse(st.m[KEY_V1]).stars, 143); assert.equal(JSON.parse(st.m[KEY_V2]).stars, 210);
});
test('clearSaved removes all three keys; no storage means no crash', () => {
  const st = fakeStorage({ [KEY_V1]: '{}', [KEY_V2]: '{}', [KEY_V3]: '{}' }); globalThis.localStorage = st;
  clearSaved(); assert.deepEqual(st.m, {});
  delete globalThis.localStorage;
  assert.equal(loadSaved(), null);
});
test('backups: v1, v2 and v3 files restore (migrated), export writes v3', () => {
  const r1 = parseBackup(JSON.stringify(v1())); const r2 = parseBackup(JSON.stringify(v2()));
  assert.equal(r1.v, 3); assert.equal(r1.level, 4); assert.equal(r1.placed, true);
  assert.equal(r2.v, 3); assert.equal(r2.level, 5);
  const out = JSON.parse(exportJSON(r2));
  assert.equal(out.v, 3); assert.equal(out.level, 5); assert.equal(parseBackup(JSON.stringify(out)).stars, 210);
  assert.equal(parseBackup('not json'), null);
  assert.equal(parseBackup(JSON.stringify({ v: 9 })), null);
});
