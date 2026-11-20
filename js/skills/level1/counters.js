// Level 1 counter pictures: counters in pairs, and rows and columns of counters (an array).
const open = (w, h, label, extra = '') => `<svg class="viz fbar" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="max-width:${w}px"${extra}>`;
const dot = (x, y) => `<circle class="dot" cx="${x}" cy="${y}" r="9" style="fill:var(--fbar-on);stroke:var(--ink);stroke-width:1.5"/>`;

// n counters, shared into pairs. A pair has a frame round it; a counter with no partner has none.
export function pairDots(n) {
  const per = 5, rows = Math.ceil(Math.ceil(n / 2) / per), W = per * 58 + 8, H = rows * 38 + 8;
  let g = open(W, H, 'counters sorted into pairs');
  for (let i = 0; i < Math.ceil(n / 2); i++) {
    const x = 4 + (i % per) * 58, y = 4 + Math.floor(i / per) * 38, two = 2 * i + 1 < n;
    if (two) g += `<rect x="${x}" y="${y}" width="50" height="30" rx="14" style="fill:none;stroke:var(--grape);stroke-width:2"/>`;
    g += dot(x + (two ? 15 : 25), y + 15) + (two ? dot(x + 35, y + 15) : '');
  }
  return g + '</svg>';
}

// r rows of c counters. `hidden` rows at the bottom are covered by a grey card with a question mark.
export function dotArray(r, c, hidden = 0) {
  const gap = 30, W = c * gap + 12, H = r * gap + 12 + (hidden ? 4 : 0), shown = r - hidden;
  let g = open(W, H, `an array of counters in rows and columns${hidden ? ', the last rows covered' : ''}`, ` data-hidden="${hidden}"`);
  for (let i = 0; i < shown; i++) for (let j = 0; j < c; j++) g += dot(6 + gap / 2 + j * gap, 6 + gap / 2 + i * gap);
  if (hidden) g += `<rect x="4" y="${6 + shown * gap}" width="${W - 8}" height="${hidden * gap - 2}" rx="8" style="fill:var(--line);stroke:var(--ink-2);stroke-width:1.5"/><text x="${W / 2}" y="${6 + shown * gap + hidden * gap / 2 + 6}" text-anchor="middle" class="lbl strong">?</text>`;
  return g + '</svg>';
}
