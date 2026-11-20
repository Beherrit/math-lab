// Level 7 grids: lines, segments, points and shapes drawn on the shared plane() or on a four-quadrant grid.
import { PLANE, plane, fmt } from '../../util.js';

export const COLORS = ['var(--grape)', 'var(--good)', 'var(--bad)'];
// The two points where y = mx + c leaves the square lo..hi (null when it misses the square).
export function clip(m, c, lo, hi) {
  const cand = [[lo, m * lo + c], [hi, m * hi + c]];
  if (m !== 0) cand.push([(lo - c) / m, lo], [(hi - c) / m, hi]);
  const e = 1e-9;
  const inb = cand.filter(([x, y]) => x >= lo - e && x <= hi + e && y >= lo - e && y <= hi + e).sort((p, q) => p[0] - q[0]);
  return inb.length < 2 || inb[inb.length - 1][0] - inb[0][0] < e ? null : [inb[0], inb[inb.length - 1]];
}
const stroke = (color, dash) => `style="stroke:${color};stroke-width:${dash ? 2.5 : 3};fill:none${dash ? ';stroke-dasharray:5 4' : ''}"`;
const segSvg = (S, a, b, color, dash) => `<line x1="${S.X(a[0])}" y1="${S.Y(a[1])}" x2="${S.X(b[0])}" y2="${S.Y(b[1])}" ${stroke(color, dash)}/>`;
// Everything drawn on top of a grid. S maps grid units to pixels.
function marks(S, { lines = [], segs = [], pts = [], polys = [] }, lo, hi) {
  let s = '';
  polys.forEach((p, i) => {
    const col = p.color || COLORS[i % 3];
    s += `<polygon points="${p.pts.map(([x, y]) => `${S.X(x)},${S.Y(y)}`).join(' ')}" style="fill:${col};fill-opacity:.16;stroke:${col};stroke-width:2.5;stroke-linejoin:round"/>`;
  });
  lines.forEach((l, i) => {
    const e = clip(l.m, l.c, lo, hi);
    if (e) s += segSvg(S, e[0], e[1], l.color || COLORS[i % 3], false);
  });
  for (const g of segs) s += segSvg(S, g.a, g.b, g.color || COLORS[2], g.dash !== false);
  for (const p of pts) {
    s += `<circle cx="${S.X(p.x)}" cy="${S.Y(p.y)}" r="${p.r || 6}" class="pt ${p.cls || ''}"/>`;
    if (p.label) s += `<text x="${S.X(p.x) + 9}" y="${S.Y(p.y) - 8}" class="ptl">${p.label}</text>`;
  }
  return s;
}
// First-quadrant grid (0..max) built on the shared plane(), so tapping works when interactive.
export function grid({ max = 10, interactive = false, ...layers } = {}) {
  const u = (PLANE.W - PLANE.m - 14) / max;
  const S = { X: x => +(PLANE.m + x * u).toFixed(1), Y: y => +(PLANE.W - PLANE.m - y * u).toFixed(1) };
  return plane({ max, interactive }).replace('<g class="cursor">', marks(S, layers, 0, max) + '<g class="cursor">');
}
// Four-quadrant grid from −r to r on both axes (a picture only: no tapping).
export function quad({ r = 6, ...layers } = {}) {
  const W = 320, m = 14, u = (W - 2 * m) / (2 * r), every = r <= 6 ? 1 : 2;
  const S = { X: x => +(W / 2 + x * u).toFixed(1), Y: y => +(W / 2 - y * u).toFixed(1) };
  let s = `<svg class="viz plane" viewBox="0 0 ${W} ${W}" role="img" aria-label="coordinate grid from ${fmt(-r)} to ${r}" style="max-width:${W}px">`;
  for (let i = -r; i <= r; i++) {
    s += `<line x1="${S.X(i)}" y1="${S.Y(-r)}" x2="${S.X(i)}" y2="${S.Y(r)}" class="gl"/><line x1="${S.X(-r)}" y1="${S.Y(i)}" x2="${S.X(r)}" y2="${S.Y(i)}" class="gl"/>`;
    if (i === 0 || i % every) continue;
    s += `<text x="${S.X(i)}" y="${S.Y(0) + 13}" text-anchor="middle" class="tk">${fmt(i)}</text>`;
    s += `<text x="${S.X(0) - 5}" y="${S.Y(i) + 4}" text-anchor="end" class="tk">${fmt(i)}</text>`;
  }
  s += `<line x1="${S.X(-r)}" y1="${S.Y(0)}" x2="${S.X(r)}" y2="${S.Y(0)}" class="ax"/><line x1="${S.X(0)}" y1="${S.Y(-r)}" x2="${S.X(0)}" y2="${S.Y(r)}" class="ax"/>`;
  s += `<text x="${S.X(r) - 8}" y="${S.Y(0) - 6}" class="axn">x</text><text x="${S.X(0) + 6}" y="${S.Y(r) + 10}" class="axn">y</text>`;
  return s + marks(S, layers, -r, r) + '</svg>';
}
// The rise and run steps between two points, as dashed segments (run first, then rise).
export const stairs = (p, q) => [{ a: p, b: [q[0], p[1]] }, { a: [q[0], p[1]], b: q }];
