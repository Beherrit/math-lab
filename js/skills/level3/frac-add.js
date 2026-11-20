// Adding and subtracting fractions with the same denominator, from single fractions up to mixed numbers.
import { rnd, pick, gcd, F, M, b, k, way, nm, num, frac, fracBar } from '../../util.js';
import { BLANK, oneOf } from './helpers.js';
import { bar, dth, count, finish, unreduced } from './frac-util.js';

// A number here is [wholes, top, bottom].
const top = ([w, n, d]) => w * d + n;
const show = ([w, n, d]) => M(w, n, d);
const calc = (a, c, op) => (op === '+' ? top(a) + top(c) : top(a) - top(c));

function simpleWays(a, c, op) {
  const d = a[2], R = calc(a, c, op), word = op === '+' ? 'Add' : 'Subtract';
  const ways = [way('Count the pieces', [`Both fractions are in ${dth(d)}, so the pieces are the same size.`, `${count(a[1], d)} ${op} ${count(c[1], d)} = ${count(R, d)}.`,
    `${word} the tops. The bottom stays ${d}, because it only names the size of the piece: ${show(a)} ${op} ${show(c)} = ${b(F(R, d))}`, ...finish(R, d)]),
  way('Picture it', [bar(a[1], d), bar(c[1], d), op === '+' ? 'Put the shaded pieces together:' : `Take ${c[1]} shaded piece${c[1] > 1 ? 's' : ''} away from the first bar:`, fracBar(R, d, { label: `${R}/${d}` })])];
  if (op === '−') ways.push(way('Check by adding back', [`${F(R, d)} + ${show(c)} = ${F(R + c[1], d)}. That is the fraction we started with, so it fits.`]));
  return ways;
}
function mixedWays(a, c, op) {
  const d = a[2], R = calc(a, c, op), n = op === '+' ? a[1] + c[1] : a[1] - c[1], w = op === '+' ? a[0] + c[0] : a[0] - c[0];
  const parts = op === '+' ? [`Add the wholes: ${a[0]} + ${c[0]} = ${w}`, `Add the fractions: ${F(a[1], d)} + ${F(c[1], d)} = ${F(n, d)}`,
    ...(n >= d ? [`${F(n, d)} is ${n === d ? '1 more whole' : `1 whole and ${F(n - d, d)}`}, so the wholes go up to ${w + 1}.`] : [])]
    : n >= 0 ? [`Subtract the wholes: ${a[0]} − ${c[0]} = ${w}`, `Subtract the fractions: ${F(a[1], d)} − ${F(c[1], d)} = ${n ? F(n, d) : 0}`]
      : [`${F(a[1], d)} is smaller than ${F(c[1], d)}, so trade 1 whole for ${F(d, d)}: ${show(a)} = ${M(a[0] - 1, a[1] + d, d)}`, `Subtract the wholes: ${a[0] - 1} − ${c[0]} = ${w - 1}`,
        `Subtract the fractions: ${F(a[1] + d, d)} − ${F(c[1], d)} = ${F(n + d, d)}`];
  return [way('Wholes and parts', [...parts, `Answer: ${b(unreduced(R, d))}`, ...finish(R, d).slice(-1).filter(() => R % d && gcd(R, d) > 1)]),
    way('Turn both into fractions', [`${show(a)} = ${F(top(a), d)}, because ${a[0]} × ${d} + ${a[1]} = ${top(a)}.`, `${show(c)} = ${F(top(c), d)}, because ${c[0]} × ${d} + ${c[1]} = ${top(c)}.`,
      `${F(top(a), d)} ${op} ${F(top(c), d)} = ${F(R, d)}`, ...(R < d ? [`Answer: ${b(F(R, d))}`] : finish(R, d))])];
}

function operands(L, op, whole) {
  for (;;) {
    const d = rnd(3, L === 1 ? 10 : 12), n1 = rnd(1, d - 1), n2 = rnd(1, d - 1);
    if (L === 3) { const a = [rnd(1, 6), n1, d], c = [rnd(1, 5), n2, d]; if (top(a) !== top(c)) return op === '−' && top(a) < top(c) ? [c, a] : [a, c]; continue; }
    if (op === '−') { if (n1 !== n2) return [[0, Math.max(n1, n2), d], [0, Math.min(n1, n2), d]]; continue; }
    if ((L === 1 || whole) ? n1 + n2 <= d : n1 + n2 > d) return [[0, n1, d], [0, n2, d]];
  }
}
function plain(L) {
  const op = pick(['+', '−']), [a, c] = operands(L, op), d = a[2];
  return { ask: op === '+' ? 'Add.' : 'Subtract.', expr: `${show(a)} ${op} ${show(c)}`, answer: frac(calc(a, c, op), d), _t: { kind: 'fsum', a, c, op }, ways: L === 3 ? mixedWays(a, c, op) : simpleWays(a, c, op),
    visual: L === 1 ? bar(a[1], d) + bar(c[1], d) : undefined, hint: L === 3 ? 'Work with the wholes and the fractions separately, or turn both into fractions first.' : 'The bottoms match, so the pieces are the same size. Just count pieces.' };
}
function fromOne() {
  const d = rnd(3, 12), n = rnd(1, d - 1), a = [1, 0, d], c = [0, n, d];
  return { ask: 'Subtract from one whole.', expr: `1 − ${F(n, d)}`, answer: frac(d - n, d), _t: { kind: 'fsum', a, c, op: '−' }, hint: `Write the 1 as a fraction with ${d} on the bottom.`,
    ways: [way('Rename the whole', [`1 whole is ${d} ${dth(d)}: 1 = ${F(d, d)}`, `${F(d, d)} − ${F(n, d)} = ${b(F(d - n, d))}`, ...finish(d - n, d)]),
      way('Picture it', [`A whole bar has all ${d} parts shaded.`, fracBar(d, d), `Take away ${n}. What stays shaded:`, bar(d - n, d)])] };
}
function splitUp() {
  const d = rnd(4, 12), n = rnd(3, d), a = rnd(1, n - 1);
  return { ask: 'Find the missing top number.', expr: `${F(n, d)} = ${F(a, d)} + ${F(BLANK, d)}`, answer: num(n - a), _t: { kind: 'split', n, a, d }, hint: `${n} pieces in all. ${a} of them are in the first part.`,
    ways: [way('Count the pieces', [`${F(n, d)} means ${n} pieces, each one ${F(1, d)}.`, `${a} of the pieces are already used, so ${n} − ${a} = ${b(n - a)} are left for the blank.`]),
      way('Picture it', [bar(n, d), `Split the ${n} shaded pieces into a group of ${a} and a group of ${n - a}.`, bar(a, d), bar(n - a, d)])] };
}

const CTX = [
  (A, B, n, s) => ({ op: '+', story: `${n} ran ${k(A + ' mile' + s)} before school and ${k(B + ' mile' + s)} after school.`, ask: `How far did ${n} run in all?`, find: 'The total distance for the day.', know: [`before: ${A} mile${s}`, `after: ${B} mile${s}`], clue: '“In all” joins two amounts, so add.' }),
  (A, B, n, s) => ({ op: '+', whole: true, story: `A phone used ${k(A)} of its battery in the morning and ${k(B)} of its battery in the afternoon.`, ask: 'What fraction of the battery has it used?', find: 'The battery used over the whole day.', know: [`morning: ${A}`, `afternoon: ${B}`], clue: 'Two amounts used, one after the other, so add.' }),
  (A, B, n, s) => ({ op: '+', story: `A recipe needs ${k(A + ' cup' + s)} of oats and ${k(B + ' cup' + s)} of nuts.`, ask: 'How many cups is that together?', find: 'The oats and nuts together.', know: [`oats: ${A} cup${s}`, `nuts: ${B} cup${s}`], clue: '“Together” joins two amounts, so add.' }),
  (A, B, n, s) => ({ op: '−', story: `A jug holds ${k(A + ' liter' + s)} of juice. ${n} pours out ${k(B + ' liter' + s)}.`, ask: 'How much juice is left in the jug?', find: 'The juice still in the jug.', know: [`start: ${A} liter${s}`, `poured out: ${B} liter${s}`], clue: '“Pours out” and “left” mean some is taken away, so subtract.' }),
  (A, B, n, s) => ({ op: '−', story: `A plank is ${k(A + ' meter' + s)} long. ${n} saws off ${k(B + ' meter' + s)}.`, ask: 'How long is the plank now?', find: 'The length that is left.', know: [`plank: ${A} meter${s}`, `sawn off: ${B} meter${s}`], clue: '“Saws off” takes a part away, so subtract.' }),
];
export function fracWord(L) {
  const mk = pick(L === 3 ? CTX.filter(c => !c('', '', '').whole) : CTX), probe = mk('', '', ''), [a, c] = operands(L, probe.op, probe.whole), x = mk(show(a), show(c), nm(), L === 3 ? 's' : '');
  return { story: x.story, ask: x.ask, answer: frac(calc(a, c, x.op), a[2]), op: x.op === '+' ? 'add' : 'sub', _t: { kind: 'fsum', a, c, op: x.op }, ways: L === 3 ? mixedWays(a, c, x.op) : simpleWays(a, c, x.op),
    read: { find: x.find, know: x.know, clue: x.clue, plan: `${show(a)} ${x.op} ${show(c)}` }, hint: 'The bottoms already match, so the pieces are the same size.' };
}

const MAKERS = [[plain], [plain, plain, fromOne, splitUp, fracWord], [plain, plain, plain, fracWord, fracWord]];
export const genFadd = L => oneOf(MAKERS[L - 1], L);
