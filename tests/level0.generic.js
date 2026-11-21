// Checks every level 0 problem must pass, whatever the skill: fields, spoken text, glyph ban, options, svg, spoken answers.
import assert from 'node:assert/strict';
import { check, ANSWER_KINDS } from '../js/util.js';
import { strip, wellFormed } from './level0.svg.js';
import { word, SHAPE_NAMES, HEX } from './level0.facts.js';

const PLAIN = /^[A-Za-z ,.?']+$/;
export const GLYPH = new RegExp('[\\u2190-\\u21FF]|[\\u2600-\\u{10FFFF}]', 'u');
const COUNT_SKILLS = ['l0count', 'l0count20'];
const textOf = p => JSON.stringify([p.ask, p.expr, p.say, p.sayOptions, p.hint, p.ways, p.answer.options, p.visual].filter(x => x != null));

export function sane(p, s, L, where) {
  assert.ok(p, `${where}: no problem`);
  assert.ok(typeof p.ask === 'string' && strip(p.ask).trim().length > 2, `${where}: ask`);
  assert.ok(typeof p.hint === 'string' && p.hint.length > 8 && !/<|undefined/.test(p.hint), `${where}: hint`);
  assert.ok(Array.isArray(p.ways) && p.ways.length >= 1 && p.ways.every(w => w.t && Array.isArray(w.s) && w.s.length && w.s.every(x => typeof x === 'string' && x)), `${where}: at least one worked way`);
  assert.ok(['find', 'ask', 'pick'].includes(p._t?.mode) && p._t.q, `${where}: _t.mode and _t.q`);
  assert.doesNotMatch(textOf(p), /undefined|NaN|Infinity|null[,\]"]/, `${where}: broken text`);
  assert.doesNotMatch(textOf(p), GLYPH, `${where}: glyph (arrow, symbol or emoji)`);
  assert.doesNotMatch(strip(textOf(p)), /\bgrade\b|colour/i, `${where}: banned word`);
  for (const h of [p.visual, ...(p.answer.options ?? [])]) assert.ok(wellFormed(h), `${where}: svg not well formed`);
  assert.ok(ANSWER_KINDS.includes(p.answer.kind), `${where}: answer kind`);
  if (p.answer.kind === 'choice') {
    const o = p.answer.options;
    assert.ok(o.length >= 2 && o.length <= 4 && new Set(o).size === o.length, `${where}: 2 to 4 unique options, got ${o.length}`);
    assert.ok(Number.isInteger(p.answer.correct) && p.answer.correct >= 0 && p.answer.correct < o.length, `${where}: one correct option`);
    assert.equal(check(p.answer, p.answer.correct).ok, true, `${where}: right answer rejected`);
    assert.equal(check(p.answer, (p.answer.correct + 1) % o.length).ok, false, `${where}: wrong answer accepted`);
  } else {
    assert.equal(p.answer.kind, 'num');
    assert.ok(COUNT_SKILLS.includes(s.id) && L === 3, `${where}: typed answers are only for step 3 of the counting skills`);
    assert.ok(Number.isInteger(p.answer.value) && p.answer.value >= 1 && p.answer.value <= 20, `${where}: typed answer 1 to 20`);
  }
}

const spoken = (p, i) => (p.sayOptions ? p.sayOptions[i] : null);
export function sayRules(p, where) {
  assert.match(p.say, PLAIN, `${where}: say must be plain words: "${p.say}"`);
  const n = p.answer.options?.length;
  if (p.answer.kind === 'num') assert.equal(p.sayOptions, null, `${where}: no sayOptions for a typed answer`);
  else if (p.sayOptions !== null) {
    assert.ok(Array.isArray(p.sayOptions) && p.sayOptions.length === n, `${where}: sayOptions must match the options`);
    for (const s of p.sayOptions) assert.match(s, PLAIN, `${where}: sayOptions plain text: "${s}"`);
    assert.equal(new Set(p.sayOptions).size, n, `${where}: sayOptions must differ`);
  }
  if (p._t.mode === 'find') assert.equal(p.sayOptions, null, `${where}: a find question must not read its options`);
  mentions(p, where);
  hidesAnswer(p, where);
}
// A target named by the question must be spoken.
function mentions(p, where) {
  const t = p._t.target, say = p.say;
  if (!t) return;
  if (t.number !== undefined) assert.ok(new RegExp(`\\b${word(t.number)}\\b`).test(say), `${where}: say must name the number ${t.number}: "${say}"`);
  if (t.letter) {
    assert.ok(new RegExp(`\\b${t.letter.toUpperCase()}\\b`).test(say), `${where}: say must name the letter ${t.letter}: "${say}"`);
    assert.ok(new RegExp(t.kind === 'upper' ? 'capital' : 'small').test(say), `${where}: say must name the case`);
  }
  for (const k of ['color', 'shape']) if (t[k]) assert.ok(new RegExp(`\\b${t[k]}\\b`).test(say), `${where}: say must name the ${k} ${t[k]}: "${say}"`);
}
function hidesAnswer(p, where) {
  if (p._t.mode !== 'ask') return;
  const say = p.say.toLowerCase().replace(/(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety) (one|two|three|four|five|six|seven|eight|nine)/g, 'COMPOUND');
  if (p.answer.kind === 'num') return assert.ok(!new RegExp(`\\b${word(p.answer.value)}\\b`).test(say), `${where}: say gives away ${p.answer.value}: "${p.say}"`);
  const s = spoken(p, p.answer.correct);
  if (s) assert.ok(!new RegExp(`\b${s.toLowerCase()}\b`).test(say), `${where}: say gives away "${s}": "${p.say}"`);
}
const VOCAB = new RegExp(`\b(${[...Object.keys(HEX), ...SHAPE_NAMES, 'ovals', 'circles', 'squares', 'triangles', 'big', 'small', 'capital', 'darker', 'lighter', 'darkest', 'lightest', 'longer', 'shorter', 'taller', 'bigger', 'smaller', 'longest', 'shortest', 'tallest', 'biggest', 'smallest', 'more', 'less', 'fewer', 'most', 'fewest', 'above', 'below', 'behind'].join('|')})\b`, 'g');
// The question with its numbers, letters, colors, shapes and size words blanked, so two questions with the same wording match.
export const normAsk = p => strip(p.ask).replace(VOCAB, 'X').replace(/\d+/g, '#').replace(/\b[A-HJ-Z]\b|\b[b-z]\b/g, 'X');
