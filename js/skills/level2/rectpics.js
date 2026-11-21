// Pictures made of rectangles: two rectangles joined side by side, and an L-shape with all six sides labelled.
const open = (w, h, label) => `<svg class="viz fbar" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="max-width:${w}px">`;
const text = (x, y, s, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="lbl">${s}</text>`;
const FILL = ['fill-opacity:.3', 'fill:var(--hi);fill-opacity:.35'];

// Two rectangles side by side, w1 and w2 wide, h tall. Each width is written under its part and the height on the left.
export function twoRects(w1, w2, h, { grid = true } = {}) {
  const u = Math.min(26, 230 / (w1 + w2), 150 / h), ox = 44, oy = 6, W = (w1 + w2) * u, H = h * u;
  let g = open(ox + W + 14, oy + H + 30, `a rectangle ${h} tall, cut into a part ${w1} wide and a part ${w2} wide`);
  [[0, w1], [w1, w2]].forEach(([at, w], i) => { g += `<rect x="${ox + at * u}" y="${oy}" width="${w * u}" height="${H}" class="on" style="${FILL[i]};stroke:var(--ink);stroke-width:2"/>`; });
  if (grid) {
    let d = '';
    for (let i = 1; i < w1 + w2; i++) d += `M${ox + i * u} ${oy}v${H}`;
    for (let j = 1; j < h; j++) d += `M${ox} ${oy + j * u}h${W}`;
    g += `<path d="${d}" style="stroke:var(--ink);stroke-width:.6;fill:none;opacity:.5"/>`;
  }
  return g + text(ox + w1 * u / 2, oy + H + 20, w1) + text(ox + (w1 + w2 / 2) * u, oy + H + 20, w2) + text(ox - 8, oy + H / 2 + 5, h, 'end') + '</svg>';
}

// An L-shape: a W by H rectangle with a w by h piece missing from the top right. `cut` draws a dashed line: 'v' (up and down) or 'h' (across).
export function lShape(W, H, w, h, { cut = '' } = {}) {
  const u = Math.min(22, 200 / W, 150 / H), ox = 44, oy = 22, X = x => ox + x * u, Y = y => oy + y * u;
  let g = open(ox + W * u + 50, oy + H * u + 30, `L-shape, ${W} wide and ${H} tall, with a ${w} by ${h} piece missing from the top right corner`);
  g += `<polygon points="${[[0, 0], [W - w, 0], [W - w, h], [W, h], [W, H], [0, H]].map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')}" class="on" style="fill-opacity:.3;stroke:var(--ink);stroke-width:2"/>`;
  if (cut === 'v') g += `<line x1="${X(W - w)}" y1="${Y(0)}" x2="${X(W - w)}" y2="${Y(H)}" style="stroke:var(--ink);stroke-width:2;stroke-dasharray:5 4"/>`;
  if (cut === 'h') g += `<line x1="${X(0)}" y1="${Y(h)}" x2="${X(W)}" y2="${Y(h)}" style="stroke:var(--ink);stroke-width:2;stroke-dasharray:5 4"/>`;
  g += text(X((W - w) / 2), Y(0) - 6, W - w) + text(X(W - w) + 6, Y(h / 2) + 5, h, 'start') + text(X(W - w / 2), Y(h) - 6, w) + text(X(W) + 6, Y((H + h) / 2) + 5, H - h, 'start');
  return g + text(X(W / 2), Y(H) + 20, W) + text(X(0) - 8, Y(H / 2) + 5, H, 'end') + '</svg>';
}
