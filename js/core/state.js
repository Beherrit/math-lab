// Saved-state shape, defaults and migration. Pure: no localStorage or DOM here.
import { START } from './facts.js';
import { clampLevel } from '../levels.js';
export const STATE_VERSION = 2;
export const KEY_V1 = 'mathlab.v1';
export const KEY_V2 = 'mathlab.v2';
export const newSkillState = () => ({ L: 1, run: 0, miss: 0, hist: [], n: 0, c: 0, last: null, mastered: false });
function fillDefaults(s) {
s.settings ||= {}; s.settings.minutes ??= 10; s.settings.gradual ??= true; s.settings.off ||= {}; s.settings.focus ??= 'auto';
s.facts ||= {}; s.unlocked ||= [...START]; s.skills ||= {}; s.days ||= {}; s.stars ||= 0;
s.streak ||= { n: 0, last: null }; s.badges ||= []; s.focusLog ||= []; s.counters ||= { story: 0, sprintBest: 0 };
s.level = clampLevel(s.level); s.placed = !!s.placed;
s.levelsDone = Array.isArray(s.levelsDone) ? s.levelsDone.filter(n => n >= 1 && n <= 7) : [];
return s;
}
// A v1 learner (the original single skill list) is a placed Level 4 learner; every progress field is kept.
export function migrate(raw) {
if (!raw || typeof raw !== 'object' || ![1, 2].includes(raw.v)) return null;
const s = { ...raw };
if (s.v === 1) { s.v = 2; s.level = 4; s.placed = true; s.levelsDone = []; }
return fillDefaults(s);
}
export const freshState = (name, day) => fillDefaults({ v: STATE_VERSION, name, created: day, level: 1, placed: false, levelsDone: [] });
