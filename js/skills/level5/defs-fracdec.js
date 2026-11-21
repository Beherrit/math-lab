// Fractions and decimals: decimal arithmetic and dividing fractions.
// The three names for one number (fractions, decimals, percents) sit with percents, after percent is taught.
import { skillIn } from './skill.js';
import { genDecOps } from './decimals.js';
import { genFracDiv } from './fracdiv.js';

const skill = skillIn('Fractions and decimals');

export const SKILLS = [
  skill('l5decops', '6.NS.2–3', 'Decimals in real life', 'Add, subtract, multiply, divide', genDecOps, 'Decimal arithmetic follows the same place-value rules as whole numbers. Lining up the places is what keeps it right.',
    ['Adding and subtracting: line up the decimal points.', 'Multiplying: multiply as whole numbers, then put back as many decimal places as the problem had.', 'Dividing by a decimal: multiply both numbers by 10 or 100 until the divisor is whole.', 'Money check: working in cents turns decimals into whole numbers.'],
    [['decimal places', 'digits after the point'], ['divisor', 'the number you divide by'], ['change', 'money you get back']]),
  skill('l5fracdiv', '6.NS.1', 'Divide fractions', 'How many fit, and why we flip', genFracDiv, 'Dividing by a fraction asks “how many of these pieces fit?” That is why the answer can be bigger than the number you started with.',
    ['Give both fractions the same bottom number. Then just divide the tops.', 'Or multiply by the divisor turned upside down. It works because cutting into smaller pieces makes more of them.', 'Change mixed numbers into fractions first.', 'Check: your answer times the divisor should give the first number back.'],
    [['divisor', 'the number you divide by'], ['reciprocal', 'a fraction turned upside down'], ['quotient', 'the answer to a division']]),
];
