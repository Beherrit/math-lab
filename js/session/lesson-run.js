// Runs the "Learn it" lesson on screen: start it, move between stages, leave it. Rules live in core/lesson.js.
import { S, save } from '../core/store.js';
import { today } from '../core/dates.js';
import { newLesson, advanceStage, revealWatch, anotherWay } from '../core/lesson.js';
import { markLearned } from '../core/learned.js';
import { SKILL, generate } from '../skills/registry.js';
import { mount } from '../ui/dom.js';
import { go } from '../ui/router.js';
import { ideaScreen, watchScreen, doneScreen } from '../ui/screens/lesson.js';
import { sess, setSess, newSess } from './state.js';
import { drawTask, askHint, askStep } from './lesson-task.js';
import { phaseIntro } from './intro.js';
import { playPhase } from './flow.js';
import { finish } from './summary.js';
import { startFree } from './start.js';
// run = { lesson, skill, parent (the daily session to go back to, or null), avoid }
let run = null;
export const lessonState = () => run;
function make() {
const p = generate(run.skill.id, 1, run.avoid) || generate(run.skill.id, 2, run.avoid);
if (p) run.avoid.add(p.key);
return p;
}
export function drawLesson() {
const { lesson: l, skill } = run;
if (l.stage === 'together' || l.stage === 'turn') return drawTask();
mount(l.stage === 'idea' ? ideaScreen(skill, l) : l.stage === 'watch' ? watchScreen(skill, l) : doneScreen(skill, l));
}
export function startLesson(id) {
const parent = sess?.mode === 'daily' ? sess : null;
run = { lesson: newLesson(id), skill: SKILL[id], parent, avoid: new Set() };
setSess(newSess('lesson', [{ type: 'skill', skill: id, ms: Infinity, label: run.skill.title }]));
drawLesson();
}
function next() {
if (!advanceStage(run.lesson, make)) return;
if (run.lesson.stage === 'done') { markLearned(S, run.skill.id, today()); save(); }
drawLesson();
}
function leave(then) { const { parent, skill } = run; run = null; setSess(parent); then(parent, skill); }
// Back to the offer on a daily page, or to the skill page.
const quit = () => leave((parent, skill) => { if (parent) phaseIntro(); else go('skill', skill.id); });
const home = () => leave(parent => { if (parent) finish(); else go('home'); });
const practice = () => leave((parent, skill) => { if (parent) playPhase(); else startFree('skill', skill.id); });
// The daily page's one-time offer: skipping counts as learned so the offer does not come back.
export function skipOffer() { markLearned(S, sess.phases[sess.pi].skill, today()); save(); playPhase(); }
export const lessonActions = {
learn: el => startLesson(el.dataset.id),
learnoffer: () => startLesson(sess.phases[sess.pi].skill),
skipoffer: skipOffer,
lnext: next,
lstep: () => { if (revealWatch(run.lesson)) drawLesson(); },
lalt: () => { if (anotherWay(run.lesson)) drawLesson(); },
lhint: askHint, lhelp: askStep,
lquit: quit, lhome: home, lpractice: practice,
};
