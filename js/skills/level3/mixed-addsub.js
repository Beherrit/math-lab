// Adding and subtracting mixed numbers with the same bottom number, including trading a whole for pieces.
import { rnd, pick, chance, shuffle, F, M, b, k, way, nm, num, frac, choice, fracBar } from '../../util.js';
import { BLANK, oneOf, plural, tagged } from './helpers.js';
import { bar, dth, finish, unreduced } from './frac-util.js';

// A mixed number here is [wholes, top, bottom], as in frac-add.js.
const top = ([w, n, d]) => w * d + n;
const show = ([w, n, d]) => M(w, n, d);
const D = L => rnd(3, [8, 10, 12][L - 1]);
const pic = (n, d) => fracBar(n, d, { label: '' });
const done = (R, d) => `Answer: ${b(unreduced(R, d))}`;

function addWays(a, c) {
  const d = a[2], n = a[1] + c[1], w = a[0] + c[0], R = top(a) + top(c), carry = n >= d;
  return [way('Wholes and parts', [`Add the wholes: ${a[0]} + ${c[0]} = ${w}`, `Add the fractions: ${F(a[1], d)} + ${F(c[1], d)} = ${F(n, d)}`,
    ...(carry ? [`${F(n, d)} is ${n === d ? '1 whole' : `1 whole and ${F(n - d, d)}`}, so trade ${d} pieces for 1 more whole: ${w} + 1 = ${w + 1}.`] : []), done(R, d)]),
  way('Turn both into fractions', [`${show(a)} = ${F(top(a), d)} and ${show(c)} = ${F(top(c), d)}.`, `${F(top(a), d)} + ${F(top(c), d)} = ${F(R, d)}`, ...finish(R, d).slice(0, 1), done(R, d)])];
}
function subWays(a, c) {
  const d = a[2], R = top(a) - top(c), borrow = a[1] < c[1], fromWhole = !a[1];
  const parts = borrow || fromWhole ? [`${fromWhole ? `${a[0]} has no pieces to take from` : `${F(a[1], d)} is smaller than ${F(c[1], d)}`}, so trade 1 whole for ${F(d, d)}: ${show(a)} = ${M(a[0] - 1, a[1] + d, d)}.`,
    `Subtract the wholes: ${a[0] - 1} − ${c[0]} = ${a[0] - 1 - c[0]}`, `Subtract the fractions: ${F(a[1] + d, d)} − ${F(c[1], d)} = ${F(a[1] + d - c[1], d)}`]
    : [`Subtract the wholes: ${a[0]} − ${c[0]} = ${a[0] - c[0]}`, `Subtract the fractions: ${F(a[1], d)} − ${F(c[1], d)} = ${a[1] === c[1] ? 0 : F(a[1] - c[1], d)}`];
  return [way('Wholes and parts', [...parts, done(R, d)]), way('Turn both into fractions', [`${fromWhole ? `${a[0]} = ${F(top(a), d)}` : `${show(a)} = ${F(top(a), d)}`} and ${show(c)} = ${F(top(c), d)}.`, `${F(top(a), d)} − ${F(top(c), d)} = ${F(R, d)}`, done(R, d)])];
}
const sumP = (a, c, op) => ({ ask: op === '+' ? 'Add.' : 'Subtract.', expr: `${show(a)} ${op} ${show(c)}`, answer: frac(op === '+' ? top(a) + top(c) : top(a) - top(c), a[2]), _t: { kind: 'fsum', a, c, op },
  hint: op === '+' ? 'Add the fractions first. Do they make 1 whole or more?' : 'Can you take the fraction away from the fraction you have? If not, trade a whole for pieces.', ways: op === '+' ? addWays(a, c) : subWays(a, c) });

// The two numbers of a sum or a difference. Step 1 never needs a trade, steps 2 and 3 mostly do. Null asks for new numbers.
function addOperands(L) {
  const d = D(L), n1 = rnd(1, d - 1), n2 = rnd(1, d - 1), regroup = L > 1 && (L === 3 || chance(0.6)), wMax = L === 1 ? 4 : 9;
  return (n1 + n2 >= d) === regroup ? [[rnd(1, wMax), n1, d], [rnd(1, wMax), n2, d]] : null;
}
function subOperands(L) {
  const d = D(L), n1 = rnd(1, d - 1), n2 = rnd(1, d - 1), borrow = L > 1 && (L === 3 || chance(0.6)), wMax = L === 1 ? 5 : 9, w2 = rnd(1, wMax - 1);
  return (n1 < n2) === borrow && !(L === 1 && n1 === n2) ? [[rnd(w2 + 1, wMax), n1, d], [w2, n2, d]] : null;
}
const add = L => { const o = addOperands(L); return o && sumP(...o, '+'); };
const subtract = L => { const o = subOperands(L); return o && sumP(...o, '−'); };
// A whole number take away a mixed number: there are no pieces to take from, so a whole must be traded.
function wholeMinus(L) {
  const d = D(L), w2 = rnd(1, 7);
  return sumP([rnd(w2 + 1, 9), 0, d], [w2, rnd(1, d - 1), d], '−');
}
function rename(L) {
  const d = D(L), w = rnd(2, 8), n = rnd(1, d - 1);
  return { ask: 'Find the missing top number.', expr: `${M(w, n, d)} = ${M(w - 1, BLANK, d)}`, visual: L === 1 ? pic(w * d + n, d) : undefined, answer: num(n + d), _t: { kind: 'mxrename', w, n, d },
    hint: `One of the ${w} wholes is cut into ${d} ${dth(d)}. Add those pieces to the ones already there.`,
    ways: [way('Trade a whole for pieces', [`1 whole is ${F(d, d)}, so take 1 whole out of ${w} and cut it into ${d} pieces.`, `${w} wholes becomes ${w - 1} wholes, and the pieces go up: ${n} + ${d} = ${b(n + d)}.`, `${M(w, n, d)} = ${M(w - 1, n + d, d)}`]),
      way('Check with improper fractions', [`${M(w, n, d)} = ${F(w * d + n, d)}.`, `${M(w - 1, n + d, d)} = ${F((w - 1) * d + n + d, d)}, which is the same amount, so the blank is ${b(n + d)}.`])] };
}
function showBar(L) {
  const d = D(Math.min(L, 2)), w = rnd(1, 3), n = rnd(1, d - 1), R = w * d + n;
  return tagged({ ask: 'What mixed number does the picture show? Each bar is one whole.', visual: pic(R, d), answer: frac(R, d), _t: { kind: 'mxpic', w, n, d }, hint: 'Count the full bars first. Then count the shaded pieces in the last bar.',
    ways: [way('Wholes and the part', [pic(R, d), `${plural(w, 'full bar')} and ${plural(n, 'shaded piece')} out of ${d} in the last bar.`, done(R, d)]),
      way('Count every piece', [`Each bar has ${d} pieces. ${w} × ${d} + ${n} = ${R} shaded pieces of ${F(1, d)}.`, `${F(R, d)} = ${unreduced(R, d)}`])] }, { w, n, d });
}
// The missing amount that makes one mixed number into a bigger one. Step 1 never needs a trade.
function missingAdd(L) {
  const d = D(L), n1 = rnd(1, d - 1), n2 = rnd(1, d - 1), w1 = rnd(1, 6), w2 = rnd(w1 + 1, 9), a = [w1, n1, d], c = [w2, n2, d], R = top(c) - top(a);
  if (L === 1 && n1 >= n2) return null;
  return { ask: 'Find the missing amount.', expr: `${show(a)} + ${BLANK} = ${show(c)}`, answer: frac(R, d), _t: { kind: 'mxmiss', a, c }, hint: 'The missing amount is how far it is from the smaller number to the bigger one.',
    ways: [way('Subtract', [`${show(c)} − ${show(a)} is the missing amount.`, ...subWays(c, a)[0].s]),
      way('Count up', [`From ${show(a)} up to ${w1 + 1} is ${F(d - n1, d)}.`, `From ${w1 + 1} up to ${w2} is ${plural(w2 - w1 - 1, 'more whole')}.`, `From ${w2} up to ${show(c)} is ${F(n2, d)}.`, `${d - n1} + ${(w2 - w1 - 1) * d} + ${n2} = ${R} pieces: ${b(unreduced(R, d))}`])] };
}
// Choose the right result among results that come from one piece too many or too few, or a whole too many or too few.
function pickResult(L) {
  const op = pick(['+', '−']), o = (op === '+' ? addOperands : subOperands)(L);
  if (!o) return null;
  const [a, c] = o, d = a[2], R = op === '+' ? top(a) + top(c) : top(a) - top(c), good = unreduced(R, d);
  const bad = [R + d, R - d, R + 1, R - 1].filter(x => x > 0).map(x => unreduced(x, d));
  return { ask: 'Which is the answer?', expr: `${show(a)} ${op} ${show(c)}`, answer: choice(good, shuffle(bad)), _t: { kind: 'mxpick', a, c, op }, hint: 'Work it out on your own first. Then look for it in the choices.', ways: op === '+' ? addWays(a, c) : subWays(a, c) };
}

const CTX = [
  (A, B, n) => ({ op: '+', story: `${n} hiked ${k(A)} miles on Saturday and ${k(B)} miles on Sunday.`, ask: 'How many miles did the hikes come to in all?', find: 'The total distance of the two hikes.', know: [`Saturday: ${A} miles`, `Sunday: ${B} miles`], clue: '“In all” joins two amounts, so add.' }),
  (A, B, n) => ({ op: '+', story: `A recipe uses ${k(A)} cups of flour for the base and ${k(B)} cups for the topping.`, ask: 'How many cups of flour is that altogether?', find: 'The flour for both parts.', know: [`base: ${A} cups`, `topping: ${B} cups`], clue: '“Altogether” joins the two amounts, so add.' }),
  (A, B, n) => ({ op: '+', story: `${n} practiced guitar for ${k(A)} hours on Monday and ${k(B)} hours on Tuesday.`, ask: 'How many hours of practice is that?', find: 'The total practice time.', know: [`Monday: ${A} hours`, `Tuesday: ${B} hours`], clue: 'Two amounts of time joined together, so add.' }),
  (A, B, n) => ({ op: '−', story: `A rope is ${k(A)} meters long. ${n} cuts off ${k(B)} meters for a swing.`, ask: 'How long is the rope that is left?', find: 'The rope that is left.', know: [`rope: ${A} meters`, `cut off: ${B} meters`], clue: '“Cuts off” and “left” mean some is taken away, so subtract.' }),
  (A, B, n) => ({ op: '−', story: `A tank holds ${k(A)} liters of water. ${n} uses ${k(B)} liters to fill the sink.`, ask: 'How many liters are still in the tank?', find: 'The water still in the tank.', know: [`tank: ${A} liters`, `used: ${B} liters`], clue: '“Uses” and “still in” mean some is taken away, so subtract.' }),
];
export function mixAddWord(L) {
  const mk = pick(CTX), probe = mk('', '', ''), o = (probe.op === '+' ? addOperands : subOperands)(L);
  if (!o) return null;
  const [a, c] = o, x = mk(show(a), show(c), nm()), p = sumP(a, c, x.op);
  return { story: x.story, ask: x.ask, answer: p.answer, op: x.op === '+' ? 'add' : 'sub', _t: p._t, ways: p.ways, hint: p.hint, read: { find: x.find, know: x.know, clue: x.clue, plan: `${show(a)} ${x.op} ${show(c)}` } };
}

const MAKERS = [[showBar, add, subtract, rename, missingAdd, pickResult], [add, subtract, wholeMinus, rename, missingAdd, pickResult, mixAddWord], [add, subtract, wholeMinus, missingAdd, rename, pickResult, mixAddWord]];
export const genMixAdd = L => oneOf(MAKERS[L - 1], L);
