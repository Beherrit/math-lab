// The prerequisite graph: every skill lists earlier skills, nothing is missing, and nothing comes first.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS, SKILL, skillsOf } from '../js/skills/registry.js';
import { needsOf, gapSkill, missingIds, orderGaps, cycles } from '../js/core/foundations.js';

const before = (level, earlier, later) => {
  const ids = skillsOf(level).map(s => s.id);
  assert.ok(ids.indexOf(earlier) >= 0 && ids.indexOf(earlier) < ids.indexOf(later), `${earlier} should come before ${later}`);
};

test('every skill lists its foundations, and every listed id exists', () => {
  assert.equal(missingIds().length, 0, missingIds().join(', '));
  for (const s of SKILLS) {
    const ids = needsOf(s.id);
    assert.ok(Array.isArray(ids), s.id);
    assert.equal(new Set(ids).size, ids.length, `${s.id} repeats a foundation`);
    assert.ok(!ids.includes(s.id), s.id);
  }
});

test('the foundation graph has no cycles', () => {
  assert.equal(cycles(), null);
});

test('no skill comes before a skill it builds on', () => {
  const gaps = orderGaps();
  assert.deepEqual(gaps, []);
});

test('the five ordering problems now run foundation first', () => {
  before(4, 'l4fshare', 'fdiv');
  before(5, 'l5pct', 'l5fdp');
  before(5, 'l5ineq', 'l5solution');
  before(5, 'l5plots', 'l5statq');
  before(7, 'l7similar', 'l7slopewhy');
  assert.equal(SKILL.l5fdp.strand, 'Ratios and percents');
});

test('a miss offers the nearest foundation that is not mastered yet', () => {
  assert.deepEqual(needsOf('l0on'), ['l0count', 'l0add']);
  assert.equal(gapSkill({ skills: {}, settings: { off: {} } }, 'l0on'), 'l0add');
  assert.equal(gapSkill({ skills: { l0add: { mastered: true } }, settings: { off: {} } }, 'l0on'), 'l0count');
  assert.equal(gapSkill({ skills: { l0add: { mastered: true }, l0count: { mastered: true } }, settings: { off: {} } }, 'l0on'), null);
  assert.ok(needsOf('l0count').length === 0);
  assert.ok(needsOf('fdiv').includes('l4fshare'));
  assert.deepEqual(needsOf('l7slopewhy'), ['l7slope', 'l7similar']);
  assert.ok(needsOf('l8diff').includes('l8factor'));
});
