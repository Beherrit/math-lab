import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState, newSkillState } from '../js/core/state.js';
import { applySetup, setGrade } from '../js/core/learner.js';
import { SKILL } from '../js/skills/registry.js';
import { makeRound } from '../js/games/catalog.js';
import { becauseText } from '../js/core/say.js';
import {
  buildChallenge, seededProblem, syncChallenge, noteAnswer, completeChallenge, challengeStreak, monthCells,
} from '../js/core/challenge.js';

const on = (name, grade) => applySetup(freshState(name, '2026-11-01'), { name, grade });

test('the same date and progress always build the same challenge', () => {
  const a = buildChallenge(on('Ada', 'K'), '2026-11-21');
  const b = buildChallenge(on('Ada', 'K'), '2026-11-21');
  assert.deepEqual(a, b);
  assert.equal(a.grade, 'K');
  assert.equal(a.level, 0);
  assert.equal(a.items.filter(it => it.kind === 'review').length, 0);
  assert.equal(a.items.filter(it => it.kind === 'stretch').length, 1);
  assert.equal(a.items.filter(it => it.kind === 'puzzle').length, 1);
  for (const it of a.items) {
    if (it.skill) assert.equal(SKILL[it.skill].level, 0, it.skill);
    if (it.game) assert.equal(SKILL[makeRound(it.game, it.seed).skill].level, 0);
  }
  const other = buildChallenge(on('Ada', 'K'), '2026-11-22');
  assert.notDeepEqual(a.items.map(it => it.seed), other.items.map(it => it.seed));
});

test('a skill item and its puzzle rebuild the same question and a reason', () => {
  const S = on('Ada', 'K');
  const set = buildChallenge(S, '2026-11-21');
  const skill = set.items.find(it => it.kind === 'stretch');
  const puzzle = set.items.find(it => it.kind === 'puzzle');
  const p1 = seededProblem(S, skill);
  const p2 = seededProblem(S, skill);
  assert.equal(p1.key, p2.key);
  assert.ok(becauseText(p1).length > 0);
  const r1 = makeRound(puzzle.game, puzzle.seed);
  const r2 = makeRound(puzzle.game, puzzle.seed);
  assert.equal(r1.answer, r2.answer);
  assert.ok(r1.why.length > 0);
});

test('grades 1 and 2 get a level 1 puzzle in the daily challenge', () => {
  for (const grade of ['1', '2']) {
    const set = buildChallenge(on('Ada', grade), '2026-11-21');
    assert.equal(set.level, 1);
    const puzzle = set.items.find(it => it.kind === 'puzzle');
    assert.ok(['g1jump', 'g1clock', 'g1shape'].includes(puzzle.game));
    assert.equal(SKILL[makeRound(puzzle.game, puzzle.seed).skill].level, 1);
    const stretch = set.items.find(it => it.kind === 'stretch');
    assert.equal(SKILL[stretch.skill].level, 1);
  }
});

test('grades 3, 4 and 5 each get the puzzle for that level', () => {
  const expect = { 3: 'g3split', 4: 'g4bars', 5: 'g5order' };
  for (const grade of ['3', '4', '5']) {
    const set = buildChallenge(on('Ada', grade), '2026-11-21');
    assert.equal(set.level, Number(grade) - 1);
    const puzzle = set.items.find(it => it.kind === 'puzzle');
    assert.equal(puzzle.game, expect[grade]);
    assert.equal(SKILL[makeRound(puzzle.game, puzzle.seed).skill].level, set.level);
  }
});

test('grades 6, 7 and 8 each get a puzzle for that level', () => {
  const expect = { 6: ['g6mix', 'g6balance'], 7: ['g7signs'], 8: ['g8squares'] };
  for (const grade of ['6', '7', '8']) {
    const set = buildChallenge(on('Ada', grade), '2026-11-21');
    assert.equal(set.level, Number(grade) - 1);
    const puzzle = set.items.find(it => it.kind === 'puzzle');
    assert.ok(expect[grade].includes(puzzle.game));
    assert.equal(SKILL[makeRound(puzzle.game, puzzle.seed).skill].level, set.level);
  }
});

test('grades 9 to 12 share one band and one of its puzzles', () => {
  const expect = ['g9cross', 'g9corner', 'g9growth', 'g9secant'];
  for (const grade of ['9', '10', '11', '12']) {
    const set = buildChallenge(on('Ada', grade), '2026-11-21');
    assert.equal(set.level, 8);
    const puzzle = set.items.find(it => it.kind === 'puzzle');
    assert.ok(expect.includes(puzzle.game));
    assert.equal(SKILL[makeRound(puzzle.game, puzzle.seed).skill].level, 8);
  }
});

test('the set matches the grade: review can be earlier, stretch stays on the grade, and Grade 3 has its puzzle', () => {
  const S = on('Bo', '3');
  S.skills.l0count = { ...newSkillState(), mastered: true, n: 8, c: 8, L: 3, rev: { stage: 0, due: '2026-11-21', miss: 0 } };
  const set = buildChallenge(S, '2026-11-21');
  assert.equal(set.grade, '3');
  assert.equal(set.level, 2);
  const reviews = set.items.filter(it => it.kind === 'review');
  assert.ok(reviews.some(it => it.skill === 'l0count'));
  assert.ok(reviews.every(it => SKILL[it.skill].level <= 2));
  const stretch = set.items.find(it => it.kind === 'stretch');
  assert.equal(SKILL[stretch.skill].level, 2);
  assert.equal(set.items.find(it => it.kind === 'puzzle').game, 'g3split');
  S.settings.off.l0count = true;
  const hidden = buildChallenge(S, '2026-11-21');
  assert.ok(!hidden.items.some(it => it.skill === 'l0count'));
});

test('a started challenge stays put when the grade changes, and the next day follows the new grade', () => {
  const S = on('Ada', 'K');
  const first = syncChallenge(S, '2026-11-21');
  noteAnswer(S, '2026-11-21', 0, true);
  setGrade(S, '3');
  const kept = syncChallenge(S, '2026-11-21');
  assert.equal(kept.grade, 'K');
  assert.equal(kept.items[0].status, 'right');
  assert.equal(kept, first);
  const next = syncChallenge(S, '2026-11-22');
  assert.equal(next.grade, '3');
  assert.equal(next.items.every(it => it.status == null), true);
  assert.ok(next.items.some(it => it.skill && SKILL[it.skill].level === 2));
});

test('the challenge streak grows across neighboring days, resets after a gap, and ignores a second finish', () => {
  const S = on('Ada', 'K');
  assert.equal(challengeStreak(S, '2026-11-01'), 0);
  assert.equal(completeChallenge(S, '2026-11-01').streak, 1);
  assert.equal(challengeStreak(S, '2026-11-02'), 1);
  assert.equal(completeChallenge(S, '2026-11-02').streak, 2);
  assert.equal(completeChallenge(S, '2026-11-02').already, true);
  assert.equal(S.challenge.streak.n, 2);
  assert.equal(completeChallenge(S, '2026-11-04').streak, 1);
  assert.equal(challengeStreak(S, '2026-11-05'), 1);
  assert.equal(challengeStreak(S, '2026-11-06'), 0);
  assert.equal(S.challenge.done['2026-11-01'], true);
  assert.equal(S.challenge.done['2026-11-03'], undefined);
});

test('finishing the last item records the day, and November starts on the calendar', () => {
  const S = on('Ada', 'K');
  const set = syncChallenge(S, '2026-11-21');
  for (let i = 0; i < set.items.length; i++) {
    const res = noteAnswer(S, '2026-11-21', i, i === 0);
    assert.equal(res.done, i === set.items.length - 1);
  }
  assert.equal(S.challenge.streak.n, 1);
  assert.equal(S.challenge.done['2026-11-21'], true);
  assert.equal(noteAnswer(S, '2026-11-21', 0, false).already, true);
  const cells = monthCells('2026-11-21');
  assert.equal(cells[6], '2026-11-01');
  assert.equal(cells.filter(Boolean).length, 30);
  assert.ok(cells.includes('2026-11-21'));
});
