// Reading picture graphs and bar graphs: read a value, most and least, how many more, totals, and reading the scale.
import { rnd, pick, shuffle, b, way, nm, num, choice } from '../../util.js';
import { cnt, mark, uniq, countList, sumOf } from './words.js';
import { barChart, pictureGraph } from './chartpics.js';

const POLLS = [['Favorite sport', ['Soccer', 'Basketball', 'Tennis', 'Swimming', 'Running']], ['Pet we would like', ['Dogs', 'Cats', 'Fish', 'Birds', 'Rabbits']],
  ['Favorite music', ['Pop', 'Rock', 'Rap', 'Jazz', 'Country']], ['Favorite snack', ['Popcorn', 'Pretzels', 'Nachos', 'Fruit', 'Candy']],
  ['Favorite game', ['Racing', 'Puzzle', 'Building', 'Sports', 'Quiz']], ['How we get to school', ['Walk', 'Bike', 'Bus', 'Car', 'Scooter']]];
const votes = n => cnt(n, 'vote');

// A graph with its numbers. kind is 'pic' (one circle stands for `per`) or 'bar' (grid lines every `step`).
function makeGraph({ kind, n, per = 1, step = 1, lo, hi }) {
  const [title, all] = pick(POLLS), cats = shuffle(all).slice(0, n), vals = uniq(n, lo, hi).map(v => v * (kind === 'pic' ? per : step));
  const html = kind === 'pic' ? pictureGraph({ title, cats, vals, per }) : barChart({ title, cats, vals, step });
  return { kind, title, cats, vals, per, step, html, tag: mark(title, vals.join('-')) };
}
const q = (g, p) => ({ visual: g.html, ...p, ask: p.ask + g.tag });
const tOf = (g, f, extra = {}) => ({ f, names: g.cats, vals: g.vals, ...extra });
// How a value is read off the graph: count circles, or follow the bar to the scale.
function readWays(g, i) {
  const v = g.vals[i], c = g.cats[i], k = v / (g.kind === 'pic' ? g.per : g.step), unit = g.kind === 'pic' ? g.per : g.step;
  const list = unit === 1 ? countList(0, k) : countList(0, k, 1, unit);
  if (g.kind === 'pic') return [way('Count the circles', [`Find the row for ${c} and count its circles: ${cnt(k, 'circle')}.`, unit === 1 ? `Each circle is one vote, so ${c} got ${b(votes(v))}.` : `Each circle is ${votes(unit)}. Count by ${unit}s: ${list}. So ${c} got ${b(votes(v))}.`]),
    way('Add the circles', [`${cnt(k, 'circle')} in the row for ${c}, and each stands for ${votes(unit)}.`, `${Array(k).fill(unit).join(' + ')} = ${b(v)}.`])];
  return [way('Follow the bar to the side', [`Find the bar for ${c} and look straight across from its top to the numbers on the side.`, `The top is level with ${b(v)}, so ${c} got ${b(votes(v))}.`]),
    way('Count the grid lines', [`Count the grid lines from 0 up to the top of the ${c} bar: ${list}.`, `Each line is ${votes(unit)}, so the bar is ${b(v)}.`])];
}
const readQ = (g, i) => q(g, { ask: `How many votes did ${b(g.cats[i])} get?`, answer: num(g.vals[i]), hint: g.kind === 'pic' ? 'Count the circles in that row. What does one circle stand for?' : 'Find the top of that bar and read across to the numbers at the side.', _t: tOf(g, 'gval', { i }), ways: readWays(g, i) });
function extremeQ(g, most) {
  const target = most ? Math.max(...g.vals) : Math.min(...g.vals), i = g.vals.indexOf(target), word = most ? 'most' : 'fewest', pic = g.kind === 'pic';
  const all = g.cats.map((c, j) => `${c} ${g.vals[j]}`).join(', ');
  return q(g, { ask: `Which choice got the ${word} votes?`, answer: choice(g.cats[i], g.cats.filter((_, j) => j !== i)), choiceBig: true, hint: pic ? `Which row has the ${most ? 'most' : 'fewest'} circles?` : `Which bar is the ${most ? 'tallest' : 'shortest'}?`, _t: tOf(g, 'gext', { which: word }),
    ways: [way('Look at the whole graph', [pic ? `Compare the length of every row. The ${most ? 'longest' : 'shortest'} row is the ${b(g.cats[i])} row.` : `Compare the height of every bar. The ${most ? 'tallest' : 'shortest'} bar is ${b(g.cats[i])}.`, `${g.cats[i]} got the ${word} votes.`]),
      way('Read every value', [`${all}.`, `The ${word} is ${target}, so the answer is ${b(g.cats[i])}.`])] });
}
function gapQ(g, fewer) {
  const [i, j] = shuffle([...g.vals.keys()]).slice(0, 2).sort((x, y) => g.vals[y] - g.vals[x]), d = g.vals[i] - g.vals[j];
  const ask = fewer ? `How many fewer votes did ${b(g.cats[j])} get than ${b(g.cats[i])}?` : `How many more votes did ${b(g.cats[i])} get than ${b(g.cats[j])}?`;
  return q(g, { ask, answer: num(d), hint: 'Read both values first. Then find the gap between them.', _t: tOf(g, 'gdiff', { i, j }),
    ways: [way('Read, then subtract', [`${g.cats[i]} got ${g.vals[i]} and ${g.cats[j]} got ${g.vals[j]}.`, `${g.vals[i]} − ${g.vals[j]} = ${b(d)}.`]), way('Count on from the smaller', [`Count on from ${g.vals[j]} up to ${g.vals[i]}.`, `The gap is ${b(d)}.`])] });
}
function totalQ(g, two) {
  const idx = two ? shuffle([...g.vals.keys()]).slice(0, 2).sort() : [...g.vals.keys()], vs = idx.map(i => g.vals[i]), t = sumOf(vs), names = idx.map(i => g.cats[i]);
  return q(g, { ask: two ? `How many votes did ${b(names[0])} and ${b(names[1])} get together?` : 'How many votes were there altogether?', answer: num(t), hint: 'Read the value for each choice, then add them all.', _t: tOf(g, 'gsum', { idx }),
    ways: [way('Read, then add', [`${names.map((n, k) => `${n} ${vs[k]}`).join(', ')}.`, `${vs.join(' + ')} = ${b(t)}.`]), way('Add two at a time', [`${vs[0]} + ${vs[1]} = ${vs[0] + vs[1]}.`, vs.length === 2 ? `So together they got ${b(t)}.` : `Keep adding the rest: ${vs.slice(2).reduce((acc, x) => `${acc} + ${x}`, vs[0] + vs[1])} = ${b(t)}.`])] });
}
// Step 3 on its own: the top choice compared with the bottom one.
function rangeQ(g) {
  const hi = Math.max(...g.vals), lo = Math.min(...g.vals), d = hi - lo;
  return q(g, { ask: 'How many more votes did the top choice get than the choice with the fewest votes?', answer: num(d), hint: 'Find the highest and the lowest value first.', _t: tOf(g, 'grange'),
    ways: [way('Find the top and the bottom', [`The most is ${hi} and the fewest is ${lo}.`, `${hi} − ${lo} = ${b(d)}.`]), way('Count on from the fewest', [`Count on from ${lo} up to ${hi}.`, `The gap is ${b(d)}.`])] });
}
// A slip with the scale: counting circles or grid lines as if each were one.
function scaleSlipQ(g) {
  const i = rnd(0, g.cats.length - 1), c = g.cats[i], unit = g.kind === 'pic' ? g.per : g.step, k = g.vals[i] / unit, who = nm(), v = g.vals[i];
  const ask = g.kind === 'pic' ? `${who} counts ${cnt(k, 'circle')} in the row for ${b(c)} and says ${c} got ${votes(k)}. Read the key. How many votes did ${b(c)} really get?` : `${who} counts ${cnt(k, 'grid line')} up to the top of the ${b(c)} bar and says ${c} got ${votes(k)}. Read the numbers at the side. How many votes did ${b(c)} really get?`;
  return q(g, { ask, answer: num(v), hint: g.kind === 'pic' ? 'The key tells you what one circle stands for.' : 'The numbers at the side tell you what each grid line is worth.', _t: tOf(g, 'gval', { i }),
    ways: [way('Use the scale', [g.kind === 'pic' ? `The key says each circle stands for ${votes(unit)}.` : `The numbers at the side go up in steps of ${unit}, so each grid line is worth ${votes(unit)}.`, `${k} × ${unit}: ${countList(0, k, 1, unit)}. So ${c} got ${b(votes(v))}.`]), way('Add it up', [`${Array(k).fill(unit).join(' + ')} = ${b(v)}.`])] });
}
// Which sentence about the graph is true? One is made true; the others are slightly wrong.
function statementQ(g) {
  const [i, j] = shuffle([...g.vals.keys()]).slice(0, 2), A = g.cats[i], B = g.cats[j], d = Math.abs(g.vals[i] - g.vals[j]), hi = g.vals[i] > g.vals[j], first = hi ? [A, B] : [B, A];
  const off = n => { let r; do r = n + pick([-3, -2, -1, 1, 2, 3]); while (r < 1); return r; }, top = g.cats[g.vals.indexOf(Math.max(...g.vals))];
  const trueS = pick([`${first[0]} got ${cnt(d, 'more vote')} than ${first[1]}`, `${A} got ${votes(g.vals[i])}`, `${A} and ${B} got ${votes(g.vals[i] + g.vals[j])} together`]);
  const pool = [`${first[0]} got ${cnt(off(d), 'more vote')} than ${first[1]}`, `${A} got ${votes(off(g.vals[i]))}`, `${A} and ${B} got ${votes(off(g.vals[i] + g.vals[j]))} together`,
    `${g.cats.find(c => c !== top)} got the most votes`, `${first[1]} got ${cnt(d, 'more vote')} than ${first[0]}`].filter((s, k, a) => s !== trueS && a.indexOf(s) === k);
  const wrong = shuffle(pool).slice(0, 3);
  return q(g, { ask: 'Which sentence about the graph is true?', answer: choice(trueS, wrong), choiceBig: true, hint: 'Read the values you need, then check each sentence.', _t: tOf(g, 'gstmt'),
    ways: [way('Read, then check', [`${A} got ${g.vals[i]} and ${B} got ${g.vals[j]}.`, `Only ${b(trueS)} matches the graph.`]), way('Rule out the others', [`${wrong.join('. ')}. None of these match the values.`, `That leaves ${b(trueS)}.`])] });
}

export function genGraph(L) {
  if (L === 1) {
    const g = makeGraph({ kind: 'pic', n: 4, lo: 1, hi: 8 }), t = pick(['read', 'read', 'most', 'least', 'more', 'total', 'two']);
    if (t === 'read') return readQ(g, rnd(0, 3));
    if (t === 'most' || t === 'least') return extremeQ(g, t === 'most');
    if (t === 'more') return gapQ(g, false);
    return totalQ(g, t === 'two');
  }
  if (L === 2) {
    const g = makeGraph({ kind: 'bar', n: pick([4, 5]), lo: 2, hi: 10 }), t = pick(['read', 'most', 'least', 'more', 'fewer', 'two', 'all', 'stmt']);
    if (t === 'read') return readQ(g, rnd(0, g.cats.length - 1));
    if (t === 'most' || t === 'least') return extremeQ(g, t === 'most');
    if (t === 'more' || t === 'fewer') return gapQ(g, t === 'fewer');
    if (t === 'stmt') return statementQ(g);
    return totalQ(g, t === 'two');
  }
  const g = pick([() => makeGraph({ kind: 'pic', n: 5, per: pick([2, 5]), lo: 1, hi: 6 }), () => makeGraph({ kind: 'bar', n: 5, step: pick([2, 5]), lo: 1, hi: 9 })])(), t = pick(['read', 'slip', 'slip', 'range', 'more', 'two', 'stmt']);
  if (t === 'read') return readQ(g, rnd(0, 4));
  if (t === 'slip') return scaleSlipQ(g);
  if (t === 'range') return rangeQ(g);
  if (t === 'more') return gapQ(g, pick([true, false]));
  if (t === 'stmt') return statementQ(g);
  return totalQ(g, true);
}
