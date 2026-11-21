// Checks every problem of the newer level 2 skills must pass, on top of the shared ones: readable numbers, no glyphs, markers, hints, endings, variety.
import assert from 'node:assert/strict';
import { plain, nums, mixed } from './level2.parse.js';
import { SPECIAL_TEXT } from './level2.special.js';
import { SPECIAL_PICS } from './level2.pics.js';

export const SPECIAL_NEW = { ...SPECIAL_TEXT, ...SPECIAL_PICS };
const GLYPH = /[\u{1F000}-\u{1FFFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u2022\u2713\u2714\u2715\u2716]/u;
const flat = v => (typeof v === 'number' ? [Math.abs(v)] : v && typeof v === 'object' ? Object.values(v).flatMap(flat) : []);

export function newChecks(p, where) {
  const everything = JSON.stringify([p.ask, p.expr, p.story, p.hint, p.ways, p.visual, p.read, p.pre, p.answer.options, p.suffix]);
  assert.doesNotMatch(everything, GLYPH, `${where}: emoji, arrow or tick glyph`);
  assert.doesNotMatch(plain(everything), /\bgrades?\b/i, `${where}: grade wording`);
  // The numbers the answer depends on are on the page (text, choices or the picture's own labels), unless the picture alone carries them.
  if (p._t.pic) assert.match(String(p.ask), /<!--.+-->/, `${where}: picture-only question needs the hidden marker`);
  else {
    const seen = new Set(nums([p.story, p.ask, p.expr, p.visual, ...(p.answer.options || [])].join(' ')));
    for (const v of new Set(flat(p._t))) assert.ok(seen.has(v), `${where}: ${v} from ${JSON.stringify(p._t)} is not on the page`);
  }
  const a = p.answer, w = p.ways.find(x => x.t !== 'Read it like a detective'), last = plain(w.s[w.s.length - 1]).toLowerCase(), hint = plain(p.hint).toLowerCase();
  if (a.kind === 'choice') {
    const c = plain(a.options[a.correct]).toLowerCase();
    assert.ok(last.includes(c), `${where}: first way must end on "${c}": ${last}`);
    if (!['true', 'false'].includes(c) && c.length > 1) assert.ok(!hint.includes(c), `${where}: the hint gives away "${c}"`);
  }
  if (a.kind === 'frac') {
    const m = last.match(/(?:(\d+)\s+)?(\d+)\/(\d+)[^\d]*$/), top = m ? +(m[1] || 0) * +m[3] + +m[2] : null, d = m ? +m[3] : null;
    assert.ok(m, `${where}: first way must end on a fraction: ${last}`);
    assert.equal(top * a.d, a.n * d, `${where}: first way ends on ${top}/${d}, the answer is ${a.n}/${a.d}`);
  }
}
// At least four different kinds of question in the 300 samples: the kind of answer, what the answer is worked from, and whether there is a picture or a story.
export function varietyCheck(seen, id, L) {
  const kinds = new Set(seen.map(p => [p._t.f, p.answer.kind, p.visual ? 'v' : '-', p.story ? 's' : '-'].join('|')));
  assert.ok(kinds.size >= 4, `${id} L${L}: only ${kinds.size} kinds of question: ${[...kinds].join(' ; ')}`);
}
export function strandChecks(SKILLS) {
  const order = [];
  for (const s of SKILLS) if (order[order.length - 1] !== s.strand) order.push(s.strand);
  assert.equal(new Set(order).size, order.length, `a strand comes back after another: ${order.join(', ')}`);
  assert.equal(SKILLS[SKILLS.length - 1].story, true, 'the story skill comes last');
}
void mixed;
