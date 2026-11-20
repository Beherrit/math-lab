// Level 6 shape diagrams: labelled rectangle, circle, angle fans, triangle, L-shape, house shape, triangular prism.
const open = (w, h, label) => `<svg class="viz shape" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="max-width:${w}px">`;
const INK = 'var(--ink)', GRAPE = 'var(--grape)';
// Shape bodies keep the same pale fill in every theme, so anything drawn on top of one uses this fixed dark colour.
const ON_BODY = 'style="fill:#2b2350;stroke:#2b2350"', TEXT_ON_BODY = 'lbl" style="fill:#2b2350';
const text = (x, y, s, anchor = 'middle', cls = 'lbl') => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" class="${cls}">${s}</text>`;
const line = (x1, y1, x2, y2, extra = '') => `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" ${extra}/>`;
const poly = pts => `<polygon points="${pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}" class="body"/>`;
const NOT_TO_SCALE = (w, h) => text(w - 6, h - 6, 'not to scale', 'end', 'lbl dim');

// A rectangle with a label under it and beside it. `tall` is height divided by width, kept in a sensible range.
export function rectFig(wLabel, hLabel, tall = 0.6) {
  const w = 150, h = Math.min(Math.max(w * tall, 45), 120);
  return open(280, h + 56, `rectangle ${wLabel} by ${hLabel}`) + `<rect x="90" y="12" width="${w}" height="${h}" class="body"/>`
    + text(90 + w / 2, h + 34, wLabel) + text(82, 12 + h / 2 + 5, hLabel, 'end') + '</svg>';
}
// A circle with its radius ('r') or diameter ('d') drawn and labelled.
export function circleFig(label, kind) {
  const cx = 110, cy = 100, r = 78;
  return open(220, 200, `circle with ${kind === 'r' ? 'radius' : 'diameter'} ${label}`) + `<circle cx="${cx}" cy="${cy}" r="${r}" class="body"/>`
    + line(kind === 'r' ? cx : cx - r, cy, cx + r, cy, ON_BODY) + `<circle cx="${cx}" cy="${cy}" r="4" ${ON_BODY}/>` + text(kind === 'r' ? cx + r / 2 : cx, cy - 10, label, 'middle', TEXT_ON_BODY) + '</svg>';
}
// Rays from one point. dirs are directions in degrees (0 = right, 90 = up). labels[i] sits between ray i and ray i + 1;
// one more label than gaps wraps round from the last ray back to the first.
export function raysFig(dirs, labels) {
  const full = dirs.some(d => d > 180) || labels.length === dirs.length, W = 320, H = full ? 230 : 150, cx = 160, cy = full ? 115 : 128, len = full ? 100 : 112;
  const at = (deg, r) => [cx + r * Math.cos(deg * Math.PI / 180), cy - r * Math.sin(deg * Math.PI / 180)];
  let g = open(W, H, `angles: ${labels.join(', ')}`);
  for (const d of dirs) { const [x, y] = at(d, len); g += line(cx, cy, x, y); }
  labels.forEach((s, i) => {
    const d1 = dirs[i], d2 = i + 1 < dirs.length ? dirs[i + 1] : dirs[0] + 360, [x1, y1] = at(d1, 26), [x2, y2] = at(d2, 26), [tx, ty] = at((d1 + d2) / 2, d2 - d1 < 40 || s.length > 5 ? 84 : 54);
    g += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A 26 26 0 ${d2 - d1 > 180 ? 1 : 0} 0 ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${GRAPE}" stroke-width="2"/>`;
    g += text(tx, ty + 5, s, 'middle', s === '?' || /x/.test(s) ? 'lbl strong' : 'lbl');
  });
  return g + `<circle cx="${cx}" cy="${cy}" r="4" fill="${INK}"/></svg>`;
}
// A triangle with a label in each corner, and optionally an outside angle where the base is extended.
export function triFig(labels, ext = null) {
  const P = [[40, 150], [236, 150], [104, 28]], c = [(40 + 236 + 104) / 3, (150 + 150 + 28) / 3];
  let g = open(320, 180, `triangle with angles ${labels.join(', ')}`) + poly(P);
  P.forEach(([x, y], i) => { const dx = c[0] - x, dy = c[1] - y, m = Math.hypot(dx, dy), r = i === 2 ? 44 : 50; g += text(x + dx / m * r, y + dy / m * r + 5, labels[i], 'middle', labels[i] === '?' || /x/.test(labels[i]) ? 'lbl strong' : TEXT_ON_BODY); });
  if (ext) g += line(236, 150, 306, 150) + text(268, 138, ext, 'middle', ext === '?' ? 'lbl strong' : 'lbl');
  return g + NOT_TO_SCALE(320, 180) + '</svg>';
}
// An L-shape: a W by H rectangle with a w by h corner cut away. Only W, H, w and h are labelled.
export function lFig(W, H, w, h, unit) {
  const s = Math.min(190 / W, 120 / H), ox = 70, oy = 14, X = v => ox + v * s, Y = v => oy + v * s, u = v => `${v} ${unit}`;
  return open(320, H * s + 54, `L-shape, ${W} by ${H} with a ${w} by ${h} corner missing`)
    + poly([[X(0), Y(0)], [X(W - w), Y(0)], [X(W - w), Y(h)], [X(W), Y(h)], [X(W), Y(H)], [X(0), Y(H)]])
    + text(X(W / 2), Y(H) + 20, u(W)) + text(X(0) - 8, Y(H / 2) + 5, u(H), 'end') + text(X(W - w / 2), Y(h) + 17, u(w), 'middle', TEXT_ON_BODY) + text(X(W - w) + 6, Y(h / 2) + 5, u(h), 'start') + '</svg>';
}
// A rectangle with a triangle on top (a house shape). The triangle's height is drawn as a dashed line.
export function houseFig(w, h, t, unit) {
  const s = Math.min(170 / w, 130 / (h + t)), ox = 90, oy = 12, X = v => ox + v * s, Y = v => oy + v * s, u = v => `${v} ${unit}`;
  return open(320, (h + t) * s + 50, `rectangle ${w} by ${h} with a triangle of height ${t} on top`)
    + poly([[X(0), Y(t)], [X(w / 2), Y(0)], [X(w), Y(t)], [X(w), Y(t + h)], [X(0), Y(t + h)]]) + line(X(0), Y(t), X(w), Y(t), `stroke-dasharray="5 5" ${ON_BODY}`)
    + line(X(w / 2), Y(0), X(w / 2), Y(t), `stroke-dasharray="5 5" ${ON_BODY}`) + text(X(w / 2) + 6, Y(t) - 5, u(t), 'start', TEXT_ON_BODY)
    + text(X(w / 2), Y(t + h) + 20, u(w)) + text(X(0) - 8, Y(t + h / 2) + 5, u(h), 'end') + '</svg>';
}
// A prism whose ends are right triangles. labels: [base leg, upright leg, sloping side or '', length].
export function triPrismFig(labels) {
  const A = [50, 150], B = [130, 150], C = [50, 70], d = [130, -34], sh = p => [p[0] + d[0], p[1] + d[1]];
  let g = open(320, 180, `triangular prism: ${labels.filter(Boolean).join(', ')}`);
  g += poly([C, sh(C), sh(B), B]) + poly([A, B, C]) + line(...A, ...B) + line(...sh(B), ...sh(C)) + line(...B, ...sh(B)) + line(...C, ...sh(C));
  g += `<polyline points="${A[0]},${A[1] - 10} ${A[0] + 10},${A[1] - 10} ${A[0] + 10},${A[1]}" class="mark"/>`;
  g += text(90, 170, labels[0]) + text(42, 114, labels[1], 'end') + (labels[2] ? text(150, 92, labels[2], 'middle', TEXT_ON_BODY) : '') + text(206, 150, labels[3], 'start');
  return g + NOT_TO_SCALE(320, 180) + '</svg>';
}
