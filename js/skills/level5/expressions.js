// Writing and evaluating algebraic expressions.
import { R, rnd, pick, chance, fmt, pow, b, k, way, nm, num, choice, table } from '../../util.js';
import { T, rndNot } from './helpers.js';

const letter = () => pick(['x', 'n', 't', 'm', 'p']);
const sq2 = v => pow(v, 2);
// Evaluate templates: e(v) is the expression text, f the rule, js the same rule for tests (X is the variable).
const EVAL1 = [
  (a, c) => ({ e: v => `${a}${v} + ${c}`, f: x => a * x + c, js: `${a}*X+${c}`, say: (v, x) => [`${a}${v} means ${a} × ${v}.`, `${a} × ${x} + ${c} = ${a * x} + ${c}`] }),
  (a, c) => ({ e: v => `${a}${v} − ${c}`, f: x => a * x - c, js: `${a}*X-${c}`, say: (v, x) => [`${a}${v} means ${a} × ${v}.`, `${a} × ${x} − ${c} = ${a * x} − ${c}`], min: Math.ceil((c + 1) / a) }),
  (a, c) => ({ e: v => `${c + 20} − ${a}${v}`, f: x => c + 20 - a * x, js: `${c + 20}-${a}*X`, say: (v, x) => [`${a}${v} means ${a} × ${v}. Multiply before you subtract.`, `${c + 20} − ${a} × ${x} = ${c + 20} − ${a * x}`], max: Math.floor(20 / a) }),
  (a, c) => ({ e: v => `${v} ÷ ${a} + ${c}`, f: x => x / a + c, js: `X/${a}+${c}`, say: (v, x) => [`Divide before you add.`, `${x} ÷ ${a} + ${c} = ${x / a} + ${c}`], mult: a }),
];
const EVAL2 = [
  (a, c) => ({ e: v => `${a}(${v} + ${c})`, f: x => a * (x + c), js: `${a}*(X+${c})`, say: (v, x) => [`A number right next to brackets multiplies everything inside them.`, `${a} × (${x} + ${c}) = ${a} × ${x + c}`] }),
  (a, c) => ({ e: v => `${a}${sq2(v)} + ${c}`, f: x => a * x * x + c, js: `${a}*X**2+${c}`, say: (v, x) => [`The exponent belongs to ${v} only: square first, then multiply by ${a}.`, `${a} × ${sq2(x)} + ${c} = ${a} × ${x * x} + ${c} = ${a * x * x} + ${c}`] }),
  (a, c) => ({ e: v => `(${v} + ${c}) ÷ ${a}`, f: x => (x + c) / a, js: `(X+${c})/${a}`, say: (v, x) => [`Brackets first, then divide.`, `(${x} + ${c}) ÷ ${a} = ${x + c} ÷ ${a}`], pick: () => a * rnd(2, 9) - c, minC: true }),
  (a, c) => ({ e: v => `${sq2(v)} − ${a}${v} + ${c}`, f: x => x * x - a * x + c, js: `X**2-${a}*X+${c}`, say: (v, x) => [`Square first, then multiply, then work left to right.`, `${sq2(x)} − ${a} × ${x} + ${c} = ${x * x} − ${a * x} + ${c}`], min: a }),
];
function evaluate(L) {
  const a = rnd(2, L === 1 ? 6 : 5), c = rnd(1, 9), t = pick(L === 1 ? EVAL1 : EVAL2)(a, c), v = letter();
  let x = t.pick ? t.pick() : rnd(t.min ?? 2, t.max ?? (L === 1 ? 9 : 7)) * (t.mult ?? 1);
  if (x < 1 || (t.max && t.max < 2)) return evaluate(L);
  if (L === 3) x = R(x + pick([0.5, 1.5]) * (t.mult || t.pick ? 0 : 1));
  const val = R(t.f(x)), step = t.mult ?? (t.pick ? a : 1), xs = [x - step, x, x + step].filter(q => q >= 0 && t.f(q) >= 0), [why, work] = t.say(v, x);
  return T({ ask: `Find the value when ${b(`${v} = ${fmt(x)}`)}.`, expr: t.e(v), answer: num(val),
    ways: [way('Swap the letter for the number', [`The letter stands for a number. Here ${v} = ${fmt(x)}, so write ${fmt(x)} wherever you see ${v}.`, why, `${work} = ${b(fmt(val))}`]),
      way('Table of values', [`The expression is a rule: put a number in, get a number out.`, table([v, t.e(v)], xs.map(q => (q === x ? [b(fmt(q)), b(fmt(R(t.f(q))))] : [fmt(q), fmt(R(t.f(q)))]))), `For ${v} = ${fmt(x)} the rule gives ${b(fmt(val))}.`])],
    hint: `Replace ${v} with ${fmt(x)}. Remember a number next to a letter means multiply.` }, 'eval', { js: t.js, x });
}
// Phrases: (c, d, v) => [words, correct, wrong options built from real mix-ups].
const PHRASE1 = [
  (c, d, v) => [`${c} more than ${v}`, `${v} + ${c}`, [`${c}${v}`, `${v} − ${c}`, `${c} − ${v}`]], (c, d, v) => [`${c} less than ${v}`, `${v} − ${c}`, [`${c} − ${v}`, `${v} + ${c}`, `${v} ÷ ${c}`]],
  (c, d, v) => [`${v} taken away from ${c}`, `${c} − ${v}`, [`${v} − ${c}`, `${c} + ${v}`, `${c}${v}`]], (c, d, v) => [`the product of ${c} and ${v}`, `${c}${v}`, [`${v} + ${c}`, `${v} ÷ ${c}`, `${pow(v, c)}`]],
  (c, d, v) => [`${v} divided by ${c}`, `${v} ÷ ${c}`, [`${c} ÷ ${v}`, `${c}${v}`, `${v} − ${c}`]], (c, d, v) => [`${c} divided by ${v}`, `${c} ÷ ${v}`, [`${v} ÷ ${c}`, `${c}${v}`, `${c} − ${v}`]],
  (c, d, v) => [`${v} multiplied by itself`, sq2(v), [`2${v}`, `${v} + 2`, `${v} + ${v}`]],
];
const PHRASE2 = [
  (c, d, v) => [`${c} more than ${d} times ${v}`, `${d}${v} + ${c}`, [`${d}(${v} + ${c})`, `${c}${v} + ${d}`, `${d}${v} − ${c}`]], (c, d, v) => [`${d} times the sum of ${v} and ${c}`, `${d}(${v} + ${c})`, [`${d}${v} + ${c}`, `${d} + ${v} + ${c}`, `${v} + ${d * c}`]],
  (c, d, v) => [`${c} less than ${d} times ${v}`, `${d}${v} − ${c}`, [`${c} − ${d}${v}`, `${d}(${v} − ${c})`, `${d}${v} + ${c}`]], (c, d, v) => [`the square of ${v}, plus ${c}`, `${sq2(v)} + ${c}`, [`2${v} + ${c}`, `(${v} + ${c})${pow('', 2)}`, `${c}${sq2(v)}`]],
  (c, d, v) => [`${c} taken away from half of ${v}`, `${v} ÷ 2 − ${c}`, [`2${v} − ${c}`, `${c} − ${v} ÷ 2`, `(${v} − ${c}) ÷ 2`]], (c, d, v) => [`the sum of ${v} and ${c}, divided by ${d}`, `(${v} + ${c}) ÷ ${d}`, [`${v} + ${c} ÷ ${d}`, `${d} ÷ (${v} + ${c})`, `${d}(${v} + ${c})`]],
];
function wordsToExpression(L) {
  const c = rnd(3, 12), d = rndNot(2, 9, [c]), v = letter(), [words, good, bad] = pick(L === 1 ? PHRASE1 : PHRASE2)(c, d, v);
  return T({ ask: `Which expression means “${b(words)}”?`, answer: choice(good, bad),
    ways: [way('Build it piece by piece', [`Start from the letter: ${v} is the unknown number.`, `Read what happens to it, in the order it happens: “${words}”.`, /less than|taken away/.test(words) ? 'Careful with “less than” and “taken away from”: the number you take away comes second.' : 'The order matters for subtracting and dividing, so check which number comes first.', `That gives ${b(good)}.`]),
      way('Test it with a number', [`Pretend ${v} = 10 and work out what the words say.`, `Then try 10 in each choice. Only ${b(good)} gives the same result as the words.`])],
    hint: `Try a real number for ${v}, like 10. What do the words tell you to do with it?` }, 'wordExpr', { v, good });
}
function parts() {
  const a = rnd(2, 9), c = rndNot(2, 9, [a]), d = rnd(1, 12), e = rndNot(2, 9, [a, c]), [v, w, z] = pick([['x', 'y', 'z'], ['a', 'b', 'c'], ['m', 'n', 'p']]), extra = chance(0.4), fixed = chance(0.75);
  const terms = [`${a}${v}`, `${c}${w}`, ...(extra ? [`${e}${z}`] : []), ...(fixed ? [String(d)] : [])], want = pick(['coef', 'coef2', 'terms', fixed ? 'const' : 'terms']);
  const q = { coef: `What is the coefficient of ${v}?`, coef2: `What is the coefficient of ${w}?`, const: 'What is the constant term?', terms: 'How many terms does this expression have?' }[want], ans = { coef: a, coef2: c, const: d, terms: terms.length }[want];
  return T({ ask: q, expr: terms.join(' + '), answer: num(ans),
    ways: [way('Name the parts', [`Terms are the pieces joined by + or −: ${terms.join(', ')}. That is ${terms.length} terms.`, `A coefficient is the number multiplying a letter: ${a} for ${v}, ${c} for ${w}.`, fixed ? `A constant is a term with no letter: ${d}. It never changes.` : 'A constant is a term with no letter. This expression has none.', `Answer: ${b(ans)}`]),
      way('Read it as a story', [`Say ${v} is the price of a ticket and ${w} the price of a snack.`, `${a}${v} + ${c}${w} means ${a} tickets and ${c} snacks. The coefficients count how many of each.`, fixed ? `The ${d} is a fixed fee: it is there whatever the prices are.` : 'Every term here changes when the prices change.', `So ${want === 'terms' ? `there are ${b(ans)} terms` : want === 'const' ? `the constant is ${b(ans)}` : `the coefficient is ${b(ans)}`}.`])],
    hint: 'Terms are separated by + signs. A coefficient is the number stuck to a letter.' }, 'parts', { expr: terms.join(' + '), v, w, want });
}
const PLANS = [
  { s: (c, d) => `A phone plan costs ${k('$' + c)} a month plus ${k('$' + d)} for every GB of data.`, v: 'g', of: 'GB', what: 'the cost in dollars', plus: true, cLo: 10, cHi: 40 }, { s: (c, d) => `A taxi ride costs ${k('$' + c)} to start plus ${k('$' + d)} for every km.`, v: 'k', of: 'km', what: 'the fare in dollars', plus: true, cLo: 3, cHi: 8, dLo: 1, dHi: 3 },
  { s: (c, d) => `A climbing gym charges a joining fee of ${k('$' + c)} and then ${k('$' + d)} each month.`, v: 'm', of: 'months', what: 'the total paid in dollars', plus: true, cLo: 20, cHi: 60, dLo: 10, dHi: 40 }, { s: (c, d, n) => `${n} has ${k('$' + c)} saved and adds ${k('$' + d)} every week.`, v: 'w', of: 'weeks', what: 'the dollars saved', q: 'How many dollars are saved', plus: true, cLo: 5, cHi: 40 },
  { s: (c, d) => `A game card starts with ${k(c + ' credits')}. Every round uses ${k(d + ' credits')}.`, v: 'r', of: 'rounds', what: 'the credits left', q: 'How many credits are left', plus: false }, { s: (c, d) => `A water tank holds ${k(c + ' liters')} and loses ${k(d + ' liters')} every hour.`, v: 'h', of: 'hours', what: 'the liters left', q: 'How many liters are left', plus: false },
];
export function exprWord(L, asChoice = false) {
  const p = pick(PLANS), d = rnd(p.dLo ?? 2, p.dHi ?? 9), x = rnd(2, 9), c = p.plus ? rndNot(p.cLo, p.cHi, [d]) : d * rnd(10, 15) + rnd(0, 5), val = p.plus ? d * x + c : c - d * x;
  const good = p.plus ? `${d}${p.v} + ${c}` : `${c} − ${d}${p.v}`, story = p.s(c, d, nm());
  const build = way('Fixed part and changing part', [`The part that changes is ${d} for each of the ${p.v} ${p.of}: ${b(d + p.v)}.`, `The fixed part is ${b(c)}. ${p.plus ? 'It is added on' : 'The changing part is taken away from it'}: ${b(good)}`, ...(asChoice ? [] : [`With ${p.v} = ${x}: ${p.plus ? `${d} × ${x} + ${c} = ${d * x} + ${c}` : `${c} − ${d} × ${x} = ${c} − ${d * x}`} = ${b(val)}`])]);
  const rows = [1, 2, 3].map(q => [q, p.plus ? d * q + c : c - d * q]);
  if (asChoice) return T({ story, ask: `Which expression gives ${p.what} after ${b(p.v)} ${p.of}?`, answer: choice(good, p.plus ? [`${c}${p.v} + ${d}`, `${c + d}${p.v}`, `${p.v} + ${c + d}`] : [`${d}${p.v} − ${c}`, `${c - d}${p.v}`, `${c}${p.v} − ${d}`]),
    ways: [build, way('Check with small numbers', [table([p.of, p.what], rows), `Try ${p.v} = 1, 2, 3 in ${good}: it gives ${rows.map(r => r[1]).join(', ')}, the same as the table.`])], hint: `What happens every time ${p.v} goes up by 1? What stays the same no matter what?` }, 'storyExpr', { c, d, plus: p.plus, v: p.v });
  return T({ story, ask: `${p.q ?? `What is ${p.what}`} after ${k(x + ' ' + p.of)}?`, answer: num(val), op: 'multi', ways: [build, way('Step by step in a table', [table([p.of, p.what], [...rows, ['…', '…'], [b(x), b(val)]]), `Each row ${p.plus ? 'adds' : 'takes away'} ${d}. After ${x} ${p.of}: ${b(val)}`])],
    read: { find: `${p.what[0].toUpperCase() + p.what.slice(1)} after ${x} ${p.of}.`, know: [`fixed: ${c}`, `${d} for each of the ${p.of}`, `${x} ${p.of}`], clue: '“Every” and “each” mean multiply. The fixed amount is only counted once.', plan: p.plus ? `${d} × ${x} + ${c}` : `${c} − ${d} × ${x}` }, hint: `How much do the ${x} ${p.of} change it altogether?` }, 'storyEval', { c, d, x, plus: p.plus });
}
export function genExpr(L) {
  if (L === 1) return chance(0.55) ? evaluate(1) : wordsToExpression(1);
  if (L === 2) return pick([() => evaluate(2), () => wordsToExpression(2), parts])();
  return pick([() => evaluate(3), () => exprWord(3, true), () => exprWord(3), () => wordsToExpression(2)])();
}
