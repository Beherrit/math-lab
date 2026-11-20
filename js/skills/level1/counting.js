// Counting on and back to 1000: what comes before, after and between, counting by 1s, 10s and 100s, and missing numbers on a line.
import { rnd, pick, shuffle, b, way, num, choice } from '../../util.js';
import { hops } from './pics.js';
import { BLANK, mark } from './words.js';

const run = (start, step, n = 5) => Array.from({ length: n }, (_, i) => start + step * i);
const sign = s => (s > 0 ? '+' : '−');
const BY = { 1: 'ones', 10: 'tens', 100: 'hundreds' };

// "What comes just before / after n?"
function nextToQ(n, d) {
  const r = n + d, side = d > 0 ? 'after' : 'before', o = n % 10;
  const digitsLine = d > 0 && o === 9 ? `${n} ends in 9. One more fills up the ones, so they start again at 0 and the tens digit goes up.`
    : d < 0 && o === 0 ? `${n} ends in 0. One less goes back to the ten before, so the ones digit becomes 9.`
      : `Only the ones digit changes. It goes ${d > 0 ? 'up' : 'down'} by 1.`;
  return { ask: `What number comes just ${side} ${b(n)}?`, answer: num(r), hint: d > 0 ? 'Just after means one more.' : 'Just before means one less.', _t: { f: 'add', xs: [n, d] },
    ways: [way(d > 0 ? 'Count on' : 'Count back', [`Count ${d > 0 ? 'on' : 'back'} one from ${n}: ${n}, ${b(r)}.`]),
      way('Look at the digits', [digitsLine, `So the number just ${side} ${n} is ${b(r)}.`])] };
}
function betweenQ(a) {
  return { ask: 'Which number fits in the middle?', expr: `${a}, ${BLANK}, ${a + 2}`, answer: num(a + 1), hint: 'It is one more than the first number and one less than the last.', _t: { f: 'add', xs: [a, 1] },
    ways: [way('Count on from the first', [`Count on one from ${a}: ${a}, ${b(a + 1)}, and then ${a + 2}.`, `The number in the middle is ${b(a + 1)}.`]),
      way('Count back from the last', [`Count back one from ${a + 2}: ${a + 2}, ${a + 1}, and then ${a}.`, `The number in the middle is ${b(a + 1)}.`])] };
}
// Two worked ways for a missing number in a count: the jump, and the number line.
function missingWays(xs, hide) {
  const step = xs[1] - xs[0], s = Math.abs(step), ans = xs[hide], nb = hide > 0 ? xs[hide - 1] : xs[1];
  const back = hide === 0 ? -step : step;
  return [way('Find the jump', [`Next-door numbers are ${s} apart, so every jump is ${s}${step < 0 ? ' going down' : ''}.`, `Make one jump from ${nb}: ${nb} ${sign(back)} ${s} = ${b(ans)}.`]),
    way('Count along the line', [hops(xs, { hide }), `Counting ${step > 0 ? 'on' : 'back'} by ${s}: ${xs.map((v, i) => (i === hide ? b(v) : v)).join(', ')}.`, `The missing number is ${b(ans)}.`])];
}
const HINT_GAP = 'Each jump is the same size. Find it, then make that jump from the number next to the gap.';
function listQ(start, step, hide) {
  const xs = run(start, step), s = Math.abs(step);
  return { ask: `Count ${step < 0 ? 'back' : 'on'} by ${BY[s]}. What number is missing?`, expr: xs.map((v, i) => (i === hide ? BLANK : v)).join(', '), exprSmall: true,
    answer: num(xs[hide]), hint: HINT_GAP, _t: { f: 'seq', start, step, i: hide }, ways: missingWays(xs, hide) };
}
function lineQ(start, step, hide) {
  const xs = run(start, step);
  return { ask: `What number is missing on the number line?${mark(xs.join(' '), hide)}`, visual: hops(xs, { hide, jumps: false }), answer: num(xs[hide]),
    hint: 'Look at two stops that are next to each other. How big is the jump?', _t: { f: 'seq', start, step, i: hide }, ways: missingWays(xs, hide) };
}
// One number in the count does not belong. Which one?
function oddOneQ(start, step) {
  const xs = run(start, step, 6), i = rnd(1, 4), bad = xs[i] + pick(step === 10 ? [1, -1, 2] : [10, -10, 20]);
  const shown = xs.map((v, j) => (j === i ? bad : v)), others = shuffle(xs.filter((_, j) => j !== i)).slice(0, 3);
  return { ask: 'This count goes up by the same jump each time, but one number does not belong. Which one?', expr: shown.join(', '), exprSmall: true,
    answer: choice(String(bad), others.map(String)), choiceBig: true, hint: 'Check each number against the one before it. Which jump is the odd one?', _t: { f: 'oddone', start, step },
    ways: [way('Check the jumps', [`Every number should be ${step} more than the one before it.`, `${shown[i - 1]} + ${step} should be ${xs[i]}, but the list says ${bad}.`, `So ${b(bad)} is the one that does not belong.`]),
      way('Look at the digits', [`Counting by ${step === 10 ? 'tens' : 'hundreds'} keeps the ${step === 10 ? 'ones' : 'tens and ones'} the same: ${xs[0]}, ${xs[1]}, ${xs[2]} all end the same way.`, `${b(bad)} ends differently from the rest, so it is the slip.`])] };
}
const edge = (lo, hi) => 100 * rnd(lo, hi);
const tensStart = h => edge(h, h) - 10 * rnd(1, 3) - rnd(0, 9); // a count by tens that crosses a hundred
const backStart = h => edge(h, h) + 10 * rnd(1, 3) + rnd(0, 9);

export function genCount(L) {
  if (L === 1) {
    const t = pick(['after', 'before', 'between', 'ones', 'tens', 'line']), s = rnd(1, 5) * 10 + rnd(1, 9);
    if (t === 'after') return nextToQ(rnd(11, 98), 1);
    if (t === 'before') return nextToQ(rnd(12, 99), -1);
    if (t === 'between') return betweenQ(rnd(11, 97));
    if (t === 'ones') return listQ(rnd(11, 90), 1, pick([1, 2, 3]));
    if (t === 'tens') return listQ(s, 10, pick([2, 3, 4]));
    return pick([true, false]) ? lineQ(s, 10, rnd(1, 4)) : lineQ(rnd(11, 90), 1, rnd(1, 4));
  }
  if (L === 2) {
    const t = pick(['after', 'before', 'between', 'ones', 'tens', 'back', 'line']), h = rnd(1, 2);
    if (t === 'after') return nextToQ(edge(h, h) + rnd(-4, 4), 1);
    if (t === 'before') return nextToQ(edge(h, h) + rnd(-3, 4), -1);
    if (t === 'between') return betweenQ(edge(h, h) - rnd(1, 3));
    if (t === 'ones') return listQ(edge(h, h) - rnd(2, 4), 1, rnd(1, 3));
    if (t === 'tens') return listQ(tensStart(h), 10, rnd(1, 4));
    if (t === 'back') return listQ(backStart(h), -10, rnd(1, 4));
    return lineQ(pick([tensStart(h), edge(h, h) - rnd(2, 4)]), pick([10, 1]), rnd(1, 4));
  }
  const t = pick(['after', 'before', 'between', 'tens', 'back', 'hundreds', 'hundredsBack', 'odd', 'line']), h = rnd(2, 9);
  if (t === 'after') return nextToQ(Math.min(999, edge(h, h) + rnd(-3, 3)), 1);
  if (t === 'before') return nextToQ(edge(h, h) + rnd(-2, 3), -1);
  if (t === 'between') return betweenQ(edge(h, h) - rnd(1, 3));
  if (t === 'tens') return listQ(tensStart(h), 10, rnd(1, 4));
  if (t === 'back') return listQ(backStart(h), -10, rnd(1, 4));
  if (t === 'hundreds') return listQ(rnd(101, 599), 100, rnd(1, 4));
  if (t === 'hundredsBack') return listQ(rnd(501, 999), -100, rnd(1, 4));
  if (t === 'odd') return pick([true, false]) ? oddOneQ(tensStart(h), 10) : oddOneQ(rnd(101, 399), 100);
  return pick([true, false]) ? lineQ(tensStart(h), 10, rnd(1, 4)) : lineQ(rnd(101, 599), 100, rnd(1, 4));
}
