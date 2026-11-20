// Adding and subtracting multi-digit whole numbers: stacked, by place, counting up, and finding a missing number.
import { rnd, pick, chance, fmt, b, k, way, nm, num, column, placeName, splitPV } from '../../util.js';
import { BLANK, digit, stack, roundTo, sum, oneOf, estimateWay } from './helpers.js';

const SIZE = [[120, 999], [1200, 99999], [12000, 999999]];
// The missing-number and three-number problems stay a size smaller than the plain ones.
const SIZE_B = [null, [1200, 9999], [12000, 99999]];
// A range cut down so a story stays believable (no 900,000 people in a stadium).
const capped = (L, cap) => { const [lo, hi] = SIZE[L - 1], top = Math.min(hi, cap); return [Math.min(lo, Math.floor(top / 4)), top]; };
// How many columns need a carry (adding) or a trade (subtracting).
function regroups(a, c, op) {
  let n = 0, carry = 0;
  for (let p = 0; a >= 10 ** p || c >= 10 ** p; p++) {
    const x = digit(a, p), y = digit(c, p), hit = op === '+' ? x + y + carry >= 10 : x - carry < y;
    carry = hit ? 1 : 0; n += carry;
  }
  return n;
}
// Step 1 numbers are friendly: at most one carry or trade.
function pair([lo, hi], op, friendly = false) {
  for (let t = 0; t < 60; t++) {
    let a = rnd(lo, hi), c = rnd(lo, hi);
    if (op === '−' && a < c) [a, c] = [c, a];
    if (op === '−' && !friendly && chance(0.3)) { const r = Math.ceil(a / 1000) * 1000 + (chance(0.5) ? rnd(1, 9) : 0); if (r <= hi) a = r; }
    if (a !== c && (!friendly || regroups(a, c, op) <= 1)) return [a, c];
  }
  return null;
}

function placeWay(a, c) {
  const rows = [];
  for (let p = 6; p >= 0; p--) { const x = digit(a, p) * 10 ** p, y = digit(c, p) * 10 ** p; if (x || y) rows.push([p, x, y]); }
  return way('Add each place', ['Add the same places together, starting with the biggest.', ...rows.map(([p, x, y]) => `${placeName(p)}: ${fmt(x)} + ${fmt(y)} = ${fmt(x + y)}`),
    `Add those results: ${rows.map(r => fmt(r[1] + r[2])).join(' + ')} = ${b(fmt(a + c))}`]);
}
// Friendly jumps from the smaller number up to the bigger one: to the next ten, hundred, thousand, then the rest.
function jumps(from, to) {
  const out = []; let cur = from;
  for (const step of [10, 100, 1000, 10000, 100000]) {
    const next = Math.ceil(cur / step) * step;
    if (next > cur && next <= to) { out.push([cur, next - cur]); cur = next; }
  }
  for (const part of splitPV(to - cur)) { out.push([cur, part]); cur += part; }
  return out;
}
function countUpWay(a, c) {
  const js = jumps(c, a);
  return way('Count up from the smaller number', [`Subtracting finds the gap between the two numbers. Start at ${fmt(c)} and jump up to ${fmt(a)} in easy steps.`,
    ...js.map(([x, j]) => `${fmt(x)} + ${b(fmt(j))} = ${fmt(x + j)}`), `Add the jumps: ${js.map(j => fmt(j[1])).join(' + ')} = ${b(fmt(a - c))}`]);
}
// Round both numbers to the leading place of the smaller one, so the estimate stays close.
function estimate(a, c, op) {
  const to = 10 ** (String(Math.min(a, c)).length - 1), ra = roundTo(a, to), rc = roundTo(c, to);
  return estimateWay(`${fmt(a)} is about ${fmt(ra)} and ${fmt(c)} is about ${fmt(rc)}. ${fmt(ra)} ${op} ${fmt(rc)} = ${fmt(op === '+' ? ra + rc : ra - rc)}.`, fmt(op === '+' ? a + c : a - c));
}
function ways(a, c, op) {
  const note = op === '+' ? 'Start with the ones. When a column makes 10 or more, write the ones digit and carry 1 to the next column.'
    : 'Start with the ones. When the top digit is too small, trade 1 from the next place for 10 in this place.';
  const col = way('Line up the places', ['Stack the numbers so ones are under ones, tens under tens, and so on.', stack(a, c, op), note, `Answer: ${b(fmt(op === '+' ? a + c : a - c))}`]);
  return [col, op === '+' ? placeWay(a, c) : countUpWay(a, c), estimate(a, c, op)];
}

function plain(L) {
  const op = pick(['+', '−']), ac = pair(SIZE[L - 1], op, L === 1);
  if (!ac) return null;
  const [a, c] = ac;
  return { ask: op === '+' ? 'Add.' : 'Subtract.', expr: `${fmt(a)} ${op} ${fmt(c)}`, answer: num(op === '+' ? a + c : a - c), _t: { kind: op === '+' ? 'add' : 'sub', a, c },
    ways: ways(a, c, op), hint: op === '+' ? 'Line up the places and start with the ones.' : 'Line up the places. Check each column: is the top digit big enough?' };
}

function three(L) {
  const [lo, hi] = SIZE_B[L - 1], xs = [rnd(lo, hi), rnd(lo, hi), rnd(lo, Math.floor(hi / 10))], total = sum(xs);
  return { ask: 'Add all three numbers.', expr: xs.map(fmt).join(' + '), exprSmall: true, answer: num(total), _t: { kind: 'addAll', xs }, hint: 'Stack all three so the ones line up, or add two first and then the third.',
    ways: [way('Line up the places', ['Stack all three numbers with the ones lined up. Add one column at a time and carry when a column makes 10 or more.', column(xs.map(fmt), '+', fmt(total)), `Answer: ${b(fmt(total))}`]),
      way('Two at a time', [`${fmt(xs[0])} + ${fmt(xs[1])} = ${fmt(xs[0] + xs[1])}`, `${fmt(xs[0] + xs[1])} + ${fmt(xs[2])} = ${b(fmt(total))}`])] };
}

function missing(L) {
  const ac = pair(SIZE_B[L - 1], '−');
  if (!ac) return null;
  const [a, c] = ac, r = a - c, form = pick(['add', 'sub', 'start']);
  const bar = `Picture a bar that is ${fmt(a)} long, cut into two parts: ${fmt(c)} and ${fmt(r)}.`;
  if (form === 'add') return { ask: 'Find the missing number.', expr: `${BLANK} + ${fmt(c)} = ${fmt(a)}`, answer: num(r), _t: { kind: 'missAdd', known: c, total: a }, hint: 'The total is given. Take away the part you know.',
    ways: [way('Whole and parts', [bar, `The whole is ${fmt(a)} and one part is ${fmt(c)}. The other part is what is left: ${fmt(a)} − ${fmt(c)}.`, stack(a, c, '−'), `The missing number is ${b(fmt(r))}.`]), countUpWay(a, c)] };
  if (form === 'sub') return { ask: 'Find the missing number.', expr: `${fmt(a)} − ${BLANK} = ${fmt(r)}`, answer: num(c), _t: { kind: 'missSub', a, res: r }, hint: 'How far apart are the two numbers you can see?',
    ways: [way('Whole and parts', [bar, `The whole is ${fmt(a)} and one part is ${fmt(r)}. The other part is ${fmt(a)} − ${fmt(r)}.`, stack(a, r, '−'), `The missing number is ${b(fmt(c))}.`]), countUpWay(a, r)] };
  return { ask: 'Find the missing number.', expr: `${BLANK} − ${fmt(c)} = ${fmt(r)}`, answer: num(a), _t: { kind: 'missStart', c, res: r }, hint: 'Something was taken away. To get back to the start, put it back.',
    ways: [way('Undo the subtraction', [`${fmt(c)} was taken away and ${fmt(r)} was left. Put the ${fmt(c)} back by adding.`, stack(r, c, '+'), `The missing number is ${b(fmt(a))}.`]),
      way('Check it', [`Try ${fmt(a)} in the blank: ${fmt(a)} − ${fmt(c)} = ${fmt(r)}. It fits.`])] };
}

const CTX = [
  { cap: 60000, f: (a, c) => ({ op: '+', story: `A music festival sold ${k(a + ' tickets')} on Friday and ${k(c + ' tickets')} on Saturday.`, ask: 'How many tickets did it sell in all?', find: 'The tickets for both days together.', know: [`Friday: ${a}`, `Saturday: ${c}`], clue: '“In all” means put the amounts together, so add.' }) },
  { cap: 90000, f: (a, c, n) => ({ op: '+', story: `${n}’s phone counted ${k(a + ' steps')} last week and ${k(c + ' steps')} this week.`, ask: 'How many steps is that over both weeks?', find: 'The steps for both weeks together.', know: [`last week: ${a}`, `this week: ${c}`], clue: '“Over both weeks” joins two amounts, so add.' }) },
  { cap: 999999, f: (a, c) => ({ op: '+', story: `A gaming channel had ${k(a + ' followers')}. This month it gained ${k(c + ' more')}.`, ask: 'How many followers does it have now?', find: 'The followers after the gain.', know: [`before: ${a}`, `gained: ${c}`], clue: '“Gained more” makes the amount grow, so add.' }) },
  { cap: 90000, f: (a, c) => ({ op: '−', story: `A stadium has ${k(a + ' seats')}. Tonight ${k(c + ' seats')} are filled.`, ask: 'How many seats are empty?', find: 'The seats with nobody in them.', know: [`all seats: ${a}`, `filled: ${c}`], clue: 'The empty seats are the part of the whole that is left, so subtract.' }) },
  { cap: 15000, f: (a, c) => ({ op: '−', story: `A flight is ${k(a + ' km')} long. The plane has flown ${k(c + ' km')} so far.`, ask: 'How many km are left to fly?', find: 'The distance still to go.', know: [`whole flight: ${a} km`, `flown: ${c} km`], clue: '“Left” means the part that remains, so subtract.' }) },
  { cap: 45000, f: (a, c) => ({ op: '−', story: `This year ${k(a + ' people')} ran the city race. Last year it was ${k(c + ' people')}.`, ask: 'How many more people ran this year?', find: 'The gap between the two years.', know: [`this year: ${a}`, `last year: ${c}`], clue: '“How many more” asks for the gap between two amounts, so subtract.' }) },
];
export function addsubWord(L) {
  const ctx = pick(CTX), probe = ctx.f('', '', ''), ac = pair(capped(L, ctx.cap), probe.op, L === 1);
  if (!ac) return null;
  const [a, c] = ac, x = ctx.f(fmt(a), fmt(c), nm()), res = x.op === '+' ? a + c : a - c;
  return { story: x.story, ask: x.ask, answer: num(res), op: x.op === '+' ? 'add' : 'sub', ways: ways(a, c, x.op), _t: { kind: x.op === '+' ? 'add' : 'sub', a, c },
    read: { find: x.find, know: x.know, clue: x.clue, plan: `${fmt(a)} ${x.op} ${fmt(c)}` }, hint: x.op === '+' ? 'Two amounts are joined. What operation joins?' : 'You know the whole and one part. What finds the other part?' };
}

const MAKERS = [[plain], [plain, plain, plain, three, missing, addsubWord], [plain, plain, three, missing, missing, addsubWord, addsubWord]];
export const genAddSub = L => oneOf(MAKERS[L - 1], L);
