// Level 2 content: every skill, every step, 300 problems each. Answers are recomputed from the raw operands in p._t, from the
// question text, and (for choices) by checking that exactly one option is true; stories must print the numbers the generator holds.
import test from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS, STORY_SOURCES } from '../js/skills/level2/index.js';
import { check, answerHTML, ANSWER_KINDS, F, NAMES } from '../js/util.js';
import { CALC_NEW, LIMIT_NEW, STRANDS, NEW_IDS, TWO_STEP } from './level2.calc.js';
import { SPECIAL_NEW, newChecks, varietyCheck, strandChecks } from './level2.checks.js';

const N = 300;
const strip = s => String(s ?? '').replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, '');
const js = s => s.replace(/,/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
const isMath = s => /^\d+(\s*[+\-*/]\s*\d+)*$/.test(s.trim());
const evalMath = s => { assert.match(s, /^[\d\s+\-*/().]+$/, `not plain arithmetic: ${s}`); return Function(`return (${s})`)(); };
const even = (a, b) => { assert.equal(a % b, 0, `${a} ÷ ${b} must come out even`); return a / b; };
const byValue = (fs, dir) => fs.slice().sort((p, q) => dir * (p[0] / p[1] - q[0] / q[1]))[0];
const numsIn = s => (strip(s).replace(/(\d),(\d{3})/g, '$1$2').match(/\d+(?:\.\d+)?/g) || []).map(Number);
const near10 = n => Math.round(n / 10) * 10;
const SIGN = { add: '+', sub: '−', mul: '×', div: '÷' }, NAME = { add: 'Add', sub: 'Subtract', mul: 'Multiply', div: 'Divide' };

// Independent recomputation: operands -> the expected answer (a number, [top, bottom] for a fraction, or the right choice text).
const CALC = {
  mul: t => t.a * t.b, div: t => even(t.a, t.b), sub: t => t.a - t.b, add: t => t.xs.reduce((s, x) => s + x, 0),
  first: t => t.a, second: t => t.b, prod: t => t.xs.reduce((p, x) => p * x, 1),
  rep: t => Array(t.g).fill(t.n).join(' + '), means: t => `${t.g} groups of ${t.n}`, swap: t => `${t.b} × ${t.a}`, fam: t => `${t.a * t.c} ÷ ${t.a} = ${t.c}`,
  quo: t => Math.floor(t.a / t.b), rem: t => t.a - Math.floor(t.a / t.b) * t.b, ceil: t => Math.ceil(t.a / t.b),
  perim: t => t.a + t.b + t.a + t.b, pside: t => even(t.p - 2 * t.a, 2), pick: t => (t.i ? 'Area' : 'Perimeter'),
  frac: t => [t.n, t.d], whole: t => F(t.d, t.d), fmax: t => F(...byValue(t.fs, -1)), fmin: t => F(...byValue(t.fs, 1)),
  umax: t => F(1, Math.min(...t.ds)), umin: t => F(1, Math.max(...t.ds)),
  fsign: t => (t.a[0] * t.b[1] < t.b[0] * t.a[1] ? '&lt;' : t.a[0] * t.b[1] > t.b[0] * t.a[1] ? '&gt;' : '='),
  op: t => (t.asExpr ? `${Math.max(t.a, t.b)} ${SIGN[t.op]} ${Math.min(t.a, t.b)}` : NAME[t.op]),
  mulsub: t => t.pay - t.g * t.n, muladd: t => t.g * t.n + t.e, subdiv: t => even(t.t - t.e, t.d),
};
// The largest number a learner should meet at each step (operands and answer).
const LIMIT = { l2groups: [36, 54, 90], l2order: [36, 99, 150], l2tricks: [96, 108, 144], l2div: [36, 90, 108], l2family: [45, 81, 108], l2tens: [400, 1200, 9900], l2area2: [130, 891, 891],
  l2rem: [24, 89, 116], l2area: [36, 144, 144], l2frac: [10, 10, 30], l2fraccmp: [10, 10, 10], l2which: [45, 90, 90], l2story: [36, 1000, 5000] };

Object.assign(CALC, CALC_NEW); Object.assign(LIMIT, LIMIT_NEW);
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
const STEMS = ['equal', 'each', 'every', 'split', 'into', 'pack', 'deal', 'share'];
function truth(p, where) {
  const t = p._t, says = p.answer.options[p.answer.correct] === 'True';
  let really;
  if (t.rem) really = t.rem.q * t.rem.d + t.rem.r === t.rem.t && t.rem.r < t.rem.d;
  else { const m = strip(p.expr).replace(/&lt;/g, '<').replace(/&gt;/g, '>').match(/^(.*?)(=|<|>)(.*)$/), [l, r] = [m[1], m[3]].map(x => evalMath(js(x.trim()))); really = m[2] === '=' ? l === r : m[2] === '<' ? l < r : l > r; }
  assert.equal(says, really, `${where}: the answer says ${says} but the sentence is ${really}`);
}
const SPECIAL = {
  ...SPECIAL_NEW,
  tf: truth,
  ftf: (p, where) => {
    const [[n1, d1], [n2, d2]] = p._t.fs, real = n1 * d2 < n2 * d1 ? '&lt;' : n1 * d2 > n2 * d1 ? '&gt;' : '=';
    assert.equal(p.answer.options[p.answer.correct] === 'True', p._t.rel === real, `${where}: the fraction sentence disagrees with the answer`);
  },
  est2: (p, where) => {
    const exact = p._t.n * p._t.m;
    only(p.answer.options.filter(o => +o >= exact / 2 && +o <= exact * 2), p.answer, where, `be within a factor of 2 of ${exact}`);
    assert.equal(p.answer.options[p.answer.correct], String(near10(p._t.n) * p._t.m), `${where}: estimate`);
  },
  bigger: (p, where) => {
    const vals = p.answer.options.map(o => evalMath(js(strip(o))));
    assert.equal(vals[p.answer.correct], Math.max(...vals), `${where}: the marked product is not the greater one`);
  },
  deal: (p, where) => {
    const { t, d } = p._t, o = p.answer.options, good = o[p.answer.correct];
    for (const x of o) assert.ok(numsIn(x).includes(t) && numsIn(x).includes(d), `${where}: story "${x}" must use ${t} and ${d}`);
    for (const stem of STEMS) if (good.includes(stem)) assert.ok(o.some(x => x !== good && x.includes(stem)), `${where}: only the right story says "${stem}", so keywords give it away`);
  },
};
function oneCorrect(p, where) {
  const a = p.answer;
  if (a.kind !== 'choice') return;
  const stem = eqOf(p.ask), opts = a.options.map(eqOf);
  if (stem && /same three numbers|same family/.test(strip(p.ask)) && opts.every(Boolean)) only(a.options.filter((o, i) => holds(opts[i]) && bag(opts[i]) === bag(stem)), a, where, 'be a true fact from the same three numbers');
  if (SPECIAL[p._t.f]) SPECIAL[p._t.f](p, where);
  const vals = a.options.map(o => js(strip(o)));
  if (vals.every(v => isMath(v))) {
    const nums = vals.map(evalMath);
    if (p._t.f !== 'bigger') assert.equal(nums.filter(v => v === nums[a.correct]).length, 1, `${where}: two options have the value ${nums[a.correct]}: ${a.options.join(' | ')}`);
  }
}
// ---- What the child reads must agree with what the generator holds ----
const flat = v => (typeof v === 'number' ? [Math.abs(v)] : v && typeof v === 'object' ? Object.values(v).flatMap(flat) : []);
function storyNumbers(p, where) {
  if (!p.story) return;
  const shown = numsIn([p.story, p.ask, p.expr].join(' '));
  for (const v of new Set(flat(p._t))) assert.ok(shown.includes(v), `${where}: ${v} (from ${JSON.stringify(p._t)}) is not in the text a child reads: ${shown.join(', ')}`);
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
// A pre-question has exactly one defensible answer; for the area and fence stories it is the measurement the numbers call for.
function preQuestion(p, where) {
  const o = p.pre.options;
  assert.equal(o.filter(x => x === p.pre.correct).length, 1, `${where}: pre-question needs exactly one correct option`);
  assert.equal(new Set(o).size, o.length, `${where}: pre-question options repeat`);
  if (p.op === 'perim') assert.equal(p.pre.correct, 'Perimeter');
  if (p.op === 'area') assert.equal(p.pre.correct, 'Area');
  if (p.op === 'multi') assert.ok(TWO_STEP.includes(p._t.f), `${where}: a "more than one step" story must really have two steps, not ${p._t.f}`);
}
const NAME_RE = new RegExp(`\\b(${NAMES.join('|')})\\b`, 'g');
const shapeOf = p => strip([p.story, p.ask, p.expr].join(' ')).replace(NAME_RE, 'N').replace(/[\d?]+/g, '#').replace(/#(?:[,.]?\s*#)+/g, '#');

function recompute(p, where) {
  assert.ok(p._t && (CALC[p._t.f] || SPECIAL[p._t.f]), `${where}: _t.f "${p._t?.f}" is not known to the test`);
  if (SPECIAL[p._t.f]) return;
  const want = CALC[p._t.f](p._t), a = p.answer;
  if (a.kind === 'frac') return assert.equal(a.n * want[1], want[0] * a.d, `${where}: stated ${a.n}/${a.d}, recomputed ${want.join('/')}`);
  if (p._t.evalOptions) {
    const hits = a.options.filter(o => evalMath(js(o)) === want);
    return assert.deepEqual(hits, [a.options[a.correct]], `${where}: exactly the marked option must equal ${want}`);
  }
  const got = a.kind === 'num' ? a.value : answerHTML(a);
  assert.equal(got, want, `${where}: stated answer ${got}, recomputed ${want} from ${JSON.stringify(p._t)}`);
  const expr = js(strip(p.expr));
  if (a.kind !== 'num' || !p.expr) return;
  if (expr.includes('?') && expr.includes('=')) {
    const [l, r] = expr.replace('?', String(got)).split('=').map(evalMath);
    assert.equal(l, r, `${where}: ${strip(p.expr)} is not true with ${got}`);
  } else if (/^[\d\s+\-*/]+$/.test(expr) && /[+\-*]/.test(expr)) assert.equal(evalMath(expr), got, `${where}: ${strip(p.expr)} is not ${got}`);
  else if (/^\d+ \/ \d+$/.test(expr) && p._t.f === 'div') assert.equal(evalMath(expr), got, `${where}: ${strip(p.expr)} is not ${got}`);
}
function inRange(p, id, L, where) {
  const all = [...numbersIn(p._t), ...(p.answer.kind === 'num' ? [p.answer.value] : [])].filter(v => typeof v === 'number');
  assert.ok(Math.max(...all.map(Math.abs)) <= LIMIT[id][L - 1], `${where}: number above ${LIMIT[id][L - 1]} in ${JSON.stringify(p._t)}`);
  if (p.answer.kind === 'num') assert.ok(p.answer.value >= 0 && Number.isInteger(p.answer.value), `${where}: answer must be a whole number, 0 or more`);
  if (p.answer.kind === 'frac') assert.ok(p.answer.n > 0 && p.answer.d > 1, `${where}: a proper fraction answer`);
}

test('level 2: ids are unique, prefixed, and every skill is complete', () => {
  assert.equal(new Set(SKILLS.map(s => s.id)).size, SKILLS.length);
  for (const s of SKILLS) {
    assert.match(s.id, /^l2[a-z0-9]+$/);
    assert.equal(s.level, 2);
    assert.equal(s.school, true);
    assert.ok(s.std && s.title && s.sub && s.learn.big && s.learn.tips.length >= 2 && s.learn.words.length >= 1);
    assert.doesNotMatch(JSON.stringify([s.title, s.sub, s.learn]), /\bgrade\b/i);
  }
  strandChecks(SKILLS);
  assert.ok(Object.keys(LIMIT).every(id => SKILLS.some(s => s.id === id)) && SKILLS.every(s => LIMIT[s.id]));
});

for (const s of SKILLS) for (const L of [1, 2, 3]) {
  test(`${s.id} step ${L}: ${N} problems, answers recomputed`, () => {
    const seen = [];
    for (let i = 0; i < N; i++) {
      const p = s.gen(L), where = `${s.id} L${L} "${strip(p?.story)} ${strip(p?.ask)} ${strip(p?.expr)}"`;
      sane(p, where); recompute(p, where); inRange(p, s.id, L, where); oneCorrect(p, where); storyNumbers(p, where); endsOnAnswer(p, where); hintKeepsQuiet(p, where);
      if (NEW_IDS.has(s.id)) newChecks(p, where);
      seen.push(p);
    }
    const shapes = new Set(seen.map(shapeOf));
    assert.ok(shapes.size >= 4, `${s.id} L${L}: only ${shapes.size} question shapes in ${N}: ${[...shapes].join(' || ')}`);
    if (NEW_IDS.has(s.id)) varietyCheck(seen, s.id, L);
    if (s.story) for (const p of seen) {
      assert.ok(p.story && p.read?.find && p.read.know.length && p.read.clue && p.read.plan && p.pre, 'story problems carry the reading help');
      assert.ok(['mul', 'div', 'multi', 'area', 'perim'].includes(p.op));
      preQuestion(p, `${s.id} L${L} "${strip(p.story)}"`);
    }
    if (s.id === 'l2rem') for (const p of seen) if (['quo', 'rem', 'ceil'].includes(p._t.f)) assert.ok(p._t.a % p._t.b !== 0, 'remainder problems always leave something over');
    if (s.id === 'l2which') for (const p of seen) if (p._t.op === 'div') even(p._t.a, p._t.b);
    if (s.id === 'l2story' && L < 3) assert.ok(seen.every(p => p.op !== 'multi'), 'two-step stories only at step 3');
    if (s.id === 'l2div' && L === 3) {
      const stories = new Set(seen.filter(p => p._t.f === 'deal').map(p => strip(p.answer.options[p.answer.correct]).replace(/\d+/g, '#')));
      assert.ok(stories.size >= 4, `l2div step 3: the right story should change, got ${stories.size} different ones`);
      assert.ok(seen.some(p => /break|Break/.test(p.ask)), 'step 3 includes dividing by breaking apart');
    }
    if (s.id === 'l2area2') for (const p of seen) assert.ok(!/\d{3}\s*×|×\s*\d{3}/.test(strip(p.expr)), 'two digits times one digit only');
    if (s.id === 'l2area2' && L === 1) assert.ok(seen.some(p => p.visual && /class="area"/.test(p.visual)), 'step 1 shows the area model with the question');
  });
}

test('level 2 story sources: every maker gives a full story at the steps it supports', () => {
  assert.ok(STORY_SOURCES.length >= 5);
  for (const make of new Set(STORY_SOURCES)) for (const L of [1, 2, 3]) for (let i = 0; i < 100; i++) {
    const p = make(L);
    if (p === null) continue;
    const where = `${make.name} L${L}`;
    assert.ok(p.story && p.ask && p.read && p.op && p.ways.length >= 2 && p.hint, where);
    recompute(p, where); oneCorrect(p, where); storyNumbers(p, where); endsOnAnswer(p, where); hintKeepsQuiet(p, where);
  }
});
