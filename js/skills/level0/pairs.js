// Number pairs that make 5 and 10: how many more to fill a frame, a missing number in a sentence, and which pair fits.
import { rnd, pick, way } from '../../util.js';
import { pickQ, opt, numOpt, numOpts, others, tag, numWord } from './kit.js';
import { svg } from './svg.js';
import { tenFrame } from './pics.js';

const frame = (cells, a) => svg(148, cells === 5 ? 36 : 64, tenFrame({ x: 4, y: 4, cell: 28, a, cells }), { label: `${a} counters in a frame of ${cells}`, data: { cells, filled: a } });
const pairWays = (a, T) => [way('Count on', [`Start at ${a}. Count on to ${T}: ${Array.from({ length: T - a }, (_, i) => a + i + 1).join(', ')}.`, `That is ${T - a} more.`]),
  way('Look at the empty boxes', [`The frame holds ${T}.`, `${T - a} boxes are still empty.`])];
const base = (a, T, q) => ({ mode: q.startsWith('sentence') ? 'pick' : 'ask', right: numOpt(T - a), wrong: numOpts(others(T - a, 0, T, 3, 2)), big: true, hint: 'Count the empty boxes, or count on from the number you have.', ways: pairWays(a, T), t: { f: 'pairs', a, T, q } });

const framePair = (a, T) => pickQ({ ask: `How many more make ${T}?` + tag('frame', a, T), say: `How many more make ${numWord(T)}?`, visual: frame(T, a), ...base(a, T, 'frame') });
const sentenceQ = (a, T, pic) => pickQ({ ask: 'Find the missing number.' + tag('missing', a, T, pic ? 'p' : 'n'), expr: `${a} + ? = ${T}`, say: `${numWord(a)} plus what makes ${numWord(T)}?`, visual: pic ? frame(T, a) : undefined, ...base(a, T, pic ? 'sentencepic' : 'sentence') });
function pairPick(T) {
  const a = rnd(1, T - 1), pairs = [[a, T - a]];
  while (pairs.length < 4) {
    const x = rnd(1, T - 1), y = Math.max(1, Math.min(T, T - x + pick([-2, -1, 1, 2])));
    const k = [x, y].sort().join();
    if (x + y !== T && !pairs.some(p => p.slice().sort().join() === k)) pairs.push([x, y]);
  }
  const o = ([x, y]) => opt(`${x} and ${y}`, `${numWord(x)} and ${numWord(y)}`);
  return pickQ({ ask: `Which two numbers make ${T}?` + tag('pair', T, a), say: `Which two numbers make ${numWord(T)}?`, right: o(pairs[0]), wrong: pairs.slice(1).map(o), mode: 'pick',
    hint: 'Add the two numbers. Do they make the number you are looking for?', ways: [way('Add them', [`${a} and ${T - a} make ${T}.`, 'The other pairs are too big or too small.'])], t: { f: 'pairpick', T, q: 'pair' } });
}
export function genPairs(L) {
  if (L === 1) { const a = rnd(1, 4); return pick([framePair, (x, T) => sentenceQ(x, T, true), () => pairPick(5)])(a, 5); }
  if (L === 2) { const a = rnd(1, 9), t = pick(['frame', 'frame', 'sentence', 'pair']); return t === 'pair' ? pairPick(10) : t === 'frame' ? framePair(a, 10) : sentenceQ(a, 10, true); }
  const T = pick([5, 10]), a = rnd(1, T - 1), t = pick(['sentence', 'pair', 'frame', 'sentence']);
  return t === 'pair' ? pairPick(T) : t === 'frame' ? framePair(a, T) : sentenceQ(a, T, false);
}
