// Level 7: Powers, lines and triangles. Skill list and story sources (see CLAUDE.md, How to add a skill).
import { genExpLaw } from './exponents.js';
import { genExpNeg } from './exp-negative.js';
import { genSci } from './scinot.js';
import { genSciOps } from './sciops.js';
import { genRoots } from './roots.js';
import { genRational } from './rational.js';
import { genEqBoth } from './equations.js';
import { genEqCount } from './equation-count.js';
import { genSlope } from './slope.js';
import { genLine } from './lines.js';
import { genFunc } from './function-rates.js';
import { genSys } from './systems-elim.js';
import { genPyth } from './pythag.js';
import { genTrans } from './transform-more.js';
import { genAngles } from './angles.js';
import { genPropCmp } from './propcmp.js';
import { genSlopeWhy } from './slopewhy.js';
import { genLineEq } from './lineeq.js';
import { genFuncCmp } from './funccmp.js';
import { genGraphStory } from './graphstory.js';
import { genSysStory } from './sysstory.js';
import { genCongruent } from './congruent.js';
import { genSimilar } from './similar.js';
import { genPythReal } from './pythreal.js';
import { genIrrLine } from './irrline.js';
import { genTwoWay } from './twoway.js';
import { genFitLine } from './fitline.js';
import { genEqFrac } from './eqfrac.js';
import { genSciUnits } from './sciunits.js';
import { genVol } from './volume.js';
import { genScatter } from './scatter-lines.js';
import { powerStory, sameCostStory, lineStory, ticketStory } from './stories-algebra.js';
import { triangleStory, volumeStory, squareStory, rateStory, predictStory } from './stories-shape.js';
import { rateCompareStory, shadowStory, rodStory, sizeStory } from './stories-new.js';
import { makeStory } from '../level4/story.js';
import { LEARN } from './learn.js';
import { LEARN_MORE } from './learn-more.js';

// A generator may return null for an unlucky draw. Try again here so the app always gets a problem.
const steady = gen => L => { for (let i = 0; i < 60; i++) { const p = gen(L); if (p) return tagged(p); } return null; };
// Picture questions can share the same words. A hidden tag built from the problem's own numbers keeps the text unique,
// so the app can tell two of them apart and avoid asking the same one twice.
const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0; return h.toString(36); };
function tagged(p) {
  if (p.visual && p._t) p.ask = `${p.ask}<span hidden>${hash(JSON.stringify(p._t))}</span>`;
  return p;
}
export const STORY_SOURCES = [powerStory, sameCostStory, lineStory, ticketStory, triangleStory, volumeStory, squareStory, rateStory, predictStory, rateCompareStory, shadowStory, rodStory, sizeStory];
// Each step draws from its own makers: step 1 is one idea with friendly numbers, step 2 is the standard task,
// step 3 adds the multi-step ones (same-cost equations, tickets as a system, working backwards).
const STEP_SOURCES = [[triangleStory, rateStory, predictStory, lineStory, rateCompareStory],
  [triangleStory, rateStory, predictStory, lineStory, volumeStory, squareStory, powerStory, rateCompareStory, shadowStory, sizeStory],
  [triangleStory, rateStory, lineStory, volumeStory, squareStory, powerStory, sameCostStory, ticketStory, sameCostStory, ticketStory, rateCompareStory, shadowStory, rodStory, sizeStory]];
const genStory = L => makeStory(STEP_SOURCES[L - 1], L);

const LEARN_ALL = { ...LEARN, ...LEARN_MORE };
const skill = (id, strand, std, title, sub, gen, extra = {}) => ({ id, level: 7, strand, std, title, sub, gen: steady(gen), school: true, learn: LEARN_ALL[id], ...extra });
export const SKILLS = [
  skill('l7explaw', 'Numbers', '8.EE.1', 'Exponent laws', 'Product, quotient, power of a power', genExpLaw),
  skill('l7expneg', 'Numbers', '8.EE.1', 'Zero and negative exponents', 'What they mean and how to use them', genExpNeg),
  skill('l7sci', 'Numbers', '8.EE.3', 'Scientific notation', 'Read, write and compare', genSci),
  skill('l7sciops', 'Multiplying and dividing', '8.EE.4', 'Scientific notation: × and ÷', 'Front numbers and powers of 10', genSciOps),
  skill('l7sciunits', 'Measurement', '8.EE.3-4', 'Scientific notation: units and sizes', 'Choosing units, how many times as large, calculator E', genSciUnits),
  skill('l7roots', 'Numbers', '8.EE.2, 8.NS.2', 'Square roots and cube roots', 'Exact roots and estimates', genRoots),
  skill('l7rational', 'Numbers', '8.NS.1', 'Rational and irrational numbers', 'Repeating decimals as fractions', genRational),
  skill('l7irrline', 'Numbers', '8.NS.2', 'Irrational numbers on the number line', 'Roots and pi between tenths, compared and ordered', genIrrLine),
  skill('l7eqboth', 'Algebra', '8.EE.7b', 'Equations with x on both sides', 'Balance, brackets, like terms', genEqBoth),
  skill('l7eqfrac', 'Algebra', '8.EE.7b', 'Equations with fractions and decimals', 'Brackets on both sides, clearing fractions, checking', genEqFrac),
  skill('l7eqcount', 'Algebra', '8.EE.7a', 'How many solutions?', 'One, none, or infinitely many', genEqCount),
  skill('l7slope', 'Algebra', '8.EE.6', 'Slope', 'Rise over run from graphs, tables, points', genSlope),
  skill('l7propcmp', 'Ratios and percents', '8.EE.5', 'Comparing proportional relationships', 'Rule, table, graph and words: which is faster or cheaper', genPropCmp),
  skill('l7line', 'Algebra', '8.EE.6, 8.F.3', 'Lines: y = mx + b', 'Slope, y-intercept, points on the line', genLine),
  skill('l7slopewhy', 'Algebra', '8.EE.6', 'Why slope is the same everywhere', 'Slope triangles, and where y = mx + b comes from', genSlopeWhy),
  skill('l7lineeq', 'Algebra', '8.F.4, 8.EE.6', 'Writing the equation of a line', 'From a graph, a point, two points, a table or a story', genLineEq),
  skill('l7func', 'Algebra', '8.F.1–5', 'Functions', 'Rules, tables, linear or not, rate of change', genFunc),
  skill('l7funccmp', 'Algebra', '8.F.2', 'Comparing two functions', 'Rule, table, graph or words: rate of change and starting value', genFuncCmp),
  skill('l7graphstory', 'Algebra', '8.F.5', 'Graphs and stories', 'Going up, level or down, straight or curved', genGraphStory),
  skill('l7sys', 'Algebra', '8.EE.8', 'Systems of equations', 'Graphing, substitution, elimination', genSys),
  skill('l7sysstory', 'Algebra', '8.EE.8b-c', 'Systems in stories', 'Two equations, how many solutions, what the crossing means', genSysStory),
  skill('l7trans', 'Shapes and space', '8.G.1–4', 'Transformations', 'Slides, flips, turns, resizing', genTrans),
  skill('l7congruent', 'Shapes and space', '8.G.1-2', 'Congruence by moves', 'Slides, flips and turns: what changes and what stays', genCongruent),
  skill('l7angles', 'Shapes and space', '8.G.5', 'Angles and parallel lines', 'Transversals and triangle angles', genAngles),
  skill('l7similar', 'Shapes and space', '8.G.4-5', 'Similarity and dilations', 'Scale factors, similar triangles and angle-angle', genSimilar),
  skill('l7pyth', 'Shapes and space', '8.G.6–8', 'Pythagorean theorem', 'Missing sides and distance on a grid', genPyth),
  skill('l7pythreal', 'Shapes and space', '8.G.6-7', 'Pythagoras at work', 'Screens, ladders, boxes in 3D and the converse', genPythReal),
  skill('l7vol', 'Measurement', '8.G.9', 'Volume of round solids', 'Cylinders, cones and spheres', genVol),
  skill('l7scatter', 'Data and chance', '8.SP.1–3', 'Scatter plots', 'Associations and lines of best fit', genScatter),
  skill('l7fitline', 'Data and chance', '8.SP.2-3', 'Using a line of best fit', 'Slope and intercept in context, predictions and misses', genFitLine),
  skill('l7twoway', 'Data and chance', '8.SP.4', 'Two-way tables', 'Counts, percents of a row or column, association', genTwoWay),
  skill('l7story', 'Stories', 'All', 'Story problems', 'Read it, plan it, solve it', genStory, { story: true }),
];
