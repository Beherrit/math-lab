// Scaled graphs: a picture graph (each circle stands for `key`, a half circle for half of it) and a bar graph with a scale.
const open = (w, h, label) => `<svg class="viz fbar" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="max-width:${w}px">`;
const T = (x, y, s, cls = 'lbl', anchor = 'start') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${s}</text>`;

// cats: names, vals: numbers (a multiple of key/2). Each row is a name and a line of circles. The key says what one circle is worth.
export function pictureGraph({ title, cats, vals, key, unit }) {
  const rowH = 30, H = 46 + cats.length * rowH + 26;
  let g = open(340, H, `picture graph: ${title}`) + T(170, 20, title, 'lbl', 'middle');
  cats.forEach((c, i) => {
    const y = 46 + i * rowH, n = vals[i] / key;
    g += T(6, y + 5, c) + `<line x1="6" y1="${y + 15}" x2="334" y2="${y + 15}" style="stroke:var(--ink);stroke-width:.4;opacity:.4"/>`;
    for (let j = 0; j < Math.floor(n); j++) g += `<circle class="sym" cx="${122 + j * 20}" cy="${y}" r="8" style="fill:var(--fbar-on);stroke:var(--ink);stroke-width:1.5"/>`;
    if (n % 1) g += `<path class="sym half" d="M${122 + Math.floor(n) * 20} ${y - 8}A8 8 0 0 0 ${122 + Math.floor(n) * 20} ${y + 8}Z" style="fill:var(--fbar-on);stroke:var(--ink);stroke-width:1.5"/>`;
  });
  return g + T(6, H - 8, `Each circle stands for ${key} ${unit}.`, 'lbl dim') + '</svg>';
}

// A vertical bar graph. `step` is the gap between grid lines (and what each is worth), `max` the top line.
export function barGraph({ title, cats, vals, step, max }) {
  const L = 52, R = 332, top = 34, base = 200, H = 236, k = (base - top) / max, slot = (R - L) / cats.length, bw = Math.min(40, slot * 0.6);
  let g = open(340, H, `bar graph: ${title}`) + T(170, 18, title, 'lbl', 'middle');
  for (let v = 0; v <= max; v += step) {
    const y = (base - v * k).toFixed(1);
    g += `<line class="gl" data-v="${v}" x1="${L}" y1="${y}" x2="${R}" y2="${y}" style="stroke:var(--ink);stroke-width:${v ? 0.6 : 2};opacity:${v ? 0.45 : 1}"/>` + T(L - 6, +y + 4, v, 'lbl dim', 'end');
  }
  cats.forEach((c, i) => {
    const x = L + slot * i + (slot - bw) / 2, h = vals[i] * k;
    g += `<rect class="bar" x="${x.toFixed(1)}" y="${(base - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" style="fill:var(--fbar-on)"/>`;
    g += T((x + bw / 2).toFixed(1), base + 18, c, 'lbl dim cat', 'middle');
  });
  return g + '</svg>';
}
