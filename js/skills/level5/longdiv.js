// Dividing multi-digit whole numbers with the standard method: estimate first, divide one digit at a time, check.
import { rnd, pick, chance, fmt, b, k, way, num, choice } from '../../util.js';
import { T, numChoice } from './helpers.js';

const PLACES = ['ones', 'tens', 'hundreds', 'thousands'];
const nDigits = n => String(n).length;
// Divisor range and answer range for each step.
const SIZE = { 1: [[10, 25], [10, 60]], 2: [[12, 49], [20, 200]], 3: [[21, 99], [40, 900]] };

// The standard method written out one answer digit at a time. Every sum in it is true.
function longSteps(n, d) {
  const s = String(n), out = []; let rem = 0, q = '', started = false;
  for (let i = 0; i < s.length; i++) {
    const cur = rem * 10 + Number(s[i]);
    if (!started && cur < d) { rem = cur; continue; }
    const t = Math.floor(cur / d), lead = started ? `Bring down the ${s[i]}: ${fmt(cur)}.` : `Start with the first digits: ${fmt(cur)}.`;
    out.push(`${lead} How many ${d}s fit? ${t === 0 ? 'None, so write 0.' : `${t}, because ${t} × ${d} = ${fmt(t * d)}. ${fmt(cur)} − ${fmt(t * d)} = ${fmt(cur - t * d)}.`}`);
    rem = cur - t * d; q += t; started = true;
  }
  return { steps: out, q: Number(q), r: rem };
}
// The same division with friendly chunks: tens of groups, then ones.
function chunkSteps(n, d) {
  let rest = n; const out = [], parts = [];
  for (let p = 10 ** (nDigits(n) - nDigits(d) + 1); p >= 1; p /= 10) {
    const t = Math.floor(rest / (d * p)); if (!t) continue;
    out.push(`${fmt(t * p)} groups of ${d}: ${fmt(t * p)} × ${d} = ${fmt(t * p * d)}. ${fmt(rest)} − ${fmt(t * p * d)} = ${fmt(rest - t * p * d)} left.`);
    parts.push(t * p); rest -= t * p * d;
  }
  const total = parts.reduce((a, x) => a + x, 0), rm = rest ? ` and ${b(rest)} left over` : '';
  return [...out, parts.length > 1 ? `Add the groups: ${parts.map(fmt).join(' + ')} = ${b(fmt(total))}${rm}` : `One group size does it: ${b(fmt(total))}${rm}`];
}
const standard = (n, d, tail) => { const r = longSteps(n, d); return way('Standard method, one digit at a time', [...r.steps, tail(r)]); };
const exactTail = r => `The digits on top read ${b(fmt(r.q))}${r.r ? `, with ${b(r.r)} left over` : ''}.`;
const checkWay = (q, d, n, r = 0) => way('Multiply back to check', [`${fmt(q)} × ${d} = ${fmt(q * d)}`, r ? `${fmt(q * d)} + ${r} = ${fmt(n)}, so the left over is ${b(r)}.` : `That is ${fmt(n)}, the number we started with, so ${b(fmt(q))} is right.`]);

// Contexts for exact division: d and q are [lo, hi] ranges that keep the story believable.
const CTX = [
  { d: [10, 60], q: [10, 150], s: (n, d) => `An arena has ${k(fmt(n) + ' seats')} set out in equal rows of ${k(d)}.`, ask: 'How many rows are there?' },
  { d: [10, 48], q: [10, 300], s: (n, d) => `A toy factory packs ${k(fmt(n) + ' marbles')} into bags of ${k(d)}.`, ask: 'How many bags does it fill?' },
  { d: [10, 99], q: [10, 300], s: (n, d) => `A printer has printed ${k(fmt(n) + ' pages')} in jobs of ${k(d)} pages each.`, ask: 'How many jobs was that?' },
  { d: [12, 30], q: [10, 400], s: (n, d) => `A farm packs ${k(fmt(n) + ' eggs')} into cartons of ${k(d)}.`, ask: 'How many cartons is that?' },
  { d: [10, 30], q: [10, 300], s: (n, d) => `A bakery made ${k(fmt(n) + ' rolls')}, sold in packs of ${k(d)}.`, ask: 'How many packs is that?' },
];
function sizes(L, c) {
  const [[dl, dh], [ql, qh]] = SIZE[L], dlo = Math.max(dl, c.d[0]), dhi = Math.min(dh, c.d[1]), qlo = Math.max(ql, c.q[0]), qhi = Math.min(qh, c.q[1]);
  return dlo > dhi || qlo > qhi ? null : [rnd(dlo, dhi), rnd(qlo, qhi)];
}
function fit(L, list) { for (;;) { const c = pick(list), sz = sizes(L, c); if (sz) return [c, ...sz]; } }

function quotient(L) {
  const [c, d, q] = fit(L, CTX), n = d * q, story = chance(0.6);
  return T({ ...(story ? { story: c.s(n, d), ask: c.ask } : { ask: 'Work out the division.', expr: `${fmt(n)} ÷ ${d}` }), answer: num(q), op: story ? 'div' : undefined,
    ways: [standard(n, d, exactTail), way('Friendly chunks', chunkSteps(n, d))],
    ...(story ? { read: { find: c.ask.replace(/\?$/, '.'), know: [`${fmt(n)} in all`, `${d} in each group`], clue: 'Putting a total into equal groups is a division.', plan: `${fmt(n)} ÷ ${d}` } } : {}),
    hint: `Look at the first digits of ${fmt(n)}. How many times does ${d} fit into them?` }, 'ldQuot', { n, d });
}
function remainder(L) {
  const [d, q] = [rnd(...SIZE[L][0]), rnd(...SIZE[L][1])], r = rnd(1, d - 1), n = d * q + r;
  return T({ ask: `What is the remainder when ${b(fmt(n))} is divided by ${b(d)}?`, answer: num(r),
    ways: [standard(n, d, t => `What is left at the end is the remainder: ${b(t.r)}.`), checkWay(q, d, n, r)],
    hint: `Divide as far as you can. What is left after the last subtraction?` }, 'ldRem', { n, d });
}
function firstDigit(L) {
  const [d, q] = [rnd(...SIZE[L][0]), rnd(...SIZE[L][1])], n = d * q + (chance(0.5) ? rnd(0, d - 1) : 0), s = String(n); let len = 1;
  while (Number(s.slice(0, len)) < d) len++;
  const place = PLACES[nDigits(n) - len], first = Number(s.slice(0, len));
  return T({ ask: `In ${b(fmt(n))} ÷ ${b(d)}, which place does the first digit of the answer go in?`, answer: choice(place, [], { all: PLACES }), choiceBig: true,
    ways: [way('Find the first group that fits', [`${s.slice(0, len - 1)} is smaller than ${d}, so take one more digit. ${d} fits into ${fmt(first)}.`, `The first answer digit goes above the last digit of ${fmt(first)}, which is in the ${b(place)} place.`]),
      way('Guess the size of the answer', [`${fmt(n)} ÷ ${d} is about ${fmt(q)}, a number with ${nDigits(q)} digit${nDigits(q) > 1 ? 's' : ''}.`, `Its first digit is in the ${b(place)} place.`])],
    hint: 'Find the first digits of the big number that are at least as big as the divisor. The answer starts above the last one.' }, 'ldFirst', { n, d });
}
function estimate(L) {
  const dE = pick(L === 1 ? [20, 30, 40] : [20, 30, 40, 50, 60, 70, 80, 90]), d = dE + rnd(-3, 3), E = rnd(...{ 1: [2, 9], 2: [3, 30], 3: [10, 90] }[L]) * 10, nE = dE * E;
  const n = nE + rnd(-2, 2) * pick([1, 5, 10]);
  return T({ ask: `Which is the best estimate for ${b(fmt(n))} ÷ ${b(d)}?`, answer: numChoice(E, [E * 10, E / 10, E / 2]), choiceBig: true,
    ways: [way('Round to friendly numbers', ['An estimate tells you the size of the answer before you divide.', `${d} is close to ${dE}, and ${fmt(n)} is close to ${fmt(nE)}.`, `${fmt(nE)} ÷ ${dE} = ${b(fmt(E))}`]),
      way('Check the size', [`${fmt(E)} × ${dE} = ${fmt(nE)}, which is close to ${fmt(n)}.`, `${fmt(E * 10)} would be ten times too big and ${fmt(E / 10)} ten times too small. The estimate is ${b(fmt(E))}.`])],
    hint: 'Round the divisor to a friendly number like 20 or 50, then round the big number to match it.' }, 'ldEstimate', { n, d });
}
function zeroInside(L) {
  const d = rnd(...SIZE[L][0]), a = rnd(1, 9), c = rnd(1, 9), q = a * 100 + c, n = d * q;
  return T({ ask: `Which is ${b(fmt(n))} ÷ ${b(d)}?`, answer: numChoice(q, [a * 10 + c, q * 10, a * 1000 + c]), choiceBig: true,
    ways: [standard(n, d, exactTail), checkWay(q, d, n)], hint: 'When a digit cannot be divided yet, write a 0 in the answer and bring down the next digit.' }, 'ldZero', { n, d });
}
// Remainder stories: d and q are [lo, hi] ranges, f(n, d) gives [story, question].
const DOWN = [
  { d: [12, 60], q: [10, 300], f: (n, d) => [`A bakery has ${k(fmt(n) + ' rolls')} to put into boxes that hold ${k(d)} each.`, 'How many full boxes can it fill?'] },
  { d: [10, 40], q: [10, 300], f: (n, d) => [`${k(fmt(n) + ' photos')} are printed on pages that hold ${k(d)} each.`, 'How many pages are filled completely?'] },
];
const UP = [
  { d: [30, 60], q: [5, 90], f: (n, d) => [`${k(fmt(n) + ' students')} are going to a game. Each bus seats ${k(d)}.`, 'How many buses are needed?'] },
  { d: [20, 40], q: [10, 100], f: (n, d) => [`A school must move ${k(fmt(n) + ' chairs')}. Each trolley carries ${k(d)}.`, 'How many trips does it need?'] },
];
export function remainderWord(up, L = 2) {
  const [c, d, q] = fit(L, up ? UP : DOWN), r = rnd(1, d - 1), n = d * q + r, [story, ask] = c.f(n, d), ans = up ? q + 1 : q;
  return T({ story, ask, answer: num(ans), op: 'multi',
    ways: [standard(n, d, t => `${fmt(t.q)} with ${t.r} left over. ${up ? `The ${t.r} left over still need one more, so round up to ${b(t.q + 1)}.` : `The ${t.r} left over do not fill another one, so the answer is ${b(t.q)}.`}`),
      way('Check with multiplying', [`${fmt(q)} of them hold ${fmt(q * d)}, and ${fmt(n)} − ${fmt(q * d)} = ${r} are left.`, up ? `${fmt(q + 1)} hold ${fmt((q + 1) * d)}, which is enough. ${fmt(q)} is not. The answer is ${b(fmt(q + 1))}.` : `One more would need ${d}, and only ${r} are left. The answer is ${b(fmt(q))}.`])],
    read: { find: ask.replace(/\?$/, '.'), know: [`${fmt(n)} in all`, `${d} in each`], clue: up ? 'Anything left over still needs one more.' : '“Full” means leftovers do not count.', plan: `${fmt(n)} ÷ ${d}, then think about the left over` },
    hint: 'Divide first. Then think: does the left over count as one more, or not?' }, up ? 'ldUp' : 'ldDown', { n, d });
}
const SHAPES = { 1: [quotient, remainder, firstDigit, estimate], 2: [quotient, remainder, zeroInside, () => remainderWord(false), estimate], 3: [quotient, zeroInside, () => remainderWord(true, 3), () => remainderWord(false, 3), estimate] };
export const genLongDiv = L => pick(SHAPES[L])(L);
export const divWord = L => (chance(0.5) ? remainderWord(chance(0.5), Math.max(L, 2)) : quotient(Math.max(L, 2)));
