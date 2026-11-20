// Skill l4ldiv: dividing by 2-digit numbers with remainders, estimating the quotient first (5.NBT.6).
import { R, rnd, pick, chance, gcd, fmt, F, fr, b, k, way, nm, num, frac, choice } from '../../util.js';
import { T, rd, pl, BLANK } from './helpers.js';

// d (the divisor), q and r (the quotient and remainder), t (the dividend) for each step.
function nums(L) {
  const d = L === 1 ? rnd(11, 29) : L === 2 ? rnd(12, 49) : rnd(21, 89), q = L === 1 ? rnd(3, 9) : L === 2 ? rnd(10, 60) : rnd(30, 110), r = rnd(1, d - 1), t = d * q + r;
  return t > 9999 ? nums(L) : { d, q, r, t };
}
const CHUNKS = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
function chunkLines(t, d) {
  const lines = [], used = []; let rem = t;
  while (rem >= d) { const m = CHUNKS.find(c => c * d <= rem); lines.push(`${m} × ${d} = ${fmt(m * d)}, so ${fmt(rem)} − ${fmt(m * d)} = ${fmt(rem - m * d)} left`); used.push(m); rem -= m * d; }
  return { lines, used };
}
// Ways that divide with friendly chunks and then check by multiplying. want is 'q' (the quotient) or 'r' (the remainder).
function divWays(t, d, want) {
  const q = Math.floor(t / d), r = t % d, { lines, used } = chunkLines(t, d), ans = want === 'q' ? q : r, name = want === 'q' ? 'quotient' : 'remainder';
  return [way('Take away chunks of the divisor', [...lines, `The groups add up: ${used.join(' + ')} = ${q}. What is left, ${r}, is less than ${d}, so it cannot make another group.`, `The ${name} is ${b(ans)}.`]),
    way('Check by multiplying', [`${q} × ${d} = ${fmt(q * d)}`, `${fmt(q * d)} + ${r} = ${fmt(t)}`, `That gives back the start, so the ${name} is ${b(ans)}.`])];
}
function ldQ(L, want) {
  const { d, t, q, r } = nums(L), ans = want === 'q' ? q : r;
  return T({ ask: want === 'q' ? 'Divide. Give the quotient (the number of whole groups) and ignore the remainder.' : 'Divide. Give the remainder.', expr: `${fmt(t)} ÷ ${d}`, answer: num(ans), ways: divWays(t, d, want),
    hint: want === 'q' ? `How many groups of ${d} can you take away? Try easy chunks first, like ten groups or twenty groups.` : `Find the whole groups of ${d} first. What is left is the remainder.` }, want === 'q' ? 'ldQ' : 'ldRem', { t, d });
}
// An estimate by compatible numbers: round the divisor to a ten, then pick a dividend that divides evenly.
function estimate(t, d) {
  const dr = Math.round(d / 10) * 10, e0 = t / dr, est = e0 >= 15 ? Math.round(e0 / 10) * 10 : Math.round(e0);
  return { dr, est, tr: est * dr, ok: Math.abs(d - dr) <= 3 && est > 0 && est / (t / d) >= 0.8 && est / (t / d) <= 1.25 };
}
function estNums(L) {
  for (;;) { const n = nums(L), e = estimate(n.t, n.d); if (e.ok && String(e.est).length === String(n.q).length) return { ...n, ...e }; }
}
function ldEst(L) {
  const { t, d, dr, est, tr } = estNums(L), bad = est >= 20 ? [est * 10, est / 10, est / 2] : [est * 10, est * 2, est * 100];
  return T({ ask: `Which is the best estimate for ${fmt(t)} ÷ ${d}?`, answer: choice(fmt(est), bad.map(fmt)),
    ways: [way('Friendly numbers', [`Round ${d} to ${dr}. Pick a number near ${fmt(t)} that ${dr} goes into easily: ${fmt(tr)}.`, `${fmt(tr)} ÷ ${dr} = ${b(fmt(est))}`]),
      way('Check the size', [`${fmt(est)} × ${d} = ${fmt(est * d)}, which is close to ${fmt(t)}.`, `So about ${b(fmt(est))} is a sensible estimate.`])],
    hint: 'Round the divisor to the nearest ten, then pick a dividend close to the real one that it divides evenly.' }, 'ldEst', { t, d });
}
function ldDigits(L) {
  const { t, d, q, est, dr, tr } = estNums(L), digits = String(q).length;
  return T({ ask: `How many digits does the quotient of ${fmt(t)} ÷ ${d} have?`, answer: num(digits),
    ways: [way('Estimate it', [`Round ${d} to ${dr} and pick a friendly number near ${fmt(t)}: ${fmt(tr)} ÷ ${dr} = ${fmt(est)}.`, `${fmt(est)} has ${b(pl(digits, 'digit'))}, so the quotient does too.`]),
      way('Use powers of 10', [`${d} × ${fmt(10 ** (digits - 1))} = ${fmt(d * 10 ** (digits - 1))}, which fits into ${fmt(t)}.`, `${d} × ${fmt(10 ** digits)} = ${fmt(d * 10 ** digits)}, which is too big.`, `So the quotient is at least ${fmt(10 ** (digits - 1))} but less than ${fmt(10 ** digits)}: it has ${b(pl(digits, 'digit'))}.`])],
    hint: 'Estimate the answer first. You do not need to do the whole division.' }, 'ldDigits', { t, d });
}
function ldCheck(rem) {
  const { t, d, q, r } = nums(chance(0.5) ? 1 : 2), full = rem ? t : d * q, good = rem ? `${q} × ${d} + ${r}` : `${q} × ${d}`;
  const opts = rem ? [[good, t], [`${q} × ${d}`, q * d], [`${q} + ${d} + ${r}`, q + d + r], [`${q} × ${d} − ${r}`, q * d - r]] : [[good, full], [`${q} + ${d}`, q + d], [`${full} × ${d}`, full * d], [`${full} − ${d}`, full - d]];
  return T({ ask: `${fmt(full)} ÷ ${d} = ${q}${rem ? ` R ${r}` : ''}. Which calculation checks the answer?`, answer: choice(good, opts.slice(1).map(o => o[0])),
    ways: [way('Multiply back', ['Dividing and multiplying undo each other, so multiplying back should give the number you started with.', `${q} × ${d} = ${fmt(q * d)}`, ...(rem ? [`${fmt(q * d)} + ${r} = ${fmt(t)}`] : []), `So ${b(good)} checks it.`]),
      way('Rule out the others', [...opts.slice(1).map(o => `${o[0]} = ${fmt(o[1])}, which is not ${fmt(full)}`), `Only ${b(good)} gives ${fmt(full)}.`])],
    hint: rem ? 'Multiply the quotient by the divisor, then add what was left over.' : 'Multiplying the quotient by the divisor should give back the number you started with.' }, 'ldCheck', { full, d, q, r, rem });
}
function ldMiss(L) {
  const { d, q, r } = nums(L);
  return T({ ask: `A number is divided by ${d}. The quotient is ${q} and the remainder is ${r}. What is the number?`, answer: num(d * q + r),
    ways: [way('Multiply, then add the remainder', [`${q} groups of ${d}: ${q} × ${d} = ${fmt(q * d)}.`, `Add the ${r} left over: ${fmt(q * d)} + ${r} = ${b(fmt(d * q + r))}`]),
      way('Check by dividing', [`${fmt(d * q + r)} ÷ ${d} gives ${q} groups with ${r} left over.`, `That matches, so the number is ${b(fmt(d * q + r))}.`])],
    hint: 'Undo the division: groups times the size of each group, then add what was left over.' }, 'ldMiss', { d, q, r });
}
const STORIES = [
  { mode: 'up', s: (t, d) => `${k(fmt(t) + ' students')} are going on a trip. Each bus holds ${k(d + ' students')}.`, ask: 'How many buses are needed so that everyone can go?', find: 'The number of buses so that nobody is left behind.', clue: '“needed so everyone can go” means if anyone is left over, round UP.' },
  { mode: 'up', s: (t, d) => `A school orders ${k(fmt(t) + ' chairs')}. A storage rack holds ${k(d + ' chairs')}.`, ask: 'How many racks are needed to store all the chairs?', find: 'The number of racks to hold every chair.', clue: '“all the chairs” means a rack that is only partly full still counts, so round UP.' },
  { mode: 'down', s: (t, d) => `A bakery has ${k(fmt(t) + ' muffins')} and packs them in boxes of ${k(String(d))}.`, ask: 'How many boxes can the bakery fill all the way?', find: 'Only the boxes that are completely full.', clue: '“fill all the way” means leftovers do not count, so use the whole part.' },
  { mode: 'down', s: (t, d) => `A farm packs ${k(fmt(t) + ' eggs')} into trays that each hold ${k(String(d))}.`, ask: 'How many full trays is that?', find: 'Only the trays that are completely full.', clue: '“full trays” means leftovers do not count, so use the whole part.' },
  { mode: 'left', s: (t, d, n) => `${n} has ${k(fmt(t) + ' beads')} and makes bracelets with ${k(d + ' beads')} each.`, ask: 'How many beads are left over after making as many bracelets as possible?', find: 'The beads that are LEFT, not the number of bracelets.', clue: '“left over” means the answer is the remainder.' },
  { mode: 'left', s: (t, d) => `A printer has ${k(fmt(t) + ' sheets')} to put into packs of ${k(String(d))}.`, ask: 'How many sheets are left over when no more full packs can be made?', find: 'The sheets that are left, not the number of packs.', clue: '“left over” means the answer is the remainder.' },
];
// Story source: what to do with the remainder when the divisor has two digits.
export function remWord2(L = 2) {
  const { d, q, r, t } = nums(Math.min(3, Math.max(1, L))), c = pick(STORIES), ans = c.mode === 'up' ? q + 1 : c.mode === 'down' ? q : r;
  const think = c.mode === 'up' ? `The ${r} left over still need a place, so one more is needed: ${q} + 1 = ${b(q + 1)}.` : c.mode === 'down' ? `The ${r} left over cannot fill another one, so the answer is ${b(q)}.` : `The question asks for the leftovers: ${b(r)}.`;
  return T({ story: c.s(t, d, nm()), ask: c.ask, answer: num(ans), op: 'div',
    ways: [way('Divide, then think', [`${fmt(t)} ÷ ${d} gives ${q} with ${r} left over.`, think]),
      way('Check it', [`${q} × ${d} = ${fmt(q * d)}, and ${fmt(q * d)} + ${r} = ${fmt(t)}.`, c.mode === 'up' ? `${q} is not enough because ${r} are left, but ${q + 1} is: ${b(q + 1)}.` : c.mode === 'down' ? `${q} full groups use ${fmt(q * d)}, so the answer is ${b(q)}.` : `${q} groups use ${fmt(q * d)}, so ${fmt(t)} − ${fmt(q * d)} = ${b(r)} are left.`])],
    read: rd(c.find, [`${fmt(t)} in all`, `${d} in each group`], c.clue, `${fmt(t)} ÷ ${d}, then decide what to do with the leftover`), hint: 'Divide first, then ask what the leftover means in this story.' }, 'ldStory', { t, d, mode: c.mode });
}
function ldFrac() {
  const { d, t, q, r } = nums(3), g = gcd(r, d);
  return T({ ask: `Write ${fmt(t)} ÷ ${d} as a mixed number.`, answer: frac(t, d),
    ways: [way('Quotient and remainder', [`${fmt(t)} ÷ ${d} gives ${q} with ${r} left over.`, `The ${r} left over are shared among ${d}: ${F(r, d)}${g > 1 ? ` = ${F(r / g, d / g)}` : ''}.`, `${q} and ${F(r, d)} is ${b(fr(t, d))}`]),
      way('As a fraction', [`${fmt(t)} ÷ ${d} = ${F(t, d)}`, `${F(t, d)} = ${b(fr(t, d))}`])],
    hint: 'Divide first. The remainder goes over the divisor to make the fraction part.' }, 'ldFrac', { t, d });
}
function ldFindDiv() {
  const d = rnd(12, 49), q = rnd(12, 99), t = d * q;
  return T({ ask: 'Which number goes in the box?', expr: `${fmt(t)} ÷ ${BLANK} = ${q}`, answer: num(d),
    ways: [way('Divide the other way', [`If ${fmt(t)} is split into groups of ${BLANK}, there are ${q} groups. So ${q} groups make ${fmt(t)}.`, `${fmt(t)} ÷ ${q} = ${b(d)}`]),
      way('Test it', [`Check: ${b(d)} × ${q} = ${fmt(t)}.`, `So ${b(d)} goes in the box.`])],
    hint: 'The total divided by the quotient gives the size of each group.' }, 'ldFindDiv', { t, q });
}
export function genLongDiv(L) {
  if (L === 1) return pick([() => ldEst(1), () => ldDigits(1), () => ldCheck(false), () => ldQ(1, 'q'), () => ldQ(1, 'r')])();
  if (L === 2) return pick([() => ldQ(2, 'q'), () => ldQ(2, 'r'), () => ldMiss(2), () => remWord2(2), () => ldEst(2), () => ldCheck(true)])();
  return pick([() => ldQ(3, 'q'), ldFrac, ldFindDiv, () => remWord2(3), () => ldMiss(3), () => ldCheck(true)])();
}
