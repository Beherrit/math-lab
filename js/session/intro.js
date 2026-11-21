// The card shown before each phase of a session. A never-practiced focus skill also gets a one-time lesson offer.
import { S } from '../core/store.js';
import { needsOffer } from '../core/learned.js';
import { sess } from './state.js';
import { stopTimer } from './timer.js';
import { I } from '../ui/icons.js';
import { mount } from '../ui/dom.js';
const offerFor = ph => sess.mode === 'daily' && ph.type === 'skill' && needsOffer(S, ph.skill);
export function phaseIntro() {
stopTimer();
const ph = sess.phases[sess.pi]; const offer = offerFor(ph);
const stepTxt = sess.mode === 'daily' ? `Part ${sess.pi + 1} of ${sess.phases.length}` : '';
const go = offer ? '' : '<button class="btn primary big" data-act="phasego">Go</button>';
const bar = offer ? '<footer class="pad lbar"><button class="btn big" data-act="skipoffer">Skip to practice</button><button class="btn primary big" data-act="learnoffer">Learn it</button></footer>' : '';
mount(`<div class="page intro ${offer ? 'has-bar' : ''}"><header class="top"><button class="iconbtn" data-act="quit" aria-label="Stop">${I.x}</button></header>
<div class="intro-card paper-card">${stepTxt ? `<p class="small muted">${stepTxt}</p>` : ''}<h1>${ph.label}</h1><p>${ph.intro || 'Answer as many as you can in one minute!'}</p>
${offer ? '<p class="offer"><b>New skill.</b> Want to learn it first?</p>' : ''}
${sess.pi > 0 ? `<p class="so-far">${I.star} ${sess.stats.stars} stars so far</p>` : ''}
${go}</div>${bar}</div>`);
}
