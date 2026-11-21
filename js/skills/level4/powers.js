// Skill l4pow: powers of 10 and exponents (5.NBT.2).
import { R, rnd, pick, chance, shuffle, fmt, places, pow, b, k, way, num, choice } from '../../util.js';
import { T, BLANK, pl, rd } from './helpers.js';

const P = e => 10 ** e;
const tens = e => Array(e).fill('10').join(' × ');
function tensChain(e) {
  const out = []; let v = 10;
  for (let i = 2; i <= e; i++) { out.push(`${fmt(v)} × 10 = ${i === e ? b(fmt(v * 10)) : fmt(v * 10)}`); v *= 10; }
  return out;
}
// Ways for "x times or divided by 10 to a power": slide the digits, or just calculate.
function shiftWays(x, e, mult) {
  const ans = R(mult ? x * P(e) : x / P(e)), dir = mult ? 'left' : 'right';
  return { ans, ways: [
    way('Slide the digits', [`${pow(10, e)} is ${tens(e)} = ${fmt(P(e))}, a 1 with ${pl(e, 'zero')}.`,
      `${mult ? 'Multiplying' : 'Dividing'} by it slides every digit ${pl(e, 'place')} to the ${dir}, because each place is worth 10 times the place next to it.`,
      `${fmt(x)} becomes ${b(fmt(ans))}`]),
    way('Calculate it', [`${pow(10, e)} = ${fmt(P(e))}`, `${fmt(x)} ${mult ? '×' : '÷'} ${fmt(P(e))} = ${b(fmt(ans))}`])] };
}
function pval() {
  const e = rnd(2, 5);
  return T({ ask: 'What is the value?', expr: pow(10, e), answer: num(P(e)),
    ways: [way('Multiply the tens', [`${pow(10, e)} means ${pl(e, 'ten')} multiplied together: ${tens(e)}`, ...tensChain(e)]),
      way('Count the zeros', ['The exponent tells how many zeros follow the 1.', `${pl(e, 'zero')} gives ${b(fmt(P(e)))}`])],
    hint: 'The little number says how many tens to multiply. Write them out.' }, 'pval', { e });
}
function pexp() {
  const e = rnd(2, 6);
  return T({ ask: 'Which exponent goes in the box?', expr: `${fmt(P(e))} = ${pow(10, BLANK)}`, answer: num(e),
    ways: [way('Count the zeros', [`${fmt(P(e))} is a 1 followed by ${pl(e, 'zero')}.`, `Each zero is one more factor of 10, so ${fmt(P(e))} = ${pow(10, e)}.`, `The exponent is ${b(e)}.`]),
      way('Count the tens', [`${tens(e)} = ${fmt(P(e))}`, `That is ${pl(e, 'ten')} multiplied together, so the exponent is ${b(e)}.`])],
    hint: 'How many zeros come after the 1?' }, 'pexp', { e });
}
function pmul(L) {
  const e = L === 1 ? rnd(1, 3) : rnd(1, 4);
  const x = L === 1 ? rnd(2, 99) : chance(0.7) ? R(rnd(11, 999) / pick([10, 100])) : rnd(100, 999);
  if (x * P(e) >= 1e6) return pmul(L);
  const { ans, ways } = shiftWays(x, e, true);
  return T({ ask: 'Solve.', expr: `${fmt(x)} × ${pow(10, e)}`, answer: num(ans), ways, hint: 'The exponent says how many places the digits slide. Which way do they go when you multiply?' }, 'pmul', { x, e });
}
function pdiv(L) {
  const e = rnd(1, 3);
  const x = L === 1 ? rnd(2, 99) * P(e) : R(rnd(11, 999) / pick([1, 1, 10]));
  if (places(x / P(e)) > 3) return pdiv(L);
  const { ans, ways } = shiftWays(x, e, false);
  return T({ ask: 'Solve.', expr: `${fmt(x)} ÷ ${pow(10, e)}`, answer: num(ans), ways, hint: 'The exponent says how many places the digits slide. Which way do they go when you divide?' }, 'pdiv', { x, e });
}
// Which of these is the same as ten multiplied by itself e times?
function pchoice() {
  const e = rnd(3, 5);
  return T({ ask: 'Which one is the same as this?', expr: tens(e), answer: choice(pow(10, e), [`10 × ${e}`, pow(e, 10), pow(10, e + 1)]),
    ways: [way('Count the tens', [`${tens(e)} has ${pl(e, 'ten')} multiplied together.`, `The number being multiplied is the base (10) and how many times is the exponent (${e}): ${b(pow(10, e))}`]),
      way('Rule out the others', [`10 × ${e} = ${10 * e} is just ten, ${e} times added up.`, `${pow(e, 10)} multiplies ${e}s, not tens, and ${pow(10, e + 1)} has one ten too many.`, `That leaves ${b(pow(10, e))}`])],
    hint: 'The base is the number being multiplied, the exponent is how many of them.' }, 'pchoice', { e });
}
function pmiss(L) {
  const e = rnd(2, L === 3 ? 5 : 4), mult = chance(0.5), small = R(rnd(11, 99) / pick([1, 10, 100])), big = R(small * P(e));
  const [x, y] = mult ? [small, big] : [big, small];
  return T({ ask: 'Which exponent makes this true?', expr: `${fmt(x)} ${mult ? '×' : '÷'} ${pow(10, BLANK)} = ${fmt(y)}`, answer: num(e),
    ways: [way('Watch the decimal point', [`${fmt(x)} and ${fmt(y)} have the same digits, so only the decimal point moved.`, `It moved ${pl(e, 'place')} to the ${mult ? 'right' : 'left'}, so the exponent is ${b(e)}.`]),
      way('Calculate it', [`Try ${pow(10, e)} = ${fmt(P(e))}.`, `${fmt(x)} ${mult ? '×' : '÷'} ${fmt(P(e))} = ${fmt(y)}, so the exponent is ${b(e)}.`])],
    hint: 'Which way did the decimal point move, and by how many places?' }, 'pmiss', { x, y, mult });
}
// How many times as much is the digit d in A as the same digit in B (whole numbers when dec is false).
function pratio(dec) {
  const d = rnd(2, 9), a = dec ? rnd(0, 2) : rnd(2, 4), c = dec ? -rnd(1, 3) : rnd(1, a - 1), A = d * P(a), B = R(d * P(c)), ans = P(a - c);
  return T({ ask: `The ${d} in ${fmt(A)} is worth how many times the ${d} in ${fmt(B)}?`, answer: num(ans),
    ways: [way('Count the places', [`Going from ${fmt(B)} to ${fmt(A)}, the ${d} moves ${pl(a - c, 'place')} to the left.`, `Each place is 10 times bigger, so that is ${pow(10, a - c)} = ${b(fmt(ans))} times.`]),
      way('Divide the values', [`The ${d} in ${fmt(A)} is worth ${fmt(A)}. The ${d} in ${fmt(B)} is worth ${fmt(B)}.`, `${fmt(A)} ÷ ${fmt(B)} = ${b(fmt(ans))}`])],
    hint: 'How many places apart are the two digits? Each step left makes it 10 times as big.' }, 'pratio', { d, A, B });
}
const PACKS = [['box', 'boxes', 'paperclips', [2, 3]], ['roll', 'rolls', 'stickers', [2]], ['bag', 'bags', 'beads', [2, 3]], ['case', 'cases', 'guitar picks', [2]], ['pack', 'packs', 'trading cards', [1, 2]], ['tray', 'trays', 'seedlings', [1, 2]]];
function pstory() {
  const [one, many, item, es] = pick(PACKS), e = pick(es), x = rnd(2, 60), who = pick(['A shop', 'A school', 'A club']);
  if (chance(0.5)) return T({ story: `A ${one} holds ${k(pow(10, e))} ${item}. ${who} has ${k(pl(x, one, many))}.`, ask: `How many ${item} is that in all?`, answer: num(x * P(e)), op: 'mul',
    ways: shiftWays(x, e, true).ways,
    read: rd(`The total number of ${item}.`, [`${one} holds ${fmt(P(e))}`, pl(x, one, many)], '“each” and “in all” mean multiply. Multiplying by a power of 10 slides the digits left.', `${x} × ${pow(10, e)}`), hint: `A ${one} holds ${pow(10, e)}. Multiply by it.` }, 'pstory', { x, e, mult: true });
  const total = x * P(e);
  return T({ story: `${who} has ${k(fmt(total) + ' ' + item)} to put into ${many} that each hold ${k(pow(10, e))}.`, ask: `How many ${many} are needed?`, answer: num(x), op: 'div',
    ways: shiftWays(total, e, false).ways, read: rd(`The number of ${many}.`, [`${fmt(total)} ${item}`, `${fmt(P(e))} in each`], '“each hold” and “how many are needed” mean divide. Dividing by a power of 10 slides the digits right.', `${fmt(total)} ÷ ${pow(10, e)}`),
    hint: `Divide by ${pow(10, e)}: the digits slide right.` }, 'pstory', { x, e, mult: false });
}
// A number written in expanded form with powers of 10.
function psum() {
  const es = shuffle([1, 2, 3, 4]).slice(0, rnd(2, 3)).sort((p, q) => q - p), ds = es.map(() => rnd(1, 9)), tail = chance(0.5) ? rnd(1, 9) : 0;
  const parts = es.map((e, i) => `${ds[i]} × ${pow(10, e)}`), vals = es.map((e, i) => ds[i] * P(e)), total = vals.reduce((s, v) => s + v, tail);
  return T({ ask: 'Write as one number.', expr: [...parts, ...(tail ? [String(tail)] : [])].join(' + '), exprSmall: true, answer: num(total),
    ways: [way('Value of each part', [...es.map((e, i) => `${ds[i]} × ${fmt(P(e))} = ${fmt(vals[i])}`), `Add: ${[...vals, ...(tail ? [tail] : [])].map(fmt).join(' + ')} = ${b(fmt(total))}`]),
      way('Place value', ['Each digit goes in the place its power of 10 names. Places with no part get a 0.', `That gives ${b(fmt(total))}`])],
    hint: 'Work out each power of 10 first, then multiply by its digit.' }, 'psum', { ds, es, tail });
}
function pcmp() {
  const make = () => { const d = rnd(2, 9), e = rnd(1, 4), t = pick([0, 0, 1, 2]); return t === 0 ? { s: `${d} × ${pow(10, e)}`, v: d * P(e) } : t === 1 ? { s: `${d} ÷ ${pow(10, Math.min(e, 3))}`, v: R(d / P(Math.min(e, 3))) } : { s: `${R(d / 10)} × ${pow(10, e)}`, v: R(d / 10 * P(e)) }; };
  let xs; do xs = Array.from({ length: 4 }, make); while (new Set(xs.map(x => x.v)).size < 4);
  const most = chance(0.5), sorted = xs.slice().sort((p, q) => p.v - q.v), want = most ? sorted[3] : sorted[0];
  return T({ ask: `Which one has the ${most ? 'greatest' : 'least'} value?`, answer: choice(want.s, xs.filter(x => x !== want).map(x => x.s)),
    ways: [way('Work each one out', [...xs.map(x => `${x.s} = ${fmt(x.v)}`), `The ${most ? 'greatest' : 'least'} is ${b(want.s)}`]),
      way('Think about size', ['Multiplying by a power of 10 makes a number bigger, dividing makes it smaller.', `So the ${most ? 'greatest' : 'least'} one is ${b(want.s)}`])],
    hint: 'Work out the value of each one, then compare.' }, 'pcmp', { most });
}
function ptwo() {
  let x, a, c, ans;
  do { x = R(rnd(11, 999) / pick([10, 100])); a = rnd(2, 4); c = rnd(1, 3); ans = R(x * P(a) / P(c)); } while (a === c || places(ans) > 3 || ans >= 1e6);
  const first = R(x * P(a)), net = Math.abs(a - c);
  return T({ ask: 'Solve.', expr: `${fmt(x)} × ${pow(10, a)} ÷ ${pow(10, c)}`, answer: num(ans),
    ways: [way('Left to right', [`${fmt(x)} × ${fmt(P(a))} = ${fmt(first)}`, `${fmt(first)} ÷ ${fmt(P(c))} = ${b(fmt(ans))}`]),
      way('Add up the moves', [`Multiplying by ${pow(10, a)} slides the digits ${pl(a, 'place')} left. Dividing by ${pow(10, c)} slides them ${pl(c, 'place')} right.`, `Net move: ${pl(net, 'place')} to the ${a > c ? 'left' : 'right'}, so ${fmt(x)} becomes ${b(fmt(ans))}`])],
    hint: 'Work from left to right, or add up the left and right moves.' }, 'ptwo', { x, a, c });
}
function psolve() {
  const e = rnd(1, 4), y = R(rnd(11, 999) / pick([1, 10, 100])), mult = chance(0.5), ans = mult ? R(y / P(e)) : R(y * P(e));
  if (ans >= 1e6 || places(ans) > 3) return psolve();
  return T({ ask: `A number ${mult ? 'multiplied' : 'divided'} by ${pow(10, e)} is ${fmt(y)}. What is the number?`, answer: num(ans),
    ways: [way('Undo it', [`The opposite of ${mult ? 'multiplying' : 'dividing'} by ${pow(10, e)} is ${mult ? 'dividing' : 'multiplying'} by ${fmt(P(e))}.`, `${fmt(y)} ${mult ? '÷' : '×'} ${fmt(P(e))} = ${b(fmt(ans))}`]),
      way('Check it', [`${fmt(ans)} ${mult ? '×' : '÷'} ${fmt(P(e))} = ${fmt(y)}`, `That matches, so the number is ${b(fmt(ans))}.`])],
    hint: 'Do the opposite operation to get back to the start.' }, 'psolve', { y, e, mult });
}
export function genPowers(L) {
  if (L === 1) return pick([pval, pexp, () => pmul(1), () => pdiv(1), pchoice])();
  if (L === 2) return pick([() => pmul(2), () => pdiv(2), () => pmiss(2), () => pratio(false), pstory])();
  return pick([psum, pcmp, ptwo, psolve, () => pmiss(3), () => pratio(true)])();
}
