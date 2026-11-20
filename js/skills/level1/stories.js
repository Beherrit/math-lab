// Level 1 story problems: putting together, taking away, comparing, and two steps.
import { rnd, pick, b, k, way, nm, num } from '../../util.js';
import { addWays, subWays } from './facts.js';
import { addBigWays, subBigWays } from './addsub.js';

// The right worked solutions for the size of the numbers.
export const plusWays = (a, c) => (a <= 10 && c <= 10 ? addWays(a, c) : addBigWays(a, c));
export const minusWays = (a, c) => (a <= 20 && c <= 10 ? subWays(a, c) : subBigWays(a, c));
// Builds the story problem object from a context row [story, ask, find, know, clue].
export function tell(row, op, value, ways, plan, t, extra = {}) {
  const [story, ask, find, know, clue] = row;
  return { story, ask, answer: num(value), op, ways, read: { find, know, clue, plan }, _t: t, ...extra };
}
const two = () => { const n = nm(); let m = nm(); while (m === n) m = nm(); return [n, m]; };

const ADD = [
  (a, c, n) => [`${n} scored ${k(a + ' points')} in the first half of a game and ${k(c + ' points')} in the second half.`, `How many points did ${n} score in the whole game?`, 'The points for the whole game.', [`first half: ${a}`, `second half: ${c}`], 'The whole game is both halves put together, so add.'],
  (a, c, n) => [`${n}'s phone has ${k(a + ' photos')} from a trip. ${n} takes ${k(c + ' more photos')}.`, 'How many trip photos are on the phone now?', 'The number of photos after taking more.', [`already there: ${a}`, `new photos: ${c}`], 'Taking more makes the amount grow, so add.'],
  (a, c) => [`A school show sold ${k(a + ' tickets')} on Friday and ${k(c + ' tickets')} on Saturday.`, 'How many tickets were sold in all?', 'Tickets for both days together.', [`Friday: ${a}`, `Saturday: ${c}`], '"In all" means everything together, so add.'],
  (a, c, n) => [`${n} collected ${k(a + ' cans')} for recycling. A neighbour gave ${n} ${k(c + ' more cans')}.`, `How many cans does ${n} have now?`, 'The cans after the neighbour helped.', [`collected: ${a}`, `from the neighbour: ${c}`], 'Getting more makes the pile bigger, so add.'],
  (a, c, n) => [`${n} read ${k(a + ' pages')} of a book last week and ${k(c + ' pages')} this week.`, `How many pages has ${n} read so far?`, 'The pages read in both weeks.', [`last week: ${a}`, `this week: ${c}`], '"So far" means both weeks together, so add.'],
];
const SUB = [
  (a, c, n) => [`${n} had ${k(a + ' coins')} in a game and spent ${k(c + ' coins')} on an upgrade.`, `How many coins does ${n} have left?`, 'The coins that are left.', [`started with: ${a}`, `spent: ${c}`], 'Spending takes some away, and "left" asks what remains, so subtract.'],
  (a, c) => [`A train has ${k(a + ' passengers')}. At the stadium, ${k(c + ' passengers')} get off.`, 'How many passengers are still on the train?', 'The passengers still on the train.', [`on the train: ${a}`, `got off: ${c}`], 'People getting off makes the number smaller, so subtract.'],
  (a, c) => [`A bakery made ${k(a + ' bread rolls')} and sold ${k(c + ' of them')} before lunch.`, 'How many rolls are left?', 'The rolls not sold yet.', [`made: ${a}`, `sold: ${c}`], '"Left" after selling some means subtract.'],
  (a, c, n) => [`${n}'s phone had ${k(a + ' photos')}. ${n} deleted ${k(c + ' blurry ones')}.`, 'How many photos are on the phone now?', 'The photos after deleting.', [`photos: ${a}`, `deleted: ${c}`], 'Deleting takes photos away, so subtract.'],
  (a, c, n) => [`${n} has ${k(a + ' pages')} to read for school and has read ${k(c + ' pages')} so far.`, `How many pages does ${n} still have to read?`, 'The pages not read yet.', [`to read: ${a}`, `read so far: ${c}`], 'All the pages are the whole and the pages already read are one part. The other part is found by subtracting.'],
];
const CMP = [
  (a, c, n, m) => [`${n} scored ${k(a + ' points')}. ${m} scored ${k(c + ' points')}.`, `How many more points did ${n} score than ${m}?`, 'The gap between the two scores.', [`${n}: ${a}`, `${m}: ${c}`], '"How many more" asks for the gap between two amounts, so subtract.'],
  (a, c) => [`In a quiz the red team has ${k(a + ' points')} and the blue team has ${k(c + ' points')}.`, 'How many more points does the red team have?', 'How far ahead the red team is.', [`red: ${a}`, `blue: ${c}`], '"How many more" asks for the gap, so subtract.'],
  (a, c, n) => [`${n}'s workout playlist has ${k(a + ' songs')}. The road trip playlist has ${k(c + ' songs')}.`, 'How many more songs are on the workout playlist?', 'The difference between the two playlists.', [`workout: ${a} songs`, `road trip: ${c} songs`], '"How many more" compares two amounts, so subtract.'],
  (a, c, n) => [`${n} wants to save ${k(a + ' dollars')}. So far ${n} has saved ${k(c + ' dollars')}.`, `How many more dollars does ${n} need to save?`, 'The money still missing.', [`goal: ${a} dollars`, `saved so far: ${c} dollars`], '"How many more" is the gap from what is saved up to the goal, so subtract.'],
];
const addNums = L => (L === 1 ? [rnd(4, 12), rnd(3, 8)] : L === 2 ? [rnd(15, 58), rnd(12, 40)] : [rnd(120, 560), rnd(105, 430)]);
function subNums(L) {
  const a = L === 1 ? rnd(9, 20) : L === 2 ? rnd(35, 99) : rnd(300, 990);
  return [a, L === 1 ? rnd(2, Math.min(a - 2, 10)) : L === 2 ? rnd(12, a - 8) : rnd(110, a - 50)];
}
export function addWord(L) {
  const [a, c] = addNums(L);
  return tell(pick(ADD)(a, c, nm()), 'add', a + c, plusWays(a, c), `${a} + ${c}`, { f: 'add', xs: [a, c] }, { hint: 'Two amounts are being put together.' });
}
export function subWord(L) {
  const [a, c] = subNums(L);
  return tell(pick(SUB)(a, c, nm()), 'sub', a - c, minusWays(a, c), `${a} − ${c}`, { f: 'sub', a, b: c }, { hint: 'Some of the starting amount goes away.' });
}
export function cmpWord(L) {
  const [a, c] = subNums(L);
  return tell(pick(CMP)(a, c, ...two()), 'sub', a - c, minusWays(a, c), `${a} − ${c}`, { f: 'sub', a, b: c }, { hint: 'Find the gap between the two numbers. You can count up from the smaller one.' });
}

// Two-step stories: [row maker, signs of the second and third number, steps for the second way].
const TWO = [
  [(a, c, e) => [`A ferry has ${k(a + ' passengers')}. At the island ${k(c + ' get off')} and ${k(e + ' get on')}.`, 'How many passengers are on the ferry now?', 'The passengers after the stop.', [`on the ferry: ${a}`, `got off: ${c}`, `got on: ${e}`], 'Getting off means subtract. Getting on means add. That is two steps.'], [-1, 1],
    (a, c, e) => [`Let the new passengers on first: ${a} + ${e} = ${a + e}.`, `Then the others get off: ${a + e} − ${c} = ${b(a - c + e)}.`]],
  [(a, c, e, n) => [`${n} scored ${k(a + ' points')} in round one and ${k(c + ' points')} in round two, then lost ${k(e + ' points')} for a penalty.`, `What is ${n}'s score now?`, 'The score after both rounds and the penalty.', [`round one: ${a}`, `round two: ${c}`, `penalty: ${e}`], 'Points scored are added. Points lost are subtracted. That is two steps.'], [1, -1],
    (a, c, e) => [`Take the penalty off round two first: ${c} − ${e} = ${c - e}.`, `Then add round one: ${a} + ${c - e} = ${b(a + c - e)}.`]],
  [(a, c, e) => [`A snack stand had ${k(a + ' drinks')}. It sold ${k(c + ' in the morning')} and ${k(e + ' in the afternoon')}.`, 'How many drinks are left?', 'The drinks not sold.', [`drinks: ${a}`, `morning: ${c}`, `afternoon: ${e}`], 'Both sales take drinks away. Subtract twice, or add the sales and subtract once.'], [-1, -1],
    (a, c, e) => [`Add the two sales first: ${c} + ${e} = ${c + e}.`, `Take that from the start: ${a} − ${c + e} = ${b(a - c - e)}.`]],
];
export function twoStep(L) {
  if (L === 1) return null;
  const [row, [s1, s2], other] = pick(TWO), big = L === 3;
  const a = big ? rnd(230, 480) : rnd(40, 60), c = big ? rnd(35, 120) : rnd(8, 20), e = big ? rnd(15, s2 < 0 && s1 > 0 ? c - 5 : 95) : rnd(5, s2 < 0 && s1 > 0 ? c - 2 : 18);
  const mid = a + s1 * c, end = mid + s2 * e, sg = s => (s > 0 ? '+' : '−');
  return tell(row(a, c, e, nm()), 'multi', end, [way('One step at a time', [`First: ${a} ${sg(s1)} ${c} = ${mid}.`, `Then: ${mid} ${sg(s2)} ${e} = ${b(end)}.`]), way('A different order', other(a, c, e))],
    `${a} ${sg(s1)} ${c}, then ${sg(s2)} ${e}`, { f: 'add', xs: [a, s1 * c, s2 * e] }, { hint: 'Do one step, write down the result, then do the next step.' });
}
