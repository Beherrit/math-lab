// Today's small challenge: a date-seeded mix of review, one stretch, and a puzzle.
// Pure aside from the state object it is given. The date is injected so tests can move the calendar.
import { SKILL, generate } from '../skills/registry.js';
import { gameMeta } from '../games/catalog.js';
import { rngFrom } from '../games/rng.js';
import { dueReviews } from './review.js';
import { enabledIn, lowestLevel, workingLevel } from './progression.js';
import { suggestNext, dueOnPath } from './path.js';
import { puzzlesFor, activeGrade } from './browse.js';
import { addDays } from './dates.js';

const REVIEW_N = 2;

function stretchId(S, level) {
  const id = suggestNext(S, level);
  if (id && SKILL[id]?.level === level) return id;
  return enabledIn(S, level + 1).find(s => !s.story)?.id || null;
}

function reviewIds(S, date, level, stretch, rng) {
  const onPath = dueOnPath(S, level, date).filter(id => id !== stretch);
  const due = dueReviews(S, date).filter(id => {
    const s = SKILL[id];
    return s && !s.story && s.level <= level && id !== stretch && !onPath.includes(id);
  });
  const ids = [...onPath, ...due].slice(0, REVIEW_N);
  const extras = [];
  for (let n = level; n >= lowestLevel(S); n--) {
    for (const s of enabledIn(S, n)) {
      if (s.story || s.id === stretch || ids.includes(s.id)) continue;
      const st = S.skills[s.id];
      if (st?.mastered || (st?.n || 0) > 0) extras.push(s.id);
    }
  }
  for (const id of rng.shuffle(extras)) {
    if (ids.length >= REVIEW_N) break;
    ids.push(id);
  }
  return ids;
}

// Same date, grade, and progress always return the same items.
export function buildChallenge(S, date) {
  const level = workingLevel(S);
  const grade = activeGrade(S).id;
  const rng = rngFrom(`${date}|${grade}|${level}`);
  const stretch = stretchId(S, level);
  const reviews = reviewIds(S, date, level, stretch, rng);
  const puzzles = puzzlesFor(level, null, S.settings?.off || {});
  const puzzle = puzzles.length ? rng.pick(puzzles).id : null;
  const items = [
    ...reviews.map(skill => ({ kind: 'review', skill, seed: `${date}|review|${skill}` })),
    ...(stretch ? [{ kind: 'stretch', skill: stretch, seed: `${date}|stretch|${stretch}` }] : []),
    ...(puzzle ? [{ kind: 'puzzle', game: puzzle, seed: `${date}|puzzle|${puzzle}` }] : []),
  ];
  return { date, grade, level, items };
}

export function itemTier(S, item) {
  const st = S.skills[item.skill];
  if (item.kind === 'stretch') return Math.min(3, st?.n ? (st.L || 1) : 1);
  return st?.mastered ? 2 : (st?.L || 1);
}

// One problem for a skill item. The seed fixes Math.random for that build only.
export function seededProblem(S, item) {
  const rng = rngFrom(item.seed);
  const prev = Math.random;
  Math.random = rng.rnd;
  try { return generate(item.skill, itemTier(S, item)); }
  finally { Math.random = prev; }
}

const itemKey = it => `${it.kind}:${it.skill || it.game}`;

// Keep a started set for the day. Rebuild when the day, grade, or progress changes and nothing is answered yet.
export function syncChallenge(S, date) {
  if (!S.challenge) S.challenge = { streak: { n: 0, last: null }, done: {}, today: null };
  const built = buildChallenge(S, date);
  const cur = S.challenge.today;
  const started = !!cur?.items?.some(it => it.status);
  const same = cur && cur.d === date && cur.items.map(itemKey).join('|') === built.items.map(itemKey).join('|');
  if (cur && cur.d === date && (started || same)) return cur;
  S.challenge.today = {
    d: date, grade: built.grade, level: built.level,
    items: built.items.map(it => ({ ...it, status: null })),
  };
  return S.challenge.today;
}

export function challengeStreak(S, date) {
  const st = S.challenge?.streak;
  if (!st?.last) return 0;
  if (st.last === date || st.last === addDays(date, -1)) return st.n;
  return 0;
}

export function streakLabel(n) {
  if (!n) return 'No streak yet.';
  return n === 1 ? '1 day in a row.' : `${n} days in a row.`;
}

// Marks the day done and moves the challenge streak. A second finish the same day does nothing.
export function completeChallenge(S, date) {
  if (!S.challenge) S.challenge = { streak: { n: 0, last: null }, done: {}, today: null };
  if (S.challenge.done[date]) return { already: true, streak: challengeStreak(S, date) };
  S.challenge.done[date] = true;
  const prev = S.challenge.streak.last;
  if (prev !== date) {
    S.challenge.streak.n = prev === addDays(date, -1) ? S.challenge.streak.n + 1 : 1;
    S.challenge.streak.last = date;
  }
  return { already: false, streak: S.challenge.streak.n };
}

export function noteAnswer(S, date, index, ok) {
  const set = S.challenge?.today;
  if (!set || set.d !== date || !set.items[index]) return null;
  const item = set.items[index];
  if (item.status) return { already: true, done: set.items.every(it => it.status), streak: challengeStreak(S, date) };
  item.status = ok ? 'right' : 'wrong';
  const done = set.items.every(it => it.status);
  if (!done) return { already: false, done: false, streak: challengeStreak(S, date) };
  return { already: false, done: true, ...completeChallenge(S, date) };
}

export function monthTitle(date) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Monday-first cells for the month containing `date`. Nulls are the blank days before the 1st.
export function monthCells(date) {
  const [y, m] = date.split('-').map(Number);
  const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const count = new Date(y, m, 0).getDate();
  const cells = Array(lead).fill(null);
  for (let d = 1; d <= count; d++) cells.push(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  return cells;
}

export const itemLabel = item => (item.kind === 'review' ? 'Remember' : item.kind === 'stretch' ? 'Try something new' : 'Puzzle');

export function itemTitle(item) {
  if (item.kind === 'puzzle') return gameMeta(item.game)?.title || 'Puzzle';
  return SKILL[item.skill]?.title || 'Practice';
}
