// Order of operations with negative numbers, decimals and fractions: brackets, then multiply and divide, then add and subtract.
import { R, rnd, pick, fmt, b, way } from '../../util.js';
import { nz, par, snum, tag } from './helpers.js';

// Each template: how it reads (A, B, C, D are the shown numbers), its steps, its value, and the classic wrong answer.
const T = {
  addMul: { n: 3, text: (A, B, C) => `${A} + ${B} × ${C}`, val: (a, c1, c2) => a + c1 * c2, alt: (a, c1, c2) => (a + c1) * c2,
    steps: (a, c1, c2) => [`Multiply before adding: ${par(c1)} × ${par(c2)} = ${fmt(R(c1 * c2))}.`, `${fmt(a)} + ${par(R(c1 * c2))} = ${b(fmt(R(a + c1 * c2)))}`] },
  subMul: { n: 3, text: (A, B, C) => `${A} − ${B} × ${C}`, val: (a, c1, c2) => a - c1 * c2, alt: (a, c1, c2) => (a - c1) * c2,
    steps: (a, c1, c2) => [`Multiply before subtracting: ${par(c1)} × ${par(c2)} = ${fmt(R(c1 * c2))}.`, `${fmt(a)} − ${par(R(c1 * c2))} = ${b(fmt(R(a - c1 * c2)))}`] },
  brMul: { n: 3, text: (A, B, C) => `(${A} + ${B}) × ${C}`, val: (a, c1, c2) => (a + c1) * c2, alt: (a, c1, c2) => a + c1 * c2,
    steps: (a, c1, c2) => [`Brackets first: ${fmt(a)} + ${par(c1)} = ${fmt(R(a + c1))}.`, `${par(R(a + c1))} × ${par(c2)} = ${b(fmt(R((a + c1) * c2)))}`] },
  brSub: { n: 3, text: (A, B, C) => `(${A} − ${B}) × ${C}`, val: (a, c1, c2) => (a - c1) * c2, alt: (a, c1, c2) => a - c1 * c2,
    steps: (a, c1, c2) => [`Brackets first: ${fmt(a)} − ${par(c1)} = ${fmt(R(a - c1))}.`, `${par(R(a - c1))} × ${par(c2)} = ${b(fmt(R((a - c1) * c2)))}`] },
  mulSub: { n: 3, text: (A, B, C) => `${A} × ${B} − ${C}`, val: (a, c1, c2) => a * c1 - c2, alt: (a, c1, c2) => a * (c1 - c2),
    steps: (a, c1, c2) => [`Multiply first: ${fmt(a)} × ${par(c1)} = ${fmt(R(a * c1))}.`, `${par(R(a * c1))} − ${par(c2)} = ${b(fmt(R(a * c1 - c2)))}`] },
  divAdd: { n: 3, text: (A, B, C) => `${A} ÷ ${B} + ${C}`, val: (a, c1, c2) => a / c1 + c2, alt: (a, c1, c2) => a / (c1 + c2),
    steps: (a, c1, c2) => [`Divide before adding: ${fmt(a)} ÷ ${par(c1)} = ${fmt(R(a / c1))}.`, `${par(R(a / c1))} + ${par(c2)} = ${b(fmt(R(a / c1 + c2)))}`] },
  brDiv: { n: 3, text: (A, B, C) => `(${A} + ${B}) ÷ ${C}`, val: (a, c1, c2) => (a + c1) / c2, alt: (a, c1, c2) => a + c1 / c2,
    steps: (a, c1, c2) => [`Brackets first: ${fmt(a)} + ${par(c1)} = ${fmt(R(a + c1))}.`, `${par(R(a + c1))} ÷ ${par(c2)} = ${b(fmt(R((a + c1) / c2)))}`] },
  long: { n: 4, text: (A, B, C, D) => `${A} − (${B} + ${C}) × ${D}`, val: (a, c1, c2, d) => a - (c1 + c2) * d, alt: (a, c1, c2, d) => (a - (c1 + c2)) * d,
    steps: (a, c1, c2, d) => [`Brackets first: ${fmt(c1)} + ${par(c2)} = ${fmt(R(c1 + c2))}.`, `Then multiply: ${par(R(c1 + c2))} × ${par(d)} = ${fmt(R((c1 + c2) * d))}.`, `Last, subtract: ${fmt(a)} − ${par(R((c1 + c2) * d))} = ${b(fmt(R(a - (c1 + c2) * d)))}`] },
};
const cleanDec = v => Number.isInteger(R(v * 100)) && Math.abs(v) <= 100;
const QUARTERS = [[1, 2], [-1, 2], [1, 4], [-1, 4], [3, 4], [-3, 4]];
// How a value is written in the expression: a whole number or decimal, or a fraction in brackets such as (−3/4).
const asFrac = ([n, d]) => `(${n < 0 ? '−' : ''}${Math.abs(n)}/${d})`;

function build(name, vals, shown) {
  const t = T[name], wrap = name === 'long' ? [2, 3] : [1, 2, 3];
  const disp = shown.map((s, i) => (wrap.includes(i) && s.startsWith('−') ? `(${s})` : s));
  return { text: t.text(...disp), steps: t.steps(...vals), val: R(t.val(...vals)), alt: R(t.alt(...vals)) };
}
function arith(shape, name, vals, shown, nums) {
  const e = build(name, vals, shown);
  if (/[+−-] \(?0\)?(?![.\d])|[×÷] \(?0\)?(?![.\d])/.test(e.steps.join(' '))) return null;
  return tag({ ask: 'Work out the value, following the order of operations.', expr: e.text, answer: snum(e.val),
    ways: [way('Follow the order step by step', [...(shape === 'fracorder' ? [`Write each fraction as a decimal first: ${shown.filter(s => /\//.test(s)).map((s, i) => `${s} = ${fmt(vals[shown.indexOf(s)])}`).join(', ')}.`] : []), ...e.steps]),
      way('Spot the common slip', [`A common slip is to do the operations in the wrong order. That gives ${fmt(e.alt)}.`, `It is a different number, because brackets come first, then multiplying and dividing, then adding and subtracting. The right answer is ${b(fmt(e.val))}.`])],
    hint: 'Which part goes first: brackets, then multiplying or dividing, then adding or subtracting? Do that part on its own.' }, { kind: 'arith', shape, shown: nums });
}
function tryAgain(f) { for (;;) { const r = f(); if (r) return r; } }
export function wholeOrder() {
  return tryAgain(() => {
    const name = pick(['addMul', 'subMul', 'brMul', 'brSub']), v = [nz(-9, 9), nz(-6, 6), nz(-6, 6)], t = T[name];
    if (R(t.val(...v)) === R(t.alt(...v)) || Math.abs(t.val(...v)) > 30) return null;
    return arith('order', name, v, v.map(fmt), v.map(Math.abs));
  });
}
export function decimalOrder() {
  return tryAgain(() => {
    const name = pick(['addMul', 'subMul', 'brMul', 'brSub', 'mulSub', 'divAdd']), tenth = () => nz(-40, 40) / 10, t = T[name];
    const v = name === 'divAdd' ? (() => { const q = tenth(), c = pick([2, 4, 5]); return [R(q * c), c, tenth()]; })() : name === 'mulSub' ? [tenth(), nz(-6, 6), tenth()] : [tenth(), tenth(), nz(-5, 5)];
    if (!cleanDec(t.val(...v)) || R(t.val(...v)) === R(t.alt(...v)) || !isFinite(t.alt(...v)) || !cleanDec(t.alt(...v))) return null;
    return arith('decorder', name, v, v.map(fmt), v.map(Math.abs));
  });
}
export function fractionOrder() {
  return tryAgain(() => {
    const name = pick(['addMul', 'brMul', 'mulSub']), q = () => pick(QUARTERS), w = () => nz(-6, 6);
    const picks = name === 'addMul' ? [q(), w(), q()] : name === 'brMul' ? [q(), q(), w()] : [w(), q(), q()], isF = Array.isArray;
    const v = picks.map(p => (isF(p) ? p[0] / p[1] : p)), shown = picks.map(p => (isF(p) ? asFrac(p) : fmt(p))), t = T[name];
    if (R(t.val(...v)) === R(t.alt(...v)) || !cleanDec(t.val(...v)) || !cleanDec(t.alt(...v))) return null;
    return arith('fracorder', name, v, shown, picks.flatMap(p => (isF(p) ? [Math.abs(p[0]), p[1]] : [Math.abs(p)])));
  });
}
export function longOrder() {
  return tryAgain(() => {
    const name = pick(['long', 'long', 'brDiv', 'divAdd']), t = T[name], dec = Math.random() < 0.5, tenth = () => nz(-30, 30) / 10;
    let v;
    if (name === 'long') v = [dec ? tenth() : nz(-12, 12), dec ? tenth() : nz(-9, 9), dec ? tenth() : nz(-9, 9), nz(-5, 5)];
    else if (name === 'brDiv') { const c = pick([2, 3, 4, 5]), s = rnd(-9, 9) * c, a = nz(-12, 12); v = [a, R(s - a), c]; } else { const c = pick([2, 3, 4, 5]); v = [nz(-9, 9) * c, c, dec ? tenth() : nz(-9, 9)]; }
    const val = t.val(...v), alt = t.alt(...v);
    if (v.some(x => x === 0) || !cleanDec(val) || !isFinite(alt) || !cleanDec(alt) || R(val) === R(alt) || Math.abs(val) > 60) return null;
    return arith('longorder', name, v, v.map(fmt), v.map(Math.abs));
  });
}
