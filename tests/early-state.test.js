import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { migrate, freshState, KEY_V3 } from '../js/core/state.js';
import { loadSaved, parseBackup, exportJSON, setState, save } from '../js/core/store.js';
import { startFromBeginning, applyPlacement, setCurrentLevel, visibleLevels, canOpenLevel } from '../js/core/entry.js';
const fix = n => JSON.parse(readFileSync(new URL(`./fixtures/${n}`, import.meta.url), 'utf8'));
function fakeStorage() { const m = {}; return { m, getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } }; }
test('v1, v2 and v3 fixtures all load with early false', () => {
  for (const n of ['v1-state.json', 'v2-state.json', 'v3-state.json']) {
    const s = migrate(fix(n)); assert.equal(s.v, 3, n); assert.equal(s.early, false, n);
  }
  assert.equal(migrate(fix('v3-state.json')).level, 3);
});
test('a fresh learner has early false, and a saved level 0 learner is early even if the flag is missing', () => {
  assert.equal(freshState('Sam', '2026-11-19').early, false);
  const raw = { ...fix('v3-state.json'), level: 0 }; delete raw.early;
  assert.equal(migrate(raw).early, true);
});
test('level 0 survives migration and level 0 in levelsDone is kept', () => {
  const s = migrate({ ...fix('v3-state.json'), level: 1, early: true, levelsDone: [0] });
  assert.equal(s.level, 1); assert.deepEqual(s.levelsDone, [0]); assert.equal(s.early, true);
});
test('a level 0 learner round-trips through backup and restore, and through the saved key', () => {
  const S = startFromBeginning(freshState('Mia', '2026-11-19')); S.stars = 7;
  const back = parseBackup(exportJSON(S));
  assert.equal(back.level, 0); assert.equal(back.placed, true); assert.equal(back.early, true);
  assert.equal(back.settings.speak, true); assert.equal(back.stars, 7); assert.equal(back.v, 3);
  const st = fakeStorage(); globalThis.localStorage = st;
  setState(S); save();
  const loaded = loadSaved(); assert.equal(loaded.level, 0); assert.equal(loaded.early, true);
  assert.equal(JSON.parse(st.m[KEY_V3]).early, true);
  delete globalThis.localStorage;
});
test('"Start from the very beginning" gives level 0, placed, early; the check gives early false', () => {
  const a = startFromBeginning(freshState('A', '2026-11-19'));
  assert.equal(a.level, 0); assert.equal(a.placed, true); assert.equal(a.early, true);
  const b = applyPlacement(freshState('B', '2026-11-19'), 3);
  assert.equal(b.level, 3); assert.equal(b.placed, true); assert.equal(b.early, false);
  assert.equal(applyPlacement(freshState('C', '2026-11-19'), 0).level, 1); // never 0 from the check
});
test('an adult setting Early Start marks the learner early; setting another level leaves the flag', () => {
  const S = freshState('A', '2026-11-19'); S.placed = true; S.level = 5;
  assert.equal(setCurrentLevel(S, 0), 0); assert.equal(S.early, true); assert.equal(S.settings.speak, true);
  setCurrentLevel(S, 2); assert.equal(S.level, 2); assert.equal(S.early, true);
});
test('the Early Start chip is shown only to learners with early true', () => {
  const S = freshState('A', '2026-11-19'); S.placed = true; S.level = 1;
  assert.deepEqual(visibleLevels(S).map(l => l.n), [1, 2, 3, 4, 5, 6, 7]); assert.equal(canOpenLevel(S, 0), false);
  S.early = true;
  assert.deepEqual(visibleLevels(S).map(l => l.n), [0, 1, 2, 3, 4, 5, 6, 7]); assert.equal(canOpenLevel(S, 0), true);
});
test('the rendered level bar shows Early Start only with early true, and never says Level 0', async () => {
  const { levelBar } = await import('../js/ui/screens/home-parts.js');
  const S = freshState('A', '2026-11-19'); S.placed = true; S.level = 4; setState(S);
  assert.ok(!levelBar().includes('Early Start'));
  S.early = true; S.level = 0; setState(S);
  const html = levelBar(); assert.ok(html.includes('Early Start')); assert.ok(!/Level 0/.test(html));
});
