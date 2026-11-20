import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState } from '../js/core/state.js';
import { SKILLS, generate } from '../js/skills/registry.js';

import { check, num, choice, way } from '../js/util.js';
import { newLesson, advanceStage, canContinue, revealWatch, anotherWay, hasAnotherWay, showHint, showStep, answerTask, recap, lessonWays, stepsLeft, TURNS } from '../js/core/lesson.js';
import { markLearned, isLearned, needsOffer } from '../js/core/learned.js';
const prob = (ways, extra = {}) => ({ ask: 'q', answer: num(4), hint: 'think', ways, ...extra });
const two = () => prob([way('A', ['a1', 'a2', 'a3']), way('B', ['b1', 'b2'])]);
const one = () => prob([way('A', ['a1', 'a2'])]);
const stepsToEnd = l => { while (revealWatch(l)); };
function toWatch(make) { const l = newLesson('x'); advanceStage(l, make); return l; }
test('stages run in order: idea, watch, together, two turns, done', () => {
  const l = newLesson('x'); const seen = [l.stage]; const make = two;
  while (l.stage !== 'done') {
    if (l.stage === 'watch') stepsToEnd(l);
    if (l.task) answerTask(l.task, true);
    assert.ok(advanceStage(l, make)); seen.push(l.stage + (l.stage === 'turn' ? l.turn : ''));
  }
  assert.deepEqual(seen, ['idea', 'watch', 'together', 'turn0', 'turn1', 'done']);
  assert.equal(TURNS, 2);
});
test('watch reveals one step at a time and will not continue until the first way is read', () => {
  const l = toWatch(two);
  assert.equal(canContinue(l), false); assert.equal(advanceStage(l, two), false);
  assert.ok(revealWatch(l)); assert.equal(l.watch.shown, 1); assert.equal(hasAnotherWay(l), false);
  revealWatch(l); revealWatch(l);
  assert.equal(revealWatch(l), false); assert.equal(canContinue(l), true); assert.equal(hasAnotherWay(l), true);
});
test('a second way is offered once, one step at a time; a single way offers none', () => {
  const l = toWatch(two); stepsToEnd(l);
  assert.ok(anotherWay(l)); assert.equal(l.watch.wi, 1); assert.equal(l.watch.shown, 0);
  assert.equal(canContinue(l), true); stepsToEnd(l); assert.equal(hasAnotherWay(l), false);
  const o = toWatch(one); stepsToEnd(o); assert.equal(hasAnotherWay(o), false); assert.equal(anotherWay(o), false);
});
test('a wrong answer never advances and is never final; it opens the hint', () => {
  const l = newLesson('x'); advanceStage(l, one); stepsToEnd(l); advanceStage(l, one);
  assert.equal(l.stage, 'together');
  for (let i = 0; i < 5; i++) { const r = answerTask(l.task, false); assert.equal(r.solved, false); }
  assert.equal(l.task.tries, 5); assert.equal(l.task.hint, true); assert.equal(canContinue(l), false);
  assert.equal(advanceStage(l, one), false); assert.equal(l.stage, 'together');
  assert.equal(answerTask(l.task, true).solved, true); assert.equal(canContinue(l), true);
});
test('help: hint first or steps first, steps one at a time, recap is the last step of way one', () => {
  const l = newLesson('x'); advanceStage(l, two); stepsToEnd(l); advanceStage(l, two);
  const t = l.task; assert.equal(t.hint, false);
  showHint(t); assert.equal(t.hint, true); assert.equal(t.shown, 0);
  assert.equal(stepsLeft(t), 3); showStep(t); showStep(t); showStep(t);
  assert.equal(showStep(t), false); assert.equal(t.shown, 3); assert.equal(recap(t), 'a3');
});
test('a story problem with a read panel starts its first way with the reading steps', () => {
  const read = { find: 'the total', know: ['3 bags', '4 each'], clue: 'each', plan: 'multiply' };
  const w = lessonWays(prob([way('A', ['3 x 4 = 12'])], { story: 'Sam has bags.', read }));
  assert.equal(w[0].s.length, 5); assert.match(w[0].s[0], /the total/); assert.match(w[0].s[1], /3 bags; 4 each/); assert.equal(w[0].s.at(-1), '3 x 4 = 12');
  const l = newLesson('x'); advanceStage(l, () => prob([way('A', ['3 x 4 = 12'])], { read })); assert.equal(l.watch.ways[0].s.length, 5);
});
test('a choice answer works the same way through the lesson', () => {
  const mk = () => prob([way('A', ['s1'])], { answer: choice('yes', ['no', 'maybe']) });
  const l = newLesson('x'); advanceStage(l, mk); stepsToEnd(l); advanceStage(l, mk);
  const a = l.task.p.answer;
  assert.equal(answerTask(l.task, check(a, a.correct + 1).ok).solved, false);
  assert.equal(answerTask(l.task, check(a, a.correct).ok).solved, true);
});
test('a lesson never changes mastery, stars, streak or the day log; finishing records learned only', () => {
  const S = freshState('T', '2026-11-19'); S.placed = true;
  const before = JSON.parse(JSON.stringify(S));
  const l = newLesson('x');
  while (l.stage !== 'done') { if (l.stage === 'watch') stepsToEnd(l); if (l.task) { answerTask(l.task, false); answerTask(l.task, true); } advanceStage(l, two); }
  assert.deepEqual(S, before);
  markLearned(S, 'x', '2026-11-19');
  assert.deepEqual({ ...S, learned: {} }, { ...before, learned: {} });
  assert.equal(isLearned(S, 'x'), true); assert.equal(S.learned.x, '2026-11-19');
});
test('the offer shows once for a never-practiced skill, not for a practiced one, not after skipping', () => {
  const S = freshState('T', '2026-11-19');
  assert.equal(needsOffer(S, 'a'), true);
  S.skills.a = { L: 1, run: 0, miss: 0, hist: [], n: 0, c: 0, last: null, mastered: false, rev: null };
  assert.equal(needsOffer(S, 'a'), true);
  S.skills.a.n = 2; assert.equal(needsOffer(S, 'a'), false);
  assert.equal(needsOffer(S, 'b'), true); markLearned(S, 'b', '2026-11-19'); assert.equal(needsOffer(S, 'b'), false);
});
test('every skill can be taught: step-1 problems have a way and a recap, for every answer kind', () => {
  const kinds = new Set();
  for (const s of SKILLS) for (let i = 0; i < 3; i++) {
    const p = generate(s.id, 1); if (!p) continue;
    kinds.add(p.answer.kind);
    const l = newLesson(s.id); advanceStage(l, () => p);
    assert.ok(l.watch.ways[0].s.length >= 1, s.id);
    assert.ok(typeof recap({ p }) === 'string' && recap({ p }).length, s.id);
    assert.ok(p.hint, s.id);
  }
  for (const k of ['num', 'frac', 'choice']) assert.ok(kinds.has(k), k);
});
