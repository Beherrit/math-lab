// Level 4 skills added in the second pass. Each one lives in its own topic file; this file only describes them.
import { F, M, pow } from '../../util.js';
import { genPowers } from './powers.js';
import { genThousandths } from './thousandths.js';
import { genMixedOps } from './mixed-ops.js';
import { genFracEst } from './fracest.js';
import { genFracShare } from './fracshare.js';
import { genFracArea } from './fracarea.js';
import { genLongDiv } from './longdiv.js';
import { genTwoRules } from './tworules.js';
import { genVolume2 } from './cvolume.js';
import { genFamily } from './family.js';
import { genMoney } from './money.js';
import { genGroups } from './groups.js';

const skill = (id, strand, std, title, sub, gen, big, tips, words) => ({ id, level: 4, strand, std, title, sub, gen, school: true, learn: { big, tips, words } });

export const NEW_SKILLS = [
  skill('l4pow', 'Numbers', '5.NBT.2', 'Powers of 10', 'Exponents and sliding the digits', genPowers,
    `A power of 10 is 10 multiplied by itself. ${pow(10, 3)} means 10 × 10 × 10 = 1,000. Multiplying or dividing by a power of 10 slides every digit to a new place.`,
    [`The exponent counts the tens that are multiplied. It is also the number of zeros after the 1.`, `Multiplying by ${pow(10, 3)} slides every digit 3 places to the left. Dividing slides them 3 places to the right.`, 'The digits slide because each place is worth 10 times the place on its right.', 'Empty places fill up with zeros, so 4.7 × 1,000 = 4,700.'],
    [['exponent', 'the small raised number, how many tens are multiplied'], ['power of 10', `10, 100, 1,000 and so on, written like ${pow(10, 3)}`], ['base', 'the number that is multiplied, here 10']]),
  skill('l4thou', 'Numbers', '5.NBT.3', 'Thousandths and expanded form', 'Read, write and compare to three places', genThousandths,
    'Every place to the right of the decimal point is 10 times smaller: tenths, hundredths, thousandths. You can write a decimal as the sum of its places, and compare two decimals place by place.',
    [`4.205 = 4 × 1 + 2 × ${F(1, 10)} + 5 × ${F(1, 1000)}. The 0 in the hundredths place means that part is missing.`, 'To compare, give both numbers the same number of places. 0.5 = 0.500, so 0.5 is more than 0.499.', 'The first place where two decimals differ decides which one is bigger.', 'A longer decimal is not always the bigger one.'],
    [['expanded form', 'a number written as the sum of its places'], ['thousandths', '1 of 1,000 equal parts'], ['placeholder zero', 'a 0 that keeps a place open']]),
  skill('l4mixas', 'Fractions and decimals', '5.NF.1', 'Add and subtract mixed numbers', 'Unlike denominators and regrouping', genMixedOps,
    'Give the fractions the same bottom number, then add or subtract the wholes and the parts. When the parts do not fit, regroup one whole.',
    ['Adding: if the parts make more than 1 whole, move that whole over to the whole numbers.', `Subtracting: if the top part is too small, take 1 whole from the whole number and turn it into pieces. 1 whole is ${F(4, 4)} or ${F(12, 12)}, whatever the bottom is.`, 'Or turn both mixed numbers into fractions, calculate, and turn the answer back into a mixed number.', 'Check a subtraction by adding the answer back.'],
    [['mixed number', `a whole number and a fraction together, like ${M(2, 3, 4)}`], ['regroup', 'trade 1 whole for pieces, or pieces for a whole'], ['common denominator', 'a bottom number both fractions can use']]),
  skill('l4fest', 'Fractions and decimals', '5.NF.2', 'Estimating with fractions', 'Benchmarks and unreasonable answers', genFracEst,
    `Before you calculate, round each fraction to a benchmark: 0, ${F(1, 2)} or 1. The estimate tells you what size the answer should be.`,
    [`A fraction is close to 0 when the top is tiny, close to ${F(1, 2)} when the top is about half of the bottom, and close to 1 when the top is almost the bottom.`, `Two fractions that are both more than ${F(1, 2)} add to more than 1.`, `If your answer is far from your estimate, check your work. Adding the tops and the bottoms (${F(1, 2)} + ${F(1, 3)} = ${F(2, 5)}) always gives an answer that is too small.`, 'Round mixed numbers to the nearest whole or the nearest half.'],
    [['benchmark', `an easy number to compare with: 0, ${F(1, 2)} or 1`], ['estimate', 'a quick answer that is close, not exact'], ['reasonable', 'sensible for the size of the numbers']]),
  skill('l4fshare', 'Fractions and decimals', '5.NF.3', 'A fraction is a division', 'Sharing and mixed-number answers', genFracShare,
    `A fraction bar means “divided by”. 3 ÷ 4 = ${F(3, 4)} is how much each person gets when 3 things are shared equally by 4 people.`,
    ['The amount that is shared goes on top and the number of people goes on the bottom.', `When the top is bigger than the bottom the answer is a mixed number: 7 ÷ 3 = ${M(2, 1, 3)}.`, 'To see where a division answer lives, find how many whole groups fit: 17 ÷ 5 is between 3 and 4.', 'To write a fraction as a decimal, make the bottom 10, 100 or 1,000, or just divide.'],
    [['quotient', 'the answer to a division'], ['mixed number', 'a whole number and a fraction together'], ['remainder', 'what is left over after dividing into whole groups']]),
  skill('l4fmix', 'Fractions and decimals', '5.NF.4b, 5.NF.6', 'Area with fractions', 'Mixed numbers and rectangles', genFracArea,
    'The area of a rectangle is length × width even when the sides are fractions or mixed numbers. An area model shows why: split each side into a whole part and a fraction part.',
    [`Cut each unit square into equal pieces. A side of ${F(2, 3)} is 2 pieces of ${F(1, 3)}.`, 'Turn mixed numbers into fractions, multiply the tops and multiply the bottoms.', 'Or use four boxes: whole × whole, whole × part, part × whole and part × part, then add them.', 'A side shorter than 1 makes the area smaller than the other side. A side longer than 1 makes it bigger.'],
    [['area', 'the space inside, in square units'], ['area model', 'a box split into parts to show a multiplication'], ['unit square', 'a square with sides of 1']]),
  skill('l4ldiv', 'Multiplying and dividing', '5.NBT.6', 'Long division with remainders', 'Estimate first, then check', genLongDiv,
    'Estimate the answer first with friendly numbers, then divide. A remainder is what is left over, and it is always smaller than the divisor.',
    ['Round the divisor to a ten and pick a dividend close to yours that it divides evenly.', 'Take away easy chunks of the divisor (10 of them, 20 of them, 50 of them) and add up the groups.', 'Check: quotient × divisor + remainder = dividend.', 'In a story, ask what the leftover means. Round up when everyone needs a place, and round down when you only count full boxes.'],
    [['dividend', 'the number being divided'], ['divisor', 'the number you divide by'], ['quotient', 'the answer to a division'], ['remainder', 'what is left over']]),
  skill('l4rules', 'Algebra', '5.OA.3, 5.G.2', 'Two patterns', 'Matching terms and ordered pairs', genTwoRules,
    'Two rules make two number patterns. Matching terms make ordered pairs, and ordered pairs make points you can plot.',
    ['Term 1 is the start. Each new term adds the rule once more.', 'In an ordered pair the first number comes from pattern A and the second from pattern B, both from the same term.', 'Compare matching terms. Is B always the same amount bigger, or always the same number of times bigger?', 'To plot a pair, go across first and then up.'],
    [['term', 'one number in a pattern'], ['ordered pair', 'two numbers in order, written (A, B)'], ['rule', 'what you do to get the next number']]),
  skill('l4vol2', 'Measurement', '5.MD.5c', 'Volume of two boxes', 'Solids made of boxes and missing edges', genVolume2,
    'A solid made of two boxes has a volume equal to the two volumes added together. If you know a volume, you can work backward to find a missing edge.',
    ['Volume = length × width × height. Find each box on its own, then add.', 'Boxes with the same base: add the heights. Boxes side by side: add the lengths.', 'Missing edge: multiply the two edges you know, then divide the volume by that.', '1 liter takes up 1,000 cubic centimeters.'],
    [['volume', 'the space inside, in cubic units'], ['edge', 'where two faces of a box meet'], ['cubic unit', 'a cube with sides of 1']]),
  skill('l4family', 'Shapes and space', '5.G.3-4', 'The shape family tree', 'Always, sometimes or never', genFamily,
    'Shapes belong to families, and a shape belongs to every family whose rules it follows. Every square is a rectangle, but not every rectangle is a square.',
    ['To test a statement, try to draw a shape that breaks it.', 'Always means no shape can break it. Never means no shape can follow it. Sometimes means some do and some do not.', 'A square has everything that a rectangle, a rhombus and a parallelogram need.', 'An isosceles triangle has at least two equal sides, so every equilateral triangle is isosceles too.'],
    [['quadrilateral', 'any shape with 4 sides'], ['parallelogram', 'two pairs of parallel sides'], ['rhombus', '4 equal sides'], ['trapezoid', 'exactly one pair of parallel sides']]),
  skill('l4money', 'Fractions and decimals', '5.NBT.7', 'Money with decimals', 'Totals, change, unit price and shared bills', genMoney,
    'Money is decimals you meet every day. Line up the points when you add or subtract, and think in cents when you multiply or divide.',
    ['Line up the decimal points, and write whole dollars with two decimal places: $10 is 10.00.', 'Change = what you paid − what it cost.', 'Unit price: divide the price by the number of items. A bigger pack is not always the better buy.', 'To split a bill, add everything up first, then divide.'],
    [['unit price', 'the price of one item'], ['change', 'money you get back'], ['better buy', 'the lower price for each one']]),
  skill('l4groups', 'Algebra', '5.OA.1-2', 'Groups and expressions', 'Nested groups and writing expressions', genGroups,
    'Groups tell you what to do first. You can write an expression for a calculation without working it out, by turning each piece of the words into symbols.',
    ['Start with the innermost group and work outward.', '“The sum of”, “the difference of” and “the product of” each make a group that is used as one number.', 'If a group is then multiplied or divided, put it in brackets.', 'To check, work out each choice with the numbers and compare.'],
    [['expression', 'numbers and signs without an equals sign'], ['group', 'a part inside ( ), [ ] or { }'], ['innermost', 'the group with nothing inside it']]),
];
