// Facts about flat shapes and solid shapes, and the short descriptions used in worked ways.
// For a flat shape, "corners" is the same as "sides". For a solid, "faces" counts only the flat faces.
export const FLAT = {
  triangle: { sides: 3 }, square: { sides: 4, equal: true }, rectangle: { sides: 4, equal: false }, pentagon: { sides: 5 }, hexagon: { sides: 6 }, octagon: { sides: 8 }, circle: { sides: 0 },
};
export const SOLID = {
  cube: { faces: 6, corners: 8, square: true }, 'rectangular prism': { faces: 6, corners: 8, square: false }, cylinder: { faces: 2, corners: 0 },
  cone: { faces: 1, corners: 1 }, sphere: { faces: 0, corners: 0 }, pyramid: { faces: 5, corners: 5 },
};
export const NAME_NOTE = {
  triangle: 'Tri means three.', pentagon: 'Penta means five.', hexagon: 'Hex means six.', octagon: 'Octa means eight.',
  square: 'A square has four sides that are all the same length.', rectangle: 'A rectangle has four sides: two long and two short.', circle: 'A circle is perfectly round, with no straight sides and no corners.',
};
export const FACE_NOTE = {
  cube: 'a top, a bottom and four sides, like a dice', 'rectangular prism': 'a top, a bottom and four sides, like a shoebox', cylinder: 'a flat circle on the top and one on the bottom, with a curved side in between',
  cone: 'one flat circle on the bottom, with a curved side that rises to a point', sphere: 'no flat faces at all, because a ball is curved all over', pyramid: 'a square on the bottom and four triangles for the sides',
};
export const CORNER_NOTE = {
  cube: 'four corners on the top and four on the bottom', 'rectangular prism': 'four corners on the top and four on the bottom', cylinder: 'no corners, because its edges are smooth and round',
  cone: 'one corner, the point at the top', sphere: 'no corners at all', pyramid: 'four corners on the bottom and one at the point on top',
};
export const OBJECTS = {
  'a basketball': 'sphere', 'a globe': 'sphere', 'a soup can': 'cylinder', 'a drum': 'cylinder', 'a dice': 'cube', 'a sugar cube': 'cube',
  'a party hat': 'cone', 'an ice cream cone': 'cone', 'a shoebox': 'rectangular prism', 'a cereal box': 'rectangular prism',
};
// Does a shape fit a riddle clue? A clue may name any of the facts above.
export const fitsFlat = (name, clue) => FLAT[name].sides === clue.sides && (clue.equal === undefined || FLAT[name].equal === clue.equal);
export const fitsSolid = (name, clue) => SOLID[name].faces === clue.faces && SOLID[name].corners === clue.corners && (clue.square === undefined || SOLID[name].square === clue.square);
