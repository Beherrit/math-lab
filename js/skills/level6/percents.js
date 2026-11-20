// Percent problems with money: tax, tip, discount and markup.
import { R, rnd, pick, chance, fmt, money, b, k, way, nm, num } from '../../util.js';
import { tag } from './helpers.js';
import { pctBar } from './visuals-lines.js';

const cap = s => s[0].toUpperCase() + s.slice(1);
const ITEMS = ['a pair of headphones', 'a backpack', 'a video game', 'a basketball', 'a jacket', 'a skateboard', 'a phone case', 'a pair of trainers'];
const KINDS = {
  tax: { dir: 1, part: 'tax', ps: [5, 6, 8, 10], story: (P, p, n, it) => `${n} buys ${it} priced at ${k(P)}. Sales tax of ${k(p + '%')} is added at the till.`, amount: 'How much is the tax, in dollars?', final: 'What is the total cost with tax, in dollars?' },
  tip: { max: 80, dir: 1, part: 'tip', ps: [10, 15, 20, 25], story: (P, p, n) => `${n}'s meal costs ${k(P)}. ${n} adds a ${k(p + '%')} tip.`, amount: 'How much is the tip, in dollars?', final: 'How much does the meal cost with the tip, in dollars?' },
  discount: { dir: -1, part: 'discount', ps: [10, 15, 20, 25, 30, 40], story: (P, p, n, it) => `${cap(it)} normally costs ${k(P)}. Today it is ${k(p + '% off')}.`, amount: 'How many dollars are taken off the price?', final: 'What is the sale price, in dollars?' },
  markup: { dir: 1, part: 'markup', ps: [20, 25, 40, 50, 60], story: (P, p, n, it) => `A shop buys ${it} for ${k(P)} and marks the price up by ${k(p + '%')} before selling it.`, amount: 'How much is the markup, in dollars?', final: 'What is the selling price, in dollars?' },
};
// Steps that build p% from easy pieces (10%, 5%, a quarter, a half or 1%).
function buildSteps(price, p) {
  const ten = R(price / 10), amt = R(price * p / 100);
  if (p === 50) return [`50% is half: ${money(price)} ÷ 2 = ${b(money(amt))}`];
  if (p === 25) return [`25% is one quarter: ${money(price)} ÷ 4 = ${b(money(amt))}`];
  if (p % 10 === 0) return [`10% is one tenth: ${money(price)} ÷ 10 = ${money(ten)}.`, p === 10 ? `So 10% is ${b(money(amt))}.` : `${p}% is ${p / 10} lots of 10%: ${p / 10} × ${money(ten)} = ${b(money(amt))}`];
  if (p % 5 === 0) return [`10% is one tenth: ${money(price)} ÷ 10 = ${money(ten)}.`, `5% is half of that: ${money(R(ten / 2))}.`,
    p === 5 ? `So 5% is ${b(money(amt))}.` : `${p}% = ${p - 5}% + 5%: ${money(R(ten * (p - 5) / 10))} + ${money(R(ten / 2))} = ${b(money(amt))}`];
  return [`1% is one hundredth: ${money(price)} ÷ 100 = ${money(R(price / 100))}.`, `${p}% is ${p} of those: ${p} × ${money(R(price / 100))} = ${b(money(amt))}`];
}
const decWay = (price, p) => way('Multiply by the decimal', [`Percent means "out of 100", so ${p}% = ${fmt(p / 100)}.`, `${money(price)} × ${fmt(p / 100)} = ${b(money(R(price * p / 100)))}`]);
function amount() {
  const kind = pick(Object.keys(KINDS)), c = KINDS[kind], price = pick([10, 20, 30, 40, 50, 60, 80, 100, 120, 200].filter(v => v <= (c.max || 200))), p = pick([5, 10, 20, 25, 50]);
  return tag({ story: c.story(money(price), p, nm(), pick(ITEMS)), ask: c.amount, visual: pctBar(p, `${c.part}: ?`, money(price)), answer: num(price * p / 100),
    ways: [way('Build it from easy pieces', buildSteps(price, p)), decWay(price, p)], hint: `Find ${p}% of ${money(price)}. Start with 10% or a simple fraction of the price.` },
  { kind: 'pctamt', price, p });
}
function finalWays(c, price, p) {
  const amt = R(price * p / 100), end = R(price + c.dir * amt), sign = c.dir > 0 ? '+' : '−', mult = 100 + c.dir * p;
  return [
    way(`Find the ${c.part}, then ${c.dir > 0 ? 'add it on' : 'take it off'}`, [...buildSteps(price, p), c.dir > 0 ? pctBar(p, `${c.part} ${money(amt)}`, money(price), { over: true }) : pctBar(p, `off ${money(amt)}`, money(price)),
      `${money(price)} ${sign} ${money(amt)} = ${b(money(end))}`]),
    way('One multiplication', [`The starting price is 100%. ${c.dir > 0 ? 'Adding' : 'Taking off'} ${p}% leaves ${100} ${sign} ${p} = ${b(mult + '%')} of it.`,
      `${mult}% = ${fmt(mult / 100)}, so ${money(price)} × ${fmt(mult / 100)} = ${b(money(end))}`]),
  ];
}
export function finalPrice(L) {
  const kind = pick(Object.keys(KINDS)), c = KINDS[kind], price = L >= 3 ? rnd(25, Math.min(180, c.max || 180)) : rnd(12, Math.min(90, c.max || 90)), p = pick(c.ps), n = nm();
  const end = R(price + c.dir * price * p / 100);
  return tag({ story: c.story(money(price), p, n, pick(ITEMS)), ask: c.final, answer: num(end), op: 'multi', ways: finalWays(c, price, p),
    read: { find: c.final.replace(', in dollars?', '.'), know: [`price: ${money(price)}`, `${c.part}: ${p}%`],
      clue: c.dir > 0 ? `A ${c.part} is added on top of the price.` : 'A discount is taken off the price.', plan: `find ${p}% of ${money(price)}, then ${c.dir > 0 ? 'add' : 'subtract'}` },
    hint: `First find ${p}% of ${money(price)}. Then decide: is it added on or taken off?` }, { kind: 'pctfinal', price, p, dir: c.dir });
}
function discountThenTax() {
  for (;;) {
    const price = rnd(4, 30) * 5, d = pick([10, 20, 25, 50]), t = pick([5, 8, 10]), sale = R(price * (100 - d) / 100), total = sale * (100 + t) / 100;
    if (!Number.isInteger(R(total * 100))) continue;
    return tag({ story: `${cap(pick(ITEMS))} is priced at ${k(money(price))}. It is ${k(d + '% off')}, and then ${k(t + '% sales tax')} is added to the sale price.`,
      ask: 'What is the final cost, in dollars?', answer: num(R(total)),
      ways: [way('One step at a time', [`Discount: ${d}% of ${money(price)} is ${money(R(price - sale))}, so the sale price is ${b(money(sale))}.`,
        `Tax: ${t}% of ${money(sale)} is ${money(R(total - sale))}.`, `${money(sale)} + ${money(R(total - sale))} = ${b(money(R(total)))}`]),
        way('Two multipliers', [`After ${d}% off you pay ${100 - d}% = ${fmt((100 - d) / 100)} of the price. Adding ${t}% tax means paying ${100 + t}% = ${fmt((100 + t) / 100)} of that.`,
          `${money(price)} × ${fmt((100 - d) / 100)} × ${fmt((100 + t) / 100)} = ${b(money(R(total)))}`]),
        way('Watch out for the trap', [`You cannot just do ${d}% − ${t}% = ${d - t}% off. The tax is a percent of the smaller sale price, not of the starting price.`])],
      hint: 'Work out the sale price first. The tax is a percent of the sale price.' }, { kind: 'disctax', price, d, t });
  }
}
function originalPrice() {
  const off = chance(0.6), p = off ? pick([10, 20, 25, 30, 40, 50]) : pick([5, 10, 20, 25]), orig = off ? rnd(2, 24) * 10 : pick([20, 40, 60, 80]), left = off ? 100 - p : 100 + p, after = R(orig * left / 100);
  return tag({ story: off ? `A pair of boots is ${k(p + '% off')}. The sale price is ${k(money(after))}.` : `After a ${k(p + '%')} tip, a meal came to ${k(money(after))}.`,
    ask: off ? 'What was the price before the sale, in dollars?' : 'What did the meal cost before the tip, in dollars?', answer: num(orig),
    ways: [way('Use the percent that the price you know stands for', [`The starting price is 100%. ${off ? `Taking ${p}% off leaves` : `Adding ${p}% makes`} ${b(left + '%')}, and that is the ${money(after)}.`,
      `1% is ${money(after)} ÷ ${left} = ${money(R(after / left))}.`, `100% is 100 × ${money(R(after / left))} = ${b(money(orig))}`]),
      way('Divide by the multiplier', [`start × ${fmt(left / 100)} = ${money(after)}`, `Undo the multiplying: ${money(after)} ÷ ${fmt(left / 100)} = ${b(money(orig))}`, `Check: ${p}% of ${money(orig)} is ${money(R(orig * p / 100))}, and ${money(orig)} ${off ? '−' : '+'} ${money(R(orig * p / 100))} = ${money(after)}.`]),
      way('Watch out for the trap', [`Do not take ${p}% of ${money(after)}. The ${p}% was a percent of the starting price, which you do not know yet.`])],
    hint: `${money(after)} is ${left}% of the starting price. What is 1%?` }, { kind: 'orig', after, p, dir: off ? -1 : 1 });
}
function whatPercent() {
  const tip = chance(0.5), p = tip ? pick([10, 15, 20, 25]) : pick([4, 5, 6, 8, 10]), whole = tip ? rnd(2, 4) * 20 : rnd(2, 12) * 50, part = R(whole * p / 100);
  return tag({ story: tip ? `A meal cost ${k(money(whole))} and the tip was ${k(money(part))}.` : `A bike costs ${k(money(whole))}. The sales tax on it is ${k(money(part))}.`,
    ask: tip ? 'What percent of the meal price was the tip?' : 'What is the sales tax rate, as a percent?', answer: num(p), suffix: '%',
    ways: [way('Part out of whole', [`Write the part over the whole: ${money(part)} out of ${money(whole)}.`, `${fmt(part)} ÷ ${fmt(whole)} = ${fmt(p / 100)}`, `Multiply by 100 to make it a percent: ${fmt(p / 100)} × 100 = ${b(p + '%')}.`]),
      way('Find 1% first', [`1% of ${money(whole)} is ${money(R(whole / 100))}.`, `How many of those make ${money(part)}? ${fmt(part)} ÷ ${fmt(R(whole / 100))} = ${b(p)}, so it is ${b(p + '%')}.`])],
    hint: 'Divide the part by the whole, then turn the decimal into a percent.' }, { kind: 'whatpct', part, whole });
}
export function genPct(L) {
  if (L === 1) return amount();
  if (L === 2) return finalPrice(L);
  const r = Math.random();
  return r < 0.35 ? discountThenTax() : r < 0.7 ? originalPrice() : r < 0.85 ? whatPercent() : finalPrice(L);
}
