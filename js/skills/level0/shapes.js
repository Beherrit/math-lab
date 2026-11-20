// Flat shapes: find a named shape whatever its size or turn, name a shape, spot the odd one, count sides and corners.
import { rnd, pick, shuffle, way } from '../../util.js';
import { pickQ, opt, numOpt, numOpts, others, tag } from './kit.js';
import { flatTile, FLAT, FILLS } from './shapedraw.js';

const BASIC = ['circle', 'square', 'triangle', 'rectangle'];
const SIDES = { triangle: 3, square: 4, rectangle: 4, hexagon: 6, rhombus: 4, circle: 0, oval: 0 };
const LOOK = { circle: ['oval'], oval: ['circle'], square: ['rectangle'], rectangle: ['square'], hexagon: ['circle'], triangle: ['rhombus'], rhombus: ['triangle'] };
const DESC = { circle: 'It is round with no corners.', oval: 'It is like a stretched circle.', square: 'It has four equal sides.', rectangle: 'It has four sides, two long and two short.',
  triangle: 'It has three sides and three corners.', hexagon: 'It has six sides.', rhombus: 'It has four equal sides and leans over like a diamond.' };
const LOOKFOR = { circle: 'round with no corners', oval: 'like a stretched circle', square: 'four equal sides', rectangle: 'two long sides and two short sides',
  triangle: 'three sides', hexagon: 'six sides', rhombus: 'four equal sides that lean over' };
const article = n => (/^[aeiou]/.test(n) ? 'an' : 'a');

// Squares stay near upright when a rhombus is around, so a turned square is never mistaken for one.
function look(name, L, rhombus) {
  const turn = L === 1 ? rnd(-20, 20) : name === 'square' && rhombus ? rnd(-12, 12) : rnd(0, 359);
  return { turn, size: rnd(22, 32) };
}
const tileOf = (name, fill, L, names, n) => flatTile(name, { fill, ...look(name, L, names.includes('rhombus')), data: { n } });
const ways = name => [way('Look at the sides', [DESC[name], 'A shape stays the same shape when it is big, small or turned.']),
  way('Check each one', [`Is it ${article(name)} ${name}? Look for a shape with ${LOOKFOR[name]}.`])];
const pool = L => (L === 1 ? BASIC : FLAT);

function findShape(L) {
  const names = pool(L), target = pick(names), k = L === 1 ? 3 : 4;
  const wrong = shuffle(names.filter(n => n !== target)), lookalike = L === 3 ? LOOK[target].filter(n => names.includes(n)) : [];
  const chosen = [...new Set([...lookalike, ...wrong])].slice(0, k - 1), fill = pick(FILLS), all = [target, ...chosen];
  return pickQ({ ask: `Tap the ${target}.` + tag('findshape', target), say: `Tap the ${target}.`, right: opt(tileOf(target, fill, L, all), ''), wrong: chosen.map(n => opt(tileOf(n, fill, L, all), '')), mode: 'find',
    hint: `Look for the shape that is ${LOOKFOR[target]}.`, ways: ways(target), t: { f: 'shapefind', target: { shape: target }, name: target, q: 'find' } });
}
function nameShape(L) {
  const names = pool(L), target = pick(names), k = L === 1 ? 3 : 4, chosen = shuffle(names.filter(n => n !== target)).slice(0, k - 1);
  return pickQ({ ask: 'What shape is this?' + tag('nameshape', target), say: 'What shape is this?', visual: flatTile(target, { fill: pick(FILLS), scale: 1.6, size: 30, turn: L === 1 ? 0 : rnd(0, 359) }),
    right: opt(target, target), wrong: chosen.map(n => opt(n, n)), hint: 'Count the sides and look at the corners.', ways: ways(target), t: { f: 'shapename', name: target, q: 'name' } });
}
function oddShape(L) {
  const names = pool(L), [a, b] = shuffle(names), k = L === 1 ? 3 : 4, fill = pick(FILLS), all = [a, b];
  const same = Array.from({ length: k - 1 }, (_, i) => opt(tileOf(a, fill, L, all, i), ''));
  return pickQ({ ask: 'Which shape is different?' + tag('odd', a, b), say: 'Which shape is different from the others?', right: opt(tileOf(b, fill, L, all), ''), wrong: same, mode: 'pick', quiet: true,
    hint: 'Most of the shapes are the same kind. One is not.', ways: [way('Compare them', ['The shapes can be big or small or turned.', 'Look for the one that has a different number of sides or corners.'])], t: { f: 'shapeodd', odd: b, q: 'odd' } });
}
function countQ(what) {
  const names = what === 'sides' ? FLAT.filter(n => SIDES[n] > 0) : FLAT, name = pick(names), n = SIDES[name];
  return pickQ({ ask: `How many ${what} does it have?` + tag(what, name), say: `How many ${what} does this shape have?`, visual: flatTile(name, { fill: pick(FILLS), scale: 1.6, size: 30, turn: rnd(0, 359) }),
    right: numOpt(n), wrong: numOpts(others(n, what === 'sides' ? 3 : 0, 8, 3, 3)), big: true, hint: what === 'sides' ? 'Touch each straight side as you count.' : 'A corner is where two sides meet. Round shapes have none.',
    ways: [way(`Count the ${what}`, ['Touch each one and count out loud.', DESC[name]])], t: { f: 'shapecount', what, name, q: what } });
}
export function genShapes(L) {
  if (L === 3) return pick([findShape, nameShape, () => countQ('sides'), () => countQ('corners'), findShape])(L);
  return pick([findShape, findShape, nameShape, oddShape])(L);
}
