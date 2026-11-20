// Levels: which skills count, when a level is complete, which levels are open, what feeds the daily mix.
import { skillsOf } from '../skills/registry.js';
import { MAX_LEVEL, MIN_LEVEL, nextLevel } from '../levels.js';
export const enabledIn = (S, n) => skillsOf(n).filter(s => !S.settings.off[s.id]);
// The skills that must be mastered to finish a level: enabled school skills only.
export const requiredIn = (S, n) => enabledIn(S, n).filter(s => s.school);
export const isMastered = (S, id) => !!S.skills[id]?.mastered;
export function levelProgress(S, n) {
const req = requiredIn(S, n);
return { done: req.filter(s => isMastered(S, s.id)).length, total: req.length };
}
export function levelComplete(S, n) { const p = levelProgress(S, n); return p.total > 0 && p.done === p.total; }
export const unlockedLevel = S => Math.min(MAX_LEVEL, Math.max(S.level, ...S.levelsDone.map(n => n + 1)));
export const hasSkills = n => skillsOf(n).length > 0;
// Early Start counts as a lower level only for learners who started there; everyone else stops at Level 1.
export const lowestLevel = S => (S.early || S.level === MIN_LEVEL ? MIN_LEVEL : 1);
// The level whose skills feed practice: the learner's level, or the nearest lower level that has skills.
export function workingLevel(S) {
for (let n = S.level; n >= lowestLevel(S); n--) if (hasSkills(n)) return n;
for (let n = S.level + 1; n <= MAX_LEVEL; n++) if (hasSkills(n)) return n;
return S.level;
}
// Practiced skills from the working level and below, for the "mix" phase.
export function reviewPool(S, exceptId) {
const out = [];
for (let n = workingLevel(S); n >= lowestLevel(S); n--)
for (const s of enabledIn(S, n)) if (!s.story && S.skills[s.id]?.n && s.id !== exceptId) out.push(s);
return out;
}
// Call after a skill is mastered or switched on/off. Returns { done, next } when the current level was just completed.
export function checkLevelUp(S) {
const n = S.level;
if (S.levelsDone.includes(n) || !levelComplete(S, n)) return null;
S.levelsDone.push(n);
const next = nextLevel(n);
if (next === null) return { done: n, next: null };
S.level = next;
return { done: n, next };
}
