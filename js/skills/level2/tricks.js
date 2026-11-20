// Turning a hard multiplication fact into easy ones: doubles, ten then halve, ten minus a group, break apart.
import { rnd, pick, chance, b, way, num, choice } from '../../util.js';
import { dots } from './pics.js';
import { BLANK, cnt, skips } from './words.js';
import { tfQ } from './forms.js';

// For a × n: [title, steps, the lead-in that hands over the easy fact, hint].
function strategy(a, n) {
  const p = a * n, d = 2 * n, t = 10 * n, f = 5 * n;
  const S = {
    2: ['Double it', [`2 × ${n} is two groups of ${n}: ${n} + ${n}.`, `Double ${n} is ${b(p)}.`], `2 × ${n} means double ${n}.`, `What is ${n} + ${n}?`],
    3: ['Double, plus one more group', [`2 × ${n} = ${d}.`, `3 groups is one more group of ${n}: ${d} + ${n} = ${b(p)}.`], `You know 2 × ${n} = ${d}. Add one more group of ${n}.`, `Start from ${d} and add one more ${n}.`],
    4: ['Double, then double again', [`2 × ${n} = ${d}.`, `4 groups is twice as many as 2 groups, so double ${d}: ${b(p)}.`], `You know 2 × ${n} = ${d}. Double it to get 4 × ${n}.`, `What is double ${d}?`],
    5: ['Ten groups, then halve', [`10 × ${n} = ${t}.`, `5 groups is half of 10 groups. Half of ${t} is ${b(p)}.`], `You know 10 × ${n} = ${t}. 5 × ${n} is half of that.`, `What is half of ${t}?`],
    6: ['Five groups plus one group', [`5 × ${n} = ${f}.`, `6 groups is one more group of ${n}: ${f} + ${n} = ${b(p)}.`], `You know 5 × ${n} = ${f}. Add one more group of ${n}.`, `Start from ${f} and add one more ${n}.`],
    7: ['Five groups plus two groups', [`5 × ${n} = ${f} and 2 × ${n} = ${d}.`, `7 groups is 5 groups and 2 groups: ${f} + ${d} = ${b(p)}.`], `You know 5 × ${n} = ${f} and 2 × ${n} = ${d}. Put them together.`, `7 groups is 5 groups and 2 groups. Add ${f} and ${d}.`],
    8: ['Double three times', [`2 × ${n} = ${d}.`, `4 × ${n} is double that: ${2 * d}.`, `8 × ${n} is double again: ${b(p)}.`], `You know 4 × ${n} = ${2 * d}. Double it to get 8 × ${n}.`, `What is double ${2 * d}?`],
    9: ['Ten groups minus one group', [`10 × ${n} = ${t}.`, `9 groups is one group fewer: ${t} − ${n} = ${b(p)}.`], `You know 10 × ${n} = ${t}. Take away one group of ${n}.`, `Start from ${t} and take away one ${n}.`],
    12: ['Ten groups plus two groups', [`10 × ${n} = ${t} and 2 × ${n} = ${d}.`, `12 groups is 10 groups and 2 groups: ${t} + ${d} = ${b(p)}.`], `You know 10 × ${n} = ${t} and 2 × ${n} = ${d}. Put them together.`, `12 groups is 10 groups and 2 groups. Add ${t} and ${d}.`],
  };
  return S[a];
}
const splitAt = a => (a > 10 ? 10 : a > 5 ? 5 : a > 2 ? 2 : 1);
function arrayWay(a, n) {
  const s = splitAt(a), r = a - s;
  return way('Break the array apart', [dots(a, n, { split: s }), `The array has ${a} rows of ${n}. Split it into ${cnt(s, 'row')} and ${cnt(r, 'row')}.`,
    `${s} × ${n} = ${s * n} and ${r} × ${n} = ${r * n}.`, `Together: ${s * n} + ${r * n} = ${b(a * n)}.`]);
}
export function trickWays(a, n) {
  const [title, steps] = strategy(a, n);
  const ways = [way(title, steps), arrayWay(a, n)];
  if (a <= 6) ways.push(way('Skip count', [`Count by ${n}s, ${a} times: ${skips(a, n)}.`, `${a} × ${n} = ${b(a * n)}.`]));
  return ways;
}
function helperQ(a, n) {
  const [, , lead, hint] = strategy(a, n);
  return { ask: `${lead} What is the answer?`, expr: `${a} × ${n}`, answer: num(a * n), hint, ways: trickWays(a, n), _t: { f: 'mul', a, b: n } };
}
// The same fact written as easier pieces: one version is true, one has the classic slip (adding the number instead of the group).
const SPLIT = {
  2: n => [[`${n} + ${n}`, 2 * n], [`${n} + 2`, n + 2]], 3: n => [[`2 × ${n} + ${n}`, 3 * n], [`2 × ${n} + 2`, 2 * n + 2]],
  4: n => [[`2 × ${n} + 2 × ${n}`, 4 * n], [`2 × ${n} + 2`, 2 * n + 2]], 5: n => [[`10 × ${n} ÷ 2`, 5 * n], [`10 × ${n} ÷ 5`, 2 * n]],
  6: n => [[`5 × ${n} + ${n}`, 6 * n], [`5 × ${n} + 1`, 5 * n + 1]], 7: n => [[`5 × ${n} + 2 × ${n}`, 7 * n], [`5 × ${n} + 2`, 5 * n + 2]],
  8: n => [[`4 × ${n} + 4 × ${n}`, 8 * n], [`4 × ${n} + 4`, 4 * n + 4]], 9: n => [[`10 × ${n} − ${n}`, 9 * n], [`10 × ${n} − 1`, 10 * n - 1]],
  12: n => [[`10 × ${n} + 2 × ${n}`, 12 * n], [`10 × ${n} + 2`, 10 * n + 2]],
};
function splitTrueQ(a, n) {
  const ok = chance(0.5), [text, value] = SPLIT[a](n)[ok ? 0 : 1];
  return tfQ({ expr: `${a} × ${n} = ${text}`, ok, hint: 'Work out both sides. Splitting into groups must keep every group.',
    why: [`${a} × ${n} = ${a * n}.`, `${text} = ${value}.`, ok ? `${a * n} matches, so it is ${b('true')}.` : `${value} is not ${a * n}, so it is ${b('false')}.`] });
}
function partQ(a, n) {
  const s = splitAt(a), r = a - s;
  return { ask: 'The array is broken into two easier parts. What number is missing?', expr: `${a} × ${n} = ${s} × ${n} + ${BLANK} × ${n}`, exprSmall: true, visual: dots(a, n, { split: s }), answer: num(r),
    hint: `${a} rows are split into ${s} rows and how many more?`, _t: { f: 'sub', a, b: s },
    ways: [way('Count the rows', [dots(a, n, { split: s }), `There are ${a} rows in all. ${s} are in the first part.`, `${a} − ${s} = ${b(r)}, so the second part has ${cnt(r, 'row')}.`]),
      way('Check the totals', [`${s} × ${n} = ${s * n} and ${r} × ${n} = ${r * n}.`, `${s * n} + ${r * n} = ${a * n}, which is ${a} × ${n}. So the missing number is ${b(r)}.`])] };
}
function chooseQ(a, n) {
  const nine = a === 9, right = nine ? `10 × ${n} − 1 × ${n}` : `5 × ${n} + ${a - 5} × ${n}`;
  const wrong = nine ? [`10 × ${n} − 1`, `5 × ${n} + 5 × ${n}`, `9 + ${n} + 10`] : [`5 × ${n} + ${a - 5}`, `5 × ${n} + 5 × ${a - 5}`, `10 × ${n} − ${a}`];
  return { ask: `Which is a correct way to work out ${b(`${a} × ${n}`)}?`, answer: choice(right, wrong), hint: `${a} groups of ${n} must stay ${a} groups of ${n}, however you split them.`, _t: { f: 'mul', a, b: n, evalOptions: true },
    ways: [way('Count the groups in each choice', [nine ? `10 groups of ${n}, take away 1 group of ${n}, leaves 9 groups of ${n}.` : `5 groups of ${n} and ${cnt(a - 5, 'more group')} of ${n} make ${a} groups of ${n}.`,
      `So ${b(right)} is correct.`, nine ? `"10 × ${n} − 1" only takes away 1, not a whole group of ${n}.` : `"5 × ${n} + ${a - 5}" adds ${a - 5}, not ${cnt(a - 5, 'group')} of ${n}.`]),
    way('Work each one out', [`${a} × ${n} = ${a * n}.`, nine ? `${10 * n} − ${n} = ${a * n}. It matches.` : `${5 * n} + ${(a - 5) * n} = ${a * n}. It matches.`, 'The other choices give different totals.'])] };
}
// Asks for the size of the adjustment: the one group taken off 10 groups, or the groups added to 5 groups.
function stepQ(a, n) {
  const nine = a === 9, base = nine ? 10 : 5, more = Math.abs(a - base), extra = more * n;
  return { ask: nine ? `Start from 10 groups of ${n}. How much must you take away to be left with 9 groups of ${n}?` : `Start from 5 groups of ${n}. How much must you add to have ${a} groups of ${n}?`,
    expr: `${base} × ${n} ${nine ? '−' : '+'} ${BLANK} = ${a} × ${n}`, exprSmall: true, answer: num(extra), _t: { f: 'mul', a: more, b: n },
    hint: nine ? 'You have one group too many. How big is one group?' : 'How many more groups do you need, and how big is each one?',
    ways: [way('Count the groups', [nine ? '10 groups is one group more than 9 groups.' : `${a} groups is ${more} more than 5 groups.`, `${cnt(more, 'group')} of ${n} is ${b(extra)}.`]),
      way('Check with the totals', [`${base} × ${n} = ${base * n} and ${a} × ${n} = ${a * n}.`, `The gap between ${base * n} and ${a * n} is ${b(extra)}.`])] };
}
export function genTricks(L) {
  if (L === 1) {
    const a = pick([2, 2, 4, 4, 8, 3, 0]);
    return a === 0 ? splitTrueQ(pick([2, 3, 4, 8]), rnd(3, 9)) : helperQ(a, rnd(2, a === 8 ? 9 : 12));
  }
  if (L === 2) {
    const a = pick([5, 5, 9, 9, 6, 7, 0]);
    if (a === 0) return splitTrueQ(pick([5, 6, 7, 9]), rnd(3, 9));
    let n = rnd(3, a === 5 || a === 9 ? 12 : 9); if (n === 5 && (a === 6 || a === 7)) n = 8;
    return a !== 5 && chance(0.35) ? stepQ(a, n) : helperQ(a, n);
  }
  const t = pick(['part', 'choose', 'bare', 'bare', 'twelve', 'tf']), a = pick([6, 7, 8, 9]), n = rnd(6, 9);
  if (t === 'part') return partQ(pick([6, 7, 8, 9, 12]), n);
  if (t === 'choose') return chooseQ(a, n);
  if (t === 'twelve') return helperQ(12, n);
  if (t === 'tf') return splitTrueQ(pick([6, 7, 8, 9, 12]), n);
  return { ask: 'Use an easy fact you know to work this out.', expr: `${a} × ${n}`, answer: num(a * n), hint: strategy(a, n)[0] + '.', ways: trickWays(a, n), _t: { f: 'mul', a, b: n } };
}
