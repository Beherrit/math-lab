// Inequalities: reading and writing them, solutions, and graphs on a number line.
import { rnd, pick, chance, shuffle, fmt, b, k, way, num, choice } from '../../util.js';
import { T, numChoice, sg } from './helpers.js';
import { ineqLine } from './visuals.js';

const SYMS = ['<', '>', '≤', '≥'];
const WORD = { '<': 'less than', '>': 'greater than', '≤': 'less than or equal to', '≥': 'greater than or equal to' };
const holds = (x, sym, v) => (sym === '<' ? x < v : sym === '>' ? x > v : sym === '≤' ? x <= v : x >= v);
const strict = sym => sym === '<' || sym === '>';
const right = sym => sym === '>' || sym === '≥';
const stmt = (sym, v, x = 'x') => `${x} ${sg(sym)} ${fmt(v)}`;
const span = v => [v - 5, v + 5];

function readGraph(L) {
  const v = L === 1 ? rnd(1, 9) : rnd(-6, 6), sym = pick(SYMS), [lo, hi] = span(v), probe = right(sym) ? v + 2 : v - 2;
  return T({ ask: 'Which inequality does this graph show?', visual: ineqLine(lo, hi, v, sym), answer: choice(stmt(sym, v), SYMS.filter(s => s !== sym).map(s => stmt(s, v))),
    ways: [way('Circle, then arrow', [`The circle sits on ${fmt(v)}. It is ${strict(sym) ? `open, so ${fmt(v)} itself is NOT included` : `filled in, so ${fmt(v)} itself IS included (“or equal to”)`}.`, `The arrow points ${right(sym) ? 'right, towards bigger numbers' : 'left, towards smaller numbers'}.`, `So x is ${WORD[sym]} ${fmt(v)}: ${b(stmt(sym, v))}`]),
      way('Test a number on the arrow', [`${fmt(probe)} is on the shaded part, so it must make the inequality true.`, `${fmt(probe)} ${sg(right(sym) ? '>' : '<')} ${fmt(v)} is true, so the sign opens the same way as ${sg(right(sym) ? '>' : '<')}.`, `${strict(sym) ? 'Open circle: no “or equal to” line under the sign.' : 'Filled circle: add the “or equal to” line under the sign.'} ${b(stmt(sym, v))}`])],
    hint: 'Look at two things: is the circle open or filled, and which way does the arrow point?' }, 'ineqRead', { v, sym });
}
function pickSolution(L) {
  const v = L === 3 ? rnd(-8, -1) : rnd(2, 15), sym = pick(SYMS), d = right(sym) ? 1 : -1;
  const good = strict(sym) || chance(0.5) ? v + d * rnd(1, 4) : v, bads = shuffle([strict(sym) ? v : v - d, v - d * 2, v - d * rnd(3, 6), v - d * 7]);
  return T({ ask: `Which number is a solution of ${b(stmt(sym, v))}?`, answer: numChoice(good, bads),
    ways: [way('Test each choice', [`“${stmt(sym, v)}” says: x is ${WORD[sym]} ${fmt(v)}.`, strict(sym) ? `${fmt(v)} itself does not work: ${fmt(v)} is not ${WORD[sym]} itself.` : `${fmt(v)} itself would also work, because of “or equal to”.`, `${b(fmt(good))} ${sg(sym)} ${fmt(v)} is true`]),
      way('Picture the graph', [ineqLine(...span(v), v, sym), `Solutions are the numbers under the arrow${strict(sym) ? '' : ', including the filled circle'}. ${b(fmt(good))} is one of them.`, 'An inequality has many solutions, not just one.'])],
    hint: `Say it in words: x is ${WORD[sym]} ${fmt(v)}. Which choice fits?` }, 'ineqSol', { v, sym });
}
// s(v) is the rule in words; sym is what it means; x is the letter and what it stands for.
const RULES = [
  { s: v => `You must be ${k('at least ' + v + ' cm')} tall to go on a ride.`, sym: '≥', x: 'h', what: 'the height in cm', lo: 110, hi: 150 }, { s: v => `A lift can carry ${k('at most ' + v + ' people')}.`, sym: '≤', x: 'p', what: 'the number of people', lo: 6, hi: 20 },
  { s: v => `A team needs ${k('more than ' + v + ' points')} to reach the final.`, sym: '>', x: 'p', what: 'the number of points', lo: 20, hi: 60 }, { s: v => `To qualify, a runner must finish in ${k('under ' + v + ' seconds')}.`, sym: '<', x: 't', what: 'the time in seconds', lo: 12, hi: 70 },
  { s: v => `A carry-on bag can weigh ${k('no more than ' + v + ' kg')}.`, sym: '≤', x: 'w', what: 'the weight in kg', lo: 7, hi: 12 }, { s: v => `A game is for players who are ${k(v + ' or older')}.`, sym: '≥', x: 'a', what: 'the age in years', lo: 8, hi: 16 },
  { s: v => `Food must be kept at a temperature ${k('below ' + v + ' degrees')}.`, sym: '<', x: 't', what: 'the temperature in degrees', lo: 2, hi: 8 }, { s: v => `A song needs ${k('over ' + v + ' votes')} to enter the chart.`, sym: '>', x: 'v', what: 'the number of votes', lo: 50, hi: 500 },
];
function fromWords() {
  const r = pick(RULES), v = rnd(r.lo, r.hi), edge = strict(r.sym) ? 'does not count' : 'still counts';
  return T({ story: r.s(v), ask: `Which inequality says this? Here ${b(r.x)} is ${r.what}.`, answer: choice(stmt(r.sym, v, r.x), SYMS.filter(s => s !== r.sym).map(s => stmt(s, v, r.x))),
    ways: [way('Ask two questions', [`Which way? The allowed numbers are ${right(r.sym) ? 'bigger' : 'smaller'} than ${v}, so the sign opens towards ${right(r.sym) ? r.x : v}.`, `Is exactly ${v} allowed? Here it ${edge}, so ${strict(r.sym) ? 'there is no “or equal to” line' : 'the sign needs the “or equal to” line'}.`, `${b(stmt(r.sym, v, r.x))}`]),
      way('Test the edge and one more', [`Try ${r.x} = ${v}: allowed? ${strict(r.sym) ? 'No' : 'Yes'}.`, `Try ${r.x} = ${v + 1}: allowed? ${right(r.sym) ? 'Yes' : 'No'}.`, `Only ${b(stmt(r.sym, v, r.x))} agrees with both tests.`])],
    hint: `Is exactly ${v} allowed? And are the allowed numbers bigger or smaller than ${v}?` }, 'ineqStory', { v, sym: r.sym, x: r.x });
}
function edgeInteger() {
  const sym = pick(SYMS), v = rnd(-9, 9) + (chance(0.5) ? 0.5 : 0), small = right(sym);
  const ans = sym === '>' ? Math.floor(v) + 1 : sym === '≥' ? Math.ceil(v) : sym === '<' ? Math.ceil(v) - 1 : Math.floor(v), lo = Math.floor(v) - 5;
  return T({ ask: `What is the ${b(small ? 'smallest' : 'greatest')} integer that makes ${b(stmt(sym, v))} true?`, visual: ineqLine(lo, lo + 10, v, sym), answer: num(ans, { signed: true }),
    ways: [way('Walk along the number line', [`Solutions are to the ${small ? 'right' : 'left'} of ${fmt(v)}${strict(sym) ? '' : ', and ' + fmt(v) + ' itself counts'}.`, `Start at ${fmt(v)} and take the first integer you meet going ${small ? 'right' : 'left'}${Number.isInteger(v) && !strict(sym) ? ' (you are already standing on one)' : ''}.`, `That is ${b(fmt(ans))}.`]),
      way('Test the neighbours', [`${fmt(ans)} ${sg(sym)} ${fmt(v)} is true`, `${fmt(ans + (small ? -1 : 1))} ${sg(sym)} ${fmt(v)} is false, so nothing ${small ? 'smaller' : 'greater'} works.`])],
    hint: `Is ${fmt(v)} itself allowed? If not, which integer comes next on the ${small ? 'right' : 'left'}?` }, 'ineqEdge', { v, sym });
}
export function genIneq(L) {
  if (L === 1) return chance(0.5) ? readGraph(1) : pickSolution(1);
  if (L === 2) return pick([fromWords, () => readGraph(2), fromWords])();
  return pick([edgeInteger, () => pickSolution(3), fromWords])();
}
