// Sorting: which one does not belong, which group does it go with, how many of one kind.
import { rnd, pick, shuffle, way } from '../../util.js';
import { pickQ, opt, numOpt, numOpts, others, tag, plural, cnt } from './kit.js';
import { itemAt, itemTile, groupOfTile, valuesFor, keyOf, SAY } from './items.js';
import { scatter } from './pics.js';
import { svg } from './svg.js';

const DIMS = ['shape', 'size', 'color'];
const vals = (dim, n) => (dim === 'size' && n === 2 ? shuffle(['small', 'large']) : valuesFor(dim, n));
const nameOf = (dim, v) => (dim === 'shape' ? plural(v) : dim === 'size' ? SAY[v] : v);
const kindWord = dim => (dim === 'shape' ? 'shape' : dim === 'size' ? 'size' : 'color');

function oddQ(L) {
  const dim = pick(DIMS), [same, odd] = vals(dim, 2), k = L === 1 ? 3 : 4;
  return pickQ({ ask: 'Which one does not belong?' + tag('odd', dim, same, odd), say: 'Which one does not belong with the others?', right: opt(itemTile(dim, odd, 0), ''), wrong: Array.from({ length: k - 1 }, (_, i) => opt(itemTile(dim, same, i + 1), '')), mode: 'pick', quiet: true,
    hint: `Look at the ${kindWord(dim)} of each one. Three are the same.`, ways: [way('Find the match', [`Look at the ${kindWord(dim)} of each one.`, `All but one have the same ${kindWord(dim)}. The different one does not belong.`])], t: { f: 'sortodd', dim, q: 'odd' } });
}
function groupQ(L) {
  const dim = pick(DIMS), vs = vals(dim, L === 1 ? 2 : 3), right = vs[0];
  return pickQ({ ask: 'Which group does it go with?' + tag('group', dim, right), say: 'Which group does this one go with?', visual: itemTile(dim, right, 0), right: opt(groupOfTile(dim, right), ''), wrong: vs.slice(1).map(v => opt(groupOfTile(dim, v), '')), mode: 'pick', quiet: true,
    hint: `Look at the ${kindWord(dim)} of the one on top. Find a group with the same ${kindWord(dim)}.`, ways: [way('Match the kind', [`Look at the ${kindWord(dim)} of the first one.`, 'The group with the same kind is the answer.'])], t: { f: 'sortgroup', dim, q: 'group' } });
}
function howManyQ(L) {
  const dim = pick(DIMS), kinds = L === 3 && dim !== 'size' && rnd(0, 1) ? 3 : 2, vs = vals(dim, kinds), top = L === 1 ? 4 : 6;
  const counts = vs.map(() => rnd(1, top)), want = rnd(0, kinds - 1), neg = L === 3 && rnd(0, 1) === 1;
  const items = vs.flatMap((v, i) => Array.from({ length: counts[i] }, () => v)), pts = scatter(items.length, 300, 150, 21), order = shuffle(items.map((_, i) => i));
  const inner = pts.map((p, i) => itemAt(dim, items[order[i]], p.x, p.y, 1)).join('');
  const answer = neg ? items.length - counts[want] : counts[want], name = nameOf(dim, vs[want]);
  const ask = (neg ? `How many are not ${name}?` : dim === 'shape' ? `How many ${name}?` : `How many are ${name}?`);
  const say = dim === 'shape' && !neg ? `How many ${name} are there?` : ask;
  const pool = others(answer, 0, Math.max(answer + 2, 6), 3, 2);
  return pickQ({ ask: ask + tag('howmany', dim, vs[want], neg, items.length), say, visual: svg(300, 150, inner, { label: cnt(items.length, 'thing') }), right: numOpt(answer), wrong: numOpts(pool), big: true, mode: 'ask',
    hint: `Look at the ${kindWord(dim)} of each one. Touch each one as you count.`, ways: [way('Count one kind', [`Count only the ones that are ${neg ? 'not ' : ''}${name}.`, `There are ${answer}.`])], t: { f: 'sortcount', key: keyOf(dim, vs[want]), neg, q: neg ? 'notcount' : 'howmany' } });
}
export function genSort(L) {
  if (L === 1) return pick([oddQ, groupQ, howManyQ])(L);
  if (L === 2) return pick([oddQ, groupQ, howManyQ, howManyQ])(L);
  return pick([oddQ, groupQ, howManyQ, howManyQ, howManyQ])(L);
}
