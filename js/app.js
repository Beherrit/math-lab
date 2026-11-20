import { SKILLS, SKILL, generate } from './skills.js';
import { check, answerHTML, num, PLANE, pick, chance, fmt } from './util.js';
import * as FX from './facts.js';
const KEY = 'mathlab.v1';
const app = document.getElementById('app');
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return dayStr(d); };
const today = () => dayStr();
function migrate(s) {
s.settings ||= {}; s.settings.minutes ??= 10; s.settings.gradual ??= true; s.settings.off ||= {}; s.settings.focus ??= 'auto';
s.facts ||= {}; s.unlocked ||= [...FX.START]; s.skills ||= {}; s.days ||= {}; s.stars ||= 0;
s.streak ||= { n: 0, last: null }; s.badges ||= []; s.focusLog ||= []; s.counters ||= { story: 0, sprintBest: 0 };
return s;
}
function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) return migrate(s); } catch (e) { } return null; }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
let S = load();
const I = {
star: '<svg viewBox="0 0 24 24" class="ic"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="currentColor"/></svg>',
flame: '<svg viewBox="0 0 24 24" class="ic"><path d="M12 2c1 4 5 6 5 11a5 5 0 01-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-4-1-6 1-9.5z" fill="currentColor"/></svg>',
x: '<svg viewBox="0 0 24 24" class="ic"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
pause: '<svg viewBox="0 0 24 24" class="ic"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor"/></svg>',
back: '<svg viewBox="0 0 24 24" class="ic"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
bulb: '<svg viewBox="0 0 24 24" class="ic"><path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0012 3z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
eye: '<svg viewBox="0 0 24 24" class="ic"><path d="M3 18c3-1 5-1 9 0s6 1 9 0M4 7h16M4 12h10" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>',
del: '<svg viewBox="0 0 24 24" class="ic"><path d="M9 6h11v12H9l-6-6z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/><path d="M12 10l4 4M16 10l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
gear: '<svg viewBox="0 0 24 24" class="ic"><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
check: '<svg viewBox="0 0 24 24" class="ic"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
lock: '<svg viewBox="0 0 24 24" class="ic"><rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" stroke-width="2.2" fill="none"/></svg>',
};
const NEED = { 1: 4, 2: 5 };
const sk = id => S.skills[id] ||= { L: 1, run: 0, miss: 0, hist: [], n: 0, c: 0, last: null, mastered: false };
function progress(id) {
const s = S.skills[id]; if (!s) return 0; if (s.mastered) return 100;
if (s.L < 3) return Math.round(((s.L - 1) + Math.min(s.run / NEED[s.L], 1) * 0.9) / 3 * 100);
const good = s.hist.slice(-8).filter(Boolean).length;
return Math.round((2 + Math.min(good / 7, 1) * 0.95) / 3 * 100);
}
function recordSkill(id, res) {
const s = sk(id); s.n++; s.last = today(); const out = {};
if (res === 'right') {
s.c++; s.run++; s.miss = 0;
if (s.L === 3) s.hist.push(true);
else if (s.run >= NEED[s.L]) { s.L++; s.run = 0; out.up = s.L; }
} else {
s.run = 0;
if (res === 'wrong') {
s.miss++; if (s.L === 3) s.hist.push(false);
if (s.miss >= 2 && s.L > 1) { s.L--; s.miss = 0; out.down = s.L; }
}
}
s.hist = s.hist.slice(-12);
if (s.L === 3 && !s.mastered) { const last = s.hist.slice(-8); if (last.length >= 8 && last.filter(Boolean).length >= 7) { s.mastered = true; out.mastered = true; } }
return out;
}
const enabled = () => SKILLS.filter(s => !S.settings.off[s.id]);
function autoFocus() {
const c = enabled().filter(s => !s.story && !S.skills[s.id]?.mastered);
if (!c.length) return 'story';
const top = c[0].id; const r = S.focusLog.slice(-3).map(x => x.id);
if (r.length === 3 && r.every(x => x === top) && c[1]) return c[1].id;
return top;
}
function getFocus() {
const f = S.settings.focus;
if (f !== 'auto' && SKILL[f] && !S.settings.off[f]) return f;
if (S.todayFocus?.d === today() && SKILL[S.todayFocus.id]) return S.todayFocus.id;
return autoFocus();
}
function logFocus(id) { const t = today(); if (S.focusLog.at(-1)?.d !== t) S.focusLog.push({ d: t, id }); S.focusLog = S.focusLog.slice(-10); }
function streakNow() { const s = S.streak; if (!s.last) return 0; return (s.last === today() || s.last === addDays(today(), -1)) ? s.n : 0; }
function dayLog() { return S.days[today()] ||= { ms: 0, q: 0, c: 0, done: false }; }
const BADGES = [
{ id: 'first', name: 'First page', desc: 'Finished a daily 10 minutes', test: () => Object.values(S.days).some(d => d.done) },
{ id: 'streak3', name: '3-day streak', desc: '3 days in a row', test: () => S.streak.n >= 3 },
{ id: 'streak7', name: 'Week warrior', desc: '7 days in a row', test: () => S.streak.n >= 7 },
{ id: 'streak14', name: 'Two weeks strong', desc: '14 days in a row', test: () => S.streak.n >= 14 },
{ id: 'streak30', name: 'Math habit', desc: '30 days in a row', test: () => S.streak.n >= 30 },
{ id: 'stars100', name: '100 stars', desc: 'Earned 100 stars', test: () => S.stars >= 100 },
{ id: 'stars500', name: '500 stars', desc: 'Earned 500 stars', test: () => S.stars >= 500 },
{ id: 'stars1000', name: 'Star collector', desc: 'Earned 1,000 stars', test: () => S.stars >= 1000 },
{ id: 'facts25', name: '25 solid facts', desc: '25 times tables you know fast', test: () => FX.solidCount(S) >= 25 },
{ id: 'facts50', name: '50 solid facts', desc: '50 times tables you know fast', test: () => FX.solidCount(S) >= 50 },
{ id: 'facts78', name: 'Times tables champ', desc: 'Every fact up to 12 × 12', test: () => FX.solidCount(S) >= 78 },
{ id: 'sprint15', name: 'Speedy', desc: '15 facts in a 1-minute sprint', test: () => S.counters.sprintBest >= 15 },
{ id: 'sprint25', name: 'Lightning', desc: '25 facts in a 1-minute sprint', test: () => S.counters.sprintBest >= 25 },
{ id: 'detective', name: 'Story detective', desc: '15 story problems right on the first try', test: () => S.counters.story >= 15 },
{ id: 'master1', name: 'First mastery', desc: 'Mastered a whole skill', test: () => Object.values(S.skills).some(s => s.mastered) },
{ id: 'master5', name: 'Five skills mastered', desc: 'Mastered 5 skills', test: () => Object.values(S.skills).filter(s => s.mastered).length >= 5 },
];
function newBadges() { const got = []; for (const bd of BADGES) if (!S.badges.includes(bd.id) && bd.test()) { S.badges.push(bd.id); got.push(bd); } return got; }
function toast(msg) {
const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = msg; document.body.appendChild(t);
requestAnimationFrame(() => t.classList.add('in'));
setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 300); }, 2400);
}
function confetti() {
if (reduceMotion) return;
const c = document.createElement('canvas'); c.className = 'confetti'; document.body.appendChild(c);
const ctx = c.getContext('2d'); const W = c.width = innerWidth * devicePixelRatio, H = c.height = innerHeight * devicePixelRatio;
const cols = ['#5b3fd6', '#ffd43b', '#16a36b', '#ff5fa2', '#2f80ed'];
const ps = Array.from({ length: 120 }, () => ({ x: W / 2 + (Math.random() - .5) * W * .3, y: H * .35, vx: (Math.random() - .5) * 18 * devicePixelRatio, vy: (-Math.random() * 16 - 6) * devicePixelRatio, s: (6 + Math.random() * 8) * devicePixelRatio, r: Math.random() * 6, c: pick(cols) }));
let f = 0;
(function loop() {
ctx.clearRect(0, 0, W, H);
for (const p of ps) { p.vy += 0.55 * devicePixelRatio; p.x += p.vx; p.y += p.vy; p.r += 0.15; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); }
if (++f < 110) requestAnimationFrame(loop); else c.remove();
})();
}
const RIGHT = ['Nice!', 'You got it!', 'Yes!', 'Great thinking!', 'Nailed it!', 'Awesome!', 'Correct!', 'Smart!', 'Way to go!'];
const fmtTime = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const longDate = () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
let view = 'home', viewArg = null;
function go(v, arg = null) { view = v; viewArg = arg; render(); window.scrollTo(0, 0); }
function render() {
if (!S) return renderWelcome();
(({ home: renderHome, lab: renderLab, table: renderTable, skill: renderSkill, parent: renderParent, pick: renderPickFocus, badges: renderBadges })[view] || renderHome)();
}
function renderWelcome() {
app.innerHTML = `<div class="page welcome">
<div class="logo-big">${logoSVG()}</div>
<h1>Math Lab</h1>
<p class="lead">Ten minutes a day. Times tables, every 5th grade skill, and help whenever you need it.</p>
<form class="name-form" data-form="name">
<label for="nm">What’s your name?</label>
<input id="nm" name="nm" autocomplete="off" maxlength="20" placeholder="Your name" required>
<button class="btn primary big" type="submit">Let’s go</button>
</form>
<p class="fine">Progress saves on this device. Grown-ups can back it up from the settings page.</p>
</div>`;
}
function logoSVG() {
return `<svg viewBox="0 0 96 96" class="logo"><rect x="6" y="6" width="84" height="84" rx="22" fill="var(--grape)"/><path d="M28 34h16M36 26v16M54 34h16M30 60l12 12M42 60L30 72M54 64h16M54 72h16" stroke="#fff" stroke-width="6" stroke-linecap="round"/></svg>`;
}
function weekStrip() {
const t = today(); const d0 = new Date(); const dow = (d0.getDay() + 6) % 7; // Monday first
const names = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
let h = '<div class="week" aria-label="This week">';
for (let i = 0; i < 7; i++) {
const ds = addDays(t, i - dow); const rec = S.days[ds];
const cls = rec?.done ? 'done' : rec?.q ? 'some' : '';
h += `<div class="day ${cls} ${ds === t ? 'today' : ''}"><span class="dn">${names[i]}</span><span class="stamp">${rec?.done ? I.star : ''}</span></div>`;
}
return h + '</div>';
}
function miniGrid() {
let h = '<div class="mini">';
for (let r = 1; r <= 12; r++) for (let c = 1; c <= 12; c++) { const bx = S.facts[FX.fkey(r, c)]?.b; h += `<i class="m${bx === undefined ? 'x' : bx}"></i>`; }
return h + '</div>';
}
function skillRow(s) {
const st = S.skills[s.id]; const p = progress(s.id);
const lvl = st ? (st.mastered ? 'Mastered' : `Level ${st.L}`) : 'New';
return `<button class="skill-row ${st?.mastered ? 'mastered' : ''}" data-act="skill" data-id="${s.id}">
<span class="sr-main"><span class="sr-title">${s.title}</span><span class="sr-sub">${s.std} · ${lvl}</span></span>
<span class="meter" aria-label="${p}% there"><span style="width:${p}%"></span></span>
</button>`;
}
function renderHome() {
const focus = getFocus(); const dl = S.days[today()]; const done = dl?.done;
const stk = streakNow(); const solid = FX.solidCount(S);
const mins = S.settings.minutes;
app.innerHTML = `<div class="page home">
<header class="hello">
<div><p class="date">${longDate()}</p><h1>Hi, ${esc(S.name)}!</h1></div>
<div class="chips"><span class="chip flame" title="Day streak">${I.flame}<b>${stk}</b></span><span class="chip starc" title="Stars">${I.star}<b>${fmt(S.stars)}</b></span></div>
</header>
<section class="today paper-card">
${weekStrip()}
${done ? `<h2 class="done-title">Today’s page is done ${I.check}</h2><p class="muted">Great work. Come back tomorrow to keep your streak going, or practice anything below.</p>
<button class="btn ghost" data-act="start">Do another round</button>`
: `<h2>Today’s ${mins} minutes</h2>
<ol class="plan">
<li><b>Times tables warm-up</b><span>${Math.round(mins * .4)} min</span></li>
<li><b>Focus: ${SKILL[focus].title}</b><span>${Math.round(mins * .4)} min</span><button class="link" data-go="pick">change</button></li>
<li><b>Mix-up</b><span>${Math.max(1, Math.round(mins * .2))} min</span></li>
</ol>
<button class="btn primary big" data-act="start">Start</button>`}
</section>
<section class="block">
<div class="block-head"><h2>Times tables</h2><button class="link" data-go="lab">Fact lab</button></div>
<button class="tt-card" data-go="lab">${miniGrid()}<span class="tt-text"><b>${solid}</b> of 78 facts are solid<br><span class="muted">Tap to see tricks for each table</span></span></button>
<div class="row2"><button class="btn" data-act="facts">Practice facts</button><button class="btn" data-act="sprint">1-minute sprint</button></div>
</section>
<section class="block">
<div class="block-head"><h2>Skills</h2><span class="muted small">Tap one to learn or practice</span></div>
<div class="skills">${enabled().map(skillRow).join('')}</div>
</section>
<section class="block">
<div class="block-head"><h2>Stickers</h2><button class="link" data-go="badges">See all</button></div>
<div class="stickers">${S.badges.length ? S.badges.slice(-6).map(id => sticker(BADGES.find(b2 => b2.id === id))).join('') : '<p class="muted small">Finish today’s 10 minutes to earn your first sticker.</p>'}</div>
</section>
<footer class="foot"><button class="link" data-go="parent">${I.gear} Grown-ups</button></footer>
</div>`;
}
function sticker(bd, locked = false) { if (!bd) return ''; return `<div class="sticker ${locked ? 'locked' : ''}" title="${bd.desc}"><span class="sk-ic">${locked ? I.lock : I.star}</span><span class="sk-n">${bd.name}</span></div>`; }
function renderBadges() {
app.innerHTML = `<div class="page"><header class="top"><button class="iconbtn" data-go="home" aria-label="Back">${I.back}</button><h1>Stickers</h1></header>
<div class="stickers all">${BADGES.map(bd => `<div>${sticker(bd, !S.badges.includes(bd.id))}<p class="small muted">${bd.desc}</p></div>`).join('')}</div></div>`;
}
function renderPickFocus() {
const cur = getFocus();
app.innerHTML = `<div class="page"><header class="top"><button class="iconbtn" data-go="home" aria-label="Back">${I.back}</button><h1>Pick today’s focus</h1></header>
<p class="muted">The app picks one for you, but you can choose. Your pick lasts for today.</p>
<div class="skills">${enabled().map(s => `<button class="skill-row ${s.id === cur ? 'sel' : ''}" data-act="setfocus" data-id="${s.id}"><span class="sr-main"><span class="sr-title">${s.title}</span><span class="sr-sub">${s.std} · ${s.sub}</span></span>${s.id === cur ? `<span class="pick-on">${I.check}</span>` : ''}</button>`).join('')}</div></div>`;
}
function bigGrid(clickable = true) {
let h = '<div class="grid12" role="table" aria-label="Times table grid"><span class="gh corner">×</span>';
for (let c = 1; c <= 12; c++) h += `<button class="gh" ${clickable ? `data-go="table" data-arg="${c}"` : 'tabindex="-1"'}>${c}</button>`;
for (let r = 1; r <= 12; r++) {
h += `<button class="gh" ${clickable ? `data-go="table" data-arg="${r}"` : 'tabindex="-1"'}>${r}</button>`;
for (let c = 1; c <= 12; c++) {
const k2 = FX.fkey(r, c); const bx = S.facts[k2]?.b;
const locked = S.settings.gradual && !S.unlocked.includes(r) && !S.unlocked.includes(c);
h += `<span class="gc m${bx === undefined ? 'x' : bx} ${locked ? 'lk' : ''}" title="${r} × ${c}">${bx !== undefined && bx >= FX.SOLID ? r * c : ''}</span>`;
}
}
return h + '</div>';
}
const LEGEND = `<div class="legend"><span><i class="mx"></i>not tried</span><span><i class="m0"></i>needs work</span><span><i class="m2"></i>getting there</span><span><i class="m4"></i>solid</span><span><i class="m5"></i>lightning fast</span></div>`;
function renderLab() {
const next = S.settings.gradual ? FX.NEXT.find(t => !S.unlocked.includes(t)) : null;
app.innerHTML = `<div class="page"><header class="top"><button class="iconbtn" data-go="home" aria-label="Back">${I.back}</button><h1>Fact lab</h1></header>
<p class="muted">Tap any number to learn the trick for that table. Solid facts show their answer.</p>
${bigGrid()}${LEGEND}
${next ? `<p class="small muted unlock-note">${I.lock} Tables unlock one at a time. Next up: ×${next}. Get most of your current facts to “getting there” to unlock it.</p>` : ''}
<div class="row2"><button class="btn primary" data-act="facts">Practice my facts</button><button class="btn" data-act="sprint">1-minute sprint</button></div>
${S.counters.sprintBest ? `<p class="small muted center">Sprint record: <b>${S.counters.sprintBest}</b> facts</p>` : ''}
</div>`;
}
function renderTable() {
const t = +viewArg;
const rows = Array.from({ length: 12 }, (_, i) => { const n = i + 1; const bx = S.facts[FX.fkey(t, n)]?.b; return `<div class="tf m${bx === undefined ? 'x' : bx}"><span>${t} × ${n}</span><b>${t * n}</b></div>`; }).join('');
app.innerHTML = `<div class="page"><header class="top"><button class="iconbtn" data-go="lab" aria-label="Back">${I.back}</button><h1>The ×${t} table</h1></header>
<div class="paper-card tip"><h2>${I.bulb} The trick</h2><p>${FX.TABLE_TIPS[t]}</p></div>
<div class="tfacts">${rows}</div>
<button class="btn primary big" data-act="tablepractice" data-t="${t}">Practice ×${t}</button>
</div>`;
}
function waysHTML(ways, id = 'w') {
return `<div class="ways" data-ways="${id}">
<div class="tabs" role="tablist">${ways.map((w, i) => `<button role="tab" class="tab ${i ? '' : 'on'}" data-act="tab" data-i="${i}" aria-selected="${!i}">${w.t}</button>`).join('')}</div>
${ways.map((w, i) => `<div class="way ${i ? '' : 'on'}" data-i="${i}" role="tabpanel"><ol class="steps">${w.s.map(st => `<li>${st}</li>`).join('')}</ol></div>`).join('')}
</div>`;
}
function problemHTML(p) {
return `${p.story ? `<p class="story">${p.story}</p>` : ''}${p.ask ? `<p class="ask">${p.ask}</p>` : ''}${p.expr ? `<div class="expr ${p.exprSmall ? 'sm' : ''}">${p.expr}</div>` : ''}${p.visual ? `<div class="visual">${p.visual}</div>` : ''}`;
}
function renderSkill() {
const s = SKILL[viewArg]; const st = S.skills[s.id]; const L = st?.L || 1;
const ex = generate(s.id, Math.min(L, 2)) || generate(s.id, 1);
app.innerHTML = `<div class="page"><header class="top"><button class="iconbtn" data-go="home" aria-label="Back">${I.back}</button><div><h1>${s.title}</h1><p class="small muted">${s.std} · ${s.sub}</p></div></header>
<div class="paper-card learn">
<p class="big-idea">${s.learn.big}</p>
<ul class="tips">${s.learn.tips.map(t => `<li>${t}</li>`).join('')}</ul>
${s.learn.words?.length ? `<dl class="words">${s.learn.words.map(([w, m]) => `<div><dt>${w}</dt><dd>${m}</dd></div>`).join('')}</dl>` : ''}
</div>
<section class="block"><div class="block-head"><h2>Example</h2><button class="link" data-act="newex">Show another</button></div>
<div class="paper-card example"><div class="ex-q">${problemHTML(ex)}<p class="ex-a">Answer: <b>${answerHTML(ex.answer)}</b></p></div>${waysHTML(ex.ways, 'ex')}</div>
</section>
<div class="row2"><button class="btn primary" data-act="practice" data-id="${s.id}">Practice</button><button class="btn" data-act="setfocus" data-id="${s.id}">Make it today’s focus</button></div>
<p class="small muted center">${st ? `${st.mastered ? 'Mastered!' : `Level ${st.L} of 3`} · ${st.n} answered` : 'Not started yet'}. Practice goes at your own pace: no timer.</p>
</div>`;
}
let parentOpen = false;
function renderParent() {
if (!parentOpen) {
app.innerHTML = `<div class="page"><header class="top"><button class="iconbtn" data-go="home" aria-label="Back">${I.back}</button><h1>Grown-ups</h1></header>
<div class="paper-card gate"><p>This area has progress reports and settings.</p><button class="btn primary big hold" data-act="hold"><span class="fill"></span><span class="lbl">Press and hold</span></button><p class="small muted">Hold for 2 seconds to open.</p></div></div>`;
return;
}
const days = Array.from({ length: 14 }, (_, i) => addDays(today(), i - 13));
const maxQ = Math.max(10, ...days.map(d => S.days[d]?.q || 0));
const totQ = Object.values(S.days).reduce((a, d) => a + d.q, 0), totC = Object.values(S.days).reduce((a, d) => a + d.c, 0);
const totMs = Object.values(S.days).reduce((a, d) => a + d.ms, 0);
const daysDone = Object.values(S.days).filter(d => d.done).length;
app.innerHTML = `<div class="page parent"><header class="top"><button class="iconbtn" data-act="closeparent" aria-label="Back">${I.back}</button><h1>Grown-ups</h1></header>
<div class="stat-row"><div><b>${daysDone}</b><span>daily pages done</span></div><div><b>${streakNow()}</b><span>day streak</span></div><div><b>${fmt(totQ)}</b><span>questions</span></div><div><b>${totQ ? Math.round(totC / totQ * 100) : 0}%</b><span>right first try</span></div></div>
<section class="block"><h2>Last 14 days</h2>
<div class="bars">${days.map(d => { const r = S.days[d]; const h = r ? Math.max(4, r.q / maxQ * 100) : 0; return `<div class="bar ${r?.done ? 'done' : ''}" title="${d}: ${r?.q || 0} questions, ${Math.round((r?.ms || 0) / 60000)} min"><span style="height:${h}%"></span><i>${new Date(d + 'T12:00').toLocaleDateString('en-US', { weekday: 'narrow' })}</i></div>`; }).join('')}</div>
<p class="small muted">Bar height = questions answered. Filled bars = finished the daily page. Total practice time: ${Math.round(totMs / 60000)} min.</p></section>
<section class="block"><h2>Times tables</h2>${bigGrid(false)}${LEGEND}
<p class="small muted">${FX.solidCount(S)} of 78 facts solid (answered right and fast several times). Tables unlocked: ${S.settings.gradual ? S.unlocked.slice().sort((a, c) => a - c).map(t => '×' + t).join(', ') : 'all'}.</p></section>
<section class="block"><h2>Skills</h2>
<div class="ptable">${SKILLS.map(s => { const st = S.skills[s.id]; return `<div class="prow"><div><b>${s.title}</b><span class="small muted">${s.std}${s.school ? '' : ' · added'}</span></div><div class="small">${st?.n ? `${st.mastered ? 'Mastered' : 'Level ' + st.L} · ${Math.round(st.c / st.n * 100)}% of ${st.n}` : '<span class="muted">not started</span>'}</div><label class="switch"><input type="checkbox" data-act="toggleskill" data-id="${s.id}" ${S.settings.off[s.id] ? '' : 'checked'}><span></span></label></div>`; }).join('')}</div>
<p class="small muted">Switches choose which skills show up in daily practice. “Added” skills are 5th grade standards that weren’t on the school list. Accuracy counts first tries only.</p></section>
<section class="block settings"><h2>Settings</h2>
<label class="set"><span>Daily session length</span><select data-act="minutes">${[5, 10, 15, 20].map(m => `<option value="${m}" ${S.settings.minutes === m ? 'selected' : ''}>${m} minutes</option>`).join('')}</select></label>
<label class="set"><span>Daily focus skill</span><select data-act="focus"><option value="auto">Automatic (recommended)</option>${SKILLS.map(s => `<option value="${s.id}" ${S.settings.focus === s.id ? 'selected' : ''}>${s.title}</option>`).join('')}</select></label>
<label class="set"><span>Unlock times tables gradually</span><span class="switch"><input type="checkbox" data-act="gradual" ${S.settings.gradual ? 'checked' : ''}><span></span></span></label>
<label class="set"><span>Name</span><input data-act="rename" value="${esc(S.name)}" maxlength="20"></label>
<div class="set"><span>Backup</span><span class="row-btns"><button class="btn sm" data-act="export">Download backup</button><label class="btn sm">Restore<input type="file" accept="application/json" data-act="import" hidden></label></span></div>
<p class="small muted">Progress lives in this phone’s browser. Add the app to the home screen so it stays put, and download a backup now and then.</p>
<button class="btn danger sm" data-act="reset">Erase all progress</button>
</section>
</div>`;
}
let sess = null, timer = null;
function newSess(mode, phases) {
return { mode, phases, pi: 0, el: 0, last: performance.now(), paused: false, stats: { q: 0, c: 0, stars: 0, ups: [], solidNew: 0, mastered: [], unlocked: [], facts: 0 }, start: Date.now(), avoid: new Set(), recentFacts: [], retry: [], n: 0 };
}
function startDaily() {
const M = S.settings.minutes * 60000; const focus = getFocus(); logFocus(focus); save();
sess = newSess('daily', [
{ type: 'facts', ms: M * 0.4, label: 'Times tables warm-up', intro: 'Answer as many as you can. Quick and correct grows your facts!' },
{ type: 'skill', skill: focus, ms: M * 0.4, label: `Focus: ${SKILL[focus].title}`, intro: SKILL[focus].learn.big },
{ type: 'mix', ms: M * 0.2, label: 'Mix-up', intro: 'A little of everything you’ve practiced, plus story problems.' },
]);
phaseIntro();
}
function startFree(type, arg) {
if (type === 'skill') sess = newSess('free', [{ type: 'skill', skill: arg, ms: Infinity, label: SKILL[arg].title }]);
if (type === 'facts') sess = newSess('free', [{ type: 'facts', ms: Infinity, label: 'Times tables' }]);
if (type === 'table') sess = newSess('free', [{ type: 'facts', table: +arg, ms: Infinity, label: `The ×${arg} table` }]);
if (type === 'sprint') sess = newSess('sprint', [{ type: 'facts', ms: 60000, label: '1-minute sprint', hard: true }]);
if (type === 'sprint') return phaseIntro();
playPhase();
}
function phaseIntro() {
stopTimer();
const ph = sess.phases[sess.pi];
const stepTxt = sess.mode === 'daily' ? `Part ${sess.pi + 1} of 3` : '';
app.innerHTML = `<div class="page intro"><header class="top"><button class="iconbtn" data-act="quit" aria-label="Stop">${I.x}</button></header>
<div class="intro-card paper-card">${stepTxt ? `<p class="small muted">${stepTxt}</p>` : ''}<h1>${ph.label}</h1><p>${ph.intro || 'Answer as many as you can in one minute!'}</p>
${sess.pi > 0 ? `<p class="so-far">${I.star} ${sess.stats.stars} stars so far</p>` : ''}
<button class="btn primary big" data-act="phasego">Go</button></div></div>`;
}
function playPhase() { sess.last = performance.now(); nextQuestion(); startTimer(); }
function startTimer() { stopTimer(); sess.last = performance.now(); timer = setInterval(tick, 250); }
function stopTimer() { if (timer) clearInterval(timer); timer = null; }
function tick() {
if (!sess) return stopTimer();
const now = performance.now();
if (!sess.paused && !document.hidden) sess.el += now - sess.last;
sess.last = now;
const ph = sess.phases[sess.pi];
if (ph.ms !== Infinity) {
const left = ph.ms - sess.el;
const t = $('.time'); if (t) t.textContent = fmtTime(left);
const f = $(`.seg[data-i="${sess.pi}"] span`); if (f) f.style.width = Math.min(100, sess.el / ph.ms * 100) + '%';
if (left <= 0 && !sess.phaseDone) { sess.phaseDone = true; if (ph.hard) { sess.locked = true; setTimeout(endPhase, 300); } else { const t2 = $('.time'); if (t2) t2.textContent = 'Last one!'; } }
}
}
function endPhase() {
sess.q = null; sess.el = 0; sess.phaseDone = false; sess.locked = false;
if (sess.pi < sess.phases.length - 1) { sess.pi++; phaseIntro(); }
else finish(true);
}
function mixSkill() {
const practiced = enabled().filter(s => !s.story && S.skills[s.id]?.n && s.id !== sess.phases[1]?.skill);
const r = Math.random();
if (r < 0.15) return 'facts';
if (r < 0.4 && !S.settings.off.story) return 'story';
if (practiced.length) return pick(practiced).id;
return S.settings.off.story ? sess.phases[1].skill : 'story';
}
function makeFactProblem(table) {
const key = FX.pickFact(S, sess.recentFacts, table, sess.retry.filter(r => r.at <= sess.n).length ? [sess.retry.splice(sess.retry.findIndex(r => r.at <= sess.n), 1)[0].key] : []);
sess.recentFacts.push(key); sess.recentFacts = sess.recentFacts.slice(-4);
const f = FX.makeFact(S, key, table);
const p = f.a * f.c;
return { ...f, ask: f.missing ? 'What’s the missing number?' : '', expr: f.missing ? `${f.a} × <span class="blank">?</span> = ${p}` : `${f.a} × ${f.c}`, answer: num(f.missing ? f.c : p), ways: FX.factWays(f.a, f.c, f.missing), hint: FX.strategy(f.a, f.c) };
}
let inp = {};
function nextQuestion() {
const ph = sess.phases[sess.pi];
if (sess.phaseDone && sess.mode !== 'free') return endPhase();
let q;
const type = ph.type === 'mix' ? mixSkill() : ph.type;
if (type === 'facts') q = makeFactProblem(ph.table);
else { const id = type === 'skill' ? ph.skill : type; q = generate(id, sk(id).L, sess.avoid); }
if (!q) q = makeFactProblem();
sess.avoid.add(q.key || q.expr); if (sess.avoid.size > 40) sess.avoid = new Set([...sess.avoid].slice(-30));
sess.q = q; sess.tries = 0; sess.assisted = false; sess.preDone = !q.pre; sess.answered = false; sess.qStart = performance.now(); sess.n++;
sess.wrongChoices = new Set();
inp = { val: '', w: '', n: '', d: '', f: 'n', pt: null, choice: null };
renderPlay();
}
function header() {
const ph = sess.phases[sess.pi];
if (sess.mode === 'free') return `<header class="pbar"><button class="iconbtn" data-act="quit" aria-label="Done">${I.x}</button><div class="pb-mid"><b>${ph.label}</b><span class="small muted">Question ${sess.n} · ${I.star} ${sess.stats.stars}</span></div><button class="btn sm" data-act="quit">Done</button></header>`;
return `<header class="pbar"><button class="iconbtn" data-act="quit" aria-label="Stop">${I.x}</button>
<div class="track">${sess.phases.map((p, i) => `<span class="seg ${i < sess.pi ? 'full' : ''}" data-i="${i}"><span style="width:${i < sess.pi ? 100 : i === sess.pi ? Math.min(100, sess.el / p.ms * 100) : 0}%"></span></span>`).join('')}</div>
<span class="time">${fmtTime(ph.ms - sess.el)}</span><button class="iconbtn" data-act="pause" aria-label="Pause">${I.pause}</button></header>`;
}
function renderPlay() {
const q = sess.q; const ph = sess.phases[sess.pi];
const sLabel = q.fact ? '' : `<p class="meta">${SKILL[q.skill].std} · ${SKILL[q.skill].title} · Level ${q.level}</p>`;
app.innerHTML = `<div class="play ${q.fact ? 'is-fact' : ''}">
${header()}
${sess.mode !== 'free' ? `<p class="phase-label">${ph.label}</p>` : ''}
<main class="qarea"><div class="qcard paper-card ${q.story ? 'has-story' : ''}">
${sLabel}
${problemHTML(q)}
<div class="read-panel" hidden></div>
<div class="ans-slot"></div>
<div class="fb" aria-live="polite"></div>
${q.fact ? '' : `<div class="helpers">${q.read ? `<button class="chipbtn" data-act="read">${I.eye} Help me read it</button>` : ''}<button class="chipbtn" data-act="how">${I.bulb} Show me how</button></div>`}
</div></main>
<footer class="pad"></footer>
<div class="sheet" hidden></div>
</div>`;
renderInput();
if (q.answer.kind === 'point') wirePlane();
}
const inputKind = () => sess.preDone ? (sess.q.answer.kind === 'frac' ? 'frac' : sess.q.answer.kind) : 'pre';
function renderInput() {
const q = sess.q; const slot = $('.ans-slot'), pad = $('.pad'); const k2 = inputKind();
if (k2 === 'pre') {
slot.innerHTML = `<p class="pre-q">${q.pre.q}</p>`;
pad.innerHTML = `<div class="choices two">${q.pre.options.map((o, i) => `<button class="choice" data-act="pre" data-i="${i}">${o}</button>`).join('')}</div>`;
return;
}
if (k2 === 'num') {
slot.innerHTML = `<div class="ans num ${inp.val ? '' : 'empty'}"><span class="val">${inp.val || '?'}</span>${q.suffix ? `<span class="suffix">${q.suffix}</span>` : ''}</div>`;
if (!$('.keypad', pad)) pad.innerHTML = keypad(false);
} else if (k2 === 'frac') {
const box = f => `<button class="box ${f} ${inp.f === f ? 'on' : ''} ${inp[f] ? '' : 'empty'}" data-act="field" data-f="${f}" aria-label="${{ w: 'whole number', n: 'top', d: 'bottom' }[f]}">${inp[f] || (f === 'w' ? '' : '')}</button>`;
slot.innerHTML = `<div class="ans frac">${box('w')}<div class="fstack">${box('n')}<span class="fline"></span>${box('d')}</div>${q.suffix ? `<span class="suffix">${q.suffix}</span>` : ''}</div><p class="frac-help">Tap a box to fill it. Use the big box only for a whole number.</p>`;
if (!$('.keypad', pad)) pad.innerHTML = keypad(true);
} else if (k2 === 'choice') {
const opts = q.answer.options; const long = opts.some(o => String(o).replace(/<[^>]+>/g, '').length > 16);
pad.innerHTML = `<div class="choices ${q.choiceBig ? 'big' : long ? 'one' : 'two'}">${opts.map((o, i) => `<button class="choice ${sess.wrongChoices.has(i) ? 'nope' : ''}" data-act="choice" data-i="${i}" ${sess.wrongChoices.has(i) ? 'disabled' : ''}>${o}</button>`).join('')}</div>`;
slot.innerHTML = '';
} else if (k2 === 'point') {
slot.innerHTML = `<div class="ans pt ${inp.pt ? '' : 'empty'}">${inp.pt ? `(${inp.pt.x}, ${inp.pt.y})` : 'Tap the grid'}</div>`;
pad.innerHTML = `<button class="btn primary big" data-act="submit">Check</button>`;
}
}
function keypad(frac) {
const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', frac ? 'next' : '.', '0', 'del'];
return `<div class="keypad">${keys.map(k2 => `<button class="key ${k2.length > 1 ? 'fn' : ''}" data-act="key" data-k="${k2}" aria-label="${k2 === 'del' ? 'Delete' : k2 === 'next' ? 'Next box' : k2}">${k2 === 'del' ? I.del : k2 === 'next' ? 'Next box' : k2}</button>`).join('')}<button class="key check" data-act="submit">Check</button></div>`;
}
function pressKey(k2) {
if (sess.answered || sess.locked) return;
const kind = inputKind();
if (kind === 'num') {
if (k2 === 'del') inp.val = inp.val.slice(0, -1);
else if (k2 === '.') { if (!inp.val.includes('.') && inp.val.length < 10) inp.val = (inp.val || '0') + '.'; }
else if (/\d/.test(k2) && inp.val.replace('.', '').length < 9) inp.val = inp.val === '0' ? k2 : inp.val + k2;
} else if (kind === 'frac') {
if (k2 === 'next') inp.f = { n: 'd', d: 'w', w: 'n' }[inp.f];
else if (k2 === 'del') inp[inp.f] = inp[inp.f].slice(0, -1);
else if (/\d/.test(k2) && inp[inp.f].length < 4) inp[inp.f] = inp[inp.f] === '0' ? k2 : inp[inp.f] + k2;
}
clearFb(); renderInput();
}
const currentInput = () => { const k2 = inputKind(); return k2 === 'num' ? inp.val : k2 === 'frac' ? { w: inp.w, n: inp.n, d: inp.d } : k2 === 'choice' ? inp.choice : inp.pt; };
function fb(html, cls) { const e = $('.fb'); if (e) { e.className = 'fb ' + cls; e.innerHTML = html; } }
function clearFb() { const e = $('.fb'); if (e && !e.classList.contains('keep')) { e.className = 'fb'; e.innerHTML = ''; } }
function submit() {
if (!sess || sess.answered || sess.locked) return;
const q = sess.q; const r = check(q.answer, currentInput());
if (r.empty) { fb(r.msg, 'warn'); return; }
if (r.ok) onRight(r.note); else onWrong();
}
function onRight(note) {
const q = sess.q; const ms = performance.now() - sess.qStart;
const first = sess.tries === 0 && !sess.assisted;
sess.answered = true; sess.stats.q++; const dl = dayLog(); dl.q++;
if (first) { sess.stats.c++; sess.stats.stars++; S.stars++; dl.c++; }
if (q.fact) {
sess.stats.facts++;
const before = S.facts[q.key]?.b || 0; FX.recordFact(S, q.key, first, ms, q.missing);
if (before < FX.SOLID && S.facts[q.key].b >= FX.SOLID) sess.stats.solidNew++;
const u = FX.tryUnlock(S); if (u) { sess.stats.unlocked.push(u); toast(`New table unlocked: ×${u}!`); }
} else {
const res = recordSkill(q.skill, first ? 'right' : 'half'); levelNews(res, q.skill);
if (q.skill === 'story' && first) S.counters.story++;
}
save();
$('.qcard')?.classList.add('right');
const ans = $('.ans'); ans?.classList.add('ok');
if (q.answer.kind === 'choice') $$('.choice')[q.answer.correct]?.classList.add('ok');
if (q.answer.kind === 'point') drawPoint(inp.pt, 'ok');
fb(`${I.check} ${pick(RIGHT)}${first ? ` <span class="plus">+1 ${I.star}</span>` : ''}${note ? `<br><span class="small">${note}</span>` : ''}`, 'good' + (note ? ' keep' : ''));
if (q.fact) setTimeout(advance, 650);
else { $('.pad').innerHTML = `<button class="btn primary big" data-act="next">Next</button>`; if (!note && !q.story) setTimeout(() => { if (sess?.q === q && !$('.sheet:not([hidden])')) advance(); }, 1300); }
}
function onWrong() {
const q = sess.q; sess.tries++;
const qc = $('.qcard'); qc?.classList.remove('shake'); void qc?.offsetWidth; qc?.classList.add('shake');
if (q.fact) {
sess.answered = true; sess.stats.q++; dayLog().q++;
FX.recordFact(S, q.key, false, 9999, q.missing); save();
sess.retry.push({ key: q.key, at: sess.n + 3 });
$('.ans')?.classList.add('no');
fb(`<div class="reveal"><span class="big-ans">${q.missing ? `${q.a} × <b>${q.c}</b> = ${q.a * q.c}` : `${q.a} × ${q.c} = <b>${q.a * q.c}</b>`}</span><span class="small">${q.hint}</span></div>`, 'bad keep');
$('.pad').innerHTML = `<button class="btn primary big" data-act="next">Got it</button>`;
return;
}
if (q.answer.kind === 'choice') { sess.wrongChoices.add(inp.choice); inp.choice = null; }
if (sess.tries === 1) {
$('.ans')?.classList.add('no');
fb(`Not quite. Try again!<br><span class="small">${I.bulb} ${q.hint}</span>`, 'bad');
if (q.answer.kind === 'num') inp.val = ''; if (q.answer.kind === 'frac') { inp.w = ''; inp.n = ''; inp.d = ''; inp.f = 'n'; }
if (q.answer.kind === 'point') { inp.pt = null; drawPoint(null); }
renderInput(); return;
}
sess.answered = true; sess.stats.q++; dayLog().q++;
const res = recordSkill(q.skill, 'wrong'); levelNews(res, q.skill); save();
fb(`The answer is <b>${answerHTML(q.answer)}</b>.`, 'bad keep');
if (q.answer.kind === 'choice') $$('.choice')[q.answer.correct]?.classList.add('ok');
if (q.answer.kind === 'point') drawPoint({ x: q.answer.x, y: q.answer.y }, 'ok');
$('.pad').innerHTML = `<button class="btn primary big" data-act="next">Next</button>`;
openWays(true);
}
function levelNews(res, id) {
if (res.up) { sess.stats.ups.push(id); toast(`${I.star} Level up! ${SKILL[id].title} is now level ${res.up}`); }
if (res.mastered) { sess.stats.mastered.push(id); toast(`${I.star} You mastered ${SKILL[id].title}!`); confetti(); }
}
function advance() { if (!sess || !sess.q || !$('.play')) return; closeSheet(); if (sess.locked) return; nextQuestion(); }
function openWays(afterMiss) {
const q = sess.q; const sh = $('.sheet'); if (!sh) return;
if (!afterMiss && !sess.answered) sess.assisted = true;
sh.innerHTML = `<div class="sheet-card" role="dialog" aria-label="How to solve it">
<div class="sheet-head"><h2>${afterMiss ? 'Let’s see how it works' : 'Here’s how to think about it'}</h2><button class="iconbtn" data-act="closesheet" aria-label="Close">${I.x}</button></div>
${afterMiss ? `<p class="sheet-ans">Answer: <b>${answerHTML(q.answer)}</b></p>` : ''}
<p class="small muted">${q.ways.length > 1 ? 'There’s more than one way! Tap the tabs to compare.' : ''}</p>
${waysHTML(q.ways)}
<button class="btn primary big" data-act="${afterMiss || sess.answered ? 'next' : 'closesheet'}">${afterMiss || sess.answered ? 'Next question' : 'Back to the problem'}</button>
</div>`;
sh.hidden = false; requestAnimationFrame(() => sh.classList.add('in'));
}
function closeSheet() { const sh = $('.sheet'); if (sh && !sh.hidden) { sh.classList.remove('in'); sh.hidden = true; } }
function toggleRead() {
const q = sess.q; const panel = $('.read-panel'); const story = $('.story');
if (!panel.hidden) { panel.hidden = true; story?.classList.remove('reading'); return; }
story?.classList.add('reading');
panel.innerHTML = `<div class="rp"><p><b>What is it asking?</b> ${q.read.find}</p><p><b>What do we know?</b></p><ul>${q.read.know.map(x => `<li>${x}</li>`).join('')}</ul><p><b>Clue words:</b> ${q.read.clue}</p><p class="plan-line"><button class="link" data-act="plan">Show the plan</button><span class="plan" hidden><b>Plan:</b> ${q.read.plan}</span></p></div>`;
panel.hidden = false;
}
function onPre(i) {
const q = sess.q; const pick2 = q.pre.options[i]; const ok = pick2 === q.pre.correct;
const btns = $$('.choice'); btns.forEach(bn => bn.disabled = true);
btns[i].classList.add(ok ? 'ok' : 'nope'); if (!ok) btns[q.pre.options.indexOf(q.pre.correct)].classList.add('ok');
fb(`${ok ? `${I.check} Yes! ` : `It’s <b>${q.pre.correct}</b>. `}<span class="small">${q.pre.why}</span>`, ok ? 'good keep' : 'bad keep');
$('.pad').insertAdjacentHTML('beforeend', `<button class="btn primary big" data-act="presolve">Now solve it</button>`);
}
function wirePlane() {
const svg = $('svg.plane.tap'); if (!svg) return;
svg.addEventListener('pointerdown', e => {
if (sess.answered) return;
const r = svg.getBoundingClientRect(); const sc = PLANE.W / r.width; const max = +svg.dataset.max;
const u = (PLANE.W - PLANE.m - 14) / max;
const x = Math.round(((e.clientX - r.left) * sc - PLANE.m) / u), y = Math.round((PLANE.W - PLANE.m - (e.clientY - r.top) * sc) / u);
if (x < 0 || y < 0 || x > max || y > max) return;
inp.pt = { x, y }; drawPoint(inp.pt); clearFb(); renderInput();
});
}
function drawPoint(pt, cls = '') {
const g = $('svg.plane .cursor'); if (!g) return; if (!pt) { g.innerHTML = ''; return; }
const svg = g.closest('svg'); const max = +svg.dataset.max; const u = (PLANE.W - PLANE.m - 14) / max;
const X = PLANE.m + pt.x * u, Y = PLANE.W - PLANE.m - pt.y * u;
g.innerHTML = `<line x1="${PLANE.m}" y1="${Y}" x2="${X}" y2="${Y}" class="guide"/><line x1="${X}" y1="${PLANE.W - PLANE.m}" x2="${X}" y2="${Y}" class="guide"/><circle cx="${X}" cy="${Y}" r="9" class="mine ${cls}"/>`;
}
function pauseOverlay(kind) {
sess.paused = true;
const sh = $('.sheet'); if (!sh) return;
sh.innerHTML = `<div class="sheet-card center">${kind === 'quit' ? `<h2>Stop for now?</h2><p class="muted">Everything you’ve done is saved.${sess.mode === 'daily' ? ' Finish all 3 parts to complete today’s page.' : ''}</p>
<div class="row2"><button class="btn" data-act="resume">Keep going</button><button class="btn primary" data-act="stop">Stop</button></div>`
: `<h2>Paused</h2><p class="muted">The timer is stopped.</p><button class="btn primary big" data-act="resume">Resume</button><button class="link" data-act="stop">Stop for today</button>`}</div>`;
sh.hidden = false; requestAnimationFrame(() => sh.classList.add('in'));
}
function finish(complete) {
stopTimer();
const st = sess.stats; const dl = dayLog(); dl.ms += Math.min(Date.now() - sess.start, 60 * 60000);
let streakUp = false;
if (sess.mode === 'daily' && complete) {
if (!dl.done) { dl.done = true; const s = S.streak; if (s.last !== today()) { s.n = s.last === addDays(today(), -1) ? s.n + 1 : 1; s.last = today(); streakUp = true; } }
}
if (sess.mode === 'sprint') S.counters.sprintBest = Math.max(S.counters.sprintBest, st.c);
const badges = newBadges(); save();
const acc = st.q ? Math.round(st.c / st.q * 100) : 0;
const title = sess.mode === 'daily' ? (complete ? 'Today’s page is done!' : 'Nice work today') : sess.mode === 'sprint' ? 'Sprint finished!' : 'Practice done';
const mode = sess.mode; sess = null;
app.innerHTML = `<div class="page summary">
<div class="sum-card paper-card">
<h1>${title}</h1>
${mode === 'sprint' ? `<p class="huge">${st.c}</p><p class="muted">facts right in one minute${st.c >= S.counters.sprintBest && st.c ? ' — a new record!' : ''}</p>` : `<p class="huge">${I.star}${st.stars}</p><p class="muted">stars earned</p>`}
<ul class="sum-list">
<li><b>${st.q}</b> questions · <b>${acc}%</b> right on the first try</li>
${st.solidNew ? `<li><b>${st.solidNew}</b> new solid times-table fact${st.solidNew > 1 ? 's' : ''}</li>` : ''}
${st.unlocked.map(u => `<li>Unlocked the <b>×${u}</b> table</li>`).join('')}
${[...new Set(st.ups)].map(id => `<li>Leveled up in <b>${SKILL[id].title}</b></li>`).join('')}
${st.mastered.map(id => `<li>Mastered <b>${SKILL[id].title}</b>!</li>`).join('')}
${streakUp ? `<li>${I.flame} <b>${S.streak.n}-day</b> streak</li>` : ''}
</ul>
${badges.length ? `<div class="new-stickers"><p><b>New sticker${badges.length > 1 ? 's' : ''}!</b></p><div class="stickers">${badges.map(bd => sticker(bd)).join('')}</div></div>` : ''}
<button class="btn primary big" data-go="home">Back home</button>
</div></div>`;
if ((complete && mode === 'daily') || badges.length) confetti();
}
app.addEventListener('click', e => {
const el = e.target.closest('[data-act],[data-go]'); if (!el) return;
if (el.dataset.go) { if (el.dataset.go === 'parent' && view !== 'parent') parentOpen = false; return go(el.dataset.go, el.dataset.arg ?? null); }
const a = el.dataset.act;
switch (a) {
case 'start': return startDaily();
case 'facts': return startFree('facts');
case 'sprint': return startFree('sprint');
case 'tablepractice': return startFree('table', el.dataset.t);
case 'practice': return startFree('skill', el.dataset.id);
case 'skill': return go('skill', el.dataset.id);
case 'setfocus': S.todayFocus = { d: today(), id: el.dataset.id }; save(); toast(`Today’s focus: ${SKILL[el.dataset.id].title}`); return go('home');
case 'newex': return renderSkill();
case 'tab': { const wrap = el.closest('.ways'); $$('.tab', wrap).forEach(t => { t.classList.toggle('on', t === el); t.setAttribute('aria-selected', t === el); }); $$('.way', wrap).forEach(w => w.classList.toggle('on', w.dataset.i === el.dataset.i)); return; }
case 'phasego': return playPhase();
case 'key': return pressKey(el.dataset.k);
case 'field': inp.f = el.dataset.f; return renderInput();
case 'choice': if (sess.answered) return; inp.choice = +el.dataset.i; return submit();
case 'pre': return onPre(+el.dataset.i);
case 'presolve': sess.preDone = true; clearFb(); $('.fb').className = 'fb'; $('.fb').innerHTML = ''; $('.pad').innerHTML = ''; renderInput(); return;
case 'submit': return submit();
case 'next': return advance();
case 'how': return openWays(false);
case 'read': return toggleRead();
case 'plan': el.hidden = true; el.nextElementSibling.hidden = false; return;
case 'closesheet': return closeSheet();
case 'pause': return pauseOverlay('pause');
case 'quit': if (sess.mode === 'free') return finish(false); return pauseOverlay('quit');
case 'resume': sess.paused = false; sess.last = performance.now(); return closeSheet();
case 'stop': return finish(false);
case 'closeparent': parentOpen = false; return go('home');
case 'export': { const blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }); const u = URL.createObjectURL(blob); const l = document.createElement('a'); l.href = u; l.download = `math-lab-${S.name}-${today()}.json`; l.click(); setTimeout(() => URL.revokeObjectURL(u), 1000); return; }
case 'reset': if (confirm(`Erase all of ${S.name}’s progress? This can’t be undone.`)) { localStorage.removeItem(KEY); S = null; parentOpen = false; render(); } return;
}
});
app.addEventListener('change', e => {
const el = e.target; const a = el.dataset.act; if (!a) return;
if (a === 'toggleskill') { if (el.checked) delete S.settings.off[el.dataset.id]; else S.settings.off[el.dataset.id] = true; }
if (a === 'minutes') S.settings.minutes = +el.value;
if (a === 'focus') S.settings.focus = el.value;
if (a === 'gradual') S.settings.gradual = el.checked;
if (a === 'rename') S.name = el.value.trim() || S.name;
if (a === 'import' && el.files[0]) { el.files[0].text().then(t => { try { const d = JSON.parse(t); if (d.v !== 1) throw 0; S = migrate(d); save(); toast('Progress restored'); renderParent(); } catch (er) { toast('That file isn’t a Math Lab backup.'); } }); return; }
save(); if (a !== 'rename') renderParent();
});
app.addEventListener('submit', e => {
e.preventDefault(); const f = e.target; if (f.dataset.form === 'name') { const n = f.nm.value.trim(); if (!n) return; S = migrate({ v: 1, name: n, created: today() }); save(); go('home'); }
});
let holdT = null;
app.addEventListener('pointerdown', e => { const h = e.target.closest('[data-act="hold"]'); if (!h) return; h.classList.add('holding'); holdT = setTimeout(() => { parentOpen = true; renderParent(); }, 2000); });
['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => app.addEventListener(ev, () => { clearTimeout(holdT); $('.hold')?.classList.remove('holding'); }));
document.addEventListener('keydown', e => {
if (!sess || !sess.q || e.target.matches('input,select,textarea')) return;
if ($('.sheet:not([hidden])')) { if (e.key === 'Escape') closeSheet(); return; }
if (e.key === 'Enter') { e.preventDefault(); if (sess.answered) return advance(); return submit(); }
if (/^\d$/.test(e.key)) return pressKey(e.key);
if (e.key === '.') return pressKey(inputKind() === 'frac' ? 'next' : '.');
if (e.key === 'Backspace') return pressKey('del');
if (e.key === 'Tab' && inputKind() === 'frac') { e.preventDefault(); return pressKey('next'); }
});
document.addEventListener('visibilitychange', () => { if (sess) sess.last = performance.now(); });
render();
if (/[?&]debug\b/.test(location.search)) window.__ml = {
show(id, L) { startFree('skill', id); sess.q = null; const q = generate(id, L); sess.q = q; sess.tries = 0; sess.preDone = !q.pre; sess.answered = false; sess.qStart = performance.now(); sess.wrongChoices = new Set(); inp = { val: '', w: '', n: '', d: '', f: 'n', pt: null, choice: null }; renderPlay(); return q; },
sess: () => sess, state: () => S,
};
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('/sw.js').catch(() => { });
