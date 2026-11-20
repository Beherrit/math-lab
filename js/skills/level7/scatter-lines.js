// Lines of best fit in context: choosing the line, predicting from its equation, saying what the slope means.
import { rnd, pick, b, way, fmt, num, choice } from '../../util.js';
import { eqn, par, plus, substSteps, startPlus } from './h.js';
import { grid } from './draw.js';
import { fitted, dots, direction, readDot, strength, outlier, readPrediction } from './scatter.js';

export const FITS = [
  { x: 'hours studied', y: 'quiz score', one: 'hour studied', unit: 'points', m: [4, 8], c: [40, 60], xs: [2, 6], zero: 'a student who studies 0 hours' },
  { x: 'weeks of training', y: 'push-ups in a row', one: 'week of training', unit: 'push-ups', m: [2, 5], c: [5, 15], xs: [3, 10], zero: 'someone with 0 weeks of training' },
  { x: 'age of a car in years', y: 'value in thousands of dollars', one: 'year older', unit: 'thousand dollars', m: [-3, -1], c: [24, 32], xs: [2, 7], zero: 'a brand new car' },
  { x: 'temperature in degrees', y: 'cold drinks sold', one: 'degree warmer', unit: 'drinks', m: [3, 9], c: [10, 40], xs: [15, 30], zero: 'a day at 0 degrees' },
  { x: 'games played', y: 'total points scored', one: 'game played', unit: 'points', m: [6, 14], c: [0, 12], xs: [4, 12], zero: 'a player with 0 games' },
];
const setup = () => { const f = pick(FITS); return { f, m: rnd(...f.m), c: rnd(...f.c), x: rnd(...f.xs) }; };
const lead = (f, m, c) => `A scatter plot compares ${f.x} (x) with ${f.y} (y). Its line of best fit is ${eqn(m, c)}.`;
export function predict() {
  const { f, m, c, x } = setup(), y = m * x + c;
  return { ask: `${lead(f, m, c)} What does the line predict for x = ${x}?`, answer: num(y), hint: `Put ${x} in place of x in the equation.`, _t: { k: 'scpred', m, c, x },
    ways: [way('Substitute', substSteps(m, c, x)),
      way('Start value plus changes', [`At x = 0 the line starts at ${c}.`, `Each 1 more x changes y by ${fmt(m)}. Over ${x} of them that is ${x} × ${par(m)} = ${fmt(m * x)}.`, 'It is a prediction: real data points will be near this value, not always exactly on it.', startPlus(c, m * x, y)])] };
}
function slopeMeaning() {
  const { f, m, c } = setup(), dirn = m > 0 ? 'more' : 'less', n = Math.abs(m);
  const right = `Each ${f.one} goes with about ${n} ${f.unit} ${dirn}`;
  return { ask: `${lead(f, m, c)} What does the slope ${fmt(m)} tell you?`, answer: choice(right, [`The prediction for ${f.zero} is ${n} ${f.unit}`, `Every dot on the plot has a y-value of ${n}`, `Each ${f.one} goes with about ${n} ${f.unit} ${m > 0 ? 'less' : 'more'}`]), hint: 'Slope is the change in y for each 1 more x.', _t: { k: 'scmean' },
    ways: [way('Slope is a rate', [`The slope multiplies x, so it says how y changes when x goes up by 1.`, `Here y changes by ${fmt(m)}: ${b(right)}.`, `The ${c} is the other number. It is the prediction when x is 0.`]),
      way('Try two x-values', [`x = 1 gives ${fmt(m + c)}. x = 2 gives ${fmt(2 * m + c)}.`, `One more x made y go ${m > 0 ? 'up' : 'down'} by ${n}. That is what the slope means.`])] };
}
function chooseLine() {
  const d = fitted();
  if (!d) return null;
  const right = eqn(d.m, d.c), wrong = [eqn(-d.m, d.c), eqn(d.m, d.c + (d.c > 5 ? -5 : 5)), eqn(-d.m, 10 - d.c), eqn(d.m * 4, d.c)];
  return { ask: 'Which equation is the best line of fit for these dots?', visual: grid({ pts: dots(d.pts) }), answer: choice(right, wrong), hint: 'Do the dots go up or down? About where would a line through them cross the y-axis?', _t: { k: 'scline', pts: d.pts, m: d.m, c: d.c },
    ways: [way('Direction, then starting height', [`The dots go ${d.m > 0 ? 'up' : 'down'} from left to right, so the slope is ${d.m > 0 ? 'positive' : 'negative'}.`, `Follow the trend back to x = 0: the dots point to a height of about ${d.c}. So b is about ${d.c}.`, `The dots change by about ${fmt(d.m)} for each step right: ${b(right)}`]),
      way('See the line', [grid({ pts: dots(d.pts), lines: [{ m: d.m, c: d.c, color: 'var(--good)' }] }), `${right} runs through the middle of the dots, with about as many dots above it as below.`, 'The other lines go the wrong way, sit too high or too low, or are too steep.'])] };
}
export function genScatter(L) {
  if (L === 1) return pick([direction, direction, direction, readDot])();
  if (L === 2) return pick([strength, strength, readPrediction, readPrediction, outlier])();
  return pick([predict, predict, slopeMeaning, chooseLine, chooseLine, outlier])();
}
