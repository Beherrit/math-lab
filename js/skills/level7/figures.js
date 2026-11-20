// Level 7 figures that are not on a grid: two triangles with side labels, and a box with a diagonal through it.
const open = (w, h, label) => `<svg class="viz shape" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="max-width:${w}px">`;
const txt = (x, y, s, anchor = 'middle', cls = 'lbl') => `<text x="${+x.toFixed(1)}" y="${+y.toFixed(1)}" text-anchor="${anchor}" class="${cls}">${s}</text>`;
const NOTE = 'Not drawn to scale';

// Corner points of a triangle with the given side lengths: the longest side is the base on the bottom.
function corners(lens) {
  const [a, b, c] = lens.slice().sort((p, q) => p - q), x = (a * a + c * c - b * b) / (2 * c), h = Math.sqrt(Math.max(a * a - x * x, 0.01));
  return { pts: [[0, 0], [c, 0], [x, h]], base: c, h };
}
const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
// Two triangles side by side, each given as sides [{ len, say }]: say is the label printed on that side.
// Every triangle is drawn with the shape its real side lengths make, at one common size so a bigger copy looks bigger.
export function triPair(left, right) {
  const T = [left, right].map(s => corners(s.map(v => v.len))), k = Math.min(135 / Math.max(...T.map(t => t.base)), 90 / Math.max(...T.map(t => t.h)));
  let s = open(320, 170, 'two triangles');
  [left, right].forEach((sides, i) => {
    const t = T[i], x0 = 14 + i * 160 + (135 - t.base * k) / 2, y0 = 130, P = t.pts.map(([x, y]) => [x0 + x * k, y0 - y * k]);
    s += `<polygon points="${P.map(p => p.join(',')).join(' ')}" class="body"/>`;
    const order = sides.slice().sort((p, q) => p.len - q.len), pairs = [[P[0], P[2]], [P[1], P[2]], [P[0], P[1]]], cen = [(P[0][0] + P[1][0] + P[2][0]) / 3, (P[0][1] + P[1][1] + P[2][1]) / 3];
    pairs.forEach(([p, q], j) => {
      const m = mid(p, q), dx = m[0] - cen[0], dy = m[1] - cen[1], d = Math.hypot(dx, dy) || 1;
      s += txt(m[0] + (dx / d) * 14, m[1] + (dy / d) * 14 + 4, order[j].say);
    });
  });
  return s + txt(160, 164, NOTE, 'middle', 'lbl dim') + '</svg>';
}
// A box l by w by h with the diagonal from the bottom front corner to the top back corner dashed. labels: [l, w, h] texts.
export function boxDiagonal(labels, { floor = false } = {}) {
  const W = 300, H = 210, fw = 130, fh = 84, dx = 62, dy = -46, ox = 52, oy = 76;
  const P = (x, y) => `${ox + x},${oy + y}`;
  let s = open(W, H, 'a box with a diagonal');
  s += `<polygon points="${P(0, 0)} ${P(dx, dy)} ${P(fw + dx, dy)} ${P(fw, 0)}" class="top"/><polygon points="${P(fw, 0)} ${P(fw + dx, dy)} ${P(fw + dx, fh + dy)} ${P(fw, fh)}" class="side"/><rect x="${ox}" y="${oy}" width="${fw}" height="${fh}" class="front"/>`;
  const style = 'style="stroke:var(--grape);stroke-width:2.5;fill:none;stroke-dasharray:6 4"';
  if (floor) s += `<line x1="${ox}" y1="${oy + fh}" x2="${ox + fw + dx}" y2="${oy + fh + dy}" ${style}/>`;
  else s += `<line x1="${ox}" y1="${oy + fh}" x2="${ox + fw + dx}" y2="${oy + dy}" ${style}/>`;
  s += txt(ox + fw / 2, oy + fh + 20, labels[0]) + txt(ox + fw + dx / 2 + 12, oy + fh + dy / 2 + 16, labels[1], 'start') + txt(ox - 8, oy + fh / 2 + 5, labels[2], 'end');
  return s + txt(W / 2, H - 6, NOTE, 'middle', 'lbl dim') + '</svg>';
}
