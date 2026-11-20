// Measurement: area, surface area and volume.
import { skillIn } from './skill.js';
import { genArea } from './area.js';
import { genSolid } from './solids.js';

const skill = skillIn('Measurement');

export const SKILLS = [
  skill('l5area', '6.G.1', 'Area of shapes', 'Triangles, parallelograms, trapezoids', genArea, 'Every one of these shapes can be cut and rearranged into a rectangle, so their areas all come from base × height.',
    ['Parallelogram: base × height. Slide the slanted end across to make a rectangle.', 'Triangle: half of base × height. Two copies make a parallelogram.', 'Trapezoid: add the two parallel sides, multiply by the height, then halve.', 'The height is always straight up from the base, never the slanted side.'],
    [['base', 'the side the shape sits on'], ['height', 'the straight-up distance from the base'], ['parallel', 'lines that never meet']]),
  skill('l5solid', '6.G.2, 4', 'Surface area and volume', 'Nets and fraction edges', genSolid, 'Surface area is the total area of the outside of a solid. Volume is the space inside. A net shows every face laid flat.',
    ['Surface area: find the area of each face of the net and add them.', 'A box has 3 pairs of matching faces.', 'Volume of a box = length × width × height, even when the edges are fractions.', 'Small cubes with fraction edges pack a box exactly, which is why the rule still works.'],
    [['net', 'a solid unfolded flat'], ['face', 'a flat side of a solid'], ['surface area', 'the area of all the faces together'], ['volume', 'the space inside']]),
];
