// A ruler with something to measure, and a line plot of measurements (halves or quarters of an inch).
import { frText } from '../../util.js';

const open = (w, h, label) => `<svg class="viz fbar" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="max-width:${w}px">`;
const r1 = v => v.toFixed(1);

// A ruler marked every 1/sub inch (sub 2 or 4), `max` inches long. The object starts at 0 and ends at len + off inches.
export function ruler(len, { sub = 4, max = 6, off = 0 } = {}) {
  const x0 = 22, ppi = 286 / max, X = i => x0 + i * ppi / sub;
  let g = open(330, 106, `ruler marked in ${sub === 2 ? 'half' : 'quarter'} inches with a strip to measure`);
  g += `<rect class="obj" x="${x0}" y="6" width="${r1((len + off) * ppi)}" height="22" rx="5" style="fill:var(--hi);fill-opacity:.6;stroke:var(--ink);stroke-width:2"/>`;
  g += `<rect x="${x0 - 12}" y="34" width="${r1(286 + 24)}" height="64" rx="4" style="fill:var(--card);stroke:var(--ink);stroke-width:2"/>`;
  for (let i = 0; i <= max * sub; i++) {
    const whole = i % sub === 0, mid = sub === 4 && i % 2 === 0, h = whole ? 22 : mid ? 15 : 9;
    g += `<line class="tick" x1="${r1(X(i))}" y1="34" x2="${r1(X(i))}" y2="${34 + h}" style="stroke:var(--ink);stroke-width:${whole ? 2 : 1.4}"/>`;
    if (whole) g += `<text x="${r1(X(i))}" y="${34 + 42}" text-anchor="middle" class="lbl">${i / sub}</text>`;
  }
  return g + '<text x="300" y="92" class="lbl dim">in</text></svg>';
}

// A line plot: one circle for each measurement, stacked above its mark on a number line from 0 to max inches. `data` maps a count of 1/sub inches to how many.
export function lengthPlot(data, sub, max, title) {
  const W = 330, H = 190, m = 20, base = 150, step = (W - 2 * m) / (max * sub);
  let g = open(W, H, `line plot of ${title}`) + `<line x1="${m - 6}" y1="${base}" x2="${W - m + 6}" y2="${base}" style="stroke:var(--ink);stroke-width:2.5"/>`;
  for (let i = 0; i <= max * sub; i++) {
    const x = m + i * step, labelled = i % (sub === 4 ? 2 : 1) === 0;
    g += `<line class="tick" x1="${r1(x)}" y1="${base - 5}" x2="${r1(x)}" y2="${base + (labelled ? 8 : 5)}" style="stroke:var(--ink);stroke-width:1.6"/>`;
    if (labelled) g += `<text x="${r1(x)}" y="${base + 24}" text-anchor="middle" class="lbl dim">${frText(i, sub)}</text>`;
    for (let j = 0; j < (data[i] || 0); j++) g += `<circle class="pt" cx="${r1(x)}" cy="${base - 18 - j * 17}" r="6.5" style="fill:var(--grape);stroke:var(--ink);stroke-width:1.2"/>`;
  }
  return g + `<text x="${W / 2}" y="${H - 6}" text-anchor="middle" class="lbl">${title} (inches)</text></svg>`;
}
