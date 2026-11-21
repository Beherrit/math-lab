// Number recognition: find the number that was said, say which number is shown, match dots to a number (0 to 10, 20, 100).
import { rnd, pick, shuffle, way } from '../../util.js';
import { pickQ, numOpt, numOpts, others, big, tag, numWord } from './kit.js';
import { bigGlyph } from './svg.js';
import { dotsPic, framesPic } from './pics.js';

const RANGE = [[0, 10], [0, 20], [10, 100]];
// Numbers a child might mix up with n: digits swapped, one more or less, ten more or less.
function lookalikes(n, lo, hi) {
  const swapped = n >= 10 && n < 100 ? Number(String(n).split('').reverse().join('')) : -1;
  const c = [swapped, n + 1, n - 1, n + 10, n - 10].filter(v => v >= lo && v <= hi && v !== n && v >= 1);
  return [...new Set(c)];
}
function distractors(n, L) {
  const [lo, hi] = RANGE[L - 1];
  if (L < 3) return others(n, lo, hi, 3, 3);
  const base = lookalikes(n, lo, hi).slice(0, 2);
  return [...base, ...others(n, lo, hi, 3, 12)].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);
}
const readWay = n => [way('Say it, then find it', [`Say the number out loud: ${numWord(n)}.`, `Look for the number ${n} on the buttons.`])];

function findNumber(n, L) {
  return pickQ({ ask: `Tap the number ${big(n)}` + tag('find', n), say: `Tap the number ${numWord(n)}.`, right: numOpt(n), wrong: numOpts(distractors(n, L)), big: true, mode: 'find',
    hint: 'Say the number slowly. Then look for it.', ways: readWay(n), t: { f: 'numfind', n, target: { number: n }, q: 'find' } });
}
function shownNumber(n, L) {
  return pickQ({ ask: 'What number is this?' + tag('shown', n), say: 'What number is this?', visual: bigGlyph(n, { number: n }, 190), right: numOpt(n), wrong: numOpts(distractors(n, L)), big: true,
    hint: 'Look at the shape of each digit. Count up to it if that helps.', ways: readWay(n), t: { f: 'numshown', n, q: 'shown' } });
}
function dotsToNumber(n, L) {
  const visual = n > 10 ? framesPic(n) : dotsPic(n, pick(['scatter', 'line']));
  return pickQ({ ask: 'How many dots? Tap the number.' + tag('dots', n), say: 'How many dots are there? Tap the number.', visual, right: numOpt(n), wrong: numOpts(distractors(n, L)), big: true,
    hint: 'Count the dots one at a time. Then find that number.', ways: [way('Count, then match', [`Count the dots: ${n}.`, `The number ${n} is the one to tap.`])], t: { f: 'numdots', n, q: 'dots' } });
}
function hasDigit() {
  const d = rnd(1, 9), right = pick([rnd(1, 9) * 10 + d, d * 10 + rnd(0, 9)]);
  const pool = shuffle(Array.from({ length: 90 }, (_, i) => i + 10).filter(v => !String(v).includes(String(d))));
  return pickQ({ ask: `Tap the number with a ${big(d)} in it.` + tag('digit', d), say: `Tap the number that has a ${numWord(d)} in it.`, right: numOpt(right), wrong: numOpts(pool.slice(0, 3)), big: true, mode: 'pick',
    hint: 'Look at each digit in each number.', ways: [way('Check each number', [`Look at both digits of every number.`, `${right} has a ${d} in it.`])], t: { f: 'hasdigit', d, target: { number: d }, q: 'digit' } });
}

export function genNumRec(L) {
  const [lo, hi] = RANGE[L - 1];
  const n = L === 3 ? rnd(11, 100) : L === 2 ? rnd(Math.max(lo, pick([0, 5, 10])), hi) : rnd(lo, hi);
  const t = pick(L === 3 ? ['find', 'shown', 'digit', 'find'] : ['find', 'shown', 'dots']);
  if (t === 'digit') return hasDigit();
  if (t === 'dots') return dotsToNumber(Math.max(1, n), L);
  return t === 'find' ? findNumber(n, L) : shownNumber(n, L);
}
