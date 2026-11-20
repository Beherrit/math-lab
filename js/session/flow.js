// Moves a session along: which question comes next, the clock, and phase changes.
import { S } from '../core/store.js';
import * as FX from '../core/facts.js';
import { skillState } from '../core/mastery.js';
import { reviewPool, workingLevel } from '../core/progression.js';
import { generate, storySkillOf } from '../skills/registry.js';
import { num, pick } from '../util.js';
import { $, fmtTime } from '../ui/dom.js';
import { sess, resetInp } from './state.js';
import { startTimer as runTimer, stopTimer } from './timer.js';
import { placementQuestion } from './placement-run.js';
import { renderPlay } from './play.js';
import { closeSheet } from './sheet.js';
import { finish } from './summary.js';
import { phaseIntro } from './intro.js';
function makeFactProblem(table) {
const due = sess.retry.findIndex(r => r.at <= sess.n);
const key = FX.pickFact(S, sess.recentFacts, table, due >= 0 ? [sess.retry.splice(due, 1)[0].key] : []);
sess.recentFacts.push(key); sess.recentFacts = sess.recentFacts.slice(-4);
const f = FX.makeFact(S, key, table);
const p = f.a * f.c;
return { ...f, ask: f.missing ? 'What’s the missing number?' : '', expr: f.missing ? `${f.a} × <span class="blank">?</span> = ${p}` : `${f.a} × ${f.c}`, answer: num(f.missing ? f.c : p), ways: FX.factWays(f.a, f.c, f.missing), hint: FX.strategy(f.a, f.c) };
}
// What the "mix" phase asks next: a fact, a story (if this level has them), or a practiced skill from this level or below.
function mixSkill() {
const focus = sess.phases[1]?.skill; const practiced = reviewPool(S, focus);
const story = storySkillOf(workingLevel(S)); const storyOn = story && !S.settings.off[story.id];
const r = Math.random();
if (r < 0.15) return 'facts';
if (r < 0.4 && storyOn) return story.id;
if (practiced.length) return pick(practiced).id;
return storyOn ? story.id : focus;
}
export function nextQuestion() {
const ph = sess.phases[sess.pi];
if (sess.phaseDone && sess.mode !== 'free') return endPhase();
let q;
const type = sess.mode === 'place' ? 'place' : ph.type === 'mix' ? mixSkill() : ph.type;
if (type === 'place') { q = placementQuestion(); if (!q) return; }
else if (type === 'facts') q = makeFactProblem(ph.table);
else { const id = type === 'skill' ? ph.skill : type; q = id ? generate(id, skillState(S, id).L, sess.avoid) : null; }
if (!q) q = makeFactProblem();
sess.avoid.add(q.key || q.expr); if (sess.avoid.size > 40) sess.avoid = new Set([...sess.avoid].slice(-30));
Object.assign(sess, { q, tries: 0, assisted: false, preDone: !q.pre, answered: false, qStart: performance.now(), wrongChoices: new Set() }); sess.n++;
resetInp();
renderPlay();
}
export function advance() { if (!sess || !sess.q || !$('.play')) return; closeSheet(); if (sess.locked) return; nextQuestion(); }
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
if (sess.pi < sess.phases.length - 1) { sess.pi++; phaseIntro(); } else finish(true);
}
export function startTimer() { sess.last = performance.now(); runTimer(tick); }
export function playPhase() { sess.last = performance.now(); nextQuestion(); if (sess.mode !== 'place') startTimer(); }
