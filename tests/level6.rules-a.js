// Recompute rules for the new level 6 skills, part A: unit rates, proportional tests, percents, rational division, order of operations.
import { val, near, evalText, evalAbs } from './level6.maths.js';
import { plain } from './level6.checks.js';

// "(2, 6), (4, 12)" -> [[2, 6], [4, 12]]
const pairsIn = s => [...String(s).replace(/−/g, '-').matchAll(/\((-?[\d.]+), (-?[\d.]+)\)/g)].map(m => [Number(m[1]), Number(m[2])]);
const show = n => String(n).replace('-', '−');
const proportional = ps => ps.every(([x, y]) => near(y * ps[0][0], ps[0][1] * x));
const EQ = { kx: (t, x) => t.k * x, 'kx+c': (t, x) => t.k * x + t.c, 'x+c': (t, x) => x + t.c, 'x/k': (t, x) => x / t.k, 'k/x': (t, x) => t.k / x, 'kx-c': (t, x) => t.k * x - t.c };

// Long division of n by d, written apart from the generators: the remainders until one comes back, and the digits.
function divide(n, d, count) {
  const seen = [], digits = []; let r = n % d;
  while (!seen.includes(r)) { seen.push(r); r *= 10; r %= d; }
  const start = seen.indexOf(r), length = seen.length - start; r = n % d;
  for (let i = 0; i < count; i++) { r *= 10; digits.push(Math.floor(r / d)); r %= d; }
  return { start, length, digits };
}
const reduces = (n, d) => { const g = ((a, c) => { while (c) [a, c] = [c, a % c]; return a; })(n, d); return d / g; };
const stopsAt = d => { while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };

export const RULES_A = {
  urnum: t => ({ num: val(t.a) / val(t.c) }),
  urmul: t => ({ num: val(t.a) / val(t.c) * t.n }),
  urcmp: t => ({ label: val(t.a) / val(t.c) > val(t.a2) / val(t.c2) ? t.who[0] : t.who[1] }),
  urchoice: (t, p) => { const want = val(t.a) / val(t.c), hits = p.answer.options.filter(o => near(evalText(o), want)); return { ok: hits.length === 1 && hits[0] === p.answer.options[p.answer.correct] }; },
  unitpt: (t, p) => { const r = t.ys[0] / t.xs[0], hits = p.answer.options.filter(o => { const [[x, y]] = pairsIn(o); return x === 1 && near(y, r); });
    return { ok: t.xs.every((x, i) => near(t.ys[i], r * x)) && hits.length === 1 && hits[0] === p.answer.options[p.answer.correct] }; },
  graphprop: t => ({ label: near(t.p[0] * t.q[1], t.p[1] * t.q[0]) ? 'Yes' : 'No' }),
  eqprop: t => { const f = x => EQ[t.form](t, x), xs = [1, 2, 3, 4]; return { label: xs.every(x => near(f(x) / x, f(1))) ? 'Yes' : 'No' }; },
  misprop: t => { const o = t.pos, j = t.j, n = t.row === 'y' ? t.xs[o] * t.ys[j] / t.xs[j] : t.ys[o] * t.xs[j] / t.ys[j];
    return { num: n, ok: near(n, t.row === 'y' ? t.ys[o] : t.xs[o]) && t.xs.every((x, i) => near(t.ys[i] * t.xs[j], t.ys[j] * x)) }; },
  whichlist: (t, p) => { const o = p.answer.options, hits = o.filter(s => proportional(pairsIn(s))); return { ok: hits.length === 1 && hits[0] === o[p.answer.correct] }; },
  situ: (t, p) => { const fees = t.fees.split(',').map(Number), o = p.answer.options;
    return { ok: fees.filter(f => f === 0).length === 1 && p.answer.correct === fees.indexOf(0) && o.every((s, i) => /plus/.test(s) === (fees[i] > 0) && (fees[i] === 0 || s.includes(`$${fees[i]} `))) }; },
  commpay: t => ({ num: t.base + t.sales * t.p / 100 }), chain: t => ({ num: t.price * (100 - t.d1) / 100 * (100 - t.d2) / 100 }),
  chain3: t => ({ num: t.price * (100 - t.d1) / 100 * (100 - t.d2) / 100 * (100 + t.t) / 100 }), chainoff: t => ({ num: 100 - (100 - t.d1) * (100 - t.d2) / 100 }),
  tiers: t => ({ num: t.T * t.p1 / 100 + (t.S - t.T) * t.p2 / 100 }), errback: t => ({ num: t.act * (100 + t.p) / 100 }), origchain: t => ({ num: t.after / ((100 - t.d1) / 100 * (100 - t.d2) / 100) }),
  signfrac: (t, p) => { const want = -t.p / t.q, o = p.answer.options;
    return { ok: near(evalText(plain(p.expr)), want) && o.filter(s => near(evalText(s), want)).length === 1 && near(evalText(o[p.answer.correct]), want) }; },
  chaindiv: t => ({ num: t.xs[0] / t.xs[1] / t.xs[2] }), fracdec: t => ({ num: t.n / t.d }), fracround: t => ({ num: Math.round(t.n / t.d * 100 + 1e-9) / 100 }),
  repdec: (t, p) => { const o = p.answer.options, ends = s => { const [n, d] = s.split('/').map(Number); return stopsAt(reduces(n, d)); }, want = t.want === 'terminating';
    return { ok: o.filter(s => ends(s) === want).length === 1 && ends(o[p.answer.correct]) === want }; },
  repdigit: t => { const c = divide(t.n, t.d, 20); return { num: c.digits[16], ok: c.length === 1 && c.digits[16] === c.digits[17] && c.digits[17] === c.digits[18] }; },
  period: t => ({ num: divide(t.n, t.d, 0).length }),
  arith: (t, p) => ({ num: evalAbs(plain(p.expr)) }), dist: t => ({ num: Math.abs(t.a - t.b) }),
  distexpr: (t, p) => { const o = p.answer.options, want = Math.abs(t.a - t.b); return { ok: o.filter(s => near(evalAbs(s), want)).length === 1 && near(evalAbs(o[p.answer.correct]), want) && new Set(o.map(evalAbs)).size === o.length }; },
  closer: t => ({ label: show(Math.abs(t.x1 - t.c) < Math.abs(t.x2 - t.c) ? t.x1 : t.x2) }), away: t => ({ num: t.c + t.d }),
  story3: t => ({ num: t.start + t.d1 * t.rate * t.hrs + t.d2 * t.adj }),
  propat: t => ({ num: t.y0 / t.x0 * t.x }),
  samept: (t, p) => { const hits = p.answer.options.filter(s => { const [[x, y]] = pairsIn(s); return near(y * t.x0, t.y0 * x); }); return { ok: hits.length === 1 && hits[0] === p.answer.options[p.answer.correct] }; },
};
