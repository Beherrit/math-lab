// Which skill is today's focus: the level's learning path (array order), finishing what is started before starting new things.
import { SKILL, storySkillOf } from '../skills/registry.js';
import { today } from './dates.js';
import { enabledIn, workingLevel } from './progression.js';
const started = (S, id) => (S.skills[id]?.n || 0) > 0;
const openSkills = (S, lvl) => enabledIn(S, lvl).filter(s => !s.story && !S.skills[s.id]?.mastered);
// The next skill on the level's path: the earliest started and not mastered, else the earliest not started. Null when none is open.
// A new skill is never started while another is in progress, so more than three in progress can never build up.
export function pathPick(S, level = workingLevel(S)) {
const open = openSkills(S, level);
return (open.find(s => started(S, s.id)) ?? open[0])?.id ?? null;
}
export function autoFocus(S) {
const lvl = workingLevel(S);
return pathPick(S, lvl) ?? storySkillOf(lvl)?.id ?? enabledIn(S, lvl)[0]?.id ?? null;
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
