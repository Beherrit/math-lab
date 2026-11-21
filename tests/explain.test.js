import test from 'node:test';
import assert from 'node:assert/strict';
import { becauseText } from '../js/core/say.js';
import { way } from '../js/util.js';

test('a wrong answer can show a reason: why, or the last worked step', () => {
  assert.equal(becauseText({ why: 'Ten and some more.' }), 'Ten and some more.');
  assert.equal(becauseText({ why: '<b>Count</b> the empty boxes.' }), 'Count the empty boxes.');
  const q = { ways: [way('Count', ['Touch each one once.', 'The last number you say is 4.'])] };
  assert.equal(becauseText(q), 'The last number you say is 4.');
  assert.equal(becauseText({}), '');
  assert.equal(becauseText(null), '');
});
