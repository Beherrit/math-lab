import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState } from '../js/core/state.js';
import { strandGroups, hasStrands } from '../js/core/strands.js';
import { fake } from './fixtures/fake-skills.js';
const learner = () => freshState('T', '2026-11-01');
const done = (S, ...ids) => ids.forEach(id => { S.skills[id] = { mastered: true }; });
const list = [fake('a', { strand: 'Numbers' }), fake('b', { strand: 'Algebra' }), fake('c', { strand: 'Numbers' }), fake('d', { strand: 'Algebra' }), fake('e', { strand: 'Stories' })];
test('groups follow the order strands first appear, and keep the array order inside', () => {
  const g = strandGroups(learner(), list);
  assert.deepEqual(g.map(x => x.name), ['Numbers', 'Algebra', 'Stories']);
  assert.deepEqual(g[0].skills.map(s => s.id), ['a', 'c']); assert.deepEqual(g[1].skills.map(s => s.id), ['b', 'd']);
});
test('each group counts mastered of total', () => {
  const S = learner(); done(S, 'a', 'c', 'd');
  assert.deepEqual(strandGroups(S, list).map(g => [g.done, g.total]), [[2, 2], [1, 2], [0, 1]]);
});
test('the group holding the focus starts open; the first group when none does', () => {
  assert.deepEqual(strandGroups(learner(), list, 'd').map(g => g.open), [false, true, false]);
  assert.deepEqual(strandGroups(learner(), list, 'zzz').map(g => g.open), [true, false, false]);
});
test('a level with no strands has one group with no heading, and hasStrands is false', () => {
  const plain = [fake('a'), fake('b')];
  assert.equal(hasStrands(plain), false);
  const g = strandGroups(learner(), plain); assert.equal(g.length, 1); assert.equal(g[0].name, null); assert.equal(g[0].total, 2);
});
test('a mixed level puts skills without a strand in a last group with no heading', () => {
  const mix = [fake('a'), fake('b', { strand: 'Algebra' }), fake('c'), fake('d', { strand: 'Numbers' })];
  assert.equal(hasStrands(mix), true);
  const g = strandGroups(learner(), mix);
  assert.deepEqual(g.map(x => x.name), ['Algebra', 'Numbers', null]); assert.deepEqual(g[2].skills.map(s => s.id), ['a', 'c']);
});
