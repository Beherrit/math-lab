import { way, b } from '../util.js';
export const START = [1, 2, 5, 10];
export const NEXT = [3, 4, 9, 11, 6, 8, 7, 12];
export const fkey = (a, c) => a <= c ? `${a}x${c}` : `${c}x${a}`;
export const ALL_KEYS = (() => { const s = []; for (let a = 1; a <= 12; a++) for (let c = a; c <= 12; c++) s.push(`${a}x${c}`); return s; })();
export const SOLID = 3; // box at which a fact counts as "solid"
export function pool(st, table = null) {
const set = new Set();
const tables = table ? [table] : (st.settings.gradual ? st.unlocked : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
for (const t of tables) for (let n = 1; n <= 12; n++) set.add(fkey(t, n));
return [...set];
}
const W = [9, 5, 3, 2, 1, 0.35];
export function pickFact(st, recent, table = null, retry = []) {
if (retry.length) return retry.shift();
const keys = pool(st, table).filter(k => !recent.includes(k));
let total = 0; const ws = keys.map(k => { const r = st.facts[k]; const w = r ? W[r.b] : 6; total += w; return w; });
let x = Math.random() * total; let key = keys[0];
for (let i = 0; i < keys.length; i++) { x -= ws[i]; if (x <= 0) { key = keys[i]; break; } }
return key;
}
export function makeFact(st, key, table = null) {
let [a, c] = key.split('x').map(Number);
if (table) { if (a !== table) [a, c] = [c, a]; if (Math.random() < 0.3) [a, c] = [c, a]; }
else if (Math.random() < 0.5) [a, c] = [c, a];
const r = st.facts[key];
const missing = r && r.b >= 3 && Math.random() < 0.25;
return { fact: true, key, a, c, missing };
}
export function recordFact(st, key, ok, ms, missing) {
const r = st.facts[key] ||= { b: 0, n: 0, c: 0, t: 0 };
r.n++; if (ok) r.c++;
const fast = ms <= (missing ? 7000 : 4500);
if (ok && fast) r.b = Math.min(5, r.b + 1);
else if (ok) r.b = Math.max(r.b, 1);
else r.b = 0;
r.t = r.t ? Math.round(r.t * 0.7 + ms * 0.3) : Math.round(ms);
}
export function tryUnlock(st) {
if (!st.settings.gradual) return null;
const ks = pool(st);
const solid = ks.filter(k => (st.facts[k]?.b || 0) >= 2).length;
if (solid / ks.length >= 0.75) {
const next = NEXT.find(t => !st.unlocked.includes(t));
if (next) { st.unlocked.push(next); return next; }
}
return null;
}
export const solidCount = st => ALL_KEYS.filter(k => (st.facts[k]?.b || 0) >= SOLID).length;
export const tableSolid = (st, t) => { for (let n = 1; n <= 12; n++) if ((st.facts[fkey(t, n)]?.b || 0) < SOLID) return false; return true; };
const EASE = [1, 10, 2, 5, 11, 9, 4, 3, 6, 8, 12, 7];
export function strategy(a, c) {
const f = EASE.find(x => x === a || x === c); const o = f === a ? c : a; const p = a * c;
switch (f) {
case 1: return `Anything times 1 stays the same: ${o} × 1 = ${p}.`;
case 10: return `Times 10: just put a 0 on the end. ${o} → ${p}.`;
case 2: return `Times 2 is a double: ${o} + ${o} = ${p}.`;
case 5: return `Times 5 is half of times 10: ${o} × 10 = ${o * 10}, and half of that is ${p}.`;
case 11: return o <= 9 ? `11 times a one-digit number: write the digit twice → ${p}.` : `Times 11 is times 10 plus one more group: ${o * 10} + ${o} = ${p}.`;
case 9: return `Times 9 is times 10 minus one group: ${o * 10} − ${o} = ${p}.`;
case 4: return `Times 4 is double, then double again: ${o} → ${o * 2} → ${p}.`;
case 3: return `Times 3 is a double plus one more group: ${o * 2} + ${o} = ${p}.`;
case 6: return `Times 6 is times 5 plus one more group: ${o * 5} + ${o} = ${p}.`;
case 8: return `Times 8 is double, double, double: ${o} → ${o * 2} → ${o * 4} → ${p}.`;
case 12: return `Times 12 is times 10 plus times 2: ${o * 10} + ${o * 2} = ${p}.`;
default: return `Times 7 is times 5 plus times 2: ${o * 5} + ${o * 2} = ${p}.`;
}
}
export function factWays(a, c, missing) {
const p = a * c; const small = Math.min(a, c), big = Math.max(a, c);
const ways = [];
if (missing) ways.push(way('Think of a fact you know', [`Ask: ${a} times what makes ${p}?`, `That's the same as ${p} ÷ ${a} = ${b(c)}.`]));
ways.push(way('Use a trick', [strategy(a, c)]));
ways.push(way(`Count by ${big}s`, [Array.from({ length: small }, (_, i) => (i === small - 1 ? b(big * (i + 1)) : big * (i + 1))).join(', '), `That's ${small} jumps of ${big}, so ${small} × ${big} = ${b(p)}.`]));
ways.push(way('Flip it', [`${a} × ${c} is the same as ${c} × ${a}. If one way is easier, use that one!`]));
return ways;
}
export const TABLE_TIPS = {
1: 'Anything times 1 stays exactly the same.',
2: 'Times 2 is a double. 7 × 2 = 7 + 7.',
3: 'Times 3 is a double plus one more group. 3 × 8 = 16 + 8.',
4: 'Times 4 is double, then double again. 4 × 6: 6 → 12 → 24.',
5: 'Times 5 always ends in 0 or 5. It’s half of times 10: 5 × 8 = half of 80.',
6: 'Times 6 is times 5 plus one more group. 6 × 7 = 35 + 7.',
7: 'Times 7 is times 5 plus times 2. 7 × 8 = 40 + 16. (And 7 × 8 = 56 — think “5, 6, 7, 8”: 56 = 7 × 8!)',
8: 'Times 8 is double, double, double. 8 × 6: 6 → 12 → 24 → 48.',
9: 'Times 9 is times 10 minus one group. 9 × 7 = 70 − 7. The digits always add up to 9: 63 → 6 + 3 = 9.',
10: 'Times 10: just put a 0 on the end.',
11: 'Up to 9: write the digit twice (11 × 4 = 44). After that: times 10 plus one more group.',
12: 'Times 12 is times 10 plus times 2. 12 × 7 = 70 + 14.',
};
