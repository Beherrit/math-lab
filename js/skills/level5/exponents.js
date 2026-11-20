// Exponents and the order of operations with exponents.
import { R, rnd, pick, chance, fmt, plain, pow, F, fr, b, way, num, frac } from '../../util.js';
import { T, rndNot } from './helpers.js';

const BLANK = '<span class="blank">?</span>';
const times = (base, e) => Array(e).fill(base).join(' × ');
const TRAP = (base, e) => `Watch out: ${pow(base, e)} is not ${base} × ${e}. The small number counts how many ${base}s are multiplied.`;
function chain(base, e) {
  const out = []; let v = base;
  for (let i = 2; i <= e; i++) { out.push(`${fmt(v)} × ${base} = ${i === e ? b(fmt(v * base)) : fmt(v * base)}`); v *= base; }
  return out;
}
function powerValue() {
  const [base, e] = pick([[2, rnd(2, 6)], [3, rnd(2, 4)], [4, rnd(2, 3)], [5, rnd(2, 3)], [10, rnd(2, 5)], [rnd(6, 12), 2], [rnd(6, 9), 2], [1, rnd(3, 9)]]);
  const picture = e === 2 ? [`A square with ${base} rows of ${base} has ${base} × ${base} = ${b(fmt(base ** 2))} small squares. That is why it is called “${base} squared”.`]
    : e === 3 ? [`A cube ${base} long, ${base} wide and ${base} high holds ${base} × ${base} × ${base} = ${b(fmt(base ** 3))} small cubes. That is why it is called “${base} cubed”.`]
      : [`Each extra ${base} multiplies what you have by ${base} again.`, `Running total after each step: ${Array.from({ length: e }, (_, i) => fmt(base ** (i + 1))).join(', then ')}`, `After ${e} steps: ${b(fmt(base ** e))}`];
  return T({ ask: 'Find the value.', expr: pow(base, e), answer: num(base ** e),
    ways: [way('Write out the multiplication', [`${pow(base, e)} means ${e} copies of ${base} multiplied together: ${times(base, e)}`, TRAP(base, e), ...chain(base, e)]), way(e <= 3 ? 'Picture it' : 'Grow it step by step', picture)],
    hint: `The exponent ${e} tells you how many ${base}s to multiply together.` }, 'pow', { base, e });
}
function writeAsPower() {
  const base = rnd(2, 9), e = rnd(3, 6), askExp = chance(0.6);
  return T({ ask: 'What number is missing?', expr: `${times(base, e)} = ${askExp ? pow(base, BLANK) : pow(BLANK, e)}`, exprSmall: true, answer: num(askExp ? e : base),
    ways: [way('Base and exponent', [`The number being multiplied again and again is the base: ${b(base)}.`, `Count how many times it appears: ${b(e)}. That count is the exponent.`, `${times(base, e)} = ${pow(base, e)}`]), way('Why we write it this way', [`${times(base, e)} is long to write.`, `${pow(base, e)} says the same thing in two numbers: which number (${base}) and how many of them (${e}).`])],
    hint: askExp ? `Count how many ${base}s are being multiplied.` : 'Which number is being multiplied again and again?' }, 'powPart', { base, e, askExp });
}
// Each template returns { expr, long, js, val, steps }: js is the same expression for the tests to evaluate; steps follow the order of operations with the real numbers.
const sq = a => a * a;
const TEMPLATES2 = [
  () => { const a = rnd(2, 9), c = rnd(2, 5), d = rnd(2, 5); return { expr: `${a} + ${pow(c, 2)} × ${d}`, long: `${a} + ${c} × ${c} × ${d}`, js: `${a}+${c}**2*${d}`, val: a + sq(c) * d, steps: [`Exponent first: ${pow(c, 2)} = ${sq(c)}`, `Then multiply: ${sq(c)} × ${d} = ${sq(c) * d}`, `Then add: ${a} + ${sq(c) * d} = ${b(a + sq(c) * d)}`] }; },
  () => { const a = rnd(1, 5), c = rnd(1, 5), d = rnd(1, Math.min(9, sq(a + c) - 1)); return { expr: `(${a} + ${c})${pow('', 2)} − ${d}`, long: `(${a} + ${c}) × (${a} + ${c}) − ${d}`, js: `(${a}+${c})**2-${d}`, val: sq(a + c) - d, steps: [`Brackets first: ${a} + ${c} = ${a + c}`, `Exponent: ${pow(a + c, 2)} = ${sq(a + c)}`, `Subtract: ${sq(a + c)} − ${d} = ${b(sq(a + c) - d)}`] }; },
  () => { const a = rnd(2, 9), c = rnd(2, 6); return { expr: `${a} × ${pow(c, 2)}`, long: `${a} × ${c} × ${c}`, js: `${a}*${c}**2`, val: a * sq(c), steps: [`Exponent first: ${pow(c, 2)} = ${sq(c)}`, `Not (${a} × ${c})${pow('', 2)}: the exponent belongs only to the ${c}.`, `Then multiply: ${a} × ${sq(c)} = ${b(a * sq(c))}`] }; },
  () => { const c = rnd(5, 10), a = rnd(2, 4), d = rnd(2, 6); return { expr: `${pow(c, 2)} − ${a} × ${d}`, long: `${c} × ${c} − ${a} × ${d}`, js: `${c}**2-${a}*${d}`, val: sq(c) - a * d, steps: [`Exponent first: ${pow(c, 2)} = ${sq(c)}`, `Multiply before subtracting: ${a} × ${d} = ${a * d}`, `Subtract: ${sq(c)} − ${a * d} = ${b(sq(c) - a * d)}`] }; },
  () => { const a = rnd(2, 9), c = rndNot(2, 9, [a]); return { expr: `${pow(a, 2)} + ${pow(c, 2)}`, long: `${a} × ${a} + ${c} × ${c}`, js: `${a}**2+${c}**2`, val: sq(a) + sq(c), steps: [`Both exponents first: ${pow(a, 2)} = ${sq(a)} and ${pow(c, 2)} = ${sq(c)}`, `Not (${a} + ${c})${pow('', 2)} = ${sq(a + c)}. Squaring happens before adding.`, `Add: ${sq(a)} + ${sq(c)} = ${b(sq(a) + sq(c))}`] }; },
  () => { const c = pick([2, 5, 10]), q = rnd(2, 8), a = rnd(1, 9); return { expr: `${q * sq(c)} ÷ ${pow(c, 2)} + ${a}`, long: `${q * sq(c)} ÷ (${c} × ${c}) + ${a}`, js: `${q * sq(c)}/${c}**2+${a}`, val: q + a, steps: [`Exponent first: ${pow(c, 2)} = ${sq(c)}`, `Divide: ${q * sq(c)} ÷ ${sq(c)} = ${q}`, `Add: ${q} + ${a} = ${b(q + a)}`] }; },
];
const TEMPLATES3 = [
  () => { const d = pick([2, 3, 4]), g = rnd(1, 3) * d, c = rnd(1, 5), a = rnd(2, 5), e = rnd(2, 5), m = a * sq(g) / d; return { expr: `${a} × (${g + c} − ${c})${pow('', 2)} ÷ ${d} + ${pow(e, 2)}`, long: `${a} × (${g + c} − ${c}) × (${g + c} − ${c}) ÷ ${d} + ${e} × ${e}`, js: `${a}*(${g + c}-${c})**2/${d}+${e}**2`, val: m + sq(e), steps: [`Brackets: ${g + c} − ${c} = ${g}`, `Exponents: ${pow(g, 2)} = ${sq(g)} and ${pow(e, 2)} = ${sq(e)}`, `Multiply and divide, left to right: ${a} × ${sq(g)} = ${a * sq(g)}, then ${a * sq(g)} ÷ ${d} = ${m}`, `Add: ${m} + ${sq(e)} = ${b(m + sq(e))}`] }; },
  () => { const a = rnd(2, 4), c = rnd(2, 4), d = rnd(2, 5), e = rnd(2, 6), top = a ** 3; return { expr: `${pow(a, 3)} + (${d} + ${pow(c, 2)}) × ${e}`, long: `${times(a, 3)} + (${d} + ${c} × ${c}) × ${e}`, js: `${a}**3+(${d}+${c}**2)*${e}`, val: top + (d + sq(c)) * e, steps: [`Inside the brackets, the exponent goes first: ${pow(c, 2)} = ${sq(c)}, then ${d} + ${sq(c)} = ${d + sq(c)}`, `Other exponent: ${pow(a, 3)} = ${top}`, `Multiply: ${d + sq(c)} × ${e} = ${(d + sq(c)) * e}`, `Add: ${top} + ${(d + sq(c)) * e} = ${b(top + (d + sq(c)) * e)}`] }; },
  () => { const a = rnd(2, 5), c = rnd(2, 3), d = rnd(1, 9), big = sq(a * c) + d + rnd(1, 20); return { expr: `${big} − (${a} × ${c})${pow('', 2)} + ${d}`, long: `${big} − (${a} × ${c}) × (${a} × ${c}) + ${d}`, js: `${big}-(${a}*${c})**2+${d}`, val: big - sq(a * c) + d, steps: [`Brackets: ${a} × ${c} = ${a * c}`, `Exponent: ${pow(a * c, 2)} = ${sq(a * c)}`, `Add and subtract from left to right: ${big} − ${sq(a * c)} = ${big - sq(a * c)}, then + ${d} = ${b(big - sq(a * c) + d)}`] }; },
];
function orderOfOps(L) {
  const t = pick(L === 2 ? TEMPLATES2 : TEMPLATES3)(), val = t.val;
  return T({ ask: 'Find the value.', expr: t.expr, exprSmall: L === 3, answer: num(val),
    ways: [way('Follow the order', ['Order: brackets, then exponents, then × and ÷ from left to right, then + and − from left to right.', ...t.steps]), way('Write the powers out', ['An exponent is a short way to write a multiplication, and multiplying comes before adding and subtracting. Written out in full:', t.long, `Work it through the same way and you get ${b(fmt(val))}.`])],
    hint: 'Do what is inside brackets first, then any exponents, before you multiply, divide, add or subtract.' }, 'ops', { js: t.js });
}
function smallBase() {
  if (chance(0.5)) { const d = rnd(2, 5), n = rnd(1, d - 1), e = n === 1 ? rnd(2, 3) : 2; if (n > 1 && d % n === 0) return smallBase();
    return T({ ask: 'Find the value. Give a fraction.', expr: `(${F(n, d)})${pow('', e)}`, answer: frac(n ** e, d ** e), ways: [way('Write out the multiplication', [`${e} copies of ${F(n, d)} multiplied: ${Array(e).fill(F(n, d)).join(' × ')}`, `Tops: ${times(n, e)} = ${n ** e}. Bottoms: ${times(d, e)} = ${d ** e}.`, `${b(fr(n ** e, d ** e))}`]), way('Does the size make sense?', [`${F(n, d)} is less than 1. Taking a fraction of a fraction gives something smaller.`, `${fr(n ** e, d ** e)} is smaller than ${F(n, d)}`])], hint: `Multiply ${F(n, d)} by itself. Tops with tops, bottoms with bottoms.` }, 'powFrac', { n, d, e }); }
  const base = pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 1.1, 1.2, 1.5, 2.5]), e = base === 0.5 || base === 0.1 || base === 0.2 ? rnd(2, 3) : 2, whole = R(base * 10);
  return T({ ask: 'Find the value.', expr: pow(plain(base), e), answer: num(R(base ** e)), ways: [way('Multiply as whole numbers, then place the point', [`${pow(plain(base), e)} = ${times(plain(base), e)}`, `Without the points: ${times(whole, e)} = ${fmt(whole ** e)}`, `${e} numbers with 1 decimal place each give ${e} decimal places: ${b(plain(R(base ** e)))}`]), way('Use tenths', [`${plain(base)} = ${F(whole, 10)}`, `${Array(e).fill(F(whole, 10)).join(' × ')} = ${F(fmt(whole ** e), fmt(10 ** e))} = ${b(plain(R(base ** e)))}`])], hint: `Write it as ${times(plain(base), e)} first.` }, 'pow', { base, e });
}
export function genExp(L) {
  if (L === 1) return chance(0.7) ? powerValue() : writeAsPower();
  if (L === 2) return chance(0.8) ? orderOfOps(2) : powerValue();
  return chance(0.7) ? orderOfOps(3) : smallBase();
}
