// The existing level 3 skills (the school content from before the grade 4 fill-in), with the strand each belongs to.
import { F, M } from '../../util.js';
import { skill } from './skill-def.js';
import { genPV } from './placevalue.js';
import { genRound } from './rounding.js';
import { genAddSub } from './addsub.js';
import { genFactors } from './factors.js';
import { genPrime } from './primes.js';
import { genMul1, genMul2 } from './multiply.js';
import { genDiv } from './divide.js';
import { genEquiv } from './frac-equal.js';
import { genSimplify } from './frac-simplify.js';
import { genCompare } from './frac-compare.js';
import { genFadd } from './frac-add.js';
import { genMixed } from './mixed.js';
import { genFmul } from './frac-times.js';
import { genDec } from './decimals.js';
import { genAngles } from './angles.js';
import { genArea } from './area.js';

export const BASE = [
  skill('l3pv', 'Numbers', '4.NBT.1–2', 'Place value to millions', 'Read, write, compare, expanded form', genPV, {
    big: 'A digit is worth more or less depending on where it sits. Each place is worth 10 times the place on its right, which is why 7 can mean 7, 70 or 7,000,000.',
    tips: ['Commas split a number into groups of three digits. Read one group at a time and say the group name: million, thousand.', 'Expanded form writes what each digit is really worth: 4,205 = 4,000 + 200 + 5.',
      'A place with nothing in it still needs a 0 to hold the other digits in position.', 'To compare, count the digits first. If they match, compare from the left.'],
    words: [['digit', 'one of the symbols 0 to 9'], ['place value', 'what a digit is worth because of where it sits'], ['expanded form', 'a number written as the sum of what each digit is worth'], ['standard form', 'the usual way to write a number, like 4,205']] }),
  skill('l3round', 'Numbers', '4.NBT.3', 'Rounding big numbers', 'To any place, up to millions', genRound, {
    big: 'Rounding swaps a number for the nearest “round” one, so it is easier to think with. The halfway mark decides which way it goes.',
    tips: ['Find the two round numbers it sits between, and the halfway mark.', 'The digit just to the right of the rounding place tells you which half you are in: 5 or more goes up, 4 or less stays.',
      'Everything to the right of the rounding place becomes 0.', 'A quick estimate with rounded numbers tells you whether an exact answer makes sense.'],
    words: [['round', 'replace a number with the nearest simpler one'], ['estimate', 'a quick answer that is close enough'], ['halfway mark', 'the number in the middle of two round numbers']] }),
  skill('l3addsub', 'Adding and subtracting', '4.NBT.4', 'Add and subtract big numbers', 'Multi-digit, with regrouping', genAddSub, {
    big: 'Big numbers add and subtract one place at a time: ones with ones, tens with tens. Ten of any place can be traded for one of the next place up.',
    tips: ['Line the numbers up so the same places sit in the same column.', 'Adding: when a column makes 10 or more, carry 1 to the next column.', 'Subtracting: when the top digit is too small, trade 1 from the next place for 10 here.',
      'Subtraction can also be done by counting up from the smaller number.', 'Estimate first, so you can spot an answer that is far off.'],
    words: [['sum', 'the answer to adding'], ['difference', 'the answer to subtracting'], ['regroup', 'trade 10 of one place for 1 of the next, or the other way round']] }),
  skill('l3factors', 'Multiplying and dividing', '4.OA.4', 'Factors and multiples', 'Factor pairs, skip-counting', genFactors, {
    big: 'Factors are the numbers that multiply to make a number. Multiples are what you get when you count by it. They are two views of the same multiplication fact.',
    tips: ['3 × 4 = 12, so 3 and 4 are factors of 12, and 12 is a multiple of both.', 'Factors come in pairs. Each pair is a rectangle you can build from that many tiles.', 'To find every pair, try 1, 2, 3, … in order and stop when the pairs start to repeat.',
      'A factor always divides with nothing left over.'],
    words: [['factor', 'a number that divides another with nothing left over'], ['multiple', 'a number you land on when you count by another number'], ['factor pair', 'two numbers that multiply to make the number']] }),
  skill('l3prime', 'Multiplying and dividing', '4.OA.4', 'Prime and composite', 'Numbers up to 100', genPrime, {
    big: 'A prime number has exactly two factors: 1 and itself. A composite number has more. With tiles, a prime can only make one long row, while a composite can make a real rectangle.',
    tips: ['To test a number up to 100, try dividing by 2, 3, 5 and 7. If none of them works, it is prime.', 'Even numbers bigger than 2 are never prime. Numbers ending in 0 or 5 (bigger than 5) are never prime.',
      'If the digits add up to a multiple of 3, the number has 3 as a factor.', '1 is neither prime nor composite, because it has only one factor.'],
    words: [['prime', 'exactly two factors: 1 and itself'], ['composite', 'more than two factors']] }),
  skill('l3mul1', 'Multiplying and dividing', '4.NBT.5', 'Multiply by one digit', 'Up to 4 digits × 1 digit', genMul1, {
    big: 'To multiply a big number, break it into its place-value parts, multiply each part, and add the results. Nothing new is needed beyond the times tables.',
    tips: ['6 × 40 is 6 × 4 tens = 24 tens = 240. The times table does the work and the place puts the zeros back.', 'An area model shows every part in its own box.',
      'The short written method does the same thing. A carried digit is the tens of one part moving up a place.', 'Round the big number to check your answer is the right size.'],
    words: [['product', 'the answer to multiplying'], ['partial product', 'one part of the answer, from one place value'], ['area model', 'a rectangle split into boxes, one for each part']] }),
  skill('l3mul2', 'Multiplying and dividing', '4.NBT.5', 'Multiply two-digit numbers', 'Area model, then partial products', genMul2, {
    big: 'A two-digit times a two-digit number is four small multiplications: each part of one number meets each part of the other.',
    tips: ['Split both numbers into tens and ones. The area model has four boxes.', 'Tens × tens gives hundreds: 30 × 20 = 600.', 'Partial products are the same four boxes written in a stack and added.',
      'A common slip is doing only two of the four boxes. Check that every part met every part.'],
    words: [['partial product', 'one box of the area model'], ['area model', 'a rectangle split into boxes, one for each part']] }),
  skill('l3div', 'Multiplying and dividing', '4.NBT.6', 'Divide by one digit', 'Partial quotients, long division, remainders', genDiv, {
    big: 'Dividing asks how many equal groups fit. You can take the groups out in easy chunks, and the standard layout is the same idea done one place at a time.',
    tips: ['Partial quotients: take away 100 groups, 10 groups, a few groups, and add up how many you took.', 'Standard layout: divide, multiply, subtract, bring down the next digit.',
      'A remainder is what is left when no more full groups fit. It is always smaller than the number you divide by.', 'Check: answer × divisor + remainder gives back the number you started with.',
      'In a story, read the question again to decide what the remainder means.'],
    words: [['dividend', 'the number being divided'], ['divisor', 'the number you divide by'], ['quotient', 'the answer to dividing'], ['remainder', 'what is left over, written R']] }),
  skill('l3equiv', 'Fractions and decimals', '4.NF.1', 'Equivalent fractions', 'Same amount, different pieces', genEquiv, {
    big: `Cut every piece of a fraction into smaller equal pieces and the amount does not change. There are more pieces, and each is smaller: ${F(1, 2)} = ${F(2, 4)} = ${F(4, 8)}.`,
    tips: ['Multiply the top and the bottom by the same number to get an equal fraction.', 'That works because it is the same as multiplying by 1.', 'Dividing the top and bottom by the same number works too.',
      'Adding the same number to the top and bottom does NOT keep the fraction equal.'],
    words: [['numerator', 'the top number: how many pieces'], ['denominator', 'the bottom number: how many equal pieces make one whole'], ['equivalent', 'worth the same amount']] }),
  skill('l3simplify', 'Fractions and decimals', '4.NF.1', 'Simplest form', 'Fewer, bigger pieces', genSimplify, {
    big: 'Simplifying joins small pieces into bigger ones without changing the amount. A fraction is in simplest form when the top and bottom share no factor except 1.',
    tips: ['Find a number that divides both the top and the bottom, and divide both by it.', 'Keep going until nothing bigger than 1 divides both.', 'Dividing by the biggest shared factor gets there in one step.',
      `A fraction that is not simplified is still correct. ${F(2, 4)} and ${F(1, 2)} are the same amount.`],
    words: [['simplest form', 'top and bottom share no factor except 1'], ['common factor', 'a number that divides both']] }),
  skill('l3compare', 'Fractions and decimals', '4.NF.2', 'Compare fractions', 'Benchmarks and common denominators', genCompare, {
    big: 'Fractions can only be compared fairly when the pieces are the same size, or when you can measure both against something you know, like one half.',
    tips: ['Same bottom: more pieces is more.', 'Same top: the smaller bottom means bigger pieces, so that fraction is bigger.', `Is each one more or less than ${F(1, 2)}? Sometimes that settles it.`,
      'Otherwise rename both with a common denominator, then compare the tops.', 'The fractions must be parts of the same whole.'],
    words: [['benchmark', `a fraction you know well, like ${F(1, 2)}, to compare against`], ['common denominator', 'a bottom number both fractions can be renamed to']] }),
  skill('l3fadd', 'Fractions and decimals', '4.NF.3', 'Add and subtract fractions', 'Same denominator, mixed numbers', genFadd, {
    big: 'When the bottoms match, the pieces are the same size, so you just count pieces. Three eighths plus two eighths is five eighths, the same way 3 apples plus 2 apples is 5 apples.',
    tips: ['Add or subtract the tops. The bottom stays the same, because the piece size has not changed.', `One whole is any fraction with the same top and bottom: 1 = ${F(8, 8)}.`,
      'With mixed numbers, work with the wholes and the fractions separately.', 'If the fraction you are taking away is too big, trade one whole for pieces first.'],
    words: [['like denominators', 'the same bottom number'], ['mixed number', `a whole number and a fraction together, like ${M(2, 1, 4)}`]] }),
  skill('l3mixed', 'Fractions and decimals', '4.NF.3', 'Mixed numbers', 'Improper fractions and back', genMixed, {
    big: `A fraction with a top bigger than its bottom is more than one whole. ${F(7, 4)} and ${M(1, 3, 4)} are two ways to write the same amount.`,
    tips: ['Fraction to mixed number: divide the top by the bottom. The answer is the wholes and the remainder is the pieces left.', 'Mixed number to fraction: wholes × bottom, then add the top.',
      'The bottom number never changes, because the piece size is the same.'],
    words: [['improper fraction', 'a fraction whose top is as big as its bottom, or bigger'], ['mixed number', 'a whole number and a fraction together']] }),
  skill('l3fmul', 'Fractions and decimals', '4.NF.4', 'Fraction times a whole number', 'Repeated adding of pieces', genFmul, {
    big: `Multiplying a fraction by a whole number is repeated adding. 3 × ${F(2, 5)} is ${F(2, 5)} + ${F(2, 5)} + ${F(2, 5)}, which is 6 pieces of the same size: ${F(6, 5)}.`,
    tips: ['Multiply the top by the whole number. The bottom stays the same.', `Every fraction is a count of unit pieces: ${F(3, 4)} = 3 × ${F(1, 4)}.`, 'If the answer is more than one whole, you can write it as a mixed number.'],
    words: [['unit fraction', `a fraction with 1 on top, like ${F(1, 5)}`], ['product', 'the answer to multiplying']] }),
  skill('l3dec', 'Fractions and decimals', '4.NF.5–7', 'Tenths and hundredths', 'Fractions, decimals, comparing', genDec, {
    big: `A decimal is another way to write a fraction with 10 or 100 on the bottom. 0.3 is ${F(3, 10)} and 0.37 is ${F(37, 100)}.`,
    tips: ['The first place after the point is tenths. The second is hundredths.', `One tenth is the same as ten hundredths: 0.4 = 0.40 = ${F(40, 100)}.`,
      'To compare, give both numbers two places after the point. A longer decimal is not always bigger: 0.5 is more than 0.45.', 'Money helps: 0.50 is like 50 cents and 0.05 is like 5 cents.'],
    words: [['tenth', 'one of 10 equal parts of a whole, 0.1'], ['hundredth', 'one of 100 equal parts of a whole, 0.01'], ['decimal point', 'the dot between the ones and the tenths']] }),
  skill('l3angles', 'Shapes and space', '4.MD.5–7', 'Angles', 'Types, turns, missing angles', genAngles, {
    big: 'An angle measures a turn. A full turn is 360 degrees, so a quarter turn (a square corner) is 90 and a half turn (a straight line) is 180.',
    tips: ['Acute is less than 90°. Right is exactly 90°. Obtuse is between 90° and 180°. Straight is 180°.', 'Angles that sit side by side add up to the angle they make together.',
      'To find a missing part, subtract the parts you know from the whole.', 'The length of the lines does not matter. Only the amount of turn does.'],
    words: [['degree', 'the unit for measuring a turn, written °'], ['right angle', 'a square corner, 90°'], ['acute', 'less than 90°'], ['obtuse', 'more than 90° and less than 180°']] }),
  skill('l3area', 'Measurement', '4.MD.3', 'Area and perimeter', 'Rectangles and missing sides', genArea, {
    big: 'Perimeter is the distance around a shape. Area is the space inside it, counted in unit squares. For a rectangle, the squares sit in equal rows, so area is length × width.',
    tips: ['Perimeter: add all four sides, or double (length + width).', 'Area: rows × squares in each row.', 'Missing side from the area: divide the area by the side you know.',
      'Missing side from the perimeter: halve the perimeter, then take away the side you know.', 'Edges, fences and frames are perimeter. Floors, paint and tiles are area.'],
    words: [['perimeter', 'the distance all the way round'], ['area', 'the space inside, in square units'], ['square unit', 'a square that is 1 unit on each side']] }),
];
