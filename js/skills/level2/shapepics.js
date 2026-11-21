// Polygons for sorting shapes: the corner points of each kind (turned and sized at random), and the SVG for one shape or a lettered set of four.
import { pick, rnd } from '../../util.js';

const ngon = n => Array.from({ length: n }, (_, i) => [Math.sin(2 * Math.PI * i / n), -Math.cos(2 * Math.PI * i / n)]);
const BASE = {
  square: () => [[0, 0], [1, 0], [1, 1], [0, 1]],
  rectangle: () => { const w = pick([1.5, 1.7, 2, 2.3]); return [[0, 0], [w, 0], [w, 1], [0, 1]]; },
  rhombus: () => { const c = pick([0.3, 0.4, 0.5]); return [[0, 0], [1, 0], [1 + c, Math.sqrt(1 - c * c)], [c, Math.sqrt(1 - c * c)]]; },
  parallelogram: () => { const c = pick([0.4, 0.5, 0.6]), h = pick([0.8, 0.9, 1]); return [[0, 0], [1.5, 0], [1.5 + c, h], [c, h]]; },
  trapezoid: () => { const t = pick([0.8, 0.9, 1]), d = pick([0.2, 0.3, 0.4]); return [[0, 0], [1.6, 0], [d + t, 0.9], [d, 0.9]]; },
  kite: () => [[0, -1.1], [0.7, 0], [0, 0.9], [-0.7, 0]],
  quad: () => pick([[[0, 0], [1.2, 0.15], [1, 1], [0.1, 0.7]], [[0, 0.1], [1.3, 0], [0.9, 0.9], [0.2, 0.6]]]),
  triangle: () => [[0, 0], [1, 0], [0.35, 0.9]], pentagon: () => ngon(5), hexagon: () => ngon(6),
};
export const KINDS = Object.keys(BASE);

// A kind of shape turned by `angle` degrees (and maybe flipped), scaled to fit a box of `size` and centred in it.
export function shapePoints(kind, { angle = rnd(0, 11) * 15, flip = Math.random() < 0.5, size = 84 } = {}) {
  const t = angle * Math.PI / 180, pts = BASE[kind]().map(([x, y]) => { const fx = flip ? -x : x; return [fx * Math.cos(t) - y * Math.sin(t), fx * Math.sin(t) + y * Math.cos(t)]; });
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)], s = size / Math.max(x1 - x0, y1 - y0);
  return pts.map(([x, y]) => [+((x - (x0 + x1) / 2) * s).toFixed(2), +((y - (y0 + y1) / 2) * s).toFixed(2)]);
}
const poly = (pts, cx, cy) => `<polygon class="shape" points="${pts.map(([x, y]) => `${(cx + x).toFixed(2)},${(cy + y).toFixed(2)}`).join(' ')}" style="fill:var(--fbar-on);fill-opacity:.75;stroke:var(--ink);stroke-width:2.5;stroke-linejoin:round"/>`;
export function shapeSvg(pts) {
  return `<svg class="viz fbar" viewBox="0 0 110 110" role="img" aria-label="a shape" style="max-width:160px">${poly(pts, 55, 55)}</svg>`;
}
// Four shapes in a 2 by 2 grid, lettered A to D.
export function shapeGrid(four) {
  let g = '<svg class="viz fbar" viewBox="0 0 250 250" role="img" aria-label="four shapes, A to D" style="max-width:260px">';
  four.forEach((pts, i) => { const cx = 62 + (i % 2) * 126, cy = 62 + Math.floor(i / 2) * 126; g += poly(pts, cx, cy) + `<text x="${cx - 55}" y="${cy - 44}" class="lbl strong">${'ABCD'[i]}</text>`; });
  return g + '</svg>';
}
