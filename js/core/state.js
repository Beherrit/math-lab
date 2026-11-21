// Saved-state shape, defaults and migration. Pure: no localStorage or DOM here.
import { START } from './facts.js';
import { clampLevel, MIN_LEVEL, MAX_LEVEL } from '../levels.js';
import { addDays } from './dates.js';
import { INTERVALS } from './review.js';
import { gradeById } from './learner.js';
export const STATE_VERSION = 3;
export const KEY_V1 = 'mathlab.v1';
export const KEY_V2 = 'mathlab.v2';
export const KEY_V3 = 'mathlab.v3';
export const newSkillState = () => ({ L: 1, run: 0, miss: 0, hist: [], n: 0, c: 0, last: null, mastered: false, rev: null });
// A mastered skill from an older save starts its review schedule from the day it was last practiced.
function fillReview(sk, created) {
const from = sk.last || created;
if (sk.rev === undefined) sk.rev = sk.mastered && from ? { stage: 0, due: addDays(from, INTERVALS[0]), miss: 0 } : null;
return sk;
}
function fillChallenge(c) {
const o = c && typeof c === 'object' ? c : {};
const streak = o.streak && typeof o.streak === 'object' ? o.streak : {};
o.streak = { n: Number(streak.n) || 0, last: streak.last || null };
o.done = o.done && typeof o.done === 'object' && !Array.isArray(o.done) ? o.done : {};
o.today = o.today && o.today.d && Array.isArray(o.today.items) ? o.today : null;
return o;
}
function fillDefaults(s) {
s.settings ||= {}; s.settings.minutes ??= 10; s.settings.gradual ??= true; s.settings.off ||= {}; s.settings.focus ??= 'auto';
s.settings.sound ??= false; s.settings.letters ??= false; s.settings.theme ??= 'system';
s.facts ||= {}; s.unlocked ||= [...START]; s.skills ||= {}; s.days ||= {}; s.stars ||= 0;
s.streak ||= { n: 0, last: null }; s.badges ||= []; s.focusLog ||= []; s.counters ||= { story: 0, sprintBest: 0 };
s.learned = s.learned && typeof s.learned === 'object' ? s.learned : {};
s.grade = gradeById(s.grade) ? s.grade : null;
s.challenge = fillChallenge(s.challenge);
for (const sk of Object.values(s.skills)) fillReview(sk, s.created);
s.level = clampLevel(s.level); s.placed = !!s.placed;
s.early = s.early === true || s.level === MIN_LEVEL; // started at, or was set to, Early Start
s.levelsDone = Array.isArray(s.levelsDone) ? s.levelsDone.filter(n => Number.isInteger(n) && n >= MIN_LEVEL && n <= MAX_LEVEL) : [];
return s;
}
// v1 and v2 both migrate to v3. A v1 learner (the original single skill list) is a placed Level 4 learner; every progress field is kept.
export function migrate(raw) {
if (!raw || typeof raw !== 'object' || ![1, 2, 3].includes(raw.v)) return null;
const s = { ...raw };
if (s.v === 1) { s.v = 2; s.level = 4; s.placed = true; s.levelsDone = []; }
if (s.v === 2) s.v = 3;
return fillDefaults(s);
}
export const freshState = (name, day) => fillDefaults({ v: STATE_VERSION, name, created: day, level: 1, placed: false, early: false, levelsDone: [] });
