// Level 0: Early Start. For a child about 4 to 6 who may not read yet. Every problem carries `say` (and `sayOptions` for choices)
// so the read-aloud button can speak it. Questions are answered by tapping; only step 3 of the two counting skills types a number.
import { STRAND } from './kit.js';
import { genCount, genCount20 } from './counting.js';
import { genNumRec } from './numrec.js';
import { genNext, genTens } from './sequence.js';
import { genMore, genOrder } from './compare.js';
import { genAdd, genSub } from './addsub.js';
import { genPairs } from './pairs.js';
import { genShapes } from './shapes.js';
import { genSolids } from './solids.js';
import { genSize, genWhere } from './space.js';
import { genPattern } from './patterns.js';
import { genSort } from './sorting.js';
import { genColors } from './colors.js';
import { genUpper, genLower, genMatch } from './letters.js';
import { genAbc } from './abc.js';
import { genSound } from './sounds.js';

export const STORY_SOURCES = [];
const S = STRAND;
const skill = (id, strand, std, title, sub, gen, learn) => ({ id, level: 0, strand, std, title, sub, gen, school: true, learn });

export const SKILLS = [
  skill('l0count', S.n, 'K.CC.4-5', 'Counting to 10', 'How many things are there?', genCount,
    { big: 'Counting means touching each thing once and saying one number for each. The last number you say tells how many.',
      tips: ['Let your child touch each dot as they count. Moving a finger along keeps them from counting one twice.', 'Say the numbers together at first, then let them go ahead alone.', 'If they skip or repeat, go back and count slowly together.'],
      words: [['count', 'say one number for each thing'], ['how many', 'the last number you say']] }),
  skill('l0count20', S.n, 'K.CC.5, K.NBT.1', 'Counting 11 to 20', 'Ten and some more', genCount20,
    { big: 'A full ten frame is ten. Numbers from 11 to 19 are ten and some more, so you only count the extras.',
      tips: ['Point to the full frame and say ten. Then count on from there: eleven, twelve, thirteen.', 'Ask: how many are in the second frame? That is the "some more".', 'Count out loud to twenty on car rides or walks.'],
      words: [['ten frame', 'a box of two rows of five, to see ten at a glance'], ['ten and some more', 'how the numbers 11 to 19 are built']] }),
  skill('l0numrec', S.n, 'K.CC.3', 'Knowing numbers', 'Find the number you hear', genNumRec,
    { big: 'Each number has a name and a shape. This practices hearing a number name and finding its shape.',
      tips: ['Say the number name slowly, then look at the buttons together.', 'Point out how the shapes differ: 6 has a loop at the bottom, 9 has a loop at the top.', 'Look for numbers on doors, clocks and signs while you are out.'],
      words: [['digit', 'one of the number symbols 0 to 9'], ['numeral', 'the written shape of a number']] }),
  skill('l0next', S.n, 'K.CC.2', 'What comes next', 'Before, after and missing numbers', genNext,
    { big: 'Counting has an order. The number after is one more, and the number before is one less.',
      tips: ['Count aloud from the left on the number line to find the box.', 'Say the number before the empty box and the number after it, then ask what is in between.', 'Counting backward is harder. Try it as a game once counting forward feels easy.'],
      words: [['after', 'the next number when you count up'], ['before', 'the number you say just ahead of it']] }),
  skill('l0tens', S.n, 'K.CC.1', 'Counting to 100', 'By ones and by tens', genTens,
    { big: 'The hundred chart is a counting path: ten numbers in every row. Going down one row adds ten.',
      tips: ['Read a row out loud together, then the next row. Notice how the rows end in 10, 20, 30.', 'Counting by tens uses the last number in each row: 10, 20, 30.', 'When a row ends, the count goes on at the start of the next row.'],
      words: [['hundred chart', 'a grid of the numbers 1 to 100'], ['count by tens', 'say 10, 20, 30, and so on']] }),
  skill('l0more', S.n, 'K.CC.6-7', 'More, fewer, the same', 'Compare groups and numbers', genMore,
    { big: 'To compare two groups, count each one. The group with the bigger number has more, and the other has fewer.',
      tips: ['You can also line the dots up in pairs. The group with dots left over has more.', 'The number you say later when counting is the bigger number.', 'Use real things too, like two piles of crackers.'],
      words: [['more', 'a bigger number of things'], ['fewer', 'a smaller number of things'], ['same', 'exactly equal']] }),
  skill('l0order', S.n, '1.NBT.3 readiness', 'Smallest to biggest', 'Put numbers in order', genOrder,
    { big: 'Numbers go in a line from smallest to biggest, the same order you count in.',
      tips: ['Count up from zero and listen for which number you say first.', 'The smallest number comes first when you count, and the biggest comes last.', 'Try ordering three or four number cards from the kitchen drawer.'],
      words: [['smallest', 'the number you say first when you count'], ['biggest', 'the number you say last']] }),
  skill('l0add', S.a, 'K.OA.1-2, K.OA.5', 'Putting together', 'Adding with pictures', genAdd,
    { big: 'Putting two groups together makes a bigger group. The number in all is the sum of the two parts.',
      tips: ['Count the first group, then keep counting on through the second group.', 'Say it as a story: two dots and three more dots makes five dots.', 'Use real things to try it: put two crackers with three crackers.'],
      words: [['in all', 'everything put together'], ['plus', 'put together with']] }),
  skill('l0sub', S.a, 'K.OA.1-2, K.OA.5', 'Taking away', 'Subtracting with pictures', genSub,
    { big: 'Taking away means some are gone. Count what is left after the crossed out ones.',
      tips: ['Cover the crossed out counters with a finger and count the rest.', 'Say it as a story: five dots, two go away, three are left.', 'Act it out with real things, then take some away.'],
      words: [['take away', 'some of them are gone'], ['left', 'what remains']] }),
  skill('l0pairs', S.a, 'K.OA.3-4', 'Making 5 and 10', 'How many more?', genPairs,
    { big: 'Some pairs of numbers fit together to make 5 or 10, like pieces of a puzzle.',
      tips: ['Count the empty boxes in the frame. That is how many more you need.', 'Play a game: you say a number up to ten and your child says how many more make ten.', 'Learning the pairs for ten helps later with every kind of adding.'],
      words: [['pair', 'two numbers that go together'], ['make ten', 'add up to exactly 10']] }),
  skill('l0shapes', S.s, 'K.G.1-2, K.G.4', 'Flat shapes', 'Circle, square, triangle and more', genShapes,
    { big: 'A shape keeps its name when it is big or small, or turned in any direction.',
      tips: ['Run a finger around the edge. Count the straight sides and the corners together.', 'A square turned on its point is still a square.', 'Look for shapes around the house: a clock, a window, a cracker.'],
      words: [['side', 'a straight edge of a shape'], ['corner', 'where two sides meet']] }),
  skill('l0solids', S.s, 'K.G.3-4', 'Solid shapes', 'Sphere, cube, cylinder and cone', genSolids,
    { big: 'Solid shapes are shapes you can hold. Flat shapes are only drawn on paper.',
      tips: ['Find real ones to hold: a ball, a box, a can. Try rolling and stacking them.', 'Round shapes roll. Shapes with flat tops and bottoms stack.', 'The flat faces of a solid are flat shapes. Every face of a cube is a square.'],
      words: [['sphere', 'a round ball shape'], ['cube', 'a box with six square faces'], ['cylinder', 'a can shape'], ['cone', 'a shape with a point at one end']] }),
  skill('l0size', S.s, 'K.MD.1-2', 'Bigger and smaller', 'Compare size, length and height', genSize,
    { big: 'We compare things by how big, how long or how tall they are, using words like bigger and shorter.',
      tips: ['When you compare length, the things must start at the same place.', 'Use real things: which pencil is longer, which cup is taller?', 'Ask your child to use the word they hear in the question.'],
      words: [['longer', 'more length'], ['shorter', 'less length'], ['taller', 'more height']] }),
  skill('l0where', S.s, 'K.G.1', 'Where is it?', 'Above, below, next to and more', genWhere,
    { big: 'Position words tell where something is: above, below, next to, between, in front and behind.',
      tips: ['Use your own body: put your hand above your head, then below your chin.', 'Left is the side of the hand that makes an L with the thumb.', 'In front is the one drawn on top, covering part of the one behind.'],
      words: [['above', 'higher up than'], ['below', 'lower down than'], ['between', 'in the middle of two things']] }),
  skill('l0pattern', S.s, 'K.OA.2 readiness', 'Patterns', 'What comes next in a pattern?', genPattern,
    { big: 'A pattern is something that repeats in the same order. Find the part that repeats and keep going.',
      tips: ['Say the pattern out loud, like a rhythm: circle, square, circle, square.', 'Find the little group that repeats. Count how many are in it.', 'Make patterns with blocks, socks or snacks.'],
      words: [['pattern', 'something that repeats'], ['repeat', 'happen again and again']] }),
  skill('l0sort', S.s, 'K.MD.3', 'Sorting', 'Which one belongs?', genSort,
    { big: 'Sorting means putting things together that are alike in some way, such as shape, size or color.',
      tips: ['Ask what is the same about the ones that go together.', 'When you count a group, touch each one once.', 'Sort real things too: spoons and forks, or red socks and blue socks.'],
      words: [['sort', 'put things in groups that are alike'], ['belong', 'go together with']] }),
  skill('l0colours', S.c, 'K readiness', 'Colors', 'Find and name colors', genColors,
    { big: 'Learning color names helps your child describe what they see. Light and dark are two ways a color can look.',
      tips: ['Name the colors of things around you during the day.', 'If your child mixes up two colors, put the two things side by side.', 'Dark colors look deep and light colors look pale, even in the same color.'],
      words: [['light', 'a pale shade of a color'], ['dark', 'a deep shade of a color']] }),
  skill('l0upper', S.l, 'RF.K.1d', 'Capital letters', 'Find the letter you hear', genUpper,
    { big: 'Capital letters are the big letters used to start names and sentences. This practices knowing them by sight.',
      tips: ['Say the letter name and its sound, then look for the shape together.', 'Trace the letter in the air with a finger.', 'At the last step some letters look alike, like E and F. Point to what is different.'],
      words: [['capital letter', 'the big form of a letter, like A']] }),
  skill('l0lower', S.l, 'RF.K.1d', 'Small letters', 'Find the small letter you hear', genLower,
    { big: 'Small letters are the ones used most in words. Some look alike, so look closely at which way they face.',
      tips: ['The letters b and p have their round part on the right, and d and q have it on the left. The letters p and q hang down below the line.', 'Say the letter name and its sound, then look for the shape together.', 'Look for the small letters in a favorite book.'],
      words: [['small letter', 'the little form of a letter, like a']] }),
  skill('l0match', S.l, 'RF.K.1d', 'Matching letters', 'Capital and small letters', genMatch,
    { big: 'Each letter has a capital form and a small form. They are two ways of writing the same letter.',
      tips: ['Say both names together: capital B, small b.', 'Some pairs look alike, like C and c. Others look very different, like A and a.', 'Look for both forms in a book title and a sentence.'],
      words: [['capital', 'the big form of a letter'], ['small', 'the little form of a letter']] }),
  skill('l0abc', S.l, 'RF.K.1d', 'Alphabet order', 'What letter comes next?', genAbc,
    { big: 'The alphabet always goes in the same order. Knowing the order helps with reading and finding words.',
      tips: ['Sing the alphabet song together, slowly, and stop at the empty box.', 'Point to each letter in the row as you sing.', 'Say the letter before the empty box, then the one after.'],
      words: [['alphabet', 'all the letters in order, from A to Z']] }),
  skill('l0sound', S.l, 'RF.K.2d', 'First sounds', 'Which letter does the word start with?', genSound,
    { big: 'Every word starts with a sound, and each sound goes with a letter. This practices hearing the first sound.',
      tips: ['Say the word slowly and stretch the first sound: sssun.', 'Ask your child to say just the first sound before they tap.', 'Play a game in the car: what sound does your name start with?'],
      words: [['first sound', 'the sound you hear at the start of a word'], ['letter sound', 'what a letter says, like sss for S']] }),
];
