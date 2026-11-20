// Mental adding and subtracting with tens: 10 or 100 more or less, multiples of ten, bridging a ten, breaking apart by place.
import { rnd, pick, chance, b, way, num } from '../../util.js';
import { hops } from './pics.js';
import { BLANK, mark, countList, cnt } from './words.js';
import { errorQ, tfQ } from './forms.js';

const SG = { add: '+', sub: '−' }, ONES = n => n % 10;
const res = (a, c, op) => (op === 'add' ? a + c : a - c);
const tOf = (a, c, op) => (op === 'add' ? { f: 'add', xs: [a, c] } : { f: 'sub', a, b: c });

// What changes when you add or take away ten or a hundred.
function digitNote(n, d) {
  const up = d > 0, t = Math.floor(n / 10) % 10;
  if (Math.abs(d) === 100) return `Only the hundreds digit changes: it goes ${up ? 'up' : 'down'} by 1. The tens and ones stay the same.`;
  if (up && t === 9) return 'The tens digit is 9. One more ten makes 10 tens, which is a new hundred, so the hundreds go up and the tens become 0.';
  if (!up && t === 0) return 'There are no tens to take. Trade 1 hundred for 10 tens, then take 1 ten away. 9 tens are left.';
  return `Only the tens digit changes: it goes ${up ? 'up' : 'down'} by 1. The ones stay the same.`;
}
function moreLessQ(n, d) {
  const r = n + d, big = Math.abs(d), end = `${n} ${d > 0 ? '+' : '−'} ${big} = ${b(r)}.`;
  return { ask: `What is ${big} ${d > 0 ? 'more' : 'less'} than ${b(n)}?`, answer: num(r), hint: 'Which place changes, and in which direction?', _t: { f: 'add', xs: [n, d] },
    ways: [way('Jump on a number line', [hops([n, r]), `One jump of ${big} ${d > 0 ? 'up' : 'down'}: ${end}`]), way('Change one digit', [digitNote(n, d), `So ${end}`])] };
}
// Add or take away a multiple of ten: one jump of tens, or the tens place changes.
function tensWays(a, c, op) {
  const r = res(a, c, op), tens = c / 10, base = a - ONES(a), s = SG[op], start = op === 'add' ? base + c : base - c;
  const first = c <= 90 ? way('Jump by tens', [`${c} is ${cnt(tens, 'ten')}. Jump ${cnt(tens, 'ten')} ${op === 'add' ? 'up' : 'down'} from ${a}: ${a}, ${countList(a, tens, op === 'add' ? 1 : -1, 10)}.`, `${a} ${s} ${c} = ${b(r)}.`])
    : way('Hundreds, then tens', [`${c} is ${cnt(Math.floor(c / 100), 'hundred')} and ${cnt(c % 100 / 10, 'ten')}.`, `${a} ${s} ${Math.floor(c / 100) * 100} = ${res(a, Math.floor(c / 100) * 100, op)}. Then ${s} ${c % 100} to finish.`, `${a} ${s} ${c} = ${b(r)}.`]);
  return [first, way('Keep the ones', [`${a} is ${base} and ${ONES(a)}. Only the tens part changes.`, `${base} ${s} ${c} = ${start}, and the ${ONES(a)} ones stay.`, `${start} + ${ONES(a)} = ${b(r)}.`])];
}
function tensQ(a, c, op) {
  return { ask: op === 'add' ? 'Work it out in your head. Add the tens.' : 'Work it out in your head. Take away the tens.', expr: `${a} ${SG[op]} ${c}`, answer: num(res(a, c, op)),
    hint: 'Say how many tens there are, then change only the tens.', _t: tOf(a, c, op), ways: tensWays(a, c, op) };
}
function missingQ(a, c) {
  return { ask: 'What number is missing?', expr: `${a} + ${BLANK} = ${a + c}`, answer: num(c), hint: 'How many tens do you need to add to get from the first number to the total?', _t: { f: 'sub', a: a + c, b: a },
    ways: [way('Count up in tens', [`Count on from ${a} in tens until you reach ${a + c}: ${a}, ${countList(a, c / 10, 1, 10)}.`, `That is ${c / 10} tens, which is ${b(c)}.`]), way('Subtract', ['The missing part is the total take away the part you already have.', `${a + c} − ${a} = ${b(c)}.`])] };
}
function slipQ(a, c, op) {
  const t = c / 10, wrong = res(a, t, op), nmShown = op === 'add' ? 'added' : 'taken away';
  return errorQ({ a, c, op, wrong, hint: 'Each ten is worth ten ones. What does the digit in the tens place stand for?', ways: tensWays(a, c, op).slice(0, 1),
    slip: `The ${t} in ${c} means ${t} tens, not ${t} ones. The slip was to have ${nmShown} just ${t}.` });
}
// Jump along the line: a start, then one jump of tens. Picture to number.
function lineQ(a, c, op) {
  const r = res(a, c, op);
  return { ask: `What number does the jump land on?${mark(a, c, op)}`, visual: hops([a, r], { hide: 1 }), answer: num(r), hint: 'Read the jump, then make it from the start.', _t: tOf(a, c, op),
    ways: [way('Make the jump', [`The jump is ${SG[op]}${c}, starting at ${a}.`, `${a} ${SG[op]} ${c} = ${b(r)}.`]), ...tensWays(a, c, op).slice(1)] };
}
// A ones step that crosses a ten: add 6 to 47, take 5 from 82.
function bridgeQ(a, op) {
  const o = ONES(a), k = op === 'add' ? rnd(11 - o, 9) : rnd(o + 1, 9), r = res(a, k, op), part = op === 'add' ? 10 - o : o, rest = k - part, stop = op === 'add' ? a + part : a - part, s = SG[op];
  return { ask: `Work it out by getting to a ten first.`, expr: `${a} ${s} ${k}`, answer: num(r), hint: op === 'add' ? 'How much does the first number need to reach the next ten?' : 'How many ones can you take away to land on a ten?', _t: tOf(a, k, op),
    ways: [way('Go through the ten', [hops([a, stop, r], { hide: -1 }), `${k} is ${part} and ${rest}. ${a} ${s} ${part} = ${stop}.`, `${stop} ${s} ${rest} = ${b(r)}.`]),
      way(op === 'add' ? 'Count on' : 'Check by adding', op === 'add' ? [`Count on ${k} from ${a}: ${countList(a, k)}.`, `You land on ${b(r)}.`] : [`Adding undoes subtracting: ${r} + ${k} = ${a}.`, `So ${a} − ${k} = ${b(r)}.`])] };
}
// Break apart by place: 46 + 32 (add the tens, add the ones).
function breakAdd(a, c) {
  const r = a + c, ta = a - ONES(a), tc = c - ONES(c);
  return { ask: 'Break each number into tens and ones.', expr: `${a} + ${c}`, answer: num(r), hint: 'Add the tens together and the ones together, then join the parts.', _t: tOf(a, c, 'add'),
    ways: [way('Tens and ones', [`Tens: ${ta} + ${tc} = ${ta + tc}. Ones: ${ONES(a)} + ${ONES(c)} = ${ONES(a) + ONES(c)}.`, `${ta + tc} + ${ONES(a) + ONES(c)} = ${b(r)}.`]),
      way('Jump by tens, then ones', [`Start at ${a}. Add the tens of ${c}: ${a} + ${tc} = ${a + tc}.`, `Then add its ones: ${a + tc} + ${ONES(c)} = ${b(r)}.`])] };
}
// 82 − 37: count up from the smaller number through the tens, or take away the tens and then the ones.
function breakSub() {
  const c = tens(2, 4) + rnd(2, 9);
  let a;
  do a = rnd(c + 20, 99); while (!(ONES(a) >= 1 && ONES(a) < ONES(c)));
  const r = a - c, tc = c - ONES(c), next = c + 10 - ONES(c), base = a - ONES(a), mid = base - next;
  return { ask: 'Count up from the smaller number to find the difference.', expr: `${a} − ${c}`, answer: num(r), hint: 'Count up from the smaller number: to the next ten, then by tens, then the ones.', _t: tOf(a, c, 'sub'),
    ways: [way('Count up in jumps', [hops([c, next, base, a]), `${c} to ${next} is ${next - c}. ${next} to ${base} is ${mid}. ${base} to ${a} is ${ONES(a)}.`, `${next - c} + ${mid} + ${ONES(a)} = ${b(r)}.`]),
      way('Take away the tens, then the ones', [`Take away the tens of ${c}: ${a} − ${tc} = ${a - tc}.`, `Then take away its ones: ${a - tc} − ${ONES(c)} = ${b(r)}.`])] };
}
function tfTensQ(a, c, op) {
  const r = res(a, c, op), ok = chance(0.5), shown = ok ? r : r + (r > 89 ? -10 : pick([10, -10]));
  return tfQ({ left: `${a} ${SG[op]} ${c}`, right: String(shown), ok, hint: 'Work out the left side by changing only the tens place.',
    why: [`${a} ${SG[op]} ${c} = ${r}.`, ok ? `${r} matches, so it is ${b('true')}.` : `${shown} is not ${r}, so it is ${b('false')}.`], alt: tensWays(a, c, op)[1] });
}
const tens = (lo, hi) => rnd(lo, hi) * 10;
const addPair = () => [rnd(11, 69), tens(1, 3)];
const subPair = () => { const a = rnd(41, 99); return [a, tens(1, Math.min(3, Math.floor(a / 10) - 1))]; };
const fit = (a, c, op) => (op === 'sub' ? Math.min(c, a - ONES(a)) : c); // never take away more than the tens that are there

export function genMental(L) {
  const op = pick(['add', 'sub']);
  if (L === 1) {
    const t = pick(['more', 'more', 'tens', 'tens', 'missing', 'line', 'tf', 'slip']), [a, c] = op === 'add' ? addPair() : subPair();
    if (t === 'more') return moreLessQ(rnd(11, 89), pick([10, -10]));
    if (t === 'missing') return missingQ(...addPair());
    if (t === 'line') return lineQ(a, c, op);
    if (t === 'tf') return tfTensQ(a, c, op);
    return t === 'slip' ? slipQ(a, c, op) : tensQ(a, c, op);
  }
  if (L === 2) {
    const t = pick(['hundred', 'ten', 'cross', 'bridge', 'bridge', 'line', 'tf', 'missing']);
    if (t === 'hundred') return moreLessQ(rnd(101, 899), pick([100, -100]));
    if (t === 'ten') return moreLessQ(pick([rnd(11, 99), rnd(101, 899)]), pick([10, -10]));
    if (t === 'cross') return tensQ(rnd(71, 99), tens(3, 9), 'add');
    if (t === 'bridge') return op === 'add' ? bridgeQ(tens(1, 7) + rnd(2, 9), 'add') : bridgeQ(tens(2, 9) + rnd(0, 8), 'sub');
    if (t === 'line') return lineQ(op === 'add' ? rnd(31, 89) : rnd(151, 899), tens(2, 9), op);
    if (t === 'tf') return tfTensQ(rnd(101, 499), tens(2, 9), op);
    return missingQ(rnd(101, 799), tens(2, 9));
  }
  const t = pick(['break', 'breakSub', 'big', 'slip', 'tf', 'line', 'missing']), a = rnd(121, 799), c = tens(2, 9) + (chance(0.4) ? 100 : 0);
  if (t === 'break') return breakAdd(rnd(21, 59), rnd(21, 40));
  if (t === 'breakSub') return breakSub();
  if (t === 'big') return tensQ(a, fit(a, c, op), op);
  if (t === 'slip') return slipQ(a, tens(2, 9), op);
  if (t === 'tf') return tfTensQ(a, fit(a, c, op), op);
  if (t === 'line') return lineQ(a, c, 'add');
  return missingQ(rnd(101, 600), tens(2, 19));
}
