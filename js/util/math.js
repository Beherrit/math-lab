// Pure number helpers: random picks, rounding, gcd/lcm, number formatting.
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
// Display minus is U+2212; typed input uses the ASCII hyphen and is parsed separately.
export const fmt = x => R(x).toLocaleString('en-US', { maximumFractionDigits: 6 }).replace('-', '−');
export const plain = x => String(R(x));
export const places = x => { const s = plain(x); const i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; };
export const fixed = (x, p) => R(x).toFixed(p);
export const money = x => '$' + R(x).toFixed(2);
export function simp(n, d) { const g = gcd(n, d) || 1; return [n / g, d / g]; }
export const splitPV = n => { const s = String(n); return s.split('').map((d, i) => +d * 10 ** (s.length - 1 - i)).filter(v => v); };
export const alignDec = (xs) => { const p = Math.max(...xs.map(places)); return { p, s: xs.map(x => fixed(x, p)) }; };
