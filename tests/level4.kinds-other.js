// Recomputation, shown operands and ranges for patterns, volume and the shape family tree.
// The family tree is checked against worlds described by numbers (pairs of parallel sides, equal sides, right angles) for
// quadrilaterals and against every whole-degree triangle for triangles, not against the generator's own tables.
import { pairs } from './level4.math.js';

const A = (t, i) => t.a0 + t.da * (i - 1), B = (t, i) => t.b0 + t.db * (i - 1);
const apply = (o, x) => { const n = Number(o.match(/\d+/)[0]); return /^Add/.test(o) ? x + n : /^Multiply/.test(o) ? x * n : x - n; };
const pairText = (x, y) => `(${x}, ${y})`;
const volOf = a => a[0] * a[1] * a[2];
const rulesShown = t => [t.a0, t.da, t.b0, t.db];

// Quadrilaterals: par = pairs of parallel sides, eq = which sides are equal, right = number of right angles.
const QWORLDS = [{ par: 2, eq: 'all', right: 4 }, { par: 2, eq: 'opp', right: 4 }, { par: 2, eq: 'all', right: 0 }, { par: 2, eq: 'opp', right: 0 }, { par: 1, eq: 'none', right: 0 }, { par: 1, eq: 'none', right: 2 }, { par: 0, eq: 'none', right: 0 }];
const QNAME = { square: w => w.par === 2 && w.eq === 'all' && w.right === 4, rectangle: w => w.par === 2 && w.right === 4, rhombus: w => w.par === 2 && w.eq === 'all', parallelogram: w => w.par === 2, trapezoid: w => w.par === 1, quadrilateral: () => true };
const QPROP = { 'four equal sides': w => w.eq === 'all', 'four right angles': w => w.right === 4, 'two pairs of parallel sides': w => w.par === 2, 'exactly one pair of parallel sides': w => w.par === 1, 'opposite sides that are equal': w => w.eq !== 'none' };
const MUSTP = { 'All four sides are equal.': w => w.eq === 'all', 'All four angles are right angles.': w => w.right === 4, 'Both pairs of opposite sides are parallel.': w => w.par === 2, 'Exactly one pair of sides is parallel.': w => w.par === 1, 'Opposite sides are equal in length.': w => w.eq !== 'none', 'It has no right angles.': w => w.right === 0 };
const quadVerdict = (x, y) => { const ws = QWORLDS.filter(QNAME[x]), n = ws.filter(QNAME[y]).length; return n === ws.length ? 'Always' : n === 0 ? 'Never' : 'Sometimes'; };
// Triangles: every triple of whole-degree angles.
const TRIS = []; for (let a = 1; a < 180; a++) for (let b = a; a + b < 180; b++) { const c = 180 - a - b; if (c >= b) TRIS.push([a, b, c]); }
const TRI = { equilateral: ([a, , c]) => a === c, isosceles: ([a, b, c]) => a === b || b === c, scalene: ([a, b, c]) => a !== b && b !== c, acute: ([, , c]) => c < 90, right: ([, , c]) => c === 90, obtuse: ([, , c]) => c > 90 };
const triVerdict = (x, y) => { const ts = TRIS.filter(TRI[x]), n = ts.filter(TRI[y]).length; return n === ts.length ? 'Always' : n === 0 ? 'Never' : 'Sometimes'; };
const sentenceVerdict = s => { const m = s.match(/^Every (\w+) is a (\w+)\.$/); return quadVerdict(m[1], m[2]); };
// A picture of a square has 4 tick marks and 4 right-angle marks, a rectangle 6 and 4, a rhombus 4 and 0.
const PIC = { square: QWORLDS[0], rectangle: QWORLDS[1], rhombus: QWORLDS[2] };
const MARKS = { square: [4, 4], rectangle: [6, 4], rhombus: [4, 0] };

export const OTHER_KINDS = {
  ruTerm: { rec: t => t.s + t.d * (t.i - 1), show: t => [t.s, t.d, t.i] },
  ruPair: { rec: t => ({ test: o => o === pairText(A(t, t.i), B(t, t.i)) }), show: t => [...rulesShown(t), t.i] },
  ruDiff: { rec: t => t.b0 - t.a0, show: rulesShown },
  ruTimes: { rec: t => t.b0 / t.a0, show: rulesShown },
  ruPlot: { rec: t => ({ x: A(t, t.i), y: B(t, t.i) }), show: t => [...rulesShown(t), t.i] },
  ruAt: { rec: t => B(t, (t.x - t.a0) / t.da + 1), show: t => [...rulesShown(t), t.x] },
  ruSet: { rec: t => ({ test: o => { const ps = pairs(o); return ps.length === 3 && ps.every((p, i) => p[0] === A(t, i + 1) && p[1] === B(t, i + 1)); } }), show: rulesShown },
  ruOdd: { rec: t => ({ test: o => { const [[x, y]] = pairs(o); return ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].some(j => A(t, j) === x && B(t, j) === y); } }), show: rulesShown },
  ruRel: { rec: t => ({ test: o => [1, 2, 3, 4, 5].every(i => apply(o, A(t, i)) === B(t, i)) }), show: rulesShown },
  ruStory: { rec: t => (t.b0 + t.w * t.db) - (t.a0 + t.w * t.da), show: t => [...rulesShown(t), t.w] },

  cvStack: { rec: t => t.l * t.w * (t.h1 + t.h2), show: t => [t.l, t.w, t.h1, t.h2] },
  cvSide: { rec: t => (t.l1 + t.l2) * t.w * t.h, show: t => [t.l1, t.l2, t.w, t.h] },
  cvEdge: { rec: t => t.V / (t.known[0] * t.known[1]), show: t => [t.V, ...t.known] },
  cvL: { rec: t => t.w * (t.l1 * t.h1 + t.l2 * t.h2), show: t => [t.l1, t.l2, t.w, t.h1, t.h2] },
  cvDiff: { rec: t => Math.abs(volOf(t.a) - volOf(t.c)), show: t => [...t.a, ...t.c] },
  cvMiss: { rec: t => t.V / (t.l * t.w) - t.h1, show: t => [t.l, t.w, t.h1, t.V] },
  cvLiters: { rec: t => t.l * t.w * t.h / 1000, show: t => [t.l, t.w, t.h] },
  cvRate: { rec: t => t.l * t.w * t.h / t.r, show: t => [t.l, t.w, t.h, t.r] },

  faAst: { rec: t => quadVerdict(t.x, t.y), show: t => [t.x, t.y] },
  faTri: { rec: t => triVerdict(t.x, t.y), show: t => [t.x, t.y] },
  faTrue: { rec: t => ({ test: o => sentenceVerdict(o) === 'Always' }), show: () => [] },
  faAll: { rec: t => t.names.filter(n => QWORLDS.filter(QNAME[n]).every(QPROP[PROP_TEXT[t.prop]])).length, show: t => t.names },
  faPic: { rec: t => ({ test: o => !QNAME[o](PIC[t.key]) }), show: () => [], custom: (p, t) => { const n = s => (p.visual.match(new RegExp(`class="${s}"`, 'g')) || []).length; if (!(n('mark') === MARKS[t.key][0] && n('mark ra') === MARKS[t.key][1])) throw new Error(`picture marks ${n('mark')}/${n('mark ra')} for ${t.key}`); } },
  faMust: { rec: t => ({ test: o => QWORLDS.filter(QNAME[t.x]).every(MUSTP[o]) }), show: t => [t.x] },
  faSort: { rec: t => t.pairs.filter(([x, y]) => quadVerdict(x, y) === 'Always').length, show: () => [] },
};
const PROP_TEXT = { right4: 'four right angles', eq4: 'four equal sides', par2: 'two pairs of parallel sides', par1: 'exactly one pair of parallel sides', oppEq: 'opposite sides that are equal' };
