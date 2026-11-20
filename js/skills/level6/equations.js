// Two-step equations: the balance model first, then inverse operations, with negatives and brackets.
import { R, rnd, pick, chance, fmt, F, b, k, way, nm, choice } from '../../util.js';
import { nz, par, size, xTerm, lin, plusMinus, snum, tag } from './helpers.js';
import { balance } from './visuals-lines.js';

const left = { 'ax+b': (a, bb) => lin(a, bb), 'x/a+b': (a, bb) => `${F('x', a)} ${plusMinus(bb)}`, 'a(x+b)': (a, bb) => `${fmt(a)}(${lin(1, bb)})` };
const undoAdd = bb => (bb < 0 ? `add ${size(bb)} to` : `subtract ${size(bb)} from`);
const checkWay = (form, a, bb, c, x) => way('Check by putting it back in', [
  form === 'ax+b' ? `${par(a)} × ${par(x)} ${plusMinus(bb)} = ${fmt(a * x)} ${plusMinus(bb)} = ${fmt(c)}`
    : form === 'x/a+b' ? `${fmt(x)} ÷ ${a} ${plusMinus(bb)} = ${fmt(x / a)} ${plusMinus(bb)} = ${fmt(c)}` : `${par(a)} × (${fmt(x)} ${plusMinus(bb)}) = ${par(a)} × ${par(R(x + bb))} = ${fmt(c)}`,
  `Both sides are ${fmt(c)}, so x = ${fmt(x)} is right.`]);
function balanceWay(a, bb, c, x) {
  const xs = a <= 4 ? Array(a).fill('x').join(' + ') : `${a} lots of x`;
  return way('Balance model', [`Picture a balance. One pan holds ${xs} and ${bb}. The other holds ${c}. They weigh the same.`, balance(`${xs} + ${bb}`, `${c}`),
    `Take ${bb} off BOTH pans, so it still balances: ${xTerm(a)} = ${c} − ${bb} = ${b(c - bb)}.`,
    `Now ${a} equal x's balance ${c - bb}. Share it out: ${c - bb} ÷ ${a} = ${b(x)}, so x = ${b(x)}.`]);
}
function inverseWay(form, a, bb, c, x) {
  if (form === 'a(x+b)') return way('Divide first', [`The brackets are multiplied by ${fmt(a)}. Undo that first: divide both sides by ${fmt(a)}.`,
    `${lin(1, bb)} = ${fmt(c)} ÷ ${par(a)} = ${b(fmt(c / a))}`, `Then ${undoAdd(bb)} both sides: x = ${fmt(c / a)} ${plusMinus(-bb)} = ${b(fmt(x))}`]);
  const mid = c - bb, second = form === 'ax+b' ? `x is multiplied by ${fmt(a)}, so divide both sides by ${fmt(a)}: x = ${fmt(mid)} ÷ ${par(a)} = ${b(fmt(x))}`
    : `x is divided by ${a}, so multiply both sides by ${a}: x = ${fmt(mid)} × ${a} = ${b(fmt(x))}`;
  return way('Undo it in reverse order', [`Someone took x, ${form === 'ax+b' ? `multiplied by ${fmt(a)}` : `divided by ${a}`}, then ${bb < 0 ? `subtracted ${size(bb)}` : `added ${size(bb)}`}. Undo the last thing first.`,
    `${undoAdd(bb)[0].toUpperCase() + undoAdd(bb).slice(1)} both sides: ${form === 'ax+b' ? xTerm(a) : F('x', a)} = ${fmt(c)} ${plusMinus(-bb)} = ${b(fmt(mid))}`, second]);
}
const distributeWay = (a, bb, c, x) => way('Expand first', [`Multiply out the brackets: ${lin(a, a * bb)} = ${fmt(c)}.`,
  `${undoAdd(a * bb)[0].toUpperCase() + undoAdd(a * bb).slice(1)} both sides: ${xTerm(a)} = ${fmt(c - a * bb)}.`, `Divide by ${fmt(a)}: x = ${b(fmt(x))}`]);
function problem(form, a, bb, x, flip = false) {
  const c = form === 'ax+b' ? a * x + bb : form === 'x/a+b' ? x / a + bb : a * (x + bb), lhs = left[form](a, bb);
  const simple = form === 'ax+b' && Number.isInteger(a) && a > 0 && bb > 0 && x > 0 && a <= 6;
  const ways = [simple ? balanceWay(a, bb, c, x) : form === 'a(x+b)' ? distributeWay(a, bb, c, x) : null, inverseWay(form, a, bb, c, x), checkWay(form, a, bb, c, x)].filter(Boolean);
  return tag({ ask: 'Solve for x.', expr: flip ? `${fmt(c)} = ${lhs}` : `${lhs} = ${fmt(c)}`, visual: simple ? balance(lhs, fmt(c)) : undefined, answer: snum(x), ways,
    hint: form === 'a(x+b)' ? `Everything in the brackets is multiplied by ${fmt(a)}. What undoes that?` : `Get the x term by itself first: ${undoAdd(bb)} both sides.` }, { kind: 'lineq', form, a, b: bb, c });
}
const WORD = [
  { s: (a, bb, c, n) => `A gym charges a joining fee of ${k('$' + bb)} and then ${k('$' + a + ' a month')}. ${n} has paid ${k('$' + c)} in total.`, ask: 'For how many months has the gym been paid?', a: [8, 15], bb: [10, 40], x: 'months', fixed: 'joining fee', each: 'a month' },
  { s: (a, bb, c, n) => `A taxi ride costs ${k('$' + bb)} to start, plus ${k('$' + a + ' for each kilometre')}. ${n}'s ride cost ${k('$' + c)}.`, ask: 'How many kilometres was the ride?', a: [2, 4], bb: [3, 8], x: 'kilometres', fixed: 'starting cost', each: 'a kilometre' },
  { s: (a, bb, c, n) => `${n} already has ${k('$' + bb)} and saves ${k('$' + a + ' every week')}. ${n} wants ${k('$' + c)} for a new bike.`, ask: 'How many weeks of saving will it take?', a: [3, 15], bb: [5, 40], x: 'weeks', fixed: 'money already saved', each: 'a week' },
  { s: (a, bb, c) => `A print shop charges ${k('$' + bb)} to set up a design and ${k('$' + a + ' for each shirt')}. An order costs ${k('$' + c)}.`, ask: 'How many shirts were ordered?', a: [5, 12], bb: [10, 40], x: 'shirts', fixed: 'set-up cost', each: 'a shirt' },
  { s: (a, bb, c) => `A music app costs ${k('$' + bb)} to join and ${k('$' + a + ' for each album')}. A bill comes to ${k('$' + c)}.`, ask: 'How many albums were bought?', a: [4, 12], bb: [5, 20], x: 'albums', fixed: 'joining cost', each: 'an album' },
];
export function eqWord(L) {
  const w = pick(WORD), a = rnd(...w.a), x = rnd(2, 12), bb = rnd(...w.bb), c = a * x + bb, n = nm();
  if (a === bb) return eqWord(L);
  const base = { story: w.s(a, bb, c, n), op: 'multi', read: { find: `The number of ${w.x}.`, know: [`${w.fixed}: $${bb} (paid once)`, `$${a} ${w.each}`, `total: $${c}`],
    clue: `The ${w.fixed} happens once. The $${a} happens again and again, so it is multiplied by the number of ${w.x}.`, plan: `${a}x + ${bb} = ${c}` } };
  const ways = [way('Write an equation', [`Let x be the number of ${w.x}. ${a} for each one makes ${a}x. The ${w.fixed} adds ${bb}.`, `${b(`${a}x + ${bb} = ${c}`)}`,
    `Subtract ${bb} from both sides: ${a}x = ${c - bb}.`, `Divide both sides by ${a}: x = ${b(x)}`]),
    way('Work backwards without x', [`Take off the ${w.fixed} first: ${c} − ${bb} = ${c - bb}. That part was paid at $${a} ${w.each}.`, `${c - bb} ÷ ${a} = ${b(x)} ${w.x}`])];
  if (L >= 3 && chance(0.4)) return tag({ ...base, ask: `Let x be the number of ${w.x}. Which equation matches the story?`,
    answer: choice(`${a}x + ${bb} = ${c}`, [`${bb}x + ${a} = ${c}`, `${a}(x + ${bb}) = ${c}`, `${a}x = ${c} + ${bb}`]),
    ways: [ways[0], way('Test the equations with the real answer', [`Working backwards, the answer is ${x} ${w.x}.`, `Only ${b(`${a}x + ${bb} = ${c}`)} is true when x = ${x}: ${a} × ${x} + ${bb} = ${c}.`])],
    hint: 'Which amount is paid once, and which is paid for every one?' }, { kind: 'eqchoice', a, b: bb, c });
  return tag({ ...base, ask: w.ask, answer: snum(x), ways, hint: `Take away the ${w.fixed} first. What is left was paid at $${a} ${w.each}.` }, { kind: 'lineq', form: 'ax+b', a, b: bb, c });
}
function decimalCoef() {
  const a = pick([0.5, 1.5, 2.5, 0.25]), x = nz(-6, 6) * (a === 0.25 ? 4 : 2), bb = nz(-9, 9);
  return problem('ax+b', a, bb, x);
}
export function genEq2(L) {
  if (L === 1) { const a = rnd(2, 6), x = rnd(2, 9); return chance(0.6) ? problem('ax+b', a, rnd(1, 12), x) : problem('ax+b', a, -rnd(1, Math.min(12, a * x - 1)), x); }
  if (L === 2) {
    if (chance(0.3)) { const a = rnd(2, 9); return problem('x/a+b', a, nz(-12, 12), a * nz(-6, 6)); }
    for (;;) { const a = nz(-9, 9), bb = nz(-15, 15), x = nz(-9, 9); if (Math.abs(a) > 1 && (a < 0 || bb < 0 || x < 0)) return problem('ax+b', a, bb, x); }
  }
  const r = Math.random();
  if (r < 0.35) { const a = nz(-6, 6); return Math.abs(a) === 1 ? genEq2(L) : problem('a(x+b)', a, nz(-9, 9), nz(-9, 9)); }
  if (r < 0.55) return decimalCoef();
  if (r < 0.7) { const a = nz(-12, 12); return Math.abs(a) === 1 ? genEq2(L) : problem('ax+b', a, nz(-20, 20), nz(-12, 12), true); }
  return eqWord(L);
}
