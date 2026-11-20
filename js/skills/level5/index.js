// Level 5: ratios, percents and negatives. The skills come from the strand files, listed in learning-path order;
// this file adds the story skill and the story sources.
import { ratioWord, mixWord } from './ratios.js';
import { rateWord } from './rates.js';
import { pctWord, wholeWord } from './percents.js';
import { fracDivWord } from './fracdiv.js';
import { gcfWord } from './factors.js';
import { addWord, subWord, changeWord, splitWord } from './decimals.js';
import { tempWord } from './negatives.js';
import { exprWord } from './expressions.js';
import { eqWord } from './equations.js';
import { areaWord } from './area.js';
import { boxWord } from './solids.js';
import { statWord } from './stats.js';
import { divWord } from './longdiv.js';
import { convWord } from './unitconv.js';
import { whatPctWord } from './whatpct.js';
import { polyWord } from './polyplane.js';
import { solutionWord } from './solution.js';
import { fracVolWord } from './fracvol.js';
import { skillIn } from './skill.js';
import { makeStory } from '../level4/story.js';
import { SKILLS as MULDIV } from './defs-muldiv.js';
import { SKILLS as FRACDEC } from './defs-fracdec.js';
import { SKILLS as RATIOS } from './defs-ratio.js';
import { SKILLS as NUMBERS } from './defs-numbers.js';
import { SKILLS as MEASURE } from './defs-measure.js';
import { SKILLS as SHAPES } from './defs-shapes.js';
import { SKILLS as ALGEBRA } from './defs-algebra.js';
import { SKILLS as DATA } from './defs-data.js';

// Story problems for this level: each source is (L) => a story problem object.
export const STORY_SOURCES = [ratioWord, mixWord, rateWord, pctWord, wholeWord, fracDivWord, gcfWord, addWord, subWord, changeWord, splitWord, tempWord, exprWord, eqWord, areaWord, boxWord, statWord, divWord, convWord, whatPctWord, polyWord, solutionWord, fracVolWord];
// The three steps of the story skill: one operation first, then the standard mix, then problems that take several steps.
const STORY_STEPS = [
  [addWord, subWord, rateWord, eqWord, areaWord, tempWord, gcfWord, divWord, () => solutionWord(1)],
  [ratioWord, mixWord, rateWord, pctWord, wholeWord, fracDivWord, gcfWord, eqWord, areaWord, tempWord, statWord, addWord, subWord, divWord, convWord, whatPctWord, solutionWord],
  [changeWord, splitWord, pctWord, wholeWord, exprWord, boxWord, statWord, mixWord, fracDivWord, gcfWord, rateWord, ratioWord, convWord, whatPctWord, polyWord, fracVolWord, solutionWord],
];
const genStory = L => makeStory(STORY_STEPS[L - 1], L);
const skill = skillIn('Stories');

export const SKILLS = [...MULDIV, ...FRACDEC, ...RATIOS, ...NUMBERS, ...MEASURE, ...SHAPES, ...ALGEBRA, ...DATA,
  skill('l5story', 'All', 'Story problems', 'Ratios, percents, equations and more', genStory, 'A story problem hides the math inside a situation. Work out what is being asked and what you know before you calculate.',
    ['Read the question first. What exactly are you finding?', 'Pick out the numbers you need and what each one means.', 'Look for clue words: “per” and “each” (rates), “% off” (take away a percent), “at the same rate” (keep the ratio).', 'Plan the steps, solve, then ask: is my answer a sensible size?'],
    [['per / each', 'a rate: for every one'], ['of', 'with a percent or fraction, multiply'], ['in all / total', 'put amounts together'], ['left / change', 'take one amount from another']], { story: true }),
];
