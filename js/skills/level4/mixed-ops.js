// Skill l4mixas: adding and subtracting mixed numbers with unlike denominators, with regrouping (5.NF.1).
import { rnd, pick, chance, lcm, F, k, nm, frac } from '../../util.js';
import { T, rd, BLANK } from './helpers.js';
import { term, whole, imp, mix, densFor, mixedWays, chainWays } from './fracs.js';

const valueOf = x => imp(x) / x.d;
// Two mixed numbers for A + B or A - B (A the bigger one when subtracting). regroup says whether the parts must carry or borrow.
function pair(L, op, regroup) {
  for (let t = 0; t < 400; t++) {
    const [d1, d2] = densFor(L), A = term(op === '+' ? rnd(1, 4 + L) : rnd(3, 5 + L * 2), d1), B = term(op === '+' ? rnd(1, 4 + L) : rnd(1, A.w - 1), d2);
    const l = lcm(d1, d2), nA = A.n * l / d1, nB = B.n * l / d2;
    if ((op === '+' ? nA + nB >= l : nA < nB) === regroup) return [A, B];
  }
  return pair(L, op, !regroup);
}
const addHint = 'Give the fractions the same bottom first. Then add the wholes and add the parts.';
const subHint = 'Give the fractions the same bottom first. If the top fraction is too small, regroup one whole.';

function mxPlain(L, op) {
  const [A, B] = pair(L, op, L > 1 && chance(0.7)), { res, l, ways } = mixedWays(A, B, op);
  return T({ ask: op === '+' ? 'Add.' : 'Subtract.', expr: `${mix(A)} ${op} ${mix(B)}`, answer: frac(res, l), ways, hint: op === '+' ? addHint : subHint }, op === '+' ? 'mxadd' : 'mxsub', { A, B });
}
function mxwhole(L) {
  const d = L === 1 ? pick([2, 4]) : pick([3, 5, 6, 7, 8]), A = whole(rnd(3, 8)), B = term(rnd(1, A.w - 1), d), { res, l, ways } = mixedWays(A, B, '−');
  return T({ ask: 'Subtract.', expr: `${A.w} − ${mix(B)}`, answer: frac(res, l), ways, hint: 'There is no fraction to take the part from. Regroup one whole into pieces first.' }, 'mxwhole', { A: A.w, B });
}
function mxmiss(L) {
  const [A, B] = pair(L, '−', L > 1 && chance(0.7)), { res, l, ways } = mixedWays(A, B, '−');
  ways[0].s.unshift(`The missing part is what is left when ${mix(B)} is taken away from ${mix(A)}.`);
  return T({ ask: 'Find the missing number.', expr: `${BLANK} + ${mix(B)} = ${mix(A)}`, answer: frac(res, l), ways, hint: 'Take the part you know away from the total. That leaves the missing part.' }, 'mxmiss', { A, B });
}
const ADD = [
  (n, A, B) => ({ story: `${n} ran ${k(mix(A) + ' miles')} on Saturday and ${k(mix(B) + ' miles')} on Sunday.`, ask: `How far did ${n} run in all?`, find: 'The total distance run.' }),
  (n, A, B) => ({ story: `A recipe uses ${k(mix(A) + ' cups')} of flour and ${k(mix(B) + ' cups')} of oats.`, ask: 'How many cups of dry ingredients is that?', find: 'The total cups of flour and oats.' }),
  (n, A, B) => ({ story: `Two boards are ${k(mix(A) + ' feet')} and ${k(mix(B) + ' feet')} long.`, ask: 'How long are they laid end to end?', find: 'The total length of both boards.' }),
  (n, A, B) => ({ story: `${n} practiced guitar for ${k(mix(A) + ' hours')} on Monday and ${k(mix(B) + ' hours')} on Tuesday.`, ask: `How long did ${n} practice in all?`, find: 'The total practice time.' }),
];
const SUB = [
  (n, A, B) => ({ story: `A hiking trail is ${k(mix(A) + ' miles')} long. ${n} has hiked ${k(mix(B) + ' miles')}.`, ask: 'How much farther is there to go?', find: 'The distance still to hike.' }),
  (n, A, B) => ({ story: `A water tank holds ${k(mix(A) + ' gallons')}. ${n} uses ${k(mix(B) + ' gallons')} on the garden.`, ask: 'How much water is left?', find: 'The water still in the tank.' }),
  (n, A, B) => ({ story: `A rope is ${k(mix(A) + ' meters')} long. ${n} cuts off ${k(mix(B) + ' meters')}.`, ask: 'How long is the rope now?', find: 'The length of rope that is left.' }),
  (n, A, B) => ({ story: `${n} has ${k(mix(A) + ' cups')} of flour and uses ${k(mix(B) + ' cups')} for bread.`, ask: 'How much flour is left?', find: 'The flour that is left.' }),
];
// Story source and skill shape: add or subtract two amounts that are mixed numbers.
export function mixWord(L = 2) {
  const lv = Math.min(3, Math.max(1, L)), add = chance(0.5), [A, B] = pair(lv, add ? '+' : '−', lv > 1 && chance(0.7)), { res, l, ways } = mixedWays(A, B, add ? '+' : '−'), n = nm();
  const c = pick(add ? ADD : SUB)(n, A, B);
  return T({ story: c.story, ask: c.ask, answer: frac(res, l), ways, op: add ? 'add' : 'sub',
    read: rd(c.find, [`${mix(A)} and ${mix(B)}`], add ? '“in all” and “together” mean add' : '“left”, “still to go” and “cuts off” mean subtract', `${mix(A)} ${add ? '+' : '−'} ${mix(B)}`), hint: add ? addHint : subHint }, 'mxstory', { A, B, add });
}
function mxadd3() {
  const ds = pick([[2, 3, 6], [2, 4, 3], [3, 4, 6], [2, 5, 10], [3, 6, 4]]), terms = ds.map(d => term(rnd(1, 4), d)), { res, l, ways } = chainWays(terms, ['+', '+']);
  return T({ ask: 'Add.', expr: terms.map(mix).join(' + '), exprSmall: true, answer: frac(res, l), ways, hint: 'Use one bottom for all three fractions, or add two at a time.' }, 'mxadd3', { terms });
}
function minus2() {
  for (;;) {
    const d = pick([[2, 3, 4], [3, 4, 6], [4, 6, 3], [2, 5, 4], [3, 5, 6]]), A = term(rnd(6, 10), d[0]), B = term(rnd(1, 3), d[1]), C = term(rnd(1, 3), d[2]);
    if (valueOf(A) - valueOf(B) - valueOf(C) > 0.2) return [A, B, C];
  }
}
function mxsub2() {
  const terms = minus2(), { res, l, ways } = chainWays(terms, ['−', '−']);
  return T({ ask: 'Subtract.', expr: terms.map(mix).join(' − '), exprSmall: true, answer: frac(res, l), ways, hint: 'Subtract the first two, then take the third away from what is left.' }, 'mxsub2', { terms });
}
const TWO = [
  (n, A, B, C) => ({ story: `${n} buys a bag with ${k(mix(A) + ' pounds')} of trail mix and eats ${k(mix(B) + ' pounds')} on Saturday and ${k(mix(C) + ' pounds')} on Sunday.`, ask: 'How much trail mix is left?', find: 'The trail mix that is left.' }),
  (n, A, B, C) => ({ story: `A ribbon is ${k(mix(A) + ' meters')} long. ${n} cuts off ${k(mix(B) + ' meters')} for a gift and ${k(mix(C) + ' meters')} for a card.`, ask: 'How much ribbon is left?', find: 'The ribbon that is left.' }),
  (n, A, B, C) => ({ story: `A tank has ${k(mix(A) + ' gallons')}. ${n} uses ${k(mix(B) + ' gallons')} on the plants and ${k(mix(C) + ' gallons')} on the car.`, ask: 'How much water is left?', find: 'The water that is left.' }),
  (n, A, B, C) => ({ story: `A trail is ${k(mix(A) + ' miles')} long. ${n} hikes ${k(mix(B) + ' miles')} before lunch and ${k(mix(C) + ' miles')} after lunch.`, ask: 'How much of the trail is still to go?', find: 'The distance still to hike.' }),
];
export function mixTwoWord() {
  const terms = minus2(), { res, l, ways } = chainWays(terms, ['−', '−']), c = pick(TWO)(nm(), ...terms);
  return T({ story: c.story, ask: c.ask, answer: frac(res, l), ways, op: 'multi', read: rd(c.find, terms.map(mix), 'Two amounts are taken away, so subtract twice.', terms.map(mix).join(' − ')), hint: 'Take away the first amount, then the second.' }, 'mxstory2', { terms });
}
function mxdist() {
  const [B, A] = pair(3, '−', chance(0.7)), n = nm(), { res, l, ways } = mixedWays(B, A, '−');
  return T({ story: `${n} walks from the ${k(mix(A))} mile mark of a trail to the ${k(mix(B))} mile mark.`, ask: `How far does ${n} walk?`, answer: frac(res, l), ways, op: 'sub',
    read: rd('The distance between the two marks.', [`start at ${mix(A)}`, `stop at ${mix(B)}`], '“how far” between two marks means subtract the smaller from the bigger', `${mix(B)} − ${mix(A)}`), hint: 'Subtract the smaller mark from the bigger one.' }, 'mxdist', { A, B });
}
export function genMixedOps(L) {
  if (L === 1) return pick([() => mxPlain(1, '+'), () => mxPlain(1, '−'), () => mxwhole(1), () => mxmiss(1), () => mixWord(1)])();
  if (L === 2) return pick([() => mxPlain(2, '+'), () => mxPlain(2, '−'), () => mxwhole(2), () => mxmiss(2), () => mixWord(2)])();
  return pick([mxadd3, mxsub2, mixTwoWord, mxdist, () => mxmiss(3), () => mxPlain(3, '−')])();
}
