// What each kind of Level 5 problem must SHOW the child: the operands its answer depends on, read back from the rendered
// question (story, question, expression, pictures) and not from the generator's own _t record.
// SHOWN[kind](t) lists requirements: a number (must be readable in the question), { o: number } (question or answer
// buttons), a string (must appear in the words) or an array of strings (any one of them).
// CUSTOM[kind](p, t) holds the checks that read a picture or evaluate the displayed expression.
import assert from 'node:assert/strict';
import { toJS, evalAt, same } from './level5.recompute.js';
import { plain, numbers, svgTexts, svgCircles, svgRects, lineScale, planePoints } from './level5.render.js';

const SIGN_WORDS = { '≥': ['at least', 'or older'], '≤': ['at most', 'no more than'], '>': ['more than', 'over'], '<': ['under', 'below'] };
const DOT_WORD = { total: 'how many data values', at: 'appear', mode: 'mode', range: 'range', median: 'median', least: 'or more', mean: 'mean' };
const HIST_WORD = { bin: 'values are in the range', total: 'altogether', most: 'most values', least: 'or more', under: 'less than', percent: 'percent' };
const right = s => s === '>' || s === '≥';
const L = (...xs) => xs;

export const SHOWN = {
  ratio: t => L(t.A, t.B), tape: t => L(t.a, t.b, t.given), eqr: t => L(t.a, t.b, t.known), eqrChoice: t => L(t.a, t.b), eqrPoint: t => L(t.a, t.b, t.x),
  rate: t => L(t.total, t.n), rateUse: t => L(t.total, t.n, t.m), best: t => L(t.p1, t.n1, t.p2, t.n2), bestDiff: t => L(t.p1, t.n1, t.p2, t.n2),
  grid: t => L(t.n, t.free ? 'not shaded' : 'shaded'), pct: t => L(t.p, t.n), pctOff: t => L(t.p, t.n), pctAdd: t => L(t.p, t.n),
  whole: t => L(t.p, t.part), wholeLeft: t => L(t.p, t.part), whatPct: t => L(t.part, t.whole),
  fdp: t => (t.from === 'frac' ? L(t.n, t.d) : t.from === 'dec' ? L(t.n / t.d) : L(100 * t.n / t.d)),
  fdpCmp: t => [...t.opts.map(o => ({ o: o.s })), t.want === 'max' ? 'greatest' : 'least'],
  fdiv: t => L(t.n1 / t.d1, t.n2 / t.d2), gcf: t => L(t.a, t.b), lcm: t => L(t.a, t.b), gcfPer: t => L(t.a, t.b), factorOut: t => L(t.A, t.B),
  dadd: t => L(t.a, t.b), dsub: t => L(t.a, t.b), dmul: t => L(t.a, t.b), ddiv: t => L(t.a, t.b), change: t => L(t.n, t.p, t.paid), split: t => L(t.a, t.b, t.n),
  ctx: t => L(t.n), read: () => L(), opp: t => L(t.n), opp2: t => L(t.n), abs: t => L(t.n), move: t => L(t.s, Math.abs(t.d), t.d < 0 ? 'left' : 'right'),
  dist: t => L(t.a, t.b), absMax: t => t.xs.map(o => ({ o })), cmp: t => L(t.a, t.b), cmpAbs: t => L(t.a, t.b),
  order: t => [...t.xs, t.up ? 'least to greatest' : 'greatest to least'], extreme: t => [...t.xs, t.want === 'min' ? 'coldest' : 'warmest'],
  countCmp: t => [...t.xs, t.v, t.less ? 'less than' : 'greater than'],
  coordRead: () => L(), quad: t => L(t.x, t.y), which: t => L(t.x, t.y), reflect: t => L(t.x, t.y, t.ax + '-axis'), pdist: t => L(t.x1, t.y1, t.x2, t.y2),
  rect: t => [t.x1, t.y1, t.x2, t.y2, t.want === 'corner' ? 'fourth corner' : t.want], corner: t => L(t.x1, t.y1, t.x2, t.y2),
  pow: t => L(t.base, t.e), powPart: t => L(t.base), powFrac: t => L(t.n, t.d, t.e), ops: () => L(), eval: () => L(), wordExpr: () => L(),
  parts: () => L(), storyExpr: t => L(t.c, t.d, `after ${t.v}`), storyEval: t => L(t.c, t.d, t.x), identity: () => L(), equivChoice: () => L(),
  eq: t => L(t.a, t.c), ineqRead: () => L(), ineqStory: t => [t.v, SIGN_WORDS[t.sym]], ineqSol: t => L(t.v, t.sym), ineqEdge: t => L(t.v, t.sym, right(t.sym) ? 'smallest' : 'greatest'),
  para: t => L(t.b, t.h), tri: t => L(t.b, t.h), trap: t => L(t.a, t.c, t.h), triH: t => L(t.A, t.b), paraH: t => L(t.A, t.b), house: t => L(t.w, t.h, t.t),
  saBox: t => L(t.l, t.w, t.h), saPyr: t => L(t.s, t.t), volFrac: t => t.ns.map(n => n / t.d), cubes: t => [...t.ns.map(n => n / t.d), 1 / t.d],
  stat: t => [...t.xs, t.want],
  missing: t => [...t.xs, t.m, t.n], typical: t => (t.drop ? [...t.xs, t.drop] : [...t.xs]),
  dot: t => [...(t.arg === null ? [] : [t.arg]), DOT_WORD[t.want]], hist: t => L(HIST_WORD[t.want]),
};
// Kinds whose question holds nothing but the operands: no other number may appear.
export const EXACT = new Set(['pct', 'whole', 'gcf', 'lcm', 'pow', 'eq']);

const parseNum = s => Number(String(s).replace(/[^\d.\-−]/g, '').replace('−', '-'));
const leftOf = html => html.replace(/<span class="n">([^<]*)<\/span><span class="d">([^<]*)<\/span>/g, '($1)/($2)');
const bold = html => [...html.matchAll(/<b>([^<]*)<\/b>/g)].map(m => m[1]);
const close = (x, y, msg) => assert.ok(Math.abs(x - y) < 1e-9, `${msg}: ${x} vs ${y}`);
const answerNumber = a => (a.kind === 'num' ? a.value : parseNum(plain(a.options[a.correct])));

export const CUSTOM = {
  grid: (p, t) => assert.equal(svgRects(p.visual).filter(r => r.cls === 'on').length, t.n, 'shaded squares drawn'),
  read: (p, t) => { const v = lineScale(p.visual)(svgCircles(p.visual)[0].cx); close(Math.round(v), t.n, `dot drawn at ${v}`); },
  coordRead: (p, t) => assert.deepEqual(planePoints(p.visual).map(q => [q.x, q.y]), [[t.x, t.y]], 'point drawn'),
  reflect: (p, t) => assert.deepEqual(planePoints(p.visual).map(q => [q.x, q.y]), [[t.x, t.y]], 'start point drawn'),
  which: (p, t) => {
    const at = planePoints(p.visual).find(q => q.x === t.x && q.y === t.y);
    assert.ok(at && at.name === p.answer.options[p.answer.correct], `the point at (${t.x}, ${t.y}) is labelled ${at && at.name}, not the marked answer`);
  },
  pdist: (p, t) => assert.deepEqual(planePoints(p.visual).map(q => [q.x, q.y]), [[t.x1, t.y1], [t.x2, t.y2]], 'end points drawn'),
  rect: (p, t) => cornersDrawn(p, t, t.want === 'corner' ? 3 : 4), corner: (p, t) => cornersDrawn(p, t, 3),
  ops: p => close(evalAt(toJS(p.expr), {}), p.answer.value, 'displayed expression'),
  pow: p => close(evalAt(toJS(p.expr), {}), p.answer.value, 'displayed power'),
  eval: (p, t) => { const x = numbers(plain(p.ask))[0]; close(evalAt(toJS(p.expr), { X: x }), p.answer.value, `displayed rule at x = ${x}`); close(evalAt(t.js, { X: x }), p.answer.value, 'rule used by the generator'); },
  eq: (p, t) => {
    if (!p.expr) return;
    const [lhs, rhs] = leftOf(p.expr).split(' = '), x = answerNumber(p.answer);
    close(evalAt(toJS(lhs), { X: x, Y: x }), numbers(plain(rhs))[0], `displayed equation with x = ${x}`);
  },
  identity: (p, t) => {
    const [lhs, rhs] = p.expr.split(' = '), tl = t.lhs, tr = t.rhs;
    for (const X of [2, 3, 7]) { const v = { X, Y: 0, Q: 5 }; close(evalAt(toJS(lhs), v), evalAt(tl, v), 'left side shown'); close(evalAt(toJS(rhs), v), evalAt(tr, v), 'right side shown'); }
  },
  equivChoice: (p, t) => assert.ok(same(toJS(p.expr || bold(p.ask).pop()), t.js), 'the expression shown is the one the answer was built for'),
  parts: (p, t) => { assert.equal(plain(p.expr), t.expr, 'expression shown'); assert.ok(plain(p.ask).includes(t.want === 'coef2' ? `of ${t.w}` : t.want === 'coef' ? `of ${t.v}` : ''), 'asks about the right letter'); },
  wordExpr: (p, t) => {
    const words = bold(p.ask)[0], inGood = numbers(plain(t.good)), strays = numbers(words).filter(n => n !== 2 && !inGood.includes(n));
    assert.deepEqual(strays, [], `numbers in the words (${words}) missing from the answer ${t.good}`);
    assert.ok(plain(t.good).includes(t.v) || !/[a-z]/.test(plain(t.good)), 'letter');
  },
  ineqRead: (p, t) => {
    const svg = p.visual, c = svgCircles(svg)[0], v = Math.round(lineScale(svg)(c.cx)), closed = /var\(--grape\)/.test(c.style.split(';')[0]);
    const ray = svg.match(/<line x1="([\d.]+)" y1="34" x2="([\d.]+)" y2="34" style="stroke:var\(--grape\)/), toRight = +ray[2] > +ray[1];
    close(v, t.v, 'circle drawn at'); assert.equal(`${toRight ? '>' : '<'}${closed ? '=' : ''}`, { '<': '<', '>': '>', '≤': '<=', '≥': '>=' }[t.sym], 'circle and arrow drawn');
  },
  dot: (p, t) => {
    const cs = svgCircles(p.visual).filter(c => /grape/.test(c.style || '')), ticks = svgTexts(p.visual).filter(x => x.cls === 'tk');
    const drawn = ticks.map(x => cs.filter(c => c.cx === x.x).length);
    assert.deepEqual(drawn, t.counts, 'dots drawn above each value'); assert.deepEqual(ticks.map(x => Number(x.s)), t.counts.map((_, i) => t.lo + i), 'values labelled');
  },
  hist: (p, t) => {
    const bars = svgRects(p.visual).filter(r => r.cls === 'on'), labs = svgTexts(p.visual).filter(x => x.anchor === 'middle' && x.cls === 'tk').map(x => x.s), top = Math.max(...t.counts);
    assert.deepEqual(labs, t.counts.map((_, j) => `${t.start + j * t.width}–${t.start + (j + 1) * t.width - 1}`), 'bar labels');
    const tall = Math.max(...bars.map(r => r.h)); bars.forEach((r, j) => close(r.h / tall, t.counts[j] / top, `height of bar ${j + 1}`));
    if (t.want === 'bin' || t.want === 'percent') assert.ok(plain(p.ask).includes(labs[t.i]), 'asks about the right bar');
    if (t.want === 'least' || t.want === 'under') assert.ok(numbers(plain(p.ask)).includes(t.start + t.i * t.width), 'asks about the right edge');
  },
};
function cornersDrawn(p, t, n) {
  const pts = planePoints(p.visual), ok = q => (q.x === t.x1 || q.x === t.x2) && (q.y === t.y1 || q.y === t.y2);
  assert.equal(pts.length, n, 'corners drawn'); assert.ok(pts.every(ok), 'every drawn corner is a corner of the rectangle');
}
