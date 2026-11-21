// Level 3: bigger numbers and first fractions. The skill objects live in skills-base.js and skills-new.js; this file puts
// them in learning-path order and adds the story skill, whose sources come from the topic files.
import { addsubWord } from './addsub.js';
import { mul1Word, mul2Word } from './multiply.js';
import { divStory } from './divide.js';
import { fracWord } from './frac-add.js';
import { mixedWord } from './mixed.js';
import { fmulWord } from './frac-times.js';
import { compareWord } from './frac-compare.js';
import { angleWord } from './angles.js';
import { areaWord } from './area.js';
import { timesWord } from './times-as-many.js';
import { mixAddWord } from './mixed-addsub.js';
import { moneyWord } from './tenth-hundredth.js';
import { convertWord } from './convert.js';
import { MULTI } from './stories.js';
import { makeStory } from './story.js';
import { skill } from './skill-def.js';
import { BASE } from './skills-base.js';
import { NEW } from './skills-new.js';
import { l3partial, l3fsplit } from './methods.js';

// Story problems for this level: each source is (L) => a story problem. More than half need more than one step.
export const STORY_SOURCES = [...MULTI, areaWord, areaWord, addsubWord, mul1Word, mul2Word, divStory, fracWord, fmulWord, mixedWord, compareWord, angleWord, timesWord, timesWord, mixAddWord, moneyWord, convertWord, convertWord];
const genStory = L => makeStory(STORY_SOURCES, L);

const STORY = skill('l3story', 'Stories', '4.OA.3', 'Story problems', 'More than one step', genStory, {
  big: 'A story problem is a small plan to work out. Many need two or three steps, and the story tells you the order.',
  tips: ['Read the question first. What are you being asked to find?', 'List what you know. Not every number is used in every step.', 'Ask what you need to know before you can answer. That is your first step.',
    'After dividing, read the question again to decide what the leftovers mean.', 'Estimate at the end. Is your answer a sensible size?'],
  words: [['in all, total', 'join amounts: add or multiply'], ['left, how many more', 'find a gap: subtract'], ['each, every', 'equal groups: multiply or divide'], ['share equally', 'divide']] }, { story: true });

// The learning path: easier ideas first, a strand's skills together where the path allows, the story skill last.
const ORDER = ['l3pv', 'l3shift', 'l3round',
  'l3addsub',
  'l3times', 'l3mul1', 'l3mul2', 'l3div', 'l3partial', 'l3estimate', 'l3factors', 'l3prime',
  'l3pattern',
  'l3equiv', 'l3simplify', 'l3compare', 'l3fparts', 'l3fadd', 'l3fsplit', 'l3mixed', 'l3mixadd', 'l3fmul', 'l3dec', 'l3tenhund', 'l3decorder',
  'l3area', 'l3convert',
  'l3lineplot',
  'l3angles', 'l3protractor', 'l3lines', 'l3symmetry',
  'l3story'];
const BY_ID = Object.fromEntries([...BASE, ...NEW, l3partial, l3fsplit, STORY].map(s => [s.id, s]));
export const SKILLS = ORDER.map(id => BY_ID[id]);
