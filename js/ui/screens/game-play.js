// One puzzle round: the picture, the choices, then the reason.
import { SKILL } from '../../skills/registry.js';
import { readAloudOn } from '../../core/say.js';
import { S } from '../../core/store.js';
import { mount, esc } from '../dom.js';
import { I } from '../icons.js';

function choiceBtn(c, result, answer) {
  const mark = result ? (c.id === answer ? 'ok' : c.id === result.pick ? 'nope' : '') : '';
  const off = result ? 'disabled' : '';
  return `<button class="choice game-choice ${mark}" ${off} data-act="gamepick" data-id="${esc(c.id)}" aria-label="${esc(c.label)}">${c.html}</button>`;
}

export function gameScreen(meta, round, result) {
  const choices = round.choices.map(c => choiceBtn(c, result, round.answer)).join('');
  const hear = S && readAloudOn(S) ? '<button class="btn sm hear-btn" data-act="heargame">Hear it</button>' : '';
  const why = result ? `<div class="why-card paper-card ${result.ok ? 'yes' : 'no'}" role="status">
    <h2>${result.ok ? 'Yes' : 'Not yet'}</h2>
    <p>${esc(round.why)}</p>
    <button class="btn" data-act="skill" data-id="${esc(round.skill)}">See ${esc(SKILL[round.skill].title)}</button>
  </div>` : '';
  const bar = result
    ? '<button class="btn primary big" data-act="gamenext">Next puzzle</button>'
    : '<p class="small muted center">Tap the one that fits.</p>';
  return `<div class="page game-play"><header class="top"><button class="iconbtn" data-go="games" aria-label="Back">${I.back}</button><h1>${esc(meta.title)}</h1></header>
  <div class="paper-card gq"><p class="ask">${esc(round.prompt)}</p>${hear}<div class="gvisual">${round.visual}</div></div>
  <div class="choices game-choices">${choices}</div>
  ${why}
  <footer class="pad lbar">${bar}</footer></div>`;
}
