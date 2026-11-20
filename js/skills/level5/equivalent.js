// Equivalent expressions: the distributive property and combining like terms.
import { rnd, pick, chance, gcd, b, way, num, choice, table } from '../../util.js';
import { T, coprime, rndNot } from './helpers.js';

const BLANK = '<span class="blank">?</span>';
const SAME = 'Two expressions are equivalent when they give the same value for every number you put in.';
const area = (a, p, q) => table(['×', p, q], [[a, b(`${a} × ${p}`), b(`${a} × ${q}`)]]);
const testLine = (x, left, right) => `Test with x = ${x}: ${left} and ${right}. Same value.`;

function likeTerms() {
  const a = rnd(2, 9), c = rnd(2, 9), minus = a > c + 1 && chance(0.4), s = minus ? a - c : a + c, op = minus ? '−' : '+';
  return T({ ask: 'What number is missing?', expr: `${a}x ${op} ${c}x = ${BLANK}x`, answer: num(s),
    ways: [way('Count the x’s', [`Think of x as one closed box. ${a}x is ${a} boxes.`, minus ? `Take ${c} boxes away from ${a} boxes: ${a} − ${c} = ${b(s)} boxes.` : `${a} boxes and ${c} more boxes: ${a} + ${c} = ${b(s)} boxes.`, `Whatever is in a box, you have ${s} of them: ${b(s + 'x')}`]),
      way('Test with a number', [SAME, testLine(10, `${a * 10} ${op} ${c * 10} = ${s * 10}`, `${s} × 10 = ${s * 10}`)])],
    hint: `How many x’s are there altogether${minus ? ' after taking some away' : ''}?` }, 'identity', { lhs: `${a}*X${minus ? '-' : '+'}${c}*X`, rhs: 'Q*X' });
}
function distribute(L) {
  const a = rnd(2, 9), k = L === 1 ? 1 : rnd(2, 6), minus = L > 1 && chance(0.35), c = rnd(1, minus ? 2 * k - 1 : 9), op = minus ? '−' : '+', inner = `${k === 1 ? '' : k}x ${op} ${c}`, missCoef = chance(0.5);
  const right = missCoef ? `${BLANK}x ${op} ${a * c}` : `${a * k}x ${op} ${BLANK}`, ans = missCoef ? a * k : a * c;
  return T({ ask: 'What number is missing?', expr: `${a}(${inner}) = ${right}`, answer: num(ans),
    ways: [way('Area picture', [`A rectangle ${a} tall and (${inner}) wide. Split the width into its two parts:`, area(a, k === 1 ? 'x' : k + 'x', c), `The number in front multiplies every term inside the brackets, not just the first.`, `The areas are ${a * k}x and ${a * c}. ${minus ? 'Here the second part is taken away' : 'Add them'}: ${b(`${a * k}x ${op} ${a * c}`)}`]),
      way('Test with a number', [SAME, testLine(2, `${a} × (${k * 2} ${op} ${c}) = ${a * (minus ? k * 2 - c : k * 2 + c)}`, `${a * k} × 2 ${op} ${a * c} = ${minus ? a * k * 2 - a * c : a * k * 2 + a * c}`), `So the missing number is ${b(ans)}.`])],
    hint: `${a} multiplies both parts inside the brackets. What is ${missCoef ? `${a} × ${k === 1 ? 'x' : k + 'x'}` : `${a} × ${c}`}?` }, 'identity', { lhs: `${a}*(${k}*X${minus ? '-' : '+'}${c})`, rhs: missCoef ? `Q*X${minus ? '-' : '+'}${a * c}` : `${a * k}*X${minus ? '-' : '+'}Q` });
}
function factorOut() {
  const g = rnd(2, 9), [p, q] = coprime(1, 7), A = g * p, B = g * q, miss = pick(['g', 'p', 'q']), ans = { g, p, q }[miss], sh = (name, val) => (miss === name ? BLANK : val);
  return T({ ask: miss === 'g' ? 'The greatest common factor is pulled out in front. What number is missing?' : 'What number is missing?', expr: `${A}x + ${B} = ${sh('g', g)}(${sh('p', p === 1 && miss !== 'p' ? '' : p)}x + ${sh('q', q)})`, answer: num(ans),
    ways: [way('Find the common factor', [`${A} and ${B} both divide by ${g} (their greatest common factor).`, `${A}x = ${g} × ${p}x and ${B} = ${g} × ${q}`, `So ${A}x + ${B} = ${g}(${p === 1 ? '' : p}x + ${q}). Missing number: ${b(ans)}`]),
      way('Check by multiplying back', [`Multiply out ${g}(${p === 1 ? '' : p}x + ${q}): ${g} × ${p === 1 ? '' : p}x = ${A}x and ${g} × ${q} = ${B}`, `Factoring is the distributive property run backwards.`, `So the missing number is ${b(ans)}.`])],
    hint: `The number in front, times each term inside, has to rebuild ${A}x and ${B}.` }, 'identity', { lhs: `${A}*X+${B}`, rhs: `${miss === 'g' ? 'Q' : g}*(${miss === 'p' ? 'Q' : p}*X+${miss === 'q' ? 'Q' : q})`, gcfOnly: miss === 'g' });
}
const lin = (a, c) => `${a === 1 ? '' : a}x + ${c}`;
function combine() {
  const a = rnd(2, 8), c = rnd(1, 9), d = rnd(2, 8), e = rndNot(1, 9, [c]), good = lin(a + d, c + e);
  return T({ ask: 'Which expression is equivalent?', expr: `${a}x + ${c} + ${d}x + ${e}`, answer: choice(good, [`${a + c + d + e}x`, lin(a + c, d + e), lin(a * d, c + e), lin(a + d, c * e)]),
    ways: [way('Group the like terms', [`Like terms have the same letter part. The x terms: ${a}x + ${d}x = ${b((a + d) + 'x')}`, `The plain numbers: ${c} + ${e} = ${b(c + e)}`, `x terms and plain numbers cannot be joined (boxes and loose items are different things): ${b(good)}`]),
      way('Test with a number', [SAME, testLine(2, `${a * 2} + ${c} + ${d * 2} + ${e} = ${a * 2 + c + d * 2 + e}`, `${(a + d) * 2} + ${c + e} = ${(a + d) * 2 + c + e}`), `So ${b(good)} is the equivalent expression.`])],
    hint: 'Add the x terms together. Add the plain numbers together. Keep the two kinds apart.' }, 'equivChoice', { js: `${a}*X+${c}+${d}*X+${e}` });
}
function expandCombine() {
  const a = rnd(2, 6), c = rnd(2, 7), d = rnd(2, 8), minus = chance(0.3) && a > d, co = minus ? a - d : a + d, good = lin(co, a * c), op = minus ? '−' : '+';
  return T({ ask: 'Which expression is equivalent?', expr: `${a}(x + ${c}) ${op} ${d}x`, answer: choice(good, [lin(co, c), lin(a * d, a * c), `${co + a * c}x`, lin(a + d + (minus ? 1 : 0), a + c)]),
    ways: [way('Distribute, then combine', [`Multiply out the brackets: ${a}(x + ${c}) = ${a}x + ${a * c}`, `Now ${a}x + ${a * c} ${op} ${d}x. Join the x terms: ${a}x ${op} ${d}x = ${co}x`, `${b(good)}`]),
      way('Test with a number', [SAME, testLine(1, `${a} × ${1 + c} ${op} ${d} = ${a * (1 + c) + (minus ? -d : d)}`, `${co} + ${a * c} = ${co + a * c}`), `So ${b(good)} is the equivalent expression.`])],
    hint: 'Multiply out the brackets first. Then look for like terms.' }, 'equivChoice', { js: `${a}*(X+${c})${minus ? '-' : '+'}${d}*X` });
}
function twoLetters() {
  const a = rnd(2, 7), c = rnd(2, 7), d = rnd(2, 7), e = rndNot(2, 7, [c]), good = `${a + d}x + ${c + e}y`;
  return T({ ask: 'Which expression is equivalent?', expr: `${a}x + ${c}y + ${d}x + ${e}y`, answer: choice(good, [`${a + c + d + e}xy`, `${a + c}x + ${d + e}y`, `${a + d + c + e}x`, `${a * d}x + ${c * e}y`]),
    ways: [way('Group the like terms', [`x terms: ${a}x + ${d}x = ${b((a + d) + 'x')}`, `y terms: ${c}y + ${e}y = ${b((c + e) + 'y')}`, `x and y stand for different numbers, so they stay apart: ${b(good)}`]),
      way('Think of two kinds of things', [`Say x is the price of a ticket and y the price of a snack.`, `${a} tickets, ${c} snacks, ${d} more tickets, ${e} more snacks.`, `That is ${a + d} tickets and ${c + e} snacks: ${b(good)}`])],
    hint: 'Only terms with the same letter can be added together.' }, 'equivChoice', { js: `${a}*X+${c}*Y+${d}*X+${e}*Y` });
}
function notEquivalent() {
  const g = rnd(2, 6), [p, q] = coprime(2, 6), A = g * p, B = g * q, s = rnd(2, A - 2), bad = pick([`${g}(${p}x + ${B})`, `${A + B}x`, `${g}(${A}x + ${q})`]);
  const goods = [`${g}(${p}x + ${q})`, `${s}x + ${A - s}x + ${B}`, `${B} + ${A}x`];
  return T({ ask: `Which expression is ${b('NOT')} equivalent to ${b(lin(A, B))}?`, answer: choice(bad, goods),
    ways: [way('Simplify each choice', [`${goods[0]}: multiply out to get ${g * p}x + ${g * q}`, `${goods[1]}: join the x terms to get ${A}x + ${B}`, `${goods[2]}: the same two terms in a different order`, `${b(bad)} does not turn into ${lin(A, B)}.`]),
      way('Test with a number', [SAME, `Try x = 2. ${lin(A, B)} gives ${2 * A + B}.`, `The three equivalent ones also give ${2 * A + B}. ${b(bad)} gives something else, so it is the odd one out.`])],
    hint: `Multiply out any brackets and collect like terms. Which one does not end up as ${lin(A, B)}?` }, 'equivChoice', { js: `${A}*X+${B}`, not: true });
}
export function genEquiv(L) {
  if (L === 1) return chance(0.5) ? likeTerms() : distribute(1);
  if (L === 2) return pick([() => distribute(2), combine, factorOut])();
  return pick([expandCombine, twoLetters, notEquivalent, factorOut])();
}
