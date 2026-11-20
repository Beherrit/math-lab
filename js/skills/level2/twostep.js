// Two-step problems with all four operations: write the steps, pick the calculation, stop-at-one-step slips, and checking with an estimate.
import { pick, shuffle, b, way, nm, num, choice, fmt as f } from '../../util.js';
import { tell } from './words.js';
import { numChoice } from './kit.js';
import { TYPES } from './twotypes.js';
import { CONTEXTS } from './twocontext.js';

const tOf = (type, v) => ({ f: type, ...v });
// A fresh problem of a kind: the numbers, the wording, and the written plan.
function build(type, L) {
  const v = TYPES[type].vars(L), T = TYPES[type], row = pick(CONTEXTS[type])(v, nm()), [s1, s2] = T.steps(v);
  return { type, v, T, row, s1, s2, ans: T.ans(v), first: T.s1(v) };
}
const tellIt = (x, extra = {}) => ({ story: x.row[0], ask: x.row[1], answer: num(x.ans), suffix: x.row[5], _t: tOf(x.type, x.v), ...extra });
const stepWays = x => [way('Write the two steps', [`Write the plan: ${x.T.expr(x.v)}.`, x.s1, x.s2]), x.T.alt(x.v)];

function fullQ(x) { return { ...tellIt(x), ways: stepWays(x), hint: x.T.first }; }
function firstStepQ(x) {
  return { story: `${x.row[0]} ${x.row[1]}`, ask: 'Work out only the first step. What do you get?', answer: num(x.first), suffix: x.row[5], _t: { f: 'step1', type: x.type, ...x.v }, hint: x.T.first,
    ways: [way('Find the first step', [`The whole problem is ${x.T.expr(x.v)}. The first step is the part that has to be done first.`, x.s1]), way('Use the clue words', [x.row[4], x.s1])] };
}
// Which calculation solves it? Three tempting wrong ones: the wrong operation, the wrong order, or brackets in the wrong place.
function pickCalcQ(x) {
  const right = x.T.expr(x.v), bad = x.T.bad(x.v).filter(([, val], i, all) => val > 0 && val !== x.ans && all.findIndex(([, w]) => w === val) === i);
  return { story: `${x.row[0]} ${x.row[1]}`, ask: 'Which calculation solves the problem?', answer: choice(right, shuffle(bad.map(([t]) => t))), choiceBig: true, _t: { ...tOf(x.type, x.v), evalOptions: true }, hint: x.T.first,
    ways: [way('Match the steps', [x.s1, x.s2, `Written as one calculation: ${b(right)}.`]), way('Check each choice', [`Work out the answer to the story: ${f(x.ans)}.`, `Only ${b(right)} comes to ${f(x.ans)}.`])] };
}
// "Sam stopped after the first step and said ..." What is the answer to the whole problem?
function stoppedQ(x) {
  return { story: `${x.row[0]} ${nm()} stopped after the first step and says the answer is ${f(x.first)}.`, ask: 'What is the correct answer to the whole problem?', answer: num(x.ans), suffix: x.row[5], _t: tOf(x.type, x.v), hint: 'Step 1 is only the first part. What does the story still ask for?',
    ways: [way('Find the slip', [`${f(x.first)} is the answer to Step 1 only.`, `Step 2 still has to be done: ${x.s2}`]), ...stepWays(x)] };
}
// Which answer is reasonable? Round the numbers, estimate, and pick the one that is close. The slips are far out.
function reasonQ(x) {
  const [text, est] = x.T.est(x.v), slips = [x.ans * 2, x.ans * 10, Math.round(x.ans / 2), x.ans + 100].filter(w => w > 0 && Math.abs(w - x.ans) / x.ans >= 0.4);
  return { story: `${x.row[0]} ${x.row[1]}`, ask: 'Estimate first by rounding the numbers. Which answer is reasonable?', answer: numChoice(x.ans, slips), choiceBig: true, _t: tOf(x.type, x.v), hint: 'Round each number to a friendly one, then do the two steps with those.',
    ways: [way('Estimate, then pick', [`Round to friendly numbers: ${text}.`, `${text} = ${f(est)}.`, `Only ${b(f(x.ans))} is close to ${f(est)}.`]), way('Work it out exactly', [x.s1, x.s2])] };
}
const MAKERS = { full: fullQ, first: firstStepQ, calc: pickCalcQ, stopped: stoppedQ, reason: reasonQ };
const KINDS = { 1: ['muladd', 'mulsub', 'addsub', 'divadd', 'addmul'], 2: ['muladd', 'mulsub', 'subdiv', 'addmul', 'adddiv', 'divadd', 'divsub', 'addsub'], 3: ['muladd', 'mulsub', 'subdiv', 'addmul', 'adddiv', 'divadd', 'divsub', 'addsub'] };
export function genTwoStep(L) {
  const type = pick(KINDS[L]), x = build(type, L), shapes = L === 1 ? ['full', 'full', 'first', 'calc'] : L === 2 ? ['full', 'first', 'calc', 'stopped', 'full'] : ['full', 'calc', 'stopped', 'reason', 'full'];
  let shape = pick(shapes);
  if (shape === 'reason' && !x.T.est) shape = 'full';
  return MAKERS[shape](x);
}
// A two-step story for the level's story skill (step 3 only). Story wording and clue words come from the same table.
export function twoWord(L) {
  if (L < 3) return null;
  const x = build(pick(Object.keys(TYPES)), 3);
  return tell(x.row, 'multi', num(x.ans), stepWays(x), x.T.expr(x.v), tOf(x.type, x.v), { suffix: x.row[5], hint: 'There are two steps. Which one has to come first?' });
}
