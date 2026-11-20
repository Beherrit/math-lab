// Checks for the picture questions: each rebuilds the numbers from the drawing (clock hands, jug level, bar heights, circles, polygons) and compares with the answer.
import assert from 'node:assert/strict';
import { plain, nums, at, tags, withClass, texts, svgs, mixed, readClock, readGauge, readGraph, readRuler, readPlot, polygons, readGrid, shapeFacts } from './level2.parse.js';
import { PROPS } from './level2.calc.js';

const good = p => plain(p.answer.options[p.answer.correct]), ask = p => plain(p.ask);
const graph = p => readGraph(p.visual), val = (g, c) => g.vals[g.cats.indexOf(c)];
const near = (a, b) => Math.abs(a - b) < 0.1;
const pointsArea = pts => Math.abs(pts.reduce((s, [x, y], i) => s + x * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * y, 0)) / 2;
const frac = p => p.answer.n / p.answer.d;

export const SPECIAL_PICS = {
  gridsq: p => { const g = readGrid(p.visual); assert.equal(g.row, g.col); assert.equal(p.answer.value, g.row * g.col); },
  barparts: p => { const [top, bot] = svgs(p.visual), on = withClass(top, 'rect', 'on').length, d = tags(top, 'rect').length, e = tags(bot, 'rect').length; assert.equal(withClass(bot, 'rect', 'on').length, 0); assert.equal(p.answer.value, on * e / d); },
  linemark: p => { const [top, bot] = svgs(p.visual), idx = s => { const x = withClass(s, 'line', 'tick').map(t => +at(t, 'x1')), c = +at(withClass(s, 'circle', 'dot')[0], 'cx'); return { n: (c - x[0]) / (x[x.length - 1] - x[0]) * (x.length - 1), ticks: x.length - 1 }; };
    const a = idx(top), b = idx(bot); assert.ok(near(a.n / a.ticks, b.n / b.ticks), 'both dots at the same place'); assert.ok(near(p.answer.value, b.n)); },
  clockread: (p, w) => { const c = readClock(p.visual); assert.ok(c.exact, `${w}: minute hand off a mark`); const hits = p.answer.options.filter(o => o === c.text); assert.deepEqual(hits, [good(p)], `${w}: clock shows ${c.text}`); },
  clockmin: p => assert.equal(p.answer.value, readClock(p.visual).m), clockuntil: p => assert.equal(p.answer.value, 60 - readClock(p.visual).m),
  gauge: p => { const g = readGauge(p.visual); assert.ok(near(g.value, p.answer.value), `gauge reads ${g.value}`); },
  gaugeroom: p => { const g = readGauge(p.visual); assert.ok(near(g.max - g.value, p.answer.value), `room ${g.max - g.value}`); },
  gread: p => { const g = graph(p), c = p._t.cat; assert.ok(ask(p).includes(c)); assert.ok(near(val(g, c), p.answer.value), `${c} is ${val(g, c)}`); },
  gmore: p => { const g = graph(p), [x, y] = p._t.cats; assert.ok(near(val(g, x) - val(g, y), p.answer.value)); assert.ok(p.answer.value > 0); },
  gtotal: p => { const g = graph(p), [x, y] = p._t.cats; assert.ok(near(val(g, x) + val(g, y), p.answer.value)); },
  gmost: p => { const g = graph(p), v = p._t.most ? Math.max(...g.vals) : Math.min(...g.vals); assert.equal(g.vals.filter(x => x === v).length, 1); assert.equal(good(p), g.cats[g.vals.indexOf(v)]); },
  gtwo: p => { const g = graph(p), c = p._t.cats, v = c.map(x => val(g, x)), want = p._t.kind === 'fewer' ? Math.max(...g.vals) - v[0] : v[0] + v[1] - v[2]; assert.ok(want > 0 && near(want, p.answer.value), `two-step is ${want}`); },
  gclaim: p => { const g = graph(p), [x, y] = p._t.cats, real = val(g, x) - val(g, y); assert.equal(good(p) === 'True', near(real, p._t.said), `real difference ${real}`); },
  ruler: p => { const r = readRuler(p.visual), q = Math.round(r.inches * r.sub); assert.ok(Math.abs(r.inches * r.sub - q) < 0.5, 'no tie'); assert.ok(q % r.sub !== 0, 'not a whole number of inches'); assert.ok(near(frac(p), q / r.sub), `strip is ${q}/${r.sub}`); },
  plotat: p => { const pl = readPlot(p.visual), q = mixed(ask(p).match(/are (.*?) inch(es)? long/)[1]); assert.equal(p.answer.value, pl.counts[Math.round(q * pl.sub)]); },
  plotcmp: p => { const pl = readPlot(p.visual), m = ask(p).match(/(longer|shorter) than (.*?) inch/), i = Math.round(mixed(m[2]) * pl.sub), want = pl.counts.reduce((s, c, k) => s + (m[1] === 'longer' ? (k > i ? c : 0) : (k < i ? c : 0)), 0); assert.equal(p.answer.value, want); },
  plotdiff: p => { const pl = readPlot(p.visual), used = pl.counts.map((c, i) => (c ? i : -1)).filter(i => i >= 0), d = (used[used.length - 1] - used[0]) / pl.sub; assert.ok(near(frac(p), d), `longest minus shortest is ${d}`); assert.ok(d % 1 !== 0); },
  tiles: p => { const d = at(tags(p.visual, 'path')[0], 'd'); assert.equal(p.answer.value, ((d.match(/v/g) || []).length + 1) * ((d.match(/h/g) || []).length + 1)); },
  lshape: p => { const [pts] = polygons(p.visual), lab = texts(p.visual), W = nums(lab.reduce((a, b) => (b.y > a.y ? b : a)).text)[0], xs = pts.map(q => q[0]), u = (Math.max(...xs) - Math.min(...xs)) / W; assert.ok(near(pointsArea(pts) / (u * u), p.answer.value), `L-shape area ${pointsArea(pts) / (u * u)}`); },
  joined: p => { const lab = texts(p.visual).map(t => +t.text), [w1, w2, h] = lab, r = withClass(p.visual, 'rect', 'on').map(t => +at(t, 'width')); assert.ok(near(r[0] / r[1], w1 / w2)); assert.equal(p.answer.value, h * (w1 + w2)); },
  shapename: p => { const f = shapeFacts(polygons(p.visual)[0]); assert.deepEqual(p.answer.options.filter(o => o === f.name), [good(p)], `shape is a ${f.name}`); },
  odd: p => { const fs = polygons(p.visual).map(shapeFacts), prop = PROPS[p._t.prop], bad = fs.map((f, i) => (prop(f) ? -1 : i)).filter(i => i >= 0); assert.equal(fs.length, 4); assert.deepEqual(bad.map(i => 'ABCD'[i]), [good(p)], `odd shape(s) ${bad}`); },
  pairs: p => assert.equal(p.answer.value, shapeFacts(polygons(p.visual)[0]).pairs), corners: p => assert.equal(p.answer.value, shapeFacts(polygons(p.visual)[0]).rights),
};
