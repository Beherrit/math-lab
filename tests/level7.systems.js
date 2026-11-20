// Independent recomputation for the system stories: the two lines are read from what the question says, and solved again.
import assert from 'node:assert/strict';
import { text, ans } from './level7.text.js';
import { eqText, onlyLine } from './level7.eq.js';
import { mustShow } from './level7.lines.js';
import { noSvg } from './level7.svg.js';

const near = (x, y, msg) => assert.ok(Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y)), `${msg || ''} got ${x}, expected ${y}`);
const pairOf = o => text(o).split(/ (?=y = )/).map(eqText);
const reading = o => { const m = /^After (\d+) [a-z]+ .*?(\d+)/.exec(o); return m ? [Number(m[1]), Number(m[2])] : null; };
const COUNT = (m1, c1, m2, c2) => (m1 !== m2 ? 'Exactly once' : c1 === c2 ? 'Always' : 'Never');
// Equal at some time that is not before the story starts?
const MEET = (m1, c1, m2, c2) => (m1 === m2 ? (c1 === c2 ? 'Yes, at every time' : 'No, never') : (c2 - c1) / (m1 - m2) > 0 ? 'Yes, at one time' : 'No, never');

export const SYSTEMS = {
  sysstory(t, p) {
    if (t.shape === 'sum-diff') { mustShow(p, [t.S, t.D]); return near(ans(p), (t.S + t.D) / 2); }
    const [[m1, c1], [m2, c2]] = [t.e1, t.e2], x = (c2 - c1) / (m1 - m2), y = m1 * x + c1, opts = p.answer?.options?.map(text) || [];
    if (t.shape !== 'inspect') mustShow(p, [m1, c1, m2, c2]);
    switch (t.shape) {
      case 'write-eq': { const [m, c] = [[m1, c1], [m2, c2]][t.i]; return assert.equal(p.answer.correct, onlyLine(opts, m, c)); }
      case 'meaning': { const hits = opts.map(reading).map((r, i) => (r && r[0] === x && r[1] === y ? i : -1)).filter(i => i >= 0); assert.deepEqual(hits, [p.answer.correct]); return assert.ok(text(p.ask).includes(`(${x}, ${y})`)); }
      case 'read-table': {
        const cells = noSvg(p.visual).match(/<td>[^<]*<\/td>/g).map(c => Number(text(c))), rows = Array.from({ length: cells.length / 3 }, (_, i) => cells.slice(3 * i, 3 * i + 3));
        for (const r of rows) { near(r[1], m1 * r[0] + c1); near(r[2], m2 * r[0] + c2); }
        const same = rows.filter(r => r[1] === r[2]); assert.equal(same.length, 1); return near(ans(p), same[0][0]);
      }
      case 'which-at': case 'plan-choice': {
        const v = [m1 * t.z + c1, m2 * t.z + c2]; assert.notEqual(v[0], v[1]);
        if (t.shape === 'plan-choice') assert.ok(t.z > x, 'a plan choice beyond the crossing');
        return assert.equal(ans(p), t.names[(v[0] < v[1]) === (t.better === 'less') ? 0 : 1]);
      }
      case 'write-pair': { const right = opts.map(pairOf).filter(([a, b]) => a[0] === m1 && a[1] === c1 && b[0] === m2 && b[1] === c2); assert.equal(right.length, 1); return assert.deepEqual(pairOf(p.answer.options[p.answer.correct]), [[m1, c1], [m2, c2]]); }
      case 'inspect': return assert.equal(ans(p), COUNT(m1, c1, m2, c2));
      case 'inspect-words': return assert.equal(ans(p), MEET(m1, c1, m2, c2));
      case 'solve-x': case 'story-solve': return near(ans(p), t.ask === 'x' ? x : y);
      case 'solve-y': return near(ans(p), y);
      case 'gap-after': { assert.ok(t.z > x); return near(ans(p), Math.abs((m1 * t.z + c1) - (m2 * t.z + c2))); }
      default: assert.fail(`unknown sysstory shape ${t.shape}`);
    }
  },
};
