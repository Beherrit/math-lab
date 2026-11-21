// Puzzle list. Kindergarten games for now; later grades add their own.
import { S } from '../../core/store.js';
import { gameList } from '../../games/catalog.js';
import { SKILL } from '../../skills/registry.js';
import { mount } from '../dom.js';
import { backBtn } from '../fragments.js';
import { shapeSVG, FILLS } from '../../games/draw.js';

const art = shapeSVG('circle', FILLS.yellow, 36) + shapeSVG('square', FILLS.grape, 36) + shapeSVG('triangle', FILLS.green, 36);

export function renderGames() {
  const cards = gameList().map(g => `<button class="game-card" data-go="game" data-arg="${g.id}">
    <span class="game-title">${g.title}</span>
    <span class="game-blurb">${g.blurb}</span>
    <span class="game-link">Uses ${SKILL[g.skill]?.title || 'a lesson'}</span>
  </button>`).join('');
  const who = S.level === 0 ? '<p class="lead-in">Tap a puzzle. Then see why the answer works.</p>' : '';
  mount(`<div class="page games"><header class="top">${backBtn()}<h1>Puzzles</h1></header>
  ${who}
  <div class="game-art" aria-hidden="true">${art}</div>
  <div class="game-list">${cards}</div></div>`);
}
