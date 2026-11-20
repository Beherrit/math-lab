// Test helper: run fn with the registry holding only the given fake skills (id, level, strand...), then put the real ones back.
import { SKILLS, SKILL } from '../../js/skills/registry.js';
export function withFakeSkills(list, fn) {
  const saved = SKILLS.slice(); const savedMap = { ...SKILL };
  SKILLS.splice(0, SKILLS.length, ...list);
  for (const k of Object.keys(SKILL)) delete SKILL[k];
  for (const s of list) SKILL[s.id] = s;
  try { return fn(); } finally {
    SKILLS.splice(0, SKILLS.length, ...saved);
    for (const k of Object.keys(SKILL)) delete SKILL[k];
    Object.assign(SKILL, savedMap);
  }
}
export const fake = (id, extra = {}) => ({ id, level: 1, title: id, sub: id, school: true, learn: { big: id, tips: [] }, ...extra });
