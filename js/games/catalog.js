// Puzzles. Each round is built from a seed and checked against that round's answer.
import { rngFrom } from './rng.js';
import { patternMeta, makePattern } from './pattern.js';
import { fitMeta, makeFit } from './fit.js';
import { tenMeta, makeTen } from './ten.js';
import { jumpMeta, makeJump } from './jump.js';
import { clockMeta, makeClock } from './clock.js';
import { shapeMeta, makeCompose } from './compose.js';
import { splitMeta, makeSplit } from './split.js';
import { barsMeta, makeBars } from './bars.js';
import { orderMeta, makeOrder } from './order.js';
import { mixMeta, makeMix } from './mix.js';
import { balanceMeta, makeBalance } from './balance.js';
import { signsMeta, makeSigns } from './signs.js';
import { squaresMeta, makeSquares } from './squares.js';
import { crossMeta, makeCross } from './cross.js';
import { cornerMeta, makeCorner } from './corner.js';
import { growthMeta, makeGrowth } from './growth.js';
import { secantMeta, makeSecant } from './secant.js';
import { magicMeta, makeMagic } from './magic.js';
import { cageMeta, makeCage } from './cage.js';
import { gapMeta, makeGap } from './gap.js';
import { guessMeta, makeGuess } from './guess.js';
import { buildMeta, makeBuild } from './build.js';
import { riddleMeta, makeRiddle } from './riddle.js';
import { matchMeta, makeMatch } from './match.js';

const GAMES = [
  { ...patternMeta, make: makePattern },
  { ...fitMeta, make: makeFit },
  { ...tenMeta, make: makeTen },
  { ...jumpMeta, make: makeJump },
  { ...clockMeta, make: makeClock },
  { ...shapeMeta, make: makeCompose },
  { ...splitMeta, make: makeSplit },
  { ...barsMeta, make: makeBars },
  { ...orderMeta, make: makeOrder },
  { ...mixMeta, make: makeMix },
  { ...balanceMeta, make: makeBalance },
  { ...signsMeta, make: makeSigns },
  { ...squaresMeta, make: makeSquares },
  { ...crossMeta, make: makeCross },
  { ...cornerMeta, make: makeCorner },
  { ...growthMeta, make: makeGrowth },
  { ...secantMeta, make: makeSecant },
  { ...magicMeta, make: makeMagic },
  { ...cageMeta, make: makeCage },
  { ...gapMeta, make: makeGap },
  { ...guessMeta, make: makeGuess },
  { ...buildMeta, make: makeBuild },
  { ...riddleMeta, make: makeRiddle },
  { ...matchMeta, make: makeMatch },
];

export const gameList = () => GAMES.map(({ id, title, blurb, skill, levels }) => ({ id, title, blurb, skill, levels }));
export const gameMeta = id => gameList().find(g => g.id === id) || null;

export function makeRound(id, seed, level) {
  const g = GAMES.find(x => x.id === id);
  if (!g) return null;
  const lv = level == null ? (g.levels ? g.levels[0] : undefined) : level;
  const round = g.make(rngFrom(seed), lv);
  round.game = id;
  round.skill = g.skill;
  return round;
}

// `known` is false when the tap is not one of this round's choices.
export function checkRound(round, choiceId) {
  if (!round || !round.choices?.some(c => c.id === choiceId)) return { ok: false, why: round?.why || '', known: false };
  return { ok: choiceId === round.answer, why: round.why, known: true };
}
