// The parts of an expression: sum, difference, product, quotient, factor, term, coefficient and constant.
import { rnd, pick, chance, shuffle, fmt, b, k, way, nm, num, choice } from '../../util.js';
import { T, rndNot } from './helpers.js';

const letter = () => pick(['x', 'n', 't', 'm', 'p', 'a', 'w']);
const OPS = ['sum', 'difference', 'product', 'quotient'];
const SYMBOL = { sum: '+', difference: '−', product: '×', quotient: '÷' };

// Name the whole expression by the step that is done last.
const NAME1 = [(a, c, v) => ({ op: 'sum', e: `${v} + ${c}`, say: `${v} plus ${c}` }), (a, c, v) => ({ op: 'difference', e: `${v} − ${c}`, say: `${v} minus ${c}` }), (a, c, v) => ({ op: 'product', e: `${a}${v}`, say: `${a} times ${v}` }), (a, c, v) => ({ op: 'quotient', e: `${v} ÷ ${a}`, say: `${v} divided by ${a}` })];
const NAME2 = [(a, c, v) => ({ op: 'sum', e: `${a}${v} + ${c}`, say: `${a} times ${v}, plus ${c}` }), (a, c, v) => ({ op: 'difference', e: `${a}${v} − ${c}`, say: `${a} times ${v}, minus ${c}` }), (a, c, v) => ({ op: 'product', e: `${a}(${v} + ${c})`, say: `${a} times the sum ${v} plus ${c}` }),
  (a, c, v) => ({ op: 'quotient', e: `(${v} + ${c}) ÷ ${a}`, say: `the sum ${v} plus ${c}, divided by ${a}` }), (a, c, v) => ({ op: 'product', e: `${c}(${v} − ${a})`, say: `${c} times the difference ${v} minus ${a}` }), (a, c, v) => ({ op: 'sum', e: `${a}(${v} + ${c}) + ${a + c}`, say: `${a} times the sum ${v} plus ${c}, plus ${a + c}` })];
function naming(L) {
  const a = rnd(2, 9), c = rndNot(2, 9, [a]), v = letter(), t = pick(L === 1 ? NAME1 : NAME2)(a, c, v);
  return T({ ask: 'Is this whole expression a sum, a difference, a product or a quotient?', expr: t.e, answer: choice(t.op, [], { all: OPS }), choiceBig: true,
    ways: [way('Find the step done last', [`Follow the order of operations: brackets first, then × and ÷, then + and −. The step done last gives the expression its name.`, `Here the last step is ${SYMBOL[t.op]}, so the whole expression is a ${b(t.op)}.`]),
      way('Say it in words', [`Read it out loud: “${t.say}”.`, `The main action is ${t.op === 'sum' ? 'adding' : t.op === 'difference' ? 'subtracting' : t.op === 'product' ? 'multiplying' : 'dividing'}, so it is a ${b(t.op)}.`])],
    hint: 'Do the brackets first in your head. Which operation is left to do last?' }, 'epName', { e: t.e, op: t.op });
}
// Products: how many things are being multiplied. A group in brackets counts as one factor.
const FACT = [
  (a, b2, c, v) => ({ parts: [a, b2], dot: true }), (a, b2, c, v) => ({ parts: [a, `(${b2} + ${c})`], dot: false }), (a, b2, c, v) => ({ parts: [a, v], dot: false }),
  (a, b2, c, v) => ({ parts: [a, b2, c], dot: true }), (a, b2, c, v) => ({ parts: [a, v, `(${b2} + ${c})`], dot: false }), (a, b2, c, v) => ({ parts: [a, `(${b2} − ${c})`, v], dot: false }),
];
function factors(L) {
  const [a, b2, c] = [rnd(2, 9), rnd(3, 9), rnd(2, 8)], v = letter(), f = pick(L === 1 ? FACT.slice(0, 3) : FACT)(a, b2, c, v), n = f.parts.length, e = f.parts.join(f.dot ? ' × ' : '');
  return T({ ask: 'How many factors are multiplied in this product?', expr: e, answer: num(n),
    ways: [way('List the factors', [`A factor is one of the things being multiplied. A sum or difference in brackets counts as one factor.`, `The factors are ${f.parts.join(', ')}. That is ${b(n)}.`]),
      way('Say it with “times”', [`Read it as: ${f.parts.join(' times ')}.`, `Count the pieces between the “times”: ${b(n)}.`])],
    hint: 'Look for the pieces that are multiplied together. Anything in brackets is one piece.' }, 'epFactors', { n });
}
// Value of a product or quotient with a bracket: treat the bracket as one number first.
const FORMS = {
  'prod+': (a, x, y) => ({ e: `${a}(${x} + ${y})`, js: `${a}*(${x}+${y})`, ans: a * (x + y), bracket: `${x} + ${y} = ${x + y}`, then: `${a} × ${x + y}`, name: 'Share the multiplying', alt: `${a} × ${x} + ${a} × ${y} = ${a * x} + ${a * y}`, hint: 'Work out the sum in the brackets first. It becomes one number.' }),
  'prod−': (a, x, y) => ({ e: `${a}(${x + y} − ${y})`, js: `${a}*(${x + y}-${y})`, ans: a * x, bracket: `${x + y} − ${y} = ${x}`, then: `${a} × ${x}`, name: 'Share the multiplying', alt: `${a} × ${x + y} − ${a} × ${y} = ${a * (x + y)} − ${a * y}`, hint: 'Work out the difference in the brackets first. It becomes one number.' }),
  quo: (a, x) => { const p = rnd(1, x * a - 1), q = x * a - p; return { e: `(${p} + ${q}) ÷ ${a}`, js: `(${p}+${q})/${a}`, ans: x, bracket: `${p} + ${q} = ${x * a}`, then: `${x * a} ÷ ${a}`, name: 'Check by multiplying', alt: `${x} × ${a} = ${x * a}, which is the bracket`, hint: 'Add what is in the brackets first. Then divide.' }; },
  inv: (a, x, y) => ({ e: `${(x + y) * a} ÷ (${x} + ${y})`, js: `${(x + y) * a}/(${x}+${y})`, ans: a, bracket: `${x} + ${y} = ${x + y}`, then: `${(x + y) * a} ÷ ${x + y}`, name: 'Check by multiplying', alt: `${a} × ${x + y} = ${(x + y) * a}`, hint: 'The brackets are the number you divide by. Work them out first.' }),
};
function value(L) {
  const big = L === 3 ? 12 : 9, a = rnd(2, big), x = rnd(2, big), y = rnd(2, big), f = FORMS[pick(L === 1 ? ['prod+', 'prod−'] : Object.keys(FORMS))](a, x, y);
  return T({ ask: 'Treat the brackets as one number. What is the value?', expr: f.e, answer: num(f.ans),
    ways: [way('Brackets are one piece', [`Work out the bracket first: ${f.bracket}.`, `Now it is two things multiplied or divided: ${f.then} = ${b(f.ans)}`]), way(f.name, [f.name === 'Share the multiplying' ? 'Multiply by each part inside the brackets, then combine.' : 'The answer must work backwards to give the number you started with.', f.name === 'Share the multiplying' ? `${f.alt} = ${b(f.ans)}` : `${f.alt}. So the value is ${b(f.ans)}.`])],
    hint: f.hint }, 'epValue', { js: f.js });
}
// Parts of a sum with one letter: coefficient, constant, variable, or the term with the letter.
const PART = { coefficient: s => s.a, constant: s => s.c, variable: s => s.v, 'term with the letter': s => `${s.a}${s.v}` };
function part() {
  const a = rnd(2, 9), c = rndNot(2, 9, [a]), v = letter(), want = pick(Object.keys(PART)), first = chance(0.5), e = first ? `${a}${v} + ${c}` : `${c} + ${a}${v}`, good = String(PART[want]({ a, c, v }));
  const note = { coefficient: 'the number that multiplies the letter', constant: 'the number with no letter', variable: 'the letter that stands for a number', 'term with the letter': 'the whole piece that has the letter in it' }[want];
  return T({ ask: `In this expression, which part is the ${b(want)}?`, expr: e, answer: choice(good, [String(a), String(c), v, `${a}${v}`].filter(x => x !== good)), choiceBig: true,
    ways: [way('Take it apart', [`The terms are ${a}${v} and ${c}, joined by +.`, `The ${want} is ${note}: ${b(good)}.`]),
      way('Check each choice', [`${a}${v} means ${a} × ${v}. So ${a} multiplies the letter, ${v} is the letter, and ${c} stands alone.`, `The ${want} is ${b(good)}.`])],
    hint: 'First split the expression into its terms at the + sign. Then look at what each one is made of.' }, 'epPart', { a, c, v, want });
}
// Terms are the pieces joined by + and −; a group in brackets is one piece.
function terms(L) {
  const v = letter(), w = v === 'y' ? 'x' : 'y', pieces = [() => `${rnd(2, 9)}${v}`, () => `${rnd(2, 9)}`, () => `${rnd(2, 9)}(${w} + ${rnd(1, 9)})`, () => `${rnd(2, 9)}(${v} − ${rnd(1, 5)})`, () => `${rnd(2, 9)}${w}`];
  const n = L === 2 ? rnd(2, 3) : rnd(3, 4), list = [pick(pieces.slice(2))(), ...Array.from({ length: n - 1 }, () => pick(L === 2 ? pieces.filter((_, i) => i !== 2 && i !== 3) : pieces)())], mixed = shuffle(list), e = mixed.map((s, i) => (i ? `${pick([' + ', ' − '])}${s}` : s)).join('');
  return T({ ask: 'How many terms does this expression have?', expr: e, answer: num(n),
    ways: [way('Split at + and −', [`Terms are separated by + or − signs that are not inside brackets.`, `The terms are ${mixed.join(', ')}. That is ${b(n)} terms.`]),
      way('Brackets are one piece', [`A group in brackets, like ${list[0]}, is one entity. Cover it up and count it as one.`, `Counting every piece: ${b(n)} terms.`])],
    hint: 'Do not count what is inside brackets separately. Brackets hold one piece.' }, 'epTerms', { n });
}
const READ = [
  (a, c, v) => ({ f: 'prodSum', e: `${a}(${v} + ${c})`, good: `the product of ${a} and the sum of ${v} and ${c}`, bad: [`the sum of the product of ${a} and ${v}, and ${c}`, `the sum of ${a} and the product of ${v} and ${c}`, `the product of ${a}, ${v} and ${c}`] }),
  (a, c, v) => ({ f: 'sumProd', e: `${a}${v} + ${c}`, good: `the sum of the product of ${a} and ${v}, and ${c}`, bad: [`the product of ${a} and the sum of ${v} and ${c}`, `the sum of ${a}, ${v} and ${c}`, `the product of ${a}, ${v} and ${c}`] }),
  (a, c, v) => ({ f: 'quotSum', e: `(${v} + ${c}) ÷ ${a}`, good: `the quotient of the sum of ${v} and ${c}, and ${a}`, bad: [`the sum of ${v} and the quotient of ${c} and ${a}`, `the quotient of ${a} and the sum of ${v} and ${c}`, `the product of the sum of ${v} and ${c}, and ${a}`] }),
  (a, c, v) => ({ f: 'diffProd', e: `${a}${v} − ${c}`, good: `the difference of the product of ${a} and ${v}, and ${c}`, bad: [`the product of ${a} and the difference of ${v} and ${c}`, `the difference of ${a} and the product of ${v} and ${c}`, `the quotient of the product of ${a} and ${v}, and ${c}`] }),
];
function reading(L) {
  const a = rnd(2, 9), c = rndNot(2, 9, [a]), v = letter(), r = pick(L === 2 ? READ.slice(0, 2) : READ)(a, c, v);
  return T({ ask: 'Which words describe this expression?', expr: r.e, answer: choice(r.good, r.bad), choiceBig: true,
    ways: [way('Last step first', [`Find the step done last: it gives the expression its main name.`, `Then describe what goes into it. That gives ${b(r.good)}.`]),
      way('Build it up', [`Start from the inside: brackets and multiplying come first.`, `Put those pieces together with the last operation: ${b(r.good)}.`])],
    hint: 'Say the last step first, like “the sum of”. Then say what is being added, multiplied or divided.' }, 'epRead', { a, c, v, f: r.f });
}
// A story with an expression in it: which part of the expression is which thing.
const WHICH = [
  { v: 't', e: (d, c, v) => `${d}${v} + ${c}`, s: (d, c, n) => `Tickets cost t dollars each. ${n} buys ${k(d + ' tickets')} and pays a ${k('$' + c)} booking fee. The total cost is ${k(d + 't + ' + c)} dollars.`, mean: { coef: 'the number of tickets', var: 'the price of one ticket', const: 'the booking fee', whole: 'the total cost' } },
  { v: 'g', e: (d, c, v) => `${d}${v} + ${c}`, s: (d, c) => `A phone plan costs ${k('$' + c)} a month plus ${k('$' + d)} for each GB. With g GB used, the bill is ${k(d + 'g + ' + c)} dollars.`, mean: { coef: 'the dollars for each GB', var: 'the number of GB used', const: 'the monthly fee', whole: 'the bill' } },
  { v: 'w', e: (d, c, v) => `${c} + ${d}${v}`, s: (d, c, n) => `${n} has ${k('$' + c)} saved and adds ${k('$' + d)} each week. After w weeks the savings are ${k(c + ' + ' + d + 'w')} dollars.`, mean: { coef: 'the dollars added each week', var: 'the number of weeks', const: 'the dollars saved at the start', whole: 'the total savings' } },
  { v: 'k', e: (d, c, v) => `${d}${v} + ${c}`, s: (d, c) => `A taxi charges ${k('$' + c)} to start and ${k('$' + d)} for each km. For k km the fare is ${k(d + 'k + ' + c)} dollars.`, mean: { coef: 'the dollars for each km', var: 'the number of km', const: 'the starting charge', whole: 'the fare' } },
];
function whichPart() {
  const ctx = pick(WHICH), d = rnd(2, 9), c = rndNot(2, 12, [d]), part = pick(['coef', 'var', 'const', 'whole']), e = ctx.e(d, c, ctx.v), good = { coef: String(d), var: ctx.v, const: String(c), whole: e }[part];
  return T({ story: ctx.s(d, c, nm()), ask: `In the expression ${b(e)}, which part stands for ${b(ctx.mean[part])}?`, answer: choice(good, [String(d), String(c), ctx.v, e].filter(x => x !== good)), choiceBig: true,
    ways: [way('Match the story to the parts', [`Read the story one piece at a time. The part for “${ctx.mean[part]}” is ${part === 'var' ? 'the letter' : part === 'coef' ? 'the number stuck to the letter' : part === 'const' ? 'the number with no letter, added on its own' : 'everything together'}.`, `So the answer is ${b(good)}.`]),
      way('Try a different amount', [`Change the amount of the letter: the part that does not change is the constant, and the part that multiplies it is the coefficient.`, `For “${ctx.mean[part]}”, the part is ${b(good)}.`])],
    hint: 'Which part changes when the letter changes, and which part stays the same? Match them with the story.' }, 'epWhich', { part, d, c, v: ctx.v, e });
}
const SHAPES = { 1: [() => naming(1), () => factors(1), () => value(1), part], 2: [() => naming(2), () => value(2), () => terms(2), () => reading(2), whichPart, part], 3: [() => reading(3), () => terms(3), whichPart, () => value(3), () => factors(3), () => naming(2)] };
export const genExprParts = L => pick(SHAPES[L])();
