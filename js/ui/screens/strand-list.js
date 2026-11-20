// A level's skills as collapsible strand groups (or one plain list when no skill has a strand).
import { strandGroups, hasStrands } from '../../core/strands.js';
function group(g, row) {
const rows = `<div class="skills">${g.skills.map(row).join('')}</div>`;
if (!g.name) return `<div class="strand loose">${rows}</div>`;
return `<details class="strand" ${g.open ? 'open' : ''}><summary><span class="st-name">${g.name}</span><span class="st-count">${g.done} of ${g.total} mastered</span></summary>${rows}</details>`;
}
// row(skill) renders one skill; focusId decides which group starts open.
export function strandList(S, skills, row, focusId) {
if (!hasStrands(skills)) return `<div class="skills">${skills.map(row).join('')}</div>`;
return `<div class="strands">${strandGroups(S, skills, focusId).map(g => group(g, row)).join('')}</div>`;
}
