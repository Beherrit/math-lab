// Data and chance: statistical questions, plots, measures of center and spread.
import { skillIn } from './skill.js';
import { genStatQ } from './statq.js';
import { genBoxPlot } from './boxplot.js';
import { genMad } from './mad.js';
import { genPlots } from './plots.js';
import { genStats } from './stats.js';

const skill = skillIn('Data and chance');

export const SKILLS = [
  skill('l5plots', '6.SP.4–5', 'Dot plots and histograms', 'Reading data pictures', genPlots, 'A dot plot shows every single value. A histogram groups values into ranges and shows how many fall in each.',
    ['Dot plot: each dot is one value. The number below tells you which value.', 'Histogram: the height of a bar is how many values are in that range.', 'To find the total, add up all the dots or all the bar heights.', 'A histogram hides the exact values. You only know the range they are in.'],
    [['dot plot', 'dots stacked above a number line'], ['histogram', 'bars that count values in ranges'], ['data', 'information that was collected']]),
  skill('l5statq', '6.SP.1–2, 6.SP.5', 'Questions about data', 'Statistical questions and the shape of data', genStatQ, 'A statistical question is one where the answers will vary, so you have to collect data to answer it. The data has a shape: where it bunches up, where it has gaps, and how far it spreads.',
    ['“How many pets does Maya have?” has one answer. “How many pets do the students in our class have?” gets many different answers, so it is statistical.', 'A cluster is a bunch of values close together. A gap is a value with no data. A peak is the tallest stack.', 'The center is where the data balances, and the spread tells how far apart the values are.', 'On a dot plot the shape shows at a glance: tight or spread out, one peak or two.'],
    [['statistical question', 'a question that expects different answers'], ['cluster', 'values that bunch together'], ['gap', 'a value where there is no data'], ['peak', 'the tallest part of a plot'], ['spread', 'how far apart the data is']]),
  skill('l5stats', '6.SP.3, 5', 'Mean, median, mode, range', 'One number for a whole set', genStats, 'A set of data can be summed up with a few numbers: where its center is and how spread out it is.',
    ['Mean: add everything, then divide by how many. It is the fair share.', 'Median: the middle value when the data is in order.', 'Mode: the value that appears most often. Range: biggest minus smallest.', 'One very unusual value pulls the mean a lot but hardly moves the median.'],
    [['mean', 'the total shared out equally'], ['median', 'the middle value'], ['mode', 'the most common value'], ['range', 'the spread from smallest to biggest'], ['outlier', 'a value far from the rest']]),
  skill('l5mad', '6.SP.5c–d', 'Spread and the best average', 'Mean absolute deviation, mean or median', genMad, 'The mean absolute deviation (MAD) is the average distance of the values from the mean. It tells how spread out data is, and an outlier can pull the mean far while hardly moving the median.',
    ['Find the mean. Find how far each value is from it, ignoring above or below. Take the mean of those distances.', 'A small MAD means the data is steady and close to its mean. A big MAD means it is spread out.', 'One very big or very small value, an outlier, pulls the mean towards it.', 'With an outlier, the median is usually the better picture of a typical value. Without one, the mean works well.'],
    [['mean absolute deviation', 'the average distance of the values from the mean'], ['outlier', 'a value far away from the rest'], ['deviation', 'how far a value is from the mean']]),
  skill('l5boxplot', '6.SP.4', 'Box plots', 'Quartiles and the five-number summary', genBoxPlot, 'A box plot squeezes a data set into five numbers: least, first quartile, median, third quartile and greatest. The box holds the middle half of the data.',
    ['Order the data. The median splits it in half. The first quartile is the median of the lower half, and the third quartile is the median of the upper half.', 'Each of the four parts of a box plot holds a quarter of the data.', 'The interquartile range (IQR) is the third quartile minus the first quartile: the width of the box.', 'The range is the greatest value minus the least value.'],
    [['quartile', 'one of three marks that cut ordered data into four equal parts'], ['IQR', 'the interquartile range: Q3 minus Q1'], ['five-number summary', 'least, Q1, median, Q3, greatest'], ['box plot', 'a picture of the five-number summary']]),
];
