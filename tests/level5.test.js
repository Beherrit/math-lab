import test from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS, generate } from '../js/skills/registry.js';
import { STORY_SOURCES } from '../js/skills/level5/index.js';
import { ANSWER_KINDS } from '../js/util.js';
import { RANGE } from './level5.recompute.js';
import { plain } from './level5.render.js';
import { seeded, N, checkWords, checkText, checkShape, checkAnswer, checkShown, checkWays, checkHint } from './level5.checks.js';

const L5 = SKILLS.filter(s => s.level === 5);
seeded('level 5 has its skills, with unique prefixed ids and adult-only standard codes', () => {
  assert.equal(L5.length, 22);
  for (const s of L5) {
    assert.match(s.id, /^l5[a-z]+$/); assert.equal(s.school, true); assert.ok(s.learn.big && s.learn.tips.length >= 3 && s.learn.words.length >= 2);
    assert.ok(!/grade/i.test(JSON.stringify(s.learn) + s.title + s.sub));
    for (const t of [s.title, s.sub, s.learn.big, ...s.learn.tips, ...s.learn.words.flat()]) checkWords(t, `${s.id} learn text`);
  }
  assert.equal(L5.filter(s => s.story).length, 1);
  assert.ok(STORY_SOURCES.length >= 10);
});
for (const s of L5) for (const L of [1, 2, 3]) {
  seeded(`${s.id} step ${L}: ${N} problems recomputed and checked`, () => {
    const keys = new Set();
    for (let i = 0; i < N; i++) {
      const p = generate(s.id, L), where = `${s.id} L${L} [${p && p._t ? p._t.k : '?'}] ${p ? plain(p.story || '') + ' ' + plain(p.expr || p.ask) : ''}`;
      assert.ok(p && p._t, `${where}: every problem carries its operands`);
      assert.ok(ANSWER_KINDS.includes(p.answer.kind), `${where}: answer kind`);
      checkText(p, where); checkShape(p.answer, where); checkAnswer(p, where); checkShown(p, where); checkWays(p, where); checkHint(p, where);
      if (!s.story && !p.read && RANGE[p._t.k]) assert.ok(RANGE[p._t.k](p._t, L), `${where}: numbers outside the range for step ${L}: ${JSON.stringify(p._t)}`);
      if (p.story && s.story) assert.ok(p.read && p.read.find && p.read.know.length && p.read.clue && p.read.plan, `${where}: story reading help`);
      keys.add(p.key);
    }
    assert.ok(keys.size >= 40, `${s.id} L${L}: only ${keys.size} different problems in ${N}`);
  });
}
