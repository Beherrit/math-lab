// Grouping a level's skills by their optional `strand`. Pure: no DOM.
import { isMastered } from './progression.js';
// Groups in the order strands first appear; skills without a strand form a last group with name null.
// `open` marks the group holding `focusId`, or the first group when none does.
export function strandGroups(S, skills, focusId = null) {
const by = new Map(); const none = [];
for (const s of skills) {
if (!s.strand) { none.push(s); continue; }
if (!by.has(s.strand)) by.set(s.strand, []);
by.get(s.strand).push(s);
}
const groups = [...by].map(([name, list]) => ({ name, skills: list }));
if (none.length) groups.push({ name: null, skills: none });
for (const g of groups) { g.total = g.skills.length; g.done = g.skills.filter(s => isMastered(S, s.id)).length; }
const at = groups.findIndex(g => g.skills.some(s => s.id === focusId));
groups.forEach((g, i) => { g.open = i === (at >= 0 ? at : 0); });
return groups;
}
// True when at least one skill has a strand, so headings should show.
export const hasStrands = skills => skills.some(s => s.strand);
