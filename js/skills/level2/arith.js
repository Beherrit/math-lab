// Worked ways for adding and subtracting within 1000, and for estimating by rounding first.
import { b, way, fmt as f } from '../../util.js';
import { near, hto } from './kit.js';

export function addWays(a, c) {
  const [ah, at, ao] = hto(a), [ch, ct, co] = hto(c), sum = a + c;
  const parts = [ch, ct, co].filter(v => v), lines = []; let cur = a;
  parts.forEach((v, i) => { lines.push(`${f(cur)} + ${v} = ${i === parts.length - 1 ? b(f(sum)) : f(cur + v)}.`); cur += v; });
  const ways = [way('Add each place', [`Hundreds: ${ah} + ${ch} = ${ah + ch}.`, `Tens: ${at} + ${ct} = ${at + ct}.`, `Ones: ${ao} + ${co} = ${ao + co}.`, `Put them together: ${ah + ch} + ${at + ct} + ${ao + co} = ${b(f(sum))}.`]),
    way('Count on from the first number', [`Start at ${f(a)} and add ${f(c)} a piece at a time.`, ...lines])];
  if (co >= 7) ways.push(way('Round up, then take back', [`${f(c)} is just under ${c + 10 - co}. Add ${c + 10 - co} instead: ${f(a)} + ${c + 10 - co} = ${f(a + c + 10 - co)}.`, `That is ${10 - co} too many, so take ${10 - co} back: ${f(a + c + 10 - co)} − ${10 - co} = ${b(f(sum))}.`]));
  return ways;
}

// Jumps that count up from `from` to `to`: to the next ten, the next hundred, then hundreds, tens and ones.
export function hops(from, to) {
  const out = []; let cur = from;
  const go = t => { if (t > cur) { out.push(t - cur); cur = t; } };
  go(Math.min(to, Math.ceil(cur / 10) * 10)); go(Math.min(to, Math.ceil(cur / 100) * 100));
  go(cur + Math.floor((to - cur) / 100) * 100); go(cur + Math.floor((to - cur) / 10) * 10); go(to);
  return out;
}
export function subWays(a, c) {
  const jumps = hops(c, a), diff = a - c, parts = hto(c).filter(v => v), lines = []; let cur = a;
  parts.forEach((v, i) => { lines.push(`${f(cur)} − ${v} = ${i === parts.length - 1 ? b(f(diff)) : f(cur - v)}.`); cur -= v; });
  return [way('Count up from the smaller number', [`Count up from ${f(c)} to ${f(a)} in jumps: ${jumps.map(f).join(' + ')}.`, `The jumps add up to ${jumps.map(f).join(' + ')} = ${b(f(diff))}.`]),
    way('Take it away a piece at a time', [`Start at ${f(a)} and take ${f(c)} away in pieces.`, ...lines])];
}

// Two ways to estimate a sum or difference: round each number first, and decide each rounding by one digit.
export function roundWays(a, c, sign, p) {
  const ra = near(a, p), rc = near(c, p), est = sign === '+' ? ra + rc : ra - rc, digit = n => (p === 10 ? n % 10 : Math.floor(n / 10) % 10), place = p === 10 ? 'ones' : 'tens';
  const rule = n => `${f(n)}: the ${place} digit is ${digit(n)}, ${digit(n) >= 5 ? '5 or more, so round up' : 'less than 5, so round down'} to ${f(near(n, p))}.`;
  return [way('Round both, then calculate', [`Round ${f(a)} to ${f(ra)} and ${f(c)} to ${f(rc)}.`, `${f(ra)} ${sign} ${f(rc)} = ${b(f(est))}.`]),
    way(`Look at the ${place} digit`, [rule(a), rule(c), `${f(ra)} ${sign} ${f(rc)} = ${b(f(est))}.`])];
}
export function roundOneWays(n, p) {
  const lo = Math.floor(n / p) * p, hi = lo + p, ans = near(n, p), place = p === 10 ? 'ones' : 'tens', d = p === 10 ? n % 10 : Math.floor(n / 10) % 10;
  return [way('Use the digit', [`Look at the ${place} digit of ${f(n)}: it is ${d}.`, d >= 5 ? '5 or more rounds up.' : 'Less than 5 rounds down.', `${f(n)} rounds to ${b(f(ans))}.`]),
    way('Which is closer', [`${f(n)} sits between ${f(lo)} and ${f(hi)}.`, `It is ${n - lo} from ${f(lo)} and ${hi - n} from ${f(hi)}${n - lo === hi - n ? ', exactly halfway, so we round up' : ''}.`, `The nearer one is ${b(f(ans))}.`])];
}
