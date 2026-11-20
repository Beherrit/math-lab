// A ruler picture: whole-unit marks along the bottom, one or more bars above it. Bars are measured from the 0 mark at the left.
const U = { cm: 21, in: 46 }, X0 = 14;
export const rulerScale = unit => ({ U: U[unit], X0 });
export const UNIT = { cm: { suffix: 'cm', one: 'centimeter', many: 'centimeters' }, in: { suffix: 'inches', one: 'inch', many: 'inches' } };
const MAX = { cm: 15, in: 6 };

// bars: [{ from, to, label }]. The label (a letter) sits just past the right end of the bar.
export function ruler(unit, bars) {
  const u = U[unit], max = MAX[unit], W = 2 * X0 + max * u + 10, top = 8, gap = 26, y0 = top + bars.length * gap + 4, H = y0 + 46;
  let g = `<svg class="viz fbar" viewBox="0 0 ${W} ${H}" role="img" aria-label="a ruler with a bar above it" data-unit="${unit}" style="max-width:${W}px">`;
  bars.forEach((bar, i) => {
    g += `<rect class="obj" x="${X0 + bar.from * u}" y="${top + i * gap}" width="${(bar.to - bar.from) * u}" height="18" rx="4" style="fill:var(--hi);stroke:var(--ink);stroke-width:2"/>`;
    if (bar.label) g += `<text x="${X0 + bar.to * u + 7}" y="${top + i * gap + 14}" class="lbl strong">${bar.label}</text>`;
  });
  g += `<rect x="${X0 - 6}" y="${y0}" width="${max * u + 12}" height="36" rx="5" style="fill:var(--card);stroke:var(--ink);stroke-width:2"/>`;
  for (let k = 0; k <= max; k++) {
    g += `<line x1="${X0 + k * u}" y1="${y0}" x2="${X0 + k * u}" y2="${y0 + (k % 5 === 0 || unit === 'in' ? 14 : 10)}" style="stroke:var(--ink);stroke-width:2"/>`;
    g += `<text x="${X0 + k * u}" y="${y0 + 30}" text-anchor="middle" class="lbl dim">${k}</text>`;
  }
  return g + '</svg>';
}
