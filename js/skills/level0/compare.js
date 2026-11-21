// More, fewer, the same (l0more) and smallest to biggest (l0order).
import { rnd, pick, shuffle, way } from '../../util.js';
import { pickQ, opt, numOpt, numOpts, others, big, tag, numWord, numList, countOn, BLANK } from './kit.js';
import { groupTile } from './pics.js';

// ---- l0more ----
const grp = n => opt(groupTile(n), '');
const distinct = (k, lo, hi) => shuffle(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)).slice(0, k);
const moreWays = (dir, a, b) => [way('Count each one', [`Count the first: ${a}. Count the second: ${b}.`, `${Math.max(a, b)} is more and ${Math.min(a, b)} is fewer.`]),
  way('Match them up', ['Pair one from this side with one from that side.', `${dir === 'less' ? 'The side with some left over has more, so the other side has fewer.' : 'The side with some left over has more.'}`])];

function groups(L, dir) {
  const hi = L === 1 ? 5 : 10, k = L === 1 ? 2 : pick([2, 3]), xs = distinct(k, 1, hi);
  const right = dir === 'less' ? Math.min(...xs) : Math.max(...xs), most = k === 3;
  const word = dir === 'less' ? (most ? 'fewest' : 'fewer') : most ? 'most' : 'more';
  return pickQ({ ask: `Which group has ${word}?` + tag('groups', dir, xs.join(' ')), say: `Which group has ${word}?`, right: grp(right), wrong: xs.filter(x => x !== right).map(grp), quiet: true, mode: 'pick',
    hint: 'Count the dots in each group. Compare the numbers.', ways: moreWays(dir, ...xs), t: { f: 'more', dir: dir === 'less' ? 'min' : 'max', q: `groups-${dir}` } });
}
function same(hi) {
  const n = rnd(2, hi), wrong = others(n, 1, hi, 2, 3);
  return pickQ({ ask: 'Tap the group with the same number.' + tag('same', n), say: 'Tap the group with the same number of dots.', visual: groupTile(n), right: grp(n), wrong: wrong.map(grp), quiet: true, mode: 'pick',
    hint: 'Count the dots in the first group. Find one with the same count.', ways: [way('Count and match', [`The first group has ${n} dots.`, `Find the group that also has ${n}.`])], t: { f: 'same', n, q: 'same' } });
}
function numbers(hi, dir, k) {
  const xs = distinct(k, 0, hi), right = dir === 'less' ? Math.min(...xs) : Math.max(...xs), word = dir === 'less' ? 'less' : 'more';
  return pickQ({ ask: `Which number is ${word}?` + tag('nums', dir, xs.join(' ')), say: `Which number is ${word}?`, right: numOpt(right), wrong: numOpts(xs.filter(x => x !== right)), big: true, mode: 'pick',
    hint: 'The number you say later when you count is more.', ways: [way('Count up', [`Count: ${countOn(Math.max(...xs))}.`, `${Math.max(...xs)} comes later, so it is more. ${Math.min(...xs)} comes sooner, so it is less.`])], t: { f: 'more', dir: dir === 'less' ? 'min' : 'max', q: `nums-${dir}` } });
}
function than(hi, dir) {
  const thr = rnd(4, hi - 4), gt = dir === 'more', right = gt ? rnd(thr + 1, hi) : rnd(0, thr - 1);
  const pool = Array.from({ length: hi + 1 }, (_, i) => i).filter(v => (gt ? v < thr : v > thr));
  return pickQ({ ask: `Tap a number that is ${gt ? 'more' : 'less'} than ${big(thr)}.` + tag('than', dir, thr), say: `Tap a number that is ${gt ? 'more' : 'less'} than ${numWord(thr)}.`, right: numOpt(right),
    wrong: numOpts(shuffle(pool).slice(0, 3)), big: true, mode: 'pick', hint: gt ? `Which number comes after ${thr} when you count?` : `Which number comes before ${thr} when you count?`,
    ways: [way('Count', [`${thr} is the number to compare with.`, `${right} comes ${gt ? 'after' : 'before'} ${thr} when you count, so it is ${gt ? 'more' : 'less'}.`])], t: { f: 'than', dir, thr, q: `than-${dir}` } });
}
export function genMore(L) {
  const dir = pick(['more', 'less']);
  if (L === 1) return pick([0, 1, 2]) === 2 ? same(5) : groups(1, dir);
  if (L === 2) { const t = pick(['groups', 'nums', 'nums', 'same']); return t === 'groups' ? groups(2, dir) : t === 'same' ? same(10) : numbers(10, dir, pick([2, 3])); }
  const t = pick(['nums', 'than', 'than', 'same']);
  return t === 'nums' ? numbers(20, dir, pick([3, 4])) : t === 'than' ? than(20, dir) : same(10);
}

// ---- l0order ----
const HI = [10, 20, 20];
const ordWays = (xs, ans, what) => [way('Count up', [`Count up: ${countOn(Math.max(...xs))}.`, `${ans} comes ${what === 'smallest' ? 'first' : 'last'} of these.`]),
  way('Line them up', [`Put them in order from smallest to biggest: ${xs.slice().sort((p, q) => p - q).join(', ')}.`])];
function extreme(L, what) {
  const k = L === 3 ? 4 : 3, xs = distinct(k, 0, HI[L - 1]), right = what === 'smallest' ? Math.min(...xs) : Math.max(...xs);
  return pickQ({ ask: `Which number is the ${what}?` + tag('ext', what, xs.join(' ')), say: `Which number is the ${what}?`, right: numOpt(right), wrong: numOpts(xs.filter(x => x !== right)), big: true, mode: 'pick',
    hint: 'The smallest number comes first when you count. The biggest comes last.', ways: ordWays(xs, right, what), t: { f: 'extreme', what, q: what } });
}
function gap(L) {
  const hi = HI[L - 1];
  let xs;
  do xs = distinct(3, 0, hi).sort((p, q) => p - q); while (hi + 1 - (xs[2] - xs[0] + 1) < 3);
  const [a, mid, c] = xs;
  const run = [a, mid, c], hole = 1, shown = run.map((v, i) => (i === hole ? BLANK : v)).join(', ');
  const wrong = shuffle(Array.from({ length: hi + 1 }, (_, i) => i).filter(v => v < a || v > c)).slice(0, 3);
  return pickQ({ ask: 'Which number fits in the gap?' + tag('gap', run.join(' ')), expr: shown, say: 'Which number fits in the gap?', right: numOpt(mid), wrong: numOpts(wrong), big: true, mode: 'pick',
    hint: 'The numbers go from smallest to biggest. Find the one that fits between its neighbors.', ways: [way('Check both sides', [`${a} is smaller and ${c} is bigger.`, `${mid} is bigger than ${a} and smaller than ${c}, so it fits.`])], t: { f: 'gap', q: 'gap' } });
}
function sortedRow(L) {
  const k = L === 3 ? 4 : 3, xs = distinct(k, 0, HI[L - 1]), up = xs.slice().sort((p, q) => p - q), rows = new Set([up.join(', ')]);
  while (rows.size < 4) rows.add(shuffle(xs).join(', '));
  const text = r => opt(r, numList(r.split(', ').map(Number)));
  return pickQ({ ask: 'Which row goes from smallest to biggest?' + tag('row', up.join(' ')), say: 'Which row goes from smallest to biggest?', right: text(up.join(', ')), wrong: [...rows].slice(1).map(text), mode: 'pick',
    hint: 'The first number should be the smallest. Each next number is bigger.', ways: [way('Check each row', [`Read a row. Each number should be bigger than the one before.`, `${up.join(', ')} goes up each time.`])], t: { f: 'sortedrow', q: 'row' } });
}
function middle(L) {
  const xs = distinct(3, 0, HI[L - 1]), mid = xs.slice().sort((p, q) => p - q)[1];
  return pickQ({ ask: 'Which number is in the middle?' + tag('mid', xs.join(' ')), say: 'Which number is in the middle size?', right: numOpt(mid), wrong: numOpts(xs.filter(x => x !== mid)), big: true, mode: 'pick',
    hint: 'Find the smallest and the biggest first. The other one is in the middle.', ways: ordWays(xs, mid, 'smallest'), t: { f: 'middle', q: 'middle' } });
}
export function genOrder(L) {
  const t = pick(L === 1 ? ['smallest', 'biggest', 'gap'] : L === 2 ? ['smallest', 'biggest', 'gap', 'row'] : ['smallest', 'biggest', 'gap', 'row', 'middle']);
  if (t === 'gap') return gap(L);
  if (t === 'row') return sortedRow(L);
  return t === 'middle' ? middle(L) : extreme(L, t);
}
