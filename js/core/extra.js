// "Keep going" practice after the daily page: no timer, no end. Alternates the focus skill and the mix
// (due reviews first), and moves along the learning path when the focus skill is mastered.
import { SKILL } from '../skills/registry.js';
import { pathPick } from './focus.js';
import { suggestNext } from './path.js';
import { mixChoice } from './mix.js';
// ex = { n, focus } is kept by the session. Returns { id, review }; id may be 'facts'.
export function extraNext(S, ex, { now, rand, pick }) {
if (!ex.focus || !SKILL[ex.focus] || S.skills[ex.focus]?.mastered || S.settings.off[ex.focus]) ex.focus = suggestNext(S) || pathPick(S);
const turn = ex.n++;
if (turn % 2 === 0 && ex.focus) return { id: ex.focus, review: false };
const m = mixChoice(S, { focus: ex.focus ?? undefined, now, rand, pick });
return { id: m.id ?? 'facts', review: m.review };
}
