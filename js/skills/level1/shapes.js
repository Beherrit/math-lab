// Shapes: name flat and solid shapes from their sides, corners and faces, and sort them by what they have.
import { rnd, pick, shuffle, b, way, nm, num, choice } from '../../util.js';
import { cnt, mark, sumOf, joinAnd } from './words.js';
import { FLAT, SOLID, NAME_NOTE, FACE_NOTE, CORNER_NOTE, OBJECTS, fitsFlat, fitsSolid } from './shapedata.js';
import { flatPic, solidPic } from './shapepics.js';

const FLAT_NAMES = Object.keys(FLAT), SOLID_NAMES = Object.keys(SOLID), POLYGONS = FLAT_NAMES.filter(n => FLAT[n].sides > 0);
const EXTRA = { square: ' All four sides are the same length.', rectangle: ' Two sides are long and two are short.' };
const some = (xs, n, not = []) => shuffle(xs.filter(x => !not.includes(x))).slice(0, n);
const named = (shape, rest) => choice(shape, rest);
const art = s => (/^[aeiou]/.test(s) ? 'an ' : 'a ') + s;
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const plain = s => s.replace(/, like an? [a-z ]+$/, ''); // drop a trailing "like a shoebox"

function nameFlatQ(shape) {
  const n = FLAT[shape].sides;
  return { ask: `What is this shape called?${mark(shape)}`, visual: flatPic(shape), answer: named(shape, some(FLAT_NAMES, 3, [shape])), choiceBig: true, hint: 'Count the straight sides and the corners.', _t: { f: 'name', shape },
    ways: [way('Count the sides and corners', [n ? `It has ${cnt(n, 'straight side')} and ${cnt(n, 'corner')}.${EXTRA[shape] || ''}` : 'It has no straight sides and no corners.', `A shape like that is called ${b(art(shape))}.`]),
      way('Use the name', [NAME_NOTE[shape], `So this shape is ${b(art(shape))}.`])] };
}
function nameSolidQ(shape) {
  return { ask: `What is this solid shape called?${mark(shape)}`, visual: solidPic(shape), answer: named(shape, some(SOLID_NAMES, 3, [shape])), choiceBig: true, hint: 'Is it flat on the bottom? Does it have corners or a curved side?', _t: { f: 'name', shape },
    ways: [way('Look at its faces', [`It has ${FACE_NOTE[shape]}.`, `That is a ${b(shape)}.`]), way('Look at its corners', [`It has ${CORNER_NOTE[shape]}.`, `That is a ${b(shape)}.`])] };
}
function countQ(shape, what) {
  const n = FLAT[shape].sides;
  return { ask: `How many ${what} does this shape have?${mark(shape, what)}`, visual: flatPic(shape), answer: num(n), hint: `Go round the shape and count each one once. Mark the first one so you know where to stop.`, _t: { f: 'shapefact', shape, prop: 'sides' },
    ways: [way('Count them one by one', [`Start at one ${what === 'sides' ? 'side' : 'corner'} and go round the edge, touching each one once.`, `This shape has ${b(n)} ${what}.`]), way('Use the name', [NAME_NOTE[shape], `So this shape has ${b(n)} ${what}.`])] };
}
function slipCountQ(shape) {
  const n = FLAT[shape].sides, wrong = n + pick([-1, 1]);
  return { ask: `${nm()} counts the sides of this shape and says ${b(wrong)}. Count again. How many sides does it have?${mark(shape, wrong)}`, visual: flatPic(shape), answer: num(n), hint: 'Counting the same side twice, or missing one, is easy to do. Mark where you start.', _t: { f: 'shapefact', shape, prop: 'sides' },
    ways: [way('Count again, marking each side', [`Put a dot on the first side and go round once. Each corner is where one side ends and the next begins.`, `${wrong} was a slip. There are ${b(n)} sides.`]), way('Use the name', [NAME_NOTE[shape], `So this shape has ${b(n)} sides.`])] };
}
function riddleFlatQ(shape) {
  const n = FLAT[shape].sides, clue = n === 4 ? { sides: 4, equal: FLAT[shape].equal } : { sides: n };
  const rest = some(FLAT_NAMES.filter(s => !fitsFlat(s, clue)), 3);
  const extra = clue.equal === true ? ' All my sides are the same length.' : clue.equal === false ? ' I have two long sides and two short sides.' : '';
  return { ask: `I have ${cnt(n, 'side')} and ${cnt(n, 'corner')}.${extra} What shape am I?`, answer: named(shape, rest), choiceBig: true, hint: 'Which shape has exactly that many sides?', _t: { f: 'whoami', kind: 'flat', clue },
    ways: [way('Match the clue', [`${cnt(n, 'side')} and ${cnt(n, 'corner')} is the clue.${extra}`, `Only the ${b(shape)} fits.`]), way('Use the names', [NAME_NOTE[shape], `So I am ${b(art(shape))}.`])] };
}
function riddleSolidQ(shape) {
  const s = SOLID[shape], clue = { faces: s.faces, corners: s.corners };
  if (s.square !== undefined) clue.square = s.square;
  const rest = some(SOLID_NAMES.filter(n => !fitsSolid(n, clue)), 3), f = s.faces ? cnt(s.faces, 'flat face') : 'no flat faces', c = s.corners ? cnt(s.corners, 'corner') : 'no corners';
  const sq = s.square === true ? ' All my faces are squares.' : s.square === false ? ' My faces are rectangles, and they are not all squares.' : '';
  return { ask: `I have ${f} and ${c}.${sq} What solid shape am I?`, answer: named(shape, rest), choiceBig: true, hint: 'Picture each solid and think about its faces and corners.', _t: { f: 'whoami', kind: 'solid', clue },
    ways: [way('Match the clue', [`I have ${FACE_NOTE[shape]}.`, `So I am a ${b(shape)}.`]), way('Match the corners', [`I have ${CORNER_NOTE[shape]}.`, `Only the ${b(shape)} fits both clues.`])] };
}
function factQ(shape, prop) {
  const n = SOLID[shape][prop], what = prop === 'faces' ? 'flat faces' : 'corners', noun = prop === 'faces' ? 'flat face' : 'corner', note = prop === 'faces' ? FACE_NOTE[shape] : CORNER_NOTE[shape];
  return { ask: `How many ${what} does a ${b(shape)} have?`, answer: num(n), hint: `Picture ${OBJECT_OF[shape]} in your hands and touch each one once.`, _t: { f: 'solidfact', shape, prop },
    ways: [way('Picture it', [`A ${shape} has ${note}.`, `That makes ${b(cnt(n, noun))}.`]), way('Think of a real one', [`Think of ${OBJECT_OF[shape]}. Touch each ${prop === 'faces' ? 'flat face' : 'corner'} once.`, `You count ${b(cnt(n, noun))}.`])] };
}
const OBJECT_OF = Object.fromEntries(Object.entries(OBJECTS).map(([o, s]) => [s, o]).concat([['pyramid', 'a pyramid-shaped tent']]));
function objectQ(item) {
  const shape = OBJECTS[item];
  return { ask: `Which solid shape is ${item} closest to?`, answer: named(shape, some(SOLID_NAMES, 3, [shape])), choiceBig: true, hint: 'Is it round, flat on top, or pointed?', _t: { f: 'object', item },
    ways: [way('Look at its faces', [`${cap(item)} has ${plain(FACE_NOTE[shape])}.`, `The closest solid shape is a ${b(shape)}.`]), way('Look at its corners', [`${cap(item)} has ${plain(CORNER_NOTE[shape])}.`, `So the closest solid shape is a ${b(shape)}.`])] };
}
// Which one shape has a property the others do not? Corners count for flat shapes too.
const PICKS = [
  { kind: 'zero', ask: 'Which of these shapes has no corners?', ok: v => v === 0 }, { kind: 'many', ask: 'Which of these shapes has more than 5 corners?', ok: v => v > 5 },
  { kind: 'few', ask: 'Which of these shapes has fewer than 4 corners?', ok: v => v < 4 },
];
const cornersOf = n => (FLAT[n] ? FLAT[n].sides : SOLID[n].corners);
function pickQ(kind, all = [...FLAT_NAMES, ...SOLID_NAMES]) {
  const p = PICKS.find(x => x.kind === kind), yes = shuffle(all.filter(n => p.ok(cornersOf(n))))[0], no = some(all.filter(n => !p.ok(cornersOf(n))), 3);
  const ex = [yes, ...no].map(n => `${cap(n)} has ${cornersOf(n) || 'no'} ${cornersOf(n) === 1 ? 'corner' : 'corners'}`);
  return { ask: p.ask, answer: choice(yes, no), choiceBig: true, hint: 'Find how many corners each shape has, then check the clue.', _t: { f: 'pick', kind },
    ways: [way('Check each shape', [`${ex.join('. ')}.`, `Only the ${b(yes)} fits.`]), way('Rule out the others', [`${no.join(', ')} do not fit the clue.`, `That leaves the ${b(yes)}.`])] };
}
function sumQ(names) {
  const ns = names.map(n => FLAT[n].sides), t = sumOf(ns), list = joinAnd(names.map(art));
  return { ask: `How many corners are there altogether on ${list}?`, answer: num(t), hint: 'Find the number of corners on each shape first, then add them.', _t: { f: 'shapesum', shapes: names, prop: 'sides' },
    ways: [way('Add one shape at a time', [names.map((n, i) => `${art(n)} has ${ns[i]}`).join(', ') + '.', `${ns.join(' + ')} = ${b(t)}.`]), way('Add two, then the next', [`${ns[0]} + ${ns[1]} = ${ns[0] + ns[1]}.`, ns.length === 2 ? `So the total is ${b(t)}.` : `${ns[0] + ns[1]} + ${ns[2]} = ${b(t)}.`])] };
}
function moreQ(x, y, prop) {
  const a = SOLID[x][prop], c = SOLID[y][prop], what = prop === 'faces' ? 'flat faces' : 'corners';
  return { ask: `How many more ${what} does a ${b(x)} have than a ${b(y)}?`, answer: num(a - c), hint: `Find the number of ${what} on each solid, then find the gap.`, _t: { f: 'shapediff', a: x, b: y, prop },
    ways: [way('Subtract', [`A ${x} has ${a} ${what} and a ${y} has ${c}.`, `${a} − ${c} = ${b(a - c)}.`]), way('Count up from the smaller number', [`From ${c} up to ${a} you count on ${a - c}.`, `So a ${x} has ${b(a - c)} more ${what}.`])] };
}

export function genShapes(L) {
  if (L === 1) {
    const t = pick(['name', 'name', 'sides', 'corners', 'riddle', 'riddle', 'zero']), s = pick(POLYGONS);
    if (t === 'name') return nameFlatQ(pick(FLAT_NAMES));
    if (t === 'sides') return countQ(s, 'sides');
    if (t === 'corners') return countQ(s, 'corners');
    if (t === 'zero') return pickQ(pick(['zero', 'few']), FLAT_NAMES);
    return riddleFlatQ(pick(POLYGONS));
  }
  if (L === 2) {
    const t = pick(['solid', 'solid', 'facts', 'riddle', 'object', 'flat', 'slip']);
    if (t === 'solid') return nameSolidQ(pick(SOLID_NAMES));
    if (t === 'facts') return factQ(pick(SOLID_NAMES), pick(['faces', 'corners']));
    if (t === 'riddle') return riddleSolidQ(pick(SOLID_NAMES));
    if (t === 'object') return objectQ(pick(Object.keys(OBJECTS)));
    if (t === 'slip') return slipCountQ(pick(POLYGONS));
    return pick([() => nameFlatQ(pick(FLAT_NAMES)), () => riddleFlatQ(pick(POLYGONS))])();
  }
  const t = pick(['pick', 'pick', 'sum', 'more', 'riddle', 'object', 'name']);
  if (t === 'pick') return pickQ(pick(PICKS).kind);
  if (t === 'sum') return sumQ(some(POLYGONS, rnd(2, 3)));
  if (t === 'more') { const [x, y] = pick([['cube', 'pyramid'], ['rectangular prism', 'cone'], ['pyramid', 'cone'], ['cube', 'cone']]); return moreQ(x, y, 'corners'); }
  if (t === 'riddle') return riddleSolidQ(pick(['cube', 'rectangular prism', 'pyramid', 'cone']));
  if (t === 'object') return objectQ(pick(Object.keys(OBJECTS)));
  return nameSolidQ(pick(SOLID_NAMES));
}
