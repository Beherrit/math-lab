// SVG / HTML diagrams: fraction bars, number lines, place-value charts, boxes, grids, plots.
import { R, fmt, places, plain, fixed } from './math.js';
import { frText } from './text.js';
const svgOpen = (w, h, label, cls = '') => `<svg class="viz ${cls}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="max-width:${w}px">`;
export function fracBar(n, d, { label = '', w = 240 } = {}) {
const bars = Math.max(1, Math.ceil(n / d)); const h = 26, gap = 8;
const H = bars * (h + gap) + (label ? 18 : 0);
let s = svgOpen(w + 4, H, `${n} of ${d} equal parts shaded`, 'fbar');
for (let bi = 0; bi < bars; bi++)
for (let i = 0; i < d; i++) {
const on = bi * d + i < n;
s += `<rect x="${2 + i * w / d}" y="${2 + bi * (h + gap)}" width="${w / d}" height="${h}" class="${on ? 'on' : 'off'}"/>`;
}
if (label) s += `<text x="${w / 2 + 2}" y="${H - 3}" text-anchor="middle" class="lbl">${label}</text>`;
return s + '</svg>';
}
export function numberLine(lo, hi, x, { loL, hiL, xL, midL } = {}) {
const W = 300, H = 74, m = 26, y = 44;
const px = v => m + (v - lo) / (hi - lo) * (W - 2 * m);
let s = svgOpen(W, H, `number line from ${loL} to ${hiL}`, 'nline');
s += `<line x1="${m - 8}" y1="${y}" x2="${W - m + 8}" y2="${y}" class="axis"/>`;
for (let i = 0; i <= 10; i++) { const v = lo + (hi - lo) * i / 10; s += `<line x1="${px(v)}" y1="${y - (i % 5 ? 5 : 9)}" x2="${px(v)}" y2="${y + (i % 5 ? 5 : 9)}" class="tick"/>`; }
s += `<text x="${px(lo)}" y="${y + 24}" text-anchor="middle" class="lbl">${loL}</text>`;
s += `<text x="${px(hi)}" y="${y + 24}" text-anchor="middle" class="lbl">${hiL}</text>`;
if (midL) s += `<text x="${px((lo + hi) / 2)}" y="${y + 24}" text-anchor="middle" class="lbl dim">${midL}</text>`;
s += `<circle cx="${px(x)}" cy="${y}" r="7" class="dot"/>`;
s += `<text x="${Math.min(Math.max(px(x), 30), W - 30)}" y="${y - 16}" text-anchor="middle" class="lbl strong">${xL}</text>`;
return s + '</svg>';
}
const PLACE = { 6: 'millions', 5: 'hundred thousands', 4: 'ten thousands', 3: 'thousands', 2: 'hundreds', 1: 'tens', 0: 'ones', '-1': 'tenths', '-2': 'hundredths', '-3': 'thousandths', '-4': 'ten-thousandths', '-5': 'hundred-thousandths' };
export const placeName = p => PLACE[p];
function digitAt(x, p, minP) {
const s = R(x).toFixed(Math.max(0, -minP));
const [ip, fp = ''] = s.split('.');
if (p >= 0) { const i = ip.length - 1 - p; if (i < 0) return ''; return ip[i]; }
return fp[-p - 1] ?? '';
}
export function pvChart(rows, { maxP, minP } = {}) {
const mags = rows.map(r => Math.floor(Math.log10(Math.max(Math.abs(r.x), 1))));
maxP = maxP ?? Math.max(0, ...mags);
minP = minP ?? -Math.max(0, ...rows.map(r => r.dp ?? places(r.x)));
const cols = []; for (let p = maxP; p >= minP; p--) cols.push(p);
let h = '<table class="pv"><thead><tr><th></th>';
for (const p of cols) { h += `<th>${PLACE[p]}</th>`; if (p === 0 && minP < 0) h += '<th class="pt"></th>'; }
h += '</tr></thead><tbody>';
for (const r of rows) {
const dp = r.dp ?? places(r.x);
h += `<tr><td class="rl">${r.label ?? ''}</td>`;
for (const p of cols) {
let d = p < -dp ? '' : digitAt(r.x, p, minP);
if (p > 0 && d && Math.abs(r.x) < 10 ** p) d = '';
h += `<td class="${r.hl === p ? 'hl' : ''}">${d}</td>`;
if (p === 0 && minP < 0) h += `<td class="pt">${dp > 0 ? '.' : ''}</td>`;
}
h += '</tr>';
}
return h + '</tbody></table>';
}
export function areaModel(aParts, bParts) {
let h = '<table class="area"><tr><th>×</th>' + aParts.map(a => `<th>${fmt(a)}</th>`).join('') + '</tr>';
for (const bp of bParts) h += `<tr><th>${fmt(bp)}</th>` + aParts.map(a => `<td>${fmt(a * bp)}</td>`).join('') + '</tr>';
return h + '</table>';
}
export function prism(l, w, h, { grid = false, labels = null, unit = '' } = {}) {
const W = 300, H = 230;
const kx = 0.5, ky = 0.38;
const s = Math.min(190 / (l + kx * w), 160 / (h + ky * w));
const ox = (W - (l + kx * w) * s) / 2, oy = 25 + ky * w * s;
const dx = kx * w * s, dy = -ky * w * s;
const P = (x, y) => `${(ox + x).toFixed(1)},${(oy + y).toFixed(1)}`;
const fw = l * s, fh = h * s;
let g = svgOpen(W, H, `box ${l} by ${w} by ${h}`, 'prism');
g += `<polygon points="${P(0, 0)} ${P(dx, dy)} ${P(fw + dx, dy)} ${P(fw, 0)}" class="top"/>`;
g += `<polygon points="${P(fw, 0)} ${P(fw + dx, dy)} ${P(fw + dx, fh + dy)} ${P(fw, fh)}" class="side"/>`;
g += `<rect x="${ox}" y="${oy}" width="${fw}" height="${fh}" class="front"/>`;
if (grid) {
let gl = '';
for (let i = 1; i < l; i++) { gl += `<line x1="${ox + i * s}" y1="${oy}" x2="${ox + i * s}" y2="${oy + fh}"/>`; gl += `<line x1="${ox + i * s}" y1="${oy}" x2="${ox + i * s + dx}" y2="${oy + dy}"/>`; }
for (let j = 1; j < h; j++) { gl += `<line x1="${ox}" y1="${oy + j * s}" x2="${ox + fw}" y2="${oy + j * s}"/>`; gl += `<line x1="${ox + fw}" y1="${oy + j * s}" x2="${ox + fw + dx}" y2="${oy + j * s + dy}"/>`; }
for (let k2 = 1; k2 < w; k2++) { const ex = dx * k2 / w, ey = dy * k2 / w; gl += `<line x1="${ox + ex}" y1="${oy + ey}" x2="${ox + fw + ex}" y2="${oy + ey}"/>`; gl += `<line x1="${ox + fw + ex}" y1="${oy + ey}" x2="${ox + fw + ex}" y2="${oy + fh + ey}"/>`; }
g += `<g class="grid">${gl}</g>`;
}
const L = labels || [l, w, h].map(v => `${v}${unit ? ' ' + unit : ''}`);
g += `<text x="${ox + fw / 2}" y="${oy + fh + 20}" text-anchor="middle" class="lbl">${L[0]}</text>`;
g += `<text x="${ox + fw + dx / 2 + 10}" y="${oy + fh + dy / 2 + 14}" text-anchor="start" class="lbl">${L[1]}</text>`;
g += `<text x="${ox - 8}" y="${oy + fh / 2 + 5}" text-anchor="end" class="lbl">${L[2]}</text>`;
return g + '</svg>';
}
export const PLANE = { W: 320, m: 30 };
export function plane({ pts = [], max = 10, interactive = false, path = null } = {}) {
const { W, m } = PLANE; const u = (W - m - 14) / max;
const X = x => m + x * u, Y = y => W - m - y * u;
let s = `<svg class="viz plane${interactive ? ' tap' : ''}" viewBox="0 0 ${W} ${W}" role="img" aria-label="coordinate grid" data-max="${max}" style="max-width:${W}px">`;
for (let i = 0; i <= max; i++) {
s += `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(max)}" class="gl"/>`;
s += `<line x1="${X(0)}" y1="${Y(i)}" x2="${X(max)}" y2="${Y(i)}" class="gl"/>`;
s += `<text x="${X(i)}" y="${Y(0) + 17}" text-anchor="middle" class="tk">${i}</text>`;
if (i) s += `<text x="${X(0) - 8}" y="${Y(i) + 4}" text-anchor="end" class="tk">${i}</text>`;
}
s += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(max) + 8}" y2="${Y(0)}" class="ax"/><line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(max) - 8}" class="ax"/>`;
s += `<text x="${X(max) + 6}" y="${Y(0) - 6}" class="axn">x</text><text x="${X(0) + 6}" y="${Y(max) - 2}" class="axn">y</text>`;
if (path) s += `<polyline points="${path.map(p => `${X(p.x)},${Y(p.y)}`).join(' ')}" class="path"/>`;
for (const p of pts) {
s += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="6" class="pt ${p.cls || ''}"/>`;
if (p.label) s += `<text x="${X(p.x) + 9}" y="${Y(p.y) - 8}" class="ptl">${p.label}</text>`;
}
s += `<g class="cursor"></g>`;
return s + '</svg>';
}
export function linePlot(den, maxNum, data, { title = '', unit = '' } = {}) {
const W = 320, H = 190, m = 22, base = 150;
const n = maxNum; const step = (W - 2 * m) / n;
let s = svgOpen(W, H, `line plot ${title}`, 'lplot');
s += `<line x1="${m - 6}" y1="${base}" x2="${W - m + 6}" y2="${base}" class="axis"/>`;
for (let i = 0; i <= n; i++) {
const x = m + i * step;
s += `<line x1="${x}" y1="${base - 5}" x2="${x}" y2="${base + 5}" class="tick"/>`;
s += `<text x="${x}" y="${base + 22}" text-anchor="middle" class="tk">${frText(i, den)}</text>`;
const c = data[i] || 0;
for (let j = 0; j < c; j++) s += `<text x="${x}" y="${base - 10 - j * 15}" text-anchor="middle" class="xm">X</text>`;
}
if (title) s += `<text x="${W / 2}" y="${H - 4}" text-anchor="middle" class="lbl">${title}${unit ? ` (${unit})` : ''}</text>`;
return s + '</svg>';
}
export function fracArea(n1, d1, n2, d2) {
const S = 200, cw = S / d2, rh = S / d1;
let s = svgOpen(S + 4, S + 4, `area model ${n1}/${d1} by ${n2}/${d2}`, 'farea');
for (let r = 0; r < d1; r++) for (let c = 0; c < d2; c++) {
const a = r < n1, bb = c < n2;
s += `<rect x="${2 + c * cw}" y="${2 + r * rh}" width="${cw}" height="${rh}" class="${a && bb ? 'both' : a ? 'rowon' : bb ? 'colon' : 'off'}"/>`;
}
return s + '</svg>';
}
// Number line that includes negatives. points: [{ v, label, cls }]. Whole-number ticks every `step`.
export function signedLine(lo, hi, { points = [], step = 1 } = {}) {
const W = 320, H = 78, m = 24, y = 42;
const px = v => m + (v - lo) / (hi - lo) * (W - 2 * m);
const lab = v => (v < 0 ? '−' + -v : String(v));
let s = svgOpen(W, H, `number line from ${lab(lo)} to ${lab(hi)}`, 'nline sline');
s += `<line x1="${m - 8}" y1="${y}" x2="${W - m + 8}" y2="${y}" class="axis"/>`;
for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) {
s += `<line x1="${px(v)}" y1="${y - (v === 0 ? 10 : 6)}" x2="${px(v)}" y2="${y + (v === 0 ? 10 : 6)}" class="tick"/>`;
s += `<text x="${px(v)}" y="${y + 24}" text-anchor="middle" class="lbl${v === 0 ? ' strong' : ' dim'}">${lab(R(v))}</text>`;
}
for (const p of points) {
s += `<circle cx="${px(p.v)}" cy="${y}" r="7" class="dot ${p.cls || ''}"/>`;
if (p.label) s += `<text x="${Math.min(Math.max(px(p.v), 24), W - 24)}" y="${y - 16}" text-anchor="middle" class="lbl strong">${p.label}</text>`;
}
return s + '</svg>';
}
