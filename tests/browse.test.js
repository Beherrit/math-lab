import test from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS, skillsOf } from '../js/skills/registry.js';
import { freshState } from '../js/core/state.js';
import { subjectsAt, skillsIn, puzzlesFor, bandName, moveLine, homeSay, activeGrade } from '../js/core/browse.js';

test('every skill sits in one subject, and subjects follow the path', () => {
  for (let n = 0; n <= 7; n++) {
    const skills = skillsOf(n);
    const subjects = subjectsAt(skills);
    const ids = subjects.flatMap(s => s.ids);
    assert.equal(ids.length, skills.length, `level ${n} count`);
    assert.equal(new Set(ids).size, ids.length, `level ${n} unique`);
    const first = [];
    for (const s of skills) {
      const name = s.strand || 'More';
      if (!first.includes(name)) first.push(name);
    }
    assert.deepEqual(subjects.map(s => s.name), first, `level ${n} subjects`);
    for (const sub of subjects) {
      const path = skills.filter(s => (s.strand || 'More') === sub.name).map(s => s.id);
      assert.deepEqual(sub.ids, path, `${sub.name} order`);
    }
  }
});

test('Kindergarten subjects use short names a child can tap', () => {
  const names = subjectsAt(skillsOf(0)).map(s => s.short);
  assert.deepEqual(names, ['Numbers', 'Adding', 'Shapes', 'Colors', 'Letters']);
  assert.ok(skillsIn(skillsOf(0), 'Numbers').some(s => s.id === 'l0count'));
  assert.ok(skillsIn(skillsOf(0), 'Letters').some(s => s.id === 'l0abc'));
});

test('puzzles stay with the subject and grade they teach', () => {
  const shapes = puzzlesFor(0, 'Shapes and space').map(g => g.id);
  assert.ok(shapes.includes('kpattern') && shapes.includes('kfit'));
  assert.deepEqual(puzzlesFor(0, 'Adding and subtracting').map(g => g.id), ['kten']);
  assert.deepEqual(puzzlesFor(0, 'Colors'), []);
  assert.deepEqual(puzzlesFor(1).map(g => g.id), ['g1jump', 'g1clock', 'g1shape']);
  assert.deepEqual(puzzlesFor(1, 'Adding and subtracting').map(g => g.id), ['g1jump']);
  assert.deepEqual(puzzlesFor(1, 'Measurement').map(g => g.id), ['g1clock']);
  assert.deepEqual(puzzlesFor(1, 'Shapes and space').map(g => g.id), ['g1shape']);
  assert.deepEqual(puzzlesFor(2).map(g => g.id), ['g3split']);
  assert.deepEqual(puzzlesFor(2, 'Multiplying and dividing').map(g => g.id), ['g3split']);
  assert.deepEqual(puzzlesFor(3).map(g => g.id), ['g4bars']);
  assert.deepEqual(puzzlesFor(3, 'Fractions and decimals').map(g => g.id), ['g4bars']);
  assert.deepEqual(puzzlesFor(4).map(g => g.id), ['g5order']);
  assert.deepEqual(puzzlesFor(4, 'Algebra').map(g => g.id), ['g5order']);
  assert.deepEqual(puzzlesFor(5).map(g => g.id), ['g6mix', 'g6balance']);
  assert.deepEqual(puzzlesFor(5, 'Ratios and percents').map(g => g.id), ['g6mix']);
  assert.deepEqual(puzzlesFor(5, 'Algebra').map(g => g.id), ['g6balance']);
  assert.deepEqual(puzzlesFor(6).map(g => g.id), ['g7signs']);
  assert.deepEqual(puzzlesFor(6, 'Multiplying and dividing').map(g => g.id), ['g7signs']);
  assert.deepEqual(puzzlesFor(7).map(g => g.id), ['g8squares']);
  assert.deepEqual(puzzlesFor(7, 'Shapes and space').map(g => g.id), ['g8squares']);
  assert.deepEqual(puzzlesFor(0, null, { l0pattern: true, l0shapes: true, l0pairs: true }), []);
});

test('child-facing names do not say Level', () => {
  assert.equal(bandName(0), 'Kindergarten');
  assert.equal(bandName(1), 'Number sense');
  assert.equal(moveLine(0, 1), 'Kindergarten is finished. Next is Number sense.');
  assert.equal(moveLine(7, null), 'Powers, lines and triangles is finished.');
  assert.doesNotMatch(moveLine(2, 3), /Level|Early Start/);
});

test('home read-aloud names the grade and the subjects', () => {
  const S = freshState('Ada', '2026-11-21');
  S.level = 0; S.grade = 'K'; S.placed = true;
  const say = homeSay(S, skillsOf(0));
  assert.match(say, /Hi, Ada/);
  assert.match(say, /Kindergarten/);
  assert.match(say, /Numbers/);
  assert.match(say, /Colors/);
  assert.equal(activeGrade(S).id, 'K');
  S.grade = '3'; S.level = 2;
  assert.equal(activeGrade(S).label, 'Grade 3');
  assert.equal(SKILLS.length > 0, true);
});
