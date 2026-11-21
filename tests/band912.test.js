// Grades 9-12: every new skill shows a picture on the question and names the slip.
import test from 'node:test';
import assert from 'node:assert/strict';
import { generate, skillsOf } from '../js/skills/registry.js';
import { GRADES } from '../js/core/learner.js';

const SLIP = {
  l8line: /intercept/i,
  l8system: /intercept/i,
  l8factor: /corner|product/i,
  l8ac: /multipl/i,
  l8diff: /cancel|square/i,
  l8vertex: /sideways|corner/i,
  l8poly: /power/i,
  l8shift: /right/i,
  l8grow: /multiplying|adding the same/i,
  l8secant: /step|heights/i,
  l8area: /left edge|short/i,
  l8radical: /half|sum of the roots/i,
  l8similar: /subtract|angle/i,
  l8trig: /opposite|height/i,
  l8chance: /group you were given|68/i,
};

test('grades 9 to 12 share the functions and curves band', () => {
  for (const id of ['9', '10', '11', '12']) assert.equal(GRADES.find(g => g.id === id).level, 8);
  assert.equal(skillsOf(8).length >= 8, true);
});

test('each new skill shows a picture and names the slip at every step', () => {
  for (const [id, slip] of Object.entries(SLIP)) {
    for (const L of [1, 2, 3]) {
      const p = generate(id, L);
      assert.ok(p, id);
      assert.ok(p.visual && p.visual.includes('<'), `${id} L${L} picture`);
      assert.match(p.why, slip, `${id} L${L} why`);
      assert.ok(p.ways.length >= 2, `${id} ways`);
      assert.equal(p.visual.includes('class="on"'), false, `${id} dark fill`);
    }
  }
});
