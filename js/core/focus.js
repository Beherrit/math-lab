// Which skill is today's focus.
import { SKILL, storySkillOf } from '../skills/registry.js';
import { today } from './dates.js';
import { enabledIn, workingLevel } from './progression.js';
export function autoFocus(S) {
const lvl = workingLevel(S);
const open = enabledIn(S, lvl).filter(s => !s.story && !S.skills[s.id]?.mastered);
if (!open.length) return storySkillOf(lvl)?.id ?? enabledIn(S, lvl)[0]?.id ?? null;
const top = open[0].id; const r = S.focusLog.slice(-3).map(x => x.id);
if (r.length === 3 && r.every(x => x === top) && open[1]) return open[1].id;
return top;
}
export function getFocus(S) {
const f = S.settings.focus;
if (f !== 'auto' && SKILL[f] && !S.settings.off[f]) return f;
if (S.todayFocus?.d === today() && SKILL[S.todayFocus.id]) return S.todayFocus.id;
return autoFocus(S);
}
export function logFocus(S, id) { const t = today(); if (S.focusLog.at(-1)?.d !== t) S.focusLog.push({ d: t, id }); S.focusLog = S.focusLog.slice(-10); }
