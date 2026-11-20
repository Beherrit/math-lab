// Order of operations: choose the expression for a described calculation or a story, without working the answer out first.
import { rnd, pick, fmt, k, b, way, nm, choice } from '../../util.js';
import { T, rd } from './helpers.js';
import { calc, clean } from './calc.js';

const n = (lo, hi) => rnd(lo, hi);
// Each template: make() the numbers, words(v) the description, good(v) the matching expression, bad(v) three look-alikes,
// pieces(v) how the words turn into symbols, steps(v) the calculation in order. L is the earliest step it appears in.
const WORDS = [
  { id: 0, L: 2, make: () => ({ a: n(2, 9), b: n(2, 9), c: n(2, 6), d: n(1, 9) }), words: v => `Add ${v.a} and ${v.b}. Multiply the sum by ${v.c}, then subtract ${v.d}.`, good: v => `${v.c} × (${v.a} + ${v.b}) − ${v.d}`,
    bad: v => [`${v.c} × ${v.a} + ${v.b} − ${v.d}`, `${v.c} × (${v.a} + ${v.b} − ${v.d})`, `(${v.c} + ${v.a}) × ${v.b} − ${v.d}`],
    pieces: v => [`“Add ${v.a} and ${v.b}” is ${v.a} + ${v.b}.`, `The sum is multiplied by ${v.c}, so it goes in brackets: ${v.c} × (${v.a} + ${v.b}).`, `Then “subtract ${v.d}” goes on the end: − ${v.d}.`],
    steps: v => [`${v.a} + ${v.b} = ${v.a + v.b}`, `${v.c} × ${v.a + v.b} = ${v.c * (v.a + v.b)}`, `${v.c * (v.a + v.b)} − ${v.d} = ${v.c * (v.a + v.b) - v.d}`] },
  { id: 1, L: 2, make: () => { const c = n(2, 9), bb = n(2, 9); return { a: c + bb * n(2, 9), b: bb, c }; }, words: v => `Subtract ${v.c} from ${v.a}, then divide the difference by ${v.b}.`, good: v => `(${v.a} − ${v.c}) ÷ ${v.b}`,
    bad: v => [`${v.a} − ${v.c} ÷ ${v.b}`, `${v.a} ÷ ${v.b} − ${v.c}`, `(${v.c} − ${v.a}) ÷ ${v.b}`],
    pieces: v => [`“Subtract ${v.c} from ${v.a}” means start with ${v.a} and take ${v.c} away: ${v.a} − ${v.c}.`, `The difference is divided by ${v.b}, so it goes in brackets: (${v.a} − ${v.c}) ÷ ${v.b}.`],
    steps: v => [`${v.a} − ${v.c} = ${v.a - v.c}`, `${v.a - v.c} ÷ ${v.b} = ${(v.a - v.c) / v.b}`] },
  { id: 2, L: 2, make: () => { for (;;) { const a = n(2, 9), bb = n(2, 9), d = n(2, 6), c = d * n(2, 9) - a * bb; if (c >= 1 && c <= 20) return { a, b: bb, c, d }; } }, words: v => `Multiply ${v.a} by ${v.b}. Add ${v.c} to the product, then divide by ${v.d}.`, good: v => `(${v.a} × ${v.b} + ${v.c}) ÷ ${v.d}`,
    bad: v => [`${v.a} × ${v.b} + ${v.c} ÷ ${v.d}`, `${v.a} × (${v.b} + ${v.c}) ÷ ${v.d}`, `(${v.a} × ${v.b}) ÷ (${v.c} + ${v.d})`],
    pieces: v => [`“Multiply ${v.a} by ${v.b}” is ${v.a} × ${v.b}.`, `“Add ${v.c} to the product” is ${v.a} × ${v.b} + ${v.c}.`, `All of that is then divided by ${v.d}, so it goes in brackets: (${v.a} × ${v.b} + ${v.c}) ÷ ${v.d}.`],
    steps: v => [`${v.a} × ${v.b} = ${v.a * v.b}`, `${v.a * v.b} + ${v.c} = ${v.a * v.b + v.c}`, `${v.a * v.b + v.c} ÷ ${v.d} = ${(v.a * v.b + v.c) / v.d}`] },
  { id: 3, L: 3, make: () => { const d = n(1, 6); return { a: n(2, 9), b: n(2, 9), c: d + n(2, 6), d }; }, words: v => `Add ${v.a} and ${v.b}. Multiply that by the difference of ${v.c} and ${v.d}.`, good: v => `(${v.a} + ${v.b}) × (${v.c} − ${v.d})`,
    bad: v => [`${v.a} + ${v.b} × ${v.c} − ${v.d}`, `(${v.a} + ${v.b}) × ${v.c} − ${v.d}`, `${v.a} + ${v.b} × (${v.c} − ${v.d})`],
    pieces: v => [`“Add ${v.a} and ${v.b}” is (${v.a} + ${v.b}).`, `“The difference of ${v.c} and ${v.d}” is (${v.c} − ${v.d}).`, `One group is multiplied by the other: (${v.a} + ${v.b}) × (${v.c} − ${v.d}).`],
    steps: v => [`${v.a} + ${v.b} = ${v.a + v.b}`, `${v.c} − ${v.d} = ${v.c - v.d}`, `${v.a + v.b} × ${v.c - v.d} = ${(v.a + v.b) * (v.c - v.d)}`] },
  { id: 4, L: 3, make: () => ({ a: n(2, 6), b: n(2, 9), c: n(2, 6), d: n(2, 6) }), words: v => `Multiply ${v.a} by the sum of ${v.b} and the product of ${v.c} and ${v.d}.`, good: v => `${v.a} × (${v.b} + ${v.c} × ${v.d})`,
    bad: v => [`${v.a} × ${v.b} + ${v.c} × ${v.d}`, `(${v.a} × ${v.b} + ${v.c}) × ${v.d}`, `${v.a} × (${v.b} + ${v.c}) × ${v.d}`],
    pieces: v => [`“The product of ${v.c} and ${v.d}” is ${v.c} × ${v.d}.`, `“The sum of ${v.b} and that product” is ${v.b} + ${v.c} × ${v.d}.`, `That whole sum is multiplied by ${v.a}, so it goes in brackets: ${v.a} × (${v.b} + ${v.c} × ${v.d}).`],
    steps: v => [`${v.c} × ${v.d} = ${v.c * v.d}`, `${v.b} + ${v.c * v.d} = ${v.b + v.c * v.d}`, `${v.a} × ${v.b + v.c * v.d} = ${v.a * (v.b + v.c * v.d)}`] },
  { id: 5, L: 3, make: () => { for (;;) { const c = n(2, 6), a = n(2, 20), bb = n(2, 20); if ((a + bb) % c === 0) return { a, b: bb, c, d: n(1, 9) }; } }, words: v => `Divide the sum of ${v.a} and ${v.b} by ${v.c}, then add ${v.d}.`, good: v => `(${v.a} + ${v.b}) ÷ ${v.c} + ${v.d}`,
    bad: v => [`${v.a} + ${v.b} ÷ ${v.c} + ${v.d}`, `(${v.a} + ${v.b}) ÷ (${v.c} + ${v.d})`, `${v.a} + ${v.b} ÷ (${v.c} + ${v.d})`],
    pieces: v => [`“The sum of ${v.a} and ${v.b}” is ${v.a} + ${v.b}, and it is divided by ${v.c}, so it goes in brackets: (${v.a} + ${v.b}) ÷ ${v.c}.`, `Then “add ${v.d}” goes on the end: + ${v.d}.`],
    steps: v => [`${v.a} + ${v.b} = ${v.a + v.b}`, `${v.a + v.b} ÷ ${v.c} = ${(v.a + v.b) / v.c}`, `${(v.a + v.b) / v.c} + ${v.d} = ${(v.a + v.b) / v.c + v.d}`] },
  { id: 6, L: 2, make: () => ({ a: n(2, 9), b: n(2, 9), c: n(1, 9) }), words: v => `Triple the sum of ${v.a} and ${v.b}, then take away ${v.c}.`, good: v => `3 × (${v.a} + ${v.b}) − ${v.c}`,
    bad: v => [`3 × ${v.a} + ${v.b} − ${v.c}`, `3 × (${v.a} + ${v.b} − ${v.c})`, `(3 + ${v.a}) × ${v.b} − ${v.c}`],
    pieces: v => [`“The sum of ${v.a} and ${v.b}” is ${v.a} + ${v.b}.`, `“Triple” means × 3, and it triples the whole sum, so the sum goes in brackets: 3 × (${v.a} + ${v.b}).`, `Then “take away ${v.c}” goes on the end: − ${v.c}.`],
    steps: v => [`${v.a} + ${v.b} = ${v.a + v.b}`, `3 × ${v.a + v.b} = ${3 * (v.a + v.b)}`, `${3 * (v.a + v.b)} − ${v.c} = ${3 * (v.a + v.b) - v.c}`] },
];
// Everything for one expression question: the words (or story), the four expressions, and two ways of showing why.
function build(t, v, extra, kind) {
  const good = t.good(v), bad = t.bad(v), val = calc(good);
  if (!clean(val) || bad.some(e => calc(e) === val) || new Set([good, ...bad]).size < 4) return null;
  const steps = t.steps(v);
  return T({ ...extra, answer: choice(good, bad),
    ways: [way('Say it in pieces', [...t.pieces(v), `So the expression is ${b(good)}.`]),
      way('Work it out and test the choices', [...steps, `${good} gives ${val}, like the words. The look-alikes give ${bad.map(e => fmt(calc(e))).join(', ')}.`, `Only ${b(good)} gives ${val}.`])],
    hint: 'Which part has to happen first? Anything that has to happen first usually goes in brackets.' }, kind, { tpl: t.id, ...v });
}
export function grWrite(L) {
  for (;;) {
    const t = pick(WORDS.filter(w => (L === 2 ? w.L === 2 : w.L >= 2))), v = t.make(), p = build(t, v, { ask: 'Which expression matches the words?', expr: `“${t.words(v)}”`, exprSmall: true }, 'grWrite');
    if (p) return p;
  }
}
const STORIES = [
  { id: 'S0', L: 2, make: () => { const p = n(2, 5), q = n(8, 15), r = n(2, 4), s = n(2, 6), A = pick([50, 60, 80, 100]); return A > p * q + r * s ? { A, p, q, r, s } : null; },
    text: (v, who) => `${who} has ${k('$' + v.A)}. ${who} buys ${k(v.p + ' tickets')} at ${k('$' + v.q)} each and ${k(v.r + ' snacks')} at ${k('$' + v.s)} each.`, ask: 'Which expression shows how much money is left?',
    good: v => `${v.A} − (${v.p} × ${v.q} + ${v.r} × ${v.s})`, bad: v => [`${v.A} − ${v.p} × ${v.q} + ${v.r} × ${v.s}`, `(${v.A} − ${v.p}) × ${v.q} + ${v.r} × ${v.s}`, `${v.A} − ${v.p} × (${v.q} + ${v.r}) × ${v.s}`],
    pieces: v => [`Tickets cost ${v.p} × ${v.q}, and snacks cost ${v.r} × ${v.s}.`, `Both are spent, so they are added together inside brackets: (${v.p} × ${v.q} + ${v.r} × ${v.s}).`, `That total is taken away from ${v.A}.`],
    steps: v => [`${v.p} × ${v.q} = ${v.p * v.q}`, `${v.r} × ${v.s} = ${v.r * v.s}`, `${v.p * v.q} + ${v.r * v.s} = ${v.p * v.q + v.r * v.s}`, `${v.A} − ${v.p * v.q + v.r * v.s} = ${v.A - v.p * v.q - v.r * v.s}`], know: v => [`$${v.A} to start`, `${v.p} tickets at $${v.q} each`, `${v.r} snacks at $${v.s} each`], find: 'The money that is left.', clue: '“buys” means spending: add everything spent, then subtract it from the start.' },
  { id: 'S1', L: 2, make: () => { for (;;) { const p = n(2, 6), q = n(5, 12), s = n(2, 6), r = s * n(2, 9) - p * q; if (r >= 1 && r <= 12) return { p, q, r, s }; } },
    text: (v, who) => `${who} has ${k(v.p + ' boxes')} with ${k(v.q + ' pencils')} in each box, plus ${k(v.r + ' loose pencils')}. ${who} shares all the pencils equally among ${k(v.s + ' classes')}.`, ask: 'Which expression shows how many pencils each class gets?',
    good: v => `(${v.p} × ${v.q} + ${v.r}) ÷ ${v.s}`, bad: v => [`${v.p} × ${v.q} + ${v.r} ÷ ${v.s}`, `${v.p} × (${v.q} + ${v.r}) ÷ ${v.s}`, `(${v.p} × ${v.q}) ÷ ${v.s} + ${v.r}`],
    pieces: v => [`Pencils in boxes: ${v.p} × ${v.q}. Add the loose ones: ${v.p} × ${v.q} + ${v.r}.`, `All of them are shared equally, so the whole total is divided: (${v.p} × ${v.q} + ${v.r}) ÷ ${v.s}.`],
    steps: v => [`${v.p} × ${v.q} = ${v.p * v.q}`, `${v.p * v.q} + ${v.r} = ${v.p * v.q + v.r}`, `${v.p * v.q + v.r} ÷ ${v.s} = ${(v.p * v.q + v.r) / v.s}`], know: v => [`${v.p} boxes of ${v.q} pencils`, `${v.r} loose pencils`, `${v.s} classes`], find: 'The pencils each class gets.', clue: '“shares all the pencils equally” means divide the whole total.' },
  { id: 'S2', L: 3, make: () => { for (;;) { const p = n(3, 8), q = n(6, 14), s = n(2, 6), r = p * q - s * n(3, 12); if (r >= 1 && r <= 15) return { p, q, r, s }; } },
    text: (v) => `A crate has ${k(v.p + ' rows')} of ${k(v.q + ' apples')}. ${k(v.r + ' apples')} are bruised and thrown out. The rest are shared equally among ${k(v.s + ' bags')}.`, ask: 'Which expression shows how many apples go in each bag?',
    good: v => `(${v.p} × ${v.q} − ${v.r}) ÷ ${v.s}`, bad: v => [`${v.p} × ${v.q} − ${v.r} ÷ ${v.s}`, `${v.p} × (${v.q} − ${v.r}) ÷ ${v.s}`, `(${v.p} × ${v.q}) ÷ ${v.s} − ${v.r}`],
    pieces: v => [`Apples in the crate: ${v.p} × ${v.q}. Take away the bruised ones: ${v.p} × ${v.q} − ${v.r}.`, `“The rest” are shared equally, so that whole amount is divided: (${v.p} × ${v.q} − ${v.r}) ÷ ${v.s}.`],
    steps: v => [`${v.p} × ${v.q} = ${v.p * v.q}`, `${v.p * v.q} − ${v.r} = ${v.p * v.q - v.r}`, `${v.p * v.q - v.r} ÷ ${v.s} = ${(v.p * v.q - v.r) / v.s}`], know: v => [`${v.p} rows of ${v.q} apples`, `${v.r} bruised apples`, `${v.s} bags`], find: 'The apples in each bag.', clue: '“the rest” means what is left after taking the bruised ones away, and then it is divided.' },
];
export function grStory(L) {
  for (;;) {
    const t = pick(STORIES.filter(s => (L === 2 ? s.L === 2 : s.id !== 'S1'))), v = t.make();
    if (!v) continue;
    const who = nm(), p = build(t, v, { story: t.text(v, who), ask: t.ask, op: 'multi', read: rd(t.find, t.know(v), t.clue, t.good(v)) }, 'grStory');
    if (p) return p;
  }
}
