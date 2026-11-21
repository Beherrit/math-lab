// Counting: up to 10 things (scattered, in a line, mixed with others), then 11 to 20 with ten frames.
import { rnd, pick, shuffle, way } from '../../util.js';
import { pickQ, numQ, numOpt, numOpts, others, cnt, sayCnt, numWord, tag, countOn } from './kit.js';
import { dotsPic, groupTile, framesPic, scatter } from './pics.js';
import { svg, counter, el } from './svg.js';

const countWays = n => {
  const a = Math.ceil(n / 2);
  const ways = [way('Count them', [`Touch each one once as you count: ${countOn(n)}.`, `The last number you say is how many: ${n}.`])];
  if (n >= 4 && n <= 10) ways.push(way(`See it as ${a} and ${n - a}`, [`Count ${a} on one side and ${n - a} on the other.`, `${a} and ${n - a} together make ${n}.`]));
  return ways;
};
const HOW = 'Touch each one once. Say one number for each.';

// "How many?" with a picture; the answer is tapped, or typed at step 3.
function howMany(n, layout, typed) {
  const visual = dotsPic(n, layout), noun = layout === 'line' ? 'counters' : 'dots';
  const base = { ask: `How many ${noun}?` + tag('count', n, layout), say: `How many ${noun} are there?`, visual, hint: HOW, ways: countWays(n), t: { f: 'count', n, q: `how-${layout}` } };
  return typed ? numQ({ ...base, value: n }) : pickQ({ ...base, right: numOpt(n), wrong: numOpts(others(n, 1, 10, 3, 2)), big: true });
}
function findGroup(n, hi) {
  const wrong = others(n, 1, hi, 3, 3).map(m => ({ h: groupTile(m), s: '' }));
  return pickQ({ ask: `Tap the group with ${cnt(n, 'dot')}.` + tag('find', n), say: `Tap the group with ${sayCnt(n, 'dot')}.`, right: { h: groupTile(n), s: '' }, wrong, mode: 'find',
    hint: 'Count the dots in each group. Which group has the right number?', ways: countWays(n), t: { f: 'findgroup', n, target: { number: n }, q: 'find' } });
}
// Circles to count among squares that are not counted.
function mixed(n) {
  const total = n + rnd(2, 4), pts = scatter(total, 300, 150, 14), kinds = shuffle(pts.map((_, i) => i < n));
  const inner = pts.map((p, i) => (kinds[i] ? counter(p.x, p.y, 14, 'a')
    : el('rect', { x: p.x - 13, y: p.y - 13, width: 26, height: 26, fill: '#fff', stroke: '#16365c', 'stroke-width': 2.5, 'data-other': 1 }))).join('');
  return pickQ({ ask: 'How many circles?' + tag('mixed', n), say: 'How many circles are there? Do not count the squares.', visual: svg(300, 150, inner, { label: 'circles and squares', data: { count: n } }),
    right: numOpt(n), wrong: numOpts(others(n, 1, 10, 3, 2)), big: true, hint: 'Count only the round ones. Skip the squares.', ways: countWays(n), t: { f: 'count', n, q: 'mixed' } });
}

export function genCount(L) {
  if (L === 1) {
    const n = rnd(1, 5), t = pick(['scatter', 'line', 'find']);
    return t === 'find' ? findGroup(n, 5) : howMany(n, t, false);
  }
  if (L === 2) {
    const n = rnd(3, 10), t = pick(['scatter', 'line', 'find', 'mixed']);
    return t === 'find' ? findGroup(n, 10) : t === 'mixed' ? mixed(Math.min(n, 8)) : howMany(n, t, false);
  }
  const n = rnd(4, 10), t = pick(['typed', 'typedline', 'mixed', 'find']);
  if (t === 'mixed') return mixed(n);
  if (t === 'find') return findGroup(rnd(6, 10), 10);
  return howMany(n, t === 'typed' ? 'scatter' : 'line', true);
}

// ---- 11 to 20: a full ten frame and some more ----
const tenWays = n => [
  way('Ten and some more', ['A full frame holds 10.', `Count the extras: ${n - 10}. So ${n} is ten and ${n - 10} more.`]),
  way('Count them all', [`Count on from ten: ${Array.from({ length: n - 10 }, (_, i) => 11 + i).join(', ')}.`, `That makes ${n}.`]),
];
const tenHow = (n, typed) => {
  const base = { ask: 'How many dots?' + tag('frames', n), say: 'How many dots are there?', visual: framesPic(n), hint: 'The full frame is ten. Count the rest on from ten.', ways: tenWays(n), t: { f: 'count', n, q: 'frames' } };
  return typed ? numQ({ ...base, value: n }) : pickQ({ ...base, right: numOpt(n), wrong: numOpts(others(n, 11, 20, 3, 3)), big: true });
};
const tenMore = n => pickQ({ ask: 'The full frame is ten. How many more are there?' + tag('more', n), say: 'The full frame is ten. How many more dots are there?', visual: framesPic(n, true),
  right: numOpt(n - 10), wrong: numOpts(others(n - 10, 1, 10, 3, 2)), big: true, hint: 'Count only the dots in the second frame.', ways: tenWays(n), t: { f: 'tenmore', n, q: 'more' } });
const tenPlus = k => pickQ({ ask: `Which number is ten and ${k} more?` + tag('plus', k), say: `Which number is ten and ${numWord(k)} more?`,
  right: numOpt(10 + k), wrong: numOpts(others(10 + k, 11, 20, 3, 3)), big: true, hint: 'Start at ten and count on.', ways: tenWays(10 + k), t: { f: 'tenplus', k, q: 'plus' } });
function scatterTyped(n) {
  const pts = scatter(n, 300, 170, 11);
  return numQ({ ask: 'How many dots?' + tag('scatter20', n), say: 'How many dots are there?', visual: svg(300, 170, pts.map(p => counter(p.x, p.y, 11)).join(''), { label: cnt(n, 'dot'), data: { count: n } }),
    value: n, hint: 'Count in a path so you do not skip any.', ways: countWays(n).slice(0, 1), t: { f: 'count', n, q: 'scatter20' } });
}

export function genCount20(L) {
  const t = pick(L === 1 ? ['how', 'more', 'plus'] : L === 2 ? ['how', 'more', 'plus', 'how'] : ['typed', 'typed', 'scatter', 'more', 'plus']);
  const n = L === 1 ? rnd(11, 15) : rnd(11, 20);
  if (t === 'more') return tenMore(Math.min(n, 19));
  if (t === 'how') return tenHow(n, false);
  if (t === 'typed') return tenHow(n, true);
  if (t === 'scatter') return scatterTyped(rnd(11, 20));
  return tenPlus(n - 10);
}
