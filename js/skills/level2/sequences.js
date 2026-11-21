// Number patterns: what comes next in a skip count or a growing pattern, and which numbers belong to a times table.
import { rnd, pick, b, way, num, choice } from '../../util.js';

// Terms of a pattern: first + step * k + grow * k(k - 1) / 2. With grow 0 it is a skip count; with grow above 0 the gaps themselves grow.
export const terms = (first, step, grow, n) => Array.from({ length: n }, (_, k) => first + step * k + grow * k * (k - 1) / 2);
export function seqQ(first, step, grow, shown = 5) {
  const xs = terms(first, step, grow, shown + 1), next = xs.pop(), gaps = xs.slice(1).map((x, i) => x - xs[i]), nextGap = gaps[gaps.length - 1] + grow;
  const w1 = way('Look at the gaps', [`The gaps are ${gaps.join(', ')}.`, grow ? `Each gap is ${grow} bigger than the one before, so the next gap is ${nextGap}.` : `The gap is always ${step}, so the next gap is ${step} too.`, `${xs[xs.length - 1]} + ${nextGap} = ${b(next)}.`]);
  const w2 = grow ? way('Add up all the gaps', [`Start at ${first} and add every gap, including the next one: ${[...gaps, nextGap].join(' + ')}.`, `${first} + ${[...gaps, nextGap].join(' + ')} = ${b(next)}.`])
    : first === step ? way('Use the times table', [`${xs.join(', ')} are the ${step}s table: ${step} × 1, ${step} × 2, and so on.`, `The next one is ${step} × ${shown + 1} = ${b(next)}.`])
      : way('Count the jumps from the start', [`From ${first}, the next number is ${shown} jumps of ${step} on.`, `${first} + ${shown} × ${step} = ${b(next)}.`]);
  return { ask: 'What number comes next in the pattern?', expr: `${xs.join(', ')}, ${'<span class="blank">?</span>'}`, answer: num(next), _t: { f: 'seq', xs }, ways: [w1, w2],
    hint: grow ? 'Find the gap between each pair of numbers. Do the gaps stay the same?' : 'Find the gap between one number and the next. What is the rule?' };
}
export const growingQ = () => { const g = pick([1, 2]), s = rnd(1, 3), f0 = rnd(1, 6); return seqQ(f0, s, g, rnd(4, 5)); };

// Facts about which numbers are in a times table (written as a recipe so the test can check each choice itself).
const RULES = {
  2: n => `${n} ends in ${n % 10}, which is ${n % 2 ? 'odd, so it is not' : 'even, so it is'} in the 2s table.`,
  5: n => `${n} ends in ${n % 10}. ${n % 5 ? 'The 5s table only ends in 0 or 5' : 'Every 5s fact ends in 0 or 5'}, so ${n % 5 ? 'no' : 'yes'}.`,
  10: n => `${n} ends in ${n % 10}. ${n % 10 ? 'Only a 0 on the end is in the 10s table' : 'A 0 on the end is in the 10s table'}, so ${n % 10 ? 'no' : 'yes'}.`,
  9: n => `The digits of ${n} add to ${String(n).split('').reduce((s, d) => s + +d, 0)}. ${n % 9 ? 'Digits that add to 9 or 18 would be in the 9s table' : 'Digits adding to 9 or 18 are in the 9s table'}, so ${n % 9 ? 'no' : 'yes'}.`,
};
export function multipleQ(k) {
  const q = rnd(4, k >= 9 ? 11 : 12), right = k * q, wrong = new Set();
  while (wrong.size < 3) { const w = right + pick([-7, -4, -3, -2, -1, 1, 2, 3, 4, 7, 11, -11]); if (w > 9 && w % k) wrong.add(w); }
  const opts = [...wrong];
  return { ask: `Which of these numbers is in the ${k}s table?`, answer: choice(String(right), opts.map(String)), choiceBig: true, _t: { f: 'multof', k }, hint: `Use the pattern in the ${k}s table to test each number.`,
    ways: [way('Test each number', [...[right, ...opts].sort((x, y) => x - y).map(RULES[k]), `Only ${b(right)} passes.`]), way('Check by multiplying', [`${k} × ${q} = ${right}.`, `So ${b(right)} is in the ${k}s table.`])] };
}
// Which times table fact always gives an even product, whatever it is multiplied by?
export function alwaysEvenQ() {
  const e = pick([2, 4, 6, 8, 10, 12]), odds = [3, 5, 7, 9, 11].sort(() => Math.random() - 0.5).slice(0, 3), o = odds[0], ks = [e, ...odds], text = k => `${k} × any whole number`;
  return { ask: 'Which of these always gives an even product, whatever whole number it is multiplied by?', answer: choice(text(e), odds.map(text)), choiceBig: true, _t: { f: 'alwayseven', ks },
    hint: 'Try each one with a few numbers. Look for the one that never gives an odd answer.',
    ways: [way('Try some numbers', [`${e} × 3 = ${e * 3}, ${e} × 5 = ${e * 5}, ${e} × 7 = ${e * 7}: all even.`, `${o} × 3 = ${o * 3} is odd, so ${o} does not always give an even product.`, `Only ${b(text(e))} is always even.`]),
      way('Think in pairs', [`${e} is even, so ${e} groups of anything can be put into pairs with none left over.`, `An odd number of groups like ${o} can leave one group without a partner.`, `So ${b(text(e))} is always even.`])] };
}
