// Recomputation for the letter skills: find, name, count, match, alphabet order and first sounds.
import assert from 'node:assert/strict';
import { strip, attr, texts } from './level0.svg.js';
import { alike, ALPHA, sameSound } from './level0.facts.js';
import { opts, right, rightNum } from './level0.numbers.js';
import { WORDS } from '../js/skills/level0/soundwords.js';

const only = (p, pred, where, why) => assert.deepEqual(opts(p).filter(pred), [right(p)], `${where}: exactly the marked option must ${why}`);
const kindOf = c => (c === c.toUpperCase() ? 'upper' : 'lower');
const sayLetter = p => (p.say.match(/\bletter ([A-Z])\b/) || [])[1];
// Option letters: the right one is the target, none of the others equals it in either case, and trap letters appear only at step 3.
function spread(p, target, L, where) {
  for (const o of opts(p)) if (o !== right(p)) assert.notEqual(o.toLowerCase(), target.toLowerCase(), `${where}: a distractor equals the target`);
  const kind = kindOf(target), others = opts(p).filter(o => o !== right(p)), traps = others.filter(o => alike(kind, target, o));
  if (L === 3) assert.ok(traps.length >= 1, `${where}: step 3 needs a look-alike for ${target}: ${opts(p)}`);
  else assert.equal(traps.length, 0, `${where}: look-alike ${traps} offered with ${target} before step 3`);
  assert.equal(opts(p).length, L === 1 ? 3 : 4, `${where}: option count`);
}
function letterfind(p, L, where) {
  const t = right(p), L1 = sayLetter(p);
  assert.equal(t.toUpperCase(), L1, `${where}: say names ${L1} but the right option is ${t}`);
  assert.equal(kindOf(t), /capital/.test(p.say) ? 'upper' : 'lower', `${where}: case`);
  assert.ok(strip(p.ask).includes(t), `${where}: the letter is in the question`);
  only(p, o => o === t, where, `be ${t}`);
  spread(p, t, L, where);
}
function lettername(p, L, where) {
  const t = attr(p.visual, 'letter');
  assert.equal(right(p), t, `${where}: shown ${t}`);
  spread(p, t, L, where);
}
function lettercount(p, L, where) {
  const t = p._t.letter, row = texts(p.visual).map(x => x.letter);
  assert.equal(row.length, 8, `${where}: row of eight`);
  assert.equal(rightNum(p), row.filter(c => c === t).length, `${where}: count of ${t}`);
  assert.ok(strip(p.ask).includes(t) && p.say.includes(t.toUpperCase()), `${where}: letter named`);
  if (L < 3) assert.ok(row.every(c => c === t || !alike(kindOf(t), t, c)), `${where}: look-alikes in the row before step 3`);
}
function letterpair(p, L, where) {
  if (p._t.dir === 'pair') {
    only(p, o => { const [a, b] = o.split(' '); return a.toLowerCase() === b.toLowerCase(); }, where, 'be the same letter');
    assert.equal(opts(p).length, L === 1 ? 3 : 4, `${where}: option count`);
    return;
  }
  const t = attr(p.visual, 'letter'), want = kindOf(t) === 'upper' ? t.toLowerCase() : t.toUpperCase();
  assert.equal(right(p), want, `${where}: ${t} goes with ${want}`);
  assert.notEqual(t, 'I', `${where}: capital I is left out`);
  for (const o of opts(p)) assert.equal(kindOf(o), kindOf(want), `${where}: option case`);
  only(p, o => o.toLowerCase() === t.toLowerCase(), where, 'be the same letter');
  if (L === 3) assert.ok(opts(p).some(o => o !== want && alike(kindOf(want), want, o)), `${where}: a look-alike at step 3`);
}
function abc(p, L, where) {
  const run = texts(p.visual);
  let want;
  if (run.length) {
    const ls = run.map(t => t.letter), hole = run.findIndex(t => t.hidden), known = ls.findIndex(l => l);
    const idx = ls.map(l => (l ? ALPHA.indexOf(l.toLowerCase()) : -1));
    idx.forEach((v, i) => v >= 0 && assert.equal(v - i, idx[known] - known, `${where}: run is not consecutive`));
    want = ALPHA[idx[known] - known + hole];
    assert.ok(run.length === 4 && hole >= 0, `${where}: run of four`);
  } else {
    const ref = (p.say.match(/\b(?:after|before) ([A-Z])\b/) || [])[1];
    assert.ok(ref, `${where}: reference letter`);
    want = ALPHA[ALPHA.indexOf(ref.toLowerCase()) + (/after/.test(p.say) ? 1 : -1)];
    assert.equal(kindOf(strip(p.ask).match(/\b([A-Za-z])\?/)[1]), 'lower', `${where}: step 3 is small letters`);
  }
  assert.equal(right(p).toLowerCase(), want, `${where}: expected ${want}, marked ${right(p)}`);
  if (L < 3) assert.equal(kindOf(right(p)), 'upper');
  assert.equal(new Set(opts(p).map(o => o.toLowerCase())).size, opts(p).length);
  for (const o of opts(p)) assert.equal(kindOf(o), kindOf(right(p)), `${where}: option case`);
}
function sound(p, L, where) {
  const w = WORDS.find(x => new RegExp(`\\b${x}\\b`).test(p.say.toLowerCase()));
  assert.ok(w, `${where}: say must speak a word from the list: "${p.say}"`);
  const first = w[0];
  assert.equal(right(p).toLowerCase(), first, `${where}: ${w} starts with ${first}`);
  for (const o of opts(p)) if (o !== right(p)) assert.ok(!sameSound(first, o.toLowerCase()), `${where}: ${o} makes the same sound as ${first} (word ${w})`);
  assert.equal(opts(p).length, L === 1 ? 3 : 4);
  if (L < 3) { assert.equal(strip(p.expr), `?${w.slice(1)}`, `${where}: blanked word`); assert.equal(right(p), first, 'lower case before step 3'); }
  else { assert.equal(p.expr, undefined, `${where}: no word shown at step 3`); assert.ok(!new RegExp(`\b${w}\b`).test(strip(p.ask).toLowerCase()), `${where}: word shown in the question at step 3`); assert.equal(right(p), first.toUpperCase()); }
}
export const LETTER_CHECKS = { letterfind, lettername, lettercount, letterpair, abc, sound };
