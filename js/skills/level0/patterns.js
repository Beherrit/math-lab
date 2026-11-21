// Repeating patterns of shapes, sizes or colors: what comes next, what goes in the box, how long is the repeat, which one is wrong.
import { rnd, pick, shuffle, way } from '../../util.js';
import { pickQ, opt, numOpt, numOpts, tag } from './kit.js';
import { itemTile, itemRow, valuesFor } from './items.js';

const UNITS = [['AB'], ['AB', 'AAB', 'ABB'], ['AAB', 'ABB', 'ABC', 'AB']];
const letters = unit => [...new Set(unit)];
// The value shown at each place of a pattern of length n.
const sequence = (unit, vals, n) => Array.from({ length: n }, (_, i) => vals[letters(unit).indexOf(unit[i % unit.length])]);
const wordsFor = dim => (dim === 'shape' ? 'shape' : dim === 'size' ? 'size' : 'color');
const patWays = (unit, dim) => [way('Say the pattern', [`Say what you see in order. The ${wordsFor(dim)}s repeat: ${unit.split('').join(' ')}, ${unit.split('').join(' ')}.`, 'Keep saying it. What comes after the last one?']),
  way('Find the part that repeats', ['Look for the little group that happens again and again.', 'Finish the group.'])];
const optOf = (dim, v) => opt(itemTile(dim, v), '');

function setup(L) {
  const unit = pick(UNITS[L - 1]), dim = pick(['shape', 'size', 'color']), need = letters(unit).length;
  const vals = valuesFor(dim, dim === 'shape' || dim === 'size' ? 3 : 4);
  return { unit, dim, vals, need, spare: vals.slice(need) };
}
function nextQ(L) {
  const { unit, dim, vals, need } = setup(L), len = unit.length, shown = (len === 2 ? 5 : 6) + rnd(0, 1), seq = sequence(unit, vals, shown + 1);
  const right = seq[shown], wrong = vals.filter(v => v !== right);
  return pickQ({ ask: 'What comes next?' + tag('next', unit, dim, shown), say: 'What comes next in the pattern?', visual: itemRow(dim, [...seq.slice(0, shown), null]), right: optOf(dim, right), wrong: wrong.map(v => optOf(dim, v)), mode: 'ask', quiet: true,
    hint: 'Say the pattern out loud from the start.', ways: patWays(unit, dim), t: { f: 'pattern', kind: 'next', unit, need, q: 'next' } });
}
function missingQ(L) {
  const { unit, dim, vals } = setup(L), len = unit.length, total = 2 * len + 2 + (len === 2 ? 1 : 0), seq = sequence(unit, vals, total), hole = rnd(len, total - 2);
  const right = seq[hole], shownRow = seq.map((v, i) => (i === hole ? null : v));
  return pickQ({ ask: 'What goes in the box?' + tag('missing', unit, dim, hole), say: 'What goes in the empty box?', visual: itemRow(dim, shownRow), right: optOf(dim, right), wrong: vals.filter(v => v !== right).map(v => optOf(dim, v)), mode: 'ask', quiet: true,
    hint: 'Look at the ones next to the box. Say the pattern.', ways: patWays(unit, dim), t: { f: 'pattern', kind: 'missing', unit, q: 'missing' } });
}
function unitQ(L) {
  const { unit, dim, vals } = setup(L), len = unit.length, seq = sequence(unit, vals, 2 * len + 2);
  return pickQ({ ask: 'How many make the repeat?' + tag('unit', unit, dim), say: 'How many things are in the part that repeats?', visual: itemRow(dim, seq), right: numOpt(len), wrong: numOpts([1, 2, 3, 4].filter(n => n !== len)), big: true, mode: 'ask',
    hint: 'Find the little group that happens again and again. Count it.', ways: patWays(unit, dim), t: { f: 'pattern', kind: 'unit', unit, q: 'unit' } });
}
function mistakeQ(L) {
  const { unit, dim, vals } = setup(L), len = unit.length, total = Math.min(8, 2 * len + 2), seq = sequence(unit, vals, total), at = rnd(len, total - 1);
  const swap = pick(vals.filter(v => v !== seq[at])), bad = seq.map((v, i) => (i === at ? swap : v));
  const positions = shuffle(Array.from({ length: total }, (_, i) => i + 1).filter(n => n !== at + 1)).slice(0, 3);
  return pickQ({ ask: 'One does not fit. Which number is it?' + tag('mistake', unit, dim, at), say: 'One does not fit the pattern. Which number is it?', visual: itemRow(dim, bad, { numbers: true }), right: numOpt(at + 1), wrong: numOpts(positions), big: true, mode: 'ask',
    hint: 'Say the pattern from the start. Stop where it goes wrong.', ways: patWays(unit, dim), t: { f: 'pattern', kind: 'mistake', unit, q: 'mistake' } });
}
export function genPattern(L) {
  if (L === 3) return pick([nextQ, missingQ, mistakeQ, mistakeQ, unitQ])(L);
  return pick([nextQ, nextQ, missingQ, unitQ])(L);
}
