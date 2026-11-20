// Level 1 content: every skill, every step, 300 problems each. Answers are recomputed from the raw operands in p._t, from the
// question text, and (for choices) by checking that exactly one option is true; stories must print the numbers the generator holds.
import test from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS, STORY_SOURCES } from '../js/skills/level1/index.js';
import { check, answerHTML, ANSWER_KINDS, NAMES } from '../js/util.js';

const N = 300;
const strip = s => String(s ?? '').replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, '');
const js = s => s.replace(/,/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
const isMath = s => /^\d+(\s*[+\-*/]\s*\d+)*$/.test(s.trim());
const evalMath = s => { assert.match(s, /^[\d\s+\-*/().]+$/, `not plain arithmetic: ${s}`); return Function(`return (${s})`)(); };
const sum = xs => xs.reduce((s, x) => s + x, 0);
const digits = n => [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10];
const numsIn = s => (strip(s).replace(/(\d),(\d{3})/g, '$1$2').match(/\d+(?:\.\d+)?/g) || []).map(Number);
function roundTo(n, to) { const lo = n - n % to, hi = lo + to; return n - lo < hi - n ? lo : hi; }
const rounders = (t, to) => Array.from({ length: 1200 }, (_, n) => n).filter(n => roundTo(n, to) === t);
const clock = mins => `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`;
const COIN = { penny: 1, pennies: 1, nickel: 5, nickels: 5, dime: 10, dimes: 10, quarter: 25, quarters: 25, 'dollar bill': 100, 'dollar bills': 100 };
const coinsWorth = s => [...strip(s).matchAll(/(\d+) (pennies|penny|nickels|nickel|dimes|dime|quarters|quarter|dollar bills|dollar bill)/g)].reduce((t, m) => t + +m[1] * COIN[m[2]], 0);

// Independent recomputation: operands -> the expected answer (a number, or the text of the right choice).
const CALC = {
  add: t => sum(t.xs), sub: t => t.a - t.b, mul: t => t.a * t.b,
  div: t => { assert.equal(t.a % t.b, 0, 'division must come out even'); return t.a / t.b; },
  pvnum: t => t.h * 100 + t.t * 10 + t.o,
  worth: t => Number(String(t.n).split('').reverse()[t.p]) * 10 ** t.p,
  digit: t => Number(String(t.n).split('').reverse()[t.p]),
  seq: t => t.start + t.step * t.i,
  round: t => roundTo(t.n, t.to), roundlo: t => Math.min(...rounders(t.t, t.to)), roundhi: t => Math.max(...rounders(t.t, t.to)),
  max: t => String(Math.max(...t.xs)), min: t => String(Math.min(...t.xs)),
  sign: t => (t.a < t.b ? '&lt;' : t.a > t.b ? '&gt;' : '='),
  sorted: t => t.xs.slice().sort((p, q) => p - q).join(', '),
  family: t => `${t.x + t.y} − ${t.x} = ${t.y}`,
  clock: t => clock(t.h * 60 + t.m + t.d),
  elapsed: t => t.h2 * 60 + t.m2 - (t.h1 * 60 + t.m1),
};
// The largest number a learner should meet at each step (operands and answer).
const LIMIT = { l1add20: [20, 20, 20], l1sub20: [20, 20, 20], l1pv: [99, 999, 1000], l1cmp: [99, 999, 999], l1addbig: [99, 999, 1000], l1subbig: [99, 999, 999],
  l1skip: [100, 1000, 150], l1round: [100, 1000, 1000], l1money: [100, 125, 500], l1story: [100, 125, 1000] };
const NEEDS_VARIED_HINT = { l1cmp: [1, 2] };

const numbersIn = v => (typeof v === 'number' ? [v] : v && typeof v === 'object' ? Object.values(v).flatMap(numbersIn) : []);
function right(a) { return a.kind === 'num' ? String(a.value) : a.kind === 'choice' ? a.correct : { w: '', n: String(a.n), d: String(a.d) }; }
function wrong(a) { return a.kind === 'num' ? String(a.value + 1) : a.kind === 'choice' ? (a.correct + 1) % a.options.length : { w: '', n: String(a.n + 1), d: String(a.d) }; }

function sane(p, where) {
  assert.ok(p, `${where}: no problem`);
  assert.ok(p.ask || p.expr, `${where}: needs ask or expr`);
  assert.ok(ANSWER_KINDS.includes(p.answer?.kind), `${where}: answer kind`);
  assert.ok(typeof p.hint === 'string' && p.hint.length > 8, `${where}: hint`);
  assert.ok(Array.isArray(p.ways) && p.ways.length >= 2, `${where}: at least two ways`);
  for (const w of p.ways) assert.ok(w.t && Array.isArray(w.s) && w.s.length && w.s.every(s => typeof s === 'string' && s), `${where}: way "${w.t}"`);
  const text = JSON.stringify([p.ask, p.expr, p.story, p.hint, p.ways, p.visual, p.read, p.pre, p.suffix, p.answer.options]);
  assert.doesNotMatch(text.replace(/,null/g, '').replace(/null,/g, ''), /undefined|NaN|null|Infinity/, `${where}: broken text`);
  assert.doesNotMatch(strip(text), /\bgrade\b/i, `${where}: grade wording`);
  if (p.answer.kind === 'choice') {
    const o = p.answer.options;
    assert.ok(o.length >= 2 && new Set(o).size === o.length, `${where}: options must be unique`);
    assert.ok(Number.isInteger(p.answer.correct) && p.answer.correct >= 0 && p.answer.correct < o.length, `${where}: one correct option`);
  }
  assert.equal(check(p.answer, right(p.answer)).ok, true, `${where}: right answer rejected`);
  assert.equal(check(p.answer, wrong(p.answer)).ok, false, `${where}: wrong answer accepted`);
}

// ---- Exactly one option is correct, judged from the option text ----
const EQ = /(\d+)\s*([+−×÷])\s*(\d+)\s*=\s*(\d+)/;
const eqOf = s => { const m = strip(s).match(EQ); return m && { a: +m[1], op: m[2], b: +m[3], c: +m[4] }; };
const holds = ({ a, op, b, c }) => ({ '+': a + b, '−': a - b, '×': a * b, '÷': a / b })[op] === c;
const bag = ({ a, b, c }) => [a, b, c].sort((x, y) => x - y).join();
const only = (hits, a, where, why) => assert.deepEqual(hits, [a.options[a.correct]], `${where}: exactly the marked option must ${why}`);
function truth(p, where) {
  const t = p._t, says = p.answer.options[p.answer.correct] === 'True';
  let really;
  if (t.round) really = roundTo(t.round.n, t.round.to) === t.round.claim;
  else { const m = strip(p.expr).replace(/&lt;/g, '<').replace(/&gt;/g, '>').match(/^(.*?)(=|<|>)(.*)$/), [l, r] = [m[1], m[3]].map(x => evalMath(js(x.trim()))); really = m[2] === '=' ? l === r : m[2] === '<' ? l < r : l > r; }
  assert.equal(says, really, `${where}: the answer says ${says} but the sentence is ${really}`);
}
const SPECIAL = {
  tf: truth,
  est: (p, where) => {
    const { op, a, c } = p._t, exact = op === 'add' ? a + c : a - c, est = op === 'add' ? roundTo(a, 10) + roundTo(c, 10) : roundTo(a, 10) - roundTo(c, 10);
    only(p.answer.options.filter(o => Math.abs(+o - exact) <= 10), p.answer, where, `be within 10 of ${exact}`);
    assert.equal(p.answer.options[p.answer.correct], String(est), `${where}: estimate`);
  },
  coinset: (p, where) => only(p.answer.options.filter(o => coinsWorth(o) === p._t.total), p.answer, where, `be worth ${p._t.total}`),
  between: (p, where) => only(p.answer.options.filter(o => { const [x, y] = numsIn(o); return x <= p._t.n && p._t.n <= y; }), p.answer, where, 'bracket the number'),
  inpat: (p, where) => only(p.answer.options.filter(o => +o >= p._t.start && (+o - p._t.start) % p._t.step === 0), p.answer, where, 'be in the pattern'),
};
function oneCorrect(p, where) {
  const a = p.answer;
  if (a.kind !== 'choice') return;
  for (const o of a.options) if (/^\d{1,2}:\d\d$/.test(o)) assert.match(o, /^(1[0-2]|[1-9]):[0-5]\d$/, `${where}: "${o}" is not a real clock time`);
  const stem = eqOf(p.ask), opts = a.options.map(eqOf);
  if (stem && /same three numbers|same family/.test(strip(p.ask)) && opts.every(Boolean)) only(a.options.filter((o, i) => holds(opts[i]) && bag(opts[i]) === bag(stem)), a, where, 'be a true fact from the same three numbers');
  if (SPECIAL[p._t.f]) SPECIAL[p._t.f](p, where);
  const vals = a.options.map(o => js(strip(o)));
  if (vals.every(v => isMath(v) && !v.includes('='))) {
    const nums = vals.map(evalMath);
    assert.equal(nums.filter(v => v === nums[a.correct]).length, 1, `${where}: two options have the value ${nums[a.correct]}: ${a.options.join(' | ')}`);
  }
}
// ---- What the child reads must agree with what the generator holds ----
const flat = v => (typeof v === 'number' ? [Math.abs(v)] : v && typeof v === 'object' ? Object.values(v).flatMap(flat) : []);
function storyNumbers(p, where) {
  if (!p.story) return;
  const shown = numsIn([p.story, p.ask, p.expr].join(' ')), text = strip(p.story + ' ' + p.ask);
  for (const v of new Set(flat(p._t))) if (!(v === 60 && /hour/.test(text))) assert.ok(shown.includes(v), `${where}: ${v} (from ${JSON.stringify(p._t)}) is not in the text a child reads: ${shown.join(', ')}`);
}
function endsOnAnswer(p, where) {
  if (p.answer.kind !== 'num') return;
  const w = p.ways.find(x => x.t !== 'Read it like a detective'), last = numsIn(w.s[w.s.length - 1]);
  assert.equal(last[last.length - 1], p.answer.value, `${where}: way "${w.t}" ends on ${last[last.length - 1]}, the answer is ${p.answer.value}`);
}
function hintKeepsQuiet(p, where) {
  if (p.answer.kind !== 'num') return;
  const shown = new Set(numsIn([p.story, p.ask, p.expr].join(' ')));
  assert.ok(!numsIn(p.hint).filter(v => !shown.has(v)).includes(p.answer.value), `${where}: the hint gives away ${p.answer.value}: ${strip(p.hint)}`);
}
const NAME_RE = new RegExp(`\\b(${NAMES.join('|')})\\b`, 'g');
const shapeOf = p => strip([p.story, p.ask, p.expr].join(' ')).replace(NAME_RE, 'N').replace(/[\d?]+/g, '#').replace(/#(?:[,.]?\s*#)+/g, '#');

function recompute(p, where) {
  assert.ok(p._t && (CALC[p._t.f] || SPECIAL[p._t.f]), `${where}: _t.f "${p._t?.f}" is not known to the test`);
  if (SPECIAL[p._t.f]) return;
  const want = CALC[p._t.f](p._t), got = p.answer.kind === 'num' ? p.answer.value : answerHTML(p.answer);
  assert.equal(got, want, `${where}: stated answer ${got}, recomputed ${want} from ${JSON.stringify(p._t)}`);
  const expr = js(strip(p.expr));
  if (p.answer.kind !== 'num' || !p.expr) return;
  if (expr.includes('?') && expr.includes('=')) {
    const [l, r] = expr.replace('?', String(got)).split('=').map(evalMath);
    assert.equal(l, r, `${where}: ${strip(p.expr)} is not true with ${got}`);
  } else if (/^[\d\s+\-*/]+$/.test(expr) && /[+\-*/]/.test(expr)) assert.equal(evalMath(expr), got, `${where}: ${strip(p.expr)} is not ${got}`);
}
function inRange(p, id, L, where) {
  const all = [...numbersIn(p._t), ...(p.answer.kind === 'num' ? [p.answer.value] : [])].filter(v => typeof v === 'number');
  assert.ok(Math.max(...all.map(Math.abs)) <= LIMIT[id][L - 1], `${where}: number above ${LIMIT[id][L - 1]} in ${JSON.stringify(p._t)}`);
  if (p.answer.kind === 'num') assert.ok(p.answer.value >= 0 && Number.isInteger(p.answer.value), `${where}: answer must be a whole number, 0 or more`);
}
// Columns that need a trade: carries when adding, borrows when subtracting.
function trades(a, c, sub) {
  const A = digits(a), C = digits(c); let n = 0, carry = 0;
  for (let i = 2; i >= 0; i--) { const over = sub ? A[i] - carry < C[i] : A[i] + C[i] + carry > 9; if (over && (sub || i > 0)) n++; carry = over ? 1 : 0; }
  return n;
}

test('level 1: ids are unique, prefixed, and every skill is complete', () => {
  assert.equal(new Set(SKILLS.map(s => s.id)).size, SKILLS.length);
  for (const s of SKILLS) {
    assert.match(s.id, /^l1[a-z0-9]+$/);
    assert.equal(s.level, 1);
    assert.equal(s.school, true);
    assert.ok(s.std && s.title && s.sub && s.learn.big && s.learn.tips.length >= 2 && s.learn.words.length >= 1);
    assert.doesNotMatch(JSON.stringify([s.title, s.sub, s.learn]), /\bgrade\b/i);
  }
  assert.ok(Object.keys(LIMIT).every(id => SKILLS.some(s => s.id === id)) && SKILLS.every(s => LIMIT[s.id]));
});

for (const s of SKILLS) for (const L of [1, 2, 3]) {
  test(`${s.id} step ${L}: ${N} problems, answers recomputed`, () => {
    const seen = [];
    for (let i = 0; i < N; i++) {
      const p = s.gen(L), where = `${s.id} L${L} "${strip(p?.story)} ${strip(p?.ask)} ${strip(p?.expr)}"`;
      sane(p, where); recompute(p, where); inRange(p, s.id, L, where); oneCorrect(p, where); storyNumbers(p, where); endsOnAnswer(p, where); hintKeepsQuiet(p, where);
      seen.push(p);
    }
    const shapes = new Set(seen.map(shapeOf));
    assert.ok(shapes.size >= 4, `${s.id} L${L}: only ${shapes.size} question shapes in ${N}: ${[...shapes].join(' || ')}`);
    if (NEEDS_VARIED_HINT[s.id]?.includes(L)) assert.ok(new Set(seen.map(p => p.hint)).size >= 2, `${s.id} L${L}: the hint should follow the numbers`);
    if (s.story) for (const p of seen) {
      assert.ok(p.story && p.read?.find && p.read.know.length && p.read.clue && p.read.plan && p.pre, 'story problems carry the reading help');
      assert.ok(['add', 'sub', 'multi'].includes(p.op));
    }
    const pairs = seen.filter(p => ['add', 'sub'].includes(p._t.f)).map(p => (p._t.f === 'add' ? [...p._t.xs, false] : [p._t.a, p._t.b, true]));
    if (s.id === 'l1addbig' || s.id === 'l1subbig') {
      for (const [a, c, sub] of pairs) assert.ok(L === 1 ? trades(a, c, sub) === 0 : trades(a, c, sub) >= 1, `${s.id} L${L}: ${a}, ${c} has the wrong amount of regrouping`);
    }
    if (s.id === 'l1subbig' && L === 3) assert.ok(pairs.some(([a, c]) => digits(a)[1] === 0 && a % 10 < c % 10), 'step 3 includes subtracting across a zero');
    if (s.id === 'l1add20' || s.id === 'l1sub20') assert.ok(seen.every(p => p.answer.kind !== 'num' || p.answer.value <= 20));
    if (s.id === 'l1add20' && L === 2) {
      const keys = seen.map(p => strip(p.expr).match(/^(\d+) \+ (\d+)/)).filter(Boolean).map(m => [+m[1], +m[2]].sort((x, y) => x - y).join());
      for (let i = 3; i < keys.length; i++) assert.ok(!keys.slice(i - 3, i).includes(keys[i]), `l1add20 step 2 repeated ${keys[i]} within a short run`);
    }
  });
}

test('level 1 story sources: every maker gives a full story at the steps it supports', () => {
  assert.ok(STORY_SOURCES.length >= 5);
  for (const make of new Set(STORY_SOURCES)) for (const L of [1, 2, 3]) for (let i = 0; i < 100; i++) {
    const p = make(L);
    if (p === null) continue;
    const where = `${make.name} L${L}`;
    assert.ok(p.story && p.ask && p.read && p.op && p.ways.length >= 2 && p.hint, where);
    recompute(p, where); oneCorrect(p, where); storyNumbers(p, where); endsOnAnswer(p, where); hintKeepsQuiet(p, where);
  }
});
