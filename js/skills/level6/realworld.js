// Multi-step real-world problems with positive and negative fractions, decimals and percents, and checking an answer by estimating.
import { R, rnd, pick, fmt, money, F, fr, b, way, nm, num, choice } from '../../util.js';
import { snum, tag } from './helpers.js';
import { sequenceWord } from './rational-order.js';
import { makeStory } from '../level4/story.js';

const ITEMS = ['a jacket', 'a backpack', 'a video game', 'a pair of trainers', 'a skateboard', 'a pair of headphones'];
const dec = p => fmt(R(p / 100));
const readOf = (find, know, clue, plan) => ({ find, know, clue, plan });

export function budgetWord(L) {
  for (;;) {
    const n = nm(), P = L === 1 ? pick([20, 40, 50, 60, 80]) : rnd(4, 24) * 5, d = pick(L === 1 ? [10, 20, 25, 50] : [10, 20, 25, 30, 40]), t = L === 1 ? 0 : pick([5, 8, 10]);
    const sale = R(P * (100 - d) / 100), cost = R(sale * (100 + t) / 100), H = Math.ceil(cost) + rnd(5, 30), left = R(H - cost);
    if (!Number.isInteger(R(cost * 100))) continue;
    const taxText = t ? ` Then ${t}% sales tax is added to the sale price.` : '';
    return tag({ story: `${n} has ${money(H)}. ${n} wants ${pick(ITEMS)} that costs ${money(P)}, and it is ${d}% off.${taxText}`, ask: `How much money does ${n} have left, in dollars?`, answer: num(left), op: 'multi',
      ways: [way('One step at a time', [`${d}% off ${money(P)} leaves ${100 - d}%: ${money(P)} × ${dec(100 - d)} = ${money(sale)}.`, ...(t ? [`${t}% tax on ${money(sale)} is ${money(R(cost - sale))}, so the cost is ${money(cost)}.`] : []), `${money(H)} − ${money(cost)} = ${b(money(left))}`]),
        way('Multipliers', [`Cost = ${money(P)} × ${dec(100 - d)}${t ? ` × ${dec(100 + t)}` : ''} = ${money(cost)}.`, `Money left = ${money(H)} − ${money(cost)} = ${b(money(left))}`]),
        way('Check by estimating', [`${d}% off ${t ? 'and a little tax ' : ''}means paying roughly ${money(Math.round(cost))}.`, `${money(H)} − about ${money(Math.round(cost))} is about ${money(Math.round(H - cost))}, close to ${money(left)}.`])],
      read: readOf('The money left after buying.', [`has: ${money(H)}`, `price: ${money(P)}`, `${d}% off`, ...(t ? [`${t}% tax`] : [])], 'A discount comes off the price first. Tax is a percent of the sale price, not of the original.', `${money(H)} − (${money(P)} × ${dec(100 - d)}${t ? ` × ${dec(100 + t)}` : ''})`),
      hint: 'Find the sale price first. If there is tax, work it out on the sale price. Then subtract the cost from the money.' }, { kind: 'budget', shape: 'budget', have: H, price: P, d, t });
  }
}
export function debtWord(L) {
  const n = nm(), den = pick(L === 1 ? [2, 4] : [3, 4, 5, 6, 8]), top = rnd(1, den - 1), O = den * rnd(L === 1 ? 4 : 5, 12), M = L === 1 ? pick([5, 10, 15]) : pick([7.5, 12.5, 15, 20, 4.5]);
  const paid = R(O * top / den), owed = R(O - paid), bal = R(owed + M);
  return tag({ story: `${n} owes a friend ${money(O)}. ${n} pays back ${F(top, den)} of the debt, then borrows ${money(M)} more.`, ask: `What is ${n}'s balance now, in dollars? Use a minus sign because ${n} owes money.`, answer: snum(-bal), op: 'multi',
    ways: [way('Money still owed', [`${F(top, den)} of ${O} is ${fmt(paid)}, so ${n} still owes ${O} − ${fmt(paid)} = ${fmt(owed)}.`, `Borrowing more adds to the debt: ${fmt(owed)} + ${fmt(M)} = ${fmt(bal)}.`, `Owing is negative: ${b('−' + fmt(bal))}`]),
      way('Signed numbers', [`Start at −${O}. Paying back ${fmt(paid)} moves it up: −${O} + ${fmt(paid)} = −${fmt(owed)}.`, `Borrowing ${fmt(M)} moves it down: −${fmt(owed)} − ${fmt(M)} = ${b('−' + fmt(bal))}`])],
    read: readOf(`${n}'s balance at the end.`, [`owes: ${money(O)}`, `pays back ${fr(top, den, { simplify: false })} of it`, `borrows ${money(M)} more`], 'Owing money is a negative balance. Paying back moves it toward zero. Borrowing moves it further below.', `−${O} + ${fmt(paid)} − ${fmt(M)}`),
    hint: 'Work out how much is still owed after paying back that fraction. Then borrowing makes the debt bigger.' }, { kind: 'debt', shape: 'debt', owe: O, n: top, d: den, more: M });
}
export function mixWord(L) {
  for (;;) {
    const d = pick(L === 2 ? [2, 4, 5] : [3, 4, 5, 6, 8]), n = rnd(1, d - 1), C = d * rnd(4, 12), p = pick([10, 20, 25, 50]), A = pick([0.5, 1.5, 2, 2.5, 3.5]), full = R(C * n / d), used = R(full * p / 100), left = R(full - used), val = R(left + A);
    if (!Number.isInteger(R(val * 100)) || !Number.isInteger(R(used * 100))) continue;
    const who = nm();
    return tag({ story: `${who}'s water bottle holds ${C} litres when full. It is ${F(n, d)} full. ${who} drinks ${p}% of the water in it, then adds ${A} litres.`, ask: 'How many litres are in the bottle now?', answer: num(val), op: 'multi', suffix: 'litres',
      ways: [way('One step at a time', [`${F(n, d)} of ${C} = ${fmt(full)} litres at the start.`, `${p}% of ${fmt(full)} is ${fmt(used)}, so ${fmt(full)} − ${fmt(used)} = ${fmt(left)} litres are left.`, `${fmt(left)} + ${fmt(A)} = ${b(fmt(val))} litres`]),
        way('Multipliers, then check', [`${C} × ${F(n, d)} × ${dec(100 - p)} + ${fmt(A)} = ${b(fmt(val))}.`, `Estimate: about ${fmt(Math.round(C * n / d))} litres, a bit less after drinking, plus a little. ${fmt(val)} is sensible.`])],
      read: readOf('The litres in the bottle at the end.', [`holds: ${C} litres`, `${fr(n, d, { simplify: false })} full`, `${p}% is drunk`, `${fmt(A)} litres added`], 'Find the fraction of the whole first. Drinking takes a percent of what is in the bottle now.', `${C} × ${n}/${d} × ${dec(100 - p)} + ${fmt(A)}`),
      hint: 'Find how much water is in the bottle first. The percent that is drunk is a percent of that amount, not of the full bottle.' }, { kind: 'tankmix', shape: 'mix', cap: C, n, d, p, add: A });
  }
}
// Best estimate of a final price after a discount and tax. The wrong choices come from real mistakes.
function estimate(L) {
  for (;;) {
    const P = pick([20, 40, 50, 60, 80, 100, 120, 150, 200]), d = pick([20, 25, 30, 40, 50]), t = L === 1 ? 0 : pick([5, 10]), exact = R(P * (100 - d) / 100 * (100 + t) / 100);
    const opts = [`$${Math.round(exact)}`, `$${Math.round(P * (100 + d) / 100)}`, `$${Math.round(P * d / 100)}`, `$${P - d}`], vals = opts.map(o => Number(o.slice(1)));
    if (new Set(opts).size < 4 || vals.slice(1).some(v => Math.abs(v - exact) / exact < 0.2)) continue;
    return tag({ story: `A pair of trainers costs ${money(P)}. It is ${d}% off${t ? `, and then ${t}% tax is added` : ''}.`, ask: 'Which is the best estimate of the final cost?', answer: choice(opts[0], opts.slice(1)),
      ways: [way('Estimate in your head', [`${d}% off ${money(P)}: you pay ${100 - d}%, about ${money(R(P * (100 - d) / 100))}.`, t ? `${t}% tax adds a little: about ${money(R(P * (100 - d) / 100 * (100 + t) / 100))}.` : 'There is no tax, so that is the cost.', `The closest choice is ${b(opts[0])}.`]),
        way('Rule out the impossible', [`A discount makes the price LESS than ${money(P)}, so ${opts[1]} cannot be right.`, `${opts[2]} is only the discount, not the cost, and ${opts[3]} takes ${d} dollars off instead of ${d}%.`, `That leaves ${b(opts[0])}.`])],
      hint: 'Take the percent off first. Then ask: is the cost less than the original price, and by about how much?' }, { kind: 'estimate', shape: 'estimate', price: P, d, t });
  }
}
// Someone's answer to "p% of X": is it reasonable, too big or too small?
function reasonable() {
  const X = pick([40, 60, 80, 100, 120]), p = pick([10, 20, 25, 50]), exact = R(X * p / 100), f = pick([1, 1, 2, 0.5, 0.1]), claim = R(exact * f), who = nm();
  if (!Number.isInteger(R(claim * 100)) || claim === 0) return reasonable();
  const word = f === 1 ? 'Reasonable' : f > 1 ? 'Much too big' : 'Much too small';
  return tag({ story: `${who} says that ${p}% of ${money(X)} is ${money(claim)}.`, ask: 'Check by estimating. Is that answer reasonable?', answer: choice(word, [], { all: ['Much too small', 'Reasonable', 'Much too big'] }), choiceBig: true,
    ways: [way('Use easy percents', [`10% of ${money(X)} is ${money(R(X / 10))}, and 50% is ${money(R(X / 2))}.`, `${p}% sits ${p === 10 ? 'at' : 'above'} the first and ${p < 50 ? 'below' : 'at'} the second, so about ${money(exact)}.`, `${money(claim)} is ${f === 1 ? `right on that: ${b('reasonable')}` : f > 1 ? `far bigger: ${b('much too big')}` : `far smaller: ${b('much too small')}`}.`]),
      way('Work it out', [`${p}% = ${dec(p)}, and ${money(X)} × ${dec(p)} = ${money(exact)}.`, `Compare with ${money(claim)}: ${f === 1 ? 'the same' : f > 1 ? `${fmt(f)} times too big` : `${fmt(R(1 / f))} times too small`}.`])],
    hint: 'Find an easy percent of the amount, like 10% or 50%. Does the answer sit near it?' }, { kind: 'reasonable', shape: 'reasonable', whole: X, p, claim });
}
export const REAL_TIER_2 = [budgetWord, debtWord, mixWord], REAL_TIER_3 = [sequenceWord, budgetWord, debtWord, mixWord];
const TIERS = [[], REAL_TIER_2, REAL_TIER_3];
export function genRealWorld(L) {
  const r = Math.random();
  if (L === 1) return r < 0.3 ? budgetWord(1) : r < 0.55 ? reasonable() : r < 0.8 ? estimate(1) : debtWord(1);
  if (r < 0.15) return reasonable();
  return r < 0.35 ? estimate(L) : makeStory(TIERS[L - 1], L);
}
