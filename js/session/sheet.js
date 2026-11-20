// Overlays and helpers on the practice screen: "Show me how", "Help me read it", the pre-question, pause/stop.
import { sess } from './state.js';
import { answerHTML } from '../util.js';
import { I } from '../ui/icons.js';
import { $, $$ } from '../ui/dom.js';
import { waysHTML } from '../ui/fragments.js';
import { fb } from './feedback.js';
import { stop as stopSpeech } from '../core/speech.js';
const showSheet = sh => { sh.hidden = false; requestAnimationFrame(() => sh.classList.add('in')); };
export function closeSheet() { const sh = $('.sheet'); if (sh && !sh.hidden) { sh.classList.remove('in'); sh.hidden = true; } }
export function openWays(afterMiss) {
const q = sess.q; const sh = $('.sheet'); if (!sh) return;
if (!afterMiss && !sess.answered) sess.assisted = true;
const next = afterMiss || sess.answered;
sh.innerHTML = `<div class="sheet-card" role="dialog" aria-label="How to solve it">
<div class="sheet-head"><h2>${afterMiss ? 'Let’s see how it works' : 'Here’s how to think about it'}</h2><button class="iconbtn" data-act="closesheet" aria-label="Close">${I.x}</button></div>
${afterMiss ? `<p class="sheet-ans">Answer: <b>${answerHTML(q.answer)}</b></p>` : ''}
<p class="small muted">${q.ways.length > 1 ? 'There’s more than one way! Tap the tabs to compare.' : ''}</p>
${waysHTML(q.ways)}
<button class="btn primary big" data-act="${next ? 'next' : 'closesheet'}">${next ? 'Next question' : 'Back to the problem'}</button>
</div>`;
showSheet(sh);
}
export function toggleRead() {
const q = sess.q; const panel = $('.read-panel'); const story = $('.story');
if (!panel.hidden) { panel.hidden = true; story?.classList.remove('reading'); return; }
story?.classList.add('reading');
panel.innerHTML = `<div class="rp"><p><b>What is it asking?</b> ${q.read.find}</p><p><b>What do we know?</b></p><ul>${q.read.know.map(x => `<li>${x}</li>`).join('')}</ul><p><b>Clue words:</b> ${q.read.clue}</p><p class="plan-line"><button class="link" data-act="plan">Show the plan</button><span class="plan" hidden><b>Plan:</b> ${q.read.plan}</span></p></div>`;
panel.hidden = false;
}
export function onPre(i) {
const q = sess.q; const ok = q.pre.options[i] === q.pre.correct;
const btns = $$('.choice'); btns.forEach(bn => bn.disabled = true);
btns[i].classList.add(ok ? 'ok' : 'nope'); if (!ok) btns[q.pre.options.indexOf(q.pre.correct)].classList.add('ok');
fb(`${ok ? `${I.check} Yes! ` : `It’s <b>${q.pre.correct}</b>. `}<span class="small">${q.pre.why}</span>`, ok ? 'good keep' : 'bad keep');
$('.pad').insertAdjacentHTML('beforeend', `<button class="btn primary big" data-act="presolve">Now solve it</button>`);
}
export function pauseOverlay(kind) {
sess.paused = true; stopSpeech();
const sh = $('.sheet'); if (!sh) return;
sh.innerHTML = `<div class="sheet-card center">${kind === 'quit' ? `<h2>Stop for now?</h2><p class="muted">Everything you’ve done is saved.${sess.mode === 'daily' ? ' Finish every part to complete today’s page.' : ''}</p>
<div class="row2"><button class="btn" data-act="resume">Keep going</button><button class="btn primary" data-act="stop">Stop</button></div>`
: `<h2>Paused</h2><p class="muted">The timer is stopped.</p><button class="btn primary big" data-act="resume">Resume</button><button class="link" data-act="stop">Stop for today</button>`}</div>`;
showSheet(sh);
}
