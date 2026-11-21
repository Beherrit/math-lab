// Reading scales: a measuring jug (liquid level, vertical) and a pointer scale (mass, horizontal). Every tick carries data-v, the level is the line "lvl".
const open = (w, h, label) => `<svg class="viz fbar" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="max-width:${w}px">`;
const tick = (x1, y1, x2, y2, v) => `<line class="tick" data-v="${v}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:var(--ink);stroke-width:1.5"/>`;

// A jug holding `v` milliliters, marked from 0 to `max`, a tick every `step`, a number every `every`.
export function jug(v, max, step, every) {
  const top = 12, bot = 192, k = (bot - top) / max, y = x => bot - x * k;
  let g = open(190, 214, 'measuring jug with a scale in milliliters');
  g += `<rect x="40" y="${y(v)}" width="70" height="${bot - y(v)}" style="fill:var(--hi);fill-opacity:.55"/>`;
  g += `<path d="M40 ${top}V${bot}H110V${top}" style="fill:none;stroke:var(--ink);stroke-width:3"/>`;
  for (let t = 0; t <= max; t += step) {
    const long = t % every === 0;
    g += tick(110, y(t).toFixed(1), long ? 124 : 118, y(t).toFixed(1), t);
    if (long) g += `<text x="130" y="${(y(t) + 4).toFixed(1)}" class="lbl">${t}</text>`;
  }
  g += `<line class="lvl" x1="40" y1="${y(v).toFixed(1)}" x2="110" y2="${y(v).toFixed(1)}" style="stroke:var(--ink);stroke-width:3"/>`;
  return g + `<text x="150" y="208" class="lbl dim">mL</text></svg>`;
}

// A scale pointing at `v` grams along a line from 0 to `max`.
export function pointerScale(v, max, step, every) {
  const m = 26, W = 330, y = 56, x = t => m + t / max * (W - 2 * m);
  let g = open(W, 96, 'scale with a pointer, marked in grams');
  g += `<line x1="${m - 8}" y1="${y}" x2="${W - m + 8}" y2="${y}" style="stroke:var(--ink);stroke-width:2"/>`;
  for (let t = 0; t <= max; t += step) {
    const long = t % every === 0;
    g += tick(x(t).toFixed(1), y - (long ? 10 : 6), x(t).toFixed(1), y + (long ? 10 : 6), t);
    if (long) g += `<text x="${x(t).toFixed(1)}" y="${y + 28}" text-anchor="middle" class="lbl">${t}</text>`;
  }
  g += `<line class="lvl" x1="${x(v).toFixed(1)}" y1="14" x2="${x(v).toFixed(1)}" y2="${y}" style="stroke:var(--grape);stroke-width:3"/>`;
  g += `<polygon points="${(x(v) - 6).toFixed(1)},14 ${(x(v) + 6).toFixed(1)},14 ${x(v).toFixed(1)},28" style="fill:var(--grape)"/>`;
  return g + '<text x="300" y="14" class="lbl dim">g</text></svg>';
}
