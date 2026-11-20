// Scientific notation: reading, writing and comparing.
import { rnd, pick, chance, shuffle, b, way, pow, fmt, num, choice } from '../../util.js';
import { blank, fixedChoice } from './h.js';

// A coefficient is kept as whole digits d with p decimal places (45, 1 means 4.5) so every string is exact.
export const coefTxt = (d, p) => { const s = String(d); return p ? `${s.slice(0, -p)}.${s.slice(-p)}` : s; };
// d / 10^p × 10^e as an exact everyday number, with thousands separators.
export function standard(d, p, e) {
  const s = e - p;
  if (s >= 0) return Number(String(d) + '0'.repeat(s)).toLocaleString('en-US');
  const digits = String(d).padStart(1 - s, '0');
  const fp = digits.slice(s).replace(/0+$/, '');
  return Number(digits.slice(0, s)).toLocaleString('en-US') + (fp ? '.' + fp : '');
}
export const valueOf = (d, p, e) => Number(standard(d, p, e).replace(/,/g, ''));
export const sci = (d, p, e) => `${coefTxt(d, p)} × ${pow(10, fmt(e))}`;
const coef = L => (L === 1 && chance(0.4) ? [rnd(1, 9), 0] : chance(L === 3 ? 0.4 : 0) ? [pick([125, 205, 314, 472, 608, 735, 981]), 2] : [pick([12, 15, 18, 23, 25, 32, 36, 41, 45, 52, 57, 64, 68, 73, 75, 81, 86, 94, 99]), 1]);
const expo = L => (L === 1 ? rnd(2, 6) : chance(0.5) ? rnd(2, 7) : -rnd(1, 5));
const places = e => `${Math.abs(e)} ${Math.abs(e) === 1 ? 'place' : 'places'}`;
const dir = e => (e > 0 ? 'bigger' : 'smaller');
function toStandard(d, p, e) {
  const c = coefTxt(d, p), out = standard(d, p, e);
  return { ask: 'Write this as an everyday number.', expr: `${sci(d, p, e)} = ${blank}`, answer: num(valueOf(d, p, e)), hint: `Each power of 10 moves every digit one place. Which way does ${pow(10, fmt(e))} move them?`, _t: { k: 'sci', d, p, e, ask: 'std' },
    ways: [way('Move the digits', [`${pow(10, fmt(e))} means ${e > 0 ? 'multiply' : 'divide'} by 10, ${Math.abs(e)} ${Math.abs(e) === 1 ? 'time' : 'times'}.`, `Each one moves every digit one place and makes the number 10 times ${dir(e)}.`, `Move the digits of ${c} by ${places(e)}: ${b(out)}.`]),
      way('Multiply it out', [e > 0 ? `${pow(10, e)} = ${fmt(10 ** e)}` : `${pow(10, fmt(e))} = ${standard(1, 0, e)}`, `${c} × ${e > 0 ? fmt(10 ** e) : standard(1, 0, e)} = ${b(out)}`])] };
}
function findExp(d, p, e) {
  const c = coefTxt(d, p), out = standard(d, p, e);
  return { ask: 'What exponent goes on the 10?', expr: `${out} = ${c} × ${pow(10, blank)}`, exprSmall: true, answer: num(e, { signed: true }), hint: `How many places do the digits move to get from ${c} to ${out}?`, _t: { k: 'sci', d, p, e, ask: 'exp' },
    ways: [way('Count the places', [`Start from ${c}. To reach ${out}, every digit moves ${places(e)} to the ${e > 0 ? 'left (the number gets bigger)' : 'right (the number gets smaller)'}.`, `${e > 0 ? 'Bigger' : 'Smaller'} means a ${e > 0 ? 'positive' : 'negative'} exponent: ${b(fmt(e))}.`]),
      way('Check by multiplying back', [`${c} × ${pow(10, fmt(e))} = ${c} ${e > 0 ? '×' : '÷'} ${fmt(10 ** Math.abs(e))} = ${out}.`, `It matches, so the exponent is ${b(fmt(e))}.`])] };
}
function findCoef(d, p, e) {
  const c = coefTxt(d, p), out = standard(d, p, e);
  return { ask: 'What number goes in front?', expr: `${out} = ${blank} × ${pow(10, fmt(e))}`, exprSmall: true, answer: num(Number(c)), hint: 'The number in front has exactly one digit that is not zero before the point.', _t: { k: 'sci', d, p, e, ask: 'coef' },
    ways: [way('Undo the power of 10', [`${pow(10, fmt(e))} made the number 10 times ${dir(e)}, ${Math.abs(e)} ${Math.abs(e) === 1 ? 'time' : 'times'}.`, `Undo it: move the digits of ${out} back ${places(e)}. That gives ${b(c)}.`]),
      way('Use the rule for the front number', ['The front number is at least 1 and less than 10.', `Use the digits of ${out} and put the point after the first digit that is not zero: ${b(c)}.`])] };
}
function properForm(d, p, e) {
  const right = sci(d, p, e), c = coefTxt(d, p);
  const front = k => String(Number(coefTxt(d * k, p + 1)));
  const tenth = `${front(1)} × ${pow(10, fmt(e + 1))}`, ten = `${front(100)} × ${pow(10, fmt(e - 1))}`;
  return { ask: `All of these are worth ${standard(d, p, e)}. Which one is in scientific notation?`, answer: choice(right, [ten, tenth, `${front(1000)} × ${pow(10, fmt(e - 2))}`]), hint: 'Look at the number in front. Is it at least 1 and less than 10?', _t: { k: 'sci', d, p, e, ask: 'form' },
    ways: [way('Check the front number', ['Scientific notation has one job: a front number from 1 up to (not including) 10, times a power of 10.', `${b(c)} is between 1 and 10, so ${b(right)} is the one.`]),
      way('Why the others miss', [`${ten} has a front number of 10 or more.`, `${tenth} has a front number less than 1.`, 'They have the same value, but they are not in the agreed form.'])] };
}
const distinct = () => { const a = rnd(11, 99), c = rnd(11, 99); return a % 10 && c % 10 && a !== c ? [a, c] : distinct(); };
function compare(n) {
  const base = chance(0.5) ? rnd(3, 7) : -rnd(2, 6);
  const [a, c] = distinct();
  const items = shuffle(n === 2 ? (chance(0.3) ? [[a, 1, base], [c, 1, base]] : [[Math.max(a, c), 1, base], [Math.min(a, c), 1, base + 1]])
    : [[a, 1, base], [c, 1, base + 1], [rnd(11, 99), 1, base - 1], [a, 1, base + 2]]);
  if (new Set(items.map(i => i.join())).size < items.length) return null;
  const want = chance(0.7) ? 'max' : 'min', vals = items.map(i => valueOf(...i)), best = want === 'max' ? Math.max(...vals) : Math.min(...vals);
  const all = items.map(i => sci(...i)), win = all[vals.indexOf(best)], topE = want === 'max' ? Math.max(...items.map(i => i[2])) : Math.min(...items.map(i => i[2]));
  return { ask: `Which number is ${want === 'max' ? 'greatest' : 'least'}?`, answer: fixedChoice(win, all), hint: 'Compare the exponents first. They tell you the size.', _t: { k: 'scicmp', items, want },
    ways: [way('Exponent first', ['The power of 10 sets the size of the number, so compare exponents before anything else.', `The ${want === 'max' ? 'greatest' : 'least'} exponent here is ${fmt(topE)}.`, `If two numbers share that exponent, compare their front numbers. The answer is ${b(win)}.`]),
      way('Write them out', [...items.map(i => `${sci(...i)} = ${standard(...i)}`), `The ${want === 'max' ? 'greatest' : 'least'} is ${b(win)}.`])] };
}
function regroup() {
  const d = pick([12, 25, 36, 45, 52, 68, 75, 94]), e = chance(0.5) ? rnd(2, 6) : -rnd(2, 6), up = chance(0.5);
  const shown = up ? `${d} × ${pow(10, fmt(e - 1))}` : `0.${d} × ${pow(10, fmt(e + 1))}`, c = coefTxt(d, 1);
  return { ask: 'Rewrite in scientific notation. What is the new exponent?', expr: `${shown} = ${c} × ${pow(10, blank)}`, exprSmall: true, answer: num(e, { signed: true }), hint: `The front number got 10 times ${up ? 'smaller' : 'bigger'}. What must the power of 10 do to keep the value the same?`, _t: { k: 'sci', d, p: 1, e, ask: 'exp' },
    ways: [way('Keep the balance', [up ? `${d} = ${c} × 10. The front number was made 10 times smaller.` : `0.${d} = ${c} ÷ 10. The front number was made 10 times bigger.`, `To keep the same value, the power of 10 goes ${up ? 'up' : 'down'} by one: ${fmt(up ? e - 1 : e + 1)} ${up ? '+' : '−'} 1 = ${b(fmt(e))}.`]),
      way('Write it out', [`${shown} = ${standard(d, 1, e)}`, `${standard(d, 1, e)} = ${c} × ${pow(10, fmt(e))}, so the exponent is ${b(fmt(e))}.`])] };
}
const TINY = [['A human hair is about', 'meters wide'], ['A grain of pollen is about', 'meters across'], ['One sheet of paper is about', 'meters thick'], ['A raindrop weighs about', 'kilograms']];
function tiny() {
  const d = rnd(2, 9), e = -rnd(3, 5), [lead, unit] = pick(TINY), right = standard(d, 0, e);
  return { ask: `${lead} ${sci(d, 0, e)} ${unit}. Which number is that?`, answer: choice(right, [standard(d, 0, e - 1), standard(d, 0, e + 1), `−${standard(d, 0, -e)}`]), hint: `Dividing by 10, ${-e} times, moves the ${d} how many places after the point?`, _t: { k: 'sci', d, p: 0, e, ask: 'pick' },
    ways: [way('Move the digit', [`${pow(10, fmt(e))} means divide by 10, ${-e} times.`, `The ${d} moves ${-e} places to the right of the ones place: ${b(right)}.`, `That is ${-e - 1} zeros after the point, then the ${d}.`]),
      way('Rule out the others', ['A negative exponent makes a small positive number, not a negative one.', `Count places, not zeros: the ${d} must land in decimal place ${-e}.`])] };
}
export function genSci(L) {
  const [d, p] = coef(L), e = expo(L);
  if (L === 1) return pick([toStandard, toStandard, findExp, findCoef])(d, p, e);
  if (L === 2) return pick([toStandard, findExp, findExp, findCoef, properForm])(d, p, e);
  return pick([() => compare(2), () => compare(4), regroup, tiny, () => findExp(d, p, e), () => toStandard(d, p, e)])();
}
