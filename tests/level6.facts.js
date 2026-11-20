// Fixed-fact answers for the new level 6 skills: question text -> the correct choice, written here on their own.
const NO_ANSWER = 'It has no answer (dividing by 0 is not allowed)';
const SLICE = {
  'Which cut of a square pyramid makes a triangle?': 'A straight cut down through the top point',
  'Which cut of a triangular prism makes a triangle?': 'A cut parallel to the triangular ends',
  'Which cut of a square pyramid makes a square?': 'A cut parallel to the base, halfway up',
};
export const FACTS_NEW = {
  ...SLICE,
  ...Object.fromEntries([3, 5, 7, 9, 12, 15].map(n => [`What is ${n} ÷ 0?`, NO_ANSWER])),
};
