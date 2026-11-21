import assert from 'node:assert/strict';
import { SKILLS, skillsOf, generate } from '../js/skills/registry.js';
import { STORY_SOURCES } from '../js/skills/level4/index.js';
import { ANSWER_KINDS } from '../js/util.js';
import { plain } from './level4.render.js';
import { KINDS } from './level4.kinds.js';
import { seeded, N, checkWords, checkText, checkShape, checkAnswer, checkShown, checkWays, checkHint } from './level4.checks.js';
import { originalChecks, ORIGINAL_IDS } from './level4.original.js';

const STRANDS = ['Numbers', 'Adding and subtracting', 'Multiplying and dividing', 'Fractions and decimals', 'Ratios and percents', 'Algebra', 'Measurement', 'Shapes and space', 'Data and chance', 'Stories'];
const L4 = skillsOf(4), NEW = L4.filter(s => s.id.startsWith('l4'));

seeded('level 4: every skill has a valid strand, the original ids are kept, the new ones are prefixed', () => {
  assert.equal(L4.length, 33);
  for (const s of L4) assert.ok(STRANDS.includes(s.strand), `${s.id}: strand ${s.strand}`);
  assert.equal(new Set(SKILLS.map(s => s.id)).size, SKILLS.length);
  for (const id of ORIGINAL_IDS) assert.ok(L4.some(s => s.id === id), `missing original ${id}`);
  assert.equal(NEW.length, 13);
  assert.equal(L4[L4.length - 1].id, 'story');
});
seeded('level 4: new skills have learn text, adult-only standards and no grade wording', () => {
  for (const s of NEW) {
    assert.match(s.id, /^l4[a-z0-9]+$/); assert.equal(s.school, true); assert.ok(s.learn.big && s.learn.tips.length >= 3 && s.learn.words.length >= 2);
    assert.ok(!/grade/i.test(JSON.stringify(s.learn) + s.title + s.sub));
    for (const t of [s.title, s.sub, s.learn.big, ...s.learn.tips, ...s.learn.words.flat()]) checkWords(t, `${s.id} learn text`);
  }
});
for (const s of NEW) for (const L of [1, 2, 3]) {
  seeded(`${s.id} step ${L}: ${N} problems recomputed and checked`, () => {
    const keys = new Set(), shapes = new Set();
    for (let i = 0; i < N; i++) {
      const p = generate(s.id, L), where = `${s.id} L${L} [${p && p._t ? p._t.k : '?'}] ${p ? plain(p.story || '') + ' ' + plain(p.expr || p.ask) : ''}`.slice(0, 200);
      assert.ok(p && p._t, `${where}: every problem carries its operands`);
      assert.ok(ANSWER_KINDS.includes(p.answer.kind), `${where}: answer kind`);
      checkText(p, where); checkShape(p.answer, where); checkAnswer(p, where); checkShown(p, where); checkWays(p, where); checkHint(p, where);
      const r = KINDS[p._t.k].range; if (r) assert.ok(r(p._t, L), `${where}: numbers outside the range for step ${L}: ${JSON.stringify(p._t)}`);
      if (p.story) assert.ok(p.read && p.read.find && p.read.know.length && p.read.clue && p.read.plan, `${where}: reading help`);
      if (p.visual) assert.match(p.ask, /<!--/, `${where}: picture questions carry a hidden marker`);
      keys.add(p.key); shapes.add(p._t.k);
    }
    assert.ok(shapes.size >= 4, `${s.id} L${L}: only ${shapes.size} question shapes: ${[...shapes]}`);
    assert.ok(keys.size >= 30, `${s.id} L${L}: only ${keys.size} different problems in ${N}`);
  });
}
seeded('level 4 story skill: the new sources make sound story problems', () => {
  const story = L4.find(s => s.story);
  assert.ok(STORY_SOURCES.length >= 20);
  for (const L of [1, 2, 3]) for (let i = 0; i < 400; i++) {
    const p = generate(story.id, L), where = `story L${L} ${plain(p && p.story)}`.slice(0, 160);
    assert.ok(p && p.read, `${where}: reading help`);
    checkText(p, where, { angle: false, skipVisual: true });
    if (p._t) { checkAnswer(p, where); checkShown(p, where); checkWays(p, where); checkHint(p, where); }
  }
});
for (const id of ORIGINAL_IDS) for (const L of [1, 2, 3]) originalChecks(id, L);
