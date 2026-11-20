// Pictures for sizes and positions. Size tiles carry data-size (the length that matters); scene shapes carry data-shape and sit at translate(x y).
import { svg, tile, el } from './svg.js';
import { flatAt, FILLS } from './shapedraw.js';

const BLUE = { fill: '#4c9be8', stroke: '#1f2937', 'stroke-width': 3 };
// dim: 'big' (a circle or a square, `size` across), 'long' (a bar, `size` wide) or 'tall' (a bar, `size` high).
export function sizeTile(dim, size, kind = 'circle') {
  let inner;
  if (dim === 'big' && kind === 'circle') inner = el('circle', { cx: 48, cy: 48, r: size / 2, ...BLUE, 'data-m': 1 });
  else if (dim === 'big') inner = el('rect', { x: 48 - size / 2, y: 48 - size / 2, width: size, height: size, ...BLUE, 'data-m': 1 });
  else if (dim === 'long') inner = el('rect', { x: 48 - size / 2, y: 40, width: size, height: 16, ...BLUE, rx: 3, 'data-m': 1 });
  else inner = el('rect', { x: 40, y: 48 - size / 2, width: 16, height: size, ...BLUE, rx: 3, 'data-m': 1 });
  return tile(inner, { label: `a ${dim === 'big' ? 'shape' : 'bar'}`, data: { size, dim } });
}

export const SCENE_SHAPES = ['circle', 'square', 'triangle', 'hexagon', 'rectangle'];
const fillOf = () => FILLS[0];
// Shapes in a column (top first) or a row (left first). Later shapes are drawn on top.
export function column(names) {
  const h = 60 + 80 * (names.length - 1), inner = names.map((n, i) => flatAt(n, 60, 40 + 80 * i, 26, fillOf())).join('');
  return svg(120, h, inner, { label: `${names.length} shapes in a column` });
}
export function row(names) {
  const w = 300, mid = w / 2, inner = names.map((n, i) => flatAt(n, mid + (i - (names.length - 1) / 2) * 68, 45, 26, fillOf())).join('');
  return svg(w, 90, inner, { label: `${names.length} shapes in a row` });
}
// Two shapes that overlap: the second is drawn last, so it is in front.
export function overlap(back, front) {
  return svg(260, 130, flatAt(back, 100, 62, 38, '#4c9be8') + flatAt(front, 150, 78, 38, '#f2a33c'), { label: 'two shapes, one in front of the other' });
}
