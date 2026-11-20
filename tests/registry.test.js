import test from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS, SKILL, skillsOf, storySources, storySkillOf } from '../js/skills/registry.js';
import { LEVELS } from '../js/levels.js';
import { withEmptyLevels, withoutSkills } from './fixtures/without-skills.js';
test('Early Start then seven levels in order, each with a title and a grade range', () => {
  assert.equal(LEVELS.length, 8);
  LEVELS.forEach((l, i) => {
    assert.equal(l.n, i);
    assert.ok(l.id && l.title && l.blurb && l.grades);
  });
  assert.equal(LEVELS[0].title, 'Early Start');
  assert.equal(LEVELS[4].grades, '5');
});
test('skillsOf(level) only returns that level, and empty levels are fine', () => {
  for (const l of LEVELS) for (const s of skillsOf(l.n)) assert.equal(s.level, l.n);
  assert.equal(skillsOf(4).length, 20);
  assert.deepEqual(skillsOf(99), []);
  withEmptyLevels([2], () => {
    assert.deepEqual(skillsOf(2), []);
    assert.ok(skillsOf(1).length > 0 && skillsOf(3).length > 0);
    for (const l of [1, 3, 4]) for (const s of skillsOf(l)) assert.equal(s.level, l);
  });
  assert.ok(skillsOf(2).length > 0);
});
test('every level has at least 8 skills and a story source, and skill ids are unique across levels', () => {
  for (const l of LEVELS) {
    assert.ok(skillsOf(l.n).length >= 8, `level ${l.n} has ${skillsOf(l.n).length} skills`);
    if (l.n > 0) assert.ok(storySources(l.n).length > 0, `level ${l.n} has no story source`); // Early Start has no story problems
  }
  assert.equal(new Set(SKILLS.map(s => s.id)).size, SKILLS.length);
});
test('SKILL maps every id', () => {
  for (const s of SKILLS) assert.equal(SKILL[s.id], s);
});
test('story sources are per level', () => {
  assert.ok(storySources(4).length > 0);
  assert.deepEqual(storySources(99), []);
  assert.equal(storySkillOf(4)?.id, 'story');
  assert.equal(storySkillOf(99), null);
  for (const l of LEVELS.filter(x => x.n > 0)) assert.equal(storySkillOf(l.n)?.level, l.n);
  // Sources without a story skill in the level give no story skill, and a level with no skills has none either.
  withoutSkills(s => s.level === 5 && s.story, () => assert.equal(storySkillOf(5), null));
  withEmptyLevels([5], () => assert.equal(storySkillOf(5), null));
  assert.equal(storySkillOf(5)?.id, 'l5story');
});
test('level 4 keeps the original skill ids (they are keys in saved progress)', () => {
  const ids = ['oa', 'pat', 'pv', 'dec', 'rnd', 'mul', 'div', 'das', 'ddiv', 'dmul', 'fas', 'fmul', 'scale', 'fdiv', 'conv', 'lplot', 'vol', 'coord', 'shapes', 'story'];
  assert.deepEqual(skillsOf(4).map(s => s.id), ids);
});
