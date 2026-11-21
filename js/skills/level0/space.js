// Comparing sizes (l0size) and position words (l0where).
import { rnd, pick, shuffle, way } from '../../util.js';
import { pickQ, opt, tag } from './kit.js';
import { sizeTile, column, row, overlap, SCENE_SHAPES } from './spacedraw.js';
import { flatTile, FILLS } from './shapedraw.js';

// ---- l0size ----
const WORDS = { big: ['bigger', 'smaller', 'biggest', 'smallest'], long: ['longer', 'shorter', 'longest', 'shortest'], tall: ['taller', 'shorter', 'tallest', 'shortest'] };
function sizes(k, gap) {
  for (;;) {
    const xs = Array.from({ length: k }, () => rnd(16, 88)).sort((a, b) => a - b);
    if (xs.every((v, i) => !i || v - xs[i - 1] >= gap)) return shuffle(xs);
  }
}
function sizeQ(L) {
  const dims = L === 1 ? ['big', 'long', 'tall'] : ['big', 'long', 'tall'], dim = pick(dims), k = L === 3 ? 3 : 2;
  const xs = sizes(k, L === 1 ? 30 : L === 2 ? 14 : 18), kind = pick(['circle', 'square']);
  const mid = k === 3 && pick([false, true, false]), top = pick([true, false]), w = WORDS[dim];
  const word = mid ? null : w[(k === 3 ? 2 : 0) + (top ? 0 : 1)];
  const sorted = xs.slice().sort((p, q) => p - q), want = mid ? sorted[1] : top ? sorted[k - 1] : sorted[0];
  const say = mid ? 'Which one is the middle size?' : `Tap the ${word} one.`;
  const t = (x) => opt(sizeTile(dim, x, kind), '');
  return pickQ({ ask: say + tag('size', dim, word ?? 'mid', xs.join(' ')), say, right: t(want), wrong: xs.filter(x => x !== want).map(t), mode: 'pick', quiet: true,
    hint: 'Look at all of them. Which one fits the word?', ways: [way('Line them up', ['Imagine putting them side by side, starting at the same place.', `The ${mid ? 'middle one' : word + ' one'} is the answer.`])], t: { f: 'size', dim, rank: mid ? 'mid' : top ? 'max' : 'min', q: `${dim}-${k}${mid ? 'mid' : ''}` } });
}
export const genSize = sizeQ;

// ---- l0where ----
const dec = (list, answer, k) => shuffle([answer, ...shuffle(list.filter(n => n !== answer)).slice(0, k - 1)]);
function whereQ({ ask, say, visual, answer, kind, extra = {} }) {
  const fill = pick(FILLS), names = dec(SCENE_SHAPES, answer, 4), a = n => `a ${n}`;
  const o = n => opt(flatTile(n, { fill, size: 26, turn: 0 }), a(n));
  return pickQ({ ask: ask + tag('where', kind, answer), say, visual, right: o(answer), wrong: names.filter(n => n !== answer).map(o), mode: 'ask',
    hint: 'Look at where each shape is. Use the word in the question.', ways: [way('Find the shape in the question', ['Look at the shape the question names.', 'Then look where the question points.'])], t: { f: 'where', rel: kind, q: kind, ...extra } });
}
const NAMES3 = () => shuffle(SCENE_SHAPES).slice(0, 3);
function vertical() {
  const [top, bottom] = shuffle(SCENE_SHAPES).slice(0, 2), above = pick([true, false]), ref = above ? bottom : top;
  return whereQ({ ask: `Which shape is ${above ? 'above' : 'below'} the ${ref}?`, say: `Which shape is ${above ? 'above' : 'below'} the ${ref}?`, visual: column([top, bottom]), answer: above ? top : bottom, kind: above ? 'above' : 'below' });
}
function sideways() {
  const [l, r] = shuffle(SCENE_SHAPES).slice(0, 2), left = pick([true, false]), ref = left ? r : l;
  return whereQ({ ask: `Which shape is on the ${left ? 'left' : 'right'} of the ${ref}?`, say: `Which shape is on the ${left ? 'left' : 'right'} of the ${ref}?`, visual: row([l, r]), answer: left ? l : r, kind: left ? 'left' : 'right' });
}
function frontBehind() {
  const [back, front] = shuffle(SCENE_SHAPES).slice(0, 2), isFront = pick([true, false]);
  return whereQ({ ask: `Which shape is ${isFront ? 'in front' : 'behind'}?`, say: `Which shape is ${isFront ? 'in front' : 'behind'}?`, visual: overlap(back, front), answer: isFront ? front : back, kind: isFront ? 'front' : 'behind' });
}
function between() {
  const [a, m, c] = NAMES3();
  return whereQ({ ask: `Which shape is between the ${a} and the ${c}?`, say: `Which shape is between the ${a} and the ${c}?`, visual: row([a, m, c]), answer: m, kind: 'between' });
}
function nextTo() {
  const xs = NAMES3(), atLeft = pick([true, false]), ref = atLeft ? xs[0] : xs[2];
  return whereQ({ ask: `Which shape is next to the ${ref}?`, say: `Which shape is next to the ${ref}?`, visual: row(xs), answer: xs[1], kind: 'next' });
}
function firstLast(k) {
  const xs = shuffle(SCENE_SHAPES).slice(0, k), first = pick([true, false]);
  return whereQ({ ask: `Starting from the left, which shape is ${first ? 'first' : 'last'}?`, say: `Starting from the left, which shape is ${first ? 'first' : 'last'}?`, visual: row(xs), answer: first ? xs[0] : xs[k - 1], kind: first ? 'first' : 'last' });
}
export function genWhere(L) {
  if (L === 1) return pick([vertical, frontBehind, vertical])();
  if (L === 2) return pick([sideways, nextTo, () => firstLast(3), sideways])();
  return pick([between, () => firstLast(4), nextTo, between, vertical, sideways, frontBehind])();
}
