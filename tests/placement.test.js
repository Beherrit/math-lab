import test from 'node:test';
import assert from 'node:assert/strict';
import { startPlacement, answerPlacement, nextPlacementProblem, isDone, MAX_QUESTIONS } from '../js/placement.js';
const ALL = [1, 2, 3, 4, 5, 6, 7];
// Feed a script of 'c' (right first try) and 'm' (miss or skip). Returns the placed level and questions used.
function run(available, script) {
  const p = startPlacement(available);
  for (const [i, ch] of [...script].entries()) {
    const placed = answerPlacement(p, ch === 'c');
    if (placed !== null) return { level: placed, asked: i + 1, p };
  }
  return { level: null, asked: script.length, p };
}
test('starts at level 2', () => assert.equal(startPlacement(ALL).level, 2));
test('all correct reaches the top level and stops', () => {
  const r = run(ALL, 'c'.repeat(30));
  assert.equal(r.level, 7); assert.equal(r.asked, 12);
});
test('all correct stops below an empty level (empty levels are the top)', () => {
  assert.equal(run([1, 2, 3, 4], 'c'.repeat(30)).level, 4);
  assert.equal(run([1, 2, 3], 'c'.repeat(30)).level, 3);
  assert.equal(run([1, 2, 3, 4, 6, 7], 'c'.repeat(30)).level, 4);
});
test('two early misses land on level 1', () => {
  const r = run(ALL, 'mm'); assert.equal(r.level, 1); assert.equal(r.asked, 2);
});
test('two misses at a level place the learner at that level', () => {
  assert.equal(run(ALL, 'ccmm').level, 3);
  assert.equal(run(ALL, 'ccccmm').level, 4);
  assert.equal(run(ALL, 'cmm').level, 2);
});
test('a correct answer breaks the early-miss rule: one early miss is not enough', () => {
  const r = run(ALL, 'mc'); assert.equal(r.level, null);
});
test('a streak needs two in a row: right, miss, right does not move up', () => {
  const r = run(ALL, 'cmc'); assert.equal(r.level, null); assert.equal(r.p.level, 2);
});
test('the check stops at 14 questions and places at the current level', () => {
  const r = run(ALL, 'cmcc'.repeat(3) + 'cm' + 'cccc');
  assert.equal(r.asked, MAX_QUESTIONS); assert.equal(r.level, 5);
});
test('empty ladders: only level 4 has skills, everything lands on 4', () => {
  assert.equal(startPlacement([4]).level, 4);
  assert.equal(run([4], 'cc').level, 4);
  assert.equal(run([4], 'mm').level, 4);
  assert.equal(run([4], 'cmcmcm').level, 4);
});
test('no skills anywhere finishes immediately at level 1', () => {
  const p = startPlacement([]); assert.equal(isDone(p), true); assert.equal(p.result, 1);
});
test('answers after the result are ignored', () => {
  const p = startPlacement(ALL); answerPlacement(p, false); answerPlacement(p, false);
  assert.equal(answerPlacement(p, true), 1); assert.equal(p.asked, 2);
});
test('questions come from the current level through the injected generate', () => {
  const p = startPlacement(ALL);
  const asked = [];
  const skillsOf = n => [{ id: `s${n}a` }, { id: `s${n}b` }];
  const generate = (id, L) => { asked.push([id, L]); return { skill: id, L }; };
  const q = nextPlacementProblem(p, { skillsOf, generate });
  assert.ok(q.skill.startsWith('s2')); assert.equal(asked.length, 1);
  assert.equal(nextPlacementProblem(p, { skillsOf: () => [], generate }), null);
});
