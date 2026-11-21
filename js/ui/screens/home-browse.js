// Subject tiles and the grade scroller on the home screen.
import { S } from '../../core/store.js';
import { enabledIn } from '../../core/progression.js';
import { GRADES } from '../../core/learner.js';
import { subjectsAt, puzzlesFor, activeGrade, bandName } from '../../core/browse.js';
import { TONES } from '../../core/look.js';
import { esc } from '../dom.js';
import { explainHear } from '../hear.js';
import { subjectArt } from '../subject-art.js';
import { shapeSVG, FILLS } from '../../games/draw.js';

function tiles(subjects) {
  const early = S.level === 0;
  return subjects.map(s => {
    const tone = early && TONES[s.name] ? ` tone-${TONES[s.name]}` : '';
    const art = `<span class="subject-art" aria-hidden="true">${subjectArt(s.name)}</span><b>${esc(s.short)}</b>`;
    const open = `<button class="tile-open" data-go="subject" data-arg="${esc(s.name)}" aria-label="${esc(s.short)}">${art}</button>`;
    const hear = early ? explainHear(s.short, `Hear ${s.short}`) : '';
    return `<div class="subject-tile${early ? ' pic' : ''}${tone}">${open}${hear}</div>`;
  }).join('');
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
  const face = `<span class="puzzle-art" aria-hidden="true">${art}</span><span class="puzzle-copy"><b>Puzzles</b><span>Figure it out, then see why</span></span>`;
  if (S.level !== 0) return `<button class="puzzle-card" data-go="games" aria-label="Puzzles">${face}</button>`;
  const open = `<button class="tile-open" data-go="games" aria-label="Puzzles">${face}</button>`;
  return `<div class="puzzle-card big">${open}${explainHear('Puzzles. Figure it out, then see why.', 'Hear Puzzles')}</div>`;
}

export function browseBlocks() {
  const skills = enabledIn(S, S.level);
  const grade = activeGrade(S);
  const note = S.level === 0 ? '' : `<p class="band-note muted">${esc(bandName(S.level))}</p>`;
  const puzzles = puzzlesFor(S.level, null, S.settings.off);
  const times = S.level >= 2 ? '<button class="btn big" data-go="lab">Times tables</button>' : '';
  const games = puzzles.length ? puzzleTile() : '<p class="muted">No puzzles for this grade yet.</p>';
  return `<section class="block"><h2>${esc(grade.label)}</h2>${note}<div class="subject-grid">${tiles(subjectsAt(skills))}</div></section>
  <section class="block"><h2>Games</h2><div class="side-tiles">${games}${times}</div></section>
  <section class="block"><h2>Grades</h2><div class="grade-row" role="group" aria-label="Grades">${grades(grade)}</div></section>`;
}
