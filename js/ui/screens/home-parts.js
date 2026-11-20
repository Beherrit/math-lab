// Pieces of the home screen: week strip, facts mini grid, skill rows, level chips.
import { S } from '../../core/store.js';
import { today, addDays } from '../../core/dates.js';
import { progress } from '../../core/mastery.js';
import { fkey } from '../../core/facts.js';
import { unlockedLevel, hasSkills, levelProgress } from '../../core/progression.js';
import { levelInfo, levelName, levelFull } from '../../levels.js';
import { visibleLevels } from '../../core/entry.js';
import { I } from '../icons.js';
export function weekStrip() {
const t = today(); const dow = (new Date().getDay() + 6) % 7; // Monday first
const names = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
let h = '<div class="week" aria-label="This week">';
for (let i = 0; i < 7; i++) {
const ds = addDays(t, i - dow); const rec = S.days[ds];
const cls = rec?.done ? 'done' : rec?.q ? 'some' : '';
h += `<div class="day ${cls} ${ds === t ? 'today' : ''}"><span class="dn">${names[i]}</span><span class="stamp">${rec?.done ? I.star : ''}</span></div>`;
}
return h + '</div>';
}
export function miniGrid() {
let h = '<div class="mini">';
for (let r = 1; r <= 12; r++) for (let c = 1; c <= 12; c++) { const bx = S.facts[fkey(r, c)]?.b; h += `<i class="m${bx === undefined ? 'x' : bx}"></i>`; }
return h + '</div>';
}
export function skillRow(s) {
const st = S.skills[s.id]; const p = progress(S, s.id);
const step = st ? (st.mastered ? 'Mastered' : `Step ${st.L}`) : 'New';
return `<button class="skill-row ${st?.mastered ? 'mastered' : ''}" data-act="skill" data-id="${s.id}">
<span class="sr-main"><span class="sr-title">${s.title}</span><span class="sr-sub">${step}</span></span>
<span class="meter" aria-label="${p}% there"><span style="width:${p}%"></span></span>
</button>`;
}
// A row of level chips. Locked levels show a lock; the current one is filled.
export function levelBar() {
const open = unlockedLevel(S); const cur = levelInfo(S.level);
const chips = visibleLevels(S).map(l => {
const locked = l.n > open;
return `<button class="lvl-chip ${l.n === 0 ? 'early' : ''} ${l.n === S.level ? 'on' : ''} ${locked ? 'locked' : ''}" ${locked ? 'disabled' : `data-act="setlevel" data-n="${l.n}"`} aria-label="${levelFull(l.n)}${locked ? ', locked' : ''}" title="${l.title}">${locked ? I.lock : l.n === 0 ? 'Early Start' : l.n}</button>`;
}).join('');
const p = levelProgress(S, S.level);
return `<div class="level-bar"><div class="lb-head"><b>${levelName(cur.n)}</b>${cur.n === 0 ? '' : `<span>${cur.title}</span>`}</div>
<div class="lvl-chips" role="group" aria-label="Levels">${chips}</div>
${p.total ? `<p class="small muted">${p.done} of ${p.total} skills mastered in this level.</p>` : ''}</div>`;
}
// Shown instead of the skill list when the current level has no skills yet.
export function emptyLevelNote() {
if (hasSkills(S.level)) return '';
return `<div class="paper-card empty-level"><p>The skills for ${levelName(S.level)} are on their way. Daily practice uses the nearest level that is ready.</p></div>`;
}
