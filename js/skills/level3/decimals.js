// Decimals as tenths and hundredths: linking them to fractions, and comparing them.
import { R, rnd, pick, chance, shuffle, fixed, plain, F, M, b, way, num, choice, fracBar, numberLine, pvChart } from '../../util.js';
import { BLANK, signChoice, signOf, sg, oneOf, listed, tagged } from './helpers.js';
import { hundredGrid } from './visuals.js';

const NAME = { 10: 'tenths', 100: 'hundredths' };
const cnt = (n, d) => `${n} ${n === 1 ? NAME[d].slice(0, -1) : NAME[d]}`;
const pic = (n, d) => (d === 10 ? fracBar(n, 10) : hundredGrid(n));
const chart = (x, dp) => pvChart([{ x, label: '', dp }], { minP: -dp });
const two = h => fixed(h / 100, 2);

// n out of d (10 or 100), with w wholes in front.
function linkWays(w, n, d) {
  const x = R(w + n / d), dp = d === 10 ? 1 : 2, parts = d === 100 && n >= 10 && n % 10 ? `${n} hundredths is ${cnt(Math.floor(n / 10), 10)} and ${cnt(n % 10, 100)}. ` : '';
  const ways = [way('Place value chart', [`The first place after the point is tenths. The second is hundredths.`, chart(x, dp),
    `${parts}${w ? `${w} whole${w > 1 ? 's' : ''} and ` : ''}${cnt(n, d)} is written ${b(fixed(x, dp))}.${d === 100 && n < 10 ? ' The 0 in the tenths place keeps the digit in the hundredths place.' : ''}`])];
  if (!w) ways.push(way('Picture it', [d === 10 ? 'One whole cut into 10 equal strips. Each strip is one tenth, 0.1.' : 'One whole cut into 100 small squares. Each square is one hundredth, 0.01. Each full column is one tenth.', pic(n, d),
    `${n} ${n === 1 ? 'part is' : 'parts are'} shaded: ${F(n, d)} = ${b(fixed(x, dp))}`]));
  else ways.push(way('Wholes, then the part', [`The ${w} goes in front of the point.`, `${F(n, d)} is ${fixed(n / d, dp)}.`, `Together: ${b(fixed(x, dp))}`]));
  return ways;
}
function size(L) {
  if (L === 1) return [chance(0.35) ? rnd(1, 9) : 0, rnd(1, 9), 10];
  if (L === 2) return [0, pick([rnd(1, 9), rnd(1, 9) * 10, rnd(11, 99), rnd(11, 99)]), 100];
  const d = pick([10, 100]); return [rnd(1, 12), rnd(1, d - 1), d];
}

function fracToDec(L) {
  const [w, n, d] = size(L);
  return { ask: 'Write this as a decimal.', expr: M(w, n, d), answer: num(w + n / d), _t: { kind: 'f2d', w, n, d }, ways: linkWays(w, n, d), hint: `The bottom number is ${d}, so the last digit of the decimal sits in the ${NAME[d]} place.` };
}
function shaded(L) {
  const [, n, d] = size(Math.min(L, 2));
  return tagged({ ask: `One whole is cut into ${d} equal parts. What decimal is shaded?`, visual: pic(n, d), answer: num(n / d), _t: { kind: 'f2d', w: 0, n, d }, ways: linkWays(0, n, d).reverse(), hint: `Count the shaded parts. Each one is one of ${d}.` }, { n, d });
}
function decToFrac(L) {
  const [, n, d] = size(Math.min(L, 2)), up = L > 1 && n % 10 === 0, x = R(n / d), text = up ? plain(x) : fixed(x, d === 10 ? 1 : 2);
  return { ask: 'Find the missing top number.', expr: `${text} = ${F(BLANK, d)}`, answer: num(n), _t: { kind: 'd2f', x, d }, hint: `How many ${NAME[d]} is ${text}?`,
    ways: [way('Read the places', [chart(x, d === 10 ? 1 : 2), up ? `${text} is ${cnt(n / 10, 10)}. Each tenth is 10 hundredths, so that is ${n} hundredths.` : `Reading the digits after the point as one number gives ${cnt(n, d)}.`, `${text} = ${b(F(n, d))}`]),
      way('Picture it', [pic(n, d), `${n} of the ${d} parts are shaded, so the top number is ${b(n)}.`])] };
}
function dot(L) {
  const lo = L === 1 ? 0 : rnd(0, 8) / 10, step = L === 1 ? 0.1 : 0.01, i = rnd(1, 9), x = R(lo + i * step), dp = L === 1 ? 1 : 2, hi = R(lo + 10 * step);
  return tagged({ ask: 'What decimal is the dot on?', visual: numberLine(lo, hi, x, { loL: plain(lo), hiL: plain(hi), xL: '?' }), answer: num(x), _t: { kind: 'dot', lo, step, i }, hint: `The gap from ${plain(lo)} to ${plain(hi)} is cut into 10 equal steps. How big is one step?`,
    ways: [way('Count the steps', [`From ${plain(lo)} to ${plain(hi)} there are 10 equal steps, so each step is ${plain(step)}.`, `The dot is ${i} step${i > 1 ? 's' : ''} past ${plain(lo)}: ${plain(lo)} + ${i} × ${plain(step)} = ${b(fixed(x, dp))}`]),
      way('Place value chart', [chart(x, dp), `${i} in the ${NAME[1 / step]} place${lo ? `, after ${plain(lo)}` : ''}: ${b(fixed(x, dp))}`])] }, { lo, i });
}
function tenthsPlus(L) {
  const t = rnd(1, 9), h = L === 2 && chance(0.3) ? 0 : rnd(1, L === 2 ? 9 : 99), total = 10 * t + h, dec = L === 3 && chance(0.6);
  const steps = [`Tenths and hundredths are different sizes, so rename the tenths. Each tenth is 10 hundredths: ${F(t, 10)} = ${F(10 * t, 100)}`, ...(h ? [`${F(10 * t, 100)} + ${F(h, 100)} = ${F(total, 100)}`] : [])];
  const left = h ? `${F(t, 10)} + ${F(h, 100)}` : F(t, 10);
  return { ask: dec ? 'Add. Write the answer as a decimal.' : 'Find the missing top number.', expr: dec ? left : `${left} = ${F(BLANK, 100)}`, answer: num(dec ? total / 100 : total), _t: { kind: 'tenhund', t, h, dec },
    hint: 'One tenth is the same as 10 hundredths.',
    ways: [way('Rename the tenths', [...steps, dec ? `${total} hundredths as a decimal is ${b(two(total))}.` : `The top number is ${b(total)}.`]),
      total < 100 ? way('Picture it', [`${t} full column${t > 1 ? 's' : ''} (tenths)${h ? ` and ${h} more small square${h > 1 ? 's' : ''} (hundredths)` : ''}:`, hundredGrid(total), `${total} small squares are shaded: ${b(dec ? two(total) : F(total, 100))}`])
        : way('Use decimals', [`${F(t, 10)} = ${fixed(t / 10, 2)} and ${F(h, 100)} = ${two(h)}`, `${fixed(t / 10, 2)} + ${two(h)} = ${b(two(total))}`])] };
}

// Both numbers are kept as whole hundredths (A, C) so comparing is exact. sa and sc are how they are shown.
function cmpWays(A, C, sa, sc) {
  const s = signOf(A - C), pad = [[sa, A], [sc, C]].filter(([shown, v]) => String(shown) !== two(v)).map(([shown, v]) => `${shown} = ${two(v)}`);
  const ways = [way('Give both two places', [pad.length ? `Write both with two digits after the point. A 0 on the end does not change the value: ${pad.join(' and ')}.` : 'Both numbers already have two digits after the point, so they are ready to compare.',
    `Now compare them as hundredths: ${A} hundredths and ${C} hundredths.`, `${A} ${sg(s)} ${C}, so ${sa} ${b(sg(s))} ${sc}.`]),
  way('Compare place by place', [pvChart([{ x: A / 100, label: 'left', dp: 2 }, { x: C / 100, label: 'right', dp: 2 }], { minP: -2 }), 'Start at the left. The first place where the digits differ decides it.', `${sa} ${b(sg(s))} ${sc}`])];
  if (A < 100 && C < 100) ways.push(way('Picture it', [hundredGrid(A), hundredGrid(C), s === '=' ? 'The same amount is shaded.' : `More is shaded for ${A > C ? sa : sc}.`]));
  return ways;
}
function compare(L) {
  const w = chance(0.3) ? rnd(1, 9) * 100 : 0, t = rnd(1, 9);
  const [A, C] = L === 2 ? [w + rnd(1, 99), w + rnd(1, 99)] : [w + 10 * t, w + pick([10 * t, t, 10 * t + rnd(1, 9), 10 * t - rnd(1, 9), rnd(1, 99)])];
  const sa = L === 2 ? two(A) : plain(A / 100), sc = two(C), flip = chance(0.5), [x, y, sx, sy] = flip ? [C, A, sc, sa] : [A, C, sa, sc];
  if (L === 2 && A === C) return null;
  return { ask: 'Which sign makes it true?', expr: `${sx} ${BLANK} ${sy}`, answer: signChoice(x - y), choiceBig: true, _t: { kind: 'dcmp', a: sx, c: sy }, ways: cmpWays(x, y, sx, sy),
    hint: 'Give both numbers two digits after the point, then compare.' };
}
function extreme() {
  const t = rnd(2, 8), set = shuffle([[10 * t, plain(t / 10)], [10 * t + rnd(1, 9), null], [t, null], [10 * t - rnd(1, 9), null], [10 * (t + 1), plain((t + 1) / 10)]]).slice(0, 4).map(([h, s]) => [h, s ?? two(h)]);
  const which = pick(['greatest', 'least']), sorted = set.slice().sort((p, q) => q[0] - p[0]), best = which === 'greatest' ? sorted[0] : sorted[3];
  const answer = choice(best[1], set.filter(p => p !== best).map(p => p[1]));
  return { ask: `Which decimal is the ${which}: ${listed(answer)}?`, answer, _t: { kind: 'dextreme', which }, hint: 'A longer decimal is not always bigger. Give them all two places first.',
    ways: [way('Give them all two places', [set.map(([h, s]) => `${s} = ${two(h)}`).join(', '), `As hundredths, from greatest to least: ${sorted.map(p => p[0]).join(', ')}.`, `The ${which} is ${b(best[1])}.`]),
      way('Think of money', [set.map(([h, s]) => `${s} is like $${two(h)}`).join(', ') + '.', `The ${which === 'greatest' ? 'most' : 'least'} money is $${two(best[0])}, so the answer is ${b(best[1])}.`])] };
}
function coins() {
  const t = rnd(1, 9), h = rnd(1, 9), total = 10 * t + h;
  return { ask: `A dime is one tenth of a dollar and a penny is one hundredth. What part of a dollar is ${t} dime${t > 1 ? 's' : ''} and ${h} ${h > 1 ? 'pennies' : 'penny'}? Write a decimal.`, answer: num(total / 100), _t: { kind: 'tenhund', t, h, dec: true },
    hint: 'How many pennies is each dime worth?',
    ways: [way('Tenths and hundredths', [`${t} dime${t > 1 ? 's' : ''} is ${F(t, 10)} of a dollar, and ${h} ${h > 1 ? 'pennies' : 'penny'} is ${F(h, 100)}.`, `${F(t, 10)} = ${F(10 * t, 100)}, so together that is ${F(total, 100)}.`, `As a decimal: ${b(two(total))}`]),
      way('Count it in cents', [`${t} dime${t > 1 ? 's' : ''} is ${10 * t} cents. Add ${h}: ${total} cents.`, `${total} cents out of 100 is $${two(total)}, which is ${b(two(total))} of a dollar.`])] };
}

const MAKERS = [[fracToDec, shaded, decToFrac, dot], [fracToDec, shaded, decToFrac, dot, tenthsPlus, compare, compare], [fracToDec, compare, compare, extreme, extreme, tenthsPlus, coins]];
export const genDec = L => oneOf(MAKERS[L - 1], L);
