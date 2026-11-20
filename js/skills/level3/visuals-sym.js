// Pictures for lines of symmetry: named flat shapes, big letters, and grids where one half is shaded.
import { rnd } from '../../util.js';
import { quadPoints } from './visuals-shapes.js';

const open = (w, h, label, extra = '') => `<svg class="viz shape" ${extra} viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="max-width:${w}px">`;
const regular = n => Array.from({ length: n }, (_, i) => [Math.sin(2 * Math.PI * i / n) * 60, -Math.cos(2 * Math.PI * i / n) * 60]);
const sides = ([a, c, d]) => [Math.hypot(a[0] - c[0], a[1] - c[1]), Math.hypot(c[0] - d[0], c[1] - d[1]), Math.hypot(d[0] - a[0], d[1] - a[1])];
function scalene() {
  for (;;) {
    const w = rnd(100, 120), a = rnd(15, 40), h = rnd(55, 85), p = [[0, 0], [w, 0], [a, -h]], s = sides(p);
    if (Math.min(Math.abs(s[0] - s[1]), Math.abs(s[1] - s[2]), Math.abs(s[2] - s[0])) > 10) return p;
  }
}

// Every named shape and how many lines of symmetry it really has. The picture is drawn from the same points.
export const SYM = {
  'square': { lines: 4, pts: () => quadPoints('square') }, 'rectangle': { lines: 2, pts: () => quadPoints('rectangle') },
  'rhombus': { lines: 2, pts: () => quadPoints('rhombus') }, 'kite': { lines: 1, pts: () => quadPoints('kite') },
  'isosceles trapezoid': { lines: 1, pts: () => quadPoints('trapezoid') }, 'parallelogram': { lines: 0, pts: () => quadPoints('parallelogram') },
  'right trapezoid': { lines: 0, pts: () => quadPoints('right trapezoid') },
  'equilateral triangle': { lines: 3, pts: () => regular(3) }, 'regular pentagon': { lines: 5, pts: () => regular(5) }, 'regular hexagon': { lines: 6, pts: () => regular(6) },
  'isosceles triangle': { lines: 1, pts: () => { const w = rnd(80, 100); return [[0, 0], [w, 0], [w / 2, -rnd(110, 140)]]; } }, 'scalene triangle': { lines: 0, pts: scalene },
};
// Letters in a plain sans-serif face whose lines of symmetry do not depend on the font.
export const LETTERS = { A: 1, B: 1, C: 1, D: 1, E: 1, H: 2, I: 2, M: 1, O: 2, T: 1, U: 1, V: 1, W: 1, X: 2, Y: 1, F: 0, G: 0, J: 0, L: 0, N: 0, P: 0, Q: 0, R: 0, S: 0, Z: 0 };

export function symShapeSVG(name, spin = 0) {
  const t = a => spin ? [a[0] * Math.cos(spin * Math.PI / 180) - a[1] * Math.sin(spin * Math.PI / 180), a[0] * Math.sin(spin * Math.PI / 180) + a[1] * Math.cos(spin * Math.PI / 180)] : a;
  let p = SYM[name].pts().map(t);
  const xs = p.map(q => q[0]), ys = p.map(q => q[1]), x0 = Math.min(...xs), y0 = Math.min(...ys), k = Math.min(200 / (Math.max(...xs) - x0), 130 / (Math.max(...ys) - y0));
  const ox = (240 - (Math.max(...xs) - x0) * k) / 2, oy = (150 - (Math.max(...ys) - y0) * k) / 2;
  p = p.map(([x, y]) => `${(ox + (x - x0) * k).toFixed(1)},${(oy + (y - y0) * k).toFixed(1)}`);
  return `${open(240, 150, 'a flat shape')}<polygon class="body" points="${p.join(' ')}"/></svg>`;
}
export const letterSVG = ch => `${open(150, 130, 'a capital letter')}<text x="75" y="105" text-anchor="middle" style="font-size:110px;font-weight:700;font-family:Arial,Helvetica,sans-serif;fill:var(--ink)">${ch}</text></svg>`;

// A grid of cols by rows squares, shaded cells given as "row,col" strings, with a dashed mirror line down the middle.
export function mirrorGrid(cols, rows, cells, { c = 24, mini = false } = {}) {
  const k = mini ? 14 : c, W = cols * k + 8, H = rows * k + 8;
  let s = open(W, H, 'a grid with a mirror line', `data-cols="${cols}" data-rows="${rows}"`);
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
    const on = cells.has(`${r},${q}`);
    s += `<rect x="${4 + q * k}" y="${4 + r * k}" width="${k}" height="${k}" class="${on ? 'on' : 'off'}"${on ? ` data-r="${r}" data-c="${q}"` : ''} style="stroke:var(--ink);stroke-width:1;fill:${on ? '#b7a8ff' : 'var(--card)'}"/>`;
  }
  return `${s}<line x1="${4 + cols * k / 2}" y1="1" x2="${4 + cols * k / 2}" y2="${H - 1}" style="stroke:var(--bad);stroke-width:2.5;stroke-dasharray:5 4"/></svg>`;
}
