// Puzzles. Each round is built from a seed and checked against that round's answer.
import { rngFrom } from './rng.js';
import { patternMeta, makePattern } from './pattern.js';
import { fitMeta, makeFit } from './fit.js';
import { tenMeta, makeTen } from './ten.js';
import { jumpMeta, makeJump } from './jump.js';
import { clockMeta, makeClock } from './clock.js';
import { shapeMeta, makeCompose } from './compose.js';

const GAMES = [
  { ...patternMeta, make: makePattern },
  { ...fitMeta, make: makeFit },
  { ...tenMeta, make: makeTen },
  { ...jumpMeta, make: makeJump },
  { ...clockMeta, make: makeClock },
  { ...shapeMeta, make: makeCompose },
];

export const gameList = () => GAMES.map(({ id, title, blurb, skill }) => ({ id, title, blurb, skill }));
export const gameMeta = id => gameList().find(g => g.id === id) || null;

export function makeRound(id, seed) {
  const g = GAMES.find(x => x.id === id);
  if (!g) return null;
  const round = g.make(rngFrom(seed));
  round.game = id;
  round.skill = g.skill;
  return round;
}

// `known` is false when the tap is not one of this round's choices.
export function checkRound(round, choiceId) {
  if (!round || !round.choices?.some(c => c.id === choiceId)) return { ok: false, why: round?.why || '', known: false };
  return { ok: choiceId === round.answer, why: round.why, known: true };
}
