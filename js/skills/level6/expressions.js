// Linear expressions: combining like terms, expanding (distributing) and factoring, with negatives.
import { rnd, pick, chance, gcd, fmt, b, way, choice, table } from '../../util.js';
import { nz, par, size, xTerm, lin, snum, tag } from './helpers.js';

// terms: [[coefficient, isX], ...] written out in order, for example "3x − 7 − 5x + 2".
const joinTerms = ts => ts.map(([c, x], i) => {
  const body = x ? xTerm(Math.abs(c)) : size(c);
  return i === 0 ? (c < 0 ? '−' : '') + body : `${c < 0 ? '−' : '+'} ${body}`;
}).join(' ');
const sumOf = (ts, isX) => ts.filter(t => t[1] === isX).reduce((s, t) => s + t[0], 0);
const fac = (g, p, q) => `${g === -1 ? '−' : fmt(g)}(${lin(p, q)})`;
// Choices between linear expressions. Each one is a pair [x coefficient, number], so no two are equal in value.
function pairChoice(right, wrong, show = p => lin(...p)) {
  const seen = new Set([right.join()]); const out = [];
  for (const p of [...wrong, [right[0] + 1, right[1]], [right[0], right[1] + 1], [right[0] - 1, right[1] - 1]])
    if (!seen.has(p.join())) { seen.add(p.join()); out.push(show(p)); }
  return choice(show(right), out.slice(0, 3));
}
// Put a number in for x, the way you would on paper: "3 × 2 + 5".
const withX = (src, x) => src.replace(/(\d)x/g, `$1 × ${par(x)}`).replace(/x/g, par(x));
const checkWay = (src, A, C, x = 2) => way('Check with a number', [
  'Two expressions are equal when they give the same value for any x. Try x = ' + x + '.',
  `Start: ${withX(src, x)} = ${b(fmt(A * x + C))}`, `Answer: ${withX(lin(A, C), x)} = ${b(fmt(A * x + C))}. They match.`]);

function combine(L) {
  const ts = L === 1 ? [[rnd(2, 9), true], [rnd(1, 12), false], [rnd(1, 6) * (chance(0.3) ? -1 : 1), true]] : [[nz(-9, 9), true], [nz(-9, 9), false], [nz(-9, 9), true], [nz(-12, 12), false]];
  if (L === 1 && chance(0.5)) ts.push([rnd(1, 9), false]);
  if (L > 1 && chance(0.5)) [ts[1], ts[2]] = [ts[2], ts[1]];
  const A = sumOf(ts, true), C = sumOf(ts, false), src = joinTerms(ts);
  if (A === 0 || C === 0 || (L === 1 && A < 1) || (L > 1 && ts.every(t => t[0] > 0))) return combine(L);
  const xs = ts.filter(t => t[1]), ns = ts.filter(t => !t[1]), absA = xs.reduce((s, t) => s + Math.abs(t[0]), 0), absC = ns.reduce((s, t) => s + Math.abs(t[0]), 0);
  return tag({ ask: 'Simplify by combining like terms.', expr: src, exprSmall: ts.length > 3, answer: pairChoice([A, C], [[A + C, 0], [absA, absC], [A, -C], [xs[0][0], C]]),
    ways: [way('Sort the terms into families', [`x terms count x's. Plain numbers are a different family, so the two cannot be mixed. Each term keeps the sign in front of it.`,
      table(['x terms', 'numbers'], [[joinTerms(xs), joinTerms(ns)], [b(xTerm(A)), b(fmt(C))]]),
      `Coefficients: ${xs.map(t => par(t[0])).join(' + ')} = ${fmt(A)}. Numbers: ${ns.map(t => par(t[0])).join(' + ')} = ${fmt(C)}.`, `Together: ${b(lin(A, C))}`]), checkWay(src, A, C)],
    hint: 'Collect the x terms first, each with the sign in front of it. Then collect the plain numbers.' }, { kind: 'exprchoice', src });
}
function expandValues(L) {
  if (L === 1) return [rnd(2, 9), 1, rnd(1, 9)];
  for (;;) { const a = nz(-9, 9), p = pick([1, 1, 2, 3]), q = nz(-9, 9); if (a !== 1 && (a < 0 || q < 0)) return [a, p, q]; }
}
function expand(L) {
  const [a, p, q] = expandValues(L), src = fac(a, p, q), A = a * p, C = a * q, blank = chance(L === 1 ? 0.5 : 0.3);
  const ways = [way('Area model', [`${src} means ${a === -1 ? 'the opposite of' : fmt(a) + ' groups of'} everything in the brackets, so the ${fmt(a)} multiplies BOTH terms.`,
    table(['×', xTerm(p), fmt(q)], [[fmt(a), xTerm(A), fmt(C)]]), `${par(a)} × ${xTerm(p)} = ${xTerm(A)} and ${par(a)} × ${par(q)} = ${fmt(C)}.`, `Together: ${b(lin(A, C))}`]), checkWay(src, A, C)];
  if (blank) return tag({ ask: 'What number goes in the blank?', expr: `${src} = ${xTerm(A)} + <span class="blank">?</span>`, answer: snum(C), ways,
    hint: `The ${fmt(a)} outside multiplies the second term too. What is ${par(a)} × ${par(q)}?` }, { kind: 'exprblank', src, tmpl: `${xTerm(A)} + ?` });
  return tag({ ask: 'Expand (multiply out the brackets).', expr: src, answer: pairChoice([A, C], [[A, q], [A, -C], [a + p, a + q], [-A, C]]), ways,
    hint: 'Multiply the number outside by each term inside, one at a time. Watch the signs.' }, { kind: 'exprchoice', src });
}
function factorValues() {
  for (;;) { const g = rnd(2, 9) * (chance(0.3) ? -1 : 1), p = pick([1, 1, 2, 3, 5]), q = nz(-9, 9); if (gcd(p, q) === 1) return [g, p, q]; }
}
function factor() {
  const [g, p, q] = factorValues(), A = g * p, C = g * q, src = lin(A, C), right = fac(g, p, q);
  const ways = [way('Take out the biggest shared factor', [
    `${size(g)} is the biggest number that divides both ${size(A)} and ${size(C)}.${g < 0 ? ' The x term is negative, so take out −' + size(g) + '. That flips the sign of each term inside.' : ''}`,
    `Divide each term by ${fmt(g)}: ${xTerm(A)} ÷ ${par(g)} = ${xTerm(p)} and ${fmt(C)} ÷ ${par(g)} = ${fmt(q)}.`, `Write the factor outside and what is left inside: ${b(right)}`]),
    way('Check by expanding', [table(['×', xTerm(p), fmt(q)], [[fmt(g), xTerm(A), fmt(C)]]), `${right} expands back to ${src}, so the factoring is right.`])];
  if (chance(0.4)) return tag({ ask: 'What number goes in the blank?', expr: `${src} = <span class="blank">?</span>(${lin(p, q)})`, answer: snum(g), ways,
    hint: 'The number outside has to multiply back to give both terms of the expression on the left.' }, { kind: 'exprblank', src, tmpl: `?(${lin(p, q)})` });
  const show = ([gg, pp, qq]) => fac(gg, pp, qq), key = t => [t[0] * t[1], t[0] * t[2]].join();
  const wrong = [[g, p, C], [g, A, q], [g, p, -q], [-g, p, q]].filter(t => key(t) !== key([g, p, q]));
  return tag({ ask: 'Factor the expression.', expr: src, answer: choice(right, [...new Set(wrong.map(show))]), ways,
    hint: `What is the biggest number that divides both ${size(A)} and ${size(C)}?` }, { kind: 'exprchoice', src });
}
function expandCombine() {
  const a = rnd(2, 6), c = nz(-9, 9), d = nz(-6, 6), e = nz(-9, 9), A = a + d, C = a * c + d * e;
  if (A === 0 || C === 0 || Math.abs(d) === 1 && chance(0.5)) return expandCombine();
  const src = `${fac(a, 1, c)} ${d < 0 ? '−' : '+'} ${Math.abs(d) === 1 ? '' : size(d)}(${lin(1, e)})`;
  return tag({ ask: 'Expand, then combine like terms.', expr: src, exprSmall: true, answer: pairChoice([A, C], [[A, a * c - d * e], [A, c + e], [a - d, C], [A, a * c + e]]),
    ways: [way('Expand each bracket, then collect', [`First bracket: ${fac(a, 1, c)} = ${lin(a, a * c)}.`,
      `Second bracket: the ${fmt(d)} multiplies both terms, sign included: ${par(d)} × x = ${xTerm(d)} and ${par(d)} × ${par(e)} = ${fmt(d * e)}.`,
      `x terms: ${xTerm(a)} + ${par(d)}x = ${xTerm(A)}. Numbers: ${fmt(a * c)} + ${par(d * e)} = ${fmt(C)}.`, `Together: ${b(lin(A, C))}`]), checkWay(src, A, C, 1)],
    hint: 'Multiply out each bracket separately. A minus sign in front of a bracket belongs to its number.' }, { kind: 'exprchoice', src });
}
export function genExpr(L) {
  if (L === 1) return chance(0.5) ? combine(1) : expand(1);
  if (L === 2) return chance(0.5) ? combine(2) : expand(2);
  return chance(0.55) ? factor() : expandCombine();
}
