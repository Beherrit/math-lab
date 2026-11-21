// Copy each shaded square to the same distance on the other side of the line.
import { four } from './pack.js';

export const mirrorMeta = {
  id: 'mirror',
  title: 'Mirror the shape',
  blurb: 'Copy it across the line.',
  skill: 'l3symmetry',
  levels: [1, 2, 3, 4, 5],
};

const INK = '#241c16';
const ON = '#6d28d9';

export function mirrorRows(left) {
  return left.map(row => [...row].reverse());
}

export function gridKey(rows) {
  return rows.map(row => row.join('')).join('-');
}

function cells(rows, { hideRight = false } = {}) {
  const h = rows.length;
  const w = rows[0].length;
  const half = w / 2;
  const cell = 28;
  let s = '';
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const shade = !hideRight || c < half ? rows[r][c] : 0;
      s += `<rect x="${c * cell + 2}" y="${r * cell + 2}" width="${cell - 4}" height="${cell - 4}" rx="4" fill="${shade ? ON : '#fffdf9'}" stroke="${INK}" stroke-width="2"/>`;
    }
  }
  const x = half * cell;
  s += `<line x1="${x}" y1="0" x2="${x}" y2="${h * cell}" stroke="#9a3412" stroke-width="3" stroke-dasharray="5 4"/>`;
  return `<svg viewBox="0 0 ${w * cell} ${h * cell}" width="${w * cell}" height="${h * cell}" role="img" aria-label="grid of shaded squares">${s}</svg>`;
}

function flipBit(rows) {
  const next = rows.map(row => row.slice());
  for (let r = 0; r < next.length; r++) {
    const c = next[r].indexOf(1);
    if (c >= 0) { next[r][c] = 0; return next; }
  }
  next[0][0] = 1;
  return next;
}

export function makeMirror(rng, level = 1) {
  const cols = level <= 2 ? 2 : 3;
  const rowsN = level <= 2 ? 2 : 3;
  const left = Array.from({ length: rowsN }, () => Array.from({ length: cols }, () => rng.int(0, 1)));
  if (!left.some(row => row.some(Boolean))) left[0][0] = 1;
  const pal = row => row.join('') === [...row].reverse().join('');
  if (left.every(pal)) { left[0][0] = 1; left[0][cols - 1] = 0; }
  const good = left.map(row => row.concat(mirrorRows([row])[0]));
  const copy = left.map(row => row.concat(row));
  const flipped = flipBit(good);
  const blankRight = left.map(row => row.concat(row.map(() => 0)));
  const pictures = [good, copy, flipped, blankRight];
  const choices = four(rng, pictures.map(rows => ({
    id: gridKey(rows),
    label: gridKey(rows).replaceAll('1', 'shaded ').replaceAll('0', 'open ').replaceAll('-', 'next row '),
    html: cells(rows),
  })));
  const why = 'The dashed line is a mirror. Each shaded square is copied the same number of steps to the other side. The right side is the left side flipped. Copying without flipping, or leaving the right side empty, does not match.';
  return {
    prompt: 'Which picture is the mirror?',
    say: 'Which picture copies the shaded squares across the dashed line?',
    visual: cells(good, { hideRight: true }),
    choices,
    answer: gridKey(good),
    why,
    facts: { left },
  };
}
