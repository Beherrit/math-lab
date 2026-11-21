// Conditional probability from a two-way table, and the middle of a bell curve.
import { pick, frac, table } from '../../util.js';
import { bellCurve } from './blocks.js';
import { wordChoice, problem } from './ask.js';

const WHY = 'A conditional probability divides by the group you were given, not by everyone in the table. On a bell curve, about 68 percent of the values sit within one step of the center. About 95 percent is two steps.';

function grid() {
  const a = pick([4, 6, 8, 9]);
  const b = pick([2, 4, 6, 8]);
  const c = pick([3, 6, 9]);
  const d = pick([2, 4, 5, 8]);
  const visual = table(['', 'Passed', 'Not yet'], [['In the club', a, b], ['Not in the club', c, d]]);
  return { a, b, c, d, visual };
}

export function genChance(L) {
  const { a, b, c, d, visual } = grid();
  const everyone = a + b + c + d;
  if (L === 1) {
    return problem({
      ask: 'A student is in the club. What fraction of those students passed?',
      visual, answer: frac(a, a + b),
      hint: 'Stay in the club row. Do not use the whole table.', why: WHY,
      t1: 'Use only the club row', steps: [`The club row has ${a} who passed and ${b} who did not.`, `${a} out of ${a + b} passed.`],
      t2: 'Not everyone', steps2: [`The whole table has ${everyone} students.`, `The question already says the student is in the club, so the denominator is ${a + b}.`],
    });
  }
  if (L === 2) {
    return problem({
      ask: 'A student passed. What fraction of those students are in the club?',
      visual, answer: frac(a, a + c),
      hint: 'Stay in the passed column. The club row is not the whole group now.', why: WHY,
      t1: 'Use only the passed column', steps: [`${a} in the club passed, and ${c} not in the club passed.`, `${a} out of ${a + c} are in the club.`],
      t2: 'The condition changed', steps2: ['Now the given group is everyone who passed.', `Dividing by all ${everyone} students answers a different question.`],
    });
  }
  return problem({
    ask: 'About what percent of the values sit within one step of the center?',
    visual: bellCurve(), answer: wordChoice('about 68', ['about 95', 'about 50', 'about 100']),
    hint: 'One step from the center is the tall middle of the bell, not almost everyone.', why: WHY,
    t1: 'One step is the middle band', steps: ['The shaded band is one step on either side of the center.', 'About 68 percent of the values sit there.'],
    t2: '95 percent is wider', steps2: ['About 95 percent sit within two steps of the center.', 'Half, or everyone, does not match the band.'],
  });
}
