// Draws the answer slot and the pad under the question (number pad, fraction boxes, choices, grid tap).
import { sess, inp } from './state.js';
import { inputKind } from './input.js';
import { PLANE } from '../util.js';
import { isEarlyProblem } from '../skills/registry.js';
import { I } from '../ui/icons.js';
import { $, $$ } from '../ui/dom.js';
import { clearFb } from './feedback.js';
const minus = v => v.replace('-', '−');
// digitsOnly (Early Start) swaps the decimal point for an empty space so 0 stays in the middle.
export function keypad(frac, signed, digitsOnly = false) {
const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', frac ? 'next' : digitsOnly ? 'gap' : '.', '0', 'del'];
const label = k => (k === 'del' ? I.del : k === 'next' ? 'Next box' : k);
const aria = k => (k === 'del' ? 'Delete' : k === 'next' ? 'Next box' : k);
const key = k => (k === 'gap' ? '<span class="key-gap" aria-hidden="true"></span>' : `<button class="key ${k.length > 1 ? 'fn' : ''}" data-act="key" data-k="${k}" aria-label="${aria(k)}">${label(k)}</button>`);
const sign = signed ? `<button class="key fn sign" data-act="key" data-k="sign" aria-label="Plus or minus">+/−</button>` : '';
return `<div class="keypad ${signed ? 'signed' : ''}">${keys.map(key).join('')}${sign}<button class="key check" data-act="submit">Check</button></div>`;
}
function renderNum(q, slot, pad) {
slot.innerHTML = `<div class="ans num ${inp.val ? '' : 'empty'}"><span class="val">${minus(inp.val) || '?'}</span>${q.suffix ? `<span class="suffix">${q.suffix}</span>` : ''}</div>`;
if (!$('.keypad', pad)) pad.innerHTML = keypad(false, q.answer.signed, isEarlyProblem(q));
}
function renderFrac(q, slot, pad) {
const names = { w: 'whole number', n: 'top', d: 'bottom' };
const box = f => `<button class="box ${f} ${inp.f === f ? 'on' : ''} ${inp[f] ? '' : 'empty'}" data-act="field" data-f="${f}" aria-label="${names[f]}">${inp[f]}</button>`;
const neg = q.answer.signed ? `<span class="fneg ${inp.neg ? 'on' : ''}">−</span>` : '';
slot.innerHTML = `<div class="ans frac">${neg}${box('w')}<div class="fstack">${box('n')}<span class="fline"></span>${box('d')}</div>${q.suffix ? `<span class="suffix">${q.suffix}</span>` : ''}</div><p class="frac-help">Tap a box to fill it. Use the big box only for a whole number.</p>`;
if (!$('.keypad', pad)) pad.innerHTML = keypad(true, q.answer.signed);
}
function renderChoice(q, slot, pad) {
const opts = q.answer.options; const len = o => String(o).replace(/<[^>]+>/g, '').length;
const long = opts.some(o => len(o) > 16); const big = q.choiceBig && opts.every(o => len(o) <= 5); // big buttons only fit short answers
const early = isEarlyProblem(q); const pics = early && opts.some(o => /<svg|<img/i.test(o));
pad.innerHTML = `<div class="choices ${big ? 'big' : long && !pics ? 'one' : 'two'} ${early ? 'early' : ''} ${pics ? 'pics' : ''}">${opts.map((o, i) => `<button class="choice ${sess.wrongChoices.has(i) ? 'nope' : ''}" data-act="choice" data-i="${i}" ${sess.wrongChoices.has(i) ? 'disabled' : ''}>${o}</button>`).join('')}</div>`;
slot.innerHTML = '';
}
export function renderInput() {
const q = sess.q; const slot = $('.ans-slot'), pad = $('.pad'); const kind = inputKind();
if (kind === 'pre') {
slot.innerHTML = `<p class="pre-q">${q.pre.q}</p>`;
pad.innerHTML = `<div class="choices two">${q.pre.options.map((o, i) => `<button class="choice" data-act="pre" data-i="${i}">${o}</button>`).join('')}</div>`;
} else if (kind === 'num') renderNum(q, slot, pad);
else if (kind === 'frac') renderFrac(q, slot, pad);
else if (kind === 'choice') renderChoice(q, slot, pad);
else if (kind === 'point') {
slot.innerHTML = `<div class="ans pt ${inp.pt ? '' : 'empty'}">${inp.pt ? `(${inp.pt.x}, ${inp.pt.y})` : 'Tap the grid'}</div>`;
pad.innerHTML = `<button class="btn primary big" data-act="submit">Check</button>`;
}
}
export function wirePlane() {
const svg = $('svg.plane.tap'); if (!svg) return;
svg.addEventListener('pointerdown', e => {
if (sess.answered) return;
const r = svg.getBoundingClientRect(); const sc = PLANE.W / r.width; const max = +svg.dataset.max;
const u = (PLANE.W - PLANE.m - 14) / max;
const x = Math.round(((e.clientX - r.left) * sc - PLANE.m) / u), y = Math.round((PLANE.W - PLANE.m - (e.clientY - r.top) * sc) / u);
if (x < 0 || y < 0 || x > max || y > max) return;
inp.pt = { x, y }; drawPoint(inp.pt); clearFb(); renderInput();
});
}
export function drawPoint(pt, cls = '') {
const g = $('svg.plane .cursor'); if (!g) return; if (!pt) { g.innerHTML = ''; return; }
const svg = g.closest('svg'); const max = +svg.dataset.max; const u = (PLANE.W - PLANE.m - 14) / max;
const X = PLANE.m + pt.x * u, Y = PLANE.W - PLANE.m - pt.y * u;
g.innerHTML = `<line x1="${PLANE.m}" y1="${Y}" x2="${X}" y2="${Y}" class="guide"/><line x1="${X}" y1="${PLANE.W - PLANE.m}" x2="${X}" y2="${Y}" class="guide"/><circle cx="${X}" cy="${Y}" r="9" class="mine ${cls}"/>`;
}
// Clears a wrong attempt so the learner can try again (a wrong choice stays greyed out).
export function resetAttempt(q) {
if (q.answer.kind === 'num') { inp.val = ''; }
if (q.answer.kind === 'frac') { inp.w = ''; inp.n = ''; inp.d = ''; inp.neg = false; inp.f = 'n'; }
if (q.answer.kind === 'point') { inp.pt = null; drawPoint(null); }
if (q.answer.kind === 'choice' && inp.choice !== null) { sess.wrongChoices.add(inp.choice); inp.choice = null; }
}
// Shows a right answer on the card, the input and (for choices and points) the correct option.
export function markCorrect(q) {
$('.qcard')?.classList.add('right');
$('.ans')?.classList.add('ok');
if (q.answer.kind === 'choice') $$('.choice')[q.answer.correct]?.classList.add('ok');
if (q.answer.kind === 'point') drawPoint(inp.pt, 'ok');
}
