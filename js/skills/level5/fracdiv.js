// Dividing fractions by fractions: "how many fit?", common denominators, and why flip-and-multiply works.
import { rnd, pick, chance, gcd, lcm, F, M, fr, b, k, way, nm, num, frac, fracBar } from '../../util.js';
import { T, coprime } from './helpers.js';

const show = (w, n, d) => M(w, n, d);
// The two worked solutions for (N1/d1) ÷ (N2/d2), both given as fractions that may be improper.
function divWays(N1, d1, N2, d2, pre = []) {
  const L = lcm(d1, d2), A = N1 * L / d1, B = N2 * L / d2, res = fr(N1 * d2, d1 * N2);
  const same = [...pre];
  if (d1 !== d2) same.push(`Cut both into pieces of the same size (bottom number ${L}): ${F(N1, d1)} = ${F(A, L)} and ${F(N2, d2)} = ${F(B, L)}`);
  same.push(`Now it is a question about counting pieces: how many groups of ${B} piece${B > 1 ? 's' : ''} fit into ${A} pieces?`, `${A} ÷ ${B} = ${b(res)}`);
  const flip = [...pre, `Dividing by ${F(1, d2)} asks how many pieces of size ${F(1, d2)} fit. ${d2} fit in every whole, so that multiplies by ${d2}.`];
  if (N2 > 1) flip.push(`But each group needs ${N2} of those pieces, so there are ${N2} times fewer groups: divide by ${N2}.`);
  flip.push(`Times ${d2}${N2 > 1 ? ` and divided by ${N2}` : ''} is the same as multiplying by ${F(d2, N2)}, the divisor flipped over.`, `${F(N1, d1)} × ${F(d2, N2)} = ${F(N1 * d2, d1 * N2)}${gcd(N1 * d2, d1 * N2) > 1 || N1 * d2 > d1 * N2 ? ` = ${b(res)}` : ''}`);
  return [way('Same-size pieces', same), way('Flip and multiply (and why)', flip)];
}
function fitSameDen() {
  const d = pick([4, 5, 6, 8, 9, 10, 12]), n2 = rnd(1, Math.floor(d / 3)), q = rnd(2, Math.floor((d - 1) / n2)), n1 = n2 * q;
  if (q < 2 || n1 >= d) return fitSameDen();
  return T({ ask: `How many groups of ${F(n2, d)} fit into ${F(n1, d)}?`, expr: `${F(n1, d)} ÷ ${F(n2, d)}`, visual: fracBar(n1, d), answer: num(q), ways: divWays(n1, d, n2, d),
    hint: `The pieces are already the same size. How many groups of ${n2} can you make from ${n1} shaded pieces?` }, 'fdiv', { n1, d1: d, n2, d2: d });
}
function fitWhole() {
  const [n, d] = coprime(2, 5), w = n * rnd(1, n > 3 ? 1 : 2);
  if (n > d) return fitWhole();
  return T({ ask: `How many pieces of size ${F(n, d)} fit into ${w} whole${w > 1 ? 's' : ''}?`, expr: `${w} ÷ ${F(n, d)}`, visual: fracBar(w * d, d), answer: num(w * d / n), ways: divWays(w, 1, n, d, [`Write ${w} as ${F(w, 1)}. The bar shows ${w} whole${w > 1 ? 's' : ''}, each cut into ${d} equal pieces: ${w * d} pieces.`]),
    hint: `Cut each whole into ${d} equal pieces first. How many small pieces is that altogether?` }, 'fdiv', { n1: w, d1: 1, n2: n, d2: d });
}
// A fraction divided by a smaller unit fraction: the pieces get cut into m smaller pieces each.
function fitUnit() {
  const d1 = rnd(2, 5), m = rnd(2, 3); let n1; do n1 = rnd(1, d1 - 1); while (gcd(n1, d1) > 1);
  return T({ ask: `How many pieces of size ${F(1, d1 * m)} fit into ${F(n1, d1)}?`, expr: `${F(n1, d1)} ÷ ${F(1, d1 * m)}`, visual: fracBar(n1 * m, d1 * m), answer: num(n1 * m), ways: divWays(n1, d1, 1, d1 * m, [`The bar shows ${F(n1, d1)} with every piece cut into ${m} smaller pieces.`]),
    hint: `Cut each piece of ${F(n1, d1)} into ${m} equal smaller pieces. How many small pieces is that?` }, 'fdiv', { n1, d1, n2: 1, d2: d1 * m });
}
function plainDivide() {
  let d1, d2, n1, n2;
  do { d1 = rnd(2, 9); d2 = rnd(2, 9); n1 = rnd(1, d1 - 1); n2 = rnd(1, d2 - 1); } while (gcd(n1, d1) > 1 || gcd(n2, d2) > 1 || (n1 === n2 && d1 === d2) || (n1 === 1 && n2 === 1));
  return T({ ask: 'Divide. Write the answer as a fraction or mixed number.', expr: `${F(n1, d1)} ÷ ${F(n2, d2)}`, answer: frac(n1 * d2, d1 * n2), ways: divWays(n1, d1, n2, d2),
    hint: 'Give both fractions the same bottom number, then ask how many groups fit. Tip: the tidiest answer is in simplest form.' }, 'fdiv', { n1, d1, n2, d2 });
}
function mixedDivide() {
  const d1 = rnd(2, 6), d2 = rnd(2, 6), w1 = rnd(1, 4), w2 = chance(0.4) ? rnd(1, 2) : 0; let n1, n2;
  do { n1 = rnd(1, d1 - 1); n2 = rnd(1, d2 - 1); } while (gcd(n1, d1) > 1 || gcd(n2, d2) > 1);
  const N1 = w1 * d1 + n1, N2 = w2 * d2 + n2;
  if (N1 * d2 === N2 * d1) return mixedDivide();
  const pre = [`Turn mixed numbers into fractions first: ${show(w1, n1, d1)} = ${F(N1, d1)}${w2 ? ` and ${show(w2, n2, d2)} = ${F(N2, d2)}` : ''}`];
  return T({ ask: 'Divide. Write the answer as a fraction or mixed number.', expr: `${show(w1, n1, d1)} ÷ ${show(w2, n2, d2)}`, answer: frac(N1 * d2, d1 * N2), ways: divWays(N1, d1, N2, d2, pre),
    hint: 'Change every mixed number into a fraction before you divide. Tip: the tidiest answer is in simplest form.' }, 'fdiv', { n1: N1, d1, n2: N2, d2 });
}
const CUT = [
  (t, p, n) => [`${n} has a ribbon ${k(t + ' meters')} long and cuts it into pieces that are each ${k(p + ' of a meter')}.`, 'How many pieces does that make?', 'pieces'],
  (t, p) => [`A pot holds ${k(t + ' liters')} of soup. Each bowl takes ${k(p + ' of a liter')}.`, 'How many bowls can be filled?', 'bowls'],
  (t, p, n) => [`${n} practices guitar for ${k(t + ' hours')} this week, in sessions of ${k(p + ' of an hour')}.`, 'How many sessions is that?', 'sessions'],
  (t, p) => [`A trail is ${k(t + ' km')} long. There is a marker every ${k(p + ' of a km')}.`, 'How many marker-to-marker sections is the trail split into?', 'sections'],
  (t, p) => [`A builder has a board ${k(t + ' meters')} long and needs shelves that are each ${k(p + ' of a meter')}.`, 'How many shelves can be cut?', 'shelves'],
];
// Total length divided into equal fraction-sized pieces; the count comes out whole.
export function fracDivWord() {
  const [n, d] = coprime(2, 6); if (n > d) return fracDivWord();
  const q = rnd(2, 9), N1 = q * n, w = Math.floor(N1 / d), r = N1 % d, total = r ? show(w, r / gcd(r, d), d / gcd(r, d)) : String(w);
  const [story, ask, unit] = pick(CUT)(total, F(n, d), nm());
  return T({ story, ask, answer: num(q), suffix: unit, op: 'div',
    ways: divWays(N1, d, n, d, r && w ? [`Write the total with ${d} on the bottom: ${total} = ${F(N1, d)}`] : r ? [] : [`Write the total with ${d} on the bottom: ${w} = ${F(N1, d)}`]),
    read: { find: `How many ${unit}.`, know: [`total: ${total}`, `each one: ${F(n, d)}`], clue: 'Cutting a total into equal pieces of a known size is “how many fit?”, which is division.', plan: `${total} ÷ ${F(n, d)}` },
    hint: `How many pieces of size ${F(n, d)} fit into ${total}? Give both the bottom number ${d}.` }, 'fdiv', { n1: N1, d1: d, n2: n, d2: d });
}
export function genFracDiv(L) {
  if (L === 1) return pick([fitSameDen, fitWhole, fitUnit])();
  if (L === 2) return chance(0.25) ? fracDivWord() : plainDivide();
  return chance(0.35) ? fracDivWord() : mixedDivide();
}
