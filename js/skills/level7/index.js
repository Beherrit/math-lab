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
import { genVol } from './volume.js';
import { genScatter } from './scatter-lines.js';
import { powerStory, sameCostStory, lineStory, ticketStory } from './stories-algebra.js';
import { triangleStory, volumeStory, squareStory, rateStory, predictStory } from './stories-shape.js';
import { makeStory } from '../level4/story.js';
import { LEARN } from './learn.js';

// A generator may return null for an unlucky draw. Try again here so the app always gets a problem.
const steady = gen => L => { for (let i = 0; i < 60; i++) { const p = gen(L); if (p) return tagged(p); } return null; };
// Picture questions can share the same words. A hidden tag built from the problem's own numbers keeps the text unique,
// so the app can tell two of them apart and avoid asking the same one twice.
const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0; return h.toString(36); };
function tagged(p) {
  if (p.visual && p._t) p.ask = `${p.ask}<span hidden>${hash(JSON.stringify(p._t))}</span>`;
  return p;
}
export const STORY_SOURCES = [powerStory, sameCostStory, lineStory, ticketStory, triangleStory, volumeStory, squareStory, rateStory, predictStory];
// Each step draws from its own makers: step 1 is one idea with friendly numbers, step 2 is the standard task,
// step 3 adds the multi-step ones (same-cost equations, tickets as a system, working backwards).
const STEP_SOURCES = [[triangleStory, rateStory, predictStory, lineStory], [triangleStory, rateStory, predictStory, lineStory, volumeStory, squareStory, powerStory],
  [triangleStory, rateStory, lineStory, volumeStory, squareStory, powerStory, sameCostStory, ticketStory, sameCostStory, ticketStory]];
const genStory = L => makeStory(STEP_SOURCES[L - 1], L);

const skill = (id, std, title, sub, gen, extra = {}) => ({ id, level: 7, std, title, sub, gen: steady(gen), school: true, learn: LEARN[id], ...extra });
export const SKILLS = [
  skill('l7explaw', '8.EE.1', 'Exponent laws', 'Product, quotient, power of a power', genExpLaw),
  skill('l7expneg', '8.EE.1', 'Zero and negative exponents', 'What they mean and how to use them', genExpNeg),
  skill('l7sci', '8.EE.3', 'Scientific notation', 'Read, write and compare', genSci),
  skill('l7sciops', '8.EE.4', 'Scientific notation: × and ÷', 'Front numbers and powers of 10', genSciOps),
  skill('l7roots', '8.EE.2, 8.NS.2', 'Square roots and cube roots', 'Exact roots and estimates', genRoots),
  skill('l7rational', '8.NS.1', 'Rational and irrational numbers', 'Repeating decimals as fractions', genRational),
  skill('l7eqboth', '8.EE.7b', 'Equations with x on both sides', 'Balance, brackets, like terms', genEqBoth),
  skill('l7eqcount', '8.EE.7a', 'How many solutions?', 'One, none, or infinitely many', genEqCount),
  skill('l7slope', '8.EE.6', 'Slope', 'Rise over run from graphs, tables, points', genSlope),
  skill('l7line', '8.EE.6, 8.F.3', 'Lines: y = mx + b', 'Slope, y-intercept, points on the line', genLine),
  skill('l7func', '8.F.1–5', 'Functions', 'Rules, tables, linear or not, rate of change', genFunc),
  skill('l7sys', '8.EE.8', 'Systems of equations', 'Graphing, substitution, elimination', genSys),
  skill('l7pyth', '8.G.6–8', 'Pythagorean theorem', 'Missing sides and distance on a grid', genPyth),
  skill('l7trans', '8.G.1–4', 'Transformations', 'Slides, flips, turns, resizing', genTrans),
  skill('l7angles', '8.G.5', 'Angles and parallel lines', 'Transversals and triangle angles', genAngles),
  skill('l7vol', '8.G.9', 'Volume of round solids', 'Cylinders, cones and spheres', genVol),
  skill('l7scatter', '8.SP.1–3', 'Scatter plots', 'Associations and lines of best fit', genScatter),
  skill('l7story', 'All', 'Story problems', 'Read it, plan it, solve it', genStory, { story: true }),
];
