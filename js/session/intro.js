// The card shown before each phase of a session.
import { sess } from './state.js';
import { stopTimer } from './timer.js';
import { I } from '../ui/icons.js';
import { mount } from '../ui/dom.js';
export function phaseIntro() {
stopTimer();
const ph = sess.phases[sess.pi];
const stepTxt = sess.mode === 'daily' ? `Part ${sess.pi + 1} of ${sess.phases.length}` : '';
mount(`<div class="page intro"><header class="top"><button class="iconbtn" data-act="quit" aria-label="Stop">${I.x}</button></header>
<div class="intro-card paper-card">${stepTxt ? `<p class="small muted">${stepTxt}</p>` : ''}<h1>${ph.label}</h1><p>${ph.intro || 'Answer as many as you can in one minute!'}</p>
${sess.pi > 0 ? `<p class="so-far">${I.star} ${sess.stats.stars} stars so far</p>` : ''}
<button class="btn primary big" data-act="phasego">Go</button></div></div>`);
}
