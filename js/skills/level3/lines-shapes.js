// Parallel and perpendicular lines, right, acute and obtuse triangles, and shapes sorted by their sides and corners.
import { rnd, pick, chance, shuffle, b, way, num, choice } from '../../util.js';
import { oneOf, plural, sig, tagged } from './helpers.js';
import { linePairSVG, triangleSVG, quadSVG } from './visuals-shapes.js';

const RELS = ['Parallel', 'Perpendicular', 'Neither'];
const TRIS = ['Right', 'Acute', 'Obtuse'];
const triOf = (a, c, e) => { const m = Math.max(a, c, e); return m === 90 ? 'Right' : m > 90 ? 'Obtuse' : 'Acute'; };
const RELWAY = {
  Parallel: ['Parallel lines stay the same distance apart and never meet, however far they go.', 'These two never meet and keep the same gap.'],
  Perpendicular: ['Perpendicular lines meet at a square corner, a right angle of 90°.', 'These two meet at a square corner.'],
  Neither: ['Lines that cross but not at a square corner are neither parallel nor perpendicular.', 'These two cross at a slant, not at a square corner.'],
};
const relAnswer = rel => choice(rel, [], { all: RELS });
const relName = rel => (rel === 'Neither' ? 'neither parallel nor perpendicular' : rel.toLowerCase());
const relWays = (rel, pic) => [way('Look at how they meet', [...(pic ? [pic] : []), RELWAY[rel][1], `They are ${b(relName(rel))}.`]),
  way('Use the meaning', [RELWAY[rel][0], `So the answer is ${b(rel)}.`])];

function linePicture() {
  const rel = pick(RELS), pic = linePairSVG(rel.toLowerCase());
  return tagged({ ask: 'How are these two lines related?', visual: pic, answer: relAnswer(rel), _t: { kind: 'lnpic', rel }, hint: 'Do the two lines ever meet? If they do, is it at a square corner?', ways: relWays(rel, pic) }, { rel, pic: sig(pic) });
}
const DEFS = { Parallel: 'Two lines in a flat surface that never meet, however far they go.', Perpendicular: 'Two lines that meet to make a square corner of 90°.', Neither: 'Two lines that cross each other but do not make a square corner.' };
function definition() {
  const rel = pick(RELS);
  return { ask: `${DEFS[rel]} What are they called?`, answer: relAnswer(rel), _t: { kind: 'lndef', rel }, hint: 'Think about whether they meet at all, and whether the corner they make is square.', ways: relWays(rel) };
}
const REAL = [['the two rails of a straight train track', 'Parallel'], ['the lines on a page of notebook paper', 'Parallel'], ['the two long edges of a door', 'Parallel'], ['the stripes on a crosswalk', 'Parallel'],
  ['a wall and the floor next to it', 'Perpendicular'], ['the hands of a clock at 3 o’clock', 'Perpendicular'], ['two streets that meet at a square corner', 'Perpendicular'], ['the top edge and a side edge of a picture frame', 'Perpendicular'],
  ['the hands of a clock at 2 o’clock', 'Neither'], ['two roads that cross at a slant', 'Neither'], ['the two blades of open scissors', 'Neither'], ['a ladder leaning on a wall, and the wall', 'Neither']];
function realLife() {
  const [thing, rel] = pick(REAL);
  return { ask: `Think of ${thing}. Are the two lines parallel, perpendicular, or neither?`, answer: relAnswer(rel), _t: { kind: 'lnreal', rel }, hint: 'Picture the two lines. Do they meet? If they do, is it at a square corner?', ways: relWays(rel) };
}

// Triangles: each is drawn from its angles, so the picture and the name always agree.
function triAngles(type) {
  if (type === 'Right') { const x = rnd(25, 65); return [90, x, 90 - x]; }
  if (type === 'Obtuse') { const a = rnd(105, 140), x = rnd(15, 180 - a - 15); return [a, x, 180 - a - x]; }
  for (;;) { const a = rnd(50, 72), c = rnd(50, 72), e = 180 - a - c; if (e >= 40 && e <= 76) return [a, c, e]; }
}
const triWays = (type, angles, pic) => {
  const m = Math.max(...angles);
  return [way('Look at the biggest corner', [...(pic ? [pic] : []), `Compare the biggest corner with a square corner, which is 90°.`, `It is ${m === 90 ? 'exactly a square corner' : m > 90 ? 'wider than a square corner' : 'narrower than a square corner, and the other two are smaller still'}.`, `So the triangle is ${b(type.toLowerCase())}.`]),
    way('Use the definitions', ['A right triangle has one 90° angle. An acute triangle has three angles under 90°. An obtuse triangle has one angle over 90°.', `This triangle has ${m === 90 ? 'a 90° angle' : m > 90 ? 'one angle over 90°' : 'all angles under 90°'}, so it is ${b(type.toLowerCase())}.`])];
};
const triAnswer = type => choice(type, [], { all: TRIS });
function trianglePicture() {
  const type = pick(TRIS), angles = shuffle(triAngles(type)), pic = triangleSVG(...angles);
  return tagged({ ask: 'What kind of triangle is this?', visual: pic, answer: triAnswer(type), _t: { kind: 'lntri', type }, hint: 'Compare each corner with a square corner (90°).', ways: triWays(type, angles, pic) }, { type, angles: angles.join('-') });
}
function triangleThree() {
  const type = pick(TRIS), angles = shuffle(triAngles(type));
  return { ask: `A triangle has angles of ${angles.map(a => `${a}°`).join(', ')}. What kind of triangle is it?`, answer: triAnswer(type), _t: { kind: 'lntri3', a: angles[0], b: angles[1], c: angles[2] }, hint: 'Which angle is the biggest? Compare it with 90°.', ways: triWays(type, angles) };
}
function triangleTwo() {
  const type = pick(TRIS), [x, y, z] = shuffle(triAngles(type));
  return { ask: `Two angles of a triangle are ${x}° and ${y}°. What kind of triangle is it?`, answer: triAnswer(type), _t: { kind: 'lntri2', a: x, c: y }, hint: 'The three angles of a triangle add up to 180°. Find the third angle first.',
    ways: [way('Find the third angle', [`The three angles add up to 180°. ${x} + ${y} = ${x + y}.`, `The third angle is 180 − ${x + y} = ${z}°.`, `The biggest angle is ${Math.max(x, y, z)}°, so the triangle is ${b(type.toLowerCase())}.`]), ...triWays(type, [x, y, z]).slice(1)] };
}

// Four-sided shapes: pairs of parallel sides, right angles.
const PROPS = { 'Rectangle': [2, 4], 'Parallelogram': [2, 0], 'Trapezoid': [1, 0], 'Right trapezoid': [1, 2], 'Right triangle': [0, 1], 'Kite': [0, 0] };
const QUAD_PAIRS = { rectangle: 2, square: 2, parallelogram: 2, rhombus: 2, trapezoid: 1, 'right trapezoid': 1, kite: 0 };
function quadPicture() {
  const name = pick(Object.keys(QUAD_PAIRS)), pairs = QUAD_PAIRS[name], pic = quadSVG(name, chance(0.5));
  return tagged({ ask: 'How many pairs of parallel sides does this shape have?', visual: pic, answer: num(pairs), _t: { kind: 'lnquad', name }, hint: 'Take two sides at a time. Would they ever meet if you made them longer?',
    ways: [way('Check the opposite sides', [pic, 'Look at each pair of opposite sides. A pair is parallel if the two sides never meet and keep the same gap.', `This shape has ${b(plural(pairs, 'pair'))} of parallel sides.`]),
      way('Think of what you know', [`This is a ${name}. ${pairs === 2 ? 'Both pairs of opposite sides are parallel.' : pairs === 1 ? 'Only the top and the bottom are parallel. The slanted sides lean toward each other.' : 'No two sides are parallel.'}`, `So it has ${b(plural(pairs, 'pair'))}.`])] }, { name, pic: sig(pic) });
}
function byProperty() {
  const names = shuffle(Object.keys(PROPS)).slice(0, 4), name = pick(names), [p, r] = PROPS[name];
  const sides = p === 0 ? 'no parallel sides' : `exactly ${plural(p, 'pair')} of parallel sides`, corners = r === 0 ? 'no right angles' : `exactly ${plural(r, 'right angle')}`;
  return { ask: `Which shape has ${sides} and ${corners}?`, answer: choice(name, names.filter(x => x !== name)), _t: { kind: 'lnprop', pairs: p, right: r }, hint: 'Check the choices one at a time against both clues. A shape must match both.',
    ways: [way('Test each choice', [names.map(n => `${n}: ${plural(PROPS[n][0], 'pair')} of parallel sides, ${plural(PROPS[n][1], 'right angle')}`).join('. ') + '.', `Only ${b(name)} matches both clues.`]),
      way('Use the first clue, then the second', [`${sides}: the choices that fit are ${names.filter(n => PROPS[n][0] === p).join(', ')}.`, `Of those, the one with ${corners} is ${b(name)}.`])] };
}

const MAKERS = [[linePicture, definition, realLife, trianglePicture], [linePicture, realLife, trianglePicture, triangleThree, quadPicture, byProperty], [byProperty, quadPicture, triangleTwo, triangleThree, linePicture, definition]];
export const genLines = L => oneOf(MAKERS[L - 1], L);
