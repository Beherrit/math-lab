// Generic checks for the level 3 content tests: a seeded Math.random, number parsing from rendered text, which
// numbers a question must show, and whether the worked ways and the hint treat the answer properly.
import assert from 'node:assert/strict';

// Math.random is replaced by a seeded generator so that a failure can be repeated: SEED=123 node --test tests/level3.test.js
export const SEED = Number(process.env.SEED) || (Date.now() >>> 0);
let state = SEED;
Math.random = () => {
  state = (state + 0x6D2B79F5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
process.on('exit', code => { if (code) console.error(`level 3 tests failed with seed ${SEED}. Repeat with: SEED=${SEED} node --test tests/level3.test.js`); });

// The key the app uses to avoid repeats: generate() in js/skills/registry.js. The picture is not part of it.
export const appKey = p => (p.expr || '') + (p.story || '') + (p.ask || '');

// What the learner reads: hidden markers and tags removed, entities decoded.
export const visible = html => String(html).replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
// Every number written in the text, in order: 1,250 and 3.5 are one number each.
export const numbersIn = html => (visible(html).match(/\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?/g) || []).map(s => Number(s.replace(/,/g, '')));
const counts = xs => xs.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map());

// Operands that are meant to stay out of the question text (the learner works them out or sees them another way).
const LP = ['den', 'lo', 'counts'];
const HIDDEN_NEW = { patmiss: ['step', 'at'], tenfold: ['hiP', 'loP'], fpbar: ['n'], mxpic: ['w', 'n', 'd'], docloser: ['i'], dogrid: ['a', 'c'], prread: ['deg'], prdiff: ['r1', 'r2'], prsplit: ['total'], prest: ['deg'], eswhich: ['to'], sycomplete: ['half'],
  lpAt: LP, lpTotal: LP, lpMore: LP, lpDiff: LP, lpMost: LP, lpSum: LP, lpCmp: ['den', 'base', 'counts'] };
const HIDDEN = { ...HIDDEN_NEW, digit: ['p'], cmp: ['c'], times: ['hi', 'lo'], round: ['to'], which: ['to'], est: ['to'], box: ['x', 'y'], dot: ['lo', 'step', 'i'], atype: ['deg'], turn: ['n', 'd'], apart: ['total'], nth: ['i'], units: ['w'] };
// Operands that only the picture shows, when there is one.
const PICTURE = { f2d: ['n'], dot: ['lo', 'step', 'i'], atype: ['deg'] };
// The numbers the answer depends on, taken from the raw operands of the problem.
function operandsOf(t, hidden) {
  // Both fractions of a sum are on the same bottom, which is written once when the first number is a whole one.
  if (t.kind === 'fsum' && t.a[0] && !t.a[1]) t = { ...t, a: [t.a[0], 0] };
  const out = [];
  for (const [key, v] of Object.entries(t)) if (!hidden.includes(key)) for (const x of [v].flat(2)) if (typeof x === 'number' && x !== 0) out.push([key, x]);
  return out;
}
// Every operand must be among the numbers the learner reads: question text first, then the picture's labels. An
// operand that appears twice in the problem (7 x 7, or two fractions on the same bottom) must be written twice.
export function operandsShown(p, where) {
  const t = p._t, text = counts(numbersIn([p.ask, p.expr, p.story].filter(Boolean).join(' '))), pic = counts(p.visual ? numbersIn(p.visual) : []);
  const need = operandsOf(t, HIDDEN[t.kind] || []).filter(([key]) => !(p.visual && (PICTURE[t.kind] || []).includes(key)));
  for (const [x, times] of counts(need.map(o => o[1]))) {
    const shown = (text.get(x) || 0) + (pic.get(x) || 0);
    assert.ok(shown >= times, `${where}: operand ${x} (needed ${times} times, shown ${shown}) is missing from: ${visible([p.ask, p.expr, p.story].filter(Boolean).join(' '))} ${JSON.stringify(t)}`);
  }
}

// How many columns need a carry (adding) or a trade (subtracting), for the friendly first step.
export function regroups(a, c, op) {
  let n = 0, carry = 0;
  for (let p = 0; a >= 10 ** p || c >= 10 ** p; p++) {
    const x = Math.floor(a / 10 ** p) % 10, y = Math.floor(c / 10 ** p) % 10;
    carry = (op === '+' ? x + y + carry >= 10 : x - carry < y) ? 1 : 0;
    n += carry;
  }
  return n;
}

// The forms in which a number can be written in a step: a whole number, a fraction or a mixed number.
function formsIn(html) {
  const forms = [], FR = '<span class="fr"><span class="n">(\\d+)</span><span class="d">(\\d+)</span></span>';
  let rest = String(html).replace(/<!--[\s\S]*?-->/g, ' ');
  rest = rest.replace(new RegExp(`(\\d+)<span class="mxs"></span>${FR}`, 'g'), (_, w, n, d) => { forms.push({ kind: 'frac', v: Number(w) + n / d }); return ' '; });
  rest = rest.replace(new RegExp(FR, 'g'), (_, n, d) => { forms.push({ kind: 'frac', v: n / d }); return ' '; });
  for (const v of numbersIn(rest)) forms.push({ kind: 'whole', v });
  return forms;
}
const near = (a, c) => Math.abs(a - c) < 1e-9;
// Does this text hold the stated answer, written the way the answer is written?
export function holdsAnswer(answer, html) {
  if (answer.kind === 'num') return numbersIn(html).some(v => near(v, answer.value));
  if (answer.kind === 'frac') {
    const want = answer.n / answer.d;
    return formsIn(html).some(f => near(f.v, want) && (answer.d > 1 ? f.kind === 'frac' : f.kind === 'whole'));
  }
  const opt = answer.options[answer.correct];
  const single = /^\s*(\d+)?(?:<span class="mxs"><\/span>)?<span class="fr"><span class="n">(\d+)<\/span><span class="d">(\d+)<\/span><\/span>\s*$/.exec(opt);
  if (single) { const [, w, n, d] = single; return formsIn(html).some(f => f.kind === 'frac' && near(f.v, Number(w || 0) + n / d)); }
  if (/class="fr"/.test(opt)) return String(html).includes(opt) || visible(html).toLowerCase().includes(visible(opt).toLowerCase()); // a sum of fractions: the step must write all of it
  const want = visible(opt).toLowerCase();
  if (/^[\d,.]+$/.test(want)) return numbersIn(html).some(v => near(v, Number(want.replace(/,/g, ''))));
  return visible(html).toLowerCase().includes(want);
}

// Stories that round up, round down or ask only for the leftover: every way has to finish on what was asked.
const ROUNDING = p => p.story && ['div', 'bags', 'wholes'].includes(p._t.kind);
export function checkWays(p, where) {
  const ways = p.ways.filter(w => w.t !== 'Read it first');
  const first = ways[0];
  assert.ok(holdsAnswer(p.answer, first.s.at(-1)), `${where}: the last step of "${first.t}" does not hold the answer: ${visible(first.s.at(-1))} (answer ${JSON.stringify(p.answer.value ?? p.answer.options?.[p.answer.correct] ?? p.answer)})`);
  if (ROUNDING(p)) for (const w of ways) assert.ok(holdsAnswer(p.answer, w.s.at(-1)), `${where}: the last step of "${w.t}" does not end on the answer: ${visible(w.s.at(-1))}`);
}

// A hint points at the first step. It must not hand over the answer, unless that number is already in the question.
export function checkHint(p, where) {
  const a = p.answer, seen = numbersIn([p.ask, p.expr, p.story, p.visual].filter(Boolean).join(' '));
  if (a.kind === 'num') {
    const bad = numbersIn(p.hint).some(v => near(v, a.value) && !seen.some(s => near(s, v)));
    assert.ok(!bad, `${where}: the hint gives the answer ${a.value}: ${p.hint}`);
  } else if (a.kind === 'choice') {
    const word = visible(a.options[a.correct]).toLowerCase();
    if (/^[a-z]{3,}$/.test(word)) assert.ok(!new RegExp(`\\b${word}\\b`).test(visible(p.hint).toLowerCase()), `${where}: the hint gives the answer ${word}: ${p.hint}`);
  }
}
