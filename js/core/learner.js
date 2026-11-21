// One learner per device: an optional name and school year, stored on the same saved state as progress.
// Choosing a year sets the level. It never erases skills, stars or the day log.
import { startFromBeginning, setCurrentLevel } from './entry.js';

// `label` is the grown-ups wording. `kid` is the first-run button, which says Kindergarten or "Year N"
// so practice screens can keep saying Level and Early Start.
export const GRADES = [
  { id: 'K', label: 'Kindergarten', kid: 'Kindergarten', level: 0 },
  { id: '1', label: 'Grade 1', kid: 'Year 1', level: 1 },
  { id: '2', label: 'Grade 2', kid: 'Year 2', level: 1 },
  { id: '3', label: 'Grade 3', kid: 'Year 3', level: 2 },
  { id: '4', label: 'Grade 4', kid: 'Year 4', level: 3 },
  { id: '5', label: 'Grade 5', kid: 'Year 5', level: 4 },
  { id: '6', label: 'Grade 6', kid: 'Year 6', level: 5 },
  { id: '7', label: 'Grade 7', kid: 'Year 7', level: 6 },
  { id: '8', label: 'Grade 8', kid: 'Year 8', level: 7 },
];

export const gradeById = id => GRADES.find(g => g.id === id) || null;
export const helloName = S => String(S?.name || '').trim();

// First run. No year yet means the starting-point choice still comes next.
export function applySetup(S, { name, grade } = {}) {
  if (name !== undefined) S.name = String(name).trim().slice(0, 20);
  const g = gradeById(grade);
  if (!g) { S.grade = null; S.placed = false; return S; }
  if (g.id === 'K') { startFromBeginning(S); S.grade = 'K'; return S; }
  setGrade(S, g.id);
  return S;
}

// Grown-ups can change the year later. Progress stays. Kindergarten marks an early learner and turns read-aloud on
// only when that choice was never saved.
export function setGrade(S, grade) {
  const g = gradeById(grade);
  S.grade = g ? g.id : null;
  if (!g) return S;
  if (g.level === 0) {
    S.early = true; S.level = 0; S.placed = true; S.todayFocus = null;
    if (typeof S.settings.speak !== 'boolean') S.settings.speak = true;
    return S;
  }
  setCurrentLevel(S, g.level);
  S.placed = true;
  return S;
}
