// Measuring angles with a protractor, angles as parts of a turn, and adding angles. Builds past l3angles (names, turns, 90 and 180).
import { rnd, pick, chance, shuffle, F, fr, b, way, num, frac, choice } from '../../util.js';
import { oneOf, plural, tagged, sum } from './helpers.js';
import { angleSVG } from './visuals.js';
import { protractorSVG } from './visuals-measure.js';
import { reduceSteps } from './frac-util.js';

const deg = v => `${v}°`;
const wherefrom = flip => (flip ? 'left' : 'right');
// Count up from a to c in easy jumps: to the next ten, then the rest.
function jumps(a, c) {
  const ten = Math.min(Math.ceil((a + 1) / 10) * 10, c), out = [`${a} + ${ten - a} = ${ten}`];
  if (c > ten) out.push(`${ten} + ${c - ten} = ${c}`);
  return [...out, `The jumps add up to ${c - a}.`];
}

function readAngle(L) {
  const flip = L > 1 && chance(0.5), d = L === 1 ? rnd(2, 16) * 10 : rnd(3, 35) * 5, side = wherefrom(flip);
  return tagged({ ask: 'Read the protractor. How many degrees is the angle?', visual: protractorSVG([0, d], flip), answer: num(d), suffix: '°', _t: { kind: 'prread', deg: d, flip }, hint: 'One ray lies along the baseline at 0. Read the scale that starts at that 0.',
    ways: [way('Start at zero', [protractorSVG([0, d], flip), `The bottom ray points to the 0 on the ${side} side, so use the scale that starts there.`, `The other ray crosses the scale at ${b(deg(d))}.`]),
      way('Count the marks', ['The labelled marks are every 10°, and the small marks between them are every 5°.', `The ray ${d % 10 ? `is on the small mark just after ${Math.floor(d / 10) * 10}` : `is on the labelled mark ${d}`}.`, `The angle is ${b(deg(d))}.`])] }, { d, flip });
}
// Neither ray is on zero: read both on the same scale, then take the smaller from the bigger.
function readDifference() {
  const flip = chance(0.5), r1 = rnd(2, 12) * 5, r2 = r1 + rnd(4, 20) * 5;
  if (r2 > 175) return null;
  return tagged({ ask: 'Neither ray of this angle sits on 0. Read both rays on the same scale. How many degrees is the angle between them?', visual: protractorSVG([r1, r2], flip), answer: num(r2 - r1), suffix: '°', _t: { kind: 'prdiff', r1, r2, flip },
    hint: 'Read where each ray crosses the same scale. The angle is the gap between the two readings.',
    ways: [way('Subtract the readings', [protractorSVG([r1, r2], flip), `The first ray reads ${r1}° and the second reads ${r2}°.`, `${r2} − ${r1} = ${b(deg(r2 - r1))}`]), way('Count up from the first ray', [`Start at the first ray, ${r1}°, and count up to ${r2}°.`, ...jumps(r1, r2), `The angle is ${b(deg(r2 - r1))}.`])] }, { r1, r2 });
}
// A ray splits a big angle. One part is told; the whole is read from the protractor.
function splitAngle(L) {
  const flip = chance(0.5), part = rnd(3, 14) * 5, total = part + rnd(3, 16) * 5;
  if (total > 175) return null;
  return tagged({ ask: `A ray splits the angle into two parts. The first part is ${deg(part)}. How big is the second part?`, visual: protractorSVG([0, part, total], flip), answer: num(total - part), suffix: '°', _t: { kind: 'prsplit', part, total, flip },
    hint: 'Read the whole angle from the protractor first. Then take away the part you are told.',
    ways: [way('Read the whole, then subtract', [protractorSVG([0, part, total], flip), `The whole angle reads ${total}°.`, `${total} − ${part} = ${b(deg(total - part))}`]), way('Count up', [`The first part reaches ${part}° and the whole angle reaches ${total}°.`, ...jumps(part, total), `The second part is ${b(deg(total - part))}.`])] }, { part, total });
}
function turnFraction(L) {
  const d = pick([[90, 180, 270], [30, 45, 60, 120, 135, 225], [20, 40, 72, 100, 150, 200, 240, 300]][L - 1]);
  return { ask: `A skater spins through ${deg(d)}. What fraction of a full turn is that?`, answer: frac(d, 360), _t: { kind: 'prturn', deg: d }, hint: 'A full turn is 360°. Write the angle over 360, then simplify.',
    ways: [way('Angle over a full turn', ['A full turn is 360°.', `${deg(d)} out of 360° is ${F(d, 360)}.`, ...reduceSteps(d, 360), `Answer: ${b(fr(d, 360))}`]),
      way('Use a half turn', [`A half turn is 180°, and a half turn is ${F(1, 2)} of a full turn.`, `${deg(d)} is ${F(d, 180)} of a half turn.`, `${F(d, 180)} × ${F(1, 2)} = ${F(d, 360)} = ${b(fr(d, 360))}`])] };
}
function minuteHand(L) {
  const m = L === 1 ? pick([15, 30, 45]) : L === 2 ? rnd(1, 11) * 5 : pick([7, 8, 13, 17, 22, 26, 33, 38, 43, 47, 52, 58]);
  const whole = Math.floor(m / 5) * 5, rest = m - whole;
  return { ask: `The minute hand of a clock starts at 12 and moves ${m} minutes. How many degrees has it turned?`, answer: num(6 * m), suffix: '°', _t: { kind: 'prmin', min: m }, hint: 'The minute hand turns all the way round in one hour. How far does it turn in one minute?',
    ways: [way('Degrees in one minute', ['A full turn is 360° and takes 60 minutes: 360 ÷ 60 = 6° every minute.', `${m} × 6 = ${b(deg(6 * m))}`]),
      rest ? way('Split the minutes', [`${m} minutes = ${whole} minutes + ${rest} minutes.`, `Each 5 minutes is 30°, so ${whole} minutes is ${whole / 5} × 30 = ${whole / 5 * 30}°, and ${rest} minutes is ${rest} × 6 = ${rest * 6}°.`, `${whole / 5 * 30} + ${rest * 6} = ${b(deg(6 * m))}`])
        : way('Use 5-minute steps', ['Each number on the clock is 5 minutes, and the numbers are 30° apart.', `${m} minutes is ${m / 5} steps: ${m / 5} × 30 = ${b(deg(6 * m))}`])] };
}
// Angles that meet at one point fill a full turn of 360°.
function aroundPoint(L) {
  const count = L === 2 ? 3 : 4, parts = [];
  let left = 360;
  for (let i = 0; i < count - 1; i++) { const p = rnd(3, Math.min(18, Math.floor((left - 30 * (count - 1 - i)) / 10))) * 10; parts.push(p); left -= p; }
  if (left < 30) return null;
  parts.push(left);
  const hide = rnd(0, count - 1), known = parts.filter((_, i) => i !== hide), vis = angleSVG(parts.map((p, i) => ({ deg: p, label: i === hide ? '?' : deg(p) })));
  return { ask: `${plural(count, "angle")} meet at one point and fill a full turn. ${known.map(deg).join(', ')} are marked. Find the missing angle.`, visual: vis, answer: num(parts[hide]), suffix: '°', _t: { kind: 'prround', known },
    hint: 'A full turn is 360°. Take away the angles you know.',
    ways: [way('Subtract from 360', [vis, `Angles around a point add up to a full turn, 360°.`, `Known angles: ${known.join(' + ')} = ${sum(known)}`, `360 − ${sum(known)} = ${b(deg(parts[hide]))}`]), way('Count up to 360', [`Start at ${sum(known)} and count up to 360.`, ...jumps(sum(known), 360), `The missing angle is ${b(deg(parts[hide]))}.`])] };
}
// Picture only: which benchmark is the angle nearest to?
function estimate() {
  const marks = [30, 60, 90, 120, 150], base = pick(marks), d = base + rnd(-9, 9), opts = shuffle(marks.filter(m => m !== base)).slice(0, 3);
  return tagged({ ask: 'About how big is this angle?', visual: angleSVG([{ deg: d, label: '' }]), answer: choice(deg(base), opts.map(deg)), choiceBig: true, _t: { kind: 'prest', deg: d }, hint: 'Compare it with a square corner (90°) and with a straight line (180°).',
    ways: [way('Compare with a square corner', [angleSVG([{ deg: d, label: '' }]), `A square corner is 90°. This angle looks ${d < 80 ? 'narrower' : d > 100 ? 'wider' : 'about the same'} than that.`, `The nearest of the choices is ${b(deg(base))}.`]),
      way('Halve and halve again', ['A straight line is 180°, half of it is 90°, and half of 90° is 45°.', `Fit those against the picture. The closest of the choices is ${b(deg(base))}.`])] }, { d });
}

const MAKERS = [[readAngle, readAngle, estimate, turnFraction, minuteHand], [readAngle, estimate, turnFraction, splitAngle, aroundPoint, minuteHand], [readDifference, splitAngle, aroundPoint, turnFraction, minuteHand, readAngle]];
export const genProtractor = L => oneOf(MAKERS[L - 1], L);
