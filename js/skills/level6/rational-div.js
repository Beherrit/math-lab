// Dividing integers, the three places a minus sign can sit in a fraction, dividing by zero, and decimals that stop or repeat.
import { R, rnd, pick, chance, gcd, simp, fmt, F, b, way, nm, num, frac, choice, shuffle } from '../../util.js';
import { nz, par, size, snum, tag } from './helpers.js';
import { genDecimals } from './rational-decimals.js';

const CHG = [
  { s: (T, n, up) => `The temperature ${up ? 'rose' : 'fell'} a total of ${T} degrees over ${n} hours.`, ask: 'What was the change each hour, in degrees? Use a minus sign for a fall.' },
  { s: (T, n, up, who) => `${who}'s account ${up ? 'gained' : 'lost'} ${T} dollars over ${n} days.`, ask: 'What was the change each day, in dollars? Use a minus sign for a loss.' },
  { s: (T, n, up) => `A diver swam ${up ? 'up' : 'down'} ${T} metres in ${n} minutes.`, ask: 'What was the change in height each minute, in metres? Up is positive, down is negative.' },
  { s: (T, n, up, who) => `${who}'s score ${up ? 'rose' : 'dropped'} by ${T} points over ${n} rounds.`, ask: 'What was the change each round, in points? Use a minus sign for a drop.' },
];
function changeRate(L) {
  const q = rnd(2, L === 1 ? 6 : 9), n = rnd(2, L === 1 ? 6 : 9), T = q * n, up = chance(L === 1 ? 0.3 : 0.5), c = pick(CHG), who = nm(), a = up ? T : -T, ans = up ? q : -q;
  return tag({ story: c.s(T, n, up, who), ask: c.ask, answer: snum(ans),
    ways: [way('Size first, then the sign', [`The total change is ${up ? '' : '−'}${T} spread over ${n}. Sizes: ${T} ÷ ${n} = ${q}.`, up ? 'Positive ÷ positive is positive.' : 'A negative total shared out gives a negative amount each time (different signs).', `${b(fmt(ans))} each time.`]),
      way('Check by multiplying back', [`${n} changes of ${par(ans)} each add up to ${n} × ${par(ans)} = ${fmt(a)}.`, `That is the total in the story, so ${b(fmt(ans))} is right.`])],
    hint: 'Divide the total change by the number of hours, days or rounds. Is the total going up or down?' }, { kind: 'quot', shape: 'rate', a, c: n });
}
// Three forms that all mean the same value, and three that do not.
const same = (p, q) => [`−(${p} ÷ ${q})`, `(−${p}) ÷ ${q}`, `${p} ÷ (−${q})`], other = (p, q) => [`(−${p}) ÷ (−${q})`, `${q} ÷ (−${p})`, `${q} ÷ ${p}`];
function signFrac(L) {
  for (;;) {
    const q = pick(L === 1 ? [2, 3, 4, 5, 8] : [3, 4, 5, 6, 7, 8, 9]), p = rnd(L === 1 ? 1 : 2, q + (L === 1 ? -1 : 4));
    if (p === q || gcd(p, q) > 1 && L === 1) continue;
    const [given, ...rest] = shuffle(same(p, q)), right = rest[0], bad = other(p, q);
    return tag({ ask: 'Which expression has the same value as this one?', expr: given, answer: choice(right, bad),
      ways: [way('Same signs or different signs?', [`${given} is negative. A division with different signs is negative: the minus can sit in front of the whole fraction, on the top, or on the bottom.`, `${b(right)} has one minus sign, so it is negative too. The choices with two minus signs, or with the numbers swapped, are different values.`]),
        way('Multiply back', [`Multiply each by ${q} to undo the division.`, `(${right}) × ${q} = −${p}, and (${given}) × ${q} is also −${p}. Same value.`])],
      hint: 'Count the minus signs. One minus sign in a division makes the answer negative, wherever it sits. Two make it positive.' }, { kind: 'signfrac', shape: 'signfrac', p, q });
  }
}
function divZero() {
  const N = pick([3, 5, 7, 9, 12, 15]);
  return tag({ ask: `What is ${N} ÷ 0?`, answer: choice('It has no answer (dividing by 0 is not allowed)', ['0', `${N}`, 'A very big number']),
    ways: [way('Undo it with multiplying', [`${N} ÷ 0 = ? would mean ? × 0 = ${N}.`, `Anything times 0 is 0, never ${N}. So no number works: it has no answer.`]),
      way('Share it out', [`${N} cookies shared between 0 friends: nobody gets any, and the sharing never happens.`, 'Division by 0 has no meaning, so it is not allowed.'])],
    hint: 'Division asks "what times the bottom number makes the top number?" Try it with 0.' }, { kind: 'fixed', shape: 'divzero', N });
}
function zeroOver() {
  const N = pick([2, 3, 4, 5, 6, 7, 8, 9]);
  return tag({ ask: `What is 0 ÷ ${N}?`, answer: num(0),
    ways: [way('Undo it with multiplying', [`0 ÷ ${N} = ? means ? × ${N} = 0.`, `Only 0 times ${N} is 0, so the answer is ${b(0)}.`]), way('Share it out', [`0 cookies shared between ${N} friends: each gets none.`, `So ${b(0)} each. (This is fine. It is dividing BY 0 that is not allowed.)`])],
    hint: 'Zero things shared between some friends. How many does each get?' }, { kind: 'quot', shape: 'zeroover', a: 0, c: N });
}
function intFraction() {
  for (;;) {
    const a = nz(-20, 20), c = nz(-15, 15);
    if (Math.abs(c) === 1 || a % c === 0 || gcd(a, c) === 1) continue;
    const [n, d] = simp(a, c), negs = (a < 0) !== (c < 0);
    return tag({ ask: 'Write the answer as a fraction in simplest form.', expr: `${fmt(a)} ÷ ${par(c)}`, answer: frac(a, c, { signed: true }),
      ways: [way('Sign first, then simplify', [negs ? 'The signs are different, so the answer is negative.' : 'The signs are the same, so the answer is positive.', `${size(a)} ÷ ${size(c)} = ${F(size(a), size(c))}. Divide top and bottom by ${gcd(a, c)}: ${F(Math.abs(n), Math.abs(d))}.`, `Answer: ${b((negs ? '−' : '') + `${Math.abs(n)}/${Math.abs(d)}`)}`]),
        way('Check with decimals', [`${fmt(a)} ÷ ${par(c)} is about ${fmt(+(a / c).toFixed(2))}.`, `${negs ? '−' : ''}${Math.abs(n)}/${Math.abs(d)} is about ${fmt(+(a / c).toFixed(2))} too.`])],
      hint: 'A division of two whole numbers can be written as a fraction. Decide the sign, then divide top and bottom by the same number.' }, { kind: 'fquot', shape: 'intfrac', a: [a, 1], c: [c, 1] });
  }
}
function chain() {
  const q = rnd(2, 8), b2 = pick([2, 3, 4, 5, 6]), c2 = pick([2, 3, 4]), sg = [chance(0.5) ? -1 : 1, chance(0.5) ? -1 : 1, chance(0.5) ? -1 : 1];
  const a = sg[0] * q * b2 * c2, d1 = sg[1] * b2, d2 = sg[2] * c2, ans = a / d1 / d2, negs = sg.filter(s => s < 0).length;
  return tag({ ask: 'Work this out from left to right.', expr: `${fmt(a)} ÷ ${par(d1)} ÷ ${par(d2)}`, answer: snum(ans),
    ways: [way('Left to right', [`${fmt(a)} ÷ ${par(d1)} = ${fmt(a / d1)}.`, `${fmt(a / d1)} ÷ ${par(d2)} = ${b(fmt(ans))}`]),
      way('Count the minus signs', [`Sizes: ${size(a)} ÷ ${size(d1)} ÷ ${size(d2)} = ${q}.`, `There ${negs === 1 ? 'is 1 minus sign' : `are ${negs} minus signs`}. An odd number of them gives a negative answer, an even number gives a positive one.`, `${b(fmt(ans))}`])],
    hint: 'Do the first division, then divide that answer by the next number. Take care with each sign.' }, { kind: 'chaindiv', shape: 'chain', xs: [a, d1, d2] });
}
function meanChange() {
  for (;;) {
    const n = pick([4, 5]), xs = Array.from({ length: n }, () => nz(-9, 9)), s = xs.reduce((u, v) => u + v, 0);
    if (s % n !== 0 || s === 0) continue;
    const c = pick([['degrees', 'temperature', 'hours'], ['dollars', "account balance", 'days'], ['points', 'score', 'rounds']]);
    return tag({ story: `Over ${n} ${c[2]}, the ${c[1]} changed by these amounts, in ${c[0]}: ${xs.map(fmt).join(', ')}.`, ask: `What was the mean change per ${c[2].slice(0, -1)}?`, answer: snum(s / n), op: 'multi',
      ways: [way('Add, then share equally', [`Total change: ${xs.map(par).join(' + ')} = ${fmt(s)}.`, `Shared over ${n}: ${fmt(s)} ÷ ${n} = ${b(fmt(s / n))}`]), way('Check by multiplying back', [`${n} changes of ${par(s / n)} give ${n} × ${par(s / n)} = ${fmt(s)}, the same total.`, `So the mean change is ${b(fmt(s / n))}.`])],
      hint: 'Add all the changes first, keeping their signs. Then divide by how many there were.' }, { kind: 'mean', shape: 'meanchg', xs, n });
  }
}
export function genRatDiv(L) {
  const r = Math.random();
  if (L === 1) return r < 0.3 ? signFrac(1) : r < 0.55 ? changeRate(1) : r < 0.75 ? divZero() : genDecimals(1);
  if (L === 2) return r < 0.25 ? signFrac(2) : r < 0.45 ? intFraction() : r < 0.6 ? zeroOver() : genDecimals(2);
  return r < 0.25 ? chain() : r < 0.4 ? meanChange() : r < 0.5 ? changeRate(3) : genDecimals(3);
}
