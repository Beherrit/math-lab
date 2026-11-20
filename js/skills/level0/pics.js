// Counting pictures: scattered dots, dots in a line, groups as option tiles, ten frames, a number line and a hundred chart.
import { rnd } from '../../util.js';
import { svg, tile, el, text, counter, crossed, plus, INK } from './svg.js';
import { cnt } from './kit.js';

function grid(n, w, h) {
  const cols = Math.ceil(Math.sqrt(n * w / h)), rows = Math.ceil(n / cols);
  return Array.from({ length: n }, (_, i) => ({ x: (w / cols) * (i % cols + 0.5), y: (h / rows) * (Math.floor(i / cols) + 0.5) }));
}
// n points in w by h with room for radius r each; falls back to a grid when random placement fails.
export function scatter(n, w, h, r) {
  const pts = [], gap = 2 * r + 5;
  for (let tries = 0; pts.length < n && tries < 4000; tries++) {
    const x = rnd(r + 3, w - r - 3), y = rnd(r + 3, h - r - 3);
    if (pts.every(p => Math.hypot(p.x - x, p.y - y) >= gap)) pts.push({ x, y });
  }
  return pts.length === n ? pts : grid(n, w, h);
}
export function inRow(n, w, y, r) {
  const step = Math.min(2 * r + 12, (w - 2 * r - 8) / Math.max(n - 1, 1)), x0 = (w - step * (n - 1)) / 2;
  return Array.from({ length: n }, (_, i) => ({ x: x0 + i * step, y }));
}
// Rows of up to `per` points, centred on cx.
export function inRows(n, per, cx, top, step) {
  return Array.from({ length: n }, (_, i) => {
    const row = Math.floor(i / per), inRowN = Math.min(per, n - row * per);
    return { x: cx + ((i % per) - (inRowN - 1) / 2) * step, y: top + row * step };
  });
}

const label = (n, what) => `${cnt(n, what)}`;
export function dotsPic(n, layout, what = 'dot', kind = 'a') {
  const w = 300, h = layout === 'line' ? 60 : 150, r = layout === 'line' ? Math.min(15, 130 / n) : n > 12 ? 11 : 14;
  const pts = layout === 'line' ? inRow(n, w, h / 2, r) : scatter(n, w, h, r);
  return svg(w, h, pts.map(p => counter(p.x, p.y, r, kind)).join(''), { label: label(n, what), data: { count: n } });
}
// A small picture of n dots to tap on.
export const groupTile = (n, kind = 'a') => {
  const r = n > 6 ? 8 : 10, pts = scatter(n, 96, 96, r);
  return tile(pts.map(p => counter(p.x, p.y, r, kind)).join(''), { label: label(n, 'dot'), data: { count: n } });
};

// ---- ten frame: two rows of five. The first `a` boxes hold counters of kind a, the next `b` of kind b. ----
export function tenFrame({ x = 0, y = 0, cell = 28, a = 0, b = 0, cells = 10 }) {
  let s = '';
  for (let i = 0; i < cells; i++) {
    const cx = x + (i % 5) * cell, cy = y + Math.floor(i / 5) * cell;
    s += el('rect', { x: cx, y: cy, width: cell, height: cell, fill: 'none', stroke: INK.edge, 'stroke-width': 2, 'data-cell': 1 });
    if (i < a + b) s += counter(cx + cell / 2, cy + cell / 2, cell * 0.38, i < a ? 'a' : 'b', i < a ? INK.fill : '#d97706');
  }
  return s;
}
// n counters over one or two ten frames (n up to 20). `split` colours the extras past ten differently.
export function framesPic(n, split = false) {
  const cell = 28, two = n > 10, w = two ? 2 * 5 * cell + 24 : 5 * cell + 8, h = 2 * cell + 8;
  const first = Math.min(n, 10), second = n - first;
  let s = tenFrame({ x: 4, y: 4, cell, a: first });
  if (two) s += tenFrame({ x: 5 * cell + 20, y: 4, cell, a: split ? 0 : second, b: split ? second : 0 });
  return svg(w, h, s, { label: cnt(n, 'dot'), data: { count: n } });
}

// ---- two groups joined with a plus, and a row of counters with some crossed out ----
export function joinPic(a, b) {
  const per = 3, step = 30, rows = Math.ceil(Math.max(a, b) / per), H = 12 + rows * step;
  const left = inRows(a, per, 70, 20, step), right = inRows(b, per, 230, 20, step);
  const inner = left.map(p => counter(p.x, p.y, 12, 'a')).join('') + plus(150, H / 2) + right.map(p => counter(p.x, p.y, 12, 'b', '#d97706')).join('');
  return svg(300, H, inner, { label: `${cnt(a, 'dot')} and ${cnt(b, 'dot')}`, data: { a, b } });
}
export function takePic(total, take) {
  const pts = inRows(total, 5, 150, 22, 40), keep = total - take;
  const inner = pts.map((p, i) => (i < keep ? counter(p.x, p.y, 15, 'a') : crossed(p.x, p.y, 15))).join('');
  return svg(300, total > 5 ? 110 : 62, inner, { label: `${cnt(total, 'counter')}, ${take} crossed out`, data: { total, take } });
}

// ---- number line: `count` consecutive ticks from `start`. Only ticks in `show` are labelled; `hide` shows a question mark. ----
export function numLine(start, count, { hide = -1, show = [] } = {}) {
  const W = 330, H = 86, m = 20, y = 46, dx = (W - 2 * m) / (count - 1);
  let s = el('line', { x1: m - 8, y1: y, x2: W - m + 8, y2: y, stroke: 'currentColor', 'stroke-width': 3 });
  for (let i = 0; i < count; i++) {
    const x = m + i * dx;
    s += el('line', { x1: x, y1: y - 9, x2: x, y2: y + 9, stroke: 'currentColor', 'stroke-width': 2 });
    if (i === hide) s += el('rect', { x: x - 15, y: y + 14, width: 30, height: 28, rx: 6, fill: 'none', stroke: INK.fill, 'stroke-width': 2, 'stroke-dasharray': '4 3' }) + text('?', x, y + 36, 22, { 'data-i': i, 'data-hidden': 1 });
    else if (show.includes(i)) s += text(start + i, x, y + 36, count > 9 ? 17 : 20, { 'data-i': i, 'data-v': start + i });
  }
  return svg(W, H, s, { label: 'a number line with one missing number' });
}

// ---- hundred chart: cells in reading order, 1 to rows*10. `hide` is a number shown as a question mark; `mark` are tinted. ----
export function chart(rows, { hide = 0, mark = [] } = {}) {
  const c = 30, W = c * 10 + 2;
  let s = '';
  for (let n = 1; n <= rows * 10; n++) {
    const x = ((n - 1) % 10) * c + 1, y = Math.floor((n - 1) / 10) * c + 1, hid = n === hide;
    s += el('rect', { x, y, width: c, height: c, fill: hid ? '#fef3c7' : mark.includes(n) ? '#bfdbfe' : 'none', stroke: INK.edge, 'stroke-width': 1, 'data-cell': 1 });
    s += text(hid ? '?' : n, x + c / 2, y + c / 2 + 5, 13, hid ? { 'data-hidden': 1 } : {});
  }
  return svg(W, rows * c + 2, s, { label: `a chart of the numbers 1 to ${rows * 10}` });
}
