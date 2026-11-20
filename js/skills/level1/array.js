// Rows and columns: counting an array by adding equal rows, the bridge to multiplying (3 rows of 4 is written 3 x 4).
import { rnd, pick, chance, shuffle, b, way, nm, num, choice } from '../../util.js';
import { dotArray } from './counters.js';
import { BLANK, cnt, mark, countList } from './words.js';

const same = (c, r) => Array(r).fill(c).join(' + ');
const rowsOf = (r, c) => `${cnt(r, 'row')} of ${c}`;
// The two ways that nearly every array question needs: add the rows, or skip count by the row size.
function rowWays(r, c, what = 'counters') {
  const t = r * c;
  return [way('Add the rows', [`Each row has ${c} ${what}, and there are ${cnt(r, 'row')}.`, `${same(c, r)} = ${b(t)}.`]),
    way('Skip count', [`Count by ${c}s, once for each row: ${countList(0, r, 1, c)}.`, `${rowsOf(r, c)} is written ${r} × ${c}. You land on ${b(t)}.`])];
}
const pic = (r, c, hidden = 0) => dotArray(r, c, hidden);
const totalQ = (r, c) => ({ ask: `How many counters are there in all?${mark(r, c)}`, visual: pic(r, c), answer: num(r * c), hint: 'Count one row, then count the same amount for every row.', _t: { f: 'mul', a: r, b: c }, ways: rowWays(r, c) });
function countQ(r, c, what) {
  const t = r * c, rows = what === 'rows', ans = rows ? r : c;
  return { ask: `How many ${what} are there? ${rows ? 'A row goes across.' : 'A column goes down.'}${mark(r, c, what)}`, visual: pic(r, c), answer: num(ans), hint: rows ? 'Rows run from side to side. Count them from top to bottom.' : 'Columns run from top to bottom. Count them from side to side.', _t: { f: 'arrcount', r, c, what },
    ways: [way(`Count the ${what}`, [rows ? 'Count the lines of counters from the top to the bottom.' : 'Count the lines of counters from the left to the right.', `There are ${b(ans)} ${what}.`]),
      way('Use the total', [`There are ${t} counters in all, and ${rows ? c : r} in each ${rows ? 'row' : 'column'}.`, `${t} ÷ ${rows ? c : r} = ${b(ans)} ${what}.`])] };
}
function addRowsQ(r, c) {
  return { ask: 'Add the rows to find how many counters there are in all.', expr: `${same(c, r)} = ${BLANK}`, visual: pic(r, c), answer: num(r * c), hint: 'Each row has the same number of counters. Add one row at a time.', _t: { f: 'mul', a: r, b: c }, ways: rowWays(r, c) };
}
// Which addition adds up the rows? The wrong ones have a different value, so only one fits.
function sentenceQ(r, c) {
  const t = r * c, cand = [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]].filter(([x, y]) => x >= 2 && y >= 2).map(([x, y]) => [same(y, x), x * y]).concat([[`${r} + ${c}`, r + c]]);
  const wrong = shuffle(cand).filter(([, v], i, a) => v !== t && a.findIndex(([, w]) => w === v) === i).slice(0, 3).map(([s]) => s);
  return { ask: `Each row has the same number of counters. Which addition adds up the rows?${mark(r, c)}`, visual: pic(r, c), answer: choice(same(c, r), wrong), choiceBig: true, hint: 'Count the rows and how many are in each one. The sentence needs one number for each row.', _t: { f: 'arrsent' },
    ways: [way('Read the picture', [`There are ${cnt(r, 'row')}, so the sentence has ${r} numbers.`, `Each row has ${c}, so each number is ${c}: ${b(same(c, r))}.`]), way('Check the total', [`The array has ${t} counters in all.`, `${same(c, r)} = ${t}, the same as the counters in the array. None of the other sentences come to ${t}, so ${b(same(c, r))} fits.`])] };
}
function turnQ(r, c) {
  if (r === c) return turnQ(r, c === 5 ? 4 : c + 1);
  return { ask: `The array shows ${rowsOf(r, c)}. Turn it on its side and it shows ${rowsOf(c, r)}. How many counters are there in all?`, visual: pic(r, c), answer: num(r * c), hint: 'Does turning the picture add any counters or take any away?', _t: { f: 'mul', a: r, b: c },
    ways: [way('Count the turned array', [`Turned on its side, there are ${cnt(c, 'row')} of ${r}.`, `${same(r, c)} = ${b(r * c)}.`]), way('Count the picture as it is', [`${rowsOf(r, c)}: ${same(c, r)} = ${b(r * c)}.`])] };
}
function slipQ(r, c) {
  return { ask: `${nm()} counts ${cnt(r, 'row')} and ${cnt(c, 'column')} and adds them: ${r} + ${c} = ${b(r + c)}. That is not how many counters there are. How many are there in all?${mark(r, c)}`, visual: pic(r, c), answer: num(r * c),
    hint: 'Counting the rows and columns only counts the edge. How many counters does each row hold?', _t: { f: 'mul', a: r, b: c },
    ways: [way('Find the slip', [`${r} + ${c} counts only the edge of the array. Every one of the ${r} rows holds ${c} counters.`, `${same(c, r)} = ${b(r * c)}.`]), rowWays(r, c)[1]] };
}
function hiddenQ(r, c, h) {
  const t = r * c;
  return { ask: `A card covers ${cnt(h, 'row')}. All ${r} rows are the same. How many counters are there in all?${mark(r, c, h)}`, visual: pic(r, c, h), answer: num(t), hint: 'The covered rows look just like the rows you can see.', _t: { f: 'mul', a: r, b: c },
    ways: [way('Use the row you can see', [`One row has ${c} counters. There are ${r} rows in all.`, `${same(c, r)} = ${b(t)}.`]), way('Count what you see, then add the covered rows', [`You can see ${cnt(r - h, 'row')}: ${(r - h) * c} counters.`, `${cnt(h, 'covered row')} of ${c} is ${h * c} more. ${(r - h) * c} + ${h * c} = ${b(t)}.`])] };
}
const PLACES = [['A cinema', 'seats'], ['A bakery tray', 'muffins'], ['A photo wall', 'photos'], ['A garden', 'plants'], ['A parking lot', 'cars'], ['A shelf', 'game cases']];
function placeQ(r, c) {
  const [where, what] = pick(PLACES);
  return { ask: `${where} has ${cnt(r, 'row')} with ${c} ${what} in each row. How many ${what} are there in all?`, answer: num(r * c), hint: 'Picture the rows. Add the same number for every row.', _t: { f: 'mul', a: r, b: c }, ways: rowWays(r, c, what) };
}
function bridgeQ(r, c, withPic) {
  return { ask: `${rowsOf(r, c)} is written ${b(`${r} × ${c}`)}. How many counters is that?`, expr: `${r} × ${c}`, visual: withPic ? pic(r, c) : undefined, answer: num(r * c), hint: 'Picture the rows of counters and add one row at a time.', _t: { f: 'mul', a: r, b: c }, ways: rowWays(r, c) };
}
const sizes = () => { let r, c; do { r = rnd(2, 5); c = rnd(2, 5); } while (r === 2 && c === 2); return [r, c]; };

export function genArray(L) {
  if (L === 1) {
    const r = rnd(2, 4), c = pick([2, 3, 5]), t = pick(['total', 'total', 'rows', 'cols', 'add', 'sentence']);
    if (t === 'rows') return countQ(r, c, 'rows');
    if (t === 'cols') return countQ(r, c, 'columns');
    if (t === 'add') return addRowsQ(r, c);
    if (t === 'sentence') return r === 2 && c === 2 ? totalQ(r, 3) : sentenceQ(r, c);
    return totalQ(r, c);
  }
  const [r, c] = sizes(), t = L === 2 ? pick(['total', 'add', 'sentence', 'turn', 'slip', 'bridge', 'rows']) : pick(['hidden', 'hidden', 'place', 'slip', 'turn', 'bridge', 'sentence']);
  if (t === 'total') return totalQ(r, c);
  if (t === 'add') return addRowsQ(r, c);
  if (t === 'sentence') return sentenceQ(r, c);
  if (t === 'turn') return turnQ(r, c);
  if (t === 'slip') return slipQ(r, c);
  if (t === 'bridge') return bridgeQ(r, c, L === 2);
  if (t === 'hidden') return hiddenQ(rnd(3, 5), rnd(3, 5), chance(0.6) ? 1 : 2);
  if (t === 'place') return placeQ(r, c);
  return countQ(r, c, pick(['rows', 'columns']));
}
