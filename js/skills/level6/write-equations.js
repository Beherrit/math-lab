// Writing equations from stories: px + q = r and p(x + q) = r, solved by arithmetic and by algebra.
import { rnd, pick, fmt, b, way, nm, num, choice } from '../../util.js';
import { tag } from './helpers.js';
import { genWriteInequalities } from './write-inequalities.js';

const EQ_CTX = [
  { s: (n, p, q, r) => `${n}'s phone plan costs $${q} to set up and $${p} a month. So far ${n} has paid $${r}.`, unit: 'month', ask: 'For how many months has the plan run?', fixed: 'set-up cost' },
  { s: (n, p, q, r) => `A skate park charges $${q} to get in and $${p} for each hour. ${n} paid $${r} in all.`, unit: 'hour', ask: 'For how many hours did ${n} skate?', fixed: 'entry fee' },
  { s: (n, p, q, r) => `${n} buys a sticker album for $${q} and packs of stickers at $${p} each. ${n} spent $${r} in all.`, unit: 'pack', ask: 'How many packs did ${n} buy?', fixed: 'album price' },
  { s: (n, p, q, r) => `A bakery charges $${q} for delivery and $${p} for each box of cookies. ${n}'s bill was $${r}.`, unit: 'box', ask: 'How many boxes were ordered?', fixed: 'delivery fee' },
  { s: (n, p, q, r) => `An arcade card costs $${q}, and each game costs $${p}. ${n} spent $${r} altogether.`, unit: 'game', ask: 'How many games did ${n} play?', fixed: 'card price' },
];
const PAREN_CTX = [
  { s: (p, q, r) => `${p} friends share a taxi. Each pays the same fare plus a $${q} tip. Together they pay $${r}.`, ask: 'What is the fare each friend pays, before the tip, in dollars?', what: 'fare' },
  { s: (p, q, r) => `A club orders ${p} shirts. Each shirt costs the same price plus $${q} for printing. The order comes to $${r}.`, ask: 'How much does one shirt cost before printing, in dollars?', what: 'shirt price' },
  { s: (p, q, r) => `${p} cousins each get the same amount of money plus a $${q} bonus. Together they get $${r}.`, ask: 'How much does each cousin get before the bonus, in dollars?', what: 'amount' },
  { s: (p, q, r) => `A party host buys ${p} gift bags. Each has a toy and a $${q} card, and the total is $${r}.`, ask: 'How much does each toy cost, in dollars?', what: 'toy price' },
];
// Numbers for p(x + q) = r (the answer x is a whole number) and for px + q = r.
const parenNums = L => { const p = rnd(3, L === 1 ? 5 : 8), q = rnd(2, 9), x = rnd(2, L === 1 ? 8 : L === 2 ? 15 : 25); return { p, q, x, r: p * (x + q) }; };
const linNums = L => { for (;;) { const p = rnd(2, L === 1 ? 6 : 12), q = rnd(4, 40), x = rnd(2, L === 1 ? 8 : 12); if (p !== q) return { p, q, x, r: p * x + q }; } };
const eqNums = (form, L) => (form === 'a(x+b)' ? parenNums(L) : linNums(L));

function writeEquation(form, L) {
  const { p, q, x, r } = eqNums(form, L), n = nm();
  const ctx = form === 'a(x+b)' ? pick(PAREN_CTX) : pick(EQ_CTX), right = form === 'a(x+b)' ? `${p}(x + ${q}) = ${r}` : `${p}x + ${q} = ${r}`;
  if (p === q) return writeEquation(form, L);
  const wrong = form === 'a(x+b)' ? [`${p}x + ${q} = ${r}`, `${q}(x + ${p}) = ${r}`, `${p}x = ${r} + ${q}`] : [`${q}x + ${p} = ${r}`, `${p}(x + ${q}) = ${r}`, `${p}x = ${r} + ${q}`];
  const story = form === 'a(x+b)' ? ctx.s(p, q, r) : ctx.s(n, p, q, r), what = form === 'a(x+b)' ? `the ${ctx.what} in dollars` : `the number of ${ctx.unit}s`;
  return tag({ story, ask: `Let x be ${what}. Which equation matches the story?`, answer: choice(right, wrong),
    ways: [way('Say each part in words', form === 'a(x+b)' ? [`Each one pays x plus ${q}, that is (x + ${q}). There are ${p} of them, so ${p} lots of (x + ${q}).`, `Together that is ${r}: ${b(right)}.`]
      : [`The ${ctx.fixed} is paid once: ${q}. The ${p} is paid again for every ${ctx.unit}, so it is multiplied by x: ${p}x.`, `Add them and set the total: ${b(right)}.`]),
      way('Test with the real answer', [`Working it out in your head gives x = ${x}.`, form === 'a(x+b)' ? `${p} × (${x} + ${q}) = ${p * (x + q)}, which is ${r}. So ${b(right)} works.` : `${p} × ${x} + ${q} = ${p * x + q}, which is ${r}. So ${b(right)} works.`, 'The other equations give a different total.'])],
    hint: form === 'a(x+b)' ? 'Is the extra amount added once, or to each one separately? The brackets show what is repeated.' : 'Which amount is paid once, and which is paid again for every one?' }, { kind: 'eqchoice2', shape: form === 'a(x+b)' ? 'writeparen' : 'writeeq', form, a: p, b: q, c: r });
}
function solveEquation(form, L) {
  const { p, q, x, r } = eqNums(form, L), n = nm(), paren = form === 'a(x+b)', ctx = paren ? pick(PAREN_CTX) : pick(EQ_CTX), mid = paren ? r / p : r - q;
  const arith = paren ? [`Together that is ${r}, shared by ${p}: ${r} ÷ ${p} = ${mid} each, including the extra ${q}.`, `Take off the extra: ${mid} − ${q} = ${b(x)}`] : [`Take off the ${ctx.fixed}, which was paid once: ${r} − ${q} = ${mid}.`, `That was ${p} each time: ${mid} ÷ ${p} = ${b(x)}`];
  const alg = paren ? [`Write it: ${p}(x + ${q}) = ${r}.`, `Divide both sides by ${p}: x + ${q} = ${mid}.`, `Subtract ${q} from both sides: x = ${b(x)}`] : [`Let x be the number of ${ctx.unit}s: ${p}x + ${q} = ${r}.`, `Subtract ${q} from both sides: ${p}x = ${mid}.`, `Divide both sides by ${p}: x = ${b(x)}`];
  const ways = [way('Arithmetic: work backwards', arith), way('Algebra: write and solve an equation', [...alg, 'Each algebra step does the same job as one arithmetic step.'])];
  if (paren) ways.push(way('Expand first', [`${p}(x + ${q}) = ${p}x + ${p * q}, so ${p}x + ${p * q} = ${r}.`, `${p}x = ${r} − ${p * q} = ${r - p * q}.`, `x = ${r - p * q} ÷ ${p} = ${b(x)}`]));
  return tag({ story: paren ? ctx.s(p, q, r) : ctx.s(n, p, q, r), ask: paren ? ctx.ask : ctx.ask.replace('${n}', n), answer: num(x), suffix: paren ? 'dollars' : `${ctx.unit}s`, ways, op: 'multi',
    hint: paren ? 'Each one pays the same. Share the total first, or divide both sides by the number of them.' : `Take away the ${ctx.fixed} first. What is left was paid in equal amounts.` }, { kind: 'lineq', shape: paren ? 'solveparen' : 'solvelin', form, a: p, b: q, c: r });
}
export function genWriteEq(L) {
  const r = Math.random();
  if (L === 1) return r < 0.3 ? writeEquation('ax+b', 1) : r < 0.55 ? solveEquation('ax+b', 1) : r < 0.8 ? writeEquation('a(x+b)', 1) : genWriteInequalities(1);
  if (L === 2) return r < 0.3 ? solveEquation('a(x+b)', 2) : r < 0.5 ? solveEquation('ax+b', 2) : genWriteInequalities(2);
  return r < 0.25 ? solveEquation('a(x+b)', 3) : genWriteInequalities(3);
}
