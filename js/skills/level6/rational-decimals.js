// Turning a fraction into a decimal by long division: when it stops, when it repeats, and how the remainders show it.
import { R, rnd, pick, gcd, shuffle, places, fmt, F, b, way, num, choice } from '../../util.js';
import { tag } from './helpers.js';

// Long division of n by d: the digits after the point and the remainder that starts each step.
function longDiv(n, d, count) {
  const digits = [], rems = []; let r = n % d;
  for (let i = 0; i < count; i++) { rems.push(r); r *= 10; digits.push(Math.floor(r / d)); r %= d; }
  return { digits, rems };
}
// The written steps of a long division, stopping early when the remainder reaches 0.
function DIV_LINES(n, d, count) {
  const { digits, rems } = longDiv(n, d, count), out = [`${n} ÷ ${d}: ${d} goes into ${n} ${Math.floor(n / d)} times with remainder ${n % d}.`];
  for (let i = 0; i < count; i++) {
    const next = (rems[i] * 10) % d;
    out.push(`Bring down a 0: ${rems[i] * 10} ÷ ${d} = ${digits[i]} with remainder ${next}.`);
    if (next === 0) break;
  }
  return out;
}
const primes = d => { const out = []; for (let p = 2; d > 1; p++) while (d % p === 0) { out.push(p); d /= p; } return out; };
const stops = d => primes(d).every(p => p === 2 || p === 5);
const decimalText = (n, d, count) => `${Math.floor(n / d)}.${longDiv(n, d, count).digits.join('')}`;

function terminating() {
  const d = pick([2, 4, 5, 10, 20, 25]), n = rnd(1, d - 1), val = R(n / d), m = 100 / d;
  return tag({ ask: `Write ${F(n, d)} as a decimal.`, answer: num(val),
    ways: [way('Long division', [...DIV_LINES(n, d, places(val)), `The remainder is 0, so the decimal stops: ${b(fmt(val))}`]),
      way('Make the bottom number 100', [`${d} × ${m} = 100, so multiply the top and the bottom by ${m}.`, `${F(n, d)} = ${F(n * m, 100)} = ${b(fmt(val))}`])],
    hint: 'Divide the top number by the bottom number. Or change the bottom number into 10 or 100.' }, { kind: 'fracdec', shape: 'stops', n, d });
}
function rounded() {
  for (;;) {
    const d = pick([3, 6, 7, 9, 11, 12]), n = rnd(1, d - 1);
    if (stops(d / gcd(n, d))) continue;
    const ans = Math.round(n / d * 100) / 100, third = longDiv(n, d, 3).digits;
    return tag({ ask: `Use long division to write ${F(n, d)} as a decimal. Round it to the nearest hundredth.`, answer: num(ans),
      ways: [way('Divide to three places, then round', [...DIV_LINES(n, d, 3), `${F(n, d)} = ${decimalText(n, d, 3)}... The third digit is ${third[2]}, so round ${third[2] >= 5 ? 'up' : 'down'}: ${b(fmt(ans))}`]),
        way('Check by multiplying back', [`${fmt(ans)} × ${d} = ${fmt(R(ans * d))}.`, `That is very close to ${n}, so ${b(fmt(ans))} is a good answer.`])],
      hint: 'Do the long division for three places. The third digit tells you whether to round up or down.' }, { kind: 'fracround', shape: 'round', n, d });
  }
}
function stopOrRepeat() {
  for (;;) {
    const wantRepeat = pick([true, false]), rep = [3, 6, 7, 9, 11, 12, 14, 15, 18], term = [2, 4, 5, 8, 10, 16, 20, 25];
    const mk = d => { let n; do { n = rnd(1, d - 1); } while (gcd(n, d) > 1); return [n, d]; };
    const oneD = pick(wantRepeat ? rep : term), others = shuffle(wantRepeat ? term : rep).slice(0, 3), all = [oneD, ...others].map(mk), texts = all.map(p => `${p[0]}/${p[1]}`);
    if (new Set(texts).size < 4) continue;
    const [n, d] = all[0], ps = primes(d);
    return tag({ ask: wantRepeat ? 'Which of these fractions gives a decimal that repeats forever?' : 'Which of these fractions gives a decimal that stops?', answer: choice(texts[0], texts.slice(1)),
      ways: [way('Look at the bottom number', [`A fraction in lowest terms stops exactly when its bottom number has only 2s and 5s as prime factors.`, `${ps.length === 1 ? `${d} is a prime number` : `${d} = ${ps.join(' × ')}`}${ps.every(p => p === 2 || p === 5) ? ', only 2s and 5s, so it stops.' : `, which has a ${ps.find(p => p !== 2 && p !== 5)} in it, so it repeats.`}`, `The answer is ${b(texts[0])}.`]),
        way('Try the long division', [...DIV_LINES(n, d, 4), wantRepeat ? 'The remainders come back round again, so the digits repeat forever.' : 'The remainders reach 0, so the digits stop.'])],
      hint: 'Fractions with a bottom number made only of twos and fives stop. Look for a different prime factor.' }, { kind: 'repdec', shape: 'stoporrepeat', want: wantRepeat ? 'repeating' : 'terminating' });
  }
}
// The remainders that come round again tell how long the block of repeating digits is.
function cycle(n, d) { const seen = new Map(); let r = n % d, i = 0; while (!seen.has(r)) { seen.set(r, i++); r = (r * 10) % d; } return { start: seen.get(r), length: i - seen.get(r) }; }
function repeatingDigit() {
  for (;;) {
    const d = pick([3, 6, 9, 12, 15, 18]), n = rnd(1, d - 1), c = cycle(n, d);
    if (stops(d / gcd(n, d)) || c.length !== 1) continue;
    const digits = longDiv(n, d, 10).digits, dig = digits[9];
    return tag({ ask: `Divide ${n} by ${d} with long division. After a few places, one digit repeats forever. Which digit is it?`, answer: num(dig),
      ways: [way('Watch the remainders', [...DIV_LINES(n, d, 5), `A remainder has come back, so the same digit comes round again and again: ${b(dig)}.`]),
        way('Test the pattern', [`${decimalText(n, d, 6)}... looks like it ends in ${dig}${dig}${dig}...`, `Check: ${decimalText(n, d, 6)} × ${d} = ${fmt(R(+decimalText(n, d, 6) * d))}, which is very close to ${n}. The repeating digit is ${b(dig)}.`])],
      hint: 'Keep dividing. When a remainder shows up for the second time, the digits start repeating.' }, { kind: 'repdigit', shape: 'repdigit', n, d });
  }
}
function period() {
  const d = pick([3, 7, 9, 11, 13, 27, 33, 37]), n = rnd(1, d - 1), c = cycle(n, d), digits = longDiv(n, d, c.length * 2).digits;
  const rems = []; let r = n; for (let i = 0; i <= c.length; i++) { rems.push(r); r = (r * 10) % d; }
  return tag({ ask: `${n} ÷ ${d} never stops. How many digits are in the block that repeats?`, answer: num(c.length),
    ways: [way('Follow the remainders', [`Start with remainder ${n}, then bring down zeros: the remainders are ${rems.join(', ')}.`, `${rems[c.length]} is the first remainder again after ${c.length} ${c.length === 1 ? 'step' : 'steps'}, so the block has ${b(c.length)} ${c.length === 1 ? 'digit' : 'digits'}.`]),
      way('Write out the digits', [`${decimalText(n, d, c.length * 2)}...`, `The block ${digits.slice(0, c.length).join('')} comes round twice, and it has ${b(c.length)} ${c.length === 1 ? 'digit' : 'digits'}.`])],
    hint: 'Do the long division and write down each remainder. Count the steps until a remainder comes back.' }, { kind: 'period', shape: 'period', n, d });
}
export function genDecimals(L) {
  if (L === 1) return terminating();
  if (L === 2) return Math.random() < 0.5 ? stopOrRepeat() : rounded();
  return Math.random() < 0.5 ? repeatingDigit() : period();
}
