// Shared fraction bits for level 3: random proper fractions, labelled bars, and step-by-step reducing.
import { rnd, gcd, F, M, fr, fracBar, way, b } from '../../util.js';
import { factorsOf } from './helpers.js';

// A numerator for d that makes a proper fraction already in simplest form.
export function properTop(d) { for (;;) { const n = rnd(1, d - 1); if (gcd(n, d) === 1) return n; } }
export const bar = (n, d) => fracBar(n, d, { label: `${n}/${d}` });
export const sameValue = (a, c) => a[0] * c[1] === c[0] * a[1];
export const dth = d => ({ 2: 'halves', 3: 'thirds', 4: 'fourths', 5: 'fifths', 6: 'sixths', 7: 'sevenths', 8: 'eighths', 9: 'ninths', 10: 'tenths', 11: 'elevenths', 12: 'twelfths', 100: 'hundredths' }[d] ?? `${d}ths`);
// "3 fifths", "1 fifth", "1 half".
export const count = (n, d) => `${n} ${n === 1 ? (d === 2 ? 'half' : dth(d).slice(0, -1)) : dth(d)}`;
export const smallestShared = (n, d) => factorsOf(gcd(n, d))[1];

// Divide top and bottom by their smallest shared factor, again and again, until nothing is shared.
export function reduceSteps(n, d) {
  const lines = [];
  while (gcd(n, d) > 1) {
    const p = smallestShared(n, d);
    lines.push(`Both ${n} and ${d} can be divided by ${p}: ${F(n, d)} = ${F(n / p, d / p)}`);
    n /= p; d /= p;
  }
  return lines;
}
export function reduceWays(n, d) {
  const g = gcd(n, d), fn = factorsOf(n), fd = factorsOf(d);
  const small = way('Divide in small steps', [...reduceSteps(n, d), `${n / g} and ${d / g} share no factor except 1, so ${b(F(n / g, d / g))} is the simplest form.`]);
  const big = way('Biggest shared factor in one go', [`Factors of ${n}: ${fn.join(', ')}`, `Factors of ${d}: ${fd.join(', ')}`, `The biggest number on both lists is ${b(g)}.`,
    `Divide top and bottom by ${g}: ${F(n, d)} = ${b(F(n / g, d / g))}`]);
  const tests = [2, 3, 5, 7, 11, 13].filter(p => p <= n).map(p => `${p}: ${n % p ? 'does not divide' : 'divides'} ${n}, ${d % p ? 'does not divide' : 'divides'} ${d}.`);
  const none = [way('Look for a shared factor', [`Factors of ${n}: ${fn.join(', ')}`, `Factors of ${d}: ${fd.join(', ')}`, `The only number on both lists is 1, so ${b(F(n, d))} is already in simplest form.`]),
    way('Test small numbers', [...tests, `No number divides both, so ${F(n, d)} cannot be made simpler.`])];
  const ways = g > 1 ? [small, big] : none;
  if (g > 1 && d <= 24) ways.push(way('Picture it', [bar(n, d), `Join the parts in groups of ${g}. The bar now has ${d / g} bigger parts, with ${n / g} shaded.`, bar(n / g, d / g), 'The same amount is shaded, with fewer, bigger parts.']));
  return ways;
}

// The result as the steps reach it, before any simplifying: a whole number, a mixed number or a fraction.
export const unreduced = (R, d) => (R % d === 0 ? `${R / d}` : fr(R, d, { simplify: false }));
// Lines that tidy up a result: a whole number, a mixed number, or a simpler equal fraction.
export function finish(R, d) {
  const out = [];
  if (R % d === 0) out.push(`${F(R, d)} is exactly ${b(R / d)} whole${R / d > 1 ? 's' : ''}, because ${d} ${dth(d)} make 1 whole.`);
  else if (R > d) out.push(`${F(R, d)} is more than 1 whole. Every ${d} ${dth(d)} make 1 whole, so it is ${b(M(Math.floor(R / d), R % d, d))}.`);
  if (R % d && gcd(R, d) > 1) out.push(`In simplest form that is ${b(fr(R, d))}. Both ways of writing it are right.`);
  return out;
}
