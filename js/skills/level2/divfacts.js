// Division facts from multiplication facts: the unknown factor, dividing by 1 and by itself, why not by 0, and neighbouring facts.
import { rnd, pick, shuffle, b, way, nm, num, choice } from '../../util.js';
import { BLANK, skips } from './words.js';
import { yesNo } from './kit.js';

function unknownQ(t, d) {
  const q = t / d;
  return { ask: 'Turn the division into a multiplication with a missing number, then solve it.', expr: `${t} ÷ ${d}`, answer: num(q), _t: { f: 'div', a: t, b: d }, hint: 'Which number times the divisor makes the total?',
    ways: [way('Find the unknown factor', [`${t} ÷ ${d} asks: ${d} × ? = ${t}.`, `${d} × ${q} = ${t}, so ${t} ÷ ${d} = ${b(q)}.`]), way('Skip count', [`Count by ${d}s until you reach ${t}: ${skips(q, d)}.`, `You said ${q} numbers, so the answer is ${b(q)}.`])] };
}
// Dividing by 1, by itself, and zero divided by a number.
const SPECIAL = {
  one: n => ({ a: n, c: 1, ans: n, w: [`1 × ? = ${n}. One group of ${n} is ${n}.`, `So ${n} ÷ 1 = ${b(n)}.`], w2: [`Put ${n} things into 1 group.`, `The one group gets all of them: ${b(n)}.`] }),
  self: n => ({ a: n, c: n, ans: 1, w: [`${n} × ? = ${n}. You need just one group of ${n}.`, `So ${n} ÷ ${n} = ${b(1)}.`], w2: [`How many groups of ${n} fit into ${n}?`, `Exactly ${b(1)}.`] }),
  zero: n => ({ a: 0, c: n, ans: 0, w: [`${n} × ? = 0. The only way is no groups at all, ${n} × 0 = 0.`, `So 0 ÷ ${n} = ${b(0)}.`], w2: [`Share 0 things among ${n} groups.`, `Nobody gets anything: ${b(0)} each.`] }),
};
function specialQ(kind, n) {
  const s = SPECIAL[kind](n);
  return { ask: 'Think about what the division means, then work it out.', expr: `${s.a} ÷ ${s.c}`, answer: num(s.ans), _t: { f: 'div', a: s.a, b: s.c }, hint: 'Turn it into a multiplication with a missing number.', ways: [way('Think multiplication', s.w), way('Think sharing', s.w2)] };
}
// Which of these has no answer? Only dividing by zero is impossible.
function noAnswerQ(n) {
  const right = `${n} ÷ 0`;
  return { ask: 'Which one of these has no answer?', answer: choice(right, [`0 ÷ ${n}`, `${n} ÷ ${n}`, `${n} ÷ 1`]), choiceBig: true, _t: { f: 'nodiv0', n }, hint: 'For each one, ask: which number times the divisor makes the total? Does such a number always exist?',
    ways: [way('Test with multiplication', [`${n} ÷ 0 would need 0 × ? = ${n}. But anything times 0 is 0, never ${n}.`, `The others work: 0 ÷ ${n} = 0, ${n} ÷ ${n} = 1 and ${n} ÷ 1 = ${n}.`, `So ${b(right)} has no answer.`]),
      way('Try sharing', [`${n} ÷ 0 means sharing ${n} things among 0 groups.`, `There is nobody to give them to, so it cannot be done: ${b(right)}.`])] };
}
// True or false about dividing by 1, by itself, by 0 and zero divided by something. Each sentence is judged by working it out.
function sayQ(n, ok) {
  const all = [[`${n} ÷ 1 = ${n}`, true, `${n} things in 1 group stay ${n}.`], [`${n} ÷ ${n} = 1`, true, `${n} fits into ${n} exactly once.`], [`0 ÷ ${n} = 0`, true, 'Nothing shared out leaves nothing for everyone.'],
    [`${n} ÷ 1 = 1`, false, `${n} things in 1 group is ${n}, not 1.`], [`${n} ÷ ${n} = 0`, false, `${n} fits into ${n} once, not 0 times.`], [`${n} ÷ 0 = 0`, false, `${n} ÷ 0 has no answer: 0 × ? is never ${n}.`], [`0 ÷ ${n} = ${n}`, false, `${n} × ${n} is not 0, so that cannot be right.`]];
  const [expr, real, why] = pick(all.filter(x => x[1] === ok));
  return { ask: 'True or false?', expr, answer: yesNo(real), choiceBig: true, _t: { f: 'tf', ok: real }, hint: 'Turn it into a multiplication with a missing number and test it.',
    ways: [way('Think about the groups', [why, real ? `So the sentence is ${b('True')}.` : `So the sentence is ${b('False')}.`]), way('Test with multiplication', [real ? `Check: the answer times the divisor gives back the total, so it fits.` : 'Check: the answer times the divisor does not give back the total, so it does not fit.', real ? `It is ${b('True')}.` : `It is ${b('False')}.`])] };
}
// A neighbouring fact: one more group, one fewer, double, or half of a fact you know.
function nearQ(d, q0, kind) {
  const q = { plus: q0 + 1, minus: q0 - 1, double: q0 * 2, half: q0 / 2 }[kind], t = d * q, known = d * q0;
  const how = { plus: `${t} is one more group of ${d} than ${known}.`, minus: `${t} is one group of ${d} fewer than ${known}.`, double: `${t} is double ${known}.`, half: `${t} is half of ${known}.` }[kind];
  const calc = { plus: `${q0} + 1 = ${b(q)}.`, minus: `${q0} − 1 = ${b(q)}.`, double: `${q0} × 2 = ${b(q)}.`, half: `${q0} ÷ 2 = ${b(q)}.` }[kind];
  return { ask: `You know that ${known} ÷ ${d} = ${q0}. Use it to work out ${t} ÷ ${d}.`, expr: `${t} ÷ ${d}`, answer: num(q), _t: { f: 'div', a: t, b: d }, hint: `Compare the new total with the one you know. Is it one more group, one fewer, double or half?`,
    ways: [way('Use the neighbouring fact', [how, `So the answer changes in the same way: ${calc}`]), way('Check by multiplying', [`${d} × ? = ${t}.`, `${d} × ${q} = ${t}, so ${t} ÷ ${d} = ${b(q)}.`])] };
}
function missingQ(t, d) {
  const q = t / d, total = rnd(0, 1) === 0;
  return total ? { ask: 'What number is missing?', expr: `${BLANK} ÷ ${d} = ${q}`, answer: num(t), _t: { f: 'mul', a: q, b: d }, hint: 'How many groups, and how many in each? What total do they make?',
    ways: [way('Build the total', [`${q} groups of ${d} make the total: ${q} × ${d}.`, `${q} × ${d} = ${b(t)}.`]), way('Check by dividing', [`Try ${t}: ${t} ÷ ${d} = ${q}. It fits.`, `The missing number is ${b(t)}.`])] }
    : { ask: 'What number is missing?', expr: `${t} ÷ ${BLANK} = ${q}`, answer: num(d), _t: { f: 'div', a: t, b: q }, hint: 'Think of the multiplication: the answer times the missing number makes the total.',
      ways: [way('Use the fact family', [`${t} ÷ ? = ${q} means ${q} × ? = ${t}.`, `${q} × ${d} = ${t}, so the missing number is ${b(d)}.`]), way('Try it', [`Try ${d}: ${t} ÷ ${d} = ${q}. That matches.`, `The missing number is ${b(d)}.`])] };
}
// "Which multiplication fact helps?" Every option is a true fact, but only one uses the total and the divisor.
function helpsQ(t, d) {
  const q = t / d, fact = (x, y) => (rnd(0, 1) ? `${x} × ${y} = ${x * y}` : `${y} × ${x} = ${x * y}`);
  const others = [[d, q + 1], [d, q - 1], [d + 1, q], [d - 1, q]].filter(([x, y]) => x > 1 && y > 1 && ![x, y, x * y].includes(t)), right = fact(d, q);
  return { ask: `Which multiplication fact helps you work out ${t} ÷ ${d}?`, answer: choice(right, shuffle(others).slice(0, 3).map(([x, y]) => fact(x, y))), choiceBig: true, _t: { f: 'helps', t, d }, hint: `You need the fact that makes ${t} using ${d}.`,
    ways: [way('Use the total and the divisor', [`${t} ÷ ${d} asks: ${d} times what makes ${t}?`, `The fact that gets to ${t} using ${d} is ${b(right)}.`]), way('Check each fact', ['All the choices are true multiplication facts.', `Only ${b(right)} makes ${t} and uses ${d}, so it is the one that helps.`])] };
}
const STORY = [(t, d, m) => [`Cards come in packs of ${d}. ${m} needs ${t} cards.`, 'How many packs is that?', 'packs'], (t, d) => [`A bus seats ${d} people. ${t} people are going on a trip.`, 'How many buses are needed?', 'buses'],
  (t, d, m) => [`${m} saves ${d} dollars a week for a game that costs ${t} dollars.`, 'How many weeks will it take?', 'weeks'], (t, d) => [`A baker puts ${d} rolls in each bag and has ${t} rolls.`, 'How many bags does the baker fill?', 'bags']];
function storyQ(t, d) {
  const q = t / d, [story, ask, suffix] = pick(STORY)(t, d, nm());
  return { story, ask, answer: num(q), suffix, _t: { f: 'div', a: t, b: d }, hint: 'Write it as a multiplication with a missing number: the size of a group times the number of groups.',
    ways: [way('Find the unknown factor', [`${d} × ? = ${t}.`, `${d} × ${q} = ${t}, so the answer is ${b(q)}.`]), way('Skip count', [`Count by ${d}s until you reach ${t}: ${skips(q, d)}.`, `You said ${q} numbers: ${b(q)}.`])] };
}
const coin = () => Math.random() < 0.5;
const two = (lo, hi, lo2, hi2) => { const d = rnd(lo, hi); return [d * rnd(lo2, hi2), d]; };
export function genDivFacts(L) {
  const [lo, hi, qlo, qhi] = L === 1 ? [2, 5, 2, 9] : L === 2 ? [3, 9, 3, 9] : [6, 12, 4, 12], [t, d] = two(lo, hi, qlo, qhi), n = rnd(L === 1 ? 2 : 4, L === 3 ? 12 : 9);
  const pool = L === 1 ? [() => unknownQ(t, d), () => specialQ(pick(['one', 'self', 'zero']), n), () => helpsQ(t, d), () => nearQ(d, rnd(2, 8), pick(['plus', 'minus'])), () => storyQ(t, d), () => missingQ(t, d)]
    : L === 2 ? [() => unknownQ(t, d), () => specialQ(pick(['one', 'self', 'zero']), n), () => sayQ(n, pick([true, false])), () => noAnswerQ(n), () => (coin() ? nearQ(d, rnd(3, 8), pick(['plus', 'minus'])) : nearQ(rnd(3, 9), rnd(2, 5), 'double')), () => helpsQ(t, d), () => missingQ(t, d), () => storyQ(t, d)]
      : [() => unknownQ(t, d), () => (coin() ? nearQ(rnd(3, 12), 2 * rnd(2, 6), 'half') : nearQ(d, rnd(3, 11), pick(['plus', 'minus']))), () => missingQ(t, d), () => noAnswerQ(n), () => sayQ(n, pick([true, false])), () => helpsQ(t, d), () => storyQ(t, d)];
  return pick(pool)();
}
