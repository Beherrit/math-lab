// Level 5: ratios, percents and negatives. Skill list and story sources; the generators live in the topic files.
import { genRatio, genEqRatio, ratioWord, mixWord } from './ratios.js';
import { genRate, rateWord } from './rates.js';
import { genPct, genPctWhole, pctWord, wholeWord } from './percents.js';
import { genFdp } from './convert.js';
import { genFracDiv, fracDivWord } from './fracdiv.js';
import { genGcf, gcfWord } from './factors.js';
import { genDecOps, addWord, subWord, changeWord, splitWord } from './decimals.js';
import { genNeg, tempWord } from './negatives.js';
import { genOrder } from './ordering.js';
import { genPlane } from './plane.js';
import { genExp } from './exponents.js';
import { genExpr, exprWord } from './expressions.js';
import { genEquiv } from './equivalent.js';
import { genEq, eqWord } from './equations.js';
import { genIneq } from './inequalities.js';
import { genArea, areaWord } from './area.js';
import { genSolid, boxWord } from './solids.js';
import { genStats, statWord } from './stats.js';
import { genPlots } from './plots.js';
import { makeStory } from '../level4/story.js';

// Story problems for this level: each source is (L) => a story problem object.
export const STORY_SOURCES = [ratioWord, mixWord, rateWord, pctWord, wholeWord, fracDivWord, gcfWord, addWord, subWord, changeWord, splitWord, tempWord, exprWord, eqWord, areaWord, boxWord, statWord];
// The three steps of the story skill: one operation first, then the standard mix, then problems that take several steps.
const STORY_STEPS = [
  [addWord, subWord, rateWord, eqWord, areaWord, tempWord, gcfWord],
  [ratioWord, mixWord, rateWord, pctWord, wholeWord, fracDivWord, gcfWord, eqWord, areaWord, tempWord, statWord, addWord, subWord],
  [changeWord, splitWord, pctWord, wholeWord, exprWord, boxWord, statWord, mixWord, fracDivWord, gcfWord, rateWord, ratioWord],
];
const genStory = L => makeStory(STORY_STEPS[L - 1], L);
const skill = (id, std, title, sub, gen, big, tips, words, extra = {}) => ({ id, level: 5, std, title, sub, gen, school: true, learn: { big, tips, words }, ...extra });

export const SKILLS = [
  skill('l5ratio', '6.RP.1', 'Ratios', 'Comparing two amounts', genRatio, 'A ratio compares two amounts by saying how much of one there is for a certain amount of the other.',
    ['3:5 is read “3 to 5”. The order of the numbers follows the order of the words.', 'A ratio can compare part to part (cats to dogs) or part to whole (cats to all the animals).', 'Simplify a ratio like a fraction: divide both numbers by the same number.', 'A tape diagram draws each part as a row of equal boxes.'],
    [['ratio', 'a comparison of two amounts, like 3:5'], ['part to whole', 'one group compared with everything'], ['simplest form', 'no number divides both parts any more']]),
  skill('l5eqratio', '6.RP.3a', 'Equivalent ratios', 'Ratio tables and tape diagrams', genEqRatio, 'Equivalent ratios describe the same mix in a bigger or smaller batch. You get them by multiplying or dividing both numbers by the same number.',
    ['Multiply (or divide) BOTH parts by the same number.', 'Adding the same number to both parts changes the mix, so it does not work.', 'A ratio table lists batches: every row is the first row times something.', 'On a grid, equivalent ratios make a straight line through (0, 0).'],
    [['equivalent ratios', 'ratios that describe the same mix, like 2:3 and 4:6'], ['ratio table', 'a table of matching amounts'], ['tape diagram', 'bars made of equal boxes']]),
  skill('l5rate', '6.RP.2, 3b', 'Unit rates', 'Per one, and best buys', genRate, 'A unit rate tells how much for just ONE: one hour, one item, one kilogram. Once you know it, you can find any amount.',
    ['“Per” means “for each one”. Divide the total by the number of units.', 'To compare two deals, find the price of one in each.', 'Or compare the same amount: what would 12 cost in each pack?', 'A bigger pack is not always the better buy. Check.'],
    [['rate', 'a ratio of two different kinds of things, like km and hours'], ['unit rate', 'the amount for 1'], ['per', 'for each']]),
  skill('l5pct', '6.RP.3c', 'Percent of a number', 'Percent means per 100', genPct, 'Percent means “for every 100”. 30% of something is 30 out of every 100 parts of it.',
    ['10% is one tenth: divide by 10. 5% is half of that. 1% is divide by 100.', 'Build other percents from those chunks: 35% = 10% + 10% + 10% + 5%.', 'Or change the percent to a decimal and multiply: 35% of 80 = 0.35 × 80.', '50% is half, 25% is a quarter, 100% is all of it.'],
    [['percent', 'out of 100'], ['discount', 'an amount taken off the price'], ['tip', 'an extra amount added on']]),
  skill('l5pctwhole', '6.RP.3c', 'Find the whole', 'From a part and its percent', genPctWhole, 'If you know a part and what percent it is, you can rebuild the whole: find a small chunk first, then scale up to 100%.',
    ['The part is smaller than the whole (when the percent is under 100).', 'Find one easy chunk first, like 10% or 25%. Then count how many chunks make 100%.', 'A ratio table keeps percent and amount side by side.', 'Check by taking the percent of your answer. You should get the part back.'],
    [['whole', 'the full amount, 100%'], ['part', 'a piece of the whole']]),
  skill('l5fdp', '6.RP.3c', 'Fractions, decimals, percents', 'Three names for one number', genFdp, 'A fraction, a decimal and a percent can all name the same amount. Changing between them never changes the size.',
    ['Fraction to decimal: divide the top by the bottom.', 'Decimal to percent: multiply by 100. Percent to decimal: divide by 100.', 'Percent to fraction: write it over 100, then simplify.', 'To compare numbers in different forms, change them all to the same form first.'],
    [['percent', 'a number out of 100'], ['equivalent', 'the same value written a different way']]),
  skill('l5fracdiv', '6.NS.1', 'Divide fractions', 'How many fit, and why we flip', genFracDiv, 'Dividing by a fraction asks “how many of these pieces fit?” That is why the answer can be bigger than the number you started with.',
    ['Give both fractions the same bottom number. Then just divide the tops.', 'Or multiply by the divisor turned upside down. It works because cutting into smaller pieces makes more of them.', 'Change mixed numbers into fractions first.', 'Check: your answer times the divisor should give the first number back.'],
    [['divisor', 'the number you divide by'], ['reciprocal', 'a fraction turned upside down'], ['quotient', 'the answer to a division']]),
  skill('l5decops', '6.NS.2–3', 'Decimals in real life', 'Add, subtract, multiply, divide', genDecOps, 'Decimal arithmetic follows the same place-value rules as whole numbers. Lining up the places is what keeps it right.',
    ['Adding and subtracting: line up the decimal points.', 'Multiplying: multiply as whole numbers, then put back as many decimal places as the problem had.', 'Dividing by a decimal: multiply both numbers by 10 or 100 until the divisor is whole.', 'Money check: working in cents turns decimals into whole numbers.'],
    [['decimal places', 'digits after the point'], ['divisor', 'the number you divide by'], ['change', 'money you get back']]),
  skill('l5gcf', '6.NS.4', 'Factors and multiples', 'Greatest common factor, least common multiple', genGcf, 'Factors divide a number exactly. Multiples are what you get when you count by it. Two numbers can share both.',
    ['Greatest common factor: the biggest number that divides both.', 'Least common multiple: the first number that both count up to.', 'Splitting into equal groups with nothing left over is a factor question. Things that repeat and line up again is a multiple question.', 'A common factor can be pulled out of a sum: 12 + 18 = 6(2 + 3).'],
    [['factor', 'a number that divides another exactly'], ['multiple', 'a number in the times table of another'], ['common', 'shared by both']]),
  skill('l5neg', '6.NS.5–7', 'Negative numbers', 'Number line, opposites, absolute value', genNeg, 'Negative numbers are the numbers below zero. They describe things like temperatures below freezing, depths and money owed.',
    ['On a number line, negatives are to the left of 0.', 'Opposites are the same distance from 0 on different sides: 4 and −4.', 'Absolute value is the distance from 0. It is never negative: |−7| = 7.', 'The distance between a negative and a positive number: add their distances from 0.'],
    [['negative', 'less than zero'], ['opposite', 'same distance from 0, other side'], ['absolute value', 'distance from 0, written |x|'], ['integer', 'a whole number, its opposite, or 0']]),
  skill('l5order', '6.NS.7', 'Compare and order', 'Which is less, which is greater', genOrder, 'On a number line, a number further to the left is always smaller. That is true for negatives too, so −8 is less than −3.',
    ['Every negative number is less than every positive number.', 'With two negatives, the one further from zero is the smaller one.', 'Think of temperature: −8° is colder than −3°.', 'The open side of &lt; and &gt; faces the greater number.'],
    [['less than &lt;', 'further left on the number line'], ['greater than &gt;', 'further right on the number line']]),
  skill('l5plane', '6.NS.6, 8', 'Four quadrants', 'Points with negative coordinates', genPlane, 'With negative numbers the coordinate grid grows in every direction. The two axes split it into four quadrants.',
    ['x comes first: right is positive, left is negative.', 'y comes second: up is positive, down is negative.', 'Quadrants are numbered I to IV, starting top right and going round to the left.', 'Flipping a point over an axis changes the sign of one coordinate only.', 'Points on the same line: add the distances if they are on opposite sides of an axis.'],
    [['quadrant', 'one of the four parts of the grid'], ['origin', 'the point (0, 0)'], ['reflection', 'a flip over a line']]),
  skill('l5exp', '6.EE.1', 'Exponents', 'Powers and the order of operations', genExp, 'An exponent is a short way to write the same number multiplied again and again: 2⁴ means 2 × 2 × 2 × 2.',
    ['The big number is the base. The small raised number says how many times to multiply it.', '3² is 3 × 3 = 9, not 3 × 2.', 'Order: brackets, then exponents, then × and ÷, then + and −.', 'Squared comes from the area of a square. Cubed comes from the volume of a cube.'],
    [['base', 'the number being multiplied'], ['exponent', 'how many times it is multiplied'], ['power', 'a number written with an exponent']]),
  skill('l5expr', '6.EE.2, 6', 'Expressions', 'Write them and find their value', genExpr, 'A letter can stand for a number you do not know yet, or one that changes. An expression is a rule written with letters and numbers.',
    ['A number next to a letter means multiply: 3x is 3 × x.', 'To find the value, swap the letter for its number and work it out.', '“5 less than n” is n − 5. The amount taken away comes second.', 'The part with “each” or “every” gets multiplied by the letter. The fixed part is added once.'],
    [['variable', 'a letter that stands for a number'], ['coefficient', 'the number multiplying a letter'], ['term', 'a piece of an expression, joined by + or −'], ['constant', 'a term with no letter']]),
  skill('l5equiv', '6.EE.3–4', 'Equivalent expressions', 'Distribute and combine like terms', genEquiv, 'Two expressions are equivalent when they give the same value whatever number the letter stands for.',
    ['Distributive property: the number in front multiplies every term in the brackets. 3(x + 4) = 3x + 12.', 'Like terms have the same letter part. You can add them: 2x + 5x = 7x.', 'Unlike terms stay apart: 3x + 4 cannot be squeezed into one term.', 'Not sure? Test both expressions with the same number.'],
    [['like terms', 'terms with the same letter part'], ['distribute', 'multiply each term in the brackets'], ['factor out', 'pull a common factor in front of brackets']]),
  skill('l5eq', '6.EE.5–7', 'One-step equations', 'Keep the balance', genEq, 'An equation says two things are equal, like a balanced scale. Solving it means finding the number that keeps it balanced.',
    ['Whatever you do to one side, do the same to the other side.', 'Undo what was done to the letter: undo + with −, undo × with ÷.', 'Check by putting your answer back into the equation.', 'In a story, call the unknown x and write what happened to it.'],
    [['equation', 'two expressions joined by ='], ['solution', 'the value that makes it true'], ['inverse operation', 'the operation that undoes another']]),
  skill('l5ineq', '6.EE.8', 'Inequalities', 'More than one answer', genIneq, 'An inequality describes a whole range of numbers that work, like “you must be at least 12”. On a number line that range is a ray.',
    ['x &gt; 3 means every number greater than 3. There are endlessly many.', 'Open circle: the end number is not included (&lt; or &gt;). Filled circle: it is included (≤ or ≥).', 'The arrow points to all the numbers that work.', '“At least” means ≥. “At most” means ≤.'],
    [['inequality', 'a statement with &lt;, &gt;, ≤ or ≥'], ['solution', 'any number that makes it true'], ['at least', 'that number or more']]),
  skill('l5area', '6.G.1', 'Area of shapes', 'Triangles, parallelograms, trapezoids', genArea, 'Every one of these shapes can be cut and rearranged into a rectangle, so their areas all come from base × height.',
    ['Parallelogram: base × height. Slide the slanted end across to make a rectangle.', 'Triangle: half of base × height. Two copies make a parallelogram.', 'Trapezoid: add the two parallel sides, multiply by the height, then halve.', 'The height is always straight up from the base, never the slanted side.'],
    [['base', 'the side the shape sits on'], ['height', 'the straight-up distance from the base'], ['parallel', 'lines that never meet']]),
  skill('l5solid', '6.G.2, 4', 'Surface area and volume', 'Nets and fraction edges', genSolid, 'Surface area is the total area of the outside of a solid. Volume is the space inside. A net shows every face laid flat.',
    ['Surface area: find the area of each face of the net and add them.', 'A box has 3 pairs of matching faces.', 'Volume of a box = length × width × height, even when the edges are fractions.', 'Small cubes with fraction edges pack a box exactly, which is why the rule still works.'],
    [['net', 'a solid unfolded flat'], ['face', 'a flat side of a solid'], ['surface area', 'the area of all the faces together'], ['volume', 'the space inside']]),
  skill('l5stats', '6.SP.3, 5', 'Mean, median, mode, range', 'One number for a whole set', genStats, 'A set of data can be summed up with a few numbers: where its center is and how spread out it is.',
    ['Mean: add everything, then divide by how many. It is the fair share.', 'Median: the middle value when the data is in order.', 'Mode: the value that appears most often. Range: biggest minus smallest.', 'One very unusual value pulls the mean a lot but hardly moves the median.'],
    [['mean', 'the total shared out equally'], ['median', 'the middle value'], ['mode', 'the most common value'], ['range', 'the spread from smallest to biggest'], ['outlier', 'a value far from the rest']]),
  skill('l5plots', '6.SP.4–5', 'Dot plots and histograms', 'Reading data pictures', genPlots, 'A dot plot shows every single value. A histogram groups values into ranges and shows how many fall in each.',
    ['Dot plot: each dot is one value. The number below tells you which value.', 'Histogram: the height of a bar is how many values are in that range.', 'To find the total, add up all the dots or all the bar heights.', 'A histogram hides the exact values. You only know the range they are in.'],
    [['dot plot', 'dots stacked above a number line'], ['histogram', 'bars that count values in ranges'], ['data', 'information that was collected']]),
  skill('l5story', 'All', 'Story problems', 'Ratios, percents, equations and more', genStory, 'A story problem hides the math inside a situation. Work out what is being asked and what you know before you calculate.',
    ['Read the question first. What exactly are you finding?', 'Pick out the numbers you need and what each one means.', 'Look for clue words: “per” and “each” (rates), “% off” (take away a percent), “at the same rate” (keep the ratio).', 'Plan the steps, solve, then ask: is my answer a sensible size?'],
    [['per / each', 'a rate: for every one'], ['of', 'with a percent or fraction, multiply'], ['in all / total', 'put amounts together'], ['left / change', 'take one amount from another']], { story: true }),
];
