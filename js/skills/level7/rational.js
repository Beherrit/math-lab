// Rational and irrational numbers, and turning repeating decimals into fractions.
import { rnd, pick, chance, shuffle, simp, b, way, F, fr, fmt, frac, choice } from '../../util.js';
import { sqrt, bar, fixedChoice } from './h.js';

const KINDS = ['Rational', 'Irrational'];
const nonSquare = hi => { const n = rnd(2, hi); return Number.isInteger(Math.sqrt(n)) ? nonSquare(hi) : n; };
const DEC = [[0.5, 5, 10], [0.25, 25, 100], [0.75, 75, 100], [1.5, 15, 10], [0.2, 2, 10], [2.4, 24, 10], [0.125, 125, 1000], [3.7, 37, 10], [0.06, 6, 100], [3.14, 314, 100]];
// Each maker returns { show, rat, why, dec, t } where t is what the test can recompute from.
const RAT = {
  whole: () => { const n = rnd(-20, 60); return { show: fmt(n), why: `${fmt(n)} can be written as the fraction ${F(fmt(n), 1)}.`, dec: 'It has no decimal part at all.', t: { is: true } }; },
  fraction: () => { const d = rnd(2, 12), n = rnd(1, 25); return { show: F(n, d), why: 'It is already a fraction of two whole numbers.', dec: `${n} ÷ ${d} either stops or repeats.`, t: { is: true } }; },
  decimal: () => { const [x, n, d] = pick(DEC); return { show: String(x), why: `${x} = ${F(n, d)}, a fraction of two whole numbers.`, dec: 'The decimal stops.', t: { is: true } }; },
  root: () => { const n = rnd(2, 15); return { show: sqrt(n * n), why: `${sqrt(n * n)} = ${n}, because ${n} × ${n} = ${n * n}. And ${n} = ${F(n, 1)}.`, dec: 'It is a whole number in disguise.', t: { sqrt: n * n } }; },
  repeat: () => { const d = rnd(1, 8); return { show: `0.${d}${d}${d}…`, why: `0.${d}${d}${d}… = ${fr(d, 9)}. Every repeating decimal is a fraction.`, dec: `The digit ${d} repeats forever. A repeating pattern is fine.`, t: { is: true } }; },
  nearPi: () => ({ show: F(22, 7), why: 'It is a fraction of two whole numbers. It is close to π, but it is not π.', dec: '22 ÷ 7 = 3.142857142857…, and the block 142857 repeats.', t: { is: true } }),
  block: () => { const a = rnd(1, 9), c = rnd(0, 9); return a === c ? RAT.block() : { show: `0.${a}${c}${a}${c}${a}${c}…`, why: `It equals ${fr(a * 10 + c, 99)}. Every repeating decimal is a fraction.`, dec: `The block ${a}${c} repeats forever.`, t: { is: true } }; },
};
const IRR = {
  root: hi => { const n = nonSquare(hi), f = Math.floor(Math.sqrt(n)); return { show: sqrt(n), why: `${n} is not a perfect square (${f} × ${f} = ${f * f} and ${f + 1} × ${f + 1} = ${(f + 1) ** 2}), so no fraction squared makes exactly ${n}.`, dec: `${sqrt(n)} = ${Math.sqrt(n).toFixed(6)}… and the digits never settle into a repeating block.`, t: { sqrt: n } }; },
  pi: () => { const k = pick([1, 1, 2, 5]); return { show: k === 1 ? 'π' : `${k}π`, why: 'π cannot be written as a fraction of two whole numbers, and a whole number times π cannot either.', dec: 'π = 3.14159265… goes on forever with no repeating block.', t: { is: false } }; },
  grow: () => { const d = rnd(1, 9); return { show: `0.${d}0${d}00${d}000${d}…`, why: 'The gaps of zeros keep growing, so no block ever repeats. That cannot be a fraction.', dec: 'It goes on forever, and the pattern changes every time instead of repeating.', t: { is: false } }; },
};
function item(L, rat) {
  if (rat) return RAT[pick(L === 1 ? ['whole', 'fraction', 'decimal', 'root', 'repeat'] : ['root', 'repeat', 'nearPi', 'block', 'decimal', 'fraction'])]();
  return pick(L === 1 ? [() => IRR.root(30), () => IRR.root(30), IRR.pi] : [() => IRR.root(150), IRR.grow, IRR.pi])();
}
function classify(L) {
  const rat = chance(0.5), it = item(L, rat);
  return { ask: 'Is this number rational or irrational?', expr: it.show, answer: fixedChoice(rat ? 'Rational' : 'Irrational', KINDS), hint: 'Can this number be written as a fraction of two whole numbers?', _t: { k: 'ratl', ...it.t },
    ways: [way('Can it be a fraction?', [it.why, `So it is ${b(rat ? 'rational' : 'irrational')}.`]),
      way('Look at its decimal', [it.dec, 'Decimals that stop or repeat are rational. Decimals that go on forever without repeating are irrational.'])] };
}
function oddOne() {
  const odd = item(2, false), rest = shuffle(['whole', 'fraction', 'decimal', 'root', 'repeat', 'block']).slice(0, 3).map(k => RAT[k]());
  return { ask: 'Which of these numbers is irrational?', answer: choice(odd.show, rest.map(r => r.show)), choiceBig: true, hint: 'Three of these can be written as fractions. Which one cannot?', _t: { k: 'ratl', ...odd.t },
    ways: [way('Check each one', [...rest.map(r => `${r.show}: ${r.why}`), `${odd.show}: ${odd.why}`, `So ${b(odd.show)} is the irrational one.`]),
      way('Look at the decimals', [odd.dec, 'The other three stop or repeat, so they are rational.'])] };
}
const nines = k => '9'.repeat(k);
// Repeating decimal w.pre(rep)(rep)... as a fraction: [numerator, denominator], not simplified.
function repFrac(w, pre, rep) {
  const all = Number(`${w}${pre}${rep}`), head = Number(`${w}${pre}`) || 0;
  return [all - head, Number(nines(rep.length) + '0'.repeat(pre.length))];
}
// The decimal for 10^j times the number, for example 16.666… for j = 2 and 0.1666…
function shifted(w, pre, rep, j) {
  const digits = pre + rep.repeat(6);
  return `${Number(`${w}${digits.slice(0, j)}`)}.${digits.slice(j, j + 3 * rep.length)}…`;
}
function algebra(w, pre, rep, n, d) {
  const p = pre.length, q = p + rep.length, big = 10 ** q, sm = 10 ** p;
  const steps = [`Call the number x, so x = ${shifted(w, pre, rep, 0)}`, `Multiply by ${fmt(big)} to slide one whole repeating block past the point: ${fmt(big)}x = ${shifted(w, pre, rep, q)}`];
  if (sm > 1) steps.push(`Also ${sm}x = ${shifted(w, pre, rep, p)}. Both now have the same digits after the point.`);
  steps.push(`Subtract ${sm > 1 ? sm : ''}x from ${fmt(big)}x. The repeating parts cancel: ${fmt(big - sm)}x = ${fmt(n)}`, `x = ${F(fmt(n), fmt(d))}${simp(n, d)[1] !== d ? ` = ${b(fr(n, d))}` : ''}`);
  return way('Use algebra', steps);
}
function repeating(w, pre, rep) {
  const [n, d] = repFrac(w, pre, rep), shown = `${w}.${pre}${bar(rep)}`, unit = rep.length === 1 ? 9 : 99;
  const parts = pre ? [`Split it: ${w}.${pre} plus a repeating part that starts one place later.`, `0.0${rep}${rep}… is one tenth of 0.${rep}${rep}… = ${F(rep, 9)}, so it is ${F(rep, 90)}.`, `${F(pre, 10)} + ${F(rep, 90)} = ${F(9 * pre, 90)} + ${F(rep, 90)} = ${b(fr(n, d))}`]
    : [`${F(1, unit)} = 0.${rep.length === 1 ? '111' : '010101'}…, so 0.${rep}${rep}… is ${Number(rep)} of those: ${F(Number(rep), unit)}.`, w ? `Add the ${w} wholes: ${w} + ${F(Number(rep), unit)} = ${b(fr(n, d))}` : `Simplest form: ${b(fr(n, d))}`];
  return { ask: `Write as a fraction. The bar means ${rep.length === 1 ? 'that digit repeats' : 'those digits repeat'} forever.`, expr: `${shown} = ${w}.${pre}${rep}${rep}${rep}…`, answer: frac(n, d), hint: `Call it x. What can you multiply by so the repeating part lines up again?`, _t: { k: 'rep', w, pre, rep },
    ways: [algebra(w, pre, rep, n, d), way(pre ? 'Split it into two parts' : rep.length === 1 ? 'Use ninths' : 'Use ninety-ninths', parts)] };
}
const twoDigits = () => { const v = rnd(1, 98); return v % 11 === 0 ? twoDigits() : String(v).padStart(2, '0'); };
export function genRational(L) {
  if (L === 1) return classify(1);
  if (L === 2) return chance(0.55) ? repeating(0, '', String(rnd(1, 8))) : classify(2);
  const t = rnd(0, 3);
  if (t === 0) return repeating(0, '', twoDigits());
  if (t === 1) { const a = rnd(1, 9), d = rnd(1, 8); return a === d ? null : repeating(0, String(a), String(d)); }
  if (t === 2) return repeating(rnd(1, 5), '', String(rnd(1, 8)));
  return oddOne();
}
