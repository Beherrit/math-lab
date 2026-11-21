// Scientific notation in measurements: choosing a unit, how many times as large, and reading calculator "E" notation.
import { R, rnd, pick, chance, shuffle, b, way, pow, fmt, num, choice } from '../../util.js';
import { fixedChoice } from './h.js';
import { sciTxt, eTxt, BYTES, LENGTH, PREFIX_WORD, SIZES, CONTEXTS } from './sciunits-data.js';

const core = (shape, extra = {}) => ({ k: 'sciu', shape, ...extra });
const mant = () => pick([1.2, 1.5, 2, 2.4, 3, 3.6, 4.5, 5, 6.4, 7.5, 8, 9.6, 4, 7]);
function eRead(small) {
  const a = mant(), e = small ? -rnd(2, 5) : rnd(2, 6), v = R(a * 10 ** e);
  return { ask: `A calculator shows ${eTxt(a, e)}. Write that as an everyday number.`, answer: num(v), hint: small ? 'A negative E means a small number: the point moves left.' : 'The number after the E is the power of 10: it tells how many places the point moves right.', _t: core(small ? 'e-small' : 'e-read', { a, e }),
    ways: [way('Read E as times 10 to the power', [`${eTxt(a, e)} means ${sciTxt(a, e)}.`, `${small ? 'Move the point' : 'Move the point'} ${Math.abs(e)} ${Math.abs(e) === 1 ? 'place' : 'places'} to the ${e < 0 ? 'left' : 'right'}: ${b(fmt(v))}.`]), way('Multiply it out', [`${pow(10, fmt(e))} = ${e < 0 ? `1 ÷ ${fmt(10 ** -e)}` : fmt(10 ** e)}.`, `${fmt(a)} ${e < 0 ? '÷' : '×'} ${fmt(10 ** Math.abs(e))} = ${b(fmt(v))}.`])] };
}
function eExp() {
  const a = mant(), e = chance(0.5) ? rnd(2, 9) : -rnd(2, 8);
  return { ask: `A calculator shows ${eTxt(a, e)}. In scientific notation that is ${fmt(a)} × ${pow(10, '?')}. What is the ?`, answer: num(e), hint: 'The number after the E is the exponent on the 10.', _t: core('e-exp', { a, e }),
    ways: [way('E means times ten to the power', [`The E stands for "times 10 to the power of".`, `So ${eTxt(a, e)} = ${sciTxt(a, e)}, and the exponent is ${b(fmt(e))}.`]), way('Check by size', [`${e > 0 ? 'A big number needs a positive exponent' : 'A small number needs a negative exponent'}.`, `The E shows ${fmt(e)}, so the exponent is ${b(fmt(e))}.`])] };
}
const THINGS = [['A stadium holds about', 'A classroom holds about', 'people', 5, 1, 'times as many people'], ['A big lake holds about', 'A bathtub holds about', 'liters', 9, 2, 'times as much water'], ['A library has about', 'A bookshelf holds about', 'books', 6, 2, 'times as many books'], ['A song file is about', 'A text message is about', 'bytes', 7, 2, 'times as large']];
function powerTimes() {
  const [a, c, unit, hi, lo, say] = pick(THINGS), X = hi + rnd(-1, 1), Y = lo + rnd(0, 1), d = X - Y;
  return { ask: `${a} ${pow(10, X)} ${unit}. ${c} ${pow(10, Y)} ${unit}. The first is ${pow(10, '?')} ${say}. What is the ?`, answer: num(d), hint: 'To find how many times as large, divide. Dividing powers of 10 subtracts the exponents.', _t: core('power-times', { X, Y }),
    ways: [way('Subtract the exponents', [`${pow(10, X)} ÷ ${pow(10, Y)} = ${pow(10, `${X} − ${Y}`)}.`, `${X} − ${Y} = ${b(d)}.`]), way('Count the tens', [`${pow(10, X)} has ${X} tens multiplied together and ${pow(10, Y)} has ${Y}.`, `The first has ${d} more tens: ${b(d)}.`])] };
}
function prefixAsk() {
  const [list, base] = pick([[BYTES, 'bytes'], [LENGTH, 'meters']]), [unit, e] = pick(list.filter(u => u[1] !== 0)), one = unit.replace(/s$/, ''), word = PREFIX_WORD[e];
  return { ask: `1 ${one} is ${pow(10, '?')} ${base}. What is the ?`, answer: num(e), hint: 'The prefix tells the power of 10: kilo is a thousand, mega a million, giga a billion, milli a thousandth, micro a millionth.', _t: core('prefix-exp', { unit }),
    ways: [way('Use the prefix', [e > 0 ? `The prefix in ${unit} means ${word}, so 1 ${one} is ${word} ${base}.` : `The prefix in ${unit} means ${word}, so 1 ${one} is ${word} of a meter.`, `${word.replace('a ', '')[0].toUpperCase()}${word.replace('a ', '').slice(1)} is ${pow(10, fmt(e))}, so the ? is ${b(fmt(e))}.`]),
      way('Count the thousands', [`Each step kilo, mega, giga, tera is ${pow(10, 3)} times bigger, and each step milli, micro, nano is ${pow(10, 3)} times smaller.`, `${one[0].toUpperCase()}${one.slice(1)} is ${Math.abs(e) / 3} ${Math.abs(e) / 3 === 1 ? 'step' : 'steps'} ${e > 0 ? 'above' : 'below'} the base unit, so the exponent is ${b(fmt(e))}.`])] };
}
function unitPick() {
  const fam = pick(['bytes', 'meters']), list = fam === 'bytes' ? BYTES : LENGTH, [e, lead] = pick(SIZES[fam]), a = mant() + 0;
  const best = list.filter(u => u[1] <= e).sort((p, q) => q[1] - p[1])[0], others = shuffle(list.filter(u => u !== best)).slice(0, 3);
  const k = best[1], v = R(a * 10 ** (e - k));
  return { ask: `${lead} ${sciTxt(a, e)} ${fam}. Which unit gives the most useful number to say out loud?`, answer: choice(best[0], others.map(u => u[0])), hint: 'Pick the biggest unit that is still smaller than the amount, so the number is at least 1 and not huge.', _t: core('unit-pick', { a, e, fam }),
    ways: [way('Find the biggest unit that fits', [`${best[0]} are ${pow(10, fmt(k))} ${fam}, which is not more than ${pow(10, fmt(e))}.`, `The next unit up is too big. In ${best[0]} the amount is ${fmt(v)}: ${b(best[0])}.`]), way('Convert to see', [`${sciTxt(a, e)} ${fam} = ${fmt(v)} ${best[0]}.`, `${fmt(v)} is a number from 1 up to a few hundreds, which is easy to say: ${b(best[0])}.`])] };
}
function convert(small) {
  const fam = small ? 'meters' : 'bytes', [unit, p] = pick((small ? LENGTH : BYTES).filter(u => (small ? u[1] < 0 : u[1] > 0))), e = p + rnd(0, small ? 1 : 2), a = mant(), v = R(a * 10 ** (e - p)), one = unit.replace(/s$/, '');
  const second = small ? [`1 ${fam.replace(/s$/, '')} is ${fmt(10 ** -p)} ${unit}, so multiply by ${pow(10, fmt(-p))}.`, `${sciTxt(a, e)} × ${pow(10, fmt(-p))} = ${fmt(a)} × ${pow(10, fmt(e - p))} = ${b(fmt(v))} ${unit}.`] : [`1 ${one} is ${pow(10, fmt(p))} ${fam}, so divide by ${pow(10, fmt(p))}.`, `${sciTxt(a, e)} ÷ ${pow(10, fmt(p))} = ${fmt(a)} × ${pow(10, fmt(e - p))} = ${b(fmt(v))} ${unit}.`];
  return { ask: `${sciTxt(a, e)} ${fam} is how many ${unit}?`, answer: num(v), hint: small ? `A meter holds a power of 10 of these small units, so the number of ${unit} is much bigger. Add the exponents.` : `Each ${one} is a power of 10 of the base unit. Divide by that, which subtracts the exponents.`, _t: core(small ? 'convert-small' : 'convert', { a, e, unit }),
    ways: [way(small ? 'Add the exponents' : 'Subtract the exponents', [small ? `${pow(10, fmt(e))} × ${pow(10, fmt(-p))} = ${pow(10, fmt(e - p))}.` : `${pow(10, fmt(e))} ÷ ${pow(10, fmt(p))} = ${pow(10, fmt(e - p))}.`, `${fmt(a)} × ${fmt(10 ** (e - p))} = ${b(fmt(v))} ${unit}.`]), way('Use the unit size', second)] };
}
function timesAs() {
  const [lead, two, unit, q, mr, nr] = pick(CONTEXTS), m = rnd(...mr), n = rnd(...nr), c = pick([2, 4, 5, 8]), a = pick([2.4, 3.6, 4.8, 6, 6.4, 7.5, 8, 9.6, 7.2, 9]), v = R((a / c) * 10 ** (m - n));
  if (!Number.isInteger(v) || m - n < 2) return null;
  return { ask: `${lead} ${sciTxt(a, m)} ${unit}. ${two} ${sciTxt(c, n)} ${unit}. ${q}`, answer: num(v), hint: 'To find how many times as many, divide. Divide the front numbers, and subtract the exponents.', _t: core('times-as', { a, m, c, n }),
    ways: [way('Front numbers, then powers of 10', [`${fmt(a)} ÷ ${c} = ${fmt(R(a / c))}, and ${pow(10, m)} ÷ ${pow(10, n)} = ${pow(10, m - n)}.`, `${fmt(R(a / c))} × ${fmt(10 ** (m - n))} = ${b(fmt(v))}.`]), way('Write both out', [`${fmt(R(a * 10 ** m))} ÷ ${fmt(R(c * 10 ** n))}.`, `Cancel the same number of zeros from both: the answer is ${b(fmt(v))}.`])] };
}
function timesExp() {
  const [lead, two, unit, , mr, nr] = pick(CONTEXTS), a = pick([6, 8, 9, 7.5, 4.8]), c = pick([2, 4, 5]), m = rnd(...mr) + 1, n = rnd(...nr), raw = R(a / c), shift = raw >= 10 ? 1 : raw < 1 ? -1 : 0, q = R(raw / 10 ** shift), E = m - n + shift;
  if (raw === 1) return null;
  return { ask: `${lead} ${sciTxt(a, m)} ${unit}. ${two} ${sciTxt(c, n)} ${unit}. The number of times as many is ${fmt(q)} × ${pow(10, '?')}. What is the ?`, answer: num(E), hint: 'Divide the front numbers and subtract the exponents. If the front number is not from 1 to 10, adjust it.', _t: core('times-exp', { a, m, c, n, q }),
    ways: [way('Divide, then tidy', [`${fmt(a)} ÷ ${c} = ${fmt(raw)}, and ${pow(10, m)} ÷ ${pow(10, n)} = ${pow(10, m - n)}.`, shift === 0 ? `${fmt(raw)} is between 1 and 10, so the exponent is ${b(fmt(E))}.` : `${fmt(raw)} × ${pow(10, m - n)} = ${fmt(q)} × ${pow(10, E)}, so the exponent is ${b(fmt(E))}.`]), way('Estimate the size', [`${pow(10, m)} ÷ ${pow(10, n)} is about ${pow(10, m - n)}.`, `Adjusting for the front numbers gives ${fmt(q)} × ${pow(10, E)}: ${b(fmt(E))}.`])] };
}
function eCalc() {
  const a = pick([6, 8, 9, 4]), c = pick([2, 4, 5]), m = rnd(6, 9), n = rnd(2, 4), v = R((a / c) * 10 ** (m - n));
  if (!Number.isInteger(v)) return null;
  return { ask: `A calculator shows ${eTxt(a, m)} ÷ ${eTxt(c, n)}. Write the answer as an everyday number.`, answer: num(v), hint: 'Read each E as times 10 to a power. Divide the front numbers and subtract the exponents.', _t: core('e-calc', { a, m, c, n }),
    ways: [way('Divide front numbers, subtract exponents', [`${fmt(a)} ÷ ${c} = ${fmt(R(a / c))}, and ${m} − ${n} = ${m - n}.`, `${fmt(R(a / c))} × ${pow(10, m - n)} = ${b(fmt(v))}.`]), way('Write the numbers out', [`${eTxt(a, m)} = ${fmt(a * 10 ** m)} and ${eTxt(c, n)} = ${fmt(c * 10 ** n)}.`, `${fmt(a * 10 ** m)} ÷ ${fmt(c * 10 ** n)} = ${b(fmt(v))}.`])] };
}
const SAME = [['millimeters', -3], ['meters', 0], ['kilometers', 3]];
function longer() {
  const [u1, p1] = pick(SAME), [u2, p2] = pick(SAME.filter(u => u[0] !== u1)), a = rnd(2, 9), c = rnd(2, 9), e1 = rnd(2, 4), e2 = rnd(2, 4), x = R(a * 10 ** (e1 + p1)), y = R(c * 10 ** (e2 + p2));
  if (x === y) return null;
  const t1 = `${sciTxt(a, e1)} ${u1}`, t2 = `${sciTxt(c, e2)} ${u2}`, win = x > y ? t1 : t2;
  return { ask: `Which is longer: ${t1}, or ${t2}?`, answer: fixedChoice(win, [t1, t2]), hint: 'Change both lengths into the same unit before you compare them.', _t: core('compare-units', { a, e1, p1, c, e2, p2 }),
    ways: [way('Same unit', [`In meters: ${t1} = ${fmt(x)} meters and ${t2} = ${fmt(y)} meters.`, `${fmt(Math.max(x, y))} is more, so ${b(win)} is longer.`]), way('Compare the powers', [`A meter is ${pow(10, 0)}, a kilometer is ${pow(10, 3)} meters and a millimeter is ${pow(10, '−3')} meters. Add the unit power to the exponent: ${e1 + p1} and ${e2 + p2}.`, e1 + p1 === e2 + p2 ? `They match, so compare the front numbers ${a} and ${c}: ${b(win)} is longer.` : `${Math.max(e1 + p1, e2 + p2)} is greater, so ${b(win)} is longer.`])] };
}
export function genSciUnits(L) {
  if (L === 1) return pick([() => eRead(false), eExp, powerTimes, prefixAsk])();
  if (L === 2) return pick([unitPick, () => convert(false), timesAs, () => eRead(true)])();
  return pick([timesExp, eCalc, () => convert(true), longer, timesAs])();
}
