// Wires the page: clicks, form submit, press-and-hold gate, keyboard.
import { S, setState, save } from '../core/store.js';
import { freshState } from '../core/state.js';
import { applySetup } from '../core/learner.js';
import { today } from '../core/dates.js';
import { $ } from './dom.js';
import { go } from './router.js';
import { ACTIONS } from './actions.js';
import { onChange } from './parent-actions.js';
import { renderParent, parentState } from './screens/parent.js';
import { sess } from '../session/state.js';
import { pressKey, inputKind } from '../session/input.js';
import { renderInput } from '../session/pad.js';
import { closeSheet } from '../session/sheet.js';
import { submit } from '../session/answer.js';
import { advance } from '../session/flow.js';
import { stop as stopSpeech } from '../core/speech.js';
function onClick(e) {
const el = e.target.closest('[data-act],[data-go]'); if (!el) return;
if (el.dataset.go) {
if (el.dataset.go === 'parent') parentState.open = false;
return go(el.dataset.go, el.dataset.arg ?? null);
}
ACTIONS[el.dataset.act]?.(el);
}
function onSubmit(e) {
e.preventDefault(); const f = e.target;
if (f.dataset.form !== 'name') return;
const s = freshState('', today());
applySetup(s, { name: f.nm.value, grade: f.grade?.value || '' });
setState(s); save(); go('home');
}
function wireHold(app) {
let holdT = null;
app.addEventListener('pointerdown', e => {
const h = e.target.closest('[data-act="hold"]'); if (!h) return;
h.classList.add('holding'); holdT = setTimeout(() => { parentState.open = true; renderParent(); }, 2000);
});
['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => app.addEventListener(ev, () => { clearTimeout(holdT); $('.hold')?.classList.remove('holding'); }));
}
function press(k) { if (pressKey(k)) renderInput(); }
function onKey(e) {
if (!sess || !sess.q || e.target.matches('input,select,textarea')) return;
if ($('.sheet:not([hidden])')) { if (e.key === 'Escape') closeSheet(); return; }
if (e.key === 'Enter') { e.preventDefault(); return sess.answered ? advance() : submit(); }
if (/^\d$/.test(e.key)) return press(e.key);
if (e.key === '.') return press(inputKind() === 'frac' ? 'next' : '.');
if (e.key === '-') return press('sign');
if (e.key === 'Backspace') return press('del');
if (e.key === 'Tab' && inputKind() === 'frac') { e.preventDefault(); press('next'); }
}
export function wireEvents() {
const app = document.getElementById('app');
app.addEventListener('click', onClick);
app.addEventListener('change', onChange);
app.addEventListener('submit', onSubmit);
wireHold(app);
document.addEventListener('keydown', onKey);
document.addEventListener('visibilitychange', () => { if (document.hidden) stopSpeech(); if (sess) sess.last = performance.now(); });
}
