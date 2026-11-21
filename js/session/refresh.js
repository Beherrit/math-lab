// A short look back at an earlier skill after a miss that lands on a gap. Nothing here
// changes stars, mastery, the streak or the day log. One example, then one try, then back.
import { S } from '../core/store.js';
import { SKILL, generate } from '../skills/registry.js';
import { gapSkill } from '../core/foundations.js';
import { stop } from '../core/speech.js';
import { answerHTML } from '../util.js';
import { I } from '../ui/icons.js';
import { $, $$, mount, esc } from '../ui/dom.js';
import { problemHTML, waysHTML } from '../ui/fragments.js';
import { go } from '../ui/router.js';
import { sess, setSess, newSess } from './state.js';
import { stopTimer } from './timer.js';
import { nextQuestion, startTimer, playPhase } from './flow.js';
import { markCorrect } from './pad.js';
import { fb } from './feedback.js';

let parked = null;

export function refreshOffer(skillId) {
  if (!sess || sess.mode === 'refresh' || sess.mode === 'place' || sess.mode === 'lesson') return '';
  const id = gapSkill(S, skillId);
  if (!id || !SKILL[id]) return '';
  return `<button class="btn big" data-act="refresh" data-id="${esc(id)}">Refresh: ${esc(SKILL[id].title)}</button>`;
}

function exampleHTML(id) {
  const ex = generate(id, 1) || generate(id, 1);
  if (!ex) return '';
  const one = ex.ways?.[0] ? waysHTML([ex.ways[0]], 'ex') : '';
  return `<section class="block"><h2>Example</h2><div class="paper-card example"><div class="ex-q">${problemHTML(ex)}<p class="ex-a">Answer: <b>${answerHTML(ex.answer)}</b></p></div>${one}</div></section>`;
}

function renderCard(id) {
  const s = SKILL[id];
  mount(`<div class="page has-bar"><header class="top"><button class="iconbtn" data-act="refreshback" aria-label="Back">${I.back}</button><div><h1>A short refresher</h1><p class="small muted">${esc(s.title)}</p></div></header>
<div class="paper-card learn"><p class="big-idea">${s.learn.big}</p></div>
${exampleHTML(id)}
<footer class="pad lbar"><button class="btn primary big" data-act="refreshtry">Try one</button></footer></div>`);
}

export function startRefresh(id) {
  if (!SKILL[id]) return;
  if (sess?.mode !== 'refresh') parked = sess;
  stop();
  stopTimer();
  const backTitle = parked?.q?.skill && SKILL[parked.q.skill] ? SKILL[parked.q.skill].title : 'practice';
  const next = newSess('refresh', [{ type: 'skill', skill: id, ms: Infinity, label: SKILL[id].title }]);
  next.refreshOf = id;
  next.backTitle = backTitle;
  setSess(next);
  renderCard(id);
}

export function tryRefresh() {
  if (sess?.mode !== 'refresh') return;
  playPhase();
}

export function refreshAnswer(ok) {
  const q = sess.q;
  sess.answered = true;
  if (ok) { markCorrect(q); fb(`${I.check} Yes.`, 'good'); }
  else {
    $('.ans')?.classList.add('no');
    fb(`The answer is <b>${answerHTML(q.answer)}</b>.`, 'bad keep');
    if (q.answer.kind === 'choice') $$('.choice')[q.answer.correct]?.classList.add('ok');
  }
  $('.pad').innerHTML = `<button class="btn primary big" data-act="refreshback">Back to ${esc(sess.backTitle)}</button>`;
}

export function endRefresh() {
  stop();
  stopTimer();
  const back = parked;
  parked = null;
  setSess(back);
  if (!back) return go('home');
  back.last = performance.now();
  nextQuestion();
  if (back.mode !== 'place') startTimer();
}
