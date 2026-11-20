// Sections of the Grown-ups screen.
import { S } from '../../core/store.js';
import { today, addDays } from '../../core/dates.js';
import { streakNow } from '../../core/daily.js';
import { solidCount } from '../../core/facts.js';
import { levelProgress, unlockedLevel } from '../../core/progression.js';
import { SKILLS, skillsOf } from '../../skills/registry.js';
import { LEVELS } from '../../levels.js';
import { fmt } from '../../util.js';
import { esc } from '../dom.js';
import { bigGrid, LEGEND } from './lab.js';
const gradeText = l => (l.grades.includes('-') ? `Grades ${l.grades}` : `Grade ${l.grades}`);
export function statsSection() {
const all = Object.values(S.days);
const totQ = all.reduce((a, d) => a + d.q, 0), totC = all.reduce((a, d) => a + d.c, 0), totMs = all.reduce((a, d) => a + d.ms, 0);
const days = Array.from({ length: 14 }, (_, i) => addDays(today(), i - 13));
const maxQ = Math.max(10, ...days.map(d => S.days[d]?.q || 0));
const bars = days.map(d => { const r = S.days[d]; const h = r ? Math.max(4, r.q / maxQ * 100) : 0; return `<div class="bar ${r?.done ? 'done' : ''}" title="${d}: ${r?.q || 0} questions, ${Math.round((r?.ms || 0) / 60000)} min"><span style="height:${h}%"></span><i>${new Date(d + 'T12:00').toLocaleDateString('en-US', { weekday: 'narrow' })}</i></div>`; }).join('');
return `<div class="stat-row"><div><b>${all.filter(d => d.done).length}</b><span>daily pages done</span></div><div><b>${streakNow(S)}</b><span>day streak</span></div><div><b>${fmt(totQ)}</b><span>questions</span></div><div><b>${totQ ? Math.round(totC / totQ * 100) : 0}%</b><span>right first try</span></div></div>
<section class="block"><h2>Last 14 days</h2>
<div class="bars">${bars}</div>
<p class="small muted">Bar height = questions answered. Filled bars = finished the daily page. Total practice time: ${Math.round(totMs / 60000)} min.</p></section>`;
}
export function levelsSection() {
const open = unlockedLevel(S);
const rows = LEVELS.map(l => {
const p = levelProgress(S, l.n); const cur = l.n === S.level;
const prog = p.total ? `${p.done} of ${p.total} skills mastered` : 'no skills yet';
return `<div class="prow lrow ${cur ? 'cur' : ''}"><div><b>Level ${l.n}: ${l.title}</b><span class="small muted">${gradeText(l)} equivalent · ${prog}${S.levelsDone.includes(l.n) ? ' · complete' : ''}</span></div>
<div>${cur ? '<span class="small">Current level</span>' : `<button class="btn sm" data-act="parentlevel" data-n="${l.n}">Set as current</button>`}</div></div>`;
}).join('');
return `<section class="block"><h2>Levels</h2>
<div class="ptable">${rows}</div>
<p class="small muted">Children see only “Level N” and its title. Levels open one at a time as the last one is finished (up to Level ${open} now); setting the current level here opens it directly.</p>
<button class="btn sm" data-act="replace">Run the starting-point check again</button></section>`;
}
export function factsSection() {
return `<section class="block"><h2>Times tables</h2>${bigGrid(false)}${LEGEND}
<p class="small muted">${solidCount(S)} of 78 facts solid (answered right and fast several times). Tables unlocked: ${S.settings.gradual ? S.unlocked.slice().sort((a, c) => a - c).map(t => '×' + t).join(', ') : 'all'}.</p></section>`;
}
function skillRows(list) {
return list.map(s => { const st = S.skills[s.id]; return `<div class="prow"><div><b>${s.title}</b><span class="small muted">${s.std}${s.school ? '' : ' · added'}</span></div><div class="small">${st?.n ? `${st.mastered ? 'Mastered' : 'Step ' + st.L} · ${Math.round(st.c / st.n * 100)}% of ${st.n}` : '<span class="muted">not started</span>'}</div><label class="switch"><input type="checkbox" data-act="toggleskill" data-id="${s.id}" ${S.settings.off[s.id] ? '' : 'checked'}><span></span></label></div>`; }).join('');
}
export function skillsSection() {
const groups = LEVELS.filter(l => skillsOf(l.n).length).map(l => `<h3 class="grp">Level ${l.n}</h3><div class="ptable">${skillRows(skillsOf(l.n))}</div>`).join('');
return `<section class="block"><h2>Skills</h2>${groups}
<p class="small muted">Switches choose which skills show up in daily practice, and which count toward finishing a level. “Added” skills are standards that weren’t on the school list. Accuracy counts first tries only.</p></section>`;
}
export function settingsSection() {
return `<section class="block settings"><h2>Settings</h2>
<label class="set"><span>Daily session length</span><select data-act="minutes">${[5, 10, 15, 20].map(m => `<option value="${m}" ${S.settings.minutes === m ? 'selected' : ''}>${m} minutes</option>`).join('')}</select></label>
<label class="set"><span>Daily focus skill</span><select data-act="focus"><option value="auto">Automatic (recommended)</option>${SKILLS.map(s => `<option value="${s.id}" ${S.settings.focus === s.id ? 'selected' : ''}>Level ${s.level}: ${s.title}</option>`).join('')}</select></label>
<label class="set"><span>Unlock times tables gradually</span><span class="switch"><input type="checkbox" data-act="gradual" ${S.settings.gradual ? 'checked' : ''}><span></span></span></label>
<label class="set"><span>Name</span><input data-act="rename" value="${esc(S.name)}" maxlength="20"></label>
<div class="set"><span>Backup</span><span class="row-btns"><button class="btn sm" data-act="export">Download backup</button><label class="btn sm">Restore<input type="file" accept="application/json" data-act="import" hidden></label></span></div>
<p class="small muted">Progress lives in this phone’s browser. Add the app to the home screen so it stays put, and download a backup now and then.</p>
<button class="btn danger sm" data-act="reset">Erase all progress</button>
</section>`;
}
