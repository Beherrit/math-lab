// What the "mix" phase asks next: due reviews first, then a fact, a story, or a practiced skill.
import { dueReviews } from './review.js';
import { reviewPool, workingLevel } from './progression.js';
import { storySkillOf } from '../skills/registry.js';
// Returns { id, review }: id is a skill id or 'facts'. `rand` and `pick` are injected for tests.
export function mixChoice(S, { focus, now, rand = Math.random, pick = a => a[Math.floor(rand() * a.length)] }) {
const due = dueReviews(S, now);
if (due.length) return { id: due[0], review: true };
const practiced = reviewPool(S, focus);
const story = storySkillOf(workingLevel(S)); const storyOn = story && !S.settings.off[story.id];
const r = rand();
if (r < 0.15 && workingLevel(S) > 0) return { id: 'facts', review: false };
if (r < 0.4 && storyOn) return { id: story.id, review: false };
if (practiced.length) return { id: pick(practiced).id, review: false };
return { id: storyOn ? story.id : focus, review: false };
}
