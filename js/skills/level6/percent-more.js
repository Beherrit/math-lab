// Past the first percent skills: commission, fees, percent error that is not a round number, and chains of discounts.
import { R, rnd, pick, chance, fmt, money, b, way, nm, num } from '../../util.js';
import { tag } from './helpers.js';

const cap = s => s[0].toUpperCase() + s.slice(1);
const ITEMS = ['a jacket', 'a backpack', 'a video game', 'a pair of trainers', 'a skateboard', 'a pair of headphones'];
const SELLS = ['phone cases', 'bikes', 'concert tickets', 'books', 'sneakers'];
const cents = v => Number.isInteger(R(v * 100));
const dec = p => fmt(R(p / 100));
// Two ways to take p% of an amount: the decimal, and 1% first.
const ofWays = (S, p, ans) => [way('Multiply by the decimal', [`${p}% means ${p} out of 100, which is ${dec(p)}.`, `${money(S)} × ${dec(p)} = ${b(money(ans))}`]),
  way('Find 1% first', [`1% of ${money(S)} is ${money(R(S / 100))}.`, `${p}% is ${p} of those: ${p} × ${money(R(S / 100))} = ${b(money(ans))}`])];
const stepOf = (price, d) => ({ off: R(price * d / 100), left: R(price * (100 - d) / 100) });

function commission() {
  const S = pick([100, 200, 300, 400, 500, 800, 1000, 1500]), p = pick([5, 10, 20, 25]), ans = R(S * p / 100), n = nm();
  return tag({ story: `${n} sells ${pick(SELLS)} for a shop and earns a ${p}% commission on everything sold. This week ${n} sold ${money(S)} worth.`, ask: 'How much commission does that earn, in dollars?', answer: num(ans), ways: ofWays(S, p, ans),
    hint: 'Commission is a percent of the sales. Find that percent of the total sold.' }, { kind: 'pctamt', shape: 'commission', price: S, p });
}
function fee(dir) {
  const P = pick([20, 40, 50, 60, 80, 100]), p = pick(dir > 0 ? [5, 10, 20, 25] : [10, 20, 25, 50]), amt = R(P * p / 100), end = R(P + dir * amt), what = dir > 0 ? 'service fee' : 'markdown';
  const story = dir > 0 ? `A ticket site adds a ${p}% service fee to a ${money(P)} ticket.` : `${cap(pick(ITEMS))} was ${money(P)}. The shop marks it down by ${p}%.`;
  return tag({ story, ask: dir > 0 ? 'What is the total cost with the fee, in dollars?' : 'What is the new price, in dollars?', answer: num(end),
    ways: [way(`Find the ${what}, then ${dir > 0 ? 'add it on' : 'take it off'}`, [`${p}% of ${money(P)} is ${money(amt)}.`, `${money(P)} ${dir > 0 ? '+' : '−'} ${money(amt)} = ${b(money(end))}`]),
      way('One multiplication', [`${dir > 0 ? 'Adding' : 'Taking off'} ${p}% leaves ${100 + dir * p}% of the price, which is ${dec(100 + dir * p)}.`, `${money(P)} × ${dec(100 + dir * p)} = ${b(money(end))}`])],
    hint: dir > 0 ? `Find ${p}% of the ticket price first. Then add it on.` : `Find ${p}% of the old price first. Then take it off.` }, { kind: 'pctfinal', shape: dir > 0 ? 'fee' : 'markdown', price: P, p, dir });
}
const ERR = [(n, e, a) => `${n} guessed there were ${e} jellybeans in a jar. There were really ${a}.`, (n, e, a) => `${n} measured a table as ${e} cm long. The true length is ${a} cm.`,
  (n, e, a) => `A scale shows ${e} grams for something that really has a mass of ${a} grams.`, (n, e, a) => `A stopwatch says a lap took ${e} seconds. The official time is ${a} seconds.`];
function error(L) {
  for (;;) {
    const act = pick(L === 1 ? [10, 20, 50, 100] : [20, 25, 40, 50, 80, 125, 200, 250]), er = L === 1 ? act * pick([10, 20, 25, 50]) / 100 : rnd(1, 15), p = R(er / act * 100);
    if (er >= act || !Number.isInteger(er) || p > 30 || !cents(p) || (L > 1 && Number.isInteger(p))) continue;
    const est = chance(0.5) ? act + er : act - er;
    return tag({ story: pick(ERR)(nm(), est, act), ask: 'What is the percent error of the guess?', answer: num(p), suffix: '%',
      ways: [way('Error compared with the real value', [`The error is how far off the guess was: ${Math.max(est, act)} − ${Math.min(est, act)} = ${b(er)}.`, `Compare it with the REAL value: ${er} ÷ ${act} = ${fmt(R(er / act))} = ${b(fmt(p) + '%')}`]),
        way('Find 1% of the real value', [`1% of ${act} is ${fmt(R(act / 100))}.`, `The error of ${er} is ${er} ÷ ${fmt(R(act / 100))} = ${b(fmt(p))} of those, so ${b(fmt(p) + '%')}.`])],
      hint: 'How far off was the guess? Divide that by the REAL value, not by the guess.' }, { kind: 'pcterr', shape: 'error', est, act });
  }
}
function commissionPay() {
  const base = pick([100, 150, 200, 250]), p = pick([5, 10, 15, 20]), S = pick([200, 400, 500, 800, 1000]), c = R(S * p / 100), n = nm();
  return tag({ story: `${n} earns ${money(base)} a week plus a ${p}% commission on sales. This week the sales were ${money(S)}.`, ask: `How much does ${n} earn this week, in dollars?`, answer: num(base + c),
    ways: [way('Commission first, then add the base pay', [`${p}% of ${money(S)} is ${money(c)}.`, `${money(base)} + ${money(c)} = ${b(money(base + c))}`]), way('One formula', [`pay = base pay + rate × sales`, `${money(base)} + ${dec(p)} × ${money(S)} = ${b(money(base + c))}`])],
    hint: 'The commission is only a percent of the sales. The base pay is added to it, not multiplied.' }, { kind: 'commpay', shape: 'commpay', base, p, sales: S });
}
function commissionRate() {
  const p = pick([4, 5, 6, 8, 10, 12, 15]), W = pick([200, 300, 400, 500, 800, 1000, 1500]), C = R(W * p / 100), n = nm();
  if (!cents(C)) return commissionRate();
  return tag({ story: `${n} sold ${money(W)} worth of ${pick(SELLS)} and was paid ${money(C)} commission.`, ask: 'What is the commission rate, as a percent?', answer: num(p), suffix: '%',
    ways: [way('Part out of whole', [`The commission is the part and the sales are the whole: ${money(C)} out of ${money(W)}.`, `${fmt(C)} ÷ ${fmt(W)} = ${dec(p)} = ${b(p + '%')}`]), way('Find 1% first', [`1% of ${money(W)} is ${money(R(W / 100))}.`, `${fmt(C)} ÷ ${fmt(R(W / 100))} = ${b(p)}, so ${b(p + '%')}.`])],
    hint: 'Divide the commission by the sales, then write the answer as a percent.' }, { kind: 'whatpct', shape: 'rate', part: C, whole: W });
}
function chain(price, d1, d2) { const s1 = stepOf(price, d1), s2 = stepOf(s1.left, d2); return { s1, s2 }; }
function markdownChain() {
  for (;;) {
    const price = pick([40, 50, 60, 80, 100, 120, 200]), d1 = pick([10, 20, 25, 30, 40, 50]), d2 = pick([10, 20, 25, 50]), { s1, s2 } = chain(price, d1, d2);
    if (!cents(s2.left)) continue;
    return tag({ story: `${cap(pick(ITEMS))} costs ${money(price)}. It is ${d1}% off. At the till, an extra ${d2}% is taken off the sale price.`, ask: 'What is the final price, in dollars?', answer: num(s2.left),
      ways: [way('One discount at a time', [`First: ${d1}% of ${money(price)} is ${money(s1.off)}, so the sale price is ${money(s1.left)}.`, `Then: ${d2}% of ${money(s1.left)} is ${money(s2.off)}.`, `${money(s1.left)} − ${money(s2.off)} = ${b(money(s2.left))}`]),
        way('Two multipliers', [`Paying ${100 - d1}% then ${100 - d2}% of what is left: ${dec(100 - d1)} × ${dec(100 - d2)}.`, `${money(price)} × ${dec(100 - d1)} × ${dec(100 - d2)} = ${b(money(s2.left))}`]),
        way('Watch out for the trap', [`The second discount is a percent of the SMALLER sale price. ${d1}% and ${d2}% do not simply add to ${d1 + d2}% off.`])],
      hint: 'Find the price after the first discount. The second percent is taken off that new price.' }, { kind: 'chain', shape: 'chain', price, d1, d2 });
  }
}
function markdownTax() {
  for (;;) {
    const price = pick([40, 50, 60, 80, 100, 120, 200]), d1 = pick([10, 20, 25, 30, 40]), d2 = pick([10, 20, 25]), t = pick([5, 8, 10]), { s1, s2 } = chain(price, d1, d2), end = R(s2.left * (100 + t) / 100);
    if (!cents(s2.left) || !cents(end)) continue;
    return tag({ story: `${cap(pick(ITEMS))} costs ${money(price)}. It is marked down ${d1}%, then ${d2}% more off that price. Sales tax of ${t}% is added to the final sale price.`, ask: 'What is the total cost, in dollars?', answer: num(end), op: 'multi',
      ways: [way('One step at a time', [`After ${d1}% off: ${money(s1.left)}. After ${d2}% more off: ${money(s2.left)}.`, `Tax: ${t}% of ${money(s2.left)} is ${money(R(end - s2.left))}.`, `${money(s2.left)} + ${money(R(end - s2.left))} = ${b(money(end))}`]),
        way('Three multipliers', [`${dec(100 - d1)} × ${dec(100 - d2)} × ${dec(100 + t)}`, `${money(price)} × ${dec(100 - d1)} × ${dec(100 - d2)} × ${dec(100 + t)} = ${b(money(end))}`])],
      hint: 'Work in order: first discount, second discount, then add the tax to that last price.' }, { kind: 'chain3', shape: 'chain3', price, d1, d2, t });
  }
}
function singleOff() {
  const d1 = pick([10, 20, 25, 30, 40, 50]), d2 = pick([10, 20, 25, 30, 50]), left = R((100 - d1) * (100 - d2) / 100), ans = R(100 - left);
  return tag({ story: `A shop takes ${d1}% off a price. Then it takes another ${d2}% off the new price.`, ask: 'What single percent off would give the same final price?', answer: num(ans), suffix: '%',
    ways: [way('Pretend the price is 100', [`After ${d1}% off: 100 − ${d1} = ${100 - d1}.`, `After ${d2}% off that: ${100 - d1} × ${dec(100 - d2)} = ${fmt(left)}.`, `You pay ${fmt(left)} of every 100, so ${100} − ${fmt(left)} = ${b(fmt(ans) + '%')} is saved.`]),
      way('Multipliers', [`${dec(100 - d1)} × ${dec(100 - d2)} = ${fmt(R(left / 100))}`, `1 − ${fmt(R(left / 100))} = ${fmt(R(ans / 100))} = ${b(fmt(ans) + '%')} off`])],
    hint: `Try an easy starting price, like 100, and do the two discounts one after the other.` }, { kind: 'chainoff', shape: 'singleoff', d1, d2 });
}
function tiers() {
  const T = pick([500, 1000]), p1 = pick([4, 5, 6]), p2 = pick([8, 10, 12]), S = T + pick([200, 400, 500, 800, 1000]), a = R(T * p1 / 100), c2 = R((S - T) * p2 / 100), n = nm();
  return tag({ story: `${n} earns ${p1}% commission on the first ${money(T)} of sales and ${p2}% on everything above that. This week ${n} sold ${money(S)}.`, ask: 'How much commission is earned, in dollars?', answer: num(a + c2), op: 'multi',
    ways: [way('Split the sales', [`First ${money(T)}: ${p1}% is ${money(a)}.`, `The rest: ${S} − ${T} = ${S - T}, and ${p2}% of ${S - T} is ${money(c2)}.`, `${money(a)} + ${money(c2)} = ${b(money(a + c2))}`]),
      way('Lower rate on all, then top up', [`${p1}% of all ${money(S)} is ${money(R(S * p1 / 100))}.`, `The part above ${money(T)} earns ${p2 - p1}% extra: ${p2 - p1}% of ${S - T} is ${money(R((S - T) * (p2 - p1) / 100))}.`, `${money(R(S * p1 / 100))} + ${money(R((S - T) * (p2 - p1) / 100))} = ${b(money(a + c2))}`])],
    hint: 'The higher rate only applies to the sales above the first amount. Work out the two parts separately.' }, { kind: 'tiers', shape: 'tiers', T, p1, p2, S });
}
function errorBack() {
  const act = pick([40, 50, 80, 100, 120, 200, 250, 400]), p = pick([5, 10, 20, 25]), est = R(act * (100 + p) / 100), er = R(est - act);
  return tag({ story: `A map app estimated a trip as too long, with a percent error of ${p}%. The real trip is ${act} km.`, ask: 'What distance did the app estimate, in kilometres?', answer: num(est), suffix: 'km', op: 'multi',
    ways: [way('Find the error, then add it', [`The error is ${p}% of the real distance: ${p}% of ${act} = ${b(er)} km.`, `"Too long" means the estimate is over: ${act} + ${er} = ${b(est)}`]), way('One multiplication', [`The estimate is ${100 + p}% of the real distance = ${dec(100 + p)}.`, `${act} × ${dec(100 + p)} = ${b(est)}`])],
    hint: 'Percent error is a percent of the REAL value. Find that amount, then decide whether to add it or take it away.' }, { kind: 'errback', shape: 'errorback', act, p });
}
function originalChain() {
  for (;;) {
    const orig = pick([50, 60, 80, 100, 120, 150, 200]), d1 = pick([10, 20, 25, 50]), d2 = pick([10, 20, 25, 50]), { s1, s2 } = chain(orig, d1, d2);
    if (!cents(s1.left) || !cents(s2.left)) continue;
    return tag({ story: `A price was cut by ${d1}%, and then cut by ${d2}% again. The final price is ${money(s2.left)}.`, ask: 'What was the price before any discount, in dollars?', answer: num(orig), op: 'multi',
      ways: [way('Undo each cut', [`The last cut left ${100 - d2}% of the price before it: ${money(s2.left)} ÷ ${dec(100 - d2)} = ${money(s1.left)}.`, `The first cut left ${100 - d1}% of the original: ${money(s1.left)} ÷ ${dec(100 - d1)} = ${b(money(orig))}`]),
        way('Divide by both multipliers', [`${dec(100 - d1)} × ${dec(100 - d2)} = ${fmt(R((100 - d1) * (100 - d2) / 10000))}`, `${money(s2.left)} ÷ ${fmt(R((100 - d1) * (100 - d2) / 10000))} = ${b(money(orig))}`])],
      hint: 'Go backwards. The final price is a percent of the price before the last cut.' }, { kind: 'origchain', shape: 'origchain', after: s2.left, d1, d2 });
  }
}
export function genPctMore(L) {
  const r = Math.random();
  if (L === 1) return r < 0.3 ? commission() : r < 0.55 ? fee(1) : r < 0.8 ? error(1) : fee(-1);
  if (L === 2) return r < 0.25 ? commissionPay() : r < 0.5 ? error(2) : r < 0.75 ? markdownChain() : commissionRate();
  return r < 0.25 ? markdownTax() : r < 0.45 ? singleOff() : r < 0.65 ? tiers() : r < 0.82 ? errorBack() : originalChain();
}
