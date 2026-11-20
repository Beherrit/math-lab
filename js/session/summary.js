// End of a session: save the day, show the summary.
import { S, save } from '../core/store.js';
import { dayLog, completeDay } from '../core/daily.js';
import { newBadges } from '../core/badges.js';
import { SKILL } from '../skills/registry.js';
import { levelInfo } from '../levels.js';
import { I } from '../ui/icons.js';
import { mount } from '../ui/dom.js';
import { sticker } from '../ui/fragments.js';
import { sess, setSess } from './state.js';
import { stopTimer } from './timer.js';
import { confetti } from './feedback.js';
function levelLine(up) {
if (!up) return '';
const next = up.next ? ` Now on <b>Level ${up.next}: ${levelInfo(up.next).title}</b>.` : ' You finished every level!';
return `<li>Finished <b>Level ${up.done}</b>!${next}</li>`;
}
function summaryHTML(mode, title, st, badges, streakUp) {
const acc = st.q ? Math.round(st.c / st.q * 100) : 0;
return `<div class="page summary">
<div class="sum-card paper-card">
<h1>${title}</h1>
${mode === 'sprint' ? `<p class="huge">${st.c}</p><p class="muted">facts right in one minute${st.c >= S.counters.sprintBest && st.c ? ' — a new record!' : ''}</p>` : `<p class="huge">${I.star}${st.stars}</p><p class="muted">stars earned</p>`}
<ul class="sum-list">
<li><b>${st.q}</b> questions · <b>${acc}%</b> right on the first try</li>
${st.solidNew ? `<li><b>${st.solidNew}</b> new solid times-table fact${st.solidNew > 1 ? 's' : ''}</li>` : ''}
${st.unlocked.map(u => `<li>Unlocked the <b>×${u}</b> table</li>`).join('')}
${[...new Set(st.ups)].map(id => `<li>Moved up a step in <b>${SKILL[id].title}</b></li>`).join('')}
${st.mastered.map(id => `<li>Mastered <b>${SKILL[id].title}</b>!</li>`).join('')}
${levelLine(st.levelUp)}
${streakUp ? `<li>${I.flame} <b>${S.streak.n}-day</b> streak</li>` : ''}
</ul>
${badges.length ? `<div class="new-stickers"><p><b>New sticker${badges.length > 1 ? 's' : ''}!</b></p><div class="stickers">${badges.map(bd => sticker(bd)).join('')}</div></div>` : ''}
<button class="btn primary big" data-go="home">Back home</button>
</div></div>`;
}
export function finish(complete) {
stopTimer();
const st = sess.stats; const dl = dayLog(S); dl.ms += Math.min(Date.now() - sess.start, 60 * 60000);
const streakUp = sess.mode === 'daily' && complete ? completeDay(S) : false;
if (sess.mode === 'sprint') S.counters.sprintBest = Math.max(S.counters.sprintBest, st.c);
const badges = newBadges(S); save();
const mode = sess.mode;
const title = mode === 'daily' ? (complete ? 'Today’s page is done!' : 'Nice work today') : mode === 'sprint' ? 'Sprint finished!' : 'Practice done';
setSess(null);
mount(summaryHTML(mode, title, st, badges, streakUp));
if ((complete && mode === 'daily') || badges.length || st.levelUp) confetti();
}
