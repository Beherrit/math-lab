// "Keep going" practice after the daily page: no timer, no end. Alternates the focus skill and the mix
// (a few due reviews at most), and moves along the learning path when the focus skill is mastered.
import { SKILL } from '../skills/registry.js';
import { pathPick } from './focus.js';
import { scopePath } from './scope.js';
import { mixChoice } from './mix.js';
import { EXTRA_SHARE } from './review-gate.js';
// ex = { n, revs, focus, scope } is kept by the session; `scope` (skill ids) is set when practicing a level or topic.
// Returns { id, review }; id may be 'facts' (own level only) or null when there is no skill at all.
export function extraNext(S, ex, { now, rand, pick }) {
if (!ex.focus || !SKILL[ex.focus] || S.skills[ex.focus]?.mastered || S.settings.off[ex.focus]) ex.focus = ex.scope ? scopePath(S, ex.scope) : pathPick(S);
const turn = ex.n++;
if (turn % 2 === 0 && ex.focus) return { id: ex.focus, review: false };
const m = mixChoice(S, { focus: ex.focus ?? undefined, now, scope: ex.scope, rand, pick, gate: { n: turn, revs: ex.revs ?? 0, share: EXTRA_SHARE } });
if (m.review) ex.revs = (ex.revs ?? 0) + 1;
return m;
}
