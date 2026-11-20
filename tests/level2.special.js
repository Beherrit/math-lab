// Checks for the newer level 2 choice questions: each judges the options with its own rules, never with the generator's.
import assert from 'node:assert/strict';
import { plain, nums, mixed } from './level2.parse.js';
import { CALC_NEW, HAS, SIDES, RELS } from './level2.calc.js';
import { ITEMS, UNIT_NAME, FACTOR } from '../js/skills/level2/massitems.js';

const opts = p => p.answer.options.map(plain), good = p => plain(p.answer.options[p.answer.correct]);
const only = (hits, p, where, why) => assert.deepEqual(hits, [good(p)], `${where}: exactly the marked option must ${why}; options ${opts(p).join(' | ')}`);
const round = (n, q) => Math.round(n / q) * q;
const exactOf = t => ({ muladd: t.g * t.n + t.e, mulsub: t.pay - t.g * t.n, subdiv: (t.t - t.e) / t.d, addmul: (t.a + t.b) * t.g, adddiv: (t.a + t.b) / t.d, divadd: t.t / t.d + t.e, divsub: t.t / t.d - t.e, addsub: t.a + t.b - t.c })[t.type];
const eq = s => { const m = plain(s).match(/(\d+)\s*[×]\s*(\d+)\s*=\s*(\d+)/); return m && { a: +m[1], b: +m[2], c: +m[3] }; };
const item = name => { const it = ITEMS.find(i => i[0] === name); assert.ok(it, `unknown item ${name}`); return it; };
const unitKey = name => Object.keys(UNIT_NAME).find(k => UNIT_NAME[k] === name);
const divides = (k, xs) => xs.every(x => x % k === 0);

export const SPECIAL_TEXT = {
  reason: (p, w) => { const t = p._t, est = t.op === 'add' ? round(t.a, t.p) + round(t.b, t.p) : round(t.a, t.p) - round(t.b, t.p), exact = t.op === 'add' ? t.a + t.b : t.a - t.b;
    only(opts(p).filter(o => Math.abs(+o.replace(/,/g, '') - est) <= 2 * t.p), p, w, `be within ${2 * t.p} of the estimate ${est}`); assert.equal(+good(p).replace(/,/g, ''), exact, `${w}: the reasonable answer is the exact one`); },
  reasonable: (p, w) => { const exact = exactOf(p._t), vals = opts(p).map(o => +o.replace(/,/g, ''));
    assert.equal(vals[p.answer.correct], exact, `${w}: marked answer is not ${exact}`); vals.forEach((v, i) => i !== p.answer.correct && assert.ok(Math.abs(v - exact) / exact >= 0.4, `${w}: ${v} is too close to ${exact}`)); },
  sqchoice: (p, w) => only(opts(p).filter(o => Number.isInteger(Math.sqrt(+o))), p, w, 'be a square number'),
  multof: (p, w) => only(opts(p).filter(o => +o % p._t.k === 0), p, w, `be in the ${p._t.k}s table`),
  alwayseven: (p, w) => { const evenAll = k => Array.from({ length: 12 }, (_, i) => k * (i + 1)).every(v => v % 2 === 0), ks = opts(p).map(o => nums(o)[0]);
    assert.deepEqual(ks.slice().sort((a, b) => a - b), p._t.ks.slice().sort((a, b) => a - b), `${w}: ks`); only(opts(p).filter(o => evenAll(nums(o)[0])), p, w, 'always give an even product'); },
  prule: (p, w) => { const par = { even: [2, 4, 6, 8], odd: [1, 3, 5, 7, 9] }, t = p._t, prods = new Set(par[t.x].flatMap(a => par[t.y].map(b => (a * b) % 2 ? 'odd' : 'even'))); assert.equal(prods.size, 1, `${w}: one answer only`);
    assert.equal(good(p) === 'True', [...prods][0] === t.says, `${w}: True or False is wrong`); },
  nodiv0: (p, w) => only(opts(p).filter(o => nums(o)[1] === 0 && o.includes('÷')), p, w, 'divide by 0'),
  helps: (p, w) => { const { t, d } = p._t; only(opts(p).filter(o => { const e = eq(o); return e && e.a * e.b === e.c && e.c === t && (e.a === d || e.b === d); }), p, w, `use ${t} and ${d}`); opts(p).forEach(o => assert.equal(eq(o).a * eq(o).b, eq(o).c, `${w}: ${o} must be a true fact`)); },
  eqchoice: (p, w) => { const t = p._t; only(opts(p).filter(o => { const [n, d] = o.split('/').map(Number); return n * t.d === t.n * d; }), p, w, `equal ${t.n}/${t.d}`); },
  eqodd: (p, w) => { const t = p._t, notEq = opts(p).filter(o => { const [n, d] = o.split('/').map(Number); return n * t.d !== t.n * d; }); assert.deepEqual(notEq, [good(p)], `${w}: exactly one option must not equal ${t.n}/${t.d}`); },
  unit: (p, w) => { const [, u, lo, hi] = item(p._t.item), n = p._t.n; assert.equal(good(p), UNIT_NAME[u]); assert.ok(n >= lo && n <= hi, `${w}: ${n} outside ${lo}-${hi}`); assert.equal(new Set(opts(p).map(o => unitKey(o))).size, 2); },
  bestest: (p, w) => { const [, u, lo, hi] = item(p._t.item), F = FACTOR[u], inRange = o => { const [n, unit] = o.replace(/,/g, '').split(' '), v = +n * FACTOR[unit]; return v >= 0.5 * lo * F && v <= 2 * hi * F; };
    only(opts(p).filter(inRange), p, w, 'be a sensible amount'); },
  unitsense: (p, w) => { const [, u, lo, hi] = item(p._t.item), t = p._t, real = t.unit === u && t.n >= lo && t.n <= hi; assert.equal(good(p) === 'True', real, `${w}: sentence is ${real}`); },
  gscale: (p, w) => { const vals = p._t.vals, best = Math.max(...opts(p).map(Number).filter(k => divides(k, vals))); assert.equal(+good(p), best, `${w}: the biggest scale that fits is ${best}`); assert.ok(divides(+good(p), vals)); },
  longest: (p, w) => { const v = opts(p).map(o => mixed(o.replace(/ inch(es)?$/, ''))), top = Math.max(...v); assert.equal(v.filter(x => x === top).length, 1); assert.equal(v[p.answer.correct], top, `${w}: not the longest`); },
  plotbuild: (p, w) => { const m = plain(p.ask).match(/inches: (.*)\. How many circles go above the (.*) inch mark/), list = m[1].split(', ').map(mixed), q = mixed(m[2]);
    assert.equal(p.answer.value, list.filter(x => x === q).length, `${w}: count of ${q}`); },
  qmarks: (p, w) => { const m = plain(p.ask).match(/A strip is (.*?) (inch|inches) long/), sub = { half: 2, quarter: 4 }[p._t.sub]; assert.equal(p.answer.value, mixed(m[1]) * sub, `${w}: marks`); },
  rectpick: (p, w) => { const { fixed, most, key } = p._t, rs = opts(p).map(o => nums(o)), area = ([a, b]) => a * b, per = ([a, b]) => 2 * (a + b);
    rs.forEach(r => assert.equal(fixed === 'perim' ? per(r) : area(r), key, `${w}: every rectangle must share the ${fixed}`)); const score = fixed === 'perim' ? area : per, vals = rs.map(score), pick = most ? Math.max(...vals) : Math.min(...vals);
    assert.equal(new Set(vals).size, vals.length); assert.equal(vals[p.answer.correct], pick, `${w}: wrong pick`); },
  describe: (p, w) => { const need = p._t.need, fits = k => Object.entries(need).every(([key, v]) => HAS[k][['sides', 'corners', 'parallel'].indexOf(key)] === v); only(opts(p).filter(fits), p, w, 'fit the description'); },
  family: (p, w) => { const { sub, sup } = p._t, real = sub === sup || RELS[sub].includes(sup); assert.equal(good(p) === 'True', real, `${w}: every ${sub} is a ${sup} is ${real}`); assert.ok(plain(p.expr).includes(sub) && plain(p.expr).includes(sup)); },
  notquad: (p, w) => only(opts(p).filter(o => SIDES[o] !== 4), p, w, 'not have four sides'),
};
void CALC_NEW;
