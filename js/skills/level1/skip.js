// Skip counting (the bridge to multiplying): missing numbers, what comes next, the size of the jump, and the 10th number.
import { rnd, pick, chance, b, way, num, choice } from '../../util.js';
import { hops } from './pics.js';
import { BLANK, countList } from './words.js';

const run = (start, step, n = 5) => Array.from({ length: n }, (_, i) => start + step * i);
const arrow = down => (down ? '−' : '+');

function seqQ(start, step, hide, picture) {
  const xs = run(start, step), ans = xs[hide], s = Math.abs(step), down = step < 0;
  const [p, q] = hide <= 1 ? [xs[2], xs[3]] : [xs[0], xs[1]];
  const last = hide > 0 ? `${xs[hide - 1]} ${arrow(down)} ${s} = ${b(ans)}` : `Go one jump back from ${xs[1]}: ${xs[1]} ${down ? '+' : '−'} ${s} = ${b(ans)}`;
  return { ask: 'What number is missing?', expr: xs.map((v, i) => (i === hide ? BLANK : v)).join(', '), exprSmall: true, visual: picture ? hops(xs, { hide, jumps: false }) : undefined,
    answer: num(ans), hint: 'Look at two neighbours you can see. How big is the jump between them?', _t: { f: 'seq', start, step, i: hide },
    ways: [way('Find the jump', [`${p} and ${q} are neighbours. The jump between them is ${s}${down ? ', going down' : ''}.`, 'Every jump in the list is the same size.', last + '.']),
      way('See it on a number line', [hops(xs, { hide }), `Each jump is ${s}. The missing stop is ${b(ans)}.`])] };
}
function nextQ(start, step) {
  const xs = run(start, step), ans = xs[4];
  return { ask: `Keep counting. What comes ${b('next')}?`, expr: `${xs.slice(0, 4).join(', ')}, ${BLANK}`, exprSmall: true, answer: num(ans), hint: 'How big is the jump between two neighbours? Make the same jump again.', _t: { f: 'seq', start, step, i: 4 },
    ways: [way('Find the jump, then make it again', [`The jump from ${xs[2]} to ${xs[3]} is ${step}.`, `${xs[3]} + ${step} = ${b(ans)}.`]), way('Say the count out loud', [`${xs.slice(0, 4).join(', ')}, and then ${b(ans)}.`])] };
}
function jumpSizeQ(start, step) {
  const xs = run(start, step);
  return { ask: 'The numbers go up by the same jump each time. How big is the jump?', expr: xs.join(', '), exprSmall: true, answer: num(step), hint: 'Take any two neighbours. How far apart are they?', _t: { f: 'sub', a: xs[1], b: xs[0] },
    ways: [way('Subtract two neighbours', [`${xs[1]} − ${xs[0]} = ${step}.`, `Check another pair: ${xs[3]} − ${xs[2]} = ${b(step)}.`]), way('Count the gap', [`From ${xs[0]} to ${xs[1]} you count on ${b(step)}.`])] };
}
// A choice: which of these numbers is in the pattern? The wrong ones are one off a number that is.
function inPatternQ(start, step) {
  const xs = run(start, step), right = start + step * rnd(5, 7);
  const wrong = [right + 1, right - 1, right + step - 1, right - step + 1].filter(v => v % step !== start % step);
  return { ask: 'Which of these numbers will come up later in the pattern?', expr: `${xs.join(', ')}, ...`, exprSmall: true, answer: choice(String(right), wrong.map(String)), choiceBig: true,
    hint: `Every number in the pattern is ${step} more than the one before.`, _t: { f: 'inpat', start, step },
    ways: [way('Keep counting', [`${xs.join(', ')}, ${countList(xs[4], 3, 1, step)} ...`, `${b(right)} is in the pattern.`]), way('Test the choices', [`Starting at ${start}, a number is in the pattern if you can reach it with whole jumps of ${step}.`, `${right} is ${(right - start) / step} jumps from ${start}, so ${b(right)} fits.`])] };
}
function tenthQ(start, step) {
  const xs = run(start, step, 10), ans = xs[9];
  return { ask: `Find the rule, then work out the ${b('10th')} number in the pattern.`, expr: `${xs.slice(0, 4).join(', ')}, ...`, exprSmall: true, answer: num(ans), hint: 'First find the jump. The 10th number is 9 jumps after the 1st.', _t: { f: 'seq', start, step, i: 9 },
    ways: [way('Rule, then 9 jumps', [`The jump is ${xs[1]} − ${xs[0]} = ${step}.`, `From the 1st number to the 10th is 9 jumps: 9 × ${step} = ${9 * step}.`, `${start} + ${9 * step} = ${b(ans)}.`]), way('List all ten', [`${xs.join(', ')}.`, `The 10th number is ${b(ans)}.`])] };
}
function jumpsQ(n, step, picture) {
  const total = n * step, stops = Array.from({ length: n + 1 }, (_, i) => i * step);
  return { ask: `Start at 0 and make ${b(n + ' jumps of ' + step)}. Where do you land?`, visual: picture ? hops(stops, { hide: n }) : undefined, answer: num(total),
    hint: `Count by ${step}s, one count for each jump.`, _t: { f: 'mul', a: n, b: step },
    ways: [way('Skip count', [`Count by ${step}s, ${n} times: ${countList(0, n, 1, step)}.`, `You land on ${b(total)}.`]),
      way('Add the same number again and again', [`${Array(n).fill(step).join(' + ')} = ${b(total)}.`, `${n} jumps of ${step} is also written ${n} × ${step}. Skip counting is where multiplying begins.`])] };
}
function howManyQ(n, step) {
  const total = n * step;
  return { ask: `Count by ${b(step + 's')} from 0. How many jumps does it take to reach ${b(total)}?`, answer: num(n), hint: `Count by ${step}s and keep track of how many numbers you say.`, _t: { f: 'div', a: total, b: step },
    ways: [way('Skip count and keep score', [`${countList(0, n, 1, step)}.`, `That was ${b(n)} numbers, so ${b(n)} jumps.`]),
      way('Think of equal groups', [`Each jump is a group of ${step}. How many groups of ${step} make ${total}?`, `${n} groups of ${step} make ${total}, so the answer is ${b(n)}.`])] };
}
export function genSkip(L) {
  if (L === 1) {
    const step = pick([2, 5, 10]), t = pick(['miss', 'miss', 'next', 'size', 'in']);
    if (t === 'next') return nextQ(step * rnd(0, 5), step);
    if (t === 'size') return jumpSizeQ(step * rnd(0, 5), step);
    if (t === 'in') return inPatternQ(step * rnd(0, 3), step);
    return seqQ(step * rnd(0, 6), step, pick([4, 4, 3, 2]), true);
  }
  if (L === 2) {
    const t = pick(['odd', 'hundred', 'new', 'jumps', 'jumps', 'next', 'in']), step = pick([3, 4]);
    if (t === 'odd') { const s = pick([5, 10]); return seqQ(rnd(1, 11) * s + rnd(1, s - 1), s, pick([4, 3, 2]), false); }
    if (t === 'hundred') return seqQ(rnd(1, 4) * 100 + rnd(0, 9) * 10 + rnd(0, 9), 100, pick([4, 3, 2]), false);
    if (t === 'new') return seqQ(step * rnd(0, 3), step, pick([4, 4, 3]), true);
    if (t === 'next') return nextQ(rnd(2, 20), pick([2, 5, 10, 3, 4]));
    if (t === 'in') return inPatternQ(rnd(1, 4), step);
    return jumpsQ(rnd(3, 7), pick([2, 5, 10, 3, 4]), true);
  }
  const t = pick(['back', 'mid', 'tenth', 'tenth', 'jumps', 'count']);
  if (t === 'back') { const step = pick([2, 5, 10]); return seqQ(step * rnd(8, 14) + (chance(0.3) ? 1 : 0), -step, pick([4, 3, 1]), false); }
  if (t === 'mid') { const step = pick([3, 4]); return seqQ(step * rnd(2, 6), step, pick([0, 1, 2, 3]), false); }
  if (t === 'tenth') return tenthQ(rnd(2, 14), pick([3, 4, 5, 6, 7, 10]));
  if (t === 'jumps') return jumpsQ(rnd(6, 10), pick([3, 4]), false);
  return howManyQ(rnd(4, 10), pick([2, 5, 10, 3, 4]));
}
