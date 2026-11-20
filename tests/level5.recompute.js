// Independent recomputation of Level 5 answers from each problem's raw operands (the _t field).
// Nothing here imports the generators: every formula is written out again, so a wrong generator shows up as a mismatch.
// Each entry returns the expected answer as: a number, [top, bottom] for a fraction, { x, y } for a point,
// a string for a choice, or { test } with a predicate that exactly one choice option may satisfy.
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const lcm = (a, b) => a * b / gcd(a, b);
const sum = xs => xs.reduce((s, x) => s + x, 0);
const asc = xs => [...xs].sort((p, q) => p - q);
const neg = v => String(v).replace('-', '−');
const pt = (x, y) => `(${neg(x)}, ${neg(y)})`;
const median = xs => { const s = asc(xs), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const holds = (x, sym, v) => ({ '<': x < v, '>': x > v, '≤': x <= v, '≥': x >= v })[sym];
const num = s => Number(String(s).replace(/−/g, '-').replace(/[^0-9.-]/g, ''));

// Turn a displayed expression such as 3(x + 4) or 5x² into JavaScript, then evaluate it.
function toJS(html) {
  let s = String(html).replace(/<!--.*?-->/g, '').replace(/<span class="blank">\?<\/span>/g, 'Q').replace(/<sup>(\d+)<\/sup>/g, '**$1').replace(/<[^>]+>/g, '');
  s = s.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/\s+/g, '').replace(/(\d)([a-zQ(])/g, '$1*$2');
  for (let i = 0; i < 3; i++) s = s.replace(/([a-z)Q])([a-zQ(])/g, '$1*$2');
  return s.replace(/[a-z]/g, ch => (ch === 'y' ? '(Y)' : '(X)'));
}
const evalAt = (js, vars) => Function(...Object.keys(vars), `return ${js}`)(...Object.values(vars));
const POINTS = [{ X: 2, Y: 3 }, { X: 3, Y: 5 }, { X: 7, Y: 11 }];
const same = (jsA, jsB) => POINTS.every(v => Math.abs(evalAt(jsA, v) - evalAt(jsB, v)) < 1e-9);
const quadrant = (x, y) => 'Quadrant ' + (x > 0 && y > 0 ? 'I' : x < 0 && y > 0 ? 'II' : x < 0 && y < 0 ? 'III' : 'IV');
const mode = xs => asc([...new Set(xs)]).sort((p, q) => xs.filter(v => v === q).length - xs.filter(v => v === p).length)[0];
const expand = (lo, counts) => counts.flatMap((c, i) => Array(c).fill(lo + i));

const REC = {
  ratio: ({ A, B, want }) => { const [x, y] = { ab: [A, B], ba: [B, A], aw: [A, A + B], bw: [B, A + B] }[want]; return `${x / gcd(x, y)}:${y / gcd(x, y)}`; },
  tape: ({ a, b, given, gk, want }) => (gk === 'total' ? given / (a + b) : given / (a - b)) * { first: a, second: b, total: a + b }[want],
  eqr: ({ a, b, known, pos }) => (pos === 0 ? known * b / a : known * a / b),
  eqrChoice: ({ a, b }) => ({ test: o => { const [x, y] = o.split(':').map(Number); return x * b === y * a; } }),
  eqrPoint: ({ a, b, x }) => ({ x, y: x * b / a }),
  rate: ({ total, n }) => total / n,
  rateUse: ({ total, n, m }) => total / n * m,
  best: ({ p1, n1, p2, n2 }) => (p1 / n1 < p2 / n2 ? 'Pack A' : 'Pack B'),
  bestDiff: ({ p1, n1, p2, n2 }) => Math.abs(p1 / n1 - p2 / n2),
  grid: ({ n, free }) => (free ? 100 - n : n),
  pct: ({ p, n }) => p / 100 * n,
  pctOff: ({ p, n }) => n * (100 - p) / 100,
  pctAdd: ({ p, n }) => n * (100 + p) / 100,
  whole: ({ p, part }) => part / (p / 100),
  wholeLeft: ({ p, part }) => part / (p / 100) - part,
  whatPct: ({ part, whole }) => 100 * part / whole,
  fdp: ({ n, d, to }) => (to === 'frac' ? [n, d] : to === 'dec' ? n / d : 100 * n / d),
  fdpCmp: ({ opts, want }) => asc(opts.map(o => o.v)).map(v => opts.find(o => o.v === v).s)[want === 'max' ? opts.length - 1 : 0],
  fdiv: ({ n1, d1, n2, d2 }) => [n1 * d2, d1 * n2],
  gcf: ({ a, b }) => gcd(a, b),
  lcm: ({ a, b }) => lcm(a, b),
  gcfPer: ({ a, b }) => a / gcd(a, b),
  factorOut: ({ A, B, miss }) => ({ g: gcd(A, B), x: A / gcd(A, B), y: B / gcd(A, B) })[miss],
  dadd: ({ a, b }) => a + b, dsub: ({ a, b }) => a - b, dmul: ({ a, b }) => a * b, ddiv: ({ a, b }) => a / b,
  change: ({ n, p, paid }) => paid - n * p,
  split: ({ a, b, n }) => (a + b) / n,
  ctx: ({ n, sign }) => neg(sign * n),
  read: ({ n }) => n, opp: ({ n }) => -n, opp2: ({ n }) => n, abs: ({ n }) => Math.abs(n),
  move: ({ s, d }) => s + d,
  dist: ({ a, b }) => Math.abs(a - b),
  absMax: ({ xs }) => neg([...xs].sort((p, q) => Math.abs(q) - Math.abs(p))[0]),
  cmp: ({ a, b }) => (a < b ? '<' : '>'),
  cmpAbs: ({ a, b, both }) => { const l = Math.abs(a), r = both ? Math.abs(b) : b; return l < r ? '<' : l > r ? '>' : '='; },
  order: ({ xs, up }) => (up ? asc(xs) : asc(xs).reverse()).map(neg).join(', '),
  extreme: ({ xs, want }) => (want === 'min' ? Math.min(...xs) : Math.max(...xs)),
  countCmp: ({ xs, v, less }) => xs.filter(x => (less ? x < v : x > v)).length,
  coordRead: ({ x, y }) => pt(x, y),
  quad: ({ x, y }) => quadrant(x, y),
  which: ({ pts, x, y }) => Object.keys(pts).find(key => pts[key][0] === x && pts[key][1] === y),
  reflect: ({ x, y, ax }) => (ax === 'x' ? { x, y: -y } : { x: -x, y }),
  pdist: ({ x1, y1, x2, y2 }) => Math.abs(x1 - x2) + Math.abs(y1 - y2),
  rect: ({ x1, y1, x2, y2, want }) => (want === 'area' ? Math.abs(x2 - x1) * Math.abs(y2 - y1) : 2 * Math.abs(x2 - x1) + 2 * Math.abs(y2 - y1)),
  corner: ({ x1, y2 }) => pt(x1, y2),
  pow: ({ base, e }) => { let v = 1; for (let i = 0; i < e; i++) v *= base; return v; },
  powPart: ({ base, e, askExp }) => (askExp ? e : base),
  powFrac: ({ n, d, e }) => [n ** e, d ** e],
  ops: ({ js }) => evalAt(js, {}),
  eval: ({ js, x }) => evalAt(js, { X: x }),
  wordExpr: ({ good }) => ({ test: o => same(toJS(o), toJS(good)) }),
  parts: ({ expr, v, w, want }) => { const ts = expr.split(' + '), co = L => parseInt(ts.find(t => t.endsWith(L)), 10); return want === 'terms' ? ts.length : want === 'coef' ? co(v) : want === 'coef2' ? co(w) : Number(ts.find(t => /^\d+$/.test(t))); },
  storyExpr: ({ c, d, plus }) => ({ test: o => same(toJS(o), plus ? `${d}*X+${c}` : `${c}-${d}*X`) }),
  storyEval: ({ c, d, x, plus }) => (plus ? c + d * x : c - d * x),
  identity: ({ lhs, rhs }) => ({ solve: Q => [2, 3, 7].every(X => Math.abs(evalAt(lhs, { X }) - evalAt(rhs, { X, Q })) < 1e-9) }),
  equivChoice: ({ js, not }) => ({ test: o => same(toJS(o), js) !== !!not }),
  eq: ({ op, a, c }) => ({ '+': c - a, '-': c + a, '*': c / a, '/': c * a })[op],
  ineqRead: ({ v, sym }) => `x ${sym} ${neg(v)}`,
  ineqStory: ({ v, sym, x }) => `${x} ${sym} ${neg(v)}`,
  ineqSol: ({ v, sym }) => ({ test: o => holds(num(o), sym, v) }),
  ineqEdge: ({ v, sym }) => { const ok = []; for (let i = -40; i <= 40; i++) if (holds(i, sym, v)) ok.push(i); return sym === '>' || sym === '≥' ? ok[0] : ok[ok.length - 1]; },
  para: ({ b, h }) => b * h, tri: ({ b, h }) => b * h / 2, trap: ({ a, c, h }) => (a + c) / 2 * h,
  triH: ({ A, b }) => 2 * A / b, paraH: ({ A, b }) => A / b,
  house: ({ w, h, t }) => w * h + w * t / 2,
  saBox: ({ l, w, h }) => 2 * l * w + 2 * l * h + 2 * w * h,
  saPyr: ({ s, t }) => s * s + 4 * (s * t / 2),
  volFrac: ({ ns, d }) => [ns[0] * ns[1] * ns[2], d * d * d],
  cubes: ({ ns }) => ns[0] * ns[1] * ns[2],
  stat: ({ xs, want }) => ({ mean: sum(xs) / xs.length, median: median(xs), mode: mode(xs), range: Math.max(...xs) - Math.min(...xs) })[want],
  missing: ({ xs, m, n }) => m * n - sum(xs),
  typical: ({ xs, drop }) => {
    if (!drop) return Math.max(...xs) > 2 * median(xs) ? 'median' : 'mean';
    const rest = xs.filter(v => v !== drop), dMean = Math.abs(sum(xs) / xs.length - sum(rest) / rest.length), dMed = Math.abs(median(xs) - median(rest));
    return dMean > dMed ? 'mean' : 'median';
  },
  dot: ({ lo, counts, want, arg }) => { const data = expand(lo, counts); return ({ total: data.length, at: data.filter(v => v === arg).length, mode: mode(data), range: data[data.length - 1] - data[0], median: median(data), least: data.filter(v => v >= arg).length, mean: sum(data) / data.length })[want]; },
  hist: ({ start, width, counts, want, i }) => { const lab = j => `${start + j * width}–${start + (j + 1) * width - 1}`, n = sum(counts); return ({ bin: counts[i], total: n, most: lab(counts.indexOf(Math.max(...counts))), least: sum(counts.slice(i)), under: sum(counts.slice(0, i)), percent: 100 * counts[i] / n })[want]; },
};
// Number ranges each step is meant to stay inside (checked for the bare, non-story problems).
const max = (...xs) => Math.max(...xs.map(Math.abs));
const RANGE = {
  ratio: (t, L) => max(t.A, t.B) <= (L === 1 ? 6 : 45),
  eqr: (t, L) => max(t.a, t.b, t.known) <= (L === 1 ? 30 : 81),
  pct: (t, L) => (L === 1 ? [10, 20, 25, 50].includes(t.p) && t.n <= 150 : t.p >= 1 && t.p <= 99 && t.n <= 900),
  whole: (t, L) => (L === 1 ? [10, 20, 25, 50].includes(t.p) : t.p % 5 === 0) && t.part <= 300,
  fdp: (t, L) => (L === 1 ? t.d <= 10 : L === 2 ? [20, 25, 50, 100].includes(t.d) : t.d <= 200),
  gcf: (t, L) => max(t.a, t.b) <= (L === 1 ? 30 : 100),
  lcm: (t, L) => max(t.a, t.b) <= (L === 1 ? 10 : 15),
  pow: t => t.base ** t.e <= 100000,
  eq: (t, L) => (L === 1 ? max(t.a) <= 12 && max(t.c) <= 54 : max(t.a, t.c) <= 180),
  para: (t, L) => max(t.b, t.h) <= (L === 1 ? 10 : 18),
  tri: (t, L) => max(t.b, t.h) <= (L === 1 ? 11 : 18),
  saBox: (t, L) => max(t.l, t.w, t.h) <= (L === 1 ? 6 : 12),
  stat: (t, L) => t.xs.length === (L === 1 ? 5 : t.xs.length) && t.xs.length <= 8 && max(...t.xs) <= 45,
  read: t => max(t.n) <= 7, move: t => max(t.s, t.s + t.d) <= 9, coordRead: t => max(t.x, t.y) <= 6,
};
export { REC, RANGE, toJS, evalAt, same, neg, pt, asc, median, mode, expand, holds, num, gcd, sum };
