// Small helpers shared by the level 1 test files (tests/level1.*.js). Not a test file itself.
import assert from 'node:assert/strict';

export const strip = s => String(s ?? '').replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, '');
export const js = s => s.replace(/,/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
export const isMath = s => /^\d+(\s*[+\-*/]\s*\d+)*$/.test(s.trim());
export const evalMath = s => { assert.match(s, /^[\d\s+\-*/().]+$/, `not plain arithmetic: ${s}`); return Function(`return (${s})`)(); };
export const sum = xs => xs.reduce((s, x) => s + x, 0);
export const digits = n => [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10];
export const numsIn = s => (strip(s).replace(/(\d),(\d{3})/g, '$1$2').match(/\d+(?:\.\d+)?/g) || []).map(Number);
export function roundTo(n, to) { const lo = n - n % to, hi = lo + to; return n - lo < hi - n ? lo : hi; }
export const evenOdd = n => (n % 2 ? 'Odd' : 'Even');
// Exactly one of the listed options must satisfy a property, and it must be the one marked correct.
export const only = (hits, a, where, why) => assert.deepEqual(hits, [a.options[a.correct]], `${where}: exactly the marked option must ${why}`);
// The value of an option written as plain arithmetic ("34 + 58") or a plain number.
export const valueOf = o => evalMath(js(strip(o)));
// Every integer-looking number a tag attribute list carries, e.g. points="10,20 30,40".
export const attrNums = (svg, name) => [...svg.matchAll(new RegExp(`${name}="([^"]*)"`, 'g'))].map(m => m[1]);
