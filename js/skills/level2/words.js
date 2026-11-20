// Small text helpers shared by the level 2 topic files.
export const BLANK = '<span class="blank">?</span>';
export const LT = '&lt;', GT = '&gt;';
export const cnt = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
// "is" or "are" to go with a count.
export const isAre = n => (n === 1 ? 'is' : 'are');
// "4 + 4 + 4": n written g times.
export const rep = (g, n) => Array(g).fill(n).join(' + ');
// "4, 8, 12": the first g multiples of n.
export const skips = (g, n) => Array.from({ length: g }, (_, i) => n * (i + 1)).join(', ');
// Builds a story problem object from a context row [story, ask, find, know, clue].
export function tell(row, op, answer, ways, plan, t, extra = {}) {
  const [story, ask, find, know, clue] = row;
  return { story, ask, answer, op, ways, read: { find, know, clue, plan }, _t: t, ...extra };
}
