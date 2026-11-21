// Shapes cut into equal (or unequal) shares, with some shares shaded. `bounds` run from 0 to 1 and say where each share ends.
const R1 = x => Math.round(x * 10) / 10;
export const evenBounds = n => Array.from({ length: n + 1 }, (_, i) => i / n);
// The same cut, but one inside line is moved so the shares are not all the same size.
export function unevenBounds(n) {
  const b = evenBounds(n), i = 1 + Math.floor(Math.random() * (n - 1));
  b[i] += (Math.random() < 0.5 ? -1 : 1) * 0.45 / n;
  return b;
}

function rectParts(kind, bounds, x, y, w, h) {
  const box = (a, b, c, d) => `M${R1(a)} ${R1(b)}H${R1(c)}V${R1(d)}H${R1(a)}Z`;
  if (kind === 'cols') return bounds.slice(1).map((e, i) => box(x + bounds[i] * w, y, x + e * w, y + h));
  if (kind === 'rows') return bounds.slice(1).map((e, i) => box(x, y + bounds[i] * h, x + w, y + e * h));
  if (kind === 'grid') return [[0, 0], [1, 0], [0, 1], [1, 1]].map(([i, j]) => box(x + i * w / 2, y + j * h / 2, x + (i + 1) * w / 2, y + (j + 1) * h / 2));
  return [`M${x} ${y}H${x + w}V${y + h}Z`, `M${x} ${y}V${y + h}H${x + w}Z`]; // diag
}
function sectors(bounds, cx, cy, r) {
  const at = f => { const a = -Math.PI / 2 + 2 * Math.PI * f; return `${R1(cx + r * Math.cos(a))} ${R1(cy + r * Math.sin(a))}`; };
  return bounds.slice(1).map((e, i) => `M${cx} ${cy}L${at(bounds[i])}A${r} ${r} 0 ${e - bounds[i] > 0.5 ? 1 : 0} 1 ${at(e)}Z`);
}
// One picture. kind is cols, rows, grid or diag for a rectangle (shape 'rect'), and radial for a circle (shape 'circle').
export function shareFig({ shape = 'rect', kind = 'cols', parts, bounds = evenBounds(parts), shade = [], w = 120, h = 90 }) {
  const cx = w / 2 + 6, cy = h / 2 + 6, ds = shape === 'circle' ? sectors(bounds, cx, cy, Math.min(w, h) / 2) : rectParts(kind, bounds, 6, 6, w, h);
  const k = shape === 'circle' ? 'radial' : kind, cuts = k === 'diag' || k === 'grid' ? '' : bounds.map(x => Math.round(x * 1000) / 1000).join(',');
  const body = ds.map((d, i) => `<path d="${d}" ${shade.includes(i) ? 'class="on" ' : ''}style="fill:${shade.includes(i) ? 'var(--fbar-on)' : 'var(--card)'};fill-opacity:${shade.includes(i) ? .65 : 1};stroke:var(--ink);stroke-width:2.5;stroke-linejoin:round"/>`).join('');
  return `<svg class="viz fbar" viewBox="0 0 ${w + 12} ${h + 12}" role="img" aria-label="a shape cut into shares" data-kind="${k}" data-parts="${ds.length}" data-cuts="${cuts}" style="max-width:${w + 12}px">${body}</svg>`;
}
// Two pictures side by side, for comparing cuts of the same whole.
export const figPair = (a, c) => `<div style="display:flex;gap:18px;justify-content:center;flex-wrap:wrap">${shareFig(a)}${shareFig(c)}</div>`;
