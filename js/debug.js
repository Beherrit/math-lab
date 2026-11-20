// Dev hooks, only installed when the page URL has ?debug. Not used by the app itself.
import { S, save } from './core/store.js';
import { generate } from './skills/registry.js';
import { clampLevel } from './levels.js';
import { sess, setSess, inp, resetInp } from './session/state.js';
import { startFree } from './session/start.js';
import { renderPlay } from './session/play.js';
import { go } from './ui/router.js';
export function installDebug() {
window.__ml = {
// Show one generated problem of a skill at difficulty step L.
show(id, L) {
startFree('skill', id); sess.q = null;
const q = generate(id, L); sess.q = q; sess.tries = 0; sess.preDone = !q.pre; sess.answered = false;
sess.qStart = performance.now(); sess.wrongChoices = new Set(); resetInp(); renderPlay();
return q;
},
// Jump to a level without the placement check.
place(level) { S.level = clampLevel(level); S.placed = true; S.todayFocus = null; save(); go('home'); return S.level; },
sess: () => sess, state: () => S, inp: () => inp, endSession: () => setSess(null),
};
}
