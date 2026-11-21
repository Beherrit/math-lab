// Rewriting expressions to see what they mean: a + 0.05a = 1.05a, "increase by 5%" as "multiply by 1.05", two forms of one quantity.
import { R, rnd, pick, fmt, money, b, way, num, choice, shuffle } from '../../util.js';
import { tag } from './helpers.js';

const UP = [['p', 'A phone costs p dollars. Sales tax of {P}% is added.', 'What is the total cost?'], ['b', 'A restaurant bill is b dollars. A {P}% tip is added.', 'What is the total with the tip?'],
  ['n', 'A town has n people. Its population grows {P}%.', 'How many people live there after the growth?'], ['v', 'A video has v views. The views rise by {P}%.', 'How many views does it have then?']];
const DOWN = [['p', 'A jacket costs p dollars and is {P}% off.', 'What is the sale price?'], ['m', 'A gym has m members. The number of members falls {P}%.', 'How many members are left?'],
  ['c', 'A phone has c photos. {P}% of the photos are deleted.', 'How many photos are left?']];
const rate = P => R(P / 100), mult = (P, dir) => R(1 + dir * P / 100);
const pcts = dir => (dir > 0 ? [5, 8, 10, 12, 15, 20, 25, 30, 40, 50] : [5, 10, 15, 20, 25, 30, 40]);

function multiplier(dir) {
  const [v, text, ask] = pick(dir > 0 ? UP : DOWN), P = pick(pcts(dir)), m = mult(P, dir);
  const right = `${fmt(m)}${v}`, wrong = dir > 0 ? [`${fmt(rate(P))}${v}`, `${v} + ${P}`, `${P}${v}`] : [`${fmt(rate(P))}${v}`, `${v} − ${P}`, `${fmt(mult(P, 1))}${v}`];
  return tag({ story: text.replace('{P}', P), ask, answer: choice(right, wrong),
    ways: [way(dir > 0 ? 'Add the percent on' : 'Take the percent off', [`${P}% of ${v} is ${fmt(rate(P))}${v}.`, `${v} ${dir > 0 ? '+' : '−'} ${fmt(rate(P))}${v} = (1 ${dir > 0 ? '+' : '−'} ${fmt(rate(P))})${v} = ${b(right)}`]),
      way('Test with 100', [`Pretend ${v} is 100. ${P}% of 100 is ${P}, so the answer is ${100 + dir * P}.`, `${right} gives ${fmt(m)} × 100 = ${100 + dir * P}. The other choices give a different number.`])],
    hint: `Starting at 100% and ${dir > 0 ? 'adding' : 'taking off'} the percent leaves what percent? Write that percent as a decimal.` }, { kind: 'rwchoice', shape: 'multiplier', p: P, dir, v });
}
function blank(dir, bigger) {
  const v = pick(['a', 'p', 'n', 'c']), P = pick(bigger ? [12, 15, 35, 45, 65] : pcts(dir).slice(0, 6)), r = rate(P), m = mult(P, dir);
  return tag({ ask: 'What number goes in the blank?', expr: `${v} ${dir > 0 ? '+' : '−'} ${fmt(r)}${v} = <span class="blank">?</span>${v}`, answer: num(m),
    ways: [way('Combine like terms', [`${v} on its own means one ${v}, so ${v} ${dir > 0 ? '+' : '−'} ${fmt(r)}${v} = (1 ${dir > 0 ? '+' : '−'} ${fmt(r)})${v}.`, `1 ${dir > 0 ? '+' : '−'} ${fmt(r)} = ${b(fmt(m))}`]),
      way('Try 100 for ' + v, [`${v} = 100: 100 ${dir > 0 ? '+' : '−'} ${fmt(R(r * 100))} = ${100 + dir * P}.`, `${100 + dir * P} = ? × 100, so ? = ${b(fmt(m))}`])],
    hint: `${v} on its own is one ${v}. Add or take away the two amounts of ${v}.` }, { kind: 'rwblank', shape: 'blank', r, dir });
}
function percentOf(L) {
  const dir = Math.random() < 0.5 ? 1 : -1, m = L === 1 ? pick(dir > 0 ? [1.05, 1.1, 1.2, 1.25, 1.5] : [0.9, 0.8, 0.75, 0.5]) : pick(dir > 0 ? [1.12, 1.35, 1.75, 2.25, 1.08, 1.15] : [0.45, 0.65, 0.92, 0.85, 0.7]), P = R(Math.abs(m - 1) * 100);
  return tag({ ask: `Multiplying a price by ${fmt(m)} ${dir > 0 ? 'increases' : 'decreases'} it. By what percent?`, answer: num(P), suffix: '%',
    ways: [way('Compare with 1', [`Multiplying by 1 leaves a price alone. ${fmt(m)} is ${fmt(R(Math.abs(m - 1)))} ${dir > 0 ? 'more' : 'less'} than 1.`, `${fmt(R(Math.abs(m - 1)))} as a percent is ${b(fmt(P) + '%')}.`]),
      way('Try a price of 100', [`100 × ${fmt(m)} = ${fmt(R(100 * m))}.`, `The price changed from 100 to ${fmt(R(100 * m))}, a change of ${fmt(P)}. Out of 100 that is ${b(fmt(P) + '%')}.`])],
    hint: `Multiplying by 1 leaves a price alone. How far is the number from 1? Turn that gap into a percent.` }, { kind: 'rwpct', shape: 'percent', m, dir });
}
function evaluate() {
  const v = pick([20, 40, 50, 60, 80, 100]), P = pick([5, 10, 15, 20, 25]), dir = Math.random() < 0.6 ? 1 : -1, m = mult(P, dir), ans = R(v * m);
  return tag({ story: `A ${pick(['snack', 'game', 'book', 'jersey'])} costs ${money(v)}. ${dir > 0 ? `A ${P}% tax is added` : `It is ${P}% off`}, so the new price is ${fmt(m)} times ${money(v)}.`, ask: 'What is the new price, in dollars?', answer: num(ans),
    ways: [way('Use the multiplier', [`${money(v)} × ${fmt(m)} = ${b(money(ans))}`]), way('Change, then add or take away', [`${P}% of ${money(v)} is ${money(R(v * rate(P)))}.`, `${money(v)} ${dir > 0 ? '+' : '−'} ${money(R(v * rate(P)))} = ${b(money(ans))}`])],
    hint: 'The story gives the multiplier. Multiply the price by it.' }, { kind: 'rwval', shape: 'evaluate', v, p: P, dir, m });
}
// Two percent changes in a row make one multiplier: the two multipliers multiplied together.
function twoStep(mixed) {
  for (;;) {
    const d1 = mixed ? 1 : pick([1, -1]), d2 = mixed ? -1 : d1, P1 = pick([10, 20, 25, 50]), P2 = pick([10, 20, 25, 50]), val = R(mult(P1, d1) * mult(P2, d2)), words = (d, P) => `${d > 0 ? 'rises' : 'falls'} ${P}%`;
    if (!Number.isInteger(R(val * 100)) || (mixed && val === 1)) continue;
    return tag({ story: `A price ${words(d1, P1)}. Then the new price ${words(d2, P2)}.`, ask: 'The final price equals the starting price multiplied by what number?', answer: num(val),
      ways: [way('Use a price of 100', [`After the first change: 100 ${d1 > 0 ? '+' : '−'} ${P1} = ${100 + d1 * P1}.`, `The second change is a percent of THAT: ${100 + d1 * P1} × ${fmt(mult(P2, d2))} = ${fmt(R(100 * val))}.`, `${fmt(R(100 * val))} out of 100 is ${b(fmt(val))} times the start.`]),
        way('Multiply the multipliers', [`First change: × ${fmt(mult(P1, d1))}. Second change: × ${fmt(mult(P2, d2))}.`, `${fmt(mult(P1, d1))} × ${fmt(mult(P2, d2))} = ${b(fmt(val))}`])],
      hint: 'Each change is its own multiplier. The second percent works on the new price, not the start.' }, { kind: 'rwtwo', shape: 'twostep', p1: P1, p2: P2, d1, d2 });
  }
}
// Given an expression with percents in it, pick the single simplified form.
function express() {
  for (;;) {
    const v = pick(['n', 'a', 'c', 'm']), r1 = pick([0.1, 0.15, 0.2, 0.25, 0.3]), r2 = pick([0.05, 0.1, 0.15]), two = Math.random() < 0.6;
    const sum = two ? R(1 + r1 - r2) : R(1 + r1), src = two ? `${v} + ${fmt(r1)}${v} − ${fmt(r2)}${v}` : `${v} + ${fmt(r1)}${v}`;
    const bad = [`${fmt(R(sum - 1))}${v}`, `${fmt(R(two ? 1 + r1 + r2 : 1 + r1 * 10))}${v}`, `${v} ${sum < 1 ? '−' : '+'} ${Math.abs(Math.round(R(sum - 1) * 100))}`];
    if (r1 === r2 || new Set([`${fmt(sum)}${v}`, ...bad]).size < 4) continue;
    return tag({ ask: 'Which expression is the same as this one?', expr: src, answer: choice(`${fmt(sum)}${v}`, bad),
      ways: [way(`Combine the ${v} terms`, [`${v} on its own is one ${v}. Add and subtract the amounts of ${v}: ${two ? `1 + ${fmt(r1)} − ${fmt(r2)}` : `1 + ${fmt(r1)}`} = ${b(fmt(sum))}.`, `So the expression is ${b(fmt(sum) + v)}.`]),
        way('Try the number 100', [`Put ${v} = 100: ${src.replace(new RegExp(v, 'g'), '100')} = ${fmt(R(sum * 100))}.`, `${fmt(sum)}${v} gives ${fmt(sum)} × 100 = ${fmt(R(sum * 100))}. The other choices give different numbers.`])],
      hint: 'Every term has the same letter. Add and subtract the numbers in front of it, remembering the plain letter has a 1.' }, { kind: 'rwexpr', shape: 'express', r1, r2: two ? r2 : 0, v });
  }
}
const ITEMS = [
  { id: 'pens', vars: ['p', 'n'], story: k => `Pens cost p dollars each and notebooks cost n dollars each. Ava buys ${k} pens and ${k} notebooks.`, ask: 'Which expression shows the total cost?', right: k => `${k}(p + n)`, wrong: k => [`${k}p + n`, `${k}pn`, `p + n + ${k}`] },
  { id: 'taxi', vars: ['f', 'r', 'd'], story: () => 'A taxi charges a fee of f dollars once, plus r dollars for each kilometre. A trip is d kilometres.', ask: 'Which expression shows the cost of the trip?', right: () => 'f + rd', wrong: () => ['(f + r)d', 'frd', 'f + r + d'] },
  { id: 'rect', vars: ['w'], story: k => `A rectangle is w centimetres wide. Its length is ${k} centimetres more than its width.`, ask: 'Which expression shows its perimeter?', right: k => `4w + ${2 * k}`, wrong: k => [`4w + ${k}`, `2w + ${2 * k}`, `w + ${2 * k}`] },
  { id: 'team', vars: ['g', 'a'], story: k => `A player scores ${k} points for each goal g and 1 point for each assist a.`, ask: 'Which expression shows the total points?', right: k => `${k}g + a`, wrong: k => [`${k}(g + a)`, `${k}ga`, `g + a + ${k}`] },
];
function sameQuantity() {
  const it = pick(ITEMS), k = rnd(2, 6), opts = [it.right(k), ...it.wrong(k)];
  return tag({ story: it.story(k), ask: it.ask, answer: choice(opts[0], opts.slice(1)),
    ways: [way('Build it from the story', [it.id === 'pens' ? `Each pen and notebook together cost p + n. There are ${k} of each, so ${k} lots of (p + n): ${b(opts[0])}.` : it.id === 'taxi' ? 'The fee f is paid once. The rate r is paid d times, so r × d is rd. Add them: f + rd.'
      : it.id === 'rect' ? `Length = w + ${k}. Perimeter = 2 × (width + length) = 2 × (w + w + ${k}) = 4w + ${2 * k}.` : `${k} points for each goal: ${k} × g = ${k}g. One point for each assist: a. Add: ${b(opts[0])}.`]),
      way('Try numbers', [it.id === 'pens' ? `Try p = 2 and n = 3 with ${k} of each: ${k} × 2 + ${k} × 3 = ${k * 5}. Only ${opts[0]} gives ${k * 5}.` : it.id === 'taxi' ? 'Try f = 5, r = 2 and d = 3: the fee is 5 and the distance part is 2 × 3 = 6, so the cost is 11. Only f + rd gives 11.'
        : it.id === 'rect' ? `Try w = 3: length is ${3 + k}, so the perimeter is ${2 * (3 + 3 + k)}. Only ${opts[0]} gives ${2 * (3 + 3 + k)}.` : `Try g = 2 and a = 3: ${k} × 2 + 3 = ${2 * k + 3}. Only ${opts[0]} gives ${2 * k + 3}.`])],
    hint: 'Say in words what each part of the total is. Then check each choice with small numbers.' }, { kind: 'rwsame', shape: 'samequantity', item: it.id, k: it.id === 'taxi' ? 0 : k });
}
export function genRewrite(L) {
  const r = Math.random();
  if (L === 1) return r < 0.3 ? multiplier(1) : r < 0.55 ? blank(1, false) : r < 0.8 ? percentOf(1) : evaluate();
  if (L === 2) return r < 0.25 ? multiplier(-1) : r < 0.45 ? blank(pick([1, -1]), true) : r < 0.7 ? twoStep(false) : sameQuantity();
  return r < 0.25 ? twoStep(true) : r < 0.45 ? percentOf(3) : r < 0.7 ? express() : r < 0.85 ? sameQuantity() : multiplier(pick([1, -1]));
}
