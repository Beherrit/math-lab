// Fact lab (times table grid) and the single-table page.
import { S } from '../../core/store.js';
import * as FX from '../../core/facts.js';
import { I } from '../icons.js';
import { mount } from '../dom.js';
import { backBtn } from '../fragments.js';
export function bigGrid(clickable = true) {
let h = '<div class="grid12" role="table" aria-label="Times table grid"><span class="gh corner">×</span>';
for (let c = 1; c <= 12; c++) h += `<button class="gh" ${clickable ? `data-go="table" data-arg="${c}"` : 'tabindex="-1"'}>${c}</button>`;
for (let r = 1; r <= 12; r++) {
h += `<button class="gh" ${clickable ? `data-go="table" data-arg="${r}"` : 'tabindex="-1"'}>${r}</button>`;
for (let c = 1; c <= 12; c++) {
const bx = S.facts[FX.fkey(r, c)]?.b;
const locked = S.settings.gradual && !S.unlocked.includes(r) && !S.unlocked.includes(c);
h += `<span class="gc m${bx === undefined ? 'x' : bx} ${locked ? 'lk' : ''}" title="${r} × ${c}">${bx !== undefined && bx >= FX.SOLID ? r * c : ''}</span>`;
}
}
return h + '</div>';
}
export const LEGEND = `<div class="legend"><span><i class="mx"></i>not tried</span><span><i class="m0"></i>needs work</span><span><i class="m2"></i>getting there</span><span><i class="m4"></i>solid</span><span><i class="m5"></i>lightning fast</span></div>`;
export function renderLab() {
const next = S.settings.gradual ? FX.NEXT.find(t => !S.unlocked.includes(t)) : null;
mount(`<div class="page"><header class="top">${backBtn()}<h1>Fact lab</h1></header>
<p class="muted">Tap any number to learn the trick for that table. Solid facts show their answer.</p>
${bigGrid()}${LEGEND}
${next ? `<p class="small muted unlock-note">${I.lock} Tables unlock one at a time. Next up: ×${next}. Get most of your current facts to “getting there” to unlock it.</p>` : ''}
<div class="row2"><button class="btn primary" data-act="facts">Practice my facts</button><button class="btn" data-act="sprint">1-minute sprint</button></div>
${S.counters.sprintBest ? `<p class="small muted center">Sprint record: <b>${S.counters.sprintBest}</b> facts</p>` : ''}
</div>`);
}
export function renderTable(arg) {
const t = +arg;
const rows = Array.from({ length: 12 }, (_, i) => { const n = i + 1; const bx = S.facts[FX.fkey(t, n)]?.b; return `<div class="tf m${bx === undefined ? 'x' : bx}"><span>${t} × ${n}</span><b>${t * n}</b></div>`; }).join('');
mount(`<div class="page"><header class="top">${backBtn('lab')}<h1>The ×${t} table</h1></header>
<div class="paper-card tip"><h2>${I.bulb} The trick</h2><p>${FX.TABLE_TIPS[t]}</p></div>
<div class="tfacts">${rows}</div>
<button class="btn primary big" data-act="tablepractice" data-t="${t}">Practice ×${t}</button>
</div>`);
}
