// Is this number a solution: put a number in for the letter and see whether the equation or inequality is true.
import { rnd, pick, chance, shuffle, fmt, b, k, way, nm, num, choice } from '../../util.js';
import { T, numChoice, sg } from './helpers.js';

const YN = ['Yes', 'No'];
// One-step and two-step forms. Each is built from its solution x (or a given one): lhs is the left side, text(n) the left side with a
// number put in, f(n) its value, c the right side, bad the usual wrong answers and undo the way back.
const FORMS = {
  add: (v, L, x = rnd(3, 12)) => { const a = rnd(2, L === 1 ? 12 : 20), c = x + a; return { lhs: `${v} + ${a}`, text: n => `${n} + ${a}`, f: n => n + a, c, x, bad: [c + a, c, a], undo: `${c} − ${a} = ${x}` }; },
  sub: (v, L, x = rnd(8, 25)) => { const a = rnd(2, Math.min(x - 2, L === 1 ? 12 : 15)), c = x - a; return { lhs: `${v} − ${a}`, text: n => `${n} − ${a}`, f: n => n - a, c, x, bad: [c - a, c, a], undo: `${c} + ${a} = ${x}` }; },
  mul: (v, L, x = rnd(2, 12)) => { const a = rnd(2, 9), c = a * x; return { lhs: `${a}${v}`, text: n => `${a} × ${n}`, f: n => a * n, c, x, bad: [c * a, c - a, a], undo: `${c} ÷ ${a} = ${x}` }; },
  div: (v, L) => { const a = rnd(2, 9), c = rnd(2, 12), x = a * c; return { lhs: `${v} ÷ ${a}`, text: n => `${n} ÷ ${a}`, f: n => n / a, c, x, bad: [c / a, c + a, a], undo: `${c} × ${a} = ${x}` }; },
  two: (v, L, x = rnd(2, 12)) => { const a = rnd(2, 9), e = rnd(2, 15), c = a * x + e; return { lhs: `${a}${v} + ${e}`, text: n => `${a} × ${n} + ${e}`, f: n => a * n + e, c, x, bad: [(c + e) / a, c - e, c / a - e], undo: `${c} − ${e} = ${c - e}, then ${c - e} ÷ ${a} = ${x}` }; },
  twoS: (v, L, x = rnd(3, 12)) => { const a = rnd(2, 9), e = rnd(2, Math.min(12, a * x - 2)), c = a * x - e; return { lhs: `${a}${v} − ${e}`, text: n => `${a} × ${n} − ${e}`, f: n => a * n - e, c, x, bad: [(c - e) / a, c + e, c / a + e], undo: `${c} + ${e} = ${c + e}, then ${c + e} ÷ ${a} = ${x}` }; },
};
const KEYS = { 1: ['add', 'sub', 'mul'], 2: ['add', 'sub', 'mul', 'div'], 3: ['two', 'twoS', 'mul', 'div'] };
const letter = () => pick(['x', 'n', 't', 'm', 'p', 'a']);
function make(L) {
  const v = letter(), f = FORMS[pick(KEYS[L])](v, L), bad = [...new Set(f.bad)].filter(n => Number.isInteger(n) && n > 0 && n !== f.x && f.f(n) !== f.c);
  return bad.length < 2 ? make(L) : { ...f, v, bad };
}
const trySteps = (f, n) => `Try ${v0(f)} = ${fmt(n)}: ${f.text(n)} = ${fmt(f.f(n))}${f.f(n) === f.c ? `. That is ${f.c}, so it works.` : `. That is not ${f.c}, so it does not work.`}`;
const v0 = f => f.lhs.match(/[a-z]/)[0];
const eqText = f => `${f.lhs} = ${fmt(f.c)}`;

function pickNumber(L) {
  const f = make(L);
  return T({ ask: `Which number makes ${b(eqText(f))} true?`, answer: numChoice(f.x, f.bad), choiceBig: true,
    ways: [way('Put the numbers in', [trySteps(f, f.x), trySteps(f, f.bad[0]), `Only ${b(fmt(f.x))} makes both sides equal.`]), way('Undo the steps', [`Work backwards from ${f.c}: ${f.undo}.`, `The solution is ${b(fmt(f.x))}. The other choices come from using the wrong operation.`])],
    hint: 'Put each number in place of the letter. Does the left side come out equal to the right side?' }, 'solEq', { lhs: f.lhs, rhs: f.c });
}
function yesNo(L) {
  const f = make(L), yes = chance(0.5), val = yes ? f.x : pick(f.bad);
  return T({ ask: `Is ${b(`${v0(f)} = ${fmt(val)}`)} a solution of ${b(eqText(f))}?`, answer: choice(yes ? 'Yes' : 'No', [], { all: YN }), choiceBig: true,
    ways: [way('Put it in', [trySteps(f, val), `Both sides ${yes ? 'are equal' : 'are not equal'}, so the answer is ${b(yes ? 'Yes' : 'No')}.`]),
      way('Solve it and compare', [`Solve the equation: ${f.undo}.`, `The solution is ${fmt(f.x)}. ${fmt(val)} ${yes ? 'is' : 'is not'} that number, so the answer is ${b(yes ? 'Yes' : 'No')}.`])],
    hint: 'Replace the letter with the number. Work out the left side. Is it the same as the right side?' }, 'solYes', { lhs: f.lhs, rhs: f.c, val });
}
// Inequalities: the solutions are everything on one side of the boundary x0.
const SYMS = ['>', '≥', '<', '≤'];
function inequality(L, asSet = false) {
  const sym = pick(SYMS), right = sym === '>' || sym === '≥', strict = sym === '>' || sym === '<', dir = right ? 1 : -1, x0 = rnd(5, 14), form = L === 3 ? pick(['mul', 'add']) : 'plain', a = rnd(2, 5), e = rnd(2, 9), v = letter();
  const lhs = form === 'mul' ? `${a}${v}` : form === 'add' ? `${v} + ${e}` : v, c = form === 'mul' ? a * x0 : form === 'add' ? x0 + e : x0, val = n => (form === 'mul' ? a * n : form === 'add' ? n + e : n);
  const holdsAt = n => (right ? (strict ? val(n) > c : val(n) >= c) : (strict ? val(n) < c : val(n) <= c));
  const shown = `${lhs} ${sg(sym)} ${fmt(c)}`;
  if (asSet) {
    const xs = shuffle([x0 - 4, x0 - 2, x0 - 1, x0, x0 + 1, x0 + 2, x0 + 4].filter(n => n > 0)).slice(0, 6), n = xs.filter(holdsAt).length;
    if (n === 0 || n === xs.length) return inequality(L, true);
    return T({ ask: `How many of the numbers ${b(xs.join(', '))} make ${b(shown)} true?`, answer: num(n),
      ways: [way('Test each one', [xs.map(q => `${fmt(q)}: ${holdsAt(q) ? 'works' : 'does not work'}`).join('; ') + '.', `${n} of the ${xs.length} numbers work: ${b(n)}.`]),
        way('Find the boundary first', [`The boundary is ${v} = ${fmt(x0)}, where ${lhs} equals ${fmt(c)}.`, `${right ? 'Bigger' : 'Smaller'} numbers work${strict ? '' : ', and the boundary itself works too'}. Count them in the list: ${b(n)}.`])],
      hint: 'Test the numbers one at a time. Put each in for the letter and ask: is the statement true?' }, 'solSet', { lhs, sym, rhs: c, xs });
  }
  const pass = x0 + dir * rnd(strict ? 1 : 0, 3), fails = [x0 - dir * 1, x0 - dir * rnd(2, 3), x0 - dir * rnd(4, 5), ...(strict ? [x0] : [])].filter(n => n > 0 && n !== pass);
  return T({ ask: `Which number is a solution of ${b(shown)}?`, answer: numChoice(pass, shuffle([...new Set(fails)]).slice(0, 3)), choiceBig: true,
    ways: [way('Test the numbers', [`A solution makes the statement true. Put ${fmt(pass)} in: ${fmt(val(pass))} ${sg(sym)} ${fmt(c)} is ${holdsAt(pass) ? 'true' : 'false'}.`, `The other choices make the statement false, so the solution is ${b(fmt(pass))}.`]),
      way('Find the boundary', [`The boundary is ${fmt(x0)}: that is where ${lhs} is exactly ${fmt(c)}.`, `${right ? 'Bigger' : 'Smaller'} numbers work${strict ? `, but ${fmt(x0)} itself does not` : `, and ${fmt(x0)} itself works too`}. So the solution is ${b(fmt(pass))}.`])],
    hint: 'Put each number in for the letter. Is the statement true? Remember what the sign means.' }, 'solIneq', { lhs, sym, rhs: c });
}
function yesNoIneq() {
  const sym = pick(SYMS), x0 = rnd(5, 14), e = rnd(2, 9), v = letter(), c = x0 + e, val = pick([x0 - 2, x0 - 1, x0, x0 + 1, x0 + 2]), lhs = `${v} + ${e}`, n = val + e;
  const ok = { '>': n > c, '≥': n >= c, '<': n < c, '≤': n <= c }[sym];
  return T({ ask: `Is ${b(`${v} = ${fmt(val)}`)} a solution of ${b(`${lhs} ${sg(sym)} ${fmt(c)}`)}?`, answer: choice(ok ? 'Yes' : 'No', [], { all: YN }), choiceBig: true,
    ways: [way('Put it in', [`${fmt(val)} + ${e} = ${fmt(n)}.`, `Is ${fmt(n)} ${sg(sym)} ${fmt(c)}? ${ok ? 'Yes' : 'No'}. So the answer is ${b(ok ? 'Yes' : 'No')}.`]),
      way('Find the boundary', [`${lhs} equals ${fmt(c)} when ${v} = ${fmt(x0)}.`, `${fmt(val)} is ${val > x0 ? 'above' : val < x0 ? 'below' : 'exactly at'} the boundary, and the sign is ${sg(sym)}, so the answer is ${b(ok ? 'Yes' : 'No')}.`])],
    hint: 'Put the number in and work out the left side. Then check it against the sign. Pay attention to “or equal to”.' }, 'solYesIneq', { lhs, sym, rhs: c, val });
}
// Equations that all share one letter: only one of the four is true for the given value.
function whichEquation(L) {
  const v = rnd(5, 12), keys = L === 3 ? ['two', 'twoS', 'mul', 'add'] : ['add', 'sub', 'mul'], eqs = [];
  const mk = () => { const f = FORMS[pick(keys)]('x', L, v); return { f, c: f.c }; };
  while (eqs.length < 4) { const e = mk(), c = eqs.length ? e.c + pick([-3, -2, -1, 1, 2, 3]) : e.c; if (c > 0 && !eqs.some(q => q.text === `${e.f.lhs} = ${c}`)) eqs.push({ f: e.f, text: `${e.f.lhs} = ${c}` }); }
  const good = eqs[0];
  return T({ ask: `Which equation has ${b(`x = ${v}`)} as its solution?`, answer: choice(good.text, eqs.slice(1).map(q => q.text)), choiceBig: true,
    ways: [way('Put the number in', [`Try x = ${v} in ${good.text}: ${good.f.text(v)} = ${good.f.f(v)}. Both sides are equal.`, `The other equations give a different left side, so the answer is ${b(good.text)}.`]),
      way('Work out each left side', [`Put x = ${v} in the left side of each equation and compare with its right side.`, `Only ${b(good.text)} comes out equal on both sides.`])],
    hint: 'Put the number in for x on the left side of each equation. Which one gives the number on the right?' }, 'solBreak', { v });
}
const STORIES = [
  { v: 'k', one: false, s: (a, e, c) => `A taxi ride costs ${k('$' + e)} to start plus ${k('$' + a)} for every km. The fare was ${k('$' + c)}.`, ask: 'How many km was the ride?' },
  { v: 'g', one: false, s: (a, e, c) => `A phone plan costs ${k('$' + e)} a month plus ${k('$' + a)} for every GB. The bill was ${k('$' + c)}.`, ask: 'How many GB were used?' },
  { v: 'm', one: false, s: (a, e, c) => `A gym charges a ${k('$' + e)} joining fee plus ${k('$' + a)} a month. ${nm()} has paid ${k('$' + c)} in all.`, ask: 'How many months is that?' },
  { v: 's', one: true, s: (a, e, c) => `${nm()} had some stickers and was given ${k(e)} more. Now there are ${k(c)}.`, ask: 'How many stickers were there at first?' },
  { v: 'p', one: true, s: (a, e, c) => `A game player had some points and lost ${k(e)}. Now the score is ${k(c)}.`, ask: 'How many points were there at first?', minus: true },
];
function story(L) {
  const c0 = pick(STORIES.filter(s => (L === 1 ? s.one : !s.one))), x = rnd(3, 12), a = rnd(2, 9), e = rnd(3, 15), c = c0.one ? (c0.minus ? x - e : x + e) : a * x + e;
  if (c <= 0) return story(L);
  const lhs = c0.one ? `${c0.v} ${c0.minus ? '−' : '+'} ${e}` : `${a}${c0.v} + ${e}`, wrong = c0.one ? [c0.minus ? c - e : c + e, c, e] : [(c + e) / a, c - e, c / a - e], bad = [...new Set(wrong)].filter(n => Number.isInteger(n) && n > 0 && n !== x);
  if (bad.length < 2) return story(L);
  const test = n => (c0.one ? (c0.minus ? n - e : n + e) : a * n + e);
  return T({ story: `${c0.s(a, e, c)} Let ${c0.v} stand for the unknown number, so ${b(`${lhs} = ${c}`)}.`, ask: `Which value of ${b(c0.v)} fits the story? ${c0.ask}`, answer: numChoice(x, bad), choiceBig: true, op: c0.one ? (c0.minus ? 'add' : 'sub') : 'multi',
    ways: [way('Put the numbers in', [`Try ${c0.v} = ${x}: ${c0.one ? `${x} ${c0.minus ? '−' : '+'} ${e}` : `${a} × ${x} + ${e}`} = ${test(x)}. That is ${c}, so it fits.`, `Try ${c0.v} = ${bad[0]}: the left side is ${test(bad[0])}, not ${c}. So the answer is ${b(x)}.`]),
      way('Undo the story', [c0.one ? `${c0.minus ? `${c} + ${e} = ${x}` : `${c} − ${e} = ${x}`}: undo what happened in the story.` : `Take off the fixed part: ${c} − ${e} = ${c - e}. Share it over the ${a}: ${c - e} ÷ ${a} = ${x}.`, `The value that fits is ${b(x)}.`])],
    read: { find: c0.ask, know: [`equation ${lhs} = ${c}`], clue: 'Put a number in for the letter. A solution makes both sides equal.', plan: 'try each choice in the equation' },
    hint: 'Put each choice in for the letter. Does the left side come out as the number given in the story?' }, 'solEq', { lhs, rhs: c });
}
const SHAPES = { 1: [() => pickNumber(1), () => yesNo(1), () => inequality(1), () => story(1), () => whichEquation(1)], 2: [() => pickNumber(2), () => yesNo(2), () => inequality(2), () => inequality(2, true), () => whichEquation(2), () => story(2)], 3: [() => pickNumber(3), () => inequality(3, true), () => story(3), yesNoIneq, () => whichEquation(3), () => inequality(3)] };
export const genSolution = L => pick(SHAPES[L])();
export const solutionWord = () => story(2);
