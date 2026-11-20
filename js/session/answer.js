// Checking an answer and what happens next: stars, mastery, level-up, retries.
import { S, save } from '../core/store.js';
import * as FX from '../core/facts.js';
import { recordSkill } from '../core/mastery.js';
import { dayLog } from '../core/daily.js';
import { checkLevelUp } from '../core/progression.js';
import { SKILL } from '../skills/registry.js';
import { levelInfo } from '../levels.js';
import { check, answerHTML, pick } from '../util.js';
import { I } from '../ui/icons.js';
import { $, $$ } from '../ui/dom.js';
import { sess, inp } from './state.js';
import { toast, confetti, fb, RIGHT } from './feedback.js';
import { currentInput } from './input.js';
import { renderInput, drawPoint } from './pad.js';
import { openWays } from './sheet.js';
import { advance } from './flow.js';
import { recordPlacement } from './placement-run.js';
export function submit() {
if (!sess || sess.answered || sess.locked) return;
const r = check(sess.q.answer, currentInput());
if (r.empty) { fb(r.msg, 'warn'); return; }
if (sess.mode === 'place') return r.ok ? placeRight() : placeWrong();
if (r.ok) onRight(r.note); else onWrong();
}
function markCorrect(q) {
$('.qcard')?.classList.add('right');
$('.ans')?.classList.add('ok');
if (q.answer.kind === 'choice') $$('.choice')[q.answer.correct]?.classList.add('ok');
if (q.answer.kind === 'point') drawPoint(inp.pt, 'ok');
}
function nextButton(label = 'Next') { $('.pad').innerHTML = `<button class="btn primary big" data-act="next">${label}</button>`; }
// Placement answers never touch stars, mastery or the day log.
function placeRight() {
const q = sess.q; sess.answered = true; recordPlacement(true);
markCorrect(q); fb(`${I.check} Thanks!`, 'good'); nextButton();
setTimeout(() => { if (sess?.q === q) advance(); }, 1000);
}
function placeWrong() {
const q = sess.q; sess.answered = true; recordPlacement(false);
fb(`The answer is <b>${answerHTML(q.answer)}</b>. That one comes later.`, 'soft keep'); nextButton();
}
export function skipQuestion() { if (!sess || sess.answered) return; sess.answered = true; recordPlacement(false); advance(); }
function onRight(note) {
const q = sess.q; const ms = performance.now() - sess.qStart;
const first = sess.tries === 0 && !sess.assisted;
sess.answered = true; sess.stats.q++; const dl = dayLog(S); dl.q++;
if (first) { sess.stats.c++; sess.stats.stars++; S.stars++; dl.c++; }
if (q.fact) {
sess.stats.facts++;
const before = S.facts[q.key]?.b || 0; FX.recordFact(S, q.key, first, ms, q.missing);
if (before < FX.SOLID && S.facts[q.key].b >= FX.SOLID) sess.stats.solidNew++;
const u = FX.tryUnlock(S); if (u) { sess.stats.unlocked.push(u); toast(`New table unlocked: ×${u}!`); }
} else {
levelNews(recordSkill(S, q.skill, first ? 'right' : 'half'), q.skill);
if (SKILL[q.skill].story && first) S.counters.story++;
}
save();
markCorrect(q);
fb(`${I.check} ${pick(RIGHT)}${first ? ` <span class="plus">+1 ${I.star}</span>` : ''}${note ? `<br><span class="small">${note}</span>` : ''}`, 'good' + (note ? ' keep' : ''));
if (q.fact) setTimeout(advance, 650);
else { nextButton(); if (!note && !q.story) setTimeout(() => { if (sess?.q === q && !$('.sheet:not([hidden])')) advance(); }, 1300); }
}
function factWrong(q) {
sess.answered = true; sess.stats.q++; dayLog(S).q++;
FX.recordFact(S, q.key, false, 9999, q.missing); save();
sess.retry.push({ key: q.key, at: sess.n + 3 });
$('.ans')?.classList.add('no');
fb(`<div class="reveal"><span class="big-ans">${q.missing ? `${q.a} × <b>${q.c}</b> = ${q.a * q.c}` : `${q.a} × ${q.c} = <b>${q.a * q.c}</b>`}</span><span class="small">${q.hint}</span></div>`, 'bad keep');
nextButton('Got it');
}
function resetAttempt(q) {
if (q.answer.kind === 'num') { inp.val = ''; }
if (q.answer.kind === 'frac') { inp.w = ''; inp.n = ''; inp.d = ''; inp.neg = false; inp.f = 'n'; }
if (q.answer.kind === 'point') { inp.pt = null; drawPoint(null); }
}
function onWrong() {
const q = sess.q; sess.tries++;
const qc = $('.qcard'); qc?.classList.remove('shake'); void qc?.offsetWidth; qc?.classList.add('shake');
if (q.fact) return factWrong(q);
if (q.answer.kind === 'choice') { sess.wrongChoices.add(inp.choice); inp.choice = null; }
if (sess.tries === 1) {
$('.ans')?.classList.add('no');
fb(`Not quite. Try again!<br><span class="small">${I.bulb} ${q.hint}</span>`, 'bad');
resetAttempt(q); renderInput(); return;
}
sess.answered = true; sess.stats.q++; dayLog(S).q++;
levelNews(recordSkill(S, q.skill, 'wrong'), q.skill); save();
fb(`The answer is <b>${answerHTML(q.answer)}</b>.`, 'bad keep');
if (q.answer.kind === 'choice') $$('.choice')[q.answer.correct]?.classList.add('ok');
if (q.answer.kind === 'point') drawPoint({ x: q.answer.x, y: q.answer.y }, 'ok');
nextButton();
openWays(true);
}
function levelNews(res, id) {
if (res.up) { sess.stats.ups.push(id); toast(`${I.star} Step up! ${SKILL[id].title} is now step ${res.up}`); }
if (!res.mastered) return;
sess.stats.mastered.push(id); toast(`${I.star} You mastered ${SKILL[id].title}!`); confetti();
const up = checkLevelUp(S);
if (!up) return;
sess.stats.levelUp = up;
const next = up.next ? `Welcome to Level ${up.next}: ${levelInfo(up.next).title}` : 'You finished every level!';
setTimeout(() => toast(`${I.star} Level ${up.done} complete! ${next}`), 2600);
}
