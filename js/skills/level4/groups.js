// Skill l4groups: order of operations with nested groups, finding what goes where, and writing expressions (5.OA.1-2).
// This file reads and repairs expressions; groups-write.js holds the questions that write an expression from words.
import { rnd, pick, chance, shuffle, b, way, num, choice } from '../../util.js';
import { T, BLANK } from './helpers.js';
import { calc, clean } from './calc.js';
import { grWrite, grStory } from './groups-write.js';

const n = (lo = 2, hi = 9) => rnd(lo, hi);
// Expressions whose innermost group is easy to point at. inner is the group to do first.
const FIRSTS = [
  [1, () => { const [a, c, d, e] = [n(2, 9), n(6, 12), n(1, 5), n(2, 6)]; return { s: `${a} + ${e} × (${c} − ${d})`, inner: `${c} − ${d}`, bad: [`${a} + ${e}`, `${e} × ${c}`, `${e} × (${c} − ${d})`] }; }],
  [1, () => { const [a, c, d, e] = [n(2, 9), n(2, 9), n(2, 9), n(2, 6)]; return { s: `(${a} + ${c}) × ${e} − ${d}`, inner: `${a} + ${c}`, bad: [`${e} − ${d}`, `${c} × ${e}`, `${a} + ${c} × ${e}`] }; }],
  [2, () => { const [a, c, d, e] = [n(2, 6), n(8, 15), n(1, 7), n(2, 9)]; return { s: `${a} × [${e} + (${c} − ${d})]`, inner: `${c} − ${d}`, bad: [`${a} × ${e}`, `${e} + ${c}`, `${e} + (${c} − ${d})`] }; }],
  [2, () => { const [a, c, d, e] = [n(20, 40), n(2, 6), n(2, 6), n(2, 6)]; return { s: `[${a} − (${c} + ${d})] × ${e}`, inner: `${c} + ${d}`, bad: [`${a} − ${c}`, `${a} − (${c} + ${d})`, `${d} × ${e}`] }; }],
  [3, () => { const [a, c, d, e, f] = [n(2, 20), n(2, 6), n(2, 6), n(2, 6), n(2, 5)]; return { s: `{${a} + [${e} × (${c} + ${d})]} ÷ ${f}`, inner: `${c} + ${d}`, bad: [`${a} + ${e}`, `${e} × ${c}`, `${e} × (${c} + ${d})`] }; }],
];
function grFirst(L) {
  const { s, inner, bad } = pick(FIRSTS.filter(f => f[0] <= L))[1]();
  return T({ ask: 'Which part do you work out first?', expr: s, answer: choice(inner, bad),
    ways: [way('Work from the inside out', ['Groups go first, and the innermost group goes before the ones around it.', `In ${s}, the group with nothing inside it is ${b(inner)}.`]),
      way('The order to remember', ['First anything inside ( ), [ ] or { }, starting with the innermost. Then × and ÷, then + and −.', `Only ${b(inner)} sits inside all the other groups, so it comes first.`])],
    hint: 'Look for the group with nothing inside it. That is the one to do first.' }, 'grFirst', { s });
}
const OPS = ['+', '−', '×'];
function grFix(L) {
  for (let t = 0; t < 400; t++) {
    const [a, c, d] = [n(2, 9), n(2, 9), n(2, 6)], o1 = pick(L === 1 ? ['+', '×'] : OPS), o2 = pick(L === 1 ? ['+', '×'] : OPS), bare = `${a} ${o1} ${c} ${o2} ${d}`;
    const p1 = `(${a} ${o1} ${c}) ${o2} ${d}`, p2 = `${a} ${o1} (${c} ${o2} ${d})`, v0 = calc(bare), v1 = calc(p1), v2 = calc(p2), i = rnd(0, 1), target = i ? v2 : v1;
    if (v1 === v2 || !clean(v1) || !clean(v2) || target === v0 || target > 150) continue;
    const good = i ? p2 : p1, opts = [p1, p2, ...(v0 !== v1 && v0 !== v2 ? [bare] : [])], vs = opts.map(calc);
    return T({ ask: 'Put one pair of brackets in so the sum is true.', expr: `${bare} = ${target}`, answer: choice(good, opts.filter(o => o !== good)),
      ways: [way('Try each placement', [...opts.map((o, j) => `${o} = ${vs[j]}`), `Only ${b(good)} makes ${target}.`]),
        way('Compare with no brackets', [`With no brackets, ${bare} = ${v0}, not ${target}.`, `So the brackets must change the order of the steps, and ${b(good)} gives ${target}.`])],
      hint: 'Work out what you get with no brackets. Then try the brackets in each place.' }, 'grFix', { a, o1, c, o2, d, target });
  }
}
const MISSING = [
  [1, () => { const [a, x, c] = [n(2, 9), n(2, 9), n(1, 9)], r = a * (x + c); return { x, s: `${a} × (${BLANK} + ${c}) = ${r}`, steps: [`${r} ÷ ${a} = ${x + c}`, `${x + c} − ${c} = ${x}`] }; }],
  [1, () => { const [a, x, c] = [n(2, 9), n(2, 9), n(2, 9)], r = a + c * x; return { x, s: `${a} + ${c} × ${BLANK} = ${r}`, steps: [`${r} − ${a} = ${r - a}`, `${r - a} ÷ ${c} = ${x}`] }; }],
  [2, () => { const [c, r, bb] = [n(2, 9), n(2, 9), n(2, 9)], x = bb + c * r; return { x, s: `(${BLANK} − ${bb}) ÷ ${c} = ${r}`, steps: [`${r} × ${c} = ${r * c}`, `${r * c} + ${bb} = ${x}`] }; }],
  [3, () => { const [a, x, bb, c] = [n(2, 6), n(2, 9), n(2, 5), n(2, 9)], r = (x + a) * bb - c; return { x, s: `[(${BLANK} + ${a}) × ${bb}] − ${c} = ${r}`, steps: [`${r} + ${c} = ${r + c}`, `${r + c} ÷ ${bb} = ${x + a}`, `${x + a} − ${a} = ${x}`] }; }],
  [3, () => { const [a, x, bb, c] = [n(2, 6), n(2, 6), n(2, 6), n(2, 5)], r = a * (bb + x * c); return { x, s: `${a} × [${bb} + (${BLANK} × ${c})] = ${r}`, steps: [`${r} ÷ ${a} = ${bb + x * c}`, `${bb + x * c} − ${bb} = ${x * c}`, `${x * c} ÷ ${c} = ${x}`] }; }],
];
function grMissing(L) {
  const { x, s, steps } = pick(MISSING.filter(m => (L === 3 ? m[0] >= 2 : m[0] <= L)))[1]();
  const filled = s.replace(BLANK, String(x));
  return T({ ask: 'Which number goes in the box?', expr: s, answer: num(x),
    ways: [way('Undo the steps', ['Work backwards: undo the last thing that was done first.', ...steps.slice(0, -1), `${steps[steps.length - 1].replace(/= (\d+)$/, '= <b>$1</b>')}`]),
      way('Test your answer', [`Put ${x} in the box: ${filled}.`, `It makes the sentence true, so the box holds ${b(x)}.`])],
    hint: 'Undo the last step first. What was done to the number in the box?' }, 'grMissing', { s });
}
function grOp() {
  for (let t = 0; t < 300; t++) {
    const [a, c, d] = [n(2, 12), n(1, 6), n(1, 6)], m = c + d, vs = { '+': a + m, '−': a - m, '×': a * m, '÷': a / m }, ops = Object.keys(vs), good = pick(ops), target = vs[good];
    if (!clean(target) || ops.filter(o => vs[o] === target).length > 1 || target > 150) continue;
    return T({ ask: 'Which sign makes it true?', expr: `${a} ${BLANK} (${c} + ${d}) = ${target}`, answer: choice(good, [], { all: ops }), choiceBig: true,
      ways: [way('Work out the group first', [`${c} + ${d} = ${m}`, `Try each sign with ${a} and ${m}: ${ops.map(o => (clean(vs[o]) ? `${a} ${o} ${m} = ${vs[o]}` : `${a} ${o} ${m} does not come out even`)).join('; ')}.`, `Only ${b(good)} gives ${target}.`]),
        way('Think about the size', [`The group is worth ${m}. ${a} and ${m} must combine to make ${target}.`, `${target > a ? 'The answer is bigger than ' + a + ', so it is + or ×.' : 'The answer is smaller than ' + a + ', so it is − or ÷.'}`, `Testing the two possible signs leaves ${b(good)}.`])],
      hint: 'Work out what is inside the brackets first. Then try each sign.' }, 'grOp', { a, c, d, target });
  }
}
function grBig(L) {
  const [a, c, d] = [n(2, 9), n(2, 9), n(2, 9)], opts = [`${a} × ${c} + ${d}`, `${a} × (${c} + ${d})`, `(${a} + ${c}) × ${d}`, `${a} + ${c} × ${d}`], vs = opts.map(calc);
  if (new Set(vs).size < 4) return grBig(L);
  const most = chance(0.5), want = most ? Math.max(...vs) : Math.min(...vs), good = opts[vs.indexOf(want)];
  return T({ ask: `Which one has the ${most ? 'greatest' : 'least'} value?`, answer: choice(good, opts.filter(o => o !== good)),
    ways: [way('Work each one out', [...opts.map((o, j) => `${o} = ${vs[j]}`), `The ${most ? 'greatest' : 'least'} is ${b(good)}.`]),
      way('Think about the order', ['The brackets change which step happens first, so the same numbers give different values.', `After working each one out, ${b(good)} has the ${most ? 'greatest' : 'least'} value, ${want}.`])],
    hint: 'Work each expression out, brackets first, and compare.' }, 'grBig', { a, c, d, most });
}
const SAMES = [['(A + B) × C', 'A × C + B × C'], ['A × (B + C)', 'A × B + C'], ['A − (B + C)', 'A − B − C'], ['A − (B + C)', 'A − B + C'], ['A + B × C', '(A + B) × C'], ['A × B + A × C', 'A × (B + C)'], ['(A − B) × C', 'A × C − B × C']];
const NOTE_SAME = { true: 'Multiplying a sum by a number is the same as multiplying each part and adding. Taking away a sum is the same as taking away each part.', false: 'The brackets change which step happens first, so the two can come out different.' };
function grSame() {
  for (let t = 0; t < 300; t++) {
    const [p, q] = pick(SAMES), [A, B, C] = shuffle([n(2, 9), n(2, 9), n(2, 9)]).sort((x, y) => y - x), fill = s => s.replace(/A/g, A).replace(/B/g, B).replace(/C/g, C);
    const x = fill(p), y = fill(q), vx = calc(x), vy = calc(y);
    if (vx < 0 || vy < 0 || (A === B && B === C)) continue;
    const same = vx === vy, lab = same ? 'Same value' : 'Different values';
    return T({ ask: 'Do these two have the same value?', expr: `${x} &nbsp;and&nbsp; ${y}`, exprSmall: true, answer: choice(lab, [], { all: ['Same value', 'Different values'] }), choiceBig: true,
      ways: [way('Work out both', [`${x} = ${vx}`, `${y} = ${vy}`, `${vx} and ${vy} ${same ? 'match' : 'are not the same'}: ${b(lab)}.`]),
        way('Think about why', [NOTE_SAME[same] ?? '', `So the answer is ${b(lab)}.`])],
      hint: 'Work out each expression, brackets first, and compare the two answers.' }, 'grSame', { x, y });
  }
}
export function genGroups(L) {
  if (L === 1) return pick([() => grFirst(1), () => grFix(1), grSame, () => grMissing(1)])();
  if (L === 2) return pick([() => grFirst(2), () => grFix(2), () => grMissing(2), () => grWrite(2), () => grStory(2), grSame])();
  return pick([() => grBig(3), grOp, () => grMissing(3), () => grWrite(3), () => grStory(3), () => grFirst(3)])();
}
