// Order of operations with rational numbers, and the distance between two numbers on the number line as |a − b|.
import { R, rnd, pick, chance, fmt, b, way, nm, num, choice } from '../../util.js';
import { nz, par, size, snum, tag, plural } from './helpers.js';
import { hopLine } from './visuals-lines.js';
import { wholeOrder, decimalOrder, fractionOrder, longOrder } from './order-ops.js';

const tenths = (lo, hi) => nz(lo * 10, hi * 10) / 10;

function distWays(a, c, d) {
  const lo = Math.min(a, c), hi = Math.max(a, c), across = lo < 0 && hi > 0;
  return [way('Count along the number line', [hopLine(a, c), across ? `From ${fmt(lo)} up to 0 is ${size(lo)}, and from 0 up to ${fmt(hi)} is ${size(hi)}.` : `Both are on the same side of 0, at distances ${size(lo)} and ${size(hi)} from it. The gap is the difference of those.`,
    across ? `${size(lo)} + ${size(hi)} = ${b(fmt(d))}` : `${fmt(Math.max(Math.abs(lo), Math.abs(hi)))} − ${fmt(Math.min(Math.abs(lo), Math.abs(hi)))} = ${b(fmt(d))}`]),
    way('Subtract, then drop the sign', [`Distance = |${fmt(a)} − ${par(c)}|. Subtracting gives ${fmt(R(a - c))}.`, `A distance is never negative, so take the absolute value: |${fmt(R(a - c))}| = ${b(fmt(d))}`])];
}
// Two numbers for a distance question: opposite sides of 0 at first, then decimals and numbers on the same side.
const pairFor = L => (L === 1 ? [-rnd(1, 12), rnd(1, 12)] : pick([() => [-rnd(5, 95) / 10, rnd(5, 95) / 10], () => { const a = -rnd(6, 25); return [a, -rnd(1, -a - 1)]; }, () => [-rnd(10, 30), rnd(10, 30)]])());
function distance(L) {
  const [a, c] = pairFor(L), d = R(Math.abs(a - c)), [x, y] = chance(0.5) ? [a, c] : [c, a];
  return tag({ ask: `How far apart are ${fmt(x)} and ${fmt(y)} on the number line?`, answer: num(d), ways: distWays(x, y, d),
    hint: 'Picture both numbers on the number line. Do they sit on the same side of 0 or on opposite sides?' }, { kind: 'dist', shape: 'distance', a: x, b: y });
}
const lvl = v => `${Math.abs(v)} metres ${v > 0 ? 'above' : 'below'} sea level`, tmp = v => `${Math.abs(v)} degrees ${v > 0 ? 'above' : 'below'} zero`;
const SCENES = [
  { text: (x, y) => `Ava is ${x > 0 ? 'hiking' : 'diving'} ${lvl(x)}. Leo is ${y > 0 ? 'hiking' : 'diving'} ${lvl(y)}.`, ask: 'How far apart are they, in metres?', suffix: 'metres' },
  { text: (x, y) => `On Monday the temperature was ${tmp(x)}. On Tuesday it was ${tmp(y)}.`, ask: 'How many degrees apart are the two temperatures?', suffix: 'degrees' },
  { text: (x, y) => `Ava ${x > 0 ? `has ${x} dollars` : `owes ${-x} dollars`}. Leo ${y > 0 ? `has ${y} dollars` : `owes ${-y} dollars`}.`, ask: 'How many dollars apart are their money totals? Owing counts as negative.', suffix: 'dollars' },
];
function storyDistance(L) {
  const sc = pick(SCENES), same = L > 1 && chance(0.5), x = same ? -rnd(2, 15) : rnd(4, L === 1 ? 15 : 30), y = same ? x - rnd(3, 15) : -rnd(3, L === 1 ? 15 : 25), d = Math.abs(x - y);
  return tag({ story: sc.text(x, y), ask: sc.ask, answer: num(d), suffix: sc.suffix, ways: distWays(x, y, d), op: 'multi',
    hint: 'Give each number its sign: above, or has, is positive. Below, or owes, is negative. Then find the gap between them.' }, { kind: 'dist', shape: 'storydist', a: x, b: y });
}
function absValue() {
  const a = nz(-12, 12), c = nz(-12, 12), d = Math.abs(a - c);
  if (a === c) return absValue();
  return tag({ ask: 'Find the value. The bars mean absolute value: the distance from 0.', expr: `|${fmt(a)} − ${par(c)}|`, answer: num(d),
    ways: [way('Inside first, then drop the sign', [`Inside the bars: ${fmt(a)} − ${par(c)} = ${fmt(R(a - c))}.`, `Absolute value is the distance from 0, so it has no sign: |${fmt(R(a - c))}| = ${b(fmt(d))}`]), way('It is a distance', [`|${fmt(a)} − ${par(c)}| is the distance between ${fmt(a)} and ${fmt(c)} on the number line.`, hopLine(a, c), `That is ${b(plural(d, 'step'))} along the line.`])],
    hint: 'Work out what is inside the bars first. Then remove any minus sign, because a distance is never negative.' }, { kind: 'arith', shape: 'absval', shown: [Math.abs(a), Math.abs(c)] });
}
function absTotal() {
  for (;;) {
    const a = tenths(-9, 9), c = tenths(-9, 9), e = tenths(-9, 9), val = R(Math.abs(a) + Math.abs(c - e));
    if (c === e || val > 40) continue;
    return tag({ ask: 'Find the value of this expression.', expr: `|${fmt(a)}| + |${fmt(c)} − ${par(e)}|`, exprSmall: true, answer: num(val),
      ways: [way('Each bars part on its own', [`|${fmt(a)}| = ${size(a)}.`, `Inside the second bars: ${fmt(c)} − ${par(e)} = ${fmt(R(c - e))}, so |${fmt(R(c - e))}| = ${size(R(c - e))}.`, `${size(a)} + ${size(R(c - e))} = ${b(fmt(val))}`]),
        way('Think of distances', [`|${fmt(a)}| is how far ${fmt(a)} is from 0.`, `|${fmt(c)} − ${par(e)}| is how far ${fmt(c)} is from ${fmt(e)}. Add the two distances: ${b(fmt(val))}`])],
      hint: 'Each pair of bars gives a distance, which is never negative. Find each one, then add.' }, { kind: 'arith', shape: 'abstotal', shown: [Math.abs(a), Math.abs(c), Math.abs(e)] });
  }
}
function distExpr() {
  const a = -rnd(1, 12), c = rnd(1, 12), opts = [`|${c} − ${par(a)}|`, `|${c} + ${par(a)}|`, `${fmt(a)} − ${c}`, `${c} × ${par(a)}`];
  if (a - c === a * c || Math.abs(c + a) === c - a) return distExpr();
  return tag({ ask: `Which expression gives the distance between ${fmt(a)} and ${c} on the number line?`, answer: choice(opts[0], opts.slice(1)),
    ways: [way('A distance is a gap', [`The gap between two numbers is the bigger one minus the smaller one, as a size: ${b(opts[0])}.`, `The other choices add instead of subtract, give a negative answer, or multiply.`]),
      way('Work out each choice', [`${opts[0]} = ${c + Math.abs(a)}, the true gap: ${size(a)} to 0 and then 0 to ${c}.`, `${opts[1]} = ${Math.abs(c + a)}, ${opts[2]} = ${fmt(a - c)} and ${opts[3]} = ${fmt(a * c)}: none of them is a gap.`])],
    hint: 'To find the gap you subtract. A distance must not come out negative. Which choice does both?' }, { kind: 'distexpr', shape: 'distexpr', a, b: c });
}
function closer() {
  for (;;) {
    const c = tenths(-9, 9), x1 = tenths(-9, 9), x2 = tenths(-9, 9), d1 = R(Math.abs(x1 - c)), d2 = R(Math.abs(x2 - c));
    if (d1 === d2 || x1 === x2 || x1 === c || x2 === c) continue;
    const win = d1 < d2 ? x1 : x2;
    return tag({ ask: `Which number is closer to ${fmt(c)} on the number line: ${fmt(x1)} or ${fmt(x2)}?`, answer: choice(fmt(win), [], { all: [fmt(x1), fmt(x2)] }), choiceBig: true,
      ways: [way('Find each distance', [`${fmt(x1)}: |${fmt(x1)} − ${par(c)}| = ${b(fmt(d1))}.`, `${fmt(x2)}: |${fmt(x2)} − ${par(c)}| = ${b(fmt(d2))}.`, `The smaller distance wins: ${b(fmt(win))}.`]), way('Picture the line', [hopLine(c, win), `From ${fmt(c)} the hop to ${fmt(win)} is shorter than the hop to ${fmt(win === x1 ? x2 : x1)}.`])],
      hint: 'Find the distance from each number to the one in the question. The smaller distance is closer.' }, { kind: 'closer', shape: 'closer', c, x1, x2 });
  }
}
function away() {
  const c = nz(-10, 10), d = rnd(2, 9);
  return tag({ ask: `Two numbers are exactly ${d} away from ${fmt(c)} on the number line. What is the greater one?`, answer: snum(c + d),
    ways: [way('Hop each way', [hopLine(c, c + d), `${d} to the right of ${fmt(c)} is ${fmt(c)} + ${d} = ${b(fmt(c + d))}. ${d} to the left is ${fmt(c - d)}.`, `The greater one is ${b(fmt(c + d))}.`]), way('Use the distance rule', [`|x − ${par(c)}| = ${d} means x − ${par(c)} = ${d} or x − ${par(c)} = −${d}.`, `x = ${fmt(c + d)} or x = ${fmt(c - d)}. The greater is ${b(fmt(c + d))}.`])],
    hint: 'Start at the number and hop the distance to the right, and again to the left. Which landing spot is greater?' }, { kind: 'away', shape: 'away', c, d });
}
const SEQ = [
  { start: s => `At dawn the temperature was ${plural(Math.abs(s), 'degree')} ${s < 0 ? 'below' : 'above'} zero.`, up: (r, h) => `It rose ${plural(r, 'degree')} each hour for ${h} hours,`, down: (r, h) => `It fell ${plural(r, 'degree')} each hour for ${h} hours,`, up2: a => `then rose ${plural(a, 'degree')} more.`, down2: a => `then dropped ${plural(a, 'degree')}.`, ask: 'What is the temperature now? Use a minus sign for below zero.' },
  { start: s => `A diver is ${plural(Math.abs(s), 'metre')} ${s < 0 ? 'below' : 'above'} the surface.`, up: (r, h) => `The diver swims up ${plural(r, 'metre')} each minute for ${h} minutes,`, down: (r, h) => `The diver sinks ${plural(r, 'metre')} each minute for ${h} minutes,`, up2: a => `then floats up ${plural(a, 'metre')}.`, down2: a => `then sinks ${plural(a, 'metre')} more.`, ask: 'What is the diver’s height now? Use a minus sign for below the surface.' },
  { whole: true, start: s => `${nm()}'s account has ${s < 0 ? 'a debt of' : 'a balance of'} ${plural(Math.abs(s), 'dollar')}.`, up: (r, h) => `${plural(r, 'dollar')} is paid in each week for ${h} weeks,`, down: (r, h) => `${plural(r, 'dollar')} is spent each week for ${h} weeks,`, up2: a => `then ${plural(a, 'dollar')} is paid in.`, down2: a => `then ${plural(a, 'dollar')} is spent.`, ask: 'What is the balance now, in dollars? Use a minus sign for a debt.' },
];
function sequence() {
  for (;;) {
    const sc = pick(SEQ), s = sc.whole ? nz(-40, 40) : tenths(-9, 9), r = sc.whole ? rnd(2, 9) : pick([0.5, 1.5, 2, 2.5, 3.5, 4]), h = rnd(2, 5), adj = sc.whole ? rnd(2, 30) : rnd(1, 9), d1 = chance(0.5) ? 1 : -1, d2 = chance(0.5) ? 1 : -1, val = R(s + d1 * r * h + d2 * adj);
    if (Math.abs(val) > 60 || !Number.isInteger(R(val * 100))) continue;
    return tag({ story: `${sc.start(s)} ${(d1 > 0 ? sc.up : sc.down)(r, h)} ${(d2 > 0 ? sc.up2 : sc.down2)(adj)}`, ask: sc.ask, answer: snum(val), op: 'multi',
      ways: [way('One step at a time', [`The ${h} equal changes: ${fmt(r)} × ${h} = ${fmt(R(r * h))}.`, `Start ${fmt(s)}, then ${d1 > 0 ? '+' : '−'} ${fmt(R(r * h))} = ${fmt(R(s + d1 * r * h))}.`, `Then ${d2 > 0 ? '+' : '−'} ${fmt(adj)} = ${b(fmt(val))}`]),
        way('Add the changes first', [`Net change: ${d1 > 0 ? '' : '−'}${fmt(R(r * h))} ${d2 > 0 ? '+' : '−'} ${fmt(adj)} = ${fmt(R(d1 * r * h + d2 * adj))}.`, `${fmt(s)} + ${par(R(d1 * r * h + d2 * adj))} = ${b(fmt(val))}`])],
      read: { find: 'The number at the end.', know: ['where it starts (a negative number means below zero or a debt)', 'the repeated change', 'the one-off change'], clue: 'Changes that repeat are multiplied. Rises and gains add, falls and spending subtract.', plan: 'start, plus or minus the repeated change × the number of times, plus or minus the last change' },
      hint: 'Do the repeated change first: amount each time × how many times. Then use the start and both changes, with the right signs.' }, { kind: 'story3', shape: 'sequence', start: s, rate: r, hrs: h, adj, d1, d2 });
  }
}
export const sequenceWord = () => sequence();
export function genOrder(L) {
  const r = Math.random();
  if (L === 1) return r < 0.3 ? wholeOrder() : r < 0.55 ? distance(1) : r < 0.75 ? storyDistance(1) : absValue();
  if (L === 2) return r < 0.25 ? decimalOrder() : r < 0.45 ? fractionOrder() : r < 0.65 ? distance(2) : r < 0.85 ? absTotal() : storyDistance(2);
  return r < 0.25 ? longOrder() : r < 0.45 ? sequence() : r < 0.65 ? closer() : r < 0.82 ? away() : distExpr();
}
