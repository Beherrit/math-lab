// Prime and composite numbers.
import { rnd, pick, shuffle, b, way, num, choice } from '../../util.js';
import { factorsOf, pairsOf, isPrime, oneOf, listed } from './helpers.js';
import { arraySVG } from './visuals.js';

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const PRIMES = range(2, 100).filter(isPrime);
// Odd composites that look prime at first glance.
const SNEAKY = range(9, 99).filter(n => n % 2 && n % 5 && !isPrime(n));
const smallest = n => factorsOf(n)[1];

// Try 2, 3, 5, 7 in turn: enough to settle any number up to 100.
function trials(n) {
  const out = [];
  for (const p of [2, 3, 5, 7]) {
    if (p * p > n) break;
    if (n % p === 0) { out.push(`${n} ÷ ${p} = ${n / p} exactly. Found a factor.`); return out; }
    out.push(`${n} ÷ ${p} leaves ${n % p} over.`);
  }
  out.push(n < 4 ? `The only way to make ${n} is 1 × ${n}.` : 'No bigger number needs checking: its partner in a pair would be one of the small numbers already tried.');
  return out;
}
function verdict(n) {
  if (isPrime(n)) return `${n} has exactly two factors, 1 and ${n}. It is ${b('prime')}.`;
  const a = smallest(n);
  return `${n} = ${a} × ${n / a}, so it has more factors than just 1 and itself. It is ${b('composite')}.`;
}
function tileWay(n) {
  const a = smallest(n), prime = isPrime(n);
  const pic = prime ? (n <= 12 ? [arraySVG(1, n)] : []) : (n / a <= 12 ? [arraySVG(a, n / a)] : []);
  return way('Try to build a rectangle', [`Take ${n} square tiles. Can they make a rectangle with more than one row?`, ...pic,
    prime ? `No. The only rectangle is one long row of ${n}, so ${n} is ${b('prime')}.` : `Yes: ${a} rows of ${n / a}. So ${n} is ${b('composite')}.`]);
}

function primeOrNot(L) {
  const n = L === 1 ? rnd(2, 30) : pick([rnd(31, 100), pick(SNEAKY), pick(PRIMES.filter(p => p > 30))]), kind = isPrime(n) ? 'Prime' : 'Composite';
  return { ask: `Is ${n} prime or composite?`, answer: choice(kind, [], { all: ['Prime', 'Composite'] }), choiceBig: true, _t: { kind: 'pc', n },
    hint: 'Look for a factor other than 1 and the number itself. Try 2, 3, 5 and 7.', ways: [way('Hunt for a factor', [...trials(n), verdict(n)]), tileWay(n)] };
}
// Rows 1, 2, 3 ... up to the square root: a rectangle exists when the rows share the tiles out evenly.
function rowsWay(n, ps) {
  const lines = [];
  for (let r = 1; r * r <= n; r++) lines.push(n % r ? `${r} row${r > 1 ? 's' : ''}: ${n} ÷ ${r} leaves ${n % r} tiles over, so no rectangle.` : `${r} row${r > 1 ? 's' : ''}: ${n} ÷ ${r} = ${n / r} in each row, so a ${r} by ${n / r} rectangle.`);
  return way('Try each number of rows', [`Try 1 row, 2 rows, 3 rows ... and stop when the rows would be longer than the columns, because after that the rectangles only turn round.`, ...lines,
    `${b(ps.length)} of those worked, so there ${ps.length > 1 ? 'are' : 'is'} ${b(ps.length)} different rectangle${ps.length > 1 ? 's' : ''}.`]);
}
function rectangles() {
  const n = rnd(2, 24), ps = pairsOf(n);
  return { ask: `How many different rectangles can you build with exactly ${n} square tiles? (A 2 by 3 and a 3 by 2 count as the same one.)`, answer: num(ps.length), _t: { kind: 'npairs', n },
    hint: 'Each rectangle is a factor pair: rows × tiles in each row.',
    ways: [way('List the factor pairs', [`Each rectangle is two numbers that multiply to ${n}.`, ...ps.map(([x, y]) => `${x} by ${y}`), verdict(n), `That is ${b(ps.length)} rectangle${ps.length > 1 ? 's' : ''}.`]), rowsWay(n, ps)] };
}

function pickOne(ask, good, bad, kind) {
  const answer = choice(String(good), bad.map(String));
  return { ask: `${ask}: ${listed(answer)}?`, answer, _t: { kind }, hint: 'Check each number for a factor: try 2, 3, 5 and 7.',
    ways: [way('Check each choice', [...shuffle([good, ...bad]).map(verdict), `The answer is ${b(good)}.`]),
      way('Quick checks', ['Even numbers bigger than 2 have 2 as a factor.', 'Numbers ending in 0 or 5 (bigger than 5) have 5 as a factor.', 'If the digits add up to a multiple of 3, the number has 3 as a factor.',
        `Using those, and trying 7 for what is left, the answer is ${b(good)}.`])] };
}
function whichPrime(L) {
  const pool = L === 1 ? range(4, 30).filter(n => !isPrime(n)) : SNEAKY, good = pick(PRIMES.filter(p => (L === 1 ? p <= 30 : p > 10)));
  return pickOne('Which of these numbers is prime', good, shuffle(pool).slice(0, 3), 'whichprime');
}
function whichComposite() {
  return pickOne('Which of these numbers is composite', pick(SNEAKY.filter(n => n > 20)), shuffle(PRIMES.filter(p => p > 10)).slice(0, 3), 'whichcomposite');
}

function countPrimes() {
  const lo = pick([0, 10, 20, 30, 40, 50, 60, 70, 80, 90]), hi = lo + 10, all = range(lo + 1, hi - 1), found = all.filter(isPrime);
  const gone = d => all.filter(n => n > d && n % d === 0 && [2, 3, 5, 7].every(q => q >= d || n % q || n === q));
  const cross = [2, 3, 5, 7].map(d => [d, gone(d)]).filter(x => x[1].length).map(([d, xs]) => `Cross off multiples of ${d}: ${xs.join(', ')}.`);
  return { ask: `How many prime numbers are there between ${lo} and ${hi}?`, answer: num(found.length), _t: { kind: 'countprimes', lo, hi }, hint: `Write out the numbers from ${lo + 1} to ${hi - 1}, then cross off the ones with a small factor.`,
    ways: [way('Cross off the composites', [`Write the numbers: ${all.join(', ')}.`, ...(lo === 0 ? ['Cross off 1. It has only one factor, so it is neither prime nor composite.'] : []), ...cross,
      `What is left: ${b(found.join(', '))}. That is ${b(found.length)} prime${found.length > 1 ? 's' : ''}.`]),
    way('Check the odd ones', ['Every even number bigger than 2 is composite, so only the odd numbers (and 2) need a real check.', ...all.filter(n => n % 2 && n > 1).map(verdict), `Count the primes: ${b(found.length)}.`])] };
}
function smallestFactor() {
  const n = pick([...SNEAKY, ...SNEAKY, 26, 34, 38, 46, 58, 62, 74, 86, 94]), a = smallest(n);
  return { ask: `What is the smallest factor of ${n}, other than 1?`, answer: num(a), _t: { kind: 'smallfactor', n }, hint: 'Test the smallest prime numbers one at a time, smallest first. The first one that divides evenly is the answer.',
    ways: [way('Try small primes in order', [...trials(n), `The smallest factor other than 1 is ${b(a)}.`]),
      way('Quick checks', [`Is ${n} even? ${n % 2 ? 'No.' : 'Yes, so 2 is a factor.'}`, ...(n % 2 ? [`Do its digits add up to a multiple of 3? ${n % 3 ? 'No.' : 'Yes, so 3 is a factor.'}`] : []),
        ...(n % 2 && n % 3 ? [`Does it end in 0 or 5? ${n % 5 ? 'No, so try 7.' : 'Yes, so 5 is a factor.'}`] : []), `${n} = ${a} × ${n / a}, so the answer is ${b(a)}.`])] };
}

const MAKERS = [[primeOrNot, primeOrNot, rectangles, whichPrime], [primeOrNot, primeOrNot, whichPrime, rectangles], [whichPrime, whichComposite, countPrimes, smallestFactor, primeOrNot]];
export const genPrime = L => oneOf(MAKERS[L - 1], L);
