// Recompute rules for the problem kinds of the newer level 3 skills. Each rule works out the right answer from the raw
// numbers of the problem (p._t) or from its picture, with code that shares nothing with the generators.
import assert from 'node:assert/strict';
import { visible } from './level3-checks.js';
import { lineRelation, triangleKind, parallelPairs, symmetryLines, letterOf, ariaShaded, gridCells, gridCols, dotTenths } from './level3-pictures.js';

const add = xs => xs.reduce((a, x) => a + x, 0);
const plain = s => visible(s);
const val = s => Number(plain(s).replace(/[$,°]/g, '').split(' ')[0]);
const yes = v => (v ? 'Yes' : 'No');
const sign = d => (d < 0 ? '<' : d > 0 ? '>' : '=');
const top = ([w, n, d]) => w * d + n;
const nearest = (n, to) => { const lo = n - (n % to); return n - lo >= to / 2 ? lo + to : lo; };
const lead = n => (n < 10 ? n : nearest(n, 10 ** (String(n).length - 1)));
const FR = /<span class="fr"><span class="n">(\d+)<\/span><span class="d">(\d+)<\/span><\/span>/g;
const fracsIn = html => [...String(html).matchAll(FR)].map(m => [Number(m[1]), Number(m[2])]);
// The value of an option written as a whole number, a fraction or a mixed number.
const valueOf = html => { const whole = /^\s*(\d+)\s*(?:<span class="mxs"><\/span>)?/.exec(html), f = fracsIn(html)[0]; return (whole ? Number(whole[1]) : 0) + (f ? f[0] / f[1] : 0); };
const extreme = (which, opts, value) => { const vs = opts.map(value); return o => value(o) === (which === 'greatest' ? Math.max(...vs) : Math.min(...vs)); };
const mirrorOf = (cells, cols) => new Set([...cells].map(s => { const [r, c] = s.split(',').map(Number); return `${r},${cols - 1 - c}`; }));
const termsOf = (s, d, op, n) => Array.from({ length: n }, (_, i) => (op === '×' ? s * d ** i : s + i * d));
const FACT = { 'km-m': 1000, 'm-cm': 100, 'kg-g': 1000, 'L-mL': 1000, 'h-min': 60, 'min-s': 60, 'ft-in': 12, 'lb-oz': 16 };
const BIGWORD = { 'km-m': /kilometer/, 'm-cm': /\bmeters?\b/, 'kg-g': /kilogram/, 'L-mL': /\bliters?\b/, 'h-min': /\bhours?\b/, 'min-s': /\bminutes?\b/, 'ft-in': /\b(foot|feet)\b/, 'lb-oz': /\bpounds?\b/ };
const LETTERS = { A: 1, B: 1, C: 1, D: 1, E: 1, H: 2, I: 2, M: 1, O: 2, T: 1, U: 1, V: 1, W: 1, X: 2, Y: 1, F: 0, G: 0, J: 0, L: 0, N: 0, P: 0, Q: 0, R: 0, S: 0, Z: 0 };
const SHAPE_LINES = { 'square': 4, 'rectangle': 2, 'rhombus': 2, 'kite': 1, 'isosceles trapezoid': 1, 'parallelogram': 0, 'right trapezoid': 0, 'equilateral triangle': 3, 'isosceles triangle': 1, 'scalene triangle': 0, 'regular pentagon': 5, 'regular hexagon': 6 };
const PROPS = { 'Rectangle': [2, 4], 'Parallelogram': [2, 0], 'Trapezoid': [1, 0], 'Right trapezoid': [1, 2], 'Right triangle': [0, 1], 'Kite': [0, 0] };
const REAL = [[/rails|lines on a page|long edges of a door|stripes/, 'Parallel'], [/wall and the floor|3 o’clock|square corner|top edge and a side edge/, 'Perpendicular'], [/./, 'Neither']];
const plotIdx = (v, lo, den) => { const x = (v[0] + (v[2] ? v[1] / v[2] : 0) - lo) * den; assert.ok(Math.abs(x - Math.round(x)) < 1e-9, `length is not on a tick: ${v}`); return Math.round(x); };
const sumParts = html => { let total = 0; const rest = String(html).replace(FR, (_, n, d) => { total += n / d; return ''; }); return total + add((rest.match(/\d+/g) || []).map(Number)); };
const validBreak = (o, n, d) => { const fs = fracsIn(o); return fs.length >= 2 && fs.every(f => f[1] === d) && add(fs.map(f => f[0])) === n; };

export const EXPECT_NEW = {
  timesBig: t => t.s * t.t, timesSmall: t => t.big / t.t, timesHow: t => t.prod / t.s, timesDiff: t => t.t * t.s - (t.s + t.m), timesTogether: t => t.s + t.s * t.t, timesChain: t => t.s * t.t * t.u,
  timesTell: t => o => { const x = /(\d[\d,]*) times as many/.exec(plain(o)), m = /(\d[\d,]*) more/.exec(plain(o)); return x ? Number(x[1].replace(',', '')) * t.s === t.prod : m ? t.s + Number(m[1].replace(',', '')) === t.prod : false; },
  patnext: t => { const ts = t.terms, [p, l] = [ts.at(-2), ts.at(-1)]; return t.op === '×' ? l * (l / p) : l + (l - p); }, patmiss: t => (t.op === '×' ? t.start * t.step ** t.at : t.start + t.at * t.step),
  patrule: t => o => { const m = /Start at (\d+), (add|multiply by) (\d+)/.exec(plain(o)); return termsOf(Number(m[1]), Number(m[3]), m[2] === 'add' ? '+' : '×', 4).join() === t.terms.join(); },
  patfeature: t => o => { const ps = termsOf(t.start, t.step, '+', 12).map(x => x % 2), s = plain(o); return /all odd/.test(s) ? ps.every(x => x === 1) : /all even/.test(s) ? ps.every(x => x === 0) : ps.every((x, i) => i === 0 || x !== ps[i - 1]); },
  patin: t => yes(t.x >= t.start && (t.x - t.start) % t.step === 0), patnth: t => t.start + (t.n - 1) * t.step,
  patshape: t => { assert.equal(t.terms[2] - t.terms[1], t.terms[1] - t.terms[0], 'tile counts are not a pattern'); return t.terms[0] + (t.n - 1) * (t.terms[1] - t.terms[0]); },
  tenfold: t => { const d = n => Math.floor(t.n / 10 ** n) % 10; assert.ok(d(t.hiP) === d(t.loP) && d(t.hiP) > 0, 'digits differ'); return 10 ** (t.hiP - t.loP); },
  tenmul: t => t.a * t.f, tendiv: t => { assert.equal(t.n % t.f, 0); return t.n / t.f; }, tenplaces: t => String(t.f).length - 1, tenfactor: t => t.prod / t.a, tendivisor: t => t.n / t.q, tenratio: t => t.hi / t.lo,
  fpunit: t => t.n, fpbar: t => t.n, fpmix: t => t.n, fpwhole: t => t.w * t.d, fpsplit3: t => t.n - t.a - t.b, fpcount: t => t.w * t.d + t.n, fpmixsplit: t => t.n - t.a,
  fpway: t => o => validBreak(o, t.n, t.d), fpnot: t => o => !validBreak(o, t.n, t.d), fpmixsum: t => o => Math.abs(sumParts(o) - (t.w + t.n / t.d)) < 1e-9,
  mxpic: t => ({ n: t.w * t.d + t.n, d: t.d }), mxrename: t => t.n + t.d, mxmiss: t => ({ n: top(t.c) - top(t.a), d: t.a[2] }), mxpick: t => o => Math.abs(valueOf(o) - (t.op === '+' ? top(t.a) + top(t.c) : top(t.a) - top(t.c)) / t.a[2]) < 1e-9,
  thup: t => 10 * t.t, thdown: t => t.n / 10, thsum: t => ({ n: 10 * t.t + t.h, d: 100 }), thdecpick: t => o => Math.abs(val(o) - (10 * t.t + t.h) / 100) < 1e-9, thsplit: t => Math.round(t.x * 100 - t.h) / 10,
  dogrid: (t, p) => { const [a, c] = ariaShaded(p.visual).map(x => x[0]); return a > c ? 'The first grid' : 'The second grid'; }, dobetween: t => o => t.lo < val(o) && val(o) < t.hi,
  docloser: (t, p) => o => Math.abs(val(o) - (dotTenths(p.visual) < 5 ? t.lo : t.hi)) < 1e-9, doorder: t => o => { const xs = plain(o).split(', ').map(Number); return xs.every((x, i) => i === 0 || (t.up ? xs[i - 1] < x : xs[i - 1] > x)); },
  domoney: (t, p) => extreme(t.most ? 'greatest' : 'least', p.answer.options, val),
  dofcmp: (t, p) => { const x = Math.round(t.x * 100) * t.d - t.n * 100; return sign(/^\s*<span class="fr">/.test(p.expr) ? -x : x); },
  cvplain: t => t.n * FACT[t.pair], cvtable: t => t.n * FACT[t.pair], cvmixed: t => t.n * FACT[t.pair] + t.r, cvsub: t => t.n * FACT[t.pair] - t.s, cvdiv: t => { assert.equal(t.n * FACT[t.pair] % t.piece, 0); return t.n * FACT[t.pair] / t.piece; },
  cvpick: t => o => val(o) === t.n * FACT[t.pair],
  cvcmp: (t, p) => extreme('greatest', p.answer.options, o => (BIGWORD[t.pair].test(plain(o)) ? val(o) * FACT[t.pair] : val(o))),
  lpAt: t => t.counts[plotIdx(t.v, t.lo, t.den)], lpTotal: t => add(t.counts), lpMore: t => add(t.counts.filter((_, j) => (t.longer ? j > plotIdx(t.v, t.lo, t.den) : j < plotIdx(t.v, t.lo, t.den)))),
  lpDiff: t => { const at = t.counts.map((c, i) => (c ? i : -1)).filter(i => i >= 0); return { n: at.at(-1) - at[0], d: t.den }; }, lpMost: t => o => t.counts[Math.round((valueOf(o) - t.lo) * t.den)] === Math.max(...t.counts),
  lpCmp: t => Math.abs(t.counts[plotIdx(t.hi, t.base, t.den)] - t.counts[plotIdx(t.lo, t.base, t.den)]), lpSum: t => ({ n: add(t.counts.map((c, i) => c * (t.lo * t.den + i))), d: t.den }),
  prread: t => t.deg, prdiff: t => t.r2 - t.r1, prsplit: t => t.total - t.part, prturn: t => ({ n: t.deg, d: 360 }), prmin: t => 6 * t.min, prround: t => 360 - add(t.known),
  prest: (t, p) => { const ds = p.answer.options.map(o => Math.abs(val(o) - t.deg)), m = Math.min(...ds); return o => Math.abs(val(o) - t.deg) === m; },
  lnpic: (t, p) => lineRelation(p.visual), lndef: (t, p) => (/never meet/.test(p.ask) ? 'Parallel' : /do not make a square corner/.test(p.ask) ? 'Neither' : 'Perpendicular'), lnreal: (t, p) => REAL.find(([re]) => re.test(p.ask))[1],
  lntri: (t, p) => triangleKind(p.visual), lntri3: t => (Math.max(t.a, t.b, t.c) === 90 ? 'Right' : Math.max(t.a, t.b, t.c) > 90 ? 'Obtuse' : 'Acute'),
  lntri2: t => { const m = Math.max(t.a, t.c, 180 - t.a - t.c); return m === 90 ? 'Right' : m > 90 ? 'Obtuse' : 'Acute'; }, lnquad: (t, p) => parallelPairs(p.visual), lnprop: t => o => PROPS[plain(o)][0] === (t.pairs || 0) && PROPS[plain(o)][1] === (t.right || 0),
  syhas: (t, p) => yes(letterOf(p.visual) ? LETTERS[letterOf(p.visual)] > 0 : symmetryLines(p.visual) > 0), sycount: (t, p) => symmetryLines(p.visual), syletter: (t, p) => { assert.equal(letterOf(p.visual), t.letter); return LETTERS[t.letter]; },
  sywhich: t => o => SHAPE_LINES[plain(o).toLowerCase()] === (t.lines || 0), sypoint: t => 2 * t.axis - t.x, sywidth: t => 2 * t.half,
  sycomplete: (t, p) => { const left = gridCells(p.visual), cols = gridCols(p.visual), want = new Set([...left, ...mirrorOf(left, cols)]); return o => { const got = gridCells(o); return gridCols(o) === cols && got.size === want.size && [...got].every(c => want.has(c)); }; },
  esmul: t => lead(t.a) * lead(t.c), esmulword: t => lead(t.a) * lead(t.c), eswhich: t => o => val(o) === (t.op === '+' ? nearest(t.a, t.to) + nearest(t.c, t.to) : nearest(t.a, t.to) - nearest(t.c, t.to)),
  esmag: (t, p) => { const exact = t.op === '×' ? t.a * t.c : t.a / t.c, d = o => Math.abs(Math.log10(val(o) / exact)), m = Math.min(...p.answer.options.map(d)); return o => d(o) === m; },
  esreason: t => { const exact = t.op === '+' ? t.a + t.c : t.op === '−' ? t.a - t.c : t.a * t.c; return yes(Math.abs(t.stated - exact) / exact <= 0.1); },
  esenough: t => yes(Math.round(t.price * 100) * t.qty <= t.budget * 100), esdiv: t => { assert.equal(t.m % t.d, 0); assert.ok(Math.abs(t.n - t.m) < t.d); return t.m / t.d; },
};
