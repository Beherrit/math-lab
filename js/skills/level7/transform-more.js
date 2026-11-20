// Transformations of a whole triangle, two moves in a row, naming the move, and the skill's step mix.
import { rnd, pick, chance, b, way, fmt, choice } from '../../util.js';
import { pt, fixedChoice } from './h.js';
import { quad } from './draw.js';
import { T, apply, slips, ways, makeStep, imagePoint, tapImage } from './transform.js';

const NAMES = ['A translation (slide)', 'A reflection (flip)', 'A rotation (turn)', 'A dilation (resize)'];
const LETTERS = ['A', 'B', 'C'];
const fits = (pts, r) => pts.every(p => Math.abs(p[0]) <= r && Math.abs(p[1]) <= r);
// A small right triangle with unequal legs (so no flip or turn of it can be mistaken for a slide), tucked into one quadrant.
function triangle(max) {
  const w = rnd(2, max - 1), h = rnd(2, max - 1), u = pick([0, w]), sx = pick([-1, 1]), sy = pick([-1, 1]);
  if (w === h) return triangle(max);
  return [[1, 1], [1 + w, 1], [1 + u, 1 + h]].map(([x, y]) => [x * sx, y * sy]);
}
const corners = (tri, mark = '') => tri.map((p, i) => ({ x: p[0], y: p[1], label: LETTERS[i] + mark, r: 4 }));
const both = (tri, img, r) => quad({ r, polys: [{ pts: tri }, { pts: img }], pts: [...corners(tri), ...corners(img, '′')] });
function moved(type) {
  const r = type === 'dil' ? 8 : 6, tri = triangle(type === 'dil' ? 4 : 5), i = rnd(1, 2);
  const step = makeStep(type, tri[i], r), img = tri.map(p => apply(step, p));
  return fits(img, r) && Math.abs(tri[i][0]) !== Math.abs(tri[i][1]) ? { r, tri, i, step, img } : null;
}
function triVertex(type) {
  const m = moved(type);
  if (!m) return null;
  const p = m.tri[m.i], q = m.img[m.i], name = LETTERS[m.i];
  return { ask: `Triangle ABC is ${T[type].say(m.step)}. What are the coordinates of ${name}′, the image of ${name} ${pt(...p)}?`, visual: quad({ r: m.r, polys: [{ pts: m.tri }], pts: corners(m.tri) }), answer: choice(pt(...q), slips(p, q, m.step)),
    hint: `Follow one corner at a time. Where does ${name} go?`, ways: ways(m.step, p, q, both(m.tri, m.img, m.r)), _t: { k: 'tr', steps: [m.step], p } };
}
function sequence() {
  const r = 6, p = [pick([-4, -3, -2, 2, 3, 4]), pick([-5, -1, 1, 5])], kinds = pick([['rx', 'tr'], ['ry', 'tr'], ['tr', 'rx'], ['tr', 'ry'], ['r180', 'tr'], ['r90', 'rx'], ['rx', 'ry'], ['tr', 'r180']]);
  const s1 = makeStep(kinds[0], p, r), mid = apply(s1, p), s2 = makeStep(kinds[1], mid, r), q = apply(s2, mid), swapped = apply(s1, apply(s2, p));
  if (!fits([mid, q], r)) return null;
  const pic = quad({ r, pts: [{ x: p[0], y: p[1], label: 'P', cls: 'given' }, { x: mid[0], y: mid[1], label: 'P′', cls: 'given' }, { x: q[0], y: q[1], label: 'P″' }], segs: [{ a: p, b: mid }, { a: mid, b: q }] });
  return { ask: `Point P ${pt(...p)} is ${T[s1.type].say(s1)}, and then ${T[s2.type].say(s2)}. Where does it end up?`, visual: quad({ r, pts: [{ x: p[0], y: p[1], label: 'P' }] }),
    answer: choice(pt(...q), [pt(...swapped), pt(...mid), pt(...apply(s2, p)), ...slips(mid, q, s2)]), hint: 'Do the first move and write down where the point is. Then do the second move from there.', _t: { k: 'tr', steps: [s1, s2], p },
    ways: [way('One move at a time', [pic, `First move: ${T[s1.type].why(s1)} ${pt(...p)} goes to ${pt(...mid)}.`, `Second move, starting from ${pt(...mid)}: ${T[s2.type].why(s2)} It lands on ${b(pt(...q))}.`]),
      way('Use the rules in order', [`${T[s1.type].rule(s1)} gives ${pt(...mid)}.`, `${T[s2.type].rule(s2)} then gives ${b(pt(...q))}.`, 'The order matters. Swapping the two moves can give a different point.'])] };
}
const CLUE = { tr: 'The copy is the same size and faces the same way. Every corner moved the same distance in the same direction.', rx: 'The copy is the same size but is a mirror image, flipped over the x-axis.', ry: 'The copy is the same size but is a mirror image, flipped over the y-axis.',
  r90: 'The copy is the same size, but it has been turned a quarter turn around the origin.', r270: 'The copy is the same size, but it has been turned a quarter turn around the origin.', r180: 'The copy is the same size, but it has been turned half way around the origin, so it looks upside down.', dil: 'The copy has the same shape but a different size. Only a dilation changes the size.' };
function identify() {
  const type = pick(['tr', 'tr', 'rx', 'ry', 'r90', 'r180', 'dil', 'dil']), m = moved(type);
  if (!m) return null;
  const p = m.tri[0], q = m.img[0];
  return { ask: 'Triangle ABC was moved onto triangle A′B′C′. What kind of move was it?', visual: both(m.tri, m.img, m.r), answer: fixedChoice(T[type].name, NAMES), hint: 'Is the copy the same size? Does it face the same way, or is it flipped or turned?', _t: { k: 'trid', type, tri: m.tri, img: m.img },
    ways: [way('Look at size and facing', [CLUE[type], `So it is ${b(T[type].name.toLowerCase())}.`]),
      way('Follow one corner', [`A ${pt(...p)} went to A′ ${pt(...q)}.`, `That fits the rule ${T[type].rule(m.step)}, and the other two corners follow the same rule.`, `The triangle was ${T[type].say(m.step)}.`])] };
}
function ruleFor() {
  const types = ['rx', 'ry', 'r90', 'r270', 'r180'], type = pick(types), p = [rnd(2, 5), 1], q = apply({ type }, p);
  return { ask: `Which rule shows a point being ${T[type].say()}?`, answer: choice(T[type].rule(), types.filter(t => t !== type).map(t => T[t].rule())), hint: 'Try it with an easy point such as (3, 1). Where should that point land?', _t: { k: 'trrule', type },
    ways: [way('Test with one point', [quad({ r: 6, pts: [{ x: p[0], y: p[1], label: 'P', cls: 'given' }, { x: q[0], y: q[1], label: 'P′' }] }), `Take P ${pt(...p)}. When it is ${T[type].say()}, it lands on ${pt(...q)}.`, `The rule that turns ${pt(...p)} into ${pt(...q)} is ${b(T[type].rule())}.`]),
      way('Think about what changes', [T[type].why(), `That is ${b(T[type].rule())}.`])] };
}
export function genTrans(L) {
  if (L === 1) return pick([() => tapImage('tr'), () => tapImage('tr'), () => imagePoint('tr'), () => imagePoint('rx'), () => imagePoint('ry')])();
  if (L === 2) {
    const type = pick(['rx', 'ry', 'r180', 'r90', 'r270', 'tr']);
    if (chance(0.2)) return tapImage('dil');
    return chance(0.5) ? imagePoint(type) : triVertex(type);
  }
  return pick([() => triVertex(pick(['r90', 'r270', 'dil'])), () => imagePoint('dil'), sequence, sequence, identify, identify, ruleFor])();
}
