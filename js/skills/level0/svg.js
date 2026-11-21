// SVG primitives for the Early Start level. Anything the child counts or compares carries a data attribute,
// so the tests can read the picture back instead of trusting the generator.
export const n1 = v => Math.round(v * 10) / 10;
export const attrs = o => Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== false)
  .map(([k, v]) => ` ${k}="${typeof v === 'number' ? n1(v) : v}"`).join('');
export const el = (name, o) => `<${name}${attrs(o)}/>`;
export const grp = (o, inner) => `<g${attrs(o)}>${inner}</g>`;

export const TILE = 96; // an option picture is 96 by 96
export function svg(w, h, inner, { label = 'picture', box = false, data = {} } = {}) {
  const d = Object.fromEntries(Object.entries(data).map(([k, v]) => [`data-${k}`, v]));
  const size = box ? ` width="${w}" height="${h}"` : ` style="width:100%;max-width:${w}px"`;
  return `<svg class="l0pic" viewBox="0 0 ${w} ${h}"${size} role="img" aria-label="${label}"${attrs(d)}>${inner}</svg>`;
}
export const tile = (inner, opts = {}) => svg(TILE, TILE, inner, { box: true, ...opts });

export const text = (s, x, y, size, o = {}) =>
  `<text x="${n1(x)}" y="${n1(y)}" font-size="${size}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="currentColor"${attrs(o)}>${s}</text>`;
export const line = (x1, y1, x2, y2, o = {}) => el('line', { x1, y1, x2, y2, stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', ...o });

export const INK = { fill: '#2b6cb0', stroke: '#16365c', soft: '#e2e8f0', edge: '#64748b' };
export const circ = (x, y, r, o = {}) => el('circle', { cx: x, cy: y, r, ...o });
// A counter. `kind` marks what it is for the tests: a, b (second group), x (crossed out), o (a distractor that is not counted).
export const counter = (x, y, r, kind = 'a', fill = INK.fill) =>
  circ(x, y, r, { fill, stroke: INK.stroke, 'stroke-width': 1.5, [kind === 'o' ? 'data-other' : 'data-item']: kind === 'o' ? '1' : kind });
export const crossed = (x, y, r) =>
  circ(x, y, r, { fill: INK.soft, stroke: INK.edge, 'stroke-width': 1.5, 'data-item': 'x' })
  + line(x - r * 0.6, y - r * 0.6, x + r * 0.6, y + r * 0.6, { stroke: '#1a202c', 'stroke-width': 3 })
  + line(x - r * 0.6, y + r * 0.6, x + r * 0.6, y - r * 0.6, { stroke: '#1a202c', 'stroke-width': 3 });
export const plus = (x, y, s = 10) => line(x - s, y, x + s, y, { 'stroke-width': 4 }) + line(x, y - s, x, y + s, { 'stroke-width': 4 });
export const bigGlyph = (s, data = {}, w = 150) => svg(w, 120, text(s, w / 2, 94, 100, Object.fromEntries(Object.entries(data).map(([k, v]) => [`data-${k}`, v]))), { label: `the big ${s}` });
