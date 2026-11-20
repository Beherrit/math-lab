// What percent is it: the percent when you know the part and the whole, including percents over 100 and under 1.
import { R, rnd, pick, lcm, fmt, plain, money, F, b, k, way, nm, num, choice, table } from '../../util.js';
import { T, PAIRS, numChoice, pct } from './helpers.js';
import { pctBar } from './visuals.js';

const dec = x => plain(R(x));
const pctOf = (part, whole) => R(100 * part / whole);
const read = (find, know, plan) => ({ find, know, clue: '“What percent” means: out of 100, how many?', plan });
// Part out of whole as a percent: scale to 100 when the whole goes into 100, otherwise find what 1 is worth.
function scaleWays(part, whole) {
  const p = pctOf(part, whole), m = 100 / whole;
  const first = Number.isInteger(m)
    ? [`Write it as a fraction: ${F(part, whole)}`, `Scale to 100: multiply top and bottom by ${m}. ${F(part, whole)} = ${F(part * m, 100)}`, `${fmt(p)} out of 100 is ${b(pct(p))}`]
    : [`The whole is ${fmt(whole)}, which is not a friendly part of 100. Find what 1 is worth: 100% ÷ ${fmt(whole)} = ${fmt(R(m))}%.`, `${fmt(part)} of them: ${fmt(part)} × ${fmt(R(m))} = ${fmt(p)}`, `So it is ${b(pct(p))}.`];
  return [way('Make it out of 100', first), way('Divide, then read as a percent', [`${fmt(part)} ÷ ${fmt(whole)} = ${dec(part / whole)}`, `${dec(part / whole)} is ${fmt(p)} hundredths, so ${b(pct(p))}`])];
}
// Contexts: part and whole believable between min and max.
const CTX = [
  { min: 4, max: 50, s: (a, w, n) => `${n} got ${k(a)} out of ${k(w)} questions right on a quiz.` }, { min: 5, max: 50, s: (a, w, n) => `${n} made ${k(a)} of ${k(w)} free throws in practice.` },
  { min: 10, max: 400, s: (a, w) => `On a playlist of ${k(w + ' songs')}, ${k(a)} are by one band.` }, { min: 20, max: 400, s: (a, w, n) => `${n} has saved ${k(money(a))} of the ${k(money(w))} needed for a new bike.` },
  { min: 16, max: 400, s: (a, w) => `A phone has ${k(a + ' GB')} of its ${k(w + ' GB')} of storage used.` }, { min: 8, max: 80, s: (a, w) => `It rained on ${k(a)} of the ${k(w)} days of a camping trip.` },
  { min: 4, max: 10, s: (a, w, n) => `${n} ate ${k(a)} of the ${k(w)} slices of a pizza.` },
];
const WHOLES = { 1: [4, 5, 10, 20, 25, 50], 2: [8, 40, 80, 200, 250, 400], 3: [8, 40, 80, 200, 250, 400] };
function outOf(L) {
  const whole = pick(WHOLES[L]), part = rnd(1, whole - 1), c = pick(CTX.filter(x => whole >= x.min && whole <= x.max)), who = nm();
  return T({ story: c.s(part, whole, who), ask: 'What percent is that?', answer: num(pctOf(part, whole)), suffix: '%', op: 'div', ways: scaleWays(part, whole),
    read: read('The part as a percent of the whole.', [`${part} is the part`, `${whole} is the whole`], `${part} ÷ ${whole}, then to a percent`),
    hint: 'Percent means out of 100. How would you rewrite the whole so that it is 100?' }, 'wpOutOf', { part, whole });
}
function bar() {
  const parts = pick([4, 5, 10, 20]), on = rnd(1, parts - 1), each = 100 / parts, p = on * each;
  return T({ ask: 'What percent of the bar is shaded?', visual: pctBar(parts, on, '0%', '100%'), answer: num(p), suffix: '%',
    ways: [way('Value of one piece', [`The bar is cut into ${parts} equal pieces. The whole bar is 100%, so each piece is 100 ÷ ${parts} = ${fmt(each)}%.`, `${on} pieces are shaded: ${on} × ${fmt(each)} = ${b(pct(p))}`]),
      way('Use a fraction', [`${on} of the ${parts} pieces are shaded: ${F(on, parts)}.`, `${F(on, parts)} = ${F(p, 100)}, so ${b(pct(p))}`])],
    hint: 'All the pieces are the same size. What percent is the whole bar, and how many pieces make it?' }, 'wpBar', { parts, on });
}
function twoParts(L) {
  const c = pick(PAIRS), total = pick(L === 1 ? [10, 20, 25, 50] : [8, 40, 80, 200, 250]), x = rnd(1, total - 1), y = total - x, p = pctOf(x, total);
  return T({ story: c.s(k(x), k(y)), ask: `What percent of the ${c.all} are ${b(c.a)}?`, answer: num(p), suffix: '%', op: 'multi',
    ways: [way('Find the whole first', [`The whole is both groups together: ${x} + ${y} = ${total}.`, ...scaleWays(x, total)[0].s]),
      way('Ratio table', [table(['amount', 'percent'], [[total, '100%'], [1, pct(R(100 / total))], [x, b(pct(p))]]), `Divide both columns by ${total}, then multiply both by ${x}: ${x} × ${fmt(R(100 / total))} = ${fmt(p)}`])],
    read: read(`The ${c.a} as a percent of all the ${c.all}.`, [`${x} ${c.a}`, `${y} ${c.b}`], `${x} ÷ (${x} + ${y}), then to a percent`),
    hint: `The whole is not given. Add the two groups first.` }, 'wpTwo', { a: x, b: y });
}
function pickPercent(L) {
  const whole = pick(WHOLES[L === 1 ? 1 : 2]), part = rnd(1, whole - 1), p = pctOf(part, whole);
  return T({ ask: `Which percent is the same as ${b(part)} out of ${b(whole)}?`, answer: numChoice(p, [R(p / 100), R(100 - p), R(whole - part)], pct), choiceBig: true,
    ways: [...scaleWays(part, whole).slice(0, 1), way('Estimate first', [`${part} is ${part * 2 > whole ? 'more than' : part * 2 === whole ? 'exactly' : 'less than'} half of ${whole}, so the percent is ${part * 2 > whole ? 'over' : part * 2 === whole ? 'exactly' : 'under'} 50%.`, `The answer must be out of 100, never a tiny decimal and never over 100%. That leaves ${b(pct(p))}.`])],
    hint: 'Is the part more or less than half of the whole? That tells you which side of 50% to look at.' }, 'wpPick', { part, whole });
}
const NAMES2 = () => { const a = nm(); let c = nm(); while (c === a) c = nm(); return [a, c]; };
function compare(L) {
  const pool = L === 2 ? [20, 25, 40, 50] : [8, 16, 25, 40, 80], [n1, n2] = NAMES2();
  for (;;) {
    const w1 = pick(pool), w2 = pick(pool.filter(x => x !== w1)), a1 = rnd(2, w1 - 1), a2 = rnd(2, w2 - 1), p1 = pctOf(a1, w1), p2 = pctOf(a2, w2);
    if (Math.abs(p1 - p2) < 4) continue;
    const win = p1 > p2 ? n1 : n2, big = lcm(w1, w2);
    return T({ story: `${n1} made ${k(a1)} of ${k(w1)} free throws. ${n2} made ${k(a2)} of ${k(w2)}.`, ask: 'Who made the greater percent of their free throws?', answer: choice(win, [], { all: [n1, n2] }), choiceBig: true, op: 'multi',
      ways: [way('Change both to percents', [`${n1}: ${a1} out of ${w1} = ${b(pct(p1))}.`, `${n2}: ${a2} out of ${w2} = ${b(pct(p2))}.`, `${fmt(Math.max(p1, p2))}% is greater than ${fmt(Math.min(p1, p2))}%, so ${b(win)} made the greater percent.`]),
        way('Make the wholes match', [`Both ${w1} and ${w2} go into ${big}. Scale both scores to be out of ${big}.`, `${n1}: ${a1} × ${big / w1} = ${a1 * big / w1} out of ${big}. ${n2}: ${a2} × ${big / w2} = ${a2 * big / w2} out of ${big}.`, `${fmt(Math.max(a1 * big / w1, a2 * big / w2))} is greater than ${fmt(Math.min(a1 * big / w1, a2 * big / w2))}, so ${b(win)} did better.`])],
      read: read('Who made the greater percent (not the greater number of shots).', [`${n1}: ${a1} of ${w1}`, `${n2}: ${a2} of ${w2}`], 'turn both into percents'),
      hint: 'The numbers of shots are different, so compare fairly: change both scores to a percent, or to the same total.' }, 'wpCompare', { n1, a1, w1, n2, a2, w2 });
  }
}
// The new amount as a percent of the old one: over 100% when it grew.
const GROW = [(o, n) => `A cactus was ${k(o + ' cm')} tall. Now it is ${k(n + ' cm')} tall.`, (o, n) => `A game player had ${k(o + ' points')} last week and ${k(n + ' points')} this week.`, (o, n) => `A channel had ${k(o)} followers in May and ${k(n)} in June.`, (o, n) => `A savings jar held ${k('$' + o)}. Now it holds ${k('$' + n)}.`];
function over() {
  const p = pick([110, 120, 125, 150, 175, 200, 250, 300]), o = pick([20, 40, 60, 80, 100, 120, 200]), n = o * p / 100, extra = n - o;
  return T({ story: pick(GROW)(o, n), ask: 'The new amount is what percent of the old amount?', answer: num(p), suffix: '%', op: 'multi',
    ways: [way('The old amount is 100%', [`Compare the new amount with the old one: ${n} out of ${o}.`, 'It is over 100% when the new amount is bigger than the old one.', `${F(n, o)} = ${dec(n / o)}, and ${dec(n / o)} is ${p} hundredths: ${b(pct(p))}`]),
      way('Whole plus extra', [`The old amount is all of it: 100%. The new amount has ${n} − ${o} = ${extra} extra.`, `${extra} out of ${o} is ${fmt(pctOf(extra, o))}%, so the new amount is 100% + ${fmt(pctOf(extra, o))}% = ${b(pct(p))}.`])],
    read: read('The new amount as a percent of the old amount.', [`old: ${o}`, `new: ${n}`], `${n} ÷ ${o}, then to a percent`),
    hint: 'The old amount is the whole, which is 100%. Is the new amount more or less than the whole?' }, 'wpOver', { part: n, whole: o });
}
const TINY = [(a, w) => `A school has ${k(w + ' students')}. ${k(a)} of them play the tuba.`, (a, w) => `A town has ${k(w + ' people')}. ${k(a)} of them saw a new film on opening night.`, (a, w) => `A video has ${k(w + ' views')}. ${k(a)} of them came from one school.`];
function under() {
  const whole = pick([200, 400, 500, 800, 1000, 2000]), part = rnd(1, whole / 100 - 1), p = pctOf(part, whole), one = whole / 100;
  return T({ story: pick(TINY)(part, whole), ask: 'What percent is that?', answer: num(p), suffix: '%', op: 'div',
    ways: [way('Find 1% first', [`1% of ${fmt(whole)} is ${fmt(whole)} ÷ 100 = ${one}.`, `${part} is less than ${one}, so it is less than 1%.`, `${part} ÷ ${one} = ${dec(part / one)} of one percent, so it is ${b(pct(p))}.`]),
      way('Divide, then read as a percent', [`${part} ÷ ${fmt(whole)} = ${dec(part / whole)}`, `${dec(part / whole)} × 100 = ${fmt(p)}, so ${b(pct(p))}`])],
    read: read('The part as a percent of the whole, which is less than 1%.', [`${part} is the part`, `${fmt(whole)} is the whole`], `${part} ÷ ${fmt(whole)}, then to a percent`),
    hint: 'First find 1% of the whole. Is the part bigger or smaller than that?' }, 'wpUnder', { part, whole });
}
const SHAPES = { 1: [bar, () => outOf(1), () => twoParts(1), () => pickPercent(1)], 2: [() => outOf(2), () => twoParts(2), () => pickPercent(2), () => compare(2)], 3: [over, under, () => compare(3), () => outOf(3), () => twoParts(2)] };
export const genWhatPct = L => pick(SHAPES[L])();
export const whatPctWord = () => pick([() => outOf(2), () => twoParts(2), over, under, () => compare(2)])();
