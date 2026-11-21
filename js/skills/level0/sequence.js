// Counting in order: what comes next or before on a number line (l0next) and a hundred chart, by ones and by tens (l0tens).
import { rnd, pick, shuffle, way } from '../../util.js';
import { pickQ, numOpt, numOpts, others, big, tag, numWord, numList } from './kit.js';
import { numLine, chart } from './pics.js';

// ---- number line ----
const LINE = [{ lo: 0, hi: 10, count: 11 }, { lo: 0, hi: 20, count: 9 }, { lo: 1, hi: 100, count: 7 }];
const lineWays = (kind, ref, ans) => [
  way('Count on the line', [kind === 'before' ? `Start at ${ref} and go one step back.` : `Start at ${kind === 'next' ? ref : ans - 1} and go one step on.`, `The number is ${ans}.`]),
  way('Say the counting words', [kind === 'before' ? `${numList([ans, ref])}: ${ans} comes just before ${ref}.` : `${numList([ans - 1, ans])}: ${ans} comes just after ${ans - 1}.`]),
];
function sparse(count, hide, need, L) {
  if (L === 1) return Array.from({ length: count }, (_, i) => i).filter(i => i !== hide);
  const extra = shuffle(Array.from({ length: count }, (_, i) => i).filter(i => i !== hide && !need.includes(i))).slice(0, 1);
  return [...need, ...extra];
}
export function genNext(L) {
  const { lo, hi, count } = LINE[L - 1], kind = pick(['next', 'before', 'missing', L === 1 ? 'next' : 'missing']);
  const start = L === 1 ? 0 : rnd(lo, hi - count + 1);
  const i = kind === 'next' ? rnd(1, count - 1) : kind === 'before' ? rnd(0, count - 2) : rnd(1, count - 2);
  const ans = start + i, ref = kind === 'next' ? ans - 1 : ans + 1;
  const need = kind === 'next' ? [i - 1] : kind === 'before' ? [i + 1] : [i - 1, i + 1];
  const ask = kind === 'missing' ? 'What number is missing?' : `What comes ${kind === 'next' ? 'after' : 'before'} ${big(ref)}?`;
  const say = kind === 'missing' ? 'Look at the number line. What number is missing?' : `What number comes ${kind === 'next' ? 'after' : 'before'} ${numWord(ref)}?`;
  const hint = kind === 'before' ? 'Count back by one from the number.' : kind === 'next' ? 'Count on by one from the number.' : 'Look at the numbers on both sides of the box.';
  return pickQ({ ask: ask + tag('line', kind, ans), say, visual: numLine(start, count, { hide: i, show: sparse(count, i, need, L) }), right: numOpt(ans),
    wrong: numOpts(others(ans, lo, hi, 3, 3)), big: true, hint, ways: lineWays(kind, ref, ans), t: { f: 'line', kind, ans, q: kind } });
}

// ---- hundred chart ----
const tensNear = (ans, max) => shuffle([ans + 10, ans - 10, ans + 20, ans - 20, ans + 30, max].filter(v => v >= 10 && v <= max && v !== ans)).slice(0, 3);
function near(ans, max, L) {
  const c = [ans + 1, ans - 1, L > 1 ? ans + 10 : ans + 2, L > 1 ? ans - 10 : ans - 2].filter(v => v >= 1 && v <= max && v !== ans);
  return shuffle([...c, ...others(ans, 1, max, 3, 4)].filter((v, k, a) => a.indexOf(v) === k)).slice(0, 3);
}
function chartQ({ rows, hide, mark = [], ask, say, hint, ways, kind, ans, wrong }) {
  return pickQ({ ask: ask + tag('chart', kind, ans), say, visual: chart(rows, { hide, mark }), right: numOpt(ans), wrong: numOpts(wrong), big: true, hint, ways, t: { f: 'chart', kind, ans, rows, q: kind } });
}
function byTens(rows, L, back) {
  const max = rows * 10, len = rnd(2, 3), top = max / 10;
  const startK = back ? rnd(len + 1, top) : L === 3 ? rnd(2, top - len) : rnd(1, top - len), ks = Array.from({ length: len }, (_, i) => (back ? startK - i : startK + i));
  const seq = ks.map(k => k * 10), ans = seq[len - 1] + (back ? -10 : 10);
  const list = seq.join(', '), word = back ? 'back ' : '';
  return chartQ({ rows, hide: ans, mark: seq, kind: back ? 'tensback' : 'tensnext', ans, wrong: tensNear(ans, max),
    ask: `Count ${word}by tens: ${list}. What comes next?`,
    say: `Count ${word}by tens. ${numList(seq)}. What comes next?`, hint: 'Each number is one row ' + (back ? 'up' : 'down') + ' from the one before.',
    ways: [way('Jump a row', [`Each step moves ${back ? 'up' : 'down'} one row, so the number changes by ten.`, `${seq[len - 1]} ${back ? 'minus' : 'plus'} ten is ${ans}.`]), way('Say it out loud', [`${seq.join(', ')}, ${ans}.`])] });
}
export function genTens(L) {
  const rows = L === 1 ? 5 : 10, max = rows * 10;
  const kind = pick(L === 1 ? ['missing', 'tensnext', 'after'] : L === 2 ? ['missing', 'tensnext', 'after', 'before'] : ['missing', 'tensnext', 'tensback', 'after', 'before']);
  if (kind === 'tensnext' || kind === 'tensback') return byTens(rows, L, kind === 'tensback');
  const edge = L === 3 && pick([true, false]);
  const ans = kind === 'missing' ? rnd(2, max - 1) : kind === 'after' ? (edge ? rnd(1, rows - 1) * 10 + 1 : rnd(2, max - 1)) : (edge ? rnd(1, rows - 1) * 10 : rnd(2, max - 1));
  const ref = kind === 'after' ? ans - 1 : ans + 1;
  const ask = kind === 'missing' ? 'Which number is missing?' : `What comes ${kind === 'after' ? 'after' : 'before'} ${big(ref)}?`;
  const say = kind === 'missing' ? 'Look at the chart. Which number is missing?' : `What number comes ${kind} ${numWord(ref)}?`;
  return chartQ({ rows, hide: ans, mark: kind === 'missing' ? [] : [ref], kind, ans, wrong: near(ans, max, L), ask, say,
    hint: kind === 'missing' ? 'Read the numbers along the row. Which one is not there?' : 'Find the number on the chart. Look at the square next to it.',
    ways: [way('Read the chart', [kind === 'missing' ? `Read along the row: the square with the question mark comes after ${ans - 1}.` : `${ref} is on the chart. The next square ${kind === 'after' ? 'along' : 'back'} is ${ans}.`, `At the end of a row the count goes down to the start of the next row.`]),
      way('Count', [kind === 'before' ? `Count back one from ${ref}: ${ans}.` : `Count on one from ${ans - 1}: ${ans}.`])] });
}
