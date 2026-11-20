// Dev hooks, only installed when the page URL has ?debug. Not used by the app itself.
import { S, save } from './core/store.js';
import { generate, SKILL } from './skills/registry.js';
import { setCurrentLevel } from './core/entry.js';
import { requiredIn, checkLevelUp } from './core/progression.js';
import { skillState } from './core/mastery.js';
import { levelName } from './levels.js';
import { toast } from './session/feedback.js';
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
place(level) { setCurrentLevel(S, level); S.placed = true; save(); go('home'); return S.level; },
// Master every required skill of a level and run the level-up, like finishing it for real.
master(level = S.level) { requiredIn(S, level).forEach(s => { Object.assign(skillState(S, s.id), { L: 3, mastered: true, n: 9, c: 9 }); }); const up = checkLevelUp(S); save(); if (up) toast(`${levelName(up.done)} complete!`); go('home'); return up; },
// Give a skill a strand name (or clear it with no name) to look at the grouped lists before content lands.
strand(id, name) { SKILL[id].strand = name; go('home'); },
sess: () => sess, state: () => S, inp: () => inp, endSession: () => setSess(null),
};
}
