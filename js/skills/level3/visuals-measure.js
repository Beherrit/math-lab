// Pictures for the newer level 3 skills: comparison bars, tile figures, a protractor and a line plot in fractions.
import { frText } from '../../util.js';

const open = (w, h, label, cls) => `<svg class="viz ${cls}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="max-width:${w}px">`;
const INK = 'style="stroke:var(--ink);stroke-width:2.5;stroke-linecap:round;fill:none"';
const f1 = v => v.toFixed(1);

// Bars made of equal blocks, one row each: [{ label, count, inside, end }]. inside is written in every block, end after the bar.
export function blockBars(rows) {
  const most = Math.max(...rows.map(r => r.count)), bw = Math.min(34, Math.floor(250 / most)), x0 = 74;
  let s = open(x0 + bw * most + 90, rows.length * 40 + 6, 'bars made of equal blocks', 'fbar');
  rows.forEach((r, i) => {
    const y = 4 + i * 40;
    s += `<text x="2" y="${y + 22}" class="lbl">${r.label}</text>`;
    for (let j = 0; j < r.count; j++) {
      s += `<rect x="${x0 + j * bw}" y="${y}" width="${bw}" height="30" class="on"/>`;
      if (r.inside) s += `<text x="${x0 + j * bw + bw / 2}" y="${y + 20}" text-anchor="middle" class="lbl">${r.inside}</text>`;
    }
    if (r.end) s += `<text x="${x0 + r.count * bw + 8}" y="${y + 21}" class="lbl strong">${r.end}</text>`;
  });
  return s + '</svg>';
}

// Figures made of square tiles side by side, for growing patterns: counts is the tile count of each figure.
export function tileFigures(counts) {
  const c = 15, cols = 4, gapX = 22, widths = counts.map(n => Math.min(n, cols) * c);
  const rowsMax = Math.max(...counts.map(n => Math.ceil(n / cols))), H = rowsMax * c + 34;
  let s = open(widths.reduce((a, w) => a + w + gapX, 6), H, 'figures made of square tiles', 'fbar'), x = 4;
  counts.forEach((n, i) => {
    for (let t = 0; t < n; t++) s += `<rect x="${x + (t % cols) * c}" y="${4 + Math.floor(t / cols) * c}" width="${c - 2}" height="${c - 2}" class="on"/>`;
    s += `<text x="${x + widths[i] / 2}" y="${H - 8}" text-anchor="middle" class="lbl dim">Figure ${i + 1}</text>`;
    x += widths[i] + gapX;
  });
  return s + '</svg>';
}

// A protractor with 0 at the right end, or at the left end when flip is set. rays are the readings on that scale.
// The rays carry the readings so a test can read them back from the picture.
export function protractorSVG(rays, flip = false) {
  const cx = 150, cy = 150, R = 112, at = (deg, rad) => { const t = (flip ? 180 - deg : deg) * Math.PI / 180; return [cx + rad * Math.cos(t), cy - rad * Math.sin(t)]; };
  let s = open(300, 176, 'a protractor with two rays', 'lplot protractor').replace('<svg ', `<svg data-flip="${flip ? 1 : 0}" `);
  s += `<line x1="${cx - 140}" y1="${cy}" x2="${cx + 140}" y2="${cy}" class="axis"/><path d="M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}" class="mark" style="stroke:var(--ink-2);stroke-width:1.5;fill:none"/>`;
  for (let r = 0; r <= 180; r += 5) {
    const major = r % 10 === 0, [x1, y1] = at(r, R), [x2, y2] = at(r, R - (major ? 10 : 6));
    s += `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" class="tick" style="stroke-width:1.2"/>`;
    if (major) { const [lx, ly] = at(r, R + 14); s += `<text x="${f1(lx)}" y="${f1(ly + 4)}" text-anchor="middle" class="tk" style="font-size:10px">${r}</text>`; }
  }
  for (const r of rays) { const [x, y] = at(r, R + 4); s += `<line class="ray" x1="${cx}" y1="${cy}" x2="${f1(x)}" y2="${f1(y)}" ${INK}/>`; }
  return s + `<circle cx="${cx}" cy="${cy}" r="3.5" style="fill:var(--ink)"/></svg>`;
}

// A line plot on a scale of fractions: ticks every 1/den from lo for span whole units. counts[i] marks sit on tick i.
export function fracPlot({ den, lo, span, counts, unit }) {
  const n = span * den, W = 360, m = 26, step = (W - 2 * m) / n, most = Math.max(1, ...counts), base = 22 + most * 16, H = base + 54;
  let s = open(W, H, 'line plot with a scale in fractions', 'lplot');
  s += `<line x1="${m - 8}" y1="${base}" x2="${W - m + 8}" y2="${base}" class="axis"/>`;
  for (let i = 0; i <= n; i++) {
    const x = m + i * step;
    s += `<line x1="${f1(x)}" y1="${base - 5}" x2="${f1(x)}" y2="${base + 5}" class="tick"/><text x="${f1(x)}" y="${base + 21}" text-anchor="middle" class="tk" style="font-size:11px">${frText(lo * den + i, den)}</text>`;
    for (let j = 0; j < (counts[i] || 0); j++) s += `<text class="xm" data-i="${i}" x="${f1(x)}" y="${base - 10 - j * 16}" text-anchor="middle">X</text>`;
  }
  return s + `<text x="${W / 2}" y="${H - 6}" text-anchor="middle" class="lbl">${unit}</text></svg>`;
}
