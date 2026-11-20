// Click actions (data-act="name"). Each takes the clicked element.
import { S, save } from '../core/store.js';
import { today } from '../core/dates.js';
import { unlockedLevel } from '../core/progression.js';
import { setCurrentLevel, canOpenLevel, startFromBeginning } from '../core/entry.js';
import { SKILL } from '../skills/registry.js';
import { $, $$ } from './dom.js';
import { go, currentView } from './router.js';
import { renderSkill } from './screens/skill.js';
import { renderParent, parentState } from './screens/parent.js';
import { sess, inp } from '../session/state.js';
import { toast, clearFb } from '../session/feedback.js';
import { pressKey } from '../session/input.js';
import { renderInput } from '../session/pad.js';
import { openWays, closeSheet, toggleRead, onPre, pauseOverlay } from '../session/sheet.js';
import { submit, skipQuestion } from '../session/answer.js';
import { advance, playPhase } from '../session/flow.js';
import { startDaily, startFree, startPlacementCheck } from '../session/start.js';
import { finish } from '../session/summary.js';
import { keepGoing, nextSkill } from '../session/extra-run.js';
import { abortPlacement } from '../session/placement-run.js';
import { adultActions } from './parent-actions.js';
import { lessonActions } from '../session/lesson-run.js';
import { aloudActions } from '../session/aloud.js';
function setLevel(n, after) {
setCurrentLevel(S, n); save(); after();
}
function selectTab(el) {
const wrap = el.closest('.ways');
$$('.tab', wrap).forEach(t => { t.classList.toggle('on', t === el); t.setAttribute('aria-selected', t === el); });
$$('.way', wrap).forEach(w => w.classList.toggle('on', w.dataset.i === el.dataset.i));
}
function quit() {
if (!sess) return;
if (sess.mode === 'place') return abortPlacement();
if (sess.mode === 'free' || sess.mode === 'extra' || !$('.sheet')) return finish();
return pauseOverlay('quit');
}
function presolve() {
sess.preDone = true; clearFb();
const f = $('.fb'); f.className = 'fb'; f.innerHTML = ''; $('.pad').innerHTML = '';
renderInput();
}
export const ACTIONS = {
start: () => startDaily(),
facts: () => startFree('facts'),
sprint: () => startFree('sprint'),
tablepractice: el => startFree('table', el.dataset.t),
practice: el => startFree('skill', el.dataset.id),
skill: el => go('skill', el.dataset.id),
setfocus: el => { S.todayFocus = { d: today(), id: el.dataset.id }; save(); toast(`Today’s focus: ${SKILL[el.dataset.id].title}`); go('home'); },
newex: () => renderSkill(currentView().arg),
setlevel: el => { if (canOpenLevel(S, +el.dataset.n) && +el.dataset.n <= unlockedLevel(S)) setLevel(el.dataset.n, () => go('home')); },
parentlevel: el => setLevel(el.dataset.n, renderParent),
replace: () => go('place'),
placestart: () => startPlacementCheck(),
beginearly: () => { startFromBeginning(S); save(); go('home'); },
skipq: () => skipQuestion(),
tab: selectTab,
phasego: () => playPhase(),
key: el => { if (pressKey(el.dataset.k)) renderInput(); },
field: el => { inp.f = el.dataset.f; renderInput(); },
choice: el => { if (sess.answered) return; inp.choice = +el.dataset.i; submit(); },
pre: el => onPre(+el.dataset.i),
presolve,
submit: () => submit(),
next: () => advance(),
how: () => openWays(false),
read: () => toggleRead(),
plan: el => { el.hidden = true; el.nextElementSibling.hidden = false; },
closesheet: () => closeSheet(),
pause: () => pauseOverlay('pause'),
quit,
resume: () => { sess.paused = false; sess.last = performance.now(); closeSheet(); },
stop: () => finish(),
keepgoing: () => keepGoing(),
nextskill: () => nextSkill(),
closeparent: () => { parentState.open = false; go('home'); },
...adultActions,
...lessonActions,
...aloudActions,
};
