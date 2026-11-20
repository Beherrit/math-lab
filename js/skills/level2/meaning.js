// What multiplying means: equal groups, arrays and repeated addition.
import { rnd, pick, chance, b, way, num, choice } from '../../util.js';
import { dots, groups } from './pics.js';
import { BLANK, cnt, rep, skips } from './words.js';

// Worked solutions for "g groups of n". `pic` is the picture to show first.
export function groupWays(g, n, pic = g <= 6 && n <= 10 ? groups(g, n) : null) {
  const p = g * n;
  return [way('Count the groups', [...(pic ? [pic] : []), `There are ${cnt(g, 'equal group')} with ${n} in each.`, `Count by ${n}s, once for each group: ${skips(g, n)}.`, `${g} × ${n} = ${b(p)}.`]),
    way('Add the same number', [`${g} groups of ${n} is ${rep(g, n)}.`, `That adds up to ${b(p)}. Multiplying is the short way to write it: ${g} × ${n} = ${p}.`])];
}
function picQ(g, n, array) {
  const pic = array ? dots(g, n) : groups(g, n);
  return { ask: array ? `The array has ${b(g + ' rows')} with ${b(n + ' dots')} in each row. How many dots in all?` : `How many dots are there in all?<!--${g} groups of ${n}-->`, expr: array ? `${g} × ${n}` : undefined, visual: pic, answer: num(g * n),
    hint: `How many are in one ${array ? 'row' : 'group'}? Count by that number.`, ways: groupWays(g, n, pic), _t: { f: 'mul', a: g, b: n, pic: array ? 'array' : 'groups' } };
}
function matchQ(g, n) {
  const pic = groups(g, n);
  return { ask: 'Which addition matches the picture?', expr: `${g} groups of ${n}`, exprSmall: true, visual: pic, answer: choice(rep(g, n), [`${g} + ${n}`, rep(g + 1, n), rep(g, n + 1)]),
    hint: 'Each group is one number in the addition. How many groups are there?', _t: { f: 'rep', g, n },
    ways: [way('One number for each group', [pic, `Each group holds ${n}, so write ${n} once for every group.`, `There are ${g} groups: ${b(rep(g, n))}.`]),
      way('Check the total', [`Count every dot: ${g * n}.`, `${rep(g, n)} = ${g * n}. It matches.`, `${g} + ${n} = ${g + n} only joins one ${g} and one ${n}. It does not show the groups.`])] };
}
function countQ(g, n, hideGroups) {
  const pic = g <= 6 ? groups(g, n) : null;
  return { ask: 'What number is missing?', expr: `${rep(g, n)} = ${hideGroups ? BLANK : g} × ${hideGroups ? n : BLANK}`, exprSmall: true, answer: num(hideGroups ? g : n),
    hint: hideGroups ? `How many times is ${n} written?` : 'Which number is being added again and again?', _t: { f: hideGroups ? 'first' : 'second', a: g, b: n },
    ways: [way('Read the addition', [`${n} is added ${g} times.`, `"${g} times ${n}" is written ${g} × ${n}.`, `The missing number is ${b(hideGroups ? g : n)}.`]),
      way('Picture the groups', [...(pic ? [pic] : []), `${rep(g, n)} is ${g} groups with ${n} in each.`, `Groups first, size second: ${g} × ${n}. The missing number is ${b(hideGroups ? g : n)}.`])] };
}
const HOLD = [['bags', 'apples'], ['boxes', 'pencils'], ['cars', 'people'], ['shelves', 'books'], ['packs', 'cards'], ['tables', 'chairs'], ['pages', 'photos'], ['teams', 'players']];
function sayQ(g, n) {
  const [box, thing] = pick(HOLD);
  return { ask: `There are ${b(g + ' ' + box)} with ${b(n + ' ' + thing)} in each. How many ${thing} is that?`, answer: num(g * n), hint: `That is ${g} equal groups of ${n}.`, ways: groupWays(g, n), _t: { f: 'mul', a: g, b: n } };
}
function meansQ(g, n) {
  const right = `${g} groups of ${n}`;
  return { ask: `What does ${b(`${g} × ${n}`)} mean?`, answer: choice(right, [`${g} plus ${n}`, `${g} groups, plus ${n} more`, `the digits ${g} and ${n} side by side`]),
    hint: 'The × sign is about equal groups.', _t: { f: 'means', g, n },
    ways: [way('Read × as "groups of"', [`${g} × ${n} is read "${g} times ${n}": ${n}, ${g} times over.`, `That is ${b(right)}, or ${rep(g, n)}.`]),
      way('Test with the total', [`${g} groups of ${n} makes ${g * n}.`, `${g} plus ${n} is only ${g + n}, so adding the two numbers once is something different.`])] };
}
function oneMoreQ(g, n) {
  const p = g * n;
  return { ask: `You know that ${b(`${g} × ${n} = ${p}`)}. One more group of ${n} makes ${g + 1} × ${n}. What is it?`, expr: `${g + 1} × ${n}`, answer: num(p + n), hint: `How much does one more group of ${n} add?`, _t: { f: 'mul', a: g + 1, b: n },
    ways: [way('Add one more group', [`${g} groups of ${n} is ${p}.`, `One more group adds ${n}: ${p} + ${n} = ${b(p + n)}.`]), way('Count the groups', [`Count by ${n}s, ${g + 1} times: ${skips(g + 1, n)}.`, `${g + 1} × ${n} = ${b(p + n)}.`])] };
}
export function genGroups(L) {
  if (L === 1) {
    const g = rnd(2, 6), n = rnd(g === 2 ? 3 : 2, 6), f = pick([picQ, picQ, matchQ, countQ]);
    return f === countQ ? countQ(g, n, true) : f(g, n, chance(0.3));
  }
  if (L === 2) { const g = rnd(2, 6), n = rnd(3, 9); return chance(0.5) ? picQ(g, n, true) : countQ(g, n, chance(0.5)); }
  const g = rnd(3, 9), n = rnd(3, 9);
  return pick([sayQ, sayQ, meansQ, oneMoreQ, countQ])(g, n, false);
}
