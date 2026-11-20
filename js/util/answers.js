// Answer objects (num / frac / choice / point), their display, and check().
import { R, gcd, simp, shuffle, fmt } from './math.js';
import { fr } from './text.js';
// opts.signed shows the plus/minus key; a negative value turns it on by itself.
export const num = (v, { signed } = {}) => ({ kind: 'num', value: R(v), signed: signed ?? v < 0 });
export const frac = (n, d, { signed } = {}) => {
if (d < 0) { n = -n; d = -d; }
[n, d] = simp(n, d);
return { kind: 'frac', n, d, signed: signed ?? n < 0 };
};
export const point = (x, y) => ({ kind: 'point', x, y });
export function choice(correct, distractors, { keepOrder = false, all = null } = {}) {
if (all) return { kind: 'choice', options: all, correct: all.indexOf(correct) };
const opts = [correct];
for (const d of distractors) if (d !== correct && !opts.includes(d)) opts.push(d);
const options = keepOrder ? opts : shuffle(opts.slice(0, 4));
return { kind: 'choice', options, correct: options.indexOf(correct) };
}
export const ANSWER_KINDS = ['num', 'frac', 'choice', 'point'];
export function answerHTML(a) {
if (a.kind === 'num') return fmt(a.value);
if (a.kind === 'frac') return fr(a.n, a.d);
if (a.kind === 'choice') return a.options[a.correct];
if (a.kind === 'point') return `(${a.x}, ${a.y})`;
return '';
}
const EMPTY_NUM = { empty: true, msg: 'Type your answer first.' };
function checkNum(a, input) {
const s = String(input ?? '').trim().replace('−', '-');
if (!s || s === '.' || s === '-') return s === '-' ? { empty: true, msg: 'That number looks unfinished.' } : EMPTY_NUM;
const v = Number(s);
if (!Number.isFinite(v)) return { empty: true, msg: 'That number looks unfinished.' };
return { ok: Math.abs(v - a.value) < 1e-9 };
}
function checkFrac(a, input) {
const w = input?.w ? parseInt(input.w, 10) : 0;
const nS = input?.n ?? '', dS = input?.d ?? '';
if (!input?.w && !nS && !dS) return EMPTY_NUM;
if ((nS && !dS) || (!nS && dS)) return { empty: true, msg: 'Fill in both the top and the bottom of the fraction.' };
const n = nS ? parseInt(nS, 10) : 0, d = dS ? parseInt(dS, 10) : 1;
if (d === 0) return { empty: true, msg: 'The bottom of a fraction can’t be 0.' };
const top = (w * d + n) * (input?.neg ? -1 : 1);
const ok = top * a.d === a.n * d;
let note = '';
if (ok && nS && !(gcd(n, d) === 1 && n < d)) note = `Simplest form: ${fr(a.n, a.d)}`;
return { ok, note };
}
export function check(a, input) {
if (a.kind === 'num') return checkNum(a, input);
if (a.kind === 'frac') return checkFrac(a, input);
if (a.kind === 'choice') {
if (input === null || input === undefined) return { empty: true, msg: 'Pick an answer.' };
return { ok: input === a.correct };
}
if (a.kind === 'point') {
if (!input) return { empty: true, msg: 'Tap the grid to place your point.' };
return { ok: input.x === a.x && input.y === a.y };
}
return { ok: false };
}
