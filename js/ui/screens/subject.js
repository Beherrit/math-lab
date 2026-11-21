// One subject inside the current grade: its path, then any puzzles that teach it.
import { S } from '../../core/store.js';
import { today } from '../../core/dates.js';
import { enabledIn } from '../../core/progression.js';
import { skillsIn, puzzlesFor, subjectShort } from '../../core/browse.js';
import { pathNodes } from '../../core/path.js';
import { SKILL } from '../../skills/registry.js';
import { readAloudOn } from '../../core/say.js';
import { mount, esc } from '../dom.js';
import { I } from '../icons.js';
import { subjectArt } from '../subject-art.js';

const STATE = { mastered: 'Mastered', now: 'Up next', locked: 'Later' };

function nodeCard(s, node) {
  const label = node.due ? 'Time to review' : STATE[node.state];
  const actions = node.state === 'locked'
    ? `<button class="btn" data-go="skill" data-arg="${esc(s.id)}">Peek</button>`
    : `<div class="row2"><button class="btn" data-act="learn" data-id="${esc(s.id)}">Learn it</button><button class="btn primary" data-act="practice" data-id="${esc(s.id)}">Practice</button></div>`;
  return `<li class="path-node ${node.state}${node.due ? ' due' : ''}">
    <div class="path-rail" aria-hidden="true"><span class="path-dot"></span><span class="path-line"></span></div>
    <article class="path-card paper-card">
      <p class="path-state">${label}</p>
      <h2>${esc(s.title)}</h2>
      <p class="muted">${esc(s.sub)}</p>
      ${actions}
    </article>
  </li>`;
}

function puzzleBtn(g) {
  return `<button class="btn game-jump" data-go="game" data-arg="${esc(g.id)}">${esc(g.title)}</button>`;
}

export function renderSubject(name) {
  const skills = skillsIn(enabledIn(S, S.level), name);
  const nodes = pathNodes(S, skills, today());
  const puzzles = puzzlesFor(S.level, name, S.settings.off);
  const short = subjectShort(name);
  const now = nodes.find(n => n.state === 'now');
  const say = now ? `${short}. ${SKILL[now.id].title} is up next. You can peek at the later ones.` : `${short}. This path is mastered.`;
  const hear = readAloudOn(S) ? `<button class="btn sm hear-btn" data-act="hearsay" data-say="${esc(say)}">Hear it</button>` : '';
  const games = puzzles.length ? `<section class="block"><h2>Puzzles</h2><div class="puzzle-jumps">${puzzles.map(puzzleBtn).join('')}</div></section>` : '';
  const path = nodes.length ? `<ol class="path">${skills.map((s, i) => nodeCard(s, nodes[i])).join('')}</ol>` : '<p class="muted">Nothing in this subject right now.</p>';
  mount(`<div class="page subject">
    <header class="top"><button class="iconbtn" data-go="home" aria-label="Back">${I.back}</button><h1>${esc(short)}</h1></header>
    <div class="subject-hero" aria-hidden="true">${subjectArt(name)}</div>
    ${hear}
    <section class="block"><h2>Path</h2>${path}</section>
    ${games}
  </div>`);
}
