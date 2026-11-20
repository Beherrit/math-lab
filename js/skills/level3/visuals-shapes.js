// Pictures for lines, triangles, four-sided shapes and symmetry. Every shape is a plain polygon or line pair, so a test
// can read the coordinates back out of the picture and check what the question says about it.
import { rnd, pick, chance } from '../../util.js';

const open = (w, h, label, extra = '') => `<svg class="viz shape" ${extra} viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="max-width:${w}px">`;
const INK = 'style="stroke:var(--ink);stroke-width:3;stroke-linecap:round;fill:none"';
const rad = d => d * Math.PI / 180;
const pts = ps => ps.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const turn = ([x, y], deg) => [x * Math.cos(rad(deg)) - y * Math.sin(rad(deg)), x * Math.sin(rad(deg)) + y * Math.cos(rad(deg))];

// Shrinks and centres a list of points to fit a w by h picture.
function fit(ps, w, h, pad = 14) {
  const xs = ps.map(p => p[0]), ys = ps.map(p => p[1]), x0 = Math.min(...xs), y0 = Math.min(...ys);
  const k = Math.min((w - 2 * pad) / (Math.max(...xs) - x0 || 1), (h - 2 * pad) / (Math.max(...ys) - y0 || 1));
  const ox = (w - (Math.max(...xs) - x0) * k) / 2, oy = (h - (Math.max(...ys) - y0) * k) / 2;
  return ps.map(([x, y]) => [ox + (x - x0) * k, oy + (y - y0) * k]);
}

// Two line segments. kind is parallel, perpendicular or neither (they cross at a slant). Tilted at random.
export function linePairSVG(kind) {
  const tilt = rnd(0, 170), gap = rnd(26, 40), slant = pick([rnd(28, 62), rnd(118, 152)]), half = 64;
  const seg = (cx, cy, deg) => [[cx - half * Math.cos(rad(deg)), cy - half * Math.sin(rad(deg))], [cx + half * Math.cos(rad(deg)), cy + half * Math.sin(rad(deg))]];
  const a = seg(120, 75, tilt), shift = turn([0, gap], tilt);
  const c = kind === 'parallel' ? seg(120 + shift[0], 75 + shift[1], tilt) : seg(120 + rnd(-12, 12), 75 + rnd(-8, 8), tilt + (kind === 'perpendicular' ? 90 : slant));
  const ln = ([[x1, y1], [x2, y2]]) => `<line class="ln" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" ${INK}/>`;
  return `${open(240, 150, 'two lines')}${ln(a)}${ln(c)}</svg>`;
}

// A triangle with the given angles (degrees), turned at random. A right angle gets the usual small square.
export function triangleSVG(A, B, C) {
  const c = 100, bLen = c * Math.sin(rad(B)) / Math.sin(rad(C)), spin = rnd(0, 359), mirror = chance(0.5);
  let p = [[0, 0], [c, 0], [bLen * Math.cos(rad(A)), bLen * Math.sin(rad(A))]].map(q => turn(q, spin)).map(([x, y]) => [mirror ? -x : x, y]);
  p = fit(p, 240, 160);
  let s = `${open(240, 160, 'a triangle')}<polygon class="body" points="${pts(p)}"/>`;
  [[A, 0], [B, 1], [C, 2]].forEach(([deg, i]) => {
    if (deg !== 90) return;
    const [v, u, w] = [p[i], p[(i + 1) % 3], p[(i + 2) % 3]], k = 12, norm = q => { const d = Math.hypot(q[0] - v[0], q[1] - v[1]); return [(q[0] - v[0]) / d * k, (q[1] - v[1]) / d * k]; };
    const e1 = norm(u), e2 = norm(w);
    s += `<polyline class="mark" points="${pts([[v[0] + e1[0], v[1] + e1[1]], [v[0] + e1[0] + e2[0], v[1] + e1[1] + e2[1]], [v[0] + e2[0], v[1] + e2[1]]])}"/>`;
  });
  return s + '</svg>';
}

// Four-sided shapes, drawn upright. Sides are never equal by accident, so the picture agrees with the name.
const QUADS = {
  rectangle: () => { const w = rnd(120, 190), h = rnd(60, 100); return [[0, 0], [w, 0], [w, h], [0, h]]; },
  square: () => { const w = rnd(80, 100); return [[0, 0], [w, 0], [w, w], [0, w]]; },
  parallelogram: () => { const w = rnd(110, 150), s = rnd(35, 55), h = rnd(60, 90); return [[s, 0], [s + w, 0], [w, h], [0, h]]; },
  trapezoid: () => { const w = rnd(130, 170), i = rnd(30, 45), h = rnd(60, 90); return [[i, 0], [w - i, 0], [w, h], [0, h]]; },
  'right trapezoid': () => { const w = rnd(130, 170), t = rnd(60, 90), h = rnd(60, 90); return [[0, 0], [t, 0], [w, h], [0, h]]; },
  rhombus: () => { const w = rnd(70, 90), h = rnd(100, 125); return [[w, 0], [2 * w, h / 2], [w, h], [0, h / 2]]; },
  kite: () => { const w = rnd(60, 75), top = rnd(45, 60), bot = rnd(110, 130); return [[w, 0], [2 * w, top], [w, top + bot], [0, top]]; },
};
export const QUAD_NAMES = Object.keys(QUADS);
export const quadPoints = name => QUADS[name]();
export function quadSVG(name, flip = false) {
  const p = fit(QUADS[name]().map(([x, y]) => [flip ? -x : x, y]), 240, 150);
  return `${open(240, 150, 'a four-sided shape')}<polygon class="body" points="${pts(p)}"/></svg>`;
}
