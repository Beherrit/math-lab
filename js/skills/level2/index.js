// Level 2: Times tables and sharing. The understanding that makes the multiplication facts stick.
import { genGroups } from './meaning.js';
import { genOrder } from './order.js';
import { genTricks } from './tricks.js';
import { genDiv } from './dividing.js';
import { genFamily } from './family.js';
import { genTens } from './tens.js';
import { genArea2 } from './area2.js';
import { genRem, remWord } from './remainders.js';
import { genArea, areaWord } from './shapes.js';
import { genFrac } from './fractions.js';
import { genFracCmp } from './fraccmp.js';
import { genWhich, mulWord, shareWord, groupWord, mixWord } from './stories.js';
import { makeStory } from '../level4/story.js';

// Story problems for this level: each source is (L) => a story problem object (or null to skip a step).
const remStory = L => (L === 1 ? null : remWord(L)); // remainders wait until step 2
export const STORY_SOURCES = [mulWord, mulWord, shareWord, groupWord, remStory, areaWord, mixWord, mixWord, mixWord];
const genStory = L => makeStory(STORY_SOURCES, L);

export const SKILLS = [
  { id: 'l2groups', level: 2, std: '3.OA.1', title: 'What multiplying means', sub: 'Equal groups, arrays and repeated addition', gen: genGroups, school: true,
    learn: { big: 'Multiplying is a short way to count equal groups. 3 × 4 means 3 groups of 4, which is 4 + 4 + 4.',
      tips: ['Read × as "groups of": 5 × 6 is 5 groups of 6.', 'An array is equal groups lined up in rows: 3 rows of 4 is 3 × 4.', 'Count one group, then skip count by that number, once for each group.', 'One more group just adds one more of the same number: 5 × 6 is 4 × 6 plus 6.'],
      words: [['equal groups', 'groups that all hold the same number'], ['array', 'things set out in equal rows'], ['product', 'the answer to multiplying'], ['times', 'another word for multiplied by']] } },
  { id: 'l2order', level: 2, std: '3.OA.5', title: 'Order, zero and one', sub: 'Turn it around, and what × 0 and × 1 do', gen: genOrder, school: true,
    learn: { big: 'You can multiply in any order: 3 × 8 and 8 × 3 are the same array turned on its side. That cuts the facts to learn in half.',
      tips: ['If 7 × 4 is hard, turn it around: 4 × 7. Pick the order with fewer, bigger jumps.', 'Times 1: one group of a number, or groups with 1 in each. The number stays the same.', 'Times 0: no groups, or groups with nothing in them. The answer is always 0.', 'With three numbers, pick the easiest pair first: 2 × 7 × 5 is 10 × 7.'],
      words: [['turn-around fact', 'the same multiplication with the two numbers swapped'], ['factor', 'a number that is being multiplied']] } },
  { id: 'l2tricks', level: 2, std: '3.OA.5, 3.OA.7', title: 'Hard facts from easy ones', sub: 'Doubles, ten then halve, break apart', gen: genTricks, school: true,
    learn: { big: 'You never have to be stuck on a times-table fact. Every hard fact can be built from easy ones you already know.',
      tips: ['× 2 is double. × 4 is double, then double again. × 8 is double three times.', '× 5 is half of × 10: 5 × 8 is half of 80.', '× 9 is × 10 minus one group: 9 × 7 = 70 − 7.', 'Break apart: 7 × 8 is 5 × 8 plus 2 × 8. That is 40 + 16.'],
      words: [['double', 'two of the same, or times 2'], ['halve', 'split into two equal parts'], ['break apart', 'split one multiplication into two easier ones and add them']] } },
  { id: 'l2div', level: 2, std: '3.OA.2', title: 'What dividing means', sub: 'Sharing equally and making equal groups', gen: genDiv, school: true,
    learn: { big: 'Dividing splits a total into equal groups. It answers two kinds of question: how many in each group, or how many groups.',
      tips: ['Sharing: 12 ÷ 3 can mean 12 shared among 3. How many does each get?', 'Grouping: 12 ÷ 3 can also mean 12 put into groups of 3. How many groups?', 'Both give the same answer, because both ask: 3 times what makes 12?', 'Dividing by 1 changes nothing. A number divided by itself is 1.'],
      words: [['divide', 'split into equal groups'], ['share equally', 'give every group the same amount'], ['quotient', 'the answer to dividing']] } },
  { id: 'l2family', level: 2, std: '3.OA.4, 3.OA.6', title: 'Fact families', sub: 'Multiply and divide with the same three numbers', gen: genFamily, school: true,
    learn: { big: 'Multiplying and dividing undo each other. If you know 6 × 7 = 42, you also know 42 ÷ 6 = 7 and 42 ÷ 7 = 6.',
      tips: ['Three numbers make four facts: 6 × 7 = 42, 7 × 6 = 42, 42 ÷ 6 = 7, 42 ÷ 7 = 6.', 'To divide, think of the multiplication: 42 ÷ 6 asks "6 times what is 42?"', 'In a division fact, the total always comes first.', 'A missing number is just one of the three numbers in the family.'],
      words: [['fact family', 'the multiplying and dividing facts made from the same three numbers'], ['unknown', 'the missing number you are looking for']] } },
  { id: 'l2tens', level: 2, std: '3.NBT.3', title: 'Multiplying by tens and hundreds', sub: '× 10, × 100 and numbers like 40', gen: genTens, school: true,
    learn: { big: 'Multiplying by 10 turns every one into a ten, so each digit moves one place to the left. That is where the 0 on the end comes from.',
      tips: ['6 × 10 is 6 tens: 60.', '6 × 40 is 6 × 4 tens. That is 24 tens: 240.', '× 100 moves every digit two places to the left: 7 × 100 = 700.', 'Use a fact you know (6 × 4 = 24), then think about whether you have tens or hundreds.'],
      words: [['multiple of 10', 'a number you reach counting by tens, like 40 or 70'], ['place value', 'what a digit is worth because of where it sits']] } },
  { id: 'l2area2', level: 2, std: '3.OA.5, 4.NBT.5', title: 'Two digits times one digit', sub: 'Break apart with an area model', gen: genArea2, school: true,
    learn: { big: 'A bigger multiplication is two small ones. Split the big number into tens and ones, multiply each part, and add.',
      tips: ['14 × 3 is 10 × 3 plus 4 × 3. That is 30 + 12 = 42.', 'An area model is a rectangle cut into a tens part and a ones part.', 'Do the tens part first. It is most of the answer, so it tells you roughly how big the answer is.', 'In the column method the carried digit is just the tens from the ones part.'],
      words: [['area model', 'a rectangle split into parts to show a multiplication'], ['partial product', 'the answer for one part, before adding']] } },
  { id: 'l2rem', level: 2, std: '4.OA.3', title: 'Division with remainders', sub: 'Left overs and what they mean', gen: genRem, school: true,
    learn: { big: 'Not everything shares out evenly. The remainder is what is left when no more full groups can be made.',
      tips: ['17 ÷ 5: three groups of 5 make 15, and 2 are left over. 3 remainder 2.', 'The remainder is always smaller than the number you divide by.', 'In a story, think about the left overs. Do they need one more car? Do they not count? Or are they the answer?', 'Check: groups × size + remainder gives back the number you started with.'],
      words: [['remainder', 'what is left over after making full groups'], ['full group', 'a group with nothing missing']] } },
  { id: 'l2area', level: 2, std: '3.MD.7, 3.MD.8', title: 'Area and perimeter', sub: 'Inside a rectangle and around its edge', gen: genArea, school: true,
    learn: { big: 'Area is how much flat space a shape covers, counted in squares. Perimeter is the distance around its edge.',
      tips: ['Area of a rectangle: rows of squares. Rows × squares in a row, which is length × width.', 'Perimeter: add all four sides. Opposite sides are equal, so add one of each and double.', 'Area is in square units (square cm). Perimeter is in plain units (cm).', 'Know the area and one side? Divide to find the other side.'],
      words: [['area', 'the space inside a flat shape'], ['perimeter', 'the distance all the way around a shape'], ['square unit', 'a square that is 1 unit on each side']] } },
  { id: 'l2frac', level: 2, std: '3.NF.1, 3.NF.2', title: 'Fractions: equal parts', sub: 'Parts of a whole and points on a number line', gen: genFrac, school: true,
    learn: { big: 'A fraction names equal parts of a whole. The bottom number says how many equal parts the whole is cut into. The top number says how many of them you have.',
      tips: ['The parts must be equal, or it is not a fraction.', 'A fraction with 1 on top is one part: one fourth, one sixth.', 'Three fourths is three parts of size one fourth.', 'On a number line, cut the space from 0 to 1 into equal jumps. Each jump is one part.'],
      words: [['numerator', 'the top number: how many parts'], ['denominator', 'the bottom number: how many equal parts make the whole'], ['unit fraction', 'a fraction with 1 on top']] } },
  { id: 'l2fraccmp', level: 2, std: '3.NF.3', title: 'Comparing fractions', sub: 'Same bottom number or same top number', gen: genFracCmp, school: true,
    learn: { big: 'A bigger bottom number means smaller pieces. One eighth of a pizza is less than one third of it.',
      tips: ['Same bottom number: the pieces are the same size, so more pieces is more.', 'Same top number: the same number of pieces, so bigger pieces is more. Bigger pieces have the smaller bottom number.', 'When the top and bottom match, the fraction is exactly one whole.', 'You can only compare fractions of the same whole.'],
      words: [['compare', 'decide which is greater, or whether they are equal'], ['one whole', 'all of the equal parts together']] } },
  { id: 'l2which', level: 2, std: '3.OA.3, 3.OA.8', title: 'Which operation?', sub: 'Add, subtract, multiply or divide', gen: genWhich, school: true,
    learn: { big: 'Before any calculating, decide what kind of story it is. The picture in your head tells you which operation to use.',
      tips: ['Different amounts joined together: add.', 'Something taken away, or a gap between two amounts: subtract.', 'Equal groups and you want the total: multiply.', 'A total split into equal groups: divide.'],
      words: [['each / every', 'a sign of equal groups: multiply or divide'], ['altogether', 'a total: add, or multiply if the groups are equal'], ['share equally', 'divide']] } },
  { id: 'l2story', level: 2, std: '3.OA.3, 3.OA.8', title: 'Story problems', sub: 'Multiply and divide, then two steps', gen: genStory, school: true, story: true,
    learn: { big: 'Story problems with equal groups need multiplying or dividing. Find the groups first: how many groups, and how many in each.',
      tips: ['Read the question first. Are you looking for a total, the size of a group, or the number of groups?', 'Know the groups and the size: multiply for the total.', 'Know the total: divide to find the groups or the size.', 'Two steps? Do the equal-groups step, write it down, then add or subtract.'],
      words: [['each', 'every group has the same amount'], ['in all', 'the total'], ['left over', 'what remains after making full groups']] } },
];
