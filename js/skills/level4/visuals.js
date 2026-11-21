// Diagrams used only by the Level 4 skills added in the second pass.
import { F, fmt, frText } from '../../util.js';

// A rectangle with fraction sides drawn on a grid of unit squares. Each unit is cut into ad columns and bd rows,
// so the shaded rectangle is (an) columns by (bn) rows of equal small pieces. a and b are [numerator, denominator], width and height.
export function sideGrid([an, ad], [bn, bd]) {
  const cols = Math.ceil(an / ad) * ad, rows = Math.ceil(bn / bd) * bd, m = 30;
  const cw = Math.min(26, 300 / cols), ch = Math.min(26, 170 / rows), W = cols * cw + 2 * m, H = rows * ch + 2 * m;
  let s = `<svg class="viz fbar" viewBox="0 0 ${W} ${H}" role="img" aria-label="rectangle ${frText(an, ad)} by ${frText(bn, bd)}" style="max-width:${W}px">`;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) s += `<rect x="${m + c * cw}" y="${m + r * ch}" width="${cw}" height="${ch}" class="${c < an && r < bn ? 'on' : 'off'}"/>`;
  for (let u = 0; u <= cols / ad; u++) s += `<line x1="${m + u * ad * cw}" y1="${m}" x2="${m + u * ad * cw}" y2="${m + rows * ch}" stroke="currentColor" stroke-width="2"/>`;
  for (let u = 0; u <= rows / bd; u++) s += `<line x1="${m}" y1="${m + u * bd * ch}" x2="${m + cols * cw}" y2="${m + u * bd * ch}" stroke="currentColor" stroke-width="2"/>`;
  s += `<text x="${m + an * cw / 2}" y="${m - 8}" text-anchor="middle" class="lbl">${frText(an, ad)}</text>`;
  s += `<text x="${m - 6}" y="${m + bn * ch / 2 + 4}" text-anchor="end" class="lbl">${frText(bn, bd)}</text>`;
  return s + '</svg>';
}

// Area model for (wa + na/da) x (wb + nb/db): four boxes. hide (0 to 3, row by row) shows a question mark in that box.
export function areaTable(A, B, hide = -1) {
  const cells = [fmt(A.w * B.w), F(A.n * B.w, A.d), F(A.w * B.n, B.d), F(A.n * B.n, A.d * B.d)].map((c, i) => (i === hide ? '<b>?</b>' : c));
  return `<table class="area"><tr><th>×</th><th>${A.w}</th><th>${F(A.n, A.d)}</th></tr>`
    + `<tr><th>${B.w}</th><td>${cells[0]}</td><td>${cells[1]}</td></tr><tr><th>${F(B.n, B.d)}</th><td>${cells[2]}</td><td>${cells[3]}</td></tr></table>`;
}
