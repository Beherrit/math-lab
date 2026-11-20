// Ratios: ratio language, equivalent ratios (tables and tape diagrams).
import { rnd, pick, chance, gcd, b, k, way, num, choice, point, plane, table } from '../../util.js';
import { T, ratio, coprime, PAIRS, MIXES } from './helpers.js';
import { tape } from './visuals.js';

const BLANK = '<span class="blank">?</span>';
const short = s => s.split(' ')[0];
// "1 cups of rice" reads badly: drop the plural s from the first word when the amount is 1.
const amt = (n, name) => `${n} ${n === 1 ? name.replace(/^(\w+)s /, '$1 ') : name}`;

// --- Ratio language: write the ratio the words ask for ---
function ratioAsk(L) {
  const c = pick(PAIRS), [a, bb] = coprime(2, L === 1 ? 6 : 9), m = L === 1 ? 1 : rnd(2, 5);
  const want = pick(L === 1 ? ['ab', 'ba'] : L === 2 ? ['ab', 'ba', 'aw', 'bw'] : ['aw', 'bw']);
  const A = a * m, B = bb * m, all = 'all the ' + c.all;
  const [x, y, nx, ny] = { ab: [A, B, c.a, c.b], ba: [B, A, c.b, c.a], aw: [A, A + B, c.a, all], bw: [B, A + B, c.b, all] }[want];
  const g = gcd(x, y), sx = x / g, sy = y / g, w = a + bb;
  const others = { ab: [[bb, a], [a, w], [bb, w]], ba: [[a, bb], [bb, w], [a, w]], aw: [[a, bb], [w, a], [bb, w]], bw: [[bb, a], [w, bb], [a, w]] }[want];
  const steps = [`A ratio compares two amounts. The order of the words is the order of the numbers.`, `First: ${nx} = ${b(x)}. Second: ${ny} = ${b(y)}${want[1] === 'w' ? ` (${A} + ${B})` : ''}.`, `Ratio: ${g > 1 ? ratio(x, y) : b(ratio(x, y))}`];
  if (g > 1) steps.push(`Both numbers divide by ${g}. Simplest form: ${b(ratio(sx, sy))}`);
  const second = g > 1
    ? way('See it in groups', [`Sort everything into ${g} equal groups. Each group has ${a} ${c.a} and ${bb} ${c.b}.`, tape([{ n: a, label: short(c.a), on: true }, { n: bb, label: short(c.b) }]), `One group already shows the comparison: ${nx} to ${ny} is ${b(ratio(sx, sy))}.`])
    : way('Check the order', [tape([{ n: a, label: short(c.a), on: true }, { n: bb, label: short(c.b) }]), `${ratio(sy, sx)} would be ${ny} to ${nx}. Same numbers, different comparison.`, `The question says ${nx} first, so ${b(ratio(sx, sy))}.`]);
  return T({ story: c.s(k(A), k(B)), ask: `What is the ratio of ${b(nx)} to ${b(ny)}${g > 1 ? ', in simplest form' : ''}?`, answer: choice(ratio(sx, sy), others.map(o => ratio(...o))),
    ways: [way('Read it in order', steps), second], hint: `Which amount do the words name first: ${nx} or ${ny}?` }, 'ratio', { A, B, want });
}
// Part from a total, with a tape diagram.
export function ratioWord() {
  const c = pick(PAIRS), [a, bb] = coprime(1, 6), m = rnd(2, 9), total = (a + bb) * m, first = chance(0.5);
  const x = first ? a : bb, name = first ? c.a : c.b;
  return T({ story: `The ratio of ${c.a} to ${c.b} is ${k(ratio(a, bb))}. There are ${k(total + ' ' + c.all)} in all.`, ask: `How many ${name} are there?`, answer: num(x * m), op: 'multi',
    visual: tape([{ n: a, label: short(c.a), on: first }, { n: bb, label: short(c.b), on: !first }]),
    ways: [way('Tape diagram', [`Draw ${a} boxes for ${c.a} and ${bb} boxes for ${c.b}: ${a} + ${bb} = ${b(a + bb)} equal boxes.`, `All the boxes together hold ${total}. One box: ${total} ÷ ${a + bb} = ${b(m)}.`, `${name} fill ${x} box${x > 1 ? 'es' : ''}: ${x} × ${m} = ${b(x * m)}`]),
      way('Grow the ratio', [`Keep multiplying ${ratio(a, bb)} until the two parts add up to ${total}.`, table([c.a, c.b, 'total'], [[a, bb, a + bb], [a * 2, bb * 2, (a + bb) * 2], ['…', '…', '…'], [b(a * m), b(bb * m), b(total)]]), `That is ${m} times the first row, so there are ${b(x * m)} ${name}.`])],
    read: { find: `How many ${name}.`, know: [`ratio ${ratio(a, bb)}`, `${total} ${c.all} in all`], clue: `A ratio of ${ratio(a, bb)} means ${a + bb} equal parts in all.`, plan: `${total} ÷ ${a + bb}, then × ${x}` },
    hint: `How many equal parts does ${ratio(a, bb)} make altogether?` }, 'tape', { a, b: bb, given: total, gk: 'total', want: first ? 'first' : 'second' });
}
export function genRatio(L) {
  return L === 3 && chance(0.6) ? ratioWord() : ratioAsk(L);
}

// --- Equivalent ratios ---
function tableProblem() {
  const mx = pick(MIXES), [a, bb] = coprime(2, 6), j = rnd(2, 5), missB = chance(0.5), cols = [1, 2, 3, 4, 5];
  const cell = (i, v, miss) => (i === j && miss ? b('?') : v);
  const tbl = table(['', ...cols.map(i => (i === j ? b('×' + i) : '×' + i))], [[mx.a, ...cols.map(i => cell(i, a * i, !missB))], [mx.b, ...cols.map(i => cell(i, bb * i, missB))]]);
  const ans = missB ? bb * j : a * j, known = missB ? a * j : bb * j;
  return T({ story: `${mx.what} uses ${k(a + ' ' + mx.a)} for every ${k(bb + ' ' + mx.b)}.`, ask: 'What number is missing from the ratio table?', visual: tbl, answer: num(ans),
    ways: [way('Multiply both by the same number', [`Every column is the first column times something.`, `The column with the ? is ${j} times the first one (${missB ? `${a} × ${j} = ${a * j}` : `${bb} × ${j} = ${bb * j}`}).`, `So do the same to the other row: ${missB ? bb : a} × ${j} = ${b(ans)}`]),
      way('Add one more batch each time', [`Each step to the right adds one more batch: ${a} more ${mx.a} and ${bb} more ${mx.b}.`, `Count up the ${missB ? mx.b : mx.a}: ${cols.slice(0, j).map(i => (missB ? bb : a) * i).join(', ')}.`, `The missing number is ${b(ans)}.`])],
    hint: 'How many times bigger is that column than the first column?' }, 'eqr', { a, b: bb, known, pos: missB ? 0 : 1 });
}
function blankProblem(L) {
  const [a, bb] = coprime(2, L === 2 ? 9 : 7), m = L === 2 ? 1 : rnd(2, 4);
  let n = rnd(2, 9); if (L === 3) while (n % m === 0 || n === m) n = rnd(3, 9);
  const down = L === 2 && chance(0.4), A = a * m, B = bb * m, C = a * n, D = bb * n, missSecond = chance(0.5);
  const [p, q, r, s] = down ? [C, D, A, B] : [A, B, C, D], ans = missSecond ? s : r, known = missSecond ? r : s;
  const expr = `${ratio(p, q)} = ${missSecond ? ratio(r, BLANK) : ratio(BLANK, s)}`;
  const from = missSecond ? p : q, other = missSecond ? q : p;
  const direct = known % from === 0
    ? [`Look at the pair you can see: ${from} became ${known}. That is × ${known / from}.`, `Do the same to the other number: ${other} × ${known / from} = ${b(ans)}`]
    : from % known === 0
      ? [`Look at the pair you can see: ${from} became ${known}. That is ÷ ${from / known}.`, `Do the same to the other number: ${other} ÷ ${from / known} = ${b(ans)}`]
      : [`${from} does not go into ${known} evenly, so shrink first: ${ratio(p, q)} ÷ ${m} = ${ratio(a, bb)}.`, `Now ${missSecond ? a : bb} became ${known}: that is × ${n}.`, `${missSecond ? bb : a} × ${n} = ${b(ans)}`];
  return T({ ask: 'Find the missing number so the two ratios are equivalent.', expr, answer: num(ans),
    ways: [way('Scale both numbers', [`Why it works: a ratio is a recipe. ${down ? 'A smaller' : 'A bigger'} batch keeps the same mix only if both parts change by the same factor.`, ...direct]),
      way('Ratio table', [table(['first', 'second'], [[p, q], ...(p !== a && r !== a ? [[a, bb]] : []), [missSecond ? r : b(r), missSecond ? b(s) : s]]), `Every row is ${ratio(a, bb)} times a number, so every row is the same mix.`])],
    hint: 'Find the two numbers that sit in the same spot. What do you multiply or divide by to get from one to the other?' }, 'eqr', { a: p, b: q, known, pos: missSecond ? 0 : 1 });
}
function whichEquivalent() {
  const [a, bb] = coprime(2, 8), m = rnd(1, 3), n = rnd(2, 6), A = a * m, B = bb * m, f = m === n ? n + 1 : n;
  const good = ratio(a * f, bb * f), add = rnd(2, 5);
  return T({ ask: `Which ratio is equivalent to ${b(ratio(A, B))}?`, answer: choice(good, [ratio(A + add, B + add), ratio(bb * f, a * f), ratio(a * f, bb * (f + 1))]),
    ways: [way('Multiply or divide both', [`Adding the same number to both parts does not work. ${ratio(A + add, B + add)} is a different mix.`, `${m > 1 ? `Simplest form of ${ratio(A, B)} is ${ratio(a, bb)}. ` : ''}Multiply both parts of ${ratio(a, bb)} by ${f}: ${b(good)}.`]),
      way('Test with a picture', [`${ratio(a, bb)} means groups of ${a} and ${bb}.`, `${good} is exactly ${f} of those groups: ${a} × ${f} and ${bb} × ${f}.`, `${ratio(bb * f, a * f)} has the order flipped, so it compares the other way round.`])],
    hint: 'Equivalent ratios come from multiplying or dividing both numbers by the same number.' }, 'eqrChoice', { a: A, b: B });
}
// Recipe scaled by a factor that is not a whole number (go through the simplest form).
export function mixWord() {
  const mx = pick(MIXES), [a, bb] = coprime(1, 5), m = rnd(2, 4); let n = rnd(3, 9); while (n % m === 0) n = rnd(3, 9);
  const A = a * m, B = bb * m, C = a * n, ans = bb * n;
  return T({ story: `${mx.what} uses ${k(A + ' ' + mx.a)} for every ${k(B + ' ' + mx.b)}. A bigger batch uses ${k(C + ' ' + mx.a)}.`, ask: `How many ${mx.b} does the bigger batch need?`, answer: num(ans), op: 'multi',
    ways: [way('Shrink, then grow', [`Shrink to the smallest batch: ${ratio(A, B)} ÷ ${m} = ${ratio(a, bb)}.`, `The bigger batch has ${C} ${mx.a}: ${a} × ${n} = ${C}, so it is ${n} small batches.`, `${bb} × ${n} = ${b(ans)} ${mx.b}`]),
      way('Ratio table', [table([mx.a, mx.b], [[A, B], [a, bb], [C, b(ans)]]), `Row 2 is row 1 ÷ ${m}. Row 3 is row 2 × ${n}.`])],
    read: { find: `The ${mx.b} for the bigger batch.`, know: [`${A} ${mx.a} go with ${B} ${mx.b}`, `bigger batch: ${C} ${mx.a}`], clue: '“For every” means the mix stays the same when the batch grows.', plan: `shrink ${ratio(A, B)} to ${ratio(a, bb)}, then × ${n}` },
    hint: `What is the smallest batch with the same mix as ${ratio(A, B)}?` }, 'eqr', { a: A, b: B, known: C, pos: 0 });
}
function diffTape() {
  const c = pick(PAIRS); let [a, bb] = coprime(1, 6); if (a < bb) [a, bb] = [bb, a];
  const m = rnd(2, 9), d = (a - bb) * m, want = pick(['first', 'second', 'total']);
  const parts = { first: a, second: bb, total: a + bb }[want], name = { first: c.a, second: c.b, total: c.all + ' in all' }[want];
  return T({ story: `The ratio of ${c.a} to ${c.b} is ${k(ratio(a, bb))}. There are ${k(d + ' more ' + c.a)} than ${c.b}.`, ask: `How many ${name} are there?`, answer: num(parts * m),
    visual: tape([{ n: a, label: short(c.a), on: true }, { n: bb, label: short(c.b) }]),
    ways: [way('Tape diagram', [`The top bar is ${a} boxes, the bottom bar is ${bb}. The top bar sticks out by ${a - bb} box${a - bb > 1 ? 'es' : ''}.`, `Those extra boxes hold the ${d} extra ${c.a}: ${d} ÷ ${a - bb} = ${b(m)} in each box.`, `${name}: ${parts} boxes × ${m} = ${b(parts * m)}`]),
      way('Grow the ratio', [`Multiply ${ratio(a, bb)} until the gap is ${d}.`, table([c.a, c.b, 'gap'], [[a, bb, a - bb], [a * 2, bb * 2, (a - bb) * 2], ['…', '…', '…'], [a * m, bb * m, b(d)]]), `That row gives ${b(parts * m)} ${name}.`])],
    hint: 'How many boxes longer is one bar than the other? Those boxes hold the difference.' }, 'tape', { a, b: bb, given: d, gk: 'diff', want });
}
// Equivalent ratios as points on a grid: they all sit on one straight line through (0, 0).
function plotPair() {
  const mx = pick(MIXES), [a, bb] = coprime(1, 4), top = Math.floor(10 / Math.max(a, bb)), j = rnd(2, top);
  if (top < 2) return plotPair();
  return T({ story: `${mx.what} uses ${k(amt(a, mx.a))} for every ${k(amt(bb, mx.b))}. On the grid, x counts the ${mx.a} and y counts the ${mx.b}.`, ask: `Tap the point for the batch that uses ${b(a * j)} ${mx.a}.`, visual: plane({ interactive: true, pts: [{ x: a, y: bb, label: '1 batch', cls: 'given' }] }), answer: point(a * j, bb * j),
    ways: [way('Find the pair, then plot it', [`${a * j} is ${j} times ${a}, so this is ${j} batches.`, `The other amount is also ${j} times bigger: ${bb} × ${j} = ${bb * j}.`, `Plot (${a * j}, ${bb * j}): ${a * j} across, ${bb * j} up.`]),
      way('Step along the line', [`Every extra batch moves the point ${a} to the right and ${bb} up.`, `Start at the grey point (${a}, ${bb}) and repeat that step until x is ${a * j}.`, `You land on ${b(`(${a * j}, ${bb * j})`)}. All the batches lie on one straight line.`])],
    hint: `How many batches make ${a * j} ${mx.a}? The other amount grows by the same factor.` }, 'eqrPoint', { a, b: bb, x: a * j });
}
export function genEqRatio(L) {
  if (L === 1) return tableProblem();
  if (L === 2) return pick([whichEquivalent, plotPair, () => blankProblem(2), () => blankProblem(2)])();
  return pick([diffTape, mixWord, () => blankProblem(3)])();
}
