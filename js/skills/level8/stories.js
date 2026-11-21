// Story sources for the grades 9-12 band. makeStory adds the reading steps.
import { rnd, nm, num, way } from '../../util.js';
import { ruleBars, similarPair, growChart } from './blocks.js';

export function saveStory() {
  const weeks = rnd(3, 6);
  const start = rnd(4, 9);
  const each = 3;
  const total = start + weeks * each;
  const who = nm();
  return {
    story: `${who} has $${start} and saves $${each} each week for ${weeks} weeks.`,
    ask: 'How much money is there at the end?',
    answer: num(total), op: 'add', visual: ruleBars(start, each, 'each week'),
    hint: 'Add the same amount once for every week, then add the start.',
    why: 'The same amount is added each week, so the total is the start plus the weeks times 3.',
    read: { find: 'the total saved', know: [`starts with $${start}`, `saves $${each} for ${weeks} weeks`], clue: 'the same amount each week', plan: `${start} + ${weeks} × ${each}` },
    ways: [way('Add the weekly savings', [`${weeks} × ${each} = ${weeks * each}.`, `${start} + ${weeks * each} = ${total}.`])],
  };
}

export function scaleStory() {
  const k = rnd(2, 3);
  const who = nm();
  return {
    story: `${who} draws a triangle with sides 3 cm, 4 cm and 5 cm, then a similar copy ${k} times as big.`,
    ask: 'How long is the longest side of the copy, in centimeters?',
    answer: num(5 * k), op: 'mul', visual: similarPair(k, true),
    hint: 'Multiply the longest side by the scale factor.',
    why: 'Similar copies multiply every side by the same factor. Subtracting the sides does not give the new length.',
    read: { find: 'the longest side of the copy', know: ['the small sides are 3, 4 and 5', `the scale factor is ${k}`], clue: 'times as big', plan: `5 × ${k}` },
    ways: [way('Multiply the matching side', [`The longest side is 5 cm.`, `5 × ${k} = ${5 * k}.`])],
  };
}

export function doubleStory() {
  const hours = rnd(4, 5);
  const total = 3 * 2 ** hours;
  const who = nm();
  return {
    story: `${who} starts a colony with 3 cells. The number of cells doubles every hour for ${hours} hours.`,
    ask: 'How many cells are there at the end?',
    answer: num(total), op: 'mul', visual: growChart([3, 6, 9, 12], [3, 6, 12, 24]),
    hint: 'Double the 3 once for every hour. Do not add 3.',
    why: 'Doubling multiplies by 2 each hour. Adding 3 each hour is a different rule and stays smaller.',
    read: { find: 'the number of cells at the end', know: ['starts with 3', `doubles for ${hours} hours`], clue: 'doubles every hour', plan: `3 × 2^${hours}` },
    ways: [way('Double again and again', [`After ${hours} hours the factor is 2 to the power ${hours}.`, `3 × ${2 ** hours} = ${total}.`])],
  };
}
