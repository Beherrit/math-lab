// Level 6 figure for comparing two groups: two dot plots on one shared number line. Tick labels use the "tk" class, like the graph axes.
const W = 320, M = 24;
export function dotPlots(A, B, lo, hi) {
  const px = v => M + (v - lo) / (hi - lo) * (W - 2 * M), rows = [[A, 74, 'var(--grape)'], [B, 150, 'var(--ink)']];
  let g = `<svg class="viz shape" viewBox="0 0 ${W} 178" role="img" aria-label="two dot plots, one above the other, on the same number line" style="max-width:${W}px">`;
  for (const [data, y, fill] of rows) {
    g += `<line x1="${M - 8}" y1="${y}" x2="${W - M + 8}" y2="${y}" stroke="var(--ink)" stroke-width="2"/>`;
    const stack = new Map();
    for (const v of data) { const k = stack.get(v) || 0; stack.set(v, k + 1); g += `<circle cx="${px(v).toFixed(1)}" cy="${y - 9 - k * 13}" r="5.5" fill="${fill}"/>`; }
  }
  for (let v = lo; v <= hi; v += (hi - lo > 24 ? 4 : 2)) for (const y of [74, 150]) g += `<line x1="${px(v)}" y1="${y}" x2="${px(v)}" y2="${y + 5}" stroke="var(--ink)" stroke-width="1.5"/><text x="${px(v)}" y="${y + 17}" text-anchor="middle" class="tk">${v}</text>`;
  return g + '</svg>';
}
