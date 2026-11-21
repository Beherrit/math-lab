// Recomputation for shapes, solids, size, position, patterns, sorting and colors, read from the drawn pictures.
import assert from 'node:assert/strict';
import { strip, attr, attrAll, countOf, fillOf, rowKeys, sceneShapes, corners, measure } from './level0.svg.js';
import { HEX, lstar, SHAPE_NAMES, CORNERS, SOLID_KIND, ROLLS, STACKS } from './level0.facts.js';
import { opts, right, rightNum } from './level0.numbers.js';

const only = (p, pred, where, why) => assert.deepEqual(opts(p).filter(pred), [right(p)], `${where}: exactly the marked option must ${why}`);
const nameIn = (s, list) => list.find(n => new RegExp(`\\b${n}\\b`).test(strip(s)));
const SOLIDS = ['sphere', 'cube', 'cylinder', 'cone'];

// A flat tile must really be the shape it says: its drawn corners match what that shape has.
const realShape = (o, where) => { const n = attr(o, 'shape'); assert.equal(corners(o), CORNERS[n], `${where}: ${n} drawn with ${corners(o)} corners`); };
function shapefind(p, where) {
  const name = nameIn(p.ask, SHAPE_NAMES);
  opts(p).forEach(o => realShape(o, where));
  only(p, o => attr(o, 'shape') === name, where, `be the ${name}`);
}
function shapename(p, where) {
  realShape(p.visual, where);
  assert.equal(strip(right(p)), attr(p.visual, 'shape'), `${where}: named shape`);
}
function shapeodd(p, where) {
  const names = opts(p).map(o => attr(o, 'shape')), uniq = names.filter(n => names.filter(m => m === n).length === 1);
  opts(p).forEach(o => realShape(o, where));
  assert.equal(uniq.length, 1, `${where}: exactly one odd shape, got ${names}`);
  assert.equal(names[p.answer.correct], uniq[0]);
}
function shapecount(p, where) {
  realShape(p.visual, where);
  const what = /sides/.test(strip(p.ask)) ? 'sides' : 'corners', n = corners(p.visual);
  if (what === 'sides') assert.ok(n >= 3, `${where}: round shapes have no sides to count`);
  assert.equal(rightNum(p), n, `${where}: ${what}`);
}
const solidfind = (p, where) => only(p, o => attr(o, 'shape') === nameIn(p.ask, SOLIDS), where, 'be the named solid');
const solidname = (p, where) => assert.equal(strip(right(p)), attr(p.visual, 'shape'), `${where}: solid name`);
function solidrolls(p, where) {
  const s = opts(p).map(o => attr(o, 'shape'));
  assert.ok(!s.includes('cone'), `${where}: a cone is not asked about rolling`);
  only(p, o => ROLLS.includes(attr(o, 'shape')), where, 'roll');
}
function solidstacks(p, where) { only(p, o => STACKS.includes(attr(o, 'shape')), where, 'stack'); }
function flatsolid(p, where) {
  const kind = SOLID_KIND[attr(p.visual, 'shape')];
  assert.equal(attr(p.visual, 'kind'), kind, `${where}: drawn kind`);
  assert.equal(strip(right(p)), kind, `${where}: flat or solid`);
}

// ---- size and position ----
function size(p, where) {
  const m = opts(p).map(o => { const v = measure(o); assert.equal(v, Number(attr(o, 'size')), `${where}: data-size vs drawing`); return v; });
  assert.equal(new Set(m).size, m.length, `${where}: sizes must differ`);
  const ask = strip(p.ask), sorted = m.slice().sort((a, b) => a - b);
  const want = /middle/.test(ask) ? sorted[1] : /bigg|long|tall|bigger/.test(ask) ? sorted[sorted.length - 1] : sorted[0];
  if (!/middle/.test(ask)) assert.ok(/bigg|long|tall|small|short/.test(ask), `${where}: size word`);
  assert.equal(m[p.answer.correct], want, `${where}: ${ask}`);
}
function where(p, w) {
  const sc = sceneShapes(p.visual), ask = strip(p.ask), named = [...ask.matchAll(/\b(circle|square|triangle|hexagon|rectangle)\b/g)].map(m => m[1]);
  const at = n => sc.find(s => s.shape === n), ans = attr(right(p), 'shape'), a = at(ans);
  assert.ok(a, `${w}: the answer is not in the picture`);
  if (/above/.test(ask)) assert.ok(a.y < at(named[0]).y, `${w}: above`);
  else if (/below/.test(ask)) assert.ok(a.y > at(named[0]).y, `${w}: below`);
  else if (/left of/.test(ask)) assert.ok(a.x < at(named[0]).x, `${w}: left`);
  else if (/right of/.test(ask)) assert.ok(a.x > at(named[0]).x, `${w}: right`);
  else if (/in front/.test(ask)) assert.equal(a.order, Math.max(...sc.map(s => s.order)), `${w}: front is drawn last`);
  else if (/behind/.test(ask)) assert.equal(a.order, 0, `${w}: behind is drawn first`);
  else if (/between/.test(ask)) assert.ok(a.x > Math.min(at(named[0]).x, at(named[1]).x) && a.x < Math.max(at(named[0]).x, at(named[1]).x), `${w}: between`);
  else if (/next to/.test(ask)) { const r = at(named[0]), xs = sc.map(s => s.x).sort((x, y) => x - y); assert.ok(xs[0] === r.x || xs[2] === r.x, `${w}: ref must be at an end`); assert.equal(Math.abs(xs.indexOf(a.x) - xs.indexOf(r.x)), 1, `${w}: next to`); }
  else if (/first/.test(ask)) assert.equal(a.x, Math.min(...sc.map(s => s.x)), `${w}: first`);
  else if (/last/.test(ask)) assert.equal(a.x, Math.max(...sc.map(s => s.x)), `${w}: last`);
  else assert.fail(`${w}: unknown position word in "${ask}"`);
  assert.equal(opts(p).filter(o => attr(o, 'shape') === ans).length, 1, `${w}: one option with the answer shape`);
}

// ---- patterns and sorting ----
const period = ks => { for (let n = 1; n < ks.length; n++) if (ks.every((k, i) => k === ks[i % n])) return n; return ks.length; };
function mapping(unit, keys, where) {
  const m = {};
  [...unit].forEach((l, i) => { m[l] = m[l] ?? keys[i]; assert.equal(m[l], keys[i], `${where}: first repeat inconsistent`); });
  assert.equal(new Set(Object.values(m)).size, Object.keys(m).length, `${where}: different letters share a key`);
  return m;
}
function pattern(p, where) {
  const keys = rowKeys(p.visual), unit = p._t.unit, len = unit.length, kind = p._t.kind;
  if (kind === 'unit') return assert.equal(rightNum(p), period(keys), `${where}: repeat length of ${keys}`);
  const m = mapping(unit, keys.slice(0, len), where), expect = i => m[unit[i % len]];
  if (kind === 'mistake') {
    const bad = keys.map((k, i) => (k !== expect(i) ? i + 1 : 0)).filter(Boolean);
    assert.deepEqual(bad, [rightNum(p)], `${where}: the single mistake`);
    return;
  }
  const hole = keys.indexOf('HOLE');
  assert.ok(hole >= len && keys.filter(k => k === 'HOLE').length === 1, `${where}: one hole after the first repeat`);
  keys.forEach((k, i) => i !== hole && assert.equal(k, expect(i), `${where}: row breaks the pattern at ${i}`));
  if (kind === 'next') assert.equal(hole, keys.length - 1, `${where}: next means the last place`);
  only(p, o => attr(o, 'key') === expect(hole), where, 'fit the pattern');
}
function sortodd(p, where) {
  const ks = opts(p).map(o => attr(o, 'key')), uniq = ks.filter(k => ks.filter(x => x === k).length === 1);
  assert.equal(uniq.length, 1, `${where}: one odd one in ${ks}`);
  assert.equal(ks[p.answer.correct], uniq[0], `${where}: marked is not the odd one`);
}
function sortgroup(p, where) {
  const key = attr(p.visual, 'key');
  for (const o of opts(p)) assert.equal(new Set(attrAll(o, 'key')).size, 1, `${where}: a group holds one kind`);
  only(p, o => attr(o, 'key') === key, where, `hold ${key}`);
}
function sortcount(p, where) {
  const key = p._t.key, all = attrAll(p.visual, 'key'), n = all.filter(k => k === key).length;
  assert.equal(rightNum(p), p._t.neg ? all.length - n : n, `${where}: count of ${key}`);
  const word = key.split(':')[1];
  assert.ok(strip(p.ask).includes(word === 'large' ? 'big' : word.replace(/s$/, '')), `${where}: the question names ${word}`);
  assert.ok(/not/.test(strip(p.ask)) === !!p._t.neg);
}

// ---- colors ----
const apart = (names, where) => {
  const u = [...new Set(names)];
  for (let i = 0; i < u.length; i++) for (let j = i + 1; j < u.length; j++) assert.ok(Math.abs(lstar(HEX[u[i]]) - lstar(HEX[u[j]])) >= 14, `${where}: ${u[i]} and ${u[j]} are too close in lightness`);
};
function isColor(o, name, where) {
  assert.equal(attr(o, 'color'), name, `${where}: data-color`);
  assert.equal(fillOf(o).toLowerCase(), HEX[name].toLowerCase(), `${where}: fill is not ${name}`);
}
function colorfind(p, where) {
  const c = nameIn(p.ask, Object.keys(HEX));
  opts(p).forEach(o => assert.equal(fillOf(o).toLowerCase(), HEX[attr(o, 'color')].toLowerCase(), `${where}: tile fill`));
  isColor(right(p), c, where);
  only(p, o => fillOf(o).toLowerCase() === HEX[c].toLowerCase(), where, `be ${c}`);
  apart(opts(p).map(o => attr(o, 'color')), where);
}
function colorname(p, where) {
  const c = attr(p.visual, 'color');
  isColor(p.visual, c, where);
  assert.equal(strip(right(p)), c, `${where}: name`);
  apart([c, ...opts(p).map(strip)], where);
}
function colorsame(p, where) {
  const c = attr(p.visual, 'color');
  opts(p).forEach(o => assert.equal(fillOf(o).toLowerCase(), HEX[attr(o, 'color')].toLowerCase()));
  only(p, o => fillOf(o).toLowerCase() === HEX[c].toLowerCase(), where, 'have the same color');
  apart(opts(p).map(o => attr(o, 'color')), where);
}
function colorshape(p, where) {
  const c = nameIn(p.ask, Object.keys(HEX)), s = nameIn(p.ask, SHAPE_NAMES);
  opts(p).forEach(o => assert.equal(fillOf(o).toLowerCase(), HEX[attr(o, 'color')].toLowerCase()));
  isColor(right(p), c, where);
  only(p, o => attr(o, 'color') === c && attr(o, 'shape') === s, where, `be the ${c} ${s}`);
  apart(opts(p).map(o => attr(o, 'color')), where);
}
function colortone(p, where) {
  const ls = opts(p).map(o => lstar(fillOf(o))), dark = /dark/.test(strip(p.ask)), want = dark ? Math.min(...ls) : Math.max(...ls);
  assert.ok(new Set(opts(p).map(o => attr(o, 'color'))).size === 1, `${where}: one hue`);
  assert.equal(ls.filter(l => l === want).length, 1);
  assert.ok(new Set(ls.map(l => Math.round(l / 18))).size === ls.length, `${where}: tones at least about 18 apart`);
  assert.equal(ls[p.answer.correct], want, `${where}: ${strip(p.ask)}`);
}
const colortonename = (p, where) => assert.equal(strip(right(p)), lstar(fillOf(p.visual)) > 60 ? 'light' : 'dark', `${where}: light or dark`);

export const SHAPE_CHECKS = { shapefind, shapename, shapeodd, shapecount, solidfind, solidname, solidrolls, solidstacks, flatsolid, size, where, pattern, sortodd, sortgroup, sortcount,
  colorfind, colorname, colorsame, colorshape, colortone, colortonename };
void countOf;
