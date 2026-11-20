// Exponent laws (product, quotient, power of a power), always explained by writing out the factors first.
import { rnd, pick, chance, b, way, pow, F, num, choice, nm } from '../../util.js';
import { blank, copies } from './h.js';

const BASES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'x', 'n', 'a', 'y'];
export const reps = (a, n) => Array(n).fill(a).join(' × ');
const short = (a, n) => (n <= 8 ? reps(a, n) : `${reps(a, 3)} × … × ${a}`);
const left = n => `${n} ${n === 1 ? 'copy is' : 'copies are'} left`;
const LAWS = {
  prod: {
    e: (m, n) => m + n, sign: '×', op: '+', verb: 'add', show: (a, m, n) => `${pow(a, m)} × ${pow(a, n)}`,
    out: (a, m, n) => [`${pow(a, m)} means ${copies(m)} of ${a}: ${short(a, m)}.`, `${pow(a, n)} means ${copies(n)} of ${a}: ${short(a, n)}.`,
      `Multiply them and you have ${m} + ${n} = ${m + n} copies of ${a} in a row. That is ${b(pow(a, m + n))}.`],
    why: 'Multiplying powers of the same base joins the two rows of copies, so the exponents add.',
  },
  quot: {
    e: (m, n) => m - n, sign: '÷', op: '−', verb: 'subtract', show: (a, m, n) => `${pow(a, m)} ÷ ${pow(a, n)}`,
    out: (a, m, n) => [`Write the division as a fraction: ${F(short(a, m), short(a, n))}`, `Each ${a} on the bottom cancels one ${a} on the top, because ${a} ÷ ${a} = 1.`,
      `${n} of the ${m} copies cancel. ${m} − ${n} = ${m - n}, so ${left(m - n)}: ${b(pow(a, m - n))}.`],
    why: 'Dividing powers of the same base cancels copies, so the exponents subtract.',
  },
  pow: {
    e: (m, n) => m * n, sign: '', op: '×', verb: 'multiply', show: (a, m, n) => `(${pow(a, m)})<sup>${n}</sup>`,
    out: (a, m, n) => [`The outside exponent says: ${copies(n)} of ${pow(a, m)}. Write them out: ${Array(n).fill(pow(a, m)).join(' × ')}.`,
      `Each ${pow(a, m)} holds ${copies(m)} of ${a}.`, `${n} groups of ${m} is ${n} × ${m} = ${m * n} copies of ${a}: ${b(pow(a, m * n))}.`],
    why: 'A power of a power is equal groups of copies, so the exponents multiply.',
  },
};
const lawWays = (op, a, m, n) => {
  const law = LAWS[op];
  return [way('Write out the factors', law.out(a, m, n)),
    way('Use the law', [law.why, `Keep the base ${a} and ${law.verb} the exponents: ${m} ${law.op} ${n} = ${b(law.e(m, n))}.`])];
};
const HINT = { prod: 'How many copies of the base are there altogether?', quot: 'How many copies are left after the bottom ones cancel?', pow: 'How many groups are there, and how many copies in each group?' };
function oneLaw(op, a, m, n, mode) {
  const law = LAWS[op], e = law.e(m, n), ways = lawWays(op, a, m, n), _t = { k: 'exp', op, m, n };
  if (mode === 'choice') {
    const wrong = [pow(a, op === 'pow' ? m + n : m * n), pow(a, op === 'quot' ? m + n : Math.abs(m - n) || 1), pow(typeof a === 'number' ? a * a : `2${a}`, e), pow(a, e + 1)];
    return { ask: 'Which single power is equal to this?', expr: law.show(a, m, n), answer: choice(pow(a, e), wrong), ways, hint: HINT[op], _t };
  }
  if (mode === 'missing' && op !== 'pow') {
    return { ask: 'What exponent is missing?', expr: `${pow(a, blank)} ${law.sign} ${pow(a, n)} = ${pow(a, e)}`, answer: num(m), hint: `The exponents ${law.verb} to make ${e}.`, _t: { ..._t, miss: true },
      ways: [way('Use the law backwards', [law.why, op === 'prod' ? `? + ${n} = ${e}, so ? = ${e} − ${n} = ${b(m)}.` : `? − ${n} = ${e}, so ? = ${e} + ${n} = ${b(m)}.`]),
        way('Check by writing it out', law.out(a, m, n))] };
  }
  return { ask: 'Write as one power. What is the exponent?', expr: `${law.show(a, m, n)} = ${pow(a, blank)}`, answer: num(e), ways, hint: HINT[op], _t };
}
const grp = (a, m, n) => `${copies(n)} of ${pow(a, m)} is ${n} × ${m} = ${m * n} copies of ${a}, so ${pow(a, m * n)}`;
const COMBO = {
  pp: { ok: (m, n, p) => m + n - p >= 1, e: (m, n, p) => m + n - p, show: (a, m, n, p) => `${pow(a, m)} × ${pow(a, n)} ÷ ${pow(a, p)}`,
    steps: (a, m, n, p) => [`First the multiplying: ${pow(a, m)} × ${pow(a, n)} is ${m} + ${n} = ${m + n} copies of ${a}, so ${pow(a, m + n)}.`, `Then the dividing: ${pow(a, p)} cancels ${p} of those copies. ${m + n} − ${p} = ${b(m + n - p)}.`] },
  pw: { ok: () => true, e: (m, n, p) => m * n + p, show: (a, m, n, p) => `(${pow(a, m)})<sup>${n}</sup> × ${pow(a, p)}`,
    steps: (a, m, n, p) => [`First the bracket: ${grp(a, m, n)}.`, `Then multiply by ${pow(a, p)}, which brings ${p} more. ${m * n} + ${p} = ${b(m * n + p)}.`] },
  pq: { ok: (m, n, p) => m * n - p >= 1, e: (m, n, p) => m * n - p, show: (a, m, n, p) => `(${pow(a, m)})<sup>${n}</sup> ÷ ${pow(a, p)}`,
    steps: (a, m, n, p) => [`First the bracket: ${grp(a, m, n)}.`, `Then divide by ${pow(a, p)}, which cancels ${p}. ${m * n} − ${p} = ${b(m * n - p)}.`] },
};
function combo(a) {
  const op = pick(Object.keys(COMBO)), c = COMBO[op];
  const m = rnd(2, 5), n = rnd(2, op === 'pp' ? 6 : 4), p = rnd(2, 7);
  if (!c.ok(m, n, p) || m * n === m + n) return null;
  const e = c.e(m, n, p);
  return { ask: 'Write as one power. What is the exponent?', expr: `${c.show(a, m, n, p)} = ${pow(a, blank)}`, exprSmall: true, answer: num(e), hint: 'Do one law at a time, left to right.',
    ways: [way('One step at a time', c.steps(a, m, n, p)), way('Count copies', ['Every exponent is a count of copies of the base.', 'Multiplying adds copies, dividing cancels copies, and a power of a power makes equal groups of copies.', `Altogether that leaves ${b(e)} ${e === 1 ? 'copy' : 'copies'} of ${a}: ${pow(a, e)}.`])],
    _t: { k: 'exp', op, m, n, p } };
}
const SLIPS = [
  { op: 'prod', wrong: (m, n) => m * n, right: 'The exponents should be added, not multiplied', other: ['The exponents should be multiplied, not added', 'The bases should be multiplied too'] },
  { op: 'pow', wrong: (m, n) => m + n, right: 'The exponents should be multiplied, not added', other: ['The exponents should be added, not multiplied', 'The exponents should be subtracted'] },
  { op: 'quot', wrong: (m, n) => m / n, right: 'The exponents should be subtracted, not divided', other: ['The exponents should be added', 'The exponents should be multiplied'] },
];
function slip(a) {
  const s = pick(SLIPS), n = rnd(2, 4), m = s.op === 'quot' ? n * rnd(2, 3) : rnd(3, 5), law = LAWS[s.op];
  if (s.wrong(m, n) === law.e(m, n)) return null;
  const who = nm();
  return { ask: `${who} wrote this. What went wrong?`, expr: `${law.show(a, m, n)} = ${pow(a, s.wrong(m, n))}`, answer: choice(s.right, [...s.other, `Nothing. ${who} is right`]),
    hint: 'Write out the copies of the base and count them.', ways: [way('Write out the factors', law.out(a, m, n)), way('Name the slip', [law.why, `${who} got ${pow(a, s.wrong(m, n))}, but the right answer is ${b(pow(a, law.e(m, n)))}.`, `${b(s.right)}.`])],
    _t: { k: 'expslip', op: s.op, m, n, shown: s.wrong(m, n) } };
}
// The common wrong law must give a different exponent from the right one, or a child could pass without the idea:
// add for multiply (power of a power), multiply for add (product), divide for subtract (quotient).
const WRONG = { prod: (m, n) => m * n, pow: (m, n) => m + n, quot: (m, n) => m / n };
const apart = (op, m, n) => WRONG[op](m, n) !== LAWS[op].e(m, n);
// Draw exponents until the wrong law and the right law disagree, and the answer stays within `top`.
function exps(op, draw, top = Infinity) {
  for (;;) { const [m, n] = draw(); if (apart(op, m, n) && LAWS[op].e(m, n) <= top) return [m, n]; }
}
const quotDraw = (lo, hi, extra) => () => { const m = rnd(lo, hi); return [m, rnd(extra, m - (extra === 1 ? 1 : 2))]; };
export function genExpLaw(L) {
  const a = pick(BASES);
  if (L === 1) {
    const op = pick(['prod', 'prod', 'quot', 'pow']);
    const [m, n] = exps(op, op === 'prod' ? () => [rnd(1, 4), rnd(1, 4)] : op === 'quot' ? quotDraw(3, 6, 1) : () => [rnd(2, 3), rnd(2, 3)], 8);
    return oneLaw(op, a, m, n, 'exp');
  }
  if (L === 3 && chance(0.75)) return chance(0.75) ? combo(a) : slip(a);
  const op = pick(['prod', 'quot', 'pow']), mode = pick(['exp', 'exp', 'choice', 'missing']);
  const [m, n] = exps(op, op === 'prod' ? () => [rnd(2, 9), rnd(2, 9)] : op === 'quot' ? quotDraw(5, 12, 2) : () => [rnd(2, 6), rnd(2, 5)]);
  return oneLaw(op, a, m, n, mode);
}
