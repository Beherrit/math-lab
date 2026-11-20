// Reading graphs from stories and telling stories from graphs: going up, staying level, going down, straight or curved.
import { rnd, pick, shuffle, b, way, fmt, num, choice } from '../../util.js';
import { fixedChoice, yesNo } from './h.js';
import { storyGraph, TRIPS, axesLine } from './story-graph.js';

const PHRASE = { up: 'up', flat: 'level', down: 'down' };
const TREND_NAME = { up: 'Going up', flat: 'Staying level', down: 'Going down' };
const trendOf = (a, c) => (c > a ? 'up' : c < a ? 'down' : 'flat');
const slopes = (xs, ys) => ys.slice(1).map((y, i) => (y - ys[i]) / (xs[i + 1] - xs[i]));
// A path of straight parts: trends[i] is up, flat or down for part i. Returns the corner points.
function shape(trends) {
  for (let t = 0; t < 80; t++) {
    const inner = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, trends.length - 1).sort((p, q) => p - q), xs = [0, ...inner, 10];
    if (xs.some((x, i) => i && x - xs[i - 1] < 1 + (trends.length < 5 ? 1 : 0))) continue;
    let y = rnd(0, 10); const ys = [y];
    for (const tr of trends) { y += tr === 'up' ? rnd(2, 5) : tr === 'down' ? -rnd(2, 5) : 0; ys.push(y); }
    if (ys.every(v => v >= 0 && v <= 10)) return { xs, ys };
  }
  return null;
}
const partDots = (xs, ys) => xs.slice(1).map((x, i) => ({ x: (x + xs[i]) / 2, y: (ys[i] + ys[i + 1]) / 2, label: 'ABCDE'[i] }));
const pic = (xs, ys, label = true) => storyGraph(xs.map((x, i) => [x, ys[i]]), label ? partDots(xs, ys) : []);
const partWord = (i, xs, ys) => `Part ${'ABCDE'[i]} goes from ${fmt(ys[i])} at x = ${xs[i]} to ${fmt(ys[i + 1])} at x = ${xs[i + 1]}`;
const story = (t, trends) => `${t.subj} ${trends.map(k => t[k]).join(', then ')}.`;
function reading(t, trends, xs, ys, last) {
  return [way('Read it left to right', [...trends.map((k, i) => `${partWord(i, xs, ys)}: ${PHRASE[k] === 'level' ? 'level' : PHRASE[k]}.`), last]),
    way('Think about the story', [`The y axis shows ${t.ys}. When the line climbs, that amount is getting bigger. When it is flat it is not changing. When it falls it is getting smaller.`, last])];
}
function whichPart() {
  const t = pick(TRIPS), trends = shuffle(['up', 'flat', 'down']), g = shape(trends), want = pick(['up', 'flat', 'down']);
  if (!g) return null;
  const i = trends.indexOf(want), last = `So it is ${b(`Part ${'ABC'[i]}`)}.`;
  return { ask: `${t.lead} ${axesLine(t)} On which part of the graph is the amount ${want === 'flat' ? 'not changing' : want === 'up' ? 'getting bigger' : 'getting smaller'}?`, visual: pic(g.xs, g.ys), answer: fixedChoice(`Part ${'ABC'[i]}`, ['Part A', 'Part B', 'Part C']),
    hint: 'Follow the line from left to right. Going up means bigger, flat means no change, going down means smaller.', _t: { k: 'gstory', shape: 'which-part', want }, ways: reading(t, trends, g.xs, g.ys, last) };
}
function partTrend() {
  const t = pick(TRIPS), trends = shuffle(['up', 'flat', 'down']), g = shape(trends), i = rnd(0, 2), k = trends[i];
  if (!g) return null;
  const last = `${'ABC'[i]} is ${b(TREND_NAME[k].toLowerCase())}.`;
  return { ask: `${t.lead} ${axesLine(t)} What is happening on Part ${'ABC'[i]}?`, visual: pic(g.xs, g.ys), answer: fixedChoice(TREND_NAME[k], Object.values(TREND_NAME)), hint: 'Look only at Part ' + 'ABC'[i] + ' and follow it from left to right.', _t: { k: 'gstory', shape: 'part-trend', part: i }, ways: reading(t, trends, g.xs, g.ys, `Part ${last}`) };
}
function steepest() {
  const t = pick(TRIPS), trends = shuffle(['up', 'down', pick(['up', 'down'])]), g = shape(trends);
  if (!g) return null;
  const sl = slopes(g.xs, g.ys).map(Math.abs), top = Math.max(...sl);
  if (sl.filter(v => Math.abs(v - top) < 0.4).length > 1) return null;
  const i = sl.indexOf(top), last = `Part ${'ABC'[i]} has the steepest line, so it is ${b(`Part ${'ABC'[i]}`)}.`;
  return { ask: `${t.lead} ${axesLine(t)} On which part is the amount changing fastest?`, visual: pic(g.xs, g.ys), answer: fixedChoice(`Part ${'ABC'[i]}`, ['Part A', 'Part B', 'Part C']), hint: 'The steeper the line, the faster the amount changes. A flat line means no change.', _t: { k: 'gstory', shape: 'steepest' },
    ways: [way('Compare the changes', [...sl.map((v, j) => `Part ${'ABC'[j]}: the amount changes by ${fmt(Math.abs(g.ys[j + 1] - g.ys[j]))} over ${g.xs[j + 1] - g.xs[j]} across.`), last]), way('Look at the steepness', ['A steep line climbs or drops a lot in a short run. A gentle line changes only a little.', last])] };
}
// Stories whose parts follow the given trends, plus wrong ones made by swapping two parts.
function storyPick(n) {
  const t = pick(TRIPS), pool = ['up', 'flat', 'down'], trends = [pick(pool)];
  while (trends.length < n) trends.push(pick(pool.filter(k => k !== trends[trends.length - 1])));
  const g = shape(trends);
  if (!g) return null;
  const wrongs = [];
  for (let i = 1; i < n; i++) { const w = trends.slice(); [w[i - 1], w[i]] = [w[i], w[i - 1]]; if (w.join() !== trends.join()) wrongs.push(w); }
  const flipped = trends.map(k => (k === 'up' ? 'down' : k === 'down' ? 'up' : 'flat')); if (flipped.join() !== trends.join()) wrongs.push(flipped);
  const right = story(t, trends);
  return { ask: `${t.lead} ${axesLine(t)} Which story matches the graph?`, visual: pic(g.xs, g.ys, false), answer: choice(right, shuffle(wrongs).map(w => story(t, w)).slice(0, 3)), hint: 'Follow the line from left to right and describe each part in order.', _t: { k: 'gstory', shape: n > 3 ? 'story-pick-long' : 'story-pick', n },
    ways: [way('Describe each part in order', [...trends.map((k, i) => `${partWord(i, g.xs, g.ys).replace('Part ' + 'ABCDE'[i], `Part ${i + 1}`)}, so ${t.subj.toLowerCase()} ${t[k]}.`), `The story is: ${b(right)}`]), way('Rule out the others', ['A story with the same parts in a different order would draw a different picture.', `The story that fits the order of the parts is: ${b(right)}`])] };
}
// A straight line or a curve over the whole grid.
const CURVES = [{ f: x => (x * x) / 10, say: 'It goes up faster and faster' }, { f: x => Math.sqrt(10 * x), say: 'It goes up more and more slowly' }, { f: x => 10 - (x * x) / 10, say: 'It goes down faster and faster' }, { f: x => 10 - Math.sqrt(10 * x), say: 'It goes down more and more slowly' }];
function curvePoints(c) {
  const s = pick([0.6, 0.7, 0.8, 0.9, 1]), o = pick([0, 0.5, 1].filter(v => v + 10 * s <= 10));
  return Array.from({ length: 11 }, (_, x) => [x, Math.round((o + s * c.f(x)) * 100) / 100]);
}
// Step 2 asks "line or curve"; step 3 asks the same idea as a steady rate.
function lineOrCurve(L) {
  const t = pick(TRIPS), straight = rnd(0, 1) === 0, lo = rnd(0, 4), hi = rnd(5, 10), pts = straight ? (rnd(0, 1) ? [[0, lo], [10, hi]] : [[0, hi], [10, lo]]) : curvePoints(pick(CURVES));
  const why = straight ? 'Going 1 across, the line always goes up or down by the same amount, so the rate is steady.' : 'Going 1 across, the amount changes by a different amount in different places. The line bends, so the rate is not steady.';
  const core = { visual: storyGraph(pts), _t: { k: 'gstory', shape: L === 2 ? 'linear-curved' : 'steady-rate' } };
  if (L === 2) return { ...core, ask: `${t.lead} ${axesLine(t)} Is the graph a straight line or a curve?`, answer: fixedChoice(straight ? 'A straight line' : 'A curve', ['A straight line', 'A curve']), hint: 'Does the amount change by the same size every step across? Look for any bend.',
    ways: [way('Check equal steps', [why, `So it is ${b(straight ? 'a straight line' : 'a curve')}.`]), way('Place a ruler', [straight ? 'A ruler lies along the whole graph.' : 'A ruler cannot lie along the whole graph: the line bends away from it.', `So it is ${b(straight ? 'a straight line' : 'a curve')}.`])] };
  return { ...core, ask: `${t.lead} ${axesLine(t)} Does the amount change at a steady rate, the same amount every step across?`, answer: yesNo(straight), hint: 'A steady rate makes a straight line. Does this line bend?',
    ways: [way('Check equal steps', [why, `So the answer is ${b(straight ? 'yes' : 'no')}.`]), way('Compare two steps', [`Between x = 0 and x = 1 the amount changes by ${fmt(Math.abs(pts[1][1] - pts[0][1]))}, and between x = 9 and x = 10 by ${fmt(Math.abs(pts[pts.length - 1][1] - pts[pts.length - 2][1]))}.`, straight ? `Both steps are the same size, so the answer is ${b('yes')}.` : `The steps are different, so the answer is ${b('no')}.`])] };
}
function curveKind() {
  const t = pick(TRIPS), c = pick(CURVES), pts = curvePoints(c);
  return { ask: `${t.lead} ${axesLine(t)} Which sentence fits the graph?`, visual: storyGraph(pts), answer: fixedChoice(c.say, CURVES.map(v => v.say)), hint: 'Is the line going up or down? Then does it get steeper or flatter as you move right?', _t: { k: 'gstory', shape: 'curve-kind' },
    ways: [way('Direction, then steepness', [`${c.say.includes('up') ? 'The line climbs' : 'The line falls'} from left to right.`, `${c.say.includes('faster') ? 'It gets steeper' : 'It gets flatter'} as it goes, so ${b(c.say.toLowerCase())}.`]), way('Compare two steps', [`Look at the change between x = 0 and x = 1, and between x = 9 and x = 10: ${fmt(Math.abs(pts[1][1] - pts[0][1]))} and ${fmt(Math.abs(pts[10][1] - pts[9][1]))}.`, `${c.say.includes('faster') ? 'The later step is bigger' : 'The later step is smaller'}, so ${b(c.say.toLowerCase())}.`])] };
}
// Numbers read off a path of straight parts.
function readNumber(kind) {
  const t = pick(TRIPS), trends = kind === 'flat' ? shuffle(['up', 'flat', 'down']) : kind === 'change' ? pick([['up', 'down', 'up'], ['down', 'up', 'down'], ['up', 'flat', 'down']]) : pick([['up', 'down'], ['flat', 'up', 'down'], ['up', 'down', 'flat']]), g = shape(trends);
  if (!g) return null;
  const { xs, ys } = g, at = x => ys[xs.indexOf(x)], top = Math.max(...ys), peak = xs[ys.indexOf(top)], core = { visual: pic(xs, ys, false), _t: { k: 'gstory', shape: `read-${kind}` } };
  const last = list => way('Read the graph', list);
  if (kind === 'flat') { const i = trends.indexOf('flat'), n = xs[i + 1] - xs[i]; return { ...core, ask: `${t.lead} ${axesLine(t)} For how long is the amount not changing?`, answer: num(n), hint: 'Find the part of the graph that is flat. How far across does it go?', ways: [last([`The flat part starts at x = ${xs[i]} and ends at x = ${xs[i + 1]}.`, `${xs[i + 1]} − ${xs[i]} = ${b(n)}`]), way('Count the squares', [`Along the flat part the line crosses ${n} squares of the grid.`, `So it is level for ${b(n)}.`])] }; }
  if (kind === 'peak') { const k = rnd(0, 1); return { ...core, ask: `${t.lead} ${axesLine(t)} ${k ? 'What is the highest value of y?' : 'At what value of x is the line highest?'}`, answer: num(k ? top : peak), hint: 'Find the highest point of the line. Read across for y or down for x.', _t: { ...core._t, shape: k ? 'read-top' : 'read-peak' },
    ways: [last([`The highest point is at x = ${peak}, where y = ${top}.`, k ? `The highest value of y is ${b(top)}.` : `It is highest at x = ${b(peak)}.`]), way('Compare the corners', [`The corner values of y are ${ys.join(', ')}.`, `The biggest is ${top}, at x = ${peak}: ${b(k ? top : peak)}.`])] }; }
  const i = rnd(0, xs.length - 2), a = xs[i], c = xs[i + 1 + rnd(0, xs.length - 2 - i)];
  if (at(a) === at(c)) return null;
  const d = Math.abs(at(c) - at(a));
  return { ...core, ask: `${t.lead} ${axesLine(t)} By how much does y change (up or down) between x = ${a} and x = ${c}?`, answer: num(d), hint: 'Read y at each of the two values of x. Then find the difference.', _t: { ...core._t, shape: 'read-change' },
    ways: [last([`At x = ${a}, y = ${at(a)}. At x = ${c}, y = ${at(c)}.`, `The difference is ${fmt(Math.max(at(a), at(c)))} − ${fmt(Math.min(at(a), at(c)))} = ${b(d)}.`]), way('Count the squares', [`Go from the height at x = ${a} to the height at x = ${c}: that is ${d} squares ${at(c) > at(a) ? 'up' : 'down'}.`, `The change is ${b(d)}.`])] };
}
function valueAt() {
  const t = pick(TRIPS), n = rnd(3, 4), g = shape(Array.from({ length: n }, (_, i) => pick(['up', 'down', 'flat'].filter(k => k !== 'flat' || i > 0))));
  if (!g) return null;
  const x = pick(g.xs.slice(1, -1)), y = g.ys[g.xs.indexOf(x)];
  return { ask: `${t.lead} ${axesLine(t)} What is y when x = ${x}?`, visual: pic(g.xs, g.ys, false), answer: num(y), hint: 'Find x on the bottom, go straight up to the line, then read across to the y axis.', _t: { k: 'gstory', shape: 'read-value', x },
    ways: [way('Up, then across', [`Find x = ${x} on the bottom and go straight up to the line.`, `Then read across: y = ${b(y)}.`]), way('Follow the line', [`At x = ${x} the line has a corner. Count its height on the grid.`, `It is ${b(y)}.`])] };
}
export function genGraphStory(L) {
  if (L === 1) return pick([whichPart, partTrend, steepest, () => storyPick(3)])();
  if (L === 2) return pick([() => lineOrCurve(2), () => storyPick(4), valueAt, () => readNumber('flat'), () => readNumber('peak')])();
  return pick([curveKind, () => readNumber('change'), () => storyPick(5), () => lineOrCurve(3), () => readNumber('peak')])();
}
