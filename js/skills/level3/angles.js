// Angles: naming them, turns and degrees, and angles that add up (to 90, to 180, or to a bigger angle).
import { rnd, pick, chance, shuffle, F, b, k, way, nm, num, choice } from '../../util.js';
import { sum, oneOf, tagged } from './helpers.js';
import { angleSVG } from './visuals.js';

const TYPES = ['acute', 'right', 'obtuse', 'straight'];
const typeOf = deg => (deg < 90 ? 'acute' : deg === 90 ? 'right' : deg < 180 ? 'obtuse' : 'straight');
const WHY = { acute: 'less than 90°, so it is narrower than a square corner', right: 'exactly 90°, a square corner', obtuse: 'more than 90° but less than 180°, so it is wider than a square corner', straight: 'exactly 180°, a straight line' };
const deg = v => `${v}°`;
const mark = (parts, hide) => angleSVG(parts.map((p, i) => ({ deg: p, label: i === hide ? '?' : deg(p) })));

function nameIt(L) {
  const kind = pick(L === 3 ? TYPES : ['acute', 'acute', 'acute', 'obtuse', 'obtuse', 'obtuse', 'right', 'straight']), d = { acute: L === 3 ? pick([89, 88, rnd(46, 87)]) : rnd(2, 15) * 5, right: 90, obtuse: L === 3 ? pick([91, 92, 179, rnd(93, 178)]) : rnd(21, 34) * 5, straight: 180 }[kind];
  const shown = L === 3 || chance(0.5);
  return tagged({ ask: shown ? `An angle measures ${deg(d)}. What kind of angle is it?` : 'What kind of angle is this?', visual: L === 3 ? undefined : angleSVG([{ deg: d, label: shown ? deg(d) : '' }]),
    answer: choice(kind, [], { all: TYPES }), choiceBig: true, _t: { kind: 'atype', deg: d, shown }, hint: 'Compare it with a square corner, which is 90°.',
    ways: [way('Compare with a square corner', [angleSVG([{ deg: d, label: deg(d) }]), 'Hold the corner of a sheet of paper against it. That corner is 90°.', `This angle is ${WHY[kind]}.`, `It is ${b(kind)}.`]),
      way('Use the numbers', ['Less than 90° is acute. Exactly 90° is right. Between 90° and 180° is obtuse. Exactly 180° is straight.', `${deg(d)} is ${WHY[kind].split(',')[0]}, so it is ${b(kind)}.`])] }, { d });
}

const TURNS = [[1, 4, 'a quarter turn'], [1, 2, 'a half turn'], [3, 4, 'a three-quarter turn'], [1, 1, 'a full turn'], [1, 3, 'one third of a full turn'], [1, 6, 'one sixth of a full turn'], [1, 8, 'one eighth of a full turn'],
  [1, 10, 'one tenth of a full turn'], [1, 12, 'one twelfth of a full turn'], [2, 3, 'two thirds of a full turn'], [3, 8, 'three eighths of a full turn'], [5, 6, 'five sixths of a full turn']];
function turn(L) {
  const [n, d, name] = pick(L === 1 ? TURNS.slice(0, 4) : TURNS.slice(4)), ans = 360 * n / d;
  return { ask: `How many degrees is ${name}?`, answer: num(ans), suffix: '°', _t: { kind: 'turn', n, d }, hint: 'Start from the whole turn, all the way round. Then work out what part of it the question asks for.',
    ways: [way('Share out the full turn', ['A full turn is 360°. An angle is measured by how much of that turn it uses.', ...(d > 1 ? [`Split 360° into ${d} equal parts: 360 ÷ ${d} = ${360 / d}°.`] : []),
      ...(n > 1 ? [`Take ${n} of those parts: ${n} × ${360 / d} = ${ans}°.`] : []), `${name[0].toUpperCase() + name.slice(1)} is ${b(deg(ans))}.`]),
    d === 8 ? way('Keep halving', ['A half turn is 180°. Half of that is a quarter turn, 90°. Half again is one eighth of a turn, 45°.', n > 1 ? `${n} × 45 = ${b(deg(ans))}` : `One eighth of a turn is ${b(deg(ans))}.`])
      : way('Think of a clock', ['The minute hand makes a full turn of 360° in 60 minutes, so it turns 6° every minute.', d === 1 ? 'A full turn takes all 60 minutes.' : `${F(n, d)} of 60 minutes is ${60 * n / d} minutes.`, `${60 * n / d} × 6 = ${b(deg(ans))}`])] };
}

// One angle is cut into parts by rays. Either a part is missing, or the whole is.
function missingPart(L) {
  const total = L === 3 ? pick([180, 180, 90, rnd(20, 34) * 5]) : pick([90, 90, 180, 180, rnd(8, 16) * 10]), count = L === 3 ? 3 : 2, step = L === 3 ? 1 : 5;
  const parts = []; let left = total;
  for (let i = 0; i < count - 1; i++) { const p = rnd(2, Math.floor((left - 10 * (count - 1 - i)) / step)) * step; parts.push(p); left -= p; }
  if (parts.some(p => p < 10) || left < 10) return null;
  parts.push(left);
  const hide = rnd(0, count - 1), known = parts.filter((_, i) => i !== hide), whole = total === 90 ? 'a right angle, 90°' : total === 180 ? 'a straight line, 180°' : deg(total);
  return { ask: `The ${count} angles together make ${whole}. ${known.map(deg).join(' and ')} ${known.length > 1 ? 'are' : 'is'} marked. Find the missing angle.`, visual: mark(parts, hide), answer: num(parts[hide]), suffix: '°', _t: { kind: 'apart', total, known },
    hint: `All the parts add up to ${deg(total)}. Take away the ${count > 2 ? 'parts' : 'part'} you know.`,
    ways: [way('Subtract from the whole', [`The parts fit together with no gaps, so they add up to ${deg(total)}.`, ...(known.length > 1 ? [`Parts you know: ${known.join(' + ')} = ${sum(known)}`] : []), `${total} − ${sum(known)} = ${b(deg(parts[hide]))}`]),
      way('Count up', [`Start at ${sum(known)} and count up to ${total}.`, ...countUp(sum(known), total), `The missing angle is ${b(deg(parts[hide]))}.`])] };
}
function countUp(from, to) {
  const ten = Math.min(Math.ceil(from / 10) * 10, to), out = [];
  if (ten > from) out.push(`${from} + ${ten - from} = ${ten}`);
  if (to > ten) out.push(`${ten} + ${to - ten} = ${to}`);
  return [...out, `The jumps add up to ${to - from}.`];
}
function wholeAngle(L) {
  const parts = L === 3 ? [rnd(12, 60), rnd(12, 60), rnd(12, 55)] : [rnd(4, 17) * 5, rnd(4, 17) * 5], total = sum(parts), asType = L === 3 && chance(0.4);
  const steps = [`The big angle is made of the smaller ones with no gaps and no overlap, so add them.`, `${parts.join(' + ')} = ${b(deg(total))}`];
  if (asType) return { ask: `Angles of ${parts.map(deg).join(', ')} fit side by side to make one angle. What kind of angle is it?`, visual: mark(parts, -1), answer: choice(typeOf(total), [], { all: TYPES }), choiceBig: true, _t: { kind: 'asumtype', parts }, hint: 'Add the parts first. Then compare the total with 90° and 180°.',
    ways: [way('Add, then name it', [...steps, `${deg(total)} is ${WHY[typeOf(total)]}. It is ${b(typeOf(total))}.`]), way('Compare with a square corner', [`A square corner is 90°. The parts add up to ${total}, which is ${total < 90 ? 'less' : total === 90 ? 'exactly that' : 'more'}.`, `So the angle is ${b(typeOf(total))}.`])] };
  return { ask: `Angles of ${parts.map(deg).join(parts.length > 2 ? ', ' : ' and ')} fit side by side to make one angle. How big is the whole angle?`, visual: mark(parts, -1), answer: num(total), suffix: '°', _t: { kind: 'asum', parts }, hint: 'Angles that sit side by side add up.',
    ways: [way('Add the parts', steps), way('Add in easy pieces', [`Add the tens first: ${parts.map(p => Math.floor(p / 10) * 10).join(' + ')} = ${sum(parts.map(p => Math.floor(p / 10) * 10))}`, `Then the ones: ${parts.map(p => p % 10).join(' + ')} = ${sum(parts.map(p => p % 10))}`, `Together: ${b(deg(total))}`])] };
}
function clock() {
  const h = rnd(1, 6);
  return { ask: `A clock face is a full turn of 360°. What angle do the hands make at exactly ${h} o’clock?`, answer: num(30 * h), suffix: '°', _t: { kind: 'clock', h }, hint: 'The 12 numbers cut the full turn into 12 equal parts.',
    ways: [way('One hour at a time', ['The 12 hour marks split 360° into 12 equal parts: 360 ÷ 12 = 30° between one number and the next.', `At ${h} o’clock the hands are ${h} number${h > 1 ? 's' : ''} apart: ${h} × 30 = ${b(deg(30 * h))}`]),
      way('Use quarter turns', ['3 o’clock is a quarter turn, 90°. 6 o’clock is a half turn, 180°.', h === 3 || h === 6 ? `So ${h} o’clock is ${b(deg(30 * h))}.` : `${h} o’clock is ${Math.abs(h - 3)} hour${Math.abs(h - 3) > 1 ? 's' : ''} ${h < 3 ? 'before' : 'after'} 3 o’clock: 90 ${h < 3 ? '−' : '+'} ${Math.abs(h - 3) * 30} = ${b(deg(30 * h))}`])] };
}
const TALES = [
  (a, n) => [90, `A skate ramp meets a wall at a right angle. A support beam splits that corner, and one of the two angles is ${k(deg(a))}.`, 'How big is the other angle?'],
  (a, n) => [180, `${n} opens a laptop flat on a desk, so the screen and keyboard make a straight line. Then ${n} tilts the screen up by ${k(deg(a))}.`, 'What angle is now between the screen and the keyboard?'],
  (a, n) => [90, `A door opens ${k(deg(a))} from closed. It can open to a right angle before it hits the wall.`, 'How many more degrees can it open?'],
  (a, n) => [180, `A straight road meets a side street. The angle on one side of the side street is ${k(deg(a))}.`, 'What is the angle on the other side?'],
];
export function angleWord() {
  const a = rnd(11, 79), [total, story, ask] = pick(TALES)(a, nm());
  return { story, ask, answer: num(total - a), suffix: '°', op: 'sub', _t: { kind: 'apart', total, known: [a] }, hint: `The two angles together make ${deg(total)}.`,
    ways: [way('Subtract from the whole', [mark([a, total - a], 1), `The two angles together make ${total === 90 ? 'a right angle, 90°' : 'a straight line, 180°'}.`, `${total} − ${a} = ${b(deg(total - a))}`]), way('Count up', countUp(a, total))],
    read: { find: 'The other part of the whole angle.', know: [`whole angle: ${deg(total)}`, `one part: ${deg(a)}`], clue: total === 90 ? '“Right angle” tells you the whole is 90°. You know one part, so subtract.' : '“Straight” tells you the whole is 180°. You know one part, so subtract.', plan: `${total} − ${a}` } };
}

const MAKERS = [[nameIt, nameIt, turn, wholeAngle], [missingPart, missingPart, wholeAngle, turn, nameIt, clock], [missingPart, missingPart, wholeAngle, wholeAngle, nameIt, angleWord, angleWord, clock]];
export const genAngles = L => oneOf(MAKERS[L - 1], L);
