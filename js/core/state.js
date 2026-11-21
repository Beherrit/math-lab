// Saved-state shape, defaults and migration. Pure: no localStorage or DOM here.
import { START } from './facts.js';
import { clampLevel, MIN_LEVEL, MAX_LEVEL } from '../levels.js';
import { today } from './dates.js';
import { migratedReview } from './review.js';
export const STATE_VERSION = 3;
export const KEY_V1 = 'mathlab.v1';
export const KEY_V2 = 'mathlab.v2';
export const KEY_V3 = 'mathlab.v3';
export const newSkillState = () => ({ L: 1, run: 0, miss: 0, hist: [], n: 0, c: 0, last: null, mastered: false, rev: null });
// A mastered skill from an older save gets a review schedule from the day it was last practiced, spread out (see review.js).
function fillReview(id, sk, created, now) {
const from = sk.last || created;
if (sk.rev === undefined) sk.rev = sk.mastered && from ? migratedReview(id, from, now) : null;
return sk;
}
const hasProgress = s => (s.stars > 0) || Object.values(s.skills || {}).some(k => k && k.n > 0);
// `old` is a v1 or v2 save: a level that is missing or garbage becomes 4 when there is progress, 1 otherwise. Never Early Start.
function fillDefaults(s, now, old = false) {
s.settings ||= {}; s.settings.minutes ??= 10; s.settings.gradual ??= true; s.settings.off ||= {}; s.settings.focus ??= 'auto';
s.facts ||= {}; s.unlocked ||= [...START]; s.skills ||= {}; s.days ||= {}; s.stars ||= 0;
s.streak ||= { n: 0, last: null }; s.badges ||= []; s.focusLog ||= []; s.counters ||= { story: 0, sprintBest: 0 };
s.learned = s.learned && typeof s.learned === 'object' ? s.learned : {};
for (const [id, sk] of Object.entries(s.skills)) if (sk && typeof sk === 'object') fillReview(id, sk, s.created, now);
s.level = clampLevel(s.level, old && hasProgress(s) ? 4 : 1); s.placed = !!s.placed;
s.early = s.early === true || s.level === MIN_LEVEL; // started at, or was set to, Early Start
s.levelsDone = Array.isArray(s.levelsDone) ? s.levelsDone.filter(n => Number.isInteger(n) && n >= MIN_LEVEL && n <= MAX_LEVEL) : [];
return s;
}
// v1 and v2 both migrate to v3. A v1 learner (the original single skill list) is a placed Level 4 learner; every progress field is kept.
export function migrate(raw, now = today()) {
if (!raw || typeof raw !== 'object' || ![1, 2, 3].includes(raw.v)) return null;
const s = { ...raw }; const old = raw.v < 3;
if (s.v === 1) { s.v = 2; s.level = 4; s.placed = true; s.levelsDone = []; }
if (s.v === 2) s.v = 3;
return fillDefaults(s, now, old);
}
export const freshState = (name, day) => fillDefaults({ v: STATE_VERSION, name, created: day, level: 1, placed: false, early: false, levelsDone: [] }, day);
