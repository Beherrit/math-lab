// Per-skill progress: three steps (L 1-3) inside a skill, then mastery. All functions take the state.
import { today } from './dates.js';
import { newSkillState } from './state.js';
import { startReview } from './review.js';
export const NEED = { 1: 4, 2: 5 };
export const skillState = (S, id) => S.skills[id] ||= newSkillState();
export function progress(S, id) {
const s = S.skills[id]; if (!s) return 0; if (s.mastered) return 100;
if (s.L < 3) return Math.round(((s.L - 1) + Math.min(s.run / NEED[s.L], 1) * 0.9) / 3 * 100);
const good = s.hist.slice(-8).filter(Boolean).length;
return Math.round((2 + Math.min(good / 7, 1) * 0.95) / 3 * 100);
}
// res: 'right' (first try), 'half' (right after help or a retry), 'wrong'. Returns { up, down, mastered }.
export function recordSkill(S, id, res) {
const s = skillState(S, id); s.n++; s.last = today(); const out = {};
if (res === 'right') {
s.c++; s.run++; s.miss = 0;
if (s.L === 3) s.hist.push(true);
else if (s.run >= NEED[s.L]) { s.L++; s.run = 0; out.up = s.L; }
} else {
s.run = 0;
if (res === 'wrong') {
s.miss++; if (s.L === 3) s.hist.push(false);
if (s.miss >= 2 && s.L > 1) { s.L--; s.miss = 0; out.down = s.L; }
}
}
s.hist = s.hist.slice(-12);
if (s.L === 3 && !s.mastered) { const last = s.hist.slice(-8); if (last.length >= 8 && last.filter(Boolean).length >= 7) { s.mastered = true; s.rev = startReview(today()); out.mastered = true; } }
return out;
}
