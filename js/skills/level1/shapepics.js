// Pictures of flat shapes and solid shapes. The label never says which shape it is.
const open = (w, h, label, shape) => `<svg class="viz fbar" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" data-shape="${shape}" style="max-width:${w}px">`;
const line = 'stroke:var(--grape);stroke-width:3;stroke-linejoin:round';
const FILL = `fill:var(--fbar-on);fill-opacity:.35;${line}`, DARK = `fill:var(--fbar-on);fill-opacity:.65;${line}`, LIGHT = `fill:var(--fbar-on);fill-opacity:.15;${line}`;
const poly = (pts, style) => `<polygon points="${pts.map(p => p.join(',')).join(' ')}" style="${style}"/>`;
const regular = (n, cx, cy, r, turn) => Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + turn + 2 * Math.PI * i / n; return [Math.round(cx + r * Math.cos(a)), Math.round(cy + r * Math.sin(a))]; });
const FLAT_POINTS = {
  triangle: regular(3, 65, 62, 50, 0), square: [[30, 15], [100, 15], [100, 85], [30, 85]], rectangle: [[10, 25], [120, 25], [120, 75], [10, 75]],
  pentagon: regular(5, 65, 55, 48, 0), hexagon: regular(6, 65, 52, 48, 0), octagon: regular(8, 65, 52, 48, Math.PI / 8),
};

// A flat shape drawn as one polygon (or one circle), so its sides can be counted.
export function flatPic(name) {
  const g = open(130, 105, 'a flat shape', name);
  if (name === 'circle') return `${g}<circle cx="65" cy="52" r="42" style="${FILL}"/></svg>`;
  return `${g}${poly(FLAT_POINTS[name], FILL)}</svg>`;
}
// A box seen from a corner: front face w by h, with the top and right side drawn behind it.
function box(w, h) {
  const x = 14, y = 106 - h - 8, d = 22;
  return poly([[x, y], [x + w, y], [x + w + d, y - d], [x + d, y - d]], LIGHT) + poly([[x + w, y], [x + w + d, y - d], [x + w + d, y + h - d], [x + w, y + h]], DARK) + poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], FILL);
}
const SOLIDS = {
  cube: () => box(58, 58),
  'rectangular prism': () => box(92, 44),
  cylinder: () => `<path d="M20 24v58a40 12 0 0 0 80 0v-58z" style="${FILL}"/><ellipse cx="60" cy="24" rx="40" ry="12" style="${LIGHT}"/>`,
  cone: () => `<path d="M20 84L60 10L100 84A40 12 0 0 1 20 84z" style="${FILL}"/>`,
  sphere: () => `<circle cx="60" cy="56" r="42" style="${FILL}"/><ellipse cx="46" cy="40" rx="12" ry="8" style="fill:var(--card);fill-opacity:.7"/>`,
  pyramid: () => poly([[20, 88], [84, 88], [64, 14]], FILL) + poly([[84, 88], [110, 70], [64, 14]], DARK),
};
export function solidPic(name) { return `${open(135, 108, 'a solid shape', name)}${SOLIDS[name]()}</svg>`; }
