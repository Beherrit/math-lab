// Independent recomputation for the line and function skills added to level 7. Nothing here imports the generators.
import assert from 'node:assert/strict';
import { text, ans, nums, has } from './level7.text.js';
import { decode, lineIs, dotOn, noSvg, close } from './level7.svg.js';
import { onlyLine } from './level7.eq.js';

const near = (x, y, msg) => assert.ok(Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y)), `${msg || ''} got ${x}, expected ${y}`);
const opts = p => p.answer.options.map(text);
const slopeOf = (p, q) => (q[1] - p[1]) / (q[0] - p[0]);
// Numbers that must be readable on screen: the question and any table, but not the numbers inside a drawn picture.
export const onScreen = p => nums(`${p.story || ''} ${p.ask} ${p.expr || ''} ${noSvg(p.visual)}`);
export function mustShow(p, values) { const seen = onScreen(p); for (const v of values.filter(x => Math.abs(x) > 1)) assert.ok(has(seen, v), `${v} is not on screen: ${text(p.ask).slice(0, 150)}`); }
// Slope and starting value of a function given as a rule, a table, a graph or words. A graph is read from the picture.
export function formLine(f, lines) {
  if (f.f === 'table') {
    const [p, q] = f.rows, m = slopeOf(p, q);
    for (const r of f.rows) near(r[1], p[1] + m * (r[0] - p[0]), 'table is not linear');
    return { m, c: p[1] - m * p[0] };
  }
  if (f.f === 'graph') { const l = lines.shift(); assert.ok(lineIs(l, f.m, f.c ?? 0), `drawn line ${l && l.m}x + ${l && l.c} is not ${f.m}x + ${f.c ?? 0}`); return { m: f.m, c: f.c ?? 0 }; }
  if (f.f === 'words' && f.amt) return { m: f.amt / f.per, c: f.c ?? 0 };
  return { m: f.m, c: f.c ?? 0 };
}
export const forms = (t, p) => { const lines = decode(p.visual).lines; return t.forms.map(f => formLine(f, lines)); };

export const LINES = {
  propcmp(t, p) {
    const fs = forms(t, p), r = fs.map(f => f.m);
    fs.forEach(f => assert.equal(f.c, 0, 'a proportional relationship starts at 0'));
    mustShow(p, t.forms.flatMap(f => (f.f === 'table' ? f.rows.flat() : f.f === 'words' ? (f.amt ? [f.amt, f.per] : [f.m]) : f.f === 'eq' ? [f.m] : [])));
    if (t.ask === 'rate') return near(ans(p), r[0]);
    if (t.ask === 'diff') { assert.notEqual(r[0], r[1]); return near(ans(p), Math.abs(r[0] - r[1])); }
    if (t.ask === 'total') { assert.notEqual(r[0], r[1]); return near(ans(p), Math.abs(r[0] - r[1]) * t.x); }
    assert.equal(ans(p), r[0] === r[1] ? 'They are the same' : (r[0] > r[1]) === t.hiWins ? t.names[0] : t.names[1]);
    if (t.shape === 'cmp-lines') {
      const pic = decode(p.visual), lines = pic.lines;
      assert.equal(lines.length, 2); assert.ok(r[0] !== r[1]);
      ['A', 'B'].forEach((lab, i) => assert.ok(pic.dots.some(d => d.label === lab && dotOn(d, lines[i].m, 0)), `dot ${lab} is not on its line`));
    }
  },
  slopewhy(t, p) {
    const pic = decode(p.visual);
    const tall = pic.dashed.filter(([u, v]) => close(u[0], v[0])), flat = pic.dashed.filter(([u, v]) => close(u[1], v[1]));
    const sees = (list, len, axis) => list.some(([u, v]) => close(Math.abs(v[axis] - u[axis]), len));
    switch (t.shape) {
      case 'tri-rise': case 'tri-run': {
        const [a, s] = t.small, slope = s / a;
        assert.ok(lineIs(pic.lines[0], slope, t.start[1] - slope * t.start[0]) && sees(flat, a, 0) && sees(tall, s, 1), 'the drawn triangle is not the one in the question');
        mustShow(p, [a, s, t.given]);
        return near(ans(p), t.ask === 'rise' ? t.given * slope : t.given / slope);
      }
      case 'tri-ratio': mustShow(p, t.small); return near(ans(p), t.small[1] / t.small[0]);
      case 'same-line': { const [a, s] = t.t1, [a2, s2] = t.t2; mustShow(p, [a, s, a2, s2]); return assert.equal(ans(p), s * a2 === s2 * a ? 'Yes' : 'No'); }
      case 'orig-y': mustShow(p, [...t.p, t.x2]); return near(ans(p), t.p[1] * t.x2 / t.p[0]);
      case 'orig-eq': mustShow(p, t.p); return assert.equal(p.answer.correct, onlyLine(opts(p), t.p[1] / t.p[0], 0));
      case 'int-rise': case 'int-m': {
        const [x, y] = t.p, slope = (y - t.c) / x;
        assert.ok(lineIs(pic.lines[0], slope, t.c) && pic.dots.some(d => close(d.at[0], 0) && close(d.at[1], t.c)) && pic.dots.some(d => close(d.at[0], x) && close(d.at[1], y)), 'dots A and B are not where the question says');
        mustShow(p, [t.c, x, y]); return near(ans(p), t.shape === 'int-rise' ? y - t.c : slope);
      }
      case 'why': case 'why-b': {
        const right = t.shape === 'why' ? /same shape.*same ratio/ : /starts at height b.*added/, os = opts(p);
        assert.equal(os.filter(o => right.test(o)).length, 1); return assert.match(ans(p), right);
      }
      case 'derive-eq': { const [x, y] = t.p; mustShow(p, [t.c, x, y]); return assert.equal(p.answer.correct, onlyLine(opts(p), (y - t.c) / x, t.c)); }
      case 'ratio-m': { const [x, y] = t.p; mustShow(p, [t.c, x, y]); return near(ans(p), (y - t.c) / x); }
      case 'y-tri': mustShow(p, [t.n, t.d, t.c, t.x]); return near(ans(p), t.c + t.n * t.x / t.d);
      case 'shift': mustShow(p, [t.m, t.x, t.c]); return near(ans(p), t.m * t.x + t.c);
      default: assert.fail(`unknown slopewhy shape ${t.shape}`);
    }
  },
  leq(t, p) {
    const [x1, y1] = t.p, m = t.m ?? slopeOf(t.p, t.q), c = y1 - m * x1;
    for (const r of t.rows || []) near(r[1], m * r[0] + c, 'table row is off the line');
    if (t.rows) mustShow(p, t.rows.flat());
    else if (!t.graph) mustShow(p, [...t.p, ...(t.q || []), ...(t.m === undefined ? [] : [t.m])]);
    if (t.graph) {
      const pic = decode(p.visual);
      assert.ok(lineIs(pic.lines[0], m, c), `the drawn line is not ${m}x + ${c}`);
      for (const pt of t.q ? [t.p, t.q] : [t.p]) assert.ok(pic.dots.some(d => close(d.at[0], pt[0]) && close(d.at[1], pt[1])), `no dot at ${pt}`);
    }
    if (t.ask === 'm') return near(ans(p), m);
    if (t.ask === 'b') return near(ans(p), c);
    assert.equal(p.answer.correct, onlyLine(opts(p), m, c), 'the right option is not the line through the given points');
  },
  funccmp(t, p) {
    const [A, B] = forms(t, p), ys = (f, x) => f.m * x + f.c;
    mustShow(p, t.forms.flatMap(f => (f.f === 'table' ? f.rows.flat() : f.f === 'eq' || f.f === 'words' ? [f.m, f.c] : [])));
    for (const f of t.forms.filter(f => f.f === 'table')) assert.ok(f.rows[0][0] > 0, 'a table that starts at 0 gives the start away');
    if (t.ask === 'diff') { assert.notEqual(ys(A, t.x), ys(B, t.x)); return near(ans(p), Math.abs(ys(A, t.x) - ys(B, t.x))); }
    const [a, b] = { rate: [A.m, B.m], start: [A.c, B.c], at: [ys(A, t.x), ys(B, t.x)] }[t.ask];
    assert.equal(ans(p), a === b ? 'They are the same' : a > b ? t.names[0] : t.names[1]);
  },
};
