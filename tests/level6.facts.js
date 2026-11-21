// Fixed-fact answers for the new level 6 skills: question text -> the correct choice, written here on their own.
const NO_ANSWER = 'It has no answer (dividing by 0 is not allowed)';
const SLICE = {
  'Which cut of a square pyramid makes a triangle?': 'A straight cut down through the top point',
  'Which cut of a triangular prism makes a triangle?': 'A cut parallel to the triangular ends',
  'Which cut of a square pyramid makes a square?': 'A cut parallel to the base, halfway up',
};
const SCEN = [
  ['To find the favourite music of a whole school, the principal asks only the members of the school band.', 'Biased'],
  ['To find the favourite music of a whole school, a computer picks 80 names at random from the full student list.', 'Random'],
  ['To find how many people in a town own a bike, a survey is done outside a bike shop.', 'Biased'],
  ['To find how many people in a town own a bike, 150 homes are chosen at random from a list of every home in the town.', 'Random'],
  ['To find the favourite sport of a club, the coach asks the first 10 players who arrive at practice.', 'Biased'],
  ['To find the favourite sport of a school, every 12th name on the full school list is chosen.', 'Random'],
  ['To learn how much sleep teenagers get, an app asks only the users who are online after midnight.', 'Biased'],
  ['To learn how much sleep teenagers get, a researcher picks 200 teenagers at random from several towns.', 'Random'],
];
const SAMPLES = {
  'A zoo wants to know which animal ALL its visitors like best. Which sample is most likely to give a fair picture?': 'Every 20th visitor who walks through the gate',
  'A phone company wants to know how happy ALL its customers are. Which sample is most likely to give a fair picture?': '300 customers chosen at random from its customer list',
  'A school wants to know how long ALL its students take to get to school. Which sample is most likely to give a fair picture?': 'Ten students picked at random from each year group',
};
const CHANCE = 'Small numbers of trials often differ from the theoretical probability just by chance';
const COIN = Object.fromEntries([[10, [2, 3, 7, 8]], [20, [7, 8, 12, 13]]].flatMap(([n, hs]) => hs.map(h => [`A fair coin is flipped ${n} times and lands heads ${h} times. Which statement is true?`, CHANCE])));
export const FACTS_NEW = {
  ...COIN,
  ...SAMPLES, ...Object.fromEntries(SCEN.map(([s, a]) => [`${s} Is this sample random or biased?`, a])),
  ...SLICE,
  ...Object.fromEntries([3, 5, 7, 9, 12, 15].map(n => [`What is ${n} ÷ 0?`, NO_ANSWER])),
};
