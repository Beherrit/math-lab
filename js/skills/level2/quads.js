// Sorting shapes: naming quadrilaterals, what makes a shape belong to a group, and spotting the shape that does not belong.
import { pick, shuffle, b, way, num, choice } from '../../util.js';
import { shapePoints, shapeSvg, shapeGrid } from './shapepics.js';
import { mark, yesNo } from './kit.js';
import { RULEOUT, DEF, COUNTER, ATTR, needText } from './quadfacts.js';

// What is this shape called? The most exact name: a square is a rectangle too, but "square" says more.
function nameQ(kind, pool) {
  const pts = shapePoints(kind), pic = shapeSvg(pts), others = shuffle(pool.filter(k => k !== kind)).slice(0, 3);
  return { ask: mark('What is the most exact name for this shape?', kind, pts[0].join(',')), visual: pic, answer: choice(kind, others), choiceBig: true, _t: { f: 'shapename', pic: true }, hint: 'Count the equal sides and the corners that are like the corner of a page. Then check for sides that are parallel (always the same distance apart).',
    ways: [way('Check the sides and corners', [pic, RULEOUT[kind], `So it is a ${b(kind)}.`]), way('Rule out the others', [...others.map(k => `Not a ${k}: ${RULEOUT[k]} This shape does not match.`), `That leaves ${b(kind)}.`])] };
}
// "I have four equal sides and no square corners. What shape am I?" Each description fits exactly one of the choices.
function describeQ(kind, pool) {
  const need = ATTR[kind].need, fits = k => Object.entries(need).every(([key, v]) => ATTR[k].has[key] === v), others = shuffle(pool.filter(k => k !== kind && !fits(k))).slice(0, 3);
  return { ask: `I have ${needText(need)}. What shape am I?`, answer: choice(kind, others), choiceBig: true, _t: { f: 'describe', need }, hint: 'Check each choice against every part of the description.',
    ways: [way('Match the description', [`${kind[0].toUpperCase() + kind.slice(1)}: ${RULEOUT[kind]}`, `That fits every part, so I am a ${b(kind)}.`]), way('Rule out the others', [...others.map(k => `Not a ${k}: ${RULEOUT[k]}`), `Only ${b(kind)} fits.`])] };
}
// Every square is a rectangle, but not every rectangle is a square.
const TRUE = [['square', 'rectangle'], ['square', 'rhombus'], ['square', 'parallelogram'], ['rectangle', 'parallelogram'], ['rhombus', 'parallelogram'], ['square', 'quadrilateral'], ['rectangle', 'quadrilateral'], ['trapezoid', 'quadrilateral'], ['kite', 'quadrilateral']];
const FALSE = [['rectangle', 'square'], ['rhombus', 'square'], ['parallelogram', 'rectangle'], ['parallelogram', 'rhombus'], ['rectangle', 'rhombus'], ['rhombus', 'rectangle'], ['trapezoid', 'square'], ['kite', 'rhombus'], ['quadrilateral', 'square'], ['quadrilateral', 'rectangle']];
function familyQ(ok, easy) {
  const [x, y] = pick((ok ? TRUE : FALSE).filter(([p, q]) => !easy || (![p, q].some(w => ['kite', 'trapezoid', 'parallelogram'].includes(w)) && p !== 'quadrilateral')));
  const art = w => (w === 'quadrilateral' ? 'a quadrilateral' : `a ${w}`);
  return { ask: 'True or false?', expr: `Every ${x} is ${art(y)}.`, answer: yesNo(ok), choiceBig: true, _t: { f: 'family', sub: x, sup: y }, hint: `What does it take to be ${art(y)}? Does every ${x} have that?`,
    ways: [way('Check the meaning', [`${y[0].toUpperCase() + y.slice(1)} means ${DEF[y]}.`, ok ? `Every ${x} has that, so it is ${b('True')}.` : `${COUNTER[x]}, so it is ${b('False')}.`]),
      way('Think of an example', [ok ? `Picture any ${x}. Does it always count as ${art(y)}? ${RULEOUT[x]}` : `Picture ${art(x)} that is not ${art(y)}: ${COUNTER[x]}.`, ok ? `So the sentence is ${b('True')}.` : `So the sentence is ${b('False')}.`])] };
}
// Which one does not belong? Three share a property, one does not.
const PROPS = {
  sides4: { text: 'four sides', yes: ['square', 'trapezoid', 'kite', 'rhombus', 'parallelogram'], no: ['triangle', 'pentagon', 'hexagon'] },
  right: { text: 'at least one square corner', yes: ['square', 'rectangle'], no: ['rhombus', 'parallelogram', 'trapezoid', 'kite'] },
  par2: { text: 'two pairs of parallel sides', yes: ['square', 'rectangle', 'rhombus', 'parallelogram'], no: ['trapezoid', 'kite', 'quad'] },
  eq4: { text: 'four equal sides', yes: ['square', 'rhombus'], no: ['rectangle', 'parallelogram', 'kite', 'trapezoid'] },
};
function oddOneQ(prop) {
  const P = PROPS[prop], out = pick(P.no), ins = Array.from({ length: 3 }, () => pick(P.yes)), kinds = shuffle([...ins, out]), at = kinds.indexOf(out), shapes = kinds.map(k => shapePoints(k, { size: 82 })), pic = shapeGrid(shapes);
  return { ask: mark(`Three of these shapes have ${P.text}. Which one does not belong?`, prop, shapes[0][0].join(',')), visual: pic, answer: choice('ABCD'[at], [], { all: ['A', 'B', 'C', 'D'] }), choiceBig: true, _t: { f: 'odd', prop, pic: true },
    hint: `Check each shape for ${P.text}. Three will pass.`,
    ways: [way('Test each shape', [pic, `Look at A, B, C and D one at a time. Which has ${P.text}, and which does not?`, `The shape in ${b('ABCD'[at])} does not have ${P.text}.`]), way('Find the odd one by sorting', [`Sort the shapes into two groups: has ${P.text}, and does not.`, `Three are in the first group. The one on its own is ${b('ABCD'[at])}.`])] };
}
// Counting a property of the picture: pairs of parallel sides, or square corners.
const COUNT = { par: { ask: 'How many pairs of parallel sides does this shape have?', kinds: ['square', 'rectangle', 'rhombus', 'parallelogram', 'trapezoid', 'kite', 'triangle'], how: 'Parallel sides always stay the same distance apart and never meet.' },
  right: { ask: 'How many square corners does this shape have?', kinds: ['square', 'rectangle', 'rhombus', 'parallelogram', 'trapezoid', 'kite', 'triangle'], how: 'A square corner is the corner of a piece of paper.' } };
function countQ(prop) {
  const kind = pick(COUNT[prop].kinds), pts = shapePoints(kind), pic = shapeSvg(pts), ANS = { par: { square: 2, rectangle: 2, rhombus: 2, parallelogram: 2, trapezoid: 1, kite: 0, triangle: 0 }, right: { square: 4, rectangle: 4, rhombus: 0, parallelogram: 0, trapezoid: 0, kite: 0, triangle: 0 } };
  const n = ANS[prop][kind];
  return { ask: mark(COUNT[prop].ask, prop, kind, pts[0].join(',')), visual: pic, answer: num(n), _t: { f: prop === 'par' ? 'pairs' : 'corners', pic: true }, hint: COUNT[prop].how,
    ways: [way('Look at each side or corner', [pic, COUNT[prop].how, `This shape has ${b(n)}.`]), way('Name it, then use what you know', [`The shape is ${/^[aeiou]/.test(kind) ? 'an' : 'a'} ${kind}. ${RULEOUT[kind]}`, `So the answer is ${b(n)}.`])] };
}
function notQuadQ() {
  const odd = pick(['triangle', 'pentagon', 'hexagon']), SIDES = { triangle: 3, pentagon: 5, hexagon: 6 }, quads = shuffle(['square', 'rhombus', 'trapezoid', 'rectangle', 'kite', 'parallelogram']).slice(0, 3);
  return { ask: 'Which of these is not a quadrilateral (a shape with four sides)?', answer: choice(odd, quads), choiceBig: true, _t: { f: 'notquad' }, hint: 'Count the sides each shape has.',
    ways: [way('Count the sides', [`A ${odd} has ${SIDES[odd]} sides, not 4.`, ...quads.map(k => `A ${k} has 4 sides.`), `So the ${b(odd)} is not a quadrilateral.`]), way('Use the name', [`A quadrilateral has four sides: "quad" means four.`, `${quads.join(', ')} all have four sides. Only the ${b(odd)} does not.`])] };
}
const ALL = ['square', 'rectangle', 'rhombus', 'parallelogram', 'trapezoid', 'kite'], EASY = ['square', 'rectangle', 'rhombus', 'trapezoid'], MAIN = ['square', 'rectangle', 'rhombus', 'parallelogram', 'trapezoid'];
export function genQuads(L) {
  const pool = L === 1 ? [() => nameQ(pick(EASY), EASY), () => nameQ(pick(EASY), EASY), () => countQ('right'), () => countQ('par'), notQuadQ, () => familyQ(Math.random() < 0.5, true)]
    : L === 2 ? [() => nameQ(pick(MAIN), MAIN), () => describeQ(pick(MAIN), MAIN), () => familyQ(Math.random() < 0.5, true), () => oddOneQ(pick(['sides4', 'right'])), () => countQ('par'), () => countQ('right')]
      : [() => nameQ(pick(ALL), ALL), () => describeQ(pick(MAIN), MAIN), () => familyQ(Math.random() < 0.5, false), () => oddOneQ(pick(['right', 'par2', 'eq4'])), () => oddOneQ(pick(['par2', 'eq4', 'sides4'])), () => countQ('par')];
  return pick(pool)();
}
