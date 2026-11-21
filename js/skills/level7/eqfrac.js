// Equations with fractions and decimals as coefficients, brackets on both sides, and checking by substitution.
import { rnd, pick, chance, b, way, F, fmt, num, choice, gcd, lcm } from '../../util.js';
import { lin, term, plus, yesNo, nz, par } from './h.js';

// Rational numbers [n, d], always in lowest terms with d > 0.
const Q = (n, d = 1) => { const g = gcd(n, d) || 1, s = d < 0 ? -1 : 1; return [(s * n) / g, (s * d) / g]; };
const add = (p, q) => Q(p[0] * q[1] + q[0] * p[1], p[1] * q[1]), sub = (p, q) => add(p, [-q[0], q[1]]), mul = (p, q) => Q(p[0] * q[0], p[1] * q[1]), val = p => p[0] / p[1];
// Text of a rational: a stacked fraction, or a decimal when dec is true. Negatives use the minus sign.
const show = (p, dec) => (dec ? fmt(val(p)) : p[1] === 1 ? fmt(p[0]) : `${p[0] < 0 ? '−' : ''}${F(Math.abs(p[0]), p[1])}`);
const tx = (p, dec) => (p[1] === 1 && Math.abs(p[0]) === 1 ? (p[0] < 0 ? '−x' : 'x') : `${show(p, dec)}x`);
const pl = (p, dec) => (p[0] < 0 ? `− ${show([-p[0], p[1]], dec)}` : `+ ${show(p, dec)}`);
const side = (a, c, dec) => (a[0] === 0 ? show(c, dec) : c[0] === 0 ? tx(a, dec) : `${tx(a, dec)} ${pl(c, dec)}`);
const FR = [[1, 2], [1, 3], [2, 3], [3, 4], [1, 4], [3, 2], [1, 5], [2, 5]], DEC = [[1, 2], [1, 4], [3, 2], [5, 2], [1, 5], [2, 5], [3, 4], [1, 10]];
const away = (v, what) => (v > 0 ? `Take ${what(v)} from both sides` : `Add ${what(-v)} to both sides`);
// The worked ways for A x + B = C x + D, in whole numbers and in the original numbers.
function ways(A, B, C, D, x, dec, pre = []) {
  const m = [A, B, C, D].reduce((t, p) => lcm(t, p[1]), 1), [a, b1, c, d] = [A, B, C, D].map(p => (p[0] * m) / p[1]), keep = c !== 0, q = a - c;
  const clear = [...pre, ...(m > 1 ? [`Multiply every term by ${m} to clear the ${dec ? 'decimals' : 'fractions'}: ${keep ? `${lin(a, b1)} = ${lin(c, d)}` : `${lin(a, b1)} = ${fmt(d)}`}.`] : []),
    ...(keep ? [`${away(c, term)}: ${lin(q, b1)} = ${fmt(d)}.`] : []), ...(b1 === 0 ? [] : [`${away(b1, fmt)}: ${term(q)} = ${fmt(d - b1)}.`]), q === 1 ? `So x = ${b(fmt(x))}.` : `Divide both sides by ${fmt(q)}: x = ${b(fmt(x))}.`];
  const rest = sub(D, B), coef = sub(A, C);
  return [way('Clear the fractions first', clear), way('Collect, then divide', [...pre, `Get the x terms on one side and the plain numbers on the other: ${tx(coef, dec)} = ${show(rest, dec)}.`, `x = ${show(rest, dec)} ÷ ${coef[1] === 1 ? par(coef[0]) : show(coef, dec)} = ${b(fmt(x))}.`])];
}
const tShown = (dec, ...ps) => ps.flatMap(p => (dec ? [val(p)] : [p[0], p[1]])).filter(v => Math.abs(v) > 1);
const groups = (k, a, c) => [k, a, c];
function problem(shape, A, B, C, D, x, dec, ask, left, right, extra = {}) {
  const L = [groups(1, val(A), val(B))], R = [groups(1, val(C), val(D))];
  return { ask, expr: `${left} = ${right}`, exprSmall: true, answer: num(x), hint: dec ? 'Multiply every term by a number that removes the decimals, or collect the x terms first.' : 'Multiply every term by the bottom number of the fractions, or collect the x terms first.', _t: { k: 'eqfrac', shape, L, R, shown: extra.shown || [], ...extra.t },
    ways: ways(A, B, C, D, x, dec, extra.pre || []) };
}
const oneX = dec => { const [n, d] = pick(dec ? DEC : FR), x = d * nz(-4, 6), c = nz(-9, 9); return { A: Q(n, d), B: Q(c), x, D: add(mul(Q(n, d), Q(x)), Q(c)) }; };
function oneFrac(dec) {
  const { A, B, D, x } = oneX(dec), zero = Q(0);
  return problem(dec ? 'one-dec' : 'one-frac', A, B, zero, D, x, dec, 'Solve for x.', side(A, B, dec), show(D, dec), { shown: tShown(dec, A, B, D) });
}
function halfOf() {
  const d = rnd(2, 6), x = d * nz(-5, 8), c = nz(-8, 9), A = Q(1, d), D = add(Q(x, d), Q(c));
  return { ...problem('half-of', A, Q(c), Q(0), D, x, false, 'Solve for x.', `${F('x', d)} ${plus(c)}`, show(D, false), { shown: [d, c, D[0]] }), };
}
function checkYn() {
  const dec = chance(0.5), { A, B, D, x } = oneX(dec), yes = chance(0.5), pick2 = yes ? x : x + pick([-1, 1]) * (A[1] || 1);
  const lhs = add(mul(A, Q(pick2)), B), ok = val(lhs) === val(D);
  return { ask: `Is x = ${fmt(pick2)} a solution of this equation?`, expr: `${side(A, B, dec)} = ${show(D, dec)}`, exprSmall: true, answer: yesNo(ok), hint: 'Put the number in place of x on the left side. Do you get the number on the right side?', _t: { k: 'eqfrac', shape: 'check-yn', L: [groups(1, val(A), val(B))], R: [groups(1, 0, val(D))], x: pick2, shown: [pick2, ...tShown(dec, A, B, D)] },
    ways: [way('Substitute', [`Put x = ${fmt(pick2)} in the left side: ${show(A, dec)} × ${par(pick2)} ${pl(B, dec)} = ${show(lhs, dec)}.`, ok ? `The right side is ${show(D, dec)}, the same, so ${b('yes')}.` : `The right side is ${show(D, dec)}, which is different, so ${b('no')}.`]), way('Solve and compare', [`Solving the equation gives x = ${fmt(x)}.`, ok ? `${fmt(pick2)} is that value: ${b('yes')}.` : `${fmt(pick2)} is not ${fmt(x)}: ${b('no')}.`])] };
}
function bothSides(dec) {
  for (let t = 0; t < 40; t++) {
    const [n, d] = pick(dec ? DEC : FR), x = d * nz(-5, 6), A = Q(n, d), C = Q(pick([-1, 0, 1, 2]) * n, d), c1 = nz(-8, 8);
    if (val(A) === val(C)) continue;
    const D2 = add(mul(sub(A, C), Q(x)), Q(c1)), D = D2, B = Q(c1);
    if (D[1] !== 1 || Math.abs(D[0]) > 20) continue;
    return problem(dec ? 'both-dec' : 'both-frac', A, B, C, D, x, dec, 'Solve for x.', side(A, B, dec), side(C, D, dec), { shown: tShown(dec, A, B, C, D) });
  }
  return null;
}
function distOne() {
  const [n, d] = pick(FR), x = d * nz(-4, 6), p = nz(-6, 6), K = Q(n, d), D = mul(K, add(Q(x), Q(p)));
  if (D[1] !== 1 && x % d !== 0) return null;
  const A = K, B = mul(K, Q(p)), pre = [`Multiply out the bracket: ${show(K, false)}x ${pl(B, false)} = ${show(D, false)}.`];
  return problem('dist-one', A, B, Q(0), D, x, false, 'Solve for x.', `${show(K, false)}(${lin(1, p)})`, show(D, false), { shown: tShown(false, K, Q(p), D), pre });
}
function distBoth(dec) {
  for (let t = 0; t < 80; t++) {
    const [n1, d1] = pick(dec ? DEC : FR), [n2, d2] = pick(dec ? DEC : FR), x = nz(-6, 6), a = nz(-4, 4), bb = nz(-4, 4), p = nz(-6, 6), K1 = Q(n1, d1), K2 = Q(n2, d2);
    const left = mul(K1, add(mul(Q(a), Q(x)), Q(p))), q = sub(mul(left, [K2[1], K2[0]]), mul(Q(bb), Q(x)));
    if (q[1] !== 1 || Math.abs(q[0]) > 12 || val(mul(K1, Q(a))) === val(mul(K2, Q(bb))) || (n1 === n2 && d1 === d2)) continue;
    const A = mul(K1, Q(a)), B = mul(K1, Q(p)), C = mul(K2, Q(bb)), D = mul(K2, q);
    const pre = [`Multiply out both brackets: ${side(A, B, dec)} = ${side(C, D, dec)}.`];
    return problem(dec ? 'dist-dec' : 'dist-frac', A, B, C, D, x, dec, 'Solve for x.', `${show(K1, dec)}(${lin(a, p)})`, `${show(K2, dec)}(${lin(bb, q[0])})`, { shown: tShown(dec, K1, K2, Q(p), q), pre });
  }
  return null;
}
function whichValue() {
  const dec = chance(0.5), { A, B, D, x } = oneX(dec), step = A[1], slips = [x + step, x - step, -x, x + 2 * step];
  const options = [x, ...slips.filter(v => v !== x)].slice(0, 4).map(fmt);
  return { ask: 'Which value of x makes the equation true?', expr: `${side(A, B, dec)} = ${show(D, dec)}`, exprSmall: true, answer: choice(fmt(x), options.slice(1)), hint: 'Put each choice in place of x and see which one gives the right side.', _t: { k: 'eqfrac', shape: 'which-value', L: [groups(1, val(A), val(B))], R: [groups(1, 0, val(D))], shown: tShown(dec, A, B, D) },
    ways: [way('Substitute the right one', [`Solve first: x = ${fmt(x)}.`, `Check: ${show(A, dec)} × ${par(x)} ${pl(B, dec)} = ${show(add(mul(A, Q(x)), B), dec)}, which is ${show(D, dec)}. So ${b(fmt(x))}.`]), way('Test the others', [`Each other choice changes ${tx(A, dec)} by a multiple of ${show(A, dec)}, so the left side no longer equals ${show(D, dec)}.`, `Only ${b(fmt(x))} works.`])] };
}
function clearLcm() {
  const ds = [rnd(2, 6), rnd(2, 6), rnd(2, 8)], m = ds.reduce(lcm, 1);
  if (new Set(ds).size < 2 || m > 30) return null;
  return { ask: 'What is the smallest number you can multiply both sides by to clear every fraction?', expr: `${F(1, ds[0])}x + ${F(1, ds[1])} = ${F(1, ds[2])}`, exprSmall: true, answer: num(m), hint: 'Find a number that every bottom number divides into exactly.', _t: { k: 'eqfrac', shape: 'clear-lcm', dens: ds, shown: ds },
    ways: [way('Least common multiple', [`The bottom numbers are ${ds.join(', ')}.`, `The smallest number they all divide into is ${b(m)}.`]), way('List multiples', [`Multiples of ${Math.max(...ds)}: ${[1, 2, 3, 4].map(k => k * Math.max(...ds)).join(', ')}, and so on.`, `The first one that all of ${ds.join(', ')} divide into is ${b(m)}.`])] };
}
function evalSide() {
  const dec = chance(0.5), [n, d] = pick(dec ? DEC : FR), x = d * nz(-4, 6), c = nz(-9, 9), A = Q(n, d), B = Q(c), v = add(mul(A, Q(x)), B);
  return { ask: `When x = ${fmt(x)}, what is the value of the left side?`, expr: side(A, B, dec), exprSmall: true, answer: num(val(v)), hint: 'Put the number in place of x, multiply first, then add or subtract.', _t: { k: 'eqfrac', shape: 'eval-side', L: [groups(1, val(A), val(B))], R: [], x, shown: [x, ...tShown(dec, A, B)] },
    ways: [way('Substitute', [`${show(A, dec)} × ${par(x)} = ${show(mul(A, Q(x)), dec)}.`, `${show(mul(A, Q(x)), dec)} ${pl(B, dec)} = ${b(show(v, dec))}.`]), way('Change the order', [`Work out the plain number first: ${fmt(c)}.`, `Add the x part, ${show(mul(A, Q(x)), dec)}, to get ${b(show(v, dec))}.`])] };
}
export function genEqFrac(L) {
  if (L === 1) return pick([() => oneFrac(false), () => oneFrac(true), checkYn, halfOf])();
  if (L === 2) return pick([() => bothSides(false), () => bothSides(true), distOne, whichValue])();
  return pick([() => distBoth(false), () => distBoth(true), clearLcm, evalSide, whichValue])();
}
