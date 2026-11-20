export const R = x => +(+x).toPrecision(12);
export const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
export const pick = a => a[Math.floor(Math.random() * a.length)];
export const chance = p => Math.random() < p;
export function shuffle(a) {
a = a.slice();
for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
return a;
}
export const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
export const lcm = (a, b) => a / gcd(a, b) * b;
export const fmt = x => R(x).toLocaleString('en-US', { maximumFractionDigits: 6 });
export const plain = x => String(R(x));
export const places = x => { const s = plain(x); const i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; };
export const fixed = (x, p) => R(x).toFixed(p);
export const money = x => '$' + R(x).toFixed(2);
export const b = s => `<b>${s}</b>`;
export const k = s => `<span class="k">${s}</span>`; // key info, highlighted in "Help me read it"
export const way = (t, s) => ({ t, s });
export const NAMES = ['Ava', 'Leo', 'Maya', 'Sam', 'Zoe', 'Eli', 'Nora', 'Jay', 'Ivy', 'Max', 'Lily', 'Owen', 'Ruby', 'Finn', 'Mia', 'Theo'];
export const nm = () => pick(NAMES);
export function simp(n, d) { const g = gcd(n, d) || 1; return [n / g, d / g]; }
export const F = (n, d) => `<span class="fr"><span class="n">${n}</span><span class="d">${d}</span></span>`;
export const M = (w, n, d) => w ? (n ? `${w}<span class="mxs"></span>${F(n, d)}` : `${w}`) : F(n, d);
export function fr(n, d, { mixed = true, simplify = true } = {}) {
if (simplify) [n, d] = simp(n, d);
if (n === 0) return '0';
if (d === 1) return `${n}`;
if (mixed && n > d) return M(Math.floor(n / d), n % d, d);
return F(n, d);
}
export const frText = (n, d) => { [n, d] = simp(n, d); if (d === 1) return `${n}`; if (n > d) return `${Math.floor(n / d)} ${n % d}/${d}`; return `${n}/${d}`; };
export const num = v => ({ kind: 'num', value: R(v) });
export const frac = (n, d) => { [n, d] = simp(n, d); return { kind: 'frac', n, d }; };
export const point = (x, y) => ({ kind: 'point', x, y });
export function choice(correct, distractors, { keepOrder = false, all = null } = {}) {
if (all) return { kind: 'choice', options: all, correct: all.indexOf(correct) };
const opts = [correct];
for (const d of distractors) if (d !== correct && !opts.includes(d)) opts.push(d);
const options = keepOrder ? opts : shuffle(opts.slice(0, 4));
return { kind: 'choice', options, correct: options.indexOf(correct) };
}
export function answerHTML(a) {
if (a.kind === 'num') return fmt(a.value);
if (a.kind === 'frac') return fr(a.n, a.d);
if (a.kind === 'choice') return a.options[a.correct];
if (a.kind === 'point') return `(${a.x}, ${a.y})`;
return '';
}
export function check(a, input) {
if (a.kind === 'num') {
const s = String(input ?? '').trim();
if (!s || s === '.' ) return { empty: true, msg: 'Type your answer first.' };
const v = Number(s);
if (!Number.isFinite(v)) return { empty: true, msg: 'That number looks unfinished.' };
return { ok: Math.abs(v - a.value) < 1e-9 };
}
if (a.kind === 'frac') {
const w = input?.w ? parseInt(input.w, 10) : 0;
const nS = input?.n ?? '', dS = input?.d ?? '';
if (!input?.w && !nS && !dS) return { empty: true, msg: 'Type your answer first.' };
if ((nS && !dS) || (!nS && dS)) return { empty: true, msg: 'Fill in both the top and the bottom of the fraction.' };
let n = nS ? parseInt(nS, 10) : 0, d = dS ? parseInt(dS, 10) : 1;
if (d === 0) return { empty: true, msg: 'The bottom of a fraction can’t be 0.' };
const top = w * d + n;
const ok = top * a.d === a.n * d;
let note = '';
if (ok && nS) {
const simplest = gcd(n, d) === 1 && n < d;
if (!simplest) note = `Simplest form: ${fr(a.n, a.d)}`;
}
return { ok, note };
}
if (a.kind === 'choice') {
if (input === null || input === undefined) return { empty: true, msg: 'Pick an answer.' };
return { ok: input === a.correct };
}
if (a.kind === 'point') {
if (!input) return { empty: true, msg: 'Tap the grid to place your point.' };
return { ok: input.x === a.x && input.y === a.y };
}
return { ok: false };
}
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
export const splitPV = n => { const s = String(n); return s.split('').map((d, i) => +d * 10 ** (s.length - 1 - i)).filter(v => v); };
export function column(rows, op, result, notes = []) {
const w = Math.max(...rows.map(r => r.length), result.length) + 2;
let lines = rows.map((r, i) => {
const pre = i === rows.length - 1 ? op + ' ' : '  ';
return (pre + r.padStart(w - 2)) + (notes[i] ? `   <span class="note">${notes[i]}</span>` : '');
});
lines.push('<span class="rule">' + '‾'.repeat(w).replace(/‾/g, '─') + '</span>');
lines.push(('  ' + result.padStart(w - 2)));
return `<pre class="col">${lines.join('\n')}</pre>`;
}
export const alignDec = (xs) => { const p = Math.max(...xs.map(places)); return { p, s: xs.map(x => fixed(x, p)) }; };
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
for (let j = 0; j < c; j++) s += `<text x="${x}" y="${base - 10 - j * 15}" text-anchor="middle" class="xm">✕</text>`;
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
export function table(head, rows, { cls = '' } = {}) {
return `<table class="tbl ${cls}"><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
}
