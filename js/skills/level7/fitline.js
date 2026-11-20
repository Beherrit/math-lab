// Using a line of best fit: what slope and intercept mean, predicting inside and outside the data, and how far a dot is from the line.
import { rnd, pick, chance, b, way, fmt, num, choice } from '../../util.js';
import { eqn, par, plus, lin, term, fixedChoice } from './h.js';
import { FITS } from './scatter-lines.js';

const pickFit = (neg) => { const f = pick(FITS.filter(g => (g.m[0] < 0) === !!neg || neg === undefined)); return { f, m: rnd(...f.m), c: Math.max(2, rnd(...f.c)) }; };
const lead = (s, extra = '') => `A scatter plot compares ${s.f.x} (x) with ${s.f.y} (y). Its line of best fit is ${eqn(s.m, s.c)}.${extra}`;
const core = (shape, s, more = {}) => ({ k: 'fitl', shape, m: s.m, c: s.c, ...more });
const unitOf = (s, n) => (n === 1 ? s.f.one : s.f.one.replace(/^(\w+)/, '$1'));
function slopeNum() {
  const s = pickFit(), d = Math.abs(s.m), more = s.m > 0 ? 'more' : 'fewer';
  return { ask: `${lead(s)} About how many ${s.m > 0 ? 'more' : 'fewer'} ${s.f.unit} goes with each 1 ${s.f.one}?`, answer: num(d), hint: 'The slope is the change in y for each 1 more x.', _t: core('slope-num', s),
    ways: [way('Read the slope', [`In y = mx + b the slope m multiplies x. Here m = ${fmt(s.m)}.`, `Each 1 ${s.f.one} changes y by ${fmt(s.m)}, which is about ${b(d)} ${more} ${s.f.unit}.`]), way('Try two x-values', [`x = 1 gives ${fmt(s.m + s.c)} and x = 2 gives ${fmt(2 * s.m + s.c)}.`, `The change is ${fmt(s.m)}: ${b(d)} ${more}.`])] };
}
function zeroNum() {
  const s = pickFit();
  return { ask: `${lead(s)} What does the line predict for ${s.f.zero.replace(/^a /, 'a ')}, where x = 0?`, answer: num(s.c), hint: 'Put 0 in place of x. Which part of the equation is left?', _t: core('intercept-num', s),
    ways: [way('Put in x = 0', [`y = ${fmt(s.m)} × 0 ${plus(s.c)} = ${b(fmt(s.c))}.`]), way('Read the intercept', [`The number added at the end of y = mx + b is b, the value when x is 0.`, `Here b = ${b(fmt(s.c))}.`])] };
}
function predict() {
  const s = pickFit(), x = rnd(...s.f.xs), y = s.m * x + s.c;
  return { ask: `${lead(s)} What does the line predict when x = ${x}?`, answer: num(y), hint: 'Replace x with the number, multiply first, then add.', _t: core('predict', s, { x }),
    ways: [way('Substitute', [`y = ${fmt(s.m)} × ${x} ${plus(s.c)}`, `${fmt(s.m * x)} ${plus(s.c)} = ${b(fmt(y))}.`]), way('Start, then change', [`At x = 0 the line is at ${fmt(s.c)}. Each 1 more x changes it by ${fmt(s.m)}.`, `${x} steps: ${fmt(s.c)} ${plus(s.m * x)} = ${b(fmt(y))}.`])] };
}
function moreSteps() {
  const s = pickFit(), k = rnd(2, 6), d = s.m * k;
  return { ask: `${lead(s)} By how much does y change when x goes up by ${k}? (A fall is a negative number.)`, answer: num(d), hint: 'The slope is the change in y for each 1 step. How many steps are there?', _t: core('change-by', s, { k2: k }),
    ways: [way('Slope times steps', [`Each step changes y by ${fmt(s.m)}, and there are ${k} steps.`, `${fmt(s.m)} × ${k} = ${b(fmt(d))}.`]), way('Add one step at a time', [`Start with ${fmt(s.m)}, and add ${fmt(s.m)} again for each extra step, ${k} steps in all.`, `${fmt(s.m)} × ${k} = ${b(fmt(d))}.`])] };
}
function interceptMeaning() {
  const s = pickFit(), n = Math.abs(s.c), right = `The prediction for ${s.f.zero}, about ${n} ${s.f.unit}`;
  return { ask: `${lead(s)} What does the ${s.c} in the equation tell you?`, answer: choice(right, [`Each ${s.f.one} adds ${n} ${s.f.unit}`, `Every dot is at y = ${n}`, `The prediction when y is 0, at x = ${n}`]), hint: 'The number added at the end is the value of y when x is 0.', _t: core('intercept-meaning', s),
    ways: [way('Put in x = 0', [`With x = 0 the mx part is 0, so y = ${fmt(s.c)}.`, `So ${b(right)}.`]), way('Rule out the others', ['The number that multiplies x is the slope, which is the change for each 1 step. The number added at the end is not that.', `So ${b(right)}.`])] };
}
function interExtra() {
  const s = pickFit(), [lo, hi] = s.f.xs, inside = chance(0.5), x = inside ? rnd(lo, hi) : pick([lo - rnd(2, 3), hi + rnd(3, 8)]);
  if (x < 0) return null;
  const win = inside ? 'Interpolation' : 'Extrapolation';
  return { ask: `${lead(s, ` The data you measured has x from ${lo} to ${hi}.`)} You use the line to predict y when x = ${x}. Is that interpolation or extrapolation?`, answer: fixedChoice(win, ['Interpolation', 'Extrapolation']), hint: 'Is the x you are predicting inside the range of the data, or outside it?', _t: core('interpolate', s, { range: [lo, hi], x }),
    ways: [way('Compare with the data range', [`The data covers x from ${lo} to ${hi}. The x to predict is ${x}.`, inside ? `${x} is inside that range, so it is ${b('interpolation')}.` : `${x} is outside that range, so it is ${b('extrapolation')}.`]), way('Which is safer', [inside ? 'Predicting between measured values is fairly safe, because the pattern was seen there.' : 'Predicting beyond the measured values is riskier, because the pattern may change out there.', `This one is ${b(win.toLowerCase())}.`])] };
}
function missBy(signed) {
  const s = pickFit(), x = rnd(...s.f.xs), pred = s.m * x + s.c, off = pick([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6]), y = pred + off;
  if (y < 0) return null;
  const d = signed ? off : Math.abs(off), q = signed ? 'actual minus predicted (a negative number means the dot is below the line)' : 'how far is the dot from the line, in y';
  return { ask: `${lead(s)} One dot is at x = ${x}, y = ${y}. What is ${q}?`, answer: num(d), hint: 'Use the line to predict y at that x. Then compare the dot with the prediction.', _t: core(signed ? 'miss-signed' : 'miss', s, { x, y }),
    ways: [way('Predict, then compare', [`The line predicts ${fmt(s.m)} × ${x} ${plus(s.c)} = ${fmt(pred)}.`, `The dot is at ${y}. ${signed ? `${y} − ${fmt(pred)}` : `The gap`} = ${b(fmt(d))}.`]), way('Above or below', [`The dot is ${y > pred ? 'above' : 'below'} the line, since ${y} is ${y > pred ? 'more' : 'less'} than ${fmt(pred)}.`, `The distance in y is ${b(fmt(Math.abs(off)))}${signed && off < 0 ? ', and below means negative' : ''}.`])] };
}
function xFromY() {
  const s = pickFit(), x = rnd(...s.f.xs), y = s.m * x + s.c;
  return { ask: `${lead(s)} The line predicts y = ${fmt(y)}. What x gives that prediction?`, answer: num(x), hint: 'Write the number in place of y and solve for x.', _t: core('x-from-y', s, { y }),
    ways: [way('Solve the equation', [`${fmt(y)} = ${lin(s.m, s.c)}`, `${fmt(y - s.c)} = ${term(s.m)}, so x = ${fmt(y - s.c)} ÷ ${par(s.m)} = ${b(fmt(x))}.`]), way('Check it', [`Put x = ${x} in: ${fmt(s.m)} × ${x} ${plus(s.c)} = ${fmt(y)}.`, `So x = ${b(x)}.`])] };
}
function trust() {
  const s = pickFit(), [lo, hi] = s.f.xs, xs = [rnd(lo, hi), lo + 1, hi + rnd(8, 12), hi + rnd(2, 3)];
  if (new Set(xs).size < 4) return null;
  const worst = Math.max(...xs), fmtx = v => `x = ${v}`;
  return { ask: `${lead(s, ` The data has x from ${lo} to ${hi}.`)} Which prediction is the least trustworthy?`, answer: choice(fmtx(worst), xs.filter(v => v !== worst).map(fmtx)), hint: 'Predictions far outside the data range are the least reliable.', _t: core('trust', s, { range: [lo, hi], xs }),
    ways: [way('Distance from the data', [`The data covers x from ${lo} to ${hi}.`, `${worst} is the furthest outside, so ${b(fmtx(worst))} is the least trustworthy.`]), way('Compare each', xs.map(v => `${fmtx(v)}: ${v < lo || v > hi ? `${v > hi ? v - hi : lo - v} outside the range` : 'inside the range'}.`).concat([`The least trustworthy is ${b(fmtx(worst))}.`]))] };
}
function betterLine() {
  const s = pickFit(), dots = [rnd(...s.f.xs), rnd(...s.f.xs) + 1, rnd(...s.f.xs) + 2].map(x => [x, s.m * x + s.c + pick([-2, -1, 1, 2])]), other = { m: s.m + pick([-2, -1, 1, 2]), c: s.c + pick([-6, -4, 4, 6]) };
  const miss = l => dots.reduce((t, [x, y]) => t + Math.abs(y - (l.m * x + l.c)), 0), a = miss(s), c2 = miss(other);
  if (a === c2 || new Set(dots.map(d => d[0])).size < 3) return null;
  const names = ['Line 1', 'Line 2'], win = a < c2 ? 0 : 1, lines = [s, other];
  return { ask: `A scatter plot compares ${s.f.x} (x) with ${s.f.y} (y). Three dots are at ${dots.map(d => `(${d[0]}, ${d[1]})`).join(', ')}. Line 1 is ${eqn(s.m, s.c)} and Line 2 is ${eqn(other.m, other.c)}. Which line fits the three dots better, with the smaller total miss in y?`, answer: fixedChoice(names[win], names), hint: 'For each line, predict y at each x, and add up how far each dot is from the prediction.', _t: { k: 'fitl', shape: 'better-line', lines: lines.map(l => [l.m, l.c]), dots },
    ways: [way('Add the misses', lines.map((l, i) => `${names[i]}: the misses are ${dots.map(([x, y]) => Math.abs(y - (l.m * x + l.c))).join(', ')}, which add up to ${fmt(i ? c2 : a)}.`).concat([`The smaller total is ${b(names[win])}.`])), way('Check the middle dot', [`${names[0]} misses the middle dot by ${Math.abs(dots[1][1] - (s.m * dots[1][0] + s.c))} and ${names[1]} by ${Math.abs(dots[1][1] - (other.m * dots[1][0] + other.c))}.`, `Over all three dots, ${b(names[win])} is closer.`])] };
}
export function genFitLine(L) {
  if (L === 1) return pick([slopeNum, zeroNum, predict, moreSteps])();
  if (L === 2) return pick([interceptMeaning, interExtra, () => missBy(false), xFromY])();
  return pick([() => missBy(true), trust, betterLine, interExtra, moreSteps])();
}
