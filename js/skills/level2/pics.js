// Level 2 pictures: dot arrays, equal groups, labelled rectangles and fraction number lines.
const open = (w, h, label, cls) => `<svg class="viz ${cls}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="max-width:${w}px">`;
const dot = (x, y, alt) => `<circle cx="${x}" cy="${y}" r="5.5" style="fill:var(${alt ? '--hi' : '--fbar-on'});stroke:var(--ink);stroke-width:1.2"/>`;

// An array: `rows` rows of `cols` dots. With `split`, the rows after the first `split` get a second colour and a gap.
export function dots(rows, cols, { split = 0 } = {}) {
  const s = Math.min(22, Math.floor(290 / cols)), gap = split ? 8 : 0;
  let g = open(cols * s + 8, rows * s + 8 + gap, `array of dots: ${rows} rows of ${cols}`, 'fbar');
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) g += dot(4 + s / 2 + c * s, 4 + s / 2 + r * s + (split && r >= split ? gap : 0), split && r >= split);
  return g + '</svg>';
}

// `g` boxes with `n` dots in each, plus `extra` loose dots underneath (the left over ones).
export function groups(g, n, extra = 0) {
  const per = n <= 4 ? n : Math.ceil(n / 2), s = 15, bw = per * s + 10, bh = Math.ceil(n / per) * s + 10;
  const perRow = Math.max(1, Math.min(g, Math.floor(300 / (bw + 8)))), lines = Math.ceil(g / perRow);
  const W = Math.max(perRow * (bw + 8), extra * s + 8) + 4, H = lines * (bh + 8) + (extra ? s + 8 : 0) + 4;
  let svg = open(W, H, `${g} equal groups of ${n}${extra ? ` and ${extra} left over` : ''}`, 'fbar');
  for (let i = 0; i < g; i++) {
    const x = 4 + (i % perRow) * (bw + 8), y = 4 + Math.floor(i / perRow) * (bh + 8);
    svg += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="8" class="off"/>`;
    for (let j = 0; j < n; j++) svg += dot(x + 5 + s / 2 + (j % per) * s, y + 5 + s / 2 + Math.floor(j / per) * s);
  }
  for (let j = 0; j < extra; j++) svg += dot(4 + s / 2 + j * s, H - s / 2 - 4, true);
  return svg + '</svg>';
}

// A rectangle w wide and h tall. `grid` draws the unit squares; `wl` and `hl` label the bottom and left sides.
export function rect(w, h, { grid = false, wl = '', hl = '' } = {}) {
  const u = Math.min(26, 220 / w, 150 / h), rw = w * u, rh = h * u, ox = hl ? 64 : 8, oy = 6;
  let g = open(ox + rw + 12, oy + rh + 28, `rectangle ${wl || w} by ${hl || h}`, 'fbar');
  g += `<rect x="${ox}" y="${oy}" width="${rw}" height="${rh}" class="on" style="fill-opacity:.3"/>`;
  if (grid) {
    let d = '';
    for (let i = 1; i < w; i++) d += `M${ox + i * u} ${oy}v${rh}`;
    for (let j = 1; j < h; j++) d += `M${ox} ${oy + j * u}h${rw}`;
    g += `<path d="${d}" style="stroke:var(--ink);stroke-width:1;fill:none"/>`;
  }
  if (wl) g += `<text x="${ox + rw / 2}" y="${oy + rh + 20}" text-anchor="middle" class="lbl">${wl}</text>`;
  if (hl) g += `<text x="${ox - 8}" y="${oy + rh / 2 + 5}" text-anchor="end" class="lbl">${hl}</text>`;
  return g + '</svg>';
}

// Number line from 0 to `max`, each whole cut into d equal parts, with a dot n parts from 0.
// `labels` writes every fraction under its tick (for worked solutions); otherwise the dot is marked "?".
export function fracLine(d, n, { max = 1, labels = false } = {}) {
  const W = 320, H = 84, m = 24, y = 40, px = i => m + i / (max * d) * (W - 2 * m);
  let g = open(W, H, `number line from 0 to ${max}, each whole cut into ${d} equal parts, with a dot`, 'nline');
  g += `<line x1="${m - 10}" y1="${y}" x2="${W - m + 10}" y2="${y}" class="axis"/>`;
  for (let i = 0; i <= max * d; i++) {
    const whole = i % d === 0, x = px(i);
    g += `<line x1="${x}" y1="${y - (whole ? 11 : 6)}" x2="${x}" y2="${y + (whole ? 11 : 6)}" class="tick"/>`;
    if (whole) g += `<text x="${x}" y="${y + 30}" text-anchor="middle" class="lbl">${i / d}</text>`;
    else if (labels) g += `<text x="${x}" y="${y + 28}" text-anchor="middle" class="lbl dim">${i}/${d}</text>`;
  }
  g += `<circle cx="${px(n)}" cy="${y}" r="7" class="dot"/>`;
  if (!labels) g += `<text x="${px(n)}" y="${y - 16}" text-anchor="middle" class="lbl strong">?</text>`;
  return g + '</svg>';
}

// An area model with the parts labelled but the partial products left as "?" (the question, not the answer).
export function areaBlank(aParts, bParts) {
  let h = '<table class="area"><tr><th>×</th>' + aParts.map(a => `<th>${a}</th>`).join('') + '</tr>';
  for (const bp of bParts) h += `<tr><th>${bp}</th>` + aParts.map(() => '<td>?</td>').join('') + '</tr>';
  return h + '</table>';
}
