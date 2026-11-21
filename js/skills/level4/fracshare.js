// Skill l4fshare: a fraction is a division, and sharing stories whose answer is a fraction or mixed number (5.NF.3).
import { R, rnd, pick, chance, gcd, lcm, fmt, F, fr, b, k, way, nm, num, frac, choice } from '../../util.js';
import { T, rd, pl } from './helpers.js';

const THINGS = [['pizza', 'pizzas'], ['pan of brownies', 'pans of brownies'], ['sandwich', 'sandwiches'], ['loaf of bread', 'loaves of bread'], ['bar of chocolate', 'bars of chocolate']];
const AMOUNTS = [['meter of ribbon', 'meters of ribbon'], ['liter of juice', 'liters of juice'], ['pound of trail mix', 'pounds of trail mix'], ['cup of rice', 'cups of rice']];
const WHO = [['friend', 'friends'], ['teammate', 'teammates'], ['cousin', 'cousins'], ['bandmate', 'bandmates']];

// Coprime n and d, with n below d (a proper fraction) or above it (an improper one).
function pairND(improper, dMax = 9) {
  for (;;) {
    const d = rnd(2, dMax), n = improper ? rnd(d + 1, Math.min(5 * d, 40)) : rnd(1, d - 1);
    if (gcd(n, d) === 1) return [n, d];
  }
}
export function shareWord(L = 2) {
  const lv = Math.min(3, Math.max(1, L)), [a, d] = pairND(lv > 1, lv === 3 ? 8 : 6), [one, many] = pick(lv === 3 ? AMOUNTS : THINGS), [wo, wm] = pick(WHO);
  if (a < 2) return shareWord(L);
  return T({ story: `${k(pl(d, wo, wm))} share ${k(pl(a, one, many))} equally.`, ask: 'How much does each one get?', answer: frac(a, d), op: 'div',
    ways: [way('A fraction is a division', ['The fraction bar means “divided by”: the amount shared goes on top and the number of people goes on the bottom.', `${a} ÷ ${d} = ${F(a, d)}${a > d ? ` = ${b(fr(a, d))}` : ''}${a < d ? `, so each gets ${b(fr(a, d))}` : ''}`]),
      way('Cut and share', [`Cut every one into ${d} equal pieces. That makes ${a * d} pieces, and each piece is ${F(1, d)}.`, `Share ${a * d} pieces among ${d}: ${a * d} ÷ ${d} = ${a} pieces each.`, `${a} pieces of ${F(1, d)} is ${b(fr(a, d))}`])],
    read: rd('How much ONE person gets.', [pl(a, one, many), pl(d, wo, wm)], '“share equally” means divide. The answer can be a fraction.', `${a} ÷ ${d} = ${a}/${d}`), hint: 'The amount shared goes on top and the number of people goes on the bottom.' }, 'shShare', { a, d });
}
function shWrite() {
  let n, d; do { [n, d] = pairND(chance(0.4)); } while (n === d);
  const good = `${n} ÷ ${d}`, bad = [`${d} ÷ ${n}`, `${n} × ${d}`, n < d ? `${d} − ${n}` : `${n} − ${d}`];
  return T({ ask: `Which one is the same as ${F(n, d)}?`, answer: choice(good, bad),
    ways: [way('The fraction bar', ['The bar in a fraction means “divided by”.', `The top is divided by the bottom: ${b(good)}`]),
      way('Think of sharing', [`${F(n, d)} is what each person gets when ${n} whole things are shared equally among ${d} people.`, `That is ${b(good)}.`])],
    hint: 'The bar in a fraction means “divided by”. Which number is divided?' }, 'shWrite', { n, d });
}
function shRev() {
  const [n, d] = pairND(false, 8), [one, many] = pick(THINGS);
  if (n < 2) return shRev();
  return T({ ask: `${pl(n, one, many)} are shared equally. Each person gets ${F(n, d)} of one. How many people shared?`, answer: num(d),
    ways: [way('Top and bottom', [`The amount shared goes on top and the number of people on the bottom: ${F(n, d)}.`, `So the number of people is ${b(d)}.`]),
      way('Divide it', [`${n} ÷ ? = ${F(n, d)}, and a fraction is a division.`, `${n} ÷ ${d} = ${F(n, d)}, so ${b(d)} people shared.`])],
    hint: 'In a fraction made by sharing, the number of people is the bottom number.' }, 'shRev', { n, d });
}
const TEN = { 2: 10, 4: 100, 5: 10, 8: 1000, 10: 10, 20: 100, 25: 100, 40: 1000, 50: 100 };
function shDec(L) {
  const d = pick(L === 1 ? [2, 4, 5, 10] : L === 2 ? [4, 5, 8, 10, 20, 25] : [8, 20, 25, 40, 50]), n = L === 3 ? rnd(1, 2 * d) : rnd(1, d - 1);
  const p = TEN[d], kk = p / d, dec = fmt(R(n / d));
  return T({ ask: `Write ${n} ÷ ${d} as a decimal.`, answer: num(R(n / d)),
    ways: [way('Make the bottom 10, 100 or 1000', [`${F(n, d)} means ${n} ÷ ${d}. Multiply the top and bottom by ${kk} to make the bottom ${p}.`, `${F(n, d)} = ${F(`${n} × ${kk}`, `${d} × ${kk}`)} = ${F(n * kk, p)} = ${b(dec)}`]),
      way('Divide', [`${n} ÷ ${d} = ${b(dec)}`])],
    hint: 'Make the bottom number 10, 100 or 1,000 by multiplying the top and the bottom by the same number.' }, 'shDec', { n, d });
}
function shBetween(L) {
  for (;;) {
    const d = rnd(3, L === 3 ? 12 : 9), n = rnd(2 * d + 1, L === 3 ? 100 : 60);
    if (n % d === 0) continue;
    const a = Math.floor(n / d), r = n % d, pr = x => `${x} and ${x + 1}`;
    return T({ ask: `Between which two neighboring whole numbers is ${n} ÷ ${d}?`, answer: choice(pr(a), [pr(a - 1), pr(a + 1), pr(a + 2)]),
      ways: [way('Count whole groups', [`${a} × ${d} = ${a * d}, which fits into ${n}.`, `${a + 1} × ${d} = ${(a + 1) * d}, which is too big.`, `So ${n} ÷ ${d} is between ${a} and ${a + 1}: ${b(pr(a))}`]),
        way('Look at the leftover', [`${n} ÷ ${d} gives ${a} whole groups with ${r} left over.`, `The leftover is a part of one more group, so the answer is ${b(pr(a))}.`])],
      hint: 'How many whole groups fit? Multiply the divisor by whole numbers until you pass the dividend.' }, 'shBetween', { n, d });
  }
}
function shRem() {
  const [n, d] = pairND(true, 9), q = Math.floor(n / d), r = n % d;
  return T({ ask: `${n} ÷ ${d} gives ${q} with ${r} left over. Write the answer as a mixed number.`, answer: frac(n, d),
    ways: [way('Share the leftovers', [`The ${r} left over are shared among ${d}, so each gets ${F(r, d)} more.`, `${q} and ${F(r, d)} is ${b(fr(n, d))}`]),
      way('As a fraction', [`${n} ÷ ${d} = ${F(n, d)}`, `${F(n, d)} = ${b(fr(n, d))}`])],
    hint: 'The number left over goes on top of the fraction, and the number you divided by goes on the bottom.' }, 'shRem', { n, d });
}
const SAME = { 2: [[4, 2]], 4: [[8, 2]], 5: [[10, 2]] };
function shCmp() {
  const [one, many] = pick(THINGS), d1 = pick([2, 4, 5, 8, 10]), a1 = rnd(2, 8);
  let d2 = pick([2, 4, 5, 8, 10]), a2 = rnd(2, 8);
  if (SAME[d1] && chance(0.12)) { const [dd, m] = pick(SAME[d1]); d2 = dd; a2 = a1 * m; }
  const c = a1 * d2 - a2 * d1, win = c === 0 ? 'They get the same' : c > 0 ? 'Team A' : 'Team B', l = lcm(d1, d2), x = a1 * l / d1, y = a2 * l / d2;
  return T({ ask: `Team A shares ${pl(a1, one, many)} equally among ${pl(d1, 'person', 'people')}. Team B shares ${pl(a2, one, many)} equally among ${pl(d2, 'person', 'people')}. Who gets more each?`,
    answer: choice(win, [], { all: ['Team A', 'Team B', 'They get the same'] }),
    ways: [way('Give them the same bottom', [`${a1} ÷ ${d1} = ${F(a1, d1)} = ${F(x, l)} and ${a2} ÷ ${d2} = ${F(a2, d2)} = ${F(y, l)}.`, `Compare the tops: ${x} and ${y}.`, `So ${b(win)}.`]),
      way('Use decimals', [`${a1} ÷ ${d1} = ${fmt(R(a1 / d1))}`, `${a2} ÷ ${d2} = ${fmt(R(a2 / d2))}`, `So ${b(win)}.`])],
    hint: 'Turn each share into a fraction, then compare them with the same bottom number.' }, 'shCmp', { a1, d1, a2, d2 });
}
function shThen() {
  for (;;) {
    const len = rnd(2, 9), d = rnd(3, 8), m = rnd(2, d - 1);
    if ((len * m) % d === 0) continue;
    return T({ story: `A ribbon is ${k(len + ' meters')} long. ${nm()} cuts it into ${k(d + ' equal pieces')} and uses ${k(m + ' of the pieces')} for a banner.`, ask: 'How long is the part that is used?', answer: frac(len * m, d), op: 'multi',
      ways: [way('Length of one piece', [`${len} ÷ ${d} = ${F(len, d)} meter for each piece.`, `${m} pieces: ${m} × ${F(len, d)} = ${F(m * len, d)} = ${b(fr(m * len, d))}`]),
        way('Fraction of the ribbon', [`The used part is ${m} out of ${d} equal pieces, which is ${F(m, d)} of the ribbon.`, `${m} × ${len} = ${m * len}, and ${m * len} ÷ ${d} = ${b(fr(m * len, d))}`])],
      read: rd('The length of ribbon that is used.', [`${len} meters in all`, `${d} equal pieces`, `${m} pieces used`], 'Split into equal pieces means divide. Using several of them means multiply.', `${len} ÷ ${d}, then × ${m}`), hint: 'Find the length of one piece first.' }, 'shThen', { len, d, m });
  }
}
function shTotal() {
  for (;;) {
    const p = rnd(3, 8), d = rnd(3, 8), n = rnd(1, d - 1);
    if (gcd(n, d) > 1 || (p * n) % d === 0) continue;
    const [one, many] = pick(THINGS);
    return T({ story: `${k(p + ' friends')} each get ${k(F(n, d))} of a ${one}.`, ask: `How many ${many} were shared in all?`, answer: frac(p * n, d), op: 'mul',
      ways: [way('Multiply', [`${p} × ${F(n, d)} = ${F(p * n, d)} = ${b(fr(p * n, d))}`]),
        way('Count the pieces', [`Each friend gets ${n} pieces, and each piece is ${F(1, d)} of one.`, `${p} × ${n} = ${p * n} pieces, and ${d} pieces make one.`, `${p * n} ÷ ${d} = ${b(fr(p * n, d))}`])],
      read: rd('The total amount that was shared.', [`${p} friends`, `${F(n, d)} each`], '“each” with a fraction means multiply the fraction by the number of people.', `${p} × ${n}/${d}`), hint: 'Each friend gets the same share, so multiply the share by the number of friends.' }, 'shTotal', { p, n, d });
  }
}
export function genFracShare(L) {
  if (L === 1) return pick([shWrite, () => shareWord(1), shRev, () => shDec(1)])();
  if (L === 2) return pick([() => shareWord(2), () => shBetween(2), shRem, shCmp, () => shDec(2)])();
  return pick([shThen, shTotal, () => shBetween(3), () => shDec(3), () => shareWord(3)])();
}
