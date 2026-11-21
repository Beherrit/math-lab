// Level 7 figures: right triangle, parallel lines with a transversal, triangle with an exterior angle, solids, square of tiles.
import { count } from './h.js';
const open = (w, h, label, max = w) => `<svg class="viz shape" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="max-width:${max}px">`;
const txt = (x, y, s, anchor = 'middle', cls = 'lbl') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${s}</text>`;
const THIN = 'style="stroke:var(--ink);stroke-width:2;fill:none"';
const DASH = 'style="stroke:var(--ink-2);stroke-width:1.5;fill:none;stroke-dasharray:5 4"';
const NOTE = 'Not drawn to scale';

// Right triangle with the square corner at the bottom left. v = upright leg, h = flat leg, hyp = slanted side (labels).
export function rightTri(v, h, hyp, { vr = 3, hr = 4 } = {}) {
  const k = Math.min(170 / hr, 110 / vr), w = hr * k, t = vr * k, x0 = 70, y0 = 22 + t;
  let s = open(300, y0 + 44, 'right triangle');
  s += `<polygon points="${x0},${y0} ${x0 + w},${y0} ${x0},${y0 - t}" class="body"/>`;
  s += `<polyline points="${x0},${y0 - 14} ${x0 + 14},${y0 - 14} ${x0 + 14},${y0}" class="mark"/>`;
  s += txt(x0 - 10, y0 - t / 2 + 5, v, 'end') + txt(x0 + w / 2, y0 + 20, h) + txt(x0 + w / 2 + 14, y0 - t / 2 - 6, hyp, 'start');
  return s + txt(150, y0 + 40, NOTE, 'middle', 'lbl dim') + '</svg>';
}
// The squares on the two legs, and the square they fill on the longest side.
export function sideSquares(legA, legC, big = '?') {
  const cell = (x, label) => `<rect x="${x}" y="16" width="78" height="78" class="body"/>` + txt(x + 39, 60, label);
  let s = open(320, 128, `squares of area ${legA} and ${legC} fill a square of area ${big}`);
  s += cell(8, legA) + txt(98, 60, '+') + cell(114, legC) + txt(204, 60, '=') + cell(220, big);
  return s + txt(160, 116, 'The two smaller squares fill the big one', 'middle', 'lbl dim') + '</svg>';
}
// Label spots around a crossing at (x, y): upper left, upper right, lower left, lower right.
const SPOTS = [[-20, -9], [24, -9], [-28, 20], [14, 20]];
// Two parallel lines cut by a transversal. Angles 1-4 sit at the top crossing, 5-8 at the bottom one.
// labels: { 1: '110°', 6: '?' } replaces the plain angle numbers that are listed.
export function parallels(labels = {}, only = null) {
  const top = [183.5, 60], bot = [136.5, 140];
  let s = open(320, 212, 'two parallel lines cut by a third line');
  for (const y of [60, 140]) s += `<line x1="18" y1="${y}" x2="302" y2="${y}" ${THIN}/><polyline points="262,${y - 6} 270,${y} 262,${y + 6}" ${THIN}/>`;
  s += `<line x1="110" y1="185" x2="210" y2="15" ${THIN}/>`;
  for (let i = 1; i <= 8; i++) {
    if (only && !only.includes(i)) continue;
    const [cx, cy] = i <= 4 ? top : bot, [dx, dy] = SPOTS[(i - 1) % 4];
    s += txt(cx + dx, cy + dy, labels[i] ?? i, 'middle', labels[i] ? 'lbl strong' : 'lbl dim');
  }
  return s + txt(160, 206, NOTE, 'middle', 'lbl dim') + '</svg>';
}
// Triangle with its base stretched to the right. a = bottom left, b = top, c = bottom right inside, ext = outside angle.
export function extTri({ a = '', b = '', c = '', ext = '' }) {
  let s = open(320, 190, 'triangle with one side extended');
  s += `<polygon points="40,150 210,150 110,40" class="body"/><line x1="210" y1="150" x2="304" y2="150" ${THIN}/>`;
  s += txt(72, 143, a) + txt(112, 74, b) + txt(178, 143, c) + txt(238, 138, ext, 'middle', 'lbl strong');
  return s + txt(160, 184, NOTE, 'middle', 'lbl dim') + '</svg>';
}
// Plain triangle with three angle labels.
export function tri3(a, b, c) {
  let s = open(320, 180, 'triangle');
  s += `<polygon points="50,145 270,145 130,35" class="body"/>`;
  s += txt(84, 138, a) + txt(133, 70, b) + txt(232, 138, c);
  return s + txt(160, 174, NOTE, 'middle', 'lbl dim') + '</svg>';
}
function cylinder(r, h) {
  let s = `<path d="M90,50 L90,150 A60,18 0 0 0 210,150 L210,50" class="body"/><ellipse cx="150" cy="50" rx="60" ry="18" class="body"/>`;
  s += `<path d="M90,150 A60,18 0 0 1 210,150" ${DASH}/><line x1="150" y1="50" x2="210" y2="50" ${THIN}/>`;
  return s + txt(180, 44, r) + txt(220, 105, h, 'start');
}
function cone(r, h) {
  let s = `<path d="M90,150 L150,30 L210,150 A60,18 0 0 1 90,150" class="body"/><path d="M90,150 A60,18 0 0 1 210,150" ${DASH}/>`;
  s += `<line x1="150" y1="30" x2="150" y2="150" ${DASH}/><line x1="150" y1="150" x2="210" y2="150" ${THIN}/>`;
  return s + txt(182, 145, r) + txt(144, 100, h, 'end');
}
function sphere(r) {
  let s = `<circle cx="150" cy="95" r="70" class="body"/><ellipse cx="150" cy="95" rx="70" ry="20" ${DASH}/>`;
  s += `<line x1="150" y1="95" x2="220" y2="95" ${THIN}/><circle cx="150" cy="95" r="3" style="fill:var(--ink)"/>`;
  return s + txt(186, 88, r);
}
// kind: 'cyl' | 'cone' | 'sphere'. r and h are label texts (h is not used for a sphere).
export function solid(kind, r, h = '') {
  const body = kind === 'cyl' ? cylinder(r, h) : kind === 'cone' ? cone(r, h) : sphere(r);
  return open(300, 180, kind === 'cyl' ? 'cylinder' : kind, 260) + body + '</svg>';
}
// An n by n square of unit tiles: the picture behind a square root.
export function tiles(n) {
  const S = 150, c = S / n;
  let s = `<svg class="viz farea" viewBox="0 0 ${S + 4} ${S + 24}" role="img" aria-label="${n} by ${n} square of tiles" style="max-width:170px">`;
  for (let r = 0; r < n; r++) for (let q = 0; q < n; q++) s += `<rect x="${2 + q * c}" y="${2 + r * c}" width="${c}" height="${c}" class="rowon"/>`;
  return s + txt(S / 2 + 2, S + 20, `${count(n, 'row')} of ${n}`) + '</svg>';
}
