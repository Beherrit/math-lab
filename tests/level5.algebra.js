// Level 5 test rules for the algebra skills added later: parts of an expression, two variables, solutions.
import assert from 'node:assert/strict';
import { evalAt, toJS, holds, num } from './level5.recompute.js';
import { plain, numbers } from './level5.render.js';
import { gridRead } from './level5.new.read.js';

const near = (x, y, msg) => assert.ok(Math.abs(x - y) < 1e-9, `${msg}: ${x} vs ${y}`);
const L = (...xs) => xs;
// The last operation of a displayed expression (outside any brackets): + and - first, then division, otherwise a product.
export function topOp(e) {
  const s = plain(e); let d = 0, last = null, quo = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '(') d++; else if (ch === ')') d--;
    else if (d === 0 && i > 0 && (ch === '+' || ch === '−')) last = ch === '+' ? 'sum' : 'difference';
    else if (d === 0 && ch === '÷') quo = true;
  }
  return last || (quo ? 'quotient' : 'product');
}
// Factors of a displayed product: numbers, letters and bracket groups.
export const countFactors = e => (plain(e).match(/\(.*?\)|\d+|[a-z]/g) || []).length;
// Terms of a displayed expression: pieces split by + or - that sit outside brackets.
export function countTerms(e) {
  const s = plain(e); let d = 0, n = 1;
  for (let i = 1; i < s.length; i++) { if (s[i] === '(') d++; else if (s[i] === ')') d--; else if (d === 0 && (s[i] === '+' || s[i] === '−')) n++; }
  return n;
}

export const REC_ALG = {
  epName: ({ e }) => topOp(e), epFactors: ({ n }) => n, epValue: ({ js }) => evalAt(js, {}),
  epPart: ({ a, c, v, want }) => ({ coefficient: String(a), constant: String(c), variable: v, 'term with the letter': `${a}${v}` })[want],
  epTerms: ({ n }) => n,
  epRead: ({ a, c, v, f }) => ({ prodSum: `the product of ${a} and the sum of ${v} and ${c}`, sumProd: `the sum of the product of ${a} and ${v}, and ${c}`, quotSum: `the quotient of the sum of ${v} and ${c}, and ${a}`, diffProd: `the difference of the product of ${a} and ${v}, and ${c}` })[f],
  tvRole: ({ want, ind, dep }) => (want === 'independent' ? `the ${ind}` : `the ${dep}`), tvRate: ({ ts, ds }) => (ds[1] - ds[0]) / (ts[1] - ts[0]), tvTable: ({ ts, ds, t }) => ds[0] / ts[0] * t,
  tvEq: ({ dv, iv, ts, ds }) => ({ test: o => o === `${dv} = ${ds[0] / ts[0]}${iv}` }), tvEqStory: ({ dv, iv, r }) => ({ test: o => o === `${dv} = ${r}${iv}` }), tvGraph: ({ dv, iv, r }) => ({ test: o => o === `${dv} = ${r}${iv}` }),
  tvUse: ({ r, f, t }) => r * t + f, tvSolve: ({ r, d }) => d / r, tvEqFee: ({ dv, iv, r, f }) => ({ test: o => o === `${dv} = ${r}${iv} + ${f}` }),
  tvDouble: ({ r, f, t }) => (r * 2 * t + f === 2 * (r * t + f) ? 'Yes, it doubles' : 'No, it does not double'),
  solEq: ({ lhs, rhs }) => ({ test: o => evalAt(toJS(lhs), { X: num(o) }) === rhs }), solYes: ({ lhs, rhs, val }) => (evalAt(toJS(lhs), { X: val }) === rhs ? 'Yes' : 'No'),
  solIneq: ({ lhs, sym, rhs }) => ({ test: o => holds(evalAt(toJS(lhs), { X: num(o) }), sym, rhs) }), solYesIneq: ({ lhs, sym, rhs, val }) => (holds(evalAt(toJS(lhs), { X: val }), sym, rhs) ? 'Yes' : 'No'),
  solSet: ({ lhs, sym, rhs, xs }) => xs.filter(x => holds(evalAt(toJS(lhs), { X: x }), sym, rhs)).length,
  solBreak: ({ v }) => ({ test: o => { const [l, r] = o.split(' = '); return evalAt(toJS(l), { X: v }) === Number(r); } }),
  epWhich: ({ part, d, c, v, e }) => ({ coef: String(d), var: v, const: String(c), whole: e })[part],
};
export const SHOWN_ALG = {
  epName: () => L(), epFactors: () => L(), epValue: () => L(), epPart: t => L(t.a, t.c), epTerms: () => L(), epRead: t => L(t.a, t.c), epWhich: t => L(t.d, t.c),
  solEq: t => [...numbers(t.lhs), t.rhs], solYes: t => [...numbers(t.lhs), t.rhs, t.val], solIneq: t => [...numbers(t.lhs), t.rhs], solYesIneq: t => [...numbers(t.lhs), t.rhs, t.val], solSet: t => [...numbers(t.lhs), t.rhs, ...t.xs], solBreak: t => L(t.v),
  tvRole: () => L(), tvRate: t => [...t.ts, ...t.ds], tvTable: t => [...t.ts, ...t.ds, t.t], tvEq: t => [...t.ts, ...t.ds], tvEqStory: t => L(t.r), tvUse: t => (t.f ? L(t.r, t.f, t.t) : L(t.r, t.t)), tvSolve: t => L(t.r, t.d),
  tvEqFee: t => L(t.r, t.f), tvGraph: () => L(), tvDouble: t => (t.f ? L(t.r, t.f, t.t, 2 * t.t) : L(t.r, t.t, 2 * t.t)),
};
export const CUSTOM_ALG = {
  tvGraph: (p, t) => { const g = gridRead(p.visual), seg = g.segs[0][1]; near(seg.y / seg.x, t.r, 'slope of the drawn line'); assert.ok(g.pts.every(q => Math.abs(q.y - t.r * q.x) < 1e-6), 'dots on the line'); },
  epName: (p, t) => { assert.equal(plain(p.expr), t.e, 'expression shown'); assert.equal(topOp(p.expr), t.op, 'name of the shown expression'); },
  epFactors: (p, t) => assert.equal(countFactors(p.expr), p.answer.value, 'factors in the displayed product'),
  epValue: (p, t) => near(evalAt(toJS(p.expr), {}), p.answer.value, 'displayed expression'),
  epTerms: (p, t) => assert.equal(countTerms(p.expr), p.answer.value, 'terms in the displayed expression'),
  epRead: (p, t) => { assert.ok(plain(p.answer.options[p.answer.correct]).startsWith(`the ${topOp(p.expr)} of`), 'the words start with the last operation'); },
  epPart: (p, t) => assert.ok([`${t.a}${t.v} + ${t.c}`, `${t.c} + ${t.a}${t.v}`].includes(plain(p.expr)), 'expression shown'),
};
export const RANGE_ALG = {};
