// Independent arithmetic for the Level 4 tests. Nothing here imports a generator.
export const close = (x, y) => Math.abs(x - y) < 1e-9;
export const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
export const lcm = (a, b) => a * b / gcd(a, b);
// Evaluate plain text such as "3 × (4 + 5) − 2", "10^3" or "2 × 1/10".
export const ev = s => Function(`return (${String(s).replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\^/g, '**').replace(/,/g, '').replace(/[[{]/g, '(').replace(/[\]}]/g, ')')})`)();
// Fractions as [top, bottom]; a mixed number { w, n, d } as one fraction.
export const frac = (n, d = 1) => [n, d];
export const mixedOf = t => [t.w * t.d + t.n, t.d];
export const add = (x, y) => [x[0] * y[1] + y[0] * x[1], x[1] * y[1]];
export const sub = (x, y) => [x[0] * y[1] - y[0] * x[1], x[1] * y[1]];
export const mul = (x, y) => [x[0] * y[0], x[1] * y[1]];
export const val = x => x[0] / x[1];
// "5 1/2", "1/2" or "5" as a number.
export function parseMixed(s) {
  const m = String(s).match(/^(?:(\d+) )?(\d+)\/(\d+)$/);
  return m ? Number(m[1] || 0) + Number(m[2]) / Number(m[3]) : Number(s);
}
export const pairs = s => [...s.matchAll(/\((\d+), (\d+)\)/g)].map(m => [Number(m[1]), Number(m[2])]);
export const sum = xs => xs.reduce((a, x) => a + x, 0);
