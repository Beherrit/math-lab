// End of a session: save the day, show the summary.
import { S, save } from '../core/store.js';
import { dayLog, addTime } from '../core/daily.js';
import { newBadges } from '../core/badges.js';
import { SKILL } from '../skills/registry.js';
import { moveLine } from '../core/browse.js';
import { I } from '../ui/icons.js';
import { mount } from '../ui/dom.js';
import { sticker } from '../ui/fragments.js';
import { sess, setSess } from './state.js';
import { stopTimer } from './timer.js';
import { confetti } from './feedback.js';
// Adds the time since the last count to today's log (a long idle gap is capped).
export function bankTime() { const now = Date.now(); addTime(S, now - (sess.bank ?? sess.start)); sess.bank = now; }
function levelLine(up) {
if (!up) return '';
return `<li>${moveLine(up.done, up.next)}</li>`;
}
function summaryHTML(mode, title, st, badges, streakUp) {
const dl = dayLog(S); const acc = st.q ? Math.round(st.c / st.q * 100) : 0;
return `<div class="page summary">
<div class="sum-card paper-card">
<h1>${title}</h1>
${mode === 'sprint' ? `<p class="huge">${st.c}</p><p class="muted">facts right in one minute${st.c >= S.counters.sprintBest && st.c ? ' — a new record!' : ''}</p>` : `<p class="huge">${I.star}${st.stars}</p><p class="muted">stars earned</p>`}
<ul class="sum-list">
<li><b>${st.q}</b> questions · <b>${acc}%</b> right on the first try</li>
<li>Today in all: <b>${dl.q}</b> questions, <b>${Math.max(1, Math.round(dl.ms / 60000))}</b> min</li>
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
export function finish() {
stopTimer();
const st = sess.stats; bankTime();
const streakUp = !!sess.streakUp;
if (sess.mode === 'sprint') S.counters.sprintBest = Math.max(S.counters.sprintBest, st.c);
const badges = newBadges(S); save();
const mode = sess.mode; const done = dayLog(S).done && (mode === 'daily' || mode === 'extra');
const title = done ? 'Today’s page is done!' : mode === 'daily' ? 'Nice work today' : mode === 'sprint' ? 'Sprint finished!' : 'Practice done';
setSess(null);
mount(summaryHTML(mode, title, st, badges, streakUp));
if (badges.length || st.levelUp) confetti();
}
