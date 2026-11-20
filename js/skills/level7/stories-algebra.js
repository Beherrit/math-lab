// Story problems about powers of ten, equations, lines and systems. Each maker is (L) => story problem.
// Step 1 keeps the numbers small and the route direct; step 3 uses bigger numbers and working backwards.
import { rnd, pick, chance, b, k, way, pow, fmt, plain, num, nm, table } from '../../util.js';
import { blank, lin, count } from './h.js';
import { work } from './sciops.js';

// m is the exponent range of the big amount, n of the small one: a phone holds about 10^11 bytes, a home uses about 10^5 liters a year.
const BIG = [
  { a: 'A data center stores about', c: 'One phone stores about', unit: 'bytes', q: 'How many phones would it take to hold what the data center holds?', m: [14, 16], n: [10, 11] },
  { a: 'A stadium screen has about', c: 'A phone screen has about', unit: 'pixels', q: 'How many times as many pixels does the stadium screen have?', m: [7, 8], n: [6, 6] },
  { a: 'A city uses about', c: 'One home uses about', unit: 'liters of water a year', q: 'How many homes would use that much water?', m: [9, 11], n: [5, 5] },
  { a: 'A streaming service plays about', c: 'One listener plays about', unit: 'songs a year', q: 'How many listeners like that would it take?', m: [10, 12], n: [3, 4] },
];
// Front-number pairs: a whole-number quotient, a decimal quotient, a quotient under 1 (the power needs adjusting).
const PAIRS = [[[8, 2], [6, 3], [9, 3], [8, 4], [6, 2], [4, 2]], [[7.5, 3], [5, 2], [9, 2], [7, 2], [8, 2], [6, 3]], [[2, 4], [3, 6], [1.2, 4], [2, 5], [7.5, 3], [1.5, 3]]];
const s10 = (x, e) => `${plain(x)} × ${pow(10, fmt(e))}`;
export function powerStory(L = 2) {
  const t = pick(BIG), [a, c] = pick(PAIRS[L - 1]), n = rnd(...t.n), m = rnd(...t.m), w = work('div', a, m, c, n);
  return { story: `${t.a} ${k(s10(a, m) + ' ' + t.unit)}. ${t.c} ${k(s10(c, n) + ' ' + t.unit)}.`, ask: `${t.q} The answer is ${plain(w.k)} × ${pow(10, blank)}. What is the exponent?`, answer: num(w.E), op: 'div', hint: 'Divide the front numbers, and subtract the exponents.', _t: { k: 'sciop', op: 'div', a, m, c, n, ask: 'exp' },
    ways: [way('Front numbers, then tens', [`Front numbers: ${plain(a)} ÷ ${plain(c)} = ${plain(w.raw)}.`, `Powers of 10: ${pow(10, m)} ÷ ${pow(10, n)} = ${pow(10, m - n)}, because ${m} − ${n} = ${m - n}.`, w.raw < 1 ? `${s10(w.raw, w.e)} is the same as ${b(s10(w.k, w.E))}, because ${plain(w.raw)} = ${plain(w.k)} ÷ 10.` : `That makes ${b(s10(w.k, w.E))}.`]),
      way('Is the size sensible?', [`${pow(10, m)} has ${m - n} more tens than ${pow(10, n)}, so the answer should be around ${pow(10, m - n)}.`, `${s10(w.k, w.E)} is close to that.`])],
    read: { find: 'How many times one amount fits into the other.', know: [`big amount: ${s10(a, m)}`, `small amount: ${s10(c, n)}`], clue: '“How many times” and “how many would it take” mean divide the big amount by the small one.', plan: `(${s10(a, m)}) ÷ (${s10(c, n)})` } };
}
const PLANS = [['gym', 'to join', 'month'], ['music app', 'to sign up', 'month'], ['bike hire shop', 'for a helmet', 'day'], ['phone plan', 'for the SIM card', 'month']];
export function sameCostStory(L = 2) {
  const [thing, fee, per] = pick(PLANS), x = L === 1 ? rnd(2, 6) : rnd(L + 1, 12), m1 = L === 1 ? rnd(6, 10) : rnd(8, 20), m2 = m1 - rnd(2, L === 1 ? 3 : 6), f1 = rnd(1, 6) * 5, f2 = f1 + (m1 - m2) * x;
  return { story: `One ${thing} charges ${k('$' + f1)} ${fee} plus ${k('$' + m1 + ' per ' + per)}. Another charges ${k('$' + f2)} ${fee} plus ${k('$' + m2 + ' per ' + per)}.`, ask: `After how many ${per}s have the two cost exactly the same?`, answer: num(x), suffix: `${per}s`, op: 'multi', hint: `Write the total cost of each one after x ${per}s. Then set them equal.`, _t: { k: 'lineq', L: [[1, m1, f1]], R: [[1, m2, f2]] },
    ways: [way('Write an equation', [`After x ${per}s the first costs ${lin(m1, f1)} and the second costs ${lin(m2, f2)}.`, `Same cost: ${lin(m1, f1)} = ${lin(m2, f2)}`, `Take ${m2}x from both sides: ${lin(m1 - m2, f1)} = ${f2}. Take ${f1} from both sides: ${m1 - m2}x = ${f2 - f1}.`, `x = ${f2 - f1} ÷ ${m1 - m2} = ${b(x)}`]),
      way('Close the gap', [`At the start the second one costs $${f2 - f1} more.`, `Each ${per} the first one costs $${m1 - m2} more than the second, so the gap shrinks by $${m1 - m2}.`, `${f2 - f1} ÷ ${m1 - m2} = ${b(x)} ${x === 1 ? per : per + 's'} until they are level.`])],
    read: { find: `The number of ${per}s when both totals are equal.`, know: [`first: $${f1} then $${m1} per ${per}`, `second: $${f2} then $${m2} per ${per}`], clue: '“Cost exactly the same” means the two totals are equal: an equation with x on both sides.', plan: `${lin(m1, f1)} = ${lin(m2, f2)}` } };
}
// [thing, unit, cheapest and dearest price per unit, most units a child would hire it for]
const HIRE = [['kayak', 'hour', 4, 12, 8], ['scooter', 'hour', 3, 8, 8], ['taxi', 'kilometer', 2, 5, 15], ['delivery van', 'kilometer', 2, 5, 15], ['rowing boat', 'hour', 5, 12, 6]];
export function lineStory(L = 2) {
  const [thing, per, lo, hi, most] = pick(HIRE), m = rnd(lo, L === 1 ? Math.min(hi, lo + 3) : hi), c = L === 1 ? rnd(1, 4) * 5 : rnd(4, 25), x = L === 3 ? rnd(Math.min(6, most), most) : rnd(2, Math.min(9, most)), y = m * x + c, back = L > 1 && chance(L === 3 ? 0.7 : 0.4), who = nm();
  const base = { story: `Hiring a ${thing} costs ${k('$' + c)} to book plus ${k('$' + m + ' per ' + per)}.`, op: 'multi' };
  if (!back) return { ...base, ask: `How much does it cost for ${count(x, per)}?`, answer: num(y), hint: `The cost is a line: start at ${c} and add ${m} for each ${per}.`, _t: { k: 'line', m, c, x, ask: 'y' },
    ways: [way('Use y = mx + b', [`Cost = ${lin(m, c)}, where x is the number of ${per}s.`, `${m} × ${x} = ${m * x}`, `${m * x} + ${c} = ${b(y)}`]), way('Build it up', [table([per + 's', 'cost ($)'], [0, 1, 2, x].filter((v, i, arr) => arr.indexOf(v) === i).map(v => [v, m * v + c])), `Start at $${c}. Each ${per} adds $${m}. After ${x}: ${b('$' + y)}.`])],
    read: { find: `The total cost for ${count(x, per)}.`, know: [`$${c} once`, `$${m} for each ${per}`, count(x, per)], clue: '“Per” means multiply. The booking fee is added one time only.', plan: `${m} × ${x} + ${c}` } };
  return { ...base, story: `${base.story} ${who} paid ${k('$' + y)} in total.`, ask: `For how many ${per}s did ${who} hire it?`, answer: num(x), hint: 'Take off the booking fee first. What is left paid for the time or distance.', _t: { k: 'line', m, c, y, ask: 'x' },
    ways: [way('Undo it step by step', [`Take off the booking fee: ${y} − ${c} = ${y - c}.`, `That paid for the ${per}s at $${m} each: ${y - c} ÷ ${m} = ${b(x)}`]), way('Solve the equation', [`${lin(m, c)} = ${y}`, `${m}x = ${y - c}`, `x = ${b(x)}`])],
    read: { find: `The number of ${per}s.`, know: [`$${c} once`, `$${m} for each ${per}`, `$${y} altogether`], clue: 'You know the total and need the number of equal parts: work backwards. Subtract the one-time fee, then divide.', plan: `(${y} − ${c}) ÷ ${m}` } };
}
const EVENTS = [['school concert', 'adult', 'student'], ['football match', 'seat', 'standing'], ['cinema night', 'adult', 'child'], ['science fair', 'full-price', 'half-price']];
export function ticketStory(L = 2) {
  const top = [10, 20, 40][L - 1], [ev, big, small] = pick(EVENTS), x = rnd(3, top), y = rnd(3, top), pc = rnd(2, 6), pa = pc + rnd(2, 6), n = x + y, total = pa * x + pc * y, want = chance(0.5) ? 'x' : 'y';
  return { story: `A ${ev} sold ${k(n + ' tickets')} and took in ${k('$' + fmt(total))}. ${big[0].toUpperCase() + big.slice(1)} tickets cost ${k('$' + pa)} and ${small} tickets cost ${k('$' + pc)}.`, ask: `How many ${want === 'x' ? big : small} tickets were sold?`, answer: num(want === 'x' ? x : y), op: 'multi', hint: 'Write one equation for the number of tickets and one for the money.', _t: { k: 'sys', e1: [1, 1, n], e2: [pa, pc, total], ask: want },
    ways: [way('Two equations', [`Let x = ${big} tickets and y = ${small} tickets. Tickets: x + y = ${n}. Money: ${pa}x + ${pc}y = ${fmt(total)}.`, `From the first, y = ${n} − x. Put that in the second: ${pa}x + ${pc}(${n} − x) = ${fmt(total)}`, `${pa - pc}x + ${fmt(pc * n)} = ${fmt(total)}, so ${pa - pc}x = ${fmt(total - pc * n)} and x = ${b(x)}.`, `Then y = ${n} − ${x} = ${b(y)}.`]),
      way('Pretend they were all the cheaper kind', [`If all ${n} tickets were ${small} tickets, the money would be ${n} × ${pc} = $${fmt(pc * n)}.`, `The real total is $${fmt(total - pc * n)} more. Each ${big} ticket adds $${pa - pc} extra.`, `${fmt(total - pc * n)} ÷ ${pa - pc} = ${b(x)} ${big} tickets, which leaves ${b(y)} ${small} tickets.`])],
    read: { find: `The number of ${want === 'x' ? big : small} tickets.`, know: [`${n} tickets altogether`, `$${fmt(total)} altogether`, `$${pa} and $${pc} each`], clue: 'Two unknown amounts and two facts about them (how many, and how much money): a system of two equations.', plan: `x + y = ${n} and ${pa}x + ${pc}y = ${fmt(total)}` } };
}
