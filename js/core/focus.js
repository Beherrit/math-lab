// Which skill is today's focus: the level's learning path (array order), finishing what is started before starting new things.
import { SKILL, storySkillOf } from '../skills/registry.js';
import { today } from './dates.js';
import { enabledIn, workingLevel } from './progression.js';
export const MAX_STARTED = 3; // while more skills than this are started, never jump to a brand-new one
const started = (S, id) => (S.skills[id]?.n || 0) > 0;
const openSkills = (S, lvl) => enabledIn(S, lvl).filter(s => !s.story && !S.skills[s.id]?.mastered);
// The next skill on the level's path: earliest started and not mastered, else earliest not started. Null when none is open.
export function pathPick(S) {
const open = openSkills(S, workingLevel(S));
return (open.find(s => started(S, s.id)) ?? open[0])?.id ?? null;
}
export function autoFocus(S) {
const lvl = workingLevel(S);
const open = openSkills(S, lvl);
if (!open.length) return storySkillOf(lvl)?.id ?? enabledIn(S, lvl)[0]?.id ?? null;
const inProgress = open.filter(s => started(S, s.id)); const fresh = open.filter(s => !started(S, s.id));
const top = (inProgress[0] ?? fresh[0]).id; const r = S.focusLog.slice(-3).map(x => x.id);
if (r.length === 3 && r.every(x => x === top)) {
// Same skill three days running: move along the path, but only to a new skill while few are started.
const alt = inProgress[0]?.id === top ? (inProgress[1] ?? (inProgress.length <= MAX_STARTED ? fresh[0] : null)) : fresh[1];
if (alt) return alt.id;
}
return top;
}
export function getFocus(S) {
const f = S.settings.focus;
if (f !== 'auto' && SKILL[f] && !S.settings.off[f]) return f;
const t = S.todayFocus;
if (t?.d === today() && SKILL[t.id] && !(t.auto && S.skills[t.id]?.mastered)) return t.id;
return autoFocus(S);
}
// Called when a daily page starts: logs the day and fixes the automatic pick for the day (a manual pick is kept).
export function logFocus(S, id) {
const t = today();
if (S.focusLog.at(-1)?.d !== t) S.focusLog.push({ d: t, id });
if (S.todayFocus?.d !== t) S.todayFocus = { d: t, id, auto: true };
S.focusLog = S.focusLog.slice(-10);
}
