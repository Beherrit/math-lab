// Level 2: Times tables and sharing. The understanding that makes the multiplication facts stick.
import { genGroups } from './meaning.js';
import { genOrder } from './order.js';
import { genTricks } from './tricks.js';
import { genDiv } from './dividing.js';
import { genFamily } from './family.js';
import { genTens } from './tens.js';
import { genArea2 } from './area2.js';
import { l2equal } from './equal.js';
import { l2sticks } from './sticks.js';
import { l2eleven, l2five } from './vedic.js';
import { l2lattice } from './lattice.js';
import { l2peasant } from './peasant.js';
import { l2short } from './short.js';
import { genRem, remWord } from './remainders.js';
import { genArea, areaWord } from './shapes.js';
import { genFrac } from './fractions.js';
import { genFracCmp } from './fraccmp.js';
import { genWhich, mulWord, shareWord, groupWord, mixWord } from './stories.js';
import { genAdd1000 } from './addsub1000.js';
import { genPatterns } from './patterns.js';
import { genProps } from './properties.js';
import { genDivFacts } from './divfacts.js';
import { genTwoStep, twoWord } from './twostep.js';
import { genEquivalent } from './equivalent.js';
import { genClock } from './clockskill.js';
import { genMassVol, measureWord } from './massvol.js';
import { genGraphs } from './graphs.js';
import { genMeasure } from './measure.js';
import { genTiling } from './tiling.js';
import { genQuads } from './quads.js';
import { makeStory } from '../level4/story.js';

// Story problems for this level: each source is (L) => a story problem object (or null to skip a step).
const remStory = L => (L === 1 ? null : remWord(L)); // remainders wait until step 2
export const STORY_SOURCES = [mulWord, mulWord, shareWord, groupWord, remStory, areaWord, mixWord, mixWord, mixWord, twoWord, twoWord, measureWord];
const genStory = L => makeStory(STORY_SOURCES, L);

export const SKILLS = [
  { id: 'l2add1000', level: 2, strand: 'Adding and subtracting', std: '3.NBT.1, 3.NBT.2', title: 'Adding and subtracting to 1000', sub: 'Fluent sums and differences, checked by estimating', gen: genAdd1000, school: true,
    learn: { big: 'Add and subtract one place at a time, then check with a quick estimate. Round to the nearest 10 or 100 first: the exact answer should be close to the estimate.',
      tips: ['Add or subtract the hundreds, the tens and the ones separately, then put the parts together.', 'When a place makes 10 or more, carry to the next place. When a digit is too small to take from, regroup from the next place.', 'To subtract, you can also count up from the smaller number to the bigger one.', 'To estimate, round each number first: 348 + 275 is about 350 + 280.'],
      words: [['estimate', 'a close answer found quickly with rounded numbers'], ['regroup', 'trade one ten for ten ones, or one hundred for ten tens'], ['round', 'change a number to a nearby friendly one, such as the nearest 10 or 100']] } },
  l2equal,
  { id: 'l2groups', level: 2, strand: 'Multiplying and dividing', std: '3.OA.1', title: 'What multiplying means', sub: 'Equal groups, arrays and repeated addition', gen: genGroups, school: true,
    learn: { big: 'Multiplying is a short way to count equal groups. 3 × 4 means 3 groups of 4, which is 4 + 4 + 4.',
      tips: ['Read × as "groups of": 5 × 6 is 5 groups of 6.', 'An array is equal groups lined up in rows: 3 rows of 4 is 3 × 4.', 'Count one group, then skip count by that number, once for each group.', 'One more group just adds one more of the same number: 5 × 6 is 4 × 6 plus 6.'],
      words: [['equal groups', 'groups that all hold the same number'], ['array', 'things set out in equal rows'], ['product', 'the answer to multiplying'], ['times', 'another word for multiplied by']] } },
  { id: 'l2order', level: 2, strand: 'Multiplying and dividing', std: '3.OA.5', title: 'Order, zero and one', sub: 'Turn it around, and what × 0 and × 1 do', gen: genOrder, school: true,
    learn: { big: 'You can multiply in any order: 3 × 8 and 8 × 3 are the same array turned on its side. That cuts the facts to learn in half.',
      tips: ['If 7 × 4 is hard, turn it around: 4 × 7. Pick the order with fewer, bigger jumps.', 'Times 1: one group of a number, or groups with 1 in each. The number stays the same.', 'Times 0: no groups, or groups with nothing in them. The answer is always 0.', 'With three numbers, pick the easiest pair first: 2 × 7 × 5 is 10 × 7.'],
      words: [['turn-around fact', 'the same multiplication with the two numbers swapped'], ['factor', 'a number that is being multiplied']] } },
  { id: 'l2tricks', level: 2, strand: 'Multiplying and dividing', std: '3.OA.5, 3.OA.7', title: 'Hard facts from easy ones', sub: 'Doubles, ten then halve, break apart', gen: genTricks, school: true,
    learn: { big: 'You never have to be stuck on a times-table fact. Every hard fact can be built from easy ones you already know.',
      tips: ['× 2 is double. × 4 is double, then double again. × 8 is double three times.', '× 5 is half of × 10: 5 × 8 is half of 80.', '× 9 is × 10 minus one group: 9 × 7 = 70 − 7.', 'Break apart: 7 × 8 is 5 × 8 plus 2 × 8. That is 40 + 16.'],
      words: [['double', 'two of the same, or times 2'], ['halve', 'split into two equal parts'], ['break apart', 'split one multiplication into two easier ones and add them']],
      card: { title: 'Why the fact tricks work', why: 'Doubling, halving and splitting all count the same groups, so two of a number is times 2, half of times 10 is times 5, and the parts of a split still add to the same product.' } } },
  { id: 'l2props', level: 2, strand: 'Multiplying and dividing', std: '3.OA.5', title: 'Easier ways to multiply', sub: 'Grouping, splitting and any order', gen: genProps, school: true,
    learn: { big: 'Three rules make multiplying easier: you can multiply in any order, group the numbers any way you like, and split one number into two parts.',
      tips: ['Any order: 4 × 7 = 7 × 4.', 'Any grouping: 2 × 5 × 7 is 10 × 7, because 2 × 5 is easy.', 'Split one number: 7 × 14 = 7 × 10 + 7 × 4, which is 70 + 28.', 'Every part of a split must be multiplied: 6 × 8 = 6 × 5 + 6 × 3, not 6 × 5 + 3.'],
      words: [['factor', 'a number that is being multiplied'], ['distributive property', 'splitting one factor into parts, multiplying each part, and adding the results'], ['grouping', 'choosing which numbers to multiply first']] } },
  { id: 'l2patterns', level: 2, strand: 'Multiplying and dividing', std: '3.OA.9', title: 'Patterns in the times table', sub: 'Even and odd, squares, the 9s and growing patterns', gen: genPatterns, school: true,
    learn: { big: 'The multiplication table is full of patterns. Spotting them helps you check answers and remember facts.',
      tips: ['Even times any whole number is even. Odd times odd is odd.', 'In the 9s table the two digits of every answer add up to 9: 9 × 7 = 63 and 6 + 3 = 9.', 'The diagonal of the table holds the square numbers: 1, 4, 9, 16, 25 and so on.', 'To continue a pattern, find the gap between the numbers. If the gaps grow, find how they grow.'],
      words: [['square number', 'the answer when a number is multiplied by itself, like 6 × 6 = 36'], ['multiple', 'a number in a times table, like 12, 18 and 24 in the 6s'], ['pattern', 'numbers or shapes that follow a rule']] } },
  { id: 'l2div', level: 2, strand: 'Multiplying and dividing', std: '3.OA.2', title: 'What dividing means', sub: 'Sharing equally and making equal groups', gen: genDiv, school: true,
    learn: { big: 'Dividing splits a total into equal groups. It answers two kinds of question: how many in each group, or how many groups.',
      tips: ['Sharing: 12 ÷ 3 can mean 12 shared among 3. How many does each get?', 'Grouping: 12 ÷ 3 can also mean 12 put into groups of 3. How many groups?', 'Both give the same answer, because both ask: 3 times what makes 12?', 'Dividing by 1 changes nothing. A number divided by itself is 1.'],
      words: [['divide', 'split into equal groups'], ['share equally', 'give every group the same amount'], ['quotient', 'the answer to dividing']] } },
  { id: 'l2divfacts', level: 2, strand: 'Multiplying and dividing', std: '3.OA.6, 3.OA.7', title: 'Dividing with times facts', sub: 'The missing factor, dividing by 1, and never by 0', gen: genDivFacts, school: true,
    learn: { big: 'Every division is a multiplication with a missing number. 56 ÷ 7 asks: 7 times what makes 56?',
      tips: ['Turn it around: 56 ÷ 7 = ? means the same as 7 × ? = 56.', 'A number divided by 1 stays the same. A number divided by itself is 1. 0 divided by a number is 0.', 'You can never divide by 0: no number times 0 can make anything except 0.', 'Use a fact you know. 6 × 8 = 48, so 54 ÷ 6 is one more group of 6: 9.'],
      words: [['unknown factor', 'the missing number in a multiplication'], ['dividend', 'the number that is being divided'], ['divisor', 'the number you divide by']] } },
  { id: 'l2family', level: 2, strand: 'Multiplying and dividing', std: '3.OA.4, 3.OA.6', title: 'Fact families', sub: 'Multiply and divide with the same three numbers', gen: genFamily, school: true,
    learn: { big: 'Multiplying and dividing undo each other. If you know 6 × 7 = 42, you also know 42 ÷ 6 = 7 and 42 ÷ 7 = 6.',
      tips: ['Three numbers make four facts: 6 × 7 = 42, 7 × 6 = 42, 42 ÷ 6 = 7, 42 ÷ 7 = 6.', 'To divide, think of the multiplication: 42 ÷ 6 asks "6 times what is 42?"', 'In a division fact, the total always comes first.', 'A missing number is just one of the three numbers in the family.'],
      words: [['fact family', 'the multiplying and dividing facts made from the same three numbers'], ['unknown', 'the missing number you are looking for']] } },
  { id: 'l2tens', level: 2, strand: 'Multiplying and dividing', std: '3.NBT.3', title: 'Multiplying by tens and hundreds', sub: '× 10, × 100 and numbers like 40', gen: genTens, school: true,
    learn: { big: 'Multiplying by 10 turns every one into a ten, so each digit moves one place to the left. That is where the 0 on the end comes from.',
      tips: ['6 × 10 is 6 tens: 60.', '6 × 40 is 6 × 4 tens. That is 24 tens: 240.', '× 100 moves every digit two places to the left: 7 × 100 = 700.', 'Use a fact you know (6 × 4 = 24), then think about whether you have tens or hundreds.'],
      words: [['multiple of 10', 'a number you reach counting by tens, like 40 or 70'], ['place value', 'what a digit is worth because of where it sits']] } },
  { id: 'l2area2', level: 2, strand: 'Multiplying and dividing', std: '3.OA.5, 4.NBT.5', title: 'Two digits times one digit', sub: 'Break apart with an area model', gen: genArea2, school: true,
    learn: { big: 'A bigger multiplication is two small ones. Split the big number into tens and ones, multiply each part, and add.',
      tips: ['14 × 3 is 10 × 3 plus 4 × 3. That is 30 + 12 = 42.', 'An area model is a rectangle cut into a tens part and a ones part.', 'Do the tens part first. It is most of the answer, so it tells you roughly how big the answer is.', 'In the column method the carried digit is just the tens from the ones part.'],
      words: [['area model', 'a rectangle split into parts to show a multiplication'], ['partial product', 'the answer for one part, before adding']],
      card: { title: 'Why the area model works', why: 'The rectangle is the product, so cutting it into tens and ones cuts the product into parts. Adding the parts puts the same rectangle back together.' } } },
  l2sticks,
  l2eleven,
  l2five,
  l2lattice,
  l2peasant,
  l2short,
  { id: 'l2rem', level: 2, strand: 'Multiplying and dividing', std: '4.OA.3', title: 'Division with remainders', sub: 'Left overs and what they mean', gen: genRem, school: true,
    learn: { big: 'Not everything shares out evenly. The remainder is what is left when no more full groups can be made.',
      tips: ['17 ÷ 5: three groups of 5 make 15, and 2 are left over. 3 remainder 2.', 'The remainder is always smaller than the number you divide by.', 'In a story, think about the left overs. Do they need one more car? Do they not count? Or are they the answer?', 'Check: groups × size + remainder gives back the number you started with.'],
      words: [['remainder', 'what is left over after making full groups'], ['full group', 'a group with nothing missing']] } },
  { id: 'l2frac', level: 2, strand: 'Fractions and decimals', std: '3.NF.1, 3.NF.2', title: 'Fractions: equal parts', sub: 'Parts of a whole and points on a number line', gen: genFrac, school: true,
    learn: { big: 'A fraction names equal parts of a whole. The bottom number says how many equal parts the whole is cut into. The top number says how many of them you have.',
      tips: ['The parts must be equal, or it is not a fraction.', 'A fraction with 1 on top is one part: one fourth, one sixth.', 'Three fourths is three parts of size one fourth.', 'On a number line, cut the space from 0 to 1 into equal jumps. Each jump is one part.'],
      words: [['numerator', 'the top number: how many parts'], ['denominator', 'the bottom number: how many equal parts make the whole'], ['unit fraction', 'a fraction with 1 on top']] } },
  { id: 'l2fraccmp', level: 2, strand: 'Fractions and decimals', std: '3.NF.3', title: 'Comparing fractions', sub: 'Same bottom number or same top number', gen: genFracCmp, school: true,
    learn: { big: 'A bigger bottom number means smaller pieces. One eighth of a pizza is less than one third of it.',
      tips: ['Same bottom number: the pieces are the same size, so more pieces is more.', 'Same top number: the same number of pieces, so bigger pieces is more. Bigger pieces have the smaller bottom number.', 'When the top and bottom match, the fraction is exactly one whole.', 'You can only compare fractions of the same whole.'],
      words: [['compare', 'decide which is greater, or whether they are equal'], ['one whole', 'all of the equal parts together']] } },
  { id: 'l2equiv', level: 2, strand: 'Fractions and decimals', std: '3.NF.3', title: 'Equal fractions', sub: 'Different names for the same amount', gen: genEquivalent, school: true,
    learn: { big: 'Two fractions are equal when they are the same amount, even if the numbers look different. 1/2, 2/4 and 4/8 all name half of a whole.',
      tips: ['Cut every part into the same number of smaller pieces and the amount stays the same.', 'Multiply the top and the bottom by the same number: 3/4 = 6/8.', 'On a number line, equal fractions sit on exactly the same point.', 'A whole number is a fraction too: 3 = 3/1 = 6/2.'],
      words: [['equivalent fractions', 'fractions that name the same amount'], ['numerator', 'the top number: how many parts'], ['denominator', 'the bottom number: how many equal parts make the whole']] } },
  { id: 'l2area', level: 2, strand: 'Measurement', std: '3.MD.7, 3.MD.8', title: 'Area and perimeter', sub: 'Inside a rectangle and around its edge', gen: genArea, school: true,
    learn: { big: 'Area is how much flat space a shape covers, counted in squares. Perimeter is the distance around its edge.',
      tips: ['Area of a rectangle: rows of squares. Rows × squares in a row, which is length × width.', 'Perimeter: add all four sides. Opposite sides are equal, so add one of each and double.', 'Area is in square units (square cm). Perimeter is in plain units (cm).', 'Know the area and one side? Divide to find the other side.'],
      words: [['area', 'the space inside a flat shape'], ['perimeter', 'the distance all the way around a shape'], ['square unit', 'a square that is 1 unit on each side']] } },
  { id: 'l2tiling', level: 2, strand: 'Measurement', std: '3.MD.5, 3.MD.6, 3.MD.7, 3.MD.8', title: 'Area by tiling and splitting', sub: 'Squares, L-shapes, and the same perimeter with different areas', gen: genTiling, school: true,
    learn: { big: 'Area counts the squares that cover a shape. To find the area of a shape that is not a rectangle, cut it into rectangles and add their areas.',
      tips: ['Cover a shape with unit squares and count them, or count rows times squares in a row.', 'Cut an L-shape into two rectangles. Work out each area, then add.', 'One big rectangle can be two smaller ones joined: 7 × 13 = 7 × 10 + 7 × 3.', 'Shapes can have the same perimeter and different areas, or the same area and different perimeters.'],
      words: [['unit square', 'a square that is 1 unit on each side'], ['area', 'the space inside a flat shape, counted in squares'], ['perimeter', 'the distance all the way around a shape']] } },
  { id: 'l2clock', level: 2, strand: 'Measurement', std: '3.MD.1', title: 'Time to the minute', sub: 'Reading a clock and finding how long', gen: genClock, school: true,
    learn: { big: 'The short hand tells the hour and the long hand tells the minutes. To find how long something takes, count on to the next hour, then add the rest.',
      tips: ['Each number on the clock is 5 minutes. The small marks are single minutes.', 'To find how long, jump along a number line: to the next hour, then whole hours, then the last minutes.', 'To find an end time, add the minutes. If you go past 60, the hour goes up by one.', 'To find a start time, count back from the end time.'],
      words: [['elapsed time', 'the time that passes between a start and an end'], ['minute', 'a unit of time: 60 of them make an hour'], ['hour hand', 'the short hand on a clock']] } },
  { id: 'l2massvol', level: 2, strand: 'Measurement', std: '3.MD.2', title: 'Mass and liquid volume', sub: 'Grams, kilograms, liters and milliliters', gen: genMassVol, school: true,
    learn: { big: 'Mass is how heavy something is: grams for small things, kilograms for big things. Liquid volume is how much liquid there is: milliliters for small amounts, liters for big ones.',
      tips: ['A paperclip is about 1 gram. A bag of sugar is about 1 kilogram.', 'A spoonful is about 5 milliliters. A big bottle of juice is about 1 liter.', '1 kilogram is 1,000 grams and 1 liter is 1,000 milliliters.', 'To read a scale, first find how much each small mark is worth.'],
      words: [['mass', 'how heavy something is'], ['liquid volume', 'how much space a liquid takes up'], ['estimate', 'a sensible guess based on something you know']] } },
  { id: 'l2measure', level: 2, strand: 'Measurement', std: '3.MD.4', title: 'Measuring and line plots', sub: 'To the half and quarter inch', gen: genMeasure, school: true,
    learn: { big: 'A ruler can be marked in halves and quarters of an inch. Measure to the nearest mark, then show many measurements on a line plot, with one circle for each.',
      tips: ['Start with the last whole inch, then count the small marks after it.', 'Between 2 and 3 the quarter marks are 2 1/4, 2 1/2 and 2 3/4.', 'On a line plot each circle is one measurement. Count the circles above a mark.', 'If the end of the strip is not exactly on a mark, use the mark it is closest to.'],
      words: [['line plot', 'a number line with a circle above the number for each measurement'], ['inch', 'a unit of length'], ['quarter inch', 'one of 4 equal parts of an inch']] } },
  { id: 'l2graphs', level: 2, strand: 'Data and chance', std: '3.MD.3', title: 'Scaled graphs', sub: 'Picture graphs and bar graphs with a scale', gen: genGraphs, school: true,
    learn: { big: 'In a scaled graph each symbol, or each step of the grid, stands for more than 1, such as 2, 5 or 10. Read the scale first, then work out the value.',
      tips: ['Check the key or the scale before you read anything.', 'Multiply the number of circles by what each circle is worth.', 'A bar that ends between two lines is halfway between their values.', 'To compare, read both values first. Subtract for how many more, add for together.'],
      words: [['scale', 'the number that each grid step or symbol stands for'], ['key', 'the note that says what one symbol is worth'], ['bar graph', 'a graph that uses bars to show amounts']] } },
  { id: 'l2quads', level: 2, strand: 'Shapes and space', std: '3.G.1', title: 'Sorting shapes', sub: 'Quadrilaterals and their families', gen: genQuads, school: true,
    learn: { big: 'A quadrilateral is any shape with four sides. Squares, rectangles, rhombuses, parallelograms and trapezoids are all quadrilaterals, sorted by their sides and corners.',
      tips: ['Look for equal sides, parallel sides and square corners.', 'A square has four equal sides and four square corners, so it is also a rectangle and a rhombus.', 'A rectangle has four square corners. A rhombus has four equal sides. Both are parallelograms.', 'A trapezoid has one pair of parallel sides. Some books also allow two pairs.'],
      words: [['quadrilateral', 'a shape with four sides'], ['parallel', 'always the same distance apart, never meeting'], ['rhombus', 'a shape with four equal sides']] } },
  { id: 'l2which', level: 2, strand: 'Stories', std: '3.OA.3, 3.OA.8', title: 'Which operation?', sub: 'Add, subtract, multiply or divide', gen: genWhich, school: true,
    learn: { big: 'Before any calculating, decide what kind of story it is. The picture in your head tells you which operation to use.',
      tips: ['Different amounts joined together: add.', 'Something taken away, or a gap between two amounts: subtract.', 'Equal groups and you want the total: multiply.', 'A total split into equal groups: divide.'],
      words: [['each / every', 'a sign of equal groups: multiply or divide'], ['altogether', 'a total: add, or multiply if the groups are equal'], ['share equally', 'divide']] } },
  { id: 'l2twostep', level: 2, strand: 'Stories', std: '3.OA.8', title: 'Two-step problems', sub: 'Write the steps, then check with an estimate', gen: genTwoStep, school: true,
    learn: { big: 'A two-step problem needs two calculations, one after the other. Find the first step, write it down, then use its answer in the second step.',
      tips: ['Ask: what can I find first? That is Step 1.', 'Write each step as its own number sentence so you do not lose your place.', 'Brackets show what to do first: (6 + 3) × 4 means add, then multiply.', 'Check with an estimate: round the numbers and see whether your answer is close.'],
      words: [['step', 'one calculation in a longer problem'], ['estimate', 'a close answer found with rounded numbers'], ['reasonable', 'sensible, and close to what you expected']] } },
  { id: 'l2story', level: 2, strand: 'Stories', std: '3.OA.3, 3.OA.8', title: 'Story problems', sub: 'Multiply and divide, then two steps', gen: genStory, school: true, story: true,
    learn: { big: 'Story problems with equal groups need multiplying or dividing. Find the groups first: how many groups, and how many in each.',
      tips: ['Read the question first. Are you looking for a total, the size of a group, or the number of groups?', 'Know the groups and the size: multiply for the total.', 'Know the total: divide to find the groups or the size.', 'Two steps? Do the equal-groups step, write it down, then add or subtract.'],
      words: [['each', 'every group has the same amount'], ['in all', 'the total'], ['left over', 'what remains after making full groups']] } },
];
