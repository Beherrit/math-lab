// True or false number sentences and the equal sign: both sides must be the same amount. Find the number that balances them.
import { rnd, pick, chance, shuffle, b, way, nm, num, choice } from '../../util.js';
import { BLANK } from './words.js';
import { tfQ } from './forms.js';

const sideWays = (left, right, lv, rv, ok) => way('Picture a balance', [`${left} puts ${lv} on one side and ${right} puts ${rv} on the other.`,
  ok ? `Both sides are ${lv}, so the balance stays level: ${b('true')}.` : `The ${lv > rv ? 'left' : 'right'} side is ${Math.abs(lv - rv)} bigger, so the balance tips: ${b('false')}.`]);
function tfEq(left, right, lv, rv, hint) {
  const ok = lv === rv;
  return tfQ({ left, right, ok, hint, alt: sideWays(left, right, lv, rv, ok), why: [`Left side: ${left} = ${lv}.`, `Right side: ${right} = ${rv}.`, ok ? `${lv} and ${rv} match, so it is ${b('true')}.` : `${lv} and ${rv} are different, so it is ${b('false')}.`] });
}
// Four kinds of true or false sentence. `ok` says whether the sentence is made true.
const SENTENCES = {
  swap: (a, c, ok) => { const e = ok ? a : a + pick([-1, 1]); return tfEq(`${a} + ${c}`, `${c} + ${e}`, a + c, c + e, 'Does the order you add in change the total?'); },
  split: (a, c, ok) => { const e = ok ? 1 : pick([2, -1]); return tfEq(`${a} + ${c}`, `${a - 1} + ${c + e}`, a + c, a - 1 + c + e, 'Work out each side. One of the numbers moved a little.'); },
  flip: (a, c, ok) => { const r = ok ? a + c : a + c + pick([-2, -1, 1]); return tfEq(String(r), `${a} + ${c}`, r, a + c, 'The equal sign means both sides are the same amount, whichever side the sum is on.'); },
  minus: (a, c, ok) => { const e = ok ? a : a + pick([-1, 1]); return tfEq(`${a + c} − ${c}`, String(e), a, e, 'Does taking away the same number you added get you back to where you started?'); },
  shift: (a, c, ok) => { const k = rnd(1, 3), e = ok ? c - k : c - k + pick([-1, 1]); return tfEq(`${a} + ${c}`, `${a + k} + ${e}`, a + c, a + k + e, 'One number went up. Did the other come down by the same amount?'); },
};
// The way a gap is balanced: the side you can work out, then the missing part.
function balWays({ total, parts, known, ans, sub, from }) {
  const first = way('Work out the side you can', [`${parts} = ${total}.`, sub ? `${from} − ? has to be ${total}, so ? = ${from} − ${total} = ${b(ans)}.` : `${known} + ? has to be ${total}, so ? = ${total} − ${known} = ${b(ans)}.`]);
  const check = sub ? `Check: ${from} − ${ans} = ${total}.` : `Check: ${known} + ${ans} = ${total}.`;
  return [first, way('Think of a balance', [`Both sides have to be the same amount. The side you know is ${total}, so the other side must be ${total} too.`, `${check} The missing number is ${b(ans)}.`])];
}
const HINT_BAL = 'Work out the side with no gap first.';
// a + ? = c + d, in four layouts. The gap is filled by (c + d) - a.
function gapQ(a, c, d) {
  const total = c + d, ans = total - a, form = pick(['A', 'B', 'C', 'D']);
  const expr = { A: `${a} + ${BLANK} = ${c} + ${d}`, B: `${BLANK} + ${a} = ${c} + ${d}`, C: `${c} + ${d} = ${a} + ${BLANK}`, D: `${c} + ${d} = ${BLANK} + ${a}` }[form];
  return { ask: 'Both sides must be the same amount. What number goes in the gap?', expr, answer: num(ans), hint: HINT_BAL, _t: { f: 'bal', known: a, total },
    ways: balWays({ total, parts: `${c} + ${d}`, known: a, ans }) };
}
function subGapQ(c, d, from) {
  const total = c + d, ans = from - total;
  return { ask: 'Both sides must be the same amount. What number goes in the gap?', expr: `${from} − ${BLANK} = ${c} + ${d}`, answer: num(ans), hint: HINT_BAL, _t: { f: 'subgap', from, c, d },
    ways: balWays({ total, parts: `${c} + ${d}`, ans, sub: true, from }) };
}
// The slip: writing the total of the left side in the gap, as if the equal sign meant "the answer comes next".
function slipQ(a, c, d) {
  const left = a + c, ans = left - d;
  return { ask: `${nm()} writes ${b(left)} in the gap, because ${a} + ${c} is ${left}. But the two sides have to match. What number really goes in the gap?`, expr: `${a} + ${c} = ${BLANK} + ${d}`, answer: num(ans), hint: 'The right side has to come to the same total as the left side. What is left for the gap?',
    _t: { f: 'bal', known: d, total: left }, ways: [way('Find the slip', [`The gap is only one of the two numbers added on the right. The right side is ${BLANK} + ${d}, not just ${BLANK}.`, `The right side has to total ${left}, so the gap is ${left} − ${d} = ${b(ans)}.`]), balWays({ total: left, parts: `${a} + ${c}`, known: d, ans })[1]] };
}
// Which of four sentences is true? One is made true; the other three are slightly wrong.
const WHY = { swap: (a, c) => `Adding in a different order gives the same total, so ${a} + ${c} = ${c} + ${a}.`, split: (a, c) => `Moving 1 from one number to the other keeps the total: ${a} + ${c} = ${a - 1} + ${c + 1}.`,
  flip: (a, c) => `A sum can sit on either side of the equal sign: ${a + c} = ${a} + ${c}.`, minus: (a, c) => `Taking away ${c} undoes adding ${c}: ${a + c} − ${c} = ${a}.` };
const TEXT = { swap: (a, c, ok) => `${a} + ${c} = ${c} + ${ok ? a : a + 1}`, split: (a, c, ok) => `${a} + ${c} = ${a - 1} + ${c + (ok ? 1 : 2)}`,
  flip: (a, c, ok) => `${a + c + (ok ? 0 : 1)} = ${a} + ${c}`, minus: (a, c, ok) => `${a + c} − ${c} = ${a + (ok ? 0 : 1)}` };
function whichTrueQ(a, c) {
  const kinds = shuffle(Object.keys(WHY)), mine = kinds[0], text = kinds.map((k, i) => TEXT[k](a, c, i === 0));
  return { ask: 'Which sentence is true?', answer: choice(text[0], text.slice(1)), choiceBig: true, hint: 'Work out both sides of each sentence. Only one has sides that match.', _t: { f: 'eqtrue' },
    ways: [way('Check every sentence', [kinds.map((k, i) => `${text[i]}: ${i === 0 ? 'the sides match' : 'the sides are different'}`).join('. ') + '.', `Only ${b(text[0])} is true.`]), way('Spot the sentence that always works', [WHY[mine](a, c), `So ${b(text[0])} is true, because both of its sides are the same amount.`])] };
}
// Step 3: bigger numbers, where the sides are nearly the same.
const big = () => [rnd(21, 59), rnd(21, 39)];

export function genEqual(L) {
  if (L === 1) {
    const [c, d] = [rnd(2, 9), rnd(2, 9)], a = rnd(2, Math.min(9, c + d - 1)), x = rnd(3, 9), y = rnd(2, 9);
    return pick([() => SENTENCES[pick(['swap', 'flip', 'minus'])](x, y, chance(0.5)), () => gapQ(a, c, d), () => gapQ(a, c, d), () => whichTrueQ(x, y)])();
  }
  if (L === 2) {
    const [c, d] = [rnd(3, 10), rnd(3, 10)], a = rnd(3, c + d - 1), [x, y] = [rnd(3, 9), rnd(3, 9)], t = pick(['tf', 'tf', 'gap', 'sub', 'slip', 'which']);
    if (t === 'tf') return SENTENCES[pick(['swap', 'split', 'flip', 'minus'])](x + 1, y, chance(0.5));
    if (t === 'gap') return gapQ(a, c, d);
    if (t === 'sub') { const [p, q] = [rnd(2, 7), rnd(2, 7)]; return subGapQ(p, q, rnd(p + q + 2, 20)); }
    if (t === 'slip') return slipQ(x + 1, y, rnd(3, x + y));
    return whichTrueQ(x + 2, y);
  }
  const [a, c] = big(), t = pick(['shift', 'shift', 'gap', 'sub', 'slip', 'which']);
  if (t === 'shift') return SENTENCES[pick(['shift', 'shift', 'flip', 'minus', 'split'])](a, c, chance(0.5));
  if (t === 'gap') { const [p, q] = big(); return gapQ(rnd(11, p + q - 1), p, q); }
  if (t === 'sub') { const [p, q] = [rnd(11, 40), rnd(11, 30)]; return subGapQ(p, q, p + q + rnd(5, 25)); }
  if (t === 'slip') return slipQ(a, c, rnd(11, a + c - 5));
  return whichTrueQ(a, c);
}
