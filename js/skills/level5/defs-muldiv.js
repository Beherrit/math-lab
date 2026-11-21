// Multiplying and dividing: whole-number division, factors and powers.
import { skillIn } from './skill.js';
import { genLongDiv } from './longdiv.js';
import { genExp } from './exponents.js';
import { genGcf } from './factors.js';

const skill = skillIn('Multiplying and dividing');

export const SKILLS = [
  skill('l5longdiv', '6.NS.2', 'Dividing big numbers', 'The standard method, estimate first', genLongDiv, 'Long division shares a big number into equal groups one digit at a time. Estimate first so you know about how big the answer should be.',
    ['Estimate with friendly numbers first: 4,812 ÷ 62 is close to 4,800 ÷ 60 = 80.', 'Find the first digits that are at least as big as the divisor. The answer starts above the last of them.', 'Each time: divide, multiply, subtract, then bring down the next digit.', 'If a digit cannot be divided yet, write 0 in the answer and bring down the next digit.', 'Check by multiplying the answer by the divisor and adding the left over.'],
    [['dividend', 'the number being divided'], ['divisor', 'the number you divide by'], ['quotient', 'the answer to a division'], ['remainder', 'what is left over']]),
  skill('l5gcf', '6.NS.4', 'Factors and multiples', 'Greatest common factor, least common multiple', genGcf, 'Factors divide a number exactly. Multiples are what you get when you count by it. Two numbers can share both.',
    ['Greatest common factor: the biggest number that divides both.', 'Least common multiple: the first number that both count up to.', 'Splitting into equal groups with nothing left over is a factor question. Things that repeat and line up again is a multiple question.', 'A common factor can be pulled out of a sum: 12 + 18 = 6(2 + 3).'],
    [['factor', 'a number that divides another exactly'], ['multiple', 'a number in the times table of another'], ['common', 'shared by both']]),
  skill('l5exp', '6.EE.1', 'Exponents', 'Powers and the order of operations', genExp, 'An exponent is a short way to write the same number multiplied again and again: 2⁴ means 2 × 2 × 2 × 2.',
    ['The big number is the base. The small raised number says how many times to multiply it.', '3² is 3 × 3 = 9, not 3 × 2.', 'Order: brackets, then exponents, then × and ÷, then + and −.', 'Squared comes from the area of a square. Cubed comes from the volume of a cube.'],
    [['base', 'the number being multiplied'], ['exponent', 'how many times it is multiplied'], ['power', 'a number written with an exponent']]),
];
