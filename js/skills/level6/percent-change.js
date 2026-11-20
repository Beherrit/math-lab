// Percent increase and decrease, percent error, and simple interest.
import { R, rnd, pick, chance, fmt, money, b, k, way, nm, num, table } from '../../util.js';
import { tag, plural } from './helpers.js';
import { pctBar } from './visuals-lines.js';

// ok limits the old and new value to what the story can be; unit is [one, many].
const CHG = [
  { s: (a, c) => `The price of a concert ticket changed from ${k('$' + fmt(a))} to ${k('$' + fmt(c))}.`, unit: ['dollar', 'dollars'], ok: (o, n) => Math.min(o, n) >= 20 && Math.max(o, n) <= 300 },
  { s: (a, c) => `A club had ${k(plural(a, 'member'))} last year and has ${k(plural(c, 'member'))} this year.`, unit: ['member', 'members'], ok: (o, n) => Math.min(o, n) >= 10 && Math.max(o, n) <= 400 },
  { s: (a, c) => `A video had ${k(plural(a, 'view'))} on Monday and ${k(plural(c, 'view'))} on Tuesday.`, unit: ['view', 'views'], ok: () => true },
  { s: (a, c) => `A runner's time for a lap went from ${k(plural(a, 'second'))} to ${k(plural(c, 'second'))}.`, unit: ['second', 'seconds'], ok: (o, n) => Math.min(o, n) >= 40 && Math.max(o, n) <= 300 },
  { s: (a, c) => `A phone's storage in use went from ${k(fmt(a) + ' GB')} to ${k(fmt(c) + ' GB')}.`, unit: ['GB', 'GB'], ok: (o, n) => Math.min(o, n) >= 10 && Math.max(o, n) <= 250 },
];
// An old value and a whole-number new value that is exactly p% more or less (and believable for the story).
function changeValues(olds, ps, ok = () => true) {
  for (;;) {
    const old = pick(olds), p = pick(ps), dir = chance(0.5) ? 1 : -1, neu = old * (100 + dir * p) / 100;
    if (Number.isInteger(neu) && neu > 0 && ok(old, neu)) return { old, p, dir, neu };
  }
}
function findChange(olds, ps) {
  const c = pick(CHG), { old, p, dir, neu } = changeValues(olds, ps, c.ok), chg = Math.abs(neu - old), word = dir > 0 ? 'increase' : 'decrease';
  return tag({ story: c.s(old, neu), ask: `What is the percent ${word}?`, answer: num(p), suffix: '%',
    ways: [way('Change compared with the start', [`The change is ${fmt(Math.max(old, neu))} − ${fmt(Math.min(old, neu))} = ${b(plural(chg, c.unit[0], c.unit[1]))}.`,
      pctBar(p, `change: ${fmt(chg)}`, fmt(old), { over: dir > 0 }), `Compare the change with where it STARTED: ${fmt(chg)} ÷ ${fmt(old)} = ${fmt(p / 100)}.`, `${fmt(p / 100)} = ${b(p + '%')} ${word}.`]),
      way('New as a percent of old', [`${fmt(neu)} ÷ ${fmt(old)} = ${fmt(neu / old)}, so the new amount is ${fmt(R(neu / old * 100))}% of the old one.`,
        `The old amount was 100%. The gap between 100% and ${fmt(R(neu / old * 100))}% is ${b(p + '%')}.`]),
      way('Watch out for the trap', [`Always divide by the starting amount (${fmt(old)}), not the new one. The start is the 100%.`])],
    hint: 'How much did it change? Compare that change with the starting amount.' }, { kind: 'pctchg', old, neu });
}
const THINGS = [
  { t: 'A town library has %s books', min: 200, max: 600 }, { t: 'A game has %s daily players', min: 40, max: 600 },
  { t: 'A school has %s students', min: 120, max: 700 }, { t: 'A farm has %s apple trees', min: 40, max: 400 },
];
function applyChange() {
  const th = pick(THINGS), { old, p, dir, neu } = changeValues([40, 60, 80, 120, 150, 160, 200, 240, 250, 300, 400, 500], [5, 10, 15, 20, 25, 30, 40, 60, 75], (o, n) => Math.min(o, n) >= th.min && Math.max(o, n) <= th.max);
  const thing = th.t.replace('%s', k(fmt(old)));
  const amt = Math.abs(neu - old), mult = 100 + dir * p;
  return tag({ story: `${thing}. Next year the number will ${dir > 0 ? 'go up' : 'go down'} by ${k(p + '%')}.`, ask: 'What will the new number be?', answer: num(neu),
    ways: [way('Find the change, then apply it', [`${p}% of ${fmt(old)} = ${fmt(p / 100)} × ${fmt(old)} = ${b(fmt(amt))}.`, `${fmt(old)} ${dir > 0 ? '+' : '−'} ${fmt(amt)} = ${b(fmt(neu))}`]),
      way('One multiplication', [`The start is 100%. After the change it is ${mult}% of the start.`, `${fmt(old)} × ${fmt(mult / 100)} = ${b(fmt(neu))}`])],
    hint: `Find ${p}% of ${fmt(old)} first.` }, { kind: 'applychg', old, p, dir });
}
function reverseChange() {
  const { old, p, dir, neu } = changeValues([40, 50, 60, 80, 120, 150, 200, 250, 300], [10, 20, 25, 50], (o, n) => Math.min(o, n) >= 40), left = 100 + dir * p;
  return tag({ story: `After a ${k(p + '%')} ${dir > 0 ? 'increase' : 'decrease'}, a gym has ${k(plural(neu, 'member'))}.`, ask: 'How many members did it have before the change?', answer: num(old),
    ways: [way('Work back through 1%', [`The old number is 100%. The new number, ${fmt(neu)}, is ${b(left + '%')} of it.`, `1% is ${fmt(neu)} ÷ ${left} = ${fmt(R(neu / left))}.`, `100% is 100 × ${fmt(R(neu / left))} = ${b(fmt(old))}`]),
      way('Undo the multiplier', [`old × ${fmt(left / 100)} = ${fmt(neu)}, so old = ${fmt(neu)} ÷ ${fmt(left / 100)} = ${b(fmt(old))}`, `Check: ${p}% of ${fmt(old)} is ${fmt(old * p / 100)}, and ${fmt(old)} ${dir > 0 ? '+' : '−'} ${fmt(old * p / 100)} = ${fmt(neu)}.`])],
    hint: `${fmt(neu)} is ${left}% of the old number. What is 1%?` }, { kind: 'orig', after: neu, p, dir });
}
function upThenDown() {
  const start = pick([100, 200, 400, 500, 1000]), p = pick([10, 20, 25, 50]), up = start * (100 + p) / 100, end = up * (100 - p) / 100;
  return tag({ story: `A bike costs ${k('$' + fmt(start))}. The price goes ${k('up ' + p + '%')}. Later the new price is cut by ${k(p + '%')}.`, ask: 'What is the final price, in dollars?', answer: num(end),
    ways: [way('One step at a time', [`Up ${p}%: ${p}% of ${fmt(start)} is ${fmt(up - start)}, so the price becomes ${b(fmt(up))}.`,
      `Down ${p}%: now take ${p}% of ${b(fmt(up))}, which is ${fmt(up - end)}.`, `${fmt(up)} − ${fmt(up - end)} = ${b(fmt(end))}`]),
      way('Why it is not back to the start', [`The cut is ${p}% of a BIGGER number (${fmt(up)}), so it takes off more than the rise put on.`, `Multipliers: ${fmt(start)} × ${fmt((100 + p) / 100)} × ${fmt((100 - p) / 100)} = ${b(fmt(end))}`])],
    hint: `Find the price after the rise first. The cut is a percent of that new price.` }, { kind: 'updown', start, p });
}
function percentError() {
  for (;;) {
    const act = pick([50, 80, 100, 200]), p = pick([4, 5, 10, 20, 25]), d = act * p / 100;
    if (!Number.isInteger(d)) continue;
    const est = act + (chance(0.5) ? d : -d);
    return tag({ story: `${nm()} estimated that a bookshelf was ${k(est + ' cm')} long. The real length is ${k(act + ' cm')}.`, ask: 'What is the percent error of the estimate?', answer: num(p), suffix: '%',
      ways: [way('Error compared with the real value', [`The error is how far off the estimate was: ${Math.max(est, act)} − ${Math.min(est, act)} = ${b(d)} cm.`, `Compare it with the REAL value: ${d} ÷ ${act} = ${fmt(d / act)} = ${b(p + '%')}`]),
        way('Find 1% of the real value', [`1% of ${act} cm is ${fmt(act / 100)} cm.`, `The error of ${d} cm is ${d} ÷ ${fmt(act / 100)} = ${b(p)} of those, so ${b(p + '%')}.`])],
      hint: 'How far off was the estimate? Divide that by the real length.' }, { kind: 'pcterr', est, act });
  }
}
export function genPctChg(L) {
  const r = Math.random();
  if (L === 1) return findChange([10, 20, 40, 50, 100, 200], [10, 20, 25, 50]);
  if (L === 2) return r < 0.55 ? findChange([40, 60, 80, 120, 150, 160, 240, 250, 300, 400], [5, 15, 30, 35, 40, 60, 75]) : applyChange();
  return r < 0.35 ? reverseChange() : r < 0.65 ? upThenDown() : percentError();
}

const yearsText = t => (Number.isInteger(t) ? plural(t, 'year') : plural(t * 12, 'month'));
function interestWays(P, r, t, want) {
  const year = R(P * r / 100), I = R(year * t);
  if (want === 'I' || want === 'total') return [
    way('One year, then all the years', [`Interest for 1 year is ${fmt(r)}% of ${money(P)}: ${fmt(r / 100)} × ${fmt(P)} = ${b(money(year))}.`,
      Number.isInteger(t) && t <= 5 ? table(['Year', ...Array.from({ length: t }, (_, i) => i + 1)], [['Interest', ...Array(t).fill(money(year))]]) : Number.isInteger(t) ? `The interest is paid for ${yearsText(t)}.` : `${t * 12} months is ${fmt(t)} of a year.`,
      `Simple interest is the same every year, so multiply: ${money(year)} × ${fmt(t)} = ${b(money(I))}`, ...(want === 'total' ? [`Add it to the starting amount: ${money(P)} + ${money(I)} = ${b(money(P + I))}`] : [])]),
    way('The formula I = P × r × t', [`P is the starting amount, r is the rate as a decimal, t is the time in years.`, `I = ${fmt(P)} × ${fmt(r / 100)} × ${fmt(t)} = ${b(money(I))}`,
      ...(want === 'total' ? [`Total: ${money(P)} + ${money(I)} = ${b(money(P + I))}`] : [])])];
  if (want === 'r') return [way('Find one year of interest first', [`${money(I)} over ${yearsText(t)} is ${money(I)} ÷ ${t} = ${b(money(year))} each year.`, `What percent of ${money(P)} is that? ${fmt(year)} ÷ ${fmt(P)} = ${fmt(r / 100)} = ${b(fmt(r) + '%')}`]),
    way('Use I = P × r × t', [`${fmt(I)} = ${fmt(P)} × r × ${t}, so ${fmt(I)} = ${fmt(P * t)} × r.`, `r = ${fmt(I)} ÷ ${fmt(P * t)} = ${fmt(r / 100)} = ${b(fmt(r) + '%')}`])];
  return [way('Find one year of interest first', [`One year earns ${fmt(r)}% of ${money(P)} = ${b(money(year))}.`, `How many years to reach ${money(I)}? ${fmt(I)} ÷ ${fmt(year)} = ${b(plural(t, 'year'))}.`]),
    way('Use I = P × r × t', [`${fmt(I)} = ${fmt(P)} × ${fmt(r / 100)} × t, so ${fmt(I)} = ${fmt(year)} × t.`, `t = ${fmt(I)} ÷ ${fmt(year)} = ${b(t)}`])];
}
export function interestWord(L) {
  const lvl = L || 2, saver = chance(0.6), n = nm();
  const P = lvl === 1 ? pick([100, 200, 300, 400, 500, 1000]) : rnd(2, 30) * (lvl === 3 ? 400 : 200);
  const r = lvl === 1 ? pick([2, 3, 4, 5, 10]) : pick([1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6]);
  const t = lvl === 1 ? rnd(1, 4) : lvl === 2 ? rnd(2, 6) : pick([2, 3, 4, 5, 0.5, 0.25, 1.5]);
  const want = lvl === 1 ? 'I' : lvl === 2 ? pick(['I', 'total']) : Number.isInteger(t) ? pick(['r', 't', 'total']) : 'I';
  const I = R(P * r * t / 100), value = { I, total: P + I, r, t }[want];
  const start = saver ? `${n} puts ${k(money(P))} into a savings account` : `${n} borrows ${k(money(P))} from a bank`;
  const story = want === 'r' ? `${start}. After ${k(yearsText(t))} the simple interest is ${k(money(I))}.` : want === 't' ? `${start} at ${k(fmt(r) + '%')} simple interest a year. The interest so far is ${k(money(I))}.`
    : `${start} at ${k(fmt(r) + '%')} simple interest a year, for ${k(yearsText(t))}.`;
  const ask = { I: 'How much interest is that, in dollars?', total: saver ? 'How much is in the account at the end, in dollars?' : 'How much must be paid back in total, in dollars?', r: 'What is the yearly interest rate, as a percent?', t: 'How many years has it been?' }[want];
  return tag({ story, ask, answer: num(value), op: 'multi', ways: interestWays(P, r, t, want), suffix: want === 'r' ? '%' : want === 't' ? 'years' : '',
    read: { find: ask.replace(', in dollars?', '.'), know: [`start: ${money(P)}`, want === 'r' ? `interest: ${money(I)}` : `rate: ${fmt(r)}% a year`, want === 't' ? `interest: ${money(I)}` : `time: ${yearsText(t)}`],
      clue: 'Simple interest earns the same amount every year: a percent of the starting amount.', plan: 'interest = start × rate × years' },
    hint: want === 'I' || want === 'total' ? `Find ${fmt(r)}% of ${money(P)}. That is the interest for one year.` : 'Work out how much interest there is for ONE year first.' }, { kind: 'interest', P, r, t, want, I: want === 'r' || want === 't' ? I : undefined });
}
export const genInterest = L => interestWord(L);
