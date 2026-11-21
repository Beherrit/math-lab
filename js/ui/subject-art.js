// Tiny drawn marks for subject tiles. Shapes only, no glyphs from an icon font.
import { shapeSVG, FILLS } from '../games/draw.js';
const dot = (fill, size = 22) => shapeSVG('circle', fill, size);

export function subjectArt(name) {
  if (name === 'Numbers') return dot(FILLS.grape) + dot(FILLS.blue) + dot(FILLS.grape);
  if (name === 'Adding and subtracting') return shapeSVG('square', FILLS.green, 32) + shapeSVG('square', FILLS.yellow, 32);
  if (name === 'Multiplying and dividing') return shapeSVG('square', FILLS.grape, 28) + shapeSVG('square', FILLS.grape, 28) + shapeSVG('square', FILLS.grape, 28);
  if (name === 'Shapes and space') return shapeSVG('triangle', FILLS.grape, 40) + shapeSVG('square', FILLS.blue, 32);
  if (name === 'Colors') return dot(FILLS.red, 26) + dot(FILLS.yellow, 26) + dot(FILLS.blue, 26);
  if (name === 'Letters') return '<span class="letter-art" aria-hidden="true">A</span>';
  if (name === 'Fractions and decimals') return shapeSVG('rectangle', FILLS.grape, 40);
  if (name === 'Measurement') return shapeSVG('rectangle', FILLS.blue, 44);
  if (name === 'Data and chance') return dot(FILLS.grape, 18) + dot(FILLS.green, 18) + dot(FILLS.yellow, 18);
  if (name === 'Stories') return shapeSVG('rectangle', FILLS.yellow, 36);
  if (name === 'Algebra') return shapeSVG('square', FILLS.blue, 36);
  if (name === 'Ratios and percents') return dot(FILLS.grape, 30) + dot(FILLS.green, 18);
  return dot(FILLS.grape, 36);
}
