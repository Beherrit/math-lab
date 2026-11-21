// Level 0 (Early Start): every skill, every step, 300 problems, answers recomputed from the drawn pictures and the question text.
// The seed is printed when a test fails; rerun with L0_SEED=<seed> to repeat it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS, STORY_SOURCES } from '../js/skills/level0/index.js';
import { WORDS } from '../js/skills/level0/soundwords.js';
import { sane, sayRules, normAsk, GLYPH } from './level0.generic.js';
import { NUMBER_CHECKS } from './level0.numbers.js';
import { SHAPE_CHECKS } from './level0.shapes.js';
import { LETTER_CHECKS } from './level0.letters.js';
import { SHORT_VOWEL_WORDS, SAYS } from './level0.facts.js';
import { strip } from './level0.svg.js';

const N = 300;
const SEED = Number(process.env.L0_SEED) || (Date.now() % 1e9);
const prng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const realRandom = Math.random;
const seeded = (name, fn) => test(name, () => {
  Math.random = prng(SEED);
  try { fn(); } catch (e) { e.message = `[seed ${SEED}] ${e.message}`; throw e; } finally { Math.random = realRandom; }
});

const ORDER = ['l0count', 'l0five', 'l0count20', 'l0numrec', 'l0next', 'l0tens', 'l0more', 'l0order', 'l0add', 'l0on', 'l0sub', 'l0pairs', 'l0shapes', 'l0solids', 'l0size', 'l0where',
  'l0pattern', 'l0sort', 'l0colours', 'l0upper', 'l0lower', 'l0match', 'l0abc', 'l0sound'];
const STRANDS = ['Numbers', 'Adding and subtracting', 'Shapes and space', 'Colors', 'Letters'];
const LETTER_F = Object.keys(LETTER_CHECKS);

seeded('level 0: 24 skills in path order, complete, level 0, known strands', () => {
  assert.deepEqual(SKILLS.map(s => s.id), ORDER);
  assert.deepEqual(STORY_SOURCES, []);
  for (const s of SKILLS) {
    assert.equal(s.level, 0);
    assert.ok(STRANDS.includes(s.strand), `${s.id}: strand ${s.strand}`);
    assert.ok(s.std && s.title && s.sub && typeof s.gen === 'function');
    assert.ok(s.learn.big && s.learn.tips.length >= 2 && s.learn.words.length >= 1, `${s.id}: learn`);
    assert.doesNotMatch(JSON.stringify([s.title, s.sub, s.learn]), /\bgrade\b|colour/i, `${s.id}: banned text`);
    assert.doesNotMatch(JSON.stringify([s.title, s.sub, s.learn]), GLYPH, `${s.id}: glyph`);
  }
});

seeded('level 0: the first-sound word list is large, safe and unambiguous', () => {
  assert.ok(WORDS.length >= 60 && new Set(WORDS).size === WORDS.length, `words: ${WORDS.length}`);
  for (const w of WORDS) {
    assert.match(w, /^[a-z]+$/, w);
    assert.doesNotMatch(w, /^(ph|kn|wr|gn|ps|th|sh|ch|wh|qu|x)/, `${w}: tricky start`);
    assert.doesNotMatch(w, /^[cg][eiy]/, `${w}: soft c or g`);
    if ('aeiou'.includes(w[0])) assert.ok(SHORT_VOWEL_WORDS.includes(w), `${w}: vowel start must be a short vowel word`);
    assert.ok(SAYS[w[0]], w);
  }
  assert.ok('abcdefghijklmnoprstuvwyz'.split('').filter(c => !WORDS.some(w => w[0] === c)).length === 0, 'every letter but q and x has a word');
});

const CHECKS = { ...NUMBER_CHECKS, ...SHAPE_CHECKS };
for (const s of SKILLS) for (const L of [1, 2, 3]) {
  seeded(`${s.id} step ${L}: ${N} problems checked`, () => {
    const qs = new Set(), asks = new Set();
    for (let i = 0; i < N; i++) {
      const p = s.gen(L), where = `${s.id} L${L} "${strip(p?.ask)} ${strip(p?.expr)}"`;
      sane(p, s, L, where); sayRules(p, where);
      const f = p._t.f;
      if (LETTER_F.includes(f)) LETTER_CHECKS[f](p, L, where);
      else { assert.ok(CHECKS[f], `${where}: _t.f "${f}" has no check`); CHECKS[f](p, where); }
      qs.add(p._t.q); asks.add(normAsk(p));
    }
    assert.ok(qs.size >= 3, `${s.id} L${L}: only ${qs.size} question kinds: ${[...qs]}`);
    assert.ok(asks.size >= 3, `${s.id} L${L}: only ${asks.size} question wordings: ${[...asks]}`);
  });
}
