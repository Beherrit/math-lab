// Subject tiles and the grade scroller on the home screen.
import { S } from '../../core/store.js';
import { enabledIn } from '../../core/progression.js';
import { GRADES } from '../../core/learner.js';
import { subjectsAt, puzzlesFor, activeGrade, bandName } from '../../core/browse.js';
import { esc } from '../dom.js';
import { subjectArt } from '../subject-art.js';
import { shapeSVG, FILLS } from '../../games/draw.js';

function tiles(subjects) {
  return subjects.map(s => `<button class="subject-tile" data-go="subject" data-arg="${esc(s.name)}" aria-label="${esc(s.short)}"><span class="subject-art" aria-hidden="true">${subjectArt(s.name)}</span><b>${esc(s.short)}</b></button>`).join('');
}

function grades(current) {
  return GRADES.map(g => {
    const on = g.id === current.id;
    const label = g.id === 'K' ? 'Kindergarten' : g.label;
    return `<button class="grade-chip ${on ? 'on' : ''}" data-act="setgrade" data-grade="${g.id}" aria-pressed="${on ? 'true' : 'false'}" aria-label="${esc(label)}">${esc(label)}</button>`;
  }).join('');
}

function puzzleTile() {
  const art = shapeSVG('circle', FILLS.yellow, 40) + shapeSVG('square', FILLS.grape, 40) + shapeSVG('triangle', FILLS.green, 40);
  const big = S.level === 0 ? ' big' : '';
  return `<button class="puzzle-card${big}" data-go="games" aria-label="Puzzles"><span class="puzzle-art" aria-hidden="true">${art}</span><span class="puzzle-copy"><b>Puzzles</b><span>Figure it out, then see why</span></span></button>`;
}

export function browseBlocks() {
  const skills = enabledIn(S, S.level);
  const grade = activeGrade(S);
  const note = S.level === 0 ? 'Counting, shapes, colors and letters' : bandName(S.level);
  const puzzles = puzzlesFor(S.level, null, S.settings.off);
  const times = S.level >= 2 ? '<button class="btn big" data-go="lab">Times tables</button>' : '';
  return `<section class="block"><h2>${esc(grade.label)}</h2><p class="band-note muted">${esc(note)}</p><div class="subject-grid">${tiles(subjectsAt(skills))}</div></section>
  <section class="block"><h2>Grades</h2><div class="grade-row" role="group" aria-label="Grades">${grades(grade)}</div></section>
  <section class="block side-tiles">${puzzles.length ? puzzleTile() : ''}${times}</section>`;
}
