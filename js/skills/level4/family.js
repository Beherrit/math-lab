// Skill l4family: the shape family tree, always / sometimes / never statements about quadrilaterals and triangles (5.G.3-4).
import { pick, shuffle, b, way, num, choice } from '../../util.js';
import { T } from './helpers.js';
import { drawShape } from './geometry.js';
import { WORLDS, QUADS, NOTE, PROPS, MUST, TRI_NAMES, worldsOf, verdict, alwaysHas, breaker, triVerdict } from './family-data.js';

const cap = s => s[0].toUpperCase() + s.slice(1);
const VERDICTS = ['Always', 'Sometimes', 'Never'];
const pickTwo = pool => { const x = pick(pool); let y; do y = pick(pool); while (y === x); return [x, y]; };
const sentence = (x, y) => `Every ${x} is a ${y}.`;
const noteFor = (...names) => (names.includes('trapezoid') ? NOTE : '');
// Ways for an always / sometimes / never question: list the kinds, then try to break the statement.
function astWays(x, y, v, yes, no, kinds, label) {
  const first = v === 'Always' ? `Every ${label} is ${y}: ${kinds}.` : v === 'Never' ? `No ${label} is ${y}: ${kinds}.` : `The ${label} kinds are: ${kinds}.`;
  const tail = v === 'Sometimes' ? [`${cap(yes)} is ${y}, but ${no} is not.`] : [];
  return [way('List the kinds', [first, ...tail, `So the answer is ${b(v)}.`]),
    way('Try to break it', [`Can you find a ${label} that is not ${y}? ${no ? `Yes: ${no}.` : 'No, every one is.'}`, `Can you find one that is ${y}? ${yes ? `Yes: ${yes}.` : 'No, none is.'}`, `So the answer is ${b(v)}.`])];
}
function faAst(L) {
  const pool = L === 1 ? QUADS.slice(0, 4) : L === 2 ? [...QUADS.slice(0, 4), 'quadrilateral'] : QUADS, [x, y] = pickTwo(pool), { v, yes, no } = verdict(x, y);
  return T({ ask: `A ${x} is a ${y}. Is that always, sometimes or never true?${noteFor(x, y)}`, answer: choice(v, [], { all: VERDICTS }), choiceBig: true,
    ways: astWays(x, `a ${y}`, v, yes?.text ?? null, no?.text ?? null, worldsOf(x).map(w => w.text).join('; '), x),
    hint: `Think of every kind of ${x}. Is each one also a ${y}?` }, 'faAst', { x, y });
}
function faTri() {
  const [x, y] = pickTwo(TRI_NAMES), { v, yes, no, xs } = triVerdict(x, y);
  return T({ ask: `A triangle that is ${x} is also ${y}. Is that always, sometimes or never true?`, answer: choice(v, [], { all: VERDICTS }), choiceBig: true,
    ways: astWays(x, y, v, yes?.text ?? null, no?.text ?? null, xs.map(c => c.text).join('; '), `${x} triangle`),
    hint: `Think of every kind of triangle that is ${x}. Is each one also ${y}?` }, 'faTri', { x, y });
}
// Which statements are true? Exactly one of four "Every X is a Y." sentences is.
function faTrue(L) {
  const pool = L === 1 ? QUADS.slice(0, 4) : QUADS;
  for (;;) {
    const pairs = [pickTwo(pool), pickTwo(pool), pickTwo(pool), pickTwo(pool)], vs = pairs.map(([x, y]) => verdict(x, y));
    if (vs.filter(v => v.v === 'Always').length !== 1 || new Set(pairs.map(p => p.join())).size < 4) continue;
    const i = vs.findIndex(v => v.v === 'Always'), good = sentence(...pairs[i]);
    return T({ ask: `Which sentence is true?${noteFor(...pairs.flat())}`, answer: choice(good, pairs.filter((_, j) => j !== i).map(p => sentence(...p))),
      ways: [way('Test each sentence', [...pairs.map(([x, y], j) => (j === i ? `${sentence(x, y)} It is true: every ${x} has what a ${y} needs.` : `${sentence(x, y)} It is false: ${vs[j].no.text} is not a ${y}.`)), `Only ${b(good)} is true.`]),
        way('Use the family tree', [`In the family tree, a shape lower down is a special kind of every shape above it, but not the other way around.`, `Here ${pairs[i][0]} sits below ${pairs[i][1]}, so ${b(good)}`])],
      hint: 'A sentence with “every” is only true if no shape can break it. Try to draw one that does.' }, 'faTrue', { pairs });
  }
}
function faAll(L) {
  const prop = pick(L === 1 ? ['right4', 'eq4', 'par2'] : Object.keys(PROPS).filter(p => p !== 'noRight')), names = shuffle(QUADS.slice(0, 5)).slice(0, 4), ok = names.filter(n => alwaysHas(n, prop)), bad = names.filter(n => !alwaysHas(n, prop));
  return T({ ask: `Here are some shapes: ${names.join(', ')}. How many of them always have ${PROPS[prop]}?${noteFor(...names)}`, answer: num(ok.length),
    ways: [way('Check each shape', [...names.map(n => `${n}: ${alwaysHas(n, prop) ? 'yes' : 'no'}`), `So ${b(ok.length)} of the ${names.length} shapes always have it.`]),
      way('Find the ones that break it', [...bad.map(n => `${cap(breaker(n, prop).text)} is a ${n} without ${PROPS[prop]}.`), `${names.length} − ${bad.length} = ${b(ok.length)}`])],
    hint: 'For each shape, ask whether any kind of it can break the rule.' }, 'faAll', { prop, names });
}
const WHY = { square: 'four equal sides and four right angles', rectangle: 'four right angles', rhombus: 'four equal sides', parallelogram: 'two pairs of parallel sides', trapezoid: 'exactly one pair of parallel sides', quadrilateral: 'four sides' };
const DESC = { square: 'four equal sides and four right angles', rectangle: 'four right angles and opposite sides equal, but the sides are not all equal', rhombus: 'four equal sides and no right angles' };
function faPic() {
  const key = pick(['square', 'rectangle', 'rhombus']), world = WORLDS.find(w => w.is[0] === key), fits = world.is, nots = QUADS.filter(n => !fits.includes(n)), no = pick(nots), shown = shuffle(fits).slice(0, 3);
  return T({ ask: 'Which name does NOT fit this shape?', visual: drawShape(key), answer: choice(no, shown),
    ways: [way('Read the marks', ['Tick marks show equal sides, and a small square in a corner shows a right angle.', `This shape has ${DESC[key]}.`, `A shape can only have a name if it has everything the name needs. ${cap(no)} needs ${WHY[no]}, which this shape does not have: ${b(no)}`]),
      way('Test each name', [...[no, ...shown].map(n => `${cap(n)} needs ${WHY[n]}: ${fits.includes(n) ? 'this shape has that' : 'this shape does not have that'}.`), `So ${b(no)} does not fit.`])],
    hint: 'Look at the tick marks and corners. Which name asks for something this shape does not have?' }, 'faPic', { key });
}
function faMust() {
  const x = pick(['rectangle', 'rhombus', 'parallelogram', 'trapezoid']), props = Object.keys(MUST), must = props.filter(p => alwaysHas(x, p)), good = pick(must), others = shuffle(props.filter(p => !alwaysHas(x, p))).slice(0, 3);
  return T({ ask: `A shape is a ${x}. Which statement must be true?${noteFor(x)}`, answer: choice(MUST[good], others.map(p => MUST[p])),
    ways: [way('Think of every kind', [`A ${x} can be: ${worldsOf(x).map(w => w.text).join('; ')}.`, `Only “${MUST[good]}” is true for all of them: ${b(MUST[good])}`]),
      way('Try to break the others', [...others.map(p => `${MUST[p]} ${breaker(x, p) ? `Not always: ${breaker(x, p).text} breaks it.` : ''}`), `So the answer is ${b(MUST[good])}`])],
    hint: `Think of every kind of ${x}. Which statement is true for all of them?` }, 'faMust', { x });
}
function faSort() {
  const pool = QUADS, pairs = [pickTwo(pool), pickTwo(pool), pickTwo(pool)], vs = pairs.map(([x, y]) => verdict(x, y)), count = vs.filter(v => v.v === 'Always').length;
  if (new Set(pairs.map(p => p.join())).size < 3) return faSort();
  return T({ ask: `How many of these three sentences are true?${noteFor(...pairs.flat())}`, expr: pairs.map(p => sentence(...p)).join('<br>'), exprSmall: true, answer: num(count),
    ways: [way('Check each sentence', [...pairs.map(([x, y], j) => `${sentence(x, y)} ${vs[j].v === 'Always' ? 'True.' : 'False.'}`), `${b(count)} of the 3 are true.`]),
      way('Look for shapes that break them', [...pairs.map(([x, y], j) => (vs[j].v === 'Always' ? `${sentence(x, y)} Nothing breaks it.` : `${sentence(x, y)} ${cap(vs[j].no.text)} is a ${x} but not a ${y}.`)), `${b(count)} sentences cannot be broken.`])],
    hint: 'For each sentence, try to find a shape that breaks it.' }, 'faSort', { pairs });
}
export function genFamily(L) {
  if (L === 1) return pick([() => faAll(1), () => faAst(1), () => faTrue(1), faPic])();
  if (L === 2) return pick([() => faAst(2), faTri, () => faAll(2), () => faTrue(2), faPic])();
  return pick([() => faAst(3), faTri, faMust, faSort, faPic])();
}
