// Pictures for grades 9-12. Strings only, so skill modules import in Node.
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function board(minX, maxX, minY, maxY, w = 280, h = 200) {
  if (maxX <= minX) maxX = minX + 1;
  if (maxY <= minY) maxY = minY + 1;
  const X = v => 40 + (v - minX) / (maxX - minX) * (w - 54);
  const Y = v => (h - 30) - (v - minY) / (maxY - minY) * (h - 48);
  return { X, Y, w, h, minX, maxX, minY, maxY };
}

function ticks(min, max) {
  const step = Math.max(1, Math.ceil((max - min) / 6));
  const out = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-6; v += step) out.push(v);
  return out;
}

function axes(g) {
  const { X, Y, minX, maxX, minY, maxY, h } = g;
  const xAxis = Math.min(maxX, Math.max(minX, 0));
  let s = `<line class="ax" x1="${X(minX)}" y1="${Y(0)}" x2="${X(maxX)}" y2="${Y(0)}"/>`;
  s += `<line class="ax" x1="${X(xAxis)}" y1="${Y(minY)}" x2="${X(xAxis)}" y2="${Y(maxY)}"/>`;
  for (const x of ticks(minX, maxX)) {
    s += `<line class="gl" x1="${X(x)}" y1="${Y(0) - 3}" x2="${X(x)}" y2="${Y(0) + 3}"/>`;
    if (x) s += `<text class="tk" x="${X(x)}" y="${Math.min(h - 8, Y(0) + 16)}" text-anchor="middle">${x}</text>`;
  }
  for (const y of ticks(minY, maxY)) {
    if (!y) continue;
    s += `<line class="gl" x1="${X(xAxis) - 3}" y1="${Y(y)}" x2="${X(xAxis) + 3}" y2="${Y(y)}"/>`;
    s += `<text class="tk" x="${X(xAxis) - 6}" y="${Y(y) + 4}" text-anchor="end">${y}</text>`;
  }
  return s;
}

function svg(g, inner, label) {
  return `<svg class="viz hs" viewBox="0 0 ${g.w} ${g.h}" role="img" aria-label="${esc(label)}">${axes(g)}${inner}</svg>`;
}

function chain(cls, pts, g) {
  const parts = [];
  let cur = [];
  for (const p of pts) {
    const inside = p[1] >= g.minY && p[1] <= g.maxY;
    if (!inside) { if (cur.length > 1) parts.push(cur); cur = []; }
    else cur.push(p);
  }
  if (cur.length > 1) parts.push(cur);
  return parts.map(seg => `<polyline class="${cls}" points="${seg.map(([x, y]) => `${g.X(x)},${g.Y(y)}`).join(' ')}"/>`).join('');
}

function samples(minX, maxX, fn) {
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const x = minX + (maxX - minX) * i / 24;
    pts.push([x, fn(x)]);
  }
  return pts;
}

export function lineGraph(m, b, x1 = 5) {
  const top = Math.max(4, m * x1 + b);
  const g = board(0, x1, 0, top + 1);
  return svg(g, chain('curve', samples(0, x1, x => m * x + b), g), 'a straight line on a grid');
}

export function twoLines(m1, b1, m2, b2, x1) {
  const top = Math.max(4, m1 * x1 + b1, m2 * x1 + b2);
  const g = board(0, x1, 0, top + 1);
  const x = (b2 - b1) / (m1 - m2);
  const mark = `<circle class="pt" cx="${g.X(x)}" cy="${g.Y(m1 * x + b1)}" r="5"/>`;
  const lines = chain('curve', samples(0, x1, t => m1 * t + b1), g) + chain('sec', samples(0, x1, t => m2 * t + b2), g);
  return svg(g, lines + mark, 'two lines crossing on a grid');
}

export function parabola(h, k) {
  const g = board(h - 3, h + 3, 0, k + 9);
  const dot = `<circle class="pt" cx="${g.X(h)}" cy="${g.Y(k)}" r="5"/>`;
  return svg(g, chain('curve', samples(h - 3, h + 3, x => (x - h) ** 2 + k), g) + dot, 'a parabola and its turning point');
}

export function shiftGraph(kind, n) {
  const box = { right: [-2, n + 2, 0, 8], left: [-n - 2, 2, 0, 8], up: [-3, 3, 0, n + 8], down: [-3, 3, -n - 1, 8] }[kind];
  const [minX, maxX, minY, maxY] = box;
  const g = board(minX, maxX, minY, maxY);
  const moved = x => (kind === 'right' ? (x - n) ** 2 : kind === 'left' ? (x + n) ** 2 : kind === 'up' ? x * x + n : x * x - n);
  return svg(g, chain('sec', samples(minX, maxX, x => x * x), g) + chain('curve', samples(minX, maxX, moved), g), 'a curve before and after a move');
}

export function secantGraph(h) {
  const x1 = 1 + h;
  const g = board(0, x1 + 1, 0, x1 * x1 + 1, 280, 150);
  const line = chain('sec', [[1, 1], [x1, x1 * x1]], g);
  return svg(g, chain('curve', samples(0, x1 + 0.5, x => x * x), g) + line, 'a curve and one secant');
}

export function underBars(n, side) {
  const g = board(0, n, 0, n + 0.6, 280, 180);
  let bars = '';
  for (let i = 0; i < n; i++) {
    const ht = side === 'left' ? i : i + 1;
    if (!ht) continue;
    bars += `<rect class="band" x="${g.X(i)}" y="${g.Y(ht)}" width="${g.X(i + 1) - g.X(i)}" height="${g.Y(0) - g.Y(ht)}"/>`;
  }
  return svg(g, bars + chain('curve', [[0, 0], [n, n]], g), 'rectangles under a rising line');
}
