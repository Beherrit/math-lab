// Algebra: expressions, equations, inequalities and two variables.
import { skillIn } from './skill.js';
import { genSolution } from './solution.js';
import { genTwoVar } from './twovar.js';
import { genExprParts } from './exprparts.js';
import { genEq } from './equations.js';
import { genEquiv } from './equivalent.js';
import { genExpr } from './expressions.js';
import { genIneq } from './inequalities.js';

const skill = skillIn('Algebra');

export const SKILLS = [
  skill('l5exprparts', '6.EE.2b', 'Parts of an expression', 'Sum, product, factor, term, coefficient', genExprParts, 'Every expression has parts with names. Naming them tells you how to read it, and a group in brackets can be treated as one number.',
    ['A sum adds, a difference subtracts, a product multiplies and a quotient divides. The step done last names the expression.', 'Factors are the things multiplied together. In 2(8 + 7) there are two factors: 2 and (8 + 7).', 'Terms are the pieces joined by + or −. A coefficient is the number that multiplies a letter.', 'Brackets hold one piece: work them out first, or count them as a single thing.'],
    [['sum', 'the answer to adding, or an expression that adds'], ['product', 'the answer to multiplying, or an expression that multiplies'], ['factor', 'a number or group that is multiplied'], ['term', 'a piece of an expression joined by + or −'], ['coefficient', 'the number multiplying a letter'], ['quotient', 'the answer to dividing']]),
  skill('l5expr', '6.EE.2, 6', 'Expressions', 'Write them and find their value', genExpr, 'A letter can stand for a number you do not know yet, or one that changes. An expression is a rule written with letters and numbers.',
    ['A number next to a letter means multiply: 3x is 3 × x.', 'To find the value, swap the letter for its number and work it out.', '“5 less than n” is n − 5. The amount taken away comes second.', 'The part with “each” or “every” gets multiplied by the letter. The fixed part is added once.'],
    [['variable', 'a letter that stands for a number'], ['coefficient', 'the number multiplying a letter'], ['term', 'a piece of an expression, joined by + or −'], ['constant', 'a term with no letter']]),
  skill('l5equiv', '6.EE.3–4', 'Equivalent expressions', 'Distribute and combine like terms', genEquiv, 'Two expressions are equivalent when they give the same value whatever number the letter stands for.',
    ['Distributive property: the number in front multiplies every term in the brackets. 3(x + 4) = 3x + 12.', 'Like terms have the same letter part. You can add them: 2x + 5x = 7x.', 'Unlike terms stay apart: 3x + 4 cannot be squeezed into one term.', 'Not sure? Test both expressions with the same number.'],
    [['like terms', 'terms with the same letter part'], ['distribute', 'multiply each term in the brackets'], ['factor out', 'pull a common factor in front of brackets']]),
  skill('l5eq', '6.EE.5–7', 'One-step equations', 'Keep the balance', genEq, 'An equation says two things are equal, like a balanced scale. Solving it means finding the number that keeps it balanced.',
    ['Whatever you do to one side, do the same to the other side.', 'Undo what was done to the letter: undo + with −, undo × with ÷.', 'Check by putting your answer back into the equation.', 'In a story, call the unknown x and write what happened to it.'],
    [['equation', 'two expressions joined by ='], ['solution', 'the value that makes it true'], ['inverse operation', 'the operation that undoes another']]),
  skill('l5solution', '6.EE.5', 'Is this number a solution?', 'Trying a number in an equation or inequality', genSolution, 'A solution is a number that makes an equation or inequality true. To test one, put it in for the letter and see whether the statement holds.',
    ['Swap the letter for the number and work out both sides. If they are equal, the number solves the equation.', 'For an inequality, work out the left side and check it against the sign. With ≥ and ≤, equal counts.', 'An equation usually has one solution. An inequality has many.', 'Wrong answers often come from using the wrong operation: check by putting the number back in.'],
    [['solution', 'a number that makes the statement true'], ['substitute', 'put a number in for the letter'], ['inequality', 'a statement with &lt;, &gt;, ≤ or ≥']]),
  skill('l5ineq', '6.EE.8', 'Inequalities', 'More than one answer', genIneq, 'An inequality describes a whole range of numbers that work, like “you must be at least 12”. On a number line that range is a ray.',
    ['x &gt; 3 means every number greater than 3. There are endlessly many.', 'Open circle: the end number is not included (&lt; or &gt;). Filled circle: it is included (≤ or ≥).', 'The arrow points to all the numbers that work.', '“At least” means ≥. “At most” means ≤.'],
    [['inequality', 'a statement with &lt;, &gt;, ≤ or ≥'], ['solution', 'any number that makes it true'], ['at least', 'that number or more']]),
  skill('l5twovar', '6.EE.9', 'Two things that change together', 'Variables, tables, graphs and equations', genTwoVar, 'Sometimes one quantity depends on another, like distance on time. The one you choose is the independent variable. The one that follows is the dependent variable, and an equation like d = 65t links them.',
    ['Say it as “this depends on that”. What depends is the dependent variable, and what you pick is the independent one.', 'In a table, divide a row to find the rate. The equation is the dependent letter equal to the rate times the independent letter.', 'A fixed starting amount shows up as the first row, when the independent letter is 0.', 'On a graph, the dots for a steady rate sit on a straight line.'],
    [['independent variable', 'the quantity you choose or that changes on its own'], ['dependent variable', 'the quantity that depends on the other one'], ['equation', 'a rule like d = 65t'], ['rate', 'how much the dependent one changes for each 1']]),
];
