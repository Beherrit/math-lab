// Skill page: the idea, a worked example, and practice buttons.
import { S } from '../../core/store.js';
import { SKILL, generate } from '../../skills/registry.js';
import { enabledIn } from '../../core/progression.js';
import { skillsIn } from '../../core/browse.js';
import { pathNodes } from '../../core/path.js';
import { needsOf } from '../../core/foundations.js';
import { answerHTML } from '../../util.js';
import { mount, esc } from '../dom.js';
import { backBtn, problemHTML, waysHTML } from '../fragments.js';
import { I } from '../icons.js';
export function renderSkill(id) {
const s = SKILL[id]; const st = S.skills[s.id]; const L = st?.L || 1;
const ex = generate(s.id, Math.min(L, 2)) || generate(s.id, 1);
const back = s.strand ? `<button class="iconbtn" data-go="subject" data-arg="${esc(s.strand)}" aria-label="Back">${I.back}</button>` : backBtn();
const nodes = pathNodes(S, skillsIn(enabledIn(S, s.level), s.strand || 'More'));
const locked = nodes.find(n => n.id === s.id)?.state === 'locked';
const peek = locked ? '<p class="muted">This is further along the path. You can look now. Master the one before it and it is up next.</p>' : '';
const card = s.learn.card ? `<div class="paper-card tip"><h2>${I.bulb} Why it works</h2><p>${esc(s.learn.card.why)}</p></div>` : '';
const builds = buildsHTML(s.id);
mount(`<div class="page has-bar"><header class="top">${back}<div><h1>${s.title}</h1><p class="small muted">${s.sub}</p></div></header>
${peek}
${builds}
${card}
<div class="paper-card learn">
<p class="big-idea">${s.learn.big}</p>
<ul class="tips">${s.learn.tips.map(t => `<li>${t}</li>`).join('')}</ul>
${s.learn.words?.length ? `<dl class="words">${s.learn.words.map(([w, m]) => `<div><dt>${w}</dt><dd>${m}</dd></div>`).join('')}</dl>` : ''}
</div>
<section class="block"><div class="block-head"><h2>Example</h2><button class="link" data-act="newex">Show another</button></div>
<div class="paper-card example"><div class="ex-q">${problemHTML(ex)}<p class="ex-a">Answer: <b>${answerHTML(ex.answer)}</b></p></div>${waysHTML(ex.ways, 'ex')}</div>
</section>
<button class="btn wide" data-act="setfocus" data-id="${s.id}">Make it today’s focus</button>
<p class="small muted center">${st ? `${st.mastered ? 'Mastered!' : `Step ${st.L} of 3`} · ${st.n} answered` : 'Not started yet'}. Practice goes at your own pace: no timer.</p>
<footer class="pad lbar row2"><button class="btn big" data-act="learn" data-id="${s.id}">Learn it</button><button class="btn primary big" data-act="practice" data-id="${s.id}">Practice</button></footer>
</div>`);
}
function buildsHTML(id) {
const ids = needsOf(id) || [];
if (!ids.length) return '';
const links = ids.map(n => `<li><button class="link" data-go="skill" data-arg="${esc(n)}">${esc(SKILL[n].title)}</button></li>`).join('');
return `<section class="block builds"><h2>This builds on</h2><ul>${links}</ul></section>`;
}
