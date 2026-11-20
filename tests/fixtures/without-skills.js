// Test helper: run fn while the registry holds no skills that match drop(skill), then put them back.
// The registry reads its SKILLS array on every call, so this stands in for a level that has no content yet.
import { SKILLS } from '../../js/skills/registry.js';
export function withoutSkills(drop, fn) {
  const saved = SKILLS.slice();
  SKILLS.splice(0, SKILLS.length, ...saved.filter(s => !drop(s)));
  try { return fn(); } finally { SKILLS.splice(0, SKILLS.length, ...saved); }
}
export const withEmptyLevels = (levels, fn) => withoutSkills(s => levels.includes(s.level), fn);
