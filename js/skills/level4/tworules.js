// Skill l4rules: two rules, two patterns, matching terms, ordered pairs and plotting them (5.OA.3, 5.G.2).
import { rnd, pick, chance, shuffle, fmt, b, k, way, nm, num, choice, point, plane, table } from '../../util.js';
import { T, rd, rndNot, pl } from './helpers.js';

const term = (s, d, i) => s + d * (i - 1);
const row = (s, d, n) => Array.from({ length: n }, (_, i) => term(s, d, i + 1));
const pr = (x, y) => `(${x}, ${y})`;
const rulesText = r => `Pattern A: start at ${r.a0}, add ${r.da}. Pattern B: start at ${r.b0}, add ${r.db}.`;
const tbl = (r, n) => table(['Term', ...row(1, 1, n)], [[`A (start ${r.a0}, add ${r.da})`, ...row(r.a0, r.da, n)], [`B (start ${r.b0}, add ${r.db})`, ...row(r.b0, r.db, n)]], { cls: 'pat' });
const A = (r, i) => term(r.a0, r.da, i), B = (r, i) => term(r.b0, r.db, i);
const HINTS = { pair: 'An ordered pair lists the A number first, then the B number from the same term.', plot: 'Find the pair for that term first. The first number goes across and the second goes up.' };

function ruTerm(L) {
  const s = rnd(0, 9), d = rnd(2, L === 1 ? 6 : 9), i = rnd(4, L === 1 ? 5 : 7), v = s + d * (i - 1);
  return T({ ask: `A pattern starts at ${s} and adds ${d} each time. Term 1 is ${s}. What is term ${i}?`, answer: num(v),
    ways: [way('List the terms', [row(s, d, i).map((x, j) => (j === i - 1 ? b(x) : x)).join(', ')]),
      way('Count the jumps', [`Term ${i} is ${i - 1} jumps of ${d} after the start.`, `${s} + ${i - 1} × ${d} = ${b(v)}`])],
    hint: 'Count how many jumps it takes to get from term 1 to the term you want.' }, 'ruTerm', { s, d, i });
}
function ruPair() {
  for (;;) {
    const r = { a0: rnd(0, 4), da: rnd(1, 5), b0: rnd(0, 6), db: rnd(2, 8) }, i = rnd(2, 5), x = A(r, i), y = B(r, i), good = pr(x, y);
    const bad = [pr(y, x), pr(A(r, i + 1), B(r, i + 1)), pr(x, B(r, i + 1))];
    if (x === y || new Set([good, ...bad]).size < 4) continue;
    return T({ ask: `${rulesText(r)} Which ordered pair (A, B) comes from term ${i}?`, visual: tbl(r, 5), answer: choice(good, bad),
      ways: [way('Read down the table', [`Term ${i}: A is ${x} and B is ${y}.`, `An ordered pair writes A first, then B: ${b(good)}`]),
        way('Use the rules', [`A: ${r.a0} + ${i - 1} × ${r.da} = ${x}`, `B: ${r.b0} + ${i - 1} × ${r.db} = ${y}`, `So the pair is ${b(good)}`])],
      hint: HINTS.pair }, 'ruPair', { ...r, i });
  }
}
function ruDiff() {
  const d = rnd(1, 5), a0 = rnd(0, 6), g = rnd(2, 9), r = { a0, da: d, b0: a0 + g, db: d };
  return T({ ask: `${rulesText(r)} How much bigger is each term in B than the matching term in A?`, visual: tbl(r, 5), answer: num(g),
    ways: [way('Compare matching terms', [`First terms: ${r.b0} − ${r.a0} = ${g}.`, `Second terms: ${B(r, 2)} − ${A(r, 2)} = ${g}. It is the same every time, so each B term is ${b(g)} bigger.`]),
      way('Same jumps', [`Both patterns add ${d} each time, so the gap between them never changes.`, `The gap is the difference of the starts: ${r.b0} − ${r.a0} = ${b(g)}`])],
    hint: 'Compare the first terms of the two patterns. How much bigger is the B one?' }, 'ruDiff', { ...r });
}
function ruTimes() {
  const m = rnd(2, 5), a0 = rnd(1, 4), da = rnd(1, 4), r = { a0, da, b0: a0 * m, db: da * m };
  return T({ ask: `${rulesText(r)} Each term in B is how many times the matching term in A?`, visual: tbl(r, 5), answer: num(m),
    ways: [way('Divide matching terms', [`${A(r, 1)} and ${B(r, 1)}: ${B(r, 1)} ÷ ${A(r, 1)} = ${m}`, `${A(r, 2)} and ${B(r, 2)}: ${B(r, 2)} ÷ ${A(r, 2)} = ${m}`, `Every B term is ${b(m)} times its A term.`]),
      way('Compare the rules', [`Start: ${a0} × ${m} = ${r.b0}. Jump: ${da} × ${m} = ${r.db}.`, `Both the start and the jump of B are ${m} times those of A, so B is always ${b(m)} times A.`])],
    hint: 'Pick two matching terms and divide the B one by the A one.' }, 'ruTimes', { ...r });
}
function ruPlot(L) {
  for (;;) {
    const r = L === 1 ? { a0: 0, da: rnd(1, 3), b0: 0, db: rnd(1, 4) } : { a0: rnd(0, 3), da: rnd(1, 3), b0: rnd(0, 4), db: rnd(1, 4) }, i = rnd(2, 5), x = A(r, i), y = B(r, i);
    if (x > 10 || y > 10 || (!x && !y) || x === y) continue;
    const upto = row(1, 1, i).map(j => pr(A(r, j), B(r, j)));
    return T({ ask: `${rulesText(r)} Plot the ordered pair (A, B) from term ${i}.`, visual: plane({ interactive: true }), answer: point(x, y),
      ways: [way('Find the pair, then plot', [`Term ${i}: A = ${x} and B = ${y}, so the pair is ${pr(x, y)}.`, `Go ${x} across and ${y} up: ${b(pr(x, y))}`]),
        way('List the pairs', [`Pairs so far: ${upto.join(', ')}.`, `Term ${i} is the last one: ${b(pr(x, y))}`])],
      hint: HINTS.plot }, 'ruPlot', { ...r, i });
  }
}
function ruAt(L) {
  const m = rnd(2, 4), a0 = L === 2 ? rnd(0, 3) : rnd(1, 5), da = rnd(2, 5), r = L === 2 ? { a0, da, b0: a0 * m, db: da * m } : { a0, da, b0: rnd(0, 9), db: rnd(2, 9) }, j = rnd(6, L === 2 ? 8 : 10), x = A(r, j), y = B(r, j);
  return T({ ask: `${rulesText(r)} When pattern A is ${x}, what is pattern B?`, visual: tbl(r, 4), answer: num(y),
    ways: [way('Count the jumps', [`${x} − ${r.a0} = ${x - r.a0}, and ${x - r.a0} ÷ ${r.da} = ${j - 1} jumps.`, `After ${j - 1} jumps B is ${r.b0} + ${j - 1} × ${r.db} = ${b(y)}`]),
      way('Keep going', [`A: ${row(r.a0, r.da, j).join(', ')}`, `B: ${row(r.b0, r.db, j).map((v, n) => (n === j - 1 ? b(v) : v)).join(', ')}`, `When A is ${x}, B is ${b(y)}.`])],
    hint: 'How many jumps does it take pattern A to reach that number? B makes the same number of jumps.' }, 'ruAt', { ...r, x });
}
function ruSet() {
  for (;;) {
    const r = { a0: rnd(0, 3), da: rnd(1, 4), b0: rnd(0, 4), db: rnd(2, 6) }, ps = [1, 2, 3].map(i => [A(r, i), B(r, i)]), txt = l => l.map(p => pr(p[0], p[1])).join(', ');
    const bad = [ps.map(p => [p[1], p[0]]), ps.map((p, i) => [p[0], i === 2 ? p[1] + r.db : p[1]]), ps.map((p, i) => [A(r, i + 2), p[1]])].map(txt), good = txt(ps);
    if (new Set([good, ...bad]).size < 4) continue;
    return T({ ask: `${rulesText(r)} Which list shows the ordered pairs (A, B) for terms 1, 2 and 3?`, answer: choice(good, bad),
      ways: [way('Work out the terms', [`A: ${row(r.a0, r.da, 3).join(', ')}. B: ${row(r.b0, r.db, 3).join(', ')}.`, `Pair each A with the B in the same position, A first: ${b(good)}`]),
        way('Rule out the others', ['Each pair must have the A number first and the B number from the same term.', `Only ${b(good)} does that for all three terms.`])],
      hint: HINTS.pair }, 'ruSet', { ...r });
  }
}
function ruOdd() {
  for (;;) {
    const r = { a0: rnd(0, 4), da: rnd(1, 4), b0: rnd(0, 5), db: rnd(2, 6) }, ts = shuffle([1, 2, 3, 4, 5, 6]).slice(0, 4), good = ts.slice(0, 3).map(i => pr(A(r, i), B(r, i)));
    const i = ts[3], y = B(r, i) + pick([-2, -1, 1, 2]), odd = pr(A(r, i), y);
    if (y < 0 || row(1, 1, 12).some(j => B(r, j) === y && A(r, j) === A(r, i))) continue;
    return T({ ask: `${rulesText(r)} Which ordered pair (A, B) does NOT come from these patterns?`, answer: choice(odd, good),
      ways: [way('Check each pair', [...[...good, odd].map(p => { const x = Number(p.slice(1).split(',')[0]), j = (x - r.a0) / r.da + 1; return `${p}: A is ${x} at term ${j}, where B is ${B(r, j)}.`; }), `Only ${b(odd)} has the wrong B.`]),
        way('Use the rules', [`B for the same term as A = ${A(r, i)} is ${B(r, i)}, not ${y}.`, `So ${b(odd)} does not belong.`])],
      hint: 'For each pair, find the term where A has that value and see which B goes with it.' }, 'ruOdd', { ...r, odd });
  }
}
const RULES = [['add', 'Add'], ['mul', 'Multiply by'], ['sub', 'Subtract']];
const apply = (rule, x) => (rule.op === 'add' ? x + rule.n : rule.op === 'mul' ? x * rule.n : x - rule.n);
const text = rule => `${RULES.find(o => o[0] === rule.op)[1]} ${rule.n}`;
function ruRel() {
  for (;;) {
    const kk = rnd(2, 6), m = rndNot(2, 5, [kk]), times = chance(0.5), a0 = rnd(1, 4), da = rnd(1, 4);
    const r = times ? { a0, da, b0: a0 * m, db: da * m } : { a0, da, b0: a0 + kk, db: da }, good = times ? { op: 'mul', n: m } : { op: 'add', n: kk };
    const pool = times ? [{ op: 'add', n: kk }, { op: 'add', n: m }, { op: 'mul', n: m + 1 }, { op: 'sub', n: kk }] : [{ op: 'mul', n: kk }, { op: 'add', n: m }, { op: 'sub', n: kk }, { op: 'mul', n: m }];
    const opts = [good, ...shuffle(pool).slice(0, 3)];
    if (new Set(opts.map(text)).size < 4 || opts.slice(1).some(o => row(1, 1, 5).every(i => apply(o, A(r, i)) === B(r, i)))) continue;
    const wrong = opts.slice(1).find(o => apply(o, A(r, 1)) !== B(r, 1));
    if (!wrong) continue;
    return T({ ask: `${rulesText(r)} Which rule changes each A term into the matching B term?`, visual: tbl(r, 5), answer: choice(text(good), opts.slice(1).map(text)),
      ways: [way('Test the first pairs', [`A is ${A(r, 1)} and B is ${B(r, 1)}: ${A(r, 1)} ${good.op === 'add' ? '+' : '×'} ${good.n} = ${B(r, 1)}.`, `A is ${A(r, 2)} and B is ${B(r, 2)}: ${A(r, 2)} ${good.op === 'add' ? '+' : '×'} ${good.n} = ${B(r, 2)}.`, `The rule that works for both is ${b(text(good))}.`]),
        way('Rule out a wrong one', [`Try ${text(wrong)}: ${A(r, 1)} gives ${apply(wrong, A(r, 1))}, but B is ${B(r, 1)}.`, `Only ${b(text(good))} works for every pair.`])],
      hint: 'Try each rule on the first pair of matching terms, then on the next pair.' }, 'ruRel', { ...r });
  }
}
function ruStory(L) {
  const n1 = nm(), same = L === 2 && chance(0.5), a0 = rnd(0, 20), da = rnd(2, 8), b0 = a0 + rnd(2, 15), db = same ? da : da + rnd(1, 4), w = rnd(4, 10);
  let n2 = nm(); while (n2 === n1) n2 = nm();
  const r = { a0, da, b0, db }, x = A(r, w), y = B(r, w), gap = y - x;
  return T({ story: `${n1} has ${k('$' + a0)} and saves ${k('$' + da)} each week. ${n2} has ${k('$' + b0)} and saves ${k('$' + db)} each week.`, ask: `After ${pl(w, 'week')}, how much more money does ${n2} have than ${n1}?`, answer: num(gap), op: 'multi',
    ways: [way('Work out each total', [`${n1}: ${a0} + ${w} × ${da} = ${x}`, `${n2}: ${b0} + ${w} × ${db} = ${y}`, `${y} − ${x} = ${b(gap)}`]),
      way('Compare the patterns', [`Start gap: ${b0} − ${a0} = ${b0 - a0}.`, `Each week the gap grows by ${db} − ${da} = ${db - da}, so after ${w} weeks it is ${b0 - a0} + ${w} × ${db - da} = ${b(gap)}`])],
    read: rd(`How much more ${n2} has after ${w} weeks.`, [`${n1}: $${a0}, saves $${da} a week`, `${n2}: $${b0}, saves $${db} a week`], 'Each person follows a rule: the start amount plus the weekly saving times the weeks.', `(${b0} + ${w} × ${db}) − (${a0} + ${w} × ${da})`), hint: 'Find how much each person has after that many weeks, then subtract.' }, 'ruStory', { ...r, w });
}
export function genTwoRules(L) {
  if (L === 1) return pick([() => ruTerm(1), ruPair, ruDiff, () => ruPlot(1)])();
  if (L === 2) return pick([() => ruAt(2), ruSet, ruTimes, () => ruPlot(2), () => ruStory(2)])();
  return pick([ruOdd, ruRel, () => ruAt(3), () => ruStory(3), () => ruPlot(2)])();
}
