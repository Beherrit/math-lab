// Five frames, and counting on from a group you already know. Choice answers only, spoken in words.
import { rnd, way } from '../../util.js';
import { pickQ, numOpt, numOpts, others, tag } from './kit.js';
import { tenFrame, joinPic } from './pics.js';
import { svg } from './svg.js';

const FIVE = [
  ['filled', 'How many dots are filled in the frame?'],
  ['see', 'Count the dots you can see.'],
  ['boxes', 'How many boxes have a dot?'],
];
const EMPTY = [
  ['empty', 'How many boxes are empty?'],
  ['missing', 'How many dots are missing?'],
  ['room', 'How many more dots would fill the frame?'],
];
const ON = [
  ['all', 'How many dots are there in all?'],
  ['now', 'Count on from the first group. How many now?'],
  ['together', 'Put the groups together. How many dots?'],
];

function fivePic(n) {
  const cell = 44;
  return svg(5 * cell + 8, cell + 8, tenFrame({ x: 4, y: 4, cell, a: n, cells: 5 }), { label: 'a five frame', data: { count: n } });
}
function choose(n, hi) {
  return { right: numOpt(n), wrong: numOpts(others(n, 0, hi, 3, 2)), big: true };
}

export function genFive(L) {
  const n = L === 1 ? rnd(1, 3) : L === 2 ? rnd(0, 5) : rnd(0, 5);
  const empty = L === 3;
  const [q, text] = (empty ? EMPTY : FIVE)[rnd(0, 2)];
  const pic = fivePic(n);
  const value = empty ? 5 - n : n;
  const ways = [
    way('Count the dots', [pic, `The frame has ${n} dots filled.`]),
    way('Use the five', [pic, `A five frame holds 5. ${n} are filled, so ${5 - n} are empty.`]),
  ];
  return pickQ({
    ask: text + tag('five', n, q), say: empty ? 'How many boxes are empty?' : 'How many dots are filled?',
    visual: pic, ...choose(value, 5), hint: 'A five frame is one row of five boxes. Count the dots, or count the empty boxes.',
    ways, t: { f: empty ? 'fiveempty' : 'count', q },
  });
}

export function genCountOn(L) {
  const a = L === 1 ? rnd(1, 3) : L === 2 ? rnd(2, 5) : rnd(3, 6);
  const b = L === 1 ? rnd(1, 2) : L === 2 ? rnd(1, 3) : rnd(2, 4);
  const [q, text] = ON[rnd(0, 2)];
  const pic = joinPic(a, b);
  const ways = [
    way('Count on', [pic, `Start at ${a}. Count on ${b} more.`]),
    way('Count them all', [pic, `The first group is ${a} and the second is ${b}.`]),
  ];
  return pickQ({
    ask: text + tag('on', a, b, q), say: 'How many dots are there in all?',
    expr: `${a} + ${b}`, visual: pic, ...choose(a + b, 12),
    hint: 'You already know the first group. Keep counting through the second group.',
    ways, t: { f: 'add', q },
  });
}
