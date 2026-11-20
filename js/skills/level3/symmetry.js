// Lines of symmetry: does a shape have one, how many, and completing a mirror picture.
import { rnd, pick, chance, shuffle, b, way, num, choice } from '../../util.js';
import { oneOf, plural, tagged, yesNo } from './helpers.js';
import { SYM, LETTERS, symShapeSVG, letterSVG, mirrorGrid } from './visuals-sym.js';

// For each shape: how a fold shows its lines of symmetry, and a way to think it through.
const TEXT = {
  'square': ['Fold it along both middle lines and along both diagonals: 4 folds match.', 'All four sides and all four corners are the same, so it can be flipped four ways.'],
  'rectangle': ['Fold it across the middle each way: 2 folds match. A fold along a diagonal leaves the corners sticking out.', 'Its sides are not all equal, so only the two middle folds work.'],
  'rhombus': ['Fold it along each diagonal: 2 folds match. A fold across the middle leaves the slanted sides not matching.', 'All four sides are equal, but the corners are not square, so only the diagonals work.'],
  'kite': ['Fold it along the line joining its two pointed ends: 1 fold matches.', 'The two short sides match and the two long sides match, so one fold works.'],
  'isosceles trapezoid': ['Fold it down the middle, between the two parallel sides: 1 fold matches.', 'Its two slanted sides are the same length, so one fold works.'],
  'parallelogram': ['Try every fold. Each one leaves the halves not matching, so none match.', 'Its corners lean one way, so flipping it never gives the same shape.'],
  'right trapezoid': ['Try every fold. None of them makes the halves match.', 'Its four sides are all different, so no fold works.'],
  'equilateral triangle': ['Fold from each corner to the middle of the opposite side: 3 folds match.', 'All three sides are equal, so each corner gives one fold.'],
  'isosceles triangle': ['Fold from the top corner to the middle of the opposite side: 1 fold matches.', 'Only two sides are equal, so only one fold works.'],
  'scalene triangle': ['Try every fold. None makes the halves match.', 'All three sides are different, so no fold works.'],
  'regular pentagon': ['Fold from each corner to the middle of the opposite side: 5 folds match.', 'It has 5 equal sides, so each corner gives one fold.'],
  'regular hexagon': ['3 folds go through opposite corners and 3 go through the middles of opposite sides: 6 folds match.', 'It has 6 equal sides, so there are 6 folds.'],
};
const NAMES = Object.keys(SYM);
const cap = s => s[0].toUpperCase() + s.slice(1);
const L1 = ['square', 'rectangle', 'equilateral triangle', 'isosceles triangle', 'kite', 'parallelogram', 'scalene triangle', 'right trapezoid'];
const LETTER_L1 = ['A', 'H', 'T', 'O', 'F', 'L', 'S', 'X'];
const linesOf = name => SYM[name].lines;
const lineNum = n => (n === 0 ? 'no lines' : plural(n, 'line'));

function hasLine(L) {
  const name = L === 1 && chance(0.4) ? pick(LETTER_L1) : pick(L === 1 ? L1 : NAMES), letter = name.length === 1, n = letter ? LETTERS[name] : linesOf(name), pic = letter ? letterSVG(name) : symShapeSVG(name, L === 3 ? rnd(0, 359) : 0);
  return tagged({ ask: 'Does this shape have a line of symmetry?', visual: pic, answer: yesNo(n > 0), choiceBig: true, _t: { kind: 'syhas', name }, hint: 'Imagine folding it. Can you find a fold where the two halves land exactly on each other?',
    ways: [way('Try folding it', [pic, letter ? `Imagine folding the letter ${name} down the middle.` : TEXT[name][0], n > 0 ? `A fold matches, so the answer is ${b('Yes')}.` : `No fold matches, so the answer is ${b('No')}.`]),
      way('Think about its parts', [letter ? `A shape has a line of symmetry when one side is a mirror picture of the other.` : TEXT[name][1], `So the answer is ${b(n > 0 ? 'Yes' : 'No')}.`])] }, { name, n });
}
function countLines(L) {
  const name = pick(L === 1 ? L1 : L === 2 ? NAMES.filter(x => linesOf(x) <= 4) : NAMES), n = linesOf(name), pic = symShapeSVG(name, L === 3 ? rnd(0, 359) : 0);
  return tagged({ ask: 'How many lines of symmetry does this shape have?', visual: pic, answer: num(n), _t: { kind: 'sycount', name }, hint: 'A line of symmetry is a fold that makes the two halves match. Count the different folds that work.',
    ways: [way('Try every fold', [pic, TEXT[name][0], `It has ${b(plural(n, 'line'))} of symmetry.`]), way('Think about its sides and corners', [TEXT[name][1], `So the number of lines of symmetry is ${b(n)}.`])] }, { name, n });
}
function letterLines() {
  const ch = pick(Object.keys(LETTERS)), n = LETTERS[ch];
  return tagged({ ask: 'How many lines of symmetry does this letter have?', visual: letterSVG(ch), answer: num(n), _t: { kind: 'syletter', letter: ch }, hint: 'Fold it down the middle, and across the middle. Does either fold make the halves match?',
    ways: [way('Try the two middle folds', [letterSVG(ch), n === 0 ? `Folding down the middle or across the middle leaves parts that do not match.` : n === 2 ? 'Both the up-and-down fold and the side-to-side fold make the halves match.' : 'Only one of the two middle folds makes the halves match.', `The letter ${ch} has ${b(plural(n, 'line'))} of symmetry.`]),
      way('Compare the halves', [n === 0 ? 'The two halves are different shapes, whichever way you split it.' : 'Each half is a mirror picture of the other half.', `So ${ch} has ${b(plural(n, 'line'))} of symmetry.`])] }, { ch });
}

// Shade the left half of a grid, then pick the picture that is the mirror of it across the dashed line.
const mirror = (cells, cols) => new Set([...cells].map(s => { const [r, c] = s.split(',').map(Number); return `${r},${cols - 1 - c}`; }));
const flipRows = (cells, rows) => new Set([...cells].map(s => { const [r, c] = s.split(',').map(Number); return `${rows - 1 - r},${c}`; }));
const same = (a, c) => a.size === c.size && [...a].every(x => c.has(x));
function mirrorPicture(L) {
  const half = L === 1 ? 3 : 4, cols = 2 * half, rows = L === 1 ? 4 : 5, left = new Set();
  for (let r = 0; r < rows; r++) for (let c = 0; c < half; c++) if (chance(c === half - 1 ? 0.6 : 0.4)) left.add(`${r},${c}`);
  if (left.size < 4 || ![...left].some(s => s.endsWith(`,${half - 1}`))) return null;
  const good = new Set([...left, ...mirror(left, cols)]), slid = new Set([...left, ...[...left].map(s => { const [r, c] = s.split(',').map(Number); return `${r},${c + half}`; })]);
  const upDown = new Set([...left, ...flipRows(mirror(left, cols), rows)]), extra = new Set(good), cell = [...mirror(left, cols)][0];
  extra.delete(cell);
  const bad = [slid, upDown, extra].filter(x => !same(x, good));
  const key = x => [...x].sort().join('|'), seen = new Set([key(good)]), uniq = bad.filter(x => (seen.has(key(x)) ? false : seen.add(key(x))));
  if (uniq.length < 3) return null;
  const pic = cells => mirrorGrid(cols, rows, cells, { mini: true });
  return tagged({ ask: 'The dashed line is a line of symmetry. Which picture shows the whole shape?', visual: mirrorGrid(cols, rows, left), answer: choice(pic(good), uniq.map(pic)), _t: { kind: 'sycomplete', half }, hint: 'Each shaded square on the left has a matching square the same distance from the dashed line on the right.',
    ways: [way('Match each square', [mirrorGrid(cols, rows, left), 'Take a shaded square on the left. Count how far it is from the dashed line. The matching square is the same distance on the other side, in the same row.', pic(good)]),
      way('Fold along the line', ['Imagine folding the paper along the dashed line. Every shaded square lands on its mirror square.', 'The right side must show the left side turned over, not slid across and not turned upside down.', pic(good)])] }, { s: key(left) });
}
function whichShape(L) {
  const target = pick(L === 2 ? [0, 1, 1, 2, 4] : [0, 1, 2, 3, 4, 5, 6]), good = pick(NAMES.filter(x => linesOf(x) === target)), bad = shuffle(NAMES.filter(x => linesOf(x) !== target)).slice(0, 3);
  return { ask: `Which shape has ${target === 0 ? 'no lines' : `exactly ${plural(target, 'line')}`} of symmetry?`, answer: choice(cap(good), bad.map(cap)), _t: { kind: 'sywhich', lines: target }, hint: 'Imagine folding each shape. Count the folds that match, and compare with the question.',
    ways: [way('Check each shape', [[good, ...bad].map(n => `${cap(n)}: ${lineNum(linesOf(n))}`).join('. ') + '.', `Only the ${b(cap(good))} matches.`]), way('Fold the one you suspect', [TEXT[good][0], `That is ${target === 0 ? 'no lines' : plural(target, 'line')}, so the answer is ${b(cap(good))}.`])] };
}
function mirrorPoint(L) {
  const axis = rnd(L === 2 ? 4 : 8, L === 2 ? 12 : 30), x = rnd(1, axis - 1), R = 2 * axis - x;
  return { ask: `A shape is drawn on a grid with a vertical line of symmetry along x = ${axis}. One corner of the shape is at x = ${x}. At what x is the matching corner on the other side?`, answer: num(R), _t: { kind: 'sypoint', axis, x },
    hint: 'Find how far the corner is from the line. The matching corner is the same distance away on the other side.',
    ways: [way('Measure from the line', [`The corner is ${axis} − ${x} = ${axis - x} away from the line.`, `The matching corner is ${axis - x} away on the other side: ${axis} + ${axis - x} = ${b(R)}`]), way('Use the middle', [`The line of symmetry is exactly halfway between the two matching corners.`, `So ${x} + ? = 2 × ${axis} = ${2 * axis}, which makes the other corner ${2 * axis} − ${x} = ${b(R)}.`])] };
}
function foldWidth() {
  const half = rnd(3, 40), R = 2 * half;
  return { ask: `A paper shape has a vertical line of symmetry. The part on the left of the line is ${half} cm wide. How wide is the whole shape?`, answer: num(R), suffix: 'cm', _t: { kind: 'sywidth', half }, hint: 'The part on the right is a mirror picture of the part on the left.',
    ways: [way('Double it', [`The right part matches the left part, so it is also ${half} cm wide.`, `${half} + ${half} = ${b(R)} cm`]), way('Think of a fold', [`Folding along the line puts the two parts exactly on top of each other, so each is half the width.`, `The whole is 2 × ${half} = ${b(R)} cm.`])] };
}

const MAKERS = [[hasLine, countLines, mirrorPicture, letterLines], [countLines, letterLines, mirrorPicture, whichShape, mirrorPoint, hasLine], [countLines, mirrorPicture, whichShape, mirrorPoint, foldWidth, letterLines]];
export const genSymmetry = L => oneOf(MAKERS[L - 1], L);
