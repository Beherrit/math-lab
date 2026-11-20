// Skill page: the idea, a worked example, and practice buttons.
import { S } from '../../core/store.js';
import { SKILL, generate } from '../../skills/registry.js';
import { answerHTML } from '../../util.js';
import { mount } from '../dom.js';
import { backBtn, problemHTML, waysHTML } from '../fragments.js';
export function renderSkill(id) {
const s = SKILL[id]; const st = S.skills[s.id]; const L = st?.L || 1;
const ex = generate(s.id, Math.min(L, 2)) || generate(s.id, 1);
mount(`<div class="page has-bar"><header class="top">${backBtn()}<div><h1>${s.title}</h1><p class="small muted">${s.sub}</p></div></header>
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
