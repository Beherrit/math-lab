// The kinds of two-step problem: numbers for each step, the answer, the first step, the written steps and a second, different way.
import { rnd, pick, b, way, fmt as f } from '../../util.js';
import { skips, rep } from './words.js';
import { hops } from './arith.js';
import { near } from './kit.js';

const pay = p => pick([20, 50, 100, 200, 300, 500].filter(x => x > p + 4));
const S = (a, r) => [`Step 1: ${a}`, `Step 2: ${r}`];
// vars(L): the numbers; ans, s1: answer and first-step value; expr: the whole thing as one line; steps and alt: two ways.
export const TYPES = {
  muladd: {
    vars: L => (L === 1 ? { g: rnd(2, 5), n: rnd(2, 9), e: rnd(2, 9) } : L === 2 ? { g: rnd(3, 8), n: rnd(4, 12), e: rnd(3, 20) } : { g: rnd(4, 9), n: rnd(12, 35), e: rnd(5, 40) }),
    ans: v => v.g * v.n + v.e, s1: v => v.g * v.n, expr: v => `${v.g} × ${v.n} + ${v.e}`, first: 'Find the total of the equal groups first.',
    steps: v => S(`${v.g} × ${v.n} = ${v.g * v.n}.`, `${f(v.g * v.n)} + ${v.e} = ${b(f(v.g * v.n + v.e))}.`),
    alt: v => way('Repeated addition', [`${v.g} groups of ${v.n}: ${rep(v.g, v.n)} = ${v.g * v.n}.`, `Then the extra ${v.e}: ${v.g * v.n} + ${v.e} = ${b(f(v.g * v.n + v.e))}.`]),
    est: v => [`${v.g} × ${near(v.n, 10)} + ${near(v.e, 10)}`, v.g * near(v.n, 10) + near(v.e, 10)],
    bad: v => [[`${v.g} × ${v.n} − ${v.e}`, v.g * v.n - v.e], [`${v.g} + ${v.n} + ${v.e}`, v.g + v.n + v.e], [`(${v.g} + ${v.e}) × ${v.n}`, (v.g + v.e) * v.n], [`${v.g} × (${v.n} + ${v.e})`, v.g * (v.n + v.e)]],
  },
  mulsub: {
    vars: L => { const g = L === 1 ? rnd(2, 4) : L === 2 ? rnd(3, 8) : rnd(3, 9), n = L === 1 ? rnd(3, 9) : L === 2 ? rnd(4, 14) : rnd(8, 35); return { g, n, pay: pay(g * n) }; },
    ans: v => v.pay - v.g * v.n, s1: v => v.g * v.n, expr: v => `${v.pay} − ${v.g} × ${v.n}`, first: 'Find the cost first.',
    steps: v => S(`${v.g} × ${v.n} = ${v.g * v.n}.`, `${f(v.pay)} − ${v.g * v.n} = ${b(f(v.pay - v.g * v.n))}.`),
    alt: v => way('Count up from the cost', [`Cost: ${v.g} × ${v.n} = ${v.g * v.n}. Count up from ${v.g * v.n} to ${f(v.pay)} in jumps: ${hops(v.g * v.n, v.pay).join(' + ')}.`, `The jumps add up to ${b(f(v.pay - v.g * v.n))}.`]),
    est: v => [`${v.pay} − ${v.g} × ${near(v.n, 10)}`, v.pay - v.g * near(v.n, 10)],
    bad: v => [[`${v.pay} − ${v.g} − ${v.n}`, v.pay - v.g - v.n], [`${v.pay} + ${v.g} × ${v.n}`, v.pay + v.g * v.n], [`(${v.pay} − ${v.g}) × ${v.n}`, (v.pay - v.g) * v.n], [`${v.pay} − ${v.g} × ${v.n} − ${v.n}`, v.pay - v.g * v.n - v.n]],
  },
  subdiv: {
    vars: L => { const d = L === 1 ? rnd(2, 4) : L === 2 ? rnd(3, 9) : rnd(4, 12), q = L === 1 ? rnd(2, 9) : L === 2 ? rnd(3, 10) : rnd(5, 12), e = L === 1 ? rnd(2, 8) : L === 2 ? rnd(3, 15) : rnd(6, 30); return { t: d * q + e, e, d }; },
    ans: v => (v.t - v.e) / v.d, s1: v => v.t - v.e, expr: v => `(${v.t} − ${v.e}) ÷ ${v.d}`, first: 'Take away the ones that are not shared first.',
    steps: v => S(`${v.t} − ${v.e} = ${v.t - v.e}.`, `${v.t - v.e} ÷ ${v.d} = ${b((v.t - v.e) / v.d)}.`),
    alt: v => way('Build it back', [`Each share times ${v.d} shares, plus the ${v.e} taken out, must make ${v.t}: ${v.d} × ? + ${v.e} = ${v.t}.`, `${v.d} × ${(v.t - v.e) / v.d} = ${v.t - v.e}, and ${v.t - v.e} + ${v.e} = ${v.t}. So the answer is ${b((v.t - v.e) / v.d)}.`]),
    bad: v => [[`${v.t} − ${v.e} ÷ ${v.d}`, v.t - v.e / v.d], [`${v.t} ÷ ${v.d} − ${v.e}`, v.t / v.d - v.e], [`(${v.t} + ${v.e}) ÷ ${v.d}`, (v.t + v.e) / v.d], [`${v.t} − ${v.e} × ${v.d}`, v.t - v.e * v.d]],
  },
  addmul: {
    vars: L => (L === 1 ? { a: rnd(2, 6), b: rnd(2, 6), g: rnd(2, 5) } : L === 2 ? { a: rnd(3, 12), b: rnd(3, 9), g: rnd(3, 9) } : { a: rnd(8, 25), b: rnd(6, 20), g: rnd(4, 9) }),
    ans: v => (v.a + v.b) * v.g, s1: v => v.a + v.b, expr: v => `(${v.a} + ${v.b}) × ${v.g}`, first: 'Find what one person has or spends first.',
    steps: v => S(`${v.a} + ${v.b} = ${v.a + v.b}.`, `${v.a + v.b} × ${v.g} = ${b(f((v.a + v.b) * v.g))}.`),
    alt: v => way('Multiply each part', [`${v.a} × ${v.g} = ${v.a * v.g} and ${v.b} × ${v.g} = ${v.b * v.g}.`, `${v.a * v.g} + ${v.b * v.g} = ${b(f((v.a + v.b) * v.g))}.`]),
    est: v => [`(${near(v.a, 10)} + ${near(v.b, 10)}) × ${v.g}`, (near(v.a, 10) + near(v.b, 10)) * v.g],
    bad: v => [[`${v.a} + ${v.b} × ${v.g}`, v.a + v.b * v.g], [`${v.a} × ${v.g} + ${v.b}`, v.a * v.g + v.b], [`${v.a} + ${v.b} + ${v.g}`, v.a + v.b + v.g], [`${v.a} × ${v.b} × ${v.g}`, v.a * v.b * v.g]],
  },
  adddiv: {
    vars: L => { const d = L === 1 ? rnd(2, 4) : L === 2 ? rnd(3, 9) : rnd(4, 12), hi = L === 1 ? 5 : L === 2 ? 8 : 10; return { a: d * rnd(2, hi), b: d * rnd(2, hi), d }; },
    ans: v => (v.a + v.b) / v.d, s1: v => v.a + v.b, expr: v => `(${v.a} + ${v.b}) ÷ ${v.d}`, first: 'Join the amounts that are being shared first.',
    steps: v => S(`${v.a} + ${v.b} = ${v.a + v.b}.`, `${v.a + v.b} ÷ ${v.d} = ${b((v.a + v.b) / v.d)}.`),
    alt: v => way('Divide each part', [`${v.a} ÷ ${v.d} = ${v.a / v.d} and ${v.b} ÷ ${v.d} = ${v.b / v.d}.`, `${v.a / v.d} + ${v.b / v.d} = ${b((v.a + v.b) / v.d)}.`]),
    bad: v => [[`${v.a} + ${v.b} ÷ ${v.d}`, v.a + v.b / v.d], [`${v.a} ÷ ${v.d} + ${v.b}`, v.a / v.d + v.b], [`(${v.a} − ${v.b}) ÷ ${v.d}`, (v.a - v.b) / v.d], [`${v.a} + ${v.b} − ${v.d}`, v.a + v.b - v.d]],
  },
  divadd: {
    vars: L => { const d = L === 1 ? rnd(2, 4) : L === 2 ? rnd(3, 9) : rnd(4, 12), q = L === 1 ? rnd(2, 8) : L === 2 ? rnd(3, 10) : rnd(5, 12); return { t: d * q, d, e: L === 1 ? rnd(2, 9) : L === 2 ? rnd(3, 15) : rnd(6, 30) }; },
    ans: v => v.t / v.d + v.e, s1: v => v.t / v.d, expr: v => `${v.t} ÷ ${v.d} + ${v.e}`, first: 'Share out the total first.',
    steps: v => S(`${v.t} ÷ ${v.d} = ${v.t / v.d}.`, `${v.t / v.d} + ${v.e} = ${b(v.t / v.d + v.e)}.`),
    alt: v => way('Skip count, then add', [`Count by ${v.d}s to reach ${v.t}: ${skips(v.t / v.d, v.d)}. That took ${v.t / v.d} counts.`, `${v.t / v.d} + ${v.e} = ${b(v.t / v.d + v.e)}.`]),
    bad: v => [[`${v.t} ÷ (${v.d} + ${v.e})`, v.t / (v.d + v.e)], [`(${v.t} + ${v.e}) ÷ ${v.d}`, (v.t + v.e) / v.d], [`${v.t} ÷ ${v.d} − ${v.e}`, v.t / v.d - v.e], [`${v.t} + ${v.d} + ${v.e}`, v.t + v.d + v.e]],
  },
  divsub: {
    vars: L => { const d = L === 1 ? rnd(2, 4) : L === 2 ? rnd(3, 9) : rnd(4, 12), q = L === 1 ? rnd(4, 9) : L === 2 ? rnd(6, 12) : rnd(8, 12); return { t: d * q, d, e: rnd(2, L === 1 ? q - 2 : L === 2 ? q - 2 : q - 1) }; },
    ans: v => v.t / v.d - v.e, s1: v => v.t / v.d, expr: v => `${v.t} ÷ ${v.d} − ${v.e}`, first: 'Share out the total first.',
    steps: v => S(`${v.t} ÷ ${v.d} = ${v.t / v.d}.`, `${v.t / v.d} − ${v.e} = ${b(v.t / v.d - v.e)}.`),
    alt: v => way('Skip count, then take away', [`Count by ${v.d}s to reach ${v.t}: ${skips(v.t / v.d, v.d)}. That took ${v.t / v.d} counts.`, `${v.t / v.d} − ${v.e} = ${b(v.t / v.d - v.e)}.`]),
    bad: v => [[`${v.t} ÷ ${v.d} + ${v.e}`, v.t / v.d + v.e], [`(${v.t} − ${v.e}) ÷ ${v.d}`, (v.t - v.e) / v.d], [`${v.t} − ${v.d} − ${v.e}`, v.t - v.d - v.e], [`${v.t} − ${v.e} ÷ ${v.d}`, v.t - v.e / v.d]],
  },
  addsub: {
    vars: L => { const a = L === 1 ? rnd(15, 50) : L === 2 ? rnd(60, 250) : rnd(150, 500), c = Math.max(3, Math.floor(a * rnd(20, 90) / 100)); return { a, b: L === 1 ? rnd(5, 30) : L === 2 ? rnd(30, 200) : rnd(80, 400), c }; },
    ans: v => v.a + v.b - v.c, s1: v => v.a + v.b, expr: v => `${v.a} + ${v.b} − ${v.c}`, first: 'Go in order: start with the first change.',
    steps: v => S(`${v.a} + ${v.b} = ${v.a + v.b}.`, `${v.a + v.b} − ${v.c} = ${b(v.a + v.b - v.c)}.`),
    alt: v => way('Take away first', [`${v.a} − ${v.c} = ${v.a - v.c}.`, `${v.a - v.c} + ${v.b} = ${b(v.a + v.b - v.c)}.`]),
    est: v => [`${near(v.a, 10)} + ${near(v.b, 10)} − ${near(v.c, 10)}`, near(v.a, 10) + near(v.b, 10) - near(v.c, 10)],
    bad: v => [[`${v.a} + ${v.b} + ${v.c}`, v.a + v.b + v.c], [`${v.a} − ${v.b} + ${v.c}`, v.a - v.b + v.c], [`${v.a} − ${v.b} − ${v.c}`, v.a - v.b - v.c], [`${v.a} + ${v.b} × ${v.c}`, v.a + v.b * v.c]],
  },
};
export const KINDS = Object.keys(TYPES);
