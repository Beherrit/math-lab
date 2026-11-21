// Drawing flat shapes and solid shapes as 96 by 96 tiles. Each tile names its shape in data-shape.
import { rnd, pick } from '../../util.js';
import { svg, tile, el, grp, n1 } from './svg.js';

export const FLAT = ['circle', 'square', 'triangle', 'rectangle', 'oval', 'hexagon', 'rhombus'];
export const SOLID = ['sphere', 'cube', 'cylinder', 'cone'];
export const FILLS = ['#4c9be8', '#f2a33c', '#6bbf6b', '#e36e8a', '#9b7ede'];
const STROKE = '#1f2937';

const poly = pts => pts.map(([x, y]) => `${n1(x)},${n1(y)}`).join(' ');
const regular = (n, r, off = -90) => Array.from({ length: n }, (_, i) => [r * Math.cos((off + i * 360 / n) * Math.PI / 180), r * Math.sin((off + i * 360 / n) * Math.PI / 180)]);
// Outlines around (0,0). `s` is about the radius. Rectangles are clearly longer than wide, rhombuses clearly leaning.
function outline(name, s, o) {
  const f = { fill: o.fill, stroke: STROKE, 'stroke-width': 3, 'stroke-linejoin': 'round' };
  if (name === 'circle') return el('circle', { cx: 0, cy: 0, r: s, ...f });
  if (name === 'oval') return el('ellipse', { cx: 0, cy: 0, rx: s, ry: s * 0.6, ...f });
  if (name === 'square') return el('polygon', { points: poly([[-s * 0.85, -s * 0.85], [s * 0.85, -s * 0.85], [s * 0.85, s * 0.85], [-s * 0.85, s * 0.85]]), ...f });
  if (name === 'rectangle') return el('polygon', { points: poly([[-s, -s * 0.55], [s, -s * 0.55], [s, s * 0.55], [-s, s * 0.55]]), ...f });
  if (name === 'rhombus') return el('polygon', { points: poly([[0, -s], [s * 0.58, 0], [0, s], [-s * 0.58, 0]]), ...f });
  if (name === 'hexagon') return el('polygon', { points: poly(regular(6, s, 0)), ...f });
  const w = o.lean ?? 0.95; // triangle: a little different every time, always three straight sides
  return el('polygon', { points: poly([[0, -s], [s * w, s * 0.75], [-s * w, s * 0.75]]), ...f });
}
// One flat shape as an option tile. Size and turn change; the shape does not.
export function flatTile(name, { fill = FILLS[0], size = rnd(22, 32), turn = rnd(0, 359), scale = 1, data = {} } = {}) {
  const lean = pick([0.8, 0.95, 1.05]), W = 96 * scale;
  const inner = grp({ transform: `translate(${W / 2} ${W / 2}) rotate(${turn}) scale(${scale})` }, outline(name, size, { fill, lean }));
  return svg(W, W, inner, { box: scale === 1, label: `a ${name}`, data: { shape: name, kind: 'flat', ...data } });
}
// A flat shape drawn into a larger scene at (x, y); the group carries data-shape.
export function flatAt(name, x, y, s, fill, turn = 0) {
  return grp({ 'data-shape': name, transform: `translate(${n1(x)} ${n1(y)})` }, grp({ transform: `rotate(${turn})` }, outline(name, s, { fill })));
}

const F = { top: '#ffd9a0', front: '#f2a33c', side: '#c97a14', body: '#7fb3e8', dark: '#4c86c4', light: '#b8d6f5' };
const sphere = () => el('circle', { cx: 48, cy: 48, r: 34, fill: F.body, stroke: STROKE, 'stroke-width': 3 }) + el('ellipse', { cx: 37, cy: 36, rx: 10, ry: 6, fill: F.light, transform: 'rotate(-30 37 36)' });
const cube = () => el('polygon', { points: '20,38 38,20 78,20 60,38', fill: F.top, stroke: STROKE, 'stroke-width': 3, 'stroke-linejoin': 'round' })
  + el('polygon', { points: '60,38 78,20 78,60 60,78', fill: F.side, stroke: STROKE, 'stroke-width': 3, 'stroke-linejoin': 'round' })
  + el('rect', { x: 20, y: 38, width: 40, height: 40, fill: F.front, stroke: STROKE, 'stroke-width': 3, 'stroke-linejoin': 'round' });
const cylinder = () => el('path', { d: 'M22 26V68A26 10 0 0 0 74 68V26', fill: F.body, stroke: STROKE, 'stroke-width': 3 })
  + el('ellipse', { cx: 48, cy: 26, rx: 26, ry: 10, fill: F.light, stroke: STROKE, 'stroke-width': 3 });
const cone = () => el('path', { d: 'M20 70L48 12L76 70A28 11 0 0 1 20 70Z', fill: F.body, stroke: STROKE, 'stroke-width': 3, 'stroke-linejoin': 'round' });
const SOLIDS = { sphere, cube, cylinder, cone };
export const solidTile = (name, data = {}) => tile(SOLIDS[name](), { label: `a ${name}`, data: { shape: name, kind: 'solid', ...data } });
