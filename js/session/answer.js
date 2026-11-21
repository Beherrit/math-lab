// Checking an answer and what happens next: stars, mastery, level-up, retries.
import { S, save } from '../core/store.js';
import * as FX from '../core/facts.js';
import { recordSkill } from '../core/mastery.js';
import { recordReview } from '../core/review.js';
import { today } from '../core/dates.js';
import { dayLog } from '../core/daily.js';
import { checkLevelUp } from '../core/progression.js';
import { pathPick } from '../core/focus.js';
import { suggestNext } from '../core/path.js';
import { SKILL } from '../skills/registry.js';
import { moveLine } from '../core/browse.js';
import { check, answerHTML, pick } from '../util.js';
import { I } from '../ui/icons.js';
import { $, $$, esc } from '../ui/dom.js';
import { becauseText } from '../core/say.js';
import { sess } from './state.js';
import { toast, confetti, fb, RIGHT } from './feedback.js';
import { currentInput } from './input.js';
import { renderInput, drawPoint, resetAttempt, markCorrect } from './pad.js';
import { lessonAnswer } from './lesson-task.js';
import { openWays } from './sheet.js';
import { advance } from './flow.js';
import { recordPlacement } from './placement-run.js';
import { stop as stopSpeech } from '../core/speech.js';
import { sayResult, aloudOn } from './aloud.js';
import { refreshAnswer } from './refresh.js';
export function submit() {
if (!sess || sess.answered || sess.locked) return;
stopSpeech(); // the child answered: stop reading
const r = check(sess.q.answer, currentInput());
if (r.empty) { fb(r.msg, 'warn'); return; }
if (sess.mode === 'lesson') return lessonAnswer(r.ok);
if (sess.mode === 'place') return r.ok ? placeRight() : placeWrong();
if (sess.mode === 'refresh') return refreshAnswer(r.ok);
if (r.ok) onRight(r.note); else onWrong();
}
function nextButton(label = 'Next') { $('.pad').innerHTML = `<button class="btn primary big" data-act="next">${label}</button>`; }
function offerNext() { $('.pad').innerHTML = '<button class="btn big" data-act="stop">Finish</button><button class="btn primary big" data-act="nextskill">Next skill</button>'; }
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
if (q.review) recordReview(S.skills[q.skill], first ? 'right' : 'half', today());
if (SKILL[q.skill].story && first) S.counters.story++;
}
save();
markCorrect(q);
sayResult('right', q);
fb(`${I.check} ${pick(RIGHT)}${first ? ` <span class="plus">+1 ${I.star}</span>` : ''}${note ? `<br><span class="small">${note}</span>` : ''}`, 'good' + (note ? ' keep' : ''));
if (q.fact) setTimeout(advance, 650);
else if (sess.offerNext) offerNext();
else { nextButton(); if (!note && !q.story) setTimeout(() => { if (sess?.q === q && !$('.sheet:not([hidden])')) advance(); }, aloudOn() ? 2400 : 1300); }
}
function factWrong(q) {
sess.answered = true; sess.stats.q++; dayLog(S).q++;
FX.recordFact(S, q.key, false, 9999, q.missing); save();
sess.retry.push({ key: q.key, at: sess.n + 3 });
$('.ans')?.classList.add('no'); sayResult('reveal', q);
fb(`<div class="reveal"><span class="big-ans">${q.missing ? `${q.a} × <b>${q.c}</b> = ${q.a * q.c}` : `${q.a} × ${q.c} = <b>${q.a * q.c}</b>`}</span><span class="small">${q.hint}</span></div>`, 'bad keep');
nextButton('Got it');
}
function onWrong() {
const q = sess.q; sess.tries++;
const qc = $('.qcard'); qc?.classList.remove('shake'); void qc?.offsetWidth; qc?.classList.add('shake');
if (q.fact) return factWrong(q);
if (sess.tries === 1) {
$('.ans')?.classList.add('no'); sayResult('retry', q);
fb(`Not quite. Try again!<br><span class="small">${I.bulb} ${q.hint}</span>`, 'bad');
resetAttempt(q); renderInput(); return;
}
sess.answered = true; sess.stats.q++; dayLog(S).q++;
sayResult('reveal', q);
levelNews(recordSkill(S, q.skill, 'wrong'), q.skill);
if (q.review) recordReview(S.skills[q.skill], 'wrong', today());
save();
const why = becauseText(q);
fb(`The answer is <b>${answerHTML(q.answer)}</b>.${why ? `<br><span class="small">Here is why: ${esc(why)}</span>` : ''}`, 'bad keep');
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
if (sess.mode === 'free' && sess.phases[0].type === 'skill' && (suggestNext(S) || pathPick(S))) sess.offerNext = true; // free practice: offer the next skill on the path
if (!up) return;
sess.stats.levelUp = up;
setTimeout(() => toast(`${I.star} ${moveLine(up.done, up.next)}`), 2600);
}
