// Subtracting within 20: think addition, back through ten, missing numbers, balance sentences and fact families.
import { rnd, pick, chance, b, way, num, choice } from '../../util.js';
import { tenBar } from './pics.js';
import { BLANK } from './words.js';
import { subWays } from './facts.js';
import { noRepeat, nearMiss, errorQ, tfQ } from './forms.js';

const nextPair = noRepeat(8);
const subQ = (a, c, ask, hint, visual) => ({ ask, expr: `${a} − ${c}`, visual, answer: num(a - c), ways: subWays(a, c), hint, _t: { f: 'sub', a, b: c } });

// ? − c = d  or  a − ? = d, with both parts up to `maxPart`.
function missingSub(maxPart) {
  const c = rnd(2, maxPart), d = rnd(2, maxPart), a = c + d;
  if (chance(0.5)) return { ask: 'What number is missing?', expr: `${BLANK} − ${c} = ${d}`, answer: num(a), hint: 'Put the two parts back together.', _t: { f: 'add', xs: [c, d] },
    ways: [way('Put the parts back', [`Some number, take away ${c}, leaves ${d}.`, `So the number is both parts together: ${d} + ${c} = ${b(a)}.`]), way('Check it', [`${a} − ${c} = ${d}. It fits.`])] };
  return { ask: 'What number is missing?', expr: `${a} − ${BLANK} = ${d}`, answer: num(c), hint: `How far is it from ${d} up to ${a}?`, _t: { f: 'sub', a, b: d },
    ways: [way('Think addition', [`${a} is made of two parts. One part is ${d}.`, `${d} + ? = ${a}. Count up: the other part is ${b(c)}.`]), way('Subtract the part you know', [`${a} − ${d} = ${b(c)}.`, `Check: ${a} − ${c} = ${d}.`])] };
}
function familyQ() {
  const x = rnd(3, 9); let y = rnd(2, 9); if (y === x) y = x === 9 ? 4 : x + 1;
  const s = x + y, hi = Math.max(x, y), lo = Math.min(x, y), right = `${s} − ${x} = ${y}`;
  // Every wrong choice either is false or brings in a number outside the family {x, y, s}.
  return { ask: `Which subtraction fact uses the same three numbers as ${b(`${x} + ${y} = ${s}`)}?`, hint: 'A fact family uses the same three numbers. The biggest one is the whole.', _t: { f: 'family', x, y },
    answer: choice(right, [`${hi} − ${lo} = ${hi - lo}`, `${s} + ${x} = ${s + x}`, `${s} − ${x} = ${y + 1}`]),
    ways: [way('Whole and parts', [`In ${x} + ${y} = ${s}, the whole is ${s} and the parts are ${x} and ${y}.`, `Take one part away from the whole and the other part is left: ${b(right)}.`]),
      way('List the family', [`${x} + ${y} = ${s}`, `${y} + ${x} = ${s}`, `${s} − ${x} = ${y}`, `${s} − ${y} = ${x}`, 'Four facts, the same three numbers every time.'])] };
}
// a − c = ? − e : the same difference on both sides.
function balanceQ() {
  const a = rnd(12, 18), c = rnd(3, 9), d = a - c, e = rnd(2, Math.min(5, 20 - d));
  return { ask: 'Both sides must come to the same number. What number is missing?', expr: `${a} − ${c} = ${BLANK} − ${e}`, answer: num(d + e), hint: 'Work out the side with no gap first.', _t: { f: 'add', xs: [d, e] },
    ways: [way('Work out the whole side', [`${a} − ${c} = ${d}.`, `The other side must also be ${d}: ${BLANK} − ${e} = ${d}.`, `Put the ${e} back: ${d} + ${e} = ${b(d + e)}.`])
      , way('Check it', [`${d + e} − ${e} = ${d}, and ${a} − ${c} = ${d}. Both sides match.`])] };
}
function tfDiff(a, c) {
  const d = a - c, ok = chance(0.5), r = ok ? d : nearMiss(d, 19);
  return tfQ({ left: `${a} − ${c}`, right: String(r), ok, hint: 'Work out the left side first, then compare.', why: [`${a} − ${c} = ${d}.`, ok ? `${d} matches, so it is ${b('true')}.` : `${r} is not ${d}, so it is ${b('false')}.`] });
}
function slipQ(a, c) {
  const d = a - c, wrong = d + (chance(0.5) ? 1 : -1);
  return errorQ({ a, c, op: 'sub', wrong, hint: 'Think addition: what do you add to the smaller number?', ways: subWays(a, c),
    slip: wrong > d ? 'The count back stopped one step short.' : 'The count back went one step too far.' });
}
const through = () => nextPair(() => { const a = rnd(11, 18); return [a, rnd(a - 9, 9)]; }, p => p.join());

export function genSub(L) {
  if (L === 1) {
    const t = pick(['ten', 'small', 'teen', 'teen', 'miss', 'tf']);
    if (t === 'ten') { const c = rnd(1, 9); return subQ(10, c, `Subtract. What goes with ${c} to make 10?`, `Count up from ${c} to 10.`, tenBar(10 - c, c)); }
    if (t === 'small') { const a = rnd(5, 9); return subQ(a, rnd(1, a - 1), 'Subtract.', 'Think: what do I add to get back to the first number?'); }
    if (t === 'miss') return missingSub(6);
    if (t === 'tf') { const a = rnd(6, 12); return tfDiff(a, rnd(2, a - 2)); }
    const a = rnd(12, 19), c = chance(0.25) ? 10 : rnd(1, a - 10);
    return subQ(a, c, 'Subtract. Use the ten.', `Split ${a} into a ten and the ones. Which part do you take from?`);
  }
  if (L === 2) {
    const t = pick(['through', 'through', 'twenty', 'miss', 'tf', 'slip']);
    if (t === 'twenty') { const c = rnd(2, 9); return subQ(20, c, 'Subtract. Twenty is two tens.', `20 is two tens. Take ${c} from one of them.`); }
    if (t === 'miss') return missingSub(9);
    const [a, c] = through();
    if (t === 'tf') return tfDiff(a, c);
    if (t === 'slip') return slipQ(a, c);
    return subQ(a, c, 'Subtract.', 'Get down to 10 first. How many is that?');
  }
  const t = pick(['miss', 'family', 'cross', 'cross', 'balance', 'tf']);
  if (t === 'miss') return missingSub(9);
  if (t === 'family') return familyQ();
  if (t === 'balance') return balanceQ();
  const a = rnd(13, 18);
  if (t === 'tf') return tfDiff(a, rnd(a - 9, 9));
  return subQ(a, rnd(a - 9, 9), 'Subtract. Think addition.', 'Think addition: what do you add to the smaller number?');
}
