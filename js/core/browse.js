// What the home screen browses: subjects (strands) inside a grade, and the puzzles that belong with them.
// Pure: pass in the skill list. Child-facing names live here so screens do not say "Level N".
import { SKILL } from '../skills/registry.js';
import { levelTitle } from '../levels.js';
import { gameList } from '../games/catalog.js';
import { GRADES, gradeById, helloName } from './learner.js';

const SHORT = {
  'Numbers': 'Numbers',
  'Adding and subtracting': 'Adding',
  'Multiplying and dividing': 'Multiplying',
  'Fractions and decimals': 'Fractions',
  'Ratios and percents': 'Ratios',
  'Algebra': 'Algebra',
  'Measurement': 'Measuring',
  'Shapes and space': 'Shapes',
  'Data and chance': 'Data',
  'Stories': 'Stories',
  'Colors': 'Colors',
  'Letters': 'Letters',
  'More': 'More',
};

export const subjectShort = name => SHORT[name] || name;

// Subjects in learning-path order. Skills with no strand share a last group, "More".
export function subjectsAt(skills) {
  const out = [];
  for (const s of skills) {
    const name = s.strand || 'More';
    let g = out.find(x => x.name === name);
    if (!g) { g = { name, short: subjectShort(name), ids: [] }; out.push(g); }
    g.ids.push(s.id);
  }
  return out;
}

export const skillsIn = (skills, name) => skills.filter(s => (s.strand || 'More') === name);

// Puzzles whose lesson sits in this grade band, and in this subject when one is given.
export function puzzlesFor(level, strand, off = {}) {
  return gameList().filter(g => {
    const skill = SKILL[g.skill];
    if (!skill || skill.level !== level || off[g.skill]) return false;
    return !strand || (skill.strand || 'More') === strand;
  });
}

export const activeGrade = S => gradeById(S?.grade) || GRADES.find(g => g.level === S?.level) || GRADES[0];

// Kindergarten, or the band title (Number sense, Times tables and sharing, ...). Never "Level N".
export const bandName = n => (n === 0 ? 'Kindergarten' : (levelTitle(n) || 'the next grade'));

export function moveLine(done, next) {
  if (next == null) return `${bandName(done)} is finished.`;
  return `${bandName(done)} is finished. Next is ${bandName(next)}.`;
}

export function homeSay(S, skills) {
  const hi = helloName(S) ? `Hi, ${helloName(S)}.` : 'Hi.';
  const subs = subjectsAt(skills).map(s => s.short).join(', ');
  const grade = activeGrade(S).label;
  return `${hi} You are in ${grade}. Tap Start to practice. Or tap a subject: ${subs}.`;
}
