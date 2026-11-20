// One-step equations with all four operations, shown as a balance.
import { R, rnd, pick, chance, fmt, money, F, b, k, way, nm, num } from '../../util.js';
import { T, numChoice } from './helpers.js';
import { balance } from './visuals.js';

// For each operation: how the equation looks, how to undo it, and the plain-word question behind it.
const OPS = {
  '+': { left: (v, a) => `${v} + ${fmt(a)}`, solve: (a, c) => R(c - a), undo: 'subtract', inv: '−', think: (a, c) => `What number plus ${fmt(a)} makes ${fmt(c)}?` },
  '-': { left: (v, a) => `${v} − ${fmt(a)}`, solve: (a, c) => R(c + a), undo: 'add', inv: '+', think: (a, c) => `What number is ${fmt(c)} after ${fmt(a)} is taken away?` },
  '*': { left: (v, a) => `${fmt(a)}${v}`, solve: (a, c) => R(c / a), undo: 'divide by', inv: '÷', think: (a, c) => `${fmt(a)} equal groups make ${fmt(c)}. How big is one group?` },
  '/': { left: (v, a) => F(v, fmt(a)), solve: (a, c) => R(c * a), undo: 'multiply by', inv: '×', think: (a, c) => `A number is split into ${fmt(a)} equal parts and each part is ${fmt(c)}. What was the number?` },
};
const flat = (op, v, a) => (op === '/' ? `${v} ÷ ${fmt(a)}` : OPS[op].left(v, a));
function eqWays(op, a, c, v = 'x') {
  const o = OPS[op], x = o.solve(a, c), check = { '+': `${fmt(x)} + ${fmt(a)}`, '-': `${fmt(x)} − ${fmt(a)}`, '*': `${fmt(a)} × ${fmt(x)}`, '/': `${fmt(x)} ÷ ${fmt(a)}` }[op];
  return [way('Keep the balance', [balance(flat(op, v, a), fmt(c)), `Both sides weigh the same. Whatever you do to one side, do to the other, and it stays balanced.`, `To get ${v} alone, undo “${op === '+' ? '+ ' + fmt(a) : op === '-' ? '− ' + fmt(a) : op === '*' ? '× ' + fmt(a) : '÷ ' + fmt(a)}”: ${o.undo} ${fmt(a)} on both sides.`, `${v} = ${fmt(c)} ${o.inv} ${fmt(a)} = ${b(fmt(x))}`]),
    way('Think it through, then check', [o.think(a, c), `${fmt(c)} ${o.inv} ${fmt(a)} = ${b(fmt(x))}`, `Check by putting it back in: ${check} = ${fmt(c)}`])];
}
function numbers(op, L) {
  if (L === 3) {
    if (op === '+' || op === '-') { const a = rnd(11, 95) / 10, x = rnd(11, 95) / 10; return [a, op === '+' ? R(x + a) : R(x - a)]; }
    if (op === '*') { const a = pick([0.5, 1.5, 2.5, 0.2, 0.4, 1.2]), x = rnd(2, 12) * (a === 0.2 || a === 0.4 || a === 1.2 ? 5 : 2); return [a, R(a * x)]; }
    return [rnd(2, 9), rnd(11, 65) / 10];
  }
  if (op === '+' || op === '-') { const a = rnd(L === 1 ? 2 : 12, L === 1 ? 12 : 60), x = rnd(L === 1 ? 2 : 12, L === 1 ? 15 : 70); return [a, op === '+' ? x + a : x]; }
  const a = rnd(2, L === 1 ? 6 : 12), x = rnd(2, L === 1 ? 9 : 15);
  return op === '*' ? [a, a * x] : [a, x];
}
function solve(L) {
  const op = pick(L === 1 ? ['+', '+', '-', '-', '*'] : ['+', '-', '*', '/', '*', '/']), [a, c] = numbers(op, L), v = pick(['x', 'n', 'y', 't']), o = OPS[op], x = o.solve(a, c);
  if (x <= 0 || (op === '-' && L === 3 && c <= 0)) return solve(L);
  const flip = op === '+' && chance(0.3), left = flip ? `${fmt(a)} + ${v}` : o.left(v, a);
  return T({ ask: `Solve for ${v}.`, expr: `${left} = ${fmt(c)}`, answer: num(x), ways: eqWays(op, a, c, v),
    hint: `What is being done to ${v}? Do the opposite to both sides.` }, 'eq', { op, a, c });
}
function whichValue() {
  const op = pick(['+', '-', '*']), [a, c] = numbers(op, 1), o = OPS[op], x = o.solve(a, c), wrong = { '+': [c + a, c, a], '-': [Math.abs(c - a), c, a], '*': [c - a, c + a, c] }[op];
  return T({ ask: 'Which value of x makes the equation true?', expr: `${o.left('x', a)} = ${c}`, answer: numChoice(x, [...wrong, x + 1]),
    ways: [way('Try each choice', [`A solution is a number that makes both sides equal when you put it in for x.`, `Try ${x}: ${{ '+': `${x} + ${a}`, '-': `${x} − ${a}`, '*': `${a} × ${x}` }[op]} = ${c}`, `The other choices do not give ${c}, so they are not solutions.`, `The answer is x = ${b(x)}.`]), eqWays(op, a, c)[0]],
    hint: 'Put each choice in place of x. Which one makes both sides the same?' }, 'eq', { op, a, c });
}
const STORIES = {
  '+': [(a, c, n) => [`${n} had some songs on a playlist, added ${k(a + ' more')}, and now has ${k(c + ' songs')}.`, 'How many songs were on the playlist at the start?', 'songs at the start']],
  '-': [(a, c, n) => [`${n} spent ${k('$' + a)} at a concert and has ${k('$' + c)} left.`, `How many dollars did ${n} have before the concert?`, 'dollars at the start']],
  '*': [(a, c, n) => [`${n} buys ${k(a + ' school play tickets')} that all cost the same. The total is ${k('$' + c)}.`, 'What is the price of one ticket, in dollars?', 'the price of one ticket']],
  '/': [(a, c, n) => [`${n} and friends split a bill equally between ${k(a + ' people')}. Each person pays ${k('$' + c)}.`, 'How much was the whole bill, in dollars?', 'the whole bill']],
};
STORIES['+'].push((a, c) => [`A cyclist has already ridden ${k(a + ' km')} of a route that is ${k(c + ' km')} long.`, 'How many km are still to go?', 'km still to go']);
STORIES['-'].push((a, c) => [`After ${k(a + ' players')} left a game lobby, ${k(c + ' players')} were still there.`, 'How many players were in the lobby at first?', 'players at first']);
STORIES['*'].push((a, c) => [`A coach orders ${k(a + ' team water bottles')} that all cost the same. The total is ${k('$' + c)}.`, 'What is the price of one bottle, in dollars?', 'the price of one bottle']);
STORIES['/'].push((a, c) => [`A coach puts players into ${k(a + ' equal teams')} with ${k(c + ' players')} on each team.`, 'How many players are there in all?', 'players in all']);
export function eqWord() {
  const op = pick(['+', '-', '*', '/']), [a, c] = numbers(op, 2), o = OPS[op], x = o.solve(a, c), [story, ask, what] = pick(STORIES[op])(a, c, nm()), eq = `${flat(op, 'x', a)} = ${c}`;
  const ways = eqWays(op, a, c); ways[0].s.unshift(`Let x be ${what}. The story says: ${b(eq)}`);
  return T({ story, ask, answer: num(x), ways, op: { '+': 'sub', '-': 'add', '*': 'div', '/': 'mul' }[op],
    read: { find: what[0].toUpperCase() + what.slice(1) + '.', know: [String(a), String(c)], clue: 'The unknown comes first in the story, so write an equation and undo what happened to it.', plan: `${eq}, so x = ${c} ${o.inv} ${a}` },
    hint: `Call the unknown x. What happened to x in the story, and what did it end up as?` }, 'eq', { op, a, c });
}
export function genEq(L) {
  if (L === 1) return chance(0.3) ? whichValue() : solve(1);
  if (L === 2) return chance(0.3) ? eqWord() : solve(2);
  return chance(0.3) ? eqWord() : solve(3);
}
