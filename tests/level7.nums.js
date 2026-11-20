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
