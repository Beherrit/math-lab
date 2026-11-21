// A tiny calculator for the expressions on the Level 4 order-of-operations questions: + − × ÷ and ( ) [ ] { } groups.
export function calc(text) {
  const t = text.replace(/[\[{]/g, '(').replace(/[\]}]/g, ')').match(/\d+(\.\d+)?|[+−×÷()]/g); let i = 0;
  const atom = () => { if (t[i] === '(') { i++; const v = sum(); i++; return v; } return Number(t[i++]); };
  const prod = () => { let v = atom(); while (t[i] === '×' || t[i] === '÷') { const o = t[i++], r = atom(); v = o === '×' ? v * r : v / r; } return v; };
  const sum = () => { let v = prod(); while (t[i] === '+' || t[i] === '−') { const o = t[i++], r = prod(); v = o === '+' ? v + r : v - r; } return v; };
  return sum();
}
// Is the value a whole number that is not negative?
export const clean = v => Number.isInteger(v) && v >= 0;
