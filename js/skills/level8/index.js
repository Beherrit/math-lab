// Level 8: grades 9-12 share one band. Lines, curves, chance and change.
import { makeStory } from '../level4/story.js';
import { genLine, genSystem } from './lines.js';
import { genFactor, genVertex } from './curves.js';
import { genPoly, genGrow, genRadical } from './powers.js';
import { genShift } from './move.js';
import { genSecant, genArea } from './change.js';
import { genSimilar, genTrig } from './shapes.js';
import { genChance } from './data.js';
import { saveStory, scaleStory, doubleStory } from './stories.js';

export const STORY_SOURCES = [saveStory, scaleStory, doubleStory];
const genStory = L => makeStory(STORY_SOURCES, L);
const skill = (id, strand, std, title, sub, gen, big, tips, extra = {}) => ({
  id, level: 8, strand, std, title, sub, gen, school: true, learn: { big, tips }, ...extra,
});

export const SKILLS = [
  skill('l8line', 'Algebra', 'HSF-IF.6', 'Straight lines', 'Slope, intercept and a point on the graph', genLine,
    'On a straight line, slope is how much the height changes for one step right, and the intercept is only the height at zero.',
    ['Count rise over run on the grid.', 'The intercept is a point on the axis, not the slope.']),
  skill('l8system', 'Algebra', 'HSA-REI.6', 'Two lines meet', 'The shared point, from the graph or by substituting', genSystem,
    'Two lines meet at the one point that makes both rules true. Substituting puts one rule inside the other.',
    ['The crossing is not an intercept unless the lines meet on an axis.', 'After you find x, either rule gives the same y.']),
  skill('l8factor', 'Algebra', 'HSA-SSE.3', 'Factor with a rectangle', 'The corner is a product and the strips add', genFactor,
    'A product (x + a)(x + b) is a rectangle. The corner is a times b, and the two x strips add.',
    ['The corner multiplies the side numbers.', 'Adding those numbers builds the middle term, not the corner.']),
  skill('l8vertex', 'Algebra', 'HSF-IF.7', 'The turning point', 'Read (h, k), and fill the missing corner', genVertex,
    'The turning point of y = (x − h)² + k is (h, k). Completing the square fills the missing corner h times h.',
    ['The number inside the parentheses moves the curve sideways.', 'The missing corner is a square, not double the side.']),
  skill('l8poly', 'Algebra', 'HSA-APR.1', 'Adding and multiplying', 'Match the powers, then multiply the corner', genPoly,
    'Add only the terms that share a power. When you multiply, the plain number is the corner of the rectangle.',
    ['Adding does not add the powers themselves.', 'The degree is the highest power, not the number of terms.']),
  skill('l8shift', 'Algebra', 'HSF-BF.3', 'Sliding a graph', 'Inside the parentheses moves sideways', genShift,
    'y = (x − n)² slides right. y = x² + n slides up. The sign inside is not the direction of the slide.',
    ['A change inside the parentheses moves the graph sideways.', 'A change outside moves it up or down.']),
  skill('l8grow', 'Algebra', 'HSF-LE.1', 'Linear or exponential', 'Adding a constant is not the same as multiplying', genGrow,
    'Adding the same amount each step is a straight climb. Multiplying by the same number pulls away.',
    ['A list that adds 2 is not a list that doubles.', 'Compare the lists one step past the picture.']),
  skill('l8secant', 'Algebra', 'F-IF.6', 'Slope of a curve', 'Secant slopes crowd the slope at one point', genSecant,
    'A secant joins two points on a curve. Shorter steps make that slope move toward the slope of the curve itself.',
    ['Slope is rise over the step, not the average of the heights.', 'The smaller step is the closer estimate.']),
  skill('l8area', 'Algebra', 'G-MG.1', 'Area under a line', 'Rectangles estimate the triangle, then the exact half', genArea,
    'Rectangles under a rising line are short on the left and tall on the right. The triangle’s area sits between them.',
    ['A left rectangle uses the height at the left edge.', 'The exact area of the triangle is half of base times height.']),
  skill('l8radical', 'Numbers', 'HSN-RN.1', 'Roots and powers', 'A half power is a side, not half the area', genRadical,
    'A square root is the side of a square with that area. A power of 1/2 means that root, and a root does not split over a sum.',
    ['Half of the area is not the side.', 'The root of a sum is not the sum of the roots.']),
  skill('l8similar', 'Shapes and space', 'HSG-SRT.5', 'Similar triangles', 'One scale factor, and two matching angles', genSimilar,
    'Similar triangles match by their angles, so every side is multiplied by the same factor.',
    ['Divide matching sides to find the factor.', 'Subtracting a pair of sides gives the difference, not the scale.']),
  skill('l8trig', 'Shapes and space', 'HSG-SRT.6', 'Sine and the circle', 'Opposite over hypotenuse, then the height on the circle', genTrig,
    'Sine is the opposite side divided by the hypotenuse. On the unit circle that ratio is the height of the point.',
    ['The adjacent side belongs to cosine.', 'The horizontal distance on the circle is not the sine.']),
  skill('l8chance', 'Data and chance', 'HSS-CP.6', 'Conditional chance', 'Stay in the given group, and read the middle of the bell', genChance,
    'A conditional chance divides by the group you were given. On a bell curve, about 68 percent of the values sit within one step of the center.',
    ['The whole table is a different question.', 'About 95 percent is two steps from the center, not one.']),
  skill('l8story', 'Stories', 'All', 'Story problems', 'Read it, plan it, solve it', genStory,
    'A story still hides a line, a scale factor or a doubling. Read what is asked before you calculate.',
    ['The same amount added each time is a straight line.', 'Doubling is a product, not a sum.'],
    { story: true }),
];
