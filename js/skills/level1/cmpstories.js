// More level 1 story problems, each with a bar picture: how many fewer, the change is unknown, the start is unknown,
// and a bigger or smaller amount is unknown ("has 8 more than"). Step 1 stays within 20, step 2 within 100, step 3 within 1000.
import { rnd, pick, b, k, way, nm } from '../../util.js';
import { tell, plusWays, minusWays } from './stories.js';
import { partWhole, compareBars } from './bars.js';

const bigSmall = L => { const a = L === 1 ? rnd(9, 20) : L === 2 ? rnd(35, 99) : rnd(300, 990); return [a, L === 1 ? rnd(2, Math.min(10, a - 3)) : L === 2 ? rnd(12, a - 8) : rnd(110, a - 50)]; };
const twoParts = L => (L === 1 ? [rnd(2, 9), rnd(3, 9)] : L === 2 ? [rnd(12, 50), rnd(15, 45)] : [rnd(110, 450), rnd(120, 500)]);
const two = () => { const n = nm(); let m = nm(); while (m === n) m = nm(); return [n, m]; };
const THINGS = L => (L === 3 ? ['points', 'songs', 'photos', 'pages', 'steps'] : ['cards', 'points', 'songs', 'stickers', 'photos', 'pages']);
const sub = (a, c, d) => way('Use the bar picture', [`The whole bar is ${a}. One part is ${c}. The other part is the rest of the bar.`, `${a} − ${c} = ${b(d)}.`]);
// Two bars side by side: the gap, the shorter bar, or the longer bar is the number to find.
const gap = (a, c, d) => way('Use the bar picture', [`The longer bar is ${a} and the shorter bar is ${c}. The gap between them is what is left over.`, `${a} − ${c} = ${b(d)}.`]);
const gapUp = (c, d) => way('Use the bar picture', [`The shorter bar is ${c} and the gap is ${d}. The longer bar is the shorter bar plus the gap.`, `${c} + ${d} = ${b(c + d)}.`]);
const gapDown = (a, d, c) => way('Use the bar picture', [`The longer bar is ${a} and the gap is ${d}. The shorter bar is the longer bar with the gap taken off.`, `${a} − ${d} = ${b(c)}.`]);
const add = (x, y) => way('Use the bar picture', [`The two parts are ${x} and ${y}. Together they make the whole bar.`, `${x} + ${y} = ${b(x + y)}.`]);

// The change is unknown: something went down (or up) and you know the start and the end.
const CHANGE = [
  (a, c, n) => [`${n} had ${k(a + ' coins')} in a game. After an upgrade, ${n} has ${k(c + ' coins')} left.`, 'How many coins did the upgrade cost?', 'The coins that were spent.', [`started with: ${a}`, `have now: ${c}`], 'The amount went down and you want to know by how much, so subtract.'],
  (a, c, n) => [`${n}'s phone had ${k(a + ' photos')}. After deleting some, it has ${k(c + ' photos')}.`, 'How many photos were deleted?', 'The photos that were deleted.', [`before: ${a}`, `after: ${c}`], 'Photos went away and you want to know how many, so subtract.'],
  (a, c) => [`A bakery made ${k(a + ' rolls')}. By noon ${k(c + ' rolls')} are left.`, 'How many rolls were sold?', 'The rolls that were sold.', [`made: ${a}`, `left: ${c}`], 'Some were sold and some are left. The sold part is the gap, so subtract.'],
  (a, c) => [`A team had ${k(c + ' points')} at half time and ${k(a + ' points')} at the end of the game.`, 'How many points did the team score in the second half?', 'The points scored after half time.', [`at half time: ${c}`, `at the end: ${a}`], 'The total went up. How much it went up by is the gap, so subtract.'],
];
export function changeUnknown(L) {
  const [a, c] = bigSmall(L), d = a - c;
  return tell(pick(CHANGE)(a, c, nm()), 'sub', d, [sub(a, c, d), ...minusWays(a, c)], `${a} − ${c}`, { f: 'sub', a, b: c },
    { hint: 'You know the whole and one part. What is the other part?', visual: partWhole({ whole: a, parts: [d, c], hide: 0 }) });
}
// The start is unknown, and something was taken away (so add it back).
const TAKEN = [
  (x, y, n) => [`${n} had some coins in a game. ${n} spent ${k(x + ' coins')} on an upgrade and has ${k(y + ' coins')} left.`, `How many coins did ${n} have at the start?`, 'The coins ' + n + ' began with.', [`spent: ${x}`, `left: ${y}`], 'The start is the whole. The part spent and the part left make it, so add.'],
  (x, y) => [`A bakery had some rolls. It sold ${k(x + ' rolls')} and has ${k(y + ' rolls')} left.`, 'How many rolls did the bakery have in the morning?', 'The rolls before any were sold.', [`sold: ${x}`, `left: ${y}`], 'What was sold and what is left make the start, so add.'],
  (x, y, n) => [`${n} removed ${k(x + ' songs')} from a playlist. Now it has ${k(y + ' songs')}.`, 'How many songs were on the playlist before?', 'The songs on the playlist at the start.', [`removed: ${x}`, `left: ${y}`], 'The songs removed and the songs left were all there at the start, so add.'],
];
export function startAfterTake(L) {
  const [x, y] = twoParts(L);
  return tell(pick(TAKEN)(x, y, nm()), 'add', x + y, [add(x, y), ...plusWays(x, y)], `${x} + ${y}`, { f: 'add', xs: [x, y] },
    { hint: 'The start is the whole. Are you given both parts?', visual: partWhole({ whole: x + y, parts: [x, y], hide: 'whole' }) });
}
// The start is unknown, and something was added (so take it away).
const ADDED = [
  (x, t, n) => [`${n} took ${k(x + ' more photos')} on a trip. Now ${n}'s phone has ${k(t + ' photos')}.`, 'How many photos were on the phone before the trip?', 'The photos before the trip.', [`new photos: ${x}`, `now: ${t}`], 'The total grew by the new photos. Take them off to get back to the start, so subtract.'],
  (x, t) => [`A team scored ${k(x + ' points')} in the second half and finished with ${k(t + ' points')}.`, 'How many points did the team have at half time?', 'The points before the second half.', [`second half: ${x}`, `final score: ${t}`], 'The final score is the whole. Take away the second half to find the rest, so subtract.'],
  (x, t, n) => [`${n} added ${k(x + ' songs')} to a playlist. It now has ${k(t + ' songs')}.`, 'How many songs were on it before?', 'The songs before the new ones.', [`added: ${x}`, `now: ${t}`], 'The playlist grew by the songs added. Take them away to get the start, so subtract.'],
];
export function startBeforeAdd(L) {
  const [y, x] = twoParts(L), t = x + y;
  return tell(pick(ADDED)(x, t, nm()), 'sub', y, [sub(t, x, y), ...minusWays(t, x)], `${t} − ${x}`, { f: 'sub', a: t, b: x },
    { hint: 'The total is the whole. You know one part. What is the other part?', visual: partWhole({ whole: t, parts: [y, x], hide: 0 }) });
}
// How many fewer? Two amounts side by side, and the gap is unknown.
export function cmpFewer(L) {
  const [a, c] = bigSmall(L), [n, m] = two(), d = a - c, what = pick(THINGS(L));
  const row = [`${n} has ${k(a + ' ' + what)}. ${m} has ${k(c + ' ' + what)}.`, `How many fewer ${what} does ${m} have than ${n}?`, `The gap between the two amounts of ${what}.`, [`${n}: ${a}`, `${m}: ${c}`], '"How many fewer" asks for the gap between two amounts, so subtract.'];
  return tell(row, 'sub', d, [gap(a, c, d), ...minusWays(a, c)], `${a} − ${c}`, { f: 'sub', a, b: c },
    { hint: 'Find the gap between the two amounts.', visual: compareBars({ a, c, nameA: n, nameB: m, hide: 'gap' }) });
}
// A bigger or smaller amount is unknown, told with "more than" or "fewer than".
export function otherAmount(L) {
  const [n, m] = two(), what = pick(THINGS(L)), bigger = pick([true, false]), more = pick([true, false]);
  if (bigger) {
    const [c, d] = twoParts(L), a = c + d;
    const row = [more ? `${n} has ${k(d + ' more ' + what)} than ${m}. ${m} has ${k(c + ' ' + what)}.` : `${m} has ${k(d + ' fewer ' + what)} than ${n}. ${m} has ${k(c + ' ' + what)}.`, `How many ${what} does ${n} have?`, `The number of ${what} ${n} has.`, [`${d} ${more ? 'more' : 'fewer'}`, `${m}: ${c}`], more ? '"More than" means this amount is the other one plus extra, so add.' : '"Fewer than" means the other amount has extra on top, so add to the smaller one.'];
    return tell(row, 'add', a, [gapUp(c, d), ...plusWays(c, d)], `${c} + ${d}`, { f: 'add', xs: [c, d] }, { hint: 'Is the amount you want the bigger one or the smaller one?', visual: compareBars({ a, c, nameA: n, nameB: m, hide: 'a' }) });
  }
  const [a, d] = bigSmall(L), c = a - d;
  const row = [more ? `${n} has ${k(d + ' more ' + what)} than ${m}. ${n} has ${k(a + ' ' + what)}.` : `${m} has ${k(d + ' fewer ' + what)} than ${n}. ${n} has ${k(a + ' ' + what)}.`, `How many ${what} does ${m} have?`, `The number of ${what} ${m} has.`, [`${d} ${more ? 'more' : 'fewer'}`, `${n}: ${a}`], 'The other amount is smaller by the difference, so subtract.'];
  return tell(row, 'sub', c, [gapDown(a, d, c), ...minusWays(a, d)], `${a} − ${d}`, { f: 'sub', a, b: d }, { hint: 'Is the amount you want the bigger one or the smaller one?', visual: compareBars({ a, c, nameA: n, nameB: m, hide: 'c' }) });
}
