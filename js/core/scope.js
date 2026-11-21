// A scope is a list of skill ids walked in learning order: one level, or one topic. Practice inside a scope never changes
// the learner's own level or today's focus. Ids the registry does not know are ignored.
import { SKILL, skillsOf } from '../skills/registry.js';
export const levelScope = n => skillsOf(n).map(s => s.id);
const isOn = (S, id) => !!SKILL[id] && !S.settings.off[id];
const started = (S, id) => (S.skills[id]?.n || 0) > 0;
// Enabled skills of the scope, in order.
export const scopeSkills = (S, ids) => ids.filter(id => isOn(S, id)).map(id => SKILL[id]);
// The next skill on the path: earliest started and not mastered, else earliest not started. Null when none is open.
export function scopePath(S, ids) {
const open = ids.filter(id => isOn(S, id) && !S.skills[id]?.mastered);
return open.find(id => started(S, id)) ?? open[0] ?? null;
}
// Practiced skills of the scope for the mix, except one.
export const scopePool = (S, ids, exceptId) => scopeSkills(S, ids).filter(s => started(S, s.id) && s.id !== exceptId);
// A skill id that always exists when the scope has any skill: the preferred one, else an enabled one, else any.
export function fallbackId(S, ids, preferred) {
if (preferred && isOn(S, preferred)) return preferred;
const on = scopeSkills(S, ids); const known = ids.filter(id => SKILL[id]).map(id => SKILL[id]);
return (on.find(s => !s.story) ?? on[0] ?? known[0])?.id ?? null;
}
