// Doubling pulls away from a list that adds the same amount.
import { growChart } from '../skills/level8/blocks.js';

export const growthMeta = {
  id: 'g9growth',
  title: 'Which grows faster',
  blurb: 'Doubling is not the same as adding.',
  skill: 'l8grow',
};

const WORDS = [
  ['mul', 'The multiplying list'],
  ['add', 'The adding list'],
  ['same', 'They are equal'],
];

export function makeGrowth(rng) {
  const s = rng.int(2, 4);
  const add = rng.int(2, 4);
  const step = 4;
  const m = 2;
  const addVals = [0, 1, 2, 3].map(n => s + n * add);
  const mulVals = [0, 1, 2, 3].map(n => s * m ** n);
  const choices = rng.shuffle(WORDS.map(([id, label]) => ({
    id, label, html: `<span class="gnum word">${label}</span>`,
  })));
  const mul = s * m ** step;
  const sum = s + add * step;
  const why = `At step 4 the multiplying list is ${mul} and the adding list is ${sum}. Multiplying pulls away. Adding the same amount is a straight climb, even when both rules mention 2.`;
  return {
    prompt: 'The picture shows steps 0 to 3. At step 4, which list is larger?',
    say: 'The picture shows steps 0 to 3. At step 4, which list is larger?',
    visual: growChart(addVals, mulVals),
    choices,
    answer: 'mul',
    why,
    facts: { s, add, m, step },
  };
}
