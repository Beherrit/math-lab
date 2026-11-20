// Level 6: Proportions and equations. The learning path (order and strands) and the story sources for this level.
import { CORE } from './catalog.js';
import { NEW } from './catalog-new.js';
import { REAL_TIER_2, REAL_TIER_3 } from './realworld.js';
import { addWord, subWord } from './integers-addsub.js';
import { mulWord } from './integers-muldiv.js';
import { ratWord } from './rationals.js';
import { propWord } from './proportions.js';
import { finalPrice } from './percents.js';
import { interestWord } from './percent-change.js';
import { eqWord } from './equations.js';
import { ineqWord } from './inequalities.js';
import { scaleWord } from './scale.js';
import { circleWord } from './circles.js';
import { tankWord, wrapWord } from './solids.js';
import { probWord } from './probability.js';
import { countWord } from './compound.js';
import { sampleWord, meanWord } from './data.js';
import { makeStory } from '../level4/story.js';
import { skill } from './skill.js';

// Story problems, sorted by difficulty. Step 1: one operation with friendly numbers. Step 2: standard numbers and two-part
// ideas. Step 3: several steps (percents of percents, units, formulas). Each source is (L) => a story problem object.
const STORY_TIERS = [
  [addWord, subWord, mulWord, countWord],
  [addWord, subWord, mulWord, ratWord, propWord, finalPrice, eqWord, probWord, sampleWord, ...REAL_TIER_2],
  [finalPrice, interestWord, eqWord, ineqWord, scaleWord, circleWord, tankWord, wrapWord, probWord, sampleWord, meanWord, propWord, countWord, ...REAL_TIER_3],
];
export const STORY_SOURCES = [...new Set(STORY_TIERS.flat())];
const genStory = L => makeStory(STORY_TIERS[Math.min(Math.max(L, 1), 3) - 1], L);
const STORY = skill('l6story', 'All', 'Story problems', 'Read it, plan it, solve it', genStory, {
  big: 'A story problem is a situation to make sense of before any calculating. Work out what is being asked and what each number stands for.',
  tips: ['Read the question first. What exactly are you finding, and in what unit?', 'Label each number: is it a start, a change, a rate, a percent, a total?', 'Decide whether the story adds on, takes off, scales up or shares out.', 'Ask whether your answer makes sense in the story.'],
  words: [['rate', 'an amount for each one, like dollars a month'], ['at the same rate', 'the ratio stays the same'], ['at least / at most', 'greater than or equal to / less than or equal to']] }, { story: true });

// The learning path: easier ideas first, each strand's skills together, the story skills last.
const PATH = [
  ['Adding and subtracting', ['l6intadd', 'l6intsub']],
  ['Multiplying and dividing', ['l6intmul']],
  ['Fractions and decimals', ['l6rat', 'l6ratdiv']],
  ['Numbers', ['l6order']],
  ['Ratios and percents', ['l6unitrate', 'l6prop', 'l6isprop', 'l6solveprop', 'l6pct', 'l6pctchg', 'l6interest', 'l6pctmore']],
  ['Algebra', ['l6expr', 'l6rewrite', 'l6eq2', 'l6ineq', 'l6writeeq']],
  ['Shapes and space', ['l6scale', 'l6angles', 'l6triangles', 'l6slices']],
  ['Measurement', ['l6circle', 'l6solids', 'l6circback']],
  ['Data and chance', ['l6prob', 'l6expprob', 'l6compound', 'l6data', 'l6sampling', 'l6groups']],
  ['Stories', ['l6realworld', 'l6story']],
];
const BY_ID = Object.fromEntries([...CORE, ...NEW, STORY].map(s => [s.id, s]));
export const SKILLS = PATH.flatMap(([strand, ids]) => ids.filter(id => BY_ID[id]).map(id => ({ ...BY_ID[id], strand })));
