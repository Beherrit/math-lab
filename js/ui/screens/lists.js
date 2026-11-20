// Small list screens: all stickers, and pick today's focus.
import { S } from '../../core/store.js';
import { BADGES } from '../../core/badges.js';
import { getFocus } from '../../core/focus.js';
import { enabledIn, workingLevel } from '../../core/progression.js';
import { I } from '../icons.js';
import { mount } from '../dom.js';
import { backBtn, sticker } from '../fragments.js';
export function renderBadges() {
mount(`<div class="page"><header class="top">${backBtn()}<h1>Stickers</h1></header>
<div class="stickers all">${BADGES.map(bd => `<div>${sticker(bd, !S.badges.includes(bd.id))}<p class="small muted">${bd.desc}</p></div>`).join('')}</div></div>`);
}
export function renderPickFocus() {
const cur = getFocus(S);
const rows = enabledIn(S, workingLevel(S)).map(s => `<button class="skill-row ${s.id === cur ? 'sel' : ''}" data-act="setfocus" data-id="${s.id}"><span class="sr-main"><span class="sr-title">${s.title}</span><span class="sr-sub">${s.sub}</span></span>${s.id === cur ? `<span class="pick-on">${I.check}</span>` : ''}</button>`);
mount(`<div class="page"><header class="top">${backBtn()}<h1>Pick today’s focus</h1></header>
<p class="muted">The app picks one for you, but you can choose. Your pick lasts for today.</p>
<div class="skills">${rows.join('')}</div></div>`);
}
