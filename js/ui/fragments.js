// HTML fragments shared by several screens.
import { I } from './icons.js';
export function logoSVG() {
return `<svg viewBox="0 0 96 96" class="logo"><rect x="6" y="6" width="84" height="84" rx="22" fill="var(--grape)"/><path d="M28 34h16M36 26v16M54 34h16M30 60l12 12M42 60L30 72M54 64h16M54 72h16" stroke="#fff" stroke-width="6" stroke-linecap="round"/></svg>`;
}
export const backBtn = (to = 'home') => `<button class="iconbtn" data-go="${to}" aria-label="Back">${I.back}</button>`;
export function sticker(bd, locked = false) {
if (!bd) return '';
return `<div class="sticker ${locked ? 'locked' : ''}" title="${bd.desc}"><span class="sk-ic">${locked ? I.lock : I.star}</span><span class="sk-n">${bd.name}</span></div>`;
}
export function waysHTML(ways, id = 'w') {
return `<div class="ways" data-ways="${id}">
<div class="tabs" role="tablist">${ways.map((w, i) => `<button role="tab" class="tab ${i ? '' : 'on'}" data-act="tab" data-i="${i}" aria-selected="${!i}">${w.t}</button>`).join('')}</div>
${ways.map((w, i) => `<div class="way ${i ? '' : 'on'}" data-i="${i}" role="tabpanel"><ol class="steps">${w.s.map(st => `<li>${st}</li>`).join('')}</ol></div>`).join('')}
</div>`;
}
export function problemHTML(p) {
return `${p.story ? `<p class="story">${p.story}</p>` : ''}${p.ask ? `<p class="ask">${p.ask}</p>` : ''}${p.expr ? `<div class="expr ${p.exprSmall ? 'sm' : ''}">${p.expr}</div>` : ''}${p.visual ? `<div class="visual">${p.visual}</div>` : ''}`;
}
