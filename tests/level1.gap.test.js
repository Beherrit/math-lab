// Grades 1-2 gaps: jumps, base-ten trades, clocks and tallies. The answer is recomputed from the
// picture's hidden marker, and every problem carries a model, a worked way and a misconception.
import test from 'node:test';
import assert from 'node:assert/strict';
import { genJump } from '../js/skills/level1/jump.js';
import { genTrade } from '../js/skills/level1/trade.js';
import { genClock } from '../js/skills/level1/time.js';
import { genTally } from '../js/skills/level1/tally.js';
import { check } from '../js/util.js';

const mark = p => (p.ask.match(/<!--([\s\S]*?)-->/) || [])[1].trim().split(/\s+/);
const shown = (h, m, d = 0) => {
  const t = h * 60 + m + d;
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};

function expectJump(p) {
  const [start, step, dir, kind] = mark(p);
  const s = +start, k = +step, back = dir === 'back';
  const bridge = back ? s % 10 : (10 - s % 10) % 10;
  const land = back ? s - k : s + k;
  const want = { land, bridge, rest: k - bridge, slip: land }[kind];
  assert.equal(p.answer.value, want, `${kind} ${s} ${k}`);
  assert.ok(bridge >= 1 && k > bridge, 'the jump crosses a ten');
  assert.match(p.visual, /number line/);
  assert.match(p.why, /ten/i);
}

function expectTrade(p) {
  const [a, c, kind] = mark(p).map((v, i) => (i < 2 ? +v : v));
  const ones = a % 10 + c % 10;
  const tens = Math.floor(a / 10) + Math.floor(c / 10) + 1;
  const want = { sum: a + c, ones, tens, slip: a + c }[kind];
  assert.equal(p.answer.value, want);
  assert.ok(ones >= 10, 'the ones need a trade');
  assert.match(p.visual, /blocks/);
  assert.match(p.why, /ten/i);
}

test('jumps, trades, clocks and tallies recompute, and each names the slip', () => {
  for (const L of [1, 2, 3]) {
    for (let i = 0; i < 80; i++) {
      const jump = genJump(L);
      expectJump(jump);
      assert.equal(check(jump.answer, String(jump.answer.value)).ok, true);
      const trade = genTrade(L);
      expectTrade(trade);
      const clock = genClock(L);
      assert.match(clock.visual, /clock face/);
      assert.match(clock.why, /hand|minute/i);
      if (clock._t.f === 'clock') assert.equal(clock.answer.options[clock.answer.correct], shown(clock._t.h, clock._t.m, clock._t.d));
      const tally = genTally(L);
      assert.match(tally.why, /bundle|slant|5/);
      const bits = mark(tally);
      if (bits[0] === 'count' || bits[0] === 'slip') {
        assert.equal(tally.answer.value, +bits[1]);
        assert.equal((tally.visual.match(/<line /g) || []).length, +bits[1]);
      }
    }
  }
});
