// Small text helpers shared by the level 1 topic files.
import { rnd } from '../../util.js';
export const BLANK = '<span class="blank">?</span>';
export const cnt = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
// "4, 5, 6": n numbers counted on (dir 1) or back (dir -1) from `from`, by `step`.
export const countList = (from, n, dir = 1, step = 1) => Array.from({ length: n }, (_, i) => from + dir * step * (i + 1)).join(', ');
export const digits = n => [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10];
export const PLACES = ['hundreds', 'tens', 'ones'];
// Hidden marker for picture-only questions: the repeat check reads the question text, so what the picture shows goes in here.
export const mark = (...v) => `<!--${v.join(' ')}-->`;
// n different whole numbers from lo to hi.
export function uniq(n, lo, hi) {
  const s = new Set();
  while (s.size < n) s.add(rnd(lo, hi));
  return [...s];
}
// "a, b and c"
export const joinAnd = xs => (xs.length > 1 ? xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1] : String(xs[0]));
export const sumOf = xs => xs.reduce((s, x) => s + x, 0);
export const evenOdd = n => (n % 2 ? 'Odd' : 'Even');
