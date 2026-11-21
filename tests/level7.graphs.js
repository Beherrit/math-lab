// Independent recomputation for graph questions: the path is read back out of the drawn picture, then the answer is worked out again.
import assert from 'node:assert/strict';
import { text, ans } from './level7.text.js';
import { decode, close } from './level7.svg.js';

const near = (x, y, msg) => assert.ok(Math.abs(x - y) <= 1e-6 * Math.max(1, Math.abs(y)) + 0.02, `${msg || ''} got ${x}, expected ${y}`);
const trends = pts => pts.slice(1).map((q, i) => (close(q[1], pts[i][1], 0.02) ? 'flat' : q[1] > pts[i][1] ? 'up' : 'down'));
const slopes = pts => pts.slice(1).map((q, i) => (q[1] - pts[i][1]) / (q[0] - pts[i][0]));
const valueAt = (pts, x) => { const i = pts.findIndex((q, j) => j && q[0] >= x - 1e-9); const [a, b] = [pts[i - 1], pts[i]]; return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]); };
const NAMES = { up: 'Going up', flat: 'Staying level', down: 'Going down' };
// The words each story uses for going up, staying level and going down.
const WORDS = { up: /rides away|is filled|gets new money|climbs/, flat: /rests|left alone|untouched|hovers/, down: /rides back|emptied|loses money|descends/ };
const storyTrends = s => s.replace(/^The \w+ /, '').replace(/\.$/, '').split(', then ').map(seg => Object.keys(WORDS).filter(k => WORDS[k].test(seg)).join('+'));
const partOf = (pic, label) => { const d = pic.dots.find(q => q.label === label); return pic.path[0].findIndex((q, i, a) => i < a.length - 1 && d.at[0] >= q[0] - 1e-6 && d.at[0] <= a[i + 1][0] + 1e-6); };
const CURVE = { 'It goes up faster and faster': [1, 1], 'It goes up more and more slowly': [1, -1], 'It goes down faster and faster': [-1, 1], 'It goes down more and more slowly': [-1, -1] };

export const GRAPHS = {
  gstory(t, p) {
    const pic = decode(p.visual), pts = pic.path[0], tr = trends(pts), sl = slopes(pts);
    assert.equal(pic.path.length, 1, 'one path is drawn'); assert.ok(pts.every(q => q[1] >= -0.01 && q[1] <= 10.01), 'the path leaves the grid');
    const a = ans(p);
    switch (t.shape) {
      case 'which-part': { const hits = tr.map((k, i) => (k === t.want ? i : -1)).filter(i => i >= 0); assert.equal(hits.length, 1); return assert.equal(a, `Part ${'ABC'[hits[0]]}`); }
      case 'part-trend': { assert.equal(partOf(pic, 'ABC'[t.part]), t.part, 'label is on its part'); return assert.equal(a, NAMES[tr[t.part]]); }
      case 'steepest': { const m = sl.map(Math.abs), top = Math.max(...m); assert.equal(m.filter(v => close(v, top, 0.25)).length, 1); return assert.equal(a, `Part ${'ABC'[m.indexOf(top)]}`); }
      case 'story-pick': case 'story-pick-long': {
        assert.equal(tr.length, t.n); assert.deepEqual(storyTrends(a), tr, 'the chosen story does not match the drawn path');
        for (const o of p.answer.options.map(text).filter(o => o !== a)) assert.notDeepEqual(storyTrends(o), tr, `a second story matches: ${o}`);
        return;
      }
      case 'linear-curved': case 'steady-rate': {
        const straight = sl.every(v => close(v, sl[0], 0.02)), want = t.shape === 'steady-rate' ? (straight ? 'Yes' : 'No') : straight ? 'A straight line' : 'A curve';
        return assert.equal(a, want);
      }
      case 'curve-kind': {
        const dir = Math.sign(pts[10][1] - pts[0][1]), first = Math.abs(sl[0]), last = Math.abs(sl[sl.length - 1]);
        return assert.deepEqual(CURVE[a], [dir, last > first ? 1 : -1]);
      }
      case 'read-flat': { const i = tr.indexOf('flat'); return near(a, pts[i + 1][0] - pts[i][0]); }
      case 'read-top': return near(a, Math.max(...pts.map(q => q[1])));
      case 'read-peak': return near(a, pts.reduce((best, q) => (q[1] > best[1] ? q : best))[0]);
      case 'read-change': { const [, x1, x2] = /between x = (\d+) and x = (\d+)/.exec(text(p.ask)); return near(a, Math.abs(valueAt(pts, Number(x2)) - valueAt(pts, Number(x1)))); }
      case 'read-value': return near(a, valueAt(pts, t.x));
      default: assert.fail(`unknown gstory shape ${t.shape}`);
    }
  },
};
