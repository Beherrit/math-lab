// Moves a session along: which question comes next, the clock, and phase changes.
import { S } from '../core/store.js';
import * as FX from '../core/facts.js';
import { skillState } from '../core/mastery.js';
import { mixChoice } from '../core/mix.js';
import { today } from '../core/dates.js';
import { generate } from '../skills/registry.js';
import { num } from '../util.js';
import { $, fmtTime } from '../ui/dom.js';
import { sess, resetInp } from './state.js';
import { startTimer as runTimer, stopTimer } from './timer.js';
import { placementQuestion } from './placement-run.js';
import { renderPlay } from './play.js';
import { closeSheet } from './sheet.js';
import { finish, bankTime } from './summary.js';
import { dayResult } from './extra-run.js';
import { extraNext } from '../core/extra.js';
import { phaseIntro } from './intro.js';
function makeFactProblem(table) {
const due = sess.retry.findIndex(r => r.at <= sess.n);
const key = FX.pickFact(S, sess.recentFacts, table, due >= 0 ? [sess.retry.splice(due, 1)[0].key] : []);
sess.recentFacts.push(key); sess.recentFacts = sess.recentFacts.slice(-4);
const f = FX.makeFact(S, key, table);
const p = f.a * f.c;
return { ...f, ask: f.missing ? 'What’s the missing number?' : '', expr: f.missing ? `${f.a} × <span class="blank">?</span> = ${p}` : `${f.a} × ${f.c}`, answer: num(f.missing ? f.c : p), ways: FX.factWays(f.a, f.c, f.missing), hint: FX.strategy(f.a, f.c) };
}
export function nextQuestion() {
const ph = sess.phases[sess.pi];
if (sess.phaseDone && sess.mode !== 'free') return endPhase();
let q;
const now = today(); const place = sess.mode === 'place';
const mix = place ? null : ph.type === 'mix' ? mixChoice(S, { focus: sess.phases[1]?.skill, now }) : ph.type === 'extra' ? extraNext(S, sess.extra, { now }) : null;
if (sess.mode === 'extra') bankTime();
const type = sess.mode === 'place' ? 'place' : mix ? mix.id : ph.type;
if (type === 'place') { q = placementQuestion(); if (!q) return; }
else if (type === 'facts') q = makeFactProblem(ph.table);
else { const id = type === 'skill' ? ph.skill : type; q = id ? generate(id, skillState(S, id).L, sess.avoid) : null; }
if (!q) q = makeFactProblem();
if (mix?.review && q.skill === mix.id) q.review = true;
sess.avoid.add(q.key || q.expr); if (sess.avoid.size > 40) sess.avoid = new Set([...sess.avoid].slice(-30));
Object.assign(sess, { q, tries: 0, assisted: false, preDone: !q.pre, answered: false, qStart: performance.now(), wrongChoices: new Set() }); sess.n++;
resetInp();
renderPlay();
}
export function advance() { if (!sess || !sess.q || !$('.play') || sess.mode === 'lesson') return; closeSheet(); if (sess.locked) return; nextQuestion(); }
export function tick() {
if (!sess) return stopTimer();
const now = performance.now();
if (!sess.paused && !document.hidden) sess.el += now - sess.last;
sess.last = now;
const ph = sess.phases[sess.pi];
if (ph.ms === Infinity) return;
const left = ph.ms - sess.el;
const t = $('.time'); if (t) t.textContent = fmtTime(left);
const f = $(`.seg[data-i="${sess.pi}"] span`); if (f) f.style.width = Math.min(100, sess.el / ph.ms * 100) + '%';
if (left <= 0 && !sess.phaseDone) {
sess.phaseDone = true;
if (ph.hard) { sess.locked = true; setTimeout(endPhase, 300); } else if (t) t.textContent = 'Last one!';
}
}
export function endPhase() {
sess.q = null; sess.el = 0; sess.phaseDone = false; sess.locked = false;
if (sess.pi < sess.phases.length - 1) { sess.pi++; phaseIntro(); } else if (sess.mode === 'daily') dayResult(); else finish();
}
export function startTimer() { sess.last = performance.now(); runTimer(tick); }
export function playPhase() { sess.last = performance.now(); nextQuestion(); if (sess.mode !== 'place') startTimer(); }
