// All skills, in level order. Level folders only export arrays; this file is the single place that knows them all.
import * as L1 from './level1/index.js';
import * as L2 from './level2/index.js';
import * as L3 from './level3/index.js';
import * as L4 from './level4/index.js';
import * as L5 from './level5/index.js';
import * as L6 from './level6/index.js';
import * as L7 from './level7/index.js';
const MODULES = [L1, L2, L3, L4, L5, L6, L7];
export const SKILLS = MODULES.flatMap(m => m.SKILLS);
export const SKILL = Object.fromEntries(SKILLS.map(s => [s.id, s]));
export const skillsOf = level => SKILLS.filter(s => s.level === level);
export const storySources = level => MODULES[level - 1]?.STORY_SOURCES ?? [];
// The story skill of a level, or null when the level has no story sources.
export const storySkillOf = level => (storySources(level).length ? skillsOf(level).find(s => s.story) ?? null : null);
export function generate(id, L, avoid = new Set()) {
const s = SKILL[id];
for (let t = 0; t < 8; t++) {
const p = s.gen(L);
if (!p) continue;
const key = (p.expr || '') + (p.story || '') + (p.ask || '');
if (avoid.has(key) && t < 7) continue;
p.key = key; p.skill = id; p.level = L;
return p;
}
return null;
}
