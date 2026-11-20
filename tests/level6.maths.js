// Small arithmetic helpers for the level 6 tests, written apart from the generators they check.
import assert from 'node:assert/strict';

export const sum = xs => xs.reduce((s, v) => s + v, 0);
export const prod = xs => xs.reduce((s, v) => s * v, 1);
export const sorted = xs => xs.slice().sort((a, b) => a - b);
export const mean = xs => sum(xs) / xs.length;
export const median = xs => { const s = sorted(xs), h = s.length >> 1; return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
export const near = (a, b) => Math.abs(a - b) < 1e-9;
export const toNum = s => Number(String(s).replace(/−/g, '-').replace(/,/g, ''));
export const holds = (l, op, r) => ({ '<': l < r, '>': l > r, '≤': l <= r, '≥': l >= r })[op];
export const val = ([n, d]) => n / d;
export const mad = xs => mean(xs.map(v => Math.abs(v - mean(xs))));
// Evaluate plain arithmetic text such as "(1/2) ÷ (1/4)" or "−3 × 2".
export function evalText(src) {
  const e = String(src).replace(/−/g, '-').replace(/÷/g, '/').replace(/×/g, '*').replace(/,/g, '');
  assert.match(e, /^[0-9+\-*/(). ]+$/, `unexpected arithmetic text: ${src}`);
  return Function(`return ${e};`)();
}
// Evaluate text with single-letter variables, such as "1.05a", "3(p + n)" or "(f + r)d", at the given values.
export function evalVars(src, vars) {
  let e = String(src).replace(/−/g, '-').replace(/\s+/g, '').replace(/(\d|\)|[a-z])(?=[a-z(])/g, '$1*');
  for (const [name, v] of Object.entries(vars)) e = e.replaceAll(name, `(${v})`);
  assert.match(e, /^[0-9+\-*/().]+$/, `unexpected expression text: ${src}`);
  return Function(`return ${e};`)();
}
// Plain arithmetic that may contain absolute value bars, such as "|−4.5| + |2.5 − 6|".
export const evalAbs = src => evalText(String(src).replace(/\|([^|]+)\|/g, (_, e) => `(${Math.abs(evalText(e))})`));
