// Independent recomputation for the number skills added to level 7: roots and pi on the number line, fraction equations, units in scientific notation.
import assert from 'node:assert/strict';
import { text, ans } from './level7.text.js';
import { lineDot, close } from './level7.svg.js';
import { mustShow } from './level7.lines.js';

const near = (x, y, msg) => assert.ok(Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y)) + 1e-9, `${msg || ''} got ${x}, expected ${y}`);
const opts = p => p.answer.options.map(text);
// A number written the way a child reads it: 3.1, π, 2π, 1 + √2, 22/7, √9.8.
export function value(s) {
  const js = s.replace(/−/g, '-').replace(/(\d)\s*π/g, '$1*π').replace(/π/g, 'Math.PI').replace(/(\d)√/g, '$1*√').replace(/√([\d.]+)/g, 'Math.sqrt($1)');
  return Function(`return ${js}`)();
}
const roundTo = (v, p) => Math.round(v * 10 ** p) / 10 ** p;
const pairOf = o => o.split(' and ').map(Number);

export const IRR = {
  irr(t, p) {
    const say = text(p.ask), a = ans(p);
    switch (t.shape) {
      case 'between-tenth': case 'cube-between': {
        const cube = t.shape === 'cube-between', N = Number((cube ? /\^3√(\d+)/ : /√(\d+)/).exec(say)[1]), v = cube ? Math.cbrt(N) : Math.sqrt(N), hit = o => { const [lo, hi] = pairOf(o); return close(hi - lo, 0.1, 1e-6) && lo <= v && v < hi; };
        assert.equal(N, t.N); assert.equal(opts(p).filter(hit).length, 1); return assert.ok(hit(a));
      }
      case 'dot-reading': {
        const x = lineDot(p.visual), at = o => Math.sqrt(Number(/√(\d+)/.exec(o)[1]));
        assert.ok(opts(p).filter(o => close(at(o), x, 0.04)).length === 1, 'exactly one choice is where the dot is'); return assert.ok(close(at(a), x, 0.04));
      }
      case 'square-tenth': { const x = Number(/Work out ([\d.]+) ×/.exec(say)[1]); return near(ans(p), Math.round(x * x * 100) / 100); }
      case 'const-between': { const v = value(/^(.+?) is about/.exec(say)[1]), [lo, hi] = pairOf(a); return assert.ok(lo <= v && v < hi && close(hi - lo, 0.1, 1e-6)); }
      case 'compare-yn': { const [, N, x] = /Is √(\d+) greater than ([\d.]+)\?/.exec(say); return assert.equal(a, Math.sqrt(Number(N)) > Number(x) ? 'Yes' : 'No'); }
      case 'order-three': {
        const items = say.split('greatest: ')[1].split(', '), key = l => l.map(value), sorted = items.slice().sort((x, y) => value(x) - value(y)).join(', ');
        assert.equal(a, sorted); return assert.equal(opts(p).filter(o => o.split(', ').every((v, i, l) => i === 0 || value(l[i - 1]) < value(v))).length, 1, key(items).join());
      }
      case 'nearest-tenth': { const N = Number(/√(\d+)/.exec(say)[1]); return near(a, roundTo(Math.sqrt(N), 1)); }
      case 'dot-decimal': {
        const x = lineDot(p.visual); assert.equal(opts(p).filter(o => close(Number(o), x, 0.06)).length, 1); return assert.ok(close(Number(a), x, 0.06));
      }
      case 'rational-between': {
        const [, lo, hi] = /between √(\d+) and √(\d+)/.exec(say).map(Number).map((n, i) => (i ? Math.sqrt(n) : n)), inside = o => Number(o) > lo && Number(o) < hi;
        assert.equal(opts(p).filter(inside).length, 1); return assert.ok(inside(a));
      }
      case 'pi-vs': { const x = value(/or (.+)\?$/.exec(say)[1]); return assert.equal(a, x > Math.PI ? /or (.+)\?$/.exec(say)[1] : 'π'); }
      case 'count-ints': {
        const [, lo, hi] = /between √(\d+) and √(\d+)/.exec(say).map(Number).map((n, i) => (i ? Math.sqrt(n) : n)); let n = 0;
        for (let k = 1; k < 40; k++) if (k > lo && k < hi) n++;
        return near(a, n);
      }
      case 'expression-tenth': return near(a, roundTo(value(/Find (.+) to the nearest tenth/.exec(say)[1]), 1));
      default: assert.fail(`unknown irr shape ${t.shape}`);
    }
  },
};

// Two-way tables: the table on screen must match the counts the problem says it has, then every answer is worked out again.
const cellsOf = html => [...String(html).matchAll(/<tr>(.*?)<\/tr>/g)].slice(1).map(r => [...r[1].matchAll(/<td>([^<]*)<\/td>/g)].map(m => m[1]));
export const TWOWAY = {
  twoway(t, p) {
    const a = ans(p);
    if (t.shape === 'cell-from-pct') { mustShow(p, [t.T, t.P]); return near(a, t.T * t.P / 100); }
    const g = t.g, rows = cellsOf(p.visual);
    assert.equal(rows.length, t.noTotals ? 2 : 3);
    rows.forEach((r, i) => r.slice(1).forEach((v, j) => { if (v !== '?') assert.equal(Number(v), g[i][j], `table cell ${i},${j}`); }));
    for (const [i, j] of [[0, 0], [0, 1], [1, 0], [1, 1]]) assert.ok(g[i][j] > 0);
    g.slice(0, 2).forEach(r => assert.equal(r[0] + r[1], r[2])); assert.equal(g[0][0] + g[1][0], g[2][0]); assert.equal(g[0][1] + g[1][1], g[2][1]); assert.equal(g[2][0] + g[2][1], g[2][2]);
    const pct = (part, whole) => 100 * part / whole, row = i => pct(g[i][0], g[i][2]);
    switch (t.shape) {
      case 'joint': return near(a, g[t.cell[0]][t.cell[1]]);
      case 'marginal': case 'sum-cells': return near(a, t.byRow ? g[t.idx][0] + g[t.idx][1] : g[0][t.idx] + g[1][t.idx]);
      case 'missing-cell': { const [i, j] = t.cell; return near(a, g[i][2] - g[i][1 - j]); }
      case 'grand-total': return near(a, g[0][2] + g[1][2]);
      case 'rel-row': case 'rel-col': case 'rel-all': {
        const [i, j] = t.cell, whole = t.by === 'row' ? g[i][0] + g[i][1] : t.by === 'col' ? g[0][j] + g[1][j] : g[2][2];
        assert.ok(Number.isInteger(pct(g[i][j], whole))); return near(a, pct(g[i][j], whole));
      }
      case 'compare-pct': assert.notEqual(row(0), row(1)); return assert.equal(a, t.names[row(0) > row(1) ? 0 : 1]);
      case 'assoc': { const d = Math.abs(row(0) - row(1)); assert.ok(d === 0 || d >= 40); return assert.equal(/^No clear/.test(a), d === 0); }
      case 'percent-gap': return near(a, Math.abs(row(0) - row(1)));
      case 'statement': {
        const nums = s => [...s.matchAll(/(\d+)%/g)].map(m => Number(m[1])), want = [row(0), row(1)];
        assert.deepEqual(nums(a), want); return assert.equal(opts(p).filter(o => JSON.stringify(nums(o)) === JSON.stringify(want)).length, 1);
      }
      default: assert.fail(`unknown twoway shape ${t.shape}`);
    }
  },
};

// Lines of best fit: predictions, misses and the meaning of slope and intercept, worked out again from the line and the dots.
export const FITL = {
  fitl(t, p) {
    const a = ans(p), line = x => t.m * x + t.c, say = text(p.ask);
    if (t.shape === 'better-line') {
      const miss = l => t.dots.reduce((s, [x, y]) => s + Math.abs(y - (l[0] * x + l[1])), 0), [m1, m2] = t.lines.map(miss);
      assert.notEqual(m1, m2); return assert.equal(a, m1 < m2 ? 'Line 1' : 'Line 2');
    }
    mustShow(p, [t.m, t.c]);
    switch (t.shape) {
      case 'slope-num': return near(a, Math.abs(t.m));
      case 'intercept-num': return near(a, t.c);
      case 'predict': mustShow(p, [t.x]); return near(a, line(t.x));
      case 'change-by': return near(a, t.m * t.k2);
      case 'intercept-meaning': { const right = o => /^The prediction for/.test(o) && o.includes(`about ${Math.abs(t.c)} `); assert.equal(opts(p).filter(right).length, 1); return assert.ok(right(a)); }
      case 'interpolate': { const [lo, hi] = t.range; assert.ok(say.includes(`from ${lo} to ${hi}`)); return assert.equal(a, t.x >= lo && t.x <= hi ? 'Interpolation' : 'Extrapolation'); }
      case 'miss': case 'miss-signed': { mustShow(p, [t.x, t.y]); const d = t.y - line(t.x); return near(a, t.shape === 'miss' ? Math.abs(d) : d); }
      case 'x-from-y': mustShow(p, [t.y]); return near(line(a), t.y);
      case 'trust': { const [lo, hi] = t.range, far = x => Math.max(lo - x, x - hi, 0), worst = Math.max(...t.xs.map(far)); assert.equal(t.xs.filter(x => far(x) === worst).length, 1); return assert.equal(a, `x = ${t.xs.find(x => far(x) === worst)}`); }
      default: assert.fail(`unknown fitl shape ${t.shape}`);
    }
  },
};

// Equations with fractions and decimals: both sides are expanded from the groups [k, a, c] meaning k(ax + c), then solved again.
const expandSide = side => side.reduce(([A, B], [k, a, c]) => [A + k * a, B + k * c], [0, 0]);
const gcdI = (x, y) => (y ? gcdI(y, x % y) : x);
export const EQF = {
  eqfrac(t, p) {
    const a = ans(p);
    if (t.shape === 'clear-lcm') { mustShow(p, t.dens); return near(a, t.dens.reduce((m, d) => (m * d) / gcdI(m, d), 1)); }
    const [A, B] = expandSide(t.L), [C, D] = expandSide(t.R || []), side = x => [A * x + B, C * x + D];
    mustShow(p, t.shown);
    switch (t.shape) {
      case 'check-yn': return assert.equal(a, Math.abs(side(t.x)[0] - side(t.x)[1]) < 1e-9 ? 'Yes' : 'No');
      case 'eval-side': return near(a, A * t.x + B);
      case 'which-value': {
        const good = o => { const [l, r] = side(Number(o.replace('-', '-'))); return Math.abs(l - r) < 1e-9; };
        assert.equal(opts(p).filter(good).length, 1); return assert.ok(good(a));
      }
      default: assert.notEqual(A, C); return near(a, (D - B) / (A - C));
    }
  },
};

// Units in scientific notation: every number is read back out of the question text, then the answer is worked out again.
const SCI = /(\d+(?:\.\d+)?) × 10\^(-?\d+)/g, ENOT = /(\d+(?:\.\d+)?)E(-?\d+)/g;
const sciIn = s => [...s.matchAll(SCI)].map(m => [Number(m[1]), Number(m[2])]), eIn = s => [...s.matchAll(ENOT)].map(m => [Number(m[1]), Number(m[2])]);
const PREFIX = { kilo: 3, mega: 6, giga: 9, tera: 12, milli: -3, micro: -6, nano: -9 };
const expOfUnit = u => (u === 'bytes' || u === 'meters' ? 0 : PREFIX[Object.keys(PREFIX).find(k => u.startsWith(k))]);
const clean = v => Number(v.toPrecision(12));
export const SCIU = {
  sciu(t, p) {
    const a = ans(p), say = text(`${p.story || ''} ${p.ask}`);
    switch (t.shape) {
      case 'e-read': case 'e-small': { const [[m, e]] = eIn(say); return near(a, clean(m * 10 ** e)); }
      case 'e-exp': { const [[, e]] = eIn(say); return near(a, e); }
      case 'power-times': { const [x, y] = [...say.matchAll(/10\^(\d+)/g)].map(m => Number(m[1])); return near(a, x - y); }
      case 'prefix-exp': { const u = /1 (\w+) is/.exec(say)[1] + 's'; return near(a, expOfUnit(u)); }
      case 'unit-pick': {
        const [[, e]] = sciIn(say), list = /bytes\./.test(say) ? ['bytes', 'kilobytes', 'megabytes', 'gigabytes', 'terabytes'] : ['nanometers', 'micrometers', 'millimeters', 'meters', 'kilometers'], fits = list.filter(u => expOfUnit(u) <= e);
        assert.equal(a, fits.sort((x, y) => expOfUnit(y) - expOfUnit(x))[0]); return assert.equal(new Set(opts(p)).size, opts(p).length);
      }
      case 'convert': case 'convert-small': { const [[m, e]] = sciIn(say), unit = /how many (\w+)\?/.exec(say)[1]; return near(a, clean(m * 10 ** (e - expOfUnit(unit)))); }
      case 'times-as': { const [[m, e], [c, n]] = sciIn(say); mustShow(p, [m, c]); return near(a, clean((m / c) * 10 ** (e - n))); }
      case 'times-exp': {
        const [[m, e], [c, n]] = sciIn(say), q = Number(/is (\d+(?:\.\d+)?) × 10\^\?/.exec(say)[1]), exact = (m / c) * 10 ** (e - n);
        near(q * 10 ** a, clean(exact)); return assert.ok(q >= 1 && q < 10);
      }
      case 'e-calc': { const [[m, e], [c, n]] = eIn(say); return near(a, clean((m / c) * 10 ** (e - n))); }
      case 'compare-units': {
        const [[x, ex], [y, ey]] = sciIn(say), units = [...say.matchAll(/(millimeters|meters|kilometers)/g)].map(m => expOfUnit(m[1])), val = [x * 10 ** (ex + units[0]), y * 10 ** (ey + units[1])];
        assert.notEqual(val[0], val[1]); return assert.equal(a.startsWith(`${val[0] > val[1] ? x : y} × `), true);
      }
      default: assert.fail(`unknown sciu shape ${t.shape}`);
    }
  },
};
