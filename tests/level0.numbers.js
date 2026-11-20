// Recomputation for the number skills: counting, recognition, number line, chart, comparing, ordering, adding, taking away, pairs.
import assert from 'node:assert/strict';
import { strip, attr, countOf, texts } from './level0.svg.js';

export const opts = p => p.answer.options;
export const right = p => opts(p)[p.answer.correct];
export const rightNum = p => (p.answer.kind === 'num' ? p.answer.value : Number(strip(right(p))));
const nums = s => (strip(s).match(/\d+/g) || []).map(Number);
const only = (p, pred, where, why) => assert.deepEqual(opts(p).filter(pred), [right(p)], `${where}: exactly the marked option must ${why}`);
const vals = p => opts(p).map(o => (attr(o, 'count') !== undefined ? Number(attr(o, 'count')) : Number(strip(o))));

const count = (p, where) => {
  const n = rightNum(p);
  assert.equal(countOf(p.visual, 'item', 'a'), n, `${where}: drew ${countOf(p.visual, 'item', 'a')} items, answer is ${n}`);
  assert.equal(Number(attr(p.visual, 'count')), n, `${where}: data-count`);
  if (p._t.q === 'mixed') assert.ok(countOf(p.visual, 'other') > 0, `${where}: mixed picture needs other shapes`);
};
const tenmore = (p, where) => {
  assert.equal(countOf(p.visual, 'item', 'a'), 10, `${where}: full frame`);
  assert.equal(countOf(p.visual, 'item', 'b'), rightNum(p), `${where}: extras vs answer`);
};
const tenplus = (p, where) => assert.equal(rightNum(p), 10 + nums(p.ask)[0], `${where}: ten plus ${nums(p.ask)[0]}`);
const findgroup = (p, where) => {
  const n = nums(p.ask)[0];
  for (const o of opts(p)) assert.equal(countOf(o, 'item'), Number(attr(o, 'count')), `${where}: option drawn count`);
  only(p, o => countOf(o, 'item') === n, where, `show ${n} dots`);
};
const numfind = (p, where) => {
  const n = nums(p.ask)[0];
  assert.equal(rightNum(p), n, `${where}: answer vs asked ${n}`);
  only(p, o => strip(o) === String(n), where, `be ${n}`);
};
const numshown = (p, where) => assert.equal(rightNum(p), Number(attr(p.visual, 'number')), `${where}: shown number`);
const hasdigit = (p, where) => {
  const d = String(nums(p.ask)[0]);
  only(p, o => strip(o).includes(d), where, `contain the digit ${d}`);
};

// ---- number line and chart: the answer is the hole, read from the picture ----
function line(p, where) {
  const ts = texts(p.visual), hole = ts.find(t => t.hidden), known = ts.filter(t => !t.hidden);
  assert.ok(hole && known.length >= 1, `${where}: line needs a hole and a labelled tick`);
  const base = Number(known[0].v) - Number(known[0].i);
  for (const t of known) assert.equal(Number(t.v) - Number(t.i), base, `${where}: ticks not consecutive`);
  assert.equal(rightNum(p), base + Number(hole.i), `${where}: answer vs the hole`);
  const ref = nums(p.ask)[0], ask = strip(p.ask);
  if (/after/.test(ask)) assert.equal(rightNum(p), ref + 1, `${where}: after ${ref}`);
  if (/before/.test(ask)) assert.equal(rightNum(p), ref - 1, `${where}: before ${ref}`);
}
function chart(p, where) {
  const cells = texts(p.visual);
  assert.ok(cells.length % 10 === 0, `${where}: chart rows`);
  let hole = 0;
  cells.forEach((c, i) => { if (c.hidden) hole = i + 1; else assert.equal(Number(c.text), i + 1, `${where}: cell ${i + 1} reads ${c.text}`); });
  assert.equal(rightNum(p), hole, `${where}: answer vs the hole`);
  const ask = strip(p.ask), list = nums(p.ask);
  if (/by tens/.test(ask)) {
    const step = /back/.test(ask) ? -10 : 10;
    list.forEach((v, i) => i && assert.equal(v - list[i - 1], step, `${where}: tens run`));
    assert.equal(rightNum(p), list[list.length - 1] + step, `${where}: next ten`);
  } else if (/after/.test(ask)) assert.equal(rightNum(p), list[0] + 1);
  else if (/before/.test(ask)) assert.equal(rightNum(p), list[0] - 1);
}

// ---- comparing and ordering ----
const more = (p, where) => {
  const v = vals(p), want = p._t.dir === 'min' ? Math.min(...v) : Math.max(...v), ask = strip(p.ask);
  assert.ok(/fewer|fewest|less/.test(ask) === (p._t.dir === 'min'), `${where}: question wording vs direction`);
  assert.equal(v.filter(x => x === want).length, 1, `${where}: ${want} must be the only ${p._t.dir}`);
  assert.equal(v[p.answer.correct], want, `${where}: marked option is not the ${p._t.dir}`);
};
const same = (p, where) => {
  const n = Number(attr(p.visual, 'count'));
  assert.equal(countOf(p.visual, 'item'), n);
  only(p, o => countOf(o, 'item') === n, where, 'have the same number of dots');
};
const than = (p, where) => {
  const thr = nums(p.ask)[0], gt = /more than/.test(strip(p.ask));
  only(p, o => (gt ? Number(strip(o)) > thr : Number(strip(o)) < thr), where, `be ${gt ? 'more' : 'less'} than ${thr}`);
};
const extreme = (p, where) => {
  const v = vals(p), ask = strip(p.ask), want = /smallest/.test(ask) ? Math.min(...v) : Math.max(...v);
  assert.ok(/smallest|biggest/.test(ask));
  assert.equal(v[p.answer.correct], want, `${where}: ${ask}`);
};
const gap = (p, where) => {
  const [a, c] = strip(p.expr).split(',').filter(x => x.trim() !== '?').map(Number);
  assert.ok(strip(p.expr).includes('?') && a < c, `${where}: gap sequence`);
  only(p, o => Number(strip(o)) > a && Number(strip(o)) < c, where, `fit between ${a} and ${c}`);
};
const sortedrow = (p, where) => only(p, o => { const x = nums(o); return x.every((v, i) => !i || v > x[i - 1]); }, where, 'be in order');
const middle = (p, where) => assert.equal(vals(p)[p.answer.correct], vals(p).slice().sort((a, b) => a - b)[1], `${where}: middle`);

// ---- adding, taking away, pairs ----
function add(p, where) {
  const a = countOf(p.visual, 'item', 'a'), b = countOf(p.visual, 'item', 'b');
  if (p.visual) assert.equal(rightNum(p), a + b, `${where}: ${a} + ${b}`);
  if (p.expr) { const [x, y] = nums(p.expr); assert.equal(rightNum(p), x + y, `${where}: expr`); if (p.visual) assert.deepEqual([x, y], [a, b], `${where}: expr vs picture`); }
}
function addwhich(p, where) {
  const a = countOf(p.visual, 'item', 'a'), b = countOf(p.visual, 'item', 'b');
  only(p, o => { const [x, y] = nums(o); return x === a && y === b; }, where, `say ${a} + ${b}`);
}
const addswap = (p, where) => { const [a, b, c] = nums(p.expr); assert.equal(rightNum(p), a, `${where}: swap`); assert.equal(b, c, `${where}: swap`); };
function sub(p, where) {
  const left = countOf(p.visual, 'item', 'a'), x = countOf(p.visual, 'item', 'x');
  if (p.visual) assert.equal(rightNum(p), left, `${where}: counters left`);
  if (p.expr) { const [t, k] = nums(p.expr); assert.equal(rightNum(p), t - k, `${where}: expr`); if (p.visual) assert.deepEqual([t, k], [left + x, x], `${where}: expr vs picture`); }
  else if (p.visual) assert.equal(nums(p.ask)[0], left + x, `${where}: total in the words`);
  if (p.visual && !p.expr) assert.equal(nums(p.ask)[1], x, `${where}: take away in the words`);
}
const subwhich = (p, where) => {
  const left = countOf(p.visual, 'item', 'a'), x = countOf(p.visual, 'item', 'x');
  only(p, o => { const [t, k] = nums(o); return t === left + x && k === x; }, where, 'match the counters');
};
const subtake = (p, where) => { const [t, l] = nums(p.expr); assert.equal(rightNum(p), t - l, `${where}: taken away`); };
function pairs(p, where) {
  if (p.visual) {
    const T = countOf(p.visual, 'cell'), a = countOf(p.visual, 'item', 'a');
    assert.equal(rightNum(p), T - a, `${where}: frame ${a} of ${T}`);
    if (p.expr) assert.deepEqual(nums(p.expr), [a, T], `${where}: expr vs frame`);
  } else { const [a, T] = nums(p.expr); assert.equal(rightNum(p), T - a, `${where}: ${a} + ? = ${T}`); }
}
const pairpick = (p, where) => { const T = nums(p.ask)[0]; only(p, o => { const [x, y] = nums(o); return x + y === T; }, where, `make ${T}`); };

export const NUMBER_CHECKS = { count, findgroup, tenmore, tenplus, numfind, numshown, numdots: count, hasdigit, line, chart, more, same, than, extreme, gap, sortedrow, middle, add, addwhich, addswap, sub, subwhich, subtake, pairs, pairpick };
