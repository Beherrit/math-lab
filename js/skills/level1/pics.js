// Level 1 pictures: a bar against ten, place value blocks and open number lines with jumps.
import { cnt } from './words.js';
const open = (w, h, label, cls) => `<svg class="viz ${cls}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="max-width:${w}px">`;

// A plain bar on a scale of 0 to 20: `a` in one colour, then `c` more, with the 10 mark drawn through it.
export function tenBar(a, c = 0) {
  const u = 14, x0 = 8, y = 26, h = 26, W = 20 * u + 16, H = y + h + 30, mid = x0 + 10 * u;
  let g = open(W, H, `bar showing ${a}${c ? ` and ${c} more` : ''}, with the 10 mark`, 'fbar');
  g += `<rect x="${x0}" y="${y}" width="${10 * u}" height="${h}" class="off"/>`;
  g += `<rect x="${x0}" y="${y}" width="${a * u}" height="${h}" style="fill:var(--fbar-on)"/>`;
  if (c) g += `<rect x="${x0 + a * u}" y="${y}" width="${c * u}" height="${h}" style="fill:var(--hi)"/>`;
  g += `<line x1="${mid}" y1="${y - 8}" x2="${mid}" y2="${y + h + 8}" style="stroke:var(--ink);stroke-width:2;stroke-dasharray:4 3"/>`;
  g += `<text x="${mid}" y="${y - 12}" text-anchor="middle" class="lbl strong">10</text>`;
  g += `<text x="${x0 + a * u / 2}" y="${y + h + 22}" text-anchor="middle" class="lbl">${a}</text>`;
  if (c) g += `<text x="${x0 + a * u + c * u / 2}" y="${y + h + 22}" text-anchor="middle" class="lbl">${c}</text>`;
  return g + '</svg>';
}

// One block: a filled rectangle with faint inner lines so the unit squares can be seen.
function block(x, y, w, h, nx, ny) {
  let d = '';
  for (let i = 1; i < nx; i++) d += `M${x + i * w / nx} ${y}v${h}`;
  for (let j = 1; j < ny; j++) d += `M${x} ${y + j * h / ny}h${w}`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="on"/>` + (d ? `<path d="${d}" style="stroke:var(--card);stroke-width:.7;opacity:.75;fill:none"/>` : '');
}

// Place value blocks: hundreds are flats, tens are rods, ones are small cubes (each at most 9).
export function blocks(h, t, o) {
  const W = 310, top = 4, H = Math.max(Math.ceil(h / 3) * 42, t ? 94 : 0, Math.ceil(o / 3) * 13, 20) + 26;
  let g = open(W, H, `${cnt(h, 'hundred')}, ${cnt(t, 'ten')} and ${cnt(o, 'one')} as blocks`, 'fbar');
  const label = (x, text) => `<text x="${x}" y="${H - 5}" text-anchor="middle" class="lbl dim">${text}</text>`;
  for (let i = 0; i < h; i++) g += block(4 + (i % 3) * 42, top + Math.floor(i / 3) * 42, 38, 38, 10, 10);
  for (let i = 0; i < t; i++) g += block(140 + i * 12, top, 9, 90, 1, 10);
  for (let i = 0; i < o; i++) g += block(262 + (i % 3) * 13, top + Math.floor(i / 3) * 13, 9, 9, 1, 1);
  if (h) g += label(66, cnt(h, 'hundred'));
  g += label(192, cnt(t, 'ten')) + label(280, cnt(o, 'one'));
  return g + '</svg>';
}

// Open number line: the points are spaced evenly (not to scale) with a labelled jump between neighbours.
// `hide` is the index of a point shown as "?". With `jumps: false` the size of each jump is not written on it.
export function hops(pts, { hide = -1, jumps = true } = {}) {
  const W = 320, H = 92, m = 24, y = 58, n = pts.length;
  const px = i => m + i / Math.max(n - 1, 1) * (W - 2 * m);
  let g = open(W, H, hide < 0 ? `number line with jumps from ${pts[0]} to ${pts[n - 1]}` : 'number line with jumps and one missing number', 'nline');
  g += `<line x1="${m - 10}" y1="${y}" x2="${W - m + 10}" y2="${y}" class="axis"/>`;
  pts.forEach((v, i) => {
    const x = px(i);
    g += `<line x1="${x}" y1="${y - 7}" x2="${x}" y2="${y + 7}" class="tick"/>`;
    g += `<text x="${x}" y="${y + 25}" text-anchor="middle" class="lbl${i === hide ? ' strong' : ''}">${i === hide ? '?' : v}</text>`;
    if (!i) return;
    const a = px(i - 1), d = v - pts[i - 1];
    g += `<path d="M${a} ${y - 9}Q${(a + x) / 2} ${y - 46} ${x} ${y - 9}" style="fill:none;stroke:var(--grape);stroke-width:2"/>`;
    if (jumps) g += `<text x="${(a + x) / 2}" y="${y - 34}" text-anchor="middle" class="lbl dim">${d < 0 ? '−' : '+'}${Math.abs(d)}</text>`;
  });
  return g + '</svg>';
}
