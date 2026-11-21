// Bar pictures for story problems: a whole split into parts, and two bars side by side with the gap between them.
// The hidden number is drawn as a question mark. The widths always follow the real numbers.
const open = (w, h) => `<svg class="viz fbar" viewBox="0 0 ${w} ${h}" role="img" aria-label="a bar picture with one missing number" style="max-width:${w}px">`;
const box = (x, y, w, h, label, fill, dash = false) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" style="fill:${fill};stroke:var(--ink);stroke-width:2${dash ? ';stroke-dasharray:5 4' : ''}"/>`
  + `<text x="${x + w / 2}" y="${y + h / 2 + 5}" text-anchor="middle" class="lbl${label === '?' ? ' strong' : ''}">${label}</text>`;

// whole on top, parts below. hide is 'whole' or the index of the part that is not written.
export function partWhole({ whole, parts, hide }) {
  const s = 270 / whole;
  let x = 14, g = open(300, 84) + box(14, 8, whole * s, 28, hide === 'whole' ? '?' : whole, 'var(--hi)');
  parts.forEach((p, i) => { g += box(x, 46, p * s, 28, hide === i ? '?' : p, 'var(--grape-soft)'); x += p * s; });
  return g + '</svg>';
}
// Two bars, a and c, with the gap drawn as a dashed piece on the shorter bar. hide is 'a', 'c' or 'gap'.
export function compareBars({ a, c, nameA, nameB, hide }) {
  const hi = Math.max(a, c), s = 220 / hi, d = Math.abs(a - c), x0 = 64;
  const row = (y, v, name, hid) => `<text x="6" y="${y + 18}" class="lbl dim">${name}</text>` + box(x0, y, v * s, 26, hid ? '?' : v, 'var(--hi)')
    + (v < hi ? box(x0 + v * s, y, (hi - v) * s, 26, hide === 'gap' ? '?' : d, 'var(--card)', true) : '');
  return open(300, 76) + row(8, a, nameA, hide === 'a') + row(42, c, nameB, hide === 'c') + '</svg>';
}
