// Skill l4fest: estimating with fractions, benchmarks 0, 1/2 and 1, and spotting an unreasonable answer (5.NF.2).
import { R, rnd, pick, chance, shuffle, gcd, lcm, F, fr, b, k, way, nm, num, frac, choice, fracBar } from '../../util.js';
import { T, rd } from './helpers.js';
import { cn, term, imp, mix, mixedWays } from './fracs.js';

const HALF = F(1, 2);
const near = (n, d) => { const x = n / d; return x < 0.25 ? 0 : x < 0.75 ? 0.5 : 1; };
const label = v => (v === 0 ? '0' : v === 0.5 ? HALF : '1');
// A proper fraction that is not exactly between two benchmarks (so "closest" has one answer).
function proper() {
  for (;;) { const d = rnd(3, 12), n = cn(d), x = n / d; if (Math.abs(x - 0.25) > 1e-9 && Math.abs(x - 0.75) > 1e-9) return [n, d]; }
}
function feBench() {
  const [n, d] = proper(), t = near(n, d), lab = label(t);
  const why = t === 0 ? `${n} is a small part of ${d}, much less than half of it.` : t === 0.5 ? `${n} is close to half of ${d}.` : `${n} is nearly all of ${d}.`;
  return T({ ask: `Is ${F(n, d)} closest to 0, ${HALF} or 1?`, answer: choice(lab, [], { all: ['0', HALF, '1'] }), choiceBig: true,
    ways: [way('Compare with half', [`Half of ${d} is ${R(d / 2)}.`, why, `So ${F(n, d)} is closest to ${b(lab)}.`]),
      way('Picture it', [fracBar(n, d, { label: `${n}/${d}` }), `Compare the shaded part with an empty bar (0), a half-full bar and a full bar. It is nearest to ${b(lab)}.`])],
    hint: 'Is the top much smaller than the bottom, about half of it, or nearly all of it?' }, 'feBench', { n, d });
}
function feHalf() {
  const exact = chance(0.25);
  let d = rnd(4, 12), n;
  if (exact) { d = pick([4, 6, 8, 10, 12]); n = d / 2; } else do { n = rnd(1, d - 1); } while (2 * n === d);
  const lab = 2 * n === d ? 'Exactly 1/2' : 2 * n < d ? 'Less than 1/2' : 'More than 1/2';
  return T({ ask: `Is ${F(n, d)} less than, exactly or more than ${HALF}?`, answer: choice(lab, [], { all: ['Less than 1/2', 'Exactly 1/2', 'More than 1/2'] }), choiceBig: true,
    ways: [way('Half of the bottom', [`Half of ${d} is ${R(d / 2)}.`, `The top is ${n}, which is ${n * 2 === d ? 'the same as' : n * 2 < d ? 'less than' : 'more than'} ${R(d / 2)}.`, `So the answer is ${b(lab)}.`]),
      way('Double the top', [`If the top doubled is the same as the bottom, the fraction is exactly one half.`, `${n} × 2 = ${n * 2}, and the bottom is ${d}.`, `${n * 2} is ${n * 2 === d ? 'equal to' : n * 2 < d ? 'less than' : 'more than'} ${d}, so ${b(lab)}.`])],
    hint: 'Compare the top with half of the bottom.' }, 'feHalf', { n, d });
}
// Two fractions on the same side of one half (or one of them exactly a half): the sum is clearly more or less than 1.
function feOne() {
  const kinds = pick([['above', 'above'], ['below', 'below'], ['half', 'above'], ['half', 'below']]);
  const make = kind => { if (kind === 'half') return [1, 2]; for (;;) { const d = rnd(3, 12), n = cn(d); if ((kind === 'above') === (2 * n > d)) return [n, d]; } };
  const [a, c] = kinds.map(make), more = kinds.includes('above'), lab = more ? 'More than 1' : 'Less than 1', l = lcm(a[1], c[1]), top = a[0] * l / a[1] + c[0] * l / c[1];
  const rel = x => (x[0] * 2 === x[1] ? 'exactly' : x[0] * 2 > x[1] ? 'more than' : 'less than');
  return T({ ask: `Without adding, is ${F(a[0], a[1])} + ${F(c[0], c[1])} more or less than 1?`, answer: choice(lab, [], { all: ['Less than 1', 'More than 1'] }), choiceBig: true,
    ways: [way('Compare with one half', [`${F(a[0], a[1])} is ${rel(a)} ${HALF}, and ${F(c[0], c[1])} is ${rel(c)} ${HALF}.`, `Two halves make exactly 1, so the sum is ${more ? 'more' : 'less'} than 1.`, `So the answer is ${b(lab)}.`]),
      way('Add to check', [`Use the bottom ${l}: ${F(a[0] * l / a[1], l)} + ${F(c[0] * l / c[1], l)} = ${F(top, l)}.`, `${top} is ${more ? 'more' : 'less'} than ${l}, so ${b(lab)}.`])],
    hint: 'Is each fraction more or less than one half? Two halves make 1.' }, 'feOne', { a, c });
}
function feSum() {
  for (;;) {
    const [n1, d1] = proper(), [n2, d2] = proper(), v1 = near(n1, d1), v2 = near(n2, d2), s = v1 + v2;
    if (s === 0) continue;
    return T({ ask: `Round each fraction to 0, ${HALF} or 1. Then add.`, expr: `${F(n1, d1)} + ${F(n2, d2)}`, answer: frac(s * 2, 2),
      ways: [way('Round, then add', [`${F(n1, d1)} is closest to ${label(v1)}, and ${F(n2, d2)} is closest to ${label(v2)}.`, `${label(v1)} + ${label(v2)} = ${b(fr(s * 2, 2))}`]),
        way('Use bars', [fracBar(n1, d1, { label: `${n1}/${d1}` }), fracBar(n2, d2, { label: `${n2}/${d2}` }), `Each bar is nearest to ${label(v1)} and ${label(v2)}. Together that is about ${b(fr(s * 2, 2))}.`])],
      hint: 'Decide for each fraction whether it is closest to 0, one half or 1. Then add those.' }, 'feSum', { a: [n1, d1], c: [n2, d2] });
  }
}
// A mixed number whose fraction part is clearly near 0, 1/2 or 1 (so rounding it to a half has one answer).
function nearTerm(maxW = 5) {
  for (;;) { const d = rnd(3, 10), t = term(rnd(1, maxW), d), x = t.n / d, dist = Math.min(x, Math.abs(x - 0.5), 1 - x); if (dist <= 0.2) return t; }
}
const toHalf = t => { const x = t.n / t.d; return t.w + (x < 0.25 ? 0 : x < 0.75 ? 0.5 : 1); };
const halfHTML = v => (v % 1 ? (v >= 1 ? `${Math.floor(v)} ${HALF}` : HALF) : String(v));
const exactOf = (A, B, op) => mixedWays(A, B, op);
function feWhole() {
  for (;;) {
    const d1 = pick([3, 4, 5, 6, 7, 8, 9, 10]), d2 = pick([3, 4, 5, 6, 7, 8, 9, 10]), A = term(rnd(2, 8), d1), B = term(rnd(1, 7), d2), add = chance(0.5);
    const rA = A.w + (A.n / A.d > 0.5 ? 1 : 0), rB = B.w + (B.n / B.d > 0.5 ? 1 : 0), ans = add ? rA + rB : rA - rB;
    if (ans < 1 || (!add && imp(A) / A.d <= imp(B) / B.d)) continue;
    const { res, l } = exactOf(A, B, add ? '+' : '−'), op = add ? '+' : '−';
    return T({ ask: 'Estimate by rounding each mixed number to the nearest whole number.', expr: `${mix(A)} ${op} ${mix(B)}`, answer: num(ans),
      ways: [way('Round each one', [`${mix(A)} is closer to ${rA}, because ${F(A.n, A.d)} is ${A.n / A.d > 0.5 ? 'more' : 'less'} than ${HALF}.`, `${mix(B)} is closer to ${rB}, because ${F(B.n, B.d)} is ${B.n / B.d > 0.5 ? 'more' : 'less'} than ${HALF}.`, `${rA} ${op} ${rB} = ${b(ans)}`]),
        way('Check with the exact answer', [`The exact answer is ${fr(res, l)}.`, `That is close to ${b(ans)}, so the estimate makes sense.`])],
      hint: 'Is the fraction part more or less than one half? Round up if more, down if less.' }, 'feWhole', { A, B, add });
  }
}
const mixedOpt = v => { const w = Math.floor(v); return v % 1 ? (w ? `${w} ${HALF}` : HALF) : String(v); };
function fePick() {
  for (;;) {
    const A = nearTerm(), B = nearTerm(), add = chance(0.6), est = add ? toHalf(A) + toHalf(B) : toHalf(A) - toHalf(B);
    if (est < 2 || (!add && imp(A) / A.d <= imp(B) / B.d)) continue;
    const { res, l } = exactOf(A, B, add ? '+' : '−'), op = add ? '+' : '−', opts = [est, est + 1, est - 1, est + 2].map(mixedOpt);
    return T({ ask: `Which is the best estimate for ${mix(A)} ${op} ${mix(B)}?`, answer: choice(mixedOpt(est), opts.slice(1)),
      ways: [way('Round to the nearest half', [`${mix(A)} is about ${halfHTML(toHalf(A))} and ${mix(B)} is about ${halfHTML(toHalf(B))}.`, `${halfHTML(toHalf(A))} ${op} ${halfHTML(toHalf(B))} = ${b(mixedOpt(est))}`]),
        way('Check the exact answer', [`The exact answer is ${fr(res, l)}.`, `${b(mixedOpt(est))} is the choice closest to it. The other choices are each at least a half away from it.`])],
      hint: 'Round each number to the nearest half (a whole or a whole and a half), then add or subtract.' }, 'fePick', { A, B, add });
  }
}
function feUnreal(L) {
  for (;;) {
    const top = L === 3 ? 12 : 9, d1 = rnd(3, top), d2 = rnd(3, top), n1 = rnd(Math.floor(d1 / 2) + 1, d1 - 1), n2 = rnd(Math.floor(d2 / 2) + 1, d2 - 1);
    if (2 * n1 <= d1 || 2 * n2 <= d2 || gcd(n1, d1) > 1 || gcd(n2, d2) > 1) continue;
    const e8 = (n1 / d1 + n2 / d2) * 8, lo = Math.max(9, Math.ceil(e8 - 3)), hi = Math.floor(e8 + 3);
    if (hi - lo < 2) continue;
    const wrong = fr(n1 + n2, d1 + d2), good = shuffle(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)).slice(0, 3).map(v => fr(v, 8));
    return T({ ask: `Which answer is NOT reasonable for ${F(n1, d1)} + ${F(n2, d2)}?`, answer: choice(wrong, good),
      ways: [way('Compare with 1', [`${F(n1, d1)} is more than ${HALF} and so is ${F(n2, d2)}. Two numbers over one half add to more than 1.`, `${wrong} is less than 1, so it cannot be the sum: ${b(wrong)}`]),
        way('Spot the mistake', [`${b(wrong)} comes from adding the tops and the bottoms: ${n1} + ${n2} = ${n1 + n2} and ${d1} + ${d2} = ${d1 + d2}.`, 'That is not how fractions add, and the result is smaller than either fraction you started with.'])],
      hint: 'Both fractions are more than one half. What does that say about the sum?' }, 'feUnreal', { a: [n1, d1], c: [n2, d2] });
  }
}
function feHalfEst() {
  for (;;) {
    const A = nearTerm(8), B = nearTerm(5), add = chance(0.5), hA = toHalf(A), hB = toHalf(B), est = add ? hA + hB : hA - hB;
    if (est <= 0 || (!add && imp(A) / A.d <= imp(B) / B.d)) continue;
    const { res, l } = exactOf(A, B, add ? '+' : '−'), op = add ? '+' : '−';
    return T({ ask: 'Estimate by rounding each number to the nearest half.', expr: `${mix(A)} ${op} ${mix(B)}`, answer: frac(est * 2, 2),
      ways: [way('Round each to a half', [`${mix(A)} is about ${halfHTML(hA)} and ${mix(B)} is about ${halfHTML(hB)}.`, `${halfHTML(hA)} ${op} ${halfHTML(hB)} = ${b(halfHTML(est))}`]),
        way('Compare with the exact answer', [`The exact answer is ${fr(res, l)}.`, `The estimate ${b(halfHTML(est))} is close to it, so the estimate is sensible.`])],
      hint: 'A fraction part near 0 rounds down, near one half stays, near 1 rounds up.' }, 'feHalfEst', { A, B, add });
  }
}
const FITS = [(n, c) => ({ what: `A mixing bowl holds ${k(c + ' cups')}. A recipe needs ${n[0]} cups of flour and ${n[1]} cups of sugar.`, ask: 'Will the flour and sugar fit in the bowl together?' }),
  (n, c) => ({ what: `A bag holds ${k(c + ' pounds')}. ${nm()} packs ${n[0]} pounds of books and ${n[1]} pounds of clothes.`, ask: 'Will everything fit in the bag without going over its limit?' }),
  (n, c) => ({ what: `A pitcher holds ${k(c + ' liters')}. ${nm()} pours in ${n[0]} liters of juice and ${n[1]} liters of lemonade.`, ask: 'Will both drinks fit in the pitcher?' })];
function feFits() {
  for (;;) {
    const A = nearTerm(), B = nearTerm(), exact = imp(A) / A.d + imp(B) / B.d, c = Math.round(exact) + pick([-2, -1, 1, 2]);
    if (c < 2 || Math.abs(exact - c) < 0.55) continue;
    const yes = exact <= c, est = toHalf(A) + toHalf(B), ans = yes ? 'Yes' : 'No', { res, l } = exactOf(A, B, '+'), x = pick(FITS)([k(mix(A)), k(mix(B))], c);
    return T({ story: x.what, ask: x.ask, answer: choice(ans, [], { all: ['Yes', 'No'] }), choiceBig: true, op: 'multi',
      ways: [way('Round to the nearest half', [`${mix(A)} is about ${halfHTML(toHalf(A))} and ${mix(B)} is about ${halfHTML(toHalf(B))}.`, `${halfHTML(toHalf(A))} + ${halfHTML(toHalf(B))} = ${halfHTML(est)}, which is ${est <= c ? 'less than' : 'more than'} ${c}.`, `So the answer is ${b(ans)}.`]),
        way('Add them exactly', [`${mix(A)} + ${mix(B)} = ${fr(res, l)}.`, `${fr(res, l)} is ${yes ? 'no more than' : 'more than'} ${c}, so ${b(ans)}.`])],
      read: rd('Whether the two amounts fit in the space.', [mix(A), mix(B), `${c} is the limit`], '“fit” means the total must not be more than the limit, so add and compare', `${mix(A)} + ${mix(B)} compared with ${c}`), hint: 'Round each amount to the nearest half, add them, and compare with the limit.' }, 'feFits', { A, B, c });
  }
}
export function genFracEst(L) {
  if (L === 1) return pick([feBench, feHalf, feOne, feSum])();
  if (L === 2) return pick([feOne, feWhole, fePick, () => feUnreal(2), feSum])();
  return pick([feHalfEst, () => feUnreal(3), feFits, fePick, feWhole])();
}
