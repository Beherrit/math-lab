// Runs the placement check on screen. The rules live in js/placement.js; this only wires them to the app.
import { S, save } from '../core/store.js';
import { hasSkills } from '../core/progression.js';
import { skillsOf, generate } from '../skills/registry.js';
import { LEVELS, clampLevel } from '../levels.js';
import { startPlacement, answerPlacement, nextPlacementProblem, isDone } from '../placement.js';
import { renderPlaceResult } from '../ui/screens/welcome.js';
import { render } from '../ui/router.js';
import { sess, setSess, newSess } from './state.js';
export function beginPlacement() {
const available = LEVELS.map(l => l.n).filter(hasSkills);
const s = newSess('place', [{ type: 'place', ms: Infinity, label: 'Finding your starting point' }]);
s.place = startPlacement(available);
setSess(s);
}
export function finishPlacement() {
S.level = clampLevel(sess.place.result); S.placed = true; save();
setSess(null);
renderPlaceResult();
}
export function abortPlacement() { setSess(null); render(); }
// Returns the next question, or null after showing the result.
export function placementQuestion() {
const p = sess.place;
if (!isDone(p)) {
const q = nextPlacementProblem(p, { skillsOf, generate, avoid: sess.avoid });
if (q) return q;
p.result = p.level;
}
finishPlacement();
return null;
}
// ok = first-try correct. A skipped or missed question is not ok.
export const recordPlacement = ok => answerPlacement(sess.place, ok);
