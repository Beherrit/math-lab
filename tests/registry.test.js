import test from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS, SKILL, skillsOf, storySources, storySkillOf } from '../js/skills/registry.js';
import { LEVELS } from '../js/levels.js';
test('seven levels in order, each with a title and a grade range', () => {
  assert.equal(LEVELS.length, 7);
  LEVELS.forEach((l, i) => {
    assert.equal(l.n, i + 1);
    assert.ok(l.id && l.title && l.blurb && l.grades);
  });
  assert.equal(LEVELS[3].grades, '5');
});
test('skillsOf(level) only returns that level, and empty levels are fine', () => {
  for (const l of LEVELS) for (const s of skillsOf(l.n)) assert.equal(s.level, l.n);
  assert.equal(skillsOf(4).length, 20);
  assert.deepEqual(skillsOf(1), []);
  assert.deepEqual(skillsOf(99), []);
});
test('SKILL maps every id', () => {
  for (const s of SKILLS) assert.equal(SKILL[s.id], s);
});
test('story sources are per level', () => {
  assert.ok(storySources(4).length > 0);
  assert.deepEqual(storySources(1), []);
  assert.equal(storySkillOf(4)?.id, 'story');
  assert.equal(storySkillOf(5), null);
});
test('level 4 keeps the original skill ids (they are keys in saved progress)', () => {
  const ids = ['oa', 'pat', 'pv', 'dec', 'rnd', 'mul', 'div', 'das', 'ddiv', 'dmul', 'fas', 'fmul', 'scale', 'fdiv', 'conv', 'lplot', 'vol', 'coord', 'shapes', 'story'];
  assert.deepEqual(skillsOf(4).map(s => s.id), ids);
});
