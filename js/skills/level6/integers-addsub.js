// Adding and subtracting integers: number line moves, zero pairs, and "add the opposite".
import { rnd, pick, chance, fmt, b, k, way } from '../../util.js';
import { nz, par, size, signName, snum, tag, plural } from './helpers.js';
import { hopLine, chips } from './visuals-lines.js';

const side = v => (v < 0 ? 'left' : 'right');
// Two non-zero integers up to `m` in size, at least one of them negative.
function pair(m) {
  for (;;) { const a = nz(-m, m), c = nz(-m, m); if (a < 0 || c < 0) return [a, c]; }
}
const lineWay = (a, c) => way('Number line', [
  `Start at ${b(fmt(a))}.`,
  `Adding ${par(c)} means moving ${b(`${size(c)} to the ${side(c)}`)}. Positive numbers push right, negative numbers pull left.`,
  hopLine(a, a + c), `You land on ${b(fmt(a + c))}.`]);
function signWay(a, c) {
  const s = a + c;
  if ((a < 0) === (c < 0)) return way('Same signs', [
    `Both numbers are ${signName(a)}, so they pull the same way.`,
    `Add the sizes: ${size(a)} + ${size(c)} = ${size(s)}.`, `Keep the sign they share: ${b(fmt(s))}.`]);
  const big = Math.abs(a) >= Math.abs(c) ? a : c, small = big === a ? c : a;
  return way('Zero pairs', [
    `A +1 and a −1 together make 0. The signs are different, so ${plural(Math.abs(small), 'pair')} cancel out.`,
    `What is left: ${size(big)} − ${size(small)} = ${size(s)}.`,
    s === 0 ? `Everything cancelled, so the answer is ${b('0')}.` : `The leftovers are ${signName(big)}, because there were more ${signName(big)}s: ${b(fmt(s))}.`]);
}
// Each story keeps its numbers inside what the situation can really be: lo/hi for the start, up for the biggest change,
// and the lowest and highest the end value may be.
const ADD_CTX = [
  { lo: -20, hi: 25, up: 15, end: [-30, 40], make: (a, c) => ({ story: `At sunrise the temperature was ${k(fmt(a) + '°C')}. By the afternoon it had ${c < 0 ? 'dropped' : 'gone up'} by ${k(size(c) + '°C')}.`,
    ask: 'What was the temperature in the afternoon, in °C?', find: 'The afternoon temperature.', know: [`start: ${fmt(a)}°C`, `${c < 0 ? 'drop' : 'rise'}: ${size(c)}°C`] }) },
  { lo: -30, hi: 60, up: 40, end: [-60, 100], make: (a, c, n) => ({ story: `${n}'s game score is ${k(plural(a, 'point'))}. On the next turn ${n} ${c < 0 ? 'loses' : 'wins'} ${k(plural(Math.abs(c), 'point'))}.`,
    ask: `What is ${n}'s score now?`, find: 'The new score.', know: [`score: ${fmt(a)}`, `${c < 0 ? 'loses' : 'wins'} ${size(c)}`] }) },
  { lo: -60, hi: -2, up: 40, end: [-80, 0], make: (a, c) => ({ story: `A submarine is at ${k(fmt(a) + ' m')} compared with sea level (0 m). It ${c < 0 ? 'dives' : 'rises'} ${k(size(c) + ' m')}.`,
    ask: 'Where is it now, in metres compared with sea level?', find: 'The new position.', know: [`start: ${fmt(a)} m`, `${c < 0 ? 'down' : 'up'} ${size(c)} m`] }) },
  { lo: -40, hi: 60, up: 50, end: [-60, 100], make: (a, c, n) => ({ story: `${n}'s account balance is ${k(plural(a, 'dollar'))}. Then ${n} ${c < 0 ? 'spends' : 'pays in'} ${k(plural(Math.abs(c), 'dollar'))}.`,
    ask: 'What is the balance now, in dollars?', find: 'The new balance.', know: [`balance: ${fmt(a)}`, `${c < 0 ? 'spends' : 'pays in'} ${size(c)}`] }) },
];
// Start values and changes for a story, limited by the step (m) and by what the story can be.
function addNumbers(ctx, m) {
  for (;;) {
    const a = nz(Math.max(ctx.lo, -m), Math.min(ctx.hi, m)), c = nz(-Math.min(ctx.up, m), Math.min(ctx.up, m));
    if (a > 0 && c > 0) continue;
    if (a + c >= ctx.end[0] && a + c <= ctx.end[1]) return [a, c];
  }
}
export function addWord(L) {
  const m = L >= 3 ? 60 : L === 2 ? 25 : 12, ctx = pick(ADD_CTX), n = pick(['Maya', 'Leo', 'Sam', 'Nora', 'Eli', 'Zoe']);
  const [a, c] = addNumbers(ctx, m), t = ctx.make(a, c, n);
  return tag({ story: t.story, ask: t.ask, answer: snum(a + c), op: 'add', ways: [lineWay(a, c), signWay(a, c)],
    read: { find: t.find, know: t.know, clue: 'A change is added to the start. Going down, losing or spending is a negative change.', plan: `${fmt(a)} + ${par(c)}` },
    hint: 'Write the change as a positive or negative number, then add it to the start.' }, { kind: 'sum', xs: [a, c] });
}
function chipsProblem() {
  const p = rnd(1, 8), n = rnd(1, 8), z = Math.min(p, n);
  return tag({ ask: 'Each + chip is worth 1 and each − chip is worth −1. One of each together makes zero. What are all these chips worth together?',
    visual: chips(p, n), expr: `${p} + ${par(-n)}`, answer: snum(p - n),
    ways: [way('Cancel the zero pairs', [`Match each + chip with a − chip. That makes ${b(z)} zero pair${z === 1 ? '' : 's'}, worth nothing.`,
      p === n ? 'No chips are left over.' : `Left over: ${Math.abs(p - n)} ${p > n ? '+' : '−'} chip${Math.abs(p - n) === 1 ? '' : 's'}.`, `So the chips are worth ${b(fmt(p - n))}.`]), lineWay(p, -n)],
    hint: 'Pair up one + with one −. What is left over?' }, { kind: 'sum', xs: [p, -n] });
}
function threeAdd() {
  const xs = [nz(-40, 40), nz(-40, 40), nz(-40, 40)];
  if (xs.every(v => v > 0)) xs[rnd(0, 2)] *= -1;
  const [a, c, d] = xs, pos = xs.filter(v => v > 0), neg = xs.filter(v => v < 0);
  const ps = pos.reduce((s, v) => s + v, 0), ns = neg.reduce((s, v) => s + v, 0);
  return tag({ ask: 'Add.', expr: `${fmt(a)} + ${par(c)} + ${par(d)}`, answer: snum(a + c + d),
    ways: [way('Left to right', [`First two: ${fmt(a)} + ${par(c)} = ${b(fmt(a + c))}.`, `Then: ${fmt(a + c)} + ${par(d)} = ${b(fmt(a + c + d))}.`]),
      way('Collect the positives and the negatives', [`You can add in any order, so gather each kind.`,
        `Positives: ${pos.length ? pos.map(fmt).join(' + ') + ' = ' + fmt(ps) : 'none, so 0'}.`, `Negatives: ${neg.map(par).join(' + ')} = ${fmt(ns)}.`,
        `Put them together: ${fmt(ps)} + ${par(ns)} = ${b(fmt(ps + ns))}.`])],
    hint: 'Add the first two numbers, then add the third to that.' }, { kind: 'sum', xs });
}
function missingAdd() {
  const [a, m] = pair(30), c = a + m;
  return tag({ ask: 'What number goes in the blank?', expr: `${fmt(a)} + <span class="blank">?</span> = ${fmt(c)}`, answer: snum(m),
    ways: [way('Number line', [`Start at ${fmt(a)}. You need to land on ${fmt(c)}.`, hopLine(a, c),
      m === 0 ? 'You do not move at all.' : `That is a move of ${size(m)} to the ${side(m)}, so the missing number is ${b(fmt(m))}.`]),
      way('Undo the adding', [`The blank is what you get when you take ${fmt(a)} away from ${fmt(c)}.`, `${fmt(c)} − ${par(a)} = ${fmt(c)} + ${par(-a)} = ${b(fmt(m))}`, `Check: ${fmt(a)} + ${par(m)} = ${fmt(c)}.`])],
    hint: `How far is it from ${fmt(a)} to ${fmt(c)}, and in which direction?` }, { kind: 'missadd', a, c });
}
export function genIntAdd(L) {
  if (L === 1 && chance(0.35)) return chipsProblem();
  if (L === 2 && chance(0.3)) return addWord(L);
  if (L === 3) { const r = Math.random(); return r < 0.45 ? threeAdd() : r < 0.75 ? missingAdd() : addWord(L); }
  const [a, c] = pair(L === 1 ? 9 : 30);
  return tag({ ask: 'Add.', expr: `${fmt(a)} + ${par(c)}`, answer: snum(a + c), ways: [lineWay(a, c), signWay(a, c)],
    hint: `Start at ${fmt(a)} on a number line. Which way does ${par(c)} move you?` }, { kind: 'sum', xs: [a, c] });
}

function subWays(a, c) {
  const r = a - c;
  return [
    way('Add the opposite', [
      `Subtracting a number does the same thing as adding its opposite. ${c < 0 ? `Taking away a debt of ${size(c)} leaves you ${size(c)} better off.` : `Taking away ${size(c)} is the same as adding a loss of ${size(c)}.`}`,
      `${fmt(a)} − ${par(c)} = ${fmt(a)} + ${par(-c)}`, `Now it is an adding problem: ${fmt(a)} + ${par(-c)} = ${b(fmt(r))}`]),
    way('Number line', [`Start at ${b(fmt(a))}.`,
      `Subtracting goes the opposite way from adding. Adding ${par(c)} would move ${side(c)}, so subtracting it moves ${b(`${size(c)} to the ${side(-c)}`)}.`,
      hopLine(a, r), `You land on ${b(fmt(r))}.`]),
    way('Check by adding back', [`If ${fmt(a)} − ${par(c)} = ${fmt(r)}, then ${fmt(r)} + ${par(c)} must give ${fmt(a)}.`, `${fmt(r)} + ${par(c)} = ${fmt(a)}, so it checks out.`]),
  ];
}
// hi and lo are ranges for the higher and the lower value; the lower one is always below zero.
const SUB_CTX = [
  { hi: [-10, 35], lo: [-30, -1], make: (hi, lo) => ({ story: `On one day the warmest temperature was ${k(fmt(hi) + '°C')} and the coldest was ${k(fmt(lo) + '°C')}.`, ask: 'How many degrees warmer was the warmest than the coldest?', know: [`warmest: ${fmt(hi)}°C`, `coldest: ${fmt(lo)}°C`] }) },
  { hi: [5, 80], lo: [-40, -1], make: (hi, lo) => ({ story: `A hilltop is at ${k(fmt(hi) + ' m')} and the bottom of a lake is at ${k(fmt(lo) + ' m')}, both measured from sea level.`, ask: 'How many metres higher is the hilltop than the lake bottom?', know: [`hilltop: ${fmt(hi)} m`, `lake bottom: ${fmt(lo)} m`] }) },
  { hi: [3, 60], lo: [-40, -1], make: (hi, lo) => ({ story: `In a card game the winner finished on ${k(plural(hi, 'point'))} and the last player finished on ${k(plural(lo, 'point'))}.`, ask: 'By how many points did the winner beat the last player?', know: [`winner: ${fmt(hi)}`, `last: ${fmt(lo)}`] }) },
];
export function subWord(L) {
  const m = L >= 3 ? 60 : L === 2 ? 25 : 12, ctx = pick(SUB_CTX);
  const lo = -rnd(Math.max(1, -ctx.lo[1]), Math.min(-ctx.lo[0], m)), hi = rnd(Math.max(ctx.hi[0], lo + 2), Math.min(ctx.hi[1], m));
  if (hi === 0 || hi > m) return subWord(L);
  const t = ctx.make(hi, lo);
  return tag({ story: t.story, ask: t.ask, answer: snum(hi - lo), op: 'sub', ways: subWays(hi, lo),
    read: { find: 'The gap between the two numbers.', know: t.know, clue: 'A difference is found by subtracting: higher number minus lower number.', plan: `${fmt(hi)} − ${par(lo)}` },
    hint: 'Subtract the lower number from the higher one. Subtracting a negative is adding.' }, { kind: 'diff', a: hi, c: lo });
}
function chain() {
  const a = nz(-30, 30), c = nz(-30, 30), d = nz(-30, 30);
  if (c > 0 && d > 0) return chain();
  return tag({ ask: 'Work it out.', expr: `${fmt(a)} − ${par(c)} + ${par(d)}`, answer: snum(a - c + d),
    ways: [way('Turn every subtraction into adding', [`${fmt(a)} − ${par(c)} + ${par(d)} = ${fmt(a)} + ${par(-c)} + ${par(d)}`, `First two: ${fmt(a)} + ${par(-c)} = ${fmt(a - c)}.`, `Then: ${fmt(a - c)} + ${par(d)} = ${b(fmt(a - c + d))}.`]),
      way('Number line, one move at a time', [`Start at ${fmt(a)}. Subtracting ${par(c)} moves ${size(c)} to the ${side(-c)}: you are at ${fmt(a - c)}.`, `Adding ${par(d)} moves ${size(d)} to the ${side(d)}: you land on ${b(fmt(a - c + d))}.`])],
    hint: 'Rewrite the subtraction as adding the opposite, then go left to right.' }, { kind: 'sum', xs: [a, -c, d] });
}
function missingSub() {
  const a = nz(-30, 30), m = nz(-30, 30), c = a - m;
  return tag({ ask: 'What number goes in the blank?', expr: `${fmt(a)} − <span class="blank">?</span> = ${fmt(c)}`, answer: snum(m),
    ways: [way('Think about the gap', [`The blank is how much you take from ${fmt(a)} to reach ${fmt(c)}.`, `${fmt(a)} − ${par(c)} = ${fmt(a)} + ${par(-c)} = ${b(fmt(m))}`]),
      way('Check it', [`${fmt(a)} − ${par(m)} = ${fmt(a)} + ${par(-m)} = ${fmt(c)}, so ${b(fmt(m))} fits.`])],
    hint: `What do you subtract from ${fmt(a)} to get ${fmt(c)}? Try ${fmt(a)} − ${par(c)}.` }, { kind: 'diff', a, c });
}
export function genIntSub(L) {
  if (L === 2 && chance(0.3)) return subWord(L);
  if (L === 3) { const r = Math.random(); return r < 0.4 ? chain() : r < 0.7 ? missingSub() : subWord(L); }
  const m = L === 1 ? 9 : 30;
  for (;;) {
    const a = nz(-m, m), c = nz(-m, m);
    if (c > 0 && a >= c) continue; // plain subtraction with a positive answer belongs to earlier levels
    return tag({ ask: 'Subtract.', expr: `${fmt(a)} − ${par(c)}`, answer: snum(a - c), ways: subWays(a, c),
      hint: `Change it to adding the opposite: ${fmt(a)} + ${par(-c)}.` }, { kind: 'diff', a, c });
  }
}
