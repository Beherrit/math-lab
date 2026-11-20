// Level 5 geometry drawings: labelled flat shapes and nets. Drawn with the shared .shape classes; not to scale.
import { open, txt } from './visuals.js';

const poly = pts => `<polygon points="${pts.map(p => p.join(',')).join(' ')}" class="body"/>`;
const dash = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="mark" style="stroke-dasharray:5 4"/>`;
const corner = (x, y, dx = 1) => `<path d="M${x},${y - 10} h${10 * dx} v10" class="mark"/>`;
const wrap = (label, body, h = 150) => open(280, h, label, 'shape') + body + '</svg>';

// b = base label, h = height label, side = optional slanted-side label (a number that is NOT needed for area).
export function parallelogram(b, h, side = '') {
  return wrap(`parallelogram, base ${b}, height ${h}`, poly([[80, 22], [258, 22], [200, 112], [22, 112]]) + dash(80, 22, 80, 112) + corner(80, 112)
    + txt(111, 134, b) + txt(88, 72, h, 'lbl', 'start') + (side ? txt(238, 78, side, 'lbl dim', 'start') : ''));
}
// kind: 'right' (height is a side), 'acute' (height inside), 'obtuse' (height outside the triangle).
export function triangle(b, h, kind = 'acute') {
  const body = kind === 'right' ? poly([[50, 20], [50, 112], [240, 112]]) + corner(50, 112) + txt(42, 70, h, 'lbl', 'end') + txt(145, 134, b)
    : kind === 'acute' ? poly([[120, 20], [250, 112], [30, 112]]) + dash(120, 20, 120, 112) + corner(120, 112) + txt(128, 74, h, 'lbl', 'start') + txt(140, 134, b)
      : poly([[40, 20], [250, 112], [110, 112]]) + dash(40, 20, 40, 112) + dash(40, 112, 110, 112) + corner(40, 112) + txt(48, 74, h, 'lbl', 'start') + txt(180, 134, b);
  return wrap(`triangle, base ${b}, height ${h}`, body);
}
// a = top side, b = bottom side (the two parallel sides), h = height.
export function trapezoid(a, b, h) {
  return wrap(`trapezoid, parallel sides ${a} and ${b}, height ${h}`, poly([[90, 26], [190, 26], [255, 112], [25, 112]]) + dash(90, 26, 90, 112) + corner(90, 112)
    + txt(140, 19, a) + txt(140, 134, b) + txt(98, 74, h, 'lbl', 'start'));
}
// A rectangle (w by h) with a triangle roof of height t on top.
export function house(w, h, t) {
  return wrap(`rectangle ${w} by ${h} with a triangle of height ${t} on top`, poly([[60, 78], [140, 20], [220, 78], [220, 150], [60, 150]]) + dash(60, 78, 220, 78) + dash(140, 20, 140, 78) + corner(140, 78)
    + txt(140, 172, w) + txt(228, 120, h, 'lbl', 'start') + txt(148, 56, t, 'lbl', 'start'), 180);
}
// Net of a box l by w by h: four faces in a column and one on each side, each labelled with its side lengths.
export function boxNet(l, w, h, unit = '') {
  const u = Math.min(250 / (2 * h + l), 210 / (2 * h + 2 * w)), x0 = (280 - (2 * h + l) * u) / 2 + h * u, H = (2 * h + 2 * w) * u + 8;
  const face = (x, y, fw, fh, a, c) => `<rect x="${x}" y="${y}" width="${fw * u}" height="${fh * u}" class="body"/>` + txt(x + fw * u / 2, y + fh * u / 2 + 5, `${a} × ${c}`, 'lbl dim');
  let y = 4, s = '';
  for (const [fh, a, c] of [[h, l, h], [w, l, w], [h, l, h], [w, l, w]]) { s += face(x0, y, l, fh, a, c); y += fh * u; }
  s += face(x0 - h * u, 4 + h * u, h, w, h, w) + face(x0 + l * u, 4 + h * u, h, w, h, w);
  return open(280, H, `net of a box ${l} by ${w} by ${h}${unit ? ' ' + unit : ''}`, 'shape') + s + '</svg>';
}
// Net of a square pyramid: square of side s with four triangles of slant height t.
export function pyramidNet(s, t) {
  const u = 190 / (s + 2 * t), c = 140, a = s * u / 2, far = a + t * u;
  const tri = (dx, dy) => poly([[c - a * (dy ? 1 : 0) + (dx ? dx * a : 0), c + (dy ? dy * a : -a)], [c + (dx ? dx * a : a), c + (dy ? dy * a : a)], [c + dx * far, c + dy * far]]);
  return open(280, 280, `net of a square pyramid, base ${s}, slant height ${t}`, 'shape') + tri(0, -1) + tri(0, 1) + tri(-1, 0) + tri(1, 0)
    + `<rect x="${c - a}" y="${c - a}" width="${2 * a}" height="${2 * a}" class="body"/>` + dash(c, c - a, c, c - far) + txt(c, c + 5, `${s} × ${s}`, 'lbl dim') + txt(c + 6, c - a - t * u / 2 + 4, t, 'lbl', 'start') + '</svg>';
}
