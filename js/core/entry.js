// How a learner enters the ladder and which levels they can see. Pure: works on the state object, no DOM, no storage.
import { LEVELS, MIN_LEVEL, clampLevel } from '../levels.js';
// "Start from the very beginning": Early Start, counted as placed, with read-aloud on from the first question.
export function startFromBeginning(S) {
Object.assign(S, { level: MIN_LEVEL, placed: true, early: true, todayFocus: null });
S.settings.speak = true;
return S;
}
// The starting-point check never places anyone at Early Start; `early` is left as it was.
export function applyPlacement(S, result) {
S.level = Math.max(1, clampLevel(result)); S.placed = true; S.todayFocus = null;
return S;
}
// A grown-up (or the level chips) sets the current level. Choosing Early Start marks the learner as an early learner.
export function setCurrentLevel(S, n) {
const level = clampLevel(n);
if (level === MIN_LEVEL) { S.early = true; S.settings.speak ??= true; }
S.level = level; S.todayFocus = null;
return level;
}
// Early Start is shown only to learners who started there or were set there.
export const visibleLevels = S => LEVELS.filter(l => l.n !== MIN_LEVEL || S.early || S.level === MIN_LEVEL);
export const canOpenLevel = (S, n) => visibleLevels(S).some(l => l.n === n);
