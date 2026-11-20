// Simplifying fractions: dividing top and bottom by a shared factor until nothing is shared.
import { rnd, pick, chance, shuffle, gcd, F, b, way, num, choice } from '../../util.js';
import { BLANK, yesNo, factorsOf, oneOf, listed } from './helpers.js';
import { properTop, reduceWays, smallestShared } from './frac-util.js';

// [simplest bottom range, shared factors to multiply by]
const SHAPE = [{ d: [2, 6], g: [2, 3, 5] }, { d: [2, 9], g: [2, 3, 4, 5, 6, 8, 9, 10] }, { d: [3, 12], g: [4, 6, 7, 8, 9, 12, 15] }];
function reducible(L) {
  for (;;) {
    const s = SHAPE[L - 1], sd = rnd(...s.d), g = pick(s.g), sn = properTop(sd);
    if (sd * g <= 120) return [sn * g, sd * g, g];
  }
}

function oneStep() {
  const [n, d, g] = reducible(1);
  return { ask: `Both numbers can be divided by ${g}. Find the missing top number.`, expr: `${F(n, d)} = ${F(BLANK, d / g)}`, answer: num(n / g), _t: { kind: 'equiv', a: [n, d], bot: d / g },
    ways: reduceWays(n, d), hint: `The bottom was divided by ${g}. Do the same to the top.` };
}
const verdictLine = (n, d) => (gcd(n, d) === 1 ? `Yes, ${F(n, d)} is already in simplest form.` : `No, ${F(n, d)} can still be made simpler.`);
function isSimplest(L) {
  const yes = chance(0.45), [rn, rd] = reducible(L), sd = rnd(4, L === 1 ? 12 : 30), [n, d] = yes ? [properTop(sd), sd] : [rn, rd];
  if (n === 1) return null;
  return { ask: 'Is this fraction in simplest form?', expr: F(n, d), answer: yesNo(gcd(n, d) === 1), choiceBig: true, _t: { kind: 'issimple', n, d }, ways: reduceWays(n, d).map(w => ({ ...w, s: [...w.s, verdictLine(n, d)] })),
    hint: 'Is there a number bigger than 1 that divides both the top and the bottom?' };
}
function missingPart(L) {
  const [n, d, g] = reducible(L), part = pick(['top', 'bot']);
  return { ask: 'Write the fraction in simplest form. Find the missing number.', expr: `${F(n, d)} = ${part === 'top' ? F(BLANK, d / g) : F(n / g, BLANK)}`, answer: num(part === 'top' ? n / g : d / g),
    _t: { kind: 'equiv', a: [n, d], ...(part === 'top' ? { bot: d / g } : { top: n / g }) }, ways: reduceWays(n, d), hint: 'Find the number that both the top and the bottom were divided by.' };
}
function sharedFactor(L) {
  const [n, d, g] = reducible(L);
  return { ask: `What is the biggest number that divides both ${n} and ${d} with nothing left over?`, answer: num(g), _t: { kind: 'gcf', n, d }, hint: 'List the factors of the smaller number, biggest first, and test each one on the other number.',
    ways: [way('Two lists', [`Factors of ${n}: ${factorsOf(n).join(', ')}`, `Factors of ${d}: ${factorsOf(d).join(', ')}`, `The biggest number on both lists is ${b(g)}.`]),
      way('Test the factors of the smaller number', [`Go through the factors of ${n} from the biggest down, and stop at the first one that also divides ${d}.`,
        ...factorsOf(n).reverse().filter(f => f >= g).map(f => `${f}: ${d} ÷ ${f} ${d % f ? `leaves ${d % f} over` : `= ${d / f} exactly`}.`), `The answer is ${b(g)}.`])] };
}

// Wrong choices: stopped too early (still reducible), or subtracted instead of dividing.
function whichSimplest(L) {
  const [n, d, g] = reducible(L), p = smallestShared(n, d), sn = n / g, sd = d / g;
  const early = g > p ? [[n / p, d / p]] : [], slips = [[sn, sd + 1], [sn + 1, sd + 1], [n - p, d - p], [sn + 1, sd + 2], [sn, sd + 2], [sn + 2, sd + 3], [sn + 1, sd + 3]].filter(([x, y]) => x > 0 && gcd(x, y) === 1 && x < y);
  const bad = [...early, ...shuffle(slips)].slice(0, 3);
  if (bad.length < 3) return null;
  const ways = reduceWays(n, d);
  if (early.length) ways.push(way('Watch out', [`${F(...early[0])} is equal to ${F(n, d)}, but it is not finished: ${early[0][0]} and ${early[0][1]} still share a factor.`, `Keep dividing until only 1 is shared: ${b(F(sn, sd))}.`]));
  return { ask: `Which is ${F(n, d)} in simplest form?`, answer: choice(F(sn, sd), bad.map(x => F(...x))), _t: { kind: 'simplest', n, d }, ways, hint: 'Divide the top and bottom by a number they share. Then check: do they still share one?' };
}
function alreadySimplest() {
  const mk = want => { for (;;) { const d = rnd(8, 36), n = rnd(3, d - 1); if ((gcd(n, d) === 1) === want && (want || gcd(n, d) > 2 || chance(0.3))) return [n, d]; } };
  const good = mk(true), bad = [mk(false), mk(false), mk(false)], all = [good, ...bad].map(x => F(...x));
  if (new Set(all).size < 4) return null;
  const verdict = ([n, d]) => (gcd(n, d) > 1 ? `${F(n, d)}: both can be divided by ${smallestShared(n, d)}, so it is not in simplest form.` : `${F(n, d)}: ${n} and ${d} share no factor except 1. It is in simplest form.`);
  const answer = choice(all[0], all.slice(1));
  return { ask: `Which of these fractions is already in simplest form: ${listed(answer)}?`, answer, _t: { kind: 'coprime' }, hint: 'For each one, look for a number that divides both the top and the bottom.',
    ways: [way('Check each choice', [...shuffle([good, ...bad]).map(verdict), `The answer is ${b(all[0])}.`]),
      way('Quick checks', ['Both even? Then 2 divides both.', 'Both end in 0 or 5? Then 5 divides both.', 'Do the digits of each add up to a multiple of 3? Then 3 divides both.', 'If none of those work, test 7 and the other factors of the top number.', `Only ${b(all[0])} has nothing shared.`])] };
}

const MAKERS = [[oneStep, oneStep, isSimplest], [missingPart, whichSimplest, whichSimplest, isSimplest, sharedFactor], [missingPart, whichSimplest, whichSimplest, sharedFactor, alreadySimplest]];
export const genSimplify = L => oneOf(MAKERS[L - 1], L);
