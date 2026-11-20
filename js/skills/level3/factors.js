// Factors, multiples and factor pairs.
import { rnd, pick, chance, shuffle, lcm, fmt, b, way, num, choice } from '../../util.js';
import { BLANK, yesNo, factorsOf, pairsOf, oneOf } from './helpers.js';
import { arraySVG } from './visuals.js';

const multiples = (m, count) => Array.from({ length: count }, (_, i) => m * (i + 1));
const pairText = n => pairsOf(n).map(([x, y]) => `${x} × ${y}`).join(', ');
const picture = (a, q) => (a <= 12 && q <= 12 ? [arraySVG(Math.min(a, q), Math.max(a, q))] : []);
const RICH = [12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48, 50, 54, 56, 60, 63, 64, 72, 80, 84, 90, 96, 100];

function skipWay(a, n) {
  const list = multiples(a, Math.ceil(n / a)), hit = n % a === 0;
  return way('Skip-count', [`Count by ${a}s: ${list.length > 12 ? '… ' + list.slice(-6).join(', ') : list.join(', ')}.`,
    hit ? `The count lands exactly on ${n}, so ${a} is a factor of ${n}.` : `The count jumps over ${n} (from ${list.at(-1) - a} to ${list.at(-1)}), so ${a} is not a factor of ${n}.`]);
}
function isFactor(L) {
  const a = rnd(2, 9), yes = chance(0.5), q = rnd(2, L === 1 ? 6 : 12), n = a * q + (yes ? 0 : rnd(1, a - 1));
  const divide = yes ? [`${n} ÷ ${a} = ${q} with nothing left over.`, ...picture(a, q), `Yes. ${a} × ${q} = ${n}, so ${a} ${b('is')} a factor of ${n}.`]
    : [`${n} ÷ ${a} = ${q} with ${n - a * q} left over.`, `No. ${a} does not go into ${n} evenly, so it is ${b('not')} a factor.`];
  return { ask: `Is ${a} a factor of ${n}?`, answer: yesNo(yes), choiceBig: true, _t: { kind: 'isfactor', a, n }, hint: `Can you make ${n} from equal groups of ${a}, with nothing left over?`,
    ways: [way('Divide', divide), skipWay(a, n)] };
}
function nthMultiple(L) {
  const m = rnd(2, L === 1 ? 9 : 12), i = rnd(3, L === 1 ? 9 : 12), nth = ['', '', '', '3rd'][i] ?? i + 'th';
  return { ask: `What is the ${nth} multiple of ${m}?`, answer: num(m * i), _t: { kind: 'nth', i, m }, hint: `The multiples of ${m} are what you say when you count by ${m}s.`,
    ways: [way('Skip-count', [`Count by ${m}s and stop at the ${nth} number: ${multiples(m, i).join(', ')}.`, `The ${nth} multiple is ${b(m * i)}.`]),
      way('Multiply', [`The ${nth} multiple of ${m} is ${i} groups of ${m}.`, `${i} × ${m} = ${b(m * i)}`])] };
}
function missingFactor(L) {
  const a = rnd(2, 9), q = rnd(2, L === 1 ? 9 : 12), n = a * q;
  return { ask: 'Find the missing factor in this factor pair.', expr: `${a} × ${BLANK} = ${n}`, answer: num(q), _t: { kind: 'pair', a, n }, hint: `How many ${a}s make ${n}?`,
    ways: [way('Divide', ['A factor pair is two numbers that multiply to make the number.', `${n} ÷ ${a} = ${b(q)}`, `Check: ${a} × ${q} = ${n}.`]),
      way('Build a rectangle', [`Make a rectangle from ${n} tiles with ${a} in each ${a <= q ? 'row' : 'column'}.`, ...picture(a, q), `It takes ${b(q)} ${a <= q ? 'columns' : 'rows'}, so the pair is ${a} × ${q}.`])] };
}

// Walk 1, 2, 3 ... testing each number, and stop at the square root: every bigger factor already has its partner.
function walkWay(n, last) {
  const lines = [];
  for (let i = 1; i * i <= n; i++) {
    lines.push(n % i ? `${i}: ${n} ÷ ${i} leaves ${n % i} over, so ${i} is not a factor.` : i * i === n ? `${i}: ${n} ÷ ${i} = ${i}, so ${i} is a factor. It is its own partner.`
      : `${i}: ${n} ÷ ${i} = ${n / i}, so ${i} and ${n / i} are both factors.`);
  }
  return way('Test the numbers in order', ['Test 1, 2, 3, ... one at a time. Stop at the square root, because a bigger factor always has a smaller partner that you already found.', ...lines, last]);
}
// Build every rectangle that 'n' square tiles can make. Each one is a factor pair.
function rectWay(n, last) {
  const ps = pairsOf(n);
  return way('Build the rectangles', [`Make rectangles out of ${n} square tiles. The rows times the tiles in each row must come to ${n}.`,
    ...ps.flatMap(([x, y]) => [...picture(x, y), `${x} row${x > 1 ? 's' : ''} of ${y} tile${y > 1 ? 's' : ''}: ${x} × ${y} = ${n}`]), last]);
}
const pairWays = (n, last) => [walkWay(n, last), rectWay(n, last)];
function countPairs(L) {
  const n = pick(L === 3 ? RICH.slice(10) : RICH.slice(0, 14)), c = pairsOf(n).length;
  return { ask: `How many factor pairs does ${n} have? (Count 3 × 4 and 4 × 3 as one pair.)`, answer: num(c), _t: { kind: 'npairs', n }, hint: 'Start with 1 × the number, then try 2, then 3, and so on.',
    ways: pairWays(n, `That makes ${b(c)} factor pair${c > 1 ? 's' : ''}.`) };
}
function countFactors(L) {
  const n = pick(L === 3 ? RICH.slice(8) : RICH.slice(0, 12)), f = factorsOf(n), sq = Number.isInteger(Math.sqrt(n));
  const last = `List every number in the pairs once${sq ? ` (${Math.sqrt(n)} pairs with itself, so count it once)` : ''}: ${f.join(', ')}. That is ${b(f.length)} factors.`;
  return { ask: `How many factors does ${n} have?`, answer: num(f.length), _t: { kind: 'nfactors', n }, hint: 'Find the factor pairs first. Each pair gives you two factors.', ways: pairWays(n, last) };
}

// One option passes the test, three do not. The reason for each is shown in the worked steps.
function oddOneOut(ask, good, bad, t, hint, reason, rule) {
  return { ask, answer: choice(String(good), bad.map(String)), _t: t, hint,
    ways: [way('Check each choice', [...shuffle([good, ...bad]).map(reason), `The answer is ${b(good)}.`]), way('Use the meaning', rule)] };
}
function notFactor(L) {
  const n = pick(RICH.slice(0, L === 3 ? 25 : 14)), f = factorsOf(n).filter(x => x > 1 && x < n), non = [];
  for (let x = 3; x < n; x++) if (n % x) non.push(x);
  const good = pick(non.filter(x => x <= 16)), bad = shuffle(f).slice(0, 3);
  if (!good || bad.length < 3) return null;
  const why = x => (n % x ? `${n} ÷ ${x} leaves ${n % x} over, so ${x} is not a factor.` : `${x} × ${n / x} = ${n}, so ${x} is a factor.`);
  return oddOneOut(`Which number is NOT a factor of ${n}?`, good, bad, { kind: 'notfactor', n }, `A factor divides ${n} with nothing left over.`, why,
    [`The factor pairs of ${n} are: ${pairText(n)}.`, `${good} is not in any pair, so it is ${b('not')} a factor.`]);
}
function whichMultiple(L) {
  const two = L === 3, [a, c] = two ? pick([[2, 3], [3, 4], [4, 6], [3, 5], [4, 5], [6, 8], [2, 5], [6, 9], [4, 10], [2, 7]]) : [rnd(3, 12), 1];
  const m = lcm(a, c), good = m * rnd(2, two ? 5 : 12);
  const bad = two ? [a * rnd(2, 12), c * rnd(2, 12), good + pick([-1, 1]) * pick([a, c]), a * c + 1] : [good + 1, good - 1, good + rnd(2, a - 1), m * rnd(2, 12) + rnd(1, a - 1)];
  const clean = [...new Set(bad)].filter(x => x % m && x > 1).slice(0, 3);
  if (clean.length < 3) return null;
  const why = x => (two ? `${x}: ${x % a ? `not a multiple of ${a}` : `a multiple of ${a}`}, ${x % c ? `not a multiple of ${c}` : `a multiple of ${c}`}.`
    : x % a ? `${x} ÷ ${a} leaves ${x % a} over, so it is not a multiple of ${a}.` : `${a} × ${x / a} = ${x}, so it is a multiple of ${a}.`);
  const list = two ? [`Multiples of ${a}: ${multiples(a, 8).join(', ')}, …`, `Multiples of ${c}: ${multiples(c, 8).join(', ')}, …`, `Numbers on both lists are multiples of ${m}. ${good} = ${m} × ${good / m}, so it is on both.`]
    : [`A multiple of ${a} is ${a} times a whole number.`, `${good} = ${a} × ${good / a}, so it is a multiple of ${a}.`];
  return oddOneOut(two ? `Which number is a multiple of both ${a} and ${c}?` : `Which number is a multiple of ${a}?`, good, clean, { kind: 'multipleof', ms: two ? [a, c] : [a] },
    two ? 'It has to pass two checks, one for each number.' : `Multiples of ${a} are the numbers you land on when you count by ${a}s.`, why, list);
}
function firstCommon() {
  const [a, c] = pick([[2, 3], [3, 4], [4, 6], [3, 5], [4, 5], [6, 8], [2, 5], [6, 9], [4, 10], [2, 7], [3, 9], [5, 6], [8, 12], [6, 10]]), m = lcm(a, c);
  return { ask: `What is the smallest number that is a multiple of both ${a} and ${c}?`, answer: num(m), _t: { kind: 'firstcommon', a, c }, hint: `Count by ${Math.max(a, c)}s and check each number: is it also a multiple of ${Math.min(a, c)}?`,
    ways: [way('Two lists', [`Multiples of ${a}: ${multiples(a, m / a + 1).join(', ')}, …`, `Multiples of ${c}: ${multiples(c, m / c + 1).join(', ')}, …`, `The first number on both lists is ${b(m)}.`]),
      way('Count by the bigger one', [`Count by ${Math.max(a, c)}s and test each number against ${Math.min(a, c)}.`, ...multiples(Math.max(a, c), m / Math.max(a, c)).map(x => `${x}: ${x % Math.min(a, c) ? 'no' : 'yes'}`), `The first “yes” is ${b(m)}.`])] };
}
function rows() {
  const n = pick(RICH), f = factorsOf(n).filter(x => x > 2 && x < n / 2), non = [];
  for (let x = 4; x < n / 2 && x <= 20; x++) if (n % x) non.push(x);
  const good = pick(f), bad = shuffle(non).slice(0, 3);
  if (!good || bad.length < 3) return null;
  const why = x => (n % x ? `${x} rows: ${n} ÷ ${x} leaves ${n % x} over.` : `${x} rows: ${n} ÷ ${x} = ${n / x} in each row, none left over.`);
  return oddOneOut(`A hall needs ${n} chairs set out in equal rows with none left over. Which number of rows works?`, good, bad, { kind: 'factorof', n }, `The number of rows has to be a factor of ${n}.`, why,
    ['Equal rows with none left over means the number of rows is a factor of the total.', `The factor pairs of ${n} are: ${pairText(n)}.`, `${b(good)} is in a pair, so it works.`]);
}

const MAKERS = [[isFactor, isFactor, nthMultiple, missingFactor], [isFactor, countPairs, countFactors, notFactor, whichMultiple, missingFactor, nthMultiple],
  [countPairs, countFactors, notFactor, whichMultiple, whichMultiple, firstCommon, firstCommon, rows]];
export const genFactors = L => oneOf(MAKERS[L - 1], L);
