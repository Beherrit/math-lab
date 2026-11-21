// Similar triangles, and sine on a right triangle and the unit circle.
import { rnd, pick, num, frac } from '../../util.js';
import { similarPair, rightTri, quarterCircle } from './blocks.js';
import { wordChoice, problem } from './ask.js';

const SIMILAR = 'Similar triangles have matching angles, so every side is multiplied by the same factor. Subtracting a pair of sides gives the difference, not the scale. A reason needs two matching angles.';
const TRIG = 'Sine is the opposite side divided by the hypotenuse. The adjacent side belongs to cosine. On the unit circle, sine is the height of the point, not its horizontal distance.';
const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13]];

export function genSimilar(L) {
  const k = rnd(2, 3);
  if (L === 1) {
    return problem({
      ask: 'These triangles are similar. What is the scale factor from the small one to the large one?',
      visual: similarPair(k, false), answer: num(k),
      hint: 'Divide a large side by the matching small side.', why: SIMILAR,
      t1: 'Divide matching sides', steps: [`The short bases are 3 and ${3 * k}.`, `${3 * k} ÷ 3 = ${k}.`],
      t2: 'Subtracting is the difference', steps2: [`${3 * k} − 3 = ${3 * k - 3} is how much longer the side is.`, `The scale factor is ${k}, because every side is multiplied.`],
    });
  }
  if (L === 2) {
    return problem({
      ask: `The small triangle is 3, 4, 5. The scale factor is ${k}. How long is the longest side of the large triangle?`,
      visual: similarPair(k, true), answer: num(5 * k),
      hint: 'Multiply the matching side by the scale factor.', why: SIMILAR,
      t1: 'Multiply', steps: [`The longest small side is 5.`, `5 × ${k} = ${5 * k}.`],
      t2: 'Do not subtract', steps2: [`5 − ${k} is not a side of the large triangle.`, `Every side grows by the factor ${k}.`],
    });
  }
  return problem({
    ask: 'Which fact is a reason these triangles are similar?',
    visual: similarPair(k, false),
    answer: wordChoice('Two matching angles', ['The sides were subtracted', 'Only one side is shared', 'The areas are equal']),
    hint: 'Similar triangles match by their angles.', why: SIMILAR,
    t1: 'Two angles are enough', steps: ['Each triangle has a right angle and another matching angle.', 'Two matching angles force the third to match too.'],
    t2: 'A shared side is not enough', steps2: ['One shared side does not make the shapes similar.', 'The scale factor then multiplies every side.'],
  });
}

export function genTrig(L) {
  if (L === 1) {
    return problem({
      ask: 'In a right triangle, sine of an acute angle is which ratio?',
      visual: rightTri(3, 4, 5),
      answer: wordChoice('opposite / hypotenuse', ['adjacent / hypotenuse', 'opposite / adjacent', 'hypotenuse / opposite']),
      hint: 'Sine uses the side across from the angle and the longest side.', why: TRIG,
      t1: 'Opposite over hypotenuse', steps: ['The opposite side is across from the angle.', 'Divide it by the hypotenuse.'],
      t2: 'The adjacent side is cosine', steps2: ['Adjacent over hypotenuse is cosine.', 'Opposite over adjacent is tangent.'],
    });
  }
  if (L === 2) {
    const [o, a, h] = pick(TRIPLES);
    return problem({
      ask: `The opposite side is ${o} and the hypotenuse is ${h}. What is the sine?`,
      visual: rightTri(o, a, h), answer: frac(o, h),
      hint: 'Write opposite over hypotenuse, then simplify if you can.', why: TRIG,
      t1: 'Write the ratio', steps: [`Sine is ${o} / ${h}.`, `The adjacent side ${a} is not part of sine.`],
      t2: 'Not the adjacent side', steps2: [`${a} / ${h} would be the cosine.`, `Sine uses the opposite side ${o}.`],
    });
  }
  return problem({
    ask: 'On this quarter circle, which measure is the sine of the angle?',
    visual: quarterCircle(),
    answer: wordChoice('the height', ['the horizontal distance', 'the radius', 'the angle size']),
    hint: 'On the circle, sine is how high the point sits.', why: TRIG,
    t1: 'Height is sine', steps: ['The point’s height is the sine.', 'Its horizontal distance is the cosine.'],
    t2: 'The radius is 1', steps2: ['On the unit circle the long side is 1.', 'Dividing the height by 1 leaves the height.'],
  });
}
