// Zero and negative exponents: follow the pattern down, then use it with the laws.
import { rnd, pick, chance, b, way, pow, F, fmt, num, frac, choice, table } from '../../util.js';
import { blank, par } from './h.js';
import { reps } from './exponents.js';

const neg = n => fmt(-n);
const cp = n => `${n} ${n === 1 ? 'copy' : 'copies'}`;
// The pattern table for base a from a^hi down to a^lo. hide = exponent whose value is shown as "?".
function ladder(a, hi, lo, hide) {
  const rows = [];
  for (let e = hi; e >= lo; e--) rows.push([pow(a, fmt(e)), e === hide ? b('?') : e >= 0 ? fmt(a ** e) : F(1, fmt(a ** -e))]);
  return table(['Power', 'Value'], rows);
}
const patternWay = (a, e) => way('Follow the pattern', [ladder(a, 3, Math.min(e, -1), null),
  `Going down one row takes away one factor of ${a}, so the value is divided by ${a} each time.`,
  e === 0 ? `${pow(a, 1)} is ${a}. Divide by ${a} once more: ${a} ÷ ${a} = ${b(1)}.` : `${pow(a, 0)} is 1. Keep dividing by ${a}: ${pow(a, fmt(e))} = ${b(F(1, fmt(a ** -e)))}.`]);
function zero() {
  const a = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 25, 57, 100]);
  const withTable = a <= 10 && chance(0.6);
  return { ask: withTable ? `The values follow a pattern. What is ${pow(a, 0)}?` : 'Find the value.', expr: withTable ? null : `${pow(a, 0)} = ${blank}`, visual: withTable ? ladder(a, 3, 0, 0) : null,
    answer: num(1), hint: `What do you get when you divide ${pow(a, 1)} by ${a}?`, _t: { k: 'znval', a, e: 0 },
    ways: [a <= 10 ? patternWay(a, 0) : way('Follow the pattern', [`${pow(a, 2)} = ${fmt(a * a)} and ${pow(a, 1)} = ${a}. Each step down divides by ${a}.`, `One more step: ${a} ÷ ${a} = ${b(1)}.`]),
      way('Use the quotient law', [`${pow(a, 2)} ÷ ${pow(a, 2)} is a number divided by itself, so it is 1.`, `The law says subtract the exponents: 2 − 2 = 0, so it is also ${pow(a, 0)}.`, `Both are right, so ${pow(a, 0)} = ${b(1)}.`])] };
}
function value(a, n, asChoice) {
  const v = a ** n, _t = { k: 'znval', a, e: -n };
  const list = Array.from({ length: n }, (_, i) => `${pow(a, neg(i + 1))} = ${F(1, fmt(a ** (i + 1)))}`).join(', ');
  const ways = [a ** 3 <= 1000 ? patternWay(a, -n) : way('Follow the pattern', [`Each step down in the exponent divides by ${a}.`, `${pow(a, 0)} = 1, then ${list}.`]),
    way('Flip it', ['A negative exponent means divide by that many copies instead of multiplying.', `${pow(a, neg(n))} = ${F(1, pow(a, n))} = ${F(1, reps(a, n))} = ${b(F(1, fmt(v)))}.`, 'The answer is a small positive number. A negative exponent does not make a negative number.'])];
  if (asChoice) return { ask: 'Which is equal to this?', expr: pow(a, neg(n)), answer: choice(F(1, fmt(v)), [fmt(-v), fmt(-a * n), F(1, fmt(a * n)), `−${F(1, fmt(v))}`]), choiceBig: true, ways, hint: 'A negative exponent does not make the answer negative.', _t: { ..._t, pick: true } };
  return { ask: 'Write the value as a fraction.', expr: `${pow(a, neg(n))} = ${blank}`, answer: frac(1, v), ways, hint: `Start at ${pow(a, 0)} = 1 and divide by ${a}.`, _t };
}
const OPS = {
  prod: { e: (m, n) => m + n, sym: '×', op: '+', word: 'add', why: 'Multiplying powers of the same base adds the exponents.' },
  quot: { e: (m, n) => m - n, sym: '÷', op: '−', word: 'subtract', why: 'Dividing powers of the same base subtracts the exponents.' },
  pow: { e: (m, n) => m * n, sym: '', op: '×', word: 'multiply', why: 'A power of a power multiplies the exponents.' },
};
const showOp = (op, a, m, n) => (op === 'pow' ? `(${pow(a, fmt(m))})<sup>${fmt(n)}</sup>` : `${pow(a, fmt(m))} ${OPS[op].sym} ${pow(a, fmt(n))}`);
function meaning(a, e) {
  if (e < 0) return `${pow(a, fmt(e))} means ${F(1, pow(a, -e))}: one divided by ${cp(-e)} of ${a}.`;
  return e === 0 ? `${pow(a, 0)} is 1.` : `${pow(a, e)} is ${cp(e)} of ${a} multiplied.`;
}
function expo(op, a, m, n) {
  const o = OPS[op], e = o.e(m, n), sum = `${fmt(m)} ${o.op} ${par(n)}`;
  const ways = [way('Use the law', [o.why, `${sum} = ${b(fmt(e))}`, meaning(a, e)])];
  if (op === 'quot' && m > 0 && n > m && n <= 8) {
    ways.unshift(way('Write out the factors', [`${F(reps(a, m), reps(a, n))}`, `All ${m} on the top cancel with ${m} on the bottom. That leaves ${cp(n - m)} on the bottom.`, `${F(1, pow(a, n - m))} is written ${b(pow(a, fmt(m - n)))}.`]));
  } else {
    ways.push(way('Read each power', ['A positive exponent counts copies multiplied. A negative exponent counts copies divided.', `Keep score: ${sum} = ${fmt(e)}.`, `So the answer is ${b(pow(a, fmt(e)))}.`]));
  }
  return { ask: 'Write as one power. What is the exponent?', expr: `${showOp(op, a, m, n)} = ${pow(a, blank)}`, answer: num(e, { signed: true }), ways, hint: `Same base: ${o.word} the exponents. Watch the signs.`, _t: { k: 'znexp', op, m, n } };
}
function quotValue(a) {
  const d = rnd(1, a <= 3 ? 3 : 2), m = rnd(2, 4), n = m + d, v = a ** d;
  return { ask: 'Find the value. Write it as a fraction.', expr: `${pow(a, m)} ÷ ${pow(a, n)} = ${blank}`, answer: frac(1, v), hint: 'Which has more copies, the top or the bottom?', _t: { k: 'znquot', a, m, n },
    ways: [way('Write out the factors', [`${F(reps(a, m), reps(a, n))}`, `${m} copies cancel. That leaves ${cp(d)} on the bottom: ${F(1, reps(a, d))} = ${b(F(1, fmt(v)))}.`]),
      way('Use the law', [`Subtract the exponents: ${m} − ${n} = ${fmt(m - n)}, so the answer is ${pow(a, fmt(m - n))}.`, `${pow(a, fmt(m - n))} = ${F(1, pow(a, d))} = ${b(F(1, fmt(v)))}.`])] };
}
function rewrite(a) {
  const n = rnd(2, 9);
  return { ask: 'What exponent makes this true?', expr: `${F(1, pow(a, n))} = ${pow(a, blank)}`, answer: num(-n, { signed: true }), hint: 'One divided by copies of the base is written with a negative exponent.', _t: { k: 'znexp', op: 'quot', m: 0, n },
    ways: [way('Use the meaning', [`${pow(a, fmt(-n))} means one divided by ${n} copies of ${a}.`, `That is exactly ${F(1, pow(a, n))}, so the exponent is ${b(fmt(-n))}.`]),
      way('Use the quotient law', [`1 is ${pow(a, 0)}, so the fraction is ${pow(a, 0)} ÷ ${pow(a, n)}.`, `Subtract the exponents: 0 − ${n} = ${b(fmt(-n))}.`])] };
}
const small = () => { const a = pick([2, 3, 4, 5, 10]); return [a, rnd(1, 2)]; };
export function genExpNeg(L) {
  const a = pick([2, 3, 5, 7, 10, 'x', 'n', 'a']);
  if (L === 1) {
    if (chance(0.2)) return zero();
    const [s, n] = chance(0.5) ? small() : [rnd(2, 10), 1];
    return value(s, n, chance(0.25));
  }
  if (L === 2) {
    const t = rnd(0, 4);
    if (t === 0) { const s = rnd(2, 10); return value(s, rnd(1, s <= 5 ? 3 : 2), chance(0.3)); }
    if (t === 1) { const m = rnd(1, 5); return expo('quot', a, m, m + rnd(1, 5)); }
    if (t === 2) return expo('prod', a, rnd(2, 8), -rnd(2, 8));
    if (t === 3) return rewrite(a);
    return expo('prod', a, -rnd(1, 5), -rnd(1, 5));
  }
  const t = rnd(0, 4);
  if (t === 0) return quotValue(pick([2, 3, 4, 5, 10]));
  if (t === 1) return expo('pow', a, -rnd(2, 5), rnd(2, 4));
  if (t === 2) return expo('pow', a, rnd(2, 5), -rnd(2, 4));
  if (t === 3) return expo('quot', a, -rnd(1, 6), -rnd(1, 6));
  return expo('quot', a, rnd(1, 4), -rnd(1, 5));
}
