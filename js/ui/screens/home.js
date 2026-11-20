// Home screen.
import { S } from '../../core/store.js';
import { today, longDate } from '../../core/dates.js';
import { getFocus } from '../../core/focus.js';
import { streakNow, phaseSplit } from '../../core/daily.js';
import { solidCount } from '../../core/facts.js';
import { enabledIn } from '../../core/progression.js';
import { BADGES } from '../../core/badges.js';
import { SKILL } from '../../skills/registry.js';
import { fmt } from '../../util.js';
import { I } from '../icons.js';
import { mount, esc } from '../dom.js';
import { sticker } from '../fragments.js';
import { weekStrip, miniGrid, skillRow, levelBar, emptyLevelNote } from './home-parts.js';
function todayCard(focus) {
const done = S.days[today()]?.done; const mins = S.settings.minutes; const sp = phaseSplit(S);
if (done) return `<h2 class="done-title">Today’s page is done ${I.check}</h2><p class="muted">Great work. Come back tomorrow to keep your streak going, or practice anything below.</p>
<button class="btn ghost" data-act="start">Do another round</button>`;
return `<h2>Today’s ${mins} minutes</h2>
<ol class="plan">
<li><b>Times tables warm-up</b><span>${Math.round(mins * sp.facts)} min</span></li>
<li><b>Focus: ${focus ? SKILL[focus].title : 'Times tables'}</b><span>${Math.round(mins * sp.focus)} min</span><button class="link" data-go="pick">change</button></li>
<li><b>Mix-up</b><span>${Math.max(1, Math.round(mins * sp.mix))} min</span></li>
</ol>
<button class="btn primary big" data-act="start">Start</button>`;
}
export function renderHome() {
const focus = getFocus(S); const solid = solidCount(S);
const skills = enabledIn(S, S.level);
mount(`<div class="page home">
<header class="hello">
<div><p class="date">${longDate()}</p><h1>Hi, ${esc(S.name)}!</h1></div>
<div class="chips"><span class="chip flame" title="Day streak">${I.flame}<b>${streakNow(S)}</b></span><span class="chip starc" title="Stars">${I.star}<b>${fmt(S.stars)}</b></span></div>
</header>
<section class="today paper-card">
${weekStrip()}
${todayCard(focus)}
</section>
<section class="block">
<div class="block-head"><h2>Times tables</h2><button class="link" data-go="lab">Fact lab</button></div>
<button class="tt-card" data-go="lab">${miniGrid()}<span class="tt-text"><b>${solid}</b> of 78 facts are solid<br><span class="muted">Tap to see tricks for each table</span></span></button>
<div class="row2"><button class="btn" data-act="facts">Practice facts</button><button class="btn" data-act="sprint">1-minute sprint</button></div>
</section>
<section class="block">
${levelBar()}
<div class="block-head"><h2>Skills</h2><span class="muted small">Tap one to learn or practice</span></div>
${emptyLevelNote()}
<div class="skills">${skills.map(skillRow).join('')}</div>
</section>
<section class="block">
<div class="block-head"><h2>Stickers</h2><button class="link" data-go="badges">See all</button></div>
<div class="stickers">${S.badges.length ? S.badges.slice(-6).map(id => sticker(BADGES.find(b2 => b2.id === id))).join('') : '<p class="muted small">Finish today’s 10 minutes to earn your first sticker.</p>'}</div>
</section>
<footer class="foot"><button class="link" data-go="parent">${I.gear} Grown-ups</button></footer>
</div>`);
}
