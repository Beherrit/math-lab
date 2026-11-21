// Adding and subtracting by jumping to the next ten. The landing stays hidden on the line.
import { rnd, b, way, num } from '../../util.js';
import { hops } from './pics.js';
import { errorQ } from './forms.js';
import { mark } from './words.js';

const tag = (start, step, back, kind) => mark(start, step, back ? 'back' : 'on', kind);
const nextTen = n => n + ((10 - n % 10) % 10);
const prevTen = n => n - (n % 10);

function model(start, step, back) {
  const ten = back ? prevTen(start) : nextTen(start);
  const bridge = Math.abs(ten - start);
  const rest = step - bridge;
  const land = back ? start - step : start + step;
  const mid = back ? start - bridge : start + bridge;
  return { bridge, rest, land, pts: [start, mid, land] };
}

function forward(lo, hi) {
  const s0 = rnd(lo, hi);
  const start = s0 % 10 === 0 ? s0 + rnd(1, 8) : s0;
  const bridge = 10 - (start % 10);
  const room = 99 - (start + bridge);
  if (room < 1) return forward(lo, hi);
  return [start, bridge + rnd(1, Math.min(8, room))];
}
function backward(lo, hi) {
  const s0 = rnd(lo, hi);
  const start = s0 % 10 === 0 ? s0 + rnd(2, 8) : s0;
  const bridge = start % 10;
  const room = start - bridge;
  if (bridge < 1 || room < 1) return backward(lo, hi);
  return [start, bridge + rnd(1, Math.min(8, room))];
}
function within20(back) {
  if (!back) {
    const start = rnd(4, 9);
    return [start, (10 - start) + rnd(1, 9)];
  }
  const start = rnd(12, 18);
  return [start, (start % 10) + rnd(1, Math.min(6, start % 10 ? start - (start % 10) : 1))];
}

function lineOf(m, hide) {
  return hops(m.pts, hide == null ? { jumps: false } : { hide });
}
function landQ(start, step, back, m) {
  const line = lineOf(m, m.pts.length - 1);
  const ask = back ? 'Jump back. Where do you land?' : 'Jump forward. Where do you land?';
  const expr = back ? `${start} − ${step}` : `${start} + ${step}`;
  return {
    ask: ask + tag(start, step, back, 'land'), expr, visual: line, answer: num(m.land),
    hint: 'Jump to the ten first, then jump only what is left.',
    why: `The first jump of ${m.bridge} lands on the ten. Jumping the whole ${step} again from there counts those ones twice. Only ${m.rest} is left, so the landing is ${m.land}.`,
    _t: back ? { f: 'sub', a: start, b: step } : { f: 'add', xs: [start, step] },
    ways: [
      way('Jump to the ten, then the rest', [line, `From ${start}, the ten is ${m.bridge} away.`, `Then jump the remaining ${m.rest}.`, `You land on ${b(m.land)}.`]),
      way(back ? 'Subtract' : 'Add', [`${expr} = ${b(m.land)}.`]),
    ],
  };
}
function bridgeQ(start, step, back, m) {
  const line = lineOf(m, null);
  return {
    ask: 'The first jump lands on a ten. How big is that jump?' + tag(start, step, back, 'bridge'),
    visual: line, answer: num(m.bridge),
    hint: back ? 'How far back is the ten you just passed?' : 'How far is it from the start up to the next ten?',
    why: `The ten is the friendly stop. Its distance is ${m.bridge}. Using the whole ${step} as the first jump skips past the ten.`,
    _t: { f: 'sub', a: back ? start : start + m.bridge, b: back ? start - m.bridge : start },
    ways: [
      way('Find the ten', [line, back ? `${start} is ${m.bridge} past a ten.` : `The next ten after ${start} is ${start + m.bridge}.`, `The first jump is ${b(m.bridge)}.`]),
      way('Use the ones digit', [`The ones digit is ${start % 10}.`, `The jump to the ten is ${b(m.bridge)}.`]),
    ],
  };
}
function restQ(start, step, back, m) {
  const line = lineOf(m, null);
  return {
    ask: 'After the jump that lands on a ten, how much is left to jump?' + tag(start, step, back, 'rest'),
    visual: line, answer: num(m.rest),
    hint: 'Take the jump that reached the ten away from the whole jump.',
    why: `The whole jump is ${step} and ${m.bridge} of it was used to reach the ten. The rest is ${m.rest}, not another full ${step}.`,
    _t: { f: 'sub', a: step, b: m.bridge },
    ways: [
      way('Take the first jump away', [line, `The whole jump is ${step} and the jump to the ten is ${m.bridge}.`, `${step} − ${m.bridge} = ${b(m.rest)}.`]),
      way('Read the last gap', [`The line shows the ten and then the landing.`, `The last gap is ${b(m.rest)}.`]),
    ],
  };
}
function slipQ(start, step, back, m) {
  const wrong = back ? m.land - m.bridge : m.land + m.bridge;
  const line = lineOf(m, m.pts.length - 1);
  const expr = back ? `${start} − ${step}` : `${start} + ${step}`;
  const p = errorQ({
    a: start, c: step, op: back ? 'sub' : 'add', wrong,
    hint: 'Make the ten first. Do not jump the same ones twice.',
    slip: back
      ? `The jump back to the ten was taken off, and then the whole ${step} was taken off again.`
      : `The jump up to the ten was added, and then the whole ${step} was added again.`,
    ways: [way('Jump once, in two parts', [line, `First jump ${m.bridge}, then ${m.rest}.`, `${expr} = ${b(m.land)}.`])],
  });
  p.visual = line;
  p.ask += tag(start, step, back, 'slip');
  p.why = `Counting the jump to the ten and then the whole ${step} uses ${m.bridge} twice. The landing is ${m.land}, not ${wrong}.`;
  return p;
}

const KINDS = { land: landQ, bridge: bridgeQ, rest: restQ, slip: slipQ };

export function genJump(L) {
  const back = L === 3 || (L === 1 && rnd(0, 1) === 1);
  const [start, step] = L === 1 ? within20(back) : back ? backward(24, 90) : forward(21, 80);
  const m = model(start, step, back);
  if (m.bridge < 1 || m.rest < 1 || m.land < 0) return genJump(L);
  const kind = ['land', 'land', 'bridge', 'rest', 'slip'][rnd(0, 4)];
  return KINDS[kind](start, step, back, m);
}
