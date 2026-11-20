// The level 3 skills that fill in the rest of what school teaches at this level, with their strand and learning text.
import { F, M } from '../../util.js';
import { skill } from './skill-def.js';
import { genTimes } from './times-as-many.js';
import { genPattern } from './patterns.js';
import { genTen } from './ten-times.js';
import { genFparts } from './frac-parts.js';
import { genMixAdd } from './mixed-addsub.js';
import { genTenHund } from './tenth-hundredth.js';
import { genDecOrder } from './dec-order.js';
import { genConvert } from './convert.js';
import { genLinePlot } from './lineplot.js';
import { genProtractor } from './protractor.js';
import { genLines } from './lines-shapes.js';
import { genSymmetry } from './symmetry.js';
import { genEstimate } from './estimate-check.js';

export const NEW = [
  skill('l3times', 'Multiplying and dividing', '4.OA.1–2', 'Times as many', '“3 times as many” and “3 more” are different', genTimes, {
    big: '“3 times as many” means 3 copies of the smaller amount, so you multiply. “3 more” means adding 3 to it. They sound alike but give very different amounts.',
    tips: ['Draw the smaller amount as one block. “3 times as many” is 3 blocks that size.', '“More than” is about the gap between two amounts. “Times as many” is about how many copies fit.',
      'To find the smaller amount, divide the bigger one by the number of times.', 'To find how many times, divide the bigger amount by the smaller one.'],
    words: [['times as many', 'that many equal copies of an amount'], ['more than', 'the amount plus some extra'], ['compare', 'look at two amounts to see how they relate']] }),
  skill('l3pattern', 'Algebra', '4.OA.5', 'Number and shape patterns', 'Follow a rule, find the rule, look ahead', genPattern, {
    big: 'A pattern follows a rule. Once you know the rule you can find any number in the pattern, even one far away, without writing out every step.',
    tips: ['Find the rule by looking at how much each number changes from the one before.', 'A rule can add the same number each time, or multiply by the same number each time.',
      'A rule can have effects it never says out loud. Adding an even number never changes odd or even. Adding an odd number flips it every time.', 'For a far-away number, count the jumps: the 20th number has had 19 jumps from the first.'],
    words: [['pattern', 'numbers or shapes that follow a rule'], ['rule', 'what you do to get from one number to the next'], ['term', 'one number in a pattern']] }),
  skill('l3shift', 'Numbers', '4.NBT.1', 'Ten times the place', 'Multiply and divide by 10, 100 and 1,000', genTen, {
    big: 'A digit is worth ten times as much as the same digit one place to its right. So multiplying by 10, 100 or 1,000 moves every digit left 1, 2 or 3 places, and dividing moves it right.',
    tips: ['In 770, the left 7 is worth 700 and the right 7 is worth 70. That is 10 times as much.', '× 10 puts one 0 on the end of a whole number. × 100 puts two, × 1,000 puts three.',
      'Dividing by 10, 100 or 1,000 takes zeros off the end, because it undoes the multiplying.', 'A place value chart shows each digit sliding left or right.'],
    words: [['place value', 'what a digit is worth because of where it sits'], ['ten times', 'one place to the left'], ['multiple of 10', 'a number that ends in 0']] }),
  skill('l3fparts', 'Fractions and decimals', '4.NF.3b', 'Breaking fractions apart', 'Unit fractions, sums and mixed numbers', genFparts, {
    big: `A fraction is a pile of equal pieces, so it can be broken into smaller piles in many ways. ${F(5, 8)} can be 5 pieces of ${F(1, 8)}, or ${F(2, 8)} + ${F(3, 8)}, or ${F(1, 8)} + ${F(4, 8)}.`,
    tips: ['Every piece must be the same size, so the bottom number stays the same in every part.', 'The tops of the parts must add up to the top of the whole.', `A mixed number is wholes plus a fraction: ${M(2, 3, 5)} = 2 + ${F(3, 5)}.`,
      `One whole can be written as a fraction with the same top and bottom: 1 = ${F(5, 5)}.`],
    words: [['unit fraction', `a fraction with 1 on top, like ${F(1, 6)}`], ['decompose', 'break a number into parts'], ['mixed number', 'a whole number and a fraction together']] }),
  skill('l3mixadd', 'Fractions and decimals', '4.NF.3c', 'Add and subtract mixed numbers', 'Same bottom, trading a whole', genMixAdd, {
    big: 'Add or subtract the wholes and the fractions separately. When the fractions make a whole or more, move it over to the wholes. When there are not enough pieces to take away, trade one whole for pieces.',
    tips: [`Adding: ${F(4, 5)} + ${F(3, 5)} = ${F(7, 5)}, which is 1 whole and ${F(2, 5)}, so add 1 to the wholes.`, `Subtracting: ${M(5, 1, 4)} − ${M(2, 3, 4)}. There is only ${F(1, 4)} to take ${F(3, 4)} from, so trade 1 whole: ${M(5, 1, 4)} = ${M(4, 5, 4)}.`,
      `A whole number is ${F(4, 4)} when the bottom is 4, so 5 − ${M(1, 3, 4)} starts by trading.`, 'You can also turn each mixed number into one fraction, work, and turn it back.'],
    words: [['mixed number', 'a whole number and a fraction together'], ['regroup', 'trade a whole for pieces, or pieces for a whole'], ['like denominators', 'the same bottom number']] }),
  skill('l3tenhund', 'Fractions and decimals', '4.NF.5–6', 'Tenths plus hundredths', 'Rename tenths, add, write as a decimal', genTenHund, {
    big: `One tenth is the same as ten hundredths, so ${F(3, 10)} = ${F(30, 100)}. Once both are in hundredths you can add them and write the answer as a decimal.`,
    tips: ['To rename tenths as hundredths, multiply the top by 10. The bottom goes from 10 to 100.', 'A grid of 100 squares shows it: each full column is one tenth, and each square is one hundredth.', `${F(3, 10)} + ${F(7, 100)} = ${F(30, 100)} + ${F(7, 100)} = ${F(37, 100)} = 0.37.`,
      'Money helps: a dime is a tenth of a dollar and a penny is a hundredth.'],
    words: [['tenth', 'one of 10 equal parts of a whole'], ['hundredth', 'one of 100 equal parts of a whole'], ['decimal', 'a number written with a point, like 0.37']] }),
  skill('l3decorder', 'Fractions and decimals', '4.NF.7', 'Compare and order decimals', 'Grids, number lines and money', genDecOrder, {
    big: 'Decimals can only be compared fairly when you look at the same places. Give every number two digits after the point, then compare them as hundredths.',
    tips: ['A longer decimal is not always bigger: 0.5 is more than 0.45, because 0.5 is 0.50.', 'Compare the wholes first. If they match, compare the tenths, then the hundredths.', 'A number line shows it: the one further right is bigger.',
      'Money is a good check. $3.40 is more than $3.04, because 40 cents is more than 4 cents.'],
    words: [['compare', 'decide which number is bigger, smaller or equal'], ['decimal point', 'the dot between the ones and the tenths'], ['order', 'put numbers in a line from least to greatest or the other way']] }),
  skill('l3convert', 'Measurement', '4.MD.1–2', 'Converting measurements', 'Larger units to smaller units', genConvert, {
    big: 'To change a larger unit into a smaller one, multiply by how many small units make one large unit. You get more of the smaller unit, because each one is smaller.',
    tips: ['Know the facts: 1 km = 1,000 m, 1 m = 100 cm, 1 kg = 1,000 g, 1 L = 1,000 mL, 1 h = 60 min, 1 min = 60 s, 1 ft = 12 in, 1 lb = 16 oz.', 'A two-column table helps: the left column counts up by 1, the right column jumps by the fact.',
      'Before you add or subtract amounts, write both in the same unit.', 'Check the size: a smaller unit means a bigger number.'],
    words: [['convert', 'write the same amount in a different unit'], ['unit', 'a standard size used to measure, like a meter or a gram'], ['equivalent', 'the same amount written another way']] }),
  skill('l3lineplot', 'Data and chance', '4.MD.4', 'Line plots with fractions', 'Halves, quarters and eighths', genLinePlot, {
    big: 'A line plot puts an X above each measurement on a number line. When the scale is in fractions, each tick is a fraction of a unit, and the X marks show how many things have that length.',
    tips: ['Read the scale first. Is each step a half, a quarter or an eighth?', 'Count the X marks above one length to see how many have that length.', 'Longest minus shortest is the distance between the right-most X and the left-most X.',
      'To total the lengths, multiply each length by its number of X marks, then add.'],
    words: [['line plot', 'a number line with an X for each measurement'], ['scale', 'the numbers marked along the line'], ['range', 'the gap between the smallest and largest value']] }),
  skill('l3protractor', 'Shapes and space', '4.MD.5–7', 'Measuring and adding angles', 'Protractor, turns and missing angles', genProtractor, {
    big: 'A protractor measures an angle in degrees. Line one ray up with 0, then read the number where the other ray crosses the same scale. Angles that fit together add up, so a missing angle can be found by subtracting.',
    tips: ['Use the scale that starts at 0 on the ray along the baseline.', 'If neither ray is on 0, read both rays on the same scale and subtract.', 'A full turn is 360°, so 90° is a quarter of a turn and 180° is a half turn.',
      'Angles around one point add up to 360°. Angles on a straight line add up to 180°.'],
    words: [['protractor', 'a tool for measuring angles'], ['degree', 'the unit for measuring a turn, written °'], ['full turn', 'all the way round, 360°']] }),
  skill('l3lines', 'Shapes and space', '4.G.1–2', 'Lines and shapes', 'Parallel, perpendicular, triangles and sides', genLines, {
    big: 'Lines can be parallel, which never meet, or perpendicular, which meet at a square corner. Shapes can be sorted by their sides and corners, and triangles by their biggest angle.',
    tips: ['Parallel lines stay the same distance apart, like the rails of a train track.', 'Perpendicular lines make a right angle, 90°, where they meet.', 'A triangle with a 90° angle is a right triangle. All angles under 90° is acute. One angle over 90° is obtuse.',
      'The three angles of any triangle add up to 180°.'],
    words: [['parallel', 'lines that never meet and stay the same distance apart'], ['perpendicular', 'lines that meet at a right angle'], ['right triangle', 'a triangle with one 90° angle']] }),
  skill('l3symmetry', 'Shapes and space', '4.G.3', 'Lines of symmetry', 'How many, and finishing the mirror', genSymmetry, {
    big: 'A line of symmetry is a fold that makes the two halves match exactly, like a mirror. Some shapes have none, some have one, and some have many.',
    tips: ['Imagine folding the shape. Do the two halves land on each other?', 'A rectangle has 2 lines of symmetry, a square has 4, and a regular shape has one for each side.', 'A point and its mirror point are the same distance from the line, on opposite sides.',
      'To finish a mirror picture, copy each square to the other side, the same distance from the line and in the same row.'],
    words: [['line of symmetry', 'a fold that makes both halves match'], ['mirror image', 'a picture flipped over a line'], ['symmetrical', 'having a line of symmetry']] }),
  skill('l3estimate', 'Multiplying and dividing', '4.OA.3', 'Estimating and checking', 'Is the answer reasonable?', genEstimate, {
    big: 'An estimate is a quick answer that is close enough. Round the numbers to ones that are easy to work with, work it out, and you know roughly how big the real answer should be.',
    tips: ['Round each number to its biggest place: 38 × 52 is about 40 × 50 = 2,000.', 'Compare the answer you got with your estimate. If they are very different, look for a mistake.',
      'Check the size of the answer: the number of digits should match the estimate.', 'For money, round up the price when you want to be sure you have enough.'],
    words: [['estimate', 'a quick answer that is close enough'], ['reasonable', 'makes sense for the size of the problem'], ['round', 'replace a number with a nearby simpler one']] }),
];
