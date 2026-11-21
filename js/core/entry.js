// How a learner enters the ladder and which levels they can see. Pure: works on the state object, no DOM, no storage.
import { LEVELS, MIN_LEVEL, clampLevel } from '../levels.js';
// "Start from the very beginning": Early Start, counted as placed. Read aloud follows the level (on at Early Start) until a grown-up chooses.
export function startFromBeginning(S) {
Object.assign(S, { level: MIN_LEVEL, placed: true, early: true, todayFocus: null });
return S;
}
// The starting-point check never places anyone at Early Start; `early` is left as it was.
export function applyPlacement(S, result) {
S.level = Math.max(1, clampLevel(result)); S.placed = true; S.todayFocus = null;
return S;
}
// A grown-up (or "Make this my level") sets the learner's own level. Choosing Early Start marks the learner as an early learner.
export function setCurrentLevel(S, n) {
const level = clampLevel(n);
if (level === MIN_LEVEL) S.early = true;
S.level = level; S.todayFocus = null;
return level;
}
// Levels 1 to 7 are always open. Early Start shows for learners who started there or were set there, or when a grown-up switches it on.
export const showsEarly = S => S.early === true || S.level === MIN_LEVEL || S.settings?.showEarly === true;
export const visibleLevels = S => LEVELS.filter(l => l.n !== MIN_LEVEL || showsEarly(S));
export const canOpenLevel = (S, n) => visibleLevels(S).some(l => l.n === n);
