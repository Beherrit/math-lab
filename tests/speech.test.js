import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpeech } from '../js/core/speech.js';
import { stripHtml, spokenText, spokenOptions, resultText, readAloudOn } from '../js/core/say.js';
import { hearButtons } from '../js/ui/hear.js';
import { freshState } from '../js/core/state.js';
import { setState } from '../js/core/store.js';
import { setSess } from '../js/session/state.js';
import { sayQuestion, sayResult, aloudActions } from '../js/session/aloud.js';
class Utterance { constructor(text) { this.text = text; } }
// A fake speechSynthesis that records every call in order.
function fake(voices = []) {
  const log = []; const spoken = [];
  const synth = { cancel: () => log.push('cancel'), speak: u => { spoken.push(u); log.push(`speak:${u.text}`); }, getVoices: () => voices };
  return { log, spoken, synth, env: { synth, Utterance } };
}
function withGlobals(f, fn) {
  globalThis.speechSynthesis = f.synth; globalThis.SpeechSynthesisUtterance = Utterance;
  try { return fn(); } finally { delete globalThis.speechSynthesis; delete globalThis.SpeechSynthesisUtterance; setSess(null); setState(null); }
}
const learner = (level, speak) => { const s = freshState('T', '2026-11-19'); s.placed = true; s.level = level; if (speak !== undefined) s.settings.speak = speak; return s; };
test('speak cancels the previous utterance before the new one, at a slower rate', () => {
  const f = fake(); const sp = createSpeech(() => f.env);
  assert.equal(sp.speak('one'), true); sp.speak('two');
  assert.deepEqual(f.log, ['cancel', 'speak:one', 'cancel', 'speak:two']);
  assert.ok(f.spoken[0].rate < 1 && f.spoken[0].rate > 0.5); assert.equal(f.spoken[0].lang, 'en-US');
});
test('it picks an English voice once voices have loaded, preferring a local one', () => {
  const voices = [{ lang: 'fr-FR', localService: true }, { lang: 'en-GB', localService: false, name: 'net' }, { lang: 'en-US', localService: true, name: 'local' }];
  const f = fake(voices); createSpeech(() => f.env).speak('hi');
  assert.equal(f.spoken[0].voice.name, 'local');
  const none = fake([]); createSpeech(() => none.env).speak('hi'); assert.equal(none.spoken[0].voice, undefined);
  const noEn = fake([{ lang: 'de-DE' }]); createSpeech(() => noEn.env).speak('hi'); assert.equal(noEn.spoken[0].voice, undefined);
});
test('missing, blocked or throwing speechSynthesis never throws', () => {
  const broken = { synth: { cancel() { throw new Error('x'); }, speak() { throw new Error('y'); }, getVoices() { throw new Error('z'); } }, Utterance };
  for (const getEnv of [() => ({}), () => null, () => { throw new Error('no'); }, () => broken, () => ({ synth: {}, Utterance })]) {
    const sp = createSpeech(getEnv);
    assert.doesNotThrow(() => { sp.speak('a'); sp.speakList(['a', 'b']); sp.stop(); sp.available(); });
    assert.equal(sp.speak('a'), false);
  }
  assert.equal(createSpeech(() => ({})).available(), false); assert.equal(createSpeech(() => fake().env).available(), true);
});
test('an utterance the browser refuses is silent: the error hook can fire without throwing', () => {
  const f = fake(); let heard = 0; createSpeech(() => f.env).speak('hello', { onerror: () => { heard++; } });
  assert.doesNotThrow(() => f.spoken[0].onerror({ error: 'not-allowed' })); assert.equal(heard, 1);
  createSpeech(() => f.env).speak('again');
  assert.doesNotThrow(() => f.spoken[1].onerror({ error: 'not-allowed' }));
});
test('stop cancels only when something was spoken', () => {
  const f = fake(); const sp = createSpeech(() => f.env);
  sp.stop(); assert.deepEqual(f.log, []);
  sp.speak('a'); sp.stop(); assert.deepEqual(f.log, ['cancel', 'speak:a', 'cancel']);
});
test('speakList speaks in order and reports each start, then -1 at the end', () => {
  const f = fake(); const seen = []; createSpeech(() => f.env).speakList(['one', 'two', 'three'], i => seen.push(i));
  assert.deepEqual(f.log, ['cancel', 'speak:one', 'speak:two', 'speak:three']);
  f.spoken.forEach(u => { u.onstart(); u.onend(); });
  assert.deepEqual(seen, [0, 1, 2, -1]);
});
test('the setting is on by default at Early Start and off elsewhere, and a saved choice wins', () => {
  assert.equal(readAloudOn(learner(0)), true); assert.equal(readAloudOn(learner(1)), false); assert.equal(readAloudOn(learner(4)), false);
  assert.equal(readAloudOn(learner(0, false)), false); assert.equal(readAloudOn(learner(5, true)), true); assert.equal(readAloudOn(null), false);
});
test('say is used as written; without it the visible text is read with the HTML stripped', () => {
  assert.equal(spokenText({ say: ' How many apples? ', ask: 'x' }), 'How many apples?');
  assert.equal(spokenText({ ask: 'How <b>many</b> dots?<svg><text>9</text></svg>', expr: '3 + <span class="blank">?</span> = 5' }), 'How many dots? 3 plus blank equals 5');
  assert.equal(spokenText({ story: '<p>Sam has&nbsp;3 pens.</p>', ask: 'How many?' }), 'Sam has 3 pens. How many?');
  assert.equal(stripHtml('<div class="a">Hi <i>there</i></div> &amp; you'), 'Hi there & you');
});
test('sayOptions are used only when present; the buttons follow', () => {
  assert.deepEqual(spokenOptions({ sayOptions: ['red', 'blue'] }), ['red', 'blue']);
  for (const bad of [null, undefined, [], ['a', ''], 'red']) assert.equal(spokenOptions({ sayOptions: bad }), null);
  assert.ok(hearButtons({ sayOptions: ['a', 'b'] }).includes('Hear the choices'));
  assert.ok(!hearButtons({ sayOptions: null }).includes('Hear the choices'));
  assert.ok(hearButtons({ sayOptions: null }).includes('Hear it'));
});
test('results are short and plain; the reveal names the right choice when it can', () => {
  assert.equal(resultText('right', {}), 'Yes, that is right.'); assert.equal(resultText('retry', {}), 'Not yet. Try again.');
  const q = { answer: { kind: 'choice', correct: 1, options: ['<svg/>', '<svg/>'] }, sayOptions: ['a circle', 'a square'] };
  assert.equal(resultText('reveal', q), 'Not yet. The answer is a square.');
  assert.equal(resultText('reveal', { ...q, sayOptions: null }), 'Not yet.');
  assert.equal(resultText('reveal', { answer: { kind: 'num', value: 4 } }), 'Not yet. The answer is 4.');
});
test('nothing is spoken when the setting is off; with it on, a question is spoken once', () => {
  const f = fake();
  withGlobals(f, () => {
    setState(learner(1)); sayQuestion({ say: 'Count the dots.' }); sayResult('right', {});
    setSess({ q: { say: 'q', sayOptions: ['a', 'b'] } }); aloudActions.hear(); aloudActions.hearopts();
    assert.deepEqual(f.log, []);
    setState(learner(0)); sayQuestion({ say: 'Count the dots.' });
    assert.deepEqual(f.log, ['cancel', 'speak:Count the dots.']);
  });
});
test('Hear it repeats the question; Hear the choices speaks sayOptions in order, and is silent without them', () => {
  const f = fake();
  withGlobals(f, () => {
    setState(learner(0)); setSess({ q: { say: 'Which is red?', sayOptions: ['the apple', 'the leaf', 'the sky'] } });
    aloudActions.hear(); aloudActions.hearopts();
    assert.deepEqual(f.log, ['cancel', 'speak:Which is red?', 'cancel', 'speak:the apple', 'speak:the leaf', 'speak:the sky']);
    f.log.length = 0; setSess({ q: { say: 'Which is red?', sayOptions: null } }); aloudActions.hearopts();
    assert.deepEqual(f.log, []);
  });
});
test('the spoken-only first-sounds step is not served without speech: capped at step 2', async () => {
  const { speechCap, speechUsable } = await import('../js/core/speech-gate.js');
  assert.equal(speechCap('l0sound', 3, false), 2); assert.equal(speechCap('l0sound', 2, false), 2); assert.equal(speechCap('l0sound', 3, true), 3);
  assert.equal(speechCap('l0count', 3, false), 3);
  const f = fake();
  assert.equal(speechUsable(learner(0)), false); // no engine in Node
  withGlobals(f, () => {
    assert.equal(speechUsable(learner(0)), true); assert.equal(speechUsable(learner(0, false)), false); assert.equal(speechUsable(learner(3)), false);
  });
});
