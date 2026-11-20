// Placement ("Let's find your starting point"): pure logic, no DOM, no storage.
//
// Rules: start at level 2. Two first-try right answers in a row at a level move up one level.
// Two misses at a level stop there and place the learner AT that level. Missing both of the
// first two questions drops to level 1. At most 14 questions. "I haven't learned this yet" is a miss.
// A level with no skills is a ceiling: the ladder never climbs into it.
export const MAX_QUESTIONS = 14;
export const START_LEVEL = 2;
export const PLACEMENT_L = 2; // difficulty step used for the questions

// `available` is the list of levels that have at least one skill, ascending.
export function startPlacement(levels) {
const available = levels.filter(n => n >= 1); // the check never places anyone at Early Start
const has = n => available.includes(n);
const level = has(START_LEVEL) ? START_LEVEL : has(1) ? 1 : (available[0] ?? 1);
return { has, level, start: level, streak: 0, misses: 0, asked: 0, first: [], result: available.length ? null : 1 };
}
export const isDone = p => p.result !== null;
function settle(p, level) { p.result = Math.max(1, level); }
function moveUp(p) {
if (!p.has(p.level + 1)) return settle(p, p.level);
p.level++; p.streak = 0; p.misses = 0;
}
// ok = answered correctly on the first try. Returns the placed level once finished, otherwise null.
export function answerPlacement(p, ok) {
if (isDone(p)) return p.result;
p.asked++;
if (p.asked <= 2) p.first.push(ok);
if (ok) p.streak++; else { p.streak = 0; p.misses++; }
if (p.asked === 2 && p.level === p.start && p.first.every(x => !x)) settle(p, p.has(p.start - 1) ? p.start - 1 : p.start);
else if (p.misses >= 2) settle(p, p.level);
else if (p.streak >= 2) moveUp(p);
if (!isDone(p) && p.asked >= MAX_QUESTIONS) settle(p, p.level);
return p.result;
}
// Next question for the current level: { skill, L } picked with the injected `skillsOf` and `generate`.
export function nextPlacementProblem(p, { skillsOf, generate, avoid = new Set() }) {
const pool = skillsOf(p.level);
for (let t = 0; t < 12 && pool.length; t++) {
const s = pool[Math.floor(Math.random() * pool.length)];
const q = generate(s.id, PLACEMENT_L, avoid);
if (q) return q;
}
return null;
}
