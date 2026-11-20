// Level 1: Number sense. Adding, subtracting and place value, rebuilt from the ground up.
import { genAdd } from './add20.js';
import { genSub } from './sub20.js';
import { genPV } from './placevalue.js';
import { genCmp } from './compare.js';
import { genAddBig, genSubBig } from './addsub.js';
import { genSkip } from './skip.js';
import { genRound } from './rounding.js';
import { genMoney, moneyWord, timeWord } from './money-time.js';
import { addWord, subWord, cmpWord, twoStep } from './stories.js';
import { makeStory } from '../level4/story.js';

// Story problems for this level: each source is (L) => a story problem object (or null to skip a step).
export const STORY_SOURCES = [addWord, subWord, cmpWord, twoStep, twoStep, moneyWord, timeWord];
const genStory = L => makeStory(STORY_SOURCES, L);

export const SKILLS = [
  { id: 'l1add20', level: 1, std: '1.OA.6, 2.OA.2', title: 'Adding within 20', sub: 'Make a ten, doubles, near doubles', gen: genAdd, school: true,
    learn: { big: 'Ten is the friendliest number there is. If you can get to ten, the rest of an addition is easy.',
      tips: ['Make a ten: 8 + 5 is 8 + 2 (that is 10) and 3 more. 13.', 'Doubles are worth knowing by heart: 6 + 6 = 12, 7 + 7 = 14.', 'Near doubles: 6 + 7 is just one more than 6 + 6.', 'You can add in any order, so start from the bigger number.'],
      words: [['sum', 'the answer to adding'], ['double', 'a number added to itself'], ['make a ten', 'split a number so one part fills up 10']] } },
  { id: 'l1sub20', level: 1, std: '1.OA.4, 1.OA.6', title: 'Subtracting within 20', sub: 'Think addition, back through ten, fact families', gen: genSub, school: true,
    learn: { big: 'Subtracting and adding are two views of the same fact. 13 − 9 asks the same thing as 9 + ? = 13.',
      tips: ['Think addition: for 15 − 7, ask what you add to 7 to reach 15.', 'Go back through ten: 15 − 7 is 15 − 5 (that is 10), then 2 more off. 8.', 'Count back only when the number you take away is small.', 'A fact family uses the same three numbers: 8 + 5 = 13, 5 + 8 = 13, 13 − 8 = 5, 13 − 5 = 8.'],
      words: [['difference', 'the answer to subtracting'], ['fact family', 'the adding and subtracting facts made from the same three numbers']] } },
  { id: 'l1pv', level: 1, std: '2.NBT.1, 2.NBT.3', title: 'Hundreds, tens and ones', sub: 'What each digit is worth, up to 1,000', gen: genPV, school: true,
    learn: { big: 'Where a digit sits tells you what it is worth. The 4 in 47 means 4 tens, which is 40. The 4 in 74 is only 4 ones.',
      tips: ['Ten ones make 1 ten. Ten tens make 1 hundred.', '358 = 300 + 50 + 8: 3 hundreds, 5 tens and 8 ones.', 'A zero holds a place open: 406 has no tens, but the 0 keeps the 4 in the hundreds place.', 'More than 9 in one place? Trade 10 of them for 1 of the next place up.'],
      words: [['digit', 'one of the symbols 0 to 9'], ['place value', 'what a digit is worth because of where it sits'], ['expanded form', 'a number written as its parts, like 300 + 50 + 8']] } },
  { id: 'l1cmp', level: 1, std: '2.NBT.4', title: 'Comparing and ordering', sub: 'Greater, less, equal, and numbers in order', gen: genCmp, school: true,
    learn: { big: 'To compare two numbers, start at the biggest place. The first place where they differ decides it.',
      tips: ['One hundred is more than any number of tens and ones below it, so look at the hundreds first.', 'Same hundreds? Look at the tens. Same tens? Look at the ones.', 'The open side of < and > always faces the greater number.', 'To order a list, find the least number first, then the least of what is left.'],
      words: [['greater than', 'more than, written >'], ['less than', 'smaller than, written <'], ['least', 'the smallest'], ['greatest', 'the biggest']] } },
  { id: 'l1addbig', level: 1, std: '2.NBT.5, 2.NBT.7', title: 'Adding bigger numbers', sub: 'Two and three digits, trading 10 ones for a ten', gen: genAddBig, school: true,
    learn: { big: 'Add the same kind of thing together: ones with ones, tens with tens, hundreds with hundreds.',
      tips: ['Break each number into hundreds, tens and ones, add the matching parts, then put the parts together.', 'When a place reaches 10 or more, trade 10 of them for 1 of the next place. That is all "carrying" means.', 'On a number line, jump the hundreds, then the tens, then the ones.', 'Check that the answer is about the size you expected.'],
      words: [['trade', 'swap 10 of one place for 1 of the next place up (also called regrouping or carrying)'], ['sum', 'the answer to adding']] } },
  { id: 'l1subbig', level: 1, std: '2.NBT.5, 2.NBT.7', title: 'Subtracting bigger numbers', sub: 'Two and three digits, trading across zeros', gen: genSubBig, school: true,
    learn: { big: 'Subtract place by place. When a place does not have enough, trade 1 from the next place up for 10.',
      tips: ['52 − 17: 2 ones are not enough to take 7 from. Trade 1 ten for 10 ones. Now 12 − 7 = 5, and 4 tens − 1 ten = 3 tens.', 'A zero in the tens? Go to the hundreds first: 1 hundred becomes 10 tens, then 1 of those tens becomes 10 ones.', 'Counting up from the smaller number gives the same answer, and it is often easier.', 'Always check by adding your answer to the number you took away.'],
      words: [['trade', 'swap 1 of a place for 10 of the place to its right (also called regrouping or borrowing)'], ['difference', 'the answer to subtracting']] } },
  { id: 'l1skip', level: 1, std: '2.NBT.2, 2.OA.4', title: 'Skip counting', sub: 'By 2, 5 and 10, then 3 and 4', gen: genSkip, school: true,
    learn: { big: 'Skip counting is counting in equal jumps. It is the bridge to multiplying: 4 jumps of 5 is 4 × 5.',
      tips: ['Find the size of the jump from two neighbours, then keep making that same jump.', 'Counting by 10s only changes the tens digit: 37, 47, 57.', 'Counting by 5s from 0 always ends in 5 or 0.', 'When you skip count by 3s or 4s you are already saying the times tables.'],
      words: [['skip count', 'count in equal jumps bigger than 1'], ['pattern', 'something that repeats by a rule']] } },
  { id: 'l1round', level: 1, std: '3.NBT.1', title: 'Rounding', sub: 'Nearest 10 and nearest 100 on a number line', gen: genRound, school: true,
    learn: { big: 'Rounding swaps a number for the closest tidy number, a ten or a hundred, so it is easier to think with.',
      tips: ['Find the two tens (or hundreds) the number sits between. Which one is it closer to?', 'The halfway mark decides. Below halfway, go down. At halfway or above, go up.', 'Shortcut: for the nearest ten, look at the ones digit. For the nearest hundred, look at the tens digit. 5 or more goes up.', 'A rounded number is an estimate. It is close, not exact.'],
      words: [['round', 'swap a number for the nearest ten or hundred'], ['halfway', 'the middle between two tens or two hundreds'], ['estimate', 'a sensible close answer']] } },
  { id: 'l1money', level: 1, std: '2.MD.7, 2.MD.8', title: 'Money and time', sub: 'Coins, dollars, cents, minutes and clock faces', gen: genMoney, school: true,
    learn: { big: 'Money and time are adding and subtracting with a unit attached. The one new thing: an hour has 60 minutes, not 100.',
      tips: ['Joining prices: add. Change, or money left: subtract.', 'Count coins biggest first and keep a running total: a quarter is 25 cents, a dime 10, a nickel 5, a penny 1.', '1 dollar is 100 cents. 1 hour is 60 minutes.', 'On a clock face the short hand shows the hour and the long hand shows the minutes. Each number is 5 minutes.', 'To find how long something lasts, count up from the start time to the end time.', 'When minutes pass 60, they become the next hour: 2:45 and 30 minutes more is 3:15.'],
      words: [['change', 'the money you get back when you pay with more than the price'], ['altogether', 'everything joined, so add'], ['lasts', 'how much time passes from start to end'], ['minute hand', 'the long hand on a clock: each number it points at is 5 minutes']] } },
  { id: 'l1story', level: 1, std: '1.OA.1, 2.OA.1', title: 'Story problems', sub: 'Add or subtract, one step and two steps', gen: genStory, school: true, story: true,
    learn: { big: 'A story problem is a small scene. Picture what happens to the amounts before you touch the numbers.',
      tips: ['Read the question first. What are you being asked to find?', 'Is something being joined, taken away, or compared? Joined means add. Taken away or compared means subtract.', 'Some stories have two things happening. Do one step, write it down, then do the next.', 'At the end, ask: is my answer a sensible size?'],
      words: [['in all / altogether', 'join the amounts: add'], ['left', 'what remains after taking away: subtract'], ['how many more', 'the gap between two amounts: subtract']] } },
];
