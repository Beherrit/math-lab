// Fraction helpers shared by the Level 4 fraction skills: terms (whole + part) and written ways for adding and subtracting them.
import { gcd, lcm, rnd, pick, F, M, fr, b, way } from '../../util.js';

export const cn = d => { let n; do n = rnd(1, d - 1); while (gcd(n, d) !== 1); return n; };
// A mixed number { w, n, d } with a proper part in lowest terms; a whole number has n = 0, d = 1.
export const term = (w, d) => ({ w, n: cn(d), d });
export const whole = w => ({ w, n: 0, d: 1 });
export const imp = x => x.w * x.d + x.n;
export const mix = x => M(x.w, x.n, x.d);
export const asTerm = (r, l) => ({ w: Math.floor(r / l), n: r % l, d: l });
// Denominator pairs: friendly (one divides the other), unlike, and bigger unlike pairs.
const DENS = [[[2, 4], [3, 6], [2, 6], [4, 8], [5, 10], [3, 9]], [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [4, 6], [2, 7]], [[5, 6], [3, 8], [4, 7], [6, 8], [5, 4], [3, 7]]];
export function densFor(level) {
  const [a, c] = pick(DENS[level - 1]);
  return Math.random() < 0.5 ? [a, c] : [c, a];
}
// The fraction part of res / l, when it can be written with smaller numbers.
const simplifyStep = (res, l) => { const n = res % l, g = n ? gcd(n, l) : 1; return g > 1 ? `Simplify the fraction part: ${F(n, l)} = ${F(n / g, l / g)}` : null; };

// Ways to add or subtract two mixed numbers (or a whole and a mixed number). Returns { res, l, ways }: the answer is res / l.
export function mixedWays(A, B, op) {
  const l = lcm(A.d, B.d), mA = l / A.d, mB = l / B.d, nA = A.n * mA, nB = B.n * mB;
  const IA = imp(A) * mA, IB = imp(B) * mB, res = op === '+' ? IA + IB : IA - IB, pf = n => (n ? F(n, l) : '0');
  const s1 = [];
  if (A.n && B.n && A.d !== B.d) s1.push(`The bottoms are different, so give both fractions the bottom ${l}, a number ${A.d} and ${B.d} both go into: ${F(A.n, A.d)} = ${F(nA, l)} and ${F(B.n, B.d)} = ${F(nB, l)}.`);
  if (op === '+') {
    const parts = nA + nB;
    s1.push(`Add the wholes: ${A.w} + ${B.w} = ${A.w + B.w}`, `Add the parts: ${pf(nA)} + ${pf(nB)} = ${F(parts, l)}`);
    if (parts >= l) s1.push(`${F(parts, l)} is more than 1 whole: it is ${M(1, parts - l, l)}. Add that whole in: ${A.w + B.w} + 1 = ${A.w + B.w + 1}`);
    if (simplifyStep(res, l)) s1.push(simplifyStep(res, l));
  } else if (nA >= nB) {
    s1.push(`Subtract the wholes: ${A.w} − ${B.w} = ${A.w - B.w}`, `Subtract the parts: ${pf(nA)} − ${pf(nB)} = ${nA - nB ? F(nA - nB, l) : '0'}`);
    if (simplifyStep(res, l)) s1.push(simplifyStep(res, l));
  } else {
    s1.push(`${pf(nA)} is not enough to take ${F(nB, l)} away, so regroup: take 1 whole from the ${A.w}. One whole is ${F(l, l)}.`, `${M(A.w, nA, l)} becomes ${M(A.w - 1, nA + l, l)}`,
      `Subtract the wholes: ${A.w - 1} − ${B.w} = ${A.w - 1 - B.w}`, `Subtract the parts: ${F(nA + l, l)} − ${F(nB, l)} = ${F(nA + l - nB, l)}`);
    if (simplifyStep(res, l)) s1.push(simplifyStep(res, l));
  }
  s1.push(`${op === '+' ? 'Together' : 'The difference'}: ${b(fr(res, l))}`);
  const ways = [way('Wholes and parts', s1),
    way('Turn them into fractions', [`Write each as one fraction over ${l}: ${mix(A)} = ${F(IA, l)} and ${mix(B)} = ${F(IB, l)}.`, `${op === '+' ? 'Add' : 'Subtract'} the tops: ${IA} ${op} ${IB} = ${res}`, `${F(res, l)} = ${b(fr(res, l))}`])];
  if (op === '−') ways.push(way('Check by adding back', [`If ${fr(res, l)} is right, adding ${mix(B)} should give ${mix(A)} again.`, `${fr(res, l)} + ${mix(B)} = ${mix(A)}`]));
  return { res, l, ways };
}
// Three terms: the first two, then the third.
export function chainWays(terms, ops) {
  const first = mixedWays(terms[0], terms[1], ops[0]), t2 = asTerm(first.res, first.l), second = mixedWays(t2, terms[2], ops[1]);
  const L = lcm(first.l, terms[2].d), imps = terms.map(t => imp(t) * (L / t.d)), total = ops.reduce((s, o, i) => (o === '+' ? s + imps[i + 1] : s - imps[i + 1]), imps[0]);
  return { res: second.res, l: second.l, ways: [
    way('One pair at a time', [`First: ${mix(terms[0])} ${ops[0]} ${mix(terms[1])} = ${fr(first.res, first.l)}`, `Then: ${fr(first.res, first.l)} ${ops[1]} ${mix(terms[2])} = ${b(fr(second.res, second.l))}`]),
    way('All over one bottom', [`Use the bottom ${L} for all three: ${terms.map(t => F(imp(t) * (L / t.d), L)).join(' and ')}.`, `${imps.map((v, i) => (i ? `${ops[i - 1]} ${v}` : String(v))).join(' ')} = ${total}`, `${F(total, L)} = ${b(fr(total, L))}`])] };
}
