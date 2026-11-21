// Home screen: today's practice, then subjects and grades to browse.
import { S, save } from '../../core/store.js';
import { today, longDate } from '../../core/dates.js';
import { getFocus } from '../../core/focus.js';
import { resumeId, pathDots } from '../../core/look.js';
import { reviewQuestions } from '../../core/home-review.js';
import { streakNow, phaseSplit } from '../../core/daily.js';
import { syncChallenge, challengeStreak, streakLabel } from '../../core/challenge.js';
import { helloName } from '../../core/learner.js';
import { readAloudOn } from '../../core/say.js';
import { fmt } from '../../util.js';
import { I } from '../icons.js';
import { mount, esc } from '../dom.js';
import { sticker } from '../fragments.js';
import { weekStrip } from './home-parts.js';
import { browseBlocks } from './home-browse.js';
import { BADGES } from '../../core/badges.js';
import { SKILL } from '../../skills/registry.js';
function reviewCard() {
  const n = reviewQuestions(S, today()).length;
  if (!n) return '';
  return `<section class="paper-card"><h2>Today's review</h2><p class="muted">${n} short questions. Your stars stay as they are.</p><button class="btn primary big" data-act="review">Review</button></section>`;
}
function challengeCard() {
  const date = today();
  const before = S.challenge?.today;
  const set = syncChallenge(S, date);
  if (set !== before) save();
  const left = set.items.filter(it => !it.status).length;
  const line = `${left ? `${left} to go` : 'Done for today'}. ${streakLabel(challengeStreak(S, date))}`;
  const label = left ? "Play today's challenge" : "See today's challenge";
  return `<section class="paper-card ch-card"><h2>Today's challenge</h2><p class="muted">${esc(line)}</p><button class="btn primary big" data-go="challenge">${label}</button></section>`;
}
function pathMap() {
  const dots = pathDots(S);
  if (!dots.length) return '';
  const done = dots.filter(d => d.state === 'done').length;
  const pips = dots.map(d => `<span class="pip ${d.state}"></span>`).join('');
  return `<div class="path-map" role="img" aria-label="${done} of ${dots.length} steps done">${pips}</div>`;
}
function goButton() {
  const id = resumeId(S);
  if (id) return `<button class="btn primary big" data-act="practice" data-id="${esc(id)}">Keep going</button>`;
  return '<button class="btn primary big" data-act="start">Start</button>';
}
function todayCard(focus) {
  const done = S.days[today()]?.done;
  const mins = S.settings.minutes;
  const sp = phaseSplit(S);
  const resumed = resumeId(S);
  const head = resumed ? `<h2>Continue</h2><p class="muted">${esc(SKILL[resumed].title)}</p>` : '';
  if (done && !resumed) return `<h2 class="done-title">Today’s page is done ${I.check}</h2><p class="muted">Great work. Come back tomorrow, or pick a subject below.</p>${pathMap()}<button class="btn ghost" data-act="start">Do another round</button>`;
  if (S.level === 0) return `${head || '<h2>Today’s practice</h2>'}${pathMap()}${goButton()}`;
  if (resumed) return `${head}${pathMap()}${goButton()}`;
  const facts = sp.facts ? `<li><b>Times tables warm-up</b><span>${Math.round(mins * sp.facts)} min</span></li>` : '';
  const name = focus ? SKILL[focus].title : 'Times tables';
  return `<h2>Today’s ${mins} minutes</h2><ol class="plan">${facts}<li><b>Focus: ${name}</b><span>${Math.round(mins * sp.focus)} min</span><button class="link" data-go="pick">change</button></li><li><b>Mix-up</b><span>${Math.max(1, Math.round(mins * sp.mix))} min</span></li></ol>${pathMap()}${goButton()}`;
}
export function renderHome() {
  const who = helloName(S);
  const hear = readAloudOn(S) ? '<button class="btn sm hear-btn" data-act="hearhome">Hear it</button>' : '';
  const stickers = S.badges.length ? S.badges.slice(-6).map(id => sticker(BADGES.find(b => b.id === id))).join('') : '<p class="muted small">Finish today’s practice to earn your first sticker.</p>';
  mount(`<div class="page home"><header class="hello"><div><p class="date">${longDate()}</p><h1>${who ? `Hi, ${esc(who)}!` : 'Hi!'}</h1>${hear}</div><div class="chips"><span class="chip flame" title="Day streak">${I.flame}<b>${streakNow(S)}</b></span><span class="chip starc" title="Stars">${I.star}<b>${fmt(S.stars)}</b></span></div></header>
  ${challengeCard()}
  ${reviewCard()}
  <section class="today paper-card">${weekStrip()}${todayCard(getFocus(S))}</section>
  ${browseBlocks()}
  <section class="block"><div class="block-head"><h2>Stickers</h2><button class="link" data-go="badges">See all</button></div><div class="stickers">${stickers}</div></section>
  <footer class="foot"><button class="link" data-go="parent">${I.gear} Grown-ups</button></footer></div>`);
}
