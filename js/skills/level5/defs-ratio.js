// Ratios and percents: ratios, rates, conversions, graphs of ratios and percents.
import { skillIn } from './skill.js';
import { genEqRatio, genRatio } from './ratios.js';
import { genPct, genPctWhole } from './percents.js';
import { genRate } from './rates.js';
import { genUnitConv } from './unitconv.js';
import { genRatioGraph } from './ratiograph.js';
import { genWhatPct } from './whatpct.js';
import { genCross, genSwap } from './methods.js';

const skill = skillIn('Ratios and percents');

export const SKILLS = [
  skill('l5ratio', '6.RP.1', 'Ratios', 'Comparing two amounts', genRatio, 'A ratio compares two amounts by saying how much of one there is for a certain amount of the other.',
    ['3:5 is read “3 to 5”. The order of the numbers follows the order of the words.', 'A ratio can compare part to part (cats to dogs) or part to whole (cats to all the animals).', 'Simplify a ratio like a fraction: divide both numbers by the same number.', 'A tape diagram draws each part as a row of equal boxes.'],
    [['ratio', 'a comparison of two amounts, like 3:5'], ['part to whole', 'one group compared with everything'], ['simplest form', 'no number divides both parts any more']]),
  skill('l5eqratio', '6.RP.3a', 'Equivalent ratios', 'Ratio tables and tape diagrams', genEqRatio, 'Equivalent ratios describe the same mix in a bigger or smaller batch. You get them by multiplying or dividing both numbers by the same number.',
    ['Multiply (or divide) BOTH parts by the same number.', 'Adding the same number to both parts changes the mix, so it does not work.', 'A ratio table lists batches: every row is the first row times something.', 'On a grid, equivalent ratios make a straight line through (0, 0).'],
    [['equivalent ratios', 'ratios that describe the same mix, like 2:3 and 4:6'], ['ratio table', 'a table of matching amounts'], ['tape diagram', 'bars made of equal boxes']]),
  skill('l5rate', '6.RP.2, 3b', 'Unit rates', 'Per one, and best buys', genRate, 'A unit rate tells how much for just ONE: one hour, one item, one kilogram. Once you know it, you can find any amount.',
    ['“Per” means “for each one”. Divide the total by the number of units.', 'To compare two deals, find the price of one in each.', 'Or compare the same amount: what would 12 cost in each pack?', 'A bigger pack is not always the better buy. Check.'],
    [['rate', 'a ratio of two different kinds of things, like km and hours'], ['unit rate', 'the amount for 1'], ['per', 'for each']]),
  skill('l5unitconv', '6.RP.3d', 'Converting units', 'Ratio tables for lengths, times and prices', genUnitConv, 'A conversion rate is a ratio, like 1 meter to 100 centimeters. Multiply both parts by the same number and you can change any amount from one unit to another.',
    ['Going to a smaller unit gives a bigger number, so multiply. Going to a bigger unit gives a smaller number, so divide.', 'A ratio table or a double number line keeps the two units side by side.', 'Speeds and prices are rates too: change the unit you are counting in, and keep the other part.', 'Some conversions take two jumps, like hours to minutes to seconds.'],
    [['conversion rate', 'how many of one unit make one of another'], ['unit', 'what we count in: meters, minutes, grams'], ['double number line', 'two number lines that match up tick by tick']]),
  skill('l5ratiograph', '6.RP.3a', 'Graphing ratios', 'Equivalent ratios as points on a line', genRatioGraph, 'Every pair in a ratio table is a point on the grid. Equivalent ratios make points that all sit on one straight line through (0, 0).',
    ['The first number of a pair is x (across) and the second is y (up).', 'More batches means both numbers grow together, so the points climb in a straight line.', 'To read a value, find it on one axis, go to the line, then to the other axis.', 'A steeper line means more y for each 1 of x.'],
    [['ratio table', 'a table of matching amounts'], ['equivalent ratios', 'ratios that describe the same mix'], ['unit rate', 'the amount of y for 1 of x'], ['origin', 'the point (0, 0)']]),
  skill('l5pct', '6.RP.3c', 'Percent of a number', 'Percent means per 100', genPct, 'Percent means “for every 100”. 30% of something is 30 out of every 100 parts of it.',
    ['10% is one tenth: divide by 10. 5% is half of that. 1% is divide by 100.', 'Build other percents from those chunks: 35% = 10% + 10% + 10% + 5%.', 'Or change the percent to a decimal and multiply: 35% of 80 = 0.35 × 80.', '50% is half, 25% is a quarter, 100% is all of it.'],
    [['percent', 'out of 100'], ['discount', 'an amount taken off the price'], ['tip', 'an extra amount added on']]),
  skill('l5pctwhole', '6.RP.3c', 'Find the whole', 'From a part and its percent', genPctWhole, 'If you know a part and what percent it is, you can rebuild the whole: find a small chunk first, then scale up to 100%.',
    ['The part is smaller than the whole (when the percent is under 100).', 'Find one easy chunk first, like 10% or 25%. Then count how many chunks make 100%.', 'A ratio table keeps percent and amount side by side.', 'Check by taking the percent of your answer. You should get the part back.'],
    [['whole', 'the full amount, 100%'], ['part', 'a piece of the whole']]),
  skill('l5whatpct', '6.RP.3c', 'What percent is it?', 'Part and whole as a percent', genWhatPct, 'A percent compares a part with the whole as if the whole were 100. If you know the part and the whole, you can find the percent.',
    ['Write the part over the whole as a fraction, then change it to out of 100.', 'If the whole does not go into 100, find what 1 is worth: 100% divided by the whole.', 'When the new amount is bigger than the old one, the percent is over 100%.', 'When the part is tiny next to the whole, the percent is less than 1%.'],
    [['percent', 'out of 100'], ['part', 'a piece of the whole'], ['whole', 'the full amount, 100%']]),
  skill('l5xtable', '6.RP.3a', 'Cross multiplication', 'The missing cell of a ratio table', genCross, 'Equivalent rows of a ratio table grow by the same factor, so the diagonal products are equal. That is cross multiplication.',
    ['Find the multiplier from the column you can see in both rows.', 'Multiply the other cell by that same factor.', 'Or multiply diagonally: the two diagonal products match.', 'Adding across a row changes the mix, so it does not find the missing cell.'],
    [['ratio table', 'rows of matching amounts'], ['cross multiply', 'set the diagonal products equal'], ['multiplier', 'the factor that takes one row to the next']],
    { card: { title: 'Why cross multiplication works', why: 'The rows grow by the same factor, so the diagonal products are equal, and that missing cell is the one that makes them match.' } }),
  skill('l5pctswap', '6.RP.3c', 'The percent swap', '8% of 50 is 50% of 8', genSwap, 'A percent of a number is their product divided by 100. Swapping the percent and the number keeps that same product.',
    ['8% of 50 is the same amount as 50% of 8.', 'Half of 8 is easier than 8% of 50, and they match.', 'Multiply the two numbers, then divide by 100.', 'The swap does not work for 8% of 50 plus something else. It is only the percent of a number.'],
    [['percent', 'out of 100'], ['of', 'multiply, for a percent'], ['swap', 'trade the percent and the number, then find the easier one']],
    { card: { title: 'Why the percent swap works', why: 'A percent of a number is their product divided by 100, so swapping the percent and the number keeps the same product.' } }),
];
