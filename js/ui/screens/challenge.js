// Today's challenge: the list, the streak, and a month calendar.
import { S, save } from '../../core/store.js';
import { today } from '../../core/dates.js';
import { syncChallenge, challengeStreak, streakLabel, monthCells, monthTitle, itemLabel, itemTitle } from '../../core/challenge.js';
import { mount, esc } from '../dom.js';
import { backBtn } from '../fragments.js';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function calendar(date) {
  const done = S.challenge?.done || {};
  const cells = monthCells(date).map(ds => {
    if (!ds) return '<span></span>';
    const n = Number(ds.slice(-2));
    const cls = [done[ds] ? 'on' : '', ds === date ? 'today' : ''].filter(Boolean).join(' ');
    const label = `${monthTitle(ds).replace(/ \d{4}$/, '')} ${n}${done[ds] ? ', done' : ''}`;
    return `<b class="${cls}" aria-label="${esc(label)}">${n}</b>`;
  }).join('');
  const heads = DAYS.map(d => `<i>${d}</i>`).join('');
  return `<div class="cal" role="grid" aria-label="${esc(monthTitle(date))}">${heads}${cells}</div>`;
}

function rows(set) {
  return set.items.map(it => {
    const mark = it.status === 'right' ? 'right' : it.status === 'wrong' ? 'wrong' : '';
    return `<li class="${mark}"><b>${esc(itemLabel(it))}</b><span>${esc(itemTitle(it))}</span></li>`;
  }).join('');
}

export function renderChallenge() {
  const date = today();
  const before = S.challenge?.today;
  const set = syncChallenge(S, date);
  if (set !== before) save();
  const left = set.items.filter(it => !it.status).length;
  const n = challengeStreak(S, date);
  const lead = left ? `${left} to go. ${streakLabel(n)}` : `Done for today. ${streakLabel(n)}`;
  const go = left ? '<button class="btn primary big" data-act="chstart">Start</button>' : '';
  mount(`<div class="page challenge"><header class="top">${backBtn()}<h1>Today's challenge</h1></header>
  <p class="ch-streak">${esc(lead)}</p>
  <section class="paper-card"><h2>${esc(monthTitle(date))}</h2>${calendar(date)}</section>
  <ol class="ch-items">${rows(set)}</ol>
  ${go}</div>`);
}
