// Small items for patterns and sorting. An item varies in one way only: its shape, its size or its color.
// Every drawn item (or tile) carries data-key="dim:value" so the tests can read the picture back.
import { shuffle } from '../../util.js';
import { el, grp, tile, svg, text, INK } from './svg.js';
import { COLORS, colorSet, strokeOf } from './colordata.js';

export const VALUES = { shape: ['circle', 'square', 'triangle'], size: ['small', 'medium', 'large'] };
export const SAY = { small: 'small', medium: 'medium', large: 'big' }; // how a size is named to the child
const RADIUS = { small: 7, medium: 12, large: 18 };
const SIZE_KEEP = 'medium', SHAPE_KEEP = 'circle';

// The drawing for one item centred at (cx, cy); `k` scales it.
function shapeOf(dim, v, cx, cy, k) {
  const shape = dim === 'shape' ? v : SHAPE_KEEP, size = dim === 'size' ? v : SIZE_KEEP;
  const fill = dim === 'color' ? COLORS[v] : INK.fill, stroke = dim === 'color' ? strokeOf(v) : INK.stroke, r = (dim === 'size' ? RADIUS[size] : 14) * k;
  const common = { fill, stroke, 'stroke-width': 2, 'stroke-linejoin': 'round' };
  if (shape === 'square') return el('rect', { x: cx - r * 0.9, y: cy - r * 0.9, width: r * 1.8, height: r * 1.8, ...common });
  if (shape === 'triangle') return el('polygon', { points: `${cx},${cy - r} ${cx + r * 1.05},${cy + r * 0.8} ${cx - r * 1.05},${cy + r * 0.8}`, ...common });
  return el('circle', { cx, cy, r, ...common });
}
export const keyOf = (dim, v) => `${dim}:${v}`;
export const itemAt = (dim, v, cx, cy, k = 1) => grp({ 'data-key': keyOf(dim, v) }, shapeOf(dim, v, cx, cy, k));
// `n` only tells apart tiles that look the same (the odd-one-out questions show several of one kind).
export const itemTile = (dim, v, n) => tile(shapeOf(dim, v, 48, 48, 1.7), { label: `a ${v} one`, data: { key: keyOf(dim, v), n } });
// Three of the same item in a small group tile.
export const groupOfTile = (dim, v) => tile([[30, 32], [66, 32], [48, 68]].map(([x, y]) => itemAt(dim, v, x, y, 1.15)).join(''), { label: `three ${v} ones`, data: { group: keyOf(dim, v) } });

// Values for a dimension: `n` of them (colors are chosen so they are far apart in lightness).
export function valuesFor(dim, n) {
  if (dim === 'color') return colorSet(n, Object.keys(COLORS).filter(c => c !== 'white'));
  return shuffle(VALUES[dim]).slice(0, n);
}
// A row of items left to right, 36 to 40 wide each. A null entry is an empty dashed box; `numbers` writes 1, 2, 3 under the items.
export function itemRow(dim, vals, { numbers = false } = {}) {
  const n = vals.length, step = Math.min(40, 320 / n), W = step * n + 8, H = numbers ? 76 : 52;
  const inner = vals.map((v, i) => {
    const x = 4 + step * (i + 0.5);
    const body = v === null ? el('rect', { x: x - 16, y: 10, width: 32, height: 32, rx: 6, fill: 'none', stroke: INK.edge, 'stroke-width': 2.5, 'stroke-dasharray': '4 3', 'data-hole': 1 }) : itemAt(dim, v, x, 26, 1);
    return body + (numbers ? text(i + 1, x, 68, 16) : '');
  }).join('');
  return svg(W, H, inner, { label: `a row of ${n} things in a pattern` });
}
