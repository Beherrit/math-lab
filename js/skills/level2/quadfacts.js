// What makes each quadrilateral what it is, in words a child can check a picture against.
export const RULEOUT = {
  square: 'A square has four equal sides and four square corners.',
  rectangle: 'A rectangle has four square corners, and its sides are not all equal.',
  rhombus: 'A rhombus has four equal sides, and its corners are not square.',
  parallelogram: 'A parallelogram has two pairs of parallel sides, corners that are not square, and sides that are not all equal.',
  trapezoid: 'A trapezoid has just one pair of parallel sides.',
  triangle: 'A triangle has three sides and three corners, and none of its sides are parallel.',
  kite: 'A kite has no parallel sides and two pairs of equal sides that sit next to each other.',
};
// What "is a ..." asks for.
export const DEF = { square: 'four equal sides and four square corners', rectangle: 'four square corners', rhombus: 'four equal sides', parallelogram: 'two pairs of parallel sides', quadrilateral: 'four sides' };
// Why a shape is not always a ...
export const COUNTER = {
  rectangle: 'A rectangle can have sides that are not all equal', rhombus: 'A rhombus can have corners that are not square',
  parallelogram: 'A parallelogram can have corners that are not square and sides that are not all equal', trapezoid: 'A trapezoid has just one pair of parallel sides, so it does not need equal sides or square corners',
  kite: 'A kite can have sides that are not all equal, and it has no parallel sides', quadrilateral: 'A quadrilateral can be any shape with four sides',
};
// For each shape: what it has (sides, corners, parallel sides), and what a description needs to say to point to it alone among the five main shapes.
export const ATTR = {
  square: { has: { sides: 'equal', corners: 'square', parallel: 'two' }, need: { sides: 'equal', corners: 'square' } },
  rectangle: { has: { sides: 'unequal', corners: 'square', parallel: 'two' }, need: { sides: 'unequal', corners: 'square' } },
  rhombus: { has: { sides: 'equal', corners: 'none', parallel: 'two' }, need: { sides: 'equal', corners: 'none' } },
  parallelogram: { has: { sides: 'unequal', corners: 'none', parallel: 'two' }, need: { sides: 'unequal', corners: 'none', parallel: 'two' } },
  trapezoid: { has: { sides: 'unequal', corners: 'none', parallel: 'one' }, need: { parallel: 'one' } },
};
const SIDES = { equal: 'four equal sides', unequal: 'sides that are not all equal' }, CORNERS = { square: 'four square corners', none: 'no square corners' };
const PARALLEL = { two: 'two pairs of parallel sides', one: 'just one pair of parallel sides', none: 'no parallel sides' };
export function needText({ sides, corners, parallel }) {
  const parts = [];
  if (sides === 'equal') parts.push(SIDES.equal);
  if (corners) parts.push(CORNERS[corners]);
  if (sides === 'unequal') parts.push(SIDES.unequal);
  if (parallel) parts.push(PARALLEL[parallel]);
  return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0];
}
