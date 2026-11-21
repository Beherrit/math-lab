// Tally charts: a bundle with a slanted mark is 5, then the extra marks, then a comparison.
import { rnd, pick, b, way, num, choice } from '../../util.js';
import { mark } from './words.js';

const NAMES = ['Dogs', 'Cats', 'Fish', 'Birds', 'Bikes', 'Goals'];

function marks(n) {
  const groups = Math.max(1, Math.ceil(n / 5));
  const W = groups * 40 + 8;
  let g = `<svg class="viz tally" viewBox="0 0 ${W} 46" role="img" aria-label="${n} tally marks">`;
  for (let i = 0; i < n; i++) {
    const g5 = Math.floor(i / 5), k = i % 5, x = 10 + g5 * 40;
    g += k < 4
      ? `<line x1="${x + k * 7}" y1="6" x2="${x + k * 7}" y2="36" class="tick"/>`
      : `<line x1="${x - 3}" y1="34" x2="${x + 24}" y2="8" class="tick"/>`;
  }
  return g + '</svg>';
}
function row(name, n) {
  return `<div class="tally-row"><p>${name}</p>${marks(n)}</div>`;
}
function parts(n) {
  const xs = [];
  let left = n;
  while (left >= 5) { xs.push(5); left -= 5; }
  if (left) xs.push(left);
  return xs.length ? xs : [0];
}
const tag = (kind, ...v) => mark(kind, ...v);

function countQ(n) {
  return {
    ask: 'How many marks are in the tally?' + tag('count', n),
    visual: marks(n), answer: num(n),
    hint: 'A bundle with a slanted mark is 5. Then count the extra marks.',
    why: `The slanted mark is the fifth mark in the bundle, not a new group of one. Counting each bundle as 1 makes the total much too small. There are ${n} marks.`,
    _t: { f: 'add', xs: parts(n) },
    ways: [
      way('Bundles of five, then extras', [marks(n), `${Math.floor(n / 5)} bundles of 5, and ${n % 5} extra.`, `${parts(n).join(' + ')} = ${b(n)}.`]),
      way('Count every mark', [`Touch each mark once, including the slanted one.`, `There are ${b(n)} marks.`]),
    ],
  };
}
function moreQ(a, c) {
  const x = pick(NAMES);
  const yName = pick(NAMES.filter(n => n !== x));
  const names = [x, yName], vals = [a, c], i = a > c ? 0 : 1;
  return {
    ask: 'Which row has more?' + tag('more', a, c),
    visual: row(names[0], a) + row(names[1], c), answer: choice(names[i], [names[1 - i]]), choiceBig: true,
    hint: 'Count each row. The longer tally is more.',
    why: `${names[0]} has ${a} and ${names[1]} has ${c}. The row with more marks is ${names[i]}. A longer row of bundles is more, even when one bundle looks like a single slanted mark.`,
    _t: { f: 'pickrow', names, vals, i },
    ways: [
      way('Count both rows', [`${names[0]} is ${a}. ${names[1]} is ${c}.`, `${names[i]} has more, so the answer is ${b(names[i])}.`]),
      way('Compare the bundles', [`More bundles, then more extra marks, means more.`, `${b(names[i])} is the bigger row.`]),
    ],
  };
}
function gapQ(a, c) {
  const big = Math.max(a, c), small = Math.min(a, c), d = big - small;
  const name = pick(NAMES);
  const other = NAMES.find(n => n !== name);
  const first = a >= c ? name : other, second = a >= c ? other : name;
  return {
    ask: `How many more does ${first} have than ${second}?` + tag('gap', big, small),
    visual: row(first, big) + row(second, small), answer: num(d),
    hint: 'Count both rows, then find the gap.',
    why: `${first} has ${big} and ${second} has ${small}. The gap is ${d}. Comparing the number of bundles without the extra marks is the usual slip.`,
    _t: { f: 'sub', a: big, b: small },
    ways: [
      way('Count, then subtract', [`${first} has ${big} and ${second} has ${small}.`, `${big} − ${small} = ${b(d)}.`]),
      way('Match and see what is left', [`Pair off ${small} marks from each row.`, `${b(d)} marks are left over.`]),
    ],
  };
}
function slipQ(n) {
  const wrong = Math.floor(n / 5) + (n % 5);
  const who = pick(['Sam', 'Mia', 'Leo', 'Ava']);
  return {
    ask: `${who} counts each bundle as 1 and says there are ${wrong}. How many marks are there really?` + tag('slip', n),
    visual: marks(n), answer: num(n),
    hint: 'A bundle is 5 marks. The slanted mark is one of those 5.',
    why: `Each bundle is 5, not 1. Counting bundles as 1 gives ${wrong}. The tally really shows ${n}.`,
    _t: { f: 'add', xs: parts(n) },
    ways: [
      way('Give each bundle five', [marks(n), `${Math.floor(n / 5)} bundles are ${Math.floor(n / 5) * 5}, plus ${n % 5} extra.`, `${parts(n).join(' + ')} = ${b(n)}.`]),
      way('Count the marks', [`${wrong} counted bundles instead of marks.`, `The real total is ${b(n)}.`]),
    ],
  };
}

export function genTally(L) {
  const hi = L === 1 ? 15 : L === 2 ? 30 : 40;
  const lo = L === 1 ? 6 : L === 2 ? 12 : 16;
  const kind = ['count', 'count', 'more', 'gap', 'slip'][rnd(0, 4)];
  if (kind === 'more') {
    const a = rnd(1, hi);
    const c = a === 1 ? 2 : a - 1;
    return moreQ(a, c);
  }
  if (kind === 'gap') {
    const a = rnd(lo, hi), c = rnd(1, hi);
    return a === c ? gapQ(a, Math.max(1, a - 3)) : gapQ(a, c);
  }
  const n = rnd(lo, hi);
  return kind === 'slip' ? slipQ(n) : countQ(n);
}
