// Shapes and space: the coordinate plane and polygons drawn on it.
import { skillIn } from './skill.js';
import { genPolyPlane } from './polyplane.js';
import { genPlane } from './plane.js';

const skill = skillIn('Shapes and space');

export const SKILLS = [
  skill('l5plane', '6.NS.6, 8', 'Four quadrants', 'Points with negative coordinates', genPlane, 'With negative numbers the coordinate grid grows in every direction. The two axes split it into four quadrants.',
    ['x comes first: right is positive, left is negative.', 'y comes second: up is positive, down is negative.', 'Quadrants are numbered I to IV, starting top right and going round to the left.', 'Flipping a point over an axis changes the sign of one coordinate only.', 'Points on the same line: add the distances if they are on opposite sides of an axis.'],
    [['quadrant', 'one of the four parts of the grid'], ['origin', 'the point (0, 0)'], ['reflection', 'a flip over a line']]),
  skill('l5polyplane', '6.G.3, 6.NS.8', 'Shapes on the grid', 'Sides, perimeter and area from coordinates', genPolyPlane, 'When the corners of a shape are on a grid, the coordinates tell you everything: how long each side is, how far around, and how much space inside.',
    ['A side that runs straight across has the same y at both ends. Its length is how far apart the x values are.', 'If the two ends are on opposite sides of an axis, add their distances from 0. On the same side, subtract.', 'Perimeter is all the side lengths added. Area of a rectangle is width times height, and of a right triangle half of that.', 'Rectangles line up with the axes, so a missing corner shares an x with one corner and a y with another.'],
    [['vertex', 'a corner of a shape (more than one: vertices)'], ['perimeter', 'the distance all the way around'], ['area', 'the space inside, in square units'], ['coordinates', 'the pair (x, y) that names a point']]),
];
