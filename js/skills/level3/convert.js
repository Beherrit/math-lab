// Converting a measurement from a larger unit to a smaller one (km, m, cm, kg, g, L, mL, h, min, s, ft, in, lb, oz).
import { rnd, pick, chance, fmt, b, k, way, nm, num, choice, table } from '../../util.js';
import { oneOf, plural } from './helpers.js';
import { PAIRS, PAIR_IDS, EASY } from './convert-data.js';

const amount = (n, u) => plural(n, u[0], u[1]);
const pairFor = L => { const id = pick(L === 1 ? EASY : PAIR_IDS); return { id, p: PAIRS[id] }; };
const countFor = (p, L) => rnd(L === 1 ? 3 : 2, L === 1 ? 9 : L === 2 ? p.hi : p.hi * 2);
const unitTable = (p, rows) => table([`${p.big[1]} (${p.big[2]})`, `${p.small[1]} (${p.small[2]})`], rows.map(([a, c]) => [fmt(a), c === '?' ? '?' : fmt(c)]));
const fact = p => `1 ${p.big[0]} = ${fmt(p.f)} ${p.small[1]}`;

function waysFor(p, n) {
  const R = n * p.f;
  return [way('Multiply by the unit fact', [`${fact(p)}, so every ${p.big[0]} turns into ${fmt(p.f)} ${p.small[1]}.`, `${n} × ${fmt(p.f)} = ${b(fmt(R))}`]),
    way('Build a table', [unitTable(p, [...new Set([1, 2, 3, n])].sort((x, y) => x - y).map(x => [x, x * p.f])), `Each row goes up by ${fmt(p.f)} ${p.small[1]}. ${n} ${p.big[1]} is ${b(fmt(R))} ${p.small[1]}.`])];
}
function plain(L) {
  const { id, p } = pairFor(L), n = countFor(p, L);
  return { ask: `How many ${p.small[1]} are in ${amount(n, p.big)}?`, answer: num(n * p.f), suffix: p.small[2], _t: { kind: 'cvplain', pair: id, n }, hint: `How many ${p.small[1]} make 1 ${p.big[0]}? Then think of ${n} of them.`, ways: waysFor(p, n) };
}
function withTable(L) {
  const { id, p } = pairFor(L), n = rnd(3, L === 1 ? 9 : 12);
  return { ask: `Use the table to convert ${amount(n, p.big)} to ${p.small[1]}.`, visual: unitTable(p, [[1, p.f], [2, 2 * p.f], [n, '?']]), answer: num(n * p.f), suffix: p.small[2], _t: { kind: 'cvtable', pair: id, n },
    hint: 'Look at how the second column grows each time the first column goes up by 1.', ways: waysFor(p, n) };
}
// "3 m 25 cm" as centimeters: the big part is converted, then the rest is added.
function mixed(L) {
  const { id, p } = pairFor(Math.max(L, 2)), n = rnd(2, Math.min(p.hi, 12)), r = rnd(2, p.f - 1), R = n * p.f + r;
  return { ask: `Write ${amount(n, p.big)} and ${amount(r, p.small)} as ${p.small[1]} only.`, answer: num(R), suffix: p.small[2], _t: { kind: 'cvmixed', pair: id, n, r },
    hint: `Change the ${p.big[1]} into ${p.small[1]} first. Then add the ${p.small[1]} that are left.`,
    ways: [way('Convert, then add', [`${fact(p)}.`, `${n} × ${fmt(p.f)} = ${fmt(n * p.f)}`, `${fmt(n * p.f)} + ${r} = ${b(fmt(R))}`]),
      way('Use a table', [unitTable(p, [[1, p.f], [n, n * p.f]]), `${n} ${p.big[1]} is ${fmt(n * p.f)} ${p.small[1]}. Adding ${r} more gives ${b(fmt(R))}.`])] };
}
function compare(L) {
  const { id, p } = pairFor(L), a = rnd(2, Math.min(p.hi, 12)), c = a * p.f + pick([-1, 1]) * rnd(1, Math.max(1, Math.floor(p.f / 2)) * (L === 3 ? 1 : 2)) * (p.f > 100 ? 10 : 1);
  if (c <= 0 || c === a * p.f) return null;
  const A = amount(a, p.big), C = amount(c, p.small), win = c > a * p.f ? C : A;
  return { ask: `Which is ${p.adj}: ${A} or ${C}?`, visual: L === 1 ? unitTable(p, [[1, p.f], [2, 2 * p.f]]) : undefined, answer: choice(win, [c > a * p.f ? A : C]), _t: { kind: 'cvcmp', pair: id, a, c },
    hint: `Put both amounts in the same unit first. Change the ${p.big[1]} into ${p.small[1]}.`,
    ways: [way('Use the smaller unit', [`${A} = ${a} × ${fmt(p.f)} = ${fmt(a * p.f)} ${p.small[1]}.`, `Compare ${fmt(a * p.f)} with ${fmt(c)} ${p.small[1]}: ${fmt(Math.max(c, a * p.f))} is more.`, `So ${b(win)} is ${p.adj}.`]),
      way('Round to see', [`${fact(p)}, so ${a} ${p.big[1]} is ${fmt(a * p.f)} ${p.small[1]}.`, `${fmt(c)} ${c > a * p.f ? 'is more' : 'is less'} than ${fmt(a * p.f)}, so ${b(win)} is ${p.adj}.`])] };
}
function pickEqual(L) {
  const { id, p } = pairFor(L), n = rnd(2, L === 1 ? 9 : 12), R = n * p.f, unit = p.small[2], opt = v => `${fmt(v)} ${unit}`;
  return { ask: `${amount(n, p.big)} is the same as which amount?`, answer: choice(opt(R), [opt(R * 10), opt(n * 10), opt(n + p.f)]), _t: { kind: 'cvpick', pair: id, n }, hint: `How many ${p.small[1]} are in 1 ${p.big[0]}? Multiply that by ${n}.`,
    ways: [way('Multiply', [`${fact(p)}.`, `${n} × ${fmt(p.f)} = ${fmt(R)} ${p.small[1]}, so the answer is ${b(opt(R))}.`]), way('Check the size', [`One ${p.small[0]} is much smaller than one ${p.big[0]}, so the count in ${p.small[1]} must be much bigger than ${n}.`, `Only ${b(opt(R))} equals ${n} × ${fmt(p.f)}.`])] };
}

// Word problems that use the conversion: cutting into equal pieces, and what is left.
function divideOp(L) {
  const { id, p } = pairFor(Math.max(L, 2)), piece = pick(p.pieces), n = rnd(2, Math.min(p.hi, 10)), total = n * p.f, who = nm();
  if (total % piece) return null;
  return { story: p.div(amount(n, p.big), piece, who), ask: p.divAsk, answer: num(total / piece), op: 'multi', _t: { kind: 'cvdiv', pair: id, n, piece }, hint: `Change the ${p.big[1]} into ${p.small[1]} first. Then see how many pieces of ${piece} fit.`,
    ways: [way('Convert, then divide', [`${amount(n, p.big)} = ${n} × ${fmt(p.f)} = ${fmt(total)} ${p.small[1]}.`, `${fmt(total)} ÷ ${piece} = ${b(fmt(total / piece))}`]),
      way('Count pieces in one unit', [`In 1 ${p.big[0]} there are ${fmt(p.f)} ${p.small[1]}, which is ${fmt(p.f / piece)} pieces of ${piece}.`, `${n} × ${fmt(p.f / piece)} = ${b(fmt(total / piece))}`])],
    read: { find: p.divAsk.replace('?', '.'), know: [amount(n, p.big), `pieces of ${piece} ${p.small[1]}`], clue: 'The two sizes use different units, so change to the smaller unit first. Then “each” pieces means divide.', plan: `${n} × ${p.f}, then ÷ ${piece}` } };
}
function subtractOp(L) {
  const { id, p } = pairFor(Math.max(L, 2)), n = rnd(2, Math.min(p.hi, 10)), piece = pick(p.pieces), total = n * p.f, S = piece * rnd(1, Math.floor(total / piece) - 1), who = nm();
  return { story: p.sub(amount(n, p.big), fmt(S), who), ask: p.subAsk, answer: num(total - S), suffix: p.small[2], op: 'multi', _t: { kind: 'cvsub', pair: id, n, s: S }, hint: `The two amounts are in different units. Change the ${p.big[1]} into ${p.small[1]} first.`,
    ways: [way('Convert, then subtract', [`${amount(n, p.big)} = ${n} × ${fmt(p.f)} = ${fmt(total)} ${p.small[1]}.`, `${fmt(total)} − ${fmt(S)} = ${b(fmt(total - S))}`]),
      way('Count up', [`From ${fmt(S)} up to ${fmt(total)} ${p.small[1]}: ${fmt(total)} − ${fmt(S)}.`, `${fmt(total - S)} ${p.small[1]} is the gap, so ${b(fmt(total - S))} are left.`])],
    read: { find: p.subAsk.replace('?', '.'), know: [amount(n, p.big), `${fmt(S)} ${p.small[1]} used`], clue: 'The amounts use different units, so change to the smaller unit first. “Left” means subtract.', plan: `${n} × ${p.f}, then − ${fmt(S)}` } };
}
const asQuestion = p => ({ ...p, ask: `${p.story} ${p.ask}`, story: undefined, read: undefined, op: undefined });
const quest = f => L => { const p = f(L); return p && asQuestion(p); };

export function convertWord(L) {
  const p = (chance(0.5) ? divideOp : subtractOp)(Math.max(L, 2)), mark = s => s.replace(/\d[\d,]*/g, d => k(d));
  return p && { ...p, story: mark(p.story) };
}

const MAKERS = [[plain, withTable, compare, pickEqual], [plain, withTable, compare, pickEqual, quest(divideOp), quest(subtractOp)], [plain, mixed, compare, quest(divideOp), quest(subtractOp), mixed]];
export const genConvert = L => oneOf(MAKERS[L - 1], L);
