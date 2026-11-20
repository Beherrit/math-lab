// Story problems about right triangles, volume, square roots, rates and lines of best fit. Each maker is (L) => story problem.
// Step 1 keeps the numbers small and the route direct; step 3 uses bigger numbers and the less direct question.
import { R, rnd, pick, chance, b, k, way, pow, F, fmt, num, nm } from '../../util.js';
import { sqrt, plus, eqn, count, substSteps, startPlus } from './h.js';
import { TRIPLES } from './pythag.js';
import { rightTri } from './shapes.js';
import { FITS } from './scatter-lines.js';

const sq = n => n * n;
const HYP = [
  (a, c, w) => ({ story: `${w} walks ${k(a + ' blocks east')} and then ${k(c + ' blocks north')}.`, ask: `How many blocks is ${w} from the start, in a straight line?`, unit: 'blocks' }),
  (a, c) => ({ story: `A screen is ${k(c + ' inches wide')} and ${k(a + ' inches tall')}.`, ask: 'How long is its diagonal, from corner to corner?', unit: 'inches' }),
  (a, c) => ({ story: `A rectangular field is ${k(c + ' meters long')} and ${k(a + ' meters wide')}. A path cuts straight across from one corner to the opposite corner.`, ask: 'How long is the path?', unit: 'meters' }),
];
const LEG = [
  (a, h) => ({ story: `A ${k(h + '-foot ladder')} leans against a wall. Its foot is ${k(a + ' feet from the wall')}.`, ask: 'How high up the wall does the ladder reach?', unit: 'feet' }),
  (a, h) => ({ story: `A zip line cable is ${k(h + ' meters long')}. It ends ${k(a + ' meters away')} from the base of the tower it starts on.`, ask: 'How tall is the tower?', unit: 'meters' }),
  (a, h) => ({ story: `A kite is on ${k(h + ' meters of string')}, pulled tight. It is flying above a spot ${k(a + ' meters away')} from the flyer along the ground.`, ask: 'How high is the kite?', unit: 'meters' }),
];
export function triangleStory(L = 2) {
  const [a, c, h] = pick(TRIPLES.slice(L === 3 ? 4 : 0, [4, 8, 11][L - 1])), who = nm();
  if (chance([1, 0.5, 0.3][L - 1])) {
    const t = pick(HYP)(a, c, who);
    return { story: t.story, ask: t.ask, visual: rightTri(a, c, '?', { vr: a, hr: c }), answer: num(h), suffix: t.unit, op: 'multi', hint: 'The two given lengths meet at a right angle. They are the legs.', _t: { k: 'pyth', find: 'hyp', a, c },
      ways: [way('Square, add, square root', [`${pow(a, 2)} + ${pow(c, 2)} = ${sq(a)} + ${sq(c)} = ${fmt(sq(h))}`, `${sqrt(fmt(sq(h)))} = ${b(h)}`]), way('Does it make sense?', [`Straight across must be longer than ${c} but shorter than ${a} + ${c} = ${a + c}.`, `${b(h)} fits.`])],
      read: { find: 'The straight-line length across: the longest side of a right triangle.', know: [`one leg: ${a}`, `other leg: ${c}`], clue: 'East and north, wide and tall, long and wide: these meet at a right angle. The straight line across is the hypotenuse.', plan: `√(${pow(a, 2)} + ${pow(c, 2)})` } };
  }
  const t = pick(LEG)(a, h);
  return { story: t.story, ask: t.ask, visual: rightTri('?', a, h, { vr: c, hr: a }), answer: num(c), suffix: t.unit, op: 'multi', hint: 'The slanted length is the longest side. Take away the square of the leg you know.', _t: { k: 'pyth', find: 'leg', a, h },
    ways: [way('Take away the square you know', [`${pow(h, 2)} − ${pow(a, 2)} = ${fmt(sq(h))} − ${fmt(sq(a))} = ${fmt(sq(c))}`, `${sqrt(fmt(sq(c)))} = ${b(c)}`]), way('Check it', [`${pow(a, 2)} + ${pow(c, 2)} = ${sq(a)} + ${sq(c)} = ${fmt(sq(h))} = ${pow(h, 2)}`, 'The squares on the legs add up to the square on the slanted side.'])],
    read: { find: 'The upright side of a right triangle.', know: [`slanted side (longest): ${h}`, `along the ground: ${a}`], clue: 'A wall or tower meets the ground at a right angle. The slanted length is the hypotenuse, so subtract instead of adding.', plan: `√(${pow(h, 2)} − ${pow(a, 2)})` } };
}
// Sizes that exist: a can in centimeters, a tank or a pile of sand in meters. r and h are ranges for steps 1 to 3.
// A cone height is 3 times the h range, so that a third of the cylinder comes out whole. Cones (an extra step) wait for step 3.
const SOLIDS = [
  { thing: 'A can of soup', shape: 'cyl', unit: 'centimeters', short: 'cm', r: [[2, 3], [3, 4], [3, 4]], h: [[8, 10], [8, 12], [10, 14]] },
  { thing: 'A candle', shape: 'cyl', unit: 'centimeters', short: 'cm', r: [[2, 3], [2, 4], [3, 5]], h: [[8, 10], [8, 12], [10, 14]] },
  { thing: 'A water tank', shape: 'cyl', unit: 'meters', short: 'm', r: [[2, 3], [2, 5], [3, 10]], h: [[2, 3], [2, 4], [3, 8]] },
  { thing: 'A paper cup', shape: 'cone', unit: 'centimeters', short: 'cm', r: [[2, 3], [3, 4], [3, 4]], h: [[2, 3], [2, 3], [3, 4]] },
  { thing: 'An ice cream cone', shape: 'cone', unit: 'centimeters', short: 'cm', r: [[2, 3], [2, 3], [3, 4]], h: [[3, 4], [3, 4], [3, 4]] },
  { thing: 'A pile of sand', shape: 'cone', unit: 'meters', short: 'm', r: [[2, 3], [2, 4], [3, 6]], h: [[1, 2], [1, 2], [1, 2]] },
];
export function volumeStory(L = 2) {
  const { thing, shape, unit, short, r: rr, h: hr } = pick(L < 3 ? SOLIDS.filter(s => s.shape === 'cyl') : SOLIDS), r = rnd(...rr[L - 1]), h = shape === 'cone' ? 3 * rnd(...hr[L - 1]) : rnd(...hr[L - 1]);
  const coef = shape === 'cone' ? r * r * h / 3 : r * r * h, v = R(3.14 * coef), base = fmt(R(3.14 * r * r));
  return { story: `${thing} is a ${shape === 'cyl' ? 'cylinder' : 'cone'} with ${k('radius ' + r + ' ' + short)} and ${k('height ' + h + ' ' + short)}.`, ask: `What is its volume in cubic ${unit}? Use 3.14 for π.`, answer: num(v), suffix: `cubic ${short}`, op: 'multi', hint: shape === 'cyl' ? 'Area of the circle, times the height.' : 'One third of the cylinder with the same base and height.', _t: { k: 'vol', shape, r, h, pi: '3.14' },
    ways: [way('Leave π until the end', [shape === 'cyl' ? `π × ${pow(r, 2)} × ${h} = ${coef}π` : `${F(1, 3)} × π × ${pow(r, 2)} × ${h} = ${F(1, 3)} × ${r * r * h}π = ${coef}π`, `${coef} × 3.14 = ${b(fmt(v))}`]),
      way('Base first', [`Base circle: 3.14 × ${r} × ${r} = ${base} square ${short}.`, shape === 'cyl' ? `Stack it ${h} ${short} high: ${base} × ${h} = ${b(fmt(v))}` : `A cylinder that tall would hold ${base} × ${h} = ${fmt(R(3.14 * r * r * h))}. The cone is a third of that: ${b(fmt(v))}`])],
    read: { find: `The space inside, in cubic ${unit}.`, know: [`radius ${r} ${short}`, `height ${h} ${short}`, 'π is taken as 3.14'], clue: shape === 'cyl' ? 'A cylinder is a circle stacked up: base area times height.' : 'A cone holds one third of the cylinder with the same base and height.', plan: shape === 'cyl' ? `3.14 × ${r} × ${r} × ${h}` : `3.14 × ${r} × ${r} × ${h} ÷ 3` } };
}
const SQUARES = [['garden', 'fence', 'meters'], ['courtyard', 'string of lights', 'meters'], ['practice field', 'painted line', 'meters'], ['tabletop', 'trim', 'inches']];
export function squareStory(L = 2) {
  const [place, edge, unit] = pick(SQUARES), n = rnd([4, 7, 11][L - 1], [10, 15, 20][L - 1]), N = n * n;
  return { story: `A square ${place} has an area of ${k(fmt(N) + ' square ' + unit)}. A ${edge} goes all the way around its edge.`, ask: `How many ${unit} of ${edge} are needed?`, answer: num(4 * n), suffix: unit, op: 'multi', hint: 'Find the length of one side first.', _t: { k: 'rootperim', N },
    ways: [way('Side, then all four sides', [`One side is ${sqrt(fmt(N))} = ${n}, because ${n} × ${n} = ${fmt(N)}.`, `Four equal sides: 4 × ${n} = ${b(4 * n)}`]), way('Check with the area', [`A square with perimeter ${4 * n} has sides of ${4 * n} ÷ 4 = ${n}.`, `${n} × ${n} = ${fmt(N)}, which matches the area.`])],
    read: { find: `The distance all the way around the ${place}.`, know: [`it is a square`, `area ${fmt(N)} square ${unit}`], clue: 'Area of a square is side × side, so the side is the square root. “All the way around” is the perimeter: 4 sides.', plan: `4 × ${sqrt(fmt(N))}` } };
}
// [thing, unit, time word, verb, fastest believable rate, biggest start in tens, scale]. A bathtub holds about 150 liters.
const FILL = [['A bathtub', 'liters', 'minute', 'filling', 12, 4, 1], ['A download', 'megabytes', 'minute', 'running', 25, 8, 1], ['A fundraiser total', 'dollars', 'day', 'growing', 25, 8, 1], ['A storage tank', 'liters', 'minute', 'filling', 25, 8, 10]];
export function rateStory(L = 2) {
  const [thing, unit, time, verb, fast, tens, scale] = pick(FILL), m = rnd(L === 1 ? 2 : 4, Math.min([9, 15, 25][L - 1], fast)) * scale, t1 = rnd(1, 4), t2 = t1 + rnd(2, 5);
  const start = rnd(L === 1 ? 1 : 0, Math.min(L === 1 ? 4 : 8, tens)) * 10 * scale, y1 = start + m * t1, y2 = start + m * t2;
  return { story: `${thing} is ${verb} at a steady rate. After ${k(count(t1, time))} it is at ${k(fmt(y1) + ' ' + unit)}, and after ${k(count(t2, time))} it is at ${k(fmt(y2) + ' ' + unit)}.`,
    ask: `What is the rate of change, in ${unit} per ${time}?`, answer: num(m), op: 'multi', hint: 'How much did the amount change, and how much time did that take?', _t: { k: 'slope', p: [t1, y1], q: [t2, y2] },
    ways: [way('Change over change', [`Change in amount: ${fmt(y2)} − ${fmt(y1)} = ${fmt(y2 - y1)}.`, `Change in time: ${t2} − ${t1} = ${t2 - t1}.`, `${fmt(y2 - y1)} ÷ ${t2 - t1} = ${b(fmt(m))}`]), way('Do not divide the totals', [`${fmt(y2)} ÷ ${t2} only works if it started at 0.`, start ? `Here it started at ${fmt(start)}, so use the changes: ${F(fmt(y2 - y1), t2 - t1)} = ${b(fmt(m))}.` : `Here it did start at 0, and ${fmt(y2)} ÷ ${t2} = ${b(fmt(m))} as well. Using the changes always works.`])],
    read: { find: `How much is added in one ${time}.`, know: [`${fmt(y1)} at ${count(t1, time)}`, `${fmt(y2)} at ${count(t2, time)}`], clue: '“Rate of change” is the change in the amount divided by the change in time. Subtract twice, then divide.', plan: `(${fmt(y2)} − ${fmt(y1)}) ÷ (${t2} − ${t1})` } };
}
export function predictStory(L = 2) {
  const f = pick(L === 1 ? FITS.filter(g => g.m[0] > 0) : FITS), m = rnd(...f.m), c = rnd(...f.c), x = rnd(...f.xs), y = m * x + c;
  return { story: `${pick(['A student', 'A class', 'A researcher'])} plots ${k(f.x)} against ${k(f.y)} and draws a line of best fit: ${k(eqn(m, c))}.`, ask: `What does the line predict when x is ${x}?`, answer: num(y), op: 'multi', hint: `Put ${x} in place of x.`, _t: { k: 'scpred', m, c, x },
    ways: [way('Substitute', substSteps(m, c, x)), way('Start value plus changes', [`The line starts at ${c} when x is 0.`, `${count(x, 'step')} of ${fmt(m)} is ${fmt(m * x)}. ${startPlus(c, m * x, y)}`])],
    read: { find: `The predicted ${f.y}.`, know: [`the line: ${eqn(m, c)}`, `x = ${x} (${f.x})`], clue: 'A line of best fit is a rule for predicting. Replace x with the value you are asked about.', plan: c === 0 ? `${fmt(m)} × ${x}` : `${fmt(m)} × ${x} ${plus(c)}` } };
}
