// Level 3 pictures in the same style as js/util/visuals.js: angles, rectangles, tile arrays, hundredths grids.
import { fmt } from '../../util.js';

const open = (w, h, label, cls) => `<svg class="viz ${cls}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="max-width:${w}px">`;
const INK = 'style="stroke:var(--ink);stroke-width:2.5;stroke-linecap:round;fill:none"';

// parts: [{ deg, label }] drawn side by side, turning anticlockwise from the ray that points right.
export function angleSVG(parts) {
  const cx = 120, cy = 118, r = 98, total = parts.reduce((a, p) => a + p.deg, 0);
  const P = (deg, rad) => { const t = deg * Math.PI / 180; return [(cx + rad * Math.cos(t)).toFixed(1), (cy - rad * Math.sin(t)).toFixed(1)]; };
  let s = open(240, 140, `angle of ${total} degrees`, 'shape'), at = 0;
  parts.forEach((p, i) => {
    const rad = 24 + i * 9, [x1, y1] = P(at, rad), [x2, y2] = P(at + p.deg, rad);
    if (p.deg === 90 && at % 90 === 0) { const [mx, my] = P(at + 45, rad * 1.414); s += `<polyline points="${x1},${y1} ${mx},${my} ${x2},${y2}" class="mark"/>`; }
    else s += `<path d="M ${x1} ${y1} A ${rad} ${rad} 0 0 0 ${x2} ${y2}" class="mark"/>`;
    const [lx, ly] = P(at + p.deg / 2, rad + 26);
    if (p.label) s += `<text x="${lx}" y="${+ly + 5}" text-anchor="middle" class="lbl">${p.label}</text>`;
    at += p.deg;
  });
  let rays = '', edge = 0;
  for (const p of [{ deg: 0 }, ...parts]) { edge += p.deg; const [x, y] = P(edge, r); rays += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" ${INK}/>`; }
  return s + rays + '</svg>';
}

// A rectangle drawn roughly to scale. lL and wL are the labels under it and beside it; inside is optional middle text.
export function rectSVG(l, w, { lL = fmt(l), wL = fmt(w), inside = '' } = {}) {
  const k = Math.min(190 / l, 96 / w), rw = Math.max(l * k, 60), rh = Math.max(w * k, 34);
  const x = (270 - rw) / 2 + 16, y = 8;
  let s = open(270, rh + 34, `rectangle ${lL} by ${wL}`, 'shape');
  s += `<rect x="${x.toFixed(1)}" y="${y}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}" class="body"/>`;
  s += `<text x="${(x + rw / 2).toFixed(1)}" y="${(y + rh + 19).toFixed(1)}" text-anchor="middle" class="lbl">${lL}</text>`;
  s += `<text x="${(x - 8).toFixed(1)}" y="${(y + rh / 2 + 5).toFixed(1)}" text-anchor="end" class="lbl">${wL}</text>`;
  if (inside) s += `<text x="${(x + rw / 2).toFixed(1)}" y="${(y + rh / 2 + 5).toFixed(1)}" text-anchor="middle" class="lbl strong">${inside}</text>`;
  return s + '</svg>';
}

// rows x cols square tiles, to show a number as a rectangle (factor pairs, prime or composite).
export function arraySVG(rows, cols) {
  const c = Math.min(22, 250 / cols), g = 3;
  let s = open(cols * c + 4, rows * c + 4, `${rows} rows of ${cols} tiles`, 'fbar');
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++)
    s += `<rect x="${(2 + j * c + g / 2).toFixed(1)}" y="${(2 + i * c + g / 2).toFixed(1)}" width="${(c - g).toFixed(1)}" height="${(c - g).toFixed(1)}" class="on"/>`;
  return s + '</svg>';
}

// One whole cut into 100 small squares, n of them shaded, filled a column (one tenth) at a time.
export function hundredGrid(n) {
  const c = 15;
  let s = open(10 * c + 4, 10 * c + 4, `${n} of 100 squares shaded`, 'fbar');
  for (let col = 0; col < 10; col++) for (let row = 0; row < 10; row++)
    s += `<rect x="${2 + col * c}" y="${2 + row * c}" width="${c}" height="${c}" class="${col * 10 + row < n ? 'on' : 'off'}"/>`;
  return s + '</svg>';
}

// Area model table with one box hidden (shown as a question mark). hide is [row, col].
export function areaBlank(aParts, cParts, hide) {
  let h = '<table class="area"><tr><th>×</th>' + aParts.map(a => `<th>${fmt(a)}</th>`).join('') + '</tr>';
  cParts.forEach((c, i) => {
    h += `<tr><th>${fmt(c)}</th>` + aParts.map((a, j) => `<td>${hide[0] === i && hide[1] === j ? '?' : fmt(a * c)}</td>`).join('') + '</tr>';
  });
  return h + '</table>';
}
