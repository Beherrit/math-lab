// Level 6: the skills added to cover the full standards for this level. index.js puts them in the learning path.
import { genUnitRate } from './unit-rates.js';
import { genIsProp } from './prop-tests.js';
import { genPctMore } from './percent-more.js';
import { genRatDiv } from './rational-div.js';
import { genOrder } from './rational-order.js';
import { genRewrite } from './rewrite.js';
import { genRealWorld } from './realworld.js';
import { genWriteEq } from './write-equations.js';
import { genTriangles } from './triangles.js';
import { genSlices } from './slices.js';
import { genCircleBack } from './circle-back.js';
import { genSampling } from './sampling.js';
import { genExpProb } from './experiments.js';
import { genGroups } from './two-groups.js';
import { skill } from './skill.js';

export const NEW = [
  skill('l6unitrate', '7.RP.1', 'Unit rates with fractions', 'Half a mile in a quarter of an hour', genUnitRate, {
    big: 'A unit rate tells how much for ONE of something. When the amounts are fractions, you still find it by dividing: amount ÷ time.',
    tips: ['Per ONE hour means the amount goes on top and the time goes underneath.', 'Dividing by a fraction is the same as multiplying by its flip.', 'Or give both fractions the same bottom number and count same-size pieces.', 'Check the size: a time shorter than 1 means you get MORE than the amount in a whole one.'],
    words: [['unit rate', 'how much for one of something, like miles per hour'], ['rate', 'a comparison of two different amounts'], ['reciprocal', 'the flip of a fraction: 3/4 becomes 4/3']] }),
  skill('l6isprop', '7.RP.2', 'Is it proportional?', 'Testing a table, a graph and an equation', genIsProp, {
    big: 'A relationship is proportional when y is always the same number times x. That shows up in a table, on a graph and in an equation.',
    tips: ['Table: divide y by x in every column. The answer must be the same each time.', 'Graph: a straight line that goes through (0, 0). A line that starts higher up has a fee or head start built in.', 'Equation: y = kx is proportional. y = kx + 3 is not, because x = 0 gives y = 3.', 'The point (1, r) on the graph tells you the unit rate: r for every 1 of x.'],
    words: [['proportional', 'always the same ratio, so y = kx'], ['constant of proportionality', 'the number k that x is multiplied by'], ['origin', 'the point (0, 0) where the two axes cross']] }),
  skill('l6pctmore', '7.RP.3', 'Commission, fees and chained discounts', 'Percent error, then two percents in a row', genPctMore, {
    big: 'A percent is always a percent OF something. When two percents come one after the other, the second one is a percent of the new amount, not of the start.',
    tips: ['Commission and fees are a percent of a total: find that percent, then add it or pay it.', 'Percent error is the size of the mistake divided by the REAL value.', 'Two discounts in a row multiply: 20% off then 10% off leaves 0.8 × 0.9 of the price, which is not 70%.', 'Going backwards, divide by the multiplier instead of taking a percent of what you know.'],
    words: [['commission', 'pay that is a percent of what someone sells'], ['percent error', 'how far off a guess was, as a percent of the real value'], ['markdown', 'a price cut'], ['fee', 'an extra charge added to a price']] }),
  skill('l6ratdiv', '7.NS.2', 'Dividing integers and signs in fractions', 'Where the minus sign sits, and decimals that stop or repeat', genRatDiv, {
    big: 'A division with different signs is negative. So −3/4, (−3)/4 and 3/(−4) are all the same number. A fraction as a decimal either stops or repeats.',
    tips: ['One minus sign anywhere in a division makes the answer negative. Two make it positive.', 'Dividing by 0 is not allowed: no number times 0 can make anything but 0.', 'Long division turns a fraction into a decimal. If a remainder comes back, the digits repeat from there.', 'A fraction in lowest terms stops only when its bottom number is made of 2s and 5s.'],
    words: [['terminating decimal', 'a decimal that stops, like 0.75'], ['repeating decimal', 'a decimal whose digits repeat forever, like 0.333...'], ['quotient', 'the answer to a division'], ['division by 0', 'not allowed: no number times 0 can make anything but 0']] }),
  skill('l6order', '7.NS.1–3', 'Order of operations and distance', 'Rational numbers, and |a − b| on the number line', genOrder, {
    big: 'The order of operations works with negatives, decimals and fractions exactly as it does with whole numbers. The distance between two numbers is the size of their difference.',
    tips: ['Brackets first, then multiply and divide, then add and subtract.', 'Keep the sign with its number. Put a negative number in brackets after an operation sign.', 'Distance between a and b is |a − b|. It never comes out negative.', 'Numbers on opposite sides of 0 are far apart: add their sizes. On the same side: subtract.'],
    words: [['absolute value', 'the distance of a number from 0, written |x|'], ['order of operations', 'the agreed order: brackets, multiply and divide, add and subtract'], ['distance', 'how far apart two numbers are on the number line']] }),
  skill('l6rewrite', '7.EE.2', 'Rewriting to see what it means', 'a + 0.05a is 1.05a', genRewrite, {
    big: 'The same quantity can be written in different forms, and one form can tell you more. a + 0.05a is the same as 1.05a, so adding 5% is multiplying by 1.05.',
    tips: ['A plain letter is 1 of it: a is 1a. So a + 0.05a = (1 + 0.05)a = 1.05a.', 'Increase by p%: multiply by 1 + p/100. Decrease by p%: multiply by 1 − p/100.', 'Two percent changes in a row: multiply the two multipliers. The second percent works on the new amount.', 'Not sure two forms match? Try a number like 100 in both.'],
    words: [['multiplier', 'the number you multiply by to apply a percent change, like 1.05'], ['equivalent expressions', 'different-looking expressions that always have the same value'], ['like terms', 'terms with the same letter, which can be combined']] }),
  skill('l6realworld', '7.EE.3', 'Real-world problems with rational numbers', 'Several steps, then check by estimating', genRealWorld, {
    big: 'Real problems mix fractions, decimals, percents and negative numbers. Take them one step at a time, keep every sign, and check the answer with a quick estimate.',
    tips: ['Turn each piece into a number you can work with, and keep a minus sign for debts, falls and anything below zero.', 'A percent works on the amount in front of you at that moment, not on the start.', 'Estimate first with easy numbers. If your exact answer is far from the estimate, look for a slip.', 'Ask whether the answer makes sense: can a price after a discount be higher than before?'],
    words: [['estimate', 'a quick answer using easy numbers, close to the real one'], ['reasonable', 'sensible: close to what an estimate says'], ['balance', 'the money in an account; negative when you owe']] }),
  skill('l6writeeq', '7.EE.4', 'Equations and inequalities from stories', 'px + q = r, p(x + q) = r, and graphing the answers', genWriteEq, {
    big: 'To solve a story, say what each part means, write it as an equation or inequality, then solve it. The algebra does the same steps as working backwards with numbers.',
    tips: ['Amounts paid once (a fee) are added. Amounts that repeat (a price each) are multiplied by x.', 'If the same extra is added to each one, it goes inside brackets: p(x + q).', '"At least" is ≥, "at most" is ≤, "more than" is >, "fewer than" is <.', 'On a graph, a filled circle means the number counts. An open circle means it does not.'],
    words: [['inequality', 'a statement that uses <, >, ≤ or ≥'], ['solution set', 'all the numbers that make it true'], ['boundary', 'the number where an inequality changes from true to false']] }),
  skill('l6triangles', '7.G.2', 'Triangles from conditions', 'Which lengths and angles make a triangle?', genTriangles, {
    big: 'A triangle needs its two shorter sides to reach past the longest one, and its three angles to add to 180°. Some measurements fix one triangle, some allow many, and some allow none.',
    tips: ['Three side lengths work only if the two shorter ones add to MORE than the longest.', 'The third side is shorter than the other two together and longer than their difference.', 'Three angles work only if they add to exactly 180°.', 'Three sides, or two sides and the angle between them, or two angles and the side between them, fix one triangle. Three angles alone do not.'],
    words: [['triangle inequality', 'two sides of a triangle always add to more than the third side'], ['unique', 'only one is possible'], ['included angle', 'the angle between two given sides']] }),
  skill('l6slices', '7.G.3', 'Slicing solids', 'The flat shape a cut makes', genSlices, {
    big: 'When a flat cut goes through a solid, the cut surface is a flat shape. A cut parallel to a face copies that face. A cut through the top point of a pyramid makes a triangle.',
    tips: ['Picture slicing a loaf of bread. A slice parallel to an end looks just like that end.', 'Check which edges the cut crosses. Each crossing is a corner of the cut shape.', 'A cut halfway up a pyramid, parallel to the base, makes a smaller square with half the side.', 'A prism has the same cross-section all the way along, so slices parallel to its ends are all identical.'],
    words: [['cross-section', 'the flat shape you see when a solid is cut through'], ['pyramid', 'a solid with a flat base and sloping sides that meet at a point'], ['prism', 'a solid with the same shape all the way along its length']] }),
  skill('l6circback', '7.G.4, 7.G.6', 'Circles backwards and mixed shapes', 'Radius from area, and shapes with circle parts', genCircleBack, {
    big: 'You can work the circle formulas backwards: area gives the radius, circumference gives the radius. Shapes made of rectangles and parts of circles are found piece by piece.',
    tips: ['Area = 3.14 × r × r. To go back, divide by 3.14, then ask which number times itself gives the answer.', 'Circumference = 2 × 3.14 × r. Divide by 6.28 to get the radius.', 'Two half circles make one whole circle. A half circle is half of the circle formula.', 'A shape with a hole: area of the whole minus area of the hole.'],
    words: [['composite shape', 'a shape made from simpler shapes'], ['semicircle', 'half of a circle'], ['radius', 'centre to edge']] }),
  skill('l6sampling', '7.SP.1, 7.SP.2', 'Samples and estimates', 'Random or biased, and scaling a sample up', genSampling, {
    big: 'A random sample is a small copy of a whole group, so what you find in it can be scaled up to estimate the whole group. A biased sample leaves out some people, so it misleads.',
    tips: ['A fair sample gives every member of the whole group the same chance of being picked.', 'To scale up: find the fraction or percent in the sample, then take that part of the whole group.', 'Bigger random samples usually give estimates closer to the truth.', 'Two samples of the same size can give different results. That is normal, and it shows how much an estimate can vary.'],
    words: [['population', 'the whole group you want to know about'], ['sample', 'a small part of the whole group that you ask'], ['biased', 'unfair to some members of the group'], ['estimate', 'a good guess based on a sample']] }),
  skill('l6expprob', '7.SP.6, 7.SP.7', 'Experiments and chance', 'What happened compared with what should happen', genExpProb, {
    big: 'Theoretical probability says what should happen when outcomes are equally likely. Relative frequency says what did happen in a real experiment. They are close, but rarely equal.',
    tips: ['Relative frequency = the number of times it happened ÷ the number of trials.', 'To predict, multiply the probability by the number of trials.', 'Results of a few trials can be far from the theoretical probability just by chance.', 'More trials usually bring the relative frequency closer to the theoretical probability.'],
    words: [['relative frequency', 'how often something happened out of all the trials'], ['theoretical probability', 'what should happen, worked out from equally likely outcomes'], ['trial', 'one go at an experiment']] }),
  skill('l6groups', '7.SP.3, 7.SP.4', 'Comparing two groups', 'The gap between centres in spreads, and overlap', genGroups, {
    big: 'To compare two groups, see how far apart their centres are compared with how spread out each group is. A gap of several spreads means the groups hardly overlap.',
    tips: ['Find each mean. The gap is the difference of the means.', 'Divide the gap by the mean absolute deviation to measure it in spreads.', 'About 1 spread or less: the groups overlap a lot. 3 spreads or more: they barely overlap.', 'Two dot plots on one number line show overlap at a glance.'],
    words: [['mean absolute deviation', 'the average distance of the values from the mean'], ['overlap', 'sharing the same part of the number line'], ['dot plot', 'a number line with a dot for each value']] }),
];
