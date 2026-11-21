// Solid shapes: find one by name, name one, which one rolls, which one stacks, flat or solid.
import { pick, shuffle, way } from '../../util.js';
import { pickQ, opt, tag } from './kit.js';
import { solidTile, flatTile, SOLID, FILLS } from './shapedraw.js';

const ROLLS = ['sphere', 'cylinder'], STACKS = ['cube', 'cylinder'];
const DESC = { sphere: 'A sphere is round like a ball.', cube: 'A cube has six square faces.', cylinder: 'A cylinder is like a can.', cone: 'A cone has a point on top and a round bottom.' };
const sw = n => [way('Think of what it is like', [DESC[n]]), way('Look at the faces', ['Flat faces lie flat. Round parts are curved.'])];

function findSolid(L) {
  const target = pick(SOLID), k = L === 1 ? 3 : 4, chosen = shuffle(SOLID.filter(n => n !== target)).slice(0, k - 1);
  return pickQ({ ask: `Tap the ${target}.` + tag('findsolid', target), say: `Tap the ${target}.`, right: opt(solidTile(target), ''), wrong: chosen.map(n => opt(solidTile(n), '')), mode: 'find',
    hint: DESC[target], ways: sw(target), t: { f: 'solidfind', target: { shape: target }, name: target, q: 'find' } });
}
function nameSolid(L) {
  const target = pick(SOLID), k = L === 1 ? 3 : 4, chosen = shuffle(SOLID.filter(n => n !== target)).slice(0, k - 1);
  return pickQ({ ask: 'What shape is this?' + tag('namesolid', target), say: 'What shape is this?', visual: solidTile(target), right: opt(target, target), wrong: chosen.map(n => opt(n, n)),
    hint: 'Think of a ball, a box, a can and an ice cream cone.', ways: sw(target), t: { f: 'solidname', name: target, q: 'name' } });
}
function rolls() {
  const right = pick(ROLLS);
  return pickQ({ ask: 'Which one rolls?' + tag('rolls', right), say: 'Which one can roll?', right: opt(solidTile(right), ''), wrong: [opt(solidTile('cube'), '')], mode: 'pick', quiet: true,
    hint: 'Think about what a ball does on the floor.', ways: [way('Think of a ball', ['Round shapes roll.', 'A cube has flat faces and corners, so it sits still.'])], t: { f: 'solidrolls', q: 'rolls' } });
}
function stacks() {
  const right = pick(STACKS), wrong = shuffle(['sphere', 'cone']);
  return pickQ({ ask: 'Which one stacks?' + tag('stacks', right), say: 'Which one stacks well?', right: opt(solidTile(right), ''), wrong: wrong.map(n => opt(solidTile(n), '')), mode: 'pick', quiet: true,
    hint: 'Which one has a flat top to put something on?', ways: [way('Look at the top', ['A flat top and a flat bottom make it easy to stack.', 'Round tops and points roll or tip over.'])], t: { f: 'solidstacks', q: 'stacks' } });
}
function flatOrSolid() {
  const solid = pick([true, false]), name = solid ? pick(SOLID) : pick(['circle', 'square', 'triangle', 'rectangle']);
  const visual = solid ? solidTile(name) : flatTile(name, { fill: pick(FILLS), size: 30 });
  const right = solid ? 'solid' : 'flat', other = solid ? 'flat' : 'solid';
  return pickQ({ ask: 'Is it flat or solid?' + tag('flatsolid', name), say: 'Is this shape flat or solid?', visual, right: opt(right, right), wrong: [opt(other, other)], mode: 'pick',
    hint: 'A solid shape is one you can hold. A flat shape is like a drawing on paper.', ways: [way('Hold it in your mind', [solid ? 'You could pick it up. It is solid.' : 'It is a drawing on paper. It is flat.'])], t: { f: 'flatsolid', solid, q: 'flatsolid' } });
}
export function genSolids(L) {
  if (L === 1) return pick([findSolid, nameSolid, rolls, findSolid])(L);
  if (L === 2) return pick([findSolid, nameSolid, rolls, stacks])(L);
  return pick([flatOrSolid, nameSolid, stacks, rolls, flatOrSolid])(L);
}
