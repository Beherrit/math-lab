// Level 5 local diagrams, drawn with the shared .viz classes (no new CSS).
import { fmt } from '../../util.js';
export const open = (w, h, label, cls) => `<svg class="viz ${cls}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="max-width:${w}px">`;
export const txt = (x, y, s, cls = 'lbl', anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${s}</text>`;
const GRAPE = 'style="stroke:var(--grape);stroke-width:4;fill:none"';

// Tape diagram: rows [{ n, label, on }], every box is the same size.
export function tape(rows) {
  const max = Math.max(...rows.map(r => r.n)), x0 = 104, u = Math.min(36, 200 / max), h = 26, gap = 10;
  let s = open(x0 + max * u + 6, rows.length * (h + gap), 'tape diagram', 'fbar');
  rows.forEach((r, i) => {
    const y = 2 + i * (h + gap);
    s += txt(x0 - 8, y + 18, r.label, 'lbl', 'end');
    for (let j = 0; j < r.n; j++) s += `<rect x="${x0 + j * u}" y="${y}" width="${u}" height="${h}" class="${r.on ? 'on' : 'off'}"/>`;
  });
  return s + '</svg>';
}
// 10 by 10 grid with n squares shaded.
export function hundredGrid(n) {
  const c = 18; let s = open(10 * c + 4, 10 * c + 4, `${n} of 100 squares shaded`, 'fbar');
  for (let i = 0; i < 100; i++) s += `<rect x="${2 + (i % 10) * c}" y="${2 + Math.floor(i / 10) * c}" width="${c}" height="${c}" class="${i < n ? 'on' : 'off'}"/>`;
  return s + '</svg>';
}
// Percent bar: a whole bar cut in `parts` equal pieces with `on` shaded, labels under both ends.
export function pctBar(parts, on, loL, hiL) {
  const w = 260, h = 28; let s = open(w + 8, 58, 'percent bar', 'fbar');
  for (let i = 0; i < parts; i++) s += `<rect x="${4 + i * w / parts}" y="2" width="${w / parts}" height="${h}" class="${i < on ? 'on' : 'off'}"/>`;
  return s + txt(4, 50, loL, 'lbl dim', 'start') + txt(w + 4, 50, hiL, 'lbl dim', 'end') + '</svg>';
}
// Four-quadrant grid from -r to r. pts: [{ x, y, label, cls }], path: [{x, y}, ...].
export function plane4({ pts = [], r = 6, path = null, quads = false } = {}) {
  const W = 320, m = 16, u = (W - 2 * m) / (2 * r), X = x => W / 2 + x * u, Y = y => W / 2 - y * u;
  let s = open(W, W, 'coordinate grid with four quadrants', 'plane');
  for (let i = -r; i <= r; i++) {
    s += `<line x1="${X(i)}" y1="${Y(-r)}" x2="${X(i)}" y2="${Y(r)}" class="gl"/><line x1="${X(-r)}" y1="${Y(i)}" x2="${X(r)}" y2="${Y(i)}" class="gl"/>`;
    if (i) s += `<text x="${X(i)}" y="${Y(0) + 13}" text-anchor="middle" class="tk">${fmt(i)}</text><text x="${X(0) - 5}" y="${Y(i) + 4}" text-anchor="end" class="tk">${fmt(i)}</text>`;
  }
  s += `<line x1="${X(-r)}" y1="${Y(0)}" x2="${X(r)}" y2="${Y(0)}" class="ax"/><line x1="${X(0)}" y1="${Y(-r)}" x2="${X(0)}" y2="${Y(r)}" class="ax"/>`;
  s += `<text x="${X(r) - 4}" y="${Y(0) - 7}" text-anchor="end" class="axn">x</text><text x="${X(0) + 7}" y="${Y(r) + 11}" class="axn">y</text>`;
  if (quads) s += [['I', 1, 1], ['II', -1, 1], ['III', -1, -1], ['IV', 1, -1]].map(([q, sx, sy]) => txt(X(sx * (r - 1)), Y(sy * (r - 1)) + 5, q, 'lbl dim')).join('');
  if (path) s += `<polyline points="${path.map(p => `${X(p.x)},${Y(p.y)}`).join(' ')}" class="path"/>`;
  for (const p of pts) {
    s += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="6" class="pt ${p.cls || ''}"/>`;
    if (p.label) s += `<text x="${X(p.x) + 8}" y="${Y(p.y) - 8}" class="ptl">${p.label}</text>`;
  }
  return s + '</svg>';
}
// Inequality graph: ray from v towards the left or right; open circle for < and >, filled for the "or equal" signs.
export function ineqLine(lo, hi, v, sym) {
  const W = 320, m = 24, y = 34, px = t => m + (t - lo) / (hi - lo) * (W - 2 * m);
  const right = sym === '>' || sym === '≥', closed = sym === '≥' || sym === '≤', end = right ? W - m + 12 : m - 12;
  let s = open(W, 70, 'inequality on a number line', 'nline sline') + `<line x1="${m - 8}" y1="${y}" x2="${W - m + 8}" y2="${y}" class="axis"/>`;
  for (let t = lo; t <= hi; t++) s += `<line x1="${px(t)}" y1="${y - 6}" x2="${px(t)}" y2="${y + 6}" class="tick"/>` + txt(px(t), y + 24, fmt(t), 'lbl dim');
  s += `<line x1="${px(v)}" y1="${y}" x2="${end}" y2="${y}" ${GRAPE}/><path d="M${end},${y} l${right ? -9 : 9},-7 M${end},${y} l${right ? -9 : 9},7" ${GRAPE}/>`;
  return s + `<circle cx="${px(v)}" cy="${y}" r="7" style="fill:var(--${closed ? 'grape' : 'card'});stroke:var(--grape);stroke-width:3"/></svg>`;
}
// Dot plot: counts[i] dots above the value lo + i.
export function dotPlot(lo, counts, title) {
  const W = 320, m = 24, base = 128, n = counts.length - 1, step = (W - 2 * m) / Math.max(n, 1);
  let s = open(W, 172, `dot plot: ${title}`, 'lplot') + `<line x1="${m - 8}" y1="${base}" x2="${W - m + 8}" y2="${base}" class="axis"/>`;
  counts.forEach((c, i) => {
    const x = m + i * step;
    s += `<line x1="${x}" y1="${base - 5}" x2="${x}" y2="${base + 5}" class="tick"/>` + txt(x, base + 21, lo + i, 'tk');
    for (let j = 0; j < c; j++) s += `<circle cx="${x}" cy="${base - 14 - j * 16}" r="6" style="fill:var(--grape)"/>`;
  });
  return s + txt(W / 2, 166, title) + '</svg>';
}
// Histogram: one bar per interval label, with a count scale on the left.
export function histogram(labels, counts, title) {
  const W = 320, m = 34, base = 150, top = Math.max(...counts), u = Math.min(22, 128 / top), bw = (W - m - 10) / labels.length;
  let s = open(W, 196, `histogram: ${title}`, 'fbar lplot');
  for (let c = 0; c <= top; c++) s += `<line x1="${m}" y1="${base - c * u}" x2="${W - 8}" y2="${base - c * u}" style="stroke:var(--line);stroke-width:1"/>` + (c % (top > 8 ? 2 : 1) ? '' : txt(m - 6, base - c * u + 4, c, 'tk', 'end'));
  counts.forEach((c, i) => { s += `<rect x="${m + i * bw}" y="${base - c * u}" width="${bw}" height="${c * u}" class="on"/>` + txt(m + i * bw + bw / 2, base + 16, labels[i], 'tk'); });
  return s + `<line x1="${m}" y1="${base}" x2="${W - 8}" y2="${base}" class="axis"/>` + txt(W / 2, 190, title) + '</svg>';
}
// A two-pan balance showing an equation: what sits on the left equals what sits on the right.
export function balance(left, right) {
  const pan = (x, s) => `<rect x="${x}" y="14" width="112" height="38" rx="6" class="body"/>` + txt(x + 56, 39, s);
  return open(300, 96, `balance: ${left} equals ${right}`, 'shape') + pan(14, left) + pan(174, right)
    + `<line x1="8" y1="56" x2="292" y2="56" class="body"/><polygon points="150,58 132,90 168,90" class="body"/></svg>`;
}
