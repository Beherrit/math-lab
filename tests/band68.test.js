// Grades 6 to 8: the thin spots now show a model and name the usual slip.
import test from 'node:test';
import assert from 'node:assert/strict';
import { generate } from '../js/skills/registry.js';

function until(id, L, pred, tries = 80) {
  for (let i = 0; i < tries; i++) {
    const p = generate(id, L);
    if (pred(p)) return p;
  }
  return null;
}

test('a unit rate shows a double number line and warns against multiplying', () => {
  const p = until('l5rate', 1, q => q.visual && q.visual.includes('double number line'));
  assert.ok(p, 'no double number line');
  assert.match(p.why, /divid|share/i);
  assert.match(p.why, /multiplying/i);
});

test('a one-step equation is drawn on a balance and names the one-side slip', () => {
  const p = until('l5eq', 1, q => q.visual && q.visual.includes('balance'));
  assert.ok(p, 'no balance');
  assert.match(p.why, /both sides/i);
});

test('a ratio question draws the two groups and names the swapped-order slip', () => {
  const p = until('l5ratio', 1, q => q.visual && q.visual.includes('tape diagram'));
  assert.ok(p, 'no tape');
  assert.match(p.why, /swap/i);
});

test('a percent of a number can be seen as a bar and is not the percent taken off', () => {
  const p = until('l5pct', 2, q => q.visual && q.visual.includes('percent bar'));
  assert.ok(p, 'no percent bar');
  assert.match(p.why, /out of every 100/i);
  assert.match(p.why, /taken off|subtract/i);
});

test('negative times negative shows the counting-down pattern', () => {
  const p = until('l6intmul', 1, q => q.visual && q.visual.includes('counting down'));
  assert.ok(p, 'no sign pattern');
  assert.match(p.why, /positive/i);
  assert.match(p.why, /still negative/i);
});

test('the Pythagorean picture shows the squares, and the slip is adding the legs', () => {
  const p = until('l7pyth', 1, q => q.visual && q.visual.includes('squares of area'));
  assert.ok(p, 'no squares');
  assert.match(p.why, /squares/i);
  assert.match(p.why, /legs/i);
});
