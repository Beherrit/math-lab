// Adding and subtracting within 1000, and checking an answer by estimating first.
import { rnd, pick, b, way, nm, num, choice, fmt as f } from '../../util.js';
import { BLANK } from './words.js';
import { slipQ } from './forms.js';
import { addWays, subWays, hops, roundWays, roundOneWays } from './arith.js';
import { near, numChoice, hto } from './kit.js';

const SIGN = { add: '+', sub: '−' };
const calc = (op, a, c) => (op === 'add' ? a + c : a - c);
const ways = (op, a, c) => (op === 'add' ? addWays(a, c) : subWays(a, c));
const tOf = (op, a, c) => (op === 'add' ? { f: 'add', xs: [a, c] } : { f: 'sub', a, b: c });
const estimate = (op, a, c, p) => calc(op, near(a, p), near(c, p));
const dig = (n, i) => Math.floor(n / 10 ** i) % 10;

// Step 1 numbers: nothing to carry or borrow, so each place can be done on its own.
function friendly(op) {
  if (op === 'add') { const [h, t, o] = [rnd(1, 5), rnd(1, 5), rnd(1, 5)]; return [h * 100 + t * 10 + o, rnd(1, 3) * 100 + rnd(0, 9 - t) * 10 + rnd(0, 9 - o)]; }
  let a, c;
  do { const [h, t, o] = [rnd(3, 6), rnd(2, 9), rnd(2, 9)]; a = h * 100 + t * 10 + o; c = rnd(0, h - 1) * 100 + rnd(0, t) * 10 + rnd(0, o); } while (!c);
  return [a, c];
}
const regroups = (op, a, c) => (op === 'add' ? a % 10 + c % 10 >= 10 || (a % 100) + (c % 100) >= 100 : a % 10 < c % 10 || a % 100 < c % 100);
// Step 2: usually one place has to carry or borrow.
function standard(op) {
  let a, c;
  for (let i = 0; i < 30; i++) {
    a = op === 'add' ? rnd(150, 700) : rnd(300, 999); c = op === 'add' ? rnd(150, Math.min(850, 999 - a)) : rnd(120, a - 40);
    if (regroups(op, a, c)) break;
  }
  return [a, c];
}
// Step 3: borrowing across a zero, starting from 1000, or sums that reach right up to 1000.
function hard(op) {
  if (op === 'add') { const a = rnd(2, 6) * 100 + rnd(1, 9) * 10 + rnd(1, 9); return [a, rnd(110, 999 - a)]; }
  const a = pick([400, 500, 600, 700, 800, 900, 1000, 304, 502, 705, 806]); let c;
  do { c = rnd(111, a - 15); } while (c % 10 === 0);
  return [a, c];
}

function calcQ(op, a, c, ask) {
  return { ask, expr: `${f(a)} ${SIGN[op]} ${f(c)}`, answer: num(calc(op, a, c)), ways: ways(op, a, c), _t: tOf(op, a, c),
    hint: op === 'add' ? 'Add one place at a time: hundreds, tens, then ones. Watch for a place that makes 10 or more.' : 'Count up from the smaller number, or take it away one place at a time. Watch for a place that is too small.' };
}
function missingQ(a, c) {
  const t = a + c, form = rnd(0, 2);
  const [expr, known, ans] = form === 0 ? [`${f(a)} + ${BLANK} = ${f(t)}`, a, c] : form === 1 ? [`${BLANK} + ${f(c)} = ${f(t)}`, c, a] : [`${f(t)} − ${BLANK} = ${f(a)}`, a, c];
  return { ask: 'What number is missing?', expr, answer: num(ans), hint: 'The whole is the biggest number. Take the part you know away from the whole.', _t: { f: 'sub', a: t, b: known },
    ways: [way('Take the part from the whole', [`The whole is ${f(t)} and one part is ${f(known)}.`, `${f(t)} − ${f(known)} = ${b(f(ans))}.`]), way('Count up to the whole', [`Count up from ${f(known)} to ${f(t)} in jumps: ${hops(known, t).map(f).join(' + ')}.`, `The jumps add up to ${b(f(ans))}.`])] };
}
function roundQ(n, p) {
  return { ask: `Round ${f(n)} to the nearest ${p}.`, answer: num(near(n, p)), ways: roundOneWays(n, p), _t: { f: 'near', n, p }, hint: `Find the ${p === 10 ? 'ones' : 'tens'} digit. Is it 5 or more, or less than 5?` };
}
function estimateQ(op, a, c, p) {
  const sign = SIGN[op], q = estimate(op, a, c, p) > 0 ? p : 10;
  return { ask: `Estimate ${f(a)} ${sign} ${f(c)} by rounding each number to the nearest ${q} first.`, answer: num(estimate(op, a, c, q)), ways: roundWays(a, c, sign, q), _t: { f: 'est', op, a, b: c, p: q },
    hint: 'Round each number first, then calculate with the rounded numbers.' };
}
// "Which answer is reasonable?": only the exact answer is close to the estimate; the slips are a hundred or more out.
function reasonQ(op, a, c) {
  const right = calc(op, a, c), sign = SIGN[op], ra = near(a, 10), rc = near(c, 10), est = estimate(op, a, c, 10);
  return { ask: `Round to the nearest 10 and estimate ${f(a)} ${sign} ${f(c)}. Which answer is reasonable?`, answer: numChoice(right, [right + 100, right - 100, right + 200, right - 200].filter(x => x <= 1000)), choiceBig: true,
    hint: 'Round both numbers, calculate, then pick the answer that is close to your estimate.', _t: { f: 'reason', op, a, b: c, p: 10 },
    ways: [way('Estimate, then pick', [`Round ${f(a)} to ${f(ra)} and ${f(c)} to ${f(rc)}.`, `${f(ra)} ${sign} ${f(rc)} = ${f(est)}.`, `Only ${b(f(right))} is close to ${f(est)}.`]), way('Work it out exactly', ways(op, a, c)[0].s)] };
}
// The classic slip: every place worked on its own, with nothing carried (adding) or the smaller digit taken from the bigger (subtracting).
function slipQuestion(op, a, c) {
  const places = ['ones', 'tens', 'hundreds'], wrong = [0, 1, 2].reduce((s, i) => s + (op === 'add' ? (dig(a, i) + dig(c, i)) % 10 : Math.abs(dig(a, i) - dig(c, i))) * 10 ** i, 0);
  const i = [0, 1].find(k => (op === 'add' ? dig(a, k) + dig(c, k) >= 10 : dig(a, k) < dig(c, k)));
  if (i === undefined || wrong === calc(op, a, c)) return calcQ(op, a, c, 'Work it out. Check with an estimate.');
  const slip = op === 'add' ? `In the ${places[i]} place ${dig(a, i)} + ${dig(c, i)} = ${dig(a, i) + dig(c, i)}, more than 9. The extra has to be carried to the next place, and it was left out.`
    : `In the ${places[i]} place ${dig(a, i)} is smaller than ${dig(c, i)}, so you must regroup from the next place. Taking the smaller digit from the bigger one gives the wrong answer.`;
  return slipQ({ expr: `${f(a)} ${SIGN[op]} ${f(c)}`, wrong: f(wrong), answer: calc(op, a, c), slip, ways: ways(op, a, c), t: tOf(op, a, c), hint: op === 'add' ? 'Check each place. Did a place make 10 or more?' : 'Check each place. Is any digit too small to take away from?' });
}
const ADD = [(a, c, m) => [`${m} has ${a} songs in a playlist and adds ${c} more.`, 'How many songs are in the playlist now?', 'songs'], (a, c) => [`A school hall sold ${a} tickets on Friday and ${c} on Saturday.`, 'How many tickets is that altogether?', 'tickets'],
  (a, c) => [`A game has ${a} gold coins in one world and ${c} in the next.`, 'How many coins are there in both worlds?', 'coins'], (a, c, m) => [`${m} walked ${a} steps before lunch and ${c} steps after lunch.`, 'How many steps is that in all?', 'steps'],
  (a, c) => [`A bakery made ${a} rolls in the morning and ${c} in the afternoon.`, 'How many rolls did it make in the day?', 'rolls']];
const SUB = [(a, c) => [`A stadium has ${a} seats and ${c} of them are already taken.`, 'How many seats are free?', 'seats'], (a, c, m) => [`${m} has ${a} photos on a phone and deletes ${c} of them.`, 'How many photos are left?', 'photos'],
  (a, c, m) => [`A trail is ${a} meters long and ${m} has run ${c} meters of it.`, 'How many meters are left to run?', 'meters'], (a, c) => [`A shop had ${a} cans of paint and sold ${c} of them.`, 'How many cans are left?', 'cans'],
  (a, c, m) => [`${m} wants ${a} points for a new skin in a game and has ${c} points.`, 'How many more points does it need?', 'points']];
function storyQ(op, a, c) {
  const [story, ask, suffix] = pick(op === 'add' ? ADD : SUB)(a, c, nm());
  return { story, ask, answer: num(calc(op, a, c)), suffix, ways: ways(op, a, c), _t: tOf(op, a, c), hint: op === 'add' ? 'Two amounts are joined. Which operation joins them?' : 'Part of the amount goes away. Which operation finds what is left?' };
}
// Two sums, estimated to the nearest 100: which is bigger? Only offered when the estimates already show it.
function biggerQ() {
  let s, t, e1, e2;
  do { s = [rnd(150, 600), rnd(150, 380)]; t = [rnd(150, 600), rnd(150, 380)]; e1 = near(s[0], 100) + near(s[1], 100); e2 = near(t[0], 100) + near(t[1], 100); }
  while (e1 === e2 || (s[0] + s[1] > t[0] + t[1]) !== (e1 > e2));
  const [win, lose] = e1 > e2 ? [s, t] : [t, s], x = `${f(win[0])} + ${f(win[1])}`, y = `${f(lose[0])} + ${f(lose[1])}`, big = n => near(n, 100);
  return { ask: 'Round each number to the nearest 100 to see which sum is bigger. You do not need the exact answers.', answer: choice(x, [y]), choiceBig: true, _t: { f: 'bigger' }, hint: 'Estimate each sum by rounding every number to the nearest 100.',
    ways: [way('Estimate both', [`${x}: about ${big(win[0])} + ${big(win[1])} = ${big(win[0]) + big(win[1])}.`, `${y}: about ${big(lose[0])} + ${big(lose[1])} = ${big(lose[0]) + big(lose[1])}.`, `The first is bigger: ${b(x)}.`]),
      way('Work out both', [`${x} = ${f(win[0] + win[1])}.`, `${y} = ${f(lose[0] + lose[1])}.`, `${f(win[0] + win[1])} is more than ${f(lose[0] + lose[1])}, so ${b(x)}.`])] };
}
function sumThree() {
  let a, c, d;
  do { a = rnd(110, 480); c = rnd(110, 360); d = rnd(110, 400); } while (a + c + d > 1000);
  const [ah, at, ao] = hto(a), [ch, ct, co] = hto(c), [dh, dt, d0] = hto(d), s = a + c + d;
  return { ask: 'Add the three numbers.', expr: `${f(a)} + ${f(c)} + ${f(d)}`, answer: num(s), _t: { f: 'add', xs: [a, c, d] }, hint: 'Add two numbers first, then add the third. Or add all the hundreds, then the tens, then the ones.',
    ways: [way('Two at a time', [`${f(a)} + ${f(c)} = ${f(a + c)}.`, `${f(a + c)} + ${f(d)} = ${b(f(s))}.`]), way('Add each place', [`Hundreds: ${ah} + ${ch} + ${dh} = ${ah + ch + dh}.`, `Tens: ${at} + ${ct} + ${dt} = ${at + ct + dt}.`, `Ones: ${ao} + ${co} + ${d0} = ${ao + co + d0}.`, `${ah + ch + dh} + ${at + ct + dt} + ${ao + co + d0} = ${b(f(s))}.`])] };
}
export function genAdd1000(L) {
  const op = pick(['add', 'sub']);
  if (L === 1) {
    const [a, c] = friendly(op), t = pick(['calc', 'calc', 'miss', 'round', 'story']);
    if (t === 'miss') return missingQ(...friendly('add'));
    return t === 'round' ? roundQ(rnd(111, 899), pick([10, 10, 100])) : t === 'story' ? storyQ(op, a, c) : calcQ(op, a, c, op === 'add' ? 'Add the hundreds, then the tens, then the ones.' : 'Take away one place at a time: hundreds, tens, ones.');
  }
  const [a, c] = L === 2 ? standard(op) : hard(op), t = pick(L === 2 ? ['calc', 'est', 'est100', 'reason', 'slip', 'story', 'bigger'] : ['calc', 'three', 'est', 'reason', 'slip', 'story', 'miss', 'bigger']);
  if (t === 'est' || t === 'est100') return estimateQ(op, a, c, t === 'est' ? 10 : 100);
  if (t === 'miss') return missingQ(...standard('add'));
  const make = { reason: reasonQ, slip: slipQuestion, story: storyQ }[t];
  if (make) return make(op, a, c);
  return t === 'bigger' ? biggerQ() : t === 'three' ? sumThree() : calcQ(op, a, c, L === 2 ? 'Work it out. Check with an estimate.' : 'Work it out. Mind the zeros.');
}
