// Putting together (l0add) and taking away (l0sub) with pictures of counters, then with number sentences.
import { rnd, pick, way } from '../../util.js';
import { pickQ, opt, numOpt, numOpts, others, tag, numWord, countOn } from './kit.js';
import { joinPic, takePic } from './pics.js';

const MINUS = String.fromCharCode(0x2212);
const sentence = (a, op, b) => `${a} ${op} ${b}`;
const saySentence = (a, op, b) => `${numWord(a)} ${op === '+' ? 'plus' : 'minus'} ${numWord(b)}`;
const sums = (hi, lo = 2) => { let a, b; do { a = rnd(1, hi - 1); b = rnd(1, hi - a); } while (a + b < lo); return [a, b]; };

// ---- adding ----
const addWays = (a, b) => [way('Count them all', [`Count every dot: ${countOn(a + b)}.`, `${a} and ${b} make ${a + b}.`]),
  way(`See it as ${a} and ${b}`, [`Start at ${a}. Count on ${b} more.`, `${a + b}.`])];
const addBase = (a, b, q) => ({ right: numOpt(a + b), wrong: numOpts(others(a + b, 0, a + b <= 5 ? 6 : 10, 3, 2)), big: true, hint: 'Count the dots in the first group, then keep counting the second group.', ways: addWays(a, b), t: { f: 'add', a, b, q } });
const addAll = (a, b) => pickQ({ ask: 'How many in all?' + tag('addall', a, b), say: 'How many dots are there in all?', visual: joinPic(a, b), ...addBase(a, b, 'all') });
const addSum = (a, b, pic) => pickQ({ ask: 'Put them together.' + tag('addsum', a, b, pic ? 'p' : 'n'), expr: `${sentence(a, '+', b)} = ?`, say: `What is ${saySentence(a, '+', b)}?`, visual: pic ? joinPic(a, b) : undefined, ...addBase(a, b, pic ? 'sumpic' : 'sum') });
function addWhich(a, b) {
  const wrong = [[a, b + 1], [a + 1, b], [a, Math.max(1, b - 1)], [Math.max(1, a - 1), b]].filter(([x, y]) => [x, y].sort().join() !== [a, b].sort().join() && x + y <= 10);
  const o = ([x, y]) => opt(sentence(x, '+', y), saySentence(x, '+', y));
  return pickQ({ ask: 'Which one matches the picture?' + tag('addwhich', a, b), say: 'Which one matches the picture?', visual: joinPic(a, b), right: o([a, b]), wrong: wrong.map(o), big: true, mode: 'pick',
    hint: 'Count the dots in each group. The first number is the left group.', ways: addWays(a, b), t: { f: 'addwhich', a, b, q: 'which' } });
}
function addSwap(a, b) {
  return pickQ({ ask: 'Fill in the blank.' + tag('swap', a, b), expr: `${sentence(a, '+', b)} = ${b} + ?`, say: `${saySentence(a, '+', b)} is the same as ${numWord(b)} plus what?`, right: numOpt(a), wrong: numOpts(others(a, 0, 10, 3, 2)), big: true, mode: 'pick',
    hint: 'You can add in either order. The total stays the same.', ways: [way('Same dots, other order', [`${a} and ${b} make ${a + b}.`, `${b} and ${a} also make ${a + b}.`])], t: { f: 'addswap', a, b, q: 'swap' } });
}
export function genAdd(L) {
  const hi = L === 1 ? 5 : 10, [a, b] = sums(hi, L === 1 ? 2 : 4);
  if (L === 1) return pick([addAll, addAll, (x, y) => addSum(x, y, true), addWhich])(a, b);
  if (L === 2) return pick([addAll, (x, y) => addSum(x, y, true), (x, y) => addSum(x, y, false), addWhich])(a, b);
  return pick([(x, y) => addSum(x, y, false), (x, y) => addSum(x, y, false), addWhich, addAll, addSwap])(a, b);
}

// ---- taking away ----
const subWays = (total, take) => [way('Cross them out', [`Start with ${total}. Cross out ${take}.`, `Count what is left: ${total - take}.`]),
  way('Count back', [`Start at ${total} and count back ${take}.`, `You land on ${total - take}.`])];
const subBase = (total, take, q) => ({ mode: 'pick', right: numOpt(total - take), wrong: numOpts(others(total - take, 0, total <= 5 ? 6 : 10, 3, 2)), big: true, hint: 'Count only the counters that are not crossed out.', ways: subWays(total, take), t: { f: 'sub', total, take, q } });
const subLeft = (total, take) => pickQ({ ask: `${total} take away ${take}. How many are left?` + tag('subleft', total, take), say: `${numWord(total)} take away ${numWord(take)}. How many are left?`, visual: takePic(total, take), ...subBase(total, take, 'left') });
const subSum = (total, take, pic) => pickQ({ ask: 'Take away.' + tag('subsum', total, take, pic ? 'p' : 'n'), expr: `${sentence(total, MINUS, take)} = ?`, say: `What is ${saySentence(total, '-', take)}?`, visual: pic ? takePic(total, take) : undefined, ...subBase(total, take, pic ? 'sumpic' : 'sum') });
function subWhich(total, take) {
  const wrong = [[total, take + 1], [total + 1, take], [total, Math.max(1, take - 1)], [Math.max(2, total - 1), take]].filter(([x, y]) => (x !== total || y !== take) && y <= x && x <= 10);
  const o = ([x, y]) => opt(sentence(x, MINUS, y), saySentence(x, '-', y));
  return pickQ({ ask: 'Which one matches the picture?' + tag('subwhich', total, take), say: 'Which one matches the picture?', visual: takePic(total, take), right: o([total, take]), wrong: wrong.map(o), big: true, mode: 'pick',
    hint: 'Count all the counters. Then count the crossed ones.', ways: subWays(total, take), t: { f: 'subwhich', total, take, q: 'which' } });
}
function subTake(total, take) {
  return pickQ({ ask: 'How many were taken away?' + tag('subtake', total, take), expr: `${sentence(total, MINUS, '?')} = ${total - take}`, say: `${numWord(total)} take away some is ${numWord(total - take)}. How many were taken away?`,
    right: numOpt(take), wrong: numOpts(others(take, 0, 10, 3, 2)), big: true, mode: 'pick', hint: `Count back from ${total} until you reach ${total - take}.`, ways: subWays(total, take), t: { f: 'subtake', total, take, q: 'take' } });
}
export function genSub(L) {
  const hi = L === 1 ? 5 : 10, total = rnd(L === 1 ? 3 : 5, hi), take = rnd(1, L > 1 && rnd(0, 9) === 0 ? total : total - 1);
  if (L === 1) return pick([subLeft, subLeft, (x, y) => subSum(x, y, true), subWhich])(total, take);
  if (L === 2) return pick([subLeft, (x, y) => subSum(x, y, true), (x, y) => subSum(x, y, false), subWhich])(total, take);
  return pick([(x, y) => subSum(x, y, false), (x, y) => subSum(x, y, false), subWhich, subLeft, subTake])(total, take);
}
