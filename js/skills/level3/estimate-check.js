// Estimating and checking: round to the biggest place to estimate a product, pick a sensible size, and test an answer for sense.
import { rnd, pick, chance, fmt, fixed, b, way, nm, num, choice } from '../../util.js';
import { oneOf, yesNo, lead, roundTo, plural } from './helpers.js';

const PLACE = { 10: 'ten', 100: 'hundred', 1000: 'thousand' };
const lenOf = n => String(Math.round(n)).length;
const exactOf = (a, c, op) => (op === '+' ? a + c : op === '−' ? a - c : a * c);
const OPW = { '+': 'add', '−': 'subtract', '×': 'multiply' };
const roundWay = n => `${fmt(n)} rounds to ${fmt(lead(n))}`;
const bigNum = L => (L === 1 ? rnd(11, 99) : L === 2 ? rnd(101, 999) : rnd(101, 999));
const smallNum = L => (L === 1 ? rnd(2, 9) : L === 2 ? pick([rnd(2, 9), rnd(11, 99)]) : rnd(11, 99));

// Round each number to its biggest place, then multiply.
function estimateProduct(L) {
  const a = bigNum(L), c = smallNum(L), ra = lead(a), rc = lead(c), est = ra * rc;
  if (a % 10 === 0 || (c > 9 && c % 10 === 0)) return null;
  const f1 = ra / 10 ** (lenOf(ra) - 1), f2 = rc / 10 ** (lenOf(rc) - 1), zeros = (lenOf(ra) - 1) + (lenOf(rc) - 1);
  return { ask: 'Estimate. Round each number to its biggest place, then multiply.', expr: `${fmt(a)} × ${fmt(c)}`, answer: num(est), _t: { kind: 'esmul', a, c }, hint: 'Round each number first, so the multiplying is easy. Only then multiply.',
    ways: [way('Round, then multiply', [`${roundWay(a)}${c > 9 ? `, and ${roundWay(c)}` : `. ${c} is already a single digit`}.`, `For comparison, the exact answer is ${fmt(a * c)}, so the estimate should be close to that.`, `${fmt(ra)} × ${fmt(rc)} = ${b(fmt(est))}`]),
      way('Use a basic fact', [`Think of ${f1} × ${f2} = ${f1 * f2}.`, `${fmt(ra)} has ${plural(lenOf(ra) - 1, 'zero')} and ${fmt(rc)} has ${plural(lenOf(rc) - 1, 'zero')}, so put ${plural(zeros, 'zero')} after ${f1 * f2}.`, `${b(fmt(est))}`])] };
}
const WORD = [[a => `A theater has ${fmt(a[0])} rows with ${fmt(a[1])} seats in each row.`, 'About how many seats is that?'], [a => `A school orders ${fmt(a[0])} boxes with ${fmt(a[1])} pencils in each box.`, 'About how many pencils is that?'],
  [a => `A band plays ${fmt(a[0])} shows, and ${fmt(a[1])} people come to each show.`, 'About how many people in all?'], [a => `A farm packs ${fmt(a[0])} crates with ${fmt(a[1])} apples in each crate.`, 'About how many apples is that?']];
function productWord(L) {
  const a = rnd(L === 3 ? 101 : 11, L === 3 ? 899 : 99), c = rnd(11, 99);
  if (a % 10 === 0 || c % 10 === 0) return null;
  const [tell, q] = pick(WORD), ra = lead(a), rc = lead(c), est = ra * rc;
  return { ask: `${tell([a, c])} Round each number to its biggest place and multiply. ${q}`, answer: num(est), _t: { kind: 'esmulword', a, c }, hint: 'Round both numbers to their biggest place first, then multiply the rounded numbers.',
    ways: [way('Round, then multiply', [`${roundWay(a)} and ${roundWay(c)}.`, `${fmt(ra)} × ${fmt(rc)} = ${b(fmt(est))}`]), way('Multiply the leading digits', [`The leading digits are ${ra / 10 ** (lenOf(ra) - 1)} and ${rc / 10 ** (lenOf(rc) - 1)}: ${ra / 10 ** (lenOf(ra) - 1)} × ${rc / 10 ** (lenOf(rc) - 1)} = ${(ra / 10 ** (lenOf(ra) - 1)) * (rc / 10 ** (lenOf(rc) - 1))}.`, `Put back the zeros from both rounded numbers to get ${b(fmt(est))}.`])] };
}
// Pick the answer of the right size: only one choice has the right number of digits.
function rightSize(L) {
  const mul = chance(0.6), a = mul ? bigNum(L) : rnd(L === 1 ? 100 : 1000, L === 1 ? 999 : 9999), c = mul ? smallNum(L) : rnd(2, 9), q = mul ? a * c : a / c, e = lead(Math.max(1, Math.floor(q)));
  if (!mul && (a % c === 0 || e < 10)) return null;
  const opts = [e / 10, e, e * 10, e * 100].map(fmt);
  if (new Set(opts).size < 4) return null;
  return { ask: `Which is the best estimate for ${fmt(a)} ${mul ? '×' : '÷'} ${c}?`, answer: choice(fmt(e), opts.filter(x => x !== fmt(e))), _t: { kind: 'esmag', a, c, op: mul ? '×' : '÷' }, hint: 'Round the numbers to easy ones, then work out a quick answer. Which choice is closest?',
    ways: [way('Round and work it out', [`${roundWay(a)}${c > 9 ? ` and ${roundWay(c)}` : ''}.`, mul ? `${fmt(lead(a))} × ${fmt(lead(c))} = ${fmt(lead(a) * lead(c))}, which is close to ${b(fmt(e))}.` : `${fmt(lead(a))} ÷ ${c} is about ${fmt(Math.round(lead(a) / c))}, which is closest to ${b(fmt(e))}.`]),
      way('Think about the size', [mul ? `${fmt(a)} is about ${fmt(lead(a))}, and ${c} copies of it make about ${fmt(lead(a) * lead(c))}.` : `${fmt(a)} shared into ${c} groups gives groups of about ${fmt(Math.floor(a / c))}.`, `Only ${b(fmt(e))} has the right number of digits.`])] };
}
function sumChoice(L) {
  const to = L === 1 ? 100 : pick([100, 1000]), a = rnd(to * 2, to * 9) + rnd(1, to - 1), c = rnd(to * 2, to * 9) + rnd(1, to - 1), op = chance(0.5) || a < c ? '+' : '−';
  if (a % to === 0 || c % to === 0 || a % to === to / 2 || c % to === to / 2) return null;
  const ra = roundTo(a, to), rc = roundTo(c, to), est = exactOf(ra, rc, op), down = exactOf(a - (a % to), c - (c % to), op), up = exactOf(a - (a % to) + to, c - (c % to) + to, op);
  const opts = [fmt(est)], more = [fmt(down), fmt(up), fmt(est * 10)].filter(x => !opts.includes(x));
  if (est <= 0 || more.length < 3 || new Set([...opts, ...more]).size < 4) return null;
  return { ask: `Round each number to the nearest ${PLACE[to]}, then ${OPW[op]}. Which is the estimate for ${fmt(a)} ${op} ${fmt(c)}?`, answer: choice(opts[0], more), _t: { kind: 'eswhich', a, c, to, op }, hint: `Round both numbers to the nearest ${PLACE[to]} first. Look at the digit to the right of that place.`,
    ways: [way('Round, then work it out', [`${fmt(a)} rounds to ${fmt(ra)} and ${fmt(c)} rounds to ${fmt(rc)}.`, `${fmt(ra)} ${op} ${fmt(rc)} = ${b(fmt(est))}`]), way('Rule out the others', [`Rounding down or up on both numbers, without looking at the next digit, gives ${fmt(down)} or ${fmt(up)}.`, `A number ten times too big has a wrong place value. Only ${b(fmt(est))} comes from rounding each number properly.`])] };
}
// An answer that may or may not make sense: is it near the estimate?
function reasonable(L) {
  const op = L === 1 ? pick(['+', '−']) : pick(['+', '−', '×']), a = op === '×' ? bigNum(Math.min(L, 2)) : rnd(L === 1 ? 120 : 1200, L === 1 ? 899 : 8999), c = op === '×' ? smallNum(L) : rnd(L === 1 ? 110 : 1100, L === 1 ? 799 : 7999);
  if (op === '−' && a - c < 60) return null;
  const exact = exactOf(a, c, op), bad = chance(0.5), len = lenOf(exact), stated = bad ? pick([exact * 10, Math.round(exact / 10), exact + pick([2, 3]) * 10 ** (len - 1), exact - pick([2, 3]) * 10 ** (len - 1)]) : exact;
  const est = exactOf(lead(a), lead(c), op), who = nm();
  if (stated <= 0 || (bad && stated === exact) || est <= 0) return null;
  return { ask: `${who} worked out ${fmt(a)} ${op} ${fmt(c)} and got ${fmt(stated)}. Is that answer reasonable?`, answer: yesNo(!bad), _t: { kind: 'esreason', a, c, op, stated }, hint: 'Round both numbers and work out a quick estimate. Is the answer close to it?',
    ways: [way('Estimate first', [`${roundWay(a)} and ${roundWay(c)}.`, `${fmt(lead(a))} ${op} ${fmt(lead(c))} = ${fmt(est)}.`, bad ? `${fmt(stated)} is far from ${fmt(est)}, so the answer is not reasonable: ${b('No')}.` : `${fmt(stated)} is close to ${fmt(est)}, so the answer is reasonable: ${b('Yes')}.`]),
      way('Check the size', [`The estimate ${fmt(est)} has ${plural(lenOf(est), 'digit')}, and ${fmt(stated)} has ${plural(lenOf(stated), 'digit')}.`, bad ? (lenOf(est) === lenOf(stated) ? 'The number of digits matches, but the first digits are far apart.' : 'The number of digits is different, so the answer is much too big or much too small.') : 'The size and the first digits agree.', `So the answer is ${bad ? b('not reasonable: No') : b('reasonable: Yes')}.`])] };
}
// Compatible numbers: change the first number to one that divides easily.
function divideEasy() {
  const d = rnd(3, 9), q = rnd(12, 99), m = d * q, n = m + pick([-1, 1]) * rnd(1, d - 1);
  return { ask: `Estimate ${fmt(n)} ÷ ${d}. First change ${fmt(n)} to ${fmt(m)}, a number that ${d} divides easily. What is ${fmt(m)} ÷ ${d}?`, answer: num(q), _t: { kind: 'esdiv', n, d, m }, hint: `${fmt(m)} is a multiple of ${d}. Think of the ${d} times table.`,
    ways: [way('Divide the easy number', [`${fmt(m)} ÷ ${d} = ${b(q)}`, `So ${fmt(n)} ÷ ${d} is about ${q}.`]), way('Check by multiplying', [`${d} × ${q} = ${fmt(m)}, which is close to ${fmt(n)}.`, `So the estimate is ${b(q)}.`])] };
}
const ITEMS = [['pack of markers', 'packs of markers'], ['bag of oranges', 'bags of oranges'], ['movie ticket', 'movie tickets'], ['pair of socks', 'pairs of socks'], ['bottle of juice', 'bottles of juice'], ['notebook', 'notebooks']];
function enough(L) {
  const price = rnd(L === 2 ? 2 : 3, L === 2 ? 9 : 19) + rnd(1, 99) / 100, q = rnd(3, 9), up = Math.ceil(price) * q, down = Math.floor(price) * q, yes = chance(0.5), budget = yes ? up + rnd(0, 6) : down - rnd(1, 4);
  if (budget <= 0) return null;
  const [one, many] = pick(ITEMS), who = nm(), total = Math.round(price * 100) * q / 100;
  return { ask: `${who} wants to buy ${plural(q, one, many)}. Each costs $${fixed(price, 2)}. ${who} has $${budget}. Is that enough?`, answer: yesNo(yes), _t: { kind: 'esenough', price: +fixed(price, 2), qty: q, budget }, hint: 'Round the price to a whole dollar, then multiply. Compare with the money.',
    ways: [way('Round and compare', [yes ? `Round the price up to $${Math.ceil(price)}: ${q} × ${Math.ceil(price)} = $${up}.` : `Round the price down to $${Math.floor(price)}: ${q} × ${Math.floor(price)} = $${down}.`, yes ? `$${up} is not more than $${budget}, and the real price is even less, so it is enough: ${b('Yes')}.` : `Even that is more than $${budget}, so it is not enough: ${b('No')}.`]),
      way('Work it out exactly', [`${q} × $${fixed(price, 2)} = $${fixed(total, 2)}.`, `$${fixed(total, 2)} ${yes ? 'is not more than' : 'is more than'} $${budget}, so the answer is ${b(yes ? 'Yes' : 'No')}.`])] };
}

const MAKERS = [[estimateProduct, rightSize, reasonable, sumChoice], [estimateProduct, rightSize, reasonable, sumChoice, divideEasy, enough], [estimateProduct, productWord, reasonable, sumChoice, enough, divideEasy, rightSize]];
export const genEstimate = L => oneOf(MAKERS[L - 1], L);
