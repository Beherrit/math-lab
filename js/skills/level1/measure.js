// Measuring length: reading a ruler, comparing and joining lengths, choosing a unit, and lengths on a number line.
import { rnd, pick, chance, b, way, nm, num, choice } from '../../util.js';
import { cnt, mark, countList } from './words.js';
import { ruler, UNIT } from './ruler.js';
import { plusWays, minusWays } from './stories.js';

const label = (n, unit) => (unit === 'in' ? cnt(n, 'inch', 'inches') : `${n} cm`);
const withUnit = (p, unit) => ({ suffix: UNIT[unit].suffix, ...p });

function readQ(unit, from, to) {
  const d = to - from, u = UNIT[unit];
  return withUnit({ ask: `How long is the bar?${mark(unit, from, to)}`, visual: ruler(unit, [{ from, to }]), answer: num(d), hint: from ? 'Does the bar start at the 0 mark?' : 'Look at the mark where the right end of the bar touches.', _t: { f: 'len', from, to, unit },
    ways: from === 0 ? [way('Read the end mark', [`The bar starts at the 0 mark and ends at the ${to} mark.`, `So it is ${b(label(to, unit))} long.`]), way('Count the steps', [`Count one ${u.one} at a time from the start: ${countList(0, to)}.`, `${to} steps of one ${u.one}, so ${b(label(to, unit))}.`])]
      : [way('Subtract the two readings', [`The bar starts at ${from}, not at 0, and ends at ${to}.`, `${to} − ${from} = ${b(label(d, unit))}.`]), way('Count the steps', [`Count the steps from ${from} to ${to}: ${countList(from, d)}.`, `That is ${d} steps, so ${b(label(d, unit))}.`])] }, unit);
}
function compareQ(unit, a, c) {
  const flip = chance(0.5), bars = flip ? [{ from: 0, to: c, label: 'A' }, { from: 0, to: a, label: 'B' }] : [{ from: 0, to: a, label: 'A' }, { from: 0, to: c, label: 'B' }], [x, y] = flip ? ['B', 'A'] : ['A', 'B'], d = a - c;
  return withUnit({ ask: `How much longer is bar ${x} than bar ${y}?${mark(unit, a, c, flip)}`, visual: ruler(unit, bars), answer: num(d), hint: 'Read where each bar ends, then find the gap between the two.', _t: { f: 'sub', a, b: c, unit },
    ways: [way('Subtract the lengths', [`Bar ${x} ends at ${a} and bar ${y} ends at ${c}.`, `${a} − ${c} = ${b(label(d, unit))}.`]), way('Count on from the shorter bar', [`Count on from ${c} up to ${a}: ${countList(c, d)}.`, `That is ${d} steps, so bar ${x} is ${b(label(d, unit))} longer.`])] }, unit);
}
const SIZES = { metric: ['centimeters', 'meters', 'kilometers'], customary: ['inches', 'feet', 'miles'] };
const ITEMS = { metric: [['the length of a pencil', 'centimeters'], ['the width of a phone', 'centimeters'], ['the length of a paper clip', 'centimeters'], ['the length of a swimming pool', 'meters'], ['the height of a classroom door', 'meters'], ['a football field', 'meters'], ['a bus trip to another city', 'kilometers'], ['a bike ride to a friend in another town', 'kilometers']],
  customary: [['the length of a pencil', 'inches'], ['the width of a phone', 'inches'], ['the length of a bedroom', 'feet'], ['the height of a basketball hoop', 'feet'], ['a road trip to another state', 'miles'], ['a hike across a national park', 'miles']] };
function unitQ(system) {
  const [item, right] = pick(ITEMS[system]), sizes = SIZES[system], at = sizes.indexOf(right);
  const others = sizes.filter(s => s !== right).map(s => `${s} would be ${sizes.indexOf(s) > at ? 'much bigger than needed, so you would get a tiny number' : 'much smaller than needed, so you would get a huge number'}.`);
  return { ask: `Which unit is best for measuring ${item}?`, answer: choice(right, sizes.filter(s => s !== right)), choiceBig: true, hint: 'Think how big the thing is. A tiny thing needs a small unit and a huge distance needs a big one.', _t: { f: 'unit', item, system },
    ways: [way('Match the size', [system === 'metric' ? 'A centimeter is about the width of a fingernail. A meter is about one big step. A kilometer is about a ten minute walk.' : 'An inch is about the length of a thumb joint. A foot is about the length of a big shoe. A mile is about a twenty minute walk.', `So ${item} is best measured in ${b(right)}.`]),
      way('Rule out the others', [...others, `That leaves ${b(right)}.`])] };
}
function endQ(unit, from, d) {
  return ({ ask: `A bar starts at the ${from} mark of a ruler and is ${label(d, unit)} long. Which mark does the end of the bar touch?`, answer: num(from + d), hint: 'Count on from the starting mark, one step for each unit of length.', _t: { f: 'add', xs: [from, d], unit },
    ways: [way('Count on', [`Start at ${from} and count on ${d}: ${countList(from, d)}.`, `The bar ends at ${b(from + d)}.`]), way('Add', [`The end mark is the start mark plus the length.`, `${from} + ${d} = ${b(from + d)}.`])] });
}
function slipQ(unit, from, to) {
  const d = to - from;
  const who = nm();
  return withUnit({ ask: `${who} lines the left end of the bar up with the ${from} mark, not the 0 mark. The right end touches the ${to} mark, so ${who} says the bar is ${label(to, unit)} long. What is the real length of the bar?${mark(unit, from, to)}`, visual: ruler(unit, [{ from, to }]), answer: num(d), hint: 'A length is how far the bar stretches. Where does it start?', _t: { f: 'len', from, to, unit },
    ways: [way('Find the slip', [`The bar starts at ${from}, so the part of the ruler from 0 up to ${from} is not part of the bar.`, `${to} − ${from} = ${b(label(d, unit))}.`]), way('Count the steps', [`Count the steps from ${from} to ${to}: ${countList(from, d)}.`, `That is ${b(label(d, unit))}.`])] }, unit);
}
// Lengths in words: join two, cut one off, or compare two. Answers in cm, up to 100.
const JOIN = [(a, c, n) => `${n} lays two boards end to end. One is ${a} cm long and the other is ${c} cm long. How long are the two boards together?`, (a, c) => `A ribbon is ${a} cm long. A second piece is ${c} cm long. How long are they together?`];
const CUT = [(a, c, n) => `A rope is ${a} cm long. ${n} cuts off ${c} cm. How long is the rope now?`, (a, c) => `A pencil is ${a} cm long and a marker is ${c} cm long. How much longer is the pencil?`];
function wordsQ(a, c, join) {
  const n = nm(), t = join ? a + c : a - c, ask = pick(join ? JOIN : CUT)(a, c, n);
  return { ask, suffix: 'cm', answer: num(t), hint: join ? 'Putting lengths end to end means adding.' : 'Cutting off, or asking how much longer, means subtracting.', _t: join ? { f: 'add', xs: [a, c] } : { f: 'sub', a, b: c }, ways: join ? plusWays(a, c) : minusWays(a, c) };
}
function threeQ(a, c, e) {
  const t = a - c - e;
  return { ask: `A ribbon is ${a} cm long. ${nm()} uses ${c} cm for a bow and ${e} cm for a card. How much ribbon is left?`, suffix: 'cm', answer: num(t), hint: 'Two pieces come off the ribbon. Take them away one at a time.', _t: { f: 'add', xs: [a, -c, -e] },
    ways: [way('One piece at a time', [`${a} − ${c} = ${a - c}.`, `${a - c} − ${e} = ${b(t)}.`]), way('Add the pieces first', [`The two pieces together: ${c} + ${e} = ${c + e}.`, `${a} − ${c + e} = ${b(t)}.`])] };
}

export function genMeasure(L) {
  if (L === 1) {
    const t = pick(['read', 'read', 'compare', 'unit', 'end', 'words']), to = rnd(3, 14), a = rnd(8, 15), c = rnd(3, a - 2), f = rnd(1, 6);
    if (t === 'read') return readQ('cm', 0, to);
    if (t === 'compare') return compareQ('cm', a, c);
    if (t === 'unit') return unitQ('metric');
    if (t === 'end') return endQ('cm', f, rnd(2, 15 - f));
    if (chance(0.5)) return wordsQ(rnd(4, 9), rnd(3, 9), true);
    const big = rnd(10, 18);
    return wordsQ(big, rnd(3, Math.min(10, big - 3)), false);
  }
  if (L === 2) {
    const t = pick(['inch', 'start', 'compare', 'unit', 'slip', 'end', 'words']), unit = pick(['cm', 'in']), max = unit === 'in' ? 6 : 15, from = rnd(1, max - 3), to = rnd(from + 2, max);
    if (t === 'inch') return readQ('in', 0, rnd(2, 6));
    if (t === 'start') return readQ(unit, from, to);
    if (t === 'compare') return compareQ('in', rnd(4, 6), rnd(1, 3));
    if (t === 'unit') return unitQ(pick(['metric', 'customary']));
    if (t === 'slip') return slipQ(unit, from, to);
    if (t === 'end') return endQ(unit, from, rnd(2, max - from));
    return chance(0.5) ? wordsQ(rnd(20, 60), rnd(12, 38), true) : wordsQ(rnd(45, 99), rnd(12, 38), false);
  }
  const t = pick(['join', 'cut', 'three', 'slip', 'start', 'unit', 'compare']), unit = pick(['cm', 'in']), max = unit === 'in' ? 6 : 15, from = rnd(1, max - 3), to = rnd(from + 2, max);
  if (t === 'join') return wordsQ(rnd(25, 60), rnd(18, 39), true);
  if (t === 'cut') return wordsQ(rnd(45, 99), rnd(12, 40), false);
  if (t === 'three') { const c = rnd(10, 25), e = rnd(8, 25); return threeQ(rnd(c + e + 5, 99), c, e); }
  if (t === 'slip') return slipQ(unit, from, to);
  if (t === 'start') return readQ(unit, from, to);
  if (t === 'unit') return unitQ(pick(['metric', 'customary']));
  return compareQ(unit, unit === 'in' ? 6 : rnd(10, 15), unit === 'in' ? rnd(2, 4) : rnd(3, 8));
}
