// What each skill builds on. Within a grade, that is the skill just before it in the same subject.
// A few skills also name an idea from another subject. The graph is checked for cycles, missing ids,
// and any skill that comes before what it needs.
import { SKILLS, SKILL } from '../skills/registry.js';

// Named by hand where the path neighbour is not the real foundation.
const INSTEAD = {
  l7slopewhy: ['l7slope', 'l7similar'],
};
// Extra foundations, on top of the skill just before this one.
const EXTRA = {
  l0on: ['l0count'],
  l1count: ['l0count'],
  l1add20: ['l0add'],
  l1comp: ['l1round'],
  l1open: ['l1jump'],
  l1shapes: ['l0shapes'],
  l2groups: ['l1array'],
  l2add1000: ['l1add20'],
  l2frac: ['l1shares'],
  l3pv: ['l1pv'],
  l3equiv: ['l2equiv'],
  pv: ['l3pv'],
  l5longdiv: ['l4ldiv'],
  l5plane: ['l5neg'],
  l5fdp: ['l5pct', 'l5decops'],
  l5xtable: ['l5eqratio'],
  l6intadd: ['l5neg'],
  l7explaw: ['l5exp'],
  l8line: ['l7line'],
  l8diff: ['l8factor'],
};

function linksFor(skill, previous) {
  if (INSTEAD[skill.id]) return INSTEAD[skill.id].filter(id => id !== skill.id);
  const extra = EXTRA[skill.id] || [];
  return [...new Set([...(previous ? [previous] : []), ...extra])];
}

function buildNeeds(skills) {
  const needs = {};
  const at = new Map(skills.map((s, i) => [s.id, i]));
  let level = -1;
  let last = new Map();
  for (const s of skills) {
    if (s.level !== level) { last = new Map(); level = s.level; }
    const ids = linksFor(s, last.get(s.strand));
    needs[s.id] = ids.filter(id => id !== s.id).sort((a, b) => (at.get(a) ?? 0) - (at.get(b) ?? 0));
    last.set(s.strand, s.id);
  }
  return needs;
}

const NEEDS = buildNeeds(SKILLS);

export const needsOf = id => (NEEDS[id] ? [...NEEDS[id]] : null);

// The nearest listed skill the learner has not mastered. That is the gap a miss can come from.
export function gapSkill(S, id) {
  const off = S?.settings?.off || {};
  const open = (needsOf(id) || []).filter(need => !off[need] && !S?.skills?.[need]?.mastered);
  return open.at(-1) || null;
}

export function missingIds(skills = SKILLS) {
  const bad = [];
  for (const s of skills) {
    const ids = NEEDS[s.id];
    if (!Array.isArray(ids)) { bad.push(s.id); continue; }
    for (const id of ids) if (!SKILL[id]) bad.push(`${s.id}->${id}`);
  }
  return bad;
}

export function orderGaps(skills = SKILLS) {
  const at = new Map(skills.map((s, i) => [s.id, i]));
  const gaps = [];
  for (const s of skills) {
    for (const id of NEEDS[s.id] || []) {
      if (!at.has(id) || at.get(id) > at.get(s.id)) gaps.push([s.id, id]);
    }
  }
  return gaps;
}

function walk(id, seen, stack, path) {
  if (stack.has(id)) return path.slice(path.indexOf(id)).concat(id);
  if (seen.has(id)) return null;
  seen.add(id); stack.add(id);
  for (const next of NEEDS[id] || []) {
    const cycle = walk(next, seen, stack, path.concat(id));
    if (cycle) return cycle;
  }
  stack.delete(id);
  return null;
}

export function cycles(skills = SKILLS) {
  const seen = new Set();
  for (const s of skills) {
    const cycle = walk(s.id, seen, new Set(), []);
    if (cycle) return cycle;
  }
  return null;
}
