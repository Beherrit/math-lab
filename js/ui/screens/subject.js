// One subject inside the current grade: its lessons, practice, and any puzzles that teach it.
import { S } from '../../core/store.js';
import { enabledIn } from '../../core/progression.js';
import { skillsIn, puzzlesFor, subjectShort } from '../../core/browse.js';
import { readAloudOn } from '../../core/say.js';
import { mount, esc } from '../dom.js';
import { I } from '../icons.js';
import { subjectArt } from '../subject-art.js';

function lessonCard(s) {
  const st = S.skills[s.id];
  const step = st?.mastered ? 'Mastered' : st ? `Step ${st.L} of 3` : 'New';
  return `<article class="skill-card paper-card">
    <h2>${esc(s.title)}</h2>
    <p class="muted">${esc(s.sub)}</p>
    <p class="small">${step}</p>
    <div class="row2">
      <button class="btn" data-act="learn" data-id="${esc(s.id)}">Learn it</button>
      <button class="btn primary" data-act="practice" data-id="${esc(s.id)}">Practice</button>
    </div>
  </article>`;
}

function puzzleBtn(g) {
  return `<button class="btn game-jump" data-go="game" data-arg="${esc(g.id)}">${esc(g.title)}</button>`;
}

export function renderSubject(name) {
  const skills = skillsIn(enabledIn(S, S.level), name);
  const puzzles = puzzlesFor(S.level, name, S.settings.off);
  const short = subjectShort(name);
  const say = `${short}. Tap Learn it to see why, or Practice to try it.`;
  const hear = readAloudOn(S) ? `<button class="btn sm hear-btn" data-act="hearsay" data-say="${esc(say)}">Hear it</button>` : '';
  const games = puzzles.length ? `<section class="block"><h2>Puzzles</h2><div class="puzzle-jumps">${puzzles.map(puzzleBtn).join('')}</div></section>` : '';
  const lessons = skills.length ? skills.map(lessonCard).join('') : '<p class="muted">Nothing in this subject right now.</p>';
  mount(`<div class="page subject">
    <header class="top"><button class="iconbtn" data-go="home" aria-label="Back">${I.back}</button><h1>${esc(short)}</h1></header>
    <div class="subject-hero" aria-hidden="true">${subjectArt(name)}</div>
    ${hear}
    ${games}
    <section class="block"><h2>Lessons</h2>${lessons}</section>
  </div>`);
}
