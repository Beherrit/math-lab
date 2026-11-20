import test from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS, generate } from '../js/skills/registry.js';
import { check, ANSWER_KINDS } from '../js/util.js';
// The input a learner would type for the correct answer, and one that is clearly wrong.
function right(a) {
  if (a.kind === 'num') return String(a.value);
  if (a.kind === 'frac') return { w: '', n: String(Math.abs(a.n)), d: String(a.d), neg: a.n < 0 };
  if (a.kind === 'choice') return a.correct;
  return { x: a.x, y: a.y };
}
function wrong(a) {
  if (a.kind === 'num') return String(a.value + 1);
  if (a.kind === 'frac') return { w: '', n: String(Math.abs(a.n) + 1), d: String(a.d), neg: a.n < 0 };
  if (a.kind === 'choice') return (a.correct + 1) % a.options.length;
  return { x: a.x + 1, y: a.y };
}
test('there is at least one skill and ids are unique', () => {
  assert.ok(SKILLS.length >= 20);
  assert.equal(new Set(SKILLS.map(s => s.id)).size, SKILLS.length);
});
for (const s of SKILLS) {
  test(`skill ${s.id}: fields`, () => {
    assert.equal(typeof s.id, 'string');
    assert.ok(Number.isInteger(s.level) && s.level >= 1 && s.level <= 7);
    for (const f of ['std', 'title', 'sub']) assert.equal(typeof s[f], 'string', f);
    assert.equal(typeof s.gen, 'function');
    assert.equal(typeof s.school, 'boolean');
    assert.equal(typeof s.learn.big, 'string');
    assert.ok(Array.isArray(s.learn.tips) && s.learn.tips.length > 0);
  });
  for (const L of [1, 2, 3]) {
    test(`skill ${s.id} L${L}: 200 problems are answerable and checkable`, () => {
      for (let i = 0; i < 200; i++) {
        const p = generate(s.id, L);
        assert.ok(p, `no problem for ${s.id} L${L}`);
        assert.ok(p.ask || p.expr, 'needs ask or expr');
        assert.ok(p.answer && ANSWER_KINDS.includes(p.answer.kind), `unknown answer kind in ${s.id}`);
        assert.equal(check(p.answer, right(p.answer)).ok, true, `correct answer rejected: ${p.expr || p.ask}`);
        assert.equal(check(p.answer, wrong(p.answer)).ok, false, `wrong answer accepted: ${p.expr || p.ask}`);
      }
    });
  }
}
