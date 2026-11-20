// The practice screen: header, question card, helper buttons.
import { sess } from './state.js';
import { SKILL } from '../skills/registry.js';
import { I } from '../ui/icons.js';
import { mount, fmtTime } from '../ui/dom.js';
import { problemHTML } from '../ui/fragments.js';
import { renderInput, wirePlane } from './pad.js';
function header() {
const ph = sess.phases[sess.pi];
if (sess.mode === 'place') return `<header class="pbar"><button class="iconbtn" data-act="quit" aria-label="Stop">${I.x}</button><div class="pb-mid"><b>${ph.label}</b></div></header>`;
if (sess.mode === 'free') return `<header class="pbar"><button class="iconbtn" data-act="quit" aria-label="Done">${I.x}</button><div class="pb-mid"><b>${ph.label}</b><span class="small muted">Question ${sess.n} · ${I.star} ${sess.stats.stars}</span></div><button class="btn sm" data-act="quit">Done</button></header>`;
return `<header class="pbar"><button class="iconbtn" data-act="quit" aria-label="Stop">${I.x}</button>
<div class="track">${sess.phases.map((p, i) => `<span class="seg ${i < sess.pi ? 'full' : ''}" data-i="${i}"><span style="width:${i < sess.pi ? 100 : i === sess.pi ? Math.min(100, sess.el / p.ms * 100) : 0}%"></span></span>`).join('')}</div>
<span class="time">${fmtTime(ph.ms - sess.el)}</span><button class="iconbtn" data-act="pause" aria-label="Pause">${I.pause}</button></header>`;
}
function helpers(q) {
if (q.fact) return '';
if (sess.mode === 'place') return `<div class="helpers"><button class="chipbtn" data-act="skipq">I haven’t learned this yet</button></div>`;
return `<div class="helpers">${q.read ? `<button class="chipbtn" data-act="read">${I.eye} Help me read it</button>` : ''}<button class="chipbtn" data-act="how">${I.bulb} Show me how</button></div>`;
}
export function renderPlay() {
const q = sess.q; const ph = sess.phases[sess.pi]; const place = sess.mode === 'place';
const sLabel = q.fact || place ? '' : `<p class="meta">${SKILL[q.skill].title} · Step ${q.level}</p>`;
mount(`<div class="play ${q.fact ? 'is-fact' : ''}">
${header()}
${sess.mode !== 'free' && !place ? `<p class="phase-label">${ph.label}</p>` : ''}
<main class="qarea"><div class="qcard paper-card ${q.story ? 'has-story' : ''}">
${sLabel}
${problemHTML(q)}
<div class="read-panel" hidden></div>
<div class="ans-slot"></div>
<div class="fb" aria-live="polite"></div>
${helpers(q)}
</div></main>
<footer class="pad"></footer>
<div class="sheet" hidden></div>
</div>`);
renderInput();
if (q.answer.kind === 'point') wirePlane();
}
