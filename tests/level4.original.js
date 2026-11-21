import assert from 'node:assert/strict';
import { generate } from '../js/skills/registry.js';
import { check, ANSWER_KINDS } from '../js/util.js';
import { plain, badArithmetic } from './level4.render.js';
import { seeded, checkWords, checkText } from './level4.checks.js';

// The 20 original Level 4 skills have no _t operands, so they get the checks that need none: text sanity, hint, a checkable
// answer, and every written sum "a op b = c" in the worked ways must be true.
export const ORIGINAL_IDS = ['oa', 'pat', 'pv', 'dec', 'rnd', 'mul', 'div', 'das', 'ddiv', 'dmul', 'fas', 'fmul', 'scale', 'fdiv', 'conv', 'lplot', 'vol', 'coord', 'shapes', 'story'];
const right = a => (a.kind === 'num' ? String(a.value) : a.kind === 'frac' ? { w: '', n: String(Math.abs(a.n)), d: String(a.d), neg: a.n < 0 } : a.kind === 'choice' ? a.correct : { x: a.x, y: a.y });
export function originalChecks(id, L, n = 150) {
  seeded(`${id} step ${L}: ${n} original problems are sane`, () => {
    for (let i = 0; i < n; i++) {
      const p = generate(id, L), where = `${id} L${L} ${plain(p && (p.story || p.expr || p.ask))}`.slice(0, 120);
      assert.ok(p && ANSWER_KINDS.includes(p.answer.kind), `${where}: answer kind`);
      // Raw < and > are used as plain comparison signs in some original answer buttons, and pictures from util are checked there.
      checkText(p, where, { angle: false, skipVisual: true });
      assert.equal(check(p.answer, right(p.answer)).ok, true, `${where}: stated answer rejected`);
      for (const w of p.ways) for (const s of w.s) assert.equal(badArithmetic(plain(s)), null, `${where}: way "${w.t}" has a false sum: ${badArithmetic(plain(s))}`);
    }
  });
}
