// Live session objects. `sess` is null outside practice; `inp` is what the learner has typed so far.
export let sess = null;
export const setSess = v => { sess = v; };
export const inp = {};
const EMPTY = { val: '', neg: false, w: '', n: '', d: '', f: 'n', pt: null, choice: null };
export function resetInp() { for (const k of Object.keys(inp)) delete inp[k]; Object.assign(inp, EMPTY); }
resetInp();
export function newSess(mode, phases) {
return { mode, phases, pi: 0, el: 0, last: performance.now(), paused: false, stats: { q: 0, c: 0, stars: 0, ups: [], solidNew: 0, mastered: [], unlocked: [], facts: 0, levelUp: null }, start: Date.now(), avoid: new Set(), recentFacts: [], retry: [], n: 0, place: null };
}
