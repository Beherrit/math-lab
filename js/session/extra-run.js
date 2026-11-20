// After the daily page: the result for the day, then "Keep going" (untimed) or "Finish". Also "Next skill" in free practice.
import { S, save } from '../core/store.js';
import { completeDay } from '../core/daily.js';
import { newBadges } from '../core/badges.js';
import { pathPick } from '../core/focus.js';
import { SKILL } from '../skills/registry.js';
import { I } from '../ui/icons.js';
import { mount } from '../ui/dom.js';
import { sticker } from '../ui/fragments.js';
import { sess } from './state.js';
import { stopTimer } from './timer.js';
import { confetti } from './feedback.js';
import { bankTime } from './summary.js';
import { playPhase, nextQuestion } from './flow.js';
// The timed page is over: count the day, move the streak once, show the result with two choices.
export function dayResult() {
stopTimer(); bankTime();
sess.streakUp = completeDay(S); const badges = newBadges(S); save();
sess.phaseDone = false; sess.q = null;
mount(`<div class="page summary has-bar"><div class="sum-card paper-card"><h1>Today’s page is done!</h1>
<p class="huge">${I.star}${sess.stats.stars}</p><p class="muted">stars so far today</p>
<ul class="sum-list"><li>${I.flame} <b>${S.streak.n}-day</b> streak</li></ul>
${badges.length ? `<div class="new-stickers"><p><b>New sticker${badges.length > 1 ? 's' : ''}!</b></p><div class="stickers">${badges.map(b => sticker(b)).join('')}</div></div>` : ''}</div>
<footer class="pad lbar"><button class="btn big" data-act="stop">Finish</button><button class="btn primary big" data-act="keepgoing">Keep going</button></footer></div>`);
confetti();
}
export function keepGoing() {
const focus = sess.phases.find(p => p.type === 'skill')?.skill ?? null;
Object.assign(sess, { mode: 'extra', phases: [{ type: 'extra', ms: Infinity, label: 'Practice' }], pi: 0, el: 0, phaseDone: false, locked: false, extra: { n: 0, focus } });
playPhase();
}
// Free practice of one skill, once it is mastered: carry on with the next skill on the path.
export function nextSkill() {
const id = pathPick(S); if (!id) return;
sess.offerNext = false;
sess.phases[0] = { type: 'skill', skill: id, ms: Infinity, label: SKILL[id].title };
nextQuestion();
}
