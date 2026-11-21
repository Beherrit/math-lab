// An ordered path for one subject inside one grade. Mastery unlocks the next node.
// Practising, or finishing the lesson, does not. Derived from saved skill state, so it survives a reload.
import { enabledIn, isMastered, workingLevel } from './progression.js';
import { subjectsAt } from './browse.js';
import { isDue } from './review.js';

// `now` is the date string used for "time to review". Nodes stay in path order.
export function pathNodes(S, skills, now = '0000-01-01') {
  let open = true;
  return skills.map((s, i) => {
    const mastered = isMastered(S, s.id);
    let state = 'locked';
    if (mastered) state = 'mastered';
    else if (open) state = 'now';
    if (!mastered) open = false;
    const due = mastered && isDue(S.skills[s.id], now);
    return { id: s.id, n: i + 1, state, due };
  });
}

function groups(S, level) {
  const skills = enabledIn(S, level).filter(s => !s.story);
  const byId = new Map(skills.map(s => [s.id, s]));
  return subjectsAt(skills).map(sub => sub.ids.map(id => byId.get(id)));
}

// The skill the path suggests: the first node that is up next, subjects in path order.
export function suggestNext(S, level = workingLevel(S)) {
  for (const list of groups(S, level)) {
    const now = pathNodes(S, list).find(n => n.state === 'now');
    if (now) return now.id;
  }
  return null;
}

// Mastered skills on this grade's paths whose review day has come, in path order.
export function dueOnPath(S, level, now) {
  const out = [];
  for (const list of groups(S, level)) {
    for (const node of pathNodes(S, list, now)) if (node.due) out.push(node.id);
  }
  return out;
}
