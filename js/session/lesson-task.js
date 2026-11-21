// The two interactive lesson stages (do one together, your turn): the answer input plus gentle help.
// Nothing here records an answer: lesson answers never feed mastery, stars, streaks or the day log.
import { answerTask, showHint, showStep } from '../core/lesson.js';
import { mount, $ } from '../ui/dom.js';
import { taskScreen, helpHTML, continueBar } from '../ui/screens/lesson.js';
import { sess, resetInp } from './state.js';
import { renderInput, wirePlane, resetAttempt, markCorrect } from './pad.js';
import { fb } from './feedback.js';
import { sayQuestion, sayResult } from './aloud.js';
import { lessonState } from './lesson-run.js';
// Rewrites the help area, then scrolls the newest step clear of the pad that sticks to the bottom.
function paintHelp() {
const h = $('.lhelp'); if (!h) return;
h.innerHTML = helpHTML(lessonState().lesson.task);
const li = $('.lsteps li:last-child'); if (!li) return;
li.style.scrollMarginBottom = `${($('.pad')?.offsetHeight || 0) + 12}px`; li.scrollIntoView({ block: 'nearest' });
}
export function drawTask() {
const { lesson, skill } = lessonState(); const t = lesson.task;
Object.assign(sess, { q: t.p, tries: 0, assisted: false, preDone: true, answered: false, wrongChoices: new Set() });
resetInp();
mount(taskScreen(skill, lesson));
renderInput(); paintHelp();
if (t.p.answer.kind === 'point') wirePlane();
sayQuestion(t.p);
}
export function lessonAnswer(ok) {
const { lesson } = lessonState(); const t = lesson.task; const r = answerTask(t, ok);
if (r.solved) {
sess.answered = true; markCorrect(t.p); sayResult('right', t.p);
fb('Yes, that is it.', 'good'); $('.pad').innerHTML = continueBar(lesson);
} else {
if (t.tries >= 2 && t.shown === 0) showStep(t);
sayResult('retry', t.p); resetAttempt(t.p);
fb(`Not yet. ${t.p.hint}`, 'soft'); renderInput();
}
paintHelp();
}
export function askHint() { showHint(lessonState().lesson.task); paintHelp(); }
export function askStep() { showStep(lessonState().lesson.task); paintHelp(); }
