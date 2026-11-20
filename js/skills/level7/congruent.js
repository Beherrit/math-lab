// Congruence by moves: which slides, flips and turns take one figure onto another, and what never changes.
import { rnd, pick, chance, shuffle, b, way, fmt, num, choice } from '../../util.js';
import { pt, yesNo, fixedChoice } from './h.js';
import { quad } from './draw.js';
import { apply } from './transform.js';

const R = 8, LET = ['A', 'B', 'C'];
const part = (d, pos, neg) => (d === 0 ? '' : `${Math.abs(d)} ${d > 0 ? pos : neg}`);
const CMD = { rx: 'Reflect across the x-axis', ry: 'Reflect across the y-axis', r90: 'Rotate 90° counter-clockwise about the origin', r180: 'Rotate 180° about the origin', r270: 'Rotate 90° clockwise about the origin' };
const cmd = s => (s.type === 'tr' ? `Slide ${[part(s.dx, 'right', 'left'), part(s.dy, 'up', 'down')].filter(Boolean).join(' and ')}` : CMD[s.type]);
const PAST = { rx: 'reflected across the x-axis', ry: 'reflected across the y-axis', r90: 'rotated 90° counter-clockwise about the origin', r180: 'rotated 180° about the origin', r270: 'rotated 90° clockwise about the origin' };
const past = s => (s.type === 'tr' ? `slid ${[part(s.dx, 'right', 'left'), part(s.dy, 'up', 'down')].filter(Boolean).join(' and ')}` : PAST[s.type]);
const low = t => t.charAt(0).toLowerCase() + t.slice(1);
const seqText = steps => steps.map((s, i) => (i ? low(cmd(s)) : cmd(s))).join(', then ');
const run = (steps, p) => steps.reduce((q, s) => apply(s, q), p);
const same = (a, c) => a.every((p, i) => p[0] === c[i][0] && p[1] === c[i][1]);
const fits = pts => pts.every(p => Math.abs(p[0]) <= R && Math.abs(p[1]) <= R);
// A right triangle with unequal legs in one quadrant, so a flip and a turn of it can be told apart.
function triangle() {
  const w = rnd(2, 4), h = rnd(2, 4), u = pick([0, w]), sx = pick([-1, 1]), sy = pick([-1, 1]);
  return w === h ? triangle() : [[1, 1], [1 + w, 1], [1 + u, 1 + h]].map(([x, y]) => [x * sx, y * sy]);
}
const marks = (tri, mark = '') => tri.map((p, i) => ({ x: p[0], y: p[1], label: LET[i] + mark, r: 4 }));
const picture = (tri, img, extra = {}) => quad({ r: R, polys: [{ pts: tri }, { pts: img }], pts: [...marks(tri), ...marks(img, '′')], ...extra });
const legs = tri => [Math.hypot(tri[1][0] - tri[0][0], tri[1][1] - tri[0][1]), Math.hypot(tri[2][0] - tri[0][0], tri[2][1] - tri[0][1])];
// One flip or turn followed by one slide, with the image kept on the grid.
function twoMoves(kinds, axis) {
  for (let t = 0; t < 60; t++) {
    const tri = triangle(), first = { type: pick(kinds) }, mid = tri.map(p => apply(first, p));
    const slide = { type: 'tr', dx: axis === 'x' ? nonZero() : axis === 'y' ? 0 : nonZero(), dy: axis === 'y' ? nonZero() : axis === 'x' ? 0 : nonZero() }, img = mid.map(p => apply(slide, p));
    if (fits(img) && fits(mid) && !same(tri, img)) return { tri, steps: [first, slide], mid, img };
  }
  return null;
}
const nonZero = () => pick([-5, -4, -3, -2, 2, 3, 4, 5]);
const HOW = ['slid 4 units to the right', 'reflected across a line', 'turned a quarter turn about a point', 'flipped over and then slid'];
function measureStays(kind) {
  const angle = kind === 'angle', v = angle ? rnd(25, 120) : rnd(3, 15), how = pick(HOW), word = angle ? `an angle B of ${v}°` : `a side AB of ${v} cm`, back = angle ? `angle B′` : 'side A′B′';
  return { ask: `Triangle ABC has ${word}. It is ${how} to make triangle A′B′C′. ${angle ? 'How big is angle B′?' : 'How long is side A′B′, in centimeters?'}`, answer: num(v), hint: 'Do slides, flips and turns stretch a shape, or only move it?', _t: { k: 'cong', shape: `${kind}-stays`, v },
    ways: [way('Moves do not stretch', ['A slide, a flip and a turn only move the shape. They do not stretch it or squash it.', `So ${back} is the same as before: ${b(v)}${angle ? '°' : ' cm'}.`]), way('Think of paper', ['Cut the triangle out of paper and move it. The paper is not stretched.', `${angle ? 'Corner B still has the same opening' : 'The side still has the same length'}: ${b(v)}${angle ? '°' : ' cm'}.`])] };
}
const TRUE = 'Every side keeps its length and every angle keeps its size', FALSE = ['Every side becomes longer', 'Every angle gets bigger', 'Parallel sides stop being parallel'];
function staysTrue() {
  const how = pick(HOW);
  return { ask: `A shape is ${how}. Which sentence is true about the new shape?`, answer: choice(TRUE, FALSE), hint: 'Think about cutting the shape out of paper and moving it.', _t: { k: 'cong', shape: 'stays-true' },
    ways: [way('Move a paper copy', ['A flip, a turn or a slide moves the whole shape without bending it.', `So: ${b(TRUE)}.`]), way('Rule out the others', ['A shape that got longer, or had bigger angles, or had bent sides, would be a different size or shape, not just moved.', `Only this one fits: ${b(TRUE)}.`])] };
}
function congruentYn() {
  const m = twoMoves(['rx', 'ry', 'r180'], pick(['x', 'y', null])), big = chance(0.4);
  if (!m) return null;
  const k = pick([2, 3]), img = big ? m.tri.map(p => [p[0] * k, p[1] * k]) : m.img;
  if (!fits(img)) return null;
  const [l1, l2] = legs(m.tri), [m1, m2] = legs(img);
  return { ask: 'Triangle A′B′C′ is a copy of triangle ABC. Are the two triangles congruent (the same size and the same shape)?', visual: picture(m.tri, img), answer: yesNo(!big), hint: 'Compare the length of one side in each triangle.', _t: { k: 'cong', shape: 'congruent-yn' },
    ways: [way('Compare a side', [`Side AB in triangle ABC is ${fmt(Math.round(l1 * 100) / 100)} long. Side A′B′ in the copy is ${fmt(Math.round(m1 * 100) / 100)} long.`, big ? `They are different, so the copy was resized: ${b('no')}.` : `They are the same, and the other sides match too: ${b('yes')}.`]),
      way('Think about the move', [big ? 'Slides, flips and turns keep the size. Only a dilation changes it, and this copy is bigger.' : 'The copy came from slides, flips and turns, which keep the size and the shape.', big ? `So the triangles are not congruent: ${b('no')}.` : `So the triangles are congruent: ${b('yes')}.`])] };
}
// Wrong sequences: the same moves in the wrong order, a slide the wrong way, or a different flip.
function wrongs(m, kinds) {
  const [f, s] = m.steps, back = { ...s, dx: -s.dx, dy: -s.dy }, other = { type: pick(kinds.filter(k => k !== f.type)) }, off = { ...s, dx: s.dx, dy: -s.dy };
  const list = [[s, f], [f, back], [other, s], [f, off], [{ type: 'rx' }, s]];
  return shuffle(list).filter(seq => !same(m.img, m.tri.map(p => run(seq, p)))).map(seqText).filter(t => t !== seqText(m.steps));
}
function sequencePick(kinds) {
  const m = twoMoves(kinds, null);
  if (!m) return null;
  const right = seqText(m.steps), wrong = wrongs(m, kinds);
  if (wrong.length < 2) return null;
  return { ask: 'Triangle ABC is moved onto triangle A′B′C′ with two moves. Which sequence of moves does it?', visual: picture(m.tri, m.img), answer: choice(right, wrong.slice(0, 3)), hint: 'Try the first move on corner A and see where it lands. Then see if the second move reaches A′.', _t: { k: 'cong', shape: 'seq-pick', steps: m.steps },
    ways: [way('Follow corner A', [`A is at ${pt(...m.tri[0])}. ${cmd(m.steps[0])} takes it to ${pt(...m.mid[0])}.`, `${cmd(m.steps[1])} takes it to ${pt(...m.img[0])}, which is A′.`, `The other corners agree, so it is ${b(low(right))}.`]), way('Test the choices', ['A choice is right only if corner A lands exactly on A′ and the other corners follow.', `With the moves in another order, or a flip across the other axis, or the slide the wrong way, A lands somewhere else. Only ${b(low(right))} reaches A′.`])] };
}
function slideAmount() {
  const axis = pick(['x', 'y']), m = twoMoves(['rx', 'ry', 'r180', 'r90'], axis), s = m && m.steps[1];
  if (!m) return null;
  const n = Math.abs(axis === 'x' ? s.dx : s.dy), way1 = axis === 'x' ? (s.dx > 0 ? 'right' : 'left') : s.dy > 0 ? 'up' : 'down';
  return { ask: `Triangle ABC is ${past(m.steps[0])}, then slid ${way1} to land on A′B′C′. How many units long is the slide?`, visual: picture(m.tri, m.img), answer: num(n), hint: 'Do the first move to corner A. Then see how far A has to slide to reach A′.', _t: { k: 'cong', shape: 'slide-amount', first: m.steps[0] },
    ways: [way('Follow corner A', [`A is at ${pt(...m.tri[0])}. After the first move it is at ${pt(...m.mid[0])}.`, `A′ is at ${pt(...m.img[0])}. From ${fmt(axis === 'x' ? m.mid[0][0] : m.mid[0][1])} to ${fmt(axis === 'x' ? m.img[0][0] : m.img[0][1])} is ${b(n)} units ${way1}.`]), way('Check another corner', [`B goes from ${pt(...m.mid[1])} to ${pt(...m.img[1])}.`, `It also moves ${b(n)} units ${way1}, because a slide moves every corner the same way.`])] };
}
function order() {
  const m = twoMoves(['rx', 'ry', 'r180'], null);
  if (!m) return null;
  const [f, s] = m.steps, swapped = m.tri.map(p => run([s, f], p)), yes = same(swapped, m.img);
  return { ask: `Triangle ABC is ${past(f)}, then ${past(s)}. Would doing the slide first, and then the other move, end on the same triangle?`, answer: yesNo(yes), hint: 'Follow one corner through both orders and compare where it ends.', _t: { k: 'cong', shape: 'order', steps: [f, s], tri: m.tri },
    ways: [way('Follow corner A both ways', [`A is at ${pt(...m.tri[0])}. First move then slide: ${pt(...m.img[0])}.`, `Slide then first move: ${pt(...swapped[0])}.`, yes ? `They are the same, so ${b('yes')}.` : `They are different, so ${b('no')}.`]), way('Think about the slide', [yes ? 'The first move does not change the direction the slide goes in, so the order does not matter.' : 'The first move changes which way is left, right, up or down, so a slide done before it points the other way afterwards.', `So the answer is ${b(yes ? 'yes' : 'no')}.`])] };
}
function twoMeasure() {
  const kind = pick(['angle', 'side']), v = kind === 'angle' ? rnd(25, 120) : rnd(3, 15), m = twoMoves(['rx', 'ry', 'r180', 'r90'], null);
  if (!m) return null;
  return { ask: `Triangle ABC has ${kind === 'angle' ? `an angle A of ${v}°` : `a side AB of ${v} cm`}. It is moved with two moves: ${low(seqText(m.steps))}. ${kind === 'angle' ? 'How big is angle A′?' : 'How long is side A′B′, in centimeters?'}`, answer: num(v), hint: 'Do any of the moves change the size of an angle or the length of a side?', _t: { k: 'cong', shape: 'stays-measure', v },
    ways: [way('Each move keeps it', [`${cmd(m.steps[0])} keeps every length and angle. ${cmd(m.steps[1])} does too.`, `So after both moves it is still ${b(v)}${kind === 'angle' ? '°' : ' cm'}.`]), way('Count the changes', ['Slides, flips and turns change only the position and the way the shape faces.', `The measurement stays ${b(v)}${kind === 'angle' ? '°' : ' cm'}.`])] };
}
const SINGLE = [{ type: 'rx' }, { type: 'ry' }, { type: 'r90' }, { type: 'r180' }, { type: 'r270' }];
function notSingle() {
  const one = chance(0.35), m = twoMoves(['rx', 'ry', 'r180', 'r90'], null), single = pick(SINGLE), tri = m && m.tri;
  if (!m) return null;
  const img = one ? tri.map(p => apply(single, p)) : m.img, slide = img[0][0] - tri[0][0] === img[1][0] - tri[1][0] && img[0][1] - tri[0][1] === img[1][1] - tri[1][1] && img[0][0] - tri[0][0] === img[2][0] - tri[2][0] && img[0][1] - tri[0][1] === img[2][1] - tri[2][1];
  const hit = SINGLE.filter(s => same(img, tri.map(p => apply(s, p)))), yes = slide || hit.length > 0;
  return { ask: 'Triangle ABC was moved onto triangle A′B′C′. Could ONE move from this list do it by itself: a slide, a reflection across an axis, or a turn about the origin?', visual: picture(tri, img), answer: yesNo(yes), hint: 'Try each kind of move on corner A, then on the other corners.', _t: { k: 'cong', shape: 'one-move' },
    ways: [way('Try the moves', [`A is at ${pt(...tri[0])} and A′ is at ${pt(...img[0])}.`, slide ? 'Every corner moved by the same amount, so a slide does it.' : hit.length ? `${cmd(hit[0])} puts every corner on its image, so one move does it.` : 'A slide would move every corner the same way, and it does not. No reflection across an axis and no turn about the origin puts every corner on its image either.', `So the answer is ${b(yes ? 'yes' : 'no')}.`]),
      way('Count the moves', [yes ? 'The picture shows a copy that one move can make.' : 'The copy needed a flip or turn and then a slide.', `So the answer is ${b(yes ? 'yes' : 'no')}.`])] };
}
export function genCongruent(L) {
  if (L === 1) return pick([() => measureStays('angle'), () => measureStays('side'), staysTrue, congruentYn])();
  if (L === 2) return pick([() => sequencePick(['rx', 'ry', 'r180']), slideAmount, congruentYn, order, twoMeasure])();
  return pick([() => sequencePick(['rx', 'ry', 'r180', 'r90']), notSingle, order, slideAmount, twoMeasure])();
}
