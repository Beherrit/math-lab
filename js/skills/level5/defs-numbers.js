// Numbers: negatives and other rational numbers on the number line.
import { skillIn } from './skill.js';
import { genRatNum } from './ratcompare.js';
import { genNeg } from './negatives.js';
import { genOrder } from './ordering.js';

const skill = skillIn('Numbers');

export const SKILLS = [
  skill('l5neg', '6.NS.5–7', 'Negative numbers', 'Number line, opposites, absolute value', genNeg, 'Negative numbers are the numbers below zero. They describe things like temperatures below freezing, depths and money owed.',
    ['On a number line, negatives are to the left of 0.', 'Opposites are the same distance from 0 on different sides: 4 and −4.', 'Absolute value is the distance from 0. It is never negative: |−7| = 7.', 'The distance between a negative and a positive number: add their distances from 0.'],
    [['negative', 'less than zero'], ['opposite', 'same distance from 0, other side'], ['absolute value', 'distance from 0, written |x|'], ['integer', 'a whole number, its opposite, or 0']]),
  skill('l5order', '6.NS.7', 'Compare and order', 'Which is less, which is greater', genOrder, 'On a number line, a number further to the left is always smaller. That is true for negatives too, so −8 is less than −3.',
    ['Every negative number is less than every positive number.', 'With two negatives, the one further from zero is the smaller one.', 'Think of temperature: −8° is colder than −3°.', 'The open side of &lt; and &gt; faces the greater number.'],
    [['less than &lt;', 'further left on the number line'], ['greater than &gt;', 'further right on the number line']]),
  skill('l5ratnum', '6.NS.5–7', 'Rational numbers', 'Fractions and decimals on the number line', genRatNum, 'Negative numbers are not only whole numbers. Fractions and decimals sit between the whole numbers on both sides of zero, and the same rules about opposites and order still work.',
    ['Between two whole numbers a number line has room for halves, quarters and tenths. Count the small steps.', 'The opposite of a number is the same distance from 0 on the other side. The opposite of the opposite is the number itself.', 'Change fractions and decimals to the same form before you compare them.', 'Zero is the starting point in a story: sea level, freezing, owing nothing. Negative means below it.'],
    [['rational number', 'a number that can be written as a fraction, like −3/4 or 0.5'], ['opposite', 'same distance from 0, other side'], ['between', 'bigger than one number and smaller than another']]),
];
