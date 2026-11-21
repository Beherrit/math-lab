// Multiplicative comparison: "3 times as many", told apart from "3 more", with bars, in count and measure scenes.
import { rnd, pick, chance, shuffle, fmt, b, k, way, nm, num, choice } from '../../util.js';
import { oneOf, plural, tagged } from './helpers.js';
import { blockBars } from './visuals-measure.js';

const cap = s => s[0].toUpperCase() + s.slice(1);
// [one, many, most you would believe]
const COUNT = [['sticker', 'stickers', 300], ['trading card', 'trading cards', 250], ['song', 'songs', 200], ['marble', 'marbles', 300], ['goal', 'goals', 60], ['photo', 'photos', 300], ['coin', 'coins', 150],
  ['book', 'books', 60], ['point', 'points', 200], ['push-up', 'push-ups', 80]];
const MEAS = [
  { a: 'the red ribbon', c: 'the blue ribbon', vp: n => `is ${n} cm long`, la: 'Red', lc: 'Blue', adj: 'long', unit: 'cm', lo: 4, hi: 30, max: 240 },
  { a: 'the puppy', c: 'the dog', vp: n => `weighs ${n} kg`, la: 'Puppy', lc: 'Dog', adj: 'heavy', unit: 'kg', lo: 2, hi: 9, max: 45 },
  { a: 'the sapling', c: 'the old oak', vp: n => `is ${n} m tall`, la: 'Sapling', lc: 'Oak', adj: 'tall', unit: 'm', lo: 2, hi: 6, max: 36 },
  { a: 'Monday’s run', c: 'Saturday’s run', vp: n => `is ${n} km long`, la: 'Monday', lc: 'Saturday', adj: 'long', unit: 'km', lo: 2, hi: 8, max: 32 },
];
const RANGE = [{ s: [2, 5], t: [2, 5] }, { s: [3, 12], t: [2, 9] }, { s: [6, 25], t: [3, 12] }];

// One scene: what is compared, the sentences about it and the questions that can be asked. Null when the numbers do not fit it.
function scene(L, only) {
  const { s: [s0, s1], t: [t0, t1] } = RANGE[L - 1];
  if (only === 'count' || (!only && chance(0.5))) {
    let one, many, most, s, t;
    do { [one, many, most] = pick(COUNT); s = rnd(s0, s1); t = rnd(t0, t1); } while (s * t > most);
    const A = nm(); let B = nm(), C = nm();
    while (B === A) B = nm();
    while (C === A || C === B) C = nm();
    return { A, B, C, s, t, prod: s * t, one, many, la: A, lc: B, as: 'many', has: n => `${A} has ${plural(n, one, many)}.`, hasBig: n => `${B} has ${plural(n, one, many)}.`,
      times: n => `${B} has ${n} times as many ${many} as ${A}.`, back: n => `That is ${n} times as many as ${A} has.`, more: n => `${C} has ${n} more ${n === 1 ? one : many} than ${A}.`,
      askBig: `How many ${many} does ${B} have?`, askSmall: `How many ${many} does ${A} have?`, howQ: `How many times as many ${many} does ${B} have as ${A}?`, together: `How many ${many} do ${A} and ${B} have together?` };
  }
  const m = pick(MEAS), lo = Math.max(m.lo, s0), hi = Math.min(m.hi, s1);
  if (lo > hi) return null;
  const s = rnd(lo, hi), t = rnd(t0, t1);
  if (s * t > m.max) return null;
  return { A: m.a, B: m.c, s, t, prod: s * t, la: m.la, lc: m.lc, suffix: m.unit, as: m.adj, has: n => `${cap(m.a)} ${m.vp(n)}.`, hasBig: n => `${cap(m.c)} ${m.vp(n)}.`,
    times: n => `${cap(m.c)} is ${n} times as ${m.adj} as ${m.a}.`, back: n => `That is ${n} times as ${m.adj} as ${m.a}.`, askBig: `How ${m.adj} is ${m.c}?`, askSmall: `How ${m.adj} is ${m.a}?`,
    howQ: `How many times as ${m.adj} is ${m.c} as ${m.a}?` };
}
const bars = (sc, small, big, endS, endB) => blockBars([{ label: sc.la, count: 1, inside: small, end: endS }, { label: sc.lc, count: sc.t, inside: big, end: endB }]);
const copies = (s, t) => (t <= 6 ? `${Array(t).fill(s).join(' + ')} = ${s * t}` : `${t} × ${s} = ${s * t}`);

function bigger(L) {
  const sc = scene(L);
  if (!sc) return null;
  const { s, t, prod } = sc;
  return { ask: `${sc.has(s)} ${sc.times(t)} ${sc.askBig}`, visual: L === 1 || (L === 2 && chance(0.4)) ? bars(sc, fmt(s), '') : undefined, answer: num(prod), suffix: sc.suffix, _t: { kind: 'timesBig', s, t },
    hint: `“${t} times as ${sc.as}” means ${t} copies of the smaller amount.`,
    ways: [way('Draw the bars', [bars(sc, fmt(s), fmt(s)), `The second bar is ${t} copies of the first bar, each worth ${s}.`, copies(s, t), `Answer: ${b(fmt(prod))}`]),
      way('Multiply', [`“${t} times as ${sc.as}” means ${t} equal groups, each the size of ${s}.`, `${t} × ${s} = ${b(fmt(prod))}`])] };
}
function smaller(L) {
  const sc = scene(L);
  if (!sc) return null;
  const { s, t, prod } = sc;
  return { ask: `${sc.hasBig(prod)} ${sc.back(t)} ${sc.askSmall}`, visual: L === 1 ? bars(sc, '?', '', '', `= ${fmt(prod)}`) : undefined, answer: num(s), suffix: sc.suffix, _t: { kind: 'timesSmall', big: prod, t },
    hint: `The bigger amount is ${t} equal copies of the smaller one. How big is one copy?`,
    ways: [way('Share it out', [`The bigger amount is ${t} equal copies of the smaller amount, so split ${fmt(prod)} into ${t} equal parts.`, `${fmt(prod)} ÷ ${t} = ${b(fmt(s))}`]),
      way('Ask a multiplication', [`${t} × ? = ${fmt(prod)}`, `${t} × ${s} = ${fmt(prod)}, so the smaller amount is ${b(fmt(s))}.`])] };
}
// How many times as big, read off the bars or worked out from the two amounts.
function howMany(L) {
  const sc = scene(L);
  if (!sc) return null;
  const { s, t, prod } = sc, skip = Array.from({ length: t }, (_, i) => s * (i + 1)).join(', ');
  const p = { ask: L === 1 ? `Look at the bars. ${sc.howQ}` : `${sc.has(s)} ${sc.hasBig(prod)} ${sc.howQ}`, visual: L === 1 ? bars(sc, '', '', `= ${fmt(s)}`, `= ${fmt(prod)}`) : undefined,
    answer: num(t), _t: { kind: 'timesHow', s, prod }, hint: 'How many copies of the smaller amount fit into the bigger one?',
    ways: [way('Divide', [`“How many times as ${sc.as}” asks how many copies of ${s} make ${fmt(prod)}.`, `${fmt(prod)} ÷ ${s} = ${b(t)}`]),
      way('Count by the small amount', [`Count by ${s}: ${skip}.`, `It takes ${b(t)} jumps to reach ${fmt(prod)}.`])] };
  return L === 1 ? tagged(p, { s, prod }) : p;
}

// "More" and "times as many" say different things: only one sentence fits both amounts.
const sentence = (sc, kindOf, n) => (kindOf === 'times' ? `${sc.B} has ${n} times as many ${sc.many} as ${sc.A}` : `${sc.B} has ${n} more ${n === 1 ? sc.one : sc.many} than ${sc.A}`);
function tell(L) {
  const sc = scene(L, 'count');
  const { s, t, prod } = sc, holds = ([kindOf, n]) => (kindOf === 'times' ? n * s === prod : s + n === prod);
  const wrong = shuffle([['more', t], ['times', prod - s], ['times', s], ['more', t + 1], ['times', t + 1], ['more', s]]).filter(c => !holds(c)).slice(0, 3);
  const good = sentence(sc, 'times', t), diff = prod - s;
  return { ask: `${sc.has(s)} ${sc.hasBig(prod)} Which sentence is true?`, answer: choice(good, wrong.map(([kd, n]) => sentence(sc, kd, n))), _t: { kind: 'timesTell', s, prod },
    hint: 'A “times as many” sentence is about multiplying. A “more” sentence is about adding. Test each one.',
    ways: [way('Test the sentence', [`${t} × ${s} = ${prod}, so ${sc.B} has ${t} times as many as ${sc.A}.`, `The true sentence is: ${b(good)}.`]),
      way('Subtract or divide?', [`Subtracting tells how many MORE: ${prod} − ${s} = ${diff}.`, `Dividing tells how many TIMES: ${prod} ÷ ${s} = ${t}.`, `Only dividing fits a “times as many” sentence, so the true one is: ${b(good)}.`])] };
}
function diff(L) {
  const sc = scene(L, 'count'), m = rnd(2, 12), { s, t, prod } = sc, other = s + m;
  if (prod - other < 2) return null;
  return { ask: `${sc.has(s)} ${sc.times(t)} ${sc.more(m)} How many more ${sc.many} does ${sc.B} have than ${sc.C}?`, answer: num(prod - other), _t: { kind: 'timesDiff', s, t, m }, hint: `Work out how many ${sc.B} has and how many ${sc.C} has. Then compare them.`,
    ways: [way('Find each amount', [`${sc.B}: ${t} × ${s} = ${prod}`, `${sc.C}: ${s} + ${m} = ${other}`, `${prod} − ${other} = ${b(prod - other)}`]),
      way('Compare the extras', [`${sc.B} has ${t} copies of ${s}, which is ${s} plus ${t - 1} more copies: ${s} + ${(t - 1) * s}.`, `${sc.C} has ${s} plus ${m}.`, `Both start with ${s}, so compare the extras: ${(t - 1) * s} − ${m} = ${b(prod - other)}`])] };
}
function together(L) {
  const sc = scene(L, 'count'), { s, t, prod } = sc;
  return { ask: `${sc.has(s)} ${sc.times(t)} ${sc.together}`, answer: num(s + prod), _t: { kind: 'timesTogether', s, t }, hint: `First find how many ${sc.B} has.`,
    ways: [way('Find the big amount first', [`${sc.B}: ${t} × ${s} = ${prod}`, `Together: ${s} + ${prod} = ${b(s + prod)}`]),
      way('Count the copies', [`${sc.A} has 1 copy of ${s}, and ${sc.B} has ${t} copies.`, `That is ${t + 1} copies in all: ${t + 1} × ${s} = ${b(s + prod)}`])] };
}
function chain(L) {
  const sc = scene(L, 'count'), u = rnd(2, 4), { s, t, prod } = sc, three = prod * u;
  return { ask: `${sc.has(s)} ${sc.times(t)} ${sc.C} has ${u} times as many ${sc.many} as ${sc.B}. How many ${sc.many} does ${sc.C} have?`, answer: num(three), _t: { kind: 'timesChain', s, t, u },
    hint: `Work from ${sc.A} to ${sc.B} first, then from ${sc.B} to ${sc.C}.`,
    ways: [way('One comparison at a time', [`${sc.B}: ${t} × ${s} = ${prod}`, `${sc.C}: ${u} × ${prod} = ${b(fmt(three))}`]), way('Multiply all three', [`${sc.C} has ${u} × ${t} copies of ${s}.`, `${u} × ${t} × ${s} = ${b(fmt(three))}`])] };
}

// A story source: the same comparison, written as a short story.
export function timesWord(L) {
  const sc = scene(L === 1 ? 2 : L);
  if (!sc) return null;
  const { s, t, prod } = sc, mark = x => x.replace(/\d[\d,]*/g, d => k(d)), up = chance(0.5);
  const base = { story: mark(up ? `${sc.has(s)} ${sc.times(t)}` : `${sc.hasBig(prod)} ${sc.back(t)}`), ask: up ? sc.askBig : sc.askSmall, suffix: sc.suffix };
  return up ? { ...base, answer: num(prod), op: 'mul', _t: { kind: 'timesBig', s, t }, hint: `“${t} times as ${sc.as}” means ${t} copies of the smaller amount.`,
    ways: [way('Multiply', [`${t} copies of ${s}: ${t} × ${s} = ${b(fmt(prod))}`]), way('Add the copies', [copies(s, t), `Answer: ${b(fmt(prod))}`])],
    read: { find: `The bigger amount.`, know: [`the small amount: ${s}`, `${t} times as ${sc.as}`], clue: `“${t} times as ${sc.as}” means ${t} equal groups of the small amount, so multiply.`, plan: `${t} × ${s}` } }
    : { ...base, answer: num(s), op: 'div', _t: { kind: 'timesSmall', big: prod, t }, hint: `The bigger amount is ${t} equal copies of the smaller one.`,
      ways: [way('Divide', [`${fmt(prod)} ÷ ${t} = ${b(fmt(s))}`]), way('Ask a multiplication', [`${t} × ? = ${fmt(prod)}`, `${t} × ${s} = ${fmt(prod)}, so the answer is ${b(fmt(s))}.`])],
      read: { find: 'The smaller amount.', know: [`the bigger amount: ${fmt(prod)}`, `${t} times as ${sc.as}`], clue: `The bigger amount is ${t} copies of the smaller, so divide.`, plan: `${fmt(prod)} ÷ ${t}` } };
}

const MAKERS = [[bigger, bigger, smaller, howMany, tell], [bigger, smaller, howMany, tell, together], [smaller, howMany, tell, diff, together, chain]];
export const genTimes = L => oneOf(MAKERS[L - 1], L);
