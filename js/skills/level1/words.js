// Small text helpers shared by the level 1 topic files.
export const BLANK = '<span class="blank">?</span>';
export const cnt = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
// "4, 5, 6": n numbers counted on (dir 1) or back (dir -1) from `from`, by `step`.
export const countList = (from, n, dir = 1, step = 1) => Array.from({ length: n }, (_, i) => from + dir * step * (i + 1)).join(', ');
export const digits = n => [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10];
export const PLACES = ['hundreds', 'tens', 'ones'];
