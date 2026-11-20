// Level 6 figures for slicing solids: a box, a square pyramid or a triangular prism drawn with one flat cut shown as a shaded surface.
// Model coordinates: x to the right, y up, z away from the viewer. The back of the figure is drawn up and to the right.
const W = 320, H = 210, SHIFT_X = 0.5, SHIFT_Y = 0.35;

// The solid's corners, its edges as pairs of corner names, and which edges are hidden behind the front.
function solid(kind, a, b, c) {
  if (kind === 'box') {
    const l = a, h = b, d = c, P = { A: [0, 0, 0], B: [l, 0, 0], C: [l, h, 0], D: [0, h, 0], E: [0, 0, d], F: [l, 0, d], G: [l, h, d], I: [0, h, d] };
    return { P, edges: ['AB', 'BC', 'CD', 'DA', 'FG', 'GI', 'BF', 'CG', 'DI', 'EF', 'EI', 'AE'], hidden: ['EF', 'EI', 'AE'] };
  }
  if (kind === 'pyramid') {
    const s = a, h = b, P = { A: [0, 0, 0], B: [s, 0, 0], C: [s, 0, s], D: [0, 0, s], T: [s / 2, h, s / 2] };
    return { P, edges: ['AB', 'BC', 'CD', 'DA', 'AT', 'BT', 'CT', 'DT'], hidden: ['CD', 'DA', 'DT'] };
  }
  const w = a, h = b, d = c, P = { A: [0, 0, 0], B: [w, 0, 0], T: [w / 2, h, 0], E: [0, 0, d], F: [w, 0, d], U: [w / 2, h, d] };
  return { P, edges: ['AB', 'BT', 'TA', 'EF', 'FU', 'UE', 'AE', 'BF', 'TU'], hidden: ['EF', 'AE', 'UE'] };
}
// The corners of the flat cut, as model points.
function cutPolygon(kind, a, b, c, cut, f = 0.5) {
  if (kind === 'box') {
    const l = a, h = b, d = c;
    return { top: [[0, h / 2, 0], [l, h / 2, 0], [l, h / 2, d], [0, h / 2, d]], front: [[0, 0, d / 2], [l, 0, d / 2], [l, h, d / 2], [0, h, d / 2]], side: [[l / 2, 0, 0], [l / 2, 0, d], [l / 2, h, d], [l / 2, h, 0]] }[cut];
  }
  if (kind === 'pyramid') {
    const s = a, h = b, i = s * f / 2, y = h * f;
    return cut === 'apex' ? [[0, 0, s / 2], [s, 0, s / 2], [s / 2, h, s / 2]] : [[i, y, i], [s - i, y, i], [s - i, y, s - i], [i, y, s - i]];
  }
  const w = a, h = b, d = c;
  return { ends: [[0, 0, d / 2], [w, 0, d / 2], [w / 2, h, d / 2]], floor: [[w / 4, h / 2, 0], [3 * w / 4, h / 2, 0], [3 * w / 4, h / 2, d], [w / 4, h / 2, d]], tall: [[w / 2, 0, 0], [w / 2, 0, d], [w / 2, h, d], [w / 2, h, 0]] }[cut];
}
// kind: 'box' (a = length, b = height, c = depth), 'pyramid' (a = base side, b = height) or 'prism' (a = end width, b = end height, c = length).
export function sliceFig(kind, a, b, c, cut, f) {
  const depth = kind === 'pyramid' ? a : c, wide = a + SHIFT_X * depth, tall = b + SHIFT_Y * depth, s = Math.min(230 / wide, 130 / tall);
  const ox = (W - wide * s) / 2, oy = 28 + tall * s, pt = ([x, y, z]) => `${(ox + (x + SHIFT_X * z) * s).toFixed(1)},${(oy - (y + SHIFT_Y * z) * s).toFixed(1)}`;
  const sol = solid(kind, a, b, c), poly = cutPolygon(kind, a, b, c, cut, f);
  let g = `<svg class="viz shape" viewBox="0 0 ${W} ${H}" role="img" aria-label="${kind === 'pyramid' ? 'square pyramid' : kind === 'prism' ? 'triangular prism' : 'box'} with a flat cut through it" style="max-width:${W}px">`;
  for (const e of sol.edges) {
    const [p, q] = [sol.P[e[0]], sol.P[e[1]]].map(pt), [x1, y1] = p.split(','), [x2, y2] = q.split(',');
    g += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round"${sol.hidden.includes(e) ? ' stroke-dasharray="6 5" opacity="0.55"' : ''}/>`;
  }
  g += `<polygon points="${poly.map(pt).join(' ')}" fill="var(--grape)" fill-opacity="0.38" stroke="var(--grape)" stroke-width="3" stroke-linejoin="round"/>`;
  return g + '</svg>';
}
