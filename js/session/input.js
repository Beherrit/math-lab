// What the learner has typed: which kind of answer is on screen, key handling, and the value handed to check().
import { sess, inp } from './state.js';
import { clearFb } from './feedback.js';
export const inputKind = () => (sess.preDone ? sess.q.answer.kind : 'pre');
const MAX_DIGITS = 9;
function pressNum(k) {
const neg = inp.val.startsWith('-'); let body = neg ? inp.val.slice(1) : inp.val;
if (k === 'del') { inp.val = inp.val.slice(0, -1); return; }
if (k === 'sign') { if (sess.q.answer.signed) inp.val = neg ? body : '-' + body; return; }
if (k === '.') { if (!body.includes('.') && body.length < 10) body = (body || '0') + '.'; }
else if (/\d/.test(k) && body.replace('.', '').length < MAX_DIGITS) body = body === '0' ? k : body + k;
inp.val = (neg ? '-' : '') + body;
}
function pressFrac(k) {
if (k === 'next') inp.f = { n: 'd', d: 'w', w: 'n' }[inp.f];
else if (k === 'sign') { if (sess.q.answer.signed) inp.neg = !inp.neg; }
else if (k === 'del') inp[inp.f] = inp[inp.f].slice(0, -1);
else if (/\d/.test(k) && inp[inp.f].length < 4) inp[inp.f] = inp[inp.f] === '0' ? k : inp[inp.f] + k;
}
// Returns true when the input changed and the pad should redraw.
export function pressKey(k) {
if (sess.answered || sess.locked) return false;
const kind = inputKind();
if (kind === 'num') pressNum(k); else if (kind === 'frac') pressFrac(k); else return false;
clearFb();
return true;
}
export function currentInput() {
const k = inputKind();
if (k === 'num') return inp.val;
if (k === 'frac') return { w: inp.w, n: inp.n, d: inp.d, neg: inp.neg };
return k === 'choice' ? inp.choice : inp.pt;
}
