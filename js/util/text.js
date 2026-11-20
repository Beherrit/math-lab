// Small HTML snippets for problem text, steps, fractions and exponents.
import { pick, simp } from './math.js';
export const b = s => `<b>${s}</b>`;
export const k = s => `<span class="k">${s}</span>`; // key info, highlighted in "Help me read it"
export const way = (t, s) => ({ t, s });
export const NAMES = ['Ava', 'Leo', 'Maya', 'Sam', 'Zoe', 'Eli', 'Nora', 'Jay', 'Ivy', 'Max', 'Lily', 'Owen', 'Ruby', 'Finn', 'Mia', 'Theo'];
export const nm = () => pick(NAMES);
export const pow = (base, exp) => `${base}<sup>${exp}</sup>`;
export const F = (n, d) => `<span class="fr"><span class="n">${n}</span><span class="d">${d}</span></span>`;
export const M = (w, n, d) => w ? (n ? `${w}<span class="mxs"></span>${F(n, d)}` : `${w}`) : F(n, d);
export function fr(n, d, { mixed = true, simplify = true } = {}) {
if (d < 0) { n = -n; d = -d; }
if (n < 0) return '−' + fr(-n, d, { mixed, simplify });
if (simplify) [n, d] = simp(n, d);
if (n === 0) return '0';
if (d === 1) return `${n}`;
if (mixed && n > d) return M(Math.floor(n / d), n % d, d);
return F(n, d);
}
export const frText = (n, d) => {
if (n < 0) return '−' + frText(-n, d);
[n, d] = simp(n, d);
if (d === 1) return `${n}`;
if (n > d) return `${Math.floor(n / d)} ${n % d}/${d}`;
return `${n}/${d}`;
};
export function column(rows, op, result, notes = []) {
const w = Math.max(...rows.map(r => r.length), result.length) + 2;
let lines = rows.map((r, i) => {
const pre = i === rows.length - 1 ? op + ' ' : '  ';
return (pre + r.padStart(w - 2)) + (notes[i] ? `   <span class="note">${notes[i]}</span>` : '');
});
lines.push('<span class="rule">' + '─'.repeat(w) + '</span>');
lines.push(('  ' + result.padStart(w - 2)));
return `<pre class="col">${lines.join('\n')}</pre>`;
}
export function table(head, rows, { cls = '' } = {}) {
return `<table class="tbl ${cls}"><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
}
