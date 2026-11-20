// Writing inequalities from stories and graphing their solution sets: at most, at least, more than, fewer than.
import { R, rnd, pick, fmt, b, way, nm, num, choice } from '../../util.js';
import { tag } from './helpers.js';
import { rayLine } from './visuals-lines.js';

const FLIP = { '<': '>', '>': '<', '≤': '≥', '≥': '≤' }, EDGE = { '<': '≤', '≤': '<', '>': '≥', '≥': '>' };
const WORD = { '<': 'fewer than', '≤': 'at most', '>': 'more than', '≥': 'at least' };
const holds = (v, op, c) => ({ '<': v < c, '≤': v <= c, '>': v > c, '≥': v >= c })[op];
const sol = (a, q, op, r) => Array.from({ length: 61 }, (_, x) => holds(a * x + q, op, r)).join();
const rightward = op => op === '>' || op === '≥', closed = op => op === '≤' || op === '≥';
const graphText = (v, op) => `${closed(op) ? 'Closed' : 'Open'} circle at ${fmt(v)}, shaded to the ${rightward(op) ? 'right' : 'left'}`;
const graphOptions = (v, op) => [graphText(v, op), graphText(v, FLIP[op]), graphText(v, EDGE[op]), graphText(v, EDGE[FLIP[op]])];

const ONE = [(v) => ({ op: '≥', s: `Riders must be at least ${v} centimetres tall.` }), (v) => ({ op: '≤', s: `A lift can carry at most ${v} kilograms.` }),
  (v) => ({ op: '>', s: `A club needs more than ${v} members to start a new team.` }), (v) => ({ op: '<', s: `A bus must carry fewer than ${v} passengers.` })];
function graphOne() {
  const v = pick([12, 20, 35, 40, 60, 90]), c = pick(ONE)(v), { op } = c, [right, ...wrong] = graphOptions(v, op);
  return tag({ story: c.s, ask: 'Which graph shows every number that is allowed?', answer: choice(right, wrong),
    ways: [way('Circle first, then the direction', [`"${WORD[op]}" ${closed(op) ? 'includes' : 'does not include'} ${v} itself, so the circle is ${closed(op) ? 'closed (filled in)' : 'open (empty)'}.`, `The allowed numbers are ${rightward(op) ? 'bigger' : 'smaller'} than ${v}, so the shading goes to the ${rightward(op) ? 'right' : 'left'}: ${b(right)}.`]),
      way('Test a number', [rayLine(v, rightward(op) ? 1 : -1, closed(op)), `${v + (rightward(op) ? 5 : -5)} is allowed, and it sits in the shaded part. ${v} is ${closed(op) ? 'allowed' : 'not allowed'}, so its circle is ${closed(op) ? 'filled' : 'empty'}.`])],
    hint: 'Does the number in the story itself count? Then which side of it are the allowed numbers on?' }, { kind: 'graphtext', shape: 'graph', a: 1, b: 0, c: v, op });
}
const TWO = [
  { op: '≤', unit: 'rides', s: (n, p, q, r) => `${n} has $${r} to spend at a fair. Getting in costs $${q} and each ride costs $${p}.` },
  { op: '≥', unit: 'hours', s: (n, p, q, r) => `${n} needs at least $${r} for a trip. ${n} has $${q} and earns $${p} an hour.` },
  { op: '>', unit: 'levels', s: (n, p, q, r) => `A game needs more than ${r} points to unlock a prize. ${n} has ${q} points and earns ${p} points each level.` },
  { op: '<', unit: 'boxes', s: (n, p, q, r) => `A shelf can hold fewer than ${r} kilograms. It already holds ${q} kilograms, and each box weighs ${p} kilograms.` },
];
function twoStep() {
  for (;;) {
    const c = pick(TWO), p = rnd(2, 9), q = rnd(3, 25), x0 = rnd(2, 10), r = p * x0 + q;
    if (p === q) continue;
    return { ...c, p, q, x0, r, n: nm() };
  }
}
function writeInequality() {
  for (;;) {
    const t = twoStep(), { p, q, r, op } = t, right = `${p}x + ${q} ${op} ${r}`, wrong = [`${p}x + ${q} ${FLIP[op]} ${r}`, `${p}x + ${q} ${EDGE[op]} ${r}`, `${q}x + ${p} ${op} ${r}`];
    if (new Set([sol(p, q, op, r), sol(p, q, FLIP[op], r), sol(p, q, EDGE[op], r), sol(q, p, op, r)]).size < 4) continue;
    return tag({ story: t.s(t.n, p, q, r), ask: `Let x be the number of ${t.unit}. Which inequality matches the story?`, answer: choice(right, wrong),
      ways: [way('Say each part in words', [`Start with ${q}, then add ${p} for every one of the ${t.unit}: ${p}x + ${q}.`, `"${WORD[op]}" means ${op}. So the story is ${b(right)}.`]),
        way('Test the limit', [`Try x = ${t.x0}: ${p} × ${t.x0} + ${q} = ${r}, exactly the limit in the story.`, `"${WORD[op]}" ${closed(op) ? 'allows' : 'does not allow'} the limit itself, and ${r} ${op} ${r} is ${closed(op) ? 'true' : 'false'}. So the sign ${op} fits: ${b(right)}.`])],
      hint: `Which words in the story tell you the sign? "${WORD[op]}" points to one of the four signs.` }, { kind: 'ineqchoice', shape: 'writeineq', a: p, b: q, c: r, op });
  }
}
function graphTwoStep() {
  const t = twoStep(), { p, q, r, op, x0 } = t, [right, ...wrong] = graphOptions(x0, op);
  return tag({ story: t.s(t.n, p, q, r), ask: `Write the inequality for the number of ${t.unit}, solve it, and pick the graph of its solutions.`, answer: choice(right, wrong),
    ways: [way('Solve like an equation', [`${p}x + ${q} ${op} ${r}. Subtract ${q} from both sides: ${p}x ${op} ${r - q}.`, `Divide both sides by ${p}: x ${op} ${x0}. This sign stays the same, because ${p} is positive.`, rayLine(x0, rightward(op) ? 1 : -1, closed(op)), `${b(right)}.`]),
      way('Check the circle and a number', [`${x0} ${closed(op) ? 'makes the story exactly true, so it counts' : 'only just fails, so it does not count'}: the circle is ${closed(op) ? 'closed' : 'open'}.`, `Try ${x0 + (rightward(op) ? 1 : -1)}: ${p * (x0 + (rightward(op) ? 1 : -1)) + q} ${op} ${r} is true, so the shading goes ${rightward(op) ? 'right' : 'left'}.`])],
    hint: 'Solve it like an equation first. Then ask whether the boundary itself counts and which side the solutions are on.' }, { kind: 'graphtext', shape: 'graph2', a: p, b: q, c: r, op });
}
// Brackets in an inequality: each one pays x plus a fixed extra, and the whole group has a limit.
function parenWhole() {
  const most = Math.random() < 0.5, p = pick([2, 4, 5, 10]), q = rnd(2, 9), x0 = rnd(3, 12), extra = rnd(1, p - 1), r = p * (x0 + q) + extra, n = nm(), val = r / p - q, ans = most ? x0 : x0 + 1;
  const story = most ? `${p} friends go to a fair. Each pays the same amount plus a $${q} ticket. Together they have at most $${r}.` : `${p} volunteers each raise the same amount, and a sponsor adds $${q} for each volunteer. Together they need at least $${r}.`;
  return tag({ story, ask: most ? 'What is the greatest whole number of dollars each friend could pay before the ticket?' : 'What is the smallest whole number of dollars each volunteer must raise?', answer: num(ans), op: 'multi',
    ways: [way('Share, then take off the extra', [`Each share is ${r} ÷ ${p} = ${fmt(r / p)}, which includes the $${q}.`, `${fmt(r / p)} − ${q} = ${fmt(val)}. Part of a dollar is not allowed, so go ${most ? 'DOWN' : 'UP'} to ${b(ans)}.`]),
      way('Write an inequality', [`${p}(x + ${q}) ${most ? '≤' : '≥'} ${r}`, `Divide by ${p}: x + ${q} ${most ? '≤' : '≥'} ${fmt(r / p)}, so x ${most ? '≤' : '≥'} ${fmt(val)}.`, `The ${most ? 'greatest' : 'smallest'} whole number is ${b(ans)}.`])],
    read: { find: most ? 'The most each could pay.' : 'The least each must raise.', know: [`${p} people`, `extra: $${q} each`, `${most ? 'at most' : 'at least'}: $${r}`], clue: most ? '"At most" means less than or equal to.' : '"At least" means greater than or equal to.', plan: `${p}(x + ${q}) ${most ? '≤' : '≥'} ${r}` },
    hint: `The extra is paid by each one, so it sits inside the brackets. Share the total, take off the extra, then round the right way for "${most ? 'at most' : 'at least'}".` }, { kind: 'ineqparen', shape: 'ineqparen', a: p, b: q, c: r, most });
}
function drain() {
  for (;;) {
    const T = rnd(6, 20) * 10, rate = pick([4, 5, 10]), L = rnd(1, 5) * 5, strict = Math.random() < 0.4, spare = T - L, ans = Math.floor(spare / rate), n = nm();
    if (ans < 2 || spare % rate === 0 || ans > 19) continue;
    return tag({ story: `A water tank holds ${T} litres. A leak loses ${rate} litres every minute. ${n} wants ${strict ? 'more than' : 'at least'} ${L} litres to stay in the tank.`, ask: 'What is the greatest whole number of minutes the leak can run?', answer: num(ans), op: 'multi',
      ways: [way('Spare water', [`The tank can lose ${T} − ${L} = ${spare} litres.`, `${spare} ÷ ${rate} = ${fmt(spare / rate)}. Part of a minute does not count as a full minute, so go down to ${b(ans)}.`]),
        way('Write an inequality', [`After x minutes there are ${T} − ${rate}x litres. We need ${T} − ${rate}x ${strict ? '>' : '≥'} ${L}.`, `Move ${rate}x to the other side to avoid dividing by a negative: ${T} − ${L} ${strict ? '>' : '≥'} ${rate}x, so ${spare} ${strict ? '>' : '≥'} ${rate}x.`, `x ${strict ? '<' : '≤'} ${fmt(spare / rate)}, so the greatest whole number is ${b(ans)}.`])],
      read: { find: 'The most whole minutes.', know: [`start: ${T} litres`, `loses ${rate} a minute`, `keep ${strict ? 'more than' : 'at least'} ${L}`], clue: 'The water goes DOWN each minute, so it is taken away.', plan: `${T} − ${rate}x ${strict ? '>' : '≥'} ${L}` },
      hint: 'How many litres can leak away before the limit is reached? How many whole minutes of leaking is that?' }, { kind: 'drain', shape: 'drain', tank: T, rate, keep: L, strict });
  }
}
function countSolutions() {
  for (;;) {
    const a = rnd(2, 5), q = rnd(1, 9), op = pick(['<', '≤']), r = rnd(10, 40), xs = Array.from({ length: 30 }, (_, x) => x).filter(x => holds(a * x + q, op, r)), count = xs.length;
    if (count < 3 || count > 9) continue;
    return tag({ ask: 'How many whole numbers, starting from 0, make this inequality true?', expr: `${a}x + ${q} ${op} ${r}`, answer: num(count),
      ways: [way('Solve, then list', [`Subtract ${q}: ${a}x ${op} ${r - q}. Divide by ${a}: x ${op} ${fmt(R((r - q) / a))}.`, `The whole numbers from 0 that fit: ${xs.join(', ')}.`, `That is ${b(count)} numbers.`]),
        way('Test one at a time', [`x = 0 gives ${q}, which is ${op} ${r}. Keep testing upward: ${xs.map(x => `x = ${x} gives ${a * x + q}`).slice(-2).join(', ')}.`, `The next one, x = ${xs.length}, gives ${a * xs.length + q}, which fails. So ${b(count)} numbers work: 0 to ${xs.length - 1}.`])],
      hint: 'Solve the inequality first. Then list the whole numbers from 0 that fit, and count them.' }, { kind: 'countsol', shape: 'countsol', a, b: q, c: r, op });
  }
}
export function genWriteInequalities(L) {
  const r = Math.random();
  if (L === 1) return graphOne();
  if (L === 2) return r < 0.5 ? writeInequality() : graphTwoStep();
  return r < 0.3 ? parenWhole() : r < 0.55 ? drain() : r < 0.8 ? countSolutions() : writeInequality();
}
