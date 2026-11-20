// Unit rates with fractions: how much for ONE, found by dividing a fraction by a fraction (rates in speeds and recipes).
import { R, rnd, pick, shuffle, simp, F, fr, b, way, nm, NAMES, num, frac, choice, fmt, fracBar } from '../../util.js';
import { tag, plural } from './helpers.js';

const U = (s, p = s + 's', a = 'a') => ({ s, p, a });
const HOUR = U('hour', 'hours', 'an'), MIN = U('minute'), DAY = U('day');
// whole: the story still makes sense with a whole number of the first thing. cmp: the "who is faster" question.
const CTX = [
  { s: (n, A, B) => `${n} walks ${A} in ${B}.`, A: U('mile'), B: HOUR, whole: true, cmp: 'Who walks faster?' },
  { s: (n, A, B) => `${n} cycles ${A} in ${B}.`, A: U('kilometre'), B: HOUR, whole: true, cmp: 'Who cycles faster?' },
  { s: (n, A, B) => `${n} paints ${A} in ${B}.`, A: U('fence'), B: HOUR, cmp: 'Who paints faster?' },
  { s: (n, A, B) => `${n} mows ${A} in ${B}.`, A: U('lawn'), B: HOUR, cmp: 'Who mows faster?' },
  { s: (n, A, B) => `${n} reads ${A} in ${B}.`, A: U('chapter'), B: HOUR, whole: true, cmp: 'Who reads faster?' },
  { s: (n, A, B) => `${n} swims ${A} in ${B}.`, A: U('lap'), B: MIN, cmp: 'Who swims faster?' },
  { s: (n, A, B) => `A tap fills ${A} in ${B}.`, A: U('bucket'), B: MIN },
  { s: (n, A, B) => `A phone downloads ${A} in ${B}.`, A: U('gigabyte'), B: MIN, whole: true },
  { s: (n, A, B) => `A bean plant grows ${A} in ${B}.`, A: U('inch', 'inches', 'an'), B: DAY },
];
const TCTX = [
  { s: (n, C) => `${n} walks ${C} every hour.`, A: U('mile'), B: HOUR, q: (n, a) => `How many hours does it take ${n} to walk ${a}?` },
  { s: (n, C) => `${n} mows ${C} every hour.`, A: U('lawn'), B: HOUR, q: (n, a) => `How many hours does it take ${n} to mow ${a}?` },
  { s: (n, C) => `A tap fills ${C} every minute.`, A: U('bucket'), B: MIN, q: (n, a) => `How many minutes does it take to fill ${a}?` },
  { s: (n, C) => `A snail crawls ${C} every minute.`, A: U('foot', 'feet'), B: MIN, q: (n, a) => `How many minutes does it take to crawl ${a}?` },
  { s: (n, C) => `${n} reads ${C} every day.`, A: U('chapter'), B: DAY, q: (n, a) => `How many days does it take ${n} to read ${a}?` },
  { s: (n, C) => `A printer prints ${C} every minute.`, A: U('poster'), B: MIN, q: (n, a) => `How many minutes does it take to print ${a}?` },
];
const PRICE = [['cheese', U('pound')], ['fabric', U('yard')], ['ribbon', U('metre')], ['trail mix', U('pound')], ['rope', U('metre')]];
const FIT = [
  { s: (c, a) => `A scoop holds ${c} of a cup. A jug holds ${a} of a cup.`, ask: 'How many scoops fill the jug?' },
  { s: (c, a) => `A tile is ${c} of a metre wide. A shelf is ${a} of a metre wide.`, ask: 'How many tiles fit along the shelf?' },
  { s: (c, a, n) => `A slice is ${c} of a pizza. ${n} has ${a} of a pizza left.`, ask: 'How many slices can be served?' },
];
const qty = ([n, d], u) => (d === 1 ? plural(n, u.s, u.p) : `${F(n, d)} of ${u.a} ${u.s}`);
const raw = ([n, d]) => fr(n, d, { simplify: false });
const par = ([n, d]) => (d === 1 ? `${n}` : `(${n}/${d})`);
// A rate result with its unit, never "1 miles".
const amt = ([n, d], u) => (d === 1 ? plural(n, u.s, u.p) : `${fr(n, d)} ${u.p}`);
const same = (x, y) => x[0] * y[1] === x[1] * y[0];
// A proper fraction with one of the usual denominators.
const proper = dens => { const d = pick(dens), n = rnd(1, d - 1); return simp(n, d); };

// a ÷ c as the answer object (a whole number or a fraction) and the matching recompute kind.
function quotient(a, c) {
  const [n, d] = simp(a[0] * c[1], a[1] * c[0]);
  return d === 1 ? { answer: num(n), kind: 'urnum', res: [n, d] } : { answer: frac(n, d), kind: 'fquot', res: [n, d] };
}
function divWays(a, c, res) {
  const top = a[0] * c[1], bot = a[1] * c[0], D = a[1] * c[1], shown = res[1] === 1 ? `${res[0]}` : fr(res[0], res[1]);
  return [way('Multiply by the flip', ['Dividing by a fraction is the same as multiplying by its flip.', `${raw(a)} ÷ ${raw(c)} = ${raw(a)} × ${F(c[1], c[0])}`, `${F(top, bot)} = ${b(shown)}`]),
    way('Same-size pieces', [`Give both the same bottom number, ${D}: ${fr(top, D, { simplify: false })} and ${fr(bot, D, { simplify: false })}.`, `Now it is a count of same-size pieces: ${top} ÷ ${bot}.`, `${top} ÷ ${bot} = ${b(shown)}`])];
}
function pieceWays(a, c, res) {
  const d = c[1], pieces = res[0];
  return [way('Count the pieces', [`Cut one whole into ${d} equal pieces. Each piece is ${F(1, d)}.`, fracBar(pieces, d), `${raw(a)} is ${pieces} of those pieces, so ${b(pieces)} fit.`]), divWays(a, c, res)[0]];
}
const base = (shape, p, kind, a, c, extra = {}) => tag(p, { kind, shape, a, c, ...extra });

function rate(L) {
  const x = pick(CTX), n = nm(), d = pick(L === 1 ? [4, 5, 6, 8, 10, 12] : [3, 4, 5, 6, 8]);
  let a, c;
  if (L === 1) { const r = rnd(2, Math.min(5, d - 1)); a = simp(r, d); c = [1, d]; } else { do { a = proper([2, 3, 4, 5, 6, 8]); c = proper([2, 3, 4, 5, 6, 8]); } while (same(a, c)); }
  const q = quotient(a, c), ways = L === 1 ? pieceWays(a, c, q.res) : divWays(a, c, q.res);
  return base('rate', { story: x.s(n, qty(a, x.A), qty(c, x.B)), ask: `How many ${x.A.p} per ${x.B.s} is that?`, answer: q.answer, ways,
    hint: `"Per ${x.B.s}" means for ONE ${x.B.s}. Divide the amount of ${x.A.p} by the time.` }, q.kind, a, c);
}
function whole() {
  const x = pick(CTX.filter(v => v.whole)), n = nm(), a = [rnd(2, 4), 1], c = [1, pick([2, 3, 4])], q = quotient(a, c);
  return base('whole', { story: x.s(n, qty(a, x.A), qty(c, x.B)), ask: `How many ${x.A.p} per ${x.B.s} is that?`, answer: q.answer,
    ways: [way('Count the pieces', [`${qty(c, x.B)} is one of ${c[1]} equal pieces of a whole ${x.B.s}.`, `A whole ${x.B.s} has ${c[1]} of those pieces, so it holds ${c[1]} times as much: ${a[0]} × ${c[1]} = ${b(q.res[0])}.`]), divWays(a, c, q.res)[0]],
    hint: `One whole ${x.B.s} is longer than the time you are given. Do you get more or less in a whole ${x.B.s}?` }, q.kind, a, c);
}
function fit() {
  const x = pick(FIT), d = pick([4, 5, 6, 8, 10]), r = rnd(2, d - 1), a = simp(r, d), c = [1, d], q = quotient(a, c);
  return base('fit', { story: x.s(F(1, d), raw(a), nm()), ask: x.ask, answer: q.answer, ways: pieceWays(a, c, q.res),
    hint: 'How many of the small size fit into the big size? That is a division.' }, q.kind, a, c);
}
function tell(L) {
  for (;;) {
    const x = pick(CTX), n = nm(), a = proper(L === 1 ? [4, 6, 8] : [3, 4, 5, 6, 8]), c = L === 1 ? [1, pick([8, 10, 12])] : proper([2, 3, 4, 5, 6]);
    const vals = [a[0] / a[1] / (c[0] / c[1]), c[0] / c[1] / (a[0] / a[1]), a[0] / a[1] * c[0] / c[1], a[0] / a[1] + c[0] / c[1]].map(R);
    if (new Set(vals).size < 4 || a[0] / a[1] >= 1) continue;
    const o = (x1, y, op) => `${par(x1)} ${op} ${par(y)}`;
    return base('tell', { story: x.s(n, qty(a, x.A), qty(c, x.B)), ask: `Which calculation gives the number of ${x.A.p} per ${x.B.s}?`, answer: choice(o(a, c, '÷'), [o(c, a, '÷'), o(a, c, '×'), o(a, c, '+')]),
      ways: [way('Say it in words', [`"${x.A.p} per ${x.B.s}" means ${x.A.p} divided by ${x.B.p}.`, `The ${x.A.p} are ${raw(a)} and the time is ${raw(c)}, so the amount goes first: ${b(o(a, c, '÷'))}.`]),
        way('Test with a simple case', [`Try whole numbers: 6 ${x.A.p} in 2 ${x.B.p} is 6 ÷ 2 = 3 ${x.A.p} per ${x.B.s}. Amount ÷ time.`, `The same rule works for fractions: ${b(o(a, c, '÷'))}.`])],
      hint: `Rates are "amount per ONE". Which amount is divided by which?` }, 'urchoice', a, c);
  }
}
function flip(hard) {
  const x = pick(CTX), n = nm(), a = proper([2, 3, 4, 5, 6, 8]), c = hard ? proper([3, 4, 5, 6, 8]) : proper([2, 3, 4, 5, 6, 8]);
  if (same(a, c)) return flip(hard);
  const q = quotient(c, a);
  return base('flip', { story: x.s(n, qty(a, x.A), qty(c, x.B)), ask: `How many ${x.B.p} does it take for one whole ${x.A.s}?`, answer: q.answer, ways: divWays(c, a, q.res),
    hint: `This time the question is turned round: how much ${x.B.s} for ONE ${x.A.s}? The time goes on top.` }, q.kind, c, a);
}
function time(multi) {
  const x = pick(TCTX), n = nm(), a = proper([2, 3, 4, 5, 6, 8]), c = proper([2, 3, 4, 5, 6, 8]);
  if (same(a, c)) return time(multi);
  const q = quotient(a, c);
  return base('time', { story: x.s(n, qty(c, x.A)), ask: x.q(n, qty(a, x.A)), answer: q.answer, ways: divWays(a, c, q.res),
    hint: `The rate is the amount for ONE ${x.B.s}. How many of those make the amount you want?` }, q.kind, a, c);
}
function howMany() {
  for (;;) {
    const x = pick(CTX), n = nm(), a = proper([2, 3, 4, 5, 6, 8]), c = proper([2, 3, 4, 6, 8]), T = rnd(2, 6), ratio = a[0] * c[1] / (a[1] * c[0]), val = R(ratio * T);
    if (same(a, c) || !Number.isInteger(R(val * 100))) continue;
    const rr = simp(a[0] * c[1], a[1] * c[0]), rShown = rr[1] === 1 ? `${rr[0]}` : fr(rr[0], rr[1]);
    return base('howmany', { story: x.s(n, qty(a, x.A), qty(c, x.B)), ask: `At this rate, how many ${x.A.p} is that in ${plural(T, x.B.s, x.B.p)}?`, answer: num(val),
      ways: [way('Rate first, then multiply', [`Per ${x.B.s}: ${raw(a)} ÷ ${raw(c)} = ${b(amt(rr, x.A))}.`, `${T} ${x.B.p}: ${T} × ${rShown} = ${b(fmt(val))}`]),
        way('Scale the time', [`Count how many times the given time fits into ${T} ${x.B.p}: ${T} ÷ ${raw(c)} = ${T} × ${F(c[1], c[0])}.`, `Take that many lots of ${raw(a)}: ${b(fmt(val))}`])],
      hint: `Find the amount for ONE ${x.B.s} first. Then multiply.` }, 'urmul', a, c, { n: T });
  }
}
function compare() {
  for (;;) {
    const x = pick(CTX.filter(v => v.cmp)), [n1, n2] = shuffle(NAMES).slice(0, 2), a1 = proper([2, 3, 4, 5, 6]), c1 = proper([2, 3, 4, 5, 6]), a2 = proper([2, 3, 4, 5, 6]), c2 = proper([2, 3, 4, 5, 6]);
    const q1 = quotient(a1, c1), q2 = quotient(a2, c2), v1 = q1.res[0] / q1.res[1], v2 = q2.res[0] / q2.res[1];
    if (v1 === v2) continue;
    const win = v1 > v2 ? n1 : n2, sh = r => amt(r, x.A);
    return base('compare', { story: `${x.s(n1, qty(a1, x.A), qty(c1, x.B))} ${x.s(n2, qty(a2, x.A), qty(c2, x.B))}`, ask: x.cmp, answer: choice(win, [], { all: [n1, n2] }), choiceBig: true,
      ways: [way('Find each rate', [`${n1}: ${raw(a1)} ÷ ${raw(c1)} = ${b(sh(q1.res))} per ${x.B.s}.`, `${n2}: ${raw(a2)} ÷ ${raw(c2)} = ${b(sh(q2.res))} per ${x.B.s}.`, `${b(win)} gets more in one ${x.B.s}.`]),
        way('Compare as fractions', [`Each rate is a fraction: ${fr(q1.res[0], q1.res[1], { simplify: false })} and ${fr(q2.res[0], q2.res[1], { simplify: false })}.`, `Same bottom number ${q1.res[1] * q2.res[1]}: ${q1.res[0] * q2.res[1]} against ${q2.res[0] * q1.res[1]}.`, `The bigger top wins: ${b(win)}.`])],
      hint: 'Find how much each one does in ONE hour or minute, then compare the two rates.' }, 'urcmp', a1, c1, { a2, c2, who: [n1, n2] });
  }
}
function price() {
  const [thing, u] = pick(PRICE), n = nm(), per = pick([4, 6, 8, 10, 12, 16, 20, 24]), ds = [2, 3, 4, 5, 6, 8].filter(d => per % d === 0), d = pick(ds), f = simp(rnd(1, d - 1), d), cost = per * f[0] / f[1];
  const q = quotient([cost, 1], f);
  return base('price', { story: `${n} pays $${cost} for ${F(f[0], f[1])} of a ${u.s} of ${thing}.`, ask: `How many dollars does one whole ${u.s} of ${thing} cost?`, answer: q.answer, suffix: `dollars per ${u.s}`,
    ways: [way('Find the price of one piece', [`${F(f[0], f[1])} of a ${u.s} is ${f[0]} of ${f[1]} equal pieces.`, `$${cost} ÷ ${f[0]} = $${R(cost / f[0])} for one piece, and ${f[1]} pieces make a whole ${u.s}: ${f[1]} × ${R(cost / f[0])} = ${b(per)}`]), divWays([cost, 1], f, q.res)[0]],
    hint: `Dividing by a fraction is multiplying by its flip. The price goes on top.` }, q.kind, [cost, 1], f);
}
export function genUnitRate(L) {
  const r = Math.random();
  if (L === 1) return r < 0.35 ? rate(1) : r < 0.6 ? fit() : r < 0.8 ? tell(1) : whole();
  if (L === 2) return r < 0.35 ? rate(2) : r < 0.55 ? flip(false) : r < 0.75 ? tell(2) : time();
  return r < 0.25 ? howMany() : r < 0.45 ? compare() : r < 0.65 ? time(true) : r < 0.85 ? price() : flip(true);
}
