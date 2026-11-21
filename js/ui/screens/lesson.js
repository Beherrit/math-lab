// "Learn it" screens: the idea, watch one, do one together, your turn, done. Returns HTML; the session layer mounts it.
import { TURNS, hasAnotherWay, watchLeft, stepsLeft, recap, lessonProgress } from '../../core/lesson.js';
import { I } from '../icons.js';
import { problemHTML } from '../fragments.js';
import { hearHTML, explainHear } from '../hear.js';
const DOTS = 4;
const btn = (act, label, primary) => `<button class="btn big ${primary ? 'primary' : ''}" data-act="${act}">${label}</button>`;
function frame(skill, l, body, bar) {
const at = lessonProgress(l);
const dots = Array.from({ length: DOTS }, (_, i) => `<i class="${i < at ? 'past' : i === at ? 'now' : ''}"></i>`).join('');
return `<div class="page lesson"><header class="top lhead"><button class="iconbtn" data-act="lquit" aria-label="Close">${I.x}</button>
<div class="lt"><b>${skill.title}</b><span class="ldots" aria-hidden="true">${dots}</span></div></header>
${body}<footer class="pad lbar">${bar}</footer></div>`;
}
export function ideaScreen(skill, l) {
const w = skill.learn.words;
const body = `<div class="paper-card learn"><p class="big-idea">${skill.learn.big}</p>${explainHear(skill.learn.big, 'Hear the idea')}
<ul class="tips">${skill.learn.tips.map(t => `<li>${t}</li>`).join('')}</ul>
${w?.length ? `<dl class="words">${w.map(([a, m]) => `<div><dt>${a}</dt><dd>${m}</dd></div>`).join('')}</dl>` : ''}</div>`;
return frame(skill, l, body, btn('lnext', 'Watch one', true));
}
const stepsHTML = (steps, n) => (n ? `<ol class="steps lsteps">${steps.slice(0, n).map((s, i) => `<li class="${i === n - 1 ? 'newest' : ''}">${s}</li>`).join('')}</ol>` : '');
export function watchScreen(skill, l) {
const w = l.watch; const way = w.ways[w.wi];
const body = `<div class="paper-card lprob">${problemHTML(w.p)}</div>
<section class="lwork">${w.ways.length > 1 ? `<p class="lway">${way.t}</p>` : ''}${stepsHTML(way.s, w.shown)}</section>`;
const more = watchLeft(l) > 0;
const bar = more ? btn('lstep', 'Next step', true)
: `${hasAnotherWay(l) ? btn('lalt', 'See it another way') : ''}${btn('lnext', 'Try one together', true)}`;
return frame(skill, l, body, bar);
}
const taskLabel = l => (l.stage === 'together' ? 'Do one together' : `Your turn, ${l.turn + 1} of ${TURNS}`);
export function taskScreen(skill, l) {
const body = `<main class="lmain"><div class="qcard paper-card lprob"><p class="meta">${taskLabel(l)}</p>${problemHTML(l.task.p)}${hearHTML(l.task.p)}
<div class="ans-slot"></div><div class="fb" aria-live="polite"></div><div class="lhelp"></div></div></main>`;
return frame(skill, l, body, '');
}
// The hint, the worked steps shown so far and the buttons that ask for more. Rewritten without redrawing the input.
export function helpHTML(t) {
if (t.solved) return `<ol class="steps lsteps">${t.ways[0].s.slice(0, t.shown).map(s => `<li>${s}</li>`).join('')}</ol><p class="lwhy"><b>Why it works</b> ${recap(t)}</p>`;
const asks = `${t.hint ? '' : btn2('lhint', `${I.bulb} Show a hint`)}${stepsLeft(t) > 0 ? btn2('lhelp', 'Show the next step') : ''}`;
return `${t.hint ? `<p class="lhint">${I.bulb} ${t.p.hint}</p>` : ''}${stepsHTML(t.ways[0].s, t.shown)}${asks ? `<div class="lasks">${asks}</div>` : ''}`;
}
const btn2 = (act, label) => `<button class="btn" data-act="${act}">${label}</button>`;
export function continueBar(l) {
const last = l.stage === 'turn' && l.turn === TURNS - 1;
return btn('lnext', l.stage === 'together' ? 'Your turn' : last ? 'Finish' : 'Next one', true);
}
export function doneScreen(skill, l) {
const body = `<div class="paper-card ldone"><h1>You are ready to practice</h1><p>${skill.title}</p></div>`;
return frame(skill, l, body, `${btn('lhome', 'Back home')}${btn('lpractice', 'Start practice', true)}`);
}
