// Sliding the graph of y = x². Inside the parentheses moves sideways.
import { rnd, pick, num } from '../../util.js';
import { shiftGraph } from './pics.js';
import { wordChoice, problem } from './ask.js';

const WHY = 'Replacing x with x − n slides the graph right. Adding n outside the rule slides it up. The move is not the opposite of the sign you see inside.';
const KINDS = [
  { id: 'right', word: 'Right', eq: n => `y = (x − ${n})²` },
  { id: 'left', word: 'Left', eq: n => `y = (x + ${n})²` },
  { id: 'up', word: 'Up', eq: n => `y = x² + ${n}` },
  { id: 'down', word: 'Down', eq: n => `y = x² − ${n}` },
];

export function genShift(L) {
  const kind = pick(KINDS);
  const n = rnd(1, 3);
  const visual = shiftGraph(kind.id, n);
  const eq = kind.eq(n);
  if (L === 1) {
    return problem({
      ask: `The solid curve is ${eq}. Which way did it move from y = x²?`,
      say: `The solid curve moved from y equals x squared. Which way did it move?`,
      visual, answer: wordChoice(kind.word, KINDS.map(k => k.word).filter(w => w !== kind.word)),
      hint: 'A change inside the parentheses slides the curve sideways.', why: WHY,
      t1: 'Read where the change sits', steps: [kind.id === 'right' || kind.id === 'left' ? 'The change is inside the parentheses, so the move is sideways.' : 'The change is outside the parentheses, so the move is up or down.', `This one moves ${kind.word.toLowerCase()}.`],
      t2: 'The sign inside', steps2: ['x − n moves the graph right, even though you see a minus.', `This graph moves ${kind.word.toLowerCase()} by ${n}.`],
    });
  }
  if (L === 2) {
    return problem({
      ask: `${eq} is y = x² after a move. How many units did it move?`,
      say: `The new curve is a move of y equals x squared. How many units did it move?`,
      visual, answer: num(n),
      hint: 'The number in the rule is the size of the move.', why: WHY,
      t1: 'Read the number', steps: [`The rule uses ${n}.`, `The curve moves ${n} unit${n > 1 ? 's' : ''}.`],
      t2: 'Direction is separate', steps2: [`The direction is ${kind.word.toLowerCase()}.`, `The question asks for the distance, which is ${n}.`],
    });
  }
  const options = KINDS.map(k => k.eq(n));
  return problem({
    ask: `Which rule moves y = x² ${kind.word.toLowerCase()} by ${n}?`,
    say: `Which rule moves y equals x squared ${kind.word.toLowerCase()} by ${n}?`,
    visual, answer: wordChoice(eq, options.filter(s => s !== eq)),
    hint: 'Sideways moves sit inside the parentheses. Up and down sit outside.', why: WHY,
    t1: 'Match the move', steps: [`${kind.word} by ${n} is written ${eq}.`, 'Inside means sideways. Outside means up or down.'],
    t2: 'Check the sign', steps2: ['A minus inside moves the graph right.', `The matching rule is ${eq}.`],
  });
}
