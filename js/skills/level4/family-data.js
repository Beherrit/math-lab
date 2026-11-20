// The facts behind the shape family tree: concrete kinds of shape ("worlds") and which family names and properties each one has.
// A statement such as "a rectangle is a rhombus" is always, sometimes or never true depending on which worlds the first name covers.

// Concrete quadrilaterals. A trapezoid here has exactly one pair of parallel sides.
export const WORLDS = [
  { id: 'sq', text: 'a square', is: ['square', 'rectangle', 'rhombus', 'parallelogram', 'quadrilateral'], has: ['eq4', 'right4', 'par2', 'oppEq'] },
  { id: 'rect', text: 'a rectangle that is not a square', is: ['rectangle', 'parallelogram', 'quadrilateral'], has: ['right4', 'par2', 'oppEq'] },
  { id: 'rho', text: 'a rhombus that is not a square', is: ['rhombus', 'parallelogram', 'quadrilateral'], has: ['eq4', 'par2', 'oppEq', 'noRight'] },
  { id: 'par', text: 'a leaning parallelogram with unequal sides', is: ['parallelogram', 'quadrilateral'], has: ['par2', 'oppEq', 'noRight'] },
  { id: 'trap', text: 'a trapezoid', is: ['trapezoid', 'quadrilateral'], has: ['par1', 'noRight'] },
  { id: 'rtrap', text: 'a trapezoid with two right angles', is: ['trapezoid', 'quadrilateral'], has: ['par1'] },
  { id: 'quad', text: 'a quadrilateral with no parallel sides', is: ['quadrilateral'], has: ['noRight'] },
];
export const QUADS = ['square', 'rectangle', 'rhombus', 'parallelogram', 'trapezoid', 'quadrilateral'];
export const NOTE = ' (A trapezoid here has exactly one pair of parallel sides.)';
export const PROPS = {
  eq4: 'four equal sides', right4: 'four right angles', par2: 'two pairs of parallel sides', par1: 'exactly one pair of parallel sides', oppEq: 'opposite sides that are equal', noRight: 'no right angles',
};
export const MUST = {
  eq4: 'All four sides are equal.', right4: 'All four angles are right angles.', par2: 'Both pairs of opposite sides are parallel.', par1: 'Exactly one pair of sides is parallel.', oppEq: 'Opposite sides are equal in length.', noRight: 'It has no right angles.',
};
export const worldsOf = name => WORLDS.filter(w => w.is.includes(name));
// Always, sometimes or never: is a shape called X also called Y? Examples of both kinds of shape come with it.
export function verdict(x, y) {
  const xs = worldsOf(x), yes = xs.find(w => w.is.includes(y)) ?? null, no = xs.find(w => !w.is.includes(y)) ?? null;
  return { v: !no ? 'Always' : !yes ? 'Never' : 'Sometimes', yes, no };
}
// Does every shape called X have the property?
export const alwaysHas = (name, prop) => worldsOf(name).every(w => w.has.includes(prop));
export const breaker = (name, prop) => worldsOf(name).find(w => !w.has.includes(prop)) ?? null;

// Triangles: each family name covers some combinations of exact side type and angle type.
export const TRI_COMBOS = [
  { sides: 'equilateral', angle: 'acute', text: 'an equilateral triangle' }, { sides: 'isosceles', angle: 'acute', text: 'an acute triangle with exactly two equal sides' },
  { sides: 'isosceles', angle: 'right', text: 'a right triangle with exactly two equal sides' }, { sides: 'isosceles', angle: 'obtuse', text: 'an obtuse triangle with exactly two equal sides' },
  { sides: 'scalene', angle: 'acute', text: 'an acute triangle with no equal sides' }, { sides: 'scalene', angle: 'right', text: 'a right triangle with no equal sides' },
  { sides: 'scalene', angle: 'obtuse', text: 'an obtuse triangle with no equal sides' },
];
export const TRI_NAMES = ['equilateral', 'isosceles', 'scalene', 'acute', 'right', 'obtuse'];
// An isosceles triangle has at least two equal sides, so equilateral triangles count as isosceles too.
export const triIs = (c, name) => (name === 'isosceles' ? c.sides !== 'scalene' : name === 'equilateral' || name === 'scalene' ? c.sides === name : c.angle === name);
export function triVerdict(x, y) {
  const xs = TRI_COMBOS.filter(c => triIs(c, x)), yes = xs.find(c => triIs(c, y)) ?? null, no = xs.find(c => !triIs(c, y)) ?? null;
  return { v: !no ? 'Always' : !yes ? 'Never' : 'Sometimes', yes, no, xs };
}
