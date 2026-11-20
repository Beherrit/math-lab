// Independent recomputation for the Level 5 kinds added with the newer skills. Same rules as level5.recompute.js:
// nothing here imports a generator; each entry rebuilds the answer from the operands in _t.
import { asc, median, gcd, sum } from './level5.recompute.js';

const num = o => {
  const s = String(o).replace(/−/g, '-').replace(/<[^>]+>/g, ' ').replace(/[%,$°]/g, '').trim();
  const m = s.match(/^(-)?\s*(?:(\d+)\s+)?(\d+)\/(\d+)$/);
  return m ? (m[1] ? -1 : 1) * (Number(m[2] || 0) + m[3] / m[4]) : Number(s.replace(/[^0-9.-]/g, ''));
};
const isVal = v => ({ test: o => Math.abs(num(o) - v) < 1e-9 });
const PLACE = ['ones', 'tens', 'hundreds', 'thousands'];
const spanOf = (vs, at) => Math.max(...vs.map(v => v[at])) - Math.min(...vs.map(v => v[at]));
const max = (...xs) => Math.max(...xs.map(Math.abs));

export const REC_NEW = {
  ldQuot: ({ n, d }) => n / d, ldRem: ({ n, d }) => n % d, ldDown: ({ n, d }) => Math.floor(n / d), ldUp: ({ n, d }) => Math.ceil(n / d),
  ldFirst: ({ n, d }) => PLACE[String(Math.floor(n / d)).length - 1],
  ldEstimate: ({ n, d }) => ({ test: o => Math.abs(num(o) - n / d) / (n / d) < 0.25 }),
  ldZero: ({ n, d }) => ({ test: o => num(o) * d === n }),
  ucTable: ({ f, x }) => f * x, ucDouble: ({ f, toSmall }) => (toSmall ? 3 * f : 3), ucMul: ({ n, f }) => n * f, ucDiv: ({ n, f }) => n / f,
  ucWhich: ({ f, toBig }) => (toBig ? `Divide by ${f.toLocaleString('en-US')}` : `Multiply by ${f.toLocaleString('en-US')}`),
  ucSpeed: ({ r, f, up }) => (up ? r * f : r / f), ucPrice: ({ p, n, f }) => p * n / f, ucChain: ({ n, f1, f2 }) => n * f1 * f2,
  rgTap: ({ a, b, j }) => ({ x: j * a, y: j * b }), rgRead: ({ a, b, v }) => v * b / a, rgReadX: ({ a, b, v }) => v * a / b,
  rgPairs: ({ a, b }) => ({ test: o => { const [x, y] = o.match(/\d+/g).map(Number); return y * a === x * b; } }),
  rgUnit: ({ x, y }) => y / x, rgBatch: ({ a, b, j }) => j * b / b,
  rgCompare: ({ a1, b1, a2, b2 }) => (b1 / a1 > b2 / a2 ? 'A' : 'B'),
  rgRule: ({ x, y }) => `${x / gcd(x, y)}:${y / gcd(x, y)}`,
  wpOutOf: ({ part, whole }) => 100 * part / whole, wpBar: ({ parts, on }) => 100 * on / parts, wpTwo: ({ a, b }) => 100 * a / (a + b), wpPick: ({ part, whole }) => isVal(100 * part / whole),
  wpOver: ({ part, whole }) => 100 * part / whole, wpUnder: ({ part, whole }) => 100 * part / whole,
  wpCompare: ({ n1, a1, w1, n2, a2, w2 }) => (a1 / w1 > a2 / w2 ? n1 : n2),
  rnReadDec: ({ v }) => v, rnReadFrac: ({ v }) => isVal(v), rnPlace: ({ pts, v }) => Object.keys(pts).find(l => pts[l] === v), rnToZero: ({ v }) => -v, rnZero: ({ zero }) => zero,
  rnOpp: ({ v }) => -v, rnOppFrac: ({ v }) => isVal(-v), rnOpp3: ({ x, c }) => x * (c % 2 ? -1 : 1), rnCompare: ({ xs }) => (xs[0] < xs[1] ? '<' : '>'),
  rnBetween: ({ lo, hi }) => ({ test: o => num(o) > lo && num(o) < hi }), rnCmpStory: ({ xs, low }) => isVal(low ? Math.min(...xs) : Math.max(...xs)),
  rnOrder: ({ xs }) => ({ test: o => { const v = o.split(', ').map(num); return v.every((x, i) => i === 0 || v[i - 1] < x) && v.length === xs.length && asc(xs).every((x, i) => x === v[i]); } }),
  ppSide: ({ vs, i, j }) => Math.abs(vs[i][0] - vs[j][0]) + Math.abs(vs[i][1] - vs[j][1]), ppTri: ({ vs }) => spanOf(vs, 0) * spanOf(vs, 1) / 2,
  ppPerim: ({ vs }) => sum(vs.map((v, i) => Math.abs(v[0] - vs[(i + 1) % vs.length][0]) + Math.abs(v[1] - vs[(i + 1) % vs.length][1]))),
  ppArea: ({ vs }) => Math.abs(sum(vs.map((v, i) => v[0] * vs[(i + 1) % vs.length][1] - vs[(i + 1) % vs.length][0] * v[1]))) / 2,
  ppMissing: ({ vs, want }) => (want === 'x' ? vs[0][0] + vs[2][0] - vs[1][0] : vs[0][1] + vs[2][1] - vs[1][1]), ppTap: ({ vs }) => ({ x: vs[0][0] + vs[2][0] - vs[1][0], y: vs[0][1] + vs[2][1] - vs[1][1] }),
  ppScale: ({ vs, s, want }) => (want === 'area' ? spanOf(vs, 0) * spanOf(vs, 1) * s * s : 2 * (spanOf(vs, 0) + spanOf(vs, 1)) * s), ppFindY: ({ x1, y1, x2, area }) => y1 + 2 * area / Math.abs(x2 - x1),
  ucBest: ({ n1, p1, n2, p2 }) => (p1 / (n1 / 1000) < p2 / n2 ? 'Store A' : 'Store B'),
};
export const RANGE_NEW = {
  wpOver: t => t.part > t.whole && t.part / t.whole <= 3, wpUnder: t => t.part / t.whole < 0.01,
  ucMul: (t, L) => t.n * t.f <= 100000 && (L < 3 || t.n * 4 === Math.round(t.n * 4)),
  ldQuot: (t, L) => t.d >= (L === 1 ? 10 : 12) && t.n / t.d <= (L === 1 ? 60 : L === 2 ? 200 : 900),
};
export { num, isVal, max, gcd, sum, asc, median };
