// Checks for level 6 that read the problem the way a child does: the rendered words, not the generator's own numbers.
// Also holds the seeded random numbers, so a failing run can be repeated exactly.
import assert from 'node:assert/strict';

// ---- seeded randomness: the seed is printed whenever a test fails; L6_SEED=<n> repeats the run ----
export const SEED = Number(process.env.L6_SEED) || (Math.floor(Math.random() * 2 ** 31) + 1);
const hash = s => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7);
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// Wrap a test body: Math.random is replaced by the seeded generator for its duration.
export function seeded(name, fn) {
  return () => {
    const real = Math.random;
    Math.random = mulberry32(SEED ^ hash(name));
    try { return fn(); } catch (e) { throw new Error(`[seed ${SEED}; repeat with L6_SEED=${SEED}] ${e.message}`, { cause: e }); } finally { Math.random = real; }
  };
}

// ---- reading the rendered text ----
// keepVisual keeps the words and numbers inside tables and pictures (what a child reads off them); otherwise they are dropped.
export const plain = (html, keepVisual = false) => String(html ?? '').replace(keepVisual ? /$^/ : /<svg[\s\S]*?<\/svg>/g, ' ').replace(keepVisual ? /$^/ : /<table[\s\S]*?<\/table>/g, ' ')
  .replace(/<sup>[\s\S]*?<\/sup>/g, '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
const norm = s => s.replace(/−/g, '-').replace(/(\d),(?=\d{3}(?!\d))/g, '$1');
export const numbersIn = s => (norm(s).match(/\d+(?:\.\d+)?/g) || []).map(Number);
const WORDS = { two: 2, three: 3, four: 4, five: 5 };
const wordNumbers = s => (s.toLowerCase().match(/\b(two|three|four|five)\b/g) || []).map(w => WORDS[w]);
// Every string a child can see on a problem (not the hidden _t, not the answer object).
export function shownStrings(p) {
  const out = [];
  const add = v => { if (typeof v === 'string') out.push(v); else if (Array.isArray(v)) v.forEach(add); else if (v && typeof v === 'object') Object.values(v).forEach(add); };
  for (const key of ['story', 'ask', 'expr', 'hint', 'ways', 'read', 'pre', 'suffix']) add(p[key]);
  return out.map(plain);
}
const leaves = (v, f) => { if (typeof v === 'number') f(v); else if (v && typeof v === 'object') Object.values(v).forEach(x => leaves(x, f)); };
const NOT_QUANTITIES = new Set(['kind', 'dir', 'pos', 'mode', 'want', 'most', 'wantD', 'wantR', 'wantC', 'type', 'op', 'form', 'ev', 'atLeast', 'first', 'second', 'pred', 'cats']);
// Hidden fields that are not shown as numbers: circles' fraction of a circle, lists of every outcome.
const KIND_HIDDEN = { circA: ['part'], both: ['sets', 'fav'] };
// The sizes a story hands the child, as the generator recorded them. An event's threshold is only shown for some events.
export function operandList(t, mustBeShown = false) {
  const out = [], hidden = KIND_HIDDEN[t.kind] || [];
  for (const [key, v] of Object.entries(t)) {
    if (NOT_QUANTITIES.has(key) || hidden.includes(key) || (mustBeShown && t.kind === 'event' && key === 'arg' && !['gt', 'lt', 'mult'].includes(t.ev))) continue;
    leaves(v, x => out.push(Math.abs(x)));
  }
  return out;
}
export const operandsOf = (t, mustBeShown = false) => new Set(operandList(t, mustBeShown));
// A number the child can work out from the shown ones: a total (sum of some of them) or a gap (difference of two).
function derivable(v, pool) {
  const xs = pool.filter(x => x > 0);
  if (xs.length > 10) return false;
  for (let m = 1; m < 1 << xs.length; m++) {
    const pick = xs.filter((_, i) => m >> i & 1);
    if (Math.abs(pick.reduce((a, b) => a + b, 0) - v) < 1e-9) return true;
    if (pick.length === 2 && Math.abs(Math.abs(pick[0] - pick[1]) - v) < 1e-9) return true;
  }
  return false;
}

// ---- story text must carry the numbers the answer uses, and no others ----
const ALIAS = { interest: t => (Number.isInteger(t.t) ? [] : [t.t * 12]) };
export function storyMatchesOperands(p, t, where) {
  const text = [p.story, p.ask, p.expr, p.visual].map(h => plain(h, true)).join(' '), list = numbersIn(text), shown = new Set(list), words = wordNumbers(text), low = text.toLowerCase();
  const answer = p.answer.kind === 'num' ? Math.abs(p.answer.value) : null, ops = operandsOf(t), alias = (ALIAS[t.kind]?.(t) || []).map(Math.abs);
  const implied = [...(low.includes('number cube') ? [2, 3, 4, 5, 6] : []), ...(low.includes('coin') ? [2] : []), 0, 1, 100];
  for (const v of operandsOf(t, true)) {
    if (implied.includes(v) || v === answer || v === 100 || v === 1000) continue;
    const seen = shown.has(v) || words.includes(v) || alias.some(a => shown.has(a)) || derivable(v, list);
    assert.ok(seen, `${where}: the answer uses ${v} but the child cannot read it in: ${text}`);
  }
  for (const v of shown) {
    const known = implied.includes(v) || ops.has(v) || v === answer || v === 1000 || alias.includes(v) || derivable(v, operandList(t));
    assert.ok(known, `${where}: the text says ${v}, which the answer does not use [${t.kind}]: ${text}`);
  }
}
// A count problem must name every thing being chosen, once per factor, in the question itself.
export function countNamesEveryChoice(p, t, where) {
  assert.equal(t.cats.length, t.xs.length, `${where}: ${t.xs.length} factors but ${t.cats.length} named choices`);
  const ask = plain(p.ask).toLowerCase(), story = plain(p.story).toLowerCase();
  for (const c of t.cats) {
    assert.ok(ask.includes(c), `${where}: the question never names "${c}": ${p.ask}`);
    assert.ok(story.includes(c), `${where}: the story never mentions "${c}": ${p.story}`);
  }
  assert.equal(new Set(t.cats).size, t.cats.length, `${where}: a choice is named twice`);
}

// ---- hints and the first worked way ----
const SHORT = new Set(['about', 'little', 'which', 'these', 'those', 'there', 'their', 'times', 'other', 'angles']);
// A number the hint repeats from the question is not a leak; a "10%" in the hint is not the answer 10 unless the answer is a percent.
export function hintKeepsTheAnswer(p, t, where) {
  const hint = plain(p.hint), a = p.answer, inQuestion = new Set([...operandsOf(t), ...numbersIn([p.story, p.ask, p.expr].map(h => plain(h, true)).join(' '))]);
  const hinted = numbersIn(a.suffix === '%' ? hint : hint.replace(/\d[\d.,]*\s?%/g, ' '));
  const saysNumber = v => !inQuestion.has(Math.abs(v)) && hinted.includes(Math.abs(v));
  if (a.kind === 'num') assert.ok(!saysNumber(a.value), `${where}: the hint gives away the answer ${a.value}: ${hint}`);
  if (a.kind !== 'choice') return;
  const right = a.options[a.correct];
  numbersIn(right).forEach(v => assert.ok(!saysNumber(v), `${where}: the hint contains the right choice "${right}": ${hint}`));
  const keys = (right.toLowerCase().match(/[a-zπ]{5,}/g) || []).filter(w => !SHORT.has(w));
  for (const w of keys) assert.ok(!new RegExp(`\b${w}\b`).test(hint.toLowerCase()), `${where}: the hint names the right choice ("${w}" from "${right}"): ${hint}`);
}
// The first way (after the "read it" way story problems add) must finish on a step that states the numeric answer.
export function firstWayEndsOnAnswer(p, where) {
  const a = p.answer;
  if (a.kind !== 'num') return;
  const way = p.ways.find(w => w.t !== 'Read it like a detective'), steps = way.s.map(plain).filter(Boolean), last = steps[steps.length - 1];
  assert.ok(numbersIn(last).some(v => Math.abs(v - Math.abs(a.value)) < 1e-6), `${where}: way "${way.t}" ends "${last}" but the answer is ${a.value}`);
}

// ---- grammar: a count of 1 never meets a plural noun ----
const NOT_NOUNS = new Set(['is', 'as', 'goes', 'makes', 'gives', 'stands', 'stays', 'becomes', 'means', 'leaves', 'equals', 'takes', 'counts', 'adds', 'plus', 'minus', 'less', 'across', 'always', 'this', 'has', 'was', 'does', 'its', 'versus', 'comes', 'shows', 'splits', 'fits', 'matches', 'moves', 'breaks', 'multiplies', 'holds', 'multiplied', 'divides']);
export function noPluralOfOne(p, where) {
  for (const s of shownStrings(p)) {
    for (const m of norm(s).matchAll(/(?:^|[^\d.\w])-?1 ([a-z]+s)\b/g)) {
      assert.ok(NOT_NOUNS.has(m[1]), `${where}: "1 ${m[1]}" should be singular in: ${s}`);
    }
  }
}

// ---- fixed facts, written here on their own: question text -> the correct choice ----
export const FACTS = {
  'About how many times does the diameter of a circle fit around its edge?': 'A little more than 3 times',
  'What do we call the distance all the way around a circle?': 'circumference',
  'Which is longer: the radius or the diameter of the same circle?': 'The diameter (it is 2 radii)',
  'A circle gets a bigger diameter. What happens to circumference ÷ diameter?': 'It stays the same (it is π)',
  'Two angles add up to 90°. What are they called?': 'complementary',
  'Two angles add up to 180°. What are they called?': 'supplementary',
  'Two straight lines cross. What are the angles opposite each other called?': 'vertical angles',
  'Two angles share a corner point and one side, and do not overlap. What are they called?': 'adjacent',
  'A school wants to know the favourite sport of ALL its students. Which sample is most likely to give a fair picture?': 'Every 10th student on the school list',
  'A town wants to know if people want a new library. Which sample is most likely to give a fair picture?': '200 homes picked at random from the whole town',
  'An app wants to know how many hours a day teenagers spend on phones. Which sample is most likely to give a fair picture?': 'Teenagers picked at random from many schools',
};
