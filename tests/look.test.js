import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState, migrate, newSkillState } from '../js/core/state.js';
import { BANDS, bandFor, contrast, resumeId, pathDots } from '../js/core/look.js';
import { playChime } from '../js/core/sound.js';
import { pathPick } from '../js/core/focus.js';

test('each grade band keeps WCAG AA contrast', () => {
  for (const [level, b] of Object.entries(BANDS)) {
    assert.ok(contrast(b.strong, '#ffffff') >= 4.5, `${level} strong`);
    assert.ok(contrast('#241c16', b.lightSoft) >= 4.5, `${level} light soft`);
    assert.ok(contrast('#f6efe6', b.darkSoft) >= 4.5, `${level} dark soft`);
    assert.ok(contrast(b.onDark, '#2a231e') >= 4.5, `${level} link on card`);
    assert.ok(contrast(b.onDark, b.darkSoft) >= 4.5, `${level} link on soft`);
    assert.equal(bandFor(Number(level)).strong, b.strong);
  }
  assert.equal(bandFor(99).strong, BANDS[1].strong);
});

test('sound and easier letters start off, and the theme follows the phone', () => {
  const s = freshState('Ada', '2026-11-21');
  assert.equal(s.settings.sound, false);
  assert.equal(s.settings.letters, false);
  assert.equal(s.settings.theme, 'system');
  const old = migrate({ v: 3, name: 'Bo', created: '2026-11-01', level: 2, placed: true, settings: { minutes: 10 } });
  assert.equal(old.settings.sound, false);
  assert.equal(old.settings.letters, false);
  assert.equal(old.settings.theme, 'system');
});

test('a chime plays only when sound is on', () => {
  const made = [];
  class Fake {
    constructor() { this.currentTime = 0; this.destination = {}; }
    createOscillator() {
      return { frequency: { value: 0 }, type: '', connect() {}, start() { made.push(1); }, stop() {} };
    }
    createGain() {
      return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} };
    }
  }
  assert.equal(playChime(true, { enabled: false, AudioContext: Fake }), false);
  assert.equal(made.length, 0);
  assert.equal(playChime(true, { enabled: true, AudioContext: Fake }), true);
  assert.equal(made.length, 2);
  assert.equal(playChime(false, { enabled: true, AudioContext: Fake }), true);
  assert.equal(made.length, 3);
  assert.equal(playChime(true, { enabled: true, AudioContext: null }), false);
});

test('continue returns the started skill, and the path map marks it', () => {
  const S = freshState('Ada', '2026-11-21');
  S.placed = true; S.level = 0; S.early = true;
  assert.equal(resumeId(S), null);
  const id = pathPick(S);
  S.skills[id] = { ...newSkillState(), n: 3, c: 2 };
  assert.equal(resumeId(S), id);
  const dots = pathDots(S);
  assert.ok(dots.length > 1);
  assert.equal(dots.find(d => d.id === id).state, 'now');
  S.skills[id].mastered = true;
  assert.equal(pathDots(S).find(d => d.id === id).state, 'done');
});
