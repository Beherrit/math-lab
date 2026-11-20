// Tenths and hundredths together: 3/10 = 30/100, adding the two as fractions, and writing the sum as a decimal.
import { rnd, pick, chance, shuffle, fixed, F, M, b, k, way, nm, num, frac, choice } from '../../util.js';
import { BLANK, oneOf, plural, tagged } from './helpers.js';
import { hundredGrid } from './visuals.js';

const two = h => fixed(h / 100, 2);
// A total in hundredths as a fraction over 100, a mixed number when it passes 1 whole.
const hund = n => (n === 100 ? '1' : n > 100 ? M(1, n - 100, 100) : F(n, 100));
const renamed = t => `One tenth is 10 hundredths, so ${F(t, 10)} = ${F(10 * t, 100)}.`;

function tenToHundred() {
  const t = rnd(1, 9);
  return { ask: 'Find the missing top number.', expr: `${F(t, 10)} = ${F(BLANK, 100)}`, answer: num(10 * t), _t: { kind: 'thup', t }, hint: 'Cut every tenth into 10 equal smaller pieces. How many pieces is that in all?',
    ways: [way('Rename the tenths', [renamed(t), `The missing top number is ${b(10 * t)}.`]), way('Picture it', [hundredGrid(10 * t), `${plural(t, 'full column')} of the grid is ${F(t, 10)}. Each column has 10 squares, so ${t} × 10 = ${b(10 * t)} squares of 100.`])] };
}
function hundredToTen() {
  const t = rnd(1, 9);
  return { ask: 'Find the missing top number.', expr: `${F(10 * t, 100)} = ${F(BLANK, 10)}`, answer: num(t), _t: { kind: 'thdown', n: 10 * t }, hint: 'Group the hundredths into tens. Each group of 10 hundredths is one tenth.',
    ways: [way('Group in tens', [`10 hundredths make 1 tenth. ${10 * t} hundredths is ${10 * t} ÷ 10 = ${b(t)} tenths.`]), way('Picture it', [hundredGrid(10 * t), `${10 * t} shaded squares fill ${plural(t, 'full column')}, and each column is one tenth.`, `So ${F(10 * t, 100)} = ${F(t, 10)}: the missing number is ${b(t)}.`])] };
}
function gridCount(L) {
  const t = rnd(1, 9), h = L === 1 ? 0 : rnd(1, 9), total = 10 * t + h;
  return tagged({ ask: `A grid has 100 squares. ${plural(t, 'full column')} ${h ? `and ${plural(h, 'more square')} are` : `${t > 1 ? 'are' : 'is'}`} shaded. How many hundredths of the grid are shaded?`, visual: hundredGrid(total), answer: num(total), _t: { kind: 'tenhund', t, h, dec: false },
    hint: 'Each full column is one tenth. How many squares is that?', ways: [way('Count the squares', [hundredGrid(total), `${plural(t, 'column')} of 10 squares is ${10 * t} squares.${h ? ` Add the ${h} extra: ${10 * t} + ${h} = ${total}.` : ''}`, `${b(total)} hundredths are shaded.`]),
      way('Tenths and hundredths', [`${F(t, 10)}${h ? ` + ${F(h, 100)}` : ''}: ${renamed(t)}`, `${h ? `${F(10 * t, 100)} + ${F(h, 100)} = ` : ''}${F(total, 100)}, so ${b(total)} hundredths are shaded.`])] }, { t, h });
}
function whichEqual() {
  const t = rnd(1, 9), answer = choice(F(10 * t, 100), [F(t, 100), F(10 * t, 10), F(t + 10, 100)]);
  return { ask: `Which fraction is equal to ${F(t, 10)}?`, answer, _t: { kind: 'whicheq', n: t, d: 10, not: false }, hint: 'Rename tenths as hundredths: each tenth is the same as 10 hundredths.',
    ways: [way('Rename the tenths', [renamed(t), `The matching choice is ${b(F(10 * t, 100))}.`]), way('Compare with a grid', [hundredGrid(10 * t), `${t} columns of the grid are shaded, which is ${10 * t} squares out of 100: ${b(F(10 * t, 100))}.`])] };
}
// The sum of tenths and hundredths. Shown as a fraction, a decimal, a decimal to choose, or the missing top.
function parts(L) { const t = rnd(1, 9), h = L === 2 ? rnd(1, 9) : rnd(1, 99); return { t, h, total: 10 * t + h }; }
function sumWays({ t, h, total }, as) {
  const last = as === 'dec' ? `${F(total, 100)} as a decimal is ${b(two(total))}.` : as === 'top' ? `The missing top number is ${b(total)}.` : `Answer: ${b(hund(total))}`;
  return [way('Rename the tenths', [renamed(t), `${F(10 * t, 100)} + ${F(h, 100)} = ${F(total, 100)}`, last]),
    total < 100 ? way('Picture it', [`${plural(t, 'full column')} for the tenths, then ${plural(h, 'more square')}:`, hundredGrid(total), `${total} squares are shaded, which is ${F(total, 100)} or ${two(total)}.`])
      : way('Use decimals', [`${F(t, 10)} = ${fixed(t / 10, 2)} and ${F(h, 100)} = ${two(h)}.`, `${fixed(t / 10, 2)} + ${two(h)} = ${b(two(total))}`])];
}
function sumFraction(L) {
  const p = parts(L === 1 ? 2 : L);
  return { ask: 'Add. Write the answer as a fraction with 100 on the bottom.', expr: `${F(p.t, 10)} + ${F(p.h, 100)}`, answer: frac(p.total, 100), _t: { kind: 'thsum', t: p.t, h: p.h }, hint: 'The pieces are different sizes. Rename the tenths first.', ways: sumWays(p, 'frac') };
}
function sumDecimal(L) {
  const p = parts(L);
  return { ask: 'Add. Write the answer as a decimal.', expr: chance(0.3) ? `${F(p.h, 100)} + ${F(p.t, 10)}` : `${F(p.t, 10)} + ${F(p.h, 100)}`, answer: num(p.total / 100), _t: { kind: 'tenhund', t: p.t, h: p.h, dec: true }, hint: 'Rename the tenths as hundredths first. Then the answer is a decimal with two places.', ways: sumWays(p, 'dec') };
}
function sumTop() {
  const p = parts(3);
  return { ask: 'Find the missing top number.', expr: `${F(p.t, 10)} + ${F(p.h, 100)} = ${F(BLANK, 100)}`, answer: num(p.total), _t: { kind: 'tenhund', t: p.t, h: p.h, dec: false }, hint: 'Rename the tenths as hundredths, then add the tops.', ways: sumWays(p, 'top') };
}
function pickDecimal(L) {
  const p = parts(L === 1 ? 2 : L), good = two(p.total), swap = two(10 * p.h % 100 + (p.t % 10)), tiny = fixed(p.t / 10 + p.h / 1000, 3), other = two(p.t + p.h);
  return { ask: `Which decimal is equal to ${F(p.t, 10)} + ${F(p.h, 100)}?`, answer: choice(good, shuffle([swap, tiny, other]).filter(x => x !== good)), _t: { kind: 'thdecpick', t: p.t, h: p.h }, hint: 'Write the total as hundredths first, then as a decimal.', ways: sumWays(p, 'dec') };
}
function coins(L) {
  const t = rnd(1, 9), h = rnd(L === 3 ? 5 : 1, L === 3 ? 40 : 9), total = 10 * t + h;
  return { ask: `A dime is ${F(1, 10)} of a dollar and a penny is ${F(1, 100)}. How many dollars is ${plural(t, 'dime')} and ${plural(h, 'penny', 'pennies')}? Write a decimal.`, answer: num(total / 100), _t: { kind: 'tenhund', t, h, dec: true },
    hint: 'How many pennies is each dime worth?', ways: [way('Tenths and hundredths', [`${plural(t, 'dime')} is ${F(t, 10)} of a dollar, and ${plural(h, 'penny', 'pennies')} is ${F(h, 100)}.`, renamed(t), `${F(10 * t, 100)} + ${F(h, 100)} = ${F(total, 100)}, which is ${b(two(total))} dollars.`]),
      way('Count the cents', [`${plural(t, 'dime')} is ${10 * t} cents. Add ${h}: ${total} cents.`, `${total} cents out of 100 is ${b(two(total))} of a dollar.`])] };
}

// A decimal broken into tenths and hundredths.
function splitDecimal() {
  const t = rnd(1, 9), h = rnd(1, 9), total = 10 * t + h, x = total / 100;
  return { ask: 'Find the missing top number.', expr: `${two(total)} = ${F(BLANK, 10)} + ${F(h, 100)}`, answer: num(t), _t: { kind: 'thsplit', x, h }, hint: 'Which digit of the decimal sits in the tenths place?',
    ways: [way('Read the places', [`${two(total)}: the first digit after the point, ${t}, is in the tenths place. The second, ${h}, is in the hundredths place.`, `So ${two(total)} = ${F(t, 10)} + ${F(h, 100)}. The missing number is ${b(t)}.`]),
      way('Use hundredths', [`${two(total)} = ${F(total, 100)} = ${F(10 * t, 100)} + ${F(h, 100)}.`, `${F(10 * t, 100)} is ${F(t, 10)}, so the missing number is ${b(t)}.`])] };
}

const JARS = [(n, d, p) => `${n} empties a coin jar and finds ${k(d)} and ${k(p)}.`, (n, d, p) => `A snack machine gives ${n} back ${k(d)} and ${k(p)} as change.`, (n, d, p) => `${n} counts the tips from a lemonade stand: ${k(d)} and ${k(p)}.`];
// Dimes and pennies as a part of a dollar: rename the tenths, add the hundredths, write a decimal.
export function moneyWord(L) {
  const t = rnd(1, 9), h = rnd(1, L === 1 ? 9 : L === 2 ? 25 : 45), total = 10 * t + h, who = nm();
  return { story: pick(JARS)(who, plural(t, 'dime'), plural(h, 'penny', 'pennies')), ask: 'How many dollars is that? Write a decimal.', answer: num(total / 100), op: 'multi', _t: { kind: 'tenhund', t, h, dec: true }, hint: 'A dime is one tenth of a dollar. How many pennies is that?',
    ways: sumWays({ t, h, total }, 'dec'), read: { find: 'The money as part of a dollar, written as a decimal.', know: [`${plural(t, 'dime')}, each one tenth of a dollar`, `${plural(h, 'penny', 'pennies')}, each one hundredth`], clue: 'Dimes are tenths and pennies are hundredths. Rename the tenths as hundredths, then add.', plan: `${F(t, 10)} + ${F(h, 100)}` } };
}

const MAKERS = [[tenToHundred, gridCount, whichEqual, hundredToTen, tenToHundred], [tenToHundred, hundredToTen, sumFraction, sumDecimal, coins, pickDecimal, gridCount], [sumFraction, sumDecimal, sumDecimal, sumTop, pickDecimal, coins, splitDecimal]];
export const genTenHund = L => oneOf(MAKERS[L - 1], L);
