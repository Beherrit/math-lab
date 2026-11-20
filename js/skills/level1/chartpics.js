import { cnt } from './words.js';
// Graph pictures: a bar graph with a scale, and a picture graph (one circle stands for 1, 2 or 5). Values are never written on the bars.
export const barPpu = step => ({ 1: 14, 2: 7, 5: 3.2, 10: 1.6 })[step];
const PLOT_H = 150, LEFT = 38, TOP = 26;
const text = (x, y, s, cls = 'lbl', anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${s}</text>`;

// cats and vals line up. step is the gap between grid lines (1, 2, 5 or 10).
export function barChart({ title, cats, vals, step }) {
  const ppu = barPpu(step), top = Math.ceil(Math.max(...vals) / step) * step, W = LEFT + cats.length * 62 + 10, H = TOP + PLOT_H + 40, base = TOP + PLOT_H;
  let g = `<svg class="viz fbar" viewBox="0 0 ${W} ${H}" role="img" aria-label="bar graph: ${title}" data-step="${step}" style="max-width:${W}px">${text(W / 2, 16, title, 'lbl strong')}`;
  for (let v = 0; v <= top; v += step) {
    g += `<line x1="${LEFT}" y1="${base - v * ppu}" x2="${W - 6}" y2="${base - v * ppu}" style="stroke:var(--line);stroke-width:${v ? 1 : 2.5}"/>${text(LEFT - 6, base - v * ppu + 4, v, 'lbl dim', 'end')}`;
  }
  cats.forEach((c, i) => {
    const x = LEFT + 10 + i * 62, h = vals[i] * ppu;
    g += `<rect class="bar" data-cat="${c}" x="${x}" y="${base - h}" width="42" height="${h}" rx="3" style="fill:var(--fbar-on);fill-opacity:.8;stroke:var(--ink);stroke-width:1.5"/>${text(x + 21, base + 16, c, 'lbl dim')}`;
  });
  return g + '</svg>';
}
// per is how many each circle stands for. Values are always whole circles (a multiple of per).
export function pictureGraph({ title, cats, vals, per }) {
  const rows = cats.length, W = 330, H = 40 + rows * 30, longest = Math.max(...vals) / per;
  const r = Math.min(9, (W - 110 - 8) / (2 * longest + 1) * 0.9);
  let g = `<svg class="viz fbar" viewBox="0 0 ${W} ${H}" role="img" aria-label="picture graph: ${title}" data-per="${per}" style="max-width:${W}px">${text(W / 2, 16, title, 'lbl strong')}`;
  cats.forEach((c, i) => {
    const y = 40 + i * 30;
    g += text(8, y + 5, c, 'lbl dim', 'start');
    for (let k = 0; k < vals[i] / per; k++) g += `<circle class="mk" data-cat="${c}" cx="${108 + r + k * (2 * r + 3)}" cy="${y}" r="${r}" style="fill:var(--fbar-on);stroke:var(--ink);stroke-width:1.5"/>`;
  });
  return g + text(W / 2, H - 4, `Key: each circle stands for ${cnt(per, 'vote')}`, 'lbl dim') + '</svg>';
}
