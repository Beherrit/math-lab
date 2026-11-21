// What the "mix" phase asks next: a few due reviews, then a fact, a story, or a practiced skill.
import { dueReviews } from './review.js';
import { reviewAllowed } from './review-gate.js';
import { reviewPool, workingLevel, factsAllowed } from './progression.js';
import { scopePool, fallbackId, levelScope } from './scope.js';
import { storySkillOf } from '../skills/registry.js';
// Returns { id, review }: id is a skill id, 'facts', or null when there is no skill at all. `rand` and `pick` are injected for tests.
// `gate` limits how many reviews come (review-gate.js). `scope` (a level or topic practice) keeps reviews and the pool inside it and never asks facts.
export function mixChoice(S, { focus, now, scope, gate, rand = Math.random, pick = a => a[Math.floor(rand() * a.length)] }) {
const due = reviewAllowed(S, now, gate) ? dueReviews(S, now).filter(id => !scope || scope.includes(id)) : [];
if (due.length) return { id: due[0], review: true };
if (scope) { const p = scopePool(S, scope, focus); return { id: p.length ? pick(p).id : fallbackId(S, scope, focus), review: false }; }
const lvl = workingLevel(S); const practiced = reviewPool(S, focus);
const story = storySkillOf(lvl); const storyOn = story && !S.settings.off[story.id];
const r = rand();
if (r < 0.15 && factsAllowed(S)) return { id: 'facts', review: false };
if (r < 0.4 && storyOn) return { id: story.id, review: false };
if (practiced.length) return { id: pick(practiced).id, review: false };
return { id: storyOn ? story.id : fallbackId(S, levelScope(lvl), focus), review: false };
}
