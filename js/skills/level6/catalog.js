// Level 6: the original twenty skills (their text and generators). index.js orders them with the newer ones and gives each a strand.
import { genIntAdd, genIntSub, addWord, subWord } from './integers-addsub.js';
import { genIntMul, mulWord } from './integers-muldiv.js';
import { genRat, ratWord } from './rationals.js';
import { genProp } from './proportional.js';
import { genSolveProp, propWord } from './proportions.js';
import { genPct, finalPrice } from './percents.js';
import { genPctChg, genInterest, interestWord } from './percent-change.js';
import { genExpr } from './expressions.js';
import { genEq2, eqWord } from './equations.js';
import { genIneq, ineqWord } from './inequalities.js';
import { genScale, scaleWord } from './scale.js';
import { genCircle, circleWord } from './circles.js';
import { genAngles } from './angles.js';
import { genSolid, tankWord, wrapWord } from './solids.js';
import { genProb, probWord } from './probability.js';
import { genCompound, countWord } from './compound.js';
import { genData, sampleWord, meanWord } from './data.js';
import { skill } from './skill.js';

export const CORE = [
  skill('l6intadd', '7.NS.1', 'Adding integers', 'Number line moves and zero pairs', genIntAdd, {
    big: 'Adding a positive number moves you right on the number line. Adding a negative number moves you left. A +1 and a −1 together make zero.',
    tips: ['Same signs: add the sizes and keep the sign.', 'Different signs: the smaller pile cancels part of the bigger pile. The bigger pile decides the sign.', 'Check by picturing where you start and which way you move.'],
    words: [['integer', 'a whole number, its opposite, or zero: … −2, −1, 0, 1, 2 …'], ['zero pair', 'a +1 and a −1, which cancel to 0'], ['opposite', 'the same distance from zero on the other side, like 5 and −5']],
    card: { title: 'Why the chips work', why: 'A plus chip and a minus chip are a zero pair, so they cancel, and the chips left over are the sum.' } }),
  skill('l6intsub', '7.NS.1c', 'Subtracting integers', 'Add the opposite', genIntSub, {
    big: 'Subtracting a number does exactly the same as adding its opposite. Taking away a debt makes you better off.',
    tips: ['Rewrite first: 3 − 7 is 3 + (−7), and 3 − (−7) is 3 + 7.', 'Only the second number flips. The first number stays as it is.', 'The gap between two numbers is the higher one minus the lower one.'],
    words: [['opposite', '−4 is the opposite of 4, and 4 is the opposite of −4'], ['difference', 'the answer to a subtraction']] }),
  skill('l6intmul', '7.NS.2', 'Multiplying and dividing integers', 'Sign rules and where they come from', genIntMul, {
    big: 'Three groups of −4 is −12, so positive × negative is negative. Follow the pattern down past zero and negative × negative has to be positive.',
    tips: ['Work out the size first, as if both numbers were positive.', 'Same signs give a positive answer. Different signs give a negative answer.', 'Division uses the same rule, because it undoes multiplication.', 'With several factors, each negative flips the sign once.'],
    words: [['product', 'the answer to multiplying'], ['quotient', 'the answer to dividing'], ['factor', 'a number being multiplied']] }),
  skill('l6rat', '7.NS.1–3', 'Negative fractions and decimals', 'All four operations', genRat, {
    big: 'Fractions and decimals can be negative too. Every sign rule you know for integers works in exactly the same way.',
    tips: ['Decide the sign first, then work with the sizes.', 'Decimals: think in tenths or hundredths and they behave like whole numbers.', 'Fractions: adding needs same-size pieces. Multiplying is tops times tops and bottoms times bottoms.', 'Dividing by a fraction is multiplying by its flip.'],
    words: [['rational number', 'any number that can be written as a fraction, such as −0.5 or 3/4'], ['reciprocal', 'the flip of a fraction: 2/3 becomes 3/2']] }),
  skill('l6prop', '7.RP.2', 'Proportional relationships', 'The constant in tables, graphs and equations', genProp, {
    big: 'Two amounts are proportional when one is always the same number times the other. That number is the constant of proportionality.',
    tips: ['In a table, y ÷ x gives the same answer in every column.', 'On a graph, it is a straight line that goes through (0, 0).', 'As an equation it looks like y = kx. The k is the constant.', 'The constant is also the unit rate: the amount of y for 1 of x.'],
    words: [['proportional', 'always in the same ratio'], ['constant of proportionality', 'the number you multiply x by to get y'], ['unit rate', 'how much for one']] }),
  skill('l6solveprop', '7.RP.2–3', 'Solving proportions', 'Scale factor, unit rate, cross products', genSolveProp, {
    big: 'A proportion says two ratios are equal. If you know three of the four numbers, the fourth is fixed.',
    tips: ['Look for a scale factor: what was one number multiplied by to get its partner?', 'Or find the amount for 1 and build up.', 'Cross products work because multiplying both sides by both bottoms clears the fractions.', 'Keep the same kind of thing on top in both fractions.'],
    words: [['proportion', 'two equal ratios, like 2/3 = 8/12'], ['scale factor', 'the number that both parts of a ratio are multiplied by']] }),
  skill('l6pct', '7.RP.3', 'Tax, tip, discount, markup', 'Percents of prices', genPct, {
    big: 'The price you start with is 100%. Tax, tips and markups add a percent of it on top. A discount takes a percent of it away.',
    tips: ['Build percents from easy pieces: 10% is one tenth, 5% is half of that, 1% is one hundredth.', 'Or multiply by the decimal: 8% is 0.08.', 'One step: adding 8% is the same as multiplying by 1.08. Taking off 20% is multiplying by 0.80.', 'A percent is always a percent OF something. Check which price it belongs to.'],
    words: [['discount', 'money taken off a price'], ['markup', 'money a shop adds to what it paid'], ['sales tax', 'a percent added to the price when you pay'], ['tip', 'extra money given for service']] }),
  skill('l6pctchg', '7.RP.3', 'Percent increase and decrease', 'How big is the change?', genPctChg, {
    big: 'A percent change compares the size of the change with where things started. The starting amount is always the 100%.',
    tips: ['Find the change first: new minus old.', 'Divide the change by the STARTING amount, then write it as a percent.', 'Up 20% and then down 20% does not get you back to the start, because the second percent is of a different amount.', 'Percent error works the same way: the error compared with the real value.'],
    words: [['percent increase', 'how much something grew, as a percent of the start'], ['percent decrease', 'how much something shrank, as a percent of the start'], ['percent error', 'how far off an estimate is, as a percent of the real value']] }),
  skill('l6interest', '7.RP.3', 'Simple interest', 'Interest = start × rate × years', genInterest, {
    big: 'Simple interest is a percent of the starting amount, paid once for every year. The same amount is added each year.',
    tips: ['Find one year of interest first: the rate (as a percent) of the starting amount.', 'Multiply by the number of years.', 'Months are parts of a year: 6 months is 0.5 of a year.', 'The total at the end is the starting amount plus the interest.'],
    words: [['principal', 'the starting amount of money'], ['rate', 'the percent paid each year'], ['interest', 'money paid for saving or for borrowing']] }),
  skill('l6expr', '7.EE.1', 'Expand, factor, combine', 'Linear expressions with negatives', genExpr, {
    big: 'You can rewrite an expression in a different form without changing its value. Like terms can be combined, and a number outside brackets multiplies everything inside.',
    tips: ['Like terms: x terms go with x terms, plain numbers with plain numbers. Each term keeps the sign in front of it.', 'Expanding: multiply the outside number by EVERY term inside.', 'Factoring is expanding backwards: take out the biggest number that divides every term.', 'Check by trying a number for x in both forms.'],
    words: [['term', 'one piece of an expression, like 3x or −5'], ['coefficient', 'the number multiplied by x'], ['expand', 'multiply out the brackets'], ['factor', 'write as a number times a bracket']] }),
  skill('l6eq2', '7.EE.4a', 'Two-step equations', 'Balance model, then undoing', genEq2, {
    big: 'An equation is a balance: both sides are worth the same. Whatever you do to one side, do to the other, and it stays balanced.',
    tips: ['Undo things in reverse order: the adding or subtracting first, then the multiplying or dividing.', 'With brackets like 3(x + 2) = 18 you can divide by 3 first.', 'Always check by putting your answer back in.'],
    words: [['equation', 'a statement that two things are equal'], ['solve', 'find the value that makes it true'], ['inverse operation', 'the operation that undoes another one']] }),
  skill('l6ineq', '7.EE.4b', 'Two-step inequalities', 'Solve, graph, and when to flip', genIneq, {
    big: 'An inequality has many solutions: every number on one side of a boundary. You solve it like an equation, with one extra rule for negatives.',
    tips: ['Add, subtract, multiply or divide both sides, just as with equations.', 'Multiplying or dividing both sides by a NEGATIVE flips the sign, because negatives reverse the order of numbers.', 'On a graph, an open circle means the boundary is not included. A filled circle means it is.', 'Test a number from your answer to be sure.'],
    words: [['inequality', 'a statement with <, >, ≤ or ≥'], ['solution', 'any number that makes it true'], ['≤ and ≥', 'less than or equal to, greater than or equal to']] }),
  skill('l6scale', '7.G.1', 'Scale drawings', 'Scales and scale factor', genScale, {
    big: 'A scale drawing has the same shape as the real thing. Every length is multiplied by the same number.',
    tips: ['Drawing to real life: multiply by the scale. Real life to drawing: divide.', 'The scale factor is a new length divided by the matching old length.', 'Areas grow faster than lengths: the scale counts twice, once for each direction.'],
    words: [['scale', 'what one unit on the drawing stands for'], ['scale factor', 'the number every length is multiplied by']] }),
  skill('l6circle', '7.G.4', 'Circles', 'Circumference and area', genCircle, {
    big: 'For every circle, the distance around is π times the distance across. π is a little more than 3.',
    tips: ['Diameter = 2 × radius.', 'Circumference = π × diameter.', 'Area = π × radius × radius.', 'Read the question: it tells you to use 3.14 or to leave π in your answer.'],
    words: [['radius', 'centre to edge'], ['diameter', 'edge to edge through the centre'], ['circumference', 'the distance around a circle'], ['π (pi)', 'circumference ÷ diameter, about 3.14']] }),
  skill('l6angles', '7.G.5', 'Angle relationships', 'Complementary, supplementary, vertical, triangles', genAngles, {
    big: 'Angles that fit together make known totals: 90° in a right angle, 180° on a straight line or in a triangle, 360° around a point.',
    tips: ['Find the total that fits the picture, then subtract what you know.', 'Vertical angles (opposite each other where lines cross) are equal.', 'When an angle is written with x, write an equation using the total.'],
    words: [['complementary', 'two angles that add to 90°'], ['supplementary', 'two angles that add to 180°'], ['vertical angles', 'opposite angles where two lines cross'], ['adjacent', 'next to each other, sharing a side']] }),
  skill('l6solids', '7.G.6', 'Area, surface area, volume', 'Composite shapes and prisms', genSolid, {
    big: 'Hard shapes are made of easy ones. Cut them into rectangles and triangles, work out each piece, then put the answers together.',
    tips: ['Composite area: split it up and add, or fill it in and subtract.', 'Surface area: add the areas of all the faces.', 'Volume of a prism: area of the end face × the length.', 'Area is in square units, volume in cubic units.'],
    words: [['composite shape', 'a shape made from simpler shapes'], ['surface area', 'the total area of all the outside faces'], ['prism', 'a solid with the same shape all the way through']] }),
  skill('l6prob', '7.SP.5–7', 'Probability', 'Chance of a single event', genProb, {
    big: 'Probability is a number from 0 (impossible) to 1 (certain). When outcomes are equally likely, it is the outcomes you want out of all the outcomes.',
    tips: ['Count what you want. Count everything. Write the fraction.', 'P(not A) = 1 − P(A).', 'To predict, multiply the probability by the number of tries.', 'Results from an experiment give an experimental probability. More tries usually bring it closer to the theoretical one.'],
    words: [['outcome', 'one possible result'], ['event', 'the outcome or outcomes you are interested in'], ['experimental probability', 'based on what actually happened']] }),
  skill('l6compound', '7.SP.8', 'Compound events', 'Tables, trees and counting', genCompound, {
    big: 'When two things happen together, list every pair of outcomes in a table or a tree. Then count the pairs you want.',
    tips: ['The number of pairs is the number of first outcomes × the number of second outcomes.', 'Order matters: (1, 2) and (2, 1) are different outcomes.', 'When the two things do not affect each other, you can also multiply their probabilities.'],
    words: [['compound event', 'two or more things happening together'], ['sample space', 'the list of every possible outcome'], ['tree diagram', 'branches showing each choice in turn']] }),
  skill('l6data', '7.SP.1–4', 'Comparing data', 'Mean, median, spread and samples', genData, {
    big: 'To compare two groups, compare their centres (mean or median) and their spread. A random sample lets you say something about a whole group.',
    tips: ['Mean: add everything, divide by how many.', 'Median: the middle value when the data is in order.', 'Range and mean absolute deviation both measure spread.', 'A fair sample gives everyone the same chance of being picked.'],
    words: [['mean', 'the equal-share average'], ['median', 'the middle value'], ['mean absolute deviation', 'the average distance from the mean'], ['random sample', 'a small group picked by chance from the whole group']] }),
];
