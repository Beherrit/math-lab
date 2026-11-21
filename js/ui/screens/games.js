// Puzzle list for the grade that is open. Empty grades say so.
import { S } from '../../core/store.js';
import { puzzlesFor, activeGrade, subjectShort } from '../../core/browse.js';
import { SKILL } from '../../skills/registry.js';
import { mount, esc } from '../dom.js';
import { backBtn } from '../fragments.js';
import { shapeSVG, FILLS } from '../../games/draw.js';

const art = shapeSVG('circle', FILLS.yellow, 36) + shapeSVG('square', FILLS.grape, 36) + shapeSVG('triangle', FILLS.green, 36);

export function renderGames(strand) {
  const list = puzzlesFor(S.level, strand || null, S.settings.off);
  const where = strand ? subjectShort(strand) : activeGrade(S).label;
  const cards = list.map(g => `<button class="game-card" data-go="game" data-arg="${esc(g.id)}">
    <span class="game-title">${esc(g.title)}</span>
    <span class="game-blurb">${esc(g.blurb)}</span>
    <span class="game-link">Uses ${esc(SKILL[g.skill]?.title || 'a lesson')}</span>
  </button>`).join('');
  const body = cards || '<p class="muted">No puzzles for this grade yet.</p>';
  mount(`<div class="page games"><header class="top">${backBtn()}<h1>Puzzles</h1></header>
  <p class="lead-in">${esc(where)}. Tap a puzzle. Then see why the answer works.</p>
  <div class="game-art" aria-hidden="true">${art}</div>
  <div class="game-list">${body}</div></div>`);
}
