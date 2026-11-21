// Level 1: Number sense. Adding, subtracting and place value, rebuilt from the ground up.
// The list is a learning path: numbers first, then adding and subtracting, then rows, shapes, shares, measuring, graphs and stories.
import { genAdd } from './add20.js';
import { genSub } from './sub20.js';
import { genPV } from './placevalue.js';
import { genCmp } from './compare.js';
import { genAddBig, genSubBig } from './addsub.js';
import { genSkip } from './skip.js';
import { genRound } from './rounding.js';
import { genMoney, moneyWord, timeWord } from './money-time.js';
import { addWord, subWord, cmpWord, twoStep } from './stories.js';
import { cmpFewer, changeUnknown, startAfterTake, startBeforeAdd, otherAmount } from './cmpstories.js';
import { genCount } from './counting.js';
import { genParity } from './parity.js';
import { genMental } from './mental.js';
import { genEqual } from './equal.js';
import { genAddMany } from './addmany.js';
import { genArray } from './array.js';
import { genShapes } from './shapes.js';
import { genShares } from './shares.js';
import { genMeasure } from './measure.js';
import { genJump } from './jump.js';
import { l1bonds } from './bonds.js';
import { l1break } from './break.js';
import { l1bar } from './barmodel.js';
import { genTrade } from './trade.js';
import { genClock } from './time.js';
import { genTally } from './tally.js';
import { genGraph } from './graphs.js';
import { makeStory } from '../level4/story.js';

// Story problems for this level: each source is (L) => a story problem object (or null to skip a step).
export const STORY_SOURCES = [addWord, subWord, cmpWord, twoStep, twoStep, moneyWord, timeWord, cmpFewer, changeUnknown, startAfterTake, startBeforeAdd, otherAmount];
const genStory = L => makeStory(STORY_SOURCES, L);

export const SKILLS = [
  { id: 'l1count', level: 1, strand: 'Numbers', std: '1.NBT.1, 2.NBT.2', title: 'Counting on and back', sub: 'Before, after and between, by 1s, 10s and 100s, up to 1,000', gen: genCount, school: true,
    learn: { big: 'Numbers always come in the same order, so you can count on from any number and count back to find the one before it.',
      tips: ['Just after a number is one more. Just before is one less.', 'When the ones reach 9 the next number starts a new ten. After 99 comes 100, and after 999 comes 1,000.', 'Counting by tens changes the tens digit and leaves the ones alone: 87, 97, 107. Counting by hundreds changes only the hundreds digit.', 'On a number line the jumps between neighbours are all the same size. Find one jump, then use it to find the gap.'],
      words: [['count on', 'say the numbers that come after, one after another'], ['count back', 'say the numbers that come before, going down'], ['between', 'in the middle of two numbers: 6 is between 5 and 7']] } },
  { id: 'l1pv', level: 1, strand: 'Numbers', std: '2.NBT.1, 2.NBT.3', title: 'Hundreds, tens and ones', sub: 'What each digit is worth, up to 1,000', gen: genPV, school: true,
    learn: { big: 'Where a digit sits tells you what it is worth. The 4 in 47 means 4 tens, which is 40. The 4 in 74 is only 4 ones.',
      tips: ['Ten ones make 1 ten. Ten tens make 1 hundred.', '358 = 300 + 50 + 8: 3 hundreds, 5 tens and 8 ones.', 'A zero holds a place open: 406 has no tens, but the 0 keeps the 4 in the hundreds place.', 'More than 9 in one place? Trade 10 of them for 1 of the next place up.'],
      words: [['digit', 'one of the symbols 0 to 9'], ['place value', 'what a digit is worth because of where it sits'], ['expanded form', 'a number written as its parts, like 300 + 50 + 8']] } },
  { id: 'l1cmp', level: 1, strand: 'Numbers', std: '2.NBT.4', title: 'Comparing and ordering', sub: 'Greater, less, equal, and numbers in order', gen: genCmp, school: true,
    learn: { big: 'To compare two numbers, start at the biggest place. The first place where they differ decides it.',
      tips: ['One hundred is more than any number of tens and ones below it, so look at the hundreds first.', 'Same hundreds? Look at the tens. Same tens? Look at the ones.', 'The open side of < and > always faces the greater number.', 'To order a list, find the least number first, then the least of what is left.'],
      words: [['greater than', 'more than, written >'], ['less than', 'smaller than, written <'], ['least', 'the smallest'], ['greatest', 'the biggest']] } },
  { id: 'l1evenodd', level: 1, strand: 'Numbers', std: '2.OA.3', title: 'Even and odd', sub: 'Pairing up, the last digit, and sums', gen: genParity, school: true,
    learn: { big: 'A number is even if you can put everything into pairs with none left over. If one is left without a partner, it is odd.',
      tips: ['Even numbers end in 0, 2, 4, 6 or 8. Odd numbers end in 1, 3, 5, 7 or 9. Only the last digit matters, however big the number is.', 'Even and odd take turns when you count: 12 is even, 13 is odd, 14 is even.', 'Even + even is even. Odd + odd is even, because the two left-over ones make a pair. Even + odd is odd.', 'Sharing equally between two people leaves nothing over when the number is even, and one over when it is odd.'],
      words: [['even', 'can be made into pairs with none left over'], ['odd', 'one is left over after you make pairs'], ['pair', 'a group of two']] } },
  { id: 'l1skip', level: 1, strand: 'Numbers', std: '2.NBT.2, 2.OA.4', title: 'Skip counting', sub: 'By 2, 5 and 10, then 3 and 4', gen: genSkip, school: true,
    learn: { big: 'Skip counting is counting in equal jumps. It is the bridge to multiplying: 4 jumps of 5 is 4 × 5.',
      tips: ['Find the size of the jump from two neighbours, then keep making that same jump.', 'Counting by 10s only changes the tens digit: 37, 47, 57.', 'Counting by 5s from 0 always ends in 5 or 0.', 'When you skip count by 3s or 4s you are already saying the times tables.'],
      words: [['skip count', 'count in equal jumps bigger than 1'], ['pattern', 'something that repeats by a rule']] } },
  { id: 'l1round', level: 1, strand: 'Numbers', std: '3.NBT.1', title: 'Rounding', sub: 'Nearest 10 and nearest 100 on a number line', gen: genRound, school: true,
    learn: { big: 'Rounding swaps a number for the closest tidy number, a ten or a hundred, so it is easier to think with.',
      tips: ['Find the two tens (or hundreds) the number sits between. Which one is it closer to?', 'The halfway mark decides. Below halfway, go down. At halfway or above, go up.', 'Shortcut: for the nearest ten, look at the ones digit. For the nearest hundred, look at the tens digit. 5 or more goes up.', 'A rounded number is an estimate. It is close, not exact.'],
      words: [['round', 'swap a number for the nearest ten or hundred'], ['halfway', 'the middle between two tens or two hundreds'], ['estimate', 'a sensible close answer']] } },
  { id: 'l1add20', level: 1, strand: 'Adding and subtracting', std: '1.OA.6, 2.OA.2', title: 'Adding within 20', sub: 'Make a ten, doubles, near doubles', gen: genAdd, school: true,
    learn: { big: 'Ten is the friendliest number there is. If you can get to ten, the rest of an addition is easy.',
      tips: ['Make a ten: 8 + 5 is 8 + 2 (that is 10) and 3 more. 13.', 'Doubles are worth knowing by heart: 6 + 6 = 12, 7 + 7 = 14.', 'Near doubles: 6 + 7 is just one more than 6 + 6.', 'You can add in any order, so start from the bigger number.'],
      words: [['sum', 'the answer to adding'], ['double', 'a number added to itself'], ['make a ten', 'split a number so one part fills up 10']],
      card: { title: 'Why make a ten works', why: 'Moving ones from one addend onto the other does not change the total, so you can make a ten and keep the same sum.' } } },
  { id: 'l1jump', level: 1, strand: 'Adding and subtracting', std: '1.OA.6, 2.NBT.5', title: 'Number line jumps', sub: 'Jump to the next ten, within 20 and within 100', gen: genJump, school: true,
    learn: { big: 'A ten is a good place to stop. Jump to the ten first, then jump only what is left.',
      tips: ['8 + 5 is a jump of 2 to 10, then a jump of 3. You land on 13.', '47 + 6 is a jump of 3 to 50, then a jump of 3. You land on 53.', 'Jumping back works the same way: 15 − 7 is back 5 to 10, then back 2 more.', 'Do not jump the whole amount again after you land on the ten. Those ones were already used.'],
      words: [['jump', 'a move along the number line'], ['bridge', 'the jump that lands exactly on a ten']],
      card: { title: 'Why the jump works', why: 'The distance is the same whether you jump it at once or in two smaller jumps, so stopping on a ten is only a rest stop, not a new amount.' } } },
  l1bonds,
  l1break,
  { id: 'l1sub20', level: 1, strand: 'Adding and subtracting', std: '1.OA.4, 1.OA.6', title: 'Subtracting within 20', sub: 'Think addition, back through ten, fact families', gen: genSub, school: true,
    learn: { big: 'Subtracting and adding are two views of the same fact. 13 − 9 asks the same thing as 9 + ? = 13.',
      tips: ['Think addition: for 15 − 7, ask what you add to 7 to reach 15.', 'Go back through ten: 15 − 7 is 15 − 5 (that is 10), then 2 more off. 8.', 'Count back only when the number you take away is small.', 'A fact family uses the same three numbers: 8 + 5 = 13, 5 + 8 = 13, 13 − 8 = 5, 13 − 5 = 8.'],
      words: [['difference', 'the answer to subtracting'], ['fact family', 'the adding and subtracting facts made from the same three numbers']] } },
  { id: 'l1equal', level: 1, strand: 'Adding and subtracting', std: '1.OA.7, 1.OA.8', title: 'The equal sign', sub: 'True or false sentences, and making both sides balance', gen: genEqual, school: true,
    learn: { big: 'The equal sign does not mean "the answer comes next". It means both sides are the same amount, like a balanced scale.',
      tips: ['Work out each side on its own, then compare. If the two numbers match, the sentence is true.', 'Adding in a different order gives the same total, so 7 + 5 = 5 + 7.', 'A sum can sit on either side: 12 = 15 − 3 is just as good as 15 − 3 = 12.', 'To find a missing number, work out the side with no gap first. The other side has to match it.'],
      words: [['equal sign', 'the = symbol: both sides are the same amount'], ['true', 'the two sides match'], ['false', 'the two sides do not match'], ['balance', 'make both sides the same amount']] } },
  { id: 'l1mental', level: 1, strand: 'Adding and subtracting', std: '1.NBT.5, 2.NBT.5, 2.NBT.8', title: 'Mental math with tens', sub: '10 and 100 more or less, adding tens, bridging a ten', gen: genMental, school: true,
    learn: { big: 'Tens are easy to work with, so use them. Change the tens first, then deal with the ones.',
      tips: ['10 more changes the tens digit up by one. 100 more changes the hundreds digit. The other digits stay put.', 'Adding 30 is three jumps of ten: 47, 57, 67, 77.', 'Bridge a ten: 82 − 5 is 82 − 2 (to land on 80) and then 3 more, which is 77.', 'Break numbers apart by place: 46 + 32 is 40 + 30 and 6 + 2, which is 70 + 8.'],
      words: [['bridge a ten', 'stop at the next ten on the way, then finish the rest'], ['multiple of 10', 'a number you say when counting by tens: 10, 20, 30...'], ['break apart', 'split a number into tens and ones to make it easier']] } },
  { id: 'l1trade', level: 1, strand: 'Adding and subtracting', std: '2.NBT.5', title: 'Trading blocks', sub: 'Base-ten blocks for adding within 100', gen: genTrade, school: true,
    learn: { big: 'Ones are little cubes and tens are rods. When the cubes reach 10, trade them for a rod.',
      tips: ['Add the cubes first. 8 cubes and 7 cubes are 15 cubes.', '15 cubes is 1 rod and 5 cubes. Move that rod over with the other tens.', 'Forgetting the trade makes the answer 10 too small.', 'A rod is already a ten. Do not count it as one more cube.'],
      words: [['trade', 'swap 10 ones for 1 ten'], ['rod', 'a block that stands for 10'], ['cube', 'a block that stands for 1']] } },
  { id: 'l1addbig', level: 1, strand: 'Adding and subtracting', std: '2.NBT.5, 2.NBT.7', title: 'Adding bigger numbers', sub: 'Two and three digits, trading 10 ones for a ten', gen: genAddBig, school: true,
    learn: { big: 'Add the same kind of thing together: ones with ones, tens with tens, hundreds with hundreds.',
      tips: ['Break each number into hundreds, tens and ones, add the matching parts, then put the parts together.', 'When a place reaches 10 or more, trade 10 of them for 1 of the next place up. That is all "carrying" means.', 'On a number line, jump the hundreds, then the tens, then the ones.', 'Check that the answer is about the size you expected.'],
      words: [['trade', 'swap 10 of one place for 1 of the next place up (also called regrouping or carrying)'], ['sum', 'the answer to adding']] } },
  { id: 'l1subbig', level: 1, strand: 'Adding and subtracting', std: '2.NBT.5, 2.NBT.7', title: 'Subtracting bigger numbers', sub: 'Two and three digits, trading across zeros', gen: genSubBig, school: true,
    learn: { big: 'Subtract place by place. When a place does not have enough, trade 1 from the next place up for 10.',
      tips: ['52 − 17: 2 ones are not enough to take 7 from. Trade 1 ten for 10 ones. Now 12 − 7 = 5, and 4 tens − 1 ten = 3 tens.', 'A zero in the tens? Go to the hundreds first: 1 hundred becomes 10 tens, then 1 of those tens becomes 10 ones.', 'Counting up from the smaller number gives the same answer, and it is often easier.', 'Always check by adding your answer to the number you took away.'],
      words: [['trade', 'swap 1 of a place for 10 of the place to its right (also called regrouping or borrowing)'], ['difference', 'the answer to subtracting']] } },
  { id: 'l1addmany', level: 1, strand: 'Adding and subtracting', std: '2.NBT.6', title: 'Adding several numbers', sub: 'Up to four 2-digit numbers, and checking with an estimate', gen: genAddMany, school: true,
    learn: { big: 'To add many numbers, add the tens together and the ones together, then join the two answers. An estimate tells you whether you are close.',
      tips: ['Add the tens first: 40 + 20 + 30 = 90. Then add the ones. Then join them.', 'If the ones come to 10 or more, trade 10 ones for 1 ten and add it to the tens. That is the step people forget.', 'Look for two numbers that make a ten or a hundred together and add those first.', 'Estimate first: round each number to the nearest ten and add. Your exact answer should be close to it.'],
      words: [['estimate', 'a close answer found quickly with rounded numbers'], ['total', 'the answer to adding'], ['trade', 'swap 10 ones for 1 ten']] } },
  { id: 'l1array', level: 1, strand: 'Multiplying and dividing', std: '2.OA.4', title: 'Rows and columns', sub: 'Counting an array: the bridge to multiplying', gen: genArray, school: true,
    learn: { big: 'An array is counters set out in equal rows and columns. Add the rows, or skip count, to find how many. This is where multiplying begins: 3 rows of 4 is written 3 × 4.',
      tips: ['A row goes across and a column goes down. Count the rows, then count how many are in each one.', 'Add the same number once for each row: 4 + 4 + 4 = 12.', 'Turn the array on its side and the total stays the same: 3 rows of 4 and 4 rows of 3 both make 12.', 'Skip counting is a shortcut: for 4 rows of 5, count 5, 10, 15, 20.'],
      words: [['array', 'objects set out in equal rows and columns'], ['row', 'a line going across'], ['column', 'a line going down'], ['multiply', 'find the total of equal groups, like 3 × 4']] } },
  { id: 'l1shapes', level: 1, strand: 'Shapes and space', std: '1.G.1, 2.G.1', title: 'Shapes', sub: 'Flat shapes and solid shapes: sides, corners and faces', gen: genShapes, school: true,
    learn: { big: 'Every shape has things you can count: sides and corners for flat shapes, flat faces and corners for solid ones. Count them to name the shape.',
      tips: ['A triangle has 3 sides, a square and a rectangle have 4, a pentagon 5, a hexagon 6 and an octagon 8. A flat shape has as many corners as sides.', 'A square has 4 equal sides. A rectangle has 4 sides, with two long and two short.', 'Solid shapes have flat faces. A cube has 6, a cylinder 2, a cone 1 and a sphere none.', 'Sort by what you can count: no corners, 4 sides, more than 5 corners.'],
      words: [['side', 'a straight edge of a flat shape'], ['corner', 'where two sides meet'], ['face', 'a flat surface of a solid shape'], ['rectangular prism', 'a box shape, like a shoebox']] } },
  { id: 'l1shares', level: 1, strand: 'Fractions and decimals', std: '1.G.3, 2.G.3', title: 'Halves, thirds and quarters', sub: 'Equal shares of shapes', gen: genShares, school: true,
    learn: { big: 'Equal shares are exactly the same size. Cut a whole into 2 equal shares and each is a half, into 3 and each is a third, into 4 and each is a quarter.',
      tips: ['Shares only count if they are equal. A cut that makes a big piece and a small piece does not make halves.', 'More shares from the same whole means each share is smaller. A quarter is smaller than a half.', 'Equal shares do not have to look alike. A square can be cut into halves straight down or corner to corner.', '2 halves, 3 thirds or 4 quarters put back together make one whole.'],
      words: [['half', 'one of 2 equal shares'], ['third', 'one of 3 equal shares'], ['quarter', 'one of 4 equal shares'], ['whole', 'the full shape before it is cut']] } },
  { id: 'l1length', level: 1, strand: 'Measurement', std: '2.MD.1-6', title: 'Measuring length', sub: 'Rulers, centimeters and inches, longer and shorter', gen: genMeasure, school: true,
    learn: { big: 'A ruler is a number line. Line up the start of the object with the 0 mark, then read the number where it ends.',
      tips: ['If the object starts at 0, the mark where it ends is its length. If it starts somewhere else, subtract the start from the end.', 'Pick a unit to suit the size: centimeters for small things, meters for rooms and pools, kilometers for long trips. Inches, feet and miles do the same job.', 'To find how much longer one thing is, subtract the two lengths.', 'To join lengths end to end, add them. Check that the units match.'],
      words: [['length', 'how long something is from one end to the other'], ['unit', 'the size you count in, like a centimeter or an inch'], ['centimeter (cm)', 'a small unit, about the width of a fingernail'], ['inch', 'a small unit, about the length of a thumb joint']] } },
  { id: 'l1clock', level: 1, strand: 'Measurement', std: '1.MD.3, 2.MD.7', title: 'Telling time', sub: 'Clock faces to the hour, the half hour and five minutes', gen: genClock, school: true,
    learn: { big: 'The short hand tells the hour. The long hand tells the minutes, and each number it points at is worth 5 minutes.',
      tips: ['The short thick hand is the hour. The long hand is the minutes.', 'The long hand on the 4 means 20 minutes, not 4 minutes. Count by fives.', 'Half past is the long hand on the 6: 30 minutes.', 'When minutes pass 60 they become the next hour. 2:50 and 20 minutes more is 3:10.'],
      words: [['hour hand', 'the short hand: it tells the hour'], ['minute hand', 'the long hand: each number is 5 minutes'], ['half past', '30 minutes past the hour']] } },
  { id: 'l1money', level: 1, strand: 'Measurement', std: '2.MD.7, 2.MD.8', title: 'Money and time', sub: 'Coins, dollars, cents, minutes and clock faces', gen: genMoney, school: true,
    learn: { big: 'Money and time are adding and subtracting with a unit attached. The one new thing: an hour has 60 minutes, not 100.',
      tips: ['Joining prices: add. Change, or money left: subtract.', 'Count coins biggest first and keep a running total: a quarter is 25 cents, a dime 10, a nickel 5, a penny 1.', '1 dollar is 100 cents. 1 hour is 60 minutes.', 'On a clock face the short hand shows the hour and the long hand shows the minutes. Each number is 5 minutes.', 'To find how long something lasts, count up from the start time to the end time.', 'When minutes pass 60, they become the next hour: 2:45 and 30 minutes more is 3:15.'],
      words: [['change', 'the money you get back when you pay with more than the price'], ['altogether', 'everything joined, so add'], ['lasts', 'how much time passes from start to end'], ['minute hand', 'the long hand on a clock: each number it points at is 5 minutes']] } },
  { id: 'l1tally', level: 1, strand: 'Data and chance', std: '1.MD.4', title: 'Tally charts', sub: 'Bundles of five, then how many more', gen: genTally, school: true,
    learn: { big: 'A tally is a mark for each thing you count. Every fifth mark slants across the bundle, so fives are easy to see.',
      tips: ['Four upright marks and one slanted mark make 5.', 'The slanted mark is a mark too. It is not a decoration.', 'Count the bundles by fives, then count the extra marks.', 'To see which row has more, count both rows. A longer row is not always more if you forget that a bundle is 5.'],
      words: [['tally', 'a mark that stands for one thing'], ['bundle', 'five tally marks, the fifth one slanted']] } },
  { id: 'l1graph', level: 1, strand: 'Data and chance', std: '2.MD.10', title: 'Reading graphs', sub: 'Picture graphs and bar graphs', gen: genGraph, school: true,
    learn: { big: 'A graph shows how many are in each group so you can compare at a glance. Read the key or the scale first, then the values.',
      tips: ['In a picture graph, one picture can stand for more than one. Read the key to see how many.', 'In a bar graph, line the top of the bar up with the numbers at the side. Check how much each grid line is worth.', 'The tallest bar or the longest row is the most. The shortest is the fewest.', 'To find how many more, subtract two values. To find the total, add them all.'],
      words: [['key', 'tells you what one picture stands for'], ['scale', 'the numbers at the side of a bar graph'], ['most', 'the biggest value'], ['fewest', 'the smallest value']] } },
  l1bar,
  { id: 'l1story', level: 1, strand: 'Stories', std: '1.OA.1, 2.OA.1', title: 'Story problems', sub: 'Add, subtract and compare: one step, two steps and missing parts', gen: genStory, school: true, story: true,
    learn: { big: 'A story problem is a small scene. Picture what happens to the amounts before you touch the numbers.',
      tips: ['Read the question first. What are you being asked to find?', 'Is something being joined, taken away, or compared? Joined means add. Taken away or compared means subtract.', 'Sometimes the missing number is the start or the change. A bar picture helps: the whole on top and the parts underneath.', 'Some stories have two things happening. Do one step, write it down, then do the next.', 'At the end, ask: is my answer a sensible size?'],
      words: [['in all / altogether', 'join the amounts: add'], ['left', 'what remains after taking away: subtract'], ['how many more', 'the gap between two amounts: subtract'], ['whole and part', 'the whole is everything together, a part is one piece of it']] } },
];
