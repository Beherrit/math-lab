// Multiplying and dividing numbers in scientific notation: front numbers together, powers of 10 together.
import { R, rnd, pick, chance, b, way, pow, fmt, plain, num, choice } from '../../util.js';
import { blank, par } from './h.js';

// [a, c] pairs. Sets ending in 1 give a front number that is already between 1 and 10; sets ending in 2 need one more step.
const MUL1 = [[2, 3], [2, 4], [3, 3], [2, 2], [1.5, 2], [2.5, 2], [1.5, 4], [2.5, 3], [1.2, 5], [3, 2], [4, 2], [1.5, 6], [1.2, 3], [1.1, 7]];
const MUL2 = [[4, 5], [5, 6], [2.5, 8], [6, 7], [3, 5], [8, 5], [7, 3], [9, 2], [4.5, 4], [2.5, 6], [5, 5], [6, 4], [8, 3], [7, 5]];
const DIV1 = [[8, 2], [6, 3], [9, 3], [8, 4], [6, 2], [4, 2], [9, 2], [7.5, 3], [5, 2], [4.8, 4], [3, 2], [7, 2], [9.6, 8]];
const DIV2 = [[2, 4], [2, 5], [3, 6], [1.2, 4], [2, 8], [3, 4], [1.5, 3], [2.4, 8], [3.6, 9], [1, 4], [1, 2], [1, 5], [4, 8], [4.5, 9], [1.8, 6]];
const s10 = (x, e) => `${plain(x)} × ${pow(10, fmt(e))}`;
// Raw result (front numbers and exponents handled separately) and the same value in scientific notation.
export function work(op, a, m, c, n) {
  const raw = R(op === 'mul' ? a * c : a / c), e = op === 'mul' ? m + n : m - n;
  const [k, E] = raw >= 10 ? [R(raw / 10), e + 1] : raw < 1 ? [R(raw * 10), e - 1] : [raw, e];
  return { raw, e, k, E };
}
function regroup(op, a, m, c, n, w) {
  const sym = op === 'mul' ? '×' : '÷';
  const steps = [op === 'mul' ? 'Multiplying can be done in any order, so put the front numbers together and the powers of 10 together.' : 'Divide the front numbers, and divide the powers of 10, as two separate jobs.',
    `Front numbers: ${plain(a)} ${sym} ${plain(c)} = ${plain(w.raw)}.`,
    `Powers of 10: ${pow(10, fmt(m))} ${sym} ${pow(10, fmt(n))} = ${pow(10, fmt(w.e))}, because ${fmt(m)} ${op === 'mul' ? '+' : '−'} ${par(n)} = ${fmt(w.e)}.`];
  if (w.raw >= 10) steps.push(`${s10(w.raw, w.e)} has a front number of 10 or more. ${plain(w.raw)} = ${plain(w.k)} × 10, so pass that 10 to the power: ${b(s10(w.k, w.E))}.`);
  else if (w.raw < 1) steps.push(`${s10(w.raw, w.e)} has a front number less than 1. ${plain(w.raw)} = ${plain(w.k)} ÷ 10, so take one 10 from the power: ${b(s10(w.k, w.E))}.`);
  else steps.push(`Together: ${b(s10(w.k, w.E))}.`);
  return way('Front numbers, then tens', steps);
}
function second(op, a, m, c, n, w) {
  const sym = op === 'mul' ? '×' : '÷';
  if (m >= 1 && n >= 1 && m <= 4 && n <= 4 && w.E >= 0) {
    const x = R(a * 10 ** m), y = R(c * 10 ** n), v = R(op === 'mul' ? x * y : x / y);
    return way('Check with everyday numbers', [`${s10(a, m)} = ${fmt(x)} and ${s10(c, n)} = ${fmt(y)}.`, `${fmt(x)} ${sym} ${fmt(y)} = ${fmt(v)}`, `${fmt(v)} = ${b(s10(w.k, w.E))}`]);
  }
  const tens = e => (e >= 0 ? `${e} tens multiplied` : `${-e} tens dividing`);
  return way('Count the tens', [`${pow(10, fmt(m))} is ${tens(m)}. ${pow(10, fmt(n))} is ${tens(n)}.`,
    op === 'mul' ? `Multiplying puts them together: ${fmt(m)} + ${par(n)} = ${fmt(w.e)}.` : `Dividing takes the second lot away from the first: ${fmt(m)} − ${par(n)} = ${fmt(w.e)}.`,
    `Then the front numbers: ${plain(a)} ${sym} ${plain(c)} = ${plain(w.raw)}. In scientific notation that makes ${b(s10(w.k, w.E))}.`]);
}
function problem(op, [a, c], m, n, mode) {
  const w = work(op, a, m, c, n), sym = op === 'mul' ? '×' : '÷';
  const left = `(${s10(a, m)}) ${sym} (${s10(c, n)})`, ways = [regroup(op, a, m, c, n, w), second(op, a, m, c, n, w)];
  const _t = { k: 'sciop', op, a, m, c, n, ask: mode }, shift = w.raw >= 10 || w.raw < 1;
  const hint = shift ? 'Work out the front numbers first. Is the result between 1 and 10?' : `Do the front numbers and the powers of 10 separately. ${op === 'mul' ? 'Multiplying adds exponents.' : 'Dividing subtracts exponents.'}`;
  if (mode === 'full') {
    const wrong = [shift ? s10(w.raw, w.e) : s10(w.k, w.E + 1), s10(w.k, op === 'mul' ? m * n : m + n), s10(w.k, shift ? w.e + (w.e - w.E) : w.E - 1), s10(w.k, op === 'mul' ? m - n : m * n)];
    return { ask: 'Which is the answer in scientific notation?', expr: left, exprSmall: true, answer: choice(s10(w.k, w.E), wrong), ways, hint, _t };
  }
  if (mode === 'coef') return { ask: 'The answer is in scientific notation. What number goes in front?', expr: `${left} = ${blank} × ${pow(10, fmt(w.E))}`, exprSmall: true, answer: num(w.k), ways, hint, _t };
  return { ask: 'The answer is in scientific notation. What is the exponent?', expr: `${left} = ${plain(w.k)} × ${pow(10, blank)}`, exprSmall: true, answer: num(w.E, { signed: true }), ways, hint, _t };
}
const mixed = () => (chance(0.5) ? rnd(2, 8) : -rnd(2, 8));
export function genSciOps(L) {
  if (L === 1) {
    if (chance(0.5)) return problem('mul', pick(MUL1), rnd(2, 6), rnd(2, 6), pick(['exp', 'exp', 'coef']));
    const m = rnd(4, 9);
    return problem('div', pick(DIV1), m, rnd(2, m - 1), pick(['exp', 'exp', 'coef']));
  }
  if (L === 2) {
    const t = rnd(0, 3), mode = pick(['exp', 'exp', 'full']);
    if (t === 0) return problem('mul', pick(MUL2), rnd(2, 7), rnd(2, 7), mode);
    if (t === 1) { const m = rnd(5, 9); return problem('div', pick(DIV2), m, rnd(2, m - 2), mode); }
    if (t === 2) return problem('mul', pick(MUL1), rnd(3, 8), -rnd(2, 7), mode);
    return problem('div', pick(DIV1), rnd(2, 6), -rnd(2, 5), mode);
  }
  const op = pick(['mul', 'div']), mode = pick(['exp', 'coef', 'full', 'full']);
  const set = op === 'mul' ? pick([MUL1, MUL2, MUL2]) : pick([DIV1, DIV2, DIV2]);
  return problem(op, pick(set), mixed(), mixed(), mode);
}
