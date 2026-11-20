// Functions: one output for each input, evaluating from a rule or a table, linear or not, rate of change.
import { rnd, pick, chance, shuffle, b, way, pow, F, fmt, num, table } from '../../util.js';
import { eqn, par, term, pt, nz, yesNo, fixedChoice, substSteps } from './h.js';

const LIN = ['Linear', 'Not linear'];
const io = pairs => table(['Input (x)', 'Output (y)'], pairs.map(p => p.map(fmt)));
function isFunction(L) {
  const yes = chance(0.5), xs = shuffle([-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, L === 1 ? 4 : 5), pairs = xs.map(x => [x, rnd(-5, 12)]);
  if (yes && chance(0.6)) pairs[1][1] = pairs[0][1];
  if (!yes) { pairs[pairs.length - 1][0] = pairs[0][0]; if (pairs[pairs.length - 1][1] === pairs[0][1]) pairs[0][1] += 2; }
  const rep = pairs[0][0], asSet = L > 1 && chance(0.5);
  return { ask: asSet ? `Is this set of pairs a function? ${pairs.map(p => pt(...p)).join(', ')}` : 'Does this table show a function?', visual: asSet ? null : io(pairs), answer: yesNo(yes), hint: 'Look for an input that appears twice with different outputs.', _t: { k: 'isfunc', pairs },
    ways: [way('Check each input', ['A function gives exactly one output for each input.', yes ? 'Every input here appears once, so each one has exactly one output.' : `The input ${fmt(rep)} appears twice, with outputs ${fmt(pairs[0][1])} and ${fmt(pairs[pairs.length - 1][1])}.`, yes ? `${b('Yes')}, it is a function.` : `One input with two different outputs: ${b('no')}, it is not a function.`]),
      way('Think of a machine', ['Picture a machine: you put in x, it gives back y. A fair machine always gives the same answer for the same input.', yes ? 'Two inputs are allowed to share an output. What matters is that no input gets two answers.' : `Put in ${fmt(rep)} and you could not tell which output to expect. That is not a function.`])] };
}
const RULES = [
  { say: (m, c) => `multiply by ${m}, then add ${c}`, f: (m, c, x) => m * x + c, steps: (m, c, x) => [`${m} × ${x} = ${m * x}`, `${m * x} + ${c} = ${b(m * x + c)}`] },
  { say: (m, c) => `add ${c}, then multiply by ${m}`, f: (m, c, x) => m * (x + c), steps: (m, c, x) => [`${x} + ${c} = ${x + c}`, `${x + c} × ${m} = ${b(m * (x + c))}`] },
  { say: (m, c) => `multiply by ${m}, then subtract ${c}`, f: (m, c, x) => m * x - c, steps: (m, c, x) => [`${m} × ${x} = ${m * x}`, `${m * x} − ${c} = ${b(fmt(m * x - c))}`] },
];
function ruleWords() {
  const i = rnd(0, 2), r = RULES[i], m = rnd(2, i === 1 ? 5 : 6), c = rnd(1, i === 1 ? 5 : 9), x = rnd(2, 9), near = [x - 1, x, x + 1];
  return { ask: `A function has the rule "${r.say(m, c)}". What is the output when the input is ${x}?`, answer: num(r.f(m, c, x), { signed: i === 2 }), hint: 'Do the steps of the rule in the order they are written.', _t: { k: 'frule', i, m, c, x },
    ways: [way('Follow the rule', r.steps(m, c, x)), way('See it in a table', [io(near.map(v => [v, r.f(m, c, v)])), `Each input gets its own output. For ${x} it is ${b(fmt(r.f(m, c, x)))}.`])] };
}
function evaluate() {
  const m = nz(-6, 6), c = rnd(-9, 9), x = nz(-6, 6), y = m * x + c;
  return { ask: `A function is given by ${eqn(m, c)}. What is the output when x = ${fmt(x)}?`, answer: num(y, { signed: true }), hint: `Replace x with ${fmt(x)}. Multiply before you add.`, _t: { k: 'feval', m, c, x },
    ways: [way('Substitute', substSteps(m, c, x)),
      way('Neighbours in a table', [io([x - 1, x, x + 1].map(v => [v, m * v + c])), `Outputs change by ${fmt(m)} for each step of 1 in x. The row for x = ${fmt(x)} shows ${b(fmt(y))}.`])] };
}
function missingOutput() {
  const m = nz(-5, 6), c = rnd(-8, 10), x0 = rnd(-2, 3), xs = [0, 1, 2, 3, 4].map(i => x0 + i), ys = xs.map(x => m * x + c), i = rnd(2, 4);
  return { ask: 'This function is linear. What output is missing?', visual: table(['x', 'y'], xs.map((x, j) => [fmt(x), j === i ? b('?') : fmt(ys[j])])), answer: num(ys[i], { signed: true }), hint: 'How much does y change from one row to the next?', _t: { k: 'ftable', xs, ys, i },
    ways: [way('Use the constant change', [`From ${fmt(ys[0])} to ${fmt(ys[1])}, y changes by ${fmt(m)} when x goes up by 1.`, `A linear function keeps that change in every row: ${fmt(ys[i - 1])} + ${par(m)} = ${b(fmt(ys[i]))}`]),
      way('Find the rule', [`The change per step is ${fmt(m)}, so the rule looks like y = ${term(m)} + b.`, `Use the row ${pt(xs[0], ys[0])}: ${fmt(ys[0])} = ${fmt(m)} × ${par(xs[0])} + b, so b = ${fmt(c)}.`, `${eqn(m, c)}, and at x = ${fmt(xs[i])}: y = ${b(fmt(ys[i]))}`])] };
}
const CURVES = [{ name: 'each output is the input squared', f: x => x * x }, { name: 'each output is double the one before', f: x => 2 ** x }, { name: 'the jumps keep growing', f: x => x * (x + 1) / 2 + 3 }, { name: 'the drops keep getting bigger', f: x => 30 - x * x }];
function linearTable() {
  const lin = chance(0.5), m = nz(-4, 6), c = rnd(-5, 9), cv = pick(CURVES), xs = [1, 2, 3, 4, 5], ys = xs.map(x => (lin ? m * x + c : cv.f(x)));
  const diffs = ys.slice(1).map((y, i) => y - ys[i]);
  return { ask: 'Is this function linear or not linear?', visual: table(['x', 'y'], xs.map((x, i) => [x, fmt(ys[i])])), answer: fixedChoice(lin ? LIN[0] : LIN[1], LIN), hint: 'Find the change in y from each row to the next. Is it always the same?', _t: { k: 'flin', xs, ys },
    ways: [way('Check the changes', [`x goes up by 1 each time. The changes in y are: ${diffs.map(fmt).join(', ')}.`, lin ? `The change is always ${fmt(m)}. A constant rate of change means ${b('linear')}.` : `The changes are not all the same (${cv.name}), so it is ${b('not linear')}.`]),
      way('Picture the graph', [lin ? 'Equal steps across with equal steps up or down put every point on one straight line.' : 'Equal steps across with unequal steps up or down make the points bend away from a straight line.', `So the function is ${b(lin ? 'linear' : 'not linear')}.`])] };
}
const EQS = [[true, m => eqn(m, rnd(1, 9)), 'x is only multiplied by a number and has a number added: the form y = mx + b.'], [true, m => `y = ${m}x`, 'It is y = mx + b with b = 0: a straight line through (0, 0).'], [true, m => `y = ${rnd(1, 9)} − ${m}x`, 'It is y = mx + b written in a different order.'],
  [false, () => `y = ${pow('x', 2)}`, 'x is multiplied by itself, so the outputs 1, 4, 9, 16 do not change by a constant amount.'], [false, m => `y = ${pow('x', 2)} + ${m}`, 'The squared x makes the changes grow: the graph is a curve.'], [false, m => `y = ${F(m * 6, 'x')}`, 'x is in the bottom of a fraction, so the outputs do not change by a constant amount.'], [false, () => `y = ${pow('x', 3)}`, 'x is used as a factor three times: the graph is a curve.'], [false, m => `y = ${pow(m, 'x')}`, 'x is the exponent, so each output is multiplied, not added to.']];
function linearEquation() {
  const [lin, make, why] = pick(EQS), shown = make(rnd(2, 6));
  return { ask: 'Is this function linear or not linear?', expr: shown, answer: fixedChoice(lin ? LIN[0] : LIN[1], LIN), hint: 'Can the rule be written as y = mx + b, with x to the power 1 only?', _t: { k: 'flineq' },
    ways: [way('Compare with y = mx + b', [why, `So it is ${b(lin ? 'linear' : 'not linear')}.`]), way('Test with numbers', ['Put in x = 1, 2, 3, 4 and look at the changes in y.', lin ? 'The change is the same every time, so the points make a straight line.' : 'The changes are different each time, so the points do not make a straight line.'])] };
}
export { isFunction, ruleWords, evaluate, missingOutput, linearTable, linearEquation };
